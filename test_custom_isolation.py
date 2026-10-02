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

    # 2. Sync personal custom recipe for User A
    custom_recipe = {
        'id': f'custom_{uid_a}_12345',
        'name': 'My Super Secret Protein Gelato',
        'category': 'Custom',
        'isPersonal': True,
        'ingredients': [{'id': 'milk', 'name': 'Milk'}],
        'macros': {'calories': '180', 'protein': '30g', 'carbs': '5g', 'fat': '2g'}
    }
    sync_data = json.dumps({
        'token': token_a,
        'customRecipes': [custom_recipe],
        'ratings': {custom_recipe['id']: {'rating': 5, 'notes': 'Private secret notes'}}
    }).encode('utf-8')
    req_sync = urllib.request.Request('http://localhost:8000/api/user/sync', data=sync_data, headers={'Content-Type': 'application/json'})
    urllib.request.urlopen(req_sync)
    print('User A custom recipe synced successfully')

    # 3. Check community stats to ensure User A custom recipe is NOT in community ratings or stats
    res_comm = urllib.request.urlopen('http://localhost:8000/api/community/stats')
    comm_stats = json.loads(res_comm.read().decode('utf-8'))
    assert custom_recipe['id'] not in comm_stats['ratings'], 'LEAK: Custom recipe found in community ratings!'
    assert custom_recipe['id'] not in comm_stats['madeCounts'], 'LEAK: Custom recipe found in community made counts!'
    print('VERIFIED: Custom recipe is completely isolated from community stats')

    # 4. Check user B login
    login_b = json.dumps({'email': 'testuser_b@gmail.com', 'name': 'User B'}).encode('utf-8')
    req_b = urllib.request.Request('http://localhost:8000/api/auth/google', data=login_b, headers={'Content-Type': 'application/json'})
    res_b = urllib.request.urlopen(req_b)
    user_b = json.loads(res_b.read().decode('utf-8'))
    assert len(user_b['user']['customRecipes']) == 0, 'LEAK: User B received User A custom recipes!'
    print('VERIFIED: User B has 0 custom recipes (User A recipes not available to User B)')

    # 5. Fetch User A data again and check recipe is preserved
    req_a_again = urllib.request.Request('http://localhost:8000/api/auth/google', data=login_data, headers={'Content-Type': 'application/json'})
    res_a_again = urllib.request.urlopen(req_a_again)
    user_a_again = json.loads(res_a_again.read().decode('utf-8'))
    assert len(user_a_again['user']['customRecipes']) == 1, 'Custom recipe was not saved for User A!'
    assert user_a_again['user']['customRecipes'][0]['name'] == 'My Super Secret Protein Gelato'
    print('VERIFIED: User A custom recipe persists across logins')

if __name__ == '__main__':
    test()
