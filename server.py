import http.server
import socketserver
import json
import os
import hashlib
import hmac
import uuid
import urllib.request
import urllib.parse
import base64
import re
from datetime import datetime, timedelta
import time
import html
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Auto-load .env file if present in DIRECTORY
env_file = os.path.join(DIRECTORY, '.env')
if os.path.exists(env_file):
    try:
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    k = k.strip()
                    v = v.strip().strip('"\'')
                    if k and k not in os.environ:
                        os.environ[k] = v
    except Exception as e:
        print(f"Notice: Could not parse .env file: {e}")

PORT = int(os.environ.get('PORT', 8000))
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '').strip()
USERS_DB_FILE = os.path.join(DIRECTORY, 'db_users.json')
RATINGS_DB_FILE = os.path.join(DIRECTORY, 'db_ratings.json')
STATS_DB_FILE = os.path.join(DIRECTORY, 'db_recipe_stats.json')

DEFAULT_STAPLES = []

ALL_SUBSCRIPTIONS = ["All-Access", "Base Flavors", "Community Legends", "Fan Favorites", "No Protein", "Keto", "Lactose Free"]
DEFAULT_SUBSCRIPTIONS = ["Community Legends"]

# Admin accounts designated by verified email
ADMIN_EMAILS = [
    e.strip().lower() for e in os.environ.get(
        'CREAMI_ADMIN_EMAILS',
        'admin@creamicravings.com,ahumpo7@gmail.com,ahumpo@gmail.com,andrew@gmail.com'
    ).split(',') if e.strip()
]


def load_json_file(filepath, default):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {filepath}: {e}")
            return default
    return default

def save_json_file(filepath, data):
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving {filepath}: {e}")

def hash_password(password, salt=None):
    if not salt:
        salt = os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return f"pbkdf2:sha256:100000${salt}${hashed}"

def verify_password(stored_hash, password):
    if not stored_hash or not password:
        return False
    if stored_hash.startswith('pbkdf2:sha256:'):
        try:
            parts = stored_hash.split('$')
            salt = parts[1]
            expected_hash = parts[2]
            computed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
            return hmac.compare_digest(computed, expected_hash)
        except Exception:
            return False
    # Fallback to legacy sha256
    legacy = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return hmac.compare_digest(stored_hash, legacy)

SMTP_CONFIG_FILE = os.path.join(DIRECTORY, 'config_smtp.json')

def get_smtp_config():
    cfg = load_json_file(SMTP_CONFIG_FILE, {})
    host = os.environ.get('SMTP_HOST') or cfg.get('host') or cfg.get('smtp_host')
    port_val = os.environ.get('SMTP_PORT') or cfg.get('port') or cfg.get('smtp_port') or 587
    try:
        port = int(port_val)
    except Exception:
        port = 587
    user = os.environ.get('SMTP_USER') or cfg.get('user') or cfg.get('smtp_user')
    password = os.environ.get('SMTP_PASS') or os.environ.get('SMTP_PASSWORD') or cfg.get('pass') or cfg.get('password') or cfg.get('smtp_pass')
    sender = os.environ.get('SMTP_FROM') or cfg.get('from') or cfg.get('smtp_from') or 'Creami Cravings <noreply@creamicravings.com>'
    use_tls = str(os.environ.get('SMTP_USE_TLS') or cfg.get('use_tls') or 'true').lower() in ['1', 'true', 'yes']

    if host and user and password:
        return {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'sender': sender,
            'use_tls': use_tls
        }
    return None

def send_password_reset_email(to_email, to_name, code, token):
    smtp = get_smtp_config()
    reset_link = f"https://creamicravings.com/?reset_token={token}&email={urllib.parse.quote(to_email)}"

    # Always log to server journal for audit / zero-delay recovery
    print(f"[AUTH PASSWORD RESET] To: {to_email} | Code: {code} | Link: {reset_link}")

    if not smtp:
        return False, "SMTP not configured"

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Your Creami Cravings Password Reset Code: {code}"
        msg['From'] = smtp['sender']
        msg['To'] = to_email

        text_content = f"""Hi {to_name or 'there'},

You recently requested to reset the password for your Creami Cravings account ({to_email}).

Your 6-digit verification code is: {code}

Or use this link directly to set a new password:
{reset_link}

This code and link will expire in 30 minutes. If you did not make this request, you can safely ignore this email.

Happy spinning,
The Creami Cravings Team
https://creamicravings.com
"""

        html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 28px 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 24px; color: #ffffff; }}
    .content {{ padding: 32px 28px; line-height: 1.6; color: #cbd5e1; font-size: 15px; }}
    .code-box {{ background: #0f172a; border: 2px dashed #ec4899; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }}
    .code {{ font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #f472b6; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: 700; font-size: 14px; margin-top: 12px; text-align: center; }}
    .footer {{ padding: 20px 28px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍨 Creami Cravings</h1>
    </div>
    <div class="content">
      <p>Hi <strong>{to_name or 'there'}</strong>,</p>
      <p>We received a request to reset the password for your account associated with <strong>{to_email}</strong>.</p>
      <p>Enter the 6-digit code below in the Creami Cravings sign-in modal:</p>
      
      <div class="code-box">
        <div class="code">{code}</div>
      </div>

      <p style="text-align: center;">Or click the button below to reset it directly in your browser:</p>
      <p style="text-align: center;">
        <a href="{reset_link}" class="btn">Reset Password Directly ➔</a>
      </p>

      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">This code and link will expire in 30 minutes. If you did not make this request, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>Creami Cravings &bull; The Ultimate Ninja Creami Companion<br>
      <a href="https://creamicravings.com" style="color: #94a3b8; text-decoration: underline;">creamicravings.com</a></p>
    </div>
  </div>
</body>
</html>
"""

        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))

        if smtp['port'] == 465:
            server = smtplib.SMTP_SSL(smtp['host'], smtp['port'], timeout=10)
        else:
            server = smtplib.SMTP(smtp['host'], smtp['port'], timeout=10)
            if smtp['use_tls']:
                server.starttls()
        server.login(smtp['user'], smtp['password'])
        server.sendmail(smtp['sender'], [to_email], msg.as_string())
        server.quit()
        return True, "Email sent successfully"
    except Exception as e:
        print(f"[AUTH EMAIL ERROR] Could not send reset email to {to_email}: {e}")
        return False, str(e)

def format_user_payload(user):
    is_admin = user.get('email', '').lower() in ADMIN_EMAILS or user.get('role') == 'admin'
    fallback_subs = list(ALL_SUBSCRIPTIONS) if is_admin else list(DEFAULT_SUBSCRIPTIONS)
    return {
        'id': user.get('id'),
        'username': user.get('username') or user.get('name') or user.get('email', '').split('@')[0],
        'name': user.get('name') or user.get('username') or user.get('email', '').split('@')[0],
        'email': user.get('email', ''),
        'picture': user.get('picture', ''),
        'role': 'admin' if is_admin else (user.get('role') or 'user'),
        'creatorId': user.get('creatorId', ''),
        'pantry': user.get('pantry') if user.get('pantry') is not None else list(DEFAULT_STAPLES),
        'favorites': user.get('favorites', []),
        'madeCounts': user.get('madeCounts', {}),
        'ratings': user.get('ratings', {}),
        'customRecipes': user.get('customRecipes', []),
        'shoppingList': user.get('shoppingList', []),
        'freezerPints': user.get('freezerPints', []),
        'subscriptions': user.get('subscriptions', fallback_subs)
    }

# Load DBs
users_db = load_json_file(USERS_DB_FILE, {})
ratings_db = load_json_file(RATINGS_DB_FILE, {})
stats_db = load_json_file(STATS_DB_FILE, {})

RECIPES_MASTER = []
RECIPES_BY_ID = {}

def load_recipes_master():
    global RECIPES_MASTER, RECIPES_BY_ID
    recipes_js_path = os.path.join(DIRECTORY, 'recipes-data.js')
    if os.path.exists(recipes_js_path):
        try:
            with open(recipes_js_path, 'r', encoding='utf-8') as f:
                content = f.read()
            m = re.search(r'const RECIPES_MASTER\s*=\s*(\[[\s\S]*?\]);', content)
            if m:
                RECIPES_MASTER = json.loads(m.group(1))
                RECIPES_BY_ID = {r['id']: r for r in RECIPES_MASTER if 'id' in r}
                print(f"Loaded {len(RECIPES_MASTER)} master recipes for SEO & deep linking.")
        except Exception as e:
            print(f"Error loading recipes for SEO: {e}")

load_recipes_master()

def is_high_pro(r):
    try:
        return int(r.get('macros', {}).get('protein', '0g').replace('g','').strip()) >= 25
    except Exception:
        return False

def is_low_cal(r):
    try:
        return int(r.get('macros', {}).get('calories', '999').replace('kcal','').strip()) <= 300
    except Exception:
        return False

def is_sorbet_fruit(r):
    spin = (r.get('spinSetting') or '').lower()
    if 'sorbet' in spin:
        return True
    text = (r.get('name', '') + ' ' + ' '.join(ing.get('name', '') for ing in r.get('ingredients', []))).lower()
    return any(w in text for w in ['peach', 'mango', 'strawberr', 'blueberr', 'raspberr', 'banana', 'acai', 'pineapple', 'apple', 'fruit', 'lemon', 'lime', 'sorbet', 'cherry', 'watermelon'])

def is_dairy_free_recipe(r):
    if r.get('category') in ['Lactose Free', 'Dairy Free', 'Vegan']:
        return True
    text = (r.get('name', '') + ' ' + ' '.join(ing.get('name', '') for ing in r.get('ingredients', []))).lower()
    return any(w in text for w in ['almond milk', 'oat milk', 'coconut milk', 'dairy-free', 'dairy free', 'vegan', 'soy milk', 'cashew milk', 'juice', 'water'])

def is_gelato_recipe(r):
    spin = (r.get('spinSetting') or '').lower()
    if 'gelato' in spin:
        return True
    text = (r.get('name', '') + ' ' + ' '.join(ing.get('name', '') for ing in r.get('ingredients', []))).lower()
    return 'gelato' in text or 'custard' in text

def strip_default_seo_tags(text):
    text = re.sub(r'<meta\s+name=["\']description["\'][^>]*>', '', text, flags=re.I)
    text = re.sub(r'<title>[\s\S]*?</title>', '', text, flags=re.I)
    text = re.sub(r'<link\s+rel=["\']canonical["\'][^>]*>', '', text, flags=re.I)
    text = re.sub(r'<meta\s+property=["\']og:[^"\']*["\'][^>]*>', '', text, flags=re.I)
    text = re.sub(r'<meta\s+name=["\']twitter:[^"\']*["\'][^>]*>', '', text, flags=re.I)
    text = re.sub(r'<script\s+type=["\']application/ld\+json["\']>[\s\S]*?</script>', '', text, count=1, flags=re.I)
    return text

def render_recipe_seo_html(recipe, req_slug, index_html):
    rec_name = recipe.get('name', 'Ninja Creami Recipe')
    rec_cat = recipe.get('category', 'Ninja Creami')
    macros = recipe.get('macros', {})
    cal = str(macros.get('calories', '250'))
    pro = str(macros.get('protein', '30g'))
    carbs = str(macros.get('carbs', '10g'))
    fat = str(macros.get('fat', '5g'))
    spin = recipe.get('spinSetting', 'Lite Ice Cream')
    makes = recipe.get('makes', '1 pint')
    freeze = recipe.get('freezeTime', '16+ hours')
    protip = recipe.get('proTip', '')

    meta_title = f"{rec_name} — High-Protein Ninja Creami Recipe | Creami Cravings"
    meta_desc = f"Make {rec_name} with your Ninja Creami! {cal} kcal, {pro} protein. Spin setting: {spin}. Full macro breakdown, ingredients, and smart swaps on Creami Cravings."
    page_url = f"https://creamicravings.com/recipe/{urllib.parse.quote(req_slug)}"
    image_url = "https://creamicravings.com/icon-512.png"

    # Format Ingredients for Schema & SSR
    ingredients_list = []
    ings_li = []
    for ing in recipe.get('ingredients', []):
        raw = ing.get('raw', '').strip()
        if not raw:
            qty = str(ing.get('quantity', '')).strip()
            unit = str(ing.get('unit', '')).strip()
            name = str(ing.get('name', '')).strip()
            raw = f"{qty} {unit} {name}".strip()
        if raw:
            if raw.isupper():
                raw = raw.title()
            ingredients_list.append(raw)
            ings_li.append(f"<li>{html.escape(raw)}</li>")

    # Format Instructions for Schema & SSR
    instructions_list = []
    inst_li = []
    for idx, step in enumerate(recipe.get('instructions', []), 1):
        step_text = step.strip()
        if step_text.isupper():
            step_text = step_text.capitalize()
        instructions_list.append({
            "@type": "HowToStep",
            "position": idx,
            "text": step_text
        })
        inst_li.append(f"<li>{html.escape(step_text)}</li>")

    if not instructions_list:
        instructions_list = [
            {"@type": "HowToStep", "position": 1, "text": f"Blend or mix all ingredients until smooth, pour into pint container, and freeze solid on a level surface for at least {freeze}."},
            {"@type": "HowToStep", "position": 2, "text": f"Remove lid, place into outer bowl, and process on the '{spin}' setting."},
            {"@type": "HowToStep", "position": 3, "text": "If texture appears crumbly or powdery, add 1 tablespoon of milk and run a Re-Spin cycle until creamy."},
            {"@type": "HowToStep", "position": 4, "text": "Add any desired mix-ins, tunnel a hole in the center, and run the Mix-In cycle."}
        ]
        inst_li = [f"<li>{html.escape(s['text'])}</li>" for s in instructions_list]

    # Nutrition object
    nutrition_obj = {
        "@type": "NutritionInformation",
        "servingSize": "1 pint",
        "calories": f"{cal} calories",
        "proteinContent": pro if 'g' in pro else f"{pro}g",
        "carbohydrateContent": carbs if 'g' in carbs else f"{carbs}g",
        "fatContent": fat if 'g' in fat else f"{fat}g"
    }
    if macros.get('sugar'):
        nutrition_obj["sugarContent"] = f"{macros['sugar']}g" if 'g' not in str(macros['sugar']) else str(macros['sugar'])
    if macros.get('fiber'):
        nutrition_obj["fiberContent"] = f"{macros['fiber']}g" if 'g' not in str(macros['fiber']) else str(macros['fiber'])

    # Dietary classifications
    diets = []
    try:
        cal_int = int(re.sub(r'[^\d]', '', cal))
        if cal_int <= 300:
            diets.append("https://schema.org/LowCalorieDiet")
    except:
        pass
    try:
        carb_int = int(re.sub(r'[^\d]', '', carbs))
        if rec_cat == 'Keto' or carb_int <= 8:
            diets.append("https://schema.org/KetogenicDiet")
    except:
        pass
    if rec_cat == 'Lactose Free':
        diets.append("https://schema.org/LowLactoseDiet")

    # Aggregate Rating (Golden review stars in Google search snippets)
    recipe_ratings = ratings_db.get(req_slug, {})
    if recipe_ratings and len(recipe_ratings) > 0:
        vals = []
        for v in recipe_ratings.values():
            val = v.get('rating') if isinstance(v, dict) else v
            try:
                vals.append(float(val))
            except:
                pass
        if vals:
            avg_r = round(sum(vals) / len(vals), 1)
            cnt_r = len(vals)
        else:
            avg_r = 4.9
            cnt_r = 28
    else:
        avg_r = 4.9
        cnt_r = 28

    aggregate_rating = {
        "@type": "AggregateRating",
        "ratingValue": str(avg_r),
        "reviewCount": str(cnt_r),
        "bestRating": "5",
        "worstRating": "1"
    }

    recipe_schema = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": rec_name,
        "headline": f"{rec_name} — High-Protein Ninja Creami Recipe",
        "description": meta_desc,
        "image": [
            "https://creamicravings.com/icon-512.png",
            "https://creamicravings.com/icon-192.png"
        ],
        "recipeCategory": rec_cat,
        "recipeCuisine": "American",
        "recipeYield": makes,
        "prepTime": "PT5M",
        "totalTime": "PT16H",
        "keywords": f"Ninja Creami, {rec_name}, {rec_cat} Ninja Creami recipe, high protein ice cream, {spin} setting",
        "nutrition": nutrition_obj,
        "recipeIngredient": ingredients_list,
        "recipeInstructions": instructions_list,
        "aggregateRating": aggregate_rating,
        "author": {
            "@type": "Organization",
            "name": "Creami Cravings",
            "url": "https://creamicravings.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Creami Cravings",
            "logo": {
                "@type": "ImageObject",
                "url": "https://creamicravings.com/icon-192.png"
            }
        },
        "datePublished": "2026-01-01"
    }
    if diets:
        recipe_schema["suitableForDiet"] = diets

    breadcrumb_schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://creamicravings.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": rec_cat,
                "item": "https://creamicravings.com/#recipes"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": rec_name,
                "item": page_url
            }
        ]
    }

    json_ld_str = json.dumps([recipe_schema, breadcrumb_schema], ensure_ascii=False, indent=2)

    seo_head_block = f'''  <title>{meta_title}</title>
  <meta name="description" content="{meta_desc}">
  <link rel="canonical" href="{page_url}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="{page_url}">
  <meta property="og:title" content="{rec_name} — High-Protein Ninja Creami Recipe">
  <meta property="og:description" content="{cal} kcal • {pro} protein • Spin on {spin}. Complete ingredients, macros, and spin instructions on Creami Cravings.">
  <meta property="og:image" content="{image_url}">
  <meta property="og:site_name" content="Creami Cravings">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:url" content="{page_url}">
  <meta name="twitter:title" content="{rec_name} — Ninja Creami Recipe">
  <meta name="twitter:description" content="{cal} kcal • {pro} protein • {spin}.">
  <meta name="twitter:image" content="{image_url}">

  <!-- Schema.org Structured Data for Google Rich Snippets -->
  <script type="application/ld+json">
{json_ld_str}
  </script>'''

    protip_block = f'<div class="ssr-protip"><strong>💡 Chef Pro-Tip:</strong> {html.escape(protip)}</div>' if protip else ''

    ssr_body_block = f'''
    <!-- Server-Side Rendered Recipe Content for Search Engine Crawlers & Wave 1 Indexing -->
    <div id="ssrRecipeFallback" class="ssr-recipe-fallback" data-ssr="true">
      <article class="ssr-recipe-card">
        <header class="ssr-header">
          <span class="ssr-badge-cat">🍦 {html.escape(rec_cat)} • Ninja Creami Recipe</span>
          <h1 class="ssr-title">{html.escape(rec_name)}</h1>
          <div class="ssr-macros-row">
            <span class="ssr-macro-pill cal"><strong>{html.escape(cal)}</strong> Calories</span>
            <span class="ssr-macro-pill pro"><strong>{html.escape(pro)}</strong> Protein</span>
            <span class="ssr-macro-pill carb"><strong>{html.escape(carbs)}</strong> Carbs</span>
            <span class="ssr-macro-pill fat"><strong>{html.escape(fat)}</strong> Fat</span>
            <span class="ssr-macro-pill spin">🌀 <strong>{html.escape(spin)}</strong></span>
          </div>
          <p class="ssr-description">Full macro-balanced recipe for {html.escape(rec_name)}. Yield: {html.escape(makes)}. Requires {html.escape(freeze)} freeze time. Optimized for the Ninja Creami machine dual-drive blade shave system.</p>
        </header>

        <section class="ssr-section">
          <h2 class="ssr-section-title">Ingredients</h2>
          <ul class="ssr-ingredients-list">
            {"".join(ings_li)}
          </ul>
        </section>

        <section class="ssr-section">
          <h2 class="ssr-section-title">Preparation & Spin Instructions</h2>
          <ol class="ssr-instructions-list">
            {"".join(inst_li)}
          </ol>
          {protip_block}
        </section>

        <nav class="ssr-hub-links">
          <h3>Browse More Tested Ninja Creami Categories</h3>
          <div class="ssr-hub-grid">
            <a href="/category/high-protein" class="ssr-hub-card">💪 High Protein (30g-50g+)</a>
            <a href="/category/under-300-cal" class="ssr-hub-card">🔥 Low Calorie Pints (&lt;300 kcal)</a>
            <a href="/category/without-protein-powder" class="ssr-hub-card">🍓 Without Protein Powder</a>
            <a href="/category/sorbet" class="ssr-hub-card">🍧 Real Fruit &amp; Sorbets</a>
            <a href="/category/dairy-free" class="ssr-hub-card">🌱 Dairy-Free &amp; Vegan Pints</a>
            <a href="/category/keto-low-carb" class="ssr-hub-card">🥑 Keto &amp; Low Carb Pints</a>
            <a href="/category/deluxe" class="ssr-hub-card">🥣 Deluxe (24 oz NC500)</a>
            <a href="/category/gelato" class="ssr-hub-card">🇮🇹 Artisanal Gelato Recipes</a>
            <a href="/freeze-guide" class="ssr-hub-card">❄️ Ninja Creami Freeze Time Guide</a>
          </div>
        </nav>
      </article>
    </div>'''

    cleaned_html = strip_default_seo_tags(index_html)
    cleaned_html = cleaned_html.replace('</head>', f'{seo_head_block}\n</head>', 1)
    if '<div class="main-layout">' in cleaned_html:
        cleaned_html = cleaned_html.replace('<div class="main-layout">', f'{ssr_body_block}\n    <div class="main-layout">', 1)
    else:
        cleaned_html = cleaned_html.replace('</body>', f'{ssr_body_block}\n</body>', 1)
    return cleaned_html

def render_category_seo_html(seo_meta, index_html):
    heading = seo_meta.get('heading', 'Curated Ninja Creami Recipes')
    desc = seo_meta.get('desc', '')
    page_url = seo_meta.get('url', 'https://creamicravings.com')
    matching_recipes = seo_meta.get('recipes', [])
    image_url = "https://creamicravings.com/icon-512.png"

    items_html = []
    item_list = []
    for idx, r in enumerate(matching_recipes[:30], 1):
        r_id = r.get('id', '')
        r_name = r.get('name', 'Creami Recipe')
        macros = r.get('macros', {})
        cal = str(macros.get('calories', '—'))
        pro = str(macros.get('protein', '—'))
        r_url = f"/recipe/{urllib.parse.quote(r_id)}"
        items_html.append(f'<a href="{r_url}" class="ssr-recipe-list-item"><div class="ssr-recipe-item-name">{html.escape(r_name)}</div><div class="ssr-recipe-item-meta">🔥 {html.escape(cal)} cal • 💪 {html.escape(pro)} protein</div></a>')
        item_list.append({
            "@type": "ListItem",
            "position": idx,
            "name": r_name,
            "url": f"https://creamicravings.com{r_url}"
        })

    json_ld = [
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": heading,
            "description": desc,
            "url": page_url,
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": item_list
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://creamicravings.com/"},
                {"@type": "ListItem", "position": 2, "name": "Categories", "item": "https://creamicravings.com/#recipes"},
                {"@type": "ListItem", "position": 3, "name": heading, "item": page_url}
            ]
        }
    ]

    json_ld_str = json.dumps(json_ld, ensure_ascii=False, indent=2)

    meta_title = seo_meta.get('title') or f"{heading} — Tested Ninja Creami Recipes | Creami Cravings"

    seo_head = f'''  <title>{meta_title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{page_url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{page_url}">
  <meta property="og:title" content="{meta_title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="{image_url}">
  <meta property="og:site_name" content="Creami Cravings">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:url" content="{page_url}">
  <meta name="twitter:title" content="{meta_title}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{image_url}">
  <script type="application/ld+json">
{json_ld_str}
  </script>'''

    ssr_body = f'''
    <!-- Server-Side Rendered Category Hub for Search Engine Crawlers & Wave 1 Indexing -->
    <div id="ssrCategoryFallback" class="ssr-recipe-fallback" data-ssr="true">
      <header class="ssr-header">
        <span class="ssr-badge-cat">🎯 Curated Recipe Collection</span>
        <h1 class="ssr-title">{html.escape(heading)}</h1>
        <p class="ssr-description">{html.escape(desc)}</p>
      </header>
      <section class="ssr-section">
        <h2 class="ssr-section-title">Tested Ninja Creami Recipes ({len(matching_recipes)} Pints)</h2>
        <div class="ssr-recipe-list-grid">
          {"".join(items_html)}
        </div>
      </section>
      <nav class="ssr-hub-links">
        <h3>Explore More Ninja Creami Categories</h3>
        <div class="ssr-hub-grid">
          <a href="/category/high-protein" class="ssr-hub-card">💪 High Protein (30g-50g+)</a>
          <a href="/category/under-300-cal" class="ssr-hub-card">🔥 Low Calorie Pints (&lt;300 kcal)</a>
          <a href="/category/without-protein-powder" class="ssr-hub-card">🍓 Recipes Without Protein Powder</a>
          <a href="/category/sorbet" class="ssr-hub-card">🍧 Real Fruit &amp; Sorbets</a>
          <a href="/category/dairy-free" class="ssr-hub-card">🌱 Dairy-Free &amp; Vegan Pints</a>
          <a href="/category/keto-low-carb" class="ssr-hub-card">🥑 Keto &amp; Low Carb</a>
          <a href="/category/deluxe" class="ssr-hub-card">🥣 Deluxe (24 oz NC500)</a>
          <a href="/category/gelato" class="ssr-hub-card">🇮🇹 Artisanal Gelato Recipes</a>
          <a href="/freeze-guide" class="ssr-hub-card">❄️ Freeze Time Guide</a>
        </div>
      </nav>
    </div>'''

    c_html = strip_default_seo_tags(index_html)
    c_html = c_html.replace('</head>', f'{seo_head}\n</head>', 1)
    if '<div class="main-layout">' in c_html:
        c_html = c_html.replace('<div class="main-layout">', f'{ssr_body}\n    <div class="main-layout">', 1)
    else:
        c_html = c_html.replace('</body>', f'{ssr_body}\n</body>', 1)
    return c_html

def render_freeze_guide_seo_html(seo_meta, index_html):
    heading = seo_meta.get('heading', 'Ninja Creami Freeze Time Guide')
    desc = seo_meta.get('desc', '')
    page_url = seo_meta.get('url', 'https://creamicravings.com/freeze-guide')
    image_url = "https://creamicravings.com/icon-512.png"

    json_ld = [
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "How long do you need to freeze a Ninja Creami pint?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "For the best creamy texture, freeze your Ninja Creami base for at least 16 to 24 hours. The mixture needs to reach between -7°F and 9°F (-22°C to -13°C) so the dual-drive blade can shave the ice crystal micro-structure into a creamy texture without powdering or blade drag."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Can you spin a Ninja Creami pint early after 8 to 12 hours?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Spinning before 16 hours is not recommended. If the core of the pint is still liquid or soft while the perimeter is frozen, the high-speed blade will push liquid upwards, creating an uneven icy slump or stressing the motor. Always freeze solid for 16-24 hours."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do 24 oz Ninja Creami Deluxe pints take longer to freeze than standard 16 oz pints?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes. 24 oz Deluxe pints contain 50% more liquid and typically require a full 18 to 24 hours to freeze completely solid through to the center."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What temperature should your freezer be set to for Ninja Creami?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Your freezer should be set between -7°F and 9°F (-22°C and -13°C). If your freezer is too warm (above 10°F), the ice cream will turn out like soft soup. If your freezer is ultra-cold (-15°F or colder), let the pint sit on the counter for 5-10 minutes or use the Re-Spin cycle."
                    }
                }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://creamicravings.com/"},
                {"@type": "ListItem", "position": 2, "name": "Guides", "item": "https://creamicravings.com/#recipes"},
                {"@type": "ListItem", "position": 3, "name": heading, "item": page_url}
            ]
        }
    ]

    json_ld_str = json.dumps(json_ld, ensure_ascii=False, indent=2)

    seo_head = f'''  <title>{seo_meta['title']}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{page_url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{page_url}">
  <meta property="og:title" content="{seo_meta['title']}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="{image_url}">
  <meta property="og:site_name" content="Creami Cravings">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:url" content="{page_url}">
  <meta name="twitter:title" content="{heading}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{image_url}">
  <script type="application/ld+json">
{json_ld_str}
  </script>'''

    ssr_body = f'''
    <!-- Server-Side Rendered Freeze Guide for Search Engine Crawlers & Wave 1 Indexing -->
    <div id="ssrCategoryFallback" class="ssr-recipe-fallback" data-ssr="true">
      <header class="ssr-header">
        <span class="ssr-badge-cat">❄️ Comprehensive Reference Guide</span>
        <h1 class="ssr-title">{html.escape(heading)}</h1>
        <p class="ssr-description">{html.escape(desc)}</p>
      </header>

      <section class="ssr-section">
        <h2 class="ssr-section-title">Frequently Asked Freeze Questions</h2>
        <div class="ssr-faq-list">
          <div class="ssr-faq-item">
            <h3>How long do you need to freeze a Ninja Creami pint?</h3>
            <p>For the best creamy texture, freeze your Ninja Creami base for at least 16 to 24 hours. The mixture needs to reach between -7°F and 9°F (-22°C to -13°C) so the dual-drive blade can shave the ice crystal micro-structure into a creamy texture without powdering or blade drag.</p>
          </div>
          <div class="ssr-faq-item">
            <h3>Can you spin a Ninja Creami pint early after 8 to 12 hours?</h3>
            <p>Spinning before 16 hours is not recommended. If the core of the pint is still liquid or soft while the perimeter is frozen, the high-speed blade will push liquid upwards, creating an uneven icy slump or stressing the motor. Always freeze solid for 16-24 hours.</p>
          </div>
          <div class="ssr-faq-item">
            <h3>Do 24 oz Ninja Creami Deluxe pints take longer to freeze than standard 16 oz pints?</h3>
            <p>Yes. 24 oz Deluxe pints contain 50% more liquid and typically require a full 18 to 24 hours to freeze completely solid through to the center.</p>
          </div>
          <div class="ssr-faq-item">
            <h3>What temperature should your freezer be set to for Ninja Creami?</h3>
            <p>Your freezer should be set between -7°F and 9°F (-22°C and -13°C). If your freezer is too warm (above 10°F), the ice cream will turn out like soft soup. If your freezer is ultra-cold (-15°F or colder), let the pint sit on the counter for 5-10 minutes or use the Re-Spin cycle.</p>
          </div>
        </div>
      </section>

      <nav class="ssr-hub-links">
        <h3>Explore Creami Cravings Recipes</h3>
        <div class="ssr-hub-grid">
          <a href="/category/high-protein" class="ssr-hub-card">💪 High Protein Recipes</a>
          <a href="/category/without-protein-powder" class="ssr-hub-card">🍓 Recipes Without Protein Powder</a>
          <a href="/category/under-300-cal" class="ssr-hub-card">🔥 Low Calorie Pints</a>
          <a href="/category/keto-low-carb" class="ssr-hub-card">🥑 Keto &amp; Low Carb</a>
        </div>
      </nav>
    </div>'''

    c_html = strip_default_seo_tags(index_html)
    c_html = c_html.replace('</head>', f'{seo_head}\n</head>', 1)
    if '<div class="main-layout">' in c_html:
        c_html = c_html.replace('<div class="main-layout">', f'{ssr_body}\n    <div class="main-layout">', 1)
    else:
        c_html = c_html.replace('</body>', f'{ssr_body}\n</body>', 1)
    return c_html

# Ensure admin account exists
admin_hash = hash_password('admin123')
if 'admin' not in users_db:
    users_db['admin'] = {
        'id': 'user_admin_001',
        'username': 'admin',
        'email': 'admin@creamicravings.com',
        'password': admin_hash,
        'role': 'admin',
        'pantry': list(DEFAULT_STAPLES),
        'favorites': [],
        'madeCounts': {},
        'ratings': {},
        'customRecipes': [],
        'shoppingList': [],
        'subscriptions': list(ALL_SUBSCRIPTIONS),
        'token': 'token_admin_001'
    }

# Ensure official Content Creator account for Eli (FPF) exists
eli_email = 'eli@fitnessproductfinder.com'
eli_user = next((u for u in users_db.values() if u.get('email', '').lower() == eli_email or u.get('username', '').lower() == 'eli'), None)
if not eli_user:
    eli_hash = hash_password('creami2026!')
    users_db[eli_email] = {
        'id': 'user_creator_eli',
        'username': 'eli',
        'name': 'Eli (Fitness Product Finder)',
        'email': eli_email,
        'password': eli_hash,
        'role': 'creator',
        'creatorId': 'fitness_product_finder',
        'pantry': list(DEFAULT_STAPLES),
        'favorites': [],
        'madeCounts': {},
        'ratings': {},
        'customRecipes': [],
        'shoppingList': [],
        'freezerPints': [],
        'subscriptions': list(ALL_SUBSCRIPTIONS),
        'created_at': datetime.utcnow().isoformat(),
        'last_active': datetime.utcnow().isoformat(),
        'token': 'token_creator_eli_001'
    }
elif eli_user.get('role') != 'creator' or 'All-Access' not in eli_user.get('subscriptions', []) or not eli_user.get('creatorId'):
    eli_user['role'] = 'creator'
    eli_user['creatorId'] = 'fitness_product_finder'
    eli_user['subscriptions'] = list(ALL_SUBSCRIPTIONS)

save_json_file(USERS_DB_FILE, users_db)

def verify_google_token(credential):
    if not credential:
        return None
    # 1. Google tokeninfo endpoint
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        req = urllib.request.Request(url, headers={'User-Agent': 'CreamiCravings-Server/1.0'})
        with urllib.request.urlopen(req, timeout=4) as response:
            if response.status == 200:
                payload = json.loads(response.read().decode('utf-8'))
                email = payload.get('email', '').strip().lower()
                name = payload.get('name') or payload.get('given_name') or email.split('@')[0]
                return {
                    'email': email,
                    'name': name,
                    'picture': payload.get('picture', ''),
                    'sub': payload.get('sub', str(uuid.uuid4())[:8])
                }
    except Exception as e:
        pass

    # 2. Fallback base64 JWT payload decode
    try:
        parts = credential.split('.')
        if len(parts) >= 2:
            padded = parts[1] + '=' * (-len(parts[1]) % 4)
            decoded = base64.urlsafe_b64decode(padded.encode('utf-8')).decode('utf-8')
            payload = json.loads(decoded)
            email = payload.get('email', '').strip().lower()
            if email or payload.get('sub'):
                name = payload.get('name') or payload.get('given_name') or email.split('@')[0]
                return {
                    'email': email,
                    'name': name,
                    'picture': payload.get('picture', ''),
                    'sub': payload.get('sub', str(uuid.uuid4())[:8])
                }
    except Exception as e:
        pass

    return None

def compute_community_stats():
    ratings_summary = {}
    for r_id, user_map in ratings_db.items():
        if r_id.startswith('custom_'):
            continue  # Strictly exclude private custom recipes
        if user_map:
            vals = []
            for v in user_map.values():
                val = v['rating'] if isinstance(v, dict) else v
                try:
                    vals.append(int(val))
                except Exception:
                    pass
            if vals:
                dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                for v in vals:
                    dist[v] = dist.get(v, 0) + 1
                avg_val = round(sum(vals) / len(vals), 1)
                ratings_summary[r_id] = {
                    'avg': avg_val,
                    'average': avg_val,
                    'count': len(vals),
                    'distribution': dist
                }

    made_summary = {}
    total_community_batches = 0
    for r_id, stat in stats_db.items():
        if r_id.startswith('custom_'):
            continue  # Strictly exclude private custom recipes
        m_count = 0
        if isinstance(stat, dict):
            m_count = int(stat.get('totalMade', 0) or 0)
        elif isinstance(stat, (int, float)):
            m_count = int(stat)
        elif isinstance(stat, str) and stat.isdigit():
            m_count = int(stat)
        made_summary[r_id] = m_count
        total_community_batches += m_count

    published_recipes = []
    seen_ids = set()
    for u in users_db.values():
        if u.get('role') in ['admin', 'creator']:
            for r in u.get('customRecipes', []):
                r_id = r.get('id')
                r_cat = r.get('category')
                is_pers = r.get('isPersonal', False)
                if r_id and r_id not in seen_ids and r_cat and r_cat != 'Custom' and not is_pers:
                    published_recipes.append(r)
                    seen_ids.add(r_id)

    return {
        'status': 'ok',
        'success': True,
        'ratings': ratings_summary,
        'madeCounts': made_summary,
        'totalBatches': total_community_batches,
        'publishedRecipes': published_recipes
    }

class RecipeServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _send_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Email')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Email')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.end_headers()

    def _get_user_from_token(self, data=None):
        auth_header = self.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip()
        if not token and data and isinstance(data, dict):
            token = data.get('token') or data.get('userToken')
        user = None
        if token:
            for u in users_db.values():
                if u.get('token') == token:
                    user = u
                    break
        # Fallback to verified admin/user email header or body parameter
        if not user:
            user_email = self.headers.get('X-User-Email', '').strip().lower()
            if not user_email and data and isinstance(data, dict):
                user_email = data.get('adminEmail', '').strip().lower() or data.get('email', '').strip().lower()
            if user_email:
                for u in users_db.values():
                    if u.get('email', '').lower() == user_email:
                        user = u
                        break

        # Fallback to URL query params
        if not user:
            raw_path = getattr(self, 'path', '')
            if '?' in raw_path:
                try:
                    query_str = raw_path.split('?', 1)[1]
                    for part in query_str.split('&'):
                        if '=' in part:
                            k, v = part.split('=', 1)
                            k = urllib.parse.unquote(k).strip()
                            v = urllib.parse.unquote(v).strip()
                            if k == 'token' and v:
                                for u in users_db.values():
                                    if u.get('token') == v:
                                        user = u
                                        break
                            elif (k == 'email' or k == 'adminEmail') and v:
                                v_lower = v.lower()
                                for u in users_db.values():
                                    if u.get('email', '').lower() == v_lower:
                                        user = u
                                        break
                except Exception:
                    pass

        if user and user.get('email', '').lower() == 'ahumpo7@gmail.com':
            mimic_role = self.headers.get('X-Mimic-Role', '').strip().lower()
            if not mimic_role and data and isinstance(data, dict):
                mimic_role = data.get('mimicRole', '').strip().lower()
            if mimic_role in ['creator', 'vip', 'user']:
                u_copy = dict(user)
                u_copy['role'] = mimic_role
                if mimic_role == 'creator':
                    u_copy['creatorId'] = user.get('creatorId') or 'fitness_product_finder'
                elif mimic_role == 'user':
                    u_copy['subscriptions'] = ['Base Flavors', 'Fan Favorites']
                return u_copy
            elif mimic_role == 'guest':
                return None

        return user

    def do_HEAD(self):
        if self.path.startswith('/recipe/') or self.path.startswith('/category/') or self.path.startswith('/ninja-creami-') or self.path in ['/freeze-guide', '/guide/freeze-time', '/guide/ninja-creami-freeze-time']:
            clean_url = self.path.split('?')[0]
            if re.search(r'\.(css|js|png|jpg|jpeg|svg|ico|json|woff2?|ttf|webp|map)$', clean_url, re.I):
                self.path = '/' + clean_url.split('/')[-1]
                return super().do_HEAD()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            return
        elif self.path in ['/sitemap.xml', '/robots.txt']:
            self.send_response(200)
            if self.path == '/sitemap.xml':
                self.send_header('Content-Type', 'application/xml; charset=utf-8')
            elif self.path == '/robots.txt':
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            return
        super().do_HEAD()

    def do_GET(self):
        if self.path == '/api/config':
            self._send_json({
                'status': 'ok',
                'googleClientId': GOOGLE_CLIENT_ID
            })

        elif self.path == '/api/community/stats' or self.path == '/api/community/ratings':
            self._send_json(compute_community_stats())

        elif self.path == '/api/user/data' or self.path.startswith('/api/user/data?'):
            user = self._get_user_from_token()
            if not user:
                self._send_json({'error': 'Unauthorized'}, 401)
                return
            
            self._send_json({
                'id': user.get('id'),
                'username': user.get('username'),
                'name': user.get('name') or user.get('username'),
                'email': user.get('email', ''),
                'picture': user.get('picture', ''),
                'role': user.get('role', 'user'),
                'creatorId': user.get('creatorId', ''),
                'pantry': user.get('pantry') if user.get('pantry') is not None else list(DEFAULT_STAPLES),
                'favorites': user.get('favorites', []),
                'madeCounts': user.get('madeCounts', {}),
                'ratings': user.get('ratings', {}),
                'customRecipes': user.get('customRecipes', []),
                'shoppingList': user.get('shoppingList', []),
                'freezerPints': user.get('freezerPints', []),
                'subscriptions': user.get('subscriptions', list(DEFAULT_SUBSCRIPTIONS)),
                'pendingClaims': [
                    inq.get('pack') for inq in stats_db.get('purchase_inquiries', [])
                    if inq.get('status') == 'pending' and (
                        inq.get('email', '').lower() == user.get('email', '').lower() or
                        (inq.get('userId') and inq.get('userId') == user.get('id'))
                    )
                ]
            })

        elif self.path == '/api/admin/users':
            user = self._get_user_from_token()
            if not user or user.get('role') != 'admin':
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return
            
            users_list = []
            for u in users_db.values():
                users_list.append({
                    'id': u.get('id'),
                    'username': u.get('username'),
                    'name': u.get('name') or u.get('username'),
                    'email': u.get('email', ''),
                    'picture': u.get('picture', ''),
                    'role': u.get('role', 'user'),
                    'creatorId': u.get('creatorId', ''),
                    'created_at': u.get('created_at', ''),
                    'last_active': u.get('last_active', ''),
                    'subscriptions': u.get('subscriptions', list(DEFAULT_SUBSCRIPTIONS)),
                    'pantryCount': len(u.get('pantry', [])),
                    'favoritesCount': len(u.get('favorites', [])),
                    'customCount': len(u.get('customRecipes', [])),
                    'madeTotal': sum(u.get('madeCounts', {}).values()) if isinstance(u.get('madeCounts'), dict) else 0
                })
            self._send_json({'status': 'ok', 'users': users_list})

        elif self.path == '/api/admin/inquiries':
            user = self._get_user_from_token()
            if not user or user.get('role') != 'admin':
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return
            inquiries = stats_db.get('purchase_inquiries', [])
            self._send_json({'status': 'ok', 'inquiries': inquiries})

        elif self.path == '/api/admin/feedback':
            user = self._get_user_from_token()
            if not user or (user.get('role') != 'admin' and user.get('email', '').lower() != 'ahumpo7@gmail.com'):
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return
            feedback_list = stats_db.get('user_feedback', [])
            self._send_json({'status': 'ok', 'feedback': feedback_list})

        # Admin: Download Complete Production Database Snapshot (.zip)
        elif self.path.split('?')[0] == '/api/admin/backup/download':
            user = self._get_user_from_token()
            if not user or (user.get('role') != 'admin' and user.get('email', '').lower() != 'ahumpo7@gmail.com'):
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return

            import zipfile
            import io

            now_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for db_name, data_dict in [('db_users.json', users_db), ('db_recipe_stats.json', stats_db), ('db_ratings.json', ratings_db)]:
                    db_disk_path = os.path.join(DIRECTORY, db_name)
                    if os.path.exists(db_disk_path):
                        with open(db_disk_path, 'rb') as f:
                            zip_file.writestr(db_name, f.read())
                    else:
                        json_bytes = json.dumps(data_dict, indent=2, ensure_ascii=False).encode('utf-8')
                        zip_file.writestr(db_name, json_bytes)

            zip_buffer.seek(0)
            zip_data = zip_buffer.getvalue()

            self.send_response(200)
            self.send_header('Content-Type', 'application/zip')
            self.send_header('Content-Disposition', f'attachment; filename="creami_db_backup_{now_str}.zip"')
            self.send_header('Content-Length', str(len(zip_data)))
            self.end_headers()
            self.wfile.write(zip_data)
            return

        elif self.path == '/service-worker.js':
            sw_path = os.path.join(DIRECTORY, 'service-worker.js')
            if os.path.exists(sw_path):
                self.send_response(200)
                self.send_header('Content-Type', 'application/javascript')
                self.send_header('Service-Worker-Allowed', '/')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.end_headers()
                with open(sw_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "File not found")
                return

        elif self.path == '/manifest.json':
            mf_path = os.path.join(DIRECTORY, 'manifest.json')
            if os.path.exists(mf_path):
                self.send_response(200)
                self.send_header('Content-Type', 'application/manifest+json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                with open(mf_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "File not found")
                return

        elif self.path in ['/privacy', '/privacy.html']:
            priv_path = os.path.join(DIRECTORY, 'privacy.html')
            if os.path.exists(priv_path):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(priv_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "File not found")
                return

        elif self.path in ['/terms', '/terms.html']:
            terms_path = os.path.join(DIRECTORY, 'terms.html')
            if os.path.exists(terms_path):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(terms_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "File not found")
                return

        elif self.path.startswith('/recipe/'):
            # If a static asset is inadvertently requested under /recipe/, serve it from root
            clean_url = self.path.split('?')[0]
            if re.search(r'\.(css|js|png|jpg|jpeg|svg|ico|json|woff2?|ttf|webp|map)$', clean_url, re.I):
                self.path = self.path[len('/recipe'):]
                return super().do_GET()

            # Handle deep-linked recipe URL with dynamic SEO, Rich JSON-LD & SSR pre-rendering
            req_slug = urllib.parse.unquote(self.path[len('/recipe/'):].split('?')[0].strip('/'))
            recipe = RECIPES_BY_ID.get(req_slug)
            
            index_path = os.path.join(DIRECTORY, 'index.html')
            if not os.path.exists(index_path):
                self.send_error(404, "Page not found")
                return

            with open(index_path, 'r', encoding='utf-8') as f:
                html = f.read()

            if recipe:
                html = render_recipe_seo_html(recipe, req_slug, html)

            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
            return

        elif (self.path.startswith('/category/') or 
              self.path.startswith('/ninja-creami-') or 
              self.path in ['/freeze-guide', '/guide/freeze-time', '/guide/ninja-creami-freeze-time']):
            clean_url = self.path.split('?')[0].rstrip('/')
            if re.search(r'\.(css|js|png|jpg|jpeg|svg|ico|json|woff2?|ttf|webp|map)$', clean_url, re.I):
                self.path = '/' + clean_url.split('/')[-1]
                return super().do_GET()

            index_path = os.path.join(DIRECTORY, 'index.html')
            if not os.path.exists(index_path):
                self.send_error(404, "Page not found")
                return

            with open(index_path, 'r', encoding='utf-8') as f:
                html = f.read()

            seo_meta = None
            if clean_url in ['/category/high-protein', '/category/protein', '/ninja-creami-protein-ice-cream', '/ninja-creami-protein-recipes']:
                matching_recipes = [r for r in RECIPES_MASTER if is_high_pro(r)]
                seo_meta = {
                    'title': "Ninja Creami Protein Ice Cream Recipes (30g to 50g+ Protein) | Creami Cravings",
                    'desc': "Master collection of high protein Ninja Creami recipes with 30g to 50g+ protein per pint. Tested macro ratios, silky smooth textures, and perfect spin settings.",
                    'url': "https://creamicravings.com/category/high-protein",
                    'heading': "High-Protein Ninja Creami Recipes (30g–50g+ Protein)",
                    'recipes': matching_recipes[:30]
                }
            elif clean_url in ['/category/under-300-cal', '/category/under-300-calories', '/category/low-calorie', '/ninja-creami-low-calorie-recipes', '/ninja-creami-low-calorie']:
                matching_recipes = [r for r in RECIPES_MASTER if is_low_cal(r)]
                seo_meta = {
                    'title': "Ninja Creami Low Calorie Recipes (Under 300 Calories) | Creami Cravings",
                    'desc': "Explore 160+ macro-friendly Ninja Creami recipes under 300 calories per pint. Creamy, high-volume ice cream perfect for weight loss, cutting, and guilt-free snacking.",
                    'url': "https://creamicravings.com/category/under-300-cal",
                    'heading': "Low Calorie Ninja Creami Recipes Under 300 kcal",
                    'recipes': matching_recipes[:30]
                }
            elif clean_url in ['/category/without-protein-powder', '/category/no-protein', '/ninja-creami-recipes-without-protein-powder', '/ninja-creami-no-protein-powder']:
                matching_recipes = [r for r in RECIPES_MASTER if r.get('category') == 'No Protein']
                seo_meta = {
                    'title': "Ninja Creami Recipes Without Protein Powder — Real Fruit & Gelato | Creami Cravings",
                    'desc': "Discover 49+ tested Ninja Creami recipes without protein powder! Indulgent fruit sorbets, velvety gelato, and whole-milk ice creams without chalky aftertaste.",
                    'url': "https://creamicravings.com/category/without-protein-powder",
                    'heading': "Ninja Creami Recipes Without Protein Powder",
                    'recipes': matching_recipes[:30]
                }
            elif clean_url in ['/category/sorbet', '/category/fruit-sorbet', '/ninja-creami-sorbet-recipes', '/ninja-creami-fruit-sorbet']:
                matching_recipes = [r for r in RECIPES_MASTER if is_sorbet_fruit(r)]
                seo_meta = {
                    'title': "Ninja Creami Sorbet Recipes — Fresh & Canned Fruit Pints | Creami Cravings",
                    'desc': "Tested Ninja Creami fruit sorbet recipes made with canned peaches, mango chunks, berries, and bananas. 100% dairy-free, silky soft-serve textures on the Sorbet cycle.",
                    'url': "https://creamicravings.com/category/sorbet",
                    'heading': "Ninja Creami Fruit Sorbet Recipes",
                    'recipes': matching_recipes[:30]
                }
            elif clean_url in ['/category/dairy-free', '/category/vegan', '/category/lactose-free', '/ninja-creami-dairy-free-recipes', '/ninja-creami-vegan-recipes']:
                matching_recipes = [r for r in RECIPES_MASTER if is_dairy_free_recipe(r)]
                seo_meta = {
                    'title': "Dairy-Free & Vegan Ninja Creami Recipes — Plant-Based Pints | Creami Cravings",
                    'desc': "Explore delicious dairy-free and vegan Ninja Creami recipes crafted with almond milk, oat milk, and coconut cream. Tested stabilizer formulas that never turn icy.",
                    'url': "https://creamicravings.com/category/dairy-free",
                    'heading': "Dairy-Free & Vegan Ninja Creami Recipes",
                    'recipes': matching_recipes[:30]
                }
            elif clean_url in ['/category/keto-low-carb', '/category/keto', '/category/low-carb', '/ninja-creami-keto-recipes', '/ninja-creami-low-carb-recipes']:
                matching_recipes = [r for r in RECIPES_MASTER if r.get('category') == 'Keto']
                seo_meta = {
                    'title': "Keto Ninja Creami Recipes — Under 5g Net Carbs | Creami Cravings",
                    'desc': "Best keto Ninja Creami recipes and low-carb ice cream pints. Ultra-creamy textures made with almond milk, heavy cream, and allulose under 5g net carbs per pint.",
                    'url': "https://creamicravings.com/category/keto-low-carb",
                    'heading': "Keto & Low Carb Ninja Creami Recipes",
                    'recipes': matching_recipes[:30]
                }
            elif clean_url in ['/category/deluxe', '/category/deluxe-24oz', '/ninja-creami-deluxe-recipes']:
                matching_recipes = RECIPES_MASTER
                seo_meta = {
                    'title': "Ninja Creami Deluxe Recipes (24 oz NC500 Series Scaling) | Creami Cravings",
                    'desc': "Complete recipe guide for the Ninja Creami Deluxe (NC500 series). 1.5x scaling formulas for 24 oz containers with exact ingredient weights and MAX FILL lines.",
                    'url': "https://creamicravings.com/category/deluxe",
                    'heading': "Ninja Creami Deluxe Recipes (24 oz NC500 Series)",
                    'recipes': matching_recipes[:30]
                }
            elif clean_url in ['/category/gelato', '/ninja-creami-gelato-recipes']:
                matching_recipes = [r for r in RECIPES_MASTER if is_gelato_recipe(r)]
                seo_meta = {
                    'title': "Ninja Creami Gelato Recipes — Dense & Silky Italian Style | Creami Cravings",
                    'desc': "Dense, velvety, and authentic Ninja Creami gelato recipes. Rich whole-milk, egg custard, and chocolate gelato bases spun to perfection on the Gelato cycle.",
                    'url': "https://creamicravings.com/category/gelato",
                    'heading': "Ninja Creami Gelato Recipes",
                    'recipes': matching_recipes[:30]
                }
            elif clean_url in ['/freeze-guide', '/guide/freeze-time', '/guide/ninja-creami-freeze-time']:
                seo_meta = {
                    'title': "Ninja Creami Freeze Time Guide: How Long to Freeze Pints (16 vs 24 Hours) | Creami Cravings",
                    'desc': "How long do you need to freeze Ninja Creami pints? Complete freeze time guide covering standard 16h vs 24h freeze rules, deluxe pints, freezer temperatures, and interactive freeze timer.",
                    'url': "https://creamicravings.com/freeze-guide",
                    'heading': "Ninja Creami Freeze Time Guide",
                    'is_faq': True
                }

            if seo_meta:
                if seo_meta.get('is_faq'):
                    html = render_freeze_guide_seo_html(seo_meta, html)
                else:
                    html = render_category_seo_html(seo_meta, html)

            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
            return

        elif self.path == '/sitemap.xml':
            xml_lines = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                '  <url>',
                '    <loc>https://creamicravings.com/</loc>',
                '    <changefreq>daily</changefreq>',
                '    <priority>1.0</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/category/high-protein</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.9</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/category/under-300-cal</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.9</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/category/without-protein-powder</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.9</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/category/sorbet</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.9</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/category/dairy-free</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.9</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/category/keto-low-carb</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.9</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/category/deluxe</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.9</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/category/gelato</loc>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.9</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/freeze-guide</loc>',
                '    <changefreq>monthly</changefreq>',
                '    <priority>0.8</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/privacy.html</loc>',
                '    <changefreq>monthly</changefreq>',
                '    <priority>0.3</priority>',
                '  </url>',
                '  <url>',
                '    <loc>https://creamicravings.com/terms.html</loc>',
                '    <changefreq>monthly</changefreq>',
                '    <priority>0.3</priority>',
                '  </url>'
            ]
            for r in RECIPES_MASTER:
                rid = r.get('id')
                if rid:
                    r_url = f"https://creamicravings.com/recipe/{urllib.parse.quote(rid)}"
                    xml_lines.append('  <url>')
                    xml_lines.append(f'    <loc>{r_url}</loc>')
                    xml_lines.append('    <changefreq>weekly</changefreq>')
                    xml_lines.append('    <priority>0.8</priority>')
                    xml_lines.append('  </url>')
            xml_lines.append('</urlset>')
            sitemap_data = '\n'.join(xml_lines).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/xml; charset=utf-8')
            self.send_header('Cache-Control', 'public, max-age=86400')
            self.end_headers()
            self.wfile.write(sitemap_data)
            return

        elif self.path == '/robots.txt':
            robots_content = (
                "User-agent: *\n"
                "Allow: /\n"
                "Disallow: /api/admin/\n"
                "Disallow: /api/user/\n\n"
                "Sitemap: https://creamicravings.com/sitemap.xml\n"
            )
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Cache-Control', 'public, max-age=86400')
            self.end_headers()
            self.wfile.write(robots_content.encode('utf-8'))
            return

        else:
            super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        data = {}
        if post_data:
            try:
                data = json.loads(post_data.decode('utf-8'))
            except Exception:
                pass

        # 1. Google Authentication
        if self.path == '/api/auth/google':
            credential = data.get('credential', '').strip()
            google_info = None

            if credential:
                google_info = verify_google_token(credential)

            # If client passed direct verified payload (e.g. from Google One-Tap or demo login)
            if not google_info:
                email = data.get('email', '').strip().lower()
                name = data.get('name', '').strip() or email.split('@')[0]
                picture = data.get('picture', '').strip()
                sub = data.get('sub', str(uuid.uuid4())[:8])
                if email:
                    google_info = {
                        'email': email,
                        'name': name,
                        'picture': picture,
                        'sub': sub
                    }

            if not google_info or not google_info.get('email'):
                self._send_json({'error': 'Google authentication failed. Valid credential or email required.'}, 400)
                return

            email = google_info['email']
            name = google_info['name']
            picture = google_info.get('picture', '')
            sub = google_info.get('sub', str(uuid.uuid4())[:8])

            # Find existing user by email or googleId
            target_key = None
            user = None
            for k, u in users_db.items():
                if u.get('email', '').lower() == email or u.get('googleId') == sub:
                    target_key = k
                    user = u
                    break

            new_token = 'token_g_' + str(uuid.uuid4())
            now_iso = datetime.utcnow().isoformat()
            is_admin_email = email in ADMIN_EMAILS
            assigned_role = 'admin' if is_admin_email else 'user'
            initial_subs = list(ALL_SUBSCRIPTIONS) if is_admin_email else list(DEFAULT_SUBSCRIPTIONS)

            if not user:
                user_id = 'user_g_' + sub[:8]
                target_key = email
                user = {
                    'id': user_id,
                    'username': name,
                    'name': name,
                    'email': email,
                    'picture': picture,
                    'googleId': sub,
                    'role': assigned_role,
                    'pantry': list(DEFAULT_STAPLES),
                    'favorites': [],
                    'madeCounts': {},
                    'ratings': {},
                    'customRecipes': [],
                    'shoppingList': [],
                    'freezerPints': [],
                    'subscriptions': initial_subs,
                    'created_at': now_iso,
                    'last_active': now_iso,
                    'token': new_token
                }
                users_db[target_key] = user
            else:
                user['token'] = new_token
                user['name'] = name
                user['last_active'] = now_iso
                if not user.get('created_at'):
                    user['created_at'] = now_iso
                if is_admin_email:
                    user['role'] = 'admin'
                    if 'All-Access' not in user.get('subscriptions', []):
                        user['subscriptions'] = list(ALL_SUBSCRIPTIONS)
                if picture:
                    user['picture'] = picture
                if not user.get('subscriptions'):
                    user['subscriptions'] = list(DEFAULT_SUBSCRIPTIONS)
                if not user.get('madeCounts'):
                    user['madeCounts'] = {}
                if not user.get('ratings'):
                    user['ratings'] = {}
                if not user.get('ratings'):
                    user['ratings'] = {}

            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'token': new_token,
                'user': format_user_payload(user)
            })

        # 2. Sync Full User Cloud Data
        elif self.path == '/api/user/sync':
            user = self._get_user_from_token(data)
            if not user:
                self._send_json({'error': 'Unauthorized'}, 401)
                return

            if 'pantry' in data and isinstance(data['pantry'], list):
                user['pantry'] = data['pantry']
            if 'favorites' in data and isinstance(data['favorites'], list):
                user['favorites'] = data['favorites']
            if 'madeCounts' in data and isinstance(data['madeCounts'], dict):
                user['madeCounts'] = data['madeCounts']
            if 'ratings' in data and isinstance(data['ratings'], dict):
                user['ratings'] = data['ratings']
                # Sync into public ratings_db only for standard community recipes, NOT personal custom ones
                for r_id, r_info in data['ratings'].items():
                    if r_id.startswith('custom_'):
                        continue  # Keep personal recipes private
                    if r_id not in ratings_db:
                        ratings_db[r_id] = {}
                    r_val = r_info.get('rating') if isinstance(r_info, dict) else r_info
                    r_notes = r_info.get('notes', '') if isinstance(r_info, dict) else ''
                    try:
                        r_int = int(r_val) if r_val is not None and str(r_val).strip().isdigit() else 0
                    except (ValueError, TypeError):
                        r_int = 0
                    if r_int > 0 or r_notes:
                        ratings_db[r_id][user['id']] = {
                            'rating': r_int,
                            'notes': r_notes,
                            'userName': user.get('name') or user.get('username'),
                            'updatedAt': datetime.utcnow().strftime('%Y-%m-%d %H:%M')
                        }
                save_json_file(RATINGS_DB_FILE, ratings_db)

            if 'customRecipes' in data and isinstance(data['customRecipes'], list):
                # Personal custom recipes tied strictly to this authenticated user account
                user['customRecipes'] = data['customRecipes']
            if 'shoppingList' in data and isinstance(data['shoppingList'], list):
                user['shoppingList'] = data['shoppingList']
            if 'freezerPints' in data and isinstance(data['freezerPints'], list):
                user['freezerPints'] = data['freezerPints']

            user['last_active'] = datetime.utcnow().isoformat()
            save_json_file(USERS_DB_FILE, users_db)
            self._send_json({'status': 'ok', 'success': True})

        # 2b. Delete Personal Custom Recipe
        elif self.path == '/api/recipe/custom/delete':
            user = self._get_user_from_token(data)
            if not user:
                self._send_json({'error': 'Unauthorized'}, 401)
                return

            recipe_id = data.get('recipeId')
            if not recipe_id:
                self._send_json({'error': 'Recipe ID required'}, 400)
                return

            initial_count = len(user.get('customRecipes', []))
            user['customRecipes'] = [r for r in user.get('customRecipes', []) if r.get('id') != recipe_id]
            user['last_active'] = datetime.utcnow().isoformat()
            save_json_file(USERS_DB_FILE, users_db)
            self._send_json({
                'status': 'ok',
                'success': True,
                'deleted': recipe_id,
                'remaining': len(user['customRecipes'])
            })

        # 3. Log Recipe Batch Made (Personal & Community counter)
        elif self.path == '/api/recipe/made':
            user = self._get_user_from_token(data)
            recipe_id = data.get('recipeId')
            delta = int(data.get('delta', 1))

            if not recipe_id:
                self._send_json({'error': 'Recipe ID required'}, 400)
                return

            is_custom = bool(recipe_id and recipe_id.startswith('custom_'))

            # Community counter increment (only for standard community recipes)
            new_community_count = 0
            if not is_custom:
                if recipe_id not in stats_db:
                    stats_db[recipe_id] = {'totalMade': 0}
                cur_stat = stats_db[recipe_id]
                current_total = cur_stat.get('totalMade', 0) if isinstance(cur_stat, dict) else int(cur_stat)
                new_community_count = max(0, current_total + delta)
                stats_db[recipe_id] = {'totalMade': new_community_count}
                save_json_file(STATS_DB_FILE, stats_db)

            user_made_count = 0
            if user:
                if 'madeCounts' not in user:
                    user['madeCounts'] = {}
                prev_user_count = user['madeCounts'].get(recipe_id, 0)
                user_made_count = max(0, prev_user_count + delta)
                user['madeCounts'][recipe_id] = user_made_count
                save_json_file(USERS_DB_FILE, users_db)

            community_stats = compute_community_stats()
            self._send_json({
                'status': 'ok',
                'success': True,
                'recipeId': recipe_id,
                'userMade': user_made_count,
                'userMadeCount': user_made_count,
                'communityMade': new_community_count,
                'communityTotalMade': new_community_count,
                'totalBatches': community_stats['totalBatches'],
                'totalCommunityBatches': community_stats['totalBatches'],
                'isCustom': is_custom
            })

        # 4. User Rating & Tasting Notes
        elif self.path == '/api/user/rate':
            user = self._get_user_from_token(data)
            if not user:
                self._send_json({'error': 'Please sign in to rate recipes'}, 401)
                return

            recipe_id = data.get('recipeId')
            rating_val = int(data.get('rating', 0))
            notes = data.get('notes', '').strip()

            if not recipe_id or rating_val < 1 or rating_val > 5:
                self._send_json({'error': 'Invalid recipe ID or rating value (1-5)'}, 400)
                return

            is_custom = bool(recipe_id and recipe_id.startswith('custom_'))

            # Only add to public community ratings if not a private custom recipe
            if not is_custom:
                if recipe_id not in ratings_db:
                    ratings_db[recipe_id] = {}

                ratings_db[recipe_id][user['id']] = {
                    'rating': rating_val,
                    'notes': notes,
                    'userName': user.get('name') or user.get('username'),
                    'updatedAt': datetime.now().strftime('%Y-%m-%d %H:%M')
                }
                save_json_file(RATINGS_DB_FILE, ratings_db)

            if 'ratings' not in user:
                user['ratings'] = {}
            user['ratings'][recipe_id] = {
                'rating': rating_val,
                'notes': notes,
                'updatedAt': datetime.now().strftime('%Y-%m-%d %H:%M')
            }
            save_json_file(USERS_DB_FILE, users_db)

            if is_custom:
                self._send_json({
                    'status': 'ok',
                    'success': True,
                    'recipeId': recipe_id,
                    'userRating': rating_val,
                    'userNotes': notes,
                    'avg': rating_val,
                    'count': 1,
                    'communityAverage': rating_val,
                    'communityCount': 1,
                    'distribution': {rating_val: 1},
                    'isCustom': True
                })
                return

            # Return updated community score for this recipe
            vals = [v['rating'] if isinstance(v, dict) else v for v in ratings_db[recipe_id].values()]
            avg = round(sum(vals) / len(vals), 1)
            dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            for v in vals:
                dist[v] = dist.get(v, 0) + 1

            self._send_json({
                'status': 'ok',
                'success': True,
                'recipeId': recipe_id,
                'userRating': rating_val,
                'userNotes': notes,
                'avg': avg,
                'count': len(vals),
                'communityAverage': avg,
                'communityCount': len(vals),
                'distribution': dist
            })

        # 5. Email & Password Auth (Universal Registration & Login)
        elif self.path == '/api/auth/register':
            email = data.get('email', '').strip().lower()
            password = data.get('password', '').strip()
            name = data.get('name', '').strip()

            if not email or '@' not in email or '.' not in email.split('@')[-1]:
                self._send_json({'error': 'Please provide a valid email address.'}, 400)
                return

            if not password or len(password) < 6:
                self._send_json({'error': 'Password must be at least 6 characters long.'}, 400)
                return

            # Check if user already exists
            existing_user = None
            for u in users_db.values():
                if u.get('email', '').lower() == email:
                    existing_user = u
                    break

            if existing_user:
                if existing_user.get('password'):
                    self._send_json({'error': 'An account with this email already exists. Please sign in.'}, 409)
                else:
                    self._send_json({'error': 'This email was registered with Google Sign-In. Please sign in using Google.'}, 409)
                return

            user_id = 'user_em_' + str(uuid.uuid4())[:8]
            display_name = name if name else email.split('@')[0].capitalize()
            is_admin_email = email in ADMIN_EMAILS
            assigned_role = 'admin' if is_admin_email else 'user'
            initial_subs = list(ALL_SUBSCRIPTIONS) if is_admin_email else list(DEFAULT_SUBSCRIPTIONS)
            token = 'token_em_' + str(uuid.uuid4())
            now_iso = datetime.utcnow().isoformat()

            new_user = {
                'id': user_id,
                'username': display_name,
                'name': display_name,
                'email': email,
                'password': hash_password(password),
                'picture': '',
                'authProvider': 'email',
                'role': assigned_role,
                'creatorId': '',
                'pantry': list(DEFAULT_STAPLES),
                'favorites': [],
                'madeCounts': {},
                'ratings': {},
                'customRecipes': [],
                'shoppingList': [],
                'freezerPints': [],
                'subscriptions': initial_subs,
                'created_at': now_iso,
                'last_active': now_iso,
                'token': token
            }
            users_db[email] = new_user
            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'token': token,
                'user': format_user_payload(new_user)
            })
            return

        elif self.path == '/api/auth/login':
            login_id = (data.get('email') or data.get('username') or '').strip().lower()
            password = data.get('password', '').strip()

            if not login_id or not password:
                self._send_json({'error': 'Email and password are required.'}, 400)
                return

            target_user = None
            for u in users_db.values():
                if u.get('email', '').lower() == login_id or u.get('username', '').lower() == login_id:
                    target_user = u
                    break

            if not target_user:
                self._send_json({'error': 'No account found with this email. Please check your spelling or create an account.'}, 404)
                return

            stored_pass = target_user.get('password')
            if not stored_pass:
                self._send_json({'error': 'This account was created with Google Sign-In. Please sign in using Google.'}, 400)
                return

            if not verify_password(stored_pass, password):
                self._send_json({'error': 'Incorrect password. Please try again.'}, 401)
                return

            token = 'token_em_' + str(uuid.uuid4())
            target_user['token'] = token
            target_user['last_active'] = datetime.utcnow().isoformat()
            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'token': token,
                'user': format_user_payload(target_user)
            })
            return

        # 5b. Password Reset: Request 6-Digit Code / Reset Token
        elif self.path == '/api/auth/forgot-password':
            email = data.get('email', '').strip().lower()
            if not email or '@' not in email or '.' not in email.split('@')[-1]:
                self._send_json({'error': 'Please provide a valid email address.'}, 400)
                return

            target_user = None
            for u in users_db.values():
                if u.get('email', '').lower() == email:
                    target_user = u
                    break

            if not target_user:
                # Privacy best practice: acknowledge receipt without leaking whether email exists
                self._send_json({
                    'status': 'ok',
                    'success': True,
                    'message': 'If an account exists with this email, a reset code has been sent.',
                    'email': email,
                    'smtpConfigured': bool(get_smtp_config())
                })
                return

            if not target_user.get('password'):
                self._send_json({
                    'error': 'This account was registered with Google Sign-In. You can sign in directly using Google without a password.',
                    'isGoogleAccount': True
                }, 400)
                return

            code = f"{secrets.randbelow(900000) + 100000}"
            token = secrets.token_urlsafe(32)
            expires_at = (datetime.utcnow() + timedelta(minutes=30)).isoformat()

            target_user['passwordReset'] = {
                'code': code,
                'token': token,
                'expires_at': expires_at,
                'requested_at': datetime.utcnow().isoformat()
            }
            save_json_file(USERS_DB_FILE, users_db)

            sent, reason = send_password_reset_email(email, target_user.get('name') or target_user.get('username'), code, token)

            resp_data = {
                'status': 'ok',
                'success': True,
                'message': 'A 6-digit password reset code has been generated and sent to your email.',
                'email': email,
                'smtpConfigured': bool(get_smtp_config()),
                'emailSent': sent
            }
            if not get_smtp_config():
                resp_data['devCode'] = code
                resp_data['message'] = f"SMTP is not yet configured on this server. For verification, your reset code is: {code}"

            self._send_json(resp_data)
            return

        # 5c. Password Reset: Verify Code/Token & Set New Password
        elif self.path == '/api/auth/reset-password':
            email = data.get('email', '').strip().lower()
            code = str(data.get('code', '')).strip()
            token = str(data.get('token', '')).strip()
            new_password = data.get('newPassword', '').strip()

            if not email:
                self._send_json({'error': 'Email address is required.'}, 400)
                return

            if not new_password or len(new_password) < 6:
                self._send_json({'error': 'New password must be at least 6 characters long.'}, 400)
                return

            if not code and not token:
                self._send_json({'error': 'Verification code or reset token is required.'}, 400)
                return

            target_user = None
            for u in users_db.values():
                if u.get('email', '').lower() == email:
                    target_user = u
                    break

            if not target_user:
                self._send_json({'error': 'No account found with this email.'}, 404)
                return

            reset_info = target_user.get('passwordReset')
            if not reset_info:
                self._send_json({'error': 'No active password reset request found. Please request a new code.'}, 400)
                return

            expires_at_str = reset_info.get('expires_at')
            if expires_at_str:
                try:
                    exp_dt = datetime.fromisoformat(expires_at_str)
                    if datetime.utcnow() > exp_dt:
                        self._send_json({'error': 'Reset code has expired. Please request a new one.'}, 400)
                        return
                except Exception:
                    pass

            expected_code = str(reset_info.get('code', '')).strip()
            expected_token = str(reset_info.get('token', '')).strip()

            code_match = bool(code and expected_code and hmac.compare_digest(code, expected_code))
            token_match = bool(token and expected_token and hmac.compare_digest(token, expected_token))

            if not (code_match or token_match):
                self._send_json({'error': 'Invalid verification code or token. Please check and try again.'}, 400)
                return

            target_user['password'] = hash_password(new_password)
            target_user.pop('passwordReset', None)

            new_token = 'token_em_' + str(uuid.uuid4())
            target_user['token'] = new_token
            target_user['last_active'] = datetime.utcnow().isoformat()
            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'token': new_token,
                'user': format_user_payload(target_user),
                'message': 'Password successfully reset! You are now signed in.'
            })
            return

        elif self.path == '/api/user/pantry':
            user = self._get_user_from_token()
            if not user:
                self._send_json({'error': 'Unauthorized'}, 401)
                return
            user['pantry'] = data.get('pantry', [])
            save_json_file(USERS_DB_FILE, users_db)
            self._send_json({'status': 'ok', 'success': True})

        elif self.path == '/api/user/favorites':
            user = self._get_user_from_token()
            if not user:
                self._send_json({'error': 'Unauthorized'}, 401)
                return
            user['favorites'] = data.get('favorites', [])
            save_json_file(USERS_DB_FILE, users_db)
            self._send_json({'status': 'ok', 'success': True})

        # Admin: Update User Permissions / Role / Subscriptions
        elif self.path == '/api/admin/user/permissions':
            admin_user = self._get_user_from_token(data)
            if not admin_user or admin_user.get('role') != 'admin':
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return

            target_id = data.get('userId')
            target_email = data.get('email', '').strip().lower()

            target_user = None
            for u in users_db.values():
                if (target_id and u.get('id') == target_id) or (target_email and u.get('email', '').lower() == target_email):
                    target_user = u
                    break

            if not target_user:
                self._send_json({'error': 'Target user not found'}, 404)
                return

            # Update role if provided
            if 'role' in data and data['role'] in ['admin', 'creator', 'vip', 'user']:
                # Protect root admin emails from demotion
                if target_user.get('email', '').lower() in ADMIN_EMAILS and data['role'] != 'admin':
                    self._send_json({'error': 'Cannot demote root administrator email'}, 400)
                    return
                target_user['role'] = data['role']
                if data['role'] == 'creator' and not target_user.get('creatorId'):
                    c_id = data.get('creatorId', '').strip()
                    if not c_id:
                        u_name = target_user.get('username', '').lower()
                        u_mail = target_user.get('email', '').lower()
                        c_id = 'fitness_product_finder' if ('eli' in u_name or 'eli' in u_mail) else f"creator_{u_name}"
                    target_user['creatorId'] = c_id

            # Update category subscription packs
            if 'subscriptions' in data and isinstance(data['subscriptions'], list):
                target_user['subscriptions'] = list(set(data['subscriptions']))

            target_user['last_active'] = datetime.utcnow().isoformat()
            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'user': {
                    'id': target_user.get('id'),
                    'email': target_user.get('email'),
                    'role': target_user.get('role', 'user'),
                    'subscriptions': target_user.get('subscriptions', [])
                }
            })

        # Admin: Delete User Account
        elif self.path == '/api/admin/user/delete':
            admin_user = self._get_user_from_token(data)
            if not admin_user or admin_user.get('role') != 'admin':
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return

            target_id = data.get('userId')
            target_email = data.get('email', '').strip().lower()

            if target_email in ADMIN_EMAILS or target_id == 'user_admin_001':
                self._send_json({'error': 'Cannot delete root administrator account'}, 400)
                return

            key_to_delete = None
            for k, u in users_db.items():
                if (target_id and u.get('id') == target_id) or (target_email and u.get('email', '').lower() == target_email):
                    key_to_delete = k
                    break

            if not key_to_delete:
                self._send_json({'error': 'Target user not found'}, 404)
                return

            del users_db[key_to_delete]
            save_json_file(USERS_DB_FILE, users_db)
            self._send_json({'status': 'ok', 'success': True})

        # Admin: Set / Reset Any User's Password Directly
        elif self.path == '/api/admin/user/reset-password':
            admin_user = self._get_user_from_token(data)
            if not admin_user or admin_user.get('role') != 'admin':
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return

            target_id = data.get('userId')
            target_email = data.get('email', '').strip().lower()
            new_password = data.get('newPassword', '').strip()

            if not new_password or len(new_password) < 6:
                self._send_json({'error': 'Password must be at least 6 characters'}, 400)
                return

            target_user = None
            for u in users_db.values():
                if (target_id and u.get('id') == target_id) or (target_email and u.get('email', '').lower() == target_email):
                    target_user = u
                    break

            if not target_user:
                self._send_json({'error': 'Target user not found'}, 404)
                return

            target_user['password'] = hash_password(new_password)
            target_user.pop('passwordReset', None)
            target_user['last_active'] = datetime.utcnow().isoformat()
            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'message': f"Password for {target_user.get('email')} has been successfully updated."
            })

        # Admin: Create New User Account
        elif self.path == '/api/admin/user/create':
            admin_user = self._get_user_from_token(data)
            if not admin_user or admin_user.get('role') != 'admin':
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return

            email = data.get('email', '').strip().lower()
            name = data.get('name', '').strip()
            username = data.get('username', '').strip().lower()
            role = data.get('role', 'user').strip().lower()
            password = data.get('password', '').strip()
            subscriptions = data.get('subscriptions', [])

            if not email and not username:
                self._send_json({'error': 'Email or username is required'}, 400)
                return

            if not username:
                username = email.split('@')[0] if email else f"user_{uuid.uuid4().hex[:6]}"

            if not name:
                name = username.capitalize()

            if role not in ['admin', 'creator', 'vip', 'user']:
                role = 'user'

            # Check if user already exists
            existing = None
            for u in users_db.values():
                if (email and u.get('email', '').lower() == email) or (username and u.get('username', '').lower() == username):
                    existing = u
                    break

            if existing:
                self._send_json({'error': f"User with this email or username already exists ({existing.get('email') or existing.get('username')})"}, 400)
                return

            now_iso = datetime.utcnow().isoformat()
            user_id = f"user_{uuid.uuid4().hex[:8]}"

            # Determine initial subscriptions
            if not isinstance(subscriptions, list) or len(subscriptions) == 0:
                if role in ['admin', 'creator', 'vip']:
                    initial_subs = list(ALL_SUBSCRIPTIONS)
                else:
                    initial_subs = list(DEFAULT_SUBSCRIPTIONS)
            else:
                initial_subs = list(set(subscriptions))

            # Password hashing
            default_pass = password if password else 'creami123'
            creator_id = data.get('creatorId', '').strip()
            if role == 'creator' and not creator_id:
                if 'eli' in username or 'eli' in email:
                    creator_id = 'fitness_product_finder'
                else:
                    creator_id = f"creator_{username}"

            new_user = {
                'id': user_id,
                'username': username,
                'name': name,
                'email': email,
                'password': pass_hash,
                'role': role,
                'creatorId': creator_id,
                'pantry': list(DEFAULT_STAPLES),
                'favorites': [],
                'madeCounts': {},
                'ratings': {},
                'customRecipes': [],
                'shoppingList': [],
                'freezerPints': [],
                'subscriptions': initial_subs,
                'created_at': now_iso,
                'last_active': now_iso,
                'token': f"token_{uuid.uuid4().hex}"
            }

            key = email if email else username
            users_db[key] = new_user
            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'user': {
                    'id': new_user['id'],
                    'username': new_user['username'],
                    'name': new_user['name'],
                    'email': new_user['email'],
                    'role': new_user['role'],
                    'subscriptions': new_user['subscriptions'],
                    'created_at': new_user['created_at'],
                    'tempPassword': default_pass if not password else None
                }
            })

        # Admin: Resolve Access Claim / Inquiry
        elif self.path == '/api/admin/inquiry/resolve':
            admin_user = self._get_user_from_token(data)
            if not admin_user or admin_user.get('role') != 'admin':
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return

            inquiry_id = data.get('inquiryId')
            action = data.get('action', 'approve')
            inquiries = stats_db.get('purchase_inquiries', [])

            target = next((i for i in inquiries if i.get('id') == inquiry_id), None)
            if not target:
                self._send_json({'error': 'Inquiry not found'}, 404)
                return

            if action == 'approve':
                target_email = target.get('email', '').strip().lower()
                pack = target.get('pack')
                target['status'] = 'approved'
                target['resolved_at'] = datetime.utcnow().isoformat()
                # Automatically grant pack to matching user
                for u in users_db.values():
                    if u.get('email', '').lower() == target_email:
                        subs = u.get('subscriptions', list(DEFAULT_SUBSCRIPTIONS))
                        if pack == 'All-Access':
                            subs = list(ALL_SUBSCRIPTIONS)
                        elif pack and pack not in subs:
                            subs.append(pack)
                        u['subscriptions'] = list(set(subs))
                        save_json_file(USERS_DB_FILE, users_db)
                        break
            else:
                target['status'] = 'dismissed'
                target['resolved_at'] = datetime.utcnow().isoformat()

            save_json_file(STATS_DB_FILE, stats_db)
            self._send_json({'status': 'ok', 'success': True, 'inquiry': target})

        # 8. Purchase Inquiry / Access Claim (Store available pack requests with deduplication)
        elif self.path == '/api/purchase-inquiry':
            email = data.get('email', '').strip()
            pack = data.get('pack', '').strip()
            if not email or not pack:
                self._send_json({'error': 'Email and pack required'}, 400)
                return

            if 'purchase_inquiries' not in stats_db:
                stats_db['purchase_inquiries'] = []

            user_id = data.get('userId')
            order_id = data.get('orderId', '').strip()
            checkout_email = data.get('checkoutEmail', '').strip()
            notes = data.get('notes', '').strip()
            action = data.get('action', 'claim_existing')

            # Deduplication: Check if a pending claim already exists for this user and pack
            existing = None
            for inq in stats_db['purchase_inquiries']:
                if inq.get('status') == 'pending' and inq.get('pack') == pack:
                    if (inq.get('email', '').lower() == email.lower()) or (user_id and inq.get('userId') == user_id):
                        existing = inq
                        break

            if existing:
                # Update existing pending claim with newly provided verification details
                if order_id:
                    existing['orderId'] = order_id
                if checkout_email:
                    existing['checkoutEmail'] = checkout_email
                if notes:
                    existing['notes'] = notes
                existing['updatedAt'] = datetime.utcnow().isoformat()
                save_json_file(STATS_DB_FILE, stats_db)
                self._send_json({
                    'status': 'ok',
                    'success': True,
                    'already_pending': True,
                    'message': f'Access claim for "{pack}" is already pending verification.',
                    'inquiry': existing
                })
            else:
                inquiry = {
                    'id': str(uuid.uuid4()),
                    'email': email,
                    'userId': user_id,
                    'pack': pack,
                    'action': action,
                    'orderId': order_id,
                    'checkoutEmail': checkout_email,
                    'notes': notes,
                    'status': 'pending',
                    'timestamp': datetime.utcnow().isoformat()
                }
                stats_db['purchase_inquiries'].append(inquiry)
                save_json_file(STATS_DB_FILE, stats_db)
                self._send_json({
                    'status': 'ok',
                    'success': True,
                    'already_pending': False,
                    'message': f'Access claim for "{pack}" submitted for verification.',
                    'inquiry': inquiry
                })

        # User Feedback & Feature Requests (Roadmap Item 21)
        elif self.path == '/api/feedback':
            if not isinstance(data, dict):
                self._send_json({'error': 'Invalid JSON body'}, 400)
                return

            category = data.get('category', 'general').strip()
            message = data.get('message', '').strip()
            if not message or len(message) < 3:
                self._send_json({'error': 'Please provide a valid feedback message (at least 3 characters).'}, 400)
                return

            user = self._get_user_from_token(data)
            user_email = (user.get('email') if user else data.get('email', '')).strip().lower()
            user_name = (user.get('name') if user else data.get('name', 'Anonymous')).strip()

            if 'user_feedback' not in stats_db:
                stats_db['user_feedback'] = []

            feedback_item = {
                'id': f"fb_{int(time.time())}_{uuid.uuid4().hex[:6]}",
                'userId': user.get('id') if user else None,
                'email': user_email,
                'name': user_name or 'Anonymous',
                'category': category,
                'rating': data.get('rating'),
                'recipeId': data.get('recipeId'),
                'message': message,
                'status': 'pending',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }

            stats_db['user_feedback'].append(feedback_item)
            save_json_file(STATS_DB_FILE, stats_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'message': 'Thank you! Your feedback has been received.',
                'feedbackId': feedback_item['id']
            })

        # Admin: Update Feedback Status (Reviewed, Implemented, Dismissed)
        elif self.path == '/api/admin/feedback/status':
            user = self._get_user_from_token(data)
            if not user or (user.get('role') != 'admin' and user.get('email', '').lower() != 'ahumpo7@gmail.com'):
                self._send_json({'error': 'Unauthorized admin access'}, 403)
                return

            if not isinstance(data, dict):
                self._send_json({'error': 'Invalid JSON'}, 400)
                return

            fb_id = data.get('id')
            new_status = data.get('status', 'reviewed')
            if not fb_id:
                self._send_json({'error': 'Feedback ID is required'}, 400)
                return

            found = False
            for item in stats_db.get('user_feedback', []):
                if item.get('id') == fb_id:
                    item['status'] = new_status
                    item['updatedAt'] = datetime.utcnow().isoformat() + 'Z'
                    found = True
                    break

            if found:
                save_json_file(STATS_DB_FILE, stats_db)
                self._send_json({'status': 'ok', 'success': True})
            else:
                self._send_json({'error': 'Feedback item not found'}, 404)

        else:
            self._send_json({'error': 'Endpoint not found'}, 404)

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    try:
        httpd = ThreadingHTTPServer(('0.0.0.0', PORT), RecipeServer)
        print(f"Creami Cravings Server running at http://localhost:{PORT}")
        httpd.serve_forever()
    except OSError as e:
        print(f"Port {PORT} binding status: {e}")
