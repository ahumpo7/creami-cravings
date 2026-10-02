import sys
import pymupdf
import glob
import os
import re
import csv

sys.stdout.reconfigure(encoding='utf-8')

# Regex to detect lines that start a new ingredient
QTY_START_RE = re.compile(
    r'^('
    r'(\(?OPTIONAL\)?\s*[-–:]?\s*)?'
    r'('
    r'\d+(\.\d+)?(-(\d+(\.\d+)?))?\s*(G|ML|OZ|TSP|TBSP|CUPS?|CANS?|SCOOPS?|SERVINGS?|DROPS?|PIECES?|SHOTS?|PACKAGES?|SLICES?|SHEETS?|MINI|CONTAINERS?|BOTTLES?|POUCHES?|BARS?|SPRINKLES?)\b'
    r'|\d+\s*[\u00bc-\u00be\u2150-\u215e]'
    r'|[\u00bc-\u00be\u2150-\u215e]'
    r'|~\s*\d+'
    r'|\d+\s+OF\b'
    r'|\d+\s+[A-Z]'
    r'|A\s+(PINCH|DASH|SPLASH|FEW|HANDFUL|DRIZZLE|DROP|SCOOP|HEAPING|SERVING)\b'
    r'|PINCH\s+OF\b'
    r'|DASH\s+OF\b'
    r'|SPLASH\s+OF\b'
    r'|SPRITE\s+ZERO\b'
    r'|ALL\s+OF\s+THE\b'
    r'|THE\s+(ZEST|JUICE)\b'
    r'|ZEST\s+OF\b'
    r'|JUICE\s+OF\b'
    r'|\*USE\b'
    r'|USE\s+WHATEVER\b'
    r'|FLAKY\s+SALT\b'
    r')'
    r')',
    re.IGNORECASE
)

# Regex to detect lines that are definitely continuation of previous line
CONTINUATION_RE = re.compile(
    r'^('
    r'\(CODE\b'
    r'|\(OPTIONAL\)$'
    r'|\(CAN\b'
    r'|\(I\b'
    r'|\(APPROX'
    r'|\(IDEALLY\b'
    r'|\(MIX\b'
    r'|\(DOUBLE\b'
    r'|\(OR\b'
    r'|\(YES\b'
    r'|\(SAME\b'
    r'|CAL\)'
    r'|PRO\)'
    r'|END\)'
    r'|WORTH\)'
    r'|WORTH\b'
    r'|SAVES\s+YOU\b'
    r'|MIXED\s+WITH\b'
    r'|WITH\b'
    r'|INCLUDING\b'
    r'|AND\b'
    r'|OR\b'
    r'|MACERATED\s+IN\b'
    r'|DOUGH\s+BITES\b'
    r'|BITES\b'
    r'|BROWNIE\b'
    r'|PASTRY\b'
    r'|EXTRACT\)'
    r'|EMULSION\)'
    r'|JET\s+PUFFED\)'
    r'|MARSHMALLOWS\b'
    r'|CHOPPED\b'
    r'|PIECES\b'
    r'|TOTAL\s+OF\s+MILK\)'
    r'|CRUSHED\b'
    r'|CANDIES\b'
    r'|PEACHES\b'
    r'|SPRINKLES\b'
    r'|GANACHE\b'
    r'|FLUFF\)'
    r'|OF\s+BUTTER\b'
    r')',
    re.IGNORECASE
)

MACROS_RE = re.compile(r'^\d+\s*CAL\b.*\b\d+G\s*[CPF]\b', re.IGNORECASE)
SECTION_HEADER_RE = re.compile(r'^FOR\s+THE\s+[^:]+:\s*$', re.IGNORECASE)

EXCLUDE_WORDS = [
    "INGREDIENTS", "MIX-INS", "MIX-IN", "INSTRUCTIONS", "FAN FAVORITES",
    "KETO", "LACTOSE FREE", "NO PROTEIN", "CREAMI CRAVINGS", "RECIPES",
    "HOW TO USE THIS BOOK", "EQUIPMENT", "INGREDIENT GUIDE", "TIPS & TRICKS", "AFFILIATE LINKS"
]

def clean_ingredient_name(raw_text):
    text = raw_text.strip()
    
    # Check if optional prefix
    is_optional = False
    opt_match = re.match(r'^\(?OPTIONAL\)?\s*[-–:]?\s*', text, re.I)
    if opt_match:
        is_optional = True
        text = text[opt_match.end():].strip()
        
    quantity = ""
    unit = ""
    notes = []
    
    if is_optional:
        notes.append("Optional")
        
    # Special: Sprinkles note
    if re.search(r'USE WHATEVER KIND OF PINK AND PURPLE SPRINKLES', text, re.I):
        return {
            "quantity": "",
            "unit": "",
            "name": "Pink & Purple Sprinkles",
            "notes": "Use whatever pink and purple sprinkles or candy you can find; not included in macros"
        }
        
    # Special: Cereal milk
    if re.match(r'^ALL OF THE CEREAL MILK', text, re.I):
        return {
            "quantity": "All",
            "unit": "",
            "name": "Cereal Milk",
            "notes": "Prepared cereal milk (~250-300g)"
        }
        
    # Special: Lemon zest & juice
    if re.match(r'^THE ZEST AND JUICE OF', text, re.I):
        return {
            "quantity": "¼-½",
            "unit": "lemon",
            "name": "Lemon Zest & Juice",
            "notes": ""
        }
        
    # Special: Lime zest
    if re.match(r'^THE ZEST OF', text, re.I):
        return {
            "quantity": "2",
            "unit": "limes",
            "name": "Lime Zest",
            "notes": ""
        }

    # Special: Lime juice
    if re.match(r'^THE JUICE OF', text, re.I):
        return {
            "quantity": "2",
            "unit": "limes",
            "name": "Lime Juice",
            "notes": "Should be ~75g"
        }
        
    # Special: Sprite Zero
    if re.match(r'^SPRITE ZERO UNTIL THE FILL LINE', text, re.I):
        return {
            "quantity": "To fill line",
            "unit": "",
            "name": "Sprite Zero",
            "notes": "Until the fill line"
        }

    # Special: Heaping tablespoon of ...
    heap_match = re.match(r'^(A\s+|\d+\s+)?HEAPING\s+(TABLESPOON|TBSP)\s+(OF\s+)?', text, re.I)
    if heap_match:
        qty_val = heap_match.group(1).strip() if heap_match.group(1) else "1"
        quantity = "1" if qty_val.upper() in ["A", ""] else qty_val
        unit = "heaping tbsp"
        remainder = text[heap_match.end():].strip()
    else:
        # Special: A few sprinkles of ...
        sprink_match = re.match(r'^(A\s+)?(FEW\s+SPRINKLES|SPRINKLES)\s+(OF\s+)?', text, re.I)
        if sprink_match:
            quantity = "A few"
            unit = "sprinkles"
            remainder = text[sprink_match.end():].strip()
        else:
            # Check patterns like "A PINCH OF SALT", "PINCH OF SALT"
            pinch_match = re.match(r'^(A\s+)?(PINCH|DASH|SPLASH|FEW|HANDFUL|DRIZZLE|DROP|SCOOP|SERVING)\s+(OF\s+)?', text, re.I)
            if pinch_match:
                prefix = "A " if pinch_match.group(1) else ""
                word = pinch_match.group(2).lower()
                quantity = f"{prefix}{word}".capitalize()
                unit = word
                remainder = text[pinch_match.end():].strip()
            else:
                # Check standard quantity with unit: e.g. 400G, 40-45G, 2.5G, 1 CUP, etc.
                qty_match = re.match(
                    r'^(~?\s*\d+(\.\d+)?(-(\d+(\.\d+)?))?|[\u00bc-\u00be\u2150-\u215e]|\d+\s+[\u00bc-\u00be\u2150-\u215e])'
                    r'(\s*(G|ML|OZ|TSP|TBSP|CUPS?|CANS?|SCOOPS?|SERVINGS?|DROPS?|PIECES?|SHOTS?|PACKAGES?|SLICES?|SHEETS?|MINI|CONTAINERS?|BOTTLES?|POUCHES?|BARS?|SPRINKLES?|MEDIUM|SMALL|LARGE))\b\s*(OF\s+A|OF\s+AN|OF\s+THE|OF\s+YOUR|OF)?\s*',
                    text, re.I
                )
                if qty_match:
                    quantity = qty_match.group(1).replace(" ", "").strip()
                    unit = qty_match.group(6).lower().strip()
                    remainder = text[qty_match.end():].strip()
                else:
                    # Number without unit directly attached: e.g. "1 VANILLA PROTEIN SHAKE", "½ OF A PRIME BITES"
                    num_match = re.match(
                        r'^(~?\s*\d+(\.\d+)?(-(\d+(\.\d+)?))?|[\u00bc-\u00be\u2150-\u215e]|\d+\s+[\u00bc-\u00be\u2150-\u215e])'
                        r'(\s+(OF\s+A|OF\s+AN|OF\s+THE|OF\s+YOUR|OF))?\s+',
                        text, re.I
                    )
                    if num_match:
                        quantity = num_match.group(1).replace(" ", "").strip()
                        remainder = text[num_match.end():].strip()
                    else:
                        remainder = text

    # Strip phrases like "YOUR FAVORITE " or "FAVORITE " at start of remainder
    remainder = re.sub(r'^(YOUR\s+)?FAVORITE\s+', '', remainder, flags=re.I).strip()
    
    # Extract parenthetical notes from remainder
    parens = re.findall(r'\(([^)]+)\)', remainder)
    clean_name = re.sub(r'\s*\([^)]*\)', '', remainder).strip()
    
    for p in parens:
        p_clean = p.strip()
        if re.search(r'\b(tsp|tbsp|cup|oz|g|ml)\b', p_clean, re.I):
            notes.append(f"Alt measurement: {p_clean}")
        else:
            notes.append(p_clean)
            
    # Handle specific coconut oil additions: e.g. "MIXED WITH 2G OF COCONUT OIL", "+ 2G COCONUT OIL"
    c_match = re.search(r'(\+|\bmixed with)\s+(\d+(\.\d+)?g\s+(of\s+)?coconut oil.*)$', clean_name, re.I)
    if c_match:
        notes.append(c_match.group(0).strip(" +"))
        clean_name = clean_name[:c_match.start()].strip()

    # Handle additions like "+ A PINCH OF SALT"
    s_match = re.search(r'\+\s*(a\s+pinch\s+of\s+salt.*)$', clean_name, re.I)
    if s_match:
        notes.append(s_match.group(1).strip())
        clean_name = clean_name[:s_match.start()].strip()

    # Handle additions like "+ 1.5G COCONUT OIL" or "+ 2G COCONUT OIL"
    oil_match = re.search(r'\+\s*(\d+(\.\d+)?g\s+(of\s+)?coconut oil.*)$', clean_name, re.I)
    if oil_match:
        notes.append(oil_match.group(0).strip(" +"))
        clean_name = clean_name[:oil_match.start()].strip()
        
    # Handle "CHOPPED AND COATED IN ..." or "COATED IN ..."
    coat_match = re.search(r'[,–-]?\s*(\b(chopped\s+and\s+)?coated in\b.*)$', clean_name, re.I)
    if coat_match:
        notes.append(coat_match.group(1).strip())
        clean_name = clean_name[:coat_match.start()].strip()

    # Handle "MACERATED IN ..."
    mac_match = re.search(r'[,–-]?\s*(\bmacerated in\b.*)$', clean_name, re.I)
    if mac_match:
        notes.append(mac_match.group(1).strip())
        clean_name = clean_name[:mac_match.start()].strip()
        
    # Handle "FRIED IN ..."
    fry_match = re.search(r'[,–-]?\s*(\bfried in\b.*)$', clean_name, re.I)
    if fry_match:
        notes.append(fry_match.group(1).strip())
        clean_name = clean_name[:fry_match.start()].strip()

    # Handle "CHOPPED INTO BITE SIZE CUBES", "CHOPPED INTO SMALL PIECES", "CHOPPED", "CRUMBLED", "CREAM REMOVED", "CRUSHED UP", "CRUSHED"
    prep_match = re.search(r'[,–-]?\s*\b(chopped(\s+into\s+[^,]+)?|crumbled|cream removed|crushed\s+up|crushed)\b\s*$', clean_name, re.I)
    if prep_match:
        prep_text = prep_match.group(0).strip(" ,–-")
        if prep_text:
            notes.append(prep_text.capitalize())
        clean_name = clean_name[:prep_match.start()].strip()

    # Handle "OREOS? OR 3 OREO THINS"
    if re.match(r'^OREOS?\s+OR\s+3\s+OREO\s+THINS\b', clean_name, re.I):
        clean_name = "Oreo"
        notes.append("Or 3 Oreo Thins")
        
    # Handle "OR ABOUT ½ OF A MEDIUM BANANA", "OR ½ MEDIUM SIZE BANANA", "SIZE BANANA"
    if re.search(r'\b(medium\s+)?(size\s+)?banana\b', clean_name, re.I):
        if re.search(r'\bor\b', clean_name, re.I):
            notes.append(clean_name)
        clean_name = "Banana"
        unit = "medium" if unit in ["medium", ""] and quantity in ["1", "½", "¼"] else unit

    # Handle "A GRAHAM CRACKER" -> "Graham Cracker"
    if clean_name.upper() == "A GRAHAM CRACKER":
        clean_name = "Graham Cracker"

    # Handle "PACKAGE OF THE FUUL..." / "THE FUUL..."
    clean_name = re.sub(r'^(PACKAGE\s+OF\s+)?THE\s+FUUL\b', 'Fuul', clean_name, flags=re.I)
    
    # Handle "CRUSHED UP PRETZELS" -> "Pretzels"
    if re.match(r'^CRUSHED(\s+UP)?\s+PRETZELS\b', clean_name, re.I):
        notes.append("Crushed")
        clean_name = "Pretzels"
    elif re.match(r'^CRUSHED\s+GRAHAM\s+CRACKER\b', clean_name, re.I):
        notes.append("Crushed")
        clean_name = "Graham Cracker"
    elif re.match(r'^CHOPPED\s+PEANUT\s+BUTTER\s+CUPS\b', clean_name, re.I):
        notes.append("Chopped")
        clean_name = "Peanut Butter Cups"
    elif re.match(r'^CHOPPED\s+(PECANS|WALNUTS)\b', clean_name, re.I):
        notes.append("Chopped")
        clean_name = clean_name.split()[-1].title()

    # Handle "FROZEN/FRESH STRAWBERRIES" -> "Strawberries"
    if re.match(r'^FROZEN/FRESH\s+STRAWBERRIES\b', clean_name, re.I):
        clean_name = "Strawberries"
        notes.append("Fresh or frozen")

    # Handle "YOUR FAVORITE CHOCOLATE CANDY BARS" -> "Chocolate Candy Bars"
    if re.search(r'CHOCOLATE CANDY BARS\b', clean_name, re.I):
        clean_name = "Chocolate Candy Bars"

    # Handle "CINNAMON PEBBLES" -> "Cinnamon Pebbles Cereal"
    if clean_name.upper() == "CINNAMON PEBBLES":
        clean_name = "Cinnamon Pebbles Cereal"

    # Handle "PEANUT BUTTER CUP" -> "Peanut Butter Cups"
    if clean_name.upper() == "PEANUT BUTTER CUP":
        clean_name = "Peanut Butter Cups"

    # Handle "BROWN SUGAR ZERO-CALORIE SWEETENER" -> "Brown Sugar Sweetener"
    if re.search(r'BROWN SUGAR ZERO-CALORIE SWEETENER', clean_name, re.I):
        clean_name = "Brown Sugar Sweetener"
        
    # Handle "SWEETENER, OPTIONAL BUT RECOMMENDED"
    if re.search(r'^SWEETENER,\s*OPTIONAL\s+BUT\s+RECOMMENDED', clean_name, re.I):
        clean_name = "Sweetener"
        notes.append("Optional but recommended")

    # Normalize Prime Bites names
    if re.search(r'RED VELVET.*PRIME BITES', clean_name, re.I):
        clean_name = "Prime Bites Red Velvet Brownie"
    elif re.search(r'PRIME BITES.*BLONDIE', clean_name, re.I):
        clean_name = "Prime Bites Blondie-Style Brownie"

    # Fix typos and standard brand names
    clean_name = re.sub(r'\bPPEANUT\b', 'Peanut', clean_name, flags=re.I)
    clean_name = re.sub(r'\bREDDIWHIP\b', 'Reddi-wip', clean_name, flags=re.I)
    clean_name = re.sub(r'\bREDDIWIP\b', 'Reddi-wip', clean_name, flags=re.I)
    
    # Strip trailing punctuation, conjunctions, dangling parens
    clean_name = re.sub(r'\s+,', ',', clean_name)
    clean_name = re.sub(r'[,;–-]\s*$', '', clean_name).strip()
    clean_name = re.sub(r'\b(and|or|with)\s*$', '', clean_name, flags=re.I).strip()
    clean_name = clean_name.strip(" )(")
    
    # Title Case
    clean_name = clean_name.title()
    clean_name = re.sub(r'\bPb\b', 'PB', clean_name, flags=re.I)
    clean_name = re.sub(r'\bOreos?\b', 'Oreo', clean_name, flags=re.I)
    clean_name = re.sub(r'\bReese[’\']S\b', "Reese's", clean_name, flags=re.I)
    clean_name = re.sub(r'\bHershey[’\']S\b', "Hershey's", clean_name, flags=re.I)
    clean_name = re.sub(r'\bBen And Jerry[’\']S\b', "Ben & Jerry's", clean_name, flags=re.I)
    clean_name = re.sub(r'\bM&M[’\']?S\b', "M&M's", clean_name, flags=re.I)
    clean_name = re.sub(r'\bLorann[’\']?S\b', "LorAnn's", clean_name, flags=re.I)
    clean_name = re.sub(r'\bLorann\b', "LorAnn", clean_name, flags=re.I)
    clean_name = re.sub(r'\bMccormick\b', "McCormick", clean_name, flags=re.I)
    clean_name = clean_name.replace("Roasted, Salted Pistachios", "Roasted Salted Pistachios")
    
    notes_str = "; ".join(n.strip() for n in notes if n.strip())
    
    return {
        "quantity": quantity,
        "unit": unit,
        "name": clean_name,
        "notes": notes_str
    }

def process_all_books(input_dir, output_csv):
    pdf_files = sorted(glob.glob(os.path.join(input_dir, '*.pdf')))
    
    all_rows = []
    recipe_count = 0
    book_stats = {}
    
    for pdf_path in pdf_files:
        doc = pymupdf.open(pdf_path)
        filename = os.path.basename(pdf_path)
        book_title = filename.replace(' 8-6.pdf', '').replace('.pdf', '').title()
        book_recipes = 0
        book_ingredients = 0
        
        for p in range(len(doc)):
            page = doc[p]
            text = page.get_text()
            if not ("INGREDIENTS" in text.upper() and ("INSTRUCTIONS" in text.upper() or "MAKES 1 PINT" in text.upper())):
                continue
                
            book_recipes += 1
            recipe_count += 1
            data = page.get_text("dict")
            
            # Find title
            title_candidates = []
            ing_y = None
            mixin_y = None
            
            for b in data["blocks"]:
                if b.get("type") == 0:
                    for l in b["lines"]:
                        lt = "".join(s["text"] for s in l["spans"]).strip()
                        if not lt:
                            continue
                        fs = l["spans"][0]["size"]
                        if fs > 20 and lt.upper() not in EXCLUDE_WORDS:
                            title_candidates.append((fs, l["bbox"][1], lt))
                        if lt.upper() == "INGREDIENTS":
                            ing_y = l["bbox"][1]
                        elif lt.upper() in ["MIX-INS", "MIX-IN"]:
                            mixin_y = l["bbox"][1]
                            
            title_candidates.sort(key=lambda x: (-x[0], x[1]))
            recipe_title = title_candidates[0][2].split("\n")[0].strip().title() if title_candidates else "Unknown"
            
            if not ing_y:
                continue
                
            # Collect ingredient column lines
            raw_lines = []
            for b in data["blocks"]:
                if b.get("type") == 0:
                    for l in b["lines"]:
                        lt = "".join(s["text"] for s in l["spans"]).strip()
                        if not lt or lt.upper() in ["INGREDIENTS", "MIX-INS", "MIX-IN", "CREAMI CRAVINGS"]:
                            continue
                        bbox = l["bbox"]
                        fs = l["spans"][0]["size"]
                        # Ingredients column check: left margin in [50, 120], y > ing_y, top y < 755, font size 7.5 to 9.5
                        if 50 <= bbox[0] <= 120 and bbox[1] > ing_y and bbox[1] < 755 and 7.5 <= fs <= 9.5:
                            # Filter macros block like "205 CAL 15G C, 1G F, 38G P"
                            if MACROS_RE.match(lt):
                                continue
                            sec = "Base"
                            if mixin_y and bbox[1] > mixin_y:
                                sec = "Mix-in"
                            raw_lines.append((bbox[1], sec, lt))
                            
            raw_lines.sort(key=lambda x: x[0])
            
            # Combine lines
            grouped = []
            current_ing = None
            current_sec = None
            
            for y, sec, lt in raw_lines:
                # Skip sub-section headers like "FOR THE BASE:"
                if SECTION_HEADER_RE.match(lt):
                    continue
                    
                if current_ing is None:
                    current_ing = lt
                    current_sec = sec
                    continue
                    
                if sec != current_sec:
                    grouped.append((current_sec, current_ing))
                    current_ing = lt
                    current_sec = sec
                    continue
                    
                has_unmatched_paren = current_ing.count('(') > current_ing.count(')')
                prev_ends_dash = current_ing.endswith('-')
                prev_ends_comma = current_ing.endswith(',')
                prev_ends_conn = bool(re.search(r'\b(with|of|in|for|and|or|sub)\s*$', current_ing, re.I))
                is_cont = CONTINUATION_RE.search(lt) is not None
                starts_qty = QTY_START_RE.match(lt) is not None
                
                should_continue = False
                if has_unmatched_paren or prev_ends_dash or prev_ends_comma or prev_ends_conn or is_cont:
                    should_continue = True
                elif not starts_qty:
                    should_continue = True
                    
                if should_continue:
                    if prev_ends_dash:
                        current_ing = current_ing + lt
                    else:
                        current_ing = current_ing + " " + lt
                else:
                    grouped.append((current_sec, current_ing))
                    current_ing = lt
                    current_sec = sec
                    
            if current_ing:
                grouped.append((current_sec, current_ing))
                
            for sec, raw_ing in grouped:
                clean_raw = re.sub(r'\s+', ' ', raw_ing).strip()
                if not clean_raw or SECTION_HEADER_RE.match(clean_raw) or MACROS_RE.match(clean_raw):
                    continue
                    
                parsed = clean_ingredient_name(clean_raw)
                all_rows.append({
                    "Book": book_title,
                    "Recipe_Name": recipe_title,
                    "Page": p + 1,
                    "Section": sec,
                    "Ingredient_Raw": clean_raw,
                    "Quantity": parsed["quantity"],
                    "Unit": parsed["unit"],
                    "Ingredient_Name": parsed["name"],
                    "Notes": parsed["notes"]
                })
                book_ingredients += 1
                
        book_stats[book_title] = {
            "recipes": book_recipes,
            "ingredients": book_ingredients
        }
        
    fieldnames = [
        "Book",
        "Recipe_Name",
        "Page",
        "Section",
        "Ingredient_Raw",
        "Quantity",
        "Unit",
        "Ingredient_Name",
        "Notes"
    ]
    
    with open(output_csv, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)
        
    return all_rows, book_stats

if __name__ == "__main__":
    input_folder = "recipe index"
    output_file = "recipe_ingredients.csv"
    rows, stats = process_all_books(input_folder, output_file)
    print("=== EXTRACTION COMPLETE ===")
    print(f"Total Rows Generated: {len(rows)}")
    for b, s in stats.items():
        print(f"  {b}: {s['recipes']} recipes, {s['ingredients']} ingredients")
    print(f"Output saved to: {os.path.abspath(output_file)}")
