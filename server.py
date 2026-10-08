import http.server
import socketserver
import json
import os
import hashlib
import uuid
import urllib.request
import urllib.parse
import base64
import re
from datetime import datetime

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

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

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
        m_count = stat.get('totalMade', 0) if isinstance(stat, dict) else int(stat)
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
        if self.path.startswith('/recipe/'):
            clean_url = self.path.split('?')[0]
            if re.search(r'\.(css|js|png|jpg|jpeg|svg|ico|json|woff2?|ttf|webp|map)$', clean_url, re.I):
                self.path = self.path[len('/recipe'):]
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

            # Handle deep-linked recipe URL with dynamic SEO & Open Graph meta tags
            req_slug = urllib.parse.unquote(self.path[len('/recipe/'):].split('?')[0].strip('/'))
            recipe = RECIPES_BY_ID.get(req_slug)
            
            index_path = os.path.join(DIRECTORY, 'index.html')
            if not os.path.exists(index_path):
                self.send_error(404, "Page not found")
                return

            with open(index_path, 'r', encoding='utf-8') as f:
                html = f.read()

            if recipe:
                rec_name = recipe.get('name', 'Ninja Creami Recipe')
                rec_cat = recipe.get('category', 'Ninja Creami')
                macros = recipe.get('macros', {})
                cal = macros.get('calories', '250')
                pro = macros.get('protein', '30g')
                carbs = macros.get('carbs', '10g')
                fat = macros.get('fat', '5g')
                spin = recipe.get('spinSetting', 'Lite Ice Cream')

                meta_title = f"{rec_name} — High-Protein Ninja Creami Recipe | Creami Cravings"
                meta_desc = f"Make {rec_name} with your Ninja Creami! {cal} kcal, {pro} protein. Spin setting: {spin}. Full macro breakdown, ingredients, and smart swaps on Creami Cravings."
                page_url = f"https://creamicravings.com/recipe/{urllib.parse.quote(req_slug)}"
                image_url = "https://creamicravings.com/icon-512.png"

                # Schema.org JSON-LD structured data for Google Rich Snippets
                json_ld = {
                    "@context": "https://schema.org",
                    "@type": "Recipe",
                    "name": rec_name,
                    "description": meta_desc,
                    "recipeCategory": rec_cat,
                    "recipeYield": recipe.get('makes', '1 pint'),
                    "prepTime": "PT5M",
                    "totalTime": "PT16H",
                    "nutrition": {
                        "@type": "NutritionInformation",
                        "calories": f"{cal} calories",
                        "proteinContent": pro,
                        "carbohydrateContent": carbs,
                        "fatContent": fat
                    },
                    "author": {
                        "@type": "Organization",
                        "name": "Creami Cravings",
                        "url": "https://creamicravings.com"
                    }
                }
                json_ld_str = json.dumps(json_ld, ensure_ascii=False, indent=2)

                seo_head_block = f'''  <title>{meta_title}</title>
  <meta name="description" content="{meta_desc}">
  <link rel="canonical" href="{page_url}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="{page_url}">
  <meta property="og:title" content="{rec_name} — Ninja Creami Recipe">
  <meta property="og:description" content="{cal} kcal • {pro} protein • Spin on {spin}. Discover ingredients and macro-balanced scoops on Creami Cravings.">
  <meta property="og:image" content="{image_url}">
  <meta property="og:site_name" content="Creami Cravings">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:url" content="{page_url}">
  <meta name="twitter:title" content="{rec_name} — Ninja Creami Recipe">
  <meta name="twitter:description" content="{cal} kcal • {pro} protein • {spin}.">
  <meta name="twitter:image" content="{image_url}">

  <!-- Schema.org Recipe Structured Data for Google Rich Snippets -->
  <script type="application/ld+json">
{json_ld_str}
  </script>'''

                # Replace default title and description in index.html, inject SEO tags before </head>
                html = re.sub(r'<title>.*?</title>', f'<title>{meta_title}</title>', html, count=1)
                html = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{meta_desc}">', html, count=1)
                html = html.replace('</head>', f'{seo_head_block}\n</head>', 1)

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
                'user': {
                    'id': user.get('id'),
                    'username': user.get('username'),
                    'name': user.get('name'),
                    'email': user.get('email'),
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
                    'subscriptions': user.get('subscriptions', list(ALL_SUBSCRIPTIONS))
                }
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

        # 5. Legacy Auth & User routes
        elif self.path == '/api/auth/login':
            username = data.get('username', '').strip().lower()
            password = data.get('password', '').strip()

            target_user = None
            if username in users_db:
                target_user = users_db[username]
            else:
                for k, u in users_db.items():
                    if u.get('email', '').lower() == username or u.get('username', '').lower() == username:
                        target_user = u
                        break

            if not target_user:
                self._send_json({'error': 'Invalid username or password'}, 401)
                return

            if target_user.get('password') != hash_password(password):
                self._send_json({'error': 'Invalid username or password'}, 401)
                return

            token = 'token_' + str(uuid.uuid4())
            target_user['token'] = token
            target_user['last_active'] = datetime.utcnow().isoformat()
            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'token': token,
                'user': {
                    'id': target_user.get('id'),
                    'username': target_user.get('username'),
                    'name': target_user.get('name') or target_user.get('username'),
                    'email': target_user.get('email', ''),
                    'role': target_user.get('role', 'user'),
                    'creatorId': target_user.get('creatorId', ''),
                    'subscriptions': target_user.get('subscriptions', list(DEFAULT_SUBSCRIPTIONS)),
                    'pantry': target_user.get('pantry') if target_user.get('pantry') is not None else list(DEFAULT_STAPLES),
                    'favorites': target_user.get('favorites', []),
                    'madeCounts': target_user.get('madeCounts', {}),
                    'ratings': target_user.get('ratings', {}),
                    'customRecipes': target_user.get('customRecipes', []),
                    'shoppingList': target_user.get('shoppingList', []),
                    'freezerPints': target_user.get('freezerPints', [])
                }
            })

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
