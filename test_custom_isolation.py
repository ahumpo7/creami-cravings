import urllib.request
import json

def test():
    # 1. Login user A
    login_data = json.dumps({'email': 'testuser_a@gmail.com', 'name': 'User A'}).encode('utf-8')
    req = urllib.request.Request('http://localhost:8000/api/auth/google', data=login_data, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    user_a = json.loads(res.read().decode('utf-8'))
    token_a = user_a['token']
    uid_a = user_a['user']['id']
    print('User A login OK:', user_a['user']['email'])

    # 2. Sync full account data for User A (pantry, favorites, freezer pints, custom recipes, notes)
    custom_recipe = {
        'id': f'custom_{uid_a}_12345',
        'name': 'My Super Secret Protein Gelato',
        'category': 'Custom',
        'isPersonal': True,
        'ingredients': [{'id': 'milk', 'name': 'Milk'}],
        'macros': {'calories': '180', 'protein': '30g', 'carbs': '5g', 'fat': '2g'}
    }
    freezer_pint = {
        'id': 'pint_123',
        'recipeName': 'Oreo McFlurry',
        'size': 'Deluxe 24 oz',
        'freezeDate': '2026-10-04T12:00:00Z',
        'notes': 'Double oreos'
    }
    pantry_a = ['almond_milk', 'whey_protein', 'strawberries', 'black_cocoa_powder']
    favorites_a = ['oreo_mcflurry', 'strawberry_cheesecake_gelato']
    shopping_a = ['heavy_cream', 'fairlife_milk']
    made_a = {'oreo_mcflurry': 3}

    sync_data = json.dumps({
        'token': token_a,
        'email': 'testuser_a@gmail.com',
        'pantry': pantry_a,
        'favorites': favorites_a,
        'shoppingList': shopping_a,
        'freezerPints': [freezer_pint],
        'madeCounts': made_a,
        'customRecipes': [custom_recipe],
        'ratings': {custom_recipe['id']: {'rating': 5, 'notes': 'Private secret notes'}}
    }).encode('utf-8')
    req_sync = urllib.request.Request('http://localhost:8000/api/user/sync', data=sync_data, headers={'Content-Type': 'application/json'})
    urllib.request.urlopen(req_sync)
    print('User A full data synced successfully')

    # 3. Check /api/user/data for User A
    req_data_a = urllib.request.Request('http://localhost:8000/api/user/data', headers={'Authorization': f'Bearer {token_a}'})
    res_data_a = urllib.request.urlopen(req_data_a)
    user_data_a = json.loads(res_data_a.read().decode('utf-8'))
    assert set(user_data_a['pantry']) == set(pantry_a), 'FAIL: User A pantry did not match synced data!'
    assert set(user_data_a['favorites']) == set(favorites_a), 'FAIL: User A favorites did not match synced data!'
    assert len(user_data_a['freezerPints']) == 1, 'FAIL: User A freezer pints not preserved!'
    assert user_data_a['freezerPints'][0]['recipeName'] == 'Oreo McFlurry', 'FAIL: Freezer pint name mismatch!'
    assert set(user_data_a['shoppingList']) == set(shopping_a), 'FAIL: Shopping list mismatch!'
    print('VERIFIED: User A /api/user/data contains all synchronized account data')

    # 4. Check community stats to ensure User A custom recipe is NOT in community ratings or stats
    res_comm = urllib.request.urlopen('http://localhost:8000/api/community/stats')
    comm_stats = json.loads(res_comm.read().decode('utf-8'))
    assert custom_recipe['id'] not in comm_stats['ratings'], 'LEAK: Custom recipe found in community ratings!'
    assert custom_recipe['id'] not in comm_stats['madeCounts'], 'LEAK: Custom recipe found in community made counts!'
    print('VERIFIED: Custom recipe is completely isolated from community stats')

    # 5. Check user B login and data isolation
    login_b = json.dumps({'email': 'testuser_b@gmail.com', 'name': 'User B'}).encode('utf-8')
    req_b = urllib.request.Request('http://localhost:8000/api/auth/google', data=login_b, headers={'Content-Type': 'application/json'})
    res_b = urllib.request.urlopen(req_b)
    user_b = json.loads(res_b.read().decode('utf-8'))
    token_b = user_b['token']
    assert len(user_b['user']['customRecipes']) == 0, 'LEAK: User B received User A custom recipes!'
    assert set(user_b['user']['favorites']) != set(favorites_a), 'LEAK: User B received User A favorites!'
    print('VERIFIED: User B has separate favorites and 0 custom recipes')

    # 6. Fetch User B /api/user/data
    req_data_b = urllib.request.Request('http://localhost:8000/api/user/data', headers={'Authorization': f'Bearer {token_b}'})
    res_data_b = urllib.request.urlopen(req_data_b)
    user_data_b = json.loads(res_data_b.read().decode('utf-8'))
    assert len(user_data_b['customRecipes']) == 0
    assert len(user_data_b['freezerPints']) == 0
    print('VERIFIED: User B account data is 100% isolated from User A')

    # 7. Fetch User A data again and check all persisted fields
    req_a_again = urllib.request.Request('http://localhost:8000/api/auth/google', data=login_data, headers={'Content-Type': 'application/json'})
    res_a_again = urllib.request.urlopen(req_a_again)
    user_a_again = json.loads(res_a_again.read().decode('utf-8'))
    assert len(user_a_again['user']['customRecipes']) == 1, 'Custom recipe was not saved for User A!'
    assert set(user_a_again['user']['pantry']) == set(pantry_a), 'User A pantry was not preserved!'
    assert set(user_a_again['user']['favorites']) == set(favorites_a), 'User A favorites were not preserved!'
    print('VERIFIED: User A pantry, favorites, recipes, and freezer pints persist across logins')

if __name__ == '__main__':
    test()
