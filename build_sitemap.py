import json
import re
import urllib.parse
import os

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
recipes_path = os.path.join(DIRECTORY, 'recipes-data.js')

with open(recipes_path, 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'const RECIPES_MASTER\s*=\s*(\[[\s\S]*?\]);', content)
recipes = json.loads(m.group(1)) if m else []

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

for r in recipes:
    rid = r.get('id')
    if rid:
        r_url = f"https://creamicravings.com/recipe/{urllib.parse.quote(rid)}"
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{r_url}</loc>')
        xml_lines.append('    <changefreq>weekly</changefreq>')
        xml_lines.append('    <priority>0.8</priority>')
        xml_lines.append('  </url>')

xml_lines.append('</urlset>')

sitemap_path = os.path.join(DIRECTORY, 'sitemap.xml')
with open(sitemap_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(xml_lines) + '\n')

print(f"Generated {sitemap_path} successfully with {len(recipes)} recipes.")
