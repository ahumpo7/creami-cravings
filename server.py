import http.server
import socketserver
import json
import os
import hashlib
import uuid
import urllib.request
import base64
from datetime import datetime

PORT = int(os.environ.get('PORT', 8000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
USERS_DB_FILE = os.path.join(DIRECTORY, 'db_users.json')
RATINGS_DB_FILE = os.path.join(DIRECTORY, 'db_ratings.json')
STATS_DB_FILE = os.path.join(DIRECTORY, 'db_recipe_stats.json')

DEFAULT_STAPLES = [
    'fat_free_ultra_filtered_milk',
    'sweetener',
    'xanthan_gum',
    'salt',
    'vanilla_bean_paste',
    'cocoa_powder'
]

ALL_SUBSCRIPTIONS = ["All-Access", "Base Flavors", "Fan Favorites", "No Protein", "Keto", "Lactose Free"]
DEFAULT_SUBSCRIPTIONS = ["Base Flavors"]

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

    return {
        'status': 'ok',
        'success': True,
        'ratings': ratings_summary,
        'madeCounts': made_summary,
        'totalBatches': total_community_batches
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
        if token:
            for u in users_db.values():
                if u.get('token') == token:
                    return u
        # Fallback to verified admin/user email header or body parameter
        user_email = self.headers.get('X-User-Email', '').strip().lower()
        if not user_email and data and isinstance(data, dict):
            user_email = data.get('adminEmail', '').strip().lower() or data.get('email', '').strip().lower()
        if user_email:
            for u in users_db.values():
                if u.get('email', '').lower() == user_email:
                    return u
        return None

    def do_GET(self):
        if self.path == '/api/community/stats' or self.path == '/api/community/ratings':
            self._send_json(compute_community_stats())

        elif self.path == '/api/user/data':
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
                'pantry': user.get('pantry', DEFAULT_STAPLES),
                'favorites': user.get('favorites', []),
                'madeCounts': user.get('madeCounts', {}),
                'ratings': user.get('ratings', {}),
                'customRecipes': user.get('customRecipes', []),
                'shoppingList': user.get('shoppingList', []),
                'freezerPints': user.get('freezerPints', []),
                'subscriptions': user.get('subscriptions', list(DEFAULT_SUBSCRIPTIONS))
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
                    'created_at': u.get('created_at', ''),
                    'last_active': u.get('last_active', ''),
                    'subscriptions': u.get('subscriptions', list(DEFAULT_SUBSCRIPTIONS)),
                    'pantryCount': len(u.get('pantry', [])),
                    'favoritesCount': len(u.get('favorites', [])),
                    'customCount': len(u.get('customRecipes', [])),
                    'madeTotal': sum(u.get('madeCounts', {}).values()) if isinstance(u.get('madeCounts'), dict) else 0
                })
            self._send_json({'status': 'ok', 'users': users_list})

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
                    'pantry': user.get('pantry', DEFAULT_STAPLES),
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
                    ratings_db[r_id][user['id']] = {
                        'rating': int(r_val),
                        'notes': r_notes,
                        'userName': user.get('name') or user.get('username'),
                        'updatedAt': datetime.now().strftime('%Y-%m-%d %H:%M')
                    }
                save_json_file(RATINGS_DB_FILE, ratings_db)

            if 'customRecipes' in data and isinstance(data['customRecipes'], list):
                # Personal custom recipes tied strictly to this authenticated user account
                user['customRecipes'] = data['customRecipes']
            if 'shoppingList' in data and isinstance(data['shoppingList'], list):
                user['shoppingList'] = data['shoppingList']
            if 'freezerPints' in data and isinstance(data['freezerPints'], list):
                user['freezerPints'] = data['freezerPints']

            save_json_file(USERS_DB_FILE, users_db)
            self._send_json({'status': 'ok', 'success': True})

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

            if username not in users_db:
                self._send_json({'error': 'Invalid username or password'}, 401)
                return

            user = users_db[username]
            if user.get('password') != hash_password(password):
                self._send_json({'error': 'Invalid username or password'}, 401)
                return

            token = 'token_' + str(uuid.uuid4())
            user['token'] = token
            save_json_file(USERS_DB_FILE, users_db)

            self._send_json({
                'status': 'ok',
                'success': True,
                'token': token,
                'user': {
                    'id': user.get('id'),
                    'username': user.get('username'),
                    'name': user.get('name') or user.get('username'),
                    'email': user.get('email', ''),
                    'role': user.get('role', 'user'),
                    'pantry': user.get('pantry', DEFAULT_STAPLES),
                    'favorites': user.get('favorites', []),
                    'madeCounts': user.get('madeCounts', {}),
                    'ratings': user.get('ratings', {}),
                    'customRecipes': user.get('customRecipes', []),
                    'shoppingList': user.get('shoppingList', [])
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
            if 'role' in data and data['role'] in ['admin', 'user']:
                # Protect root admin emails from demotion
                if target_user.get('email', '').lower() in ADMIN_EMAILS and data['role'] != 'admin':
                    self._send_json({'error': 'Cannot demote root administrator email'}, 400)
                    return
                target_user['role'] = data['role']

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
