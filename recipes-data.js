// Creami Cravings Master Database & Pantry Matcher

const INGREDIENT_CATEGORIES = {
  dairy_liquids: "Milk & Liquid Bases",
  protein_powders: "Protein Powders & Shakes",
  pudding_mixes: "Pudding Mixes",
  sweeteners_binders: "Sweeteners & Binders",
  baking_powders: "Cocoa & Baking Staples",
  extracts_flavors: "Extracts & Flavorings",
  syrups_sauces: "Syrups & Sauces",
  nut_butters_spreads: "Nut Butters & Spreads",
  produce_fruit: "Fruits & Fresh Produce",
  beverages_drinks: "Coffee, Tea & Beverages",
  spices_seasonings: "Spices & Seasonings",
  mixins_snacks: "Mix-Ins, Cookies & Candies"
};

const INGREDIENTS_MASTER = [
  {
    "id": "almond_nog",
    "name": "Almond Nog",
    "category": "dairy_liquids"
  },
  {
    "id": "almonds",
    "name": "Almonds",
    "category": "mixins_snacks"
  },
  {
    "id": "apple",
    "name": "Apple",
    "category": "produce_fruit"
  },
  {
    "id": "banana",
    "name": "Banana",
    "category": "produce_fruit"
  },
  {
    "id": "black_cocoa_powder",
    "name": "Black Cocoa Powder",
    "category": "baking_powders"
  },
  {
    "id": "blue_food_coloring",
    "name": "Blue Food Coloring",
    "category": "extracts_flavors"
  },
  {
    "id": "brown_sugar_sweetener",
    "name": "Brown Sugar Sweetener",
    "category": "sweeteners_binders"
  },
  {
    "id": "butter_extract",
    "name": "Butter Extract",
    "category": "extracts_flavors"
  },
  {
    "id": "cake_batter_extract",
    "name": "Cake Batter Extract",
    "category": "extracts_flavors"
  },
  {
    "id": "candied_pecans",
    "name": "Candied Pecans",
    "category": "mixins_snacks"
  },
  {
    "id": "canned_pumpkin",
    "name": "Canned Pumpkin",
    "category": "produce_fruit"
  },
  {
    "id": "caramel_protein_shake",
    "name": "Caramel Protein Shake",
    "category": "protein_powders"
  },
  {
    "id": "caramel_syrup",
    "name": "Caramel Syrup",
    "category": "syrups_sauces"
  },
  {
    "id": "cayenne_pepper",
    "name": "Cayenne Pepper",
    "category": "spices_seasonings"
  },
  {
    "id": "cereal_milk",
    "name": "Cereal Milk",
    "category": "dairy_liquids"
  },
  {
    "id": "cheesecake_bites",
    "name": "Cheesecake Bites",
    "category": "mixins_snacks"
  },
  {
    "id": "cheesecake_jello_pudding_mix",
    "name": "Cheesecake Jello Pudding Mix",
    "category": "pudding_mixes"
  },
  {
    "id": "cherries",
    "name": "Cherries",
    "category": "produce_fruit"
  },
  {
    "id": "chocolate_candy_bars",
    "name": "Chocolate Candy Bars",
    "category": "mixins_snacks"
  },
  {
    "id": "chocolate_chip_cookie",
    "name": "Chocolate Chip Cookie",
    "category": "mixins_snacks"
  },
  {
    "id": "chocolate_chips",
    "name": "Chocolate Chips",
    "category": "mixins_snacks"
  },
  {
    "id": "chocolate_covered_almonds",
    "name": "Chocolate Covered Almonds",
    "category": "mixins_snacks"
  },
  {
    "id": "chocolate_covered_espresso_beans",
    "name": "Chocolate Covered Espresso Beans",
    "category": "mixins_snacks"
  },
  {
    "id": "chocolate_covered_pretzels",
    "name": "Chocolate Covered Pretzels",
    "category": "mixins_snacks"
  },
  {
    "id": "chocolate_covered_toffee",
    "name": "Chocolate Covered Toffee",
    "category": "mixins_snacks"
  },
  {
    "id": "chocolate_jello_pudding_mix",
    "name": "Chocolate Jello Pudding Mix",
    "category": "pudding_mixes"
  },
  {
    "id": "chocolate_protein_shake",
    "name": "Chocolate Protein Shake",
    "category": "protein_powders"
  },
  {
    "id": "chocolate_filled_waffle_cone_bites",
    "name": "Chocolate-Filled Waffle Cone Bites",
    "category": "mixins_snacks"
  },
  {
    "id": "christmas_themed_sprinkles",
    "name": "Christmas-Themed Sprinkles",
    "category": "mixins_snacks"
  },
  {
    "id": "cinnamon",
    "name": "Cinnamon",
    "category": "spices_seasonings"
  },
  {
    "id": "cinnamon_pebbles_cereal",
    "name": "Cinnamon Pebbles Cereal",
    "category": "mixins_snacks"
  },
  {
    "id": "cocoa_powder",
    "name": "Cocoa Powder",
    "category": "baking_powders"
  },
  {
    "id": "coconut_extract",
    "name": "Coconut Extract",
    "category": "extracts_flavors"
  },
  {
    "id": "coffee_creamer",
    "name": "Coffee Creamer",
    "category": "dairy_liquids"
  },
  {
    "id": "dark_chocolate_chips",
    "name": "Dark Chocolate Chips",
    "category": "mixins_snacks"
  },
  {
    "id": "diet_dr_pepper",
    "name": "Diet Dr Pepper",
    "category": "beverages_drinks"
  },
  {
    "id": "diet_root_beer",
    "name": "Diet Root Beer",
    "category": "beverages_drinks"
  },
  {
    "id": "egg",
    "name": "Egg",
    "category": "dairy_liquids"
  },
  {
    "id": "espresso",
    "name": "Espresso",
    "category": "beverages_drinks"
  },
  {
    "id": "fat_free_reddi_wip",
    "name": "Fat Free Reddi-Wip",
    "category": "dairy_liquids"
  },
  {
    "id": "fat_free_ultra_filtered_milk",
    "name": "Fat Free Ultra-Filtered Milk",
    "category": "dairy_liquids"
  },
  {
    "id": "flaky_salt",
    "name": "Flaky Salt",
    "category": "spices_seasonings"
  },
  {
    "id": "flour",
    "name": "Flour",
    "category": "baking_powders"
  },
  {
    "id": "frosted_animal_cookies",
    "name": "Frosted Animal Cookies",
    "category": "mixins_snacks"
  },
  {
    "id": "frozen_berries_of_choice",
    "name": "Frozen Berries Of Choice",
    "category": "produce_fruit"
  },
  {
    "id": "frozen_blueberries",
    "name": "Frozen Blueberries",
    "category": "produce_fruit"
  },
  {
    "id": "frozen_raspberries",
    "name": "Frozen Raspberries",
    "category": "produce_fruit"
  },
  {
    "id": "fruit_of_your_choice",
    "name": "Fruit Of Your Choice",
    "category": "mixins_snacks"
  },
  {
    "id": "fruity_pebbles",
    "name": "Fruity Pebbles",
    "category": "mixins_snacks"
  },
  {
    "id": "fuul_birthday_cake_cookie_dough_bites",
    "name": "Fuul Birthday Cake Cookie Dough Bites",
    "category": "mixins_snacks"
  },
  {
    "id": "fuul_chocolate_chip_cookie_dough_bites",
    "name": "Fuul Chocolate Chip Cookie Dough Bites",
    "category": "mixins_snacks"
  },
  {
    "id": "graham_cracker",
    "name": "Graham Cracker",
    "category": "mixins_snacks"
  },
  {
    "id": "green_food_coloring",
    "name": "Green Food Coloring",
    "category": "extracts_flavors"
  },
  {
    "id": "green_grapes",
    "name": "Green Grapes",
    "category": "produce_fruit"
  },
  {
    "id": "ground_cinnamon",
    "name": "Ground Cinnamon",
    "category": "spices_seasonings"
  },
  {
    "id": "ground_clove",
    "name": "Ground Clove",
    "category": "spices_seasonings"
  },
  {
    "id": "hazelnut_syrup",
    "name": "Hazelnut Syrup",
    "category": "syrups_sauces"
  },
  {
    "id": "heath_bar",
    "name": "Heath Bar",
    "category": "mixins_snacks"
  },
  {
    "id": "high_protein_vanilla_yogurt",
    "name": "High Protein Vanilla Yogurt",
    "category": "dairy_liquids"
  },
  {
    "id": "highkey_vanilla_wafers",
    "name": "Highkey Vanilla Wafers",
    "category": "mixins_snacks"
  },
  {
    "id": "hormbles_chormbles",
    "name": "Hormbles Chormbles",
    "category": "mixins_snacks"
  },
  {
    "id": "hormbles_chormbles_chocolate_bar",
    "name": "Hormbles Chormbles Chocolate Bar",
    "category": "mixins_snacks"
  },
  {
    "id": "instant_coffee",
    "name": "Instant Coffee",
    "category": "beverages_drinks"
  },
  {
    "id": "lactose_free_caramel_protein_shake",
    "name": "Lactose-Free Caramel Protein Shake",
    "category": "protein_powders"
  },
  {
    "id": "lactose_free_chocolate_protein_shake",
    "name": "Lactose-Free Chocolate Protein Shake",
    "category": "protein_powders"
  },
  {
    "id": "lactose_free_coffee_creamer",
    "name": "Lactose-Free Coffee Creamer",
    "category": "dairy_liquids"
  },
  {
    "id": "lactose_free_strawberry_protein_shake",
    "name": "Lactose-Free Strawberry Protein Shake",
    "category": "protein_powders"
  },
  {
    "id": "lactose_free_vanilla_protein_shake",
    "name": "Lactose-Free Vanilla Protein Shake",
    "category": "protein_powders"
  },
  {
    "id": "lakanto_chocolate_sauce",
    "name": "Lakanto Chocolate Sauce",
    "category": "syrups_sauces"
  },
  {
    "id": "legendary_foods_brown_sugar_cinnamon_pastry",
    "name": "Legendary Foods Brown Sugar Cinnamon Pastry",
    "category": "mixins_snacks"
  },
  {
    "id": "legendary_foods_chocolate_cake_protein_pastry",
    "name": "Legendary Foods Chocolate Cake Protein Pastry",
    "category": "mixins_snacks"
  },
  {
    "id": "lemon_juice",
    "name": "Lemon Juice",
    "category": "produce_fruit"
  },
  {
    "id": "lemon_zest_and_juice",
    "name": "Lemon Zest & Juice",
    "category": "produce_fruit"
  },
  {
    "id": "light_butter",
    "name": "Light Butter",
    "category": "dairy_liquids"
  },
  {
    "id": "lime_juice",
    "name": "Lime Juice",
    "category": "produce_fruit"
  },
  {
    "id": "lime_zest",
    "name": "Lime Zest",
    "category": "produce_fruit"
  },
  {
    "id": "loose_chai_tea",
    "name": "Loose Chai Tea",
    "category": "beverages_drinks"
  },
  {
    "id": "lorann_cotton_candy_flavoring",
    "name": "LorAnn Cotton Candy Flavoring",
    "category": "extracts_flavors"
  },
  {
    "id": "loranns_cookie_butter_emulsion",
    "name": "LorAnn's Cookie Butter Emulsion",
    "category": "extracts_flavors"
  },
  {
    "id": "lotus_biscoff_cookies",
    "name": "Lotus Biscoff Cookies",
    "category": "mixins_snacks"
  },
  {
    "id": "low_calorie_chocolate_ganache",
    "name": "Low Calorie Chocolate Ganache",
    "category": "syrups_sauces"
  },
  {
    "id": "low_fat_buttermilk",
    "name": "Low Fat Buttermilk",
    "category": "dairy_liquids"
  },
  {
    "id": "mandms",
    "name": "M&M's",
    "category": "mixins_snacks"
  },
  {
    "id": "made_good_cinnamon_bun_baked_oat_bar",
    "name": "Made Good Cinnamon Bun Baked Oat Bar",
    "category": "mixins_snacks"
  },
  {
    "id": "malted_milk_powder",
    "name": "Malted Milk Powder",
    "category": "baking_powders"
  },
  {
    "id": "mango",
    "name": "Mango",
    "category": "produce_fruit"
  },
  {
    "id": "marshmallow_creme",
    "name": "Marshmallow Creme",
    "category": "nut_butters_spreads"
  },
  {
    "id": "marshmallow_fluff",
    "name": "Marshmallow Fluff",
    "category": "nut_butters_spreads"
  },
  {
    "id": "mascarpone",
    "name": "Mascarpone",
    "category": "dairy_liquids"
  },
  {
    "id": "matcha",
    "name": "Matcha",
    "category": "beverages_drinks"
  },
  {
    "id": "mccormick_cake_batter_extract",
    "name": "McCormick Cake Batter Extract",
    "category": "extracts_flavors"
  },
  {
    "id": "mini_lucky_charms_style_marshmallows",
    "name": "Mini Lucky-Charms-Style Marshmallows",
    "category": "mixins_snacks"
  },
  {
    "id": "mini_marshmallows",
    "name": "Mini Marshmallows",
    "category": "mixins_snacks"
  },
  {
    "id": "mini_reeses_pb_cups",
    "name": "Mini Reese's PB Cups",
    "category": "mixins_snacks"
  },
  {
    "id": "nilla_wafers",
    "name": "Nilla Wafers",
    "category": "mixins_snacks"
  },
  {
    "id": "nonfat_greek_yogurt",
    "name": "Nonfat Greek Yogurt",
    "category": "dairy_liquids"
  },
  {
    "id": "nutella",
    "name": "Nutella",
    "category": "nut_butters_spreads"
  },
  {
    "id": "nutmeg",
    "name": "Nutmeg",
    "category": "spices_seasonings"
  },
  {
    "id": "nuts_of_choice",
    "name": "Nuts Of Choice",
    "category": "mixins_snacks"
  },
  {
    "id": "oatmeal_cream_pie",
    "name": "Oatmeal Cream Pie",
    "category": "mixins_snacks"
  },
  {
    "id": "oats",
    "name": "Oats",
    "category": "baking_powders"
  },
  {
    "id": "oranges_or_orange_juice",
    "name": "Oranges Or Orange Juice",
    "category": "produce_fruit"
  },
  {
    "id": "oreo",
    "name": "Oreo",
    "category": "mixins_snacks"
  },
  {
    "id": "oreo_thins",
    "name": "Oreo Thins",
    "category": "mixins_snacks"
  },
  {
    "id": "pb_fit",
    "name": "PB Fit",
    "category": "protein_powders"
  },
  {
    "id": "peaches",
    "name": "Peaches",
    "category": "produce_fruit"
  },
  {
    "id": "peanut_butter",
    "name": "Peanut Butter",
    "category": "nut_butters_spreads"
  },
  {
    "id": "peanut_butter_chips",
    "name": "Peanut Butter Chips",
    "category": "mixins_snacks"
  },
  {
    "id": "peanut_butter_cups",
    "name": "Peanut Butter Cups",
    "category": "mixins_snacks"
  },
  {
    "id": "peanut_butter_powder",
    "name": "Peanut Butter Powder",
    "category": "protein_powders"
  },
  {
    "id": "pecan_pralines",
    "name": "Pecan Pralines",
    "category": "mixins_snacks"
  },
  {
    "id": "pecans",
    "name": "Pecans",
    "category": "mixins_snacks"
  },
  {
    "id": "peppermint_bark_chocolate_square_or_peppermint_candies",
    "name": "Peppermint Bark Chocolate Square Or Peppermint Candies",
    "category": "mixins_snacks"
  },
  {
    "id": "peppermint_bark_skinny_syrups",
    "name": "Peppermint Bark Skinny Syrups",
    "category": "syrups_sauces"
  },
  {
    "id": "peppermint_extract",
    "name": "Peppermint Extract",
    "category": "extracts_flavors"
  },
  {
    "id": "pie_crust",
    "name": "Pie Crust",
    "category": "mixins_snacks"
  },
  {
    "id": "pineapple",
    "name": "Pineapple",
    "category": "produce_fruit"
  },
  {
    "id": "pink_and_purple_sprinkles",
    "name": "Pink & Purple Sprinkles",
    "category": "mixins_snacks"
  },
  {
    "id": "pistachio_butter",
    "name": "Pistachio Butter",
    "category": "nut_butters_spreads"
  },
  {
    "id": "pretzels",
    "name": "Pretzels",
    "category": "mixins_snacks"
  },
  {
    "id": "prime_bites_blondie_style_brownie",
    "name": "Prime Bites Blondie-Style Brownie",
    "category": "mixins_snacks"
  },
  {
    "id": "prime_bites_chocolate_chip_mini_muffins",
    "name": "Prime Bites Chocolate Chip Mini Muffins",
    "category": "mixins_snacks"
  },
  {
    "id": "prime_bites_chocolate_fudge_mini_muffins",
    "name": "Prime Bites Chocolate Fudge Mini Muffins",
    "category": "mixins_snacks"
  },
  {
    "id": "prime_bites_glazed_cinnamon_roll_protein_brownie",
    "name": "Prime Bites Glazed Cinnamon Roll Protein Brownie",
    "category": "mixins_snacks"
  },
  {
    "id": "prime_bites_protein_brownie",
    "name": "Prime Bites Protein Brownie",
    "category": "mixins_snacks"
  },
  {
    "id": "prime_bites_pumpkin_spice_brownie",
    "name": "Prime Bites Pumpkin Spice Brownie",
    "category": "mixins_snacks"
  },
  {
    "id": "prime_bites_red_velvet_brownie",
    "name": "Prime Bites Red Velvet Brownie",
    "category": "mixins_snacks"
  },
  {
    "id": "protein_frosting",
    "name": "Protein Frosting",
    "category": "nut_butters_spreads"
  },
  {
    "id": "pumpkin_cream_cheese",
    "name": "Pumpkin Cream Cheese",
    "category": "dairy_liquids"
  },
  {
    "id": "pumpkin_pie_spice",
    "name": "Pumpkin Pie Spice",
    "category": "spices_seasonings"
  },
  {
    "id": "pure_pumpkin",
    "name": "Pure Pumpkin",
    "category": "produce_fruit"
  },
  {
    "id": "quest_peanut_butter_candies",
    "name": "Quest Peanut Butter Candies",
    "category": "mixins_snacks"
  },
  {
    "id": "rainbow_candy_coated_chocolate_chips",
    "name": "Rainbow Candy Coated Chocolate Chips",
    "category": "mixins_snacks"
  },
  {
    "id": "rainbow_sprinkles",
    "name": "Rainbow Sprinkles",
    "category": "mixins_snacks"
  },
  {
    "id": "raspberries",
    "name": "Raspberries",
    "category": "produce_fruit"
  },
  {
    "id": "red_velvet_extract",
    "name": "Red Velvet Extract",
    "category": "extracts_flavors"
  },
  {
    "id": "reeses_pb_cups",
    "name": "Reese's PB Cups",
    "category": "mixins_snacks"
  },
  {
    "id": "rice_krispy_treat",
    "name": "Rice Krispy Treat",
    "category": "mixins_snacks"
  },
  {
    "id": "roasted_salted_pistachios",
    "name": "Roasted Salted Pistachios",
    "category": "mixins_snacks"
  },
  {
    "id": "rolos",
    "name": "Rolos",
    "category": "mixins_snacks"
  },
  {
    "id": "salt",
    "name": "Salt",
    "category": "spices_seasonings"
  },
  {
    "id": "salted_almonds",
    "name": "Salted Almonds",
    "category": "mixins_snacks"
  },
  {
    "id": "salted_caramel_sauce",
    "name": "Salted Caramel Sauce",
    "category": "syrups_sauces"
  },
  {
    "id": "salted_caramel_syrup",
    "name": "Salted Caramel Syrup",
    "category": "syrups_sauces"
  },
  {
    "id": "salted_fudge_hormbles_chormbles",
    "name": "Salted Fudge Hormbles Chormbles",
    "category": "mixins_snacks"
  },
  {
    "id": "shredded_kataifi",
    "name": "Shredded Kataifi",
    "category": "mixins_snacks"
  },
  {
    "id": "sprite_zero",
    "name": "Sprite Zero",
    "category": "beverages_drinks"
  },
  {
    "id": "strawberries",
    "name": "Strawberries",
    "category": "produce_fruit"
  },
  {
    "id": "strawberry_jam",
    "name": "Strawberry Jam",
    "category": "nut_butters_spreads"
  },
  {
    "id": "strawberry_protein_shake",
    "name": "Strawberry Protein Shake",
    "category": "protein_powders"
  },
  {
    "id": "sugar_free_syrup",
    "name": "Sugar Free Syrup",
    "category": "syrups_sauces"
  },
  {
    "id": "sugar_free_chocolate_chips",
    "name": "Sugar-Free Chocolate Chips",
    "category": "mixins_snacks"
  },
  {
    "id": "sugar_free_dark_chocolate_chips",
    "name": "Sugar-Free Dark Chocolate Chips",
    "category": "mixins_snacks"
  },
  {
    "id": "sugar_free_pistachio_syrup",
    "name": "Sugar-Free Pistachio Syrup",
    "category": "syrups_sauces"
  },
  {
    "id": "sweetened_condensed_milk",
    "name": "Sweetened Condensed Milk",
    "category": "dairy_liquids"
  },
  {
    "id": "sweetener",
    "name": "Sweetener",
    "category": "sweeteners_binders"
  },
  {
    "id": "teddy_grahams",
    "name": "Teddy Grahams",
    "category": "mixins_snacks"
  },
  {
    "id": "thai_tea",
    "name": "Thai Tea",
    "category": "beverages_drinks"
  },
  {
    "id": "toasted_mini_marshmallows",
    "name": "Toasted Mini Marshmallows",
    "category": "mixins_snacks"
  },
  {
    "id": "unsweetened_coconut_milk",
    "name": "Unsweetened Coconut Milk",
    "category": "dairy_liquids"
  },
  {
    "id": "vanilla_bean_paste",
    "name": "Vanilla Bean Paste",
    "category": "extracts_flavors"
  },
  {
    "id": "vanilla_extract",
    "name": "Vanilla Extract",
    "category": "extracts_flavors"
  },
  {
    "id": "vanilla_extract_or_vanilla_bean_paste",
    "name": "Vanilla Extract Or Vanilla Bean Paste",
    "category": "extracts_flavors"
  },
  {
    "id": "vanilla_protein_powder",
    "name": "Vanilla Protein Powder",
    "category": "protein_powders"
  },
  {
    "id": "vanilla_protein_shake",
    "name": "Vanilla Protein Shake",
    "category": "protein_powders"
  },
  {
    "id": "vanilla_pudding_mix",
    "name": "Vanilla Pudding Mix",
    "category": "pudding_mixes"
  },
  {
    "id": "walnuts",
    "name": "Walnuts",
    "category": "mixins_snacks"
  },
  {
    "id": "watermelon",
    "name": "Watermelon",
    "category": "produce_fruit"
  },
  {
    "id": "whipped_cream_cheese",
    "name": "Whipped Cream Cheese",
    "category": "dairy_liquids"
  },
  {
    "id": "white_chocolate_chips",
    "name": "White Chocolate Chips",
    "category": "mixins_snacks"
  },
  {
    "id": "xanthan_gum",
    "name": "Xanthan Gum",
    "category": "sweeteners_binders"
  },
  {
    "id": "zero_sugar_lemonade",
    "name": "Zero Sugar Lemonade",
    "category": "beverages_drinks"
  }
  ,
{
      "id": "acai_puree",
      "name": "A\u00e7ai Puree",
      "category": "produce_fruit"
  }  ,
{
      "id": "apple_cider",
      "name": "Apple Cider",
      "category": "beverages_drinks"
  }  ,
{
      "id": "chamoy",
      "name": "Chamoy Sauce",
      "category": "syrups_sauces"
  }  ,
{
      "id": "chocolate_pudding_mix",
      "name": "Sugar-Free Chocolate Pudding Mix",
      "category": "pudding_mixes"
  }  ,
{
      "id": "cinnamon_toast_crunch",
      "name": "Cinnamon Toast Crunch",
      "category": "mixins_snacks"
  }  ,
{
      "id": "coconut_water",
      "name": "Coconut Water",
      "category": "beverages_drinks"
  }  ,
{
      "id": "donut_holes",
      "name": "Cider Donut Pieces",
      "category": "mixins_snacks"
  }  ,
{
      "id": "earl_grey_tea",
      "name": "Earl Grey Tea Bags",
      "category": "beverages_drinks"
  }  ,
{
      "id": "golden_oreos",
      "name": "Golden Oreos",
      "category": "mixins_snacks"
  }  ,
{
      "id": "hazelnuts",
      "name": "Roasted Hazelnuts",
      "category": "mixins_snacks"
  }  ,
{
      "id": "lavender",
      "name": "Culinary Lavender",
      "category": "extracts_flavors"
  }  ,
{
      "id": "shortbread_cookies",
      "name": "Shortbread Cookies",
      "category": "mixins_snacks"
  }  ,
{
      "id": "strawberry_gelatin",
      "name": "Sugar-Free Strawberry Gelatin Powder",
      "category": "pudding_mixes"
  }  ,
{
      "id": "tajin",
      "name": "Taj\u00edn Cl\u00e1sico Seasoning",
      "category": "spices_seasonings"
  }  ,
{
      "id": "wafer_cookies",
      "name": "Crispy Wafer Cookies",
      "category": "mixins_snacks"
  },
  {
      "id": "almond_milk",
      "name": "Unsweetened Almond Milk",
      "category": "dairy_liquids"
  },
  {
      "id": "blueberries",
      "name": "Fresh Blueberries",
      "category": "produce_fruit"
  },
  {
      "id": "chocolate_protein_powder",
      "name": "Chocolate Protein Powder",
      "category": "protein_powders"
  },
  {
      "id": "granola",
      "name": "Granola",
      "category": "mixins_snacks"
  },
  {
      "id": "light_cream_cheese",
      "name": "Light Cream Cheese",
      "category": "dairy_liquids"
  },
  {
      "id": "mini_chocolate_chips",
      "name": "Mini Semi-Sweet Chocolate Chips",
      "category": "mixins_snacks"
  },
  {
      "id": "oat_milk",
      "name": "Barista Oat Milk",
      "category": "dairy_liquids"
  },
  {
      "id": "shredded_coconut",
      "name": "Shredded Coconut",
      "category": "mixins_snacks"
  }
];

const RECIPES_MASTER = [
  {
    "id": "almond_joy",
    "name": "Almond Joy",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 12,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 12,
    "macros": {
      "calories": "268",
      "protein": "25g",
      "carbs": "12g",
      "fat": "12g",
      "sugar": "10g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "coconut_extract",
        "name": "Coconut Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) COCONUT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "almonds",
        "name": "Almonds",
        "quantity": "10",
        "unit": "g",
        "raw": "10G ALMONDS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "sugar_free_chocolate_chips",
        "name": "Sugar-Free Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G SUGAR-FREE CHOCOLATE CHIPS (60 CAL) MIXED WITH 2G OF COCONUT OIL (27 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "60 CAL; 27 CAL; MIXED WITH 2G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE ALMONDS AND MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "almond_joy",
      "no_protein_almond_joy_12"
    ]
  },
  {
    "id": "americone_dream",
    "name": "Americone Dream",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 14,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 14,
    "macros": {
      "calories": "300",
      "protein": "32g",
      "carbs": "27g",
      "fat": "7g",
      "sugar": "18g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_filled_waffle_cone_bites",
        "name": "Chocolate-Filled Waffle Cone Bites",
        "quantity": "1",
        "unit": "serving",
        "raw": "1 SERVING (6 MINI CONES) CHOCOLATE-FILLED WAFFLE CONE BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "6 MINI CONES"
      },
      {
        "id": "caramel_syrup",
        "name": "Caramel Syrup",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE CRUMBLED UP WAFFLE CONE BITES",
      "DRIZZLE WITH CARAMEL SYRUP"
    ],
    "aliases": [
      "americone_dream",
      "fan_favorites_americone_dream_14"
    ]
  },
  {
    "id": "apple_pie",
    "name": "Apple Pie",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 14,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 13,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 14,
    "macros": {
      "calories": "220",
      "protein": "22g",
      "carbs": "27g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "5g"
    },
    "spinSetting": "Ice Cream",
    "prepTime": "12 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "2",
        "unit": "g",
        "raw": "2G (½ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "apple",
        "name": "Apple",
        "quantity": "1",
        "unit": "medium",
        "raw": "1 MEDIUM APPLE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "sugar_free_syrup",
        "name": "Sugar Free Syrup",
        "quantity": "5-10",
        "unit": "g",
        "raw": "5-10G SUGAR FREE SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "A few",
        "unit": "sprinkles",
        "raw": "A FEW SPRINKLES OF CINNAMON",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 24 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF NECESSARY",
      "FOR THE APPLE PIE FILLING: CHOP THE APPLE INTO ½ INCH CUBES PLACE IN A BOWL AND TOP WITH THE SWEETENER, SYRUP, CINNAMON, AND SALT SIMMER ON THE STOVE (OR MICROWAVE IN 30 SECOND INCREMENTS) UNTIL THE APPLES BECOME SOFT (TAKES ABOUT 10 MIN ON THE STOVE, 2 MIN IN THE MICROWAVE) REFRIGERATE FOR AT LEAST 1 HOUR BEFORE USING AS A MIX-IN (IT WILL MELT THE ICE CREAM IF YOU SKIP THIS STEP!!)",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH PIE FILLING",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "apple_pie",
      "no_protein_apple_pie_14",
      "lactose_free_apple_pie_13"
    ]
  },
  {
    "id": "baked_alaska",
    "name": "Baked Alaska",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 16,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 16,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 16,
    "macros": {
      "calories": "263",
      "protein": "23g",
      "carbs": "29g",
      "fat": "4g",
      "sugar": "26g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE WHITE CHOCOLATE SWIRL HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF WHITE CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY WHITE CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "10",
        "unit": "g",
        "raw": "10G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      },
      {
        "id": "white_chocolate_chips",
        "name": "White Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G WHITE CHOCOLATE CHIPS MIXED WITH 2G OF COCONUT OIL",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "MIXED WITH 2G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED WHITE CHOCOLATE AND ¾ OF YOUR MARSHMALLOWS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE REST OF THE MARSHMALLOWS"
    ],
    "aliases": [
      "baked_alaska",
      "fan_favorites_baked_alaska_16",
      "no_protein_baked_alaska_16"
    ]
  },
  {
    "id": "banana",
    "name": "Banana",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 18,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 15,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 18,
    "macros": {
      "calories": "221",
      "protein": "22g",
      "carbs": "33g",
      "fat": "0g",
      "sugar": "22g",
      "fiber": "3g"
    },
    "spinSetting": "Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "1",
        "unit": "small",
        "raw": "1 SMALL BANANA (~100G)",
        "section": "Base",
        "isMixin": false,
        "notes": "~100G"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 22G SUGAR 3G FIBER"
    ],
    "aliases": [
      "banana",
      "no_protein_banana_18",
      "lactose_free_banana_15"
    ]
  },
  {
    "id": "banana_bread_matcha",
    "name": "Banana Bread Matcha",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 20,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 17,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 20,
    "macros": {
      "calories": "232",
      "protein": "23g",
      "carbs": "31g",
      "fat": "0g",
      "sugar": "22g",
      "fiber": "4g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "1",
        "unit": "small",
        "raw": "1 SMALL BANANA (~100G)",
        "section": "Base",
        "isMixin": false,
        "notes": "~100G"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "matcha",
        "name": "Matcha",
        "quantity": "4",
        "unit": "g",
        "raw": "4G (2 TSP) MATCHA",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TSP"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "nutmeg",
        "name": "Nutmeg",
        "quantity": "A dash",
        "unit": "dash",
        "raw": "A DASH OF NUTMEG",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY"
    ],
    "aliases": [
      "banana_bread_matcha",
      "no_protein_banana_bread_matcha_20",
      "lactose_free_banana_bread_matcha_17"
    ]
  },
  {
    "id": "banana_pudding",
    "name": "Banana Pudding",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 22,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 22,
    "macros": {
      "calories": "276",
      "protein": "23g",
      "carbs": "39g",
      "fat": "2g",
      "sugar": "21g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "30",
        "unit": "g",
        "raw": "30G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "50",
        "unit": "g",
        "raw": "50G OR ½ MEDIUM SIZE BANANA",
        "section": "Base",
        "isMixin": false,
        "notes": "OR ½ MEDIUM SIZE BANANA"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "10",
        "unit": "g",
        "raw": "10G (1 TBSP) BANANA CREAM JELLO PUDDING MIX",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TBSP"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "fat_free_reddi_wip",
        "name": "Fat Free Reddi-Wip",
        "quantity": "18",
        "unit": "g",
        "raw": "18G (6 TBSP) FAT FREE REDDIWHIP (CAN SUB WITH ANY WHIPPED CREAM)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 6 TBSP; CAN SUB WITH ANY WHIPPED CREAM"
      },
      {
        "id": "nilla_wafers",
        "name": "Nilla Wafers",
        "quantity": "2",
        "unit": "",
        "raw": "2 NILLA WAFERS, CRUMBLED (CAN SUB WITH GRAHAM CRACKERS OR SHORTBREAD)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CAN SUB WITH GRAHAM CRACKERS OR SHORTBREAD; Crumbled"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING (IF NECESSARY)",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH WHIPPED CREAM AND NILLA WAFER CRUMBLES"
    ],
    "aliases": [
      "banana_pudding",
      "no_protein_banana_pudding_22"
    ]
  },
  {
    "id": "berry_crumble",
    "name": "Berry Crumble",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 24,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 24,
    "macros": {
      "calories": "273",
      "protein": "25g",
      "carbs": "31g",
      "fat": "4g",
      "sugar": "16g",
      "fiber": "3g"
    },
    "spinSetting": "Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "frozen_berries_of_choice",
        "name": "Frozen Berries Of Choice",
        "quantity": "70",
        "unit": "g",
        "raw": "70G FROZEN BERRIES OF CHOICE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "light_butter",
        "name": "Light Butter",
        "quantity": "10",
        "unit": "g",
        "raw": "10G LIGHT BUTTER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "brown_sugar_sweetener",
        "name": "Brown Sugar Sweetener",
        "quantity": "10",
        "unit": "g",
        "raw": "10G BROWN SUGAR ZERO-CALORIE SWEETENER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "flour",
        "name": "Flour",
        "quantity": "10",
        "unit": "g",
        "raw": "10G FLOUR",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "oats",
        "name": "Oats",
        "quantity": "10",
        "unit": "g",
        "raw": "10G OATS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "FOR THE CRUMBLE: MELT THE BUTTER COMBINE THE REST OF THE INGREDIENTS IN A SEPARATE BOWL SLOWLY POUR THE BUTTER INTO THE DRY INGREDIENTS UNTIL THE CRUMBLES FORM",
      "TOP THE ICE CREAM WITH THE CRUMBLE"
    ],
    "aliases": [
      "berry_crumble",
      "no_protein_berry_crumble_24"
    ]
  },
  {
    "id": "birthday_cake",
    "name": "Birthday Cake",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 26,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 19,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 26,
    "macros": {
      "calories": "175",
      "protein": "22g",
      "carbs": "16g",
      "fat": "2g",
      "sugar": "14g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cake_batter_extract",
        "name": "Cake Batter Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) CAKE BATTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "rainbow_sprinkles",
        "name": "Rainbow Sprinkles",
        "quantity": "2",
        "unit": "tsp",
        "raw": "2 TSP RAINBOW SPRINKLES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH SPRINKLES AND MIX IN BY HAND (THEY WILL GET CRUSHED UP TOO SMALL IF YOU USE THE \"MIX-IN\" SETTING)"
    ],
    "aliases": [
      "birthday_cake",
      "no_protein_birthday_cake_26",
      "lactose_free_birthday_cake_19"
    ]
  },
  {
    "id": "biscoff_cookie_butter",
    "name": "Biscoff (Cookie Butter)",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 28,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 21,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 28,
    "macros": {
      "calories": "255",
      "protein": "24g",
      "carbs": "29g",
      "fat": "5g",
      "sugar": "19g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "loranns_cookie_butter_emulsion",
        "name": "LorAnn's Cookie Butter Emulsion",
        "quantity": "1",
        "unit": "tsp",
        "raw": "1 TSP LORANN’S COOKIE BUTTER EMULSION (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "3",
        "unit": "g",
        "raw": "3G (½ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "lotus_biscoff_cookies",
        "name": "Lotus Biscoff Cookies",
        "quantity": "3",
        "unit": "",
        "raw": "3 LOTUS BISCOFF COOKIES (CRUMBLED UP)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CRUMBLED UP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH COOKIES AND MIX IN BY HAND (THEY WILL GET CRUSHED UP TOO SMALL IF YOU USE THE \"MIX-IN\" SETTING)"
    ],
    "aliases": [
      "biscoff_cookie_butter",
      "no_protein_biscoff_cookie_butter_28",
      "lactose_free_biscoff_cookie_butter_21"
    ]
  },
  {
    "id": "blueberry_pie",
    "name": "Blueberry Pie",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 12,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 23,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 12,
    "macros": {
      "calories": "211",
      "protein": "31g",
      "carbs": "12g",
      "fat": "4g",
      "sugar": "8g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "frozen_blueberries",
        "name": "Frozen Blueberries",
        "quantity": "50",
        "unit": "g",
        "raw": "50G FROZEN BLUEBERRIES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "nilla_wafers",
        "name": "Nilla Wafers",
        "quantity": "2",
        "unit": "",
        "raw": "2 NILLA WAFERS, CRUMBLED (CAN SUB WITH GRAHAM CRACKERS OR SHORTBREAD)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CAN SUB WITH GRAHAM CRACKERS OR SHORTBREAD; Crumbled"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE BLUEBERRIES",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CRUMBLED UP NILLA WAFERS"
    ],
    "aliases": [
      "blueberry_pie",
      "keto_blueberry_pie_12",
      "lactose_free_blueberry_pie_23"
    ]
  },
  {
    "id": "brown_butter_banana_bread",
    "name": "Brown Butter Banana Bread",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 30,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 30,
    "macros": {
      "calories": "351",
      "protein": "33g",
      "carbs": "35g",
      "fat": "8g",
      "sugar": "28g",
      "fiber": "4g"
    },
    "spinSetting": "Ice Cream",
    "prepTime": "4 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "1",
        "unit": "medium",
        "raw": "1 MEDIUM SIZE BANANA (~90G)",
        "section": "Base",
        "isMixin": false,
        "notes": "~90G"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_chocolate_chip_mini_muffins",
        "name": "Prime Bites Chocolate Chip Mini Muffins",
        "quantity": "2",
        "unit": "",
        "raw": "2 PRIME BITES (CODE FPF SAVES YOU 15%) CHOCOLATE CHIP MINI MUFFINS FRIED IN 2G OF BUTTER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CODE FPF SAVES YOU 15%; FRIED IN 2G OF BUTTER"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "BROWN 2G OF BUTTER IN A SMALL PAN OVER MEDIUM HEAT FOR 30–60 SECONDS, UNTIL GOLDEN AND NUTTY",
      "CUT THE MINI MUFFINS IN HALF AND FRY IN THE BROWNED BUTTER FOR 2–3 MINUTES UNTIL EDGES ARE CRISP, THEN SET ASIDE TO COOL",
      "ONCE ICE CREAM IS FULLY SPUN, SCOOP INTO A BOWL AND TOP WITH THE FRIED MUFFIN HALVES",
      "(OPTIONAL) DRIZZLE ANY REMAINING BROWNED BUTTER OVER THE TOP FOR EXTRA FLAVOR"
    ],
    "aliases": [
      "brown_butter_banana_bread",
      "no_protein_brown_butter_banana_bread_30"
    ]
  },
  {
    "id": "brownie_batter",
    "name": "Brownie Batter",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 14,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 25,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 14,
    "macros": {
      "calories": "193",
      "protein": "36g",
      "carbs": "9g",
      "fat": "5g",
      "sugar": "2g",
      "fiber": "7g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "black_cocoa_powder",
        "name": "Black Cocoa Powder",
        "quantity": "20",
        "unit": "g",
        "raw": "20G BLACK COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 2G SUGAR 7G FIBER"
    ],
    "aliases": [
      "brownie_batter",
      "keto_brownie_batter_14",
      "lactose_free_brownie_batter_25"
    ]
  },
  {
    "id": "brownie_batter_blizzard",
    "name": "Brownie Batter Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 18,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 16,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 18,
    "macros": {
      "calories": "304",
      "protein": "44g",
      "carbs": "11g",
      "fat": "10g",
      "sugar": "5g",
      "fiber": "9g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "black_cocoa_powder",
        "name": "Black Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G BLACK COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES PROTEIN BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE CHOPPED UP BROWNIE"
    ],
    "aliases": [
      "brownie_batter_blizzard",
      "fan_favorites_brownie_batter_blizzard_18",
      "keto_brownie_batter_blizzard_16"
    ]
  },
  {
    "id": "brown_sugar_cinnamon_pop_tart",
    "name": "Brown Sugar Cinnamon Pop Tart",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 32,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 32,
    "macros": {
      "calories": "320",
      "protein": "42g",
      "carbs": "15g",
      "fat": "9g",
      "sugar": "10g",
      "fiber": "10g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "brown_sugar_sweetener",
        "name": "Brown Sugar Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G BROWN SUGAR SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "3",
        "unit": "g",
        "raw": "3G (½ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "legendary_foods_brown_sugar_cinnamon_pastry",
        "name": "Legendary Foods Brown Sugar Cinnamon Pastry",
        "quantity": "1",
        "unit": "",
        "raw": "1 LEGENDARY FOODS BROWN SUGAR CINNAMON PASTRY",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE PASTRY",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "brown_sugar_cinnamon_pop_tart",
      "no_protein_brown_sugar_cinnamon_pop_tart_32"
    ]
  },
  {
    "id": "cake_batter",
    "name": "Cake Batter",
    "category": "Keto",
    "categories": [
      "Keto",
      "No Protein",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 18,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 34,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 18,
    "macros": {
      "calories": "150",
      "protein": "30g",
      "carbs": "2g",
      "fat": "3g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "mccormick_cake_batter_extract",
        "name": "McCormick Cake Batter Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) MCCORMICK CAKE BATTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING (OR CREAMIFIT IF YOU HAVE THE SWIRL)",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "(OPTIONAL) TOP WITH RAINBOW SPRINKLES 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "cake_batter",
      "keto_cake_batter_18",
      "no_protein_cake_batter_34"
    ]
  },
  {
    "id": "cake_batter_cookie_dough_blizzard",
    "name": "Cake Batter Cookie Dough Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 20,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 36,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 20,
    "macros": {
      "calories": "293",
      "protein": "29g",
      "carbs": "33g",
      "fat": "5g",
      "sugar": "16g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cake_batter_extract",
        "name": "Cake Batter Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) CAKE BATTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "blue_food_coloring",
        "name": "Blue Food Coloring",
        "quantity": "1-2",
        "unit": "drops",
        "raw": "1-2 DROPS BLUE FOOD COLORING (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PACKAGE OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "rainbow_sprinkles",
        "name": "Rainbow Sprinkles",
        "quantity": "5",
        "unit": "g",
        "raw": "5G RAINBOW SPRINKLES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE COOKIE DOUGH BITES AND SPRINKLES, AND MIX IN BY HAND"
    ],
    "aliases": [
      "cake_batter_cookie_dough_blizzard",
      "fan_favorites_cake_batter_cookie_dough_blizzard_20",
      "no_protein_cake_batter_cookie_dough_blizzard_36"
    ]
  },
  {
    "id": "cake_batter_milk",
    "name": "Cake Batter (Milk)",
    "category": "Lactose Free",
    "categories": [
      "Lactose Free",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Lactose Free",
        "page": 27,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "lactose free 8-6.pdf",
    "page": 27,
    "macros": {
      "calories": "135",
      "protein": "22g",
      "carbs": "10g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "cake_batter_extract",
        "name": "Cake Batter Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) CAKE BATTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 10G SUGAR 0G FIBER"
    ],
    "aliases": [
      "cake_batter_milk",
      "lactose_free_cake_batter_milk_27"
    ]
  },
  {
    "id": "cake_batter_oreo",
    "name": "Cake Batter Oreo",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 38,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 31,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 38,
    "macros": {
      "calories": "213",
      "protein": "22g",
      "carbs": "25g",
      "fat": "2g",
      "sugar": "16g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cake_batter_extract",
        "name": "Cake Batter Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) CAKE BATTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "5",
        "unit": "",
        "raw": "5 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "cake_batter_oreo",
      "no_protein_cake_batter_oreo_38",
      "lactose_free_cake_batter_oreo_31"
    ]
  },
  {
    "id": "cake_batter_protein_shake",
    "name": "Cake Batter (Protein Shake)",
    "category": "Lactose Free",
    "categories": [
      "Lactose Free",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Lactose Free",
        "page": 29,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "lactose free 8-6.pdf",
    "page": 29,
    "macros": {
      "calories": "150",
      "protein": "30g",
      "carbs": "2g",
      "fat": "3g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "lactose_free_vanilla_protein_shake",
        "name": "Lactose-Free Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 LACTOSE-FREE VANILLA PROTEIN SHAKE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "cake_batter_extract",
        "name": "Cake Batter Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) CAKE BATTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "cake_batter_protein_shake",
      "lactose_free_cake_batter_protein_shake_29"
    ]
  },
  {
    "id": "candy_bar",
    "name": "Candy Bar",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 40,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 40,
    "macros": {
      "calories": "337",
      "protein": "24g",
      "carbs": "34g",
      "fat": "11g",
      "sugar": "30g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_candy_bars",
        "name": "Chocolate Candy Bars",
        "quantity": "40",
        "unit": "g",
        "raw": "40G OF YOUR FAVORITE CHOCOLATE CANDY BARS, CHOPPED (MACROS ACCOUNT FOR EQUAL AMOUNTS OF HERSHEY’S BARS, REESE’S, ALMOND JOY, AND KIT KAT)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "MACROS ACCOUNT FOR EQUAL AMOUNTS OF HERSHEY’S BARS, REESE’S, ALMOND JOY, AND KIT KAT; Chopped"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING (IF NECESSARY)",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE CHOPPED CANDY BARS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "candy_bar",
      "no_protein_candy_bar_40"
    ]
  },
  {
    "id": "caramel_apple",
    "name": "Caramel Apple",
    "category": "Lactose Free",
    "categories": [
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Lactose Free",
        "page": 33,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "lactose free 8-6.pdf",
    "page": 33,
    "macros": {
      "calories": "277",
      "protein": "31g",
      "carbs": "25g",
      "fat": "4g",
      "sugar": "10g",
      "fiber": "9g"
    },
    "spinSetting": "Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "lactose_free_caramel_protein_shake",
        "name": "Lactose-Free Caramel Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 LACTOSE-FREE CARAMEL PROTEIN SHAKE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "caramel_syrup",
        "name": "Caramel Syrup",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "apple",
        "name": "Apple",
        "quantity": "1",
        "unit": "medium",
        "raw": "1 MEDIUM APPLE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "sugar_free_syrup",
        "name": "Sugar Free Syrup",
        "quantity": "5-10",
        "unit": "g",
        "raw": "5-10G SUGAR FREE SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "A few",
        "unit": "sprinkles",
        "raw": "A FEW SPRINKLES OF CINNAMON",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 24 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF NECESSARY",
      "FOR THE APPLE FILLING: CHOP THE APPLE INTO ½ INCH CUBES PLACE IN A BOWL AND TOP WITH THE SUGAR SUBSTITUTE, SYRUP, CINNAMON, AND SALT SIMMER ON THE STOVE (OR MICROWAVE IN 30 SECOND INCREMENTS) UNTIL THE APPLES BECOME SOFT (TAKES ABOUT 10 MIN ON THE STOVE, 2 MIN IN THE MICROWAVE) REFRIGERATE FOR AT LEAST 1 HOUR BEFORE USING AS A MIX-IN (IT WILL MELT THE ICE CREAM IF YOU SKIP THIS STEP!!)",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH APPLE FILLING",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CARAMEL SYRUP"
    ],
    "aliases": [
      "caramel_apple",
      "lactose_free_caramel_apple_33"
    ]
  },
  {
    "id": "cereal_milk",
    "name": "Cereal Milk",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 42,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 35,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 42,
    "macros": {
      "calories": "195",
      "protein": "22g",
      "carbs": "26g",
      "fat": "0g",
      "sugar": "26g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "cereal_milk",
        "name": "Cereal Milk",
        "quantity": "All",
        "unit": "",
        "raw": "ALL OF THE CEREAL MILK YOU MADE (SHOULD BE 250-300G)",
        "section": "Base",
        "isMixin": false,
        "notes": "Prepared cereal milk (~250-300g)"
      },
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "~100",
        "unit": "g",
        "raw": "~100G FAT FREE ULTRA-FILTERED MILK (UNTIL 400G TOTAL OF MILK)",
        "section": "Base",
        "isMixin": false,
        "notes": "UNTIL 400G TOTAL OF MILK"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "35-40",
        "unit": "g",
        "raw": "35-40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "FOR THE CEREAL MILK, SOAK THE CEREAL OVERNIGHT IN THE 400G OF MILK",
      "STRAIN THE CEREAL OUT OF THE MILK AND POUR THE MILK IN WITH THE OTHER BASE INGREDIENTS",
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 26G SUGAR 0G FIBER"
    ],
    "aliases": [
      "cereal_milk",
      "no_protein_cereal_milk_42",
      "lactose_free_cereal_milk_35"
    ]
  },
  {
    "id": "chai",
    "name": "Chai",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 44,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 37,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 44,
    "macros": {
      "calories": "135",
      "protein": "22g",
      "carbs": "10g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "10 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "loose_chai_tea",
        "name": "Loose Chai Tea",
        "quantity": "1",
        "unit": "heaping tbsp",
        "raw": "1 HEAPING TBSP LOOSE CHAI TEA",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "HEAT MILK ON LOW WITH LOOSE CHAI TEA FOR 7–10 MINUTES, OR UNTIL IT REACHES YOUR DESIRED SPICE LEVEL",
      "STRAIN OUT THE TEA LEAVES AND LET THE MILK COOL COMPLETELY",
      "BLEND MILK WITH REMAINING INGREDIENTS FOR THE BASE (DO NOT INCLUDE THE LOOSE TEA - THROW THAT OUT AFTER STEEPING)",
      "FREEZE THE MIXTURE FOR AT LEAST 16 HOURS",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 10G SUGAR 0G FIBER"
    ],
    "aliases": [
      "chai",
      "no_protein_chai_44",
      "lactose_free_chai_37"
    ]
  },
  {
    "id": "cherry_garcia",
    "name": "Cherry Garcia",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 22,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 22,
    "macros": {
      "calories": "291",
      "protein": "32g",
      "carbs": "15g",
      "fat": "9g",
      "sugar": "15g",
      "fiber": "4g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "4 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (325-350ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "325-350ML"
      },
      {
        "id": "cherries",
        "name": "Cherries",
        "quantity": "100",
        "unit": "g",
        "raw": "100G CHERRIES (FRESH OR FROZEN)",
        "section": "Base",
        "isMixin": false,
        "notes": "FRESH OR FROZEN"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "½",
        "unit": "tsp",
        "raw": "½ TSP VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G CHOCOLATE CHIPS (60 CAL) MIXED WITH 2G OF COCONUT OIL (18 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "60 CAL; 18 CAL; MIXED WITH 2G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "POUR THE CHERRIES INTO THE PINT AND COVER WITH THE SWEETENER",
      "LET SIT FOR A FEW MINUTES TO MACERATE",
      "ADD THE PROTEIN SHAKE, VANILLA BEAN PASTE, SALT, AND XANTHAN GUM",
      "BLEND UP THE PINT AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "cherry_garcia",
      "fan_favorites_cherry_garcia_22"
    ]
  },
  {
    "id": "choco_brownie_extreme_blizzard",
    "name": "Choco Brownie Extreme Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 24,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 46,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 24,
    "macros": {
      "calories": "293",
      "protein": "36g",
      "carbs": "19g",
      "fat": "8g",
      "sugar": "13g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES PROTEIN BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "hormbles_chormbles_chocolate_bar",
        "name": "Hormbles Chormbles Chocolate Bar",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A HORMBLES CHORMBLES CHOCOLATE BAR (100 CAL, 10G PROTEIN CANDY BAR – CAN SUB WITH ANY KIND OF CHOCOLATE)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "100 CAL, 10G PROTEIN CANDY BAR – CAN SUB WITH ANY KIND OF CHOCOLATE"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE CHOPPED UP BROWNIE AND CHOCOLATE"
    ],
    "aliases": [
      "choco_brownie_extreme_blizzard",
      "fan_favorites_choco_brownie_extreme_blizzard_24",
      "no_protein_choco_brownie_extreme_blizzard_46"
    ]
  },
  {
    "id": "chocolate",
    "name": "Chocolate",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 20,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 39,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 20,
    "macros": {
      "calories": "173",
      "protein": "32g",
      "carbs": "5g",
      "fat": "4g",
      "sugar": "2g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 2G SUGAR 5G FIBER"
    ],
    "aliases": [
      "chocolate",
      "keto_chocolate_20",
      "lactose_free_chocolate_39"
    ]
  },
  {
    "id": "chocolate_cake_shake",
    "name": "Chocolate Cake Shake",
    "category": "Keto",
    "categories": [
      "Keto"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 22,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 22,
    "macros": {
      "calories": "353",
      "protein": "52g",
      "carbs": "10g",
      "fat": "12g",
      "sugar": "3g",
      "fiber": "14g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "legendary_foods_chocolate_cake_protein_pastry",
        "name": "Legendary Foods Chocolate Cake Protein Pastry",
        "quantity": "1",
        "unit": "",
        "raw": "1 LEGENDARY FOODS CHOCOLATE CAKE PROTEIN PASTRY",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH ¾ OF THE CRUMBLED UP PASTRY",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE REMAINING ¼ OF THE PASTRY"
    ],
    "aliases": [
      "chocolate_cake_shake",
      "keto_chocolate_cake_shake_22"
    ]
  },
  {
    "id": "chocolate_caramel_cheesecake",
    "name": "Chocolate Caramel Cheesecake",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 28,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 28,
    "macros": {
      "calories": "338",
      "protein": "32g",
      "carbs": "31g",
      "fat": "10g",
      "sugar": "17g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "caramel_protein_shake",
        "name": "Caramel Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CARAMEL PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cheesecake_jello_pudding_mix",
        "name": "Cheesecake Jello Pudding Mix",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CHEESECAKE JELLO PUDDING MIX",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "2",
        "unit": "",
        "raw": "2 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      },
      {
        "id": "cheesecake_bites",
        "name": "Cheesecake Bites",
        "quantity": "30",
        "unit": "g",
        "raw": "30G CHEESECAKE BITES COATED IN 2G OF CRUSHED GRAHAM CRACKER (~100 CALORIES WORTH OF ANY CHEESECAKE)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "~100 CALORIES WORTH OF ANY CHEESECAKE; COATED IN 2G OF CRUSHED GRAHAM CRACKER"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CHEESECAKE PIECES AND CRUMBLED GRAHAM CRACKER"
    ],
    "aliases": [
      "chocolate_caramel_cheesecake",
      "fan_favorites_chocolate_caramel_cheesecake_28"
    ]
  },
  {
    "id": "chocolate_chip_cookie_dough",
    "name": "Chocolate Chip Cookie Dough",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 30,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 48,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 30,
    "macros": {
      "calories": "263",
      "protein": "30g",
      "carbs": "13g",
      "fat": "8g",
      "sugar": "11g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_chip_cookie",
        "name": "Chocolate Chip Cookie",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE CHIP COOKIE (APPROXIMATELY 30G, CAN SUB WITH COOKIE DOUGH)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "APPROXIMATELY 30G, CAN SUB WITH COOKIE DOUGH"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE COOKIE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "chocolate_chip_cookie_dough",
      "fan_favorites_chocolate_chip_cookie_dough_30",
      "no_protein_chocolate_chip_cookie_dough_48"
    ]
  },
  {
    "id": "chocolate_chip_stracciatella",
    "name": "Chocolate Chip / Stracciatella",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 50,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 50,
    "macros": {
      "calories": "240",
      "protein": "23g",
      "carbs": "11g",
      "fat": "9g",
      "sugar": "20g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "sugar_free_chocolate_chips",
        "name": "Sugar-Free Chocolate Chips",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SUGAR-FREE CHOCOLATE CHIPS (80 CAL) MIXED WITH 3G OF COCONUT OIL (27 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "80 CAL; 27 CAL; MIXED WITH 3G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "chocolate_chip_stracciatella",
      "no_protein_chocolate_chip_stracciatella_50"
    ]
  },
  {
    "id": "chocolate_covered_strawberry",
    "name": "Chocolate Covered Strawberry",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 32,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 24,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 32,
    "macros": {
      "calories": "258",
      "protein": "31g",
      "carbs": "10g",
      "fat": "9g",
      "sugar": "7g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "strawberry_protein_shake",
        "name": "Strawberry Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 STRAWBERRY PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "strawberry_jam",
        "name": "Strawberry Jam",
        "quantity": "1",
        "unit": "heaping tbsp",
        "raw": "1 HEAPING TABLESPOON OF STRAWBERRY JAM (I USED LOW SUGAR SMUCKERS)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED LOW SUGAR SMUCKERS"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G CHOCOLATE CHIPS + 2G COCONUT OIL",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2G COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE STRAWBERRY JAM AND MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "chocolate_covered_strawberry",
      "fan_favorites_chocolate_covered_strawberry_32",
      "keto_chocolate_covered_strawberry_24"
    ]
  },
  {
    "id": "chocolate_fudge_brownie",
    "name": "Chocolate Fudge Brownie",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 34,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 26,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 34,
    "macros": {
      "calories": "283",
      "protein": "41g",
      "carbs": "9g",
      "fat": "8g",
      "sugar": "5g",
      "fiber": "6g"
    },
    "spinSetting": "Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES PROTEIN BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE BROWNIE",
      "RUN THE \"MIX-IN\" CYCLE *IF YOU DON'T WANT THE BROWNIE TO BE PULVERIZED INTO A MILLION LITTLE PIECES I WOULD RECOMMEND JUST CRUMBLING IT ON TOP OF THE CHOCOLATE ICE CREAM INSTEAD OF USING THE MIX-IN FUNCTION"
    ],
    "aliases": [
      "chocolate_fudge_brownie",
      "fan_favorites_chocolate_fudge_brownie_34",
      "keto_chocolate_fudge_brownie_26"
    ]
  },
  {
    "id": "chocolate_therapy",
    "name": "Chocolate Therapy",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 36,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 36,
    "macros": {
      "calories": "258",
      "protein": "33g",
      "carbs": "23g",
      "fat": "5g",
      "sugar": "12g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "chocolate_jello_pudding_mix",
        "name": "Chocolate Jello Pudding Mix",
        "quantity": "7-10",
        "unit": "g",
        "raw": "7-10G CHOCOLATE JELLO PUDDING MIX",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "3",
        "unit": "",
        "raw": "3 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "chocolate_therapy",
      "fan_favorites_chocolate_therapy_36"
    ]
  },
  {
    "id": "chocolate_and_vanilla_twist",
    "name": "Chocolate & Vanilla Twist",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 52,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 41,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 52,
    "macros": {
      "calories": "183",
      "protein": "25g",
      "carbs": "13g",
      "fat": "2g",
      "sugar": "10g",
      "fiber": "6g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "low_calorie_chocolate_ganache",
        "name": "Low Calorie Chocolate Ganache",
        "quantity": "45",
        "unit": "g",
        "raw": "45G (2 TBSP) LOW CALORIE CHOCOLATE GANACHE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 2 TBSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "PREP YOUR CHOCOLATE GANACHE",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE GANACHE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "chocolate_and_vanilla_twist",
      "no_protein_chocolate_and_vanilla_twist_52",
      "lactose_free_chocolate_and_vanilla_twist_41"
    ]
  },
  {
    "id": "chocolatey_love_a_fair",
    "name": "Chocolatey Love A-Fair",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 38,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 38,
    "macros": {
      "calories": "299",
      "protein": "38g",
      "carbs": "22g",
      "fat": "9g",
      "sugar": "14g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "hormbles_chormbles",
        "name": "Hormbles Chormbles",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A HORMBLES CHORMBLES (PROTEIN CHOCOLATE BAR WITH 100 CAL AND 10G PRO)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "PROTEIN CHOCOLATE BAR WITH 100 CAL AND 10G PRO"
      },
      {
        "id": "rolos",
        "name": "Rolos",
        "quantity": "12",
        "unit": "g",
        "raw": "12G (2 PIECES) ROLOS, CHOPPED (OR ANY CHOCOLATE COVERED CARAMELS)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2 PIECES; OR ANY CHOCOLATE COVERED CARAMELS; Chopped"
      },
      {
        "id": "caramel_syrup",
        "name": "Caramel Syrup",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE CHOPPED CHOCOLATE AND ROLOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CARAMEL SYRUP"
    ],
    "aliases": [
      "chocolatey_love_a_fair",
      "fan_favorites_chocolatey_love_a_fair_38"
    ]
  },
  {
    "id": "choco_lotta_cheesecake_sundae",
    "name": "Choco-Lotta Cheesecake Sundae",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 26,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 26,
    "macros": {
      "calories": "328",
      "protein": "36g",
      "carbs": "23g",
      "fat": "12g",
      "sugar": "10g",
      "fiber": "6g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "whipped_cream_cheese",
        "name": "Whipped Cream Cheese",
        "quantity": "22",
        "unit": "g",
        "raw": "22G (2 TBSP) WHIPPED (OR REGULAR) CREAM CHEESE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; OR REGULAR"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "3",
        "unit": "",
        "raw": "3 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      },
      {
        "id": "fat_free_reddi_wip",
        "name": "Fat Free Reddi-Wip",
        "quantity": "10",
        "unit": "g",
        "raw": "10G (4 TBSP) FAT FREE REDDIWHIP (OR ANY WHIPPED CREAM)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 4 TBSP; OR ANY WHIPPED CREAM"
      },
      {
        "id": "salted_fudge_hormbles_chormbles",
        "name": "Salted Fudge Hormbles Chormbles",
        "quantity": "¼",
        "unit": "",
        "raw": "¼ OF A SALTED FUDGE HORMBLES CHORMBLES, CHOPPED (PROTEIN CHOCOLATE BAR WITH 100 CAL AND 10G PRO)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "PROTEIN CHOCOLATE BAR WITH 100 CAL AND 10G PRO; Chopped"
      },
      {
        "id": "lakanto_chocolate_sauce",
        "name": "Lakanto Chocolate Sauce",
        "quantity": "10",
        "unit": "g",
        "raw": "10G (2 TSP) LAKANTO CHOCOLATE SAUCE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 2 TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE WHIPPED CREAM, CHOCOLATE SAUCE, AND CHOPPED CHOCOLATE BAR PIECES"
    ],
    "aliases": [
      "choco_lotta_cheesecake_sundae",
      "fan_favorites_choco_lotta_cheesecake_sundae_26"
    ]
  },
  {
    "id": "chubby_hubby",
    "name": "Chubby Hubby",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 40,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 54,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 40,
    "macros": {
      "calories": "317",
      "protein": "26g",
      "carbs": "30g",
      "fat": "9g",
      "sugar": "21g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE PEANUT BUTTER SWIRL HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF PEANUT BUTTER CHIPS WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO A PERFECT, CREAMY PEANUT BUTTER SWIRL.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "malted_milk_powder",
        "name": "Malted Milk Powder",
        "quantity": "1",
        "unit": "tbsp",
        "raw": "1 TBSP MALTED MILK POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "peanut_butter_chips",
        "name": "Peanut Butter Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G PEANUT BUTTER CHIPS + 2G COCONUT OIL + A PINCH OF SALT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2G COCONUT OIL + A PINCH OF SALT"
      },
      {
        "id": "chocolate_covered_pretzels",
        "name": "Chocolate Covered Pretzels",
        "quantity": "14",
        "unit": "g",
        "raw": "14G (½ SERVING) CHOCOLATE COVERED PRETZELS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "½ SERVING"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE PEANUT BUTTER MIXTURE",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CHOPPED UP PRETZELS"
    ],
    "aliases": [
      "chubby_hubby",
      "fan_favorites_chubby_hubby_40",
      "no_protein_chubby_hubby_54"
    ]
  },
  {
    "id": "chunky_monkey",
    "name": "Chunky Monkey",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 42,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 56,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 42,
    "macros": {
      "calories": "329",
      "protein": "24g",
      "carbs": "28g",
      "fat": "12g",
      "sugar": "21g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "1",
        "unit": "small",
        "raw": "1 SMALL BANANA (~80G)",
        "section": "Base",
        "isMixin": false,
        "notes": "~80G"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "walnuts",
        "name": "Walnuts",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CHOPPED WALNUTS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped"
      },
      {
        "id": "sugar_free_chocolate_chips",
        "name": "Sugar-Free Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G SUGAR-FREE CHOCOLATE CHIPS + 2G COCONUT OIL (YOU CAN EITHER USE THIS AS A MIX-IN OR AS A CHOCOLATE SHELL TOPPING)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "YOU CAN EITHER USE THIS AS A MIX-IN OR AS A CHOCOLATE SHELL TOPPING; 2G COCONUT OIL"
      }
    ],
    "instructions": [],
    "aliases": [
      "chunky_monkey",
      "fan_favorites_chunky_monkey_42",
      "no_protein_chunky_monkey_56"
    ]
  },
  {
    "id": "churray_for_churros",
    "name": "Churray For Churros",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 44,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 58,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 44,
    "macros": {
      "calories": "353",
      "protein": "41g",
      "carbs": "17g",
      "fat": "9g",
      "sugar": "16g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "butter_extract",
        "name": "Butter Extract",
        "quantity": "0.5",
        "unit": "g",
        "raw": "0.5G (⅛ TSP) BUTTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ⅛ TSP"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "2-3",
        "unit": "g",
        "raw": "2-3G (½ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_glazed_cinnamon_roll_protein_brownie",
        "name": "Prime Bites Glazed Cinnamon Roll Protein Brownie",
        "quantity": "1",
        "unit": "",
        "raw": "1 PRIME BITES GLAZED CINNAMON ROLL PROTEIN BROWNIE (CHOPPED AND COATED IN A SPRINKLE OF CINNAMON AND SWEETENER)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CHOPPED AND COATED IN A SPRINKLE OF CINNAMON AND SWEETENER"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE BROWNIE PIECES AND MIX IN BY HAND"
    ],
    "aliases": [
      "churray_for_churros",
      "fan_favorites_churray_for_churros_44",
      "no_protein_churray_for_churros_58"
    ]
  },
  {
    "id": "cinnamon_bun",
    "name": "Cinnamon Bun",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 46,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 60,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 46,
    "macros": {
      "calories": "250",
      "protein": "31g",
      "carbs": "14g",
      "fat": "4g",
      "sugar": "13g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK (CAN SUB WITH FAT FREE ULTRA-FILTERED MILK)",
        "section": "Base",
        "isMixin": false,
        "notes": "CAN SUB WITH FAT FREE ULTRA-FILTERED MILK"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%) (OR FAVORITE SUGAR SUBSTITUTE)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%; OR FAVORITE SUGAR SUBSTITUTE"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "ground_cinnamon",
        "name": "Ground Cinnamon",
        "quantity": "3",
        "unit": "g",
        "raw": "3G (½ TSP) GROUND CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "Pinch",
        "unit": "pinch",
        "raw": "PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "prime_bites_glazed_cinnamon_roll_protein_brownie",
        "name": "Prime Bites Glazed Cinnamon Roll Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES GLAZED CINNAMON ROLL PROTEIN BROWNIE, CHOPPED AND COATED IN A MIX OF CINNAMON AND SWEETENER (CAN SUB WITH ANY CINNAMON-BASED DESSERT)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CAN SUB WITH ANY CINNAMON-BASED DESSERT; CHOPPED AND COATED IN A MIX OF CINNAMON AND SWEETENER"
      }
    ],
    "instructions": [],
    "aliases": [
      "cinnamon_bun",
      "fan_favorites_cinnamon_bun_46",
      "no_protein_cinnamon_bun_60"
    ]
  },
  {
    "id": "cinnamon_pebbles",
    "name": "Cinnamon Pebbles",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 62,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 43,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 62,
    "macros": {
      "calories": "219",
      "protein": "22g",
      "carbs": "28g",
      "fat": "1g",
      "sugar": "17g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "3",
        "unit": "g",
        "raw": "3G (½ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "cinnamon_pebbles_cereal",
        "name": "Cinnamon Pebbles Cereal",
        "quantity": "20",
        "unit": "g",
        "raw": "20G CINNAMON PEBBLES CEREAL",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE CINNAMON PEBBLES",
      "RUN THE \"MIX-IN\" CYCLE",
      "(OPTIONAL) SPRINKLE 5 MORE GRAMS OF ON TOP"
    ],
    "aliases": [
      "cinnamon_pebbles",
      "no_protein_cinnamon_pebbles_62",
      "lactose_free_cinnamon_pebbles_43"
    ]
  },
  {
    "id": "coffee",
    "name": "Coffee",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 28,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 45,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 28,
    "macros": {
      "calories": "150",
      "protein": "30g",
      "carbs": "2g",
      "fat": "3g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "espresso",
        "name": "Espresso",
        "quantity": "1",
        "unit": "shot",
        "raw": "1 SHOT ESPRESSO (FEEL FREE TO SUB FOR 1 TBSP OF INSTANT COFFEE OR A COMETEER POD)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: FEEL FREE TO SUB FOR 1 TBSP OF INSTANT COFFEE OR A COMETEER POD"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "coffee",
      "keto_coffee_28",
      "lactose_free_coffee_45"
    ]
  },
  {
    "id": "coffee_coffee_buzzbuzzbuzz",
    "name": "Coffee Coffee Buzzbuzzbuzz",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 48,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 64,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 48,
    "macros": {
      "calories": "273",
      "protein": "24g",
      "carbs": "27g",
      "fat": "8g",
      "sugar": "23g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK (CAN SUB WITH A VANILLA PROTEIN SHAKE AND 20G LESS SWEETENER)",
        "section": "Base",
        "isMixin": false,
        "notes": "CAN SUB WITH A VANILLA PROTEIN SHAKE AND 20G LESS SWEETENER"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "espresso",
        "name": "Espresso",
        "quantity": "1",
        "unit": "shot",
        "raw": "1 SHOT ESPRESSO (FEEL FREE TO SUB FOR 1 TBSP OF INSTANT COFFEE OR A COMETEER POD)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: FEEL FREE TO SUB FOR 1 TBSP OF INSTANT COFFEE OR A COMETEER POD"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_covered_espresso_beans",
        "name": "Chocolate Covered Espresso Beans",
        "quantity": "30",
        "unit": "g",
        "raw": "30G CHOCOLATE COVERED ESPRESSO BEANS, CHOPPED",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE CHOPPED ESPRESSO BEANS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "coffee_coffee_buzzbuzzbuzz",
      "fan_favorites_coffee_coffee_buzzbuzzbuzz_48",
      "no_protein_coffee_coffee_buzzbuzzbuzz_64"
    ]
  },
  {
    "id": "coffee_oreo",
    "name": "Coffee Oreo",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 66,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 66,
    "macros": {
      "calories": "240",
      "protein": "23g",
      "carbs": "26g",
      "fat": "4g",
      "sugar": "19g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "espresso",
        "name": "Espresso",
        "quantity": "1",
        "unit": "shot",
        "raw": "1 SHOT ESPRESSO (FEEL FREE TO SUB FOR 1 TBSP OF INSTANT COFFEE OR A COMETEER POD)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: FEEL FREE TO SUB FOR 1 TBSP OF INSTANT COFFEE OR A COMETEER POD"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "3",
        "unit": "",
        "raw": "3 OREO THINS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "coffee_oreo",
      "no_protein_coffee_oreo_66"
    ]
  },
  {
    "id": "coffee_toffee_bar_crunch",
    "name": "Coffee Toffee Bar Crunch",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 50,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 68,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 50,
    "macros": {
      "calories": "246",
      "protein": "22g",
      "carbs": "23g",
      "fat": "7g",
      "sugar": "23g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "instant_coffee",
        "name": "Instant Coffee",
        "quantity": "1",
        "unit": "tbsp",
        "raw": "1 TBSP INSTANT COFFEE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "heath_bar",
        "name": "Heath Bar",
        "quantity": "21",
        "unit": "g",
        "raw": "21G (3 MINI BARS) HEATH BAR (CAN SUB WITH ANY CHOCOLATE COVERED TOFFEE)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "3 MINI BARS; CAN SUB WITH ANY CHOCOLATE COVERED TOFFEE"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE CHOPPED UP TOFFEE PIECES"
    ],
    "aliases": [
      "coffee_toffee_bar_crunch",
      "fan_favorites_coffee_toffee_bar_crunch_50",
      "no_protein_coffee_toffee_bar_crunch_68"
    ]
  },
  {
    "id": "confetti_cake_blizzard",
    "name": "Confetti Cake Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 52,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 70,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 52,
    "macros": {
      "calories": "268",
      "protein": "29g",
      "carbs": "28g",
      "fat": "4g",
      "sugar": "13g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "fuul_birthday_cake_cookie_dough_bites",
        "name": "Fuul Birthday Cake Cookie Dough Bites",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PACKAGE OF THE FUUL BIRTHDAY CAKE COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE COOKIE DOUGH BITES AND MIX IN BY HAND"
    ],
    "aliases": [
      "confetti_cake_blizzard",
      "fan_favorites_confetti_cake_blizzard_52",
      "no_protein_confetti_cake_blizzard_70"
    ]
  },
  {
    "id": "cookie_dough",
    "name": "Cookie Dough",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 54,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 54,
    "macros": {
      "calories": "285",
      "protein": "38g",
      "carbs": "20g",
      "fat": "7g",
      "sugar": "4g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PACKAGE OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE COOKIE DOUGH BITES AND MIX IN BY HAND"
    ],
    "aliases": [
      "cookie_dough",
      "fan_favorites_cookie_dough_54"
    ]
  },
  {
    "id": "cookie_monster",
    "name": "Cookie Monster",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 72,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 72,
    "macros": {
      "calories": "328",
      "protein": "30g",
      "carbs": "40g",
      "fat": "5g",
      "sugar": "18g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "blue_food_coloring",
        "name": "Blue Food Coloring",
        "quantity": "1-2",
        "unit": "drops",
        "raw": "1-2 DROPS OF BLUE FOOD COLORING (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PACKAGE OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES (CODE FPF SAVES YOU 15%)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CODE FPF SAVES YOU 15%"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "2",
        "unit": "",
        "raw": "2 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE COOKIE DOUGH BITES"
    ],
    "aliases": [
      "cookie_monster",
      "no_protein_cookie_monster_72"
    ]
  },
  {
    "id": "cosmic_brownie",
    "name": "Cosmic Brownie",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 56,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 56,
    "macros": {
      "calories": "245",
      "protein": "36g",
      "carbs": "20g",
      "fat": "8g",
      "sugar": "10g",
      "fiber": "7g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "black_cocoa_powder",
        "name": "Black Cocoa Powder",
        "quantity": "20",
        "unit": "g",
        "raw": "20G BLACK COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "rainbow_candy_coated_chocolate_chips",
        "name": "Rainbow Candy Coated Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G RAINBOW CANDY COATED CHOCOLATE CHIPS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE RAINBOW CHIPS"
    ],
    "aliases": [
      "cosmic_brownie",
      "fan_favorites_cosmic_brownie_56"
    ]
  },
  {
    "id": "cotton_candy_blizzard",
    "name": "Cotton Candy Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 58,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 74,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 47,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 58,
    "macros": {
      "calories": "133",
      "protein": "22g",
      "carbs": "10g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "lorann_cotton_candy_flavoring",
        "name": "LorAnn Cotton Candy Flavoring",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) LORANN COTTON CANDY FLAVORING",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "pink_and_purple_sprinkles",
        "name": "Pink & Purple Sprinkles",
        "quantity": "",
        "unit": "",
        "raw": "*USE WHATEVER KIND OF PINK AND PURPLE SPRINKLES OR CANDY YOU CAN FIND. I’M NOT INCLUDING THEM IN THE MACROS BECAUSE THEY WILL VARY GREATLY DEPENDING ON WHAT YOU USE.",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Use whatever pink and purple sprinkles or candy you can find; not included in macros"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH SPRINKLES/CANDY, AND MIX IN BY HAND"
    ],
    "aliases": [
      "cotton_candy_blizzard",
      "fan_favorites_cotton_candy_blizzard_58",
      "no_protein_cotton_candy_blizzard_74",
      "lactose_free_cotton_candy_blizzard_47"
    ]
  },
  {
    "id": "dark_chocolate_raspberry",
    "name": "Dark Chocolate Raspberry",
    "category": "Lactose Free",
    "categories": [
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Lactose Free",
        "page": 49,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "lactose free 8-6.pdf",
    "page": 49,
    "macros": {
      "calories": "245",
      "protein": "36g",
      "carbs": "14g",
      "fat": "5g",
      "sugar": "5g",
      "fiber": "14g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "lactose_free_chocolate_protein_shake",
        "name": "Lactose-Free Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 LACTOSE-FREE CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "black_cocoa_powder",
        "name": "Black Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G BLACK COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "raspberries",
        "name": "Raspberries",
        "quantity": "100",
        "unit": "g",
        "raw": "100G RASPBERRIES (FRESH IF YOU WANT A SOFTER ICE CREAM/MOUSSE-LIKE TEXTURE, OR FROZEN IF YOU WANT A TRUE ICE CREAM TEXTURE)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "FRESH IF YOU WANT A SOFTER ICE CREAM/MOUSSE-LIKE TEXTURE, OR FROZEN IF YOU WANT A TRUE ICE CREAM TEXTURE"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH RASPBERRIES",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "dark_chocolate_raspberry",
      "lactose_free_dark_chocolate_raspberry_49"
    ]
  },
  {
    "id": "death_by_chocolate",
    "name": "Death By Chocolate",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 60,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 30,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 60,
    "macros": {
      "calories": "358",
      "protein": "49g",
      "carbs": "15g",
      "fat": "13g",
      "sugar": "5g",
      "fiber": "6g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES PROTEIN BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "hormbles_chormbles_chocolate_bar",
        "name": "Hormbles Chormbles Chocolate Bar",
        "quantity": "¾",
        "unit": "",
        "raw": "¾ OF A HORMBLES CHORMBLES CHOCOLATE BAR (100 CAL, 10G PROTEIN CANDY BAR – CAN SUB WITH ANY KIND OF CHOCOLATE)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "100 CAL, 10G PROTEIN CANDY BAR – CAN SUB WITH ANY KIND OF CHOCOLATE"
      }
    ],
    "instructions": [],
    "aliases": [
      "death_by_chocolate",
      "fan_favorites_death_by_chocolate_60",
      "keto_death_by_chocolate_30"
    ]
  },
  {
    "id": "dirt_cake",
    "name": "Dirt Cake",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 62,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 76,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 62,
    "macros": {
      "calories": "249",
      "protein": "23g",
      "carbs": "31g",
      "fat": "2g",
      "sugar": "22g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_pudding_mix",
        "name": "Vanilla Pudding Mix",
        "quantity": "7",
        "unit": "g",
        "raw": "7G (1 TBSP) VANILLA PUDDING MIX",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TBSP"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "4",
        "unit": "",
        "raw": "4 OREO THINS, CREAM REMOVED (3 MIXED IN, 1 CRUMBLED ON TOP)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "3 MIXED IN, 1 CRUMBLED ON TOP; Cream removed"
      },
      {
        "id": "lakanto_chocolate_sauce",
        "name": "Lakanto Chocolate Sauce",
        "quantity": "15",
        "unit": "g",
        "raw": "15G (1 TBSP) LAKANTO CHOCOLATE SAUCE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 1 TBSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH 3 OF THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "DRIZZLE WITH THE CHOCOLATE SAUCE",
      "CRUMBLE THE FINAL OREO ON TOP"
    ],
    "aliases": [
      "dirt_cake",
      "fan_favorites_dirt_cake_62",
      "no_protein_dirt_cake_76"
    ]
  },
  {
    "id": "dole_whip",
    "name": "Dole Whip",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 78,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 51,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 78,
    "macros": {
      "calories": "176",
      "protein": "2g",
      "carbs": "35g",
      "fat": "4g",
      "sugar": "29g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "pineapple",
        "name": "Pineapple",
        "quantity": "170",
        "unit": "g",
        "raw": "170G (1 CUP) PINEAPPLE (CANNED, FRESH, OR FROZEN)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 CUP; CANNED, FRESH, OR FROZEN"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "60",
        "unit": "g",
        "raw": "60G OR ABOUT ½ OF A MEDIUM BANANA",
        "section": "Base",
        "isMixin": false,
        "notes": "OR ABOUT ½ OF A MEDIUM BANANA"
      },
      {
        "id": "unsweetened_coconut_milk",
        "name": "Unsweetened Coconut Milk",
        "quantity": "180",
        "unit": "g",
        "raw": "180G (¾ CUP) UNSWEETENED COCONUT MILK",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¾ CUP"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-30",
        "unit": "g",
        "raw": "20-30G (2 TBSP) SWEETENER (CODE ELI15 SAVES YOU 15%), OPTIONAL BUT RECOMMENDED",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; CODE ELI15 SAVES YOU 15%; Optional but recommended"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "A splash",
        "unit": "splash",
        "raw": "A SPLASH OF VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "OR EXTRACT"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"SMOOTHIE BOWL\" SETTING (OR FRUIT WHIP IF YOU HAVE THE NEWER MACHINES)",
      "SPIN ON \"RESPIN\" SETTING UNTIL IT REACHES YOUR DESIRED TEXTURE IF YOU HAVE THE NINJA SWIRL, FOLLOW THESE EXTRA STEPS:",
      "REPLACE THE SPINNING PADDLE WITH THE DISPENSING LID",
      "PLACE THE PINT INTO THE SOFT SERVE SIDE OF THE SWIRL AND LOCK INTO PLACE",
      "OPEN THE NOZZLE OF THE LID",
      "DISPENSE!! 29G SUGAR 3G FIBER"
    ],
    "aliases": [
      "dole_whip",
      "no_protein_dole_whip_78",
      "lactose_free_dole_whip_51"
    ]
  },
  {
    "id": "double_oreo",
    "name": "Double Oreo",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 64,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 64,
    "macros": {
      "calories": "298",
      "protein": "36g",
      "carbs": "24g",
      "fat": "10g",
      "sugar": "11g",
      "fiber": "7g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "black_cocoa_powder",
        "name": "Black Cocoa Powder",
        "quantity": "20",
        "unit": "g",
        "raw": "20G BLACK COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo",
        "name": "Oreo",
        "quantity": "7",
        "unit": "mini",
        "raw": "7 MINI OREOS OR 3 OREO THINS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Or 3 Oreo Thins"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH ¾ OF THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "CRUMBLE THE REMAINING OREOS ON TOP"
    ],
    "aliases": [
      "double_oreo",
      "fan_favorites_double_oreo_64"
    ]
  },
  {
    "id": "dr_pepper_float",
    "name": "Dr Pepper Float",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 32,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 53,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 32,
    "macros": {
      "calories": "116",
      "protein": "22g",
      "carbs": "3g",
      "fat": "2g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "8",
        "unit": "oz",
        "raw": "8 OZ VANILLA PROTEIN SHAKE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "diet_dr_pepper",
        "name": "Diet Dr Pepper",
        "quantity": "8",
        "unit": "oz",
        "raw": "8 OZ DIET DR PEPPER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "RESPIN AGAIN IF POWDERY 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "dr_pepper_float",
      "keto_dr_pepper_float_32",
      "lactose_free_dr_pepper_float_53"
    ]
  },
  {
    "id": "dubai_chocolate",
    "name": "Dubai Chocolate",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 80,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 80,
    "macros": {
      "calories": "346",
      "protein": "19g",
      "carbs": "30g",
      "fat": "16g",
      "sugar": "15g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "30-35",
        "unit": "g",
        "raw": "30-35G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "pistachio_butter",
        "name": "Pistachio Butter",
        "quantity": "20",
        "unit": "g",
        "raw": "20G PISTACHIO BUTTER (OR PISTACHIO CREAM)",
        "section": "Base",
        "isMixin": false,
        "notes": "OR PISTACHIO CREAM"
      },
      {
        "id": "sugar_free_pistachio_syrup",
        "name": "Sugar-Free Pistachio Syrup",
        "quantity": "½",
        "unit": "tsp",
        "raw": "½ TSP SUGAR-FREE PISTACHIO SYRUP (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "shredded_kataifi",
        "name": "Shredded Kataifi",
        "quantity": "10",
        "unit": "g",
        "raw": "10G SHREDDED KATAIFI",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "sugar_free_chocolate_chips",
        "name": "Sugar-Free Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G SUGAR-FREE CHOCOLATE CHIPS + 3G COCONUT OIL (USING SLIGHTLY MORE COCONUT OIL SO THE MELTED CHOCOLATE SPREADS MORE EASILY)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "USING SLIGHTLY MORE COCONUT OIL SO THE MELTED CHOCOLATE SPREADS MORE EASILY; 3G COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "WHILE THIS IS SPINNING, MELT THE CHOCOLATE WITH THE COCONUT OIL IN THE MICROWAVE - 30 SECOND INTERVALS UNTIL FULLY MELTED",
      "SPIN ON \"RESPIN\" SETTING IF NECESSARY",
      "TOP WITH THE KATAIFI AND MELTED CHOCOLATE",
      "FREEZE UNTIL THE CHOCOLATE HARDENS (5 MIN OR AS LONG AS YOU CAN WAIT)"
    ],
    "aliases": [
      "dubai_chocolate",
      "no_protein_dubai_chocolate_80"
    ]
  },
  {
    "id": "eggnog",
    "name": "Eggnog",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 82,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 55,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 82,
    "macros": {
      "calories": "220",
      "protein": "23g",
      "carbs": "13g",
      "fat": "8g",
      "sugar": "11g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "300",
        "unit": "g",
        "raw": "300G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "almond_nog",
        "name": "Almond Nog",
        "quantity": "100",
        "unit": "g",
        "raw": "100G ALMOND NOG (OR ANY LOW FAT EGGNOG)",
        "section": "Base",
        "isMixin": false,
        "notes": "OR ANY LOW FAT EGGNOG"
      },
      {
        "id": "egg",
        "name": "Egg",
        "quantity": "1",
        "unit": "large",
        "raw": "1 LARGE EGG (OPTIONAL – ADDS CUSTARD-STYLE CREAMINESS, SKIP IF YOU PREFER)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL – ADDS CUSTARD-STYLE CREAMINESS, SKIP IF YOU PREFER"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "35-40",
        "unit": "g",
        "raw": "35-40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "nutmeg",
        "name": "Nutmeg",
        "quantity": "2",
        "unit": "g",
        "raw": "2G (½ TSP) NUTMEG",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "ground_clove",
        "name": "Ground Clove",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF GROUND CLOVE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "0.5",
        "unit": "g",
        "raw": "0.5G (⅛ TSP) XANTHAN GUM (DOUBLE THIS IF YOU’RE SKIPPING THE EGG)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ⅛ TSP; DOUBLE THIS IF YOU’RE SKIPPING THE EGG"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 11G SUGAR 0G FIBER"
    ],
    "aliases": [
      "eggnog",
      "no_protein_eggnog_82",
      "lactose_free_eggnog_55"
    ]
  },
  {
    "id": "everything_but_the",
    "name": "Everything But The…",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 66,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 66,
    "macros": {
      "calories": "321",
      "protein": "34g",
      "carbs": "17g",
      "fat": "14g",
      "sugar": "12g",
      "fiber": "8g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "white_chocolate_chips",
        "name": "White Chocolate Chips",
        "quantity": "7",
        "unit": "g",
        "raw": "7G WHITE CHOCOLATE CHIPS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "peanut_butter_cups",
        "name": "Peanut Butter Cups",
        "quantity": "9",
        "unit": "g",
        "raw": "9G PEANUT BUTTER CUPS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "chocolate_covered_toffee",
        "name": "Chocolate Covered Toffee",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CHOCOLATE COVERED TOFFEE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "chocolate_covered_almonds",
        "name": "Chocolate Covered Almonds",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CHOCOLATE COVERED ALMONDS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE MIX-INS AND MIX IN BY HAND"
    ],
    "aliases": [
      "everything_but_the",
      "fan_favorites_everything_but_the_66"
    ]
  },
  {
    "id": "frosted_animal_cookie_blizzard",
    "name": "Frosted Animal Cookie Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 68,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 84,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 68,
    "macros": {
      "calories": "253",
      "protein": "23g",
      "carbs": "27g",
      "fat": "5g",
      "sugar": "20g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cake_batter_extract",
        "name": "Cake Batter Extract",
        "quantity": "3",
        "unit": "g",
        "raw": "3G (½ TSP) CAKE BATTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "frosted_animal_cookies",
        "name": "Frosted Animal Cookies",
        "quantity": "24",
        "unit": "g",
        "raw": "24G FROSTED ANIMAL COOKIES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE COOKIES",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "frosted_animal_cookie_blizzard",
      "fan_favorites_frosted_animal_cookie_blizzard_68",
      "no_protein_frosted_animal_cookie_blizzard_84"
    ]
  },
  {
    "id": "frosted_lemonade",
    "name": "Frosted Lemonade",
    "category": "Keto",
    "categories": [
      "Keto"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 34,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 34,
    "macros": {
      "calories": "130",
      "protein": "25g",
      "carbs": "2g",
      "fat": "2g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "zero_sugar_lemonade",
        "name": "Zero Sugar Lemonade",
        "quantity": "400",
        "unit": "g",
        "raw": "400G ZERO SUGAR LEMONADE (MY FAVORITE IS THE ONE FROM MINUTE MAID)",
        "section": "Base",
        "isMixin": false,
        "notes": "MY FAVORITE IS THE ONE FROM MINUTE MAID"
      },
      {
        "id": "vanilla_protein_powder",
        "name": "Vanilla Protein Powder",
        "quantity": "1",
        "unit": "scoop",
        "raw": "1 SCOOP VANILLA PROTEIN POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "lemon_zest_and_juice",
        "name": "Lemon Zest & Juice",
        "quantity": "¼-½",
        "unit": "lemon",
        "raw": "THE ZEST AND JUICE OF A ¼-½ OF A LEMON",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "10",
        "unit": "g",
        "raw": "10G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "frosted_lemonade",
      "keto_frosted_lemonade_34"
    ]
  },
  {
    "id": "frosted_sugar_cookie_blizzard",
    "name": "Frosted Sugar Cookie Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 70,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 70,
    "macros": {
      "calories": "281",
      "protein": "37g",
      "carbs": "24g",
      "fat": "4g",
      "sugar": "13g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "35",
        "unit": "g",
        "raw": "35G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "protein_frosting",
        "name": "Protein Frosting",
        "quantity": "15",
        "unit": "g",
        "raw": "15G PROTEIN FROSTING (CAN SUB WITH NORMAL FROSTING)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CAN SUB WITH NORMAL FROSTING"
      },
      {
        "id": "fuul_birthday_cake_cookie_dough_bites",
        "name": "Fuul Birthday Cake Cookie Dough Bites",
        "quantity": "⅓",
        "unit": "",
        "raw": "⅓ OF A PACKAGE OF THE FUUL BIRTHDAY CAKE COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "christmas_themed_sprinkles",
        "name": "Christmas-Themed Sprinkles",
        "quantity": "½",
        "unit": "tsp",
        "raw": "(OPTIONAL) ½ TSP CHRISTMAS-THEMED SPRINKLES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Optional"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "PREP THE PROTEIN FROSTING IN A CUP, SLOWLY ADD WATER TO 15G OF PROTEIN POWDER. STIR UNTIL IT REACHES A FROSTING-LIKE CONSISTENCY. REFRIGERATE UNTIL YOU'RE READY TO USE IT.",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "RESPIN IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE FROSTING",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE COOKIE DOUGH BITES AND SPRINKLES"
    ],
    "aliases": [
      "frosted_sugar_cookie_blizzard",
      "fan_favorites_frosted_sugar_cookie_blizzard_70"
    ]
  },
  {
    "id": "fruit_sorbet",
    "name": "Fruit Sorbet",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 86,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 57,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 86,
    "macros": {
      "calories": "116",
      "protein": "1g",
      "carbs": "20g",
      "fat": "0g",
      "sugar": "0g",
      "fiber": "0g"
    },
    "spinSetting": "Sorbet",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fruit_of_your_choice",
        "name": "Fruit Of Your Choice",
        "quantity": "1",
        "unit": "can",
        "raw": "1 CAN (~400 G) FRUIT OF YOUR CHOICE (MANGOS, PEACHES, PEARS, ETC.)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ~400 G; MANGOS, PEACHES, PEARS, ETC."
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "25",
        "unit": "g",
        "raw": "25G (2 TBSP) SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"SORBET\" OR \"SMOOTHIE BOWL\" SETTING (OR FRUIT WHIP IF YOU HAVE THE NEWER MACHINES)",
      "SPIN ON \"RESPIN\" SETTING UNTIL IT REACHES YOUR DESIRED TEXTURE"
    ],
    "aliases": [
      "fruit_sorbet",
      "no_protein_fruit_sorbet_86",
      "lactose_free_fruit_sorbet_57"
    ]
  },
  {
    "id": "fruity_pebbles",
    "name": "Fruity Pebbles",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 88,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 59,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 88,
    "macros": {
      "calories": "211",
      "protein": "22g",
      "carbs": "27g",
      "fat": "1g",
      "sugar": "17g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "fruity_pebbles",
        "name": "Fruity Pebbles",
        "quantity": "20",
        "unit": "g",
        "raw": "20G FRUITY PEBBLES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE FRUITY PEBBLES",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "fruity_pebbles",
      "no_protein_fruity_pebbles_88",
      "lactose_free_fruity_pebbles_59"
    ]
  },
  {
    "id": "gimme_smores",
    "name": "Gimme S'Mores",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 72,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 72,
    "macros": {
      "calories": "343",
      "protein": "32g",
      "carbs": "27g",
      "fat": "11g",
      "sugar": "15g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "toasted_mini_marshmallows",
        "name": "Toasted Mini Marshmallows",
        "quantity": "15",
        "unit": "g",
        "raw": "15G TOASTED MINI MARSHMALLOWS",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G CHOCOLATE CHIPS + 2G COCONUT OIL",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2G COCONUT OIL"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "2",
        "unit": "",
        "raw": "2 OREO THINS, CREAM REMOVED",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Cream removed"
      },
      {
        "id": "graham_cracker",
        "name": "Graham Cracker",
        "quantity": "½",
        "unit": "sheet",
        "raw": "½ SHEET OF A GRAHAM CRACKER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "TOAST THE MINI MARSHMALLOWS",
      "BLEND ALL INGREDIENTS FOR THE BASE (MARSHMALLOWS INCLUDED) AND FREEZE (AT LEAST 16 HOURS)",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "RESPIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE AND OREOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE MINI MARSHMALLOWS AND CRUMBLED UP GRAHAM CRACKER"
    ],
    "aliases": [
      "gimme_smores",
      "fan_favorites_gimme_s_mores_72"
    ]
  },
  {
    "id": "glampfire_trail_mix",
    "name": "Glampfire Trail Mix",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 74,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 74,
    "macros": {
      "calories": "304",
      "protein": "35g",
      "carbs": "25g",
      "fat": "9g",
      "sugar": "12g",
      "fiber": "6g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_covered_almonds",
        "name": "Chocolate Covered Almonds",
        "quantity": "10",
        "unit": "g",
        "raw": "10G CHOCOLATE COVERED ALMONDS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "pretzels",
        "name": "Pretzels",
        "quantity": "10",
        "unit": "g",
        "raw": "10G PRETZELS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "10",
        "unit": "g",
        "raw": "10G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE ALMONDS, PRETZELS, AND ¾ OF THE MARSHMALLOWS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE REMAINING MARSHMALLOWS"
    ],
    "aliases": [
      "glampfire_trail_mix",
      "fan_favorites_glampfire_trail_mix_74"
    ]
  },
  {
    "id": "gooey_butter_cake",
    "name": "Gooey Butter Cake",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 76,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 76,
    "macros": {
      "calories": "318",
      "protein": "32g",
      "carbs": "20g",
      "fat": "10g",
      "sugar": "18g",
      "fiber": "1g"
    },
    "spinSetting": "Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "whipped_cream_cheese",
        "name": "Whipped Cream Cheese",
        "quantity": "22",
        "unit": "g",
        "raw": "22G (2 TBSP) WHIPPED (OR REGULAR) CREAM CHEESE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; OR REGULAR"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_blondie_style_brownie",
        "name": "Prime Bites Blondie-Style Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES BLONDIE-STYLE BROWNIE (I USED THE BIRTHDAY CAKE FLAVOR)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE BIRTHDAY CAKE FLAVOR"
      },
      {
        "id": "caramel_syrup",
        "name": "Caramel Syrup",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "AT THE SAME TIME, PUT THE BROWNIE INTO THE FREEZER. THIS ALLOWS IT TO FIRM UP AND WITHSTAND THE POWER OF THE MIX-IN SETTING (SO IT DOESN'T GET COMPLETELY PULVERIZED)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND ADD THE FROZEN BROWNIE",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CARAMEL SYRUP"
    ],
    "aliases": [
      "gooey_butter_cake",
      "fan_favorites_gooey_butter_cake_76"
    ]
  },
  {
    "id": "grape_sorbet",
    "name": "Grape Sorbet",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 90,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 61,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 90,
    "macros": {
      "calories": "100",
      "protein": "1g",
      "carbs": "24g",
      "fat": "0g",
      "sugar": "22g",
      "fiber": "1g"
    },
    "spinSetting": "Sorbet",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "green_grapes",
        "name": "Green Grapes",
        "quantity": "1-1.5",
        "unit": "cups",
        "raw": "1-1.5 CUPS OF GREEN (OR RED) GRAPES",
        "section": "Base",
        "isMixin": false,
        "notes": "OR RED"
      },
      {
        "id": "sprite_zero",
        "name": "Sprite Zero",
        "quantity": "To fill line",
        "unit": "",
        "raw": "SPRITE ZERO UNTIL THE FILL LINE",
        "section": "Base",
        "isMixin": false,
        "notes": "Until the fill line"
      }
    ],
    "instructions": [
      "POUR WASHED GRAPES INTO YOUR PINT",
      "COVER WITH SPRITE ZERO UNTIL YOU REACH THE FILL LINE",
      "MIX AROUND UNTIL MOST OF THE CARBONATION GOES AWAY",
      "FREEZE YOUR PINT FOR AT LEAST 16 HOURS",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"SORBET\" SETTING",
      "SPIN ON \"RESPIN\" SETTING UNTIL IT REACHES YOUR DESIRED TEXTURE 22G SUGAR 1G FIBER"
    ],
    "aliases": [
      "grape_sorbet",
      "no_protein_grape_sorbet_90",
      "lactose_free_grape_sorbet_61"
    ]
  },
  {
    "id": "half_baked",
    "name": "Half Baked",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 78,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 78,
    "macros": {
      "calories": "372",
      "protein": "46g",
      "carbs": "20g",
      "fat": "11g",
      "sugar": "7g",
      "fiber": "6g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES PROTEIN BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "⅓",
        "unit": "",
        "raw": "⅓ OF A PACKAGE OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH COOKIE DOUGH AND BROWNIE PIECES"
    ],
    "aliases": [
      "half_baked",
      "fan_favorites_half_baked_78"
    ]
  },
  {
    "id": "half_baked_twist",
    "name": "Half Baked (Twist)",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 80,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 80,
    "macros": {
      "calories": "369",
      "protein": "38g",
      "carbs": "27g",
      "fat": "9g",
      "sugar": "15g",
      "fiber": "7g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "4 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "20",
        "unit": "g",
        "raw": "20G OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES PROTEIN BROWNIE, CHOPPED INTO BITE SIZE CUBES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped into bite size cubes"
      },
      {
        "id": "low_calorie_chocolate_ganache",
        "name": "Low Calorie Chocolate Ganache",
        "quantity": "45",
        "unit": "g",
        "raw": "45G (2 TBSP) LOW CALORIE CHOCOLATE GANACHE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 2 TBSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "PREP YOUR CHOCOLATE GANACHE",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE GANACHE",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE BROWNIE PIECES AND COOKIE DOUGH BITES"
    ],
    "aliases": [
      "half_baked_twist",
      "fan_favorites_half_baked_twist_80"
    ]
  },
  {
    "id": "horchata",
    "name": "Horchata",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 92,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 63,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 92,
    "macros": {
      "calories": "139",
      "protein": "22g",
      "carbs": "12g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "3",
        "unit": "g",
        "raw": "3G (½ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 10G SUGAR 1G FIBER"
    ],
    "aliases": [
      "horchata",
      "no_protein_horchata_92",
      "lactose_free_horchata_63"
    ]
  },
  {
    "id": "hot_cocoa",
    "name": "Hot Cocoa",
    "category": "Lactose Free",
    "categories": [
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Lactose Free",
        "page": 65,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "lactose free 8-6.pdf",
    "page": 65,
    "macros": {
      "calories": "273",
      "protein": "33g",
      "carbs": "32g",
      "fat": "4g",
      "sugar": "21g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "lactose_free_chocolate_protein_shake",
        "name": "Lactose-Free Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 LACTOSE-FREE CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "mini_marshmallows",
        "name": "Mini Marshmallows",
        "quantity": "30",
        "unit": "g",
        "raw": "30G MINI MARSHMALLOWS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH HALF OF YOUR MARSHMALLOWS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE REMAINING MARSHMALLOWS"
    ],
    "aliases": [
      "hot_cocoa",
      "lactose_free_hot_cocoa_65"
    ]
  },
  {
    "id": "impretzively_fudged",
    "name": "Impretzively Fudged",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 82,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 82,
    "macros": {
      "calories": "270",
      "protein": "34g",
      "carbs": "18g",
      "fat": "8g",
      "sugar": "9g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_covered_pretzels",
        "name": "Chocolate Covered Pretzels",
        "quantity": "21",
        "unit": "g",
        "raw": "21G CHOCOLATE COVERED PRETZELS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "flaky_salt",
        "name": "Flaky Salt",
        "quantity": "",
        "unit": "",
        "raw": "FLAKY SALT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE PRETZELS",
      "RUN THE \"MIX-IN\" CYCLE",
      "SPRINKLE WITH FLAKY SALT"
    ],
    "aliases": [
      "impretzively_fudged",
      "fan_favorites_impretzively_fudged_82"
    ]
  },
  {
    "id": "jamoca_almond_fudge",
    "name": "Jamoca Almond Fudge",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 84,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 36,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 84,
    "macros": {
      "calories": "318",
      "protein": "34g",
      "carbs": "4g",
      "fat": "17g",
      "sugar": "2g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "espresso",
        "name": "Espresso",
        "quantity": "1",
        "unit": "shot",
        "raw": "1 SHOT ESPRESSO (FEEL FREE TO SUB FOR 1 TBSP OF INSTANT COFFEE OR A COMETEER POD)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: FEEL FREE TO SUB FOR 1 TBSP OF INSTANT COFFEE OR A COMETEER POD"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "(OPTIONAL) 5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Optional; Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G CHOCOLATE CHIPS (60 CAL) MIXED WITH 2G OF COCONUT OIL (27 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "60 CAL; 27 CAL; MIXED WITH 2G OF COCONUT OIL"
      },
      {
        "id": "salted_almonds",
        "name": "Salted Almonds",
        "quantity": "15",
        "unit": "",
        "raw": "15 SALTED ALMONDS, CHOPPED",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE ALMONDS AND MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "jamoca_almond_fudge",
      "fan_favorites_jamoca_almond_fudge_84",
      "keto_jamoca_almond_fudge_36"
    ]
  },
  {
    "id": "key_lime_pie",
    "name": "Key Lime Pie",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 86,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 94,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 86,
    "macros": {
      "calories": "265",
      "protein": "21g",
      "carbs": "37g",
      "fat": "4g",
      "sugar": "19g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "350",
        "unit": "g",
        "raw": "350G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "lime_juice",
        "name": "Lime Juice",
        "quantity": "2",
        "unit": "limes",
        "raw": "THE JUICE OF 2 LIMES (SHOULD BE ~75G)",
        "section": "Base",
        "isMixin": false,
        "notes": "Should be ~75g"
      },
      {
        "id": "lime_zest",
        "name": "Lime Zest",
        "quantity": "2",
        "unit": "limes",
        "raw": "THE ZEST OF THE SAME 2 LIMES",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "45",
        "unit": "g",
        "raw": "45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "teddy_grahams",
        "name": "Teddy Grahams",
        "quantity": "28",
        "unit": "g",
        "raw": "28G (1 SMALL PACKAGE) TEDDY GRAHAMS (CAN SUB FOR GRAHAM CRACKERS)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "1 SMALL PACKAGE; CAN SUB FOR GRAHAM CRACKERS"
      },
      {
        "id": "fat_free_reddi_wip",
        "name": "Fat Free Reddi-Wip",
        "quantity": "10",
        "unit": "g",
        "raw": "10G (2 TBSP) FAT FREE REDDIWIP (CAN SUB WITH ANY WHIPPED CREAM)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 2 TBSP; CAN SUB WITH ANY WHIPPED CREAM"
      }
    ],
    "instructions": [],
    "aliases": [
      "key_lime_pie",
      "fan_favorites_key_lime_pie_86",
      "no_protein_key_lime_pie_94"
    ]
  },
  {
    "id": "lights_caramel_action",
    "name": "Lights Caramel Action",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 88,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 88,
    "macros": {
      "calories": "289",
      "protein": "36g",
      "carbs": "24g",
      "fat": "6g",
      "sugar": "9g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "⅓",
        "unit": "",
        "raw": "⅓ OF A PACKAGE OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "graham_cracker",
        "name": "Graham Cracker",
        "quantity": "½",
        "unit": "sheet",
        "raw": "½ SHEET OF A GRAHAM CRACKER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "caramel_syrup",
        "name": "Caramel Syrup",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE COOKIE DOUGH AND CRUMBLED GRAHAM CRACKER",
      "DRIZZLE WITH CARAMEL SYRUP"
    ],
    "aliases": [
      "lights_caramel_action",
      "fan_favorites_lights_caramel_action_88"
    ]
  },
  {
    "id": "mango_and_cream",
    "name": "Mango & Cream",
    "category": "Lactose Free",
    "categories": [
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Lactose Free",
        "page": 67,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "lactose free 8-6.pdf",
    "page": 67,
    "macros": {
      "calories": "230",
      "protein": "31g",
      "carbs": "20g",
      "fat": "3g",
      "sugar": "19g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "lactose_free_vanilla_protein_shake",
        "name": "Lactose-Free Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 LACTOSE-FREE VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "mango",
        "name": "Mango",
        "quantity": "140",
        "unit": "g",
        "raw": "140G MANGO (CANNED, FRESH, OR FROZEN)",
        "section": "Base",
        "isMixin": false,
        "notes": "CANNED, FRESH, OR FROZEN"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "15-20",
        "unit": "g",
        "raw": "15-20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "mango_and_cream",
      "lactose_free_mango_and_cream_67"
    ]
  },
  {
    "id": "maple",
    "name": "Maple",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 98,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 69,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 98,
    "macros": {
      "calories": "145",
      "protein": "22g",
      "carbs": "15g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "25-30",
        "unit": "g",
        "raw": "25-30G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "sugar_free_syrup",
        "name": "Sugar Free Syrup",
        "quantity": "30",
        "unit": "g",
        "raw": "30G SUGAR FREE SYRUP",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "maple",
      "no_protein_maple_98",
      "lactose_free_maple_69"
    ]
  },
  {
    "id": "marshmallow_sky",
    "name": "Marshmallow Sky",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 92,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 100,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 92,
    "macros": {
      "calories": "332",
      "protein": "29g",
      "carbs": "45g",
      "fat": "4g",
      "sugar": "25g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "mini_marshmallows",
        "name": "Mini Marshmallows",
        "quantity": "15",
        "unit": "g",
        "raw": "15G MINI MARSHMALLOWS",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "blue_food_coloring",
        "name": "Blue Food Coloring",
        "quantity": "1-2",
        "unit": "drops",
        "raw": "1-2 DROPS BLUE FOOD COLORING (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PACKAGE OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "5",
        "unit": "g",
        "raw": "5G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE (MARSHMALLOWS INCLUDED) AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE COOKIE DOUGH BITES AND MARSHMALLOWS, AND MIX IN BY HAND"
    ],
    "aliases": [
      "marshmallow_sky",
      "fan_favorites_marshmallow_sky_92",
      "no_protein_marshmallow_sky_100"
    ]
  },
  {
    "id": "matcha",
    "name": "Matcha",
    "category": "Keto",
    "categories": [
      "Keto",
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 38,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 102,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 71,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 38,
    "macros": {
      "calories": "145",
      "protein": "22g",
      "carbs": "11g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "matcha",
        "name": "Matcha",
        "quantity": "4",
        "unit": "g",
        "raw": "4G (2 TSP) MATCHA",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TSP"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "matcha",
      "keto_matcha_38",
      "no_protein_matcha_102",
      "lactose_free_matcha_71"
    ]
  },
  {
    "id": "matcha_oreo",
    "name": "Matcha Oreo",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 104,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 73,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 104,
    "macros": {
      "calories": "243",
      "protein": "23g",
      "carbs": "30g",
      "fat": "2g",
      "sugar": "18g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "matcha",
        "name": "Matcha",
        "quantity": "4",
        "unit": "g",
        "raw": "4G (2 TSP) MATCHA",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TSP"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "(OPTIONAL) 5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Optional; Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "5",
        "unit": "",
        "raw": "5 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "matcha_oreo",
      "no_protein_matcha_oreo_104",
      "lactose_free_matcha_oreo_73"
    ]
  },
  {
    "id": "mexican_chocolate",
    "name": "Mexican Chocolate",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 40,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 75,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 40,
    "macros": {
      "calories": "175",
      "protein": "32g",
      "carbs": "5g",
      "fat": "4g",
      "sugar": "2g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "2",
        "unit": "g",
        "raw": "2G (½ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "cayenne_pepper",
        "name": "Cayenne Pepper",
        "quantity": "2-3",
        "unit": "sprinkles",
        "raw": "2-3 SPRINKLES CAYENNE PEPPER (BE CAREFUL WITH THIS! IT GETS VERY SPICY VERY FAST)",
        "section": "Base",
        "isMixin": false,
        "notes": "BE CAREFUL WITH THIS! IT GETS VERY SPICY VERY FAST"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 2G SUGAR 5G FIBER"
    ],
    "aliases": [
      "mexican_chocolate",
      "keto_mexican_chocolate_40",
      "lactose_free_mexican_chocolate_75"
    ]
  },
  {
    "id": "milk_and_cookies",
    "name": "Milk & Cookies",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 94,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 106,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 94,
    "macros": {
      "calories": "308",
      "protein": "30g",
      "carbs": "35g",
      "fat": "5g",
      "sugar": "16g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PACKAGE OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "2",
        "unit": "",
        "raw": "2 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE COOKIE DOUGH BITES"
    ],
    "aliases": [
      "milk_and_cookies",
      "fan_favorites_milk_and_cookies_94",
      "no_protein_milk_and_cookies_106"
    ]
  },
  {
    "id": "mint_chocolate_chip",
    "name": "Mint Chocolate Chip",
    "category": "Keto",
    "categories": [
      "Keto",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 42,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 108,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 42,
    "macros": {
      "calories": "211",
      "protein": "23g",
      "carbs": "11g",
      "fat": "7g",
      "sugar": "10g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "peppermint_extract",
        "name": "Peppermint Extract",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP (5-6 DROPS) PEPPERMINT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "5-6 DROPS"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "½",
        "unit": "tsp",
        "raw": "½ TSP VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G CHOCOLATE CHIPS (60 CAL) MIXED WITH 2G OF COCONUT OIL (27 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "60 CAL; 27 CAL; MIXED WITH 2G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "mint_chocolate_chip",
      "keto_mint_chocolate_chip_42",
      "no_protein_mint_chocolate_chip_108"
    ]
  },
  {
    "id": "minter_wonderland",
    "name": "Minter Wonderland",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 96,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 96,
    "macros": {
      "calories": "294",
      "protein": "35g",
      "carbs": "29g",
      "fat": "7g",
      "sugar": "15g",
      "fiber": "8g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "black_cocoa_powder",
        "name": "Black Cocoa Powder",
        "quantity": "20",
        "unit": "g",
        "raw": "20G BLACK COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "peppermint_extract",
        "name": "Peppermint Extract",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP PEPPERMINT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "3",
        "unit": "",
        "raw": "3 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "10",
        "unit": "g",
        "raw": "10G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS AND HALF OF THE MARSHMALLOWS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE REST OF THE MARSHMALLOWS"
    ],
    "aliases": [
      "minter_wonderland",
      "fan_favorites_minter_wonderland_96"
    ]
  },
  {
    "id": "mandm",
    "name": "M&M",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 96,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 96,
    "macros": {
      "calories": "207",
      "protein": "23g",
      "carbs": "21g",
      "fat": "3g",
      "sugar": "20g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "mandms",
        "name": "M&M's",
        "quantity": "15",
        "unit": "g",
        "raw": "15G M&M’S (I LIKE THE MINI M&M’S BECAUSE YOU GET MORE QUANTITY FOR THE SAME WEIGHT)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I LIKE THE MINI M&M’S BECAUSE YOU GET MORE QUANTITY FOR THE SAME WEIGHT"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH M&M'S AND MIX IN BY HAND"
    ],
    "aliases": [
      "mandm",
      "no_protein_mandm_96"
    ]
  },
  {
    "id": "mandm_mcflurry",
    "name": "M&M Mcflurry",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 90,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 90,
    "macros": {
      "calories": "207",
      "protein": "23g",
      "carbs": "21g",
      "fat": "3g",
      "sugar": "20g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "mandms",
        "name": "M&M's",
        "quantity": "15",
        "unit": "g",
        "raw": "15G M&M’S (I LIKE THE MINI M&M’S BECAUSE YOU GET MORE QUANTITY FOR THE SAME WEIGHT)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I LIKE THE MINI M&M’S BECAUSE YOU GET MORE QUANTITY FOR THE SAME WEIGHT"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH M&M'S AND MIX IN BY HAND"
    ],
    "aliases": [
      "mandm_mcflurry",
      "fan_favorites_mandm_mcflurry_90"
    ]
  },
  {
    "id": "mocha",
    "name": "Mocha",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 44,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 77,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 44,
    "macros": {
      "calories": "175",
      "protein": "32g",
      "carbs": "5g",
      "fat": "4g",
      "sugar": "2g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "espresso",
        "name": "Espresso",
        "quantity": "1",
        "unit": "shot",
        "raw": "1 SHOT OF ESPRESSO (CAN SUB WITH 3-5G OF ESPRESSO POWDER)",
        "section": "Base",
        "isMixin": false,
        "notes": "CAN SUB WITH 3-5G OF ESPRESSO POWDER"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "mocha",
      "keto_mocha_44",
      "lactose_free_mocha_77"
    ]
  },
  {
    "id": "moose_tracks",
    "name": "Moose Tracks",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 110,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 110,
    "macros": {
      "calories": "291",
      "protein": "24g",
      "carbs": "18g",
      "fat": "13g",
      "sugar": "15g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "peanut_butter_cups",
        "name": "Peanut Butter Cups",
        "quantity": "1",
        "unit": "",
        "raw": "1 PEANUT BUTTER CUP, CHOPPED (~15G OR 80 CALORIES WORTH)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "~15G OR 80 CALORIES WORTH; Chopped"
      },
      {
        "id": "sugar_free_chocolate_chips",
        "name": "Sugar-Free Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G SUGAR-FREE CHOCOLATE CHIPS (60 CAL) MIXED WITH 2G OF COCONUT OIL (27 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "60 CAL; 27 CAL; MIXED WITH 2G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CHOPPED PEANUT BUTTER CUPS"
    ],
    "aliases": [
      "moose_tracks",
      "no_protein_moose_tracks_110"
    ]
  },
  {
    "id": "netflix_and_chilld",
    "name": "Netflix & Chill'd",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 98,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 112,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 98,
    "macros": {
      "calories": "389",
      "protein": "41g",
      "carbs": "26g",
      "fat": "11g",
      "sugar": "18g",
      "fiber": "4g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "peanut_butter",
        "name": "Peanut Butter",
        "quantity": "8",
        "unit": "g",
        "raw": "8G (½ TBSP) PEANUT BUTTER",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TBSP"
      },
      {
        "id": "peanut_butter_powder",
        "name": "Peanut Butter Powder",
        "quantity": "16",
        "unit": "g",
        "raw": "16G (2 TBSP) PPEANUT BUTTER POWDER (LIKE PBFIT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; LIKE PBFIT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "pretzels",
        "name": "Pretzels",
        "quantity": "10",
        "unit": "g",
        "raw": "10G CRUSHED UP PRETZELS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Crushed"
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES PROTEIN BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH PRETZELS AND CRUMBLED UP BROWNIE PIECES"
    ],
    "aliases": [
      "netflix_and_chilld",
      "fan_favorites_netflix_and_chill_d_98",
      "no_protein_netflix_and_chill_d_112"
    ]
  },
  {
    "id": "new_york_super_fudge_chunk",
    "name": "New York Super Fudge Chunk",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 100,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 46,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 100,
    "macros": {
      "calories": "320",
      "protein": "35g",
      "carbs": "10g",
      "fat": "16g",
      "sugar": "7g",
      "fiber": "7g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "white_chocolate_chips",
        "name": "White Chocolate Chips",
        "quantity": "5",
        "unit": "g",
        "raw": "5G WHITE CHOCOLATE CHIPS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "dark_chocolate_chips",
        "name": "Dark Chocolate Chips",
        "quantity": "5",
        "unit": "g",
        "raw": "5G DARK CHOCOLATE CHIPS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "pecans",
        "name": "Pecans",
        "quantity": "5",
        "unit": "g",
        "raw": "5G CHOPPED PECANS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped"
      },
      {
        "id": "walnuts",
        "name": "Walnuts",
        "quantity": "5",
        "unit": "g",
        "raw": "5G CHOPPED WALNUTS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped"
      },
      {
        "id": "chocolate_covered_almonds",
        "name": "Chocolate Covered Almonds",
        "quantity": "6",
        "unit": "g",
        "raw": "6G CHOCOLATE COVERED ALMONDS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE MIX-INS AND MIX IN BY HAND"
    ],
    "aliases": [
      "new_york_super_fudge_chunk",
      "fan_favorites_new_york_super_fudge_chunk_100",
      "keto_new_york_super_fudge_chunk_46"
    ]
  },
  {
    "id": "nutella",
    "name": "Nutella",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 102,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 102,
    "macros": {
      "calories": "273",
      "protein": "33g",
      "carbs": "16g",
      "fat": "9g",
      "sugar": "12g",
      "fiber": "6g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "nutella",
        "name": "Nutella",
        "quantity": "18",
        "unit": "g",
        "raw": "18G (1 TBSP) NUTELLA",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TBSP"
      },
      {
        "id": "hazelnut_syrup",
        "name": "Hazelnut Syrup",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) HAZELNUT SYRUP (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OPTIONAL"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 12G SUGAR 6G FIBER"
    ],
    "aliases": [
      "nutella",
      "fan_favorites_nutella_102"
    ]
  },
  {
    "id": "oatmeal_cream_pie",
    "name": "Oatmeal Cream Pie",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 114,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 114,
    "macros": {
      "calories": "283",
      "protein": "23g",
      "carbs": "34g",
      "fat": "5g",
      "sugar": "23g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "4 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "cinnamon",
        "name": "Cinnamon",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) CINNAMON",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oatmeal_cream_pie",
        "name": "Oatmeal Cream Pie",
        "quantity": "¾",
        "unit": "",
        "raw": "¾ OF AN OATMEAL CREAM PIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "5",
        "unit": "g",
        "raw": "5G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "1-2 HOURS BEFORE YOU MAKE YOUR ICE CREAM, PUT THE OATMEAL CREAM PIE IN THE FREEZER. THIS ALLOWS IT TO FIRM UP AND WITHSTAND THE POWER OF THE MIX-IN SETTING (SO IT DOESN'T GET COMPLETELY PULVERIZED)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE, AND ADD ½ OF THE OATMEAL CREAM PIE",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE MARSHMALLOWS AND THE REST OF THE OATMEAL CREAM PIE"
    ],
    "aliases": [
      "oatmeal_cream_pie",
      "no_protein_oatmeal_cream_pie_114"
    ]
  },
  {
    "id": "oat_of_this_swirled",
    "name": "Oat Of This Swirled",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 104,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 104,
    "macros": {
      "calories": "288",
      "protein": "32g",
      "carbs": "12g",
      "fat": "11g",
      "sugar": "4g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "brown_sugar_sweetener",
        "name": "Brown Sugar Sweetener",
        "quantity": "25",
        "unit": "g",
        "raw": "25G BROWN SUGAR SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "butter_extract",
        "name": "Butter Extract",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) BUTTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G CHOCOLATE CHIPS + 2G COCONUT OIL",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2G COCONUT OIL"
      },
      {
        "id": "made_good_cinnamon_bun_baked_oat_bar",
        "name": "Made Good Cinnamon Bun Baked Oat Bar",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A MADE GOOD CINNAMON BUN BAKED OAT BAR (OR SIMILAR COOKIE SWIRL REPLACEMENT - ABOUT 60 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "OR SIMILAR COOKIE SWIRL REPLACEMENT - ABOUT 60 CAL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE",
      "CRUMBLE THE BAR ON TOP"
    ],
    "aliases": [
      "oat_of_this_swirled",
      "fan_favorites_oat_of_this_swirled_104"
    ]
  },
  {
    "id": "one_love",
    "name": "One Love",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 106,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 116,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 106,
    "macros": {
      "calories": "329",
      "protein": "24g",
      "carbs": "37g",
      "fat": "7g",
      "sugar": "26g",
      "fiber": "4g"
    },
    "spinSetting": "Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "1",
        "unit": "medium",
        "raw": "1 MEDIUM SIZE BANANA (~100G)",
        "section": "Base",
        "isMixin": false,
        "notes": "~100G"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G CHOCOLATE CHIPS + 2G COCONUT OIL",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2G COCONUT OIL"
      },
      {
        "id": "graham_cracker",
        "name": "Graham Cracker",
        "quantity": "3",
        "unit": "g",
        "raw": "3G CRUSHED GRAHAM CRACKER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Crushed"
      },
      {
        "id": "caramel_syrup",
        "name": "Caramel Syrup",
        "quantity": "5",
        "unit": "g",
        "raw": "5G CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CRUMBLED GRAHAM CRACKER",
      "DRIZZLE WITH CARAMEL SYRUP"
    ],
    "aliases": [
      "one_love",
      "fan_favorites_one_love_106",
      "no_protein_one_love_116"
    ]
  },
  {
    "id": "orange_creamsicle",
    "name": "Orange Creamsicle",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 118,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 79,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 118,
    "macros": {
      "calories": "205",
      "protein": "17g",
      "carbs": "36g",
      "fat": "0g",
      "sugar": "30g",
      "fiber": "6g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "oranges_or_orange_juice",
        "name": "Oranges Or Orange Juice",
        "quantity": "250",
        "unit": "g",
        "raw": "250G ORANGES OR ORANGE JUICE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "250",
        "unit": "g",
        "raw": "250G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_extract",
        "name": "Vanilla Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF NECESSARY"
    ],
    "aliases": [
      "orange_creamsicle",
      "no_protein_orange_creamsicle_118",
      "lactose_free_orange_creamsicle_79"
    ]
  },
  {
    "id": "oreo_mcflurry",
    "name": "Oreo Mcflurry",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 108,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 120,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 108,
    "macros": {
      "calories": "233",
      "protein": "23g",
      "carbs": "29g",
      "fat": "4g",
      "sugar": "18g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "5",
        "unit": "",
        "raw": "5 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "oreo_mcflurry",
      "fan_favorites_oreo_mcflurry_108",
      "no_protein_oreo_mcflurry_120"
    ]
  },
  {
    "id": "pb_over_the_top",
    "name": "Pb Over The Top",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 110,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 110,
    "macros": {
      "calories": "80",
      "protein": "38g",
      "carbs": "15g",
      "fat": "18g",
      "sugar": "7g",
      "fiber": "10g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE PEANUT BUTTER SWIRL HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF PEANUT BUTTER CHIPS WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO A PERFECT, CREAMY PEANUT BUTTER SWIRL.",
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "peanut_butter_chips",
        "name": "Peanut Butter Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G PEANUT BUTTER CHIPS + 2G COCONUT OIL + A",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2G COCONUT OIL + A"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "Pinch",
        "unit": "pinch",
        "raw": "PINCH OF SALT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "peanut_butter_cups",
        "name": "Peanut Butter Cups",
        "quantity": "1",
        "unit": "",
        "raw": "1 PEANUT BUTTER CUP, CHOPPED (~15G OR 80 CALORIES WORTH)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "~15G OR 80 CALORIES WORTH; Chopped"
      },
      {
        "id": "low_calorie_chocolate_ganache",
        "name": "Low Calorie Chocolate Ganache",
        "quantity": "30",
        "unit": "g",
        "raw": "30G (2 TBSP) LOW CALORIE CHOCOLATE GANACHE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 2 TBSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "PREP YOUR CHOCOLATE GANACHE (INGREDIENTS ABOVE)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH CHOPPED UP THE MELTED PEANUT BUTTER CHIPS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CHOCOLATE GANACHE AND PEANUT BUTTER CUP PIECES"
    ],
    "aliases": [
      "pb_over_the_top",
      "fan_favorites_pb_over_the_top_110"
    ]
  },
  {
    "id": "peaches_and_cream_frozen_yogurt",
    "name": "Peaches And Cream Frozen Yogurt",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 122,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 122,
    "macros": {
      "calories": "271",
      "protein": "28g",
      "carbs": "37g",
      "fat": "0g",
      "sugar": "29g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "peaches",
        "name": "Peaches",
        "quantity": "1",
        "unit": "cup",
        "raw": "1 CUP PEACHES (CANNED, FRESH, OR FROZEN)",
        "section": "Base",
        "isMixin": false,
        "notes": "CANNED, FRESH, OR FROZEN"
      },
      {
        "id": "high_protein_vanilla_yogurt",
        "name": "High Protein Vanilla Yogurt",
        "quantity": "150",
        "unit": "g",
        "raw": "150G (1 SMALL CONTAINER) HIGH PROTEIN VANILLA YOGURT",
        "section": "Base",
        "isMixin": false,
        "notes": "1 SMALL CONTAINER"
      },
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "240",
        "unit": "g",
        "raw": "240G (1 CUP) FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 CUP"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "25",
        "unit": "g",
        "raw": "25G (2 TBSP) SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING (OR FROZEN YOGURT IF YOU HAVE THE NEWER MACHINES)",
      "SPIN ON \"RESPIN\" SETTING UNTIL IT REACHES YOUR DESIRED TEXTURE IF YOU HAVE THE NINJA SWIRL, FOLLOW THESE EXTRA STEPS:",
      "REPLACE THE SPINNING PADDLE WITH THE DISPENSING LID",
      "PLACE THE PINT INTO THE SOFT SERVE SIDE OF THE SWIRL AND LOCK INTO PLACE",
      "OPEN THE NOZZLE OF THE LID",
      "DISPENSE!! 29G SUGAR 1G FIBER"
    ],
    "aliases": [
      "peaches_and_cream_frozen_yogurt",
      "no_protein_peaches_and_cream_frozen_yogurt_122"
    ]
  },
  {
    "id": "peanut_butter_cup",
    "name": "Peanut Butter Cup",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 112,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 124,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 112,
    "macros": {
      "calories": "328",
      "protein": "32g",
      "carbs": "24g",
      "fat": "11g",
      "sugar": "23g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "peanut_butter",
        "name": "Peanut Butter",
        "quantity": "8",
        "unit": "g",
        "raw": "8G (½ TBSP) PEANUT BUTTER",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TBSP"
      },
      {
        "id": "pb_fit",
        "name": "PB Fit",
        "quantity": "16",
        "unit": "g",
        "raw": "16G (2 TBSP) PB FIT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "peanut_butter_cups",
        "name": "Peanut Butter Cups",
        "quantity": "17",
        "unit": "g",
        "raw": "17G CHOPPED PEANUT BUTTER CUPS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE CHOPPED UP PB CUPS 23G SUGAR 3G FIBER PEANUT BUTTER CUP PEANUT BUTTER CUP PEANUT BUTTER CUP 17G CHOPPED PEANUT BUTTER CUPS"
    ],
    "aliases": [
      "peanut_butter_cup",
      "fan_favorites_peanut_butter_cup_112",
      "no_protein_peanut_butter_cup_124"
    ]
  },
  {
    "id": "peanut_butter_half_baked",
    "name": "Peanut Butter Half Baked",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 114,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 126,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 114,
    "macros": {
      "calories": "389",
      "protein": "41g",
      "carbs": "28g",
      "fat": "11g",
      "sugar": "19g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "FREEZE YOUR COOKIE DOUGH BITES AND BROWNIE PIECES BEFORE USING THEM AS MIX-INS. THEY STAY INTACT INSTEAD OF GETTING CRUSHED DURING THE MIX-IN CYCLE.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "peanut_butter",
        "name": "Peanut Butter",
        "quantity": "8",
        "unit": "g",
        "raw": "8G (½ TBSP) PEANUT BUTTER",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TBSP"
      },
      {
        "id": "peanut_butter_powder",
        "name": "Peanut Butter Powder",
        "quantity": "16",
        "unit": "g",
        "raw": "16G (2 TBSP) PEANUT BUTTER POWDER (LIKE PBFIT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; LIKE PBFIT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "20",
        "unit": "g",
        "raw": "20G OF THE FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "⅓",
        "unit": "",
        "raw": "⅓ OF A PRIME BITES PROTEIN BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASES AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN EACH ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH CHOPPED BROWNIE AND COOKIE DOUGH BITES (I HIGHLY RECOMMEND FREEZING THESE CHOPPED MIX-INS FOR 1HR+ BEFORE USING THEM - THIS ENSURES THEY STAY INTACT WHEN USING THE MIX- IN FUNCTION)",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "peanut_butter_half_baked",
      "fan_favorites_peanut_butter_half_baked_114",
      "no_protein_peanut_butter_half_baked_126"
    ]
  },
  {
    "id": "peanut_butter_oreo",
    "name": "Peanut Butter Oreo",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 128,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 128,
    "macros": {
      "calories": "345",
      "protein": "31g",
      "carbs": "31g",
      "fat": "10g",
      "sugar": "24g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "peanut_butter",
        "name": "Peanut Butter",
        "quantity": "8",
        "unit": "g",
        "raw": "8G (½ TBSP) PEANUT BUTTER",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TBSP"
      },
      {
        "id": "pb_fit",
        "name": "PB Fit",
        "quantity": "16",
        "unit": "g",
        "raw": "16G (2 TBSP) PB FIT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "3",
        "unit": "",
        "raw": "3 OREO THINS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "peanut_butter_oreo",
      "no_protein_peanut_butter_oreo_128"
    ]
  },
  {
    "id": "peanut_butter_world",
    "name": "Peanut Butter World",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 116,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 48,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 116,
    "macros": {
      "calories": "301",
      "protein": "35g",
      "carbs": "13g",
      "fat": "11g",
      "sugar": "5g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "2",
        "unit": "",
        "raw": "2 OREO THINS, CREAM REMOVED",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Cream removed"
      },
      {
        "id": "peanut_butter_chips",
        "name": "Peanut Butter Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G PEANUT BUTTER CHIPS + 2G COCONUT OIL +",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2G COCONUT OIL"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "RESPIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH OREOS AND MELTED PEANUT BUTTER CHIPS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "peanut_butter_world",
      "fan_favorites_peanut_butter_world_116",
      "keto_peanut_butter_world_48"
    ]
  },
  {
    "id": "pecan_pie",
    "name": "Pecan Pie",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 130,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 81,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 130,
    "macros": {
      "calories": "291",
      "protein": "23g",
      "carbs": "29g",
      "fat": "8g",
      "sugar": "20g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "brown_sugar_sweetener",
        "name": "Brown Sugar Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G BROWN SUGAR SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "pecan_pralines",
        "name": "Pecan Pralines",
        "quantity": "10",
        "unit": "g",
        "raw": "10G PECAN PRALINES (OR REGULAR PECANS)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "OR REGULAR PECANS"
      },
      {
        "id": "pie_crust",
        "name": "Pie Crust",
        "quantity": "1",
        "unit": "mini",
        "raw": "1 MINI PIE CRUST (100 CALORIES)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "100 CALORIES"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE CHOPPED PECANS AND PIE CRUST",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "pecan_pie",
      "no_protein_pecan_pie_130",
      "lactose_free_pecan_pie_81"
    ]
  },
  {
    "id": "peppermint",
    "name": "Peppermint",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 132,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 83,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 132,
    "macros": {
      "calories": "135",
      "protein": "22g",
      "carbs": "10g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "peppermint_extract",
        "name": "Peppermint Extract",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP PEPPERMINT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "peppermint_bark_skinny_syrups",
        "name": "Peppermint Bark Skinny Syrups",
        "quantity": "1",
        "unit": "tsp",
        "raw": "1 TSP PEPPERMINT BARK SKINNY SYRUPS (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "peppermint",
      "no_protein_peppermint_132",
      "lactose_free_peppermint_83"
    ]
  },
  {
    "id": "peppermint_bark",
    "name": "Peppermint Bark",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 134,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 134,
    "macros": {
      "calories": "273",
      "protein": "23g",
      "carbs": "24g",
      "fat": "9g",
      "sugar": "22g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "peppermint_extract",
        "name": "Peppermint Extract",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP PEPPERMINT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "peppermint_bark_skinny_syrups",
        "name": "Peppermint Bark Skinny Syrups",
        "quantity": "1",
        "unit": "tsp",
        "raw": "1 TSP PEPPERMINT BARK SKINNY SYRUPS (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "peppermint_bark_chocolate_square_or_peppermint_candies",
        "name": "Peppermint Bark Chocolate Square Or Peppermint Candies",
        "quantity": "2",
        "unit": "",
        "raw": "2 PEPPERMINT BARK CHOCOLATE SQUARE OR PEPPERMINT CANDIES (~70 CALORIES)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "~70 CALORIES"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH MIX- INS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "peppermint_bark",
      "no_protein_peppermint_bark_134"
    ]
  },
  {
    "id": "peppermint_brownie",
    "name": "Peppermint Brownie",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 136,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 136,
    "macros": {
      "calories": "330",
      "protein": "37g",
      "carbs": "19g",
      "fat": "10g",
      "sugar": "20g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "peppermint_extract",
        "name": "Peppermint Extract",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP PEPPERMINT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "peppermint_bark_skinny_syrups",
        "name": "Peppermint Bark Skinny Syrups",
        "quantity": "1",
        "unit": "tsp",
        "raw": "1 TSP PEPPERMINT BARK SKINNY SYRUPS (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_chocolate_fudge_mini_muffins",
        "name": "Prime Bites Chocolate Fudge Mini Muffins",
        "quantity": "1",
        "unit": "package",
        "raw": "1 PACKAGE PRIME BITES (CODE FPF SAVES YOU 15%) CHOCOLATE FUDGE MINI MUFFINS (195 CAL 15G PRO; CAN SUB WITH ANY CHOCOLATE MUFFIN)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CODE FPF SAVES YOU 15%; 195 CAL 15G PRO; CAN SUB WITH ANY CHOCOLATE MUFFIN"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH MINI MUFFINS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "peppermint_brownie",
      "no_protein_peppermint_brownie_136"
    ]
  },
  {
    "id": "peppermint_mocha",
    "name": "Peppermint Mocha",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 50,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 85,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 50,
    "macros": {
      "calories": "173",
      "protein": "32g",
      "carbs": "5g",
      "fat": "4g",
      "sugar": "2g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "espresso",
        "name": "Espresso",
        "quantity": "1",
        "unit": "shot",
        "raw": "1 SHOT OF ESPRESSO",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "peppermint_extract",
        "name": "Peppermint Extract",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP PEPPERMINT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "peppermint_bark_skinny_syrups",
        "name": "Peppermint Bark Skinny Syrups",
        "quantity": "1",
        "unit": "tsp",
        "raw": "1 TSP PEPPERMINT BARK SKINNY SYRUPS (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 2G SUGAR 5G FIBER"
    ],
    "aliases": [
      "peppermint_mocha",
      "keto_peppermint_mocha_50",
      "lactose_free_peppermint_mocha_85"
    ]
  },
  {
    "id": "phish_food",
    "name": "Phish Food",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 118,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 118,
    "macros": {
      "calories": "283",
      "protein": "37g",
      "carbs": "24g",
      "fat": "7g",
      "sugar": "14g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "25",
        "unit": "g",
        "raw": "25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "10",
        "unit": "g",
        "raw": "10G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      },
      {
        "id": "caramel_syrup",
        "name": "Caramel Syrup",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "hormbles_chormbles",
        "name": "Hormbles Chormbles",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A HORMBLES CHORMBLES (PROTEIN CHOCOLATE BAR WITH 100 CAL AND 10G PRO)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "PROTEIN CHOCOLATE BAR WITH 100 CAL AND 10G PRO"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH HALF OF THE CHOCOLATE AND MARSHMALLOWS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CARAMEL SYRUP AND THE REST OF THE CHOCOLATE AND MARSHMALLOWS"
    ],
    "aliases": [
      "phish_food",
      "fan_favorites_phish_food_118"
    ]
  },
  {
    "id": "pistachio",
    "name": "Pistachio",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 138,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 87,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 138,
    "macros": {
      "calories": "233",
      "protein": "25g",
      "carbs": "15g",
      "fat": "8g",
      "sugar": "11g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "pistachio_butter",
        "name": "Pistachio Butter",
        "quantity": "20",
        "unit": "g",
        "raw": "20G PISTACHIO BUTTER (OR PISTACHIO CREAM)",
        "section": "Base",
        "isMixin": false,
        "notes": "OR PISTACHIO CREAM"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "30-35",
        "unit": "g",
        "raw": "30-35G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "IF IT LOOKS CLOSE TO BEING DONE, SPIN ON \"MIX-IN\" SETTING. IF IT'S VERY POWDERY, SPIN ON \"RESPIN\" SETTING."
    ],
    "aliases": [
      "pistachio",
      "no_protein_pistachio_138",
      "lactose_free_pistachio_87"
    ]
  },
  {
    "id": "pistachio_pistachio",
    "name": "Pistachio Pistachio",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 120,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 140,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 89,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 120,
    "macros": {
      "calories": "290",
      "protein": "28g",
      "carbs": "15g",
      "fat": "13g",
      "sugar": "12g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "30-35",
        "unit": "g",
        "raw": "30-35G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "pistachio_butter",
        "name": "Pistachio Butter",
        "quantity": "20",
        "unit": "g",
        "raw": "20G PISTACHIO BUTTER (OR PISTACHIO CREAM)",
        "section": "Base",
        "isMixin": false,
        "notes": "OR PISTACHIO CREAM"
      },
      {
        "id": "sugar_free_pistachio_syrup",
        "name": "Sugar-Free Pistachio Syrup",
        "quantity": "½",
        "unit": "tsp",
        "raw": "½ TSP SUGAR-FREE PISTACHIO SYRUP (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "roasted_salted_pistachios",
        "name": "Roasted Salted Pistachios",
        "quantity": "10",
        "unit": "g",
        "raw": "10G ROASTED, SALTED PISTACHIOS, CHOPPED",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE CHOPPED PISTACHIOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "pistachio_pistachio",
      "fan_favorites_pistachio_pistachio_120",
      "no_protein_pistachio_pistachio_140",
      "lactose_free_pistachio_pistachio_89"
    ]
  },
  {
    "id": "pumpkin_bread_crumble",
    "name": "Pumpkin Bread Crumble",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 142,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 142,
    "macros": {
      "calories": "375",
      "protein": "41g",
      "carbs": "31g",
      "fat": "11g",
      "sugar": "22g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_pumpkin_spice_brownie",
        "name": "Prime Bites Pumpkin Spice Brownie",
        "quantity": "1",
        "unit": "",
        "raw": "1 PRIME BITES (CODE FPF SAVES YOU 15%) PUMPKIN SPICE BROWNIE (CAN SUB WITH ANY KIND OF PUMPKIN BREAD OR COOKIE)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CODE FPF SAVES YOU 15%; CAN SUB WITH ANY KIND OF PUMPKIN BREAD OR COOKIE"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH BROWNIE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "pumpkin_bread_crumble",
      "no_protein_pumpkin_bread_crumble_142"
    ]
  },
  {
    "id": "pumpkin_cheesecake",
    "name": "Pumpkin Cheesecake",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 122,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 144,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 122,
    "macros": {
      "calories": "253",
      "protein": "25g",
      "carbs": "24g",
      "fat": "5g",
      "sugar": "19g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "canned_pumpkin",
        "name": "Canned Pumpkin",
        "quantity": "60",
        "unit": "g",
        "raw": "60G CANNED PUMPKIN",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "pumpkin_cream_cheese",
        "name": "Pumpkin Cream Cheese",
        "quantity": "30",
        "unit": "g",
        "raw": "30G (2 TBSP) PUMPKIN CREAM CHEESE (CAN SUB WITH REGULAR CREAM CHEESE + 5G BROWN SUGAR SWEETENER + A DASH OF CINNAMON AND PUMPKIN PIE SPICE)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; CAN SUB WITH REGULAR CREAM CHEESE + 5G BROWN SUGAR SWEETENER + A DASH OF CINNAMON AND PUMPKIN PIE SPICE"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "pumpkin_pie_spice",
        "name": "Pumpkin Pie Spice",
        "quantity": "2",
        "unit": "g",
        "raw": "2G (½ TSP) PUMPKIN PIE SPICE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "graham_cracker",
        "name": "Graham Cracker",
        "quantity": "½",
        "unit": "sheet",
        "raw": "½ SHEET OF A GRAHAM CRACKER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE CRUMBLED UP GRAHAM CRACKERS"
    ],
    "aliases": [
      "pumpkin_cheesecake",
      "fan_favorites_pumpkin_cheesecake_122",
      "no_protein_pumpkin_cheesecake_144"
    ]
  },
  {
    "id": "pumpkin_pie_blizzard",
    "name": "Pumpkin Pie Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 124,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 146,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 91,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 124,
    "macros": {
      "calories": "258",
      "protein": "24g",
      "carbs": "28g",
      "fat": "5g",
      "sugar": "17g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "canned_pumpkin",
        "name": "Canned Pumpkin",
        "quantity": "60",
        "unit": "g",
        "raw": "60G CANNED PUMPKIN",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "pumpkin_pie_spice",
        "name": "Pumpkin Pie Spice",
        "quantity": "2",
        "unit": "g",
        "raw": "2G (½ TSP) PUMPKIN PIE SPICE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "pie_crust",
        "name": "Pie Crust",
        "quantity": "1",
        "unit": "mini",
        "raw": "1 MINI PIE CRUST (100 CALORIES)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "100 CALORIES"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH PIE CRUST",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "pumpkin_pie_blizzard",
      "fan_favorites_pumpkin_pie_blizzard_124",
      "no_protein_pumpkin_pie_blizzard_146",
      "lactose_free_pumpkin_pie_blizzard_91"
    ]
  },
  {
    "id": "pumpkin_spice",
    "name": "Pumpkin Spice",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 148,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 93,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 148,
    "macros": {
      "calories": "158",
      "protein": "23g",
      "carbs": "15g",
      "fat": "0g",
      "sugar": "12g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "pure_pumpkin",
        "name": "Pure Pumpkin",
        "quantity": "60",
        "unit": "g",
        "raw": "60G PURE PUMPKIN (NOT PUMPKIN PIE FILLING)",
        "section": "Base",
        "isMixin": false,
        "notes": "NOT PUMPKIN PIE FILLING"
      },
      {
        "id": "vanilla_extract_or_vanilla_bean_paste",
        "name": "Vanilla Extract Or Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA EXTRACT OR VANILLA BEAN PASTE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "pumpkin_pie_spice",
        "name": "Pumpkin Pie Spice",
        "quantity": "2",
        "unit": "g",
        "raw": "2G (½ TSP) PUMPKIN PIE SPICE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "pumpkin_spice",
      "no_protein_pumpkin_spice_148",
      "lactose_free_pumpkin_spice_93"
    ]
  },
  {
    "id": "pumpkin_spice_latte",
    "name": "Pumpkin Spice Latte",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 150,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 95,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 150,
    "macros": {
      "calories": "158",
      "protein": "23g",
      "carbs": "15g",
      "fat": "0g",
      "sugar": "12g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "canned_pumpkin",
        "name": "Canned Pumpkin",
        "quantity": "60",
        "unit": "g",
        "raw": "60G CANNED PUMPKIN",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "espresso",
        "name": "Espresso",
        "quantity": "1",
        "unit": "shot",
        "raw": "1 SHOT OF ESPRESSO",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "coffee_creamer",
        "name": "Coffee Creamer",
        "quantity": "1",
        "unit": "tbsp",
        "raw": "(OPTIONAL) 1 TBSP COFFEE CREAMER (I LIKE TRADER JOE’S BROWN SUGAR CREAMER)",
        "section": "Base",
        "isMixin": false,
        "notes": "Optional; I LIKE TRADER JOE’S BROWN SUGAR CREAMER"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "pumpkin_pie_spice",
        "name": "Pumpkin Pie Spice",
        "quantity": "2",
        "unit": "g",
        "raw": "2G (½ TSP) PUMPKIN PIE SPICE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "pumpkin_spice_latte",
      "no_protein_pumpkin_spice_latte_150",
      "lactose_free_pumpkin_spice_latte_95"
    ]
  },
  {
    "id": "raspberry_cheesecake_topped",
    "name": "Raspberry Cheesecake Topped",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 126,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 152,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 126,
    "macros": {
      "calories": "337",
      "protein": "24g",
      "carbs": "26g",
      "fat": "13g",
      "sugar": "18g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "4 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "whipped_cream_cheese",
        "name": "Whipped Cream Cheese",
        "quantity": "22",
        "unit": "g",
        "raw": "22G (2 TBSP) WHIPPED (OR REGULAR) CREAM CHEESE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; OR REGULAR"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "frozen_raspberries",
        "name": "Frozen Raspberries",
        "quantity": "28",
        "unit": "g",
        "raw": "28G (1 OZ) FROZEN RASPBERRIES (YES, THEY HAVE TO BE FROZEN SO THEY DON’T INTRODUCE ANY EXTRA LIQUID TO THE MIX)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 1 OZ; YES, THEY HAVE TO BE FROZEN SO THEY DON’T INTRODUCE ANY EXTRA LIQUID TO THE MIX"
      },
      {
        "id": "teddy_grahams",
        "name": "Teddy Grahams",
        "quantity": "14",
        "unit": "g",
        "raw": "14G (½ A SMALL PACKAGE) TEDDY GRAHAMS (CAN SUB FOR GRAHAM CRACKERS)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "½ A SMALL PACKAGE; CAN SUB FOR GRAHAM CRACKERS"
      },
      {
        "id": "white_chocolate_chips",
        "name": "White Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G WHITE CHOCOLATE CHIPS MIXED WITH 2G OF COCONUT OIL",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "MIXED WITH 2G OF COCONUT OIL"
      }
    ],
    "instructions": [],
    "aliases": [
      "raspberry_cheesecake_topped",
      "fan_favorites_raspberry_cheesecake_topped_126",
      "no_protein_raspberry_cheesecake_topped_152"
    ]
  },
  {
    "id": "red_velvet",
    "name": "Red Velvet",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 128,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 52,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 97,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 128,
    "macros": {
      "calories": "150",
      "protein": "30g",
      "carbs": "3g",
      "fat": "3g",
      "sugar": "2g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "red_velvet_extract",
        "name": "Red Velvet Extract",
        "quantity": "1",
        "unit": "tsp",
        "raw": "1 TSP RED VELVET EXTRACT (I USED LORANN'S RED VELVET BAKERY EMULSION)",
        "section": "Base",
        "isMixin": false,
        "notes": "I USED LORANN'S RED VELVET BAKERY EMULSION"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "white_chocolate_chips",
        "name": "White Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G WHITE CHOCOLATE CHIPS (OPTIONAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "OPTIONAL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "red_velvet",
      "fan_favorites_red_velvet_128",
      "keto_red_velvet_52",
      "lactose_free_red_velvet_97"
    ]
  },
  {
    "id": "red_velvet_cake",
    "name": "Red Velvet Cake",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 130,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 54,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 130,
    "macros": {
      "calories": "270",
      "protein": "40g",
      "carbs": "9g",
      "fat": "9g",
      "sugar": "8g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "red_velvet_extract",
        "name": "Red Velvet Extract",
        "quantity": "1",
        "unit": "tsp",
        "raw": "1 TSP RED VELVET EXTRACT (I USED LORANN'S RED VELVET BAKERY EMULSION)",
        "section": "Base",
        "isMixin": false,
        "notes": "I USED LORANN'S RED VELVET BAKERY EMULSION"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_red_velvet_brownie",
        "name": "Prime Bites Red Velvet Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES RED VELVET BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "TOP WITH THE CHOPPED BROWNIE PIECES AND MIX IN BY HAND"
    ],
    "aliases": [
      "red_velvet_cake",
      "fan_favorites_red_velvet_cake_130",
      "keto_red_velvet_cake_54"
    ]
  },
  {
    "id": "red_velvet_cake_blizzard",
    "name": "Red Velvet Cake Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 132,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 154,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 132,
    "macros": {
      "calories": "303",
      "protein": "32g",
      "carbs": "18g",
      "fat": "11g",
      "sugar": "17g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "whipped_cream_cheese",
        "name": "Whipped Cream Cheese",
        "quantity": "22",
        "unit": "g",
        "raw": "22G (2 TBSP) WHIPPED (OR REGULAR) CREAM CHEESE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; OR REGULAR"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "prime_bites_red_velvet_brownie",
        "name": "Prime Bites Red Velvet Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A RED VELVET PRIME BITES BROWNIE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "AT THE SAME TIME, CHOP THE BROWNIE INTO BITE-SIZED CUBES, PLACE IN A PLASTIC BAG, AND PUT INTO THE FREEZER. THIS ALLOWS THEM FIRM UP AND WITHSTAND THE POWER OF THE MIX-IN SETTING (SO THEY DON'T GET COMPLETELY PULVERIZED)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND ADD THE FROZEN BROWNIE PIECES",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "red_velvet_cake_blizzard",
      "fan_favorites_red_velvet_cake_blizzard_132",
      "no_protein_red_velvet_cake_blizzard_154"
    ]
  },
  {
    "id": "reeses_caramel_craze_blizzard",
    "name": "Reese's Caramel Craze Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 134,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 156,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 134,
    "macros": {
      "calories": "295",
      "protein": "24g",
      "carbs": "24g",
      "fat": "10g",
      "sugar": "23g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 10G OF CHOCOLATE WITH 1.5G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "mini_reeses_pb_cups",
        "name": "Mini Reese's PB Cups",
        "quantity": "10",
        "unit": "g",
        "raw": "10G MINI REESE’S PB CUPS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "rolos",
        "name": "Rolos",
        "quantity": "12",
        "unit": "g",
        "raw": "12G (2 PIECES) ROLOS (OR ANY CHOCOLATE COVERED CARAMELS)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "2 PIECES; OR ANY CHOCOLATE COVERED CARAMELS"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "10",
        "unit": "g",
        "raw": "10G CHOCOLATE CHIPS MIXED WITH 1.5G OF COCONUT OIL",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "MIXED WITH 1.5G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE, CHOPPED PB CUPS, AND CHOPPED ROLOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "reeses_caramel_craze_blizzard",
      "fan_favorites_reese_s_caramel_craze_blizzard_134",
      "no_protein_reese_s_caramel_craze_blizzard_156"
    ]
  },
  {
    "id": "reeses_pieces",
    "name": "Reese's Pieces",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 158,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 158,
    "macros": {
      "calories": "305",
      "protein": "32g",
      "carbs": "13g",
      "fat": "12g",
      "sugar": "11g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "quest_peanut_butter_candies",
        "name": "Quest Peanut Butter Candies",
        "quantity": "1",
        "unit": "package",
        "raw": "1 PACKAGE (49G) QUEST PEANUT BUTTER CANDIES (CAN SUB WITH REESE’S PIECES)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "49G; CAN SUB WITH REESE’S PIECES"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH PB CANDIES AND MIX IN BY HAND"
    ],
    "aliases": [
      "reeses_pieces",
      "no_protein_reese_s_pieces_158"
    ]
  },
  {
    "id": "rice_krispy_treat",
    "name": "Rice Krispy Treat",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 160,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 160,
    "macros": {
      "calories": "273",
      "protein": "23g",
      "carbs": "38g",
      "fat": "2g",
      "sugar": "26g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "35-40",
        "unit": "g",
        "raw": "35-40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "mini_marshmallows",
        "name": "Mini Marshmallows",
        "quantity": "10",
        "unit": "g",
        "raw": "10G MINI MARSHMALLOWS",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "marshmallow_fluff",
        "name": "Marshmallow Fluff",
        "quantity": "6",
        "unit": "g",
        "raw": "6G MARSHMALLOW FLUFF",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "rice_krispy_treat",
        "name": "Rice Krispy Treat",
        "quantity": "20",
        "unit": "g",
        "raw": "20G RICE KRISPY TREAT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH CRUMBLED UP RICE KRISPY TREAT"
    ],
    "aliases": [
      "rice_krispy_treat",
      "no_protein_rice_krispy_treat_160"
    ]
  },
  {
    "id": "rocky_road",
    "name": "Rocky Road",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 136,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 99,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 136,
    "macros": {
      "calories": "273",
      "protein": "34g",
      "carbs": "16g",
      "fat": "9g",
      "sugar": "11g",
      "fiber": "6g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "nuts_of_choice",
        "name": "Nuts Of Choice",
        "quantity": "10",
        "unit": "g",
        "raw": "10G NUTS OF CHOICE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "10",
        "unit": "g",
        "raw": "10G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE NUTS AND MARSHMALLOWS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "rocky_road",
      "fan_favorites_rocky_road_136",
      "lactose_free_rocky_road_99"
    ]
  },
  {
    "id": "root_beer_float",
    "name": "Root Beer Float",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 56,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 101,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 56,
    "macros": {
      "calories": "116",
      "protein": "22g",
      "carbs": "3g",
      "fat": "2g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "8",
        "unit": "oz",
        "raw": "8 OZ VANILLA PROTEIN SHAKE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "diet_root_beer",
        "name": "Diet Root Beer",
        "quantity": "8",
        "unit": "oz",
        "raw": "8 OZ DIET ROOT BEER (A&W IS THE BEST DIET ROOT BEER)",
        "section": "Base",
        "isMixin": false,
        "notes": "A&W IS THE BEST DIET ROOT BEER"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF POWDERY",
      "RESPIN AGAIN IF POWDERY 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "root_beer_float",
      "keto_root_beer_float_56",
      "lactose_free_root_beer_float_101"
    ]
  },
  {
    "id": "royal_new_york_cheesecake_blizzard",
    "name": "Royal New York Cheesecake Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 138,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 138,
    "macros": {
      "calories": "318",
      "protein": "32g",
      "carbs": "24g",
      "fat": "10g",
      "sugar": "15g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "5 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "strawberries",
        "name": "Strawberries",
        "quantity": "100",
        "unit": "g",
        "raw": "100G FROZEN/FRESH STRAWBERRIES MACERATED IN 10-15G OF SWEETENER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "MACERATED IN 10-15G OF SWEETENER; Fresh or frozen"
      },
      {
        "id": "graham_cracker",
        "name": "Graham Cracker",
        "quantity": "½",
        "unit": "sheet",
        "raw": "½ SHEET OF A GRAHAM CRACKER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "cheesecake_bites",
        "name": "Cheesecake Bites",
        "quantity": "30",
        "unit": "g",
        "raw": "30G CHEESECAKE BITES (~100 CALORIES WORTH OF ANY CHEESECAKE)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "~100 CALORIES WORTH OF ANY CHEESECAKE"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "AT LEAST AN HOUR BEFORE MAKING THE ICE CREAM, POUR THE STRAWBERRIES INTO A BOWL AND COVER WITH 10-15G OF SWEETENER (IF FROZEN, MICROWAVE THEM FOR 1 MINUTE), STIR, AND PLACE IN THE FRIDGE",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE (IF THERE ISN'T ONE ALREADY - THERE SHOULD ALREADY BE ONE BECAUSE WE AREN'T USING A FULL PINT'S WORTH OF LIQUID) AND FILL WITH THE STRAWBERRY TOPPING",
      "TOP WITH THE CHEESECAKE PIECES AND CRUMBLED GRAHAM CRACKER"
    ],
    "aliases": [
      "royal_new_york_cheesecake_blizzard",
      "fan_favorites_royal_new_york_cheesecake_blizzard_138"
    ]
  },
  {
    "id": "royal_reeses_fluffernutter_blizzard",
    "name": "Royal Reese's Fluffernutter Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 140,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 140,
    "macros": {
      "calories": "322",
      "protein": "33g",
      "carbs": "23g",
      "fat": "10g",
      "sugar": "15g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE PEANUT BUTTER SWIRL HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF PEANUT BUTTER CHIPS WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO A PERFECT, CREAMY PEANUT BUTTER SWIRL.",
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "reeses_pb_cups",
        "name": "Reese's PB Cups",
        "quantity": "11",
        "unit": "g",
        "raw": "11G REESE’S PB CUPS, CHOPPED INTO SMALL PIECES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped into small pieces"
      },
      {
        "id": "marshmallow_creme",
        "name": "Marshmallow Creme",
        "quantity": "18",
        "unit": "g",
        "raw": "18G (3 TBSP) MARSHMALLOW CREME (SAME THING AS MARSHMALLOW FLUFF)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 3 TBSP; SAME THING AS MARSHMALLOW FLUFF"
      },
      {
        "id": "peanut_butter_chips",
        "name": "Peanut Butter Chips",
        "quantity": "10",
        "unit": "g",
        "raw": "10G PEANUT BUTTER CHIPS + 1.5G COCONUT OIL + A PINCH OF SALT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "1.5G COCONUT OIL + A PINCH OF SALT"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING (IF POWDERY)",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE CHOPPED PB CUPS AND MELTED PB CHIP MIXTURE",
      "RUN THE \"MIX-IN\" CYCLE",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE (IF THERE ISN'T ONE ALREADY - THERE SHOULD ALREADY BE ONE BECAUSE WE AREN'T USING A FULL PINT'S WORTH OF LIQUID) AND FILL WITH THE MARSHMALLOW CREME"
    ],
    "aliases": [
      "royal_reeses_fluffernutter_blizzard",
      "fan_favorites_royal_reese_s_fluffernutter_blizzard_140"
    ]
  },
  {
    "id": "salted_peanut_butter",
    "name": "Salted Peanut Butter",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 142,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 164,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 142,
    "macros": {
      "calories": "318",
      "protein": "31g",
      "carbs": "16g",
      "fat": "12g",
      "sugar": "15g",
      "fiber": "4g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "peanut_butter",
        "name": "Peanut Butter",
        "quantity": "8",
        "unit": "g",
        "raw": "8G (½ TBSP) PEANUT BUTTER",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TBSP"
      },
      {
        "id": "peanut_butter_powder",
        "name": "Peanut Butter Powder",
        "quantity": "16",
        "unit": "g",
        "raw": "16G (2 TBSP) PEANUT BUTTER POWDER (LIKE PBFIT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; LIKE PBFIT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "dark_chocolate_chips",
        "name": "Dark Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G DARK CHOCOLATE CHIPS (60 CAL) MIXED WITH 2G OF COCONUT OIL (27 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "60 CAL; 27 CAL; MIXED WITH 2G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "salted_peanut_butter",
      "fan_favorites_salted_peanut_butter_142",
      "no_protein_salted_peanut_butter_164"
    ]
  },
  {
    "id": "salty_caramel",
    "name": "Salty Caramel",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 144,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 144,
    "macros": {
      "calories": "170",
      "protein": "30g",
      "carbs": "3g",
      "fat": "4g",
      "sugar": "1g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "caramel_protein_shake",
        "name": "Caramel Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CARAMEL PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) SALT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "salted_caramel_sauce",
        "name": "Salted Caramel Sauce",
        "quantity": "10",
        "unit": "g",
        "raw": "10G SALTED CARAMEL SAUCE (OPTIONAL, ADDS ~30 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "OPTIONAL, ADDS ~30 CAL"
      },
      {
        "id": "flaky_salt",
        "name": "Flaky Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF FLAKY SALT",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "TOP WITH A PINCH OF FLAKY SALT AND SALTED CARAMEL SAUCE (IF USING)"
    ],
    "aliases": [
      "salty_caramel",
      "fan_favorites_salty_caramel_144"
    ]
  },
  {
    "id": "shamrock_oreo_mcflurry",
    "name": "Shamrock Oreo Mcflurry",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 146,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 166,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 146,
    "macros": {
      "calories": "233",
      "protein": "23g",
      "carbs": "29g",
      "fat": "2g",
      "sugar": "18g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "peppermint_extract",
        "name": "Peppermint Extract",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP PEPPERMINT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "green_food_coloring",
        "name": "Green Food Coloring",
        "quantity": "1",
        "unit": "drop",
        "raw": "1 DROP GREEN FOOD COLORING (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "5",
        "unit": "",
        "raw": "5 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE"
    ],
    "aliases": [
      "shamrock_oreo_mcflurry",
      "fan_favorites_shamrock_oreo_mcflurry_146",
      "no_protein_shamrock_oreo_mcflurry_166"
    ]
  },
  {
    "id": "shamrock_shake",
    "name": "Shamrock Shake",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 148,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 58,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 103,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 148,
    "macros": {
      "calories": "150",
      "protein": "30g",
      "carbs": "2g",
      "fat": "3g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "peppermint_extract",
        "name": "Peppermint Extract",
        "quantity": "⅛",
        "unit": "tsp",
        "raw": "⅛ TSP PEPPERMINT EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "peppermint_bark_skinny_syrups",
        "name": "Peppermint Bark Skinny Syrups",
        "quantity": "1",
        "unit": "tsp",
        "raw": "1 TSP PEPPERMINT BARK SKINNY SYRUPS (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "green_food_coloring",
        "name": "Green Food Coloring",
        "quantity": "2-3",
        "unit": "drops",
        "raw": "2-3 DROPS GREEN FOOD COLORING (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "shamrock_shake",
      "fan_favorites_shamrock_shake_148",
      "keto_shamrock_shake_58",
      "lactose_free_shamrock_shake_103"
    ]
  },
  {
    "id": "smores_blizzard",
    "name": "S'Mores Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 150,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 162,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 150,
    "macros": {
      "calories": "277",
      "protein": "27g",
      "carbs": "37g",
      "fat": "4g",
      "sugar": "24g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "TOAST YOUR MARSHMALLOWS FOR THAT CAMPFIRE-ESQUE FLAVOR",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "mini_marshmallows",
        "name": "Mini Marshmallows",
        "quantity": "15",
        "unit": "g",
        "raw": "15G MINI MARSHMALLOWS (PRO TIP: TOAST THEM FOR THAT CAMPFIRE-ESQUE FLAVOR)",
        "section": "Base",
        "isMixin": false,
        "notes": "PRO TIP: TOAST THEM FOR THAT CAMPFIRE-ESQUE FLAVOR"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "graham_cracker",
        "name": "Graham Cracker",
        "quantity": "½",
        "unit": "sheet",
        "raw": "½ SHEET OF A GRAHAM CRACKER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "hormbles_chormbles",
        "name": "Hormbles Chormbles",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A HORMBLES CHORMBLES (PROTEIN CHOCOLATE BAR WITH 100 CAL AND 10G PRO)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "PROTEIN CHOCOLATE BAR WITH 100 CAL AND 10G PRO"
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "5",
        "unit": "g",
        "raw": "5G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE (MARSHMALLOWS INCLUDED) AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE CHOPPED UP CHOCOLATE, GRAHAM CRACKER, AND MARSHMALLOWS"
    ],
    "aliases": [
      "smores_blizzard",
      "fan_favorites_s_mores_blizzard_150",
      "no_protein_s_mores_blizzard_162"
    ]
  },
  {
    "id": "snowdrift_blizzard",
    "name": "Snowdrift Blizzard",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 152,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 168,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 152,
    "macros": {
      "calories": "233",
      "protein": "22g",
      "carbs": "31g",
      "fat": "1g",
      "sugar": "23g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cake_batter_extract",
        "name": "Cake Batter Extract",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) CAKE BATTER EXTRACT",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "blue_food_coloring",
        "name": "Blue Food Coloring",
        "quantity": "1-2",
        "unit": "drops",
        "raw": "1-2 DROPS BLUE FOOD COLORING (OPTIONAL)",
        "section": "Base",
        "isMixin": false,
        "notes": "OPTIONAL"
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "3",
        "unit": "",
        "raw": "3 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      },
      {
        "id": "mini_lucky_charms_style_marshmallows",
        "name": "Mini Lucky-Charms-Style Marshmallows",
        "quantity": "10",
        "unit": "g",
        "raw": "10G MINI LUCKY-CHARMS-STYLE MARSHMALLOWS (I USED THE ONES FROM JET PUFFED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "I USED THE ONES FROM JET PUFFED"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING IF VERY POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS AND HALF OF THE MARSHMALLOWS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE REST OF THE MARSHMALLOWS"
    ],
    "aliases": [
      "snowdrift_blizzard",
      "fan_favorites_snowdrift_blizzard_152",
      "no_protein_snowdrift_blizzard_168"
    ]
  },
  {
    "id": "strawberry",
    "name": "Strawberry",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 60,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 105,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 60,
    "macros": {
      "calories": "150",
      "protein": "30g",
      "carbs": "2g",
      "fat": "3g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "strawberry_protein_shake",
        "name": "Strawberry Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 STRAWBERRY PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "strawberry",
      "keto_strawberry_60",
      "lactose_free_strawberry_105"
    ]
  },
  {
    "id": "strawberry_banana",
    "name": "Strawberry Banana",
    "category": "Lactose Free",
    "categories": [
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "Lactose Free",
        "page": 107,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "lactose free 8-6.pdf",
    "page": 107,
    "macros": {
      "calories": "260",
      "protein": "31g",
      "carbs": "27g",
      "fat": "3g",
      "sugar": "19g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "lactose_free_strawberry_protein_shake",
        "name": "Lactose-Free Strawberry Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 LACTOSE-FREE STRAWBERRY PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "banana",
        "name": "Banana",
        "quantity": "1",
        "unit": "medium",
        "raw": "1 MEDIUM SIZE BANANA (~113G)",
        "section": "Base",
        "isMixin": false,
        "notes": "~113G"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 19G SUGAR 3G FIBER"
    ],
    "aliases": [
      "strawberry_banana",
      "lactose_free_strawberry_banana_107"
    ]
  },
  {
    "id": "strawberry_cheesecake",
    "name": "Strawberry Cheesecake",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "Keto"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 154,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "Keto",
        "page": 62,
        "sourceFile": "Keto 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 154,
    "macros": {
      "calories": "265",
      "protein": "32g",
      "carbs": "16g",
      "fat": "8g",
      "sugar": "8g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "5 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "strawberry_protein_shake",
        "name": "Strawberry Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 STRAWBERRY PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "whipped_cream_cheese",
        "name": "Whipped Cream Cheese",
        "quantity": "22",
        "unit": "g",
        "raw": "22G (2 TBSP) WHIPPED (OR REGULAR) CREAM CHEESE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP; OR REGULAR"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "strawberries",
        "name": "Strawberries",
        "quantity": "100",
        "unit": "g",
        "raw": "100G FROZEN/FRESH STRAWBERRIES MACERATED IN 10-15G OF SWEETENER + A",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "MACERATED IN 10-15G OF SWEETENER + A; Fresh or frozen"
      },
      {
        "id": "lemon_juice",
        "name": "Lemon Juice",
        "quantity": "Splash",
        "unit": "splash",
        "raw": "SPLASH OF LEMON JUICE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "graham_cracker",
        "name": "Graham Cracker",
        "quantity": "½",
        "unit": "sheet",
        "raw": "½ SHEET OF A GRAHAM CRACKER",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "AT LEAST AN HOUR BEFORE MAKING THE ICE CREAM, POUR THE STRAWBERRIES INTO A BOWL AND COVER WITH 10-15G OF SWEETENER (IF FROZEN, MICROWAVE THEM FOR 1 MINUTE), STIR, AND PLACE IN THE FRIDGE",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE (IF THERE ISN'T ONE ALREADY - THERE SHOULD ALREADY BE ONE BECAUSE WE AREN'T USING A FULL PINT'S WORTH OF LIQUID) AND FILL WITH THE STRAWBERRY TOPPING",
      "TOP WITH THE CRUMBLED GRAHAM CRACKER"
    ],
    "aliases": [
      "strawberry_cheesecake",
      "fan_favorites_strawberry_cheesecake_154",
      "keto_strawberry_cheesecake_62"
    ]
  },
  {
    "id": "tart_frozen_yogurt",
    "name": "Tart Frozen Yogurt",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 156,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 170,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 156,
    "macros": {
      "calories": "205",
      "protein": "38g",
      "carbs": "15g",
      "fat": "1g",
      "sugar": "15g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "nonfat_greek_yogurt",
        "name": "Nonfat Greek Yogurt",
        "quantity": "340",
        "unit": "g",
        "raw": "340G (1.5 CUPS) NONFAT GREEK YOGURT",
        "section": "Base",
        "isMixin": false,
        "notes": "1.5 CUPS"
      },
      {
        "id": "low_fat_buttermilk",
        "name": "Low Fat Buttermilk",
        "quantity": "60",
        "unit": "g",
        "raw": "60G (¼ CUP) LOW FAT BUTTERMILK",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ CUP"
      },
      {
        "id": "lemon_juice",
        "name": "Lemon Juice",
        "quantity": "30",
        "unit": "g",
        "raw": "30G (2 TBSP) LEMON JUICE",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 2 TBSP"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-50",
        "unit": "g",
        "raw": "40-50G (¼ CUP) SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ CUP; CODE ELI15 SAVES YOU 15%"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING (OR FROZEN YOGURT IF YOU HAVE THE NEWER MACHINES)",
      "SPIN ON \"RESPIN\" SETTING UNTIL IT REACHES YOUR DESIRED TEXTURE IF YOU HAVE THE NINJA SWIRL, FOLLOW THESE EXTRA STEPS:",
      "REPLACE THE SPINNING PADDLE WITH THE DISPENSING LID",
      "PLACE THE PINT INTO THE SOFT SERVE SIDE OF THE SWIRL AND LOCK INTO PLACE",
      "OPEN THE NOZZLE OF THE LID",
      "DISPENSE!! 15G SUGAR 0G FIBER"
    ],
    "aliases": [
      "tart_frozen_yogurt",
      "fan_favorites_tart_frozen_yogurt_156",
      "no_protein_tart_frozen_yogurt_170"
    ]
  },
  {
    "id": "thai_tea",
    "name": "Thai Tea",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 172,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 172,
    "macros": {
      "calories": "172",
      "protein": "18g",
      "carbs": "19g",
      "fat": "2g",
      "sugar": "16g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "300",
        "unit": "g",
        "raw": "300G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "thai_tea",
        "name": "Thai Tea",
        "quantity": "100",
        "unit": "g",
        "raw": "100G THAI TEA (UNSWEETENED)",
        "section": "Base",
        "isMixin": false,
        "notes": "UNSWEETENED"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "sweetened_condensed_milk",
        "name": "Sweetened Condensed Milk",
        "quantity": "15",
        "unit": "g",
        "raw": "15G SWEETENED CONDENSED MILK",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE SWEETENED CONDENSED MILK"
    ],
    "aliases": [
      "thai_tea",
      "no_protein_thai_tea_172"
    ]
  },
  {
    "id": "the_tonight_dough",
    "name": "The Tonight Dough",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 158,
        "sourceFile": "fan favorites 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 158,
    "macros": {
      "calories": "309",
      "protein": "37g",
      "carbs": "27g",
      "fat": "7g",
      "sugar": "11g",
      "fiber": "5g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "REMOVE THE CREAM FROM YOUR OREOS OREO THINS WITHOUT THE CREAM ARE ONLY 20 CALORIES EACH VS 35 WITH IT. SAME CRUNCH, ALMOST HALF THE CALORIES.",
    "ingredients": [
      {
        "id": "chocolate_protein_shake",
        "name": "Chocolate Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 CHOCOLATE PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20",
        "unit": "g",
        "raw": "20G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "cocoa_powder",
        "name": "Cocoa Powder",
        "quantity": "10",
        "unit": "g",
        "raw": "10G COCOA POWDER",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "fuul_chocolate_chip_cookie_dough_bites",
        "name": "Fuul Chocolate Chip Cookie Dough Bites",
        "quantity": "20",
        "unit": "g",
        "raw": "20G FUUL CHOCOLATE CHIP COOKIE DOUGH BITES",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "oreo_thins",
        "name": "Oreo Thins",
        "quantity": "2",
        "unit": "",
        "raw": "2 OREO THINS (CREAM REMOVED)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CREAM REMOVED"
      },
      {
        "id": "caramel_syrup",
        "name": "Caramel Syrup",
        "quantity": "7",
        "unit": "g",
        "raw": "7G CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE OREOS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE COOKIE DOUGH BITES AND CARAMEL SYRUP"
    ],
    "aliases": [
      "the_tonight_dough",
      "fan_favorites_the_tonight_dough_158"
    ]
  },
  {
    "id": "tiramisu_topped",
    "name": "Tiramisu Topped",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 160,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 174,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 160,
    "macros": {
      "calories": "303",
      "protein": "24g",
      "carbs": "16g",
      "fat": "13g",
      "sugar": "15g",
      "fiber": "3g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40",
        "unit": "g",
        "raw": "40G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "mascarpone",
        "name": "Mascarpone",
        "quantity": "15",
        "unit": "g",
        "raw": "15G MASCARPONE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "highkey_vanilla_wafers",
        "name": "Highkey Vanilla Wafers",
        "quantity": "10",
        "unit": "g",
        "raw": "10G HIGHKEY VANILLA WAFERS (CAN SUB WITH NILLA WAFERS)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "CAN SUB WITH NILLA WAFERS"
      },
      {
        "id": "chocolate_covered_espresso_beans",
        "name": "Chocolate Covered Espresso Beans",
        "quantity": "10",
        "unit": "g",
        "raw": "10G CHOCOLATE COVERED ESPRESSO BEANS (MIX IN ALL BUT ONE - SAVE ONE BEAN, CHOP IT UP FINELY AND TOP WITH IT AT THE END)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "MIX IN ALL BUT ONE - SAVE ONE BEAN, CHOP IT UP FINELY AND TOP WITH IT AT THE END"
      },
      {
        "id": "lakanto_chocolate_sauce",
        "name": "Lakanto Chocolate Sauce",
        "quantity": "15",
        "unit": "g",
        "raw": "15G (1 TBSP) LAKANTO CHOCOLATE SAUCE",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Alt measurement: 1 TBSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING (IF NECESSARY)",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE CHOPPED ESPRESSO BEANS AND WAFERS",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE CHOCOLATE SYRUP AND THE LAST CHOPPED UP BEAN"
    ],
    "aliases": [
      "tiramisu_topped",
      "fan_favorites_tiramisu_topped_160",
      "no_protein_tiramisu_topped_174"
    ]
  },
  {
    "id": "turtle_pecan_cluster",
    "name": "Turtle Pecan Cluster",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 162,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 176,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 162,
    "macros": {
      "calories": "267",
      "protein": "23g",
      "carbs": "16g",
      "fat": "10g",
      "sugar": "15g",
      "fiber": "2g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": "THE CHOCOLATE CHIP HACK RIGHT BEFORE THE MIX-IN CYCLE, COMBINE 15G OF CHOCOLATE WITH 2G OF COCONUT OIL, MELT IN THE MICROWAVE (30 SEC INTERVALS, STIRRING IN BETWEEN), HOLLOW OUT A HOLE IN THE CENTER OF THE BASE, AND POUR IN. AFTER SPINNING ON THE MIX-IN SETTING, IT'LL TURN INTO PERFECT, CREAMY CHOCOLATE CHIPS.",
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "salted_caramel_syrup",
        "name": "Salted Caramel Syrup",
        "quantity": "7.5",
        "unit": "g",
        "raw": "7.5G SALTED CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "pecans",
        "name": "Pecans",
        "quantity": "5",
        "unit": "g",
        "raw": "5G CHOPPED PECANS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "Chopped"
      },
      {
        "id": "chocolate_chips",
        "name": "Chocolate Chips",
        "quantity": "15",
        "unit": "g",
        "raw": "15G CHOCOLATE CHIPS (60 CAL) MIXED WITH 2G OF COCONUT OIL (27 CAL)",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "60 CAL; 27 CAL; MIXED WITH 2G OF COCONUT OIL"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "MAKE A HOLE DOWN TO THE BOTTOM WITH A BUTTER KNIFE AND FILL WITH THE MELTED CHOCOLATE",
      "RUN THE \"MIX-IN\" CYCLE",
      "TOP WITH THE PECANS AND CARAMEL"
    ],
    "aliases": [
      "turtle_pecan_cluster",
      "fan_favorites_turtle_pecan_cluster_162",
      "no_protein_turtle_pecan_cluster_176"
    ]
  },
  {
    "id": "vanilla",
    "name": "Vanilla",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 178,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 178,
    "macros": {
      "calories": "135",
      "protein": "22g",
      "carbs": "10g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "vanilla",
      "no_protein_vanilla_178"
    ]
  },
  {
    "id": "vanilla_bean_frozen_yogurt",
    "name": "Vanilla Bean Frozen Yogurt",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 180,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 180,
    "macros": {
      "calories": "180",
      "protein": "34g",
      "carbs": "11g",
      "fat": "0g",
      "sugar": "11g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "nonfat_greek_yogurt",
        "name": "Nonfat Greek Yogurt",
        "quantity": "340",
        "unit": "g",
        "raw": "340G (1.5 CUPS) NONFAT GREEK YOGURT",
        "section": "Base",
        "isMixin": false,
        "notes": "1.5 CUPS"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-50",
        "unit": "g",
        "raw": "40-50G (¼ CUP) SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ CUP; CODE ELI15 SAVES YOU 15%"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING (OR FROZEN YOGURT IF YOU HAVE THE NEWER MACHINES)",
      "SPIN ON \"RESPIN\" SETTING UNTIL IT REACHES YOUR DESIRED TEXTURE IF YOU HAVE THE NINJA SWIRL, FOLLOW THESE EXTRA STEPS:",
      "REPLACE THE SPINNING PADDLE WITH THE DISPENSING LID",
      "PLACE THE PINT INTO THE SOFT SERVE SIDE OF THE SWIRL AND LOCK INTO PLACE",
      "OPEN THE NOZZLE OF THE LID",
      "DISPENSE!! 11G SUGAR 0G FIBER"
    ],
    "aliases": [
      "vanilla_bean_frozen_yogurt",
      "no_protein_vanilla_bean_frozen_yogurt_180"
    ]
  },
  {
    "id": "vanilla_milk",
    "name": "Vanilla (Milk)",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 64,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 109,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 64,
    "macros": {
      "calories": "135",
      "protein": "22g",
      "carbs": "10g",
      "fat": "0g",
      "sugar": "10g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY"
    ],
    "aliases": [
      "vanilla_milk",
      "keto_vanilla_milk_64",
      "lactose_free_vanilla_milk_109"
    ]
  },
  {
    "id": "vanilla_pecan_blondie",
    "name": "Vanilla Pecan Blondie",
    "category": "Fan Favorites",
    "categories": [
      "Fan Favorites",
      "No Protein"
    ],
    "sources": [
      {
        "book": "Fan Favorites",
        "page": 164,
        "sourceFile": "fan favorites 8-6.pdf"
      },
      {
        "book": "No Protein",
        "page": 182,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "fan favorites 8-6.pdf",
    "page": 164,
    "macros": {
      "calories": "300",
      "protein": "32g",
      "carbs": "25g",
      "fat": "8g",
      "sugar": "18g",
      "fiber": "1g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "5",
        "unit": "g",
        "raw": "5G (1 TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: 1 TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "candied_pecans",
        "name": "Candied Pecans",
        "quantity": "5",
        "unit": "g",
        "raw": "5G CANDIED PECANS",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "salted_caramel_syrup",
        "name": "Salted Caramel Syrup",
        "quantity": "7",
        "unit": "g",
        "raw": "7G SALTED CARAMEL SYRUP",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      },
      {
        "id": "prime_bites_protein_brownie",
        "name": "Prime Bites Protein Brownie",
        "quantity": "½",
        "unit": "",
        "raw": "½ OF A PRIME BITES PROTEIN BROWNIE (IDEALLY ONE OF THE BLONDIE-STYLE FLAVORS), CHOPPED",
        "section": "Mix-in",
        "isMixin": true,
        "notes": "IDEALLY ONE OF THE BLONDIE-STYLE FLAVORS; Chopped"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "CHOP THE PECANS AND BROWNIE UNTIL DESIRED SIZE",
      "TOP WITH THE CHOPPED TOPPINGS AND DRIZZLE WITH SALTED CARAMEL"
    ],
    "aliases": [
      "vanilla_pecan_blondie",
      "fan_favorites_vanilla_pecan_blondie_164",
      "no_protein_vanilla_pecan_blondie_182"
    ]
  },
  {
    "id": "vanilla_protein_shake",
    "name": "Vanilla (Protein Shake)",
    "category": "Keto",
    "categories": [
      "Keto",
      "Lactose Free",
      "Base Flavors"
    ],
    "sources": [
      {
        "book": "Keto",
        "page": 66,
        "sourceFile": "Keto 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 111,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "Keto 8-6.pdf",
    "page": 66,
    "macros": {
      "calories": "150",
      "protein": "30g",
      "carbs": "2g",
      "fat": "3g",
      "sugar": "1g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "vanilla_protein_shake",
        "name": "Vanilla Protein Shake",
        "quantity": "1",
        "unit": "",
        "raw": "1 VANILLA PROTEIN SHAKE (350-400ML)",
        "section": "Base",
        "isMixin": false,
        "notes": "350-400ML"
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "20-25",
        "unit": "g",
        "raw": "20-25G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "vanilla_bean_paste",
        "name": "Vanilla Bean Paste",
        "quantity": "2.5",
        "unit": "g",
        "raw": "2.5G (½ TSP) VANILLA BEAN PASTE (OR EXTRACT)",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ½ TSP; OR EXTRACT"
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY 1G SUGAR 0G FIBER"
    ],
    "aliases": [
      "vanilla_protein_shake",
      "keto_vanilla_protein_shake_66",
      "lactose_free_vanilla_protein_shake_111"
    ]
  },
  {
    "id": "vietnamese_iced_coffee",
    "name": "Vietnamese Iced Coffee",
    "category": "No Protein",
    "categories": [
      "No Protein"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 184,
        "sourceFile": "No protein 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 184,
    "macros": {
      "calories": "220",
      "protein": "24g",
      "carbs": "25g",
      "fat": "2g",
      "sugar": "25g",
      "fiber": "0g"
    },
    "spinSetting": "Lite Ice Cream",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "fat_free_ultra_filtered_milk",
        "name": "Fat Free Ultra-Filtered Milk",
        "quantity": "400",
        "unit": "g",
        "raw": "400G FAT FREE ULTRA-FILTERED MILK",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sweetener",
        "name": "Sweetener",
        "quantity": "40-45",
        "unit": "g",
        "raw": "40-45G SWEETENER (CODE ELI15 SAVES YOU 15%)",
        "section": "Base",
        "isMixin": false,
        "notes": "CODE ELI15 SAVES YOU 15%"
      },
      {
        "id": "instant_coffee",
        "name": "Instant Coffee",
        "quantity": "1",
        "unit": "tbsp",
        "raw": "1 TBSP INSTANT COFFEE",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "salt",
        "name": "Salt",
        "quantity": "A pinch",
        "unit": "pinch",
        "raw": "A PINCH OF SALT",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "xanthan_gum",
        "name": "Xanthan Gum",
        "quantity": "1",
        "unit": "g",
        "raw": "1G (¼ TSP) XANTHAN GUM",
        "section": "Base",
        "isMixin": false,
        "notes": "Alt measurement: ¼ TSP"
      },
      {
        "id": "sweetened_condensed_milk",
        "name": "Sweetened Condensed Milk",
        "quantity": "27",
        "unit": "g",
        "raw": "27G SWEETENED CONDENSED MILK",
        "section": "Mix-in",
        "isMixin": true,
        "notes": ""
      }
    ],
    "instructions": [
      "BLEND ALL INGREDIENTS FOR THE BASE AND FREEZE (AT LEAST 16 HOURS)",
      "RUN YOUR PINT UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"LITE ICE CREAM\" SETTING",
      "SPIN ON \"RESPIN\" SETTING",
      "RESPIN AGAIN IF POWDERY",
      "TOP WITH THE SWEETENED CONDENSED MILK"
    ],
    "aliases": [
      "vietnamese_iced_coffee",
      "no_protein_vietnamese_iced_coffee_184"
    ]
  },
  {
    "id": "watermelon_sorbet",
    "name": "Watermelon Sorbet",
    "category": "No Protein",
    "categories": [
      "No Protein",
      "Lactose Free"
    ],
    "sources": [
      {
        "book": "No Protein",
        "page": 186,
        "sourceFile": "No protein 8-6.pdf"
      },
      {
        "book": "Lactose Free",
        "page": 113,
        "sourceFile": "lactose free 8-6.pdf"
      }
    ],
    "sourceFile": "No protein 8-6.pdf",
    "page": 186,
    "macros": {
      "calories": "30",
      "protein": "0g",
      "carbs": "7g",
      "fat": "0g",
      "sugar": "6g",
      "fiber": "0g"
    },
    "spinSetting": "Sorbet",
    "prepTime": "2 MIN",
    "freezeTime": "16+ HOURS",
    "makes": "1 PINT",
    "proTip": null,
    "ingredients": [
      {
        "id": "watermelon",
        "name": "Watermelon",
        "quantity": "1-1.5",
        "unit": "cups",
        "raw": "1-1.5 CUPS OF WATERMELON",
        "section": "Base",
        "isMixin": false,
        "notes": ""
      },
      {
        "id": "sprite_zero",
        "name": "Sprite Zero",
        "quantity": "To fill line",
        "unit": "",
        "raw": "SPRITE ZERO UNTIL THE FILL LINE",
        "section": "Base",
        "isMixin": false,
        "notes": "Until the fill line"
      }
    ],
    "instructions": [
      "POUR WATERMELON INTO YOUR PINT",
      "COVER WITH SPRITE ZERO UNTIL YOU REACH THE FILL LINE",
      "MIX AROUND (OR SHAKE) UNTIL MOST OF THE CARBONATION GOES AWAY",
      "FREEZE YOUR PINT FOR AT LEAST 16 HOURS",
      "RUN UNDER HOT WATER FOR AT LEAST 60 SECONDS",
      "SPIN ON \"SORBET\" SETTING",
      "SCRAPE DOWN THE SIDES BETWEEN SPINS",
      "SPIN ON \"RESPIN\" SETTING UNTIL IT REACHES YOUR DESIRED TEXTURE"
    ],
    "aliases": [
      "watermelon_sorbet",
      "no_protein_watermelon_sorbet_186",
      "lactose_free_watermelon_sorbet_113"
    ]
  }
  ,
{
      "id": "classic_drive_thru_chocolate_malt",
      "name": "Classic Drive-Thru Chocolate Malt",
      "category": "Community Legends",
      "categories": [
          "Community Legends",
          "Base Flavors"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 1,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 1,
      "macros": {
          "calories": "240",
          "protein": "30g",
          "carbs": "20g",
          "fat": "3g",
          "sugar": "8g",
          "fiber": "2g"
      },
      "spinSetting": "Lite Ice Cream",
      "prepTime": "2 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "If the initial spin looks powdery like snow (common with high-protein chocolate bases), add 1 tablespoon of milk and run a RE-SPIN cycle for that iconic velvety thick Frosty soft-serve texture.",
      "ingredients": [
          {
              "id": "chocolate_protein_shake",
              "name": "Chocolate Protein Shake (Fairlife / Premier)",
              "quantity": "340",
              "unit": "ml",
              "raw": "340ML CHOCOLATE READY-TO-DRINK PROTEIN SHAKE",
              "section": "Base",
              "isMixin": false,
              "notes": "1 bottle"
          },
          {
              "id": "chocolate_pudding_mix",
              "name": "Sugar-Free Chocolate Pudding Mix",
              "quantity": "7",
              "unit": "g",
              "raw": "7G (2 TSP) SUGAR-FREE CHOCOLATE PUDDING MIX",
              "section": "Base",
              "isMixin": false,
              "notes": "Adds rich malted thickness"
          },
          {
              "id": "cocoa_powder",
              "name": "Dark Cocoa Powder",
              "quantity": "5",
              "unit": "g",
              "raw": "5G (1 TBSP) DARK DUTCH COCOA POWDER",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_bean_paste",
              "name": "Vanilla Bean Paste",
              "quantity": "0.5",
              "unit": "tsp",
              "raw": "1/2 TSP VANILLA BEAN PASTE",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "salt",
              "name": "Salt",
              "quantity": "1",
              "unit": "pinch",
              "raw": "PINCH OF SALT",
              "section": "Base",
              "isMixin": false,
              "notes": "Enhances chocolate richness"
          }
      ],
      "instructions": [
          "POUR CHOCOLATE PROTEIN SHAKE INTO YOUR PINT",
          "WHISK IN CHOCOLATE PUDDING MIX, DARK COCOA POWDER, VANILLA, AND A PINCH OF SALT WITH A FROTHER",
          "FREEZE FOR AT LEAST 16 HOURS",
          "RUN OUTSIDE OF PINT UNDER WARM WATER FOR 60 SECONDS",
          "SPIN ON 'LITE ICE CREAM' SETTING",
          "ADD 1 TBSP MILK AND RUN 'RE-SPIN' UNTIL VELVETY SMOOTH"
      ],
      "aliases": [
          "wendys_frosty",
          "chocolate_malt_frosty",
          "drive_thru_frosty"
      ]
  }  ,
{
      "id": "strawberry_shortcake_crunch_bar",
      "name": "Strawberry Shortcake Crunch Bar",
      "category": "Community Legends",
      "categories": [
          "Community Legends",
          "Base Flavors"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 2,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 2,
      "macros": {
          "calories": "280",
          "protein": "24g",
          "carbs": "32g",
          "fat": "5g",
          "sugar": "12g",
          "fiber": "2g"
      },
      "spinSetting": "Ice Cream",
      "prepTime": "3 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "To make the famous ice cream truck strawberry crunch: crush 2 Golden Oreos in a ziplock bag with 1/2 tsp of strawberry gelatin powder and a tiny drop of melted butter. Add half into the center mix-in well and sprinkle the rest on top!",
      "ingredients": [
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "350",
              "unit": "g",
              "raw": "350G FAT FREE ULTRA-FILTERED MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_protein_powder",
              "name": "Vanilla Protein Powder",
              "quantity": "25",
              "unit": "g",
              "raw": "25G VANILLA WHEY / CASEIN PROTEIN",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cheesecake_jello_pudding_mix",
              "name": "Cheesecake Jello Pudding Mix",
              "quantity": "7",
              "unit": "g",
              "raw": "7G CHEESECAKE JELLO PUDDING MIX",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "strawberries",
              "name": "Fresh or Frozen Strawberries",
              "quantity": "50",
              "unit": "g",
              "raw": "50G FRESH OR FROZEN DICED STRAWBERRIES",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "golden_oreos",
              "name": "Golden Oreos",
              "quantity": "30",
              "unit": "g",
              "raw": "30G (2 COOKIES) GOLDEN OREOS CRUSHED",
              "section": "Mix-In",
              "isMixin": true,
              "notes": "Signature crunch coating"
          },
          {
              "id": "strawberry_gelatin",
              "name": "Sugar-Free Strawberry Gelatin Powder",
              "quantity": "3",
              "unit": "g",
              "raw": "3G SF STRAWBERRY GELATIN POWDER",
              "section": "Mix-In",
              "isMixin": true,
              "notes": "Tossed with crushed cookies"
          }
      ],
      "instructions": [
          "BLEND MILK, PROTEIN POWDER, AND CHEESECAKE PUDDING MIX UNTIL SMOOTH",
          "STIR IN DICED STRAWBERRIES AND FREEZE FOR 16+ HOURS",
          "RUN UNDER WARM WATER FOR 60 SECONDS",
          "SPIN ON 'ICE CREAM' SETTING",
          "HOLLOW OUT A CENTER WELL AND ADD CRUSHED GOLDEN OREOS TOSSED WITH STRAWBERRY GELATIN",
          "SPIN ON 'MIX-IN' SETTING AND ENJOY!"
      ],
      "aliases": [
          "good_humor_strawberry_shortcake",
          "strawberry_crumb_bar"
      ]
  }  ,
{
      "id": "caramel_shortbread_cookie_crunch",
      "name": "Caramel Shortbread Cookie Crunch",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 3,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 3,
      "macros": {
          "calories": "295",
          "protein": "25g",
          "carbs": "28g",
          "fat": "7g",
          "sugar": "6g",
          "fiber": "3g"
      },
      "spinSetting": "Lite Ice Cream",
      "prepTime": "3 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Freeze the chopped shortbread cookies for 10 minutes before adding them to the mix-in cycle so they stay snappy and crisp rather than dissolving into the base.",
      "ingredients": [
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "360",
              "unit": "g",
              "raw": "360G FAT FREE ULTRA-FILTERED MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_protein_powder",
              "name": "Vanilla Protein Powder",
              "quantity": "25",
              "unit": "g",
              "raw": "25G VANILLA PROTEIN POWDER",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "caramel_syrup",
              "name": "Sugar-Free Caramel Syrup",
              "quantity": "20",
              "unit": "g",
              "raw": "20G SUGAR-FREE CARAMEL SYRUP",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "xanthan_gum",
              "name": "Xanthan Gum",
              "quantity": "1",
              "unit": "g",
              "raw": "1G XANTHAN GUM",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "shortbread_cookies",
              "name": "Shortbread Cookies",
              "quantity": "20",
              "unit": "g",
              "raw": "20G SHORTBREAD COOKIES (CHOPPED)",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          },
          {
              "id": "mini_chocolate_chips",
              "name": "Mini Semi-Sweet Chocolate Chips",
              "quantity": "10",
              "unit": "g",
              "raw": "10G MINI CHOCOLATE CHIPS",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          }
      ],
      "instructions": [
          "FROTH MILK, PROTEIN POWDER, CARAMEL SYRUP, AND XANTHAN GUM UNTIL THICK",
          "FREEZE FOR AT LEAST 16 HOURS",
          "RUN WARM WATER AROUND THE SIDES FOR 60 SECONDS",
          "SPIN ON 'LITE ICE CREAM' SETTING",
          "CREATE A CENTER HOLE AND ADD CHOPPED SHORTBREAD COOKIES AND MINI CHOCOLATE CHIPS",
          "SPIN ON 'MIX-IN' SETTING"
      ],
      "aliases": [
          "twix_blizzard",
          "caramel_twix_cookie"
      ]
  }  ,
{
      "id": "brown_sugar_oat_shaken_espresso",
      "name": "Brown Sugar Oat Shaken Espresso",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 4,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 4,
      "macros": {
          "calories": "160",
          "protein": "12g",
          "carbs": "18g",
          "fat": "4g",
          "sugar": "3g",
          "fiber": "2g"
      },
      "spinSetting": "Lite Ice Cream",
      "prepTime": "2 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Brew 2 shots of dark roast espresso (or mix 2 tsp instant espresso with 60ml hot water). Let it cool to room temperature before blending with the oat milk so it doesn't separate.",
      "ingredients": [
          {
              "id": "espresso",
              "name": "Brewed Espresso",
              "quantity": "60",
              "unit": "ml",
              "raw": "60ML BREWED ESPRESSO (OR COLD BREW CONCENTRATE)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "oat_milk",
              "name": "Barista Oat Milk",
              "quantity": "320",
              "unit": "g",
              "raw": "320G BARISTA OAT MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "brown_sugar_sweetener",
              "name": "Brown Sugar Sweetener",
              "quantity": "15",
              "unit": "g",
              "raw": "15G BROWN SUGAR SWEETENER (ALLULOSE/SWERVE)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cinnamon",
              "name": "Ground Cinnamon",
              "quantity": "1",
              "unit": "g",
              "raw": "1G GROUND CINNAMON",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_bean_paste",
              "name": "Vanilla Bean Paste",
              "quantity": "0.5",
              "unit": "tsp",
              "raw": "1/2 TSP VANILLA BEAN PASTE",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "xanthan_gum",
              "name": "Xanthan Gum",
              "quantity": "1",
              "unit": "g",
              "raw": "1G XANTHAN GUM",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          }
      ],
      "instructions": [
          "BREW ESPRESSO AND ALLOW TO COOL",
          "WHISK TOGETHER WITH OAT MILK, BROWN SUGAR SWEETENER, CINNAMON, VANILLA, AND XANTHAN GUM",
          "FREEZE FOR 16+ HOURS",
          "WARM BATH SIDES FOR 60 SECONDS",
          "SPIN ON 'LITE ICE CREAM' SETTING (OPTIONAL RE-SPIN WITH 1 TBSP OAT MILK FOR EXTRA SILKY TEXTURE)"
      ],
      "aliases": [
          "starbucks_shaken_espresso",
          "brown_sugar_espresso_gelato"
      ]
  }  ,
{
      "id": "mangonada_mango_tajin_sorbet",
      "name": "Mangonada (Mango Taj\u00edn Sorbet)",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 5,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 5,
      "macros": {
          "calories": "150",
          "protein": "2g",
          "carbs": "36g",
          "fat": "0.5g",
          "sugar": "28g",
          "fiber": "4g"
      },
      "spinSetting": "Sorbet",
      "prepTime": "2 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Drizzle Chamoy along the inside walls of your serving bowl or hollowed center well, then dust generously with Taj\u00edn for the authentic Mexican paleteria experience.",
      "ingredients": [
          {
              "id": "mango",
              "name": "Mango Chunks",
              "quantity": "300",
              "unit": "g",
              "raw": "300G FROZEN SWEET MANGO CHUNKS (THAWED SLIGHTLY)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "coconut_water",
              "name": "Coconut Water",
              "quantity": "100",
              "unit": "g",
              "raw": "100G COCONUT WATER (OR WATER WITH LIME)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "lime_juice",
              "name": "Fresh Lime Juice",
              "quantity": "15",
              "unit": "ml",
              "raw": "1 TBSP FRESH LIME JUICE",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "sweetener",
              "name": "Sweetener",
              "quantity": "10",
              "unit": "g",
              "raw": "10G SWEETENER OR AGAVE (OPTIONAL TO TASTE)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "chamoy",
              "name": "Chamoy Sauce",
              "quantity": "15",
              "unit": "g",
              "raw": "15G CHAMOY SAUCE",
              "section": "Mix-In",
              "isMixin": true,
              "notes": "Swirled into finished sorbet"
          },
          {
              "id": "tajin",
              "name": "Taj\u00edn Cl\u00e1sico Seasoning",
              "quantity": "1",
              "unit": "tsp",
              "raw": "1 TSP TAJ\u00cdN CL\u00c1SICO SEASONING",
              "section": "Mix-In",
              "isMixin": true,
              "notes": "Garnished on top"
          }
      ],
      "instructions": [
          "BLEND MANGO CHUNKS WITH COCONUT WATER, LIME JUICE, AND SWEETENER UNTIL PUREED",
          "POUR INTO PINT AND FREEZE FOR 16+ HOURS",
          "RUN UNDER WARM WATER FOR 60 SECONDS",
          "SPIN ON 'SORBET' SETTING (RE-SPIN WITH 1 TBSP COCONUT WATER IF ICY)",
          "SWIRL WITH CHAMOY AND DUST WITH TAJ\u00cdN BEFORE DIGGING IN"
      ],
      "aliases": [
          "mangonada",
          "mango_tajin_sorbet",
          "mexican_mango_sorbet"
      ]
  }  ,
{
      "id": "lemon_blueberry_cheesecake",
      "name": "Lemon Blueberry Cheesecake",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 6,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 6,
      "macros": {
          "calories": "230",
          "protein": "28g",
          "carbs": "24g",
          "fat": "3g",
          "sugar": "8g",
          "fiber": "3g"
      },
      "spinSetting": "Lite Ice Cream",
      "prepTime": "3 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Microwave the blueberries with 1 tsp of sweetener for 30 seconds to release natural pectin and juices before swirling in.",
      "ingredients": [
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "250",
              "unit": "g",
              "raw": "250G FAT FREE ULTRA-FILTERED MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "nonfat_greek_yogurt",
              "name": "Nonfat Plain Greek Yogurt",
              "quantity": "100",
              "unit": "g",
              "raw": "100G NONFAT PLAIN GREEK YOGURT",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cheesecake_jello_pudding_mix",
              "name": "Cheesecake Jello Pudding Mix",
              "quantity": "8",
              "unit": "g",
              "raw": "8G CHEESECAKE JELLO PUDDING MIX",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_protein_powder",
              "name": "Vanilla Protein Powder",
              "quantity": "20",
              "unit": "g",
              "raw": "20G VANILLA WHEY/CASEIN PROTEIN",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "lemon_juice",
              "name": "Lemon Juice & Zest",
              "quantity": "15",
              "unit": "ml",
              "raw": "1 TBSP FRESH LEMON JUICE AND ZEST",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "blueberries",
              "name": "Fresh Blueberries",
              "quantity": "50",
              "unit": "g",
              "raw": "50G FRESH BLUEBERRIES",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          },
          {
              "id": "graham_cracker",
              "name": "Graham Crackers",
              "quantity": "15",
              "unit": "g",
              "raw": "15G GRAHAM CRACKERS (CRUSHED)",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          }
      ],
      "instructions": [
          "BLEND MILK, GREEK YOGURT, CHEESECAKE PUDDING, PROTEIN POWDER, AND LEMON JUICE",
          "FREEZE FOR 16+ HOURS",
          "WARM BATH FOR 60 SECONDS",
          "SPIN ON 'LITE ICE CREAM' SETTING",
          "ADD BLUEBERRIES AND CRUSHED GRAHAM CRACKERS TO THE CENTER WELL",
          "SPIN ON 'MIX-IN' SETTING"
      ],
      "aliases": [
          "lemon_berry_cheesecake",
          "greek_yogurt_lemon_cheesecake"
      ]
  }  ,
{
      "id": "acai_power_bowl_pint",
      "name": "Acai Power Bowl Pint",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 7,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 7,
      "macros": {
          "calories": "190",
          "protein": "6g",
          "carbs": "38g",
          "fat": "3g",
          "sugar": "20g",
          "fiber": "6g"
      },
      "spinSetting": "Sorbet",
      "prepTime": "2 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Top with fresh banana coins, sliced strawberries, and a drizzle of almond butter right after spinning for the ultimate breakfast pint.",
      "ingredients": [
          {
              "id": "acai_puree",
              "name": "Pure Unsweetened A\u00e7ai Puree",
              "quantity": "100",
              "unit": "g",
              "raw": "1 PACKET (100G) UNSWEETENED A\u00c7AI PUREE",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "banana",
              "name": "Banana",
              "quantity": "100",
              "unit": "g",
              "raw": "1 MEDIUM (100G) RIPE BANANA",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "almond_milk",
              "name": "Unsweetened Almond Milk",
              "quantity": "200",
              "unit": "g",
              "raw": "200G UNSWEETENED ALMOND MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "sweetener",
              "name": "Sweetener",
              "quantity": "10",
              "unit": "g",
              "raw": "10G SWEETENER OR RAW HONEY",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "granola",
              "name": "Granola",
              "quantity": "20",
              "unit": "g",
              "raw": "20G HEMP OR OAT GRANOLA",
              "section": "Mix-In",
              "isMixin": true,
              "notes": "Added after spin"
          }
      ],
      "instructions": [
          "BLEND A\u00c7AI, BANANA, ALMOND MILK, AND SWEETENER UNTIL ULTRA-SMOOTH",
          "FREEZE FOR 16+ HOURS",
          "RUN WARM WATER AROUND PINT FOR 60 SECONDS",
          "SPIN ON 'SORBET' SETTING",
          "TOP OR MIX-IN WITH CRUNCHY GRANOLA"
      ],
      "aliases": [
          "acai_bowl",
          "acai_sorbet_pint"
      ]
  }  ,
{
      "id": "hazelnut_cocoa_truffle_crunch",
      "name": "Hazelnut Cocoa Truffle Crunch",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 8,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 8,
      "macros": {
          "calories": "330",
          "protein": "26g",
          "carbs": "29g",
          "fat": "11g",
          "sugar": "14g",
          "fiber": "3g"
      },
      "spinSetting": "Gelato",
      "prepTime": "3 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Warming the Nutella in the microwave for 15 seconds makes it blend effortlessly into the base without sticking to the sides of your blender.",
      "ingredients": [
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "320",
              "unit": "g",
              "raw": "320G FAT FREE ULTRA-FILTERED MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "chocolate_protein_powder",
              "name": "Chocolate Protein Powder",
              "quantity": "25",
              "unit": "g",
              "raw": "25G CHOCOLATE PROTEIN POWDER",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "nutella",
              "name": "Nutella / Cocoa Hazelnut Spread",
              "quantity": "20",
              "unit": "g",
              "raw": "20G NUTELLA OR HAZELNUT COCOA SPREAD",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "hazelnuts",
              "name": "Roasted Hazelnuts",
              "quantity": "15",
              "unit": "g",
              "raw": "15G ROASTED HAZELNUTS (CRUSHED)",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          },
          {
              "id": "wafer_cookies",
              "name": "Crispy Wafer Cookies",
              "quantity": "10",
              "unit": "g",
              "raw": "10G CRISPY CHOCOLATE OR VANILLA WAFERS",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          }
      ],
      "instructions": [
          "WARM NUTELLA SLIGHTLY AND BLEND WITH MILK AND CHOCOLATE PROTEIN POWDER",
          "FREEZE FOR 16+ HOURS",
          "WARM WATER BATH FOR 60 SECONDS",
          "SPIN ON 'GELATO' SETTING",
          "HOLLOW OUT CENTER WELL, ADD CRUSHED HAZELNUTS AND CRISPY WAFERS",
          "SPIN ON 'MIX-IN' SETTING"
      ],
      "aliases": [
          "ferrero_rocher_gelato",
          "nutella_hazelnut_crunch"
      ]
  }  ,
{
      "id": "warm_bakery_cinnamon_roll_swirl",
      "name": "Warm Bakery Cinnamon Roll Swirl",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 9,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 9,
      "macros": {
          "calories": "260",
          "protein": "28g",
          "carbs": "26g",
          "fat": "4g",
          "sugar": "8g",
          "fiber": "2g"
      },
      "spinSetting": "Lite Ice Cream",
      "prepTime": "3 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Whisk 1 tbsp of light cream cheese with 1 tsp almond milk and 1 tsp sweetener to make a genuine cinnabon-style cream cheese glaze drizzle!",
      "ingredients": [
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "350",
              "unit": "g",
              "raw": "350G FAT FREE ULTRA-FILTERED MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_protein_powder",
              "name": "Vanilla Protein Powder",
              "quantity": "25",
              "unit": "g",
              "raw": "25G VANILLA PROTEIN POWDER",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cinnamon",
              "name": "Ground Cinnamon",
              "quantity": "2",
              "unit": "g",
              "raw": "2G GROUND CINNAMON",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "brown_sugar_sweetener",
              "name": "Brown Sugar Sweetener",
              "quantity": "15",
              "unit": "g",
              "raw": "15G BROWN SUGAR SWEETENER",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "light_cream_cheese",
              "name": "Light Cream Cheese",
              "quantity": "20",
              "unit": "g",
              "raw": "20G LIGHT CREAM CHEESE",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cinnamon_toast_crunch",
              "name": "Cinnamon Toast Crunch",
              "quantity": "15",
              "unit": "g",
              "raw": "15G CINNAMON TOAST CRUNCH",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          }
      ],
      "instructions": [
          "BLEND MILK, PROTEIN, CINNAMON, BROWN SUGAR SWEETENER, AND CREAM CHEESE",
          "FREEZE FOR 16+ HOURS",
          "WARM BATH FOR 60 SECONDS",
          "SPIN ON 'LITE ICE CREAM' SETTING",
          "ADD CINNAMON CRUNCH BITS TO THE WELL AND RUN 'MIX-IN'"
      ],
      "aliases": [
          "cinnabon_swirl",
          "cinnamon_roll_ice_cream"
      ]
  }  ,
{
      "id": "toasted_coconut_cream_pie",
      "name": "Toasted Coconut Cream Pie",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 10,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 10,
      "macros": {
          "calories": "270",
          "protein": "22g",
          "carbs": "27g",
          "fat": "7g",
          "sugar": "7g",
          "fiber": "3g"
      },
      "spinSetting": "Ice Cream",
      "prepTime": "3 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Toast shredded unsweetened coconut in a dry skillet on medium heat for 2\u20133 minutes until fragrant and golden before adding as mix-in.",
      "ingredients": [
          {
              "id": "unsweetened_coconut_milk",
              "name": "Light Canned Coconut Milk",
              "quantity": "200",
              "unit": "g",
              "raw": "200G LIGHT CANNED COCONUT MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "150",
              "unit": "g",
              "raw": "150G FAT FREE ULTRA-FILTERED MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_protein_powder",
              "name": "Vanilla Protein Powder",
              "quantity": "20",
              "unit": "g",
              "raw": "20G VANILLA WHEY PROTEIN",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cheesecake_jello_pudding_mix",
              "name": "Vanilla or Cheesecake Pudding Mix",
              "quantity": "8",
              "unit": "g",
              "raw": "8G SUGAR-FREE PUDDING MIX",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "shredded_coconut",
              "name": "Shredded Coconut",
              "quantity": "12",
              "unit": "g",
              "raw": "12G TOASTED COCONUT FLAKES",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          },
          {
              "id": "nilla_wafers",
              "name": "Vanilla Wafers",
              "quantity": "15",
              "unit": "g",
              "raw": "15G CRUSHED VANILLA WAFERS",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          }
      ],
      "instructions": [
          "BLEND COCONUT MILK, ULTRA-FILTERED MILK, PROTEIN, AND PUDDING MIX",
          "FREEZE FOR 16+ HOURS",
          "WARM BATH FOR 60 SECONDS",
          "SPIN ON 'ICE CREAM' SETTING",
          "ADD TOASTED COCONUT FLAKES AND CRUSHED NILLA WAFERS TO THE WELL",
          "SPIN ON 'MIX-IN' SETTING"
      ],
      "aliases": [
          "coconut_cream_pie",
          "toasted_coconut_ice_cream"
      ]
  }  ,
{
      "id": "black_forest_chocolate_cherry",
      "name": "Black Forest Chocolate Cherry",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 11,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 11,
      "macros": {
          "calories": "250",
          "protein": "27g",
          "carbs": "26g",
          "fat": "4.5g",
          "sugar": "14g",
          "fiber": "3g"
      },
      "spinSetting": "Gelato",
      "prepTime": "3 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Use dark sweet Bing cherries packed in their own natural juices. Coarsely chop them so you get juicy cherry bursts in every bite.",
      "ingredients": [
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "350",
              "unit": "g",
              "raw": "350G FAT FREE ULTRA-FILTERED MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "chocolate_protein_powder",
              "name": "Chocolate Protein Powder",
              "quantity": "25",
              "unit": "g",
              "raw": "25G CHOCOLATE WHEY/CASEIN PROTEIN",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cocoa_powder",
              "name": "Dutch Cocoa Powder",
              "quantity": "8",
              "unit": "g",
              "raw": "8G DUTCH PROCESS COCOA POWDER",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "sweetener",
              "name": "Sweetener",
              "quantity": "10",
              "unit": "g",
              "raw": "10G SWEETENER OF CHOICE",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cherries",
              "name": "Dark Sweet Cherries",
              "quantity": "50",
              "unit": "g",
              "raw": "50G PITTED DARK SWEET CHERRIES (CHOPPED)",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          },
          {
              "id": "dark_chocolate_chips",
              "name": "Dark Chocolate",
              "quantity": "10",
              "unit": "g",
              "raw": "10G SHAVED DARK CHOCOLATE (70%)",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          }
      ],
      "instructions": [
          "BLEND MILK, PROTEIN, COCOA POWDER, AND SWEETENER",
          "FREEZE FOR 16+ HOURS",
          "WARM BATH FOR 60 SECONDS",
          "SPIN ON 'GELATO' SETTING",
          "ADD CHOPPED DARK CHERRIES AND SHAVED DARK CHOCOLATE TO THE WELL",
          "SPIN ON 'MIX-IN' SETTING"
      ],
      "aliases": [
          "black_forest_gelato",
          "chocolate_cherry_ice_cream"
      ]
  }  ,
{
      "id": "spiced_apple_cider_donut",
      "name": "Spiced Apple Cider Donut",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 12,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 12,
      "macros": {
          "calories": "240",
          "protein": "20g",
          "carbs": "34g",
          "fat": "3g",
          "sugar": "16g",
          "fiber": "2g"
      },
      "spinSetting": "Lite Ice Cream",
      "prepTime": "3 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Simmer 1 cup of spiced apple cider on the stove for 10 minutes until it reduces to 1/2 cup. This intensifies the apple donut flavor exponentially.",
      "ingredients": [
          {
              "id": "apple_cider",
              "name": "Spiced Apple Cider",
              "quantity": "150",
              "unit": "g",
              "raw": "150G SPICED APPLE CIDER (REDUCED)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "200",
              "unit": "g",
              "raw": "200G FAT FREE ULTRA-FILTERED MILK",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_protein_powder",
              "name": "Vanilla Protein Powder",
              "quantity": "20",
              "unit": "g",
              "raw": "20G VANILLA PROTEIN POWDER",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "cinnamon",
              "name": "Ground Cinnamon",
              "quantity": "1",
              "unit": "g",
              "raw": "1G GROUND CINNAMON",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "nutmeg",
              "name": "Ground Nutmeg",
              "quantity": "1",
              "unit": "pinch",
              "raw": "PINCH OF GROUND NUTMEG",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "donut_holes",
              "name": "Apple Cider Donut Pieces",
              "quantity": "25",
              "unit": "g",
              "raw": "1 DONUT HOLE (25G) CIDER DONUT CRUMBLED",
              "section": "Mix-In",
              "isMixin": true,
              "notes": ""
          }
      ],
      "instructions": [
          "SIMMER AND COOL APPLE CIDER",
          "WHISK WITH MILK, VANILLA PROTEIN, CINNAMON, AND NUTMEG",
          "FREEZE FOR 16+ HOURS",
          "WARM BATH FOR 60 SECONDS",
          "SPIN ON 'LITE ICE CREAM' SETTING",
          "ADD CRUMBLED CIDER DONUT HOLE TO THE WELL AND RUN 'MIX-IN'"
      ],
      "aliases": [
          "apple_cider_donut_creami",
          "fall_cider_donut"
      ]
  }  ,
{
      "id": "london_fog_earl_grey_lavender",
      "name": "London Fog (Earl Grey Lavender)",
      "category": "Community Legends",
      "categories": [
          "Community Legends"
      ],
      "sources": [
          {
              "book": "Community Legends",
              "page": 13,
              "sourceFile": "Community Legends"
          }
      ],
      "sourceFile": "Community Legends",
      "page": 13,
      "macros": {
          "calories": "180",
          "protein": "14g",
          "carbs": "20g",
          "fat": "5g",
          "sugar": "8g",
          "fiber": "1g"
      },
      "spinSetting": "Gelato",
      "prepTime": "5 MIN",
      "freezeTime": "16+ HOURS",
      "makes": "1 PINT",
      "proTip": "Steep 3 Earl Grey tea bags in 150ml of steaming hot milk for 8 minutes to extract that bold bergamot tea oil before sweetening.",
      "ingredients": [
          {
              "id": "earl_grey_tea",
              "name": "Earl Grey Tea Bags",
              "quantity": "3",
              "unit": "bags",
              "raw": "3 EARL GREY TEA BAGS (STEEPED CONCENTRATED)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "fat_free_ultra_filtered_milk",
              "name": "Fat Free Ultra-Filtered Milk",
              "quantity": "250",
              "unit": "g",
              "raw": "250G FAT FREE ULTRA-FILTERED MILK (OR OAT MILK)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "vanilla_bean_paste",
              "name": "Vanilla Bean Paste",
              "quantity": "1",
              "unit": "tsp",
              "raw": "1 TSP VANILLA BEAN PASTE",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "lavender",
              "name": "Culinary Lavender",
              "quantity": "1",
              "unit": "pinch",
              "raw": "1 PINCH CULINARY LAVENDER (OR 1 DROP EXTRACT)",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "sweetener",
              "name": "Sweetener",
              "quantity": "15",
              "unit": "g",
              "raw": "15G SWEETENER OR RAW HONEY",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          },
          {
              "id": "xanthan_gum",
              "name": "Xanthan Gum",
              "quantity": "1",
              "unit": "g",
              "raw": "1G XANTHAN GUM",
              "section": "Base",
              "isMixin": false,
              "notes": ""
          }
      ],
      "instructions": [
          "STEEP TEA BAGS IN 150ML HOT MILK FOR 8 MINUTES, THEN DISCARD BAGS",
          "COOL TO ROOM TEMP AND WHISK WITH REMAINING MILK, VANILLA, LAVENDER, SWEETENER, AND XANTHAN GUM",
          "FREEZE FOR 16+ HOURS",
          "WARM BATH FOR 60 SECONDS",
          "SPIN ON 'GELATO' SETTING"
      ],
      "aliases": [
          "london_fog_gelato",
          "earl_grey_lavender"
      ]
  }
];
