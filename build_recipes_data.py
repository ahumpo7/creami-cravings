import sys
import pymupdf
import glob
import os
import re
import csv
import json

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load CSV data
csv_file = "recipe_ingredients.csv"
recipes_dict = {}

with open(csv_file, "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        key = (row["Book"], row["Recipe_Name"], int(row["Page"]))
        if key not in recipes_dict:
            recipes_dict[key] = []
        recipes_dict[key].append(row)

print(f"Loaded {len(recipes_dict)} unique recipes from {csv_file}")

# 2. Build canonical slug IDs for all unique ingredient names
def to_slug(name):
    s = name.lower()
    s = s.replace('&', 'and')
    s = s.replace("'", "")
    s = s.replace('/', '_')
    s = re.sub(r'[^a-z0-9]+', '_', s)
    s = s.strip('_')
    return s

all_ingredient_names = set()
for ings in recipes_dict.values():
    for item in ings:
        all_ingredient_names.add(item["Ingredient_Name"])

sorted_names = sorted(list(all_ingredient_names))
print(f"Total unique ingredient names: {len(sorted_names)}")

# 3. Categorization logic
def categorize_ingredient(name):
    n = name.lower()
    
    # Specific overrides first
    if n in ['cereal milk', 'light butter', 'egg']:
        return 'dairy_liquids'
    if 'pumpkin pie spice' in n:
        return 'spices_seasonings'
    if 'peppermint bark skinny syrups' in n:
        return 'syrups_sauces'
    if any(k in n for k in ['lorann cotton candy flavoring', "lorann's cookie butter emulsion"]):
        return 'extracts_flavors'
    if n in ['matcha']:
        return 'produce_fruit'
    if 'chocolate covered espresso beans' in n:
        return 'mixins_snacks'
        
    # Check mixins_snacks keywords
    if any(k in n for k in [
        'brownie', 'muffin', 'cookie', 'cookies', 'pastry', 'cereal', 'pebbles',
        'chips', 'cup', 'cups', 'candies', 'candy', 'bar', 'bars', 'treat', 'pie', 'crust',
        'wafer', 'wafers', 'graham', 'pretzel', 'pretzels', 'marshmallow', 'marshmallows',
        'sprinkles', 'kataifi', 'oatmeal', 'oats', 'flour', 'almonds', 'pecans', 'walnuts',
        'pistachios', 'toffee', 'rolos', 'm&m', 'heath', 'bites', 'hormbles'
    ]):
        return 'mixins_snacks'
        
    # dairy_liquids
    if any(k in n for k in ['milk', 'protein shake', 'buttermilk', 'creamer', 'yogurt', 'cream cheese', 'mascarpone', 'reddi-wip', 'almond nog', 'eggnog']):
        return 'dairy_liquids'
        
    # sweeteners_binders
    if any(k in n for k in ['sweetener', 'xanthan gum']):
        return 'sweeteners_binders'
        
    # protein_powders
    if any(k in n for k in ['protein powder']):
        return 'protein_powders'
        
    # extracts_flavors
    if any(k in n for k in ['extract', 'emulsion', 'flavoring', 'food coloring', 'vanilla bean paste']):
        return 'extracts_flavors'
        
    # pudding_mixes
    if any(k in n for k in ['pudding mix']):
        return 'pudding_mixes'
        
    # syrups_sauces
    if any(k in n for k in ['syrup', 'sauce', 'ganache']):
        return 'syrups_sauces'
        
    # spices_seasonings
    if any(k in n for k in ['salt', 'cinnamon', 'nutmeg', 'clove', 'cayenne pepper']):
        return 'spices_seasonings'

    # nut_butters_spreads
    if any(k in n for k in ['peanut butter', 'pb fit', 'nutella', 'pistachio butter', 'jam']):
        return 'nut_butters_spreads'

    # produce_fruit & beverages
    if any(k in n for k in [
        'apple', 'banana', 'berries', 'blueberry', 'blueberries', 'strawberry', 'strawberries',
        'raspberry', 'raspberries', 'cherries', 'cherry', 'mango', 'pineapple', 'peaches', 'peach',
        'lemon', 'lime', 'orange', 'watermelon', 'grape', 'pumpkin',
        'coffee', 'espresso', 'tea', 'sprite zero', 'diet dr pepper', 'diet root beer', 'lemonade'
    ]):
        return 'produce_fruit'
        
    if 'cocoa powder' in n:
        return 'mixins_snacks'
        
    return 'mixins_snacks'

ingredients_master = []
for name in sorted_names:
    slug = to_slug(name)
    cat = categorize_ingredient(name)
    ingredients_master.append({
        "id": slug,
        "name": name,
        "category": cat
    })

# 4. Extract PDF recipe details
books_map = {
    "Fan Favorites": "recipe index/fan favorites 8-6.pdf",
    "Keto": "recipe index/Keto 8-6.pdf",
    "Lactose Free": "recipe index/lactose free 8-6.pdf",
    "No Protein": "recipe index/No protein 8-6.pdf"
}

def extract_pdf_page_details(pdf_path, page_num):
    doc = pymupdf.open(pdf_path)
    page = doc[page_num - 1]
    text = page.get_text()
    
    # Macros
    macros = {}
    cal_m = re.search(r'(\d+)\s*CALORIES', text, re.I)
    pro_m = re.search(r'(\d+)G?\s*PROTEIN', text, re.I)
    carb_m = re.search(r'(\d+)G?\s*CARBS', text, re.I)
    fat_m = re.search(r'(\d+)G?\s*FAT', text, re.I)
    sug_m = re.search(r'(\d+)G?\s*SUGAR', text, re.I)
    fib_m = re.search(r'(\d+)G?\s*FIBER', text, re.I)
    
    macros["calories"] = cal_m.group(1) if cal_m else "0"
    macros["protein"] = f"{pro_m.group(1)}g" if pro_m else "0g"
    macros["carbs"] = f"{carb_m.group(1)}g" if carb_m else "0g"
    macros["fat"] = f"{fat_m.group(1)}g" if fat_m else "0g"
    macros["sugar"] = f"{sug_m.group(1)}g" if sug_m else "0g"
    macros["fiber"] = f"{fib_m.group(1)}g" if fib_m else "0g"
    
    # Prep / freeze / makes
    prep_m = re.search(r'PREP TIME:\s*([^\n]+)', text, re.I)
    freeze_m = re.search(r'FREEZE TIME:\s*([^\n]+)', text, re.I)
    makes_m = re.search(r'MAKES\s*([^\n]+)', text, re.I)
    
    prep_time = prep_m.group(1).strip() if prep_m else "2 MIN"
    freeze_time = freeze_m.group(1).strip() if freeze_m else "16+ HOURS"
    makes = makes_m.group(1).strip() if makes_m else "1 PINT"
    
    # Instructions
    instructions = []
    spin_setting = "Lite Ice Cream"
    
    if "INSTRUCTIONS" in text:
        parts = text.split("INSTRUCTIONS")
        inst_part = parts[1]
        for stop in ["MIX-INS", "CREAMI CRAVINGS", "PRO TIP", "FAN FAVORITES", "KETO", "LACTOSE FREE", "PROTEIN POWDER"]:
            if stop in inst_part:
                inst_part = re.split(rf'\n\s*{re.escape(stop)}\s*\n', inst_part, maxsplit=1, flags=re.I)[0]
                
        raw_lines = [l.strip() for l in inst_part.splitlines() if l.strip()]
        curr_step = None
        for l in raw_lines:
            step_m = re.match(r'^(\d+)\.\s*(.*)', l)
            if step_m:
                if curr_step:
                    instructions.append(curr_step)
                curr_step = step_m.group(2).strip()
            else:
                if re.match(r'^\d+$', l) or l in ["CREAMI CRAVINGS", "FAN FAVORITES", "KETO", "LACTOSE FREE"]:
                    continue
                if curr_step is not None:
                    curr_step += " " + l
        if curr_step:
            instructions.append(curr_step)
            
    cleaned_inst = []
    for step in instructions:
        s_clean = step.replace('“', '"').replace('”', '"').replace('’', "'")
        s_clean = re.sub(r'\s+', ' ', s_clean).strip()
        if s_clean:
            cleaned_inst.append(s_clean)
            if "ICE CREAM" in s_clean.upper():
                if "LITE ICE CREAM" in s_clean.upper():
                    spin_setting = "Lite Ice Cream"
                else:
                    spin_setting = "Ice Cream"
            elif "SORBET" in s_clean.upper():
                spin_setting = "Sorbet"

    # Pro Tip extraction
    pro_tip = None
    markers = [m.start() for m in re.finditer(r'\bPRO[\s\-_]*TIPS?\b', text, re.I)]
    if markers:
        idx = markers[-1]
        chunk = text[idx:]
        lines = [l.strip() for l in chunk.splitlines() if l.strip()]
        tip_lines = []
        for l in lines[1:]:
            if l.isdigit() or l in ['CREAMI CRAVINGS', 'FAN FAVORITES', 'KETO', 'LACTOSE FREE', 'NO PROTEIN POWDER NEEDED', 'PROTEIN POWDER']:
                continue
            if l in ['MAKES 1 PINT', 'INSTRUCTIONS', 'INGREDIENTS', 'MIX-INS', 'PREP TIME:', 'FREEZE TIME:']:
                break
            tip_lines.append(l)
        
        if tip_lines:
            tip_text = ' '.join(tip_lines)
            tip_text = tip_text.replace('“', '"').replace('”', '"').replace('’', "'")
            tip_text = re.sub(r'\s+', ' ', tip_text).strip()
            tip_text = re.sub(r'^[:\s\-]+', '', tip_text).strip()
            if tip_text:
                pro_tip = tip_text
                
    return {
        "macros": macros,
        "prepTime": prep_time,
        "freezeTime": freeze_time,
        "makes": makes,
        "instructions": cleaned_inst,
        "spinSetting": spin_setting,
        "proTip": pro_tip
    }

# 5. Build deduplicated RECIPES_MASTER list
BOOK_PRIORITY = {
    "Fan Favorites": 1,
    "Keto": 2,
    "No Protein": 3,
    "Lactose Free": 4
}

def clean_recipe_name(name):
    s = name.strip()
    s = s.replace("\ufffd", "'").replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r'\bReese[^\w\s]?s\b', "Reese's", s, flags=re.I)
    s = re.sub(r'\bS[^\w\s]?mores\b', "S'Mores", s, flags=re.I)
    s = re.sub(r'\bChill[^\w\s]?d\b', "Chill'd", s, flags=re.I)
    s = re.sub(r'\s+', ' ', s)
    return s

def clean_key(name):
    s = clean_recipe_name(name)
    s = s.replace(" - ", " ").replace("-", " ")
    s = re.sub(r'[^a-z0-9]+', '', s.lower())
    return s

# First extract raw copies
raw_recipes = []
for (book, recipe_name, page_num), items in recipes_dict.items():
    pdf_path = books_map[book]
    page_details = extract_pdf_page_details(pdf_path, page_num)
    
    ingredients_list = []
    for item in items:
        clean_name = item["Ingredient_Name"]
        slug_id = to_slug(clean_name)
        is_mixin = (item["Section"].lower() == "mix-in")
        
        ingredients_list.append({
            "id": slug_id,
            "name": clean_name,
            "quantity": item["Quantity"],
            "unit": item["Unit"],
            "raw": item["Ingredient_Raw"],
            "section": item["Section"],
            "isMixin": is_mixin,
            "notes": item["Notes"]
        })
        
    raw_recipes.append({
        "book": book,
        "recipe_name": recipe_name,
        "page_num": page_num,
        "sourceFile": os.path.basename(pdf_path),
        "page_details": page_details,
        "ingredients": ingredients_list
    })

# Group by normalized recipe name
grouped_recipes = {}
for r in raw_recipes:
    k = clean_key(r["recipe_name"])
    if k not in grouped_recipes:
        grouped_recipes[k] = []
    grouped_recipes[k].append(r)

recipes_master = []
for k, copies in sorted(grouped_recipes.items()):
    copies.sort(key=lambda c: (BOOK_PRIORITY.get(c["book"], 99), c["page_num"]))
    primary = copies[0]
    
    clean_name = clean_recipe_name(primary["recipe_name"])
    recipe_slug = to_slug(clean_name)
    
    # Preserve order of categories
    seen_cats = set()
    categories = []
    for c in copies:
        b = c["book"]
        if b not in seen_cats:
            seen_cats.add(b)
            categories.append(b)
            
    sources = []
    for c in copies:
        sources.append({
            "book": c["book"],
            "page": c["page_num"],
            "sourceFile": c["sourceFile"]
        })
        
    # Carry forward author pro tip if present in any edition
    pro_tip = next((c["page_details"].get("proTip") for c in copies if c["page_details"].get("proTip")), None)
    
    # Aliases for backwards compatibility with previously saved favorites / ratings
    aliases = [f"{to_slug(c['book'])}_{to_slug(c['recipe_name'])}_{c['page_num']}" for c in copies]
    if recipe_slug not in aliases:
        aliases.insert(0, recipe_slug)
        
    recipes_master.append({
        "id": recipe_slug,
        "name": clean_name,
        "category": categories[0],
        "categories": categories,
        "sources": sources,
        "sourceFile": primary["sourceFile"],
        "page": primary["page_num"],
        "macros": primary["page_details"]["macros"],
        "spinSetting": primary["page_details"]["spinSetting"],
        "prepTime": primary["page_details"]["prepTime"],
        "freezeTime": primary["page_details"]["freezeTime"],
        "makes": primary["page_details"]["makes"],
        "proTip": pro_tip,
        "ingredients": primary["ingredients"],
        "instructions": primary["page_details"]["instructions"],
        "aliases": aliases
    })

print(f"Constructed {len(recipes_master)} deduplicated recipe objects (merged from {len(raw_recipes)} entries).")

# 6. Write to recipes-data.js
output_js = "recipes-data.js"
with open(output_js, "w", encoding="utf-8") as f:
    f.write("// Creami Cravings Master Database & Pantry Matcher\n\n")
    
    # Categories definition
    f.write("const INGREDIENT_CATEGORIES = {\n")
    f.write('  dairy_liquids: "Milk & Liquid Bases",\n')
    f.write('  sweeteners_binders: "Sweeteners & Binders",\n')
    f.write('  protein_powders: "Protein Powders",\n')
    f.write('  extracts_flavors: "Extracts & Flavorings",\n')
    f.write('  pudding_mixes: "Pudding Mixes",\n')
    f.write('  syrups_sauces: "Syrups & Sauces",\n')
    f.write('  produce_fruit: "Fruits, Produce & Drinks",\n')
    f.write('  spices_seasonings: "Spices & Seasonings",\n')
    f.write('  nut_butters_spreads: "Nut Butters & Spreads",\n')
    f.write('  mixins_snacks: "Mix-Ins, Cookies & Snacks"\n')
    f.write("};\n\n")
    
    # Ingredients Master
    f.write("const INGREDIENTS_MASTER = ")
    f.write(json.dumps(ingredients_master, indent=2, ensure_ascii=False))
    f.write(";\n\n")
    
    # Recipes Master
    f.write("const RECIPES_MASTER = ")
    f.write(json.dumps(recipes_master, indent=2, ensure_ascii=False))
    f.write(";\n")

print(f"Successfully generated {output_js} (Size: {os.path.getsize(output_js)} bytes)")
