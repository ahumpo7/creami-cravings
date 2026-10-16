import json
import re
import os
import subprocess

with open('extracted_video_links.json', 'r', encoding='utf-8') as f:
    pdf_entries = json.load(f)

by_file_page = {}
by_title = {}

for entry in pdf_entries:
    sf = entry['sourceFile']
    pg = entry['page']
    links = entry['links']
    by_file_page[(sf, pg)] = links[0]
    
    for line in entry['lines']:
        norm = re.sub(r'[^a-z0-9]+', '', line.lower())
        if norm and len(norm) > 3 and not norm.isdigit() and 'scan' not in norm and 'page' not in norm and 'recipe' not in norm:
            if norm not in by_title:
                by_title[norm] = links[0]

# Extract recipes via node script
node_code = """
const fs = require('fs');
const c = fs.readFileSync('recipes-data.js', 'utf8');
const fn = new Function(c + '; return RECIPES_MASTER;');
const list = fn().map(r => ({id: r.id, name: r.name, sourceFile: r.sourceFile, page: r.page, sources: r.sources}));
console.log(JSON.stringify(list));
"""
res = subprocess.run(['node', '-e', node_code], capture_output=True, text=True, check=True)
recipes = json.loads(res.stdout)

matched_map = {}
for r in recipes:
    rid = r['id']
    rname = r['name']
    norm_name = re.sub(r'[^a-z0-9]+', '', rname.lower())
    
    link = None
    # 1. sourceFile & page
    if (r.get('sourceFile'), r.get('page')) in by_file_page:
        link = by_file_page[(r['sourceFile'], r['page'])]
    elif r.get('sources'):
        for s in r['sources']:
            if (s.get('sourceFile'), s.get('page')) in by_file_page:
                link = by_file_page[(s['sourceFile'], s['page'])]
                break
    
    # 2. Title match
    if not link and norm_name in by_title:
        link = by_title[norm_name]
        
    # 3. Soft Title match (contains)
    if not link:
        for t_key, t_url in by_title.items():
            if len(norm_name) >= 6 and (norm_name in t_key or t_key in norm_name):
                link = t_url
                break
    
    if link:
        matched_map[rid] = {
            'id': rid,
            'name': rname,
            'videoUrl': link
        }

print(f"Successfully matched {len(matched_map)} of {len(recipes)} recipes!")

unmatched = [r for r in recipes if r['id'] not in matched_map]
print(f"Unmatched count: {len(unmatched)}")
for u in unmatched:
    print(f"  {u['id']} | {u['name']} | {u['sourceFile']}")

with open('matched_recipe_videos.json', 'w', encoding='utf-8') as f:
    json.dump(matched_map, f, indent=2)

print("Saved matched video URLs to matched_recipe_videos.json")
