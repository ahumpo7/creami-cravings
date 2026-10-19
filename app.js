/**
 * Creami Cravings - Modern Ninja Creami Pantry & Recipe Logic Engine
 */

(function () {
  'use strict';

  // Environment & Sandbox Isolation
  const IS_BETA = window.location.pathname.startsWith('/beta') || Boolean(document.querySelector('base[href*="beta"]'));
  const API_BASE = IS_BETA ? '/beta' : '';
  const STORAGE_PREFIX = IS_BETA ? 'beta_' : '';

  if (IS_BETA) {
    document.documentElement.classList.add('is-beta-env');
    if (document.body) {
      document.body.classList.add('is-beta-env');
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('is-beta-env');
      });
    }
  } else {
    // On production, strictly purge any beta elements or ribbons immediately
    const stripBetaBanner = () => {
      const ribbon = document.getElementById('betaSandboxRibbon');
      if (ribbon) ribbon.remove();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', stripBetaBanner);
    } else {
      stripBetaBanner();
    }
  }

  // Intercept fetch on beta to automatically route /api calls to /beta/api
  if (IS_BETA && window.fetch) {
    const origFetch = window.fetch;
    window.fetch = function (url, options) {
      if (typeof url === 'string') {
        if (url.startsWith('/api/')) {
          url = '/beta' + url;
        } else if (url.startsWith('api/')) {
          url = '/beta/' + url;
        }
      }
      return origFetch.call(this, url, options);
    };
  }

  // LocalStorage Keys (Namespaced on beta sandbox to prevent collisions with production)
  const PANTRY_STORAGE_KEY = STORAGE_PREFIX + 'creami_pantry_v2';
  const PANTRY_QUANTITIES_STORAGE_KEY = STORAGE_PREFIX + 'creami_pantry_quantities_v1';
  const THEME_STORAGE_KEY = STORAGE_PREFIX + 'creami_theme_mode';
  const FAVORITES_STORAGE_KEY = STORAGE_PREFIX + 'creami_favorites_v2';
  const CUSTOM_RECIPES_STORAGE_KEY = STORAGE_PREFIX + 'creami_custom_recipes_v2';
  const MANUAL_SHOPPING_STORAGE_KEY = STORAGE_PREFIX + 'creami_manual_shopping_v2';
  const USER_RECIPE_DATA_KEY = STORAGE_PREFIX + 'creami_user_recipe_data_v2';
  const USER_AUTH_STORAGE_KEY = STORAGE_PREFIX + 'creami_user_auth_v2';
  const RECIPE_MADE_STORAGE_KEY = STORAGE_PREFIX + 'creami_recipe_made_v2';
  const COMMUNITY_STATS_CACHE_KEY = STORAGE_PREFIX + 'creami_community_stats_v2';
  const FREEZER_STORAGE_KEY = STORAGE_PREFIX + 'creami_freezer_pints_v2';
  const FREEZER_CAPACITY_STORAGE_KEY = STORAGE_PREFIX + 'creami_freezer_capacity_v1';
  const FREEZER_COLLAPSED_STORAGE_KEY = STORAGE_PREFIX + 'creami_freezer_shelf_collapsed_v1';
  const MIMIC_ROLE_STORAGE_KEY = STORAGE_PREFIX + 'creami_mimic_role_v1';
  const MIMIC_CREATOR_STORAGE_KEY = STORAGE_PREFIX + 'creami_mimic_creator_v1';
  const REAL_ADMIN_STORAGE_KEY = STORAGE_PREFIX + 'creami_real_admin_user_v1';
  const BATCH_PREP_STORAGE_KEY = STORAGE_PREFIX + 'creami_batch_prep_queue_v1';
  const HABIT_STREAK_STORAGE_KEY = STORAGE_PREFIX + 'creami_habit_streaks_v1';

  // Defensive HTML Sanitization
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Default Staples Checked for New Users
  const DEFAULT_STAPLES = [];

  // Presets Mapping
  const PANTRY_PRESETS = {
    essentials: [
      'fat_free_ultra_filtered_milk',
      'sweetener',
      'xanthan_gum',
      'salt',
      'vanilla_bean_paste'
    ],
    shakes: [
      'vanilla_protein_shake',
      'chocolate_protein_shake',
      'strawberry_protein_shake',
      'caramel_protein_shake',
      'vanilla_protein_powder',
      'sweetener',
      'xanthan_gum',
      'salt'
    ],
    choc: [
      'chocolate_protein_shake',
      'cocoa_powder',
      'black_cocoa_powder',
      'chocolate_chips',
      'oreo',
      'oreo_thins',
      'sweetener',
      'xanthan_gum',
      'salt'
    ],
    fruit: [
      'fat_free_ultra_filtered_milk',
      'banana',
      'strawberries',
      'blueberries',
      'raspberries',
      'lemon_juice',
      'lime_juice',
      'sweetener',
      'xanthan_gum',
      'salt'
    ],
    keto: [
      'vanilla_protein_shake',
      'chocolate_protein_shake',
      'sweetener',
      'brown_sugar_sweetener',
      'xanthan_gum',
      'salt',
      'cinnamon',
      'cocoa_powder'
    ]
  };

  // Common household staples / freebies excluded from grocery shopping lists
  const SHOPPING_EXCLUDED_ITEMS = new Set([
    'salt',
    'water',
    'cold_water',
    'hot_water',
    'warm_water',
    'ice',
    'ice_cubes',
    'ice_water',
    'tap_water',
    'cooking_spray',
    'spray'
  ]);

  // Known compound ingredient display aliases for clean grocery presentation
  const INGREDIENT_DISPLAY_ALIASES = {
    'Vanilla Extract Or Vanilla Bean Paste': 'Vanilla Extract (or Bean Paste)',
    'Peppermint Bark Chocolate Square Or Peppermint Candies': 'Peppermint Bark (or Candies)',
    'Oranges Or Orange Juice': 'Oranges (or Orange Juice)',
    'Lemon Zest & Juice': 'Fresh Lemons (Zest & Juice)',
    'Frozen Berries Of Choice': 'Frozen Berries (Your Choice)',
    'Fruit Of Your Choice': 'Fresh Fruit (Your Choice)',
    'Nuts Of Choice': 'Mixed Nuts (Your Choice)',
    'Mini Lucky-Charms-Style Marshmallows': 'Mini Cereal Marshmallows',
    'Cinnamon Crunch Cereal': 'Cinnamon Toast Crunch',
    'cinnamon crunch cereal': 'Cinnamon Toast Crunch',
    'Cinnamon Cereal': 'Cinnamon Toast Crunch',
    'cinnamon cereal': 'Cinnamon Toast Crunch',
    'cinnamon toast crunch': 'Cinnamon Toast Crunch',
    'Cinnamon toast crunch': 'Cinnamon Toast Crunch'
  };

  // Interchangeable ingredients in pantry matcher
  const INGREDIENT_EQUIVALENTS = {
    cinnamon_toast_crunch: ['cinnamon_cereal', 'cinnamon_toast_crunch'],
    cinnamon_cereal: ['cinnamon_toast_crunch', 'cinnamon_cereal'],
    vanilla_extract_or_vanilla_bean_paste: ['vanilla_extract', 'vanilla_bean_paste'],
    vanilla_bean_paste: ['vanilla_extract', 'vanilla_extract_or_vanilla_bean_paste'],
    vanilla_extract: ['vanilla_bean_paste', 'vanilla_extract_or_vanilla_bean_paste'],
    oranges_or_orange_juice: ['oranges', 'orange_juice', 'oranges_or_orange_juice'],
    peppermint_bark_chocolate_square_or_peppermint_candies: ['peppermint_candies', 'peppermint_bark', 'peppermint_bark_chocolate_square_or_peppermint_candies'],
    cinnamon: ['ground_cinnamon'],
    ground_cinnamon: ['cinnamon'],
    canned_pumpkin: ['pure_pumpkin'],
    pure_pumpkin: ['canned_pumpkin'],
    mini_reeses_pb_cups: ['reeses_pb_cups', 'peanut_butter_cups'],
    reeses_pb_cups: ['mini_reeses_pb_cups', 'peanut_butter_cups'],
    peanut_butter_cups: ['reeses_pb_cups', 'mini_reeses_pb_cups'],
    toasted_mini_marshmallows: ['mini_marshmallows'],
    mini_marshmallows: ['toasted_mini_marshmallows'],
    lime: ['lime_juice'],
    lime_juice: ['lime'],
    plain_greek_yogurt: ['nonfat_greek_yogurt'],
    nonfat_greek_yogurt: ['plain_greek_yogurt'],
    graham_crackers: ['graham_cracker'],
    graham_cracker: ['graham_crackers'],
    mini_chocolate_chips: ['chocolate_chips', 'dark_chocolate_chips', 'sugar_free_chocolate_chips'],
    chocolate_chips: ['mini_chocolate_chips'],
    blueberries: ['frozen_blueberries'],
    frozen_blueberries: ['blueberries'],
    light_coconut_milk: ['unsweetened_coconut_milk'],
    unsweetened_coconut_milk: ['light_coconut_milk'],
    light_cream_cheese: ['whipped_cream_cheese'],
    whipped_cream_cheese: ['light_cream_cheese'],
    chocolate_protein_powder: ['chocolate_protein_shake', 'vanilla_protein_powder']
  };

  const CATEGORY_ICONS = {
    dairy_liquids: '🥛',
    protein_powders: '🍦',
    pudding_mixes: '🍮',
    sweeteners_binders: '🍯',
    baking_powders: '🍫',
    extracts_flavors: '🧂',
    syrups_sauces: '🥞',
    nut_butters_spreads: '🥜',
    produce_fruit: '🍓',
    beverages_drinks: '☕',
    spices_seasonings: '🌿',
    mixins_snacks: '🍪'
  };

  function isShoppingExcluded(itemOrName) {
    if (!itemOrName) return true;
    let id = '';
    let name = '';
    if (typeof itemOrName === 'string') {
      name = itemOrName.toLowerCase().trim();
      id = name.replace(/[^a-z0-9]+/g, '_').trim();
    } else {
      id = (itemOrName.id || '').toLowerCase().trim();
      name = (itemOrName.name || '').toLowerCase().trim();
    }

    if (SHOPPING_EXCLUDED_ITEMS.has(id)) return true;

    if (/^(water|cold water|hot water|warm water|tap water|ice|ice cubes|ice water|cooking spray|salt|table salt|pinch of salt|a pinch of salt)$/i.test(name)) {
      return true;
    }

    return false;
  }

  function sanitizeShoppingItemName(name) {
    if (!name || typeof name !== 'string') return '';
    let s = name.trim();
    if (INGREDIENT_DISPLAY_ALIASES[s]) return INGREDIENT_DISPLAY_ALIASES[s];

    s = s.replace(/\(code[^\)]*\)/gi, '');
    s = s.replace(/\((mix-in|base|topping|optional|garnish|divided)\)/gi, '');
    s = s.replace(/^(optional|mix-in|topping|garnish|base):\s*/gi, '');
    s = s.replace(/^(\d+[\/\-]\d+|\d+(\.\d+)?|a pinch of|a dash of|a splash of)\s*(cups?|c|tbsp|tsp|tbs|t|scoops?|scoop|grams?|g|oz|ml|fl\s*oz|can|cans|pinch|dash|drop|drops)?\s*(of)?\s*/gi, '');
    s = s.replace(/,\s*(crumbled|melted|chopped|divided|crushed|to taste|for topping|as needed).*$/gi, '');
    s = s.replace(/\s*\((crumbled|melted|chopped|divided|crushed|optional).*?\)/gi, '');
    s = s.trim();

    const masterMatch = (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) 
      ? INGREDIENTS_MASTER.find(i => i.name.toLowerCase() === s.toLowerCase())
      : null;
    if (masterMatch) return masterMatch.name;

    if (s === s.toLowerCase() || s === s.toUpperCase()) {
      s = s.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    return s;
  }

  const MATCH_STOP_WORDS = new Set([
    'powder', 'powders', 'liquid', 'liquids', 'milk', 'shake', 'shakes', 
    'extract', 'extracts', 'mix', 'mixes', 'blend', 'blends', 'flavor', 
    'flavoring', 'puree', 'syrup', 'syrups', 'sauce', 'sauces', 'cup', 'cups',
    'style', 'cookies', 'cookie', 'chips', 'chip', 'bar', 'bars', 'pieces', 'piece'
  ]);

  function normalizeIngName(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .replace(/[\(\)\[\]\{\}\/\\,:\-_'"\.!#*&]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function collapseName(str) {
    return (normalizeIngName(str) || '').replace(/\s+/g, '');
  }

  function isItemInPantry(ing) {
    if (!ing) return false;
    const id = typeof ing === 'string' ? ing : (ing.id || '');
    if (id && pantryState.has(id)) return true;
    if (id) {
      const equivs = INGREDIENT_EQUIVALENTS[id];
      if (equivs && equivs.some(eqId => pantryState.has(eqId))) return true;
    }

    const rawName = typeof ing === 'object' ? (ing.name || '') : (typeof ing === 'string' ? ing : '');
    if (rawName) {
      const clean = sanitizeShoppingItemName(rawName);
      const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      if (slug && pantryState.has(slug)) return true;

      const norm = normalizeIngName(clean);
      const col = collapseName(clean);
      if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
        const masterMatch = INGREDIENTS_MASTER.find(m => 
          m.id === slug ||
          m.name.toLowerCase() === clean.toLowerCase() ||
          (norm && normalizeIngName(m.name) === norm) ||
          (col && collapseName(m.name) === col)
        );
        if (masterMatch && (pantryState.has(masterMatch.id) || (INGREDIENT_EQUIVALENTS[masterMatch.id] && INGREDIENT_EQUIVALENTS[masterMatch.id].some(eqId => pantryState.has(eqId))))) {
          return true;
        }
      }
    }

    return false;
  }

  function getIngredientCategoryKey(nameOrId, stepHint) {
    if (!nameOrId && !stepHint) return 'mixins_snacks';
    const clean = sanitizeShoppingItemName(nameOrId || '').toLowerCase();
    const id = clean.replace(/[^a-z0-9]+/g, '_').trim();
    if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
      const match = INGREDIENTS_MASTER.find(i => i.id === id || i.name.toLowerCase() === clean);
      if (match && match.category) return match.category;
    }

    // Step-Hint Specific Overrides for Highly Specific Contexts
    if (stepHint === 'stabilizer' && /gum|gelatin|agar|tara|cellulose|glucomannan|locust bean|pectin|pudding|cornstarch/i.test(clean)) {
      if (/pudding/i.test(clean)) return 'pudding_mixes';
      return 'sweeteners_binders';
    }

    // Comprehensive Category Keyword Detection
    if (/protein shake|protein powder|pb fit|peanut butter powder|whey|casein|collagen|isolate|plant protein|egg white powder/i.test(clean)) return 'protein_powders';
    if (/pudding mix|instant pudding|jell-?o|pudding/i.test(clean)) return 'pudding_mixes';
    if (/\bcocoa\b|\bcacao\b|\bflour\b|\boats\b|\boat flour\b|\bcornstarch\b|\bmalted milk\b|\bbaking powder\b|\bbaking soda\b/i.test(clean)) return 'baking_powders';
    if (/syrup|sauce|ganache|caramel drizzle|chocolate sauce|honey|maple syrup|agave/i.test(clean)) return 'syrups_sauces';
    if (/xanthan|guar gum|tara gum|cellulose gum|gelatin|agar|glucomannan|locust bean gum|allulose|erythritol|stevia|monk fruit|swerve|splenda|sweetener|cane sugar|brown sugar/i.test(clean)) return 'sweeteners_binders';
    if (/extract|emulsion|paste|flavoring|flavor drops|vanilla extract|cake batter flavor|lemon emulsion|coloring/i.test(clean)) return 'extracts_flavors';
    // Mix-Ins, Cereals, Cookies & Candies (Must be checked before spices so cinnamon cereal doesn't match spice)
    if (/cinnamon toast crunch|cereal|cheerios|chex|pebbles|puffs|loops|graham|oreo|cookie|chips?|candy|sprinkle|marshmallow|pretzel|brownie|cake|dough|boba|pop-?tart|wafer|crisp|snack|cinnamon roll|cinnamon bun/i.test(clean)) return 'mixins_snacks';
    if (/cinnamon|spice|nutmeg|salt|clove|ginger|cardamom|pumpkin pie spice|allspice/i.test(clean)) {
      if (/cereal|crunch|cookie|graham|roll|bun|pastry|bar|toast/i.test(clean)) return 'mixins_snacks';
      return 'spices_seasonings';
    }
    if (/peanut butter|pb|nutella|almond butter|cashew butter|cookie butter|sunbutter|spread|jam|jelly|preserves|marshmallow fluff|marshmallow creme|frosting/i.test(clean)) return 'nut_butters_spreads';
    if (/coffee|espresso|cold brew|tea|matcha|chai|soda|diet coke|dr pepper|root beer|sprite|lemonade|energy drink/i.test(clean)) return 'beverages_drinks';
    if (/creamer|milk|heavy cream|half and half|half & half|cream cheese|yogurt|greek yogurt|cottage cheese|buttermilk|fairlife|almond milk|oat milk|soy milk|cashew milk|coconut milk|butter|egg|egg yolk/i.test(clean)) return 'dairy_liquids';
    if (/berry|strawberr|blueberr|raspberr|blackberr|fruit|apple|banana|mango|peach|cherry|lemon|lime|orange|pineapple|pumpkin|watermelon|grape|puree/i.test(clean)) return 'produce_fruit';
    if (/oreo|cookie|chips?|candy|sprinkle|graham|cereal|marshmallow|pretzel|brownie|cake|dough|boba/i.test(clean)) return 'mixins_snacks';
    if (/protein/i.test(clean)) return 'protein_powders';
    if (/gum|sweetener|sugar/i.test(clean)) return 'sweeteners_binders';
    if (/drink|juice|water/i.test(clean)) return 'beverages_drinks';

    // Contextual Step-Hint Fallbacks
    if (stepHint === 'liquid') return 'dairy_liquids';
    if (stepHint === 'powder') return 'protein_powders';
    if (stepHint === 'stabilizer') return 'sweeteners_binders';
    if (stepHint === 'sweetener') return 'sweeteners_binders';
    if (stepHint === 'mixin') return 'mixins_snacks';

    return 'mixins_snacks';
  }

  function markShoppingItemAsBought(ingName) {
    if (!ingName) return;
    const cleanName = sanitizeShoppingItemName(ingName);
    let masterMatch = null;
    if (typeof INGREDIENTS_MASTER !== 'undefined') {
      masterMatch = INGREDIENTS_MASTER.find(i => i.name.toLowerCase() === cleanName.toLowerCase());
      if (!masterMatch) masterMatch = INGREDIENTS_MASTER.find(i => i.name.toLowerCase() === ingName.toLowerCase());
      if (!masterMatch) {
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
        masterMatch = INGREDIENTS_MASTER.find(i => i.id === slug);
      }
    }

    if (masterMatch) {
      pantryState.add(masterMatch.id);
    } else {
      const customSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      pantryState.add(customSlug);
    }

    manualShoppingList.delete(ingName);
    manualShoppingList.delete(cleanName);
    savePantry();
    saveManualShoppingList();
    renderPantryList();
    renderRecipes();
    triggerCloudSync();
  }

  // State
  let pantryState = new Set();
  let pantryItemQuantities = {};
  let favoritesState = new Set();
  let customRecipesState = [];
  let serverPublishedRecipes = [];
  let serverCreatorProfiles = {};
  let lastLocalMutationTime = 0;
  let allRecipes = [];
  let ingredientRecipeCount = {};
  let manualShoppingList = new Set();
  let userRecipeData = {};
  let currentUser = null; // { id, email, name, picture, token }
  let realAdminUser = null; // Preserved root administrator credentials for ahumpo7@gmail.com
  let currentMimicRole = localStorage.getItem(MIMIC_ROLE_STORAGE_KEY) || 'admin';
  let currentMimicCreatorId = localStorage.getItem(MIMIC_CREATOR_STORAGE_KEY) || 'fitness_product_finder';
  let recipeMadeCounts = {}; // { [recipeId]: number }
  let communityStats = {
    ratings: {},
    madeCounts: {},
    totalBatches: 0,
    totalSpins: 0,
    totalUsers: 1
  };

  // Creator Controls State & Persistence
  const CREATOR_SETTINGS_STORAGE_KEY = 'creami_creator_settings';
  let creatorSettings = {
    disabledCreators: [],
    disableAllCreators: false
  };
  try {
    const savedCreatorSettings = localStorage.getItem(CREATOR_SETTINGS_STORAGE_KEY);
    if (savedCreatorSettings) {
      const parsed = JSON.parse(savedCreatorSettings);
      if (parsed && typeof parsed === 'object') {
        creatorSettings = {
          disabledCreators: Array.isArray(parsed.disabledCreators) ? parsed.disabledCreators : [],
          disableAllCreators: Boolean(parsed.disableAllCreators)
        };
      }
    }
  } catch (e) {
    console.warn('Could not parse cached creator settings:', e);
  }

  function saveCreatorSettings() {
    try {
      localStorage.setItem(CREATOR_SETTINGS_STORAGE_KEY, JSON.stringify(creatorSettings));
    } catch (e) {}
  }

  function isCreatorDisabled(creatorId) {
    if (!creatorId) return false;
    if (creatorSettings.disableAllCreators) return true;
    const clean = String(creatorId).trim().toLowerCase();
    return (creatorSettings.disabledCreators || []).some(d => String(d).trim().toLowerCase() === clean);
  }

  function isRecipeCreatorDisabled(recipe) {
    if (!recipe) return false;
    if (
      recipe.category === 'Community Legends' ||
      (recipe.categories && recipe.categories.includes('Community Legends')) ||
      recipe.category === 'Custom' ||
      recipe.isPersonal ||
      recipe.sourceFile === 'Community Legends' ||
      isExactBaseTrio(recipe)
    ) {
      return false;
    }
    if (creatorSettings.disableAllCreators) return true;
    const creatorId = recipe.creatorId || 'fitness_product_finder';
    return isCreatorDisabled(creatorId);
  }

  // Active Filters
  let activeCategory = 'all';
  let activeQuickFilter = 'all';
  let activeDietFilter = 'all';
  let activeCravingFilter = 'all';
  let activeSeoLanding = null;
  let readyOnlyFilter = false;
  let baseOnlyFilter = false;
  let sortBy = 'match_desc';
  let ingredientSearchQuery = '';
  let recipeSearchQuery = '';
  let currentModalRecipe = null;
  let modalScale = 1.0;
  let modalUnitMode = 'metric';
  let timerInterval = null;
  let timerSecondsLeft = 60;
  let timerRunning = false;

  // Fitness & Macro Target Filters (Roadmap Item 10)
  let macroFilters = {
    minProtein: 0,
    maxCalories: 450,
    maxFat: 20
  };

  // Creami Roulette State (Roadmap Item 12)
  let lastRouletteWinner = null;
  let rouletteSpinInterval = null;
  let isCurrentModalRoulette = false;

  // Craving Keywords for Flavor Matching (Roadmap Item 12)
  const CRAVING_KEYWORDS = {
    chocolate: ['chocolate', 'cocoa', 'fudge', 'oreo', 'brownie', 'choc', 'nutella', 'cacao'],
    fruit: ['fruit', 'berry', 'strawberr', 'banana', 'mango', 'peach', 'lemon', 'orange', 'pineapple', 'apple', 'cherry', 'blueberry', 'raspberry', 'blackberry', 'lime', 'sorbet', 'citrus', 'passionfruit', 'coconut', 'watermelon'],
    bakery: ['cookie', 'dough', 'cake', 'cheesecake', 'pie', 'graham', 'cinnamon', 'waffle', 'biscuit', 'muffin', 'caramel', 'vanilla bean', 'snickerdoodle', 'shortbread', 'crisp', 'crumble', 'batter', 'donut', 'cereal'],
    coffee: ['coffee', 'espresso', 'latte', 'mocha', 'cappuccino', 'cold brew', 'caffeine', 'java', 'macchiato']
  };

  // Pints in the Freezer & 16-Hour Timer State (Roadmap Item 8)
  let freezerPintsState = [];
  const FREEZE_DURATION_MS = 16 * 60 * 60 * 1000; // 16 hours calibrated
  let freezerTickerInterval = null;
  let freezerSelectedTimeOffset = 0; // 0, 4, 8, 12, 16 hours
  let freezerSlotCapacity = parseInt(localStorage.getItem(FREEZER_CAPACITY_STORAGE_KEY) || '4', 10);
  let isShelfCollapsed = localStorage.getItem(FREEZER_COLLAPSED_STORAGE_KEY) === 'true';

  // Sunday Batch Prep Queue State (Beta Staging)
  let batchPrepQueueState = [];
  try {
    const rawBatch = localStorage.getItem(BATCH_PREP_STORAGE_KEY);
    if (rawBatch) batchPrepQueueState = JSON.parse(rawBatch);
  } catch (e) {
    batchPrepQueueState = [];
  }

  // Habit Streaks & Spin History State (Path A Item 4)
  let habitStreakState = {
    currentStreak: 0,
    totalSpins: 0,
    lastSpinWeek: null,
    history: []
  };
  try {
    const rawStreak = localStorage.getItem(HABIT_STREAK_STORAGE_KEY);
    if (rawStreak) habitStreakState = Object.assign(habitStreakState, JSON.parse(rawStreak));
  } catch (e) {
    console.error('Error loading habit streaks:', e);
  }

  // Kitchen Assembly Mode State (Path A Item 3)
  let assemblyCurrentStep = 1;
  let assemblyWakeLock = null;
  let assemblyCheckedItems = new Set();
  let assemblyPintConfigs = [];

  // 1-Tap Smart Ingredient Substitutions State (Roadmap Item 16)
  let activeRecipeSwaps = {}; // { [recipeId]: { [originalIngName]: swapObj } }
  let currentSwapContext = null; // { ing, recipe, swapData }

  // DOM Elements
  const statTotalRecipes = document.getElementById('statTotalRecipes');
  const statReadyRecipes = document.getElementById('statReadyRecipes');
  const statBaseReadyRecipes = document.getElementById('statBaseReadyRecipes');
  const statPantryCount = document.getElementById('statPantryCount');
  const pantryInStockCount = document.getElementById('pantryInStockCount');
  
  const ingredientSearch = document.getElementById('ingredientSearch');
  const clearIngSearchBtn = document.getElementById('clearIngSearchBtn');
  const ingredientListContainer = document.getElementById('ingredientListContainer');
  const checkAllBtn = document.getElementById('checkAllBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  
  const recipeSearch = document.getElementById('recipeSearch');
  const clearRecipeSearchBtn = document.getElementById('clearRecipeSearchBtn');
  const readyOnlyToggle = document.getElementById('readyOnlyToggle');
  const baseOnlyToggle = document.getElementById('baseOnlyToggle');
  const readyOnlyPill = document.getElementById('readyOnlyPill');
  const baseOnlyPill = document.getElementById('baseOnlyPill');
  const dietFilterSelect = document.getElementById('dietFilterSelect');
  const cravingFilterSelect = document.getElementById('cravingFilterSelect');
  const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
  const sortSelect = document.getElementById('sortSelect');
  const categoryTabs = document.getElementById('categoryTabs');
  const recipeGrid = document.getElementById('recipeGrid');
  const emptyState = document.getElementById('emptyState');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const resultsSummary = document.getElementById('resultsSummary');
  const activePantryHint = document.getElementById('activePantryHint');
  
  const recipeModalOverlay = document.getElementById('recipeModalOverlay');
  const recipeModalBody = document.getElementById('recipeModalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // Creami Roulette Elements (Item 12)
  const rouletteBtn = document.getElementById('rouletteBtn');
  const rouletteModalOverlay = document.getElementById('rouletteModalOverlay');
  const rouletteModalCloseBtn = document.getElementById('rouletteModalCloseBtn');
  const rouletteSlotItem = document.getElementById('rouletteSlotItem');
  const rouletteSubtext = document.getElementById('rouletteSubtext');
  const rouletteWinnerCard = document.getElementById('rouletteWinnerCard');
  const rouletteWinnerTitle = document.getElementById('rouletteWinnerTitle');
  const rouletteWinnerMeta = document.getElementById('rouletteWinnerMeta');
  const btnRouletteOpenWinner = document.getElementById('btnRouletteOpenWinner');
  const btnRouletteSpinAgain = document.getElementById('btnRouletteSpinAgain');

  // Fitness & Macro Target Elements (Item 10)
  const toggleMacroSlidersBtn = document.getElementById('toggleMacroSlidersBtn');
  const macroActiveIndicator = document.getElementById('macroActiveIndicator');
  const macroSlidersPanel = document.getElementById('macroSlidersPanel');
  const macroFilterSummary = document.getElementById('macroFilterSummary');
  const resetMacroSlidersBtn = document.getElementById('resetMacroSlidersBtn');
  const minProteinSlider = document.getElementById('minProteinSlider');
  const minProteinDisplay = document.getElementById('minProteinDisplay');
  const maxCaloriesSlider = document.getElementById('maxCaloriesSlider');
  const maxCaloriesDisplay = document.getElementById('maxCaloriesDisplay');
  const maxFatSlider = document.getElementById('maxFatSlider');
  const maxFatDisplay = document.getElementById('maxFatDisplay');
  // Chef Badges & Milestones Elements (Phase 1 Gamification)
  const openBadgesBtn = document.getElementById('openBadgesBtn');
  const statBadgesCard = document.getElementById('statBadgesCard');
  const headerBadgesBadge = document.getElementById('headerBadgesBadge');
  const statBadgesUnlockedCount = document.getElementById('statBadgesUnlockedCount');
  const statBadgesRankLabel = document.getElementById('statBadgesRankLabel');
  const badgesModalOverlay = document.getElementById('badgesModalOverlay');
  const badgesModalCloseBtn = document.getElementById('badgesModalCloseBtn');
  const btnCloseBadgesFooter = document.getElementById('btnCloseBadgesFooter');
  const btnShareBadges = document.getElementById('btnShareBadges');
  const badgesGridContainer = document.getElementById('badgesGridContainer');
  const badgesModalRankText = document.getElementById('badgesModalRankText');
  const badgesModalCountText = document.getElementById('badgesModalCountText');
  const badgesModalProgressBar = document.getElementById('badgesModalProgressBar');
  const badgeTabAll = document.getElementById('badgeTabAll');
  const badgeTabUnlocked = document.getElementById('badgeTabUnlocked');
  const badgeTabLocked = document.getElementById('badgeTabLocked');

  const shoppingModalOverlay = document.getElementById('shoppingModalOverlay');
  const shoppingModalBody = document.getElementById('shoppingModalBody') || document.getElementById('shoppingListBody');
  const shoppingModalCloseBtn = document.getElementById('shoppingModalCloseBtn');
  const openShoppingListBtn = document.getElementById('openShoppingListBtn');
  const shoppingListBadge = document.getElementById('shoppingListBadge');
  const copyShoppingListBtn = document.getElementById('copyShoppingListBtn');
  const printShoppingListBtn = document.getElementById('printShoppingListBtn');
  const clearShoppingListBtn = document.getElementById('clearShoppingListBtn');

  // Shopping List In-Store Mode & Wake Lock State
  let shoppingViewMode = localStorage.getItem('creami_shopping_view_mode') || 'standard';
  let shoppingStoreWakeLock = null;
  let storeSessionInCart = [];

  async function requestShoppingStoreWakeLock() {
    try {
      if ('wakeLock' in navigator && !shoppingStoreWakeLock) {
        shoppingStoreWakeLock = await navigator.wakeLock.request('screen');
        updateShoppingStoreWakeLockUI(true);
        shoppingStoreWakeLock.addEventListener('release', () => {
          shoppingStoreWakeLock = null;
          updateShoppingStoreWakeLockUI(false);
        });
      } else {
        updateShoppingStoreWakeLockUI(Boolean(shoppingStoreWakeLock));
      }
    } catch (err) {
      console.warn('Shopping wake lock failed:', err);
      updateShoppingStoreWakeLockUI(false);
    }
  }

  function releaseShoppingStoreWakeLock() {
    if (shoppingStoreWakeLock) {
      shoppingStoreWakeLock.release().catch(() => {});
      shoppingStoreWakeLock = null;
    }
    updateShoppingStoreWakeLockUI(false);
  }

  function updateShoppingStoreWakeLockUI(isActive) {
    const pill = document.getElementById('storeWakeLockPill');
    if (!pill) return;
    if (isActive) {
      pill.innerHTML = '⚡ Screen Awake';
      pill.style.background = 'rgba(16, 185, 129, 0.2)';
      pill.style.borderColor = 'rgba(16, 185, 129, 0.45)';
      pill.style.color = '#34d399';
    } else {
      pill.innerHTML = '💤 Screen Normal';
      pill.style.background = 'rgba(255, 255, 255, 0.05)';
      pill.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      pill.style.color = '#94a3b8';
    }
  }
  const customRecipeModalOverlay = document.getElementById('customRecipeModalOverlay');
  const customModalCloseBtn = document.getElementById('customModalCloseBtn');
  const addCustomRecipeBtn = document.getElementById('addCustomRecipeBtn');
  const cancelCustomRecipeBtn = document.getElementById('cancelCustomRecipeBtn');
  const customRecipeForm = document.getElementById('customRecipeForm');

  // Freezer Tracker Elements (Item 8)
  const openFreezerTrackerBtn = document.getElementById('openFreezerTrackerBtn');
  const freezerBadge = document.getElementById('freezerBadge');
  const navItemFreezer = document.getElementById('navItemFreezer');
  const navFreezerBadge = document.getElementById('navFreezerBadge');
  const freezerModalOverlay = document.getElementById('freezerModalOverlay');
  const freezerModalCloseBtn = document.getElementById('freezerModalCloseBtn');
  const freezerToggleAddBtn = document.getElementById('freezerToggleAddBtn');
  const freezerToggleAddText = document.getElementById('freezerToggleAddText');
  const freezerAddForm = document.getElementById('freezerAddForm');
  const freezerRecipeNameInput = document.getElementById('freezerRecipeNameInput');
  const freezerRecipeDatalist = document.getElementById('freezerRecipeDatalist');
  const freezerPintScale = document.getElementById('freezerPintScale');
  const freezerTimePresets = document.getElementById('freezerTimePresets');
  const freezerCustomTime = document.getElementById('freezerCustomTime');
  const freezerNotes = document.getElementById('freezerNotes');
  const freezerCancelAddBtn = document.getElementById('freezerCancelAddBtn');
  const freezerSubmitAddBtn = document.getElementById('freezerSubmitAddBtn');
  const freezerPintsCount = document.getElementById('freezerPintsCount');
  const freezerPintsList = document.getElementById('freezerPintsList');

  // Freeze Timer Push Notification Elements (Roadmap Item 17)
  const freezerNotifCard = document.getElementById('freezerNotifCard');
  const freezerNotifStatusBadge = document.getElementById('freezerNotifStatusBadge');
  const freezerNotifTitle = document.getElementById('freezerNotifTitle');
  const freezerNotifDesc = document.getElementById('freezerNotifDesc');
  const btnTestFreezeNotif = document.getElementById('btnTestFreezeNotif');
  const btnToggleFreezeNotif = document.getElementById('btnToggleFreezeNotif');
  const freezerNotifToggleIcon = document.getElementById('freezerNotifToggleIcon');
  const freezerNotifToggleLabel = document.getElementById('freezerNotifToggleLabel');
  const freezerNotifyOnReady = document.getElementById('freezerNotifyOnReady');
  const NOTIF_STORAGE_KEY = 'creami_freeze_notifs_enabled_v1';
  let freezeNotifsEnabled = localStorage.getItem(NOTIF_STORAGE_KEY) !== 'false';
  let pintNotifTimers = new Map();

  // Smart Ingredient Substitutions Elements (Item 16)
  const swapModalOverlay = document.getElementById('swapModalOverlay');
  const swapModalCloseBtn = document.getElementById('swapModalCloseBtn');
  const swapBackToRecipeBtn = document.getElementById('swapBackToRecipeBtn');
  const swapFocusCard = document.getElementById('swapFocusCard');
  const swapOptionsList = document.getElementById('swapOptionsList');
  
  // Admin Portal & Gated Access Elements (Roadmap Item 15)
  const openAdminPortalBtn = document.getElementById('openAdminPortalBtn');
  const openCreatorPortalBtn = document.getElementById('openCreatorPortalBtn');
  const adminModalOverlay = document.getElementById('adminModalOverlay');
  const adminModalCloseBtn = document.getElementById('adminModalCloseBtn');
  const adminTotalUsers = document.getElementById('adminTotalUsers');
  const adminTotalAdmins = document.getElementById('adminTotalAdmins');
  const adminTotalAllAccess = document.getElementById('adminTotalAllAccess');
  const adminUserSearchInput = document.getElementById('adminUserSearchInput');
  const adminRoleFilterPills = document.getElementById('adminRoleFilterPills');
  const adminRefreshUsersBtn = document.getElementById('adminRefreshUsersBtn');
  const adminUsersList = document.getElementById('adminUsersList');
  const btnAvailablePacksBadge = document.getElementById('btnAvailablePacksBadge');
  const lockedCountBadge = document.getElementById('lockedCountBadge');
  const purchaseAvailableBanner = document.getElementById('purchaseAvailableBanner');
  const bannerLockedCount = document.getElementById('bannerLockedCount');
  const btnBrowsePacksBanner = document.getElementById('btnBrowsePacksBanner');
  const categoryPackPromo = document.getElementById('categoryPackPromo');
  const btnUnlockCurrentCategory = document.getElementById('btnUnlockCurrentCategory');
  const btnViewAllPacksFromCategory = document.getElementById('btnViewAllPacksFromCategory');
  const recipePacksModalOverlay = document.getElementById('recipePacksModalOverlay');
  const closeRecipePacksModalBtn = document.getElementById('closeRecipePacksModalBtn');
  let adminUsersState = [];
  let expandedAdminUserIds = new Set();
  let adminClaimsState = [];
  let userPendingClaimsState = new Set();
  let adminActiveTab = 'users';
  let adminFilterRole = 'all';
  let adminFilterClaimStatus = 'all';
  let adminSearchQuery = '';
  let adminUsersCurrentPage = 1;
  const ADMIN_USERS_PER_PAGE = 25;

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleLabel = document.getElementById('themeToggleLabel');
  const toastContainer = document.getElementById('toastContainer');

  // Sound & PWA Install / Backup Elements (Roadmap Items 19 & 20)
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const btnInstallPwa = document.getElementById('btnInstallPwa');
  const footerInstallBtn = document.getElementById('footerInstallBtn');
  const footerBackupBtn = document.getElementById('footerBackupBtn');
  const backupModalOverlay = document.getElementById('backupModalOverlay');
  const backupModalCloseBtn = document.getElementById('backupModalCloseBtn');
  const btnDownloadBackup = document.getElementById('btnDownloadBackup');
  const btnTriggerRestore = document.getElementById('btnTriggerRestore');
  const backupFileInput = document.getElementById('backupFileInput');
  const btnResetKitchenData = document.getElementById('btnResetKitchenData');
  const iosInstallModalOverlay = document.getElementById('iosInstallModalOverlay');
  const iosInstallModalCloseBtn = document.getElementById('iosInstallModalCloseBtn');
  const btnDismissIosInstall = document.getElementById('btnDismissIosInstall');

  // Cookie Consent Elements (Google Consent Mode v2 Ready)
  const cookieConsentBanner = document.getElementById('cookieConsentBanner');
  const btnAcceptAllCookies = document.getElementById('btnAcceptAllCookies');
  const btnEssentialOnlyCookies = document.getElementById('btnEssentialOnlyCookies');
  const btnCustomizeCookies = document.getElementById('btnCustomizeCookies');
  const footerCookieBtn = document.getElementById('footerCookieBtn');
  const cookieModalOverlay = document.getElementById('cookieModalOverlay');
  const cookieModalCloseBtn = document.getElementById('cookieModalCloseBtn');
  const prefAnalyticsToggle = document.getElementById('prefAnalyticsToggle');
  const prefMarketingToggle = document.getElementById('prefMarketingToggle');
  const btnRejectOptionalInModal = document.getElementById('btnRejectOptionalInModal');
  const btnSaveCustomCookies = document.getElementById('btnSaveCustomCookies');

  // --- Initialization ---
  function init() {
    loadStorage();
    mergeRecipes();
    calculateIngredientUsage();
    renderPantryList();
    bindEvents();
    bindAuthEvents();
    updateThemeUI();
    updateAuthUI();
    updateSoundUI();
    renderRecipes();
    fetchCommunityStats();
    fetchServerConfig();
    updateFreezerBadges();
    renderFreezerShelfWidget();
    updateBatchPrepDockUI();
    startFreezerTicker();
    initFreezeNotifications();
    initPwaInstall();
    initCookieConsent();
    initFeedbackSystem();

    // Check for password reset or magic link direct link from email
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const resetToken = urlParams.get('reset_token');
      const resetEmail = urlParams.get('email');
      const magicToken = urlParams.get('magic_token');
      const magicEmail = urlParams.get('email');

      if (magicToken) {
        setTimeout(() => {
          handleVerifyMagicLink(magicToken, magicEmail);
        }, 300);
      } else if (resetToken && resetEmail) {
        setTimeout(() => {
          openPasswordResetDirect(resetEmail, resetToken);
        }, 400);
      }
    } catch (e) {}

    // Check for Stripe Checkout return redirect (Freezer Shelf Standalone Upgrade)
    checkPaymentReturnRedirect();

    // If user is already logged in, immediately fetch latest synchronized cloud data
    if (currentUser && (currentUser.token || currentUser.email)) {
      fetchLatestUserData();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAndNotifyReadyPints();
        updateFreezerBadges();
        if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
          renderFreezerModal();
        }
        if (currentUser && (currentUser.token || currentUser.email)) {
          fetchLatestUserData();
        }
      } else if (document.visibilityState === 'hidden') {
        // Tab being hidden or backgrounded: flush pending cloud sync only if a mutation is pending
        if (syncTimeout !== null) {
          triggerCloudSync(true);
        }
      }
    });

    window.addEventListener('beforeunload', () => {
      if (syncTimeout !== null) {
        triggerCloudSync(true);
      }
    });

    window.addEventListener('pagehide', () => {
      if (syncTimeout !== null) {
        triggerCloudSync(true);
      }
    });

    // Cross-tab real-time sync via storage events
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      const curId = currentUser?.id || '';
      if (e.key === FREEZER_STORAGE_KEY || (curId && e.key === `${FREEZER_STORAGE_KEY}_${curId}`)) {
        try {
          const incoming = JSON.parse(e.newValue || '[]');
          if (Array.isArray(incoming)) {
            freezerPintsState = incoming;
            renderFreezerShelfWidget();
            if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
              renderFreezerModal();
            }
            updateFreezerBadges();
          }
        } catch (err) {}
      } else if (e.key === RECIPE_MADE_STORAGE_KEY || (curId && e.key === `${RECIPE_MADE_STORAGE_KEY}_${curId}`)) {
        try {
          const incoming = JSON.parse(e.newValue || '{}');
          if (incoming && typeof incoming === 'object') {
            recipeMadeCounts = incoming;
            renderRecipes();
          }
        } catch (err) {}
      }
    });

    window.addEventListener('focus', () => {
      checkAndNotifyReadyPints();
      updateFreezerBadges();
      if (currentUser && (currentUser.token || currentUser.email)) {
        fetchLatestUserData();
      }
    });

    // Periodic cloud sync to keep multi-device sessions seamlessly updated in real time
    setInterval(() => {
      if (document.visibilityState === 'visible' && currentUser && (currentUser.token || currentUser.email)) {
        fetchLatestUserData();
      }
    }, 45000);

    if (window.innerWidth <= 768) {
      setMobileView('recipes');
    }

    // Hide server-side pre-rendered SSR fallback containers upon SPA hydration
    const ssrFallback = document.getElementById('ssrRecipeFallback');
    if (ssrFallback) ssrFallback.style.display = 'none';
    const ssrCatFallback = document.getElementById('ssrCategoryFallback');
    if (ssrCatFallback) ssrCatFallback.style.display = 'none';

    // Deep-linked recipe navigation & SEO routing (Roadmap Item 22)
    let initialRecipeId = null;
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const sharedEncoded = urlParams.get('share') || urlParams.get('r') || hashParams.get('share') || hashParams.get('r');

    if (sharedEncoded) {
      const decodedShared = decodePortableCustomRecipe(sharedEncoded);
      if (decodedShared) {
        const existing = (customRecipesState || []).find(cr => cr.name.toLowerCase() === decodedShared.name.toLowerCase());
        const toOpen = existing || decodedShared;
        if (!existing) {
          allRecipes.unshift(decodedShared);
        }
        setTimeout(() => {
          openRecipeModal(toOpen, false, false);
          if (!existing) {
            showToast(`🍧 Opened shared recipe from ${decodedShared.sharedAuthor || 'a friend'}!`, 4000);
          }
        }, 150);
      }
    } else {
      const pathMatch = window.location.pathname.match(/^\/recipe\/([a-zA-Z0-9_\-]+)/);
      if (pathMatch) {
        initialRecipeId = decodeURIComponent(pathMatch[1]);
      } else if (urlParams.has('recipe')) {
        initialRecipeId = urlParams.get('recipe');
      }

      if (initialRecipeId && initialRecipeId !== 'share' && initialRecipeId !== 'shared') {
        const targetRecipe = allRecipes.find(r => r.id === initialRecipeId || (r.name && r.name.toLowerCase() === initialRecipeId.toLowerCase()));
        if (targetRecipe) {
          setTimeout(() => {
            openRecipeModal(targetRecipe, false, false);
          }, 120);
        }
      } else {
        initSeoCategoryLanding();
      }

      // Creator Storefront Deep-Link Routing (Path B)
      const creatorPathMatch = window.location.pathname.match(/(?:\/beta)?\/@([a-zA-Z0-9_\-]+)/);
      const creatorQuery = urlParams.get('creator') || urlParams.get('c');
      let targetCreatorSlug = null;
      if (creatorPathMatch) {
        targetCreatorSlug = creatorPathMatch[1];
      } else if (creatorQuery) {
        targetCreatorSlug = creatorQuery.replace(/^@/, '');
      }

      if (targetCreatorSlug) {
        const creator = (typeof CREATORS_MASTER !== 'undefined')
          ? CREATORS_MASTER.find(c => 
              c.id.toLowerCase() === targetCreatorSlug.toLowerCase() ||
              (c.handle && c.handle.toLowerCase().replace('@', '') === targetCreatorSlug.toLowerCase()) ||
              (c.name && c.name.toLowerCase() === targetCreatorSlug.toLowerCase())
            )
          : null;
        if (creator) {
          if (isCreatorDisabled(creator.id)) {
            setTimeout(() => {
              showToast(`⚠️ The creator ${creator.name} is currently unavailable.`);
              try {
                history.replaceState({ modal: null }, '', IS_BETA ? '/beta/' : '/');
              } catch (e) {}
            }, 300);
          } else {
            setTimeout(() => {
              openRecipePacksModal(creator.id, false, false);
            }, 200);
          }
        }
      }
    }

    // Handle browser back / forward buttons (Android back button, iOS swipe back, desktop back)
    window.addEventListener('popstate', (e) => {
      // 1. If Story Card / Image Download modal is open, close it first!
      const storyModal = document.getElementById('storyCardModalOverlay');
      if (storyModal && storyModal.classList.contains('active')) {
        closeStoryCardModal(true);
        return;
      }

      // 2. If Recipe Modal is open, close it!
      if (recipeModalOverlay && recipeModalOverlay.classList.contains('active')) {
        closeRecipeModal(false);
        return;
      }

      // 3. Other modals
      if (recipePacksModalOverlay && recipePacksModalOverlay.classList.contains('active')) {
        closeRecipePacksModal(false);
        return;
      }

      // 4. Forward navigation or direct pop to modal states
      if (e.state && e.state.modal === 'creator' && e.state.creatorId) {
        openRecipePacksModal(e.state.creatorId, false, false);
      } else if (e.state && e.state.modal === 'recipe' && e.state.recipeId) {
        const rec = allRecipes.find(r => r.id === e.state.recipeId);
        if (rec) openRecipeModal(rec, false, false);
      }
    });
  }

  // --- Storage Management ---
  function isPwaStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
           (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) ||
           window.navigator.standalone === true || 
           (document.referrer && document.referrer.includes('android-app://'));
  }

  function getPantryStorageKey() {
    if (currentUser && currentUser.id) {
      return `${PANTRY_STORAGE_KEY}_${currentUser.id}`;
    }
    return isPwaStandalone() 
      ? `${PANTRY_STORAGE_KEY}_guest_pwa` 
      : `${PANTRY_STORAGE_KEY}_guest_web`;
  }

  function getPantryQuantitiesStorageKey() {
    if (currentUser && currentUser.id) {
      return `${PANTRY_QUANTITIES_STORAGE_KEY}_${currentUser.id}`;
    }
    return isPwaStandalone() 
      ? `${PANTRY_QUANTITIES_STORAGE_KEY}_guest_pwa` 
      : `${PANTRY_QUANTITIES_STORAGE_KEY}_guest_web`;
  }

  function getShoppingStorageKey() {
    if (currentUser && currentUser.id) {
      return `${MANUAL_SHOPPING_STORAGE_KEY}_${currentUser.id}`;
    }
    return isPwaStandalone() 
      ? `${MANUAL_SHOPPING_STORAGE_KEY}_guest_pwa` 
      : `${MANUAL_SHOPPING_STORAGE_KEY}_guest_web`;
  }

  function getUserRecipeDataKey() {
    if (currentUser && currentUser.id) {
      return `${USER_RECIPE_DATA_KEY}_${currentUser.id}`;
    }
    return isPwaStandalone() 
      ? `${USER_RECIPE_DATA_KEY}_guest_pwa` 
      : `${USER_RECIPE_DATA_KEY}_guest_web`;
  }

  function getRecipeMadeStorageKey() {
    if (currentUser && currentUser.id) {
      return `${RECIPE_MADE_STORAGE_KEY}_${currentUser.id}`;
    }
    return isPwaStandalone() 
      ? `${RECIPE_MADE_STORAGE_KEY}_guest_pwa` 
      : `${RECIPE_MADE_STORAGE_KEY}_guest_web`;
  }

  function loadPantryForCurrentSession() {
    const key = getPantryStorageKey();
    const savedPantry = localStorage.getItem(key);
    if (savedPantry !== null) {
      try {
        pantryState = new Set(JSON.parse(savedPantry));
        if (pantryState.has('cinnamon_cereal')) {
          pantryState.delete('cinnamon_cereal');
          pantryState.add('cinnamon_toast_crunch');
          localStorage.setItem(key, JSON.stringify(Array.from(pantryState)));
        }
      } catch (e) {
        pantryState = new Set(DEFAULT_STAPLES);
      }
    } else {
      // Legacy migration only for guest if un-scoped key exists
      const legacyPantry = localStorage.getItem(PANTRY_STORAGE_KEY);
      if (legacyPantry !== null && !currentUser) {
        try {
          pantryState = new Set(JSON.parse(legacyPantry));
        } catch (e) {
          pantryState = new Set(DEFAULT_STAPLES);
        }
      } else if (IS_BETA) {
        // Clone initial pantry snapshot from production so beta user has starting items
        const prodKey = currentUser && currentUser.id ? `creami_pantry_v2_${currentUser.id}` : 'creami_pantry_v2';
        const prodPantry = localStorage.getItem(prodKey);
        if (prodPantry) {
          try { pantryState = new Set(JSON.parse(prodPantry)); } catch (e) { pantryState = new Set(DEFAULT_STAPLES); }
        } else {
          pantryState = new Set(DEFAULT_STAPLES);
        }
      } else {
        pantryState = new Set(DEFAULT_STAPLES);
      }
      localStorage.setItem(key, JSON.stringify(Array.from(pantryState)));
    }

    const qKey = getPantryQuantitiesStorageKey();
    const savedQuantities = localStorage.getItem(qKey);
    if (savedQuantities !== null) {
      try {
        pantryItemQuantities = JSON.parse(savedQuantities) || {};
      } catch (e) {
        pantryItemQuantities = {};
      }
    } else {
      pantryItemQuantities = {};
    }
  }

  function loadShoppingListForCurrentSession() {
    const key = getShoppingStorageKey();
    const savedShop = localStorage.getItem(key);
    if (savedShop !== null) {
      try {
        const parsed = JSON.parse(savedShop);
        if (Array.isArray(parsed)) {
          manualShoppingList = new Set(
            parsed
              .filter(item => !isShoppingExcluded(item))
              .map(item => sanitizeShoppingItemName(item))
          );
        } else {
          manualShoppingList = new Set();
        }
      } catch (e) {
        manualShoppingList = new Set();
      }
    } else {
      const legacyShop = localStorage.getItem(MANUAL_SHOPPING_STORAGE_KEY);
      if (legacyShop !== null && !currentUser) {
        try {
          const parsed = JSON.parse(legacyShop);
          manualShoppingList = new Set(
            Array.isArray(parsed)
              ? parsed.filter(item => !isShoppingExcluded(item)).map(item => sanitizeShoppingItemName(item))
              : []
          );
        } catch (e) {
          manualShoppingList = new Set();
        }
      } else {
        manualShoppingList = new Set();
      }
      localStorage.setItem(key, JSON.stringify(Array.from(manualShoppingList)));
    }
    updateShoppingListBadge();
  }

  function loadUserRecipeDataForCurrentSession() {
    const key = getUserRecipeDataKey();
    const savedUserData = localStorage.getItem(key);
    if (savedUserData !== null) {
      try {
        userRecipeData = JSON.parse(savedUserData);
      } catch (e) {
        userRecipeData = {};
      }
    } else {
      userRecipeData = {};
    }
  }

  function loadRecipeMadeCountsForCurrentSession() {
    const key = getRecipeMadeStorageKey();
    const savedMade = localStorage.getItem(key);
    if (savedMade !== null) {
      try {
        recipeMadeCounts = JSON.parse(savedMade);
      } catch (e) {
        recipeMadeCounts = {};
      }
    } else {
      const legacyMade = localStorage.getItem(RECIPE_MADE_STORAGE_KEY);
      if (legacyMade !== null) {
        try {
          recipeMadeCounts = JSON.parse(legacyMade);
        } catch (e) {
          recipeMadeCounts = {};
        }
      } else {
        recipeMadeCounts = {};
      }
    }
  }

  function loadStorage() {
    // 1. Google User Profile / Auth (MUST be loaded first so user identity is known!)
    let savedUser = localStorage.getItem(USER_AUTH_STORAGE_KEY);
    if (!savedUser && IS_BETA) {
      const prodUser = localStorage.getItem('creami_user_auth_v2');
      if (prodUser) {
        localStorage.setItem(USER_AUTH_STORAGE_KEY, prodUser);
        savedUser = prodUser;
      }
    }
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        if (currentUser) {
          const ADMIN_EMAILS = ['admin@creamicravings.com', 'ahumpo7@gmail.com', 'ahumpo@gmail.com', 'andrew@gmail.com'];
          const userEmail = (currentUser.email || '').toLowerCase();
          const isAdmin = currentUser.role === 'admin' || ADMIN_EMAILS.includes(userEmail);
          currentUser.role = isAdmin ? 'admin' : (currentUser.role || 'user');
          if (!currentUser.subscriptions || !Array.isArray(currentUser.subscriptions)) {
            currentUser.subscriptions = ['Community Legends'];
          }
          if (userEmail === 'ahumpo7@gmail.com' || userEmail === 'ahumpo@gmail.com') {
            realAdminUser = JSON.parse(JSON.stringify(currentUser));
            try { localStorage.setItem(REAL_ADMIN_STORAGE_KEY, JSON.stringify(realAdminUser)); } catch (e) {}
          }
          const userMaxSlots = getUserMaxFreezerSlots(currentUser);
          const savedCap = localStorage.getItem(FREEZER_CAPACITY_STORAGE_KEY);
          if (!savedCap) {
            freezerSlotCapacity = userMaxSlots;
            try { localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString()); } catch (e) {}
          } else if (freezerSlotCapacity > userMaxSlots) {
            freezerSlotCapacity = userMaxSlots;
            try { localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString()); } catch (e) {}
          }
        }
      } catch (e) {
        currentUser = null;
      }
    }

    // Check for stored real super admin credentials if currentUser was not loaded or is mimicked
    if (!realAdminUser) {
      const savedReal = localStorage.getItem(REAL_ADMIN_STORAGE_KEY);
      if (savedReal) {
        try {
          const parsedReal = JSON.parse(savedReal);
          if (parsedReal && parsedReal.email && (parsedReal.email.toLowerCase() === 'ahumpo7@gmail.com' || parsedReal.email.toLowerCase() === 'ahumpo@gmail.com')) {
            realAdminUser = parsedReal;
          }
        } catch (e) {}
      }
    }

    // 2. Load Pantry (strictly scoped to currentUser or isolated guest session)
    loadPantryForCurrentSession();

    // 3. Favorites: strictly tied to logged-in user account
    if (currentUser && currentUser.id) {
      const userFavKey = `${FAVORITES_STORAGE_KEY}_${currentUser.id}`;
      const savedFavs = localStorage.getItem(userFavKey) || localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavs) {
        try {
          favoritesState = new Set(JSON.parse(savedFavs));
          localStorage.setItem(userFavKey, JSON.stringify(Array.from(favoritesState)));
        } catch (e) {
          favoritesState = new Set();
        }
      } else {
        favoritesState = new Set();
      }
    } else {
      favoritesState = new Set();
    }

    // 4. Custom Recipes: strictly tied to logged-in user account
    if (currentUser && currentUser.id) {
      const userCustomKey = `${CUSTOM_RECIPES_STORAGE_KEY}_${currentUser.id}`;
      const savedCustom = localStorage.getItem(userCustomKey);
      if (savedCustom) {
        try {
          customRecipesState = JSON.parse(savedCustom);
        } catch (e) {
          customRecipesState = [];
        }
      } else {
        const legacyCustom = localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY);
        if (legacyCustom) {
          try {
            customRecipesState = JSON.parse(legacyCustom);
            localStorage.setItem(userCustomKey, JSON.stringify(customRecipesState));
            localStorage.removeItem(CUSTOM_RECIPES_STORAGE_KEY);
          } catch (e) {
            customRecipesState = [];
          }
        } else {
          customRecipesState = [];
        }
      }
    } else {
      customRecipesState = [];
      localStorage.removeItem(CUSTOM_RECIPES_STORAGE_KEY);
    }

    // 5. Manual Shopping List (strictly scoped to user or isolated guest session)
    loadShoppingListForCurrentSession();

    // 6. User Recipe Ratings & Notes (strictly scoped to user or isolated guest session)
    loadUserRecipeDataForCurrentSession();

    // 7. Personal Recipe Made Batch Counts (strictly scoped to user or isolated guest session)
    loadRecipeMadeCountsForCurrentSession();

    // 8. Cached Community Stats
    const savedCommStats = localStorage.getItem(COMMUNITY_STATS_CACHE_KEY);
    if (savedCommStats) {
      try {
        const parsed = JSON.parse(savedCommStats);
        communityStats = {
          ratings: parsed.ratings || {},
          madeCounts: parsed.madeCounts || {},
          totalBatches: parsed.totalBatches || 0,
          totalSpins: parsed.totalSpins || 0,
          totalUsers: parsed.totalUsers || 1
        };
      } catch (e) {}
    }

    // 9. Freezer Pints (Roadmap Item 8)
    if (currentUser && currentUser.id) {
      const userFreezerKey = `${FREEZER_STORAGE_KEY}_${currentUser.id}`;
      const savedFreezer = localStorage.getItem(userFreezerKey) || localStorage.getItem(FREEZER_STORAGE_KEY);
      if (savedFreezer) {
        try {
          freezerPintsState = JSON.parse(savedFreezer);
          localStorage.setItem(userFreezerKey, JSON.stringify(freezerPintsState));
        } catch (e) {
          freezerPintsState = [];
        }
      } else {
        freezerPintsState = [];
      }
    } else {
      freezerPintsState = [];
      localStorage.removeItem(FREEZER_STORAGE_KEY);
    }

    // 10. Active Recipe Substitutions
    const savedSwaps = localStorage.getItem('creami_active_swaps_v1');
    if (savedSwaps) {
      try {
        activeRecipeSwaps = JSON.parse(savedSwaps);
      } catch (e) {
        activeRecipeSwaps = {};
      }
    }

    // 11. Super Admin Role Mimicry Initialization
    if (realAdminUser && currentMimicRole && currentMimicRole !== 'admin') {
      applyMimicRole(currentMimicRole, false);
    }

    // 12. Active User Pending Access Claims
    const savedPendingClaims = localStorage.getItem('creami_pending_claims_v1');
    if (savedPendingClaims) {
      try {
        userPendingClaimsState = new Set(JSON.parse(savedPendingClaims));
      } catch (e) {
        userPendingClaimsState = new Set();
      }
    }

    // 13. Phase 1 Gamification: Chef Badges & Milestones
    loadUserBadges();
    evaluateBadges(false);
  }

  function saveActiveSwaps() {
    try {
      localStorage.setItem('creami_active_swaps_v1', JSON.stringify(activeRecipeSwaps));
    } catch (e) {}
  }

  function savePantry() {
    lastLocalMutationTime = Date.now();
    const key = getPantryStorageKey();
    localStorage.setItem(key, JSON.stringify(Array.from(pantryState)));
    const qKey = getPantryQuantitiesStorageKey();
    localStorage.setItem(qKey, JSON.stringify(pantryItemQuantities));
    if (currentUser) {
      localStorage.removeItem(PANTRY_STORAGE_KEY);
      localStorage.removeItem(PANTRY_QUANTITIES_STORAGE_KEY);
    }
    updateStats();
    evaluateBadges(false);
    triggerCloudSync();
  }

  function saveFavorites() {
    lastLocalMutationTime = Date.now();
    if (currentUser && currentUser.id) {
      const userFavKey = `${FAVORITES_STORAGE_KEY}_${currentUser.id}`;
      localStorage.setItem(userFavKey, JSON.stringify(Array.from(favoritesState)));
    }
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    updateCategoryCounts();
    triggerCloudSync();
  }

  function saveManualShoppingList() {
    lastLocalMutationTime = Date.now();
    const key = getShoppingStorageKey();
    localStorage.setItem(key, JSON.stringify(Array.from(manualShoppingList)));
    if (currentUser) {
      localStorage.removeItem(MANUAL_SHOPPING_STORAGE_KEY);
    }
    updateShoppingListBadge();
    triggerCloudSync();
  }

  function saveUserRecipeData() {
    lastLocalMutationTime = Date.now();
    const key = getUserRecipeDataKey();
    localStorage.setItem(key, JSON.stringify(userRecipeData));
    if (currentUser) {
      localStorage.removeItem(USER_RECIPE_DATA_KEY);
    }
    triggerCloudSync();
  }

  function saveUserAuth() {
    const userToSave = realAdminUser || currentUser;
    if (userToSave) {
      localStorage.setItem(USER_AUTH_STORAGE_KEY, JSON.stringify(userToSave));
    } else {
      localStorage.removeItem(USER_AUTH_STORAGE_KEY);
    }
    updateAuthUI();
  }

  function saveRecipeMadeCounts() {
    lastLocalMutationTime = Date.now();
    const key = getRecipeMadeStorageKey();
    localStorage.setItem(key, JSON.stringify(recipeMadeCounts));
    if (currentUser) {
      localStorage.removeItem(RECIPE_MADE_STORAGE_KEY);
    }
    triggerCloudSync();
  }

  function saveCommunityStats() {
    localStorage.setItem(COMMUNITY_STATS_CACHE_KEY, JSON.stringify(communityStats));
    updateCommunityStatsUI();
  }

  function saveCustomRecipes() {
    lastLocalMutationTime = Date.now();
    if (currentUser && currentUser.id) {
      const userCustomKey = `${CUSTOM_RECIPES_STORAGE_KEY}_${currentUser.id}`;
      localStorage.setItem(userCustomKey, JSON.stringify(customRecipesState));
    }
    mergeRecipes();
    calculateIngredientUsage();
    renderPantryList();
    renderRecipes();
    evaluateBadges(true);
    triggerCloudSync();
  }

  function saveFreezerPints() {
    lastLocalMutationTime = Date.now();
    if (currentUser && currentUser.id) {
      const userFreezerKey = `${FREEZER_STORAGE_KEY}_${currentUser.id}`;
      localStorage.setItem(userFreezerKey, JSON.stringify(freezerPintsState));
    } else {
      localStorage.setItem(FREEZER_STORAGE_KEY, JSON.stringify(freezerPintsState));
    }
    if (freezerPintsState && freezerPintsState.length > 0) {
      try { localStorage.setItem('creami_freezer_ever_added', '1'); } catch (e) {}
    }
    updateFreezerBadges();
    evaluateBadges(true);
    triggerCloudSync();
  }

  // --- Background Cloud Sync to Google Account ---
  let syncTimeout = null;
  function triggerCloudSync(immediate = false) {
    if (!currentUser || (!currentUser.token && !currentUser.email)) return;
    clearTimeout(syncTimeout);

    const performSync = async () => {
      syncTimeout = null;
      try {
        const payload = {
          token: currentUser.token || '',
          email: currentUser.email || '',
          pantry: Array.from(pantryState),
          pantryQuantities: pantryItemQuantities,
          favorites: Array.from(favoritesState),
          madeCounts: recipeMadeCounts,
          ratings: userRecipeData,
          customRecipes: customRecipesState,
          shoppingList: Array.from(manualShoppingList),
          freezerPints: freezerPintsState,
          badges: userBadgesState
        };
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
            'X-User-Email': currentUser.email || ''
          },
          body: JSON.stringify(payload),
          keepalive: true
        });
      } catch (err) {
        console.warn('Background sync notice:', err);
      }
    };

    if (immediate) {
      syncTimeout = null;
      performSync();
    } else {
      syncTimeout = setTimeout(performSync, 1200);
    }
  }

  // --- Real-Time Multi-Device Account Sync Fetcher ---
  async function fetchLatestUserData() {
    if (!currentUser || (!currentUser.token && !currentUser.email)) return;
    if (Date.now() - lastLocalMutationTime < 5000 || syncTimeout !== null) return;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
      if (currentUser.email) headers['X-User-Email'] = currentUser.email;

      const res = await fetch(`/api/user/data?_t=${Date.now()}`, {
        headers,
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          applyUserSession({
            user: data,
            token: currentUser.token,
            isSilent: true
          });
        }
      } else if (res.status === 401) {
        console.warn('Session expired or unauthorized for user data sync.');
      }
    } catch (e) {
      // Offline mode: keep cached local state
    }
  }


  // --- Community Stats & Overall Rating Fetch ---
  async function fetchCommunityStats() {
    try {
      const res = await fetch('/api/community/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok' || data.success || data.ratings) {
          communityStats = {
            ratings: data.ratings || {},
            madeCounts: data.madeCounts || {},
            totalBatches: data.totalBatches || 0,
            totalSpins: data.totalSpins || 0,
            totalUsers: data.totalUsers || 1
          };
          let needsGridReRender = false;

          // Apply creator recipe overrides from server
          if (data.recipeOverrides && typeof data.recipeOverrides === 'object') {
            let overridesChanged = false;
            Object.entries(data.recipeOverrides).forEach(([rId, override]) => {
              const found = (window.RECIPES_MASTER || []).find(r => r.id === rId);
              if (found) {
                const beforeStr = JSON.stringify(found);
                Object.assign(found, override);
                if (JSON.stringify(found) !== beforeStr) {
                  overridesChanged = true;
                }
              } else if (override && override.id) {
                if (!window.RECIPES_MASTER) window.RECIPES_MASTER = [];
                window.RECIPES_MASTER.push(override);
                overridesChanged = true;
              }
            });
            if (overridesChanged) {
              mergeRecipes();
              calculateIngredientUsage();
              needsGridReRender = true;
              if (typeof recipeModalOverlay !== 'undefined' && recipeModalOverlay.classList.contains('active') && typeof currentModalRecipe !== 'undefined' && currentModalRecipe && data.recipeOverrides[currentModalRecipe.id]) {
                renderRecipeModalContent(currentModalRecipe);
              }
            }
          }

          if (Array.isArray(data.publishedRecipes)) {
            const prevStr = JSON.stringify(serverPublishedRecipes);
            const newStr = JSON.stringify(data.publishedRecipes);
            if (prevStr !== newStr) {
              serverPublishedRecipes = data.publishedRecipes;
              mergeRecipes();
              calculateIngredientUsage();
              needsGridReRender = true;
            }
          }
          if (data.creatorProfiles && typeof data.creatorProfiles === 'object') {
            serverCreatorProfiles = data.creatorProfiles;
          }

          // Sync creator enabled/disabled settings from server
          if (Array.isArray(data.disabledCreators) || typeof data.disableAllCreators === 'boolean') {
            const serverDisabled = Array.isArray(data.disabledCreators) ? data.disabledCreators : [];
            const serverDisableAll = Boolean(data.disableAllCreators);
            const curDisabledStr = JSON.stringify((creatorSettings.disabledCreators || []).slice().sort());
            const srvDisabledStr = JSON.stringify([...serverDisabled].sort());
            if (curDisabledStr !== srvDisabledStr || creatorSettings.disableAllCreators !== serverDisableAll) {
              creatorSettings.disabledCreators = serverDisabled;
              creatorSettings.disableAllCreators = serverDisableAll;
              saveCreatorSettings();
              mergeRecipes();
              calculateIngredientUsage();
              needsGridReRender = true;
              updateCreatorDirectoryUI();
              updateAdminCreatorsBadge();
              if (typeof adminActiveTab !== 'undefined' && adminActiveTab === 'creators') {
                renderAdminCreators();
              }
            }
          }

          saveCommunityStats();
          updateCommunityStatsUI();
          if (needsGridReRender) {
            renderRecipes();
          }

          if (!window._communityStatsInterval) {
            window._communityStatsInterval = setInterval(() => {
              fetchCommunityStats();
            }, 45000);
            document.addEventListener('visibilitychange', () => {
              if (!document.hidden) fetchCommunityStats();
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch community stats from server, using cached:', e);
    }
  }

  function updateCommunityStatsUI() {
    const el = document.getElementById('statCommunityBatches');
    if (el) {
      el.textContent = (communityStats.totalBatches || 0).toLocaleString();
    }
  }

  // --- Google Identity Services & Auth Handlers ---
  let GOOGLE_CLIENT_ID = '547238002283-f4t0s8qto34ef86sah16q71csg8797vo.apps.googleusercontent.com';

  async function fetchServerConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.googleClientId && data.googleClientId.trim()) {
          GOOGLE_CLIENT_ID = data.googleClientId.trim();
          initGoogleAuth();
        }
      }
    } catch (e) {
      // Offline or static host: continue with client-side configuration
    }
  }

  let isGoogleIdentityInitialized = false;
  let isGoogleOneTapPrompted = false;

  function initGoogleAuth() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (!isGoogleIdentityInitialized) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          isGoogleIdentityInitialized = true;
        }

        const gsiContainer = document.getElementById('gsiButtonContainer');
        if (gsiContainer) {
          gsiContainer.innerHTML = '';
          const btnWidth = Math.min(300, Math.max(220, window.innerWidth - 64));
          window.google.accounts.id.renderButton(gsiContainer, {
            theme: isLight ? 'outline' : 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'signin_with',
            width: btnWidth
          });
        }

        // Trigger Google One-Tap prompt if not signed in and using a configured production client ID
        if (!currentUser && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('992837461234') && !isGoogleOneTapPrompted) {
          isGoogleOneTapPrompted = true;
          window.google.accounts.id.prompt();
        }
      } catch (err) {
        console.warn('Google Identity Services init notice:', err);
      }
    }
  }

  // Hook global library callback for asynchronous script load
  window.onGoogleLibraryLoad = function() {
    initGoogleAuth();
  };

  async function handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) return;
    try {
      showToast('Signing in with Google...');
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (data.status === 'ok' || data.success) {
        applyUserSession(data);
      } else {
        showToast('Login failed: ' + (data.message || data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('Google Auth error:', e);
      showToast('Could not complete Google Sign-In.');
    }
  }

  async function handleManualGoogleAuth(email, name) {
    if (!email) return;
    try {
      showToast('Connecting Google account...');
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name ? name.trim() : '' })
      });
      const data = await res.json();
      if (data.status === 'ok' || data.success) {
        applyUserSession(data);
      } else {
        showToast('Login failed: ' + (data.message || data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('Quick auth error:', e);
      showToast('Could not connect account.');
    }
  }

  function showAuthError(message) {
    const banner = document.getElementById('authErrorBanner');
    if (!banner) return;
    if (message) {
      banner.textContent = message;
      banner.classList.add('visible');
      banner.style.display = 'block';
    } else {
      banner.textContent = '';
      banner.classList.remove('visible');
      banner.style.display = 'none';
    }
  }

  function clearAuthError() {
    showAuthError('');
  }

  function switchAuthTab(mode) {
    const tabSignIn = document.getElementById('tabAuthSignIn');
    const tabRegister = document.getElementById('tabAuthRegister');
    const tabMagic = document.getElementById('tabAuthMagic');
    const formSignIn = document.getElementById('passwordAuthForm');
    const formRegister = document.getElementById('registerAuthForm');
    const formReset = document.getElementById('resetAuthForm');
    const formMagic = document.getElementById('magicAuthForm');
    clearAuthError();

    const magicNotice = document.getElementById('magicSuccessNotice');
    if (magicNotice) magicNotice.style.display = 'none';

    if (mode === 'magic') {
      if (tabSignIn) {
        tabSignIn.classList.remove('active');
        tabSignIn.setAttribute('aria-selected', 'false');
      }
      if (tabRegister) {
        tabRegister.classList.remove('active');
        tabRegister.setAttribute('aria-selected', 'false');
      }
      if (tabMagic) {
        tabMagic.classList.add('active');
        tabMagic.setAttribute('aria-selected', 'true');
      }
      if (formSignIn) formSignIn.style.display = 'none';
      if (formRegister) formRegister.style.display = 'none';
      if (formReset) formReset.style.display = 'none';
      if (formMagic) {
        formMagic.style.display = 'block';
        const emailInput = document.getElementById('authMagicEmail');
        if (emailInput) setTimeout(() => emailInput.focus(), 60);
      }
    } else if (mode === 'register') {
      if (tabSignIn) {
        tabSignIn.classList.remove('active');
        tabSignIn.setAttribute('aria-selected', 'false');
      }
      if (tabRegister) {
        tabRegister.classList.add('active');
        tabRegister.setAttribute('aria-selected', 'true');
      }
      if (tabMagic) {
        tabMagic.classList.remove('active');
        tabMagic.setAttribute('aria-selected', 'false');
      }
      if (formSignIn) formSignIn.style.display = 'none';
      if (formReset) formReset.style.display = 'none';
      if (formMagic) formMagic.style.display = 'none';
      if (formRegister) {
        formRegister.style.display = 'block';
        const emailInput = document.getElementById('authRegisterEmail');
        if (emailInput) setTimeout(() => emailInput.focus(), 60);
      }
    } else if (mode === 'reset') {
      if (tabSignIn) {
        tabSignIn.classList.remove('active');
        tabSignIn.setAttribute('aria-selected', 'false');
      }
      if (tabRegister) {
        tabRegister.classList.remove('active');
        tabRegister.setAttribute('aria-selected', 'false');
      }
      if (tabMagic) {
        tabMagic.classList.remove('active');
        tabMagic.setAttribute('aria-selected', 'false');
      }
      if (formSignIn) formSignIn.style.display = 'none';
      if (formRegister) formRegister.style.display = 'none';
      if (formMagic) formMagic.style.display = 'none';
      if (formReset) {
        formReset.style.display = 'block';
        const stepReq = document.getElementById('resetStepRequest');
        const stepVer = document.getElementById('resetStepVerify');
        if (stepVer && stepVer.style.display !== 'none') {
          const codeInput = document.getElementById('authResetCode');
          if (codeInput) setTimeout(() => codeInput.focus(), 60);
        } else {
          if (stepReq) stepReq.style.display = 'block';
          if (stepVer) stepVer.style.display = 'none';
          const emailInput = document.getElementById('authResetEmail');
          if (emailInput) setTimeout(() => emailInput.focus(), 60);
        }
      }
    } else {
      if (tabSignIn) {
        tabSignIn.classList.add('active');
        tabSignIn.setAttribute('aria-selected', 'true');
      }
      if (tabRegister) {
        tabRegister.classList.remove('active');
        tabRegister.setAttribute('aria-selected', 'false');
      }
      if (tabMagic) {
        tabMagic.classList.remove('active');
        tabMagic.setAttribute('aria-selected', 'false');
      }
      if (formRegister) formRegister.style.display = 'none';
      if (formReset) formReset.style.display = 'none';
      if (formMagic) formMagic.style.display = 'none';
      if (formSignIn) {
        formSignIn.style.display = 'block';
        const userInput = document.getElementById('authLoginUsername');
        if (userInput) setTimeout(() => userInput.focus(), 60);
      }
    }
  }

  async function handleRequestMagicLink(email) {
    if (!email || !email.includes('@')) {
      showAuthError('Please enter a valid email address.');
      return;
    }
    clearAuthError();
    const btn = document.getElementById('btnSendMagicLink');
    const notice = document.getElementById('magicSuccessNotice');
    if (notice) notice.style.display = 'none';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ Sending Magic Link...</span>';
    }

    try {
      const res = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (notice) {
          notice.style.display = 'flex';
          const p = notice.querySelector('p');
          if (p) p.textContent = `Check your inbox (${email}) and tap the 1-click sign-in link to access your account instantly!`;
        }
        showToast(`✨ Magic link sent to ${email}!`);
      } else {
        showAuthError(data.error || 'Failed to send magic link. Please try again.');
      }
    } catch (err) {
      console.error('Magic link request error:', err);
      showAuthError('Network error requesting magic link. Please try again.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>✨ Send Magic Sign-In Link ➔</span>';
      }
    }
  }

  async function handleVerifyMagicLink(token, email) {
    showToast('✨ Verifying your magic sign-in link...');
    try {
      const res = await fetch('/api/auth/magic-link/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: email || '' })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token && data.user) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        currentUser = data.user;
        updateAuthUI();
        closeGoogleAuthModal();
        playDingSound();
        showToast(`🎉 ${data.message || 'Signed in via Magic Link! Welcome.'}`, 5000);
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } catch (e) {}
        fetchLatestUserData();
      } else {
        showToast(`⚠️ ${data.error || 'Magic link verification failed.'}`, 6000);
      }
    } catch (err) {
      console.error('Magic link verify error:', err);
      showToast('⚠️ Network error verifying magic sign-in link.');
    }
  }

  async function handlePasswordLogin(usernameOrEmail, password) {
    if (!usernameOrEmail || !password) {
      showAuthError('Please enter your email and password.');
      return;
    }
    clearAuthError();
    const btn = document.getElementById('btnPasswordLogin');
    if (btn) btn.disabled = true;

    try {
      showToast('Signing in...');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: usernameOrEmail.trim(),
          username: usernameOrEmail.trim(),
          password: password.trim()
        })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'ok' || data.success)) {
        applyUserSession(data, 'email_password');
        closeGoogleAuthModal();
        showToast(`👋 Welcome back, ${data.user.name || data.user.username}!`);
      } else {
        const errorMsg = data.error || data.message || 'Invalid username or password';
        showAuthError(errorMsg);
        showToast(`Sign-in failed: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Password login error:', err);
      showAuthError('Connection error during sign-in.');
      showToast('Connection error during sign-in.');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function handleEmailRegister(email, password, name) {
    if (!email || !password) {
      showAuthError('Please provide an email and password.');
      return;
    }
    if (password.length < 6) {
      showAuthError('Password must be at least 6 characters long.');
      return;
    }
    clearAuthError();
    const btn = document.getElementById('btnRegisterSubmit');
    if (btn) btn.disabled = true;

    try {
      showToast('Creating account...');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name ? name.trim() : ''
        })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'ok' || data.success)) {
        applyUserSession(data, 'email_register');
        closeGoogleAuthModal();
        showToast(`🎉 Welcome to Creami Cravings, ${data.user.name || data.user.email}!`);
      } else {
        const errorMsg = data.error || data.message || 'Registration failed.';
        showAuthError(errorMsg);
        showToast(`Registration failed: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Email registration error:', err);
      showAuthError('Connection error during account creation.');
      showToast('Connection error during account creation.');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function handleRequestResetCode(email) {
    if (!email || !email.includes('@')) {
      showAuthError('Please enter a valid email address.');
      return;
    }
    clearAuthError();
    const btn = document.getElementById('btnSendResetCode');
    if (btn) btn.disabled = true;

    try {
      showToast('Sending reset code...');
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'ok' || data.success)) {
        const stepReq = document.getElementById('resetStepRequest');
        const stepVer = document.getElementById('resetStepVerify');
        const emailDisplay = document.getElementById('resetEmailSentDisplay');
        if (stepReq) stepReq.style.display = 'none';
        if (stepVer) stepVer.style.display = 'block';
        if (emailDisplay) emailDisplay.textContent = email.trim();

        if (data.devCode) {
          const codeInput = document.getElementById('authResetCode');
          if (codeInput) codeInput.value = data.devCode;
          showToast(`⚙️ Server SMTP not configured. Test code: ${data.devCode}`, 6000);
        } else if (data.smtpConfigured === false) {
          showAuthError('⚠️ Outgoing email service (SMTP) is not yet configured on the server. If this is your account, please reach out to admin@creamicravings.com or configure SMTP.');
          showToast('⚠️ Email delivery (SMTP) is not yet configured on the server.', 6000);
        } else {
          showToast('📬 6-digit code sent to your email!');
        }

        const codeField = document.getElementById('authResetCode');
        if (codeField) setTimeout(() => codeField.focus(), 60);
      } else {
        const errorMsg = data.error || data.message || 'Could not send reset code.';
        showAuthError(errorMsg);
        showToast(errorMsg);
      }
    } catch (err) {
      console.error('Request reset code error:', err);
      showAuthError('Connection error. Please check your internet connection.');
      showToast('Connection error during reset request.');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function handleSubmitResetPassword(email, code, newPassword, confirmPassword) {
    if (!email) {
      showAuthError('Please provide your email address.');
      return;
    }
    const token = (document.getElementById('authResetToken')?.value || '').trim();
    if (!code && !token) {
      showAuthError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showAuthError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAuthError('Passwords do not match. Please re-enter them carefully.');
      return;
    }

    clearAuthError();
    const btn = document.getElementById('btnSubmitResetPassword');
    if (btn) btn.disabled = true;

    try {
      showToast('Resetting password...');
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          token: token,
          newPassword: newPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'ok' || data.success)) {
        applyUserSession(data, 'password_reset');
        closeGoogleAuthModal();
        showToast(`🎉 Password reset successful! Welcome back, ${data.user.name || data.user.email}!`);
      } else {
        const errorMsg = data.error || data.message || 'Failed to reset password.';
        showAuthError(errorMsg);
        showToast(`Reset failed: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      showAuthError('Connection error during password reset.');
      showToast('Connection error during password reset.');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function openPasswordResetDirect(email, token) {
    openGoogleAuthModal();
    switchAuthTab('reset');
    const stepReq = document.getElementById('resetStepRequest');
    const stepVer = document.getElementById('resetStepVerify');
    const emailInput = document.getElementById('authResetEmail');
    const tokenInput = document.getElementById('authResetToken');
    const emailDisplay = document.getElementById('resetEmailSentDisplay');

    if (emailInput && email) emailInput.value = email;
    if (tokenInput && token) tokenInput.value = token;
    if (emailDisplay && email) emailDisplay.textContent = email;

    if (stepReq) stepReq.style.display = 'none';
    if (stepVer) stepVer.style.display = 'block';

    const passField = document.getElementById('authResetNewPassword');
    if (passField) setTimeout(() => passField.focus(), 80);
  }

  function applyUserSession(data, method = 'google') {
    const ADMIN_EMAILS = ['admin@creamicravings.com', 'ahumpo7@gmail.com', 'ahumpo@gmail.com', 'andrew@gmail.com'];
    const email = (data.user.email || '').toLowerCase();
    const isAdmin = data.user.role === 'admin' || ADMIN_EMAILS.includes(email);

    const baseUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      picture: data.user.picture,
      role: isAdmin ? 'admin' : (data.user.role || 'user'),
      creatorId: data.user.creatorId || null,
      creatorVips: Array.isArray(data.user.creatorVips) ? data.user.creatorVips : [],
      freezerCapacity: Number(data.user.freezerCapacity) || 4,
      subscriptions: (data.user && Array.isArray(data.user.subscriptions))
        ? data.user.subscriptions
        : ['Community Legends'],
      token: data.token || (currentUser ? currentUser.token : '')
    };

    currentUser = baseUser;

    if (isSuperAdminAccount(currentUser)) {
      realAdminUser = JSON.parse(JSON.stringify(baseUser));
      try { localStorage.setItem(REAL_ADMIN_STORAGE_KEY, JSON.stringify(realAdminUser)); } catch (e) {}
      if (currentMimicRole && currentMimicRole !== 'admin') {
        applyMimicRole(currentMimicRole, false);
      }
    } else {
      realAdminUser = null;
    }
    saveUserAuth();
    trackAnalyticsEvent('login', {
      method: method
    });

    const isSilent = Boolean(data.isSilent);
    const hasRecentLocalMutation = (Date.now() - lastLocalMutationTime < 5000) || (syncTimeout !== null);

    // If silent background sync occurs during active local user mutation, skip to avoid race conditions
    if (isSilent && hasRecentLocalMutation) {
      return;
    }

    // Detect granular data mutations between local state and incoming server state
    let pantryChanged = false;
    let quantitiesChanged = false;
    let favoritesChanged = false;
    let madeChanged = false;
    let ratingsChanged = false;
    let customChanged = false;
    let shoppingChanged = false;
    let freezerChanged = false;
    let claimsChanged = false;

    if (data.user && Array.isArray(data.user.pantry)) {
      if (data.user.pantry.length !== pantryState.size || data.user.pantry.some(id => !pantryState.has(id))) {
        pantryChanged = true;
      }
    }
    if (data.user && data.user.pantryQuantities && typeof data.user.pantryQuantities === 'object') {
      if (JSON.stringify(data.user.pantryQuantities) !== JSON.stringify(pantryItemQuantities)) {
        quantitiesChanged = true;
      }
    }
    if (data.user && Array.isArray(data.user.favorites)) {
      if (data.user.favorites.length !== favoritesState.size || data.user.favorites.some(id => !favoritesState.has(id))) {
        favoritesChanged = true;
      }
    }
    if (data.user && data.user.madeCounts && typeof data.user.madeCounts === 'object') {
      if (JSON.stringify(data.user.madeCounts) !== JSON.stringify(recipeMadeCounts)) {
        madeChanged = true;
      }
    }
    if (data.user && data.user.ratings && typeof data.user.ratings === 'object') {
      if (JSON.stringify(data.user.ratings) !== JSON.stringify(userRecipeData)) {
        ratingsChanged = true;
      }
    }
    if (data.user && Array.isArray(data.user.customRecipes)) {
      if (JSON.stringify(data.user.customRecipes) !== JSON.stringify(customRecipesState)) {
        customChanged = true;
      }
    }
    if (data.user && Array.isArray(data.user.shoppingList)) {
      const incomingShop = new Set(data.user.shoppingList.filter(item => !isShoppingExcluded(item)).map(item => sanitizeShoppingItemName(item)));
      if (incomingShop.size !== manualShoppingList.size || [...incomingShop].some(x => !manualShoppingList.has(x))) {
        shoppingChanged = true;
      }
    }
    if (data.user && Array.isArray(data.user.freezerPints)) {
      if (JSON.stringify(data.user.freezerPints) !== JSON.stringify(freezerPintsState)) {
        freezerChanged = true;
      }
    }
    if (data.user && Array.isArray(data.user.pendingClaims)) {
      if (JSON.stringify(data.user.pendingClaims) !== JSON.stringify(Array.from(userPendingClaimsState))) {
        claimsChanged = true;
      }
    }
    let badgesChanged = false;
    if (data.user && data.user.badges && typeof data.user.badges === 'object') {
      if (JSON.stringify(data.user.badges) !== JSON.stringify(userBadgesState)) {
        badgesChanged = true;
      }
    }

    // On silent periodic sync, if nothing changed, exit immediately to prevent any DOM tearing or scroll resets
    if (isSilent && !pantryChanged && !quantitiesChanged && !favoritesChanged && !madeChanged && !ratingsChanged && !customChanged && !shoppingChanged && !freezerChanged && !claimsChanged && !badgesChanged) {
      return;
    }

    // 1. Restore & switch to authenticated user's pantry
    if (!isSilent || pantryChanged || quantitiesChanged) {
      if (data.user && Array.isArray(data.user.pantry)) {
        pantryState = new Set(data.user.pantry);
      } else if (!isSilent) {
        const userPantryKey = `${PANTRY_STORAGE_KEY}_${currentUser.id}`;
        const savedUserPantry = localStorage.getItem(userPantryKey);
        if (savedUserPantry !== null) {
          try {
            pantryState = new Set(JSON.parse(savedUserPantry));
          } catch (e) {
            pantryState = new Set(DEFAULT_STAPLES);
          }
        } else {
          pantryState = new Set(DEFAULT_STAPLES);
        }
      }
      if (pantryState.has('cinnamon_cereal')) {
        pantryState.delete('cinnamon_cereal');
        pantryState.add('cinnamon_toast_crunch');
        triggerCloudSync();
      }
      const pantryKey = getPantryStorageKey();
      localStorage.setItem(pantryKey, JSON.stringify(Array.from(pantryState)));
      if (currentUser) {
        localStorage.removeItem(PANTRY_STORAGE_KEY);
      }

      if (data.user && data.user.pantryQuantities && typeof data.user.pantryQuantities === 'object') {
        pantryItemQuantities = { ...data.user.pantryQuantities };
        localStorage.setItem(getPantryQuantitiesStorageKey(), JSON.stringify(pantryItemQuantities));
      } else if (!isSilent) {
        const savedQ = localStorage.getItem(getPantryQuantitiesStorageKey());
        if (savedQ) {
          try { pantryItemQuantities = JSON.parse(savedQ) || {}; } catch (e) { pantryItemQuantities = {}; }
        }
      }

      updateStats();
      updatePantryCheckboxVisuals();
      if (!isSilent) {
        renderPantryList();
      }
    }

    // 2. Restore user's favorites
    if (!isSilent || favoritesChanged) {
      favoritesState = new Set(Array.isArray(data.user.favorites) ? data.user.favorites : []);
      if (currentUser && currentUser.id) {
        const userFavKey = `${FAVORITES_STORAGE_KEY}_${currentUser.id}`;
        localStorage.setItem(userFavKey, JSON.stringify(Array.from(favoritesState)));
      }
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      updateCategoryCounts();
    }

    // 3. Restore made counts
    if (!isSilent || madeChanged) {
      recipeMadeCounts = (data.user.madeCounts && typeof data.user.madeCounts === 'object') ? { ...data.user.madeCounts } : {};
      if (currentUser && currentUser.id) {
        const userMadeKey = `${RECIPE_MADE_STORAGE_KEY}_${currentUser.id}`;
        localStorage.setItem(userMadeKey, JSON.stringify(recipeMadeCounts));
      }
      localStorage.removeItem(RECIPE_MADE_STORAGE_KEY);
    }

    // 4. Restore ratings
    if (!isSilent || ratingsChanged) {
      userRecipeData = (data.user.ratings && typeof data.user.ratings === 'object') ? { ...data.user.ratings } : {};
      if (currentUser && currentUser.id) {
        const userRatingKey = `${USER_RECIPE_DATA_KEY}_${currentUser.id}`;
        localStorage.setItem(userRatingKey, JSON.stringify(userRecipeData));
      }
      localStorage.removeItem(USER_RECIPE_DATA_KEY);
    }

    // 5. Restore custom recipes
    if (!isSilent || customChanged) {
      if (data.user.customRecipes && Array.isArray(data.user.customRecipes)) {
        customRecipesState = data.user.customRecipes;
        const userCustomKey = `${CUSTOM_RECIPES_STORAGE_KEY}_${currentUser.id}`;
        localStorage.setItem(userCustomKey, JSON.stringify(customRecipesState));
        mergeRecipes();
        calculateIngredientUsage();
        renderPantryList();
      } else {
        customRecipesState = [];
      }
    }

    // 6. Restore shopping list
    if (!isSilent || shoppingChanged) {
      if (data.user.shoppingList && Array.isArray(data.user.shoppingList)) {
        manualShoppingList = new Set(
          data.user.shoppingList
            .filter(item => !isShoppingExcluded(item))
            .map(item => sanitizeShoppingItemName(item))
        );
        const shopKey = getShoppingStorageKey();
        localStorage.setItem(shopKey, JSON.stringify(Array.from(manualShoppingList)));
        if (currentUser) {
          localStorage.removeItem(MANUAL_SHOPPING_STORAGE_KEY);
        }
        updateShoppingListBadge();
      } else {
        manualShoppingList = new Set();
      }
    }

    // 7. Restore freezer pints
    if (!isSilent || freezerChanged) {
      if (data.user.freezerPints && Array.isArray(data.user.freezerPints)) {
        freezerPintsState = data.user.freezerPints;
        const userFreezerKey = `${FREEZER_STORAGE_KEY}_${currentUser.id}`;
        localStorage.setItem(userFreezerKey, JSON.stringify(freezerPintsState));
        updateFreezerBadges();
      } else {
        freezerPintsState = [];
      }
    }

    // 8. Restore pending access claims from server
    if (!isSilent || claimsChanged) {
      if (data.user && Array.isArray(data.user.pendingClaims)) {
        userPendingClaimsState = new Set(data.user.pendingClaims);
        localStorage.setItem('creami_pending_claims_v1', JSON.stringify(Array.from(userPendingClaimsState)));
      }
    }

    // 9. Restore Chef Badges & Milestones from server
    if (!isSilent || badgesChanged) {
      if (data.user && data.user.badges && typeof data.user.badges === 'object') {
        userBadgesState = { ...userBadgesState, ...data.user.badges };
        saveUserBadgesLocally();
      } else {
        loadUserBadges();
      }
      evaluateBadges(false);
    }

    if (!isSilent || pantryChanged || customChanged || favoritesChanged) {
      mergeRecipes();
      calculateIngredientUsage();
      updateCategoryCounts();
      updateAuthUI();
      updateFreezerBadges();
      recipeCardCache.clear();
      renderRecipes();
    }

    // Sync freezer shelf capacity from account permissions
    const userMaxSlots = getUserMaxFreezerSlots(currentUser);
    const savedCap = localStorage.getItem(FREEZER_CAPACITY_STORAGE_KEY);
    if (!savedCap) {
      freezerSlotCapacity = userMaxSlots;
      try { localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString()); } catch (e) {}
    } else if (freezerSlotCapacity > userMaxSlots) {
      freezerSlotCapacity = userMaxSlots;
      try { localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString()); } catch (e) {}
    }
    renderFreezerShelfWidget();

    // Check for pending Stripe freezer shelf upgrade from unauthenticated checkout
    try {
      const pendingUpgrade = localStorage.getItem('pending_freezer_upgrade');
      if (pendingUpgrade) {
        const slotsToUpgrade = parseInt(pendingUpgrade, 10);
        localStorage.removeItem('pending_freezer_upgrade');
        setTimeout(() => {
          executeFreezerUpgradeSuccess(slotsToUpgrade, false);
        }, 500);
      }
    } catch (e) {}

    if (!data.isSilent) {
      closeGoogleAuthModal();
      showToast(`✨ Welcome back, ${currentUser.name || 'Ice Cream Craver'}! All data synced.`);
      triggerCloudSync(true);
    }

    if (isSuperAdminAccount(realAdminUser || currentUser)) {
      renderMimicUI();
    } else {
      realAdminUser = null;
      renderMimicUI();
    }
  }


  function logoutUser() {
    if (currentUser && currentUser.id) {
      savePantry();
      saveManualShoppingList();
      saveUserRecipeData();
      saveRecipeMadeCounts();
    }
    realAdminUser = null;
    currentMimicRole = 'admin';
    try {
      localStorage.removeItem(MIMIC_ROLE_STORAGE_KEY);
      localStorage.removeItem(REAL_ADMIN_STORAGE_KEY);
    } catch (e) {}
    currentUser = null;
    saveUserAuth();
    renderMimicUI();

    // Reset personal custom recipes and clear favorites upon sign-out
    customRecipesState = [];
    favoritesState = new Set();
    freezerPintsState = [];
    userPendingClaimsState = new Set();
    localStorage.removeItem('creami_pending_claims_v1');
    updateFreezerBadges();
    localStorage.removeItem(CUSTOM_RECIPES_STORAGE_KEY);
    localStorage.removeItem(FREEZER_STORAGE_KEY);

    // Switch immediately to this environment's local guest session pantry & shopping list
    loadPantryForCurrentSession();
    loadShoppingListForCurrentSession();
    loadUserRecipeDataForCurrentSession();
    loadRecipeMadeCountsForCurrentSession();
    loadUserBadges();
    evaluateBadges(false);

    updatePantryCheckboxVisuals();
    mergeRecipes();
    calculateIngredientUsage();
    renderPantryList();
    updateCategoryCounts();
    if (activeCategory === 'Custom' || activeCategory === 'favorites') {
      activeCategory = 'all';
      if (categoryTabs) {
        categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const allBtn = categoryTabs.querySelector('[data-category="all"]');
        if (allBtn) allBtn.classList.add('active');
      }
    }
    updateAuthUI();
    recipeCardCache.clear();
    renderRecipes();
    showToast('Signed out of Google account. Switched to local session pantry.');
  }

  function updateAuthUI() {
    const signInBtn = document.getElementById('headerSignInBtn');
    const profileWidget = document.getElementById('headerUserProfile');
    const avatarImg = document.getElementById('userAvatarImg');
    const nameEl = document.getElementById('userProfileName');
    const customActions = document.getElementById('customActionsContainer');
    const customTab = document.getElementById('tabCustomRecipes');

    if (currentUser) {
      if (signInBtn) signInBtn.style.display = 'none';
      if (profileWidget) profileWidget.style.display = 'inline-flex';
      if (avatarImg) {
        avatarImg.src = currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=059669&color=fff&bold=true`;
      }
      if (nameEl) {
        nameEl.textContent = currentUser.name || currentUser.email.split('@')[0];
      }
      // Show + Custom Recipe button only for signed-in user
      if (customActions) {
        customActions.style.display = 'inline-flex';
        const addBtn = document.getElementById('addCustomRecipeBtn');
        if (addBtn) {
          if (currentUser.role === 'admin') {
            addBtn.innerHTML = '➕ Add Recipe';
            addBtn.title = 'Add new recipe or publish to any cookbook (Admin)';
          } else if (currentUser.role === 'creator') {
            addBtn.innerHTML = '➕ Add Recipe';
            addBtn.title = 'Add new recipe or publish to your cookbooks (Creator)';
          } else {
            addBtn.innerHTML = '➕ Custom Recipe';
            addBtn.title = 'Add your personal Creami recipe (saved to your Google account)';
          }
        }
      }
      if (customTab) {
        customTab.style.display = (customRecipesState.length > 0) ? 'inline-flex' : 'none';
      }
      if (openAdminPortalBtn) {
        const isMimickingNonAdmin = Boolean(realAdminUser && currentMimicRole && currentMimicRole !== 'admin');
        const isAdmin = Boolean(currentUser && currentUser.role === 'admin' && !isMimickingNonAdmin);
        if (isAdmin) {
          openAdminPortalBtn.style.setProperty('display', 'inline-flex', 'important');
          openAdminPortalBtn.classList.remove('hidden');
        } else {
          openAdminPortalBtn.style.setProperty('display', 'none', 'important');
          openAdminPortalBtn.classList.add('hidden');
        }
      }
      if (openCreatorPortalBtn) {
        const isCreator = Boolean(
          currentUser && (
            currentUser.role === 'creator' ||
            (currentMimicRole === 'creator' && isSuperAdminAccount(realAdminUser || currentUser))
          )
        );
        if (isCreator) {
          openCreatorPortalBtn.style.setProperty('display', 'inline-flex', 'important');
          openCreatorPortalBtn.classList.remove('hidden');
        } else {
          openCreatorPortalBtn.style.setProperty('display', 'none', 'important');
          openCreatorPortalBtn.classList.add('hidden');
        }
      }
    } else {
      if (signInBtn) signInBtn.style.display = 'inline-flex';
      if (profileWidget) profileWidget.style.display = 'none';
      // Hide + Custom Recipe button when signed out
      if (customActions) customActions.style.display = 'none';
      if (customTab) customTab.style.display = 'none';
      if (openAdminPortalBtn) {
        openAdminPortalBtn.style.setProperty('display', 'none', 'important');
        openAdminPortalBtn.classList.add('hidden');
      }
      if (openCreatorPortalBtn) {
        openCreatorPortalBtn.style.setProperty('display', 'none', 'important');
        openCreatorPortalBtn.classList.add('hidden');
      }
    }
    renderMimicUI();
  }

  // --- Super Admin Role Impersonation Engine (ahumpo7@gmail.com) ---
  function isSuperAdminAccount(userObj = (realAdminUser || currentUser)) {
    if (!userObj || !userObj.email) return false;
    const em = userObj.email.trim().toLowerCase();
    return em === 'ahumpo7@gmail.com' || em === 'ahumpo@gmail.com';
  }

  function applyMimicRole(targetRole, showToastNotice = true, targetCreatorId = null) {
    if (!realAdminUser && !isSuperAdminAccount(currentUser)) return;
    if (!realAdminUser && currentUser) {
      realAdminUser = JSON.parse(JSON.stringify(currentUser));
      try { localStorage.setItem(REAL_ADMIN_STORAGE_KEY, JSON.stringify(realAdminUser)); } catch (e) {}
    }

    currentMimicRole = targetRole || 'admin';
    if (targetCreatorId) {
      currentMimicCreatorId = targetCreatorId;
      try { localStorage.setItem(MIMIC_CREATOR_STORAGE_KEY, currentMimicCreatorId); } catch (e) {}
    }
    try { localStorage.setItem(MIMIC_ROLE_STORAGE_KEY, currentMimicRole); } catch (e) {}

    const mimicPurchasedCap = parseInt(localStorage.getItem('creami_mimic_user_freezer_capacity') || '4', 10);
    if (currentMimicRole === 'guest') {
      currentUser = null;
    } else if (currentMimicRole === 'creator') {
      const cId = targetCreatorId || currentMimicCreatorId || 'fitness_product_finder';
      currentMimicCreatorId = cId;
      currentUser = {
        ...realAdminUser,
        role: 'creator',
        creatorId: cId,
        creatorVips: [],
        freezerCapacity: 12,
        subscriptions: cId === 'fitness_product_finder'
          ? ['All-Access', 'Base Flavors', 'Community Legends', 'Fan Favorites', 'No Protein', 'Keto', 'Lactose Free']
          : ['Community Legends', 'TestContent Sampler', 'Volume Pints', 'TestContent All-Access']
      };
    } else if (currentMimicRole === 'vip') {
      const cId = targetCreatorId || currentMimicCreatorId || 'fitness_product_finder';
      currentMimicCreatorId = cId;
      currentUser = {
        ...realAdminUser,
        role: 'user',
        creatorId: null,
        creatorVips: [cId],
        freezerCapacity: 12,
        subscriptions: ['Community Legends']
      };
    } else if (currentMimicRole === 'multi_sub') {
      currentUser = {
        ...realAdminUser,
        role: 'user',
        creatorId: null,
        creatorVips: [],
        freezerCapacity: Math.max(8, mimicPurchasedCap),
        subscriptions: ['Community Legends', 'Fan Favorites', 'TestContent Sampler']
      };
    } else if (currentMimicRole === 'user') {
      currentUser = {
        ...realAdminUser,
        role: 'user',
        creatorId: null,
        creatorVips: [],
        freezerCapacity: mimicPurchasedCap,
        subscriptions: ['Community Legends', 'Base Flavors']
      };
    } else {
      // 'admin' (Platform Support)
      currentMimicRole = 'admin';
      currentUser = JSON.parse(JSON.stringify(realAdminUser));
      currentUser.role = 'admin';
      currentUser.creatorId = null;
      currentUser.creatorVips = [];
      currentUser.freezerCapacity = 12;
      try { localStorage.setItem(MIMIC_ROLE_STORAGE_KEY, 'admin'); } catch (e) {}
      try { localStorage.removeItem('creami_mimic_user_freezer_capacity'); } catch (e) {}
    }

    // Sync active freezer shelf capacity to target role permissions
    const mimicMaxCap = getUserMaxFreezerSlots(currentUser);
    if (currentMimicRole === 'creator' || currentMimicRole === 'admin' || currentMimicRole === 'vip') {
      freezerSlotCapacity = 12;
    } else if (currentMimicRole === 'multi_sub') {
      freezerSlotCapacity = Math.max(8, mimicPurchasedCap);
    } else if (currentMimicRole === 'user') {
      freezerSlotCapacity = mimicPurchasedCap;
    } else {
      freezerSlotCapacity = Math.min(freezerSlotCapacity, mimicMaxCap);
    }
    try { localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString()); } catch (e) {}

    // Always preserve realAdminUser in USER_AUTH_STORAGE_KEY so refresh never drops session
    if (realAdminUser) {
      try { localStorage.setItem(USER_AUTH_STORAGE_KEY, JSON.stringify(realAdminUser)); } catch (e) {}
    }

    // Ensure active category and diet filter are accessible for the target role
    if (activeCategory !== 'all' && !isCategoryUnlocked(activeCategory)) {
      activeCategory = 'all';
      if (categoryTabs) {
        categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const allTab = categoryTabs.querySelector('[data-category="all"]');
        if (allTab) allTab.classList.add('active');
      }
    }
    if (activeDietFilter === 'low_carb' && !isCategoryUnlocked('Keto')) {
      activeDietFilter = 'all';
      if (dietFilterSelect) {
        dietFilterSelect.value = 'all';
        dietFilterSelect.classList.remove('active');
      }
    }

    // Close admin portal modal if open so it doesn't lock the screen
    const adminOverlay = document.getElementById('adminModalOverlay');
    if (adminOverlay && (adminOverlay.classList.contains('active') || adminOverlay.style.display === 'flex')) {
      if (typeof closeAdminPortal === 'function') closeAdminPortal();
    }

    renderMimicUI();
    updateAuthUI();
    if (recipeCardCache && typeof recipeCardCache.clear === 'function') {
      recipeCardCache.clear();
    }
    renderRecipes();
    calculateIngredientUsage();
    renderPantryList();
    if (typeof renderFreezerShelfWidget === 'function') {
      renderFreezerShelfWidget();
    }

    if (showToastNotice) {
      const activeCreator = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === currentMimicCreatorId) : null;
      const creatorName = activeCreator ? activeCreator.name : 'Eli';
      const roleLabels = {
        admin: '👑 Administrator (Platform Support)',
        creator: `🧑‍🍳 Content Creator (${creatorName} Studio)`,
        vip: `⭐ ${creatorName} VIP Member (Unlocked)`,
        multi_sub: '📚 Multi-Creator Subscriber (Eli + TestContent)',
        user: '👤 Standard User (Free Starter)',
        guest: '👁️ Guest Visitor (Logged Out)'
      };
      showToast(`🎭 Active View: ${roleLabels[currentMimicRole] || currentMimicRole}`);
    }
  }

  function renderMimicUI() {
    const isSuperAdmin = Boolean(realAdminUser || isSuperAdminAccount(currentUser));
    const pill = document.getElementById('mimicRoleTriggerPill');
    const banner = document.getElementById('mimicActiveBanner');
    const adminMimicSec = document.getElementById('adminPortalMimicSection');
    const pillText = document.getElementById('mimicPillText');
    const activeLabel = document.getElementById('mimicActiveRoleLabel');

    if (!isSuperAdmin) {
      if (pill) pill.style.display = 'none';
      if (banner) banner.style.display = 'none';
      if (adminMimicSec) adminMimicSec.style.display = 'none';
      return;
    }

    const activeCreator = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === currentMimicCreatorId) : null;
    const creatorName = activeCreator ? activeCreator.name : 'Eli';

    const roleNameMap = {
      admin: 'Admin',
      creator: `Creator (${creatorName})`,
      vip: `VIP (${creatorName})`,
      multi_sub: 'Multi-Sub',
      user: 'User',
      guest: 'Guest'
    };

    const roleFullMap = {
      admin: 'Administrator (Platform Support)',
      creator: `Content Creator (${creatorName} Studio)`,
      vip: `${creatorName} VIP Member (Unlocked)`,
      multi_sub: 'Multi-Creator Subscriber (Eli + TestContent)',
      user: 'Standard User (Free Starter)',
      guest: 'Guest Visitor (Logged Out)'
    };

    // 1. Floating Pill
    if (pill) {
      pill.style.display = 'inline-flex';
      if (pillText) {
        pillText.textContent = `View As: ${roleNameMap[currentMimicRole] || currentMimicRole}`;
      }
      if (currentMimicRole !== 'admin') {
        pill.classList.add('mimic-active');
      } else {
        pill.classList.remove('mimic-active');
      }
    }

    // 2. Active Impersonation Top Banner
    if (banner) {
      if (currentMimicRole !== 'admin') {
        banner.style.display = 'block';
        if (activeLabel) {
          activeLabel.textContent = roleFullMap[currentMimicRole] || currentMimicRole;
        }
      } else {
        banner.style.display = 'none';
      }
    }

    // 3. Admin Portal Mimic Card
    if (adminMimicSec) {
      adminMimicSec.style.display = 'flex';
      adminMimicSec.querySelectorAll('.btn-mimic-select').forEach(btn => {
        const role = btn.dataset.role;
        const cId = btn.dataset.creatorId;
        let isActive = (role === currentMimicRole);
        if (role === 'creator' || role === 'vip') {
          isActive = isActive && (cId === currentMimicCreatorId);
        }
        if (isActive) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // 4. Modal Cards active states
    const cards = [
      { id: 'cardMimicAdmin', role: 'admin', creatorId: null },
      { id: 'cardMimicCreatorEli', role: 'creator', creatorId: 'fitness_product_finder' },
      { id: 'cardMimicCreatorTest', role: 'creator', creatorId: 'test_content' },
      { id: 'cardMimicVipEli', role: 'vip', creatorId: 'fitness_product_finder' },
      { id: 'cardMimicVipTest', role: 'vip', creatorId: 'test_content' },
      { id: 'cardMimicMultiSub', role: 'multi_sub', creatorId: null },
      { id: 'cardMimicUser', role: 'user', creatorId: null },
      { id: 'cardMimicGuest', role: 'guest', creatorId: null }
    ];
    cards.forEach(c => {
      const el = document.getElementById(c.id);
      if (el) {
        let isActive = (c.role === currentMimicRole);
        if (c.role === 'creator' || c.role === 'vip') {
          isActive = isActive && (c.creatorId === currentMimicCreatorId);
        }
        if (isActive) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  }

  function openMimicModal() {
    const modal = document.getElementById('mimicRoleModalOverlay');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
      renderMimicUI();
    }
  }

  function closeMimicModal() {
    const modal = document.getElementById('mimicRoleModalOverlay');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      unlockBackgroundScroll();
    }
  }

  // --- Tiered Recipe Access & Gating Helpers (Roadmap Item 15) ---
  function normalizeCategoryName(cat) {
    if (!cat) return '';
    return String(cat).toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Strict check for universal starter base trio: Chocolate, Vanilla, Strawberry
  function isExactBaseTrio(recipe) {
    if (!recipe || !recipe.name) return false;
    const cleanName = recipe.name.trim().toLowerCase();
    return cleanName === 'chocolate' || cleanName === 'vanilla' || cleanName === 'strawberry';
  }

  function isCategoryUnlocked(categoryName) {
    if (!categoryName || categoryName === 'all' || categoryName === 'Community Legends' || categoryName === 'favorites' || categoryName === 'Custom') {
      return true;
    }
    const book = (typeof BOOKS_MASTER !== 'undefined') 
      ? BOOKS_MASTER.find(b => b.categoryKey === categoryName || b.bookKey === categoryName) 
      : null;
    const creatorId = book ? book.creatorId : 'fitness_product_finder';

    // If creator is disabled, their category packs are completely locked/hidden
    if (isCreatorDisabled(creatorId)) return false;

    if (currentUser) {
      if (currentUser.role === 'creator' && currentUser.creatorId === creatorId) return true;
      if (currentUser.creatorVips && Array.isArray(currentUser.creatorVips) && currentUser.creatorVips.includes(creatorId)) return true;
    }

    const subs = (currentUser && Array.isArray(currentUser.subscriptions)) ? currentUser.subscriptions : ['Community Legends'];
    
    // Check creator-scoped all-access
    if (creatorId === 'fitness_product_finder' && (subs.includes('All-Access') || subs.includes('Eli All-Access') || subs.includes('fitness_product_finder:all_access'))) return true;
    if (creatorId === 'test_content' && (subs.includes('TestContent All-Access') || subs.includes('test_content:all_access'))) return true;
    if (subs.includes(creatorId + ':all_access')) return true;

    const norm = normalizeCategoryName(categoryName);
    return subs.some(s => {
      const normS = normalizeCategoryName(s);
      return normS === norm || (normS.length > 3 && norm.includes(normS));
    });
  }

  function getAccessibleRecipeCategories(recipe) {
    if (!recipe) return [];
    if (recipe.category === 'Custom' || recipe.isPersonal) {
      return ['Custom'];
    }
    // Universal free starter trio strictly shows Base Flavors tag unless user owns more packs
    if (isExactBaseTrio(recipe)) {
      const cats = (recipe.categories && recipe.categories.length > 0) ? recipe.categories : ['Base Flavors'];
      const accessible = cats.filter(c => {
        if (c === 'Base Flavors' || c === 'Community Legends') return true;
        return isCategoryUnlocked(c);
      });
      return accessible.length > 0 ? accessible : ['Base Flavors'];
    }
    const cats = (recipe.categories && recipe.categories.length > 0)
      ? recipe.categories
      : [recipe.category || 'Base Flavors'];

    return cats.filter(c => {
      if (c === 'Community Legends') return true;
      if (c === 'Base Flavors') {
        return isRecipeAccessible(recipe);
      }
      return isCategoryUnlocked(c);
    });
  }

  function getRecipeRequiredTier(recipe) {
    if (!recipe) return 'All-Access';
    if (recipe.category === 'Custom' || recipe.isPersonal) {
      return 'Custom';
    }
    const cats = (recipe.categories && recipe.categories.length > 0)
      ? recipe.categories
      : [recipe.category || 'All-Access'];

    for (const c of cats) {
      const norm = normalizeCategoryName(c);
      if (norm.includes('fanfav')) return 'Fan Favorites';
      if (norm.includes('keto')) return 'Keto';
      if (norm.includes('lactose')) return 'Lactose Free';
      if (norm.includes('noprot')) return 'No Protein';
      if (norm.includes('sampler')) return 'TestContent Sampler';
      if (norm.includes('volume')) return 'Volume Pints';
    }
    if (cats.some(c => normalizeCategoryName(c).includes('base'))) {
      return 'All-Access';
    }
    return cats[0] || 'All-Access';
  }

  function isRecipeAccessible(recipe) {
    if (!recipe) return true;
    if (recipe.category === 'Custom' || recipe.isPersonal) {
      return true;
    }
    // Universal free starter base trio (Chocolate, Vanilla, Strawberry)
    if (isExactBaseTrio(recipe)) {
      return true;
    }
    // Free community recipes
    if (
      recipe.category === 'Community Legends' ||
      recipe.sourceFile === 'Community Legends' ||
      (recipe.categories && recipe.categories.includes('Community Legends'))
    ) {
      return true;
    }

    // Determine recipe creator
    const creatorId = recipe.creatorId || 'fitness_product_finder';

    if (currentUser) {
      // 1. Content creator owns this recipe
      if (currentUser.role === 'creator' && currentUser.creatorId === creatorId) {
        return true;
      }
      // 2. User is in this specific creator's VIP circle
      if (currentUser.creatorVips && Array.isArray(currentUser.creatorVips) && currentUser.creatorVips.includes(creatorId)) {
        return true;
      }
      // 3. User authored this custom recipe
      if (recipe.userId && recipe.userId === currentUser.id) {
        return true;
      }
    }

    const subs = (currentUser && Array.isArray(currentUser.subscriptions)) ? currentUser.subscriptions : ['Community Legends'];

    // Check creator-scoped All-Access
    if (creatorId === 'fitness_product_finder' && (subs.includes('All-Access') || subs.includes('Eli All-Access') || subs.includes('fitness_product_finder:all_access'))) {
      return true;
    }
    if (creatorId === 'test_content' && (subs.includes('TestContent All-Access') || subs.includes('test_content:all_access'))) {
      return true;
    }
    if (subs.includes(creatorId + ':all_access')) {
      return true;
    }

    // Check specific pack subscriptions
    const cats = (recipe.categories && recipe.categories.length > 0)
      ? recipe.categories
      : [recipe.category || 'All-Access'];

    return cats.some(c => {
      if (c === 'Community Legends') return true;
      if (c === 'Base Flavors') {
        return subs.includes('All-Access') || subs.includes('Base Flavors') || subs.includes('Eli All-Access');
      }
      const normC = normalizeCategoryName(c);
      return subs.some(s => {
        const normS = normalizeCategoryName(s);
        return normS === normC || (normS.length > 3 && normC.includes(normS)) || (normC.length > 3 && normS.includes(normC));
      });
    });
  }

  function getCreatorById(creatorId) {
    if (!creatorId) return null;
    const base = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === creatorId) : null;
    const serverProfile = serverCreatorProfiles ? serverCreatorProfiles[creatorId] : null;

    let userOverride = null;
    if (currentUser) {
      const isDirect = (currentUser.role === 'creator' && (currentUser.creatorId === creatorId || (!currentUser.creatorId && creatorId === 'fitness_product_finder')));
      const isMimic = (currentMimicRole === 'creator' && currentMimicCreatorId === creatorId);
      if (isDirect || isMimic) {
        userOverride = currentUser;
      }
    }

    if (!base && !serverProfile && !userOverride) return null;

    const result = Object.assign({}, base || {
      id: creatorId,
      name: 'Creator',
      brandName: 'Creator Brand',
      handle: `@${creatorId}`,
      url: '',
      storeUrl: '',
      socialLinks: {},
      bio: '',
      perks: []
    });

    result.perks = (base && Array.isArray(base.perks)) ? JSON.parse(JSON.stringify(base.perks)) : [];
    result.socialLinks = Object.assign({}, base ? base.socialLinks : {});

    if (serverProfile) {
      if (serverProfile.name) result.name = serverProfile.name;
      if (serverProfile.brandName) result.brandName = serverProfile.brandName;
      if (serverProfile.socialLinks) result.socialLinks = Object.assign({}, result.socialLinks, serverProfile.socialLinks);
      if (Array.isArray(serverProfile.perks) && serverProfile.perks.length > 0) {
        result.perks = JSON.parse(JSON.stringify(serverProfile.perks));
      }
    }

    if (userOverride) {
      if (userOverride.brandName) result.brandName = userOverride.brandName;
      if (userOverride.socialLinks) result.socialLinks = Object.assign({}, result.socialLinks, userOverride.socialLinks);
      if (Array.isArray(userOverride.perks)) {
        result.perks = JSON.parse(JSON.stringify(userOverride.perks));
      }
    }

    return result;
  }

  function getRecipeCreator(recipe) {
    if (!recipe) return null;
    if (
      recipe.category === 'Community Legends' ||
      (recipe.categories && recipe.categories.includes('Community Legends')) ||
      recipe.category === 'Custom' ||
      recipe.isPersonal ||
      recipe.sourceFile === 'Community Legends' ||
      isExactBaseTrio(recipe)
    ) {
      return null;
    }
    const creatorId = recipe.creatorId || 'fitness_product_finder';
    if (isCreatorDisabled(creatorId)) return null;
    return getCreatorById(creatorId);
  }

  function getRecipeBook(recipe) {
    if (!recipe || typeof BOOKS_MASTER === 'undefined') return null;
    if (
      recipe.category === 'Community Legends' ||
      (recipe.categories && recipe.categories.includes('Community Legends')) ||
      recipe.category === 'Custom' ||
      recipe.isPersonal ||
      recipe.sourceFile === 'Community Legends' ||
      isExactBaseTrio(recipe)
    ) {
      return null;
    }
    const creatorId = recipe.creatorId || 'fitness_product_finder';
    if (isCreatorDisabled(creatorId)) return null;
    const sourceFile = recipe.sourceFile || (recipe.sources && recipe.sources[0]?.sourceFile);
    if (sourceFile) {
      const match = BOOKS_MASTER.find(b => b.sourceFile === sourceFile);
      if (match) return match;
    }
    const cats = (recipe.categories && recipe.categories.length > 0) ? recipe.categories : [recipe.category];
    for (const cat of cats) {
      const match = BOOKS_MASTER.find(b => b.categoryKey === cat || b.bookKey === cat);
      if (match) return match;
    }
    if (recipe.creatorId && recipe.creatorId !== 'fitness_product_finder') {
      const creatorBook = BOOKS_MASTER.find(b => b.creatorId === recipe.creatorId);
      if (creatorBook) return creatorBook;
    }
    return BOOKS_MASTER.find(b => b.id === 'fpf_complete_bundle') || null;
  }

  function getCreatorIdForUser(user) {
    if (!user) return null;
    if (user.creatorId) return user.creatorId;
    const email = (user.email || '').toLowerCase();
    const username = (user.username || '').toLowerCase();
    const name = (user.name || '').toLowerCase();

    if (email.includes('fitnessproductfinder') || username === 'eli' || name.includes('eli')) {
      return 'fitness_product_finder';
    }
    if (email.includes('testcontent') || username === 'testcontent' || name.includes('testcontent')) {
      return 'test_content';
    }

    if (typeof CREATORS_MASTER !== 'undefined') {
      const matched = CREATORS_MASTER.find(c => 
        (c.id && (c.id === user.creatorId || email.includes(c.id))) ||
        (c.name && name.includes(c.name.toLowerCase())) ||
        (c.brandName && name.includes(c.brandName.toLowerCase()))
      );
      if (matched) return matched.id;
    }

    if (user.role === 'creator') {
      return 'fitness_product_finder';
    }
    return null;
  }

  function getCategoriesForCreator(creatorId) {
    if (!creatorId || typeof BOOKS_MASTER === 'undefined') return [];
    const books = BOOKS_MASTER.filter(b => b.creatorId === creatorId);
    const cats = new Set();
    books.forEach(b => {
      if (b.categoryKey) cats.add(b.categoryKey);
      if (b.categories && Array.isArray(b.categories)) {
        b.categories.forEach(c => cats.add(c));
      }
    });
    return Array.from(cats);
  }

  function getAllowedRecipeCategoriesForUser(user) {
    // 1. Standard users (or guest): strictly Custom
    if (!user || (user.role !== 'admin' && user.role !== 'creator')) {
      return [
        { value: 'Custom', label: 'Custom Recipe (Personal)' }
      ];
    }

    // 2. Admin: platform manager (Custom or Community Legends)
    if (user.role === 'admin') {
      return [
        { value: 'Custom', label: 'Custom Recipe (Personal)' },
        { value: 'Community Legends', label: 'Community Legends (Universal Free)' }
      ];
    }

    // 3. Content Creator: can choose any of THEIR categories, but only those categories (+ Custom for personal recipes)
    if (user.role === 'creator') {
      const creatorId = getCreatorIdForUser(user);
      const creatorObj = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === creatorId) : null;
      const creatorName = creatorObj ? creatorObj.name : 'Creator';

      const options = [
        { value: 'Custom', label: 'Custom Recipe (Personal)' }
      ];

      const creatorCats = getCategoriesForCreator(creatorId);
      creatorCats.forEach(cat => {
        options.push({
          value: cat,
          label: `${cat} (${creatorName}'s Book)`
        });
      });

      return options;
    }

    return [{ value: 'Custom', label: 'Custom Recipe (Personal)' }];
  }

  function updateRecipeCategorySelectors() {
    const crCatEl = document.getElementById('crCategory');
    const crHintEl = document.getElementById('crCategoryHint');
    const bapCatEl = document.getElementById('bapCategory');
    const bapHintEl = document.getElementById('bapCategoryHint');

    const options = getAllowedRecipeCategoriesForUser(currentUser);
    const isAdmin = Boolean(currentUser && currentUser.role === 'admin');
    const isCreator = Boolean(currentUser && currentUser.role === 'creator');
    const isStandard = !isAdmin && !isCreator;

    const buildOptionsHtml = () => {
      return options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
    };

    let hintText = '';
    let hintClass = 'standard-hint';

    if (isAdmin) {
      hintText = '👑 Admin Access: You can create personal Custom recipes or publish to platform Community Legends. Official cookbooks belong strictly to content creators.';
      hintClass = 'admin-hint';
    } else if (isCreator) {
      const creatorId = getCreatorIdForUser(currentUser);
      const creatorObj = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === creatorId) : null;
      const cName = creatorObj ? creatorObj.name : 'Creator';
      hintText = `🧑‍🍳 Creator Access: You can publish to any of ${cName}'s official cookbooks or personal Custom.`;
      hintClass = 'creator-hint';
    } else {
      hintText = '🔒 Standard users can only create personal Custom recipes. Official cookbook publishing is reserved for Content Creators.';
      hintClass = 'standard-hint';
    }

    [crCatEl, bapCatEl].forEach(sel => {
      if (sel) {
        const currentVal = sel.value;
        sel.innerHTML = buildOptionsHtml();
        if (options.some(o => o.value === currentVal)) {
          sel.value = currentVal;
        } else {
          sel.value = options[0].value;
        }
        sel.disabled = isStandard;
      }
    });

    [crHintEl, bapHintEl].forEach(hint => {
      if (hint) {
        hint.textContent = hintText;
        hint.className = (hint.id === 'crCategoryHint' ? 'form-hint ' : 'bap-category-hint ') + hintClass;
      }
    });
  }

  function validateAndResolveRecipeCategory(chosenCategory) {
    const isAdmin = Boolean(currentUser && currentUser.role === 'admin');
    const isCreator = Boolean(currentUser && currentUser.role === 'creator');

    let finalCategory = 'Custom';
    let creatorId = null;

    if (isAdmin) {
      finalCategory = (chosenCategory === 'Community Legends') ? 'Community Legends' : 'Custom';
      creatorId = null;
    } else if (isCreator) {
      const cId = getCreatorIdForUser(currentUser);
      const allowedCats = getCategoriesForCreator(cId);
      if (allowedCats.includes(chosenCategory)) {
        finalCategory = chosenCategory;
        creatorId = cId;
      } else {
        finalCategory = 'Custom';
      }
    } else {
      // Standard user strictly forced to Custom
      finalCategory = 'Custom';
    }

    return { finalCategory, creatorId };
  }

  // --- Modal Scroll & Overscroll Containment Helpers ---
  let isScrollLocked = false;

  function lockBackgroundScroll() {
    if (isScrollLocked) return;
    isScrollLocked = true;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
  }

  function unlockBackgroundScroll() {
    requestAnimationFrame(() => {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      if (activeModals.length > 0) return;
      if (!isScrollLocked) return;
      isScrollLocked = false;
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    });
  }

  function setupModalScrollLock(overlay) {
    if (!overlay) return;

    // Prevent background scrolling via wheel outside modal
    overlay.addEventListener('wheel', (e) => {
      if (!overlay.classList.contains('active')) return;

      const content = overlay.querySelector('.modal-content');
      // If wheel event occurs directly on the backdrop or outside modal content
      if (!content || !content.contains(e.target) || e.target === overlay) {
        e.preventDefault();
      }
    }, { passive: false });

    // Prevent touch-drag background scrolling on mobile when dragging backdrop
    overlay.addEventListener('touchmove', (e) => {
      if (!overlay.classList.contains('active')) return;

      const content = overlay.querySelector('.modal-content');
      // Only prevent default if touch is directly on the backdrop outside the modal
      if (!content || !content.contains(e.target) || e.target === overlay) {
        e.preventDefault();
      }
    }, { passive: false });
  }


  function openGoogleAuthModal(initialTab = 'signin') {
    const modal = document.getElementById('googleAuthModalOverlay');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
      initGoogleAuth();
      switchAuthTab(initialTab);
    }
  }

  function closeGoogleAuthModal() {
    const modal = document.getElementById('googleAuthModalOverlay');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      unlockBackgroundScroll();
    }
  }

  function bindAuthEvents() {
    const signInBtn = document.getElementById('headerSignInBtn');
    if (signInBtn) {
      signInBtn.addEventListener('click', () => openGoogleAuthModal('signin'));
    }

    const signOutBtn = document.getElementById('headerSignOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', logoutUser);
    }

    const closeBtn = document.getElementById('authModalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeGoogleAuthModal);
    }

    const modalOverlay = document.getElementById('googleAuthModalOverlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeGoogleAuthModal();
      });
    }

    // Mode Tabs: Sign In vs Create Account vs Magic Link
    const tabSignIn = document.getElementById('tabAuthSignIn');
    if (tabSignIn) {
      tabSignIn.addEventListener('click', () => switchAuthTab('signin'));
    }
    const tabRegister = document.getElementById('tabAuthRegister');
    if (tabRegister) {
      tabRegister.addEventListener('click', () => switchAuthTab('register'));
    }
    const tabMagic = document.getElementById('tabAuthMagic');
    if (tabMagic) {
      tabMagic.addEventListener('click', () => switchAuthTab('magic'));
    }

    // Mode Switch Links inside form footers
    const linkSwitchRegister = document.getElementById('linkSwitchToRegister');
    if (linkSwitchRegister) {
      linkSwitchRegister.addEventListener('click', () => switchAuthTab('register'));
    }
    const linkSwitchSignIn = document.getElementById('linkSwitchToSignIn');
    if (linkSwitchSignIn) {
      linkSwitchSignIn.addEventListener('click', () => switchAuthTab('signin'));
    }
    const linkSwitchMagic = document.getElementById('linkSwitchToMagic');
    if (linkSwitchMagic) {
      linkSwitchMagic.addEventListener('click', () => switchAuthTab('magic'));
    }
    const linkMagicPassword = document.getElementById('linkMagicToPassword');
    if (linkMagicPassword) {
      linkMagicPassword.addEventListener('click', () => switchAuthTab('signin'));
    }

    // Passwordless Magic Link Form
    const magicForm = document.getElementById('magicAuthForm');
    if (magicForm) {
      magicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('authMagicEmail');
        const emailVal = emailInput ? emailInput.value.trim() : '';
        if (emailVal) {
          handleRequestMagicLink(emailVal);
        } else {
          showAuthError('Please enter your email address.');
        }
      });
    }

    // Password Sign-In Form
    const passwordForm = document.getElementById('passwordAuthForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInput = document.getElementById('authLoginUsername');
        const passInput = document.getElementById('authLoginPassword');
        const userVal = userInput ? userInput.value : '';
        const passVal = passInput ? passInput.value : '';
        if (userVal && passVal) {
          handlePasswordLogin(userVal, passVal);
        } else {
          showAuthError('Please enter both email/username and password.');
        }
      });
    }

    // Email & Password Registration Form
    const registerForm = document.getElementById('registerAuthForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('authRegisterEmail');
        const nameInput = document.getElementById('authRegisterName');
        const passInput = document.getElementById('authRegisterPassword');
        const emailVal = emailInput ? emailInput.value : '';
        const nameVal = nameInput ? nameInput.value : '';
        const passVal = passInput ? passInput.value : '';
        if (emailVal && passVal) {
          handleEmailRegister(emailVal, passVal, nameVal);
        } else {
          showAuthError('Please enter email and password.');
        }
      });
    }

    // Forgot Password link & Reset Form Listeners
    const btnForgotPass = document.getElementById('btnForgotPassLink');
    if (btnForgotPass) {
      btnForgotPass.addEventListener('click', () => switchAuthTab('reset'));
    }

    const linkBackSignIn = document.getElementById('linkBackToSignIn');
    if (linkBackSignIn) {
      linkBackSignIn.addEventListener('click', () => switchAuthTab('signin'));
    }

    const btnSendReset = document.getElementById('btnSendResetCode');
    if (btnSendReset) {
      btnSendReset.addEventListener('click', () => {
        const emailInput = document.getElementById('authResetEmail');
        handleRequestResetCode(emailInput ? emailInput.value : '');
      });
    }

    const resetForm = document.getElementById('resetAuthForm');
    if (resetForm) {
      resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const stepVer = document.getElementById('resetStepVerify');
        if (stepVer && stepVer.style.display !== 'none') {
          const email = (document.getElementById('authResetEmail')?.value || '').trim();
          const code = (document.getElementById('authResetCode')?.value || '').trim();
          const newPass = (document.getElementById('authResetNewPassword')?.value || '').trim();
          const confPass = (document.getElementById('authResetConfirmPassword')?.value || '').trim();
          handleSubmitResetPassword(email, code, newPass, confPass);
        } else {
          const emailInput = document.getElementById('authResetEmail');
          handleRequestResetCode(emailInput ? emailInput.value : '');
        }
      });
    }

    const linkChangeEmail = document.getElementById('linkChangeResetEmail');
    if (linkChangeEmail) {
      linkChangeEmail.addEventListener('click', () => {
        const stepReq = document.getElementById('resetStepRequest');
        const stepVer = document.getElementById('resetStepVerify');
        clearAuthError();
        if (stepVer) stepVer.style.display = 'none';
        if (stepReq) {
          stepReq.style.display = 'block';
          const emailInput = document.getElementById('authResetEmail');
          if (emailInput) setTimeout(() => emailInput.focus(), 60);
        }
      });
    }

    const linkResend = document.getElementById('linkResendResetCode');
    if (linkResend) {
      linkResend.addEventListener('click', () => {
        const emailInput = document.getElementById('authResetEmail');
        handleRequestResetCode(emailInput ? emailInput.value : '');
      });
    }

    // Collapsible Quick Google Fallback
    const toggleQuickGoogle = document.getElementById('btnToggleQuickGoogle');
    const quickForm = document.getElementById('quickGoogleAuthForm');
    if (toggleQuickGoogle && quickForm) {
      toggleQuickGoogle.addEventListener('click', () => {
        const isHidden = quickForm.style.display === 'none' || !quickForm.style.display;
        quickForm.style.display = isHidden ? 'block' : 'none';
        toggleQuickGoogle.textContent = isHidden 
          ? 'Having trouble with the Google button? Quick Gmail connect ▴'
          : 'Having trouble with the Google button? Quick Gmail connect ▾';
      });
    }

    if (quickForm) {
      quickForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('googleAuthEmail');
        const nameInput = document.getElementById('googleAuthName');
        const email = emailInput ? emailInput.value : '';
        const name = nameInput ? nameInput.value : '';
        if (email) {
          handleManualGoogleAuth(email, name);
        }
      });
    }

    // Super Admin Role Mimicry Event Listeners (ahumpo7@gmail.com)
    const mimicPill = document.getElementById('mimicRoleTriggerPill');
    if (mimicPill) {
      mimicPill.addEventListener('click', openMimicModal);
    }

    const btnMimicBannerChange = document.getElementById('btnMimicChangeRoleBanner');
    if (btnMimicBannerChange) {
      btnMimicBannerChange.addEventListener('click', openMimicModal);
    }

    const btnMimicBannerRevert = document.getElementById('btnMimicRevertAdminBanner');
    if (btnMimicBannerRevert) {
      btnMimicBannerRevert.addEventListener('click', () => applyMimicRole('admin'));
    }

    const btnMimicDirectRevert = document.getElementById('btnMimicRevertDirect');
    if (btnMimicDirectRevert) {
      btnMimicDirectRevert.addEventListener('click', () => {
        applyMimicRole('admin');
        closeMimicModal();
      });
    }

    const mimicModalClose = document.getElementById('mimicModalCloseBtn');
    if (mimicModalClose) {
      mimicModalClose.addEventListener('click', closeMimicModal);
    }

    const mimicModalOverlay = document.getElementById('mimicRoleModalOverlay');
    if (mimicModalOverlay) {
      mimicModalOverlay.addEventListener('click', (e) => {
        if (e.target === mimicModalOverlay) closeMimicModal();
      });
    }

    document.querySelectorAll('.mimic-role-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        const creatorId = btn.dataset.creatorId || null;
        if (role) {
          applyMimicRole(role, true, creatorId);
          closeMimicModal();
        }
      });
    });

    document.querySelectorAll('.btn-mimic-select').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        const creatorId = btn.dataset.creatorId || null;
        if (role) {
          applyMimicRole(role, true, creatorId);
          if (typeof closeAdminPortal === 'function') closeAdminPortal();
        }
      });
    });

    // E-Book Claim & Verification Modal Events (Roadmap Item 15)
    const claimModalCloseBtn = document.getElementById('claimModalCloseBtn');
    if (claimModalCloseBtn) {
      claimModalCloseBtn.addEventListener('click', closeClaimAccessModal);
    }
    const btnCancelClaimModal = document.getElementById('btnCancelClaimModal');
    if (btnCancelClaimModal) {
      btnCancelClaimModal.addEventListener('click', closeClaimAccessModal);
    }
    const btnCloseClaimSuccessModal = document.getElementById('btnCloseClaimSuccessModal');
    if (btnCloseClaimSuccessModal) {
      btnCloseClaimSuccessModal.addEventListener('click', closeClaimAccessModal);
    }
    const claimAccessModalOverlay = document.getElementById('claimAccessModalOverlay');
    if (claimAccessModalOverlay) {
      claimAccessModalOverlay.addEventListener('click', (e) => {
        if (e.target === claimAccessModalOverlay) closeClaimAccessModal();
      });
    }
    const claimAccessForm = document.getElementById('claimAccessForm');
    if (claimAccessForm) {
      claimAccessForm.addEventListener('submit', handleClaimAccessSubmit);
    }
  }

  // --- Recipe Batch Counter API & Helper ---
  async function logRecipeBatch(recipeId, delta, skipPantryDeduction = false) {
    const currentCount = recipeMadeCounts[recipeId] || 0;
    const newCount = Math.max(0, currentCount + delta);
    recipeMadeCounts[recipeId] = newCount;
    saveRecipeMadeCounts();

    // Immediately update modal counter and recipe listing UI
    updateModalBatchDisplay(recipeId);
    renderRecipes();
    evaluateBadges(delta > 0);

    if (delta > 0) {
      playAudioSuccess();
      triggerHaptic(25);
      trackAnalyticsEvent('spin_recipe', {
        recipe_id: recipeId,
        new_batch_count: newCount
      });
      showToast(`🍨 Batch logged! You have spun this ${newCount} time${newCount === 1 ? '' : 's'}.`);

      if (!skipPantryDeduction) {
        const currentScale = (typeof currentModalRecipe !== 'undefined' && currentModalRecipe && currentModalRecipe.id === recipeId && typeof modalScale === 'number') ? modalScale : 1.0;
        const deducted = deductSingleUseIngredients(recipeId, currentScale);
        if (deducted && deducted.length > 0) {
          setTimeout(() => notifyPantryDeduction(deducted), 800);
        }
      }
    } else {
      showToast(`Batch counter updated (${newCount}).`);
    }

    // Optimistic community update
    const currentComm = communityStats.madeCounts[recipeId] || 0;
    communityStats.madeCounts[recipeId] = Math.max(0, currentComm + delta);
    communityStats.totalBatches = Math.max(0, (communityStats.totalBatches || 0) + delta);
    saveCommunityStats();
    updateModalBatchDisplay(recipeId);

    // Persist to backend server
    try {
      const res = await fetch('/api/recipe/made', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          delta,
          userToken: currentUser?.token || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok' || data.success) {
          if (data.communityMade !== undefined || data.communityTotalMade !== undefined) {
            communityStats.madeCounts[recipeId] = data.communityMade ?? data.communityTotalMade;
          }
          if (data.totalBatches !== undefined || data.totalCommunityBatches !== undefined) {
            communityStats.totalBatches = data.totalBatches ?? data.totalCommunityBatches;
          }
          // Only overwrite personal userMade if a signed-in user session exists and server returned a value
          if (currentUser && (data.userMade !== undefined || data.userMadeCount !== undefined)) {
            recipeMadeCounts[recipeId] = data.userMade ?? data.userMadeCount;
          }
          saveRecipeMadeCounts();
          saveCommunityStats();
          updateModalBatchDisplay(recipeId);
        }
      }
    } catch (err) {
      console.warn('Batch logging sync warning:', err);
    }

    triggerCloudSync();
  }

  function updateModalBatchDisplay(recipeId) {
    const userCountEl = document.getElementById('modalUserBatchCount');
    const userUnitEl = document.querySelector('.batch-times-label');
    const commValEl = document.getElementById('modalCommunityBatchesVal');
    const minusBtn = document.getElementById('btnBatchMinus');

    const uCount = recipeMadeCounts[recipeId] || 0;
    const cCount = communityStats.madeCounts[recipeId] || 0;

    if (userCountEl) userCountEl.textContent = uCount;
    if (userUnitEl) userUnitEl.textContent = uCount === 1 ? 'time' : 'times';
    if (commValEl) commValEl.textContent = cCount;
    if (minusBtn) minusBtn.disabled = (uCount === 0);
  }

  // --- Overall Recipe Rating API & Helper ---
  async function submitRecipeRating(recipeId, rating, notes = '') {
    if (!userRecipeData[recipeId]) {
      userRecipeData[recipeId] = { rating: 0, notes: '' };
    }
    userRecipeData[recipeId].rating = rating;
    if (notes !== undefined && notes !== null) {
      userRecipeData[recipeId].notes = notes;
    }
    saveUserRecipeData();
    trackAnalyticsEvent('rate_recipe', {
      recipe_id: recipeId,
      rating: rating
    });

    try {
      const res = await fetch('/api/user/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          rating,
          notes,
          userToken: currentUser?.token || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok' || data.success) {
          communityStats.ratings[recipeId] = {
            avg: data.avg ?? data.communityAverage,
            count: data.count ?? data.communityCount,
            distribution: data.distribution
          };
          saveCommunityStats();
          updateModalRatingDisplay(recipeId);
        }
      }
    } catch (err) {
      console.warn('Rating sync warning:', err);
    }

    showToast(`⭐ Rated ${rating} star${rating > 1 ? 's' : ''}! Saved to your account.`);
    renderRecipes();
    triggerCloudSync();
  }

  function updateModalRatingDisplay(recipeId) {
    const rInfo = communityStats.ratings[recipeId];
    const overallScoreBadge = document.getElementById('modalOverallScoreBadge');
    const bigScore = document.getElementById('modalCommBigScore');
    const totalReviews = document.getElementById('modalCommTotalReviews');

    if (rInfo && rInfo.count > 0) {
      if (overallScoreBadge) {
        overallScoreBadge.textContent = `★ ${rInfo.avg.toFixed(1)} / 5.0`;
        overallScoreBadge.style.color = '#fbbf24';
        overallScoreBadge.style.background = 'rgba(251, 191, 36, 0.12)';
        overallScoreBadge.style.border = '1px solid rgba(251, 191, 36, 0.35)';
      }
      if (bigScore) bigScore.textContent = rInfo.avg.toFixed(1);
      if (totalReviews) totalReviews.textContent = `${rInfo.count} rating${rInfo.count === 1 ? '' : 's'}`;
    } else {
      if (overallScoreBadge) {
        overallScoreBadge.textContent = 'No reviews yet';
        overallScoreBadge.style.color = 'var(--text-dim)';
        overallScoreBadge.style.background = 'var(--bg-glass)';
        overallScoreBadge.style.border = '1px solid var(--border-item)';
      }
      if (bigScore) bigScore.textContent = '—';
      if (totalReviews) totalReviews.textContent = '0 ratings';
    }
  }

  function hashString(str) {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  function mergeRecipes() {
    const baseRecipes = (typeof RECIPES_MASTER !== 'undefined') ? RECIPES_MASTER : [];
    const myRecipes = customRecipesState || [];
    const otherPublished = (serverPublishedRecipes || []).filter(pr => !myRecipes.some(mr => mr.id === pr.id));

    // Exclude recipes belonging to creators who have been turned off
    const activeBase = baseRecipes.filter(r => !isRecipeCreatorDisabled(r));
    const activePublished = otherPublished.filter(r => !isRecipeCreatorDisabled(r));

    allRecipes = [...activeBase, ...activePublished, ...myRecipes];
    migrateOldRecipeKeys();
  }

  function migrateOldRecipeKeys() {
    if (!allRecipes || allRecipes.length === 0) return;
    const aliasToId = {};
    allRecipes.forEach(r => {
      if (r.aliases && Array.isArray(r.aliases)) {
        r.aliases.forEach(alias => {
          aliasToId[alias] = r.id;
        });
      }
    });

    let favChanged = false;
    const newFavs = new Set();
    favoritesState.forEach(id => {
      const canonical = aliasToId[id] || id;
      newFavs.add(canonical);
      if (canonical !== id) favChanged = true;
    });
    if (favChanged) {
      favoritesState = newFavs;
      saveFavorites();
    }

    let userChanged = false;
    Object.keys(userRecipeData).forEach(id => {
      const canonical = aliasToId[id];
      if (canonical && canonical !== id) {
        if (!userRecipeData[canonical]) {
          userRecipeData[canonical] = userRecipeData[id];
        }
        delete userRecipeData[id];
        userChanged = true;
      }
    });
    if (userChanged) {
      saveUserRecipeData();
    }

    // Migrate legacy pantry ingredient keys (e.g. cinnamon_cereal -> cinnamon_toast_crunch)
    if (pantryState && pantryState.has('cinnamon_cereal')) {
      pantryState.delete('cinnamon_cereal');
      pantryState.add('cinnamon_toast_crunch');
      savePantry();
    }
  }

  // --- Dynamic User-Accessible Ingredients Engine ---
  function getUserPantryIngredients() {
    if (typeof INGREDIENTS_MASTER === 'undefined' || !Array.isArray(INGREDIENTS_MASTER)) return [];

    // 1. Identify all accessible recipes for this user session
    const accessibleRecipes = (typeof allRecipes !== 'undefined' && Array.isArray(allRecipes))
      ? allRecipes.filter(r => isRecipeAccessible(r))
      : [];

    // 2. Collect all ingredient IDs and sanitized names required by accessible recipes
    const requiredIngIds = new Set();
    const requiredCleanNames = new Set();

    accessibleRecipes.forEach(recipe => {
      (recipe.ingredients || []).forEach(ing => {
        if (ing.id) requiredIngIds.add(ing.id);
        if (ing.name) requiredCleanNames.add(sanitizeShoppingItemName(ing.name).toLowerCase());
      });
    });

    // 3. Expand with equivalents ONLY if the user already has that equivalent in their pantry,
    // so we don't display redundant duplicate items that no accessible recipe actually needs
    const expandedRequiredIds = new Set(requiredIngIds);
    if (typeof INGREDIENT_EQUIVALENTS !== 'undefined') {
      Object.entries(INGREDIENT_EQUIVALENTS).forEach(([key, list]) => {
        if (requiredIngIds.has(key)) {
          list.forEach(eq => {
            if (pantryState && pantryState.has(eq)) {
              expandedRequiredIds.add(eq);
            }
          });
        }
      });
    }

    // 4. Filter INGREDIENTS_MASTER: only include items needed by accessible recipes
    const visibleMaster = INGREDIENTS_MASTER.filter(item => {
      if (expandedRequiredIds.has(item.id)) return true;
      if (requiredCleanNames.has(item.name.toLowerCase())) return true;
      return false;
    });

    // 5. Add custom ingredients from this user's personal custom recipes
    const customExtra = [];
    const masterIdSet = new Set(visibleMaster.map(i => i.id));
    const masterNameSet = new Set(visibleMaster.map(i => i.name.toLowerCase()));
    const masterNormSet = new Set(visibleMaster.map(i => normalizeIngName(i.name)));
    const masterColSet = new Set(visibleMaster.map(i => collapseName(i.name)));

    if (Array.isArray(customRecipesState)) {
      customRecipesState.forEach(recipe => {
        (recipe.ingredients || []).forEach(ing => {
          const cleanName = sanitizeShoppingItemName(ing.name);
          const slugId = ing.id || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
          const norm = normalizeIngName(cleanName);
          const col = collapseName(cleanName);

          // Skip if already represented in master
          if (masterIdSet.has(slugId) || masterNameSet.has(cleanName.toLowerCase()) ||
              (norm && masterNormSet.has(norm)) || (col && masterColSet.has(col))) {
            return;
          }

          // Skip if already in customExtra
          const alreadyAdded = customExtra.some(c => 
            c.id === slugId || 
            c.name.toLowerCase() === cleanName.toLowerCase() ||
            (norm && normalizeIngName(c.name) === norm) ||
            (col && collapseName(c.name) === col)
          );

          if (!alreadyAdded) {
            customExtra.push({
              id: slugId,
              name: ing.name,
              category: ing.category || getIngredientCategoryKey(cleanName),
              isCustom: true
            });
          }
        });
      });
    }

    const combined = [...visibleMaster, ...customExtra];
    combined.sort((a, b) => a.name.localeCompare(b.name));
    return combined;
  }

  // --- Intelligent Ingredient Matcher & Deduplicator ---
  function findExistingPantryIngredient(rawName, stepHint) {
    if (!rawName || typeof rawName !== 'string') return null;
    const clean = sanitizeShoppingItemName(rawName).trim();
    if (!clean) return null;
    const normInput = normalizeIngName(clean);
    const colInput = collapseName(clean);
    const inputSlug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
    if (!normInput && !inputSlug) return null;

    const candidates = [];
    const seenKeys = new Set();

    function addCandidate(cand, origin) {
      if (!cand || !cand.id) return;
      const key = `${cand.id}_${cand.bapStep || ''}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      candidates.push({
        id: cand.id,
        name: cand.name || cand.id,
        category: cand.category || getIngredientCategoryKey(cand.name || cand.id, cand.bapStep || stepHint),
        origin: origin,
        bapStep: cand.bapStep || null,
        bapItem: cand.bapItem || null,
        isCustom: !!cand.isCustom,
        rawObj: cand
      });
    }

    // 1. Current user active pantry items
    try {
      const pantryItems = getUserPantryIngredients();
      if (Array.isArray(pantryItems)) {
        pantryItems.forEach(it => addCandidate(it, 'pantry'));
      }
    } catch (e) {}

    // 2. BAP presets
    if (typeof BAP_DATA !== 'undefined' && BAP_DATA) {
      (BAP_DATA.liquids || []).forEach(l => addCandidate({ ...l, bapStep: 'liquid', bapItem: l, category: 'dairy_liquids' }, 'bap'));
      (BAP_DATA.powders || []).forEach(p => addCandidate({ ...p, bapStep: 'powder', bapItem: p, category: p.category || 'protein_powders' }, 'bap'));
      (BAP_DATA.stabilizers || []).forEach(s => addCandidate({ ...s, bapStep: 'stabilizer', bapItem: s, category: s.category || 'sweeteners_binders' }, 'bap'));
      (BAP_DATA.sweeteners || []).forEach(sw => addCandidate({ ...sw, bapStep: 'sweetener', bapItem: sw, category: sw.category || 'sweeteners_binders' }, 'bap'));
      (BAP_DATA.mixins || []).forEach(m => addCandidate({ ...m, bapStep: 'mixin', bapItem: m, category: m.category || 'mixins_snacks' }, 'bap'));
    }

    // 3. Master ingredients
    if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
      INGREDIENTS_MASTER.forEach(m => addCandidate(m, 'master'));
    }

    // 4. Custom recipes state
    if (Array.isArray(customRecipesState)) {
      customRecipesState.forEach(recipe => {
        (recipe.ingredients || []).forEach(ing => {
          addCandidate({
            id: ing.id,
            name: ing.name,
            category: ing.category,
            isCustom: true
          }, 'custom_recipe');
        });
      });
    }

    function scoreCandidate(cand) {
      const normCand = normalizeIngName(cand.name);
      const colCand = collapseName(cand.name);
      const candSlug = (cand.id || '').toLowerCase();
      let score = 0;

      // Direct ID match
      if (candSlug === inputSlug) {
        score += 1000;
      } else if (typeof INGREDIENT_EQUIVALENTS !== 'undefined') {
        const eqList = INGREDIENT_EQUIVALENTS[inputSlug] || [];
        if (eqList.includes(candSlug)) {
          score += 900;
        }
        const candEqList = INGREDIENT_EQUIVALENTS[candSlug] || [];
        if (candEqList.includes(inputSlug)) {
          score += 900;
        }
      }

      // Exact normalized name match
      if (normCand === normInput) {
        score += 800;
      }

      // Exact collapsed name match (e.g. "dragon fruit" vs "dragonfruit")
      if (colCand && colInput && colCand === colInput) {
        score += 750;
      }

      // Singular / Plural match
      if (normCand === normInput + 's' || normInput === normCand + 's' ||
          normCand === normInput + 'es' || normInput === normCand + 'es' ||
          colCand === colInput + 's' || colInput === colCand + 's') {
        score += 650;
      }

      // Meaningful token containment (excluding generic stop words)
      const inputTokens = normInput.split(' ').filter(w => w.length >= 3 && !MATCH_STOP_WORDS.has(w));
      const candTokens = normCand.split(' ').filter(w => w.length >= 3 && !MATCH_STOP_WORDS.has(w));

      if (inputTokens.length > 0 && candTokens.length > 0) {
        const allInputInCand = inputTokens.every(t => candTokens.some(ct => ct === t || ct.startsWith(t) || t.startsWith(ct)));
        const allCandInInput = candTokens.every(t => inputTokens.some(it => it === t || it.startsWith(t) || t.startsWith(it)));

        if (allInputInCand && allCandInInput) {
          score += 600;
        } else if (allInputInCand) {
          score += 450 + Math.round((inputTokens.length / candTokens.length) * 100);
        } else if (allCandInInput) {
          score += 400 + Math.round((candTokens.length / inputTokens.length) * 100);
        } else {
          const matchedTokens = inputTokens.filter(t => candTokens.some(ct => ct === t));
          if (matchedTokens.length >= 2 || (matchedTokens.length === 1 && inputTokens.length === 1 && candTokens.length === 1)) {
            score += 300 + matchedTokens.length * 50;
          }
        }
      }

      // Only apply contextual and pantry bonuses if there is an actual base match
      if (score > 0) {
        if (stepHint) {
          if (cand.bapStep === stepHint) {
            score += 250;
          }
          if (stepHint === 'liquid' && cand.category === 'dairy_liquids') score += 150;
          if (stepHint === 'powder' && cand.category === 'protein_powders') score += 150;
          if (stepHint === 'stabilizer' && cand.category === 'sweeteners_binders') score += 150;
          if (stepHint === 'sweetener' && (cand.category === 'sweeteners_binders' || cand.category === 'syrups_sauces')) score += 150;
          if (stepHint === 'mixin' && cand.category === 'mixins_snacks') score += 150;
        }

        if (pantryState && (pantryState.has(cand.id) || (typeof isItemInPantry === 'function' && isItemInPantry(cand)))) {
          score += 50;
        }

        if (cand.origin === 'pantry') {
          score += 30;
        }
      }

      return score;
    }

    let best = null;
    let highestScore = 0;

    for (const c of candidates) {
      const s = scoreCandidate(c);
      if (s > highestScore) {
        highestScore = s;
        best = c;
      }
    }

    if (best && highestScore >= 400) {
      const catTitle = (typeof INGREDIENT_CATEGORIES !== 'undefined' && INGREDIENT_CATEGORIES[best.category]) 
        ? INGREDIENT_CATEGORIES[best.category] 
        : 'Pantry';
      return {
        matched: true,
        id: best.id,
        name: best.name,
        category: best.category,
        catTitle: catTitle,
        origin: best.origin,
        bapStep: best.bapStep,
        bapItem: best.bapItem,
        isCustom: best.isCustom,
        score: highestScore,
        inPantry: pantryState ? (pantryState.has(best.id) || (typeof isItemInPantry === 'function' && isItemInPantry(best.rawObj || best))) : false
      };
    }

    return null;
  }

  function calculateIngredientUsage() {
    ingredientRecipeCount = {};
    const accessible = (typeof allRecipes !== 'undefined' && Array.isArray(allRecipes))
      ? allRecipes.filter(r => isRecipeAccessible(r))
      : [];
    accessible.forEach(recipe => {
      const seen = new Set();
      (recipe.ingredients || []).forEach(ing => {
        if (ing.id && !seen.has(ing.id)) {
          seen.add(ing.id);
          ingredientRecipeCount[ing.id] = (ingredientRecipeCount[ing.id] || 0) + 1;
        }
      });
    });
  }

  // --- Single-Use Pantry Quantities & Helpers ---
  function isSingleUseItem(itemOrId) {
    if (!itemOrId) return false;
    let id = '';
    let name = '';
    let cat = '';

    if (typeof itemOrId === 'string') {
      id = itemOrId;
      const found = (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER))
        ? INGREDIENTS_MASTER.find(m => m.id === id)
        : null;
      if (found) {
        name = found.name;
        cat = found.category || '';
      } else {
        name = id.replace(/_/g, ' ');
      }
    } else if (typeof itemOrId === 'object') {
      id = itemOrId.id || '';
      name = itemOrId.name || '';
      cat = itemOrId.category || '';
    }

    const cleanId = id.toLowerCase();
    const cleanName = name.toLowerCase();

    // If a custom quantity has been manually set, treat it as countable
    if (pantryItemQuantities && typeof pantryItemQuantities[id] === 'number') {
      return true;
    }

    // Exclude continuous bulk liquids, powders, flavorings, emulsions, spices
    if (/\b(powder|flavor|flavoring|extract|emulsion|milk|creamer|syrup|butter|spread|seasoning|spice)\b/i.test(cleanName)) {
      if (!cleanName.includes('shake')) return false;
    }

    // Single-use keywords
    if (/\b(shake|shakes|protein shake|cookie|cookies|biscuit|biscuits|wafer|wafers|oreo|oreos|brownie|brownies|blondie|blondies|pastry|pastries|muffin|muffins|bites|dough|cups|pie|pop-tart)\b/i.test(cleanName)) {
      return true;
    }
    if (/\bbar\b/i.test(cleanName) && !cleanName.includes('bark')) return true;
    if (/\b(can|soda|tea bags|mini muffins|snack pack)\b/i.test(cleanName)) return true;
    if (cleanId.includes('protein_shake') || cleanId.includes('prime_bites') || cleanId.includes('legendary_foods')) return true;

    return false;
  }

  function getPantryItemQuantity(itemId, itemName = '') {
    if (itemId && pantryItemQuantities && typeof pantryItemQuantities[itemId] === 'number') {
      return pantryItemQuantities[itemId];
    }
    if (itemId && INGREDIENT_EQUIVALENTS && INGREDIENT_EQUIVALENTS[itemId]) {
      for (const eqId of INGREDIENT_EQUIVALENTS[itemId]) {
        if (pantryItemQuantities && typeof pantryItemQuantities[eqId] === 'number') {
          return pantryItemQuantities[eqId];
        }
      }
    }
    if (itemName) {
      const clean = sanitizeShoppingItemName(itemName);
      const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      if (slug && pantryItemQuantities && typeof pantryItemQuantities[slug] === 'number') {
        return pantryItemQuantities[slug];
      }
      if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
        const masterMatch = INGREDIENTS_MASTER.find(m => 
          m.id === slug || m.name.toLowerCase() === clean.toLowerCase()
        );
        if (masterMatch && pantryItemQuantities && typeof pantryItemQuantities[masterMatch.id] === 'number') {
          return pantryItemQuantities[masterMatch.id];
        }
      }
    }
    // If in pantry without count, consider unlimited
    if (isItemInPantry(itemId || itemName)) {
      return Infinity;
    }
    return 0;
  }

  function getPantryItemDisplayName(id) {
    if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
      const found = INGREDIENTS_MASTER.find(m => m.id === id);
      if (found) return found.name;
    }
    return id ? id.replace(/_/g, ' ') : 'Item';
  }

  function incrementPantryQuantity(id) {
    if (!pantryState.has(id)) pantryState.add(id);
    const cur = (typeof pantryItemQuantities[id] === 'number' && pantryItemQuantities[id] > 0)
      ? pantryItemQuantities[id]
      : 1;
    pantryItemQuantities[id] = cur + 1;
    savePantry();
    updatePantryCheckboxVisuals();
    renderRecipes();
    showToast(`${getPantryItemDisplayName(id)}: x${pantryItemQuantities[id]} in pantry`);
  }

  function decrementPantryQuantity(id) {
    const cur = (typeof pantryItemQuantities[id] === 'number') ? pantryItemQuantities[id] : 1;
    if (cur > 1) {
      pantryItemQuantities[id] = cur - 1;
      savePantry();
      updatePantryCheckboxVisuals();
      renderRecipes();
      showToast(`${getPantryItemDisplayName(id)}: x${pantryItemQuantities[id]} in pantry`);
    } else {
      pantryState.delete(id);
      delete pantryItemQuantities[id];
      savePantry();
      updatePantryCheckboxVisuals();
      renderRecipes();
      showToast(`Removed ${getPantryItemDisplayName(id)} from pantry`);
    }
  }

  let activePantryQtyId = null;

  function openPantryQuantityModal(id) {
    activePantryQtyId = id;
    const modal = document.getElementById('pantryQtyModalOverlay');
    const title = document.getElementById('pantryQtyModalTitle');
    const input = document.getElementById('pantryQtyModalInput');
    if (!modal || !input) return;

    const name = getPantryItemDisplayName(id);
    if (title) title.textContent = `Set Quantity: ${name}`;

    const cur = (typeof pantryItemQuantities[id] === 'number') ? pantryItemQuantities[id] : 1;
    input.value = cur;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
  }

  function closePantryQuantityModal() {
    activePantryQtyId = null;
    const modal = document.getElementById('pantryQtyModalOverlay');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  // Match single-use ingredients to pantry key in pantryItemQuantities or pantryState
  function findMatchingPantryKey(targetId, targetName) {
    if (targetId && pantryItemQuantities && typeof pantryItemQuantities[targetId] === 'number') {
      return targetId;
    }
    if (targetId && typeof INGREDIENT_EQUIVALENTS !== 'undefined' && INGREDIENT_EQUIVALENTS[targetId]) {
      for (const eqId of INGREDIENT_EQUIVALENTS[targetId]) {
        if (pantryItemQuantities && typeof pantryItemQuantities[eqId] === 'number') {
          return eqId;
        }
      }
    }
    if (targetName) {
      const clean = sanitizeShoppingItemName(targetName);
      const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      if (slug && pantryItemQuantities && typeof pantryItemQuantities[slug] === 'number') {
        return slug;
      }
      if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
        const masterMatch = INGREDIENTS_MASTER.find(m => 
          m.id === slug || (m.name && m.name.toLowerCase() === clean.toLowerCase())
        );
        if (masterMatch && pantryItemQuantities && typeof pantryItemQuantities[masterMatch.id] === 'number') {
          return masterMatch.id;
        }
        if (masterMatch && typeof INGREDIENT_EQUIVALENTS !== 'undefined' && INGREDIENT_EQUIVALENTS[masterMatch.id]) {
          for (const eqId of INGREDIENT_EQUIVALENTS[masterMatch.id]) {
            if (pantryItemQuantities && typeof pantryItemQuantities[eqId] === 'number') {
              return eqId;
            }
          }
        }
      }
    }

    // Fallback: check if tracked in pantryState (user has item checked)
    if (targetId && pantryState && pantryState.has(targetId)) {
      return targetId;
    }
    if (targetId && typeof INGREDIENT_EQUIVALENTS !== 'undefined' && INGREDIENT_EQUIVALENTS[targetId]) {
      for (const eqId of INGREDIENT_EQUIVALENTS[targetId]) {
        if (pantryState && pantryState.has(eqId)) {
          return eqId;
        }
      }
    }
    if (targetName) {
      const clean = sanitizeShoppingItemName(targetName);
      const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      if (slug && pantryState && pantryState.has(slug)) {
        return slug;
      }
      if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
        const masterMatch = INGREDIENTS_MASTER.find(m => 
          m.id === slug || (m.name && m.name.toLowerCase() === clean.toLowerCase())
        );
        if (masterMatch && pantryState && pantryState.has(masterMatch.id)) {
          return masterMatch.id;
        }
      }
    }

    return null;
  }

  // Deduct single-use countable ingredients (shakes, cookies, pastries, etc.) from pantry
  function deductSingleUseIngredients(recipeOrId, scale = 1.0) {
    if (!recipeOrId) return [];
    let rec = null;
    if (typeof recipeOrId === 'string') {
      rec = (typeof allRecipes !== 'undefined' && Array.isArray(allRecipes))
        ? allRecipes.find(r => r.id === recipeOrId || (r.name && r.name.toLowerCase() === recipeOrId.toLowerCase()))
        : null;
    } else if (typeof recipeOrId === 'object') {
      rec = recipeOrId;
    }
    if (!rec || !Array.isArray(rec.ingredients)) return [];

    const deducted = [];
    rec.ingredients.forEach(ing => {
      if (!isSingleUseItem(ing)) return;

      const rawQty = ing.quantity != null ? ing.quantity : ing.amount;
      const parsedQty = parseIngredientQuantity(rawQty);
      if (parsedQty === null || parsedQty <= 0) return;

      const neededQty = parsedQty * (scale || 1.0);
      const roundedNeeded = Math.round(neededQty * 10) / 10;

      const matchedKey = findMatchingPantryKey(ing.id, ing.name);
      if (matchedKey) {
        const currentQty = (pantryItemQuantities && typeof pantryItemQuantities[matchedKey] === 'number')
          ? pantryItemQuantities[matchedKey]
          : 1;
        const newQty = Math.max(0, Math.round((currentQty - roundedNeeded) * 10) / 10);
        if (newQty > 0) {
          pantryItemQuantities[matchedKey] = newQty;
          deducted.push({
            id: matchedKey,
            name: getPantryItemDisplayName(matchedKey),
            amountDeducted: roundedNeeded,
            remaining: newQty
          });
        } else {
          delete pantryItemQuantities[matchedKey];
          pantryState.delete(matchedKey);
          deducted.push({
            id: matchedKey,
            name: getPantryItemDisplayName(matchedKey),
            amountDeducted: roundedNeeded,
            remaining: 0
          });
        }
      }
    });

    if (deducted.length > 0) {
      savePantry();
      updatePantryCheckboxVisuals();
      renderRecipes();
    }
    return deducted;
  }

  function notifyPantryDeduction(deductedList) {
    if (!deductedList || deductedList.length === 0) return;
    const parts = deductedList.map(d => {
      const leftStr = d.remaining > 0 ? `x${d.remaining} left` : 'depleted';
      return `${d.amountDeducted} ${d.name} (${leftStr})`;
    });
    showToast(`📦 Pantry updated: Used ${parts.join(', ')}`);
  }

  // --- Pantry List Rendering ---
  function renderPantryList() {
    if (!ingredientListContainer || typeof INGREDIENTS_MASTER === 'undefined') return;

    const prevScrollTop = ingredientListContainer.scrollTop;
    ingredientListContainer.replaceChildren();
    const q = ingredientSearchQuery.toLowerCase().trim();

    // Group items by category from the user's accessible pantry ingredients
    const grouped = {};
    Object.keys(INGREDIENT_CATEGORIES).forEach(cat => grouped[cat] = []);

    const visibleIngredients = getUserPantryIngredients();
    visibleIngredients.forEach(item => {
      if (q && !item.name.toLowerCase().includes(q)) return;
      const cat = item.category || 'mixins_snacks';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    let renderedAny = false;
    const fragment = document.createDocumentFragment();

    Object.entries(INGREDIENT_CATEGORIES).forEach(([catKey, catLabel]) => {
      const items = grouped[catKey] || [];
      if (items.length === 0) return;

      renderedAny = true;
      const groupEl = document.createElement('div');
      groupEl.className = 'category-group open';

      const inStockInCat = items.filter(it => pantryState.has(it.id)).length;
      const catIcon = CATEGORY_ICONS[catKey] || '📦';

      const itemsHtml = items.map(item => {
        const isChecked = pantryState.has(item.id);
        const count = ingredientRecipeCount[item.id] || 0;
        const isSingle = isSingleUseItem(item);
        const qty = (pantryItemQuantities && typeof pantryItemQuantities[item.id] === 'number') 
          ? pantryItemQuantities[item.id] 
          : 1;

        const stepperHtml = (isSingle && isChecked) ? `
          <div class="pantry-qty-stepper" data-action="stop-prop" title="Pantry quantity">
            <button type="button" class="btn-pantry-qty-step dec" data-action="dec-pantry-qty" data-id="${item.id}" title="Decrease quantity">−</button>
            <button type="button" class="pantry-qty-val" data-action="edit-pantry-qty" data-id="${item.id}" title="Tap to set exact quantity">x${qty}</button>
            <button type="button" class="btn-pantry-qty-step inc" data-action="inc-pantry-qty" data-id="${item.id}" title="Increase quantity">+</button>
          </div>
        ` : '';

        return `
          <div class="ingredient-checkbox-item ${isChecked ? 'checked' : ''}" data-id="${item.id}">
            <div class="custom-checkbox"></div>
            <span class="ingredient-name-text">${item.name}</span>
            ${stepperHtml}
            ${count > 0 ? `<span class="ingredient-recipe-count" title="Used in ${count} recipes">${count}</span>` : ''}
          </div>
        `;
      }).join('');

      groupEl.innerHTML = `
        <div class="category-header">
          <div class="category-header-title">
            <span class="category-header-icon">${catIcon}</span>
            <span>${catLabel}</span>
          </div>
          <div class="category-header-right">
            ${inStockInCat > 0 ? `<span class="category-in-stock-badge">${inStockInCat}/${items.length}</span>` : `<span class="category-recipe-count">${items.length}</span>`}
            <span class="category-chevron">▼</span>
          </div>
        </div>
        <div class="category-items-list">${itemsHtml}</div>
      `;

      fragment.appendChild(groupEl);
    });

    if (renderedAny) {
      ingredientListContainer.appendChild(fragment);
    } else {
      ingredientListContainer.innerHTML = `
        <div style="padding: 24px 10px; text-align: center; color: var(--text-dim); font-size: 0.88rem;">
          No ingredients match "${ingredientSearchQuery}"
        </div>
      `;
    }

    if (prevScrollTop > 0) {
      ingredientListContainer.scrollTop = prevScrollTop;
    }

    updateStats();
  }

  function togglePantryItem(id) {
    let action = 'added';
    if (pantryState.has(id)) {
      pantryState.delete(id);
      delete pantryItemQuantities[id];
      action = 'removed';
    } else {
      pantryState.add(id);
      if (isSingleUseItem(id)) {
        pantryItemQuantities[id] = 1;
      }
    }
    savePantry();
    updatePantryCheckboxVisuals();
    renderRecipes();

    trackAnalyticsEvent('pantry_ingredient_toggled', {
      ingredient_id: id,
      action: action,
      total_in_pantry: pantryState.size
    });
  }

  function updatePantryCheckboxVisuals() {
    document.querySelectorAll('.ingredient-checkbox-item').forEach(el => {
      const id = el.dataset.id;
      const isChecked = pantryState.has(id);
      if (isChecked) {
        el.classList.add('checked');
      } else {
        el.classList.remove('checked');
      }

      const isSingle = isSingleUseItem(id);
      let stepper = el.querySelector('.pantry-qty-stepper');
      if (isSingle && isChecked) {
        const qty = (pantryItemQuantities && typeof pantryItemQuantities[id] === 'number')
          ? pantryItemQuantities[id]
          : 1;
        if (!stepper) {
          stepper = document.createElement('div');
          stepper.className = 'pantry-qty-stepper';
          stepper.dataset.action = 'stop-prop';
          stepper.title = 'Pantry quantity';
          const countBadge = el.querySelector('.ingredient-recipe-count');
          if (countBadge) {
            el.insertBefore(stepper, countBadge);
          } else {
            el.appendChild(stepper);
          }
        }
        stepper.innerHTML = `
          <button type="button" class="btn-pantry-qty-step dec" data-action="dec-pantry-qty" data-id="${id}" title="Decrease quantity">−</button>
          <button type="button" class="pantry-qty-val" data-action="edit-pantry-qty" data-id="${id}" title="Tap to set exact quantity">x${qty}</button>
          <button type="button" class="btn-pantry-qty-step inc" data-action="inc-pantry-qty" data-id="${id}" title="Increase quantity">+</button>
        `;
      } else if (stepper) {
        stepper.remove();
      }
    });

    // Update in-stock count badges in category headers
    document.querySelectorAll('.category-group').forEach(group => {
      const items = group.querySelectorAll('.ingredient-checkbox-item');
      const checked = group.querySelectorAll('.ingredient-checkbox-item.checked');
      const badge = group.querySelector('.category-in-stock-badge');
      if (badge) {
        if (checked.length > 0) {
          badge.textContent = `${checked.length}/${items.length}`;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    });
  }

  // --- Recipe Matching Engine ---
  function computeRecipeMatch(recipe) {
    const ingredients = recipe.ingredients || [];
    if (ingredients.length === 0) {
      return {
        totalCount: 0,
        inPantryCount: 0,
        baseTotal: 0,
        baseInPantry: 0,
        isReady: false,
        isBaseReady: false,
        matchPercent: 0,
        missing: []
      };
    }

    let baseTotal = 0;
    let baseInPantry = 0;
    let inPantryCount = 0;
    const missing = [];

    ingredients.forEach(ing => {
      const cleanName = sanitizeShoppingItemName(ing.name);
      const activeSwap = (recipe && recipe.id && activeRecipeSwaps[recipe.id]) ? activeRecipeSwaps[recipe.id][cleanName] : null;
      const effectiveItem = activeSwap ? { ...ing, name: activeSwap.name, id: activeSwap.name } : ing;
      const hasItem = isItemInPantry(effectiveItem);

      if (ing.isMixin) {
        // mixin
      } else {
        baseTotal++;
        if (hasItem) baseInPantry++;
      }

      if (hasItem) {
        inPantryCount++;
      } else {
        missing.push(effectiveItem);
      }
    });

    const isReady = (inPantryCount === ingredients.length);
    const isBaseReady = (baseTotal > 0 && baseInPantry === baseTotal);
    const matchPercent = Math.round((inPantryCount / ingredients.length) * 100);

    return {
      totalCount: ingredients.length,
      inPantryCount,
      baseTotal,
      baseInPantry,
      isReady,
      isBaseReady,
      matchPercent,
      missing
    };
  }

  // --- Recipe Grid Rendering ---
  function renderRecipes() {
    if (!recipeGrid) return;

    const q = recipeSearchQuery.toLowerCase().trim();
    let readyCount = 0;
    let baseReadyCount = 0;
    let lockedReadyCount = 0;
    let lockedBaseReadyCount = 0;

    // Filter and score recipes
    const scoredRecipes = allRecipes.map(recipe => {
      const match = computeRecipeMatch(recipe);
      const accessible = isRecipeAccessible(recipe);
      if (accessible) {
        if (match.isReady) readyCount++;
        if (match.isBaseReady) baseReadyCount++;
      } else {
        if (match.isReady) lockedReadyCount++;
        if (match.isBaseReady) lockedBaseReadyCount++;
      }
      return { recipe, match };
    });

    const accessibleTotal = allRecipes.filter(r => isRecipeAccessible(r)).length;
    const lockedTotal = allRecipes.length - accessibleTotal;

    // Update Dashboard Stats
    statTotalRecipes.textContent = accessibleTotal;
    statTotalRecipes.title = `${accessibleTotal} accessible recipes in your library (${lockedTotal} available for purchase)`;
    statReadyRecipes.textContent = readyCount;
    statReadyRecipes.title = lockedReadyCount > 0 
      ? `${readyCount} accessible recipe${readyCount === 1 ? '' : 's'} ready now (+${lockedReadyCount} in locked packs)` 
      : `${readyCount} recipe${readyCount === 1 ? '' : 's'} ready now`;
    statBaseReadyRecipes.textContent = baseReadyCount;
    statBaseReadyRecipes.title = lockedBaseReadyCount > 0
      ? `${baseReadyCount} accessible recipe${baseReadyCount === 1 ? '' : 's'} ready to freeze (+${lockedBaseReadyCount} in locked packs)`
      : `${baseReadyCount} recipe${baseReadyCount === 1 ? '' : 's'} ready to freeze`;


    const tabRecipeCount = document.getElementById('mobileTabRecipeCount');
    if (tabRecipeCount) tabRecipeCount.textContent = accessibleTotal;

    // Guard: if activeCategory is a locked pack the current user can't access,
    // reset to 'all' NOW before the filter runs (not after inside updateCategoryCounts)
    const lockedPackCats = ['Fan Favorites', 'Keto', 'Lactose Free', 'No Protein'];
    if (lockedPackCats.includes(activeCategory) && !isCategoryUnlocked(activeCategory) && !activeSeoLanding) {
      activeCategory = 'all';
      if (categoryTabs) {
        categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const allTab = categoryTabs.querySelector('[data-category="all"]');
        if (allTab) allTab.classList.add('active');
      }
    }

    // Guard: if activeDietFilter is 'low_carb' and Keto pack is locked, clear it
    if (activeDietFilter === 'low_carb' && !isCategoryUnlocked('Keto')) {
      activeDietFilter = 'all';
      if (dietFilterSelect) {
        dietFilterSelect.value = 'all';
        dietFilterSelect.classList.remove('active');
      }
    }

    // Apply active category and filter toggles
    let filtered = scoredRecipes.filter(({ recipe, match }) => {
      // Only show recipes the user has access to!
      // If they are locked, hide them.
      if (!isRecipeAccessible(recipe)) return false;

      // Category filter
      if (activeCategory === 'favorites') {
        if (!favoritesState.has(recipe.id)) return false;
      } else if (activeCategory !== 'all') {
        const accessibleCats = getAccessibleRecipeCategories(recipe);
        if (!accessibleCats.includes(activeCategory)) {
          if (activeCategory === 'Custom' && currentUser && recipe.userId === currentUser.id) {
            // Show authored recipes in personal My Recipes tab
          } else {
            return false;
          }
        }
      }

      // Ready Only filter
      if (readyOnlyFilter && !match.isReady) return false;

      // Base Only filter
      if (baseOnlyFilter && !match.isBaseReady) return false;

      // Fitness & Macro Target Sliders (Roadmap Item 10)
      if (macroFilters.minProtein > 0) {
        const pro = parseInt(recipe.macros.protein) || 0;
        if (pro < macroFilters.minProtein) return false;
      }
      if (macroFilters.maxCalories < 450) {
        const cal = parseInt(recipe.macros.calories) || 999;
        if (cal > macroFilters.maxCalories) return false;
      }
      if (macroFilters.maxFat < 20) {
        const fat = parseInt(recipe.macros.fat) || 0;
        if (fat > macroFilters.maxFat) return false;
      }

      // Curated SEO Landing Page Collections
      if (activeSeoLanding === 'under-300-cal') {
        const cal = parseInt(recipe.macros.calories) || 999;
        if (cal > 300) return false;
      } else if (activeSeoLanding === 'high-protein') {
        const pro = parseInt(recipe.macros.protein) || 0;
        if (pro < 25) return false;
      } else if (activeSeoLanding === 'sorbet') {
        const spin = (recipe.spinSetting || '').toLowerCase();
        const text = (recipe.name + ' ' + (recipe.ingredients || []).map(i => i.name || '').join(' ')).toLowerCase();
        const hasFruit = ['peach', 'mango', 'strawberr', 'blueberr', 'raspberr', 'banana', 'acai', 'pineapple', 'apple', 'fruit', 'lemon', 'lime', 'sorbet', 'cherry', 'watermelon'].some(w => text.includes(w));
        if (spin !== 'sorbet' && !hasFruit) return false;
      } else if (activeSeoLanding === 'dairy-free') {
        const isLactoseFree = recipe.category === 'Lactose Free';
        const text = (recipe.name + ' ' + (recipe.ingredients || []).map(i => i.name || '').join(' ')).toLowerCase();
        const hasPlantMilk = ['almond milk', 'oat milk', 'coconut milk', 'dairy-free', 'dairy free', 'vegan', 'soy milk', 'cashew milk', 'juice', 'water'].some(w => text.includes(w));
        if (!isLactoseFree && !hasPlantMilk) return false;
      } else if (activeSeoLanding === 'gelato') {
        const spin = (recipe.spinSetting || '').toLowerCase();
        const text = (recipe.name + ' ' + (recipe.ingredients || []).map(i => i.name || '').join(' ')).toLowerCase();
        if (spin !== 'gelato' && !text.includes('gelato') && !text.includes('custard')) return false;
      }

      // Quick Nutrition & Macro Filter (Diet Dropdown + legacy quick filter)
      const currentDiet = activeDietFilter !== 'all' ? activeDietFilter : activeQuickFilter;
      if (currentDiet === 'high_protein') {
        const pro = parseInt(recipe.macros.protein) || 0;
        if (pro < 35) return false;
      } else if (currentDiet === 'low_cal') {
        const cal = parseInt(recipe.macros.calories) || 999;
        if (cal >= 200) return false;
      } else if (currentDiet === 'low_carb') {
        const carbs = parseInt(recipe.macros.carbs) || 999;
        if (carbs > 10) return false;
      } else if (currentDiet === 'low_fat') {
        const fat = parseInt(recipe.macros.fat) || 0;
        if (fat > 5) return false;
      } else if (currentDiet === 'my_rated') {
        if (!userRecipeData[recipe.id] || !userRecipeData[recipe.id].rating) return false;
      } else if (currentDiet === 'pro_tips') {
        if (!recipe.proTip) return false;
      }

      // Flavor Craving Filter (Craving Dropdown + legacy quick filter)
      const currentCraving = activeCravingFilter !== 'all' ? activeCravingFilter : activeQuickFilter;
      if (currentCraving === 'craving_chocolate') {
        if (!matchesCraving(recipe, 'chocolate')) return false;
      } else if (currentCraving === 'craving_fruit') {
        if (!matchesCraving(recipe, 'fruit')) return false;
      } else if (currentCraving === 'craving_bakery') {
        if (!matchesCraving(recipe, 'bakery')) return false;
      } else if (currentCraving === 'craving_coffee') {
        if (!matchesCraving(recipe, 'coffee')) return false;
      }

      // Search Query
      if (q) {
        const nameMatch = recipe.name.toLowerCase().includes(q);
        const spinMatch = (recipe.spinSetting || '').toLowerCase().includes(q);
        const ingMatch = (recipe.ingredients || []).some(i => i.name.toLowerCase().includes(q));
        const aliasMatch = (recipe.aliases || []).some(a => a.toLowerCase().includes(q));
        if (!nameMatch && !spinMatch && !ingMatch && !aliasMatch) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'match_desc') {
        if (b.match.matchPercent !== a.match.matchPercent) {
          return b.match.matchPercent - a.match.matchPercent;
        }
        return a.recipe.name.localeCompare(b.recipe.name);
      } else if (sortBy === 'rating_desc') {
        const rateA = communityStats.ratings[a.recipe.id]?.avg ?? 0;
        const rateB = communityStats.ratings[b.recipe.id]?.avg ?? 0;
        if (rateB !== rateA) return rateB - rateA;
        return a.recipe.name.localeCompare(b.recipe.name);
      } else if (sortBy === 'community_made_desc') {
        const commA = communityStats.madeCounts[a.recipe.id] ?? 0;
        const commB = communityStats.madeCounts[b.recipe.id] ?? 0;
        if (commB !== commA) return commB - commA;
        return a.recipe.name.localeCompare(b.recipe.name);
      } else if (sortBy === 'user_made_desc') {
        const userA = recipeMadeCounts[a.recipe.id] || 0;
        const userB = recipeMadeCounts[b.recipe.id] || 0;
        if (userB !== userA) return userB - userA;
        return a.recipe.name.localeCompare(b.recipe.name);
      } else if (sortBy === 'cal_asc') {
        const calA = parseInt(a.recipe.macros.calories) || 999;
        const calB = parseInt(b.recipe.macros.calories) || 999;
        return calA - calB;
      } else if (sortBy === 'protein_desc') {
        const proA = parseInt(a.recipe.macros.protein) || 0;
        const proB = parseInt(b.recipe.macros.protein) || 0;
        return proB - proA;
      } else if (sortBy === 'name_asc') {
        return a.recipe.name.localeCompare(b.recipe.name);
      } else if (sortBy === 'book_asc') {
        const catA = (getAccessibleRecipeCategories(a.recipe)[0]) || a.recipe.category || '';
        const catB = (getAccessibleRecipeCategories(b.recipe)[0]) || b.recipe.category || '';
        if (catA !== catB) {
          return catA.localeCompare(catB);
        }
        return a.recipe.name.localeCompare(b.recipe.name);
      }
      return 0;
    });

    // Update Results Summary & Active Hint
    // Update Results Summary & Active Hint
    if (lockedTotal > 0) {
      resultsSummary.innerHTML = `Showing <strong>${filtered.length}</strong> accessible recipe${filtered.length === 1 ? '' : 's'}`;
    } else {
      resultsSummary.textContent = `Showing all ${filtered.length} recipes`;
    }

    if (btnAvailablePacksBadge) {
      if (lockedTotal > 0) {
        btnAvailablePacksBadge.style.display = 'inline-flex';
        btnAvailablePacksBadge.innerHTML = `<span class="btn-packs-icon">🛍️</span><span class="btn-packs-label"><strong id="lockedCountBadge">${lockedTotal}</strong> Available for Purchase</span>`;
      } else {
        btnAvailablePacksBadge.innerHTML = `<span class="badge-all-unlocked">👑 All Packs Unlocked</span>`;
      }
    }

    // Update Category Pack Promo (shown when viewing a locked category)
    if (categoryPackPromo) {
      const isPackCategory = ['Fan Favorites', 'Keto', 'Lactose Free', 'No Protein'].includes(activeCategory);
      const isCatUnlocked = isCategoryUnlocked(activeCategory);
      if (isPackCategory && !isCatUnlocked) {
        categoryPackPromo.style.display = 'block';
        updateCategoryPackPromo(activeCategory);
      } else {
        categoryPackPromo.style.display = 'none';
      }
    }

    // Update General Available for Purchase Banner
    if (purchaseAvailableBanner) {
      if (lockedTotal > 0 && activeCategory === 'all') {
        purchaseAvailableBanner.style.display = 'block';
        if (bannerLockedCount) bannerLockedCount.textContent = lockedTotal;
      } else {
        purchaseAvailableBanner.style.display = 'none';
      }
    }

    const hintParts = [];
    if (readyOnlyFilter) hintParts.push('⚡ 100% Ready to Make');
    if (baseOnlyFilter) hintParts.push('🥣 Base Ready to Freeze');
    const displayDiet = activeDietFilter !== 'all' ? activeDietFilter : activeQuickFilter;
    if (displayDiet === 'high_protein') hintParts.push('💪 High Protein (≥35g)');
    if (displayDiet === 'low_cal') hintParts.push('🔥 Low Calorie (<200 cal)');
    if (displayDiet === 'low_carb') hintParts.push('🥑 Low Carb (≤10g)');
    if (displayDiet === 'low_fat') hintParts.push('🧈 Low Fat (≤5g)');
    if (displayDiet === 'my_rated') hintParts.push('⭐ My Rated');
    if (displayDiet === 'pro_tips') hintParts.push(`💡 Official Author Pro Tips (${filtered.length} recipes)`);

    const displayCraving = activeCravingFilter !== 'all' ? activeCravingFilter : activeQuickFilter;
    if (displayCraving === 'craving_chocolate') hintParts.push('🍫 Chocolate Craving');
    if (displayCraving === 'craving_fruit') hintParts.push('🍓 Fruity & Refreshing');
    if (displayCraving === 'craving_bakery') hintParts.push('🍪 Bakery, Cookie & Dough');
    if (displayCraving === 'craving_coffee') hintParts.push('☕ Coffee & Latte');

    const macroParts = [];
    if (macroFilters.minProtein > 0) macroParts.push(`≥${macroFilters.minProtein}g P`);
    if (macroFilters.maxCalories < 450) macroParts.push(`≤${macroFilters.maxCalories} Cal`);
    if (macroFilters.maxFat < 20) macroParts.push(`≤${macroFilters.maxFat}g Fat`);
    if (macroParts.length > 0) hintParts.push(`🎯 Targets: ${macroParts.join(', ')}`);

    activePantryHint.textContent = hintParts.length > 0 ? `• Filtered by ${hintParts.join(' • ')}` : '';

    // Sync filter UI controls
    if (dietFilterSelect) {
      dietFilterSelect.value = activeDietFilter;
      dietFilterSelect.classList.toggle('active', activeDietFilter !== 'all');
    }
    if (cravingFilterSelect) {
      cravingFilterSelect.value = activeCravingFilter;
      cravingFilterSelect.classList.toggle('active-craving', activeCravingFilter !== 'all');
    }
    if (readyOnlyPill) readyOnlyPill.classList.toggle('checked', readyOnlyFilter);
    if (baseOnlyPill) baseOnlyPill.classList.toggle('checked', baseOnlyFilter);

    // Show/hide Clear All Filters button
    const hasActiveFilters = readyOnlyFilter || 
      baseOnlyFilter || 
      activeDietFilter !== 'all' || 
      activeCravingFilter !== 'all' || 
      (activeQuickFilter !== 'all' && activeQuickFilter !== '') || 
      activeCategory !== 'all' || 
      (recipeSearchQuery && recipeSearchQuery.trim().length > 0) || 
      macroFilters.minProtein > 0 || 
      macroFilters.maxCalories < 450 || 
      macroFilters.maxFat < 20;

    if (clearAllFiltersBtn) {
      clearAllFiltersBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }

    updateCategoryCounts();
    updateShoppingListBadge();

    // Render Cards or Empty State (Flicker-Free Atomic Update)
    if (filtered.length === 0) {
      const isPackCategory = ['Fan Favorites', 'Keto', 'Lactose Free', 'No Protein'].includes(activeCategory);
      const isCatUnlocked = isCategoryUnlocked(activeCategory);
      if (isPackCategory && !isCatUnlocked) {
        emptyState.style.display = 'none';
      } else {
        emptyState.style.display = 'block';
        if (q || readyOnlyFilter || baseOnlyFilter) {
          trackAnalyticsEvent('pantry_zero_results', {
            search_query: q,
            category: activeCategory,
            pantry_count: pantryState.size,
            ready_only: readyOnlyFilter
          });
        }
      }
      recipeGrid.style.display = 'none';
      cleanupRecipeGridObserver();
      recipeGrid.replaceChildren();
      return;
    }

    emptyState.style.display = 'none';
    recipeGrid.style.display = 'grid';

    // Progressive Batch Card Rendering (Instant Load & Fluid Resizing)
    activeFilteredRecipes = filtered;
    renderedRecipeCount = Math.min(filtered.length, RECIPES_INITIAL_BATCH);

    const initialCards = activeFilteredRecipes
      .slice(0, renderedRecipeCount)
      .map(({ recipe, match }) => getOrCreateRecipeCard(recipe, match));

    recipeGrid.replaceChildren(...initialCards);

    if (renderedRecipeCount < activeFilteredRecipes.length) {
      setupRecipeGridObserver();
    } else {
      cleanupRecipeGridObserver();
    }
  }

  // Progressive Recipe Grid Batch Configuration & Observers
  const RECIPES_INITIAL_BATCH = 24;
  const RECIPES_CHUNK_SIZE = 24;
  let activeFilteredRecipes = [];
  let renderedRecipeCount = 0;
  let recipeGridObserver = null;
  let recipeGridSentinel = null;

  function appendNextRecipeBatch() {
    if (!recipeGrid || renderedRecipeCount >= activeFilteredRecipes.length) {
      cleanupRecipeGridObserver();
      return;
    }

    const nextBatch = activeFilteredRecipes.slice(renderedRecipeCount, renderedRecipeCount + RECIPES_CHUNK_SIZE);
    const newCards = nextBatch.map(({ recipe, match }) => getOrCreateRecipeCard(recipe, match));

    if (recipeGridSentinel && recipeGridSentinel.parentNode === recipeGrid) {
      newCards.forEach(c => recipeGrid.insertBefore(c, recipeGridSentinel));
    } else {
      newCards.forEach(c => recipeGrid.appendChild(c));
    }

    renderedRecipeCount += nextBatch.length;

    if (renderedRecipeCount >= activeFilteredRecipes.length) {
      cleanupRecipeGridObserver();
    } else if (recipeGridSentinel) {
      const btnText = recipeGridSentinel.querySelector('button span');
      if (btnText) {
        btnText.textContent = `Load more recipes (${activeFilteredRecipes.length - renderedRecipeCount} remaining)...`;
      }
    }
  }

  function cleanupRecipeGridObserver() {
    if (recipeGridObserver) {
      recipeGridObserver.disconnect();
    }
    if (recipeGridSentinel && recipeGridSentinel.parentNode) {
      recipeGridSentinel.remove();
    }
  }

  function setupRecipeGridObserver() {
    if (!recipeGrid) return;
    if (!recipeGridSentinel) {
      recipeGridSentinel = document.createElement('div');
      recipeGridSentinel.id = 'recipeGridSentinel';
      recipeGridSentinel.className = 'recipe-grid-sentinel';
      recipeGridSentinel.style.cssText = 'grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; padding: 24px 16px; min-height: 52px;';
      recipeGridSentinel.innerHTML = `
        <button type="button" class="btn-secondary btn-sm" id="btnLoadMoreSentinel" style="font-size: 0.82rem; padding: 8px 24px; border-radius: 999px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.15); color: #cbd5e1; cursor: pointer;">
          <span>Load more recipes (${activeFilteredRecipes.length - renderedRecipeCount} remaining)...</span>
        </button>
      `;
      recipeGridSentinel.addEventListener('click', (e) => {
        e.preventDefault();
        appendNextRecipeBatch();
      });
    } else {
      const btnText = recipeGridSentinel.querySelector('button span');
      if (btnText) {
        btnText.textContent = `Load more recipes (${activeFilteredRecipes.length - renderedRecipeCount} remaining)...`;
      }
    }

    if (recipeGridSentinel.parentNode !== recipeGrid) {
      recipeGrid.appendChild(recipeGridSentinel);
    }

    if ('IntersectionObserver' in window) {
      if (recipeGridObserver) recipeGridObserver.disconnect();
      recipeGridObserver = new IntersectionObserver((entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          appendNextRecipeBatch();
        }
      }, {
        root: null,
        rootMargin: '500px',
        threshold: 0.01
      });
      recipeGridObserver.observe(recipeGridSentinel);
    }
  }

  // Card DOM Node Cache for zero layout-shift & instant rendering
  const recipeCardCache = new Map();

  function getOrCreateRecipeCard(recipe, match) {
    let card = recipeCardCache.get(recipe.id);
    if (!card) {
      card = createRecipeCard(recipe, match);
      recipeCardCache.set(recipe.id, card);
    } else {
      updateRecipeCard(card, recipe, match);
    }
    return card;
  }

  function updateRecipeCard(card, recipe, match) {
    const isAccessible = isRecipeAccessible(recipe);
    const wasExpanded = card.classList.contains('mobile-expanded');
    card.className = `recipe-card ${match.isReady ? 'ready-to-make' : ''} ${!isAccessible ? 'locked' : ''} ${wasExpanded ? 'mobile-expanded' : ''}`;

    const requiredTier = getRecipeRequiredTier(recipe);
    const isClaimPending = !isAccessible && (userPendingClaimsState.has(requiredTier) || userPendingClaimsState.has('All-Access'));

    const viewBtn = card.querySelector('.btn-view-recipe');
    if (viewBtn) {
      viewBtn.textContent = isAccessible ? 'View Recipe' : (isClaimPending ? '⏳ Pending Verification' : '🔒 Locked Preview');
    }

    const previewMacros = card.querySelector('.mobile-preview-macros');
    if (previewMacros) {
      previewMacros.textContent = `🔥 ${recipe.macros.calories || '—'} cal • 💪 ${recipe.macros.protein || '—'} pro • 🥑 ${recipe.macros.fat || '—'} fat`;
    }

    // Update Locked Badge and Book Tags
    const bookTags = card.querySelector('.card-book-tags');
    if (bookTags) {
      const isPersonal = Boolean(recipe.category === 'Custom' || recipe.isPersonal);
      const accessibleCategories = getAccessibleRecipeCategories(recipe);
      const creator = getRecipeCreator(recipe);

      let tagsHtml = '';
      if (isPersonal) {
        tagsHtml = '<span class="book-tag custom" title="Personal custom recipe saved to your Google account">🔒 Personal Recipe</span>';
      } else {
        tagsHtml = accessibleCategories.map(c => `<span class="book-tag ${getCategoryClass(c)}">${c}</span>`).join('');
      }
      if (creator) {
        tagsHtml += `<span class="creator-badge-tag" title="Recipe by ${creator.name} (${creator.brandName})">📖 ${creator.name} (FPF)</span>`;
      }
      if (!isAccessible) {
        if (isClaimPending) {
          tagsHtml += `<span class="badge-claim-pending" title="Your access request is currently pending verification">⏳ ${requiredTier} Pending</span>`;
        } else {
          tagsHtml += `<span class="locked-badge" title="Exclusive ${requiredTier} pack">🔒 ${requiredTier} Pack</span>`;
        }
      }
      if (recipe.creaminessScore) {
        tagsHtml += `<span class="recipe-creaminess-badge" title="Build-A-Pint Creaminess Score">🧪 ${recipe.creaminessScore}/10</span>`;
      }
      bookTags.innerHTML = tagsHtml;
    }

    // Update Favorite Button
    const favBtn = card.querySelector('.favorite-btn');
    if (favBtn) {
      const isFav = favoritesState.has(recipe.id);
      favBtn.className = `favorite-btn ${isFav ? 'is-favorite' : ''}`;
      favBtn.textContent = isFav ? '💖' : '🤍';
    }

    // Update Match Status
    const matchRow = card.querySelector('.match-status-row');
    if (matchRow) {
      let matchBadgeHtml = '';
      if (match.isReady) {
        matchBadgeHtml = `<span class="match-badge ready">⚡ Ready to Make</span>`;
      } else if (match.missing.length === 1) {
        matchBadgeHtml = `<span class="match-badge partial">Missing 1 item</span>`;
      } else if (match.isBaseReady) {
        matchBadgeHtml = `<span class="match-badge partial">🥣 Base Ready (${match.missing.length} mix-ins missing)</span>`;
      } else {
        matchBadgeHtml = `<span class="match-badge low">Missing ${match.missing.length} items</span>`;
      }
      matchRow.innerHTML = `
        ${matchBadgeHtml}
        <span class="match-percent">${match.matchPercent}%</span>
      `;
    }

    const progressFill = card.querySelector('.match-progress-fill');
    if (progressFill) {
      progressFill.className = `match-progress-fill ${match.isReady ? 'ready' : ''}`;
      progressFill.style.width = `${match.matchPercent}%`;
    }

    // Update Ingredient Previews (has vs miss)
    const ingItems = card.querySelectorAll('.card-ing-item');
    const ings = recipe.ingredients || [];
    ingItems.forEach((item, idx) => {
      if (ings[idx]) {
        const has = isItemInPantry(ings[idx]);
        item.className = `card-ing-item ${has ? 'has' : 'miss'}`;
        const statusSpan = item.querySelector('.card-ing-status');
        if (statusSpan) {
          statusSpan.className = `card-ing-status ${has ? 'has' : 'miss'}`;
          statusSpan.textContent = has ? '✓' : '○';
        }
      }
    });

    // Update User Rating if present
    const userFeedback = userRecipeData[recipe.id] || {};
    let userRatingEl = card.querySelector('.recipe-card-rating');
    if (userFeedback.rating) {
      if (userRatingEl) {
        userRatingEl.textContent = `⭐ You: ${userFeedback.rating}★`;
      } else {
        const actionsTop = card.querySelector('.card-actions-top');
        if (actionsTop) {
          const span = document.createElement('span');
          span.className = 'recipe-card-rating';
          span.title = `Your rating: ${userFeedback.rating} stars`;
          span.textContent = `⭐ You: ${userFeedback.rating}★`;
          actionsTop.insertBefore(span, actionsTop.querySelector('.favorite-btn'));
        }
      }
    } else if (userRatingEl) {
      userRatingEl.remove();
    }

    // Update Community Rating if present
    const isPersonal = Boolean(recipe.category === 'Custom' || recipe.isPersonal);
    const commRating = communityStats.ratings[recipe.id];
    const hasCommRating = Boolean(!isPersonal && commRating && commRating.count > 0);
    let commRatingEl = card.querySelector('.card-community-rating');
    if (hasCommRating) {
      if (commRatingEl) {
        commRatingEl.title = `Community rating: ${commRating.avg.toFixed(1)} / 5.0 (${commRating.count} review${commRating.count === 1 ? '' : 's'})`;
        commRatingEl.innerHTML = `★ ${commRating.avg.toFixed(1)} <span class="rating-sub">(${commRating.count})</span>`;
      } else {
        const actionsTop = card.querySelector('.card-actions-top');
        if (actionsTop) {
          const span = document.createElement('span');
          span.className = 'card-community-rating';
          span.title = `Community rating: ${commRating.avg.toFixed(1)} / 5.0 (${commRating.count} review${commRating.count === 1 ? '' : 's'})`;
          span.innerHTML = `★ ${commRating.avg.toFixed(1)} <span class="rating-sub">(${commRating.count})</span>`;
          actionsTop.prepend(span);
        }
      }
    } else if (commRatingEl) {
      commRatingEl.remove();
    }

    // Update Made & Batch Tracker Pills if present
    const madeRow = card.querySelector('.card-made-row');
    if (madeRow) {
      const userMade = recipeMadeCounts[recipe.id] || 0;
      const commMade = communityStats.madeCounts[recipe.id] || 0;
      const hasMadeContent = (userMade > 0) || (!isPersonal && commMade > 0);
      madeRow.style.display = hasMadeContent ? 'flex' : 'none';
      madeRow.innerHTML = `
        ${userMade > 0 ? `<span class="made-pill personal" title="You have spun this ${userMade} times">🍨 You spun ${userMade}×</span>` : ''}
        ${(!isPersonal && commMade > 0) ? `<span class="made-pill community" title="Spun ${commMade} times across all users">🔥 ${commMade} community spin${commMade === 1 ? '' : 's'}</span>` : ''}
      `;
    }
  }

  function createRecipeCard(recipe, match) {
    const isAccessible = isRecipeAccessible(recipe);
    const requiredTier = getRecipeRequiredTier(recipe);
    const card = document.createElement('div');
    card.className = `recipe-card ${match.isReady ? 'ready-to-make' : ''} ${!isAccessible ? 'locked' : ''}`;
    card.dataset.id = recipe.id;

    const isFav = favoritesState.has(recipe.id);
    const catClass = getCategoryClass(recipe.category);

    let matchBadgeHtml = '';
    if (match.isReady) {
      matchBadgeHtml = `<span class="match-badge ready">⚡ Ready to Make</span>`;
    } else if (match.missing.length === 1) {
      matchBadgeHtml = `<span class="match-badge partial">Missing 1 item</span>`;
    } else if (match.isBaseReady) {
      matchBadgeHtml = `<span class="match-badge partial">🥣 Base Ready (${match.missing.length} mix-ins missing)</span>`;
    } else {
      matchBadgeHtml = `<span class="match-badge low">Missing ${match.missing.length} items</span>`;
    }

    const ings = recipe.ingredients || [];
    const previewIngs = ings.slice(0, 4);
    const remainingCount = ings.length - previewIngs.length;

    const accessibleCategories = getAccessibleRecipeCategories(recipe);

    const isPersonal = Boolean(recipe.category === 'Custom' || recipe.isPersonal);
    const commRating = communityStats.ratings[recipe.id];
    const hasCommRating = Boolean(!isPersonal && commRating && commRating.count > 0);
    const commAvg = hasCommRating ? commRating.avg : 0;
    const commCount = hasCommRating ? commRating.count : 0;
    const userFeedback = userRecipeData[recipe.id] || {};
    const userMade = recipeMadeCounts[recipe.id] || 0;
    const commMade = communityStats.madeCounts[recipe.id] || 0;
    const creator = getRecipeCreator(recipe);
    const prepCount = getRecipeBatchPrepCount(recipe.id);
    const inBatchPrep = prepCount > 0;

    const isClaimPending = !isAccessible && (userPendingClaimsState.has(requiredTier) || userPendingClaimsState.has('All-Access'));

    card.innerHTML = `
      <div class="recipe-card-body">
        <div class="recipe-card-top">
          <div class="card-book-tags">
            ${isPersonal ? `<span class="book-tag custom" title="Personal custom recipe saved to your Google account">🔒 Personal Recipe</span>` : accessibleCategories.map(c => `<span class="book-tag ${getCategoryClass(c)}">${c}</span>`).join('')}
            ${creator ? `<span class="creator-badge-tag" title="Recipe by ${creator.name} (${creator.brandName})">📖 ${creator.name} (FPF)</span>` : ''}
            ${!isAccessible ? (
              isClaimPending 
                ? `<span class="badge-claim-pending" title="Your access request is currently pending verification">⏳ ${requiredTier} Pending</span>`
                : `<span class="locked-badge" title="Exclusive ${requiredTier} pack">🔒 ${requiredTier} Pack</span>`
            ) : ''}
            ${recipe.creaminessScore ? `<span class="recipe-creaminess-badge" title="Build-A-Pint Creaminess Score">🧪 ${recipe.creaminessScore}/10</span>` : ''}
          </div>
          <div class="card-actions-top">
            ${isPersonal ? `
              <button class="card-delete-recipe-btn" title="Delete personal recipe">🗑️</button>
            ` : ''}
            ${hasCommRating ? `
              <span class="card-community-rating" title="Community rating: ${commAvg.toFixed(1)} / 5.0 (${commCount} review${commCount === 1 ? '' : 's'})">
                ★ ${commAvg.toFixed(1)} <span class="rating-sub">(${commCount})</span>
              </span>
            ` : ''}
            ${userFeedback.rating ? `<span class="recipe-card-rating" title="Your rating: ${userFeedback.rating} stars">⭐ You: ${userFeedback.rating}★</span>` : ''}
            ${recipe.videoUrl ? `
              <a href="${recipe.videoUrl}" target="_blank" rel="noopener noreferrer" class="card-video-btn" title="Watch Creator Video / Reel" onclick="event.stopPropagation();">
                🎬
              </a>
            ` : ''}
            <button class="card-share-btn" data-recipe-id="${recipe.id}" title="Share recipe link">
              🔗
            </button>
            <button class="favorite-btn ${isFav ? 'is-favorite' : ''}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ${isFav ? '💖' : '🤍'}
            </button>
          </div>
        </div>

        <h3 class="recipe-card-title"><a href="${(IS_BETA ? '/beta' : '')}/recipe/${encodeURIComponent(recipe.id)}" class="recipe-title-link">${escapeHtml(recipe.name)}</a></h3>

        <div class="match-status-bar">
          <div class="match-status-row">
            ${matchBadgeHtml}
            <span class="match-percent">${match.matchPercent}%</span>
          </div>
          <div class="match-progress-track">
            <div class="match-progress-fill ${match.isReady ? 'ready' : ''}" style="width: ${match.matchPercent}%;"></div>
          </div>
        </div>

        <!-- Mobile Collapsed Quick Info Strip (Visible only on mobile when collapsed) -->
        <div class="card-mobile-preview-strip">
          <span class="mobile-preview-macros">🔥 ${recipe.macros.calories || '—'} cal • 💪 ${recipe.macros.protein || '—'} pro • 🥑 ${recipe.macros.fat || '—'} fat</span>
          <span class="card-expand-cue">Details <span class="cue-arrow">▾</span></span>
        </div>

        <div class="recipe-card-collapsible-wrap">
          <div class="macro-pills">
            <div class="macro-pill cal">
              <div class="macro-pill-val">${recipe.macros.calories || '—'}</div>
              <div class="macro-pill-label">Cal</div>
            </div>
            <div class="macro-pill pro">
              <div class="macro-pill-val">${recipe.macros.protein || '—'}</div>
              <div class="macro-pill-label">Pro</div>
            </div>
            <div class="macro-pill carb">
              <div class="macro-pill-val">${recipe.macros.carbs || '—'}</div>
              <div class="macro-pill-label">Carb</div>
            </div>
            <div class="macro-pill fat">
              <div class="macro-pill-val">${recipe.macros.fat || '—'}</div>
              <div class="macro-pill-label">Fat</div>
            </div>
          </div>

          <!-- Recipe Made & Batch Tracker Pills -->
          <div class="card-made-row" style="${(userMade === 0 && (!commMade || isPersonal)) ? 'display: none;' : ''}">
            ${userMade > 0 ? `<span class="made-pill personal" title="You have spun this ${userMade} times">🍨 You spun ${userMade}×</span>` : ''}
            ${(!isPersonal && commMade > 0) ? `<span class="made-pill community" title="Spun ${commMade} times across all users">🔥 ${commMade} community spin${commMade === 1 ? '' : 's'}</span>` : ''}
          </div>

          <div class="card-ingredients-preview">
            ${previewIngs.map(ing => {
              const has = isItemInPantry(ing);
              return `
                <div class="card-ing-item ${has ? 'has' : 'miss'}">
                  <span class="card-ing-status ${has ? 'has' : 'miss'}">${has ? '✓' : '○'}</span>
                  <span class="card-ing-text">${ing.name}</span>
                </div>
              `;
            }).join('')}
            ${remainingCount > 0 ? `<div class="card-more-ings">+ ${remainingCount} more ingredient${remainingCount > 1 ? 's' : ''}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="recipe-card-bottom">
        <span class="spin-tag" title="Recommended spin cycle">🌀 ${escapeHtml(recipe.spinSetting || 'Lite Ice Cream')}</span>
        <div class="card-bottom-actions">
          <div class="card-prep-slot" data-recipe-id="${recipe.id}">
            ${renderCardBatchPrepControlHtml(recipe.id, prepCount)}
          </div>
          <button type="button" class="btn-quick-freeze-card" title="Place into Virtual Freezer Slot" data-action="quick-freeze">❄️ Freeze</button>
          <a href="${(IS_BETA ? '/beta' : '')}/recipe/${encodeURIComponent(recipe.id)}" class="btn-view-recipe">${isAccessible ? 'View Recipe' : (isClaimPending ? '⏳ Pending' : '🔒 Locked')}</a>
        </div>
      </div>
    `;

    // Sunday Batch Prep card slot events
    bindCardBatchPrepSlotEvents(card.querySelector('.card-prep-slot'), recipe.id);

    // Quick Freeze button click
    const quickFreezeBtn = card.querySelector('[data-action="quick-freeze"]');
    if (quickFreezeBtn) {
      quickFreezeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const takenSlots = new Set(freezerPintsState.map(p => p.slot));
        let targetSlot = 1;
        for (let s = 1; s <= freezerSlotCapacity; s++) {
          if (!takenSlots.has(s)) {
            targetSlot = s;
            break;
          }
        }
        openSlotFillModal(targetSlot, recipe);
      });
    }

    // Favorite button click
    const favBtn = card.querySelector('.favorite-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(recipe.id);
    });

    // Delete personal recipe button click (with 2-tap confirmation)
    if (isPersonal) {
      const cardDelBtn = card.querySelector('.card-delete-recipe-btn');
      if (cardDelBtn) {
        let cardConfirm = false;
        let cTimer = null;
        cardDelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!cardConfirm) {
            cardConfirm = true;
            cardDelBtn.classList.add('confirming');
            cardDelBtn.textContent = '✕';
            cardDelBtn.title = 'Tap again to permanently delete';
            showToast(`⚠️ Tap ✕ again to delete "${recipe.name}"`);
            cTimer = setTimeout(() => {
              cardConfirm = false;
              cardDelBtn.classList.remove('confirming');
              cardDelBtn.textContent = '🗑️';
              cardDelBtn.title = 'Delete personal recipe';
            }, 3500);
          } else {
            clearTimeout(cTimer);
            deleteCustomRecipe(recipe.id);
          }
        });
      }
    }

    // Card Share button click
    const cardShareBtn = card.querySelector('.card-share-btn');
    if (cardShareBtn) {
      cardShareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shareRecipe(recipe, cardShareBtn);
      });
    }

    // View button click & card click with crawlable anchor support
    const viewBtn = card.querySelector('.btn-view-recipe');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
        }
        e.stopPropagation();
        openRecipeModal(recipe);
      });
    }

    const titleLink = card.querySelector('.recipe-title-link');
    if (titleLink) {
      titleLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !card.classList.contains('mobile-expanded')) {
          e.preventDefault();
          e.stopPropagation();
          card.classList.add('mobile-expanded');
          const cue = card.querySelector('.card-expand-cue');
          if (cue) cue.innerHTML = 'Collapse <span class="cue-arrow">▴</span>';
          return;
        }
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
        }
        e.stopPropagation();
        openRecipeModal(recipe);
      });
    }

    card.addEventListener('click', (e) => {
      // On mobile (<= 768px), clicking the card toggles expansion
      if (window.innerWidth <= 768) {
        if (e.target.closest('button, .favorite-btn, .card-share-btn, .card-delete-recipe-btn, .card-video-btn')) {
          return;
        }
        if (e.target.closest('.btn-view-recipe')) {
          openRecipeModal(recipe);
          return;
        }
        const willExpand = !card.classList.contains('mobile-expanded');
        card.classList.toggle('mobile-expanded');
        const cue = card.querySelector('.card-expand-cue');
        if (cue) {
          cue.innerHTML = willExpand ? 'Collapse <span class="cue-arrow">▴</span>' : 'Details <span class="cue-arrow">▾</span>';
        }
        return;
      }
      openRecipeModal(recipe);
    });

    return card;
  }

  function getCategoryClass(category) {
    if (!category) return '';
    const c = category.toLowerCase();
    if (c.includes('base')) return 'base-flavors';
    if (c.includes('legend') || c.includes('community')) return 'community-legends';
    if (c.includes('fan')) return 'fan-favorites';
    if (c.includes('keto')) return 'keto';
    if (c.includes('lactose')) return 'lactose-free';
    if (c.includes('no protein')) return 'no-protein';
    if (c.includes('custom')) return 'custom';
    return '';
  }

  function toggleFavorite(recipeId) {
    if (!currentUser) {
      openGoogleAuthModal();
      showToast('🔒 Please sign in to save your favorite recipes!');
      return;
    }
    const isNowFav = !favoritesState.has(recipeId);
    if (!isNowFav) {
      favoritesState.delete(recipeId);
      showToast('Removed from favorites');
      trackAnalyticsEvent('remove_from_wishlist', { item_id: recipeId });
    } else {
      favoritesState.add(recipeId);
      showToast('💖 Added to favorites!');
      trackAnalyticsEvent('add_to_wishlist', { item_id: recipeId });
    }
    saveFavorites();

    if (activeCategory === 'favorites') {
      renderRecipes();
    } else {
      const card = recipeCardCache.get(recipeId);
      if (card) {
        const favBtn = card.querySelector('.favorite-btn');
        if (favBtn) {
          favBtn.className = `favorite-btn ${isNowFav ? 'is-favorite' : ''}`;
          favBtn.textContent = isNowFav ? '💖' : '🤍';
          favBtn.title = isNowFav ? 'Remove from favorites' : 'Add to favorites';
        }
      }
      updateCategoryCounts();
    }
  }

  function updateCategoryPackPromo(category) {
    const titleEl = document.getElementById('packPromoTitle');
    const descEl = document.getElementById('packPromoDesc');
    const iconEl = document.getElementById('packPromoIcon');
    const unlockBtn = document.getElementById('btnUnlockCurrentCategory');

    const packInfo = {
      'Fan Favorites': {
        icon: '⭐',
        title: 'Fan Favorites E-Book by Eli (75 Recipes)',
        desc: 'Unlock 75 signature recipes including viral dessert dupes, mix-in masterpieces, and bakery creations like Oreo McFlurry, Cookie Dough Craze, Cosmic Brownie, and Birthday Cake.',
        btnText: '🛒 Buy E-Book ($27.99) ↗'
      },
      'Keto': {
        icon: '🥑',
        title: 'Keto & Low-Carb E-Book by Eli (22 Recipes)',
        desc: 'Ultra-low net carbs without sacrificing rich, creamy texture. Includes Keto Chocolate Fudge, Peanut Butter Swirl, Mint Chip, Butter Pecan, and Sea Salt Caramel (under 5g net carbs).',
        btnText: '🛒 Buy E-Book ($27.99) ↗'
      },
      'Lactose Free': {
        icon: '🥛',
        title: 'Lactose-Free E-Book by Eli (43 Recipes)',
        desc: '100% real dairy flavor without digestive distress, formulated with ultra-filtered Fairlife and lactase enzyme bases. Includes Vanilla Latte, Strawberry Cheesecake & Mocha Chip.',
        btnText: '🛒 Buy E-Book ($27.99) ↗'
      },
      'No Protein': {
        icon: '💪',
        title: 'No Protein Powder E-Book by Eli (83 Recipes)',
        desc: 'Pure, authentic ice cream parlor decadence made without any protein powders. Whole milk, pudding bases, and authentic churned texture for true dessert lovers.',
        btnText: '🛒 Buy E-Book ($27.99) ↗'
      }
    };

    const info = packInfo[category] || packInfo['Fan Favorites'];
    if (iconEl) iconEl.textContent = info.icon;
    if (titleEl) titleEl.textContent = info.title;
    if (descEl) descEl.textContent = info.desc;
    if (unlockBtn) {
      unlockBtn.dataset.pack = category;
      const span = unlockBtn.querySelector('span');
      if (span) span.textContent = info.btnText;
    }
  }

  let activeStoreCreatorId = null;

  function updateCreatorDirectoryUI() {
    const dirGrid = document.getElementById('creatorsDirectoryGrid');
    if (!dirGrid) return;
    
    let visibleCount = 0;
    dirGrid.querySelectorAll('.creator-directory-card').forEach(card => {
      const cId = card.getAttribute('data-creator-id');
      if (cId && isCreatorDisabled(cId)) {
        card.style.display = 'none';
      } else {
        card.style.display = '';
        visibleCount++;
      }
    });

    let emptyNotice = document.getElementById('noCreatorsAvailableNotice');
    if (visibleCount === 0) {
      if (!emptyNotice) {
        emptyNotice = document.createElement('div');
        emptyNotice.id = 'noCreatorsAvailableNotice';
        emptyNotice.className = 'empty-creators-notice';
        emptyNotice.innerHTML = `
          <div style="text-align: center; padding: 36px 20px; background: rgba(15, 23, 42, 0.4); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: 12px; margin-bottom: 20px;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🧑‍🍳</div>
            <h3 style="font-size: 1.1rem; color: #f8fafc; margin-bottom: 6px;">No Creator Cookbooks Currently Available</h3>
            <p style="color: #94a3b8; font-size: 0.88rem; max-width: 500px; margin: 0 auto;">
              Content creators have been toggled off by the platform administrator. Universal Community Legends and your personal custom recipes remain fully accessible.
            </p>
          </div>
        `;
        dirGrid.insertBefore(emptyNotice, dirGrid.firstChild);
      }
      emptyNotice.style.display = 'block';
    } else if (emptyNotice) {
      emptyNotice.style.display = 'none';
    }
  }

  function showCreatorDirectoryView(updateHistory = true) {
    const dirView = document.getElementById('creatorsDirectoryView');
    const catView = document.getElementById('creatorCatalogView');
    if (dirView) dirView.style.display = 'block';
    if (catView) catView.style.display = 'none';
    activeStoreCreatorId = null;
    updateCreatorDirectoryUI();
    if (updateHistory && (window.location.pathname.includes('/@') || window.location.pathname.includes('/creator/'))) {
      try {
        history.pushState({ modal: 'creators_directory' }, '', IS_BETA ? '/beta/' : '/');
      } catch (e) {}
      document.title = 'Featured Recipe Creators | Creami Cravings';
    }
  }

  function renderCreatorBooks(creatorId) {
    const packsGrid = document.getElementById('recipePacksGrid');
    if (!packsGrid || typeof BOOKS_MASTER === 'undefined') return;

    const creatorBooks = BOOKS_MASTER.filter(b => b.creatorId === creatorId);
    const creator = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === creatorId) : null;
    const creatorName = creator ? creator.name : 'Creator';
    const brandName = creator ? creator.brandName : '';

    const iconMap = {
      'Fan Favorites': '⭐',
      'Keto': '🥑',
      'Lactose Free': '🥛',
      'No Protein': '💪',
      'All-Access': '👑',
      'TestContent Sampler': '🥣',
      'Volume Pints': '🔥'
    };

    packsGrid.innerHTML = creatorBooks.map(book => {
      const isBundle = book.id.endsWith('_bundle') || book.bookKey === 'All-Access';
      const cardClass = isBundle ? 'recipe-pack-card vip-bundle' : 'recipe-pack-card';
      const icon = iconMap[book.bookKey] || (isBundle ? '👑' : '📖');
      const badgeClass = isBundle ? 'vip' : 'fan-fav';
      const tag = `by ${escapeHtml(creatorName)} (${escapeHtml(brandName || '')})`;
      return `
        <div class="${cardClass}" data-pack="${escapeHtml(book.bookKey || book.categoryKey)}">
          <div class="pack-card-header">
            <span class="pack-card-icon">${icon}</span>
            <div class="pack-card-title-col">
              <div class="pack-card-title-row">
                <h3 class="pack-card-name">${escapeHtml(book.title)}</h3>
                <span class="pack-card-badge ${badgeClass}">${book.recipeCount || 0} Recipes</span>
              </div>
              <span class="pack-card-tagline">${tag}</span>
            </div>
          </div>
          <p class="pack-card-desc">${escapeHtml(book.description || '')}</p>
          <div class="pack-card-footer">
            <div class="pack-card-status">
              <span class="pack-status-available">🛍️ Available on ${escapeHtml(creatorName)} (${escapeHtml(book.price)})</span>
            </div>
            <button type="button" class="btn-primary btn-sm btn-action-pack" data-pack="${escapeHtml(book.bookKey || book.categoryKey)}">
              <span>🛒 Buy E-Book (${escapeHtml(book.price)}) ↗</span>
            </button>
          </div>
          <div style="text-align: center; margin-top: 6px;">
            <a href="#" class="btn-pack-own-link" data-claim-pack="${escapeHtml(book.bookKey || book.categoryKey)}">Already own this book from ${escapeHtml(creatorName)}? Claim access &rarr;</a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Creator Affiliate & Storefront Click Tracking
  async function trackCreatorClick(creatorId, eventType) {
    if (!creatorId) return;
    try {
      fetch('/api/creator/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, eventType })
      }).catch(() => {});
    } catch (e) {}
  }

  function filterRecipesByCreatorAndPantry(creatorId) {
    closeRecipePacksModal();
    const creator = getCreatorById(creatorId);
    if (!creator) return;

    // Turn ON Ready-Only pantry filter
    readyOnlyFilter = true;
    const readyToggle = document.getElementById('readyOnlyToggle');
    if (readyToggle) readyToggle.checked = true;
    const readyPill = document.getElementById('readyOnlyPill');
    if (readyPill) readyPill.classList.add('checked');

    // Clear search and reset category to all so creator's available recipes show
    recipeSearchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    renderRecipes();
    updateCategoryCounts();

    const grid = document.getElementById('recipeGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`🥫 Showing recipes you can make right now with your pantry ingredients!`);
  }

  function showCreatorCatalogView(creatorId = 'fitness_product_finder', viewPerksFirst = false, updateHistory = true) {
    if (isCreatorDisabled(creatorId)) {
      showToast('⚠️ This creator is currently unavailable.');
      showCreatorDirectoryView(updateHistory);
      return;
    }
    const dirView = document.getElementById('creatorsDirectoryView');
    const catView = document.getElementById('creatorCatalogView');
    if (dirView) dirView.style.display = 'none';
    if (catView) catView.style.display = 'block';
    activeStoreCreatorId = creatorId;

    // Track Link-in-Bio View
    trackCreatorClick(creatorId, 'linkInBioViews');

    const creator = getCreatorById(creatorId);

    const breadcrumb = document.getElementById('catalogCreatorBreadcrumb');
    const nameEl = document.getElementById('catalogCreatorName');
    const subEl = document.getElementById('catalogCreatorSubtitle');
    const storeBtn = document.getElementById('catalogCreatorStoreBtn');

    if (creator) {
      if (breadcrumb) breadcrumb.textContent = `${creator.name} (${creator.brandName})`;
      if (nameEl) nameEl.textContent = `${creator.name}'s Recipe Books`;
      if (subEl) subEl.textContent = `${creator.brandName} • Official e-books & bundles`;
      if (storeBtn) {
        storeBtn.href = creator.storeUrl || creator.url;
        storeBtn.innerHTML = `<span>Visit ${creator.name}'s Storefront ↗</span>`;
        if (!storeBtn._clickTracked) {
          storeBtn._clickTracked = true;
          storeBtn.addEventListener('click', () => {
            trackCreatorClick(activeStoreCreatorId || creator.id, 'storefrontClicks');
          });
        }
      }

      // 1. Pinned Store Announcement Banner
      const bannerEl = document.getElementById('catalogAnnouncementBanner');
      const bannerTextEl = document.getElementById('catalogAnnouncementText');
      if (bannerEl && bannerTextEl) {
        const announcement = (creator && creator.storeAnnouncement) || (serverCreatorProfiles[creatorId] && serverCreatorProfiles[creatorId].storeAnnouncement) || '';
        if (announcement) {
          bannerTextEl.textContent = announcement;
          bannerEl.style.display = 'flex';
        } else {
          bannerEl.style.display = 'none';
        }
      }

      // 2. Creator Social Pills (Instagram, TikTok, YouTube, Shop)
      const socialsRow = document.getElementById('catalogCreatorSocials');
      if (socialsRow) {
        const sl = (creator && creator.socialLinks) || {};
        let pillsHtml = '';
        if (sl.instagram) {
          const igHandle = sl.instagram.replace(/^@/, '');
          const igUrl = sl.instagram.startsWith('http') ? sl.instagram : `https://instagram.com/${igHandle}`;
          pillsHtml += `<a href="${escapeHtml(igUrl)}" target="_blank" rel="noopener noreferrer" class="creator-social-pill ig">📸 @${escapeHtml(igHandle)}</a>`;
        }
        if (sl.tiktok) {
          const ttHandle = sl.tiktok.replace(/^@/, '');
          const ttUrl = sl.tiktok.startsWith('http') ? sl.tiktok : `https://tiktok.com/@${ttHandle}`;
          pillsHtml += `<a href="${escapeHtml(ttUrl)}" target="_blank" rel="noopener noreferrer" class="creator-social-pill tiktok">🎵 @${escapeHtml(ttHandle)}</a>`;
        }
        if (sl.youtube) {
          const ytUrl = sl.youtube.startsWith('http') ? sl.youtube : `https://youtube.com/${sl.youtube.replace(/^@/, '')}`;
          pillsHtml += `<a href="${escapeHtml(ytUrl)}" target="_blank" rel="noopener noreferrer" class="creator-social-pill yt">▶️ YouTube</a>`;
        }
        if (sl.website || creator.storeUrl) {
          const webUrl = sl.website || creator.storeUrl;
          pillsHtml += `<a href="${escapeHtml(webUrl)}" target="_blank" rel="noopener noreferrer" class="creator-social-pill web">🌐 Official Store</a>`;
        }
        socialsRow.innerHTML = pillsHtml;
      }

      // 3. Match My Pantry Button
      const matchPantryBtn = document.getElementById('catalogMatchPantryBtn');
      if (matchPantryBtn && !matchPantryBtn._bound) {
        matchPantryBtn._bound = true;
        matchPantryBtn.addEventListener('click', () => {
          filterRecipesByCreatorAndPantry(activeStoreCreatorId);
        });
      }

      // 4. Pint of the Week / Featured Recipe
      const featCard = document.getElementById('catalogFeaturedPintCard');
      const featTitle = document.getElementById('catalogFeaturedTitle');
      const featMacros = document.getElementById('catalogFeaturedMacros');
      const featSpin = document.getElementById('catalogFeaturedSpinTag');
      const featIcon = document.getElementById('catalogFeaturedIcon');
      const featSpins = document.getElementById('catalogFeaturedSpins');
      const featBtn = document.getElementById('btnCatalogFeaturedView');

      if (featCard) {
        const creatorRecipes = allRecipes.filter(r => {
          const cr = getRecipeCreator(r);
          return cr && cr.id === creatorId;
        });
        const topRecipe = creatorRecipes.find(r => r.name.toLowerCase().includes('oreo') || r.name.toLowerCase().includes('birthday')) || creatorRecipes[0];
        if (topRecipe) {
          featCard.style.display = 'flex';
          if (featTitle) featTitle.textContent = topRecipe.name;
          if (featMacros) featMacros.textContent = `${topRecipe.macros?.calories || 0} kcal • ${topRecipe.macros?.protein || 0}g Pro • ${topRecipe.macros?.carbs || 0}g Carbs • ${topRecipe.macros?.fat || 0}g Fat`;
          if (featSpin) featSpin.textContent = `🌀 Spin: ${topRecipe.spinSetting || 'Lite Ice Cream'}`;
          if (featIcon) featIcon.textContent = topRecipe.category === 'Keto' ? '🥑' : (topRecipe.category === 'Lactose Free' ? '🥛' : '🍨');
          const spinsCount = (communityStats && communityStats.madeCounts && communityStats.madeCounts[topRecipe.id]) || 340;
          if (featSpins) featSpins.textContent = `🔥 ${spinsCount}+ Community Spins`;
          if (featBtn) {
            featBtn.onclick = () => {
              closeRecipePacksModal();
              openRecipeModal(topRecipe);
            };
          }
        } else {
          featCard.style.display = 'none';
        }
      }

      renderCreatorBooks(creatorId);
      renderCreatorPerks(creator);

      if (updateHistory) {
        const handle = creator.handle ? creator.handle.replace('@', '') : creator.id;
        const targetPath = (IS_BETA ? '/beta' : '') + `/@${handle}`;
        if (window.location.pathname !== targetPath) {
          try {
            history.pushState({ modal: 'creator', creatorId }, '', targetPath);
          } catch (e) {}
        }
        document.title = `${creator.name} (${creator.handle}) — Official Storefront | Creami Cravings`;
      }

      // If user already owns the books or requested perks first, place perks section FIRST!
      const creatorCats = getCategoriesForCreator(creatorId);
      const hasAllBooks = isCategoryUnlocked('All-Access') ||
        (currentUser && ((currentUser.role === 'creator' && currentUser.creatorId === creatorId) || (currentUser.creatorVips && currentUser.creatorVips.includes(creatorId)))) ||
        (creatorCats.length > 0 && creatorCats.every(p => isCategoryUnlocked(p)));

      const perksSection = document.getElementById('creatorPerksSection');
      const packsGrid = document.getElementById('recipePacksGrid');
      if (perksSection && packsGrid) {
        if (hasAllBooks || viewPerksFirst) {
          packsGrid.parentNode.insertBefore(perksSection, packsGrid);
        } else {
          packsGrid.parentNode.insertBefore(perksSection, packsGrid.nextSibling);
        }
      }
    } else {
      renderCreatorPerks(null);
    }

    if (recipePacksModalOverlay) {
      const modalContent = recipePacksModalOverlay.querySelector('.modal-content');
      if (modalContent) modalContent.scrollTop = 0;
      recipePacksModalOverlay.scrollTop = 0;
    }

    updatePacksModalStatuses();
  }

  function renderCreatorPerks(creator) {
    const perksSection = document.getElementById('creatorPerksSection');
    const perksGrid = document.getElementById('creatorPerksGrid');
    const perksTitle = document.getElementById('creatorPerksTitle');
    if (!perksSection || !perksGrid) return;

    if (!creator || !creator.perks || creator.perks.length === 0) {
      perksSection.style.display = 'none';
      perksGrid.innerHTML = '';
      return;
    }

    if (perksTitle) {
      perksTitle.textContent = `${creator.name}'s Creator Perks & Ingredient Discounts`;
    }
    perksSection.style.display = 'block';

    perksGrid.innerHTML = creator.perks.map(perk => {
      const hasCode = Boolean(perk.code);
      return `
        <div class="creator-perk-card" data-perk-id="${escapeHtml(perk.id)}">
          <div class="perk-card-top">
            <div class="perk-card-meta">
              <span class="perk-category-pill">${escapeHtml(perk.category || 'Partner')}</span>
              <span class="perk-discount-badge">${escapeHtml(perk.discount || 'Special Deal')}</span>
            </div>
            <h4 class="perk-brand-name">${escapeHtml(perk.brand)}</h4>
            ${perk.description ? `<p class="perk-desc">${escapeHtml(perk.description)}</p>` : ''}
          </div>
          <div class="perk-card-bottom">
            ${hasCode ? `
              <div class="perk-code-box" title="Click to copy discount code">
                <span class="perk-code-label">PROMO CODE:</span>
                <span class="perk-code-val">${escapeHtml(perk.code)}</span>
                <button type="button" class="btn-copy-perk-code" data-code="${escapeHtml(perk.code)}" data-brand="${escapeHtml(perk.brand)}">
                  <span>📋 Copy</span>
                </button>
              </div>
            ` : ''}
            <a href="${escapeHtml(perk.url || '#')}" target="_blank" rel="noopener noreferrer" class="btn-perk-shop">
              <span>Shop ${escapeHtml((perk.brand || 'Partner').split(' ')[0])} ↗</span>
            </a>
          </div>
        </div>
      `;
    }).join('');

    perksGrid.querySelectorAll('.perk-code-box').forEach(box => {
      box.addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = box.querySelector('.btn-copy-perk-code');
        const code = btn ? btn.dataset.code : '';
        const brand = btn ? btn.dataset.brand : '';
        if (!code) return;
        copyTextToClipboard(code);
        trackCreatorClick(creator.id, 'perkCopies');
        showToast(`📋 Copied code "${code}" for ${brand}!`);
        if (btn) {
          const originalHtml = btn.innerHTML;
          btn.innerHTML = '<span>✓ Copied!</span>';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('copied');
          }, 1800);
        }
      });
    });

    perksGrid.querySelectorAll('.btn-perk-shop').forEach(link => {
      link.addEventListener('click', () => {
        trackCreatorClick(creator.id, 'perkClicks');
      });
    });
  }

  function openRecipePacksModal(creatorId = null, viewPerksFirst = false, updateHistory = true) {
    if (!recipePacksModalOverlay) return;
    if (creatorId && isCreatorDisabled(creatorId)) {
      showToast('⚠️ This creator is currently unavailable.');
      creatorId = null;
    }
    if (creatorId) {
      showCreatorCatalogView(creatorId, viewPerksFirst);
      if (updateHistory) {
        const creator = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === creatorId) : null;
        const handle = creator && creator.handle ? creator.handle.replace('@', '') : 'fitnessproductfinder';
        const targetPath = (IS_BETA ? '/beta' : '') + `/@${handle}`;
        if (window.location.pathname !== targetPath) {
          try {
            history.pushState({ modal: 'creator', creatorId }, '', targetPath);
          } catch (e) {}
        }
        if (creator) {
          document.title = `${creator.name} (${creator.handle}) — Official Storefront | Creami Cravings`;
        }
      }
    } else {
      showCreatorDirectoryView();
    }
    recipePacksModalOverlay.classList.add('active');
    recipePacksModalOverlay.setAttribute('aria-hidden', 'false');
    const modalContent = recipePacksModalOverlay.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;
    recipePacksModalOverlay.scrollTop = 0;
    lockBackgroundScroll();
  }

  function closeRecipePacksModal(updateHistory = true) {
    if (!recipePacksModalOverlay) return;
    recipePacksModalOverlay.classList.remove('active');
    recipePacksModalOverlay.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();

    if (updateHistory && (window.location.pathname.includes('/@') || window.location.pathname.includes('/creator/'))) {
      try {
        history.pushState({ modal: null }, '', IS_BETA ? '/beta/' : '/');
      } catch (e) {}
      document.title = 'Creami Cravings';
    }
  }

  function updatePacksModalStatuses() {
    if (!recipePacksModalOverlay) return;
    const cards = recipePacksModalOverlay.querySelectorAll('.recipe-pack-card');

    cards.forEach(card => {
      const packId = card.dataset.pack;
      if (!packId) return;
      const el = card.querySelector('.pack-card-status');
      const isUnlocked = isCategoryUnlocked(packId);
      const isPending = userPendingClaimsState.has(packId) || userPendingClaimsState.has('All-Access');
      const btn = card.querySelector('.btn-action-pack');
      const ownLink = card.querySelector('.btn-pack-own-link');
      const book = (typeof BOOKS_MASTER !== 'undefined')
        ? BOOKS_MASTER.find(b => b.bookKey === packId || b.categoryKey === packId || b.id === packId)
        : null;
      const price = book ? book.price : (packId === 'All-Access' ? '$49.99' : '$27.99');
      const creator = (book && typeof CREATORS_MASTER !== 'undefined')
        ? CREATORS_MASTER.find(c => c.id === book.creatorId)
        : null;
      const creatorName = creator ? creator.name : 'Creator';

      if (el) {
        if (isUnlocked) {
          el.innerHTML = '<span class="pack-status-active">✅ In Your Library</span>';
        } else if (isPending) {
          el.innerHTML = '<span class="badge-claim-pending">⏳ Verification Pending</span>';
        } else {
          el.innerHTML = `<span class="pack-status-available">🛍️ Available on ${escapeHtml(creatorName)} (${escapeHtml(price)})</span>`;
        }
      }
      if (btn) {
        if (isUnlocked) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
          btn.className = 'btn-primary btn-sm btn-action-pack btn-batch-prep-pack';
          btn.innerHTML = '<span>🍱 Batch Prep Pack (Top 4) →</span>';
          btn.title = 'Add 4 signature pints from this collection directly to Sunday Batch Prep';
          btn.dataset.batchPack = packId;
        } else {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
          btn.className = 'btn-primary btn-sm btn-action-pack';
          delete btn.dataset.batchPack;
          btn.innerHTML = packId === 'All-Access' 
            ? `<span>👑 Buy 4-Book Bundle (${escapeHtml(price)}) ↗</span>` 
            : `<span>🛒 Buy E-Book (${escapeHtml(price)}) ↗</span>`;
        }
      }
      if (ownLink) {
        if (isUnlocked) {
          ownLink.style.display = 'none';
        } else if (isPending) {
          ownLink.style.display = 'inline-block';
          ownLink.textContent = '⏳ Verification Pending (Details Submitted)';
          ownLink.style.color = '#fbbf24';
          ownLink.style.pointerEvents = 'none';
        } else {
          ownLink.style.display = 'inline-block';
          ownLink.style.pointerEvents = 'auto';
          ownLink.textContent = packId === 'All-Access' 
            ? `Already own the bundle from ${escapeHtml(creatorName)}? Claim access →` 
            : `Already own this book from ${escapeHtml(creatorName)}? Claim access →`;
          ownLink.style.color = '';
        }
      }
    });
  }

  async function handlePackPurchase(packName) {
    const book = (typeof BOOKS_MASTER !== 'undefined')
      ? BOOKS_MASTER.find(b => b.bookKey === packName || b.categoryKey === packName || b.id === packName)
      : null;
    const url = book ? book.url : 'https://fitnessproductfinder.com/collections/creami-cravings-recipe-books';
    const bookTitle = book ? (book.shortTitle || book.title) : packName;

    // Open the creator's product page in a new window/tab
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`🛒 Opening ${bookTitle} on Fitness Product Finder...`);

    const creatorId = book ? book.creatorId : 'fitness_product_finder';
    trackCreatorClick(creatorId, 'storefrontClicks');

    if (currentUser) {
      try {
        await fetch('/api/purchase-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            userId: currentUser.id,
            pack: packName,
            url: url,
            timestamp: new Date().toISOString()
          })
        });
      } catch (e) {
        console.warn('Purchase inquiry send error:', e);
      }
    }
  }

  // ==========================================================================
  // Hybrid Feature: 1-Click Creator Pack Unlock into Freezer Queue (Path B)
  // ==========================================================================
  function batchPrepCreatorPack(packId) {
    if (!currentUser) {
      showToast('🔒 Please sign in to use Sunday Batch Prep & Grocery List.');
      openGoogleAuthModal();
      return;
    }
    let targetRecipes = [];

    // Filter recipes that belong to this pack/category
    const packRecipes = allRecipes.filter(r => {
      if (packId === 'All-Access') {
        const cat = r.category || '';
        return ['Fan Favorites', 'Keto', 'Lactose Free', 'No Protein'].includes(cat);
      }
      return r.category === packId || (Array.isArray(r.categories) && r.categories.includes(packId));
    });

    // Pick top 4 recipes (sort by community madeCounts if available)
    const sorted = [...packRecipes].sort((a, b) => {
      const aMade = (communityStats && communityStats.madeCounts && communityStats.madeCounts[a.id]) || 0;
      const bMade = (communityStats && communityStats.madeCounts && communityStats.madeCounts[b.id]) || 0;
      return bMade - aMade;
    });

    targetRecipes = sorted.slice(0, 4);

    if (targetRecipes.length === 0) {
      showToast('No recipes found for this collection.');
      return;
    }

    let addedCount = 0;
    targetRecipes.forEach(rec => {
      if (!isRecipeInBatchPrep(rec.id)) {
        batchPrepQueueState.push({
          recipeId: rec.id,
          recipeName: rec.name,
          scale: 1.0
        });
        addedCount++;
      }
    });

    saveBatchPrepQueue();
    closeRecipePacksModal();
    openBatchPrepModal();

    if (addedCount > 0) {
      showToast(`🍱 Added ${addedCount} signature pints from "${packId}" to Sunday Batch Prep!`);
    } else {
      showToast(`All signature pints from "${packId}" are already in Sunday Batch Prep!`);
    }
  }

  // ==========================================================================
  // Creator CMS & Storefront Studio Engine (Path B)
  // ==========================================================================
  function openCreatorPortalModal() {
    const isCreator = Boolean(
      currentUser && (
        currentUser.role === 'creator' ||
        (currentMimicRole === 'creator' && isSuperAdminAccount(realAdminUser || currentUser))
      )
    );
    if (!isCreator) {
      showToast('⚠️ Creator Studio is reserved for content creators.');
      return;
    }
    if (currentUser && currentUser.role !== 'creator' && currentMimicRole === 'creator') {
      applyMimicRole('creator', false);
    }
    const modal = document.getElementById('creatorPortalModalOverlay');
    if (!modal) return;

    try {
      renderCreatorPortalContent();
    } catch (e) {
      console.warn('renderCreatorPortalContent warning:', e);
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeCreatorPortalModal() {
    const modal = document.getElementById('creatorPortalModalOverlay');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  function renderCreatorPortalContent() {
    const isMimicCreator = (realAdminUser && currentMimicRole === 'creator');
    const creatorId = (isMimicCreator && currentMimicCreatorId)
      ? currentMimicCreatorId
      : (currentUser && currentUser.creatorId ? currentUser.creatorId : 'fitness_product_finder');
    const creator = getCreatorById(creatorId);
    const creatorName = creator ? creator.name : 'Eli';
    const creatorBrand = creator ? `${creator.brandName} • ${creator.handle}` : 'Fitness Product Finder • @fitnessproductfinder';
    const handleSlug = creator && creator.handle ? creator.handle.replace('@', '') : 'fitnessproductfinder';

    // 1. Identity & Links
    const nameEl = document.getElementById('studioCreatorName');
    const brandEl = document.getElementById('studioCreatorBrand');
    const slugEl = document.getElementById('studioStorefrontSlug');
    if (nameEl) nameEl.textContent = creatorName;
    if (brandEl) brandEl.textContent = creatorBrand;
    if (slugEl) slugEl.textContent = `creamicravings.com/@${handleSlug}`;

    // 1b. Social Media & Card Attribution
    const currentSocials = (currentUser && currentUser.socialLinks) || (creator && creator.socialLinks) || {};
    const inputIg = document.getElementById('studioSocialInstagram');
    const inputTiktok = document.getElementById('studioSocialTiktok');
    const inputYt = document.getElementById('studioSocialYoutube');
    const inputWeb = document.getElementById('studioSocialWebsite');
    if (inputIg) inputIg.value = currentSocials.instagram || (creator ? creator.handle : '') || '';
    if (inputTiktok) inputTiktok.value = currentSocials.tiktok || (creator ? creator.handle : '') || '';
    if (inputYt) inputYt.value = currentSocials.youtube || '';
    if (inputWeb) inputWeb.value = currentSocials.website || (creator ? (creator.storeUrl || creator.url) : '') || '';

    // 2. Performance Analytics
    let totalSpins = 0;
    let creatorRecipes = [];
    let topRecipe = null;
    let topSpins = -1;

    allRecipes.forEach(r => {
      const cr = getRecipeCreator(r);
      if (cr && cr.id === creatorId) {
        creatorRecipes.push(r);
        const spins = (communityStats && communityStats.madeCounts && communityStats.madeCounts[r.id]) || 0;
        totalSpins += spins;
        if (spins > topSpins) {
          topSpins = spins;
          topRecipe = r;
        }
      }
    });

    const spinsEl = document.getElementById('studioTotalSpins');
    const totalRecEl = document.getElementById('studioTotalRecipes');
    const topRecEl = document.getElementById('studioTopRecipe');
    if (spinsEl) spinsEl.textContent = totalSpins > 0 ? totalSpins.toLocaleString() : '142';
    if (totalRecEl) totalRecEl.textContent = creatorRecipes.length > 0 ? creatorRecipes.length : '243';
    if (topRecEl) topRecEl.textContent = topRecipe ? topRecipe.name : 'Oreo McFlurry';

    // 2b. Live Telemetry Analytics & Pantry Demand Radar
    loadCreatorStudioAnalytics(creatorId);

    // 3. Digital Collections List
    const collectionsList = document.getElementById('studioCollectionsList');
    if (collectionsList && typeof BOOKS_MASTER !== 'undefined') {
      const creatorBooks = BOOKS_MASTER.filter(b => b.creatorId === creatorId && b.bookKey !== 'All-Access');
      collectionsList.innerHTML = creatorBooks.map(book => {
        const count = book.recipeCount || 50;
        return `
          <div class="creator-collection-row">
            <div class="collection-row-info">
              <span class="collection-row-title">${escapeHtml(book.title)}</span>
              <span class="collection-row-meta">${count} Verified Recipes • ${book.price} on Storefront</span>
            </div>
            <div class="collection-row-actions">
              <button type="button" class="btn-secondary btn-sm" data-action="studio-batch-pack" data-pack="${book.bookKey || book.categoryKey}">
                🍱 Batch Prep Top 4
              </button>
              <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="btn-secondary btn-sm" style="text-decoration: none;">
                Storefront ↗
              </a>
            </div>
          </div>
        `;
      }).join('');

      collectionsList.querySelectorAll('[data-action="studio-batch-pack"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const pack = btn.dataset.pack;
          closeCreatorPortalModal();
          batchPrepCreatorPack(pack);
        });
      });
    }

    // 3b. Manage & Edit Recipes in Your Books
    renderStudioRecipesManager(creatorId);

    const searchInput = document.getElementById('studioRecipeSearchInput');
    if (searchInput && !searchInput._bound) {
      searchInput._bound = true;
      searchInput.addEventListener('input', () => {
        renderStudioRecipesManager(creatorId, searchInput.value.trim());
      });
    }

    // 4. Perks, Brand Codes & Sponsors
    renderCreatorStudioPerks(creatorId);

    // 5. Creator VIP Member Circle
    loadAndRenderCreatorVips(creatorId);
  }

  async function loadCreatorStudioAnalytics(creatorId) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
      if (currentUser && currentUser.email) headers['X-User-Email'] = currentUser.email;

      const res = await fetch(`/api/creator/analytics?creatorId=${encodeURIComponent(creatorId)}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      if (data.status !== 'ok') return;

      // Update Spins
      if (typeof data.totalSpins === 'number' && data.totalSpins > 0) {
        const spinsEl = document.getElementById('studioTotalSpins');
        if (spinsEl) spinsEl.textContent = data.totalSpins.toLocaleString();
      }

      // Update Top Recipe
      if (data.topRecipes && data.topRecipes.length > 0) {
        const topRecEl = document.getElementById('studioTopRecipe');
        if (topRecEl) topRecEl.textContent = data.topRecipes[0].name;
      }

      // Update Click & Conversion Analytics
      const clicks = data.clicks || {};
      const sfClicksEl = document.getElementById('studioStorefrontClicks');
      const perkCopiesEl = document.getElementById('studioPerkCopies');
      const perkClicksEl = document.getElementById('studioPerkClicks');
      const bioViewsEl = document.getElementById('studioLinkInBioViews');
      if (sfClicksEl) sfClicksEl.textContent = (clicks.storefrontClicks || 0).toLocaleString();
      if (perkCopiesEl) perkCopiesEl.textContent = (clicks.perkCopies || 0).toLocaleString();
      if (perkClicksEl) perkClicksEl.textContent = (clicks.perkClicks || 0).toLocaleString();
      if (bioViewsEl) bioViewsEl.textContent = (clicks.linkInBioViews || 0).toLocaleString();

      // Update Announcement input if available
      const annInput = document.getElementById('studioAnnouncementInput');
      if (annInput && !annInput.value && data.announcement) {
        annInput.value = data.announcement;
      }

      // Render Audience Pantry Demand Radar
      if (Array.isArray(data.pantryDemand)) {
        renderPantryDemandRadar(data.pantryDemand);
      }
    } catch (e) {
      console.warn('Error fetching creator analytics:', e);
    }
  }

  function renderPantryDemandRadar(demandList) {
    const listEl = document.getElementById('studioPantryDemandList');
    if (!listEl) return;
    if (!demandList || demandList.length === 0) {
      listEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; font-size: 0.85rem; padding: 16px;">
          Telemetry gathering in progress... As users stock their virtual pantries, demand bars appear here!
        </div>
      `;
      return;
    }

    listEl.innerHTML = demandList.map(item => {
      const pct = item.percent || 0;
      let badgeClass = 'moderate';
      let badgeText = '👍 Popular';
      if (pct >= 65) {
        badgeClass = 'very-high';
        badgeText = '🔥 Very High Demand';
      } else if (pct >= 40) {
        badgeClass = 'high';
        badgeText = '✨ High Demand';
      }

      return `
        <div class="pantry-demand-item">
          <div class="pantry-demand-top">
            <span class="pantry-demand-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
            <span class="pantry-demand-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="pantry-demand-track">
            <div class="pantry-demand-fill" style="width: ${Math.min(100, Math.max(8, pct))}%;"></div>
          </div>
          <div class="pantry-demand-meta">
            <span>${pct}% of followers stock this</span>
            <span>${item.count} user kitchens</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderStudioRecipesManager(creatorId, searchQuery = '') {
    const listEl = document.getElementById('studioRecipesManageList');
    if (!listEl) return;

    let matchedRecipes = allRecipes.filter(r => {
      const cr = getRecipeCreator(r);
      const isCreatorMatch = (cr && cr.id === creatorId) || (r.creatorId === creatorId) || (creatorId === 'fitness_product_finder' && !r.isPersonal);
      if (!isCreatorMatch) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (r.name && r.name.toLowerCase().includes(q)) || (r.category && r.category.toLowerCase().includes(q));
      }
      return true;
    });

    if (matchedRecipes.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 0.88rem; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.1);">
          ${searchQuery ? 'No recipes found matching "' + escapeHtml(searchQuery) + '".' : 'No recipes found for this creator.'}
        </div>
      `;
      return;
    }

    listEl.innerHTML = matchedRecipes.slice(0, 60).map(r => {
      const hasVideo = !!r.videoUrl;
      return `
        <div class="creator-recipe-manage-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; gap: 10px; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <strong style="color: #f8fafc; font-size: 0.9rem;">${escapeHtml(r.name)}</strong>
              <span style="font-size: 0.72rem; padding: 2px 7px; border-radius: 999px; background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.3); color: #f472b6;">${escapeHtml(r.category || 'Official Book')}</span>
              ${hasVideo ? `
                <a href="${r.videoUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; padding: 2px 7px; border-radius: 999px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;">
                  🎬 Video Live ↗
                </a>
              ` : `
                <span style="font-size: 0.72rem; padding: 2px 7px; border-radius: 999px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24;">
                  ⚠️ No Video Link
                </span>
              `}
            </div>
            <span style="font-size: 0.75rem; color: #94a3b8;">${r.macros?.calories || 0} kcal • ${r.macros?.protein || '0g'} pro • Spin: ${r.spinSetting || 'Lite'}</span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn-primary btn-sm btn-studio-edit-recipe" data-recipe-id="${r.id}" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 600;">
              ✏️ Edit
            </button>
            <button type="button" class="btn-studio-caption-copy btn-sm" data-recipe-id="${r.id}" title="Copy formatted Instagram / TikTok caption">
              📋 Copy Caption
            </button>
            <button type="button" class="btn-secondary btn-sm btn-studio-caption-preview" data-recipe-id="${r.id}" title="Preview & Customize caption">
              👁️ Preview
            </button>
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.btn-studio-edit-recipe').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.dataset.recipeId;
        const target = allRecipes.find(x => x.id === rId) || (window.RECIPES_MASTER || []).find(x => x.id === rId);
        if (target) {
          closeCreatorPortalModal();
          openEditRecipeModal(target);
        }
      });
    });

    listEl.querySelectorAll('.btn-studio-caption-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.dataset.recipeId;
        const target = allRecipes.find(x => x.id === rId) || (window.RECIPES_MASTER || []).find(x => x.id === rId);
        if (target) {
          copySocialCaptionToClipboard(target);
          const origText = btn.innerHTML;
          btn.innerHTML = '✓ Copied!';
          setTimeout(() => { btn.innerHTML = origText; }, 1800);
        }
      });
    });

    listEl.querySelectorAll('.btn-studio-caption-preview').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.dataset.recipeId;
        const target = allRecipes.find(x => x.id === rId) || (window.RECIPES_MASTER || []).find(x => x.id === rId);
        if (target) {
          openSocialCaptionModal(target);
        }
      });
    });
  }

  // ==========================================================================
  // 1-Click Social Media Caption Generator Engine
  // ==========================================================================
  let activeCaptionRecipe = null;
  let activeCaptionPlatform = 'instagram';

  function generateSocialCaption(recipe, platform = 'instagram', includeLink = true, includeHashtags = true) {
    if (!recipe) return '';
    const creator = getRecipeCreator(recipe) || { name: 'Eli', handle: '@fitnessproductfinder' };
    const handle = (creator.handle || '@fitnessproductfinder').replace('@', '');
    const cals = recipe.macros?.calories || 0;
    const pro = recipe.macros?.protein || 0;
    const carbs = recipe.macros?.carbs || 0;
    const fat = recipe.macros?.fat || 0;
    const spin = recipe.spinSetting || 'Lite Ice Cream';

    const baseIngs = [];
    const mixinIngs = [];
    (recipe.ingredients || []).forEach(ing => {
      const name = ing.name || '';
      const amount = ing.amount || ing.quantity || '';
      const unit = ing.unit || '';
      const str = `${amount ? amount + ' ' : ''}${unit ? unit + ' ' : ''}${name}`.trim();
      if (ing.isMixIn || /mix-?in/i.test(name)) {
        mixinIngs.push(str.replace(/\s*\(mix-?in\)/i, ''));
      } else {
        baseIngs.push(str);
      }
    });

    if (platform === 'clean') {
      return `${recipe.name} (Ninja Creami Recipe)
Macros: ${cals} kcal | ${pro}g P | ${carbs}g C | ${fat}g F
Spin: ${spin}

Ingredients:
${baseIngs.map(i => '- ' + i).join('\n')}
${mixinIngs.length > 0 ? '\nMix-ins:\n' + mixinIngs.map(i => '- ' + i).join('\n') : ''}

Instructions:
1. Whisk base ingredients together and freeze for 16-24 hours.
2. Spin on "${spin}". Add a splash of liquid and re-spin if needed.
${mixinIngs.length > 0 ? '3. Add mix-ins and run on Mix-In setting.\n' : ''}
${includeLink ? `Interactive macro scaling & pantry matching: creamicravings.com/@${handle}\n` : ''}${includeHashtags ? '#ninjacreami #creamicravings #proteinicecream' : ''}`.trim();
    }

    if (platform === 'tiktok') {
      return `🍨 ${recipe.name.toUpperCase()} (Ninja Creami Recipe) 🤤
Hit save for your next late-night protein craving!

🔥 ${cals} CALORIES | 💪 ${pro}g PROTEIN
🍞 ${carbs}g Carbs | 🥑 ${fat}g Fat

🥣 THE RECIPE:
${baseIngs.map(i => '• ' + i).join('\n')}
${mixinIngs.length > 0 ? '\n🍫 MIX-INS:\n' + mixinIngs.map(i => '• ' + i).join('\n') : ''}

🌀 HOW TO SPIN IT:
1️⃣ Mix base & freeze flat 24 hours
2️⃣ Spin on ${spin}
3️⃣ Add 1 tbsp milk & Re-spin if powdery
${mixinIngs.length > 0 ? '4️⃣ Top with mix-ins on Mix-In setting\n' : ''}
${includeLink ? `📖 Tap the link in my bio to get all my official cookbook pints & match your pantry ingredients: creamicravings.com/@${handle} 🍦\n` : ''}
${includeHashtags ? '#ninjacreami #ninjacreamirecipe #proteinicecream #highprotein #macrofriendly #icecreamhack #creamicravings #fyp #desserthack' : ''}`.trim();
    }

    // Default: Instagram Post
    return `🍨 ${recipe.name} | High Protein Ninja Creami Recipe ✨
Silky, thick, and tastes like real ice cream shop soft-serve without the sugar crash!

📊 MACROS:
🔥 Calories: ${cals} kcal
💪 Protein: ${pro}g
🥑 Fat: ${fat}g
🍞 Carbs: ${carbs}g

🥣 INGREDIENTS:
${baseIngs.map(i => '• ' + i).join('\n')}
${mixinIngs.length > 0 ? '\n🍫 MIX-INS:\n' + mixinIngs.map(i => '• ' + i).join('\n') : ''}

🌀 SPIN DIRECTIONS:
1️⃣ Whisk base until smooth and freeze flat for 16-24 hours.
2️⃣ Spin on "${spin}".
3️⃣ Add a splash of milk & Re-spin once for velvety ribbons.
${mixinIngs.length > 0 ? '4️⃣ Create a center core, add mix-ins, and hit Mix-In!\n' : ''}
${includeLink ? `📖 Available in my official cookbook on Creami Cravings!
Interactive pantry-matching, instant batch scaling & grocery list at:
🔗 creamicravings.com/@${handle} (Link in bio!)\n` : ''}
${includeHashtags ? '#ninjacreami #ninjacreamirecipe #proteinicecream #highprotein #macrofriendly #icecreamlovers #creamicravings #ninjacreamideluxe #iifym #healthydessert' : ''}`.trim();
  }

  function openSocialCaptionModal(recipe) {
    if (!recipe) return;
    activeCaptionRecipe = recipe;
    const modal = document.getElementById('socialCaptionModalOverlay');
    const titleEl = document.getElementById('socialCaptionModalTitle');
    const textEl = document.getElementById('socialCaptionText');
    const chkLink = document.getElementById('chkCaptionIncludeLink');
    const chkHash = document.getElementById('chkCaptionIncludeHashtags');

    if (titleEl) titleEl.textContent = `📋 Caption for "${recipe.name}"`;
    if (textEl) {
      textEl.value = generateSocialCaption(
        recipe,
        activeCaptionPlatform,
        chkLink ? chkLink.checked : true,
        chkHash ? chkHash.checked : true
      );
    }

    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
    }
  }

  function closeSocialCaptionModal() {
    const modal = document.getElementById('socialCaptionModalOverlay');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      unlockBackgroundScroll();
    }
  }

  function copySocialCaptionToClipboard(recipe = null) {
    const target = recipe || activeCaptionRecipe;
    if (!target) return;
    const textEl = document.getElementById('socialCaptionText');
    const modal = document.getElementById('socialCaptionModalOverlay');
    const isModalOpen = modal && modal.classList.contains('active');
    const caption = (textEl && isModalOpen)
      ? textEl.value
      : generateSocialCaption(target, 'instagram', true, true);

    copyTextToClipboard(caption).then(() => {
      showToast('📋 Caption copied to clipboard! Ready to paste into Instagram or TikTok.');
    }).catch(() => {
      showToast('📋 Caption copied!');
    });
  }

  // ==========================================================================
  // Smart Recipe Quick-Paste Importer Engine
  // ==========================================================================
  function parseRawRecipeText(text) {
    if (!text || typeof text !== 'string') return null;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    let title = '';
    let calories = '';
    let protein = '';
    let carbs = '';
    let fat = '';
    let spin = 'Lite Ice Cream';
    let freezeTime = '16+ HOURS';
    const ingredients = [];
    const instructions = [];

    let currentSection = 'meta';

    // Regex matchers
    const calRegex = /(?:calories|cals?|kcal)\s*[:=-]?\s*(\d+)/i;
    const proRegex = /(?:protein|pro|p)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*g?/i;
    const carbRegex = /(?:carbs?|carbohydrates?|c)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*g?/i;
    const fatRegex = /(?:fat|fats?|f)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*g?/i;
    const slashMacroRegex = /(?:macros?|nutrition)\s*[:=-]?\s*(\d+)\s*(?:cal|cals?|kcal)?\s*[\/|,]\s*(\d+(?:\.\d+)?)\s*p?\s*[\/|,]\s*(\d+(?:\.\d+)?)\s*c?\s*[\/|,]\s*(\d+(?:\.\d+)?)\s*f?/i;

    // Check full text for slash macro format
    const slashMatch = text.match(slashMacroRegex);
    if (slashMatch) {
      calories = slashMatch[1];
      protein = slashMatch[2] + 'g';
      carbs = slashMatch[3] + 'g';
      fat = slashMatch[4] + 'g';
    }

    // Check full text for spin setting
    if (/sorbet/i.test(text)) spin = 'Sorbet';
    else if (/respin|re-spin/i.test(text) && !/lite ice cream/i.test(text)) spin = 'Respin';
    else if (/mix-?in/i.test(text) && !/lite ice cream/i.test(text) && !/ice cream/i.test(text)) spin = 'Mix-in';
    else if (/ice cream/i.test(text) && !/lite/i.test(text)) spin = 'Ice Cream';
    else spin = 'Lite Ice Cream';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      // Section triggers
      if (/^(?:ingredients|what you need|recipe|base):?$/i.test(lower) || lower.startsWith('ingredients:')) {
        currentSection = 'ingredients';
        const remainder = line.replace(/^ingredients:?\s*/i, '').trim();
        if (remainder) ingredients.push(remainder);
        continue;
      }
      if (/^(?:instructions|directions|how to make|steps|method):?$/i.test(lower) || lower.startsWith('instructions:')) {
        currentSection = 'instructions';
        const remainder = line.replace(/^instructions:?\s*/i, '').trim();
        if (remainder) instructions.push(remainder);
        continue;
      }
      if (/^(?:mix-?ins?|toppings?):?$/i.test(lower) || lower.startsWith('mix-ins:') || lower.startsWith('mix-in:')) {
        currentSection = 'mixins';
        const remainder = line.replace(/^mix-?ins?:?\s*/i, '').trim();
        if (remainder) ingredients.push(remainder.endsWith('(Mix-in)') ? remainder : remainder + ' (Mix-in)');
        continue;
      }

      // Title detection: first non-header, non-macro line
      if (!title && !calRegex.test(line) && !slashMacroRegex.test(line) && !line.startsWith('http') && !line.startsWith('#')) {
        title = line.replace(/^[#\*\-•\d\.\s🍨🍦✨🔥💪]+/, '').replace(/[:|].*$/, '').trim();
        continue;
      }

      // Macro extraction
      if (!calories && calRegex.test(line)) {
        const m = line.match(calRegex);
        if (m) calories = m[1];
      }
      if (!protein && proRegex.test(line)) {
        const m = line.match(proRegex);
        if (m) protein = m[1] + 'g';
      }
      if (!carbs && carbRegex.test(line)) {
        const m = line.match(carbRegex);
        if (m) carbs = m[1] + 'g';
      }
      if (!fat && fatRegex.test(line)) {
        const m = line.match(fatRegex);
        if (m) fat = m[1] + 'g';
      }

      // Content parsing by current section
      if (currentSection === 'ingredients') {
        const cleanIng = line.replace(/^[-*•\d\.)\s]+/, '').trim();
        if (cleanIng && !cleanIng.startsWith('#') && !cleanIng.startsWith('http')) {
          ingredients.push(cleanIng);
        }
      } else if (currentSection === 'mixins') {
        const cleanMix = line.replace(/^[-*•\d\.)\s]+/, '').trim();
        if (cleanMix && !cleanMix.startsWith('#')) {
          ingredients.push(cleanMix.endsWith('(Mix-in)') ? cleanMix : cleanMix + ' (Mix-in)');
        }
      } else if (currentSection === 'instructions') {
        const cleanInst = line.replace(/^[-*•\d\.)\s]+/, '').trim();
        if (cleanInst && !cleanInst.startsWith('#') && !cleanInst.startsWith('http')) {
          instructions.push(cleanInst);
        }
      } else {
        // Look for ingredient lines even without explicit section header
        if (/^\d+\s*(?:g|ml|oz|cups?|tbsp|tsp|scoops?)\s+/i.test(line) || /^[•*-]\s*\d+/i.test(line)) {
          const clean = line.replace(/^[-*•\s]+/, '').trim();
          ingredients.push(clean);
        }
      }
    }

    if (!title && lines.length > 0) title = lines[0].substring(0, 45);

    return {
      title,
      calories: calories || '280',
      protein: protein || '32g',
      carbs: carbs || '18g',
      fat: fat || '4g',
      spin,
      freezeTime,
      ingredients,
      instructions: instructions.length > 0 ? instructions.join('\n') : 'Whisk all ingredients and freeze flat for 16-24 hours. Spin on ' + spin + ', add a splash of milk and Re-spin if powdery.'
    };
  }

  function openSmartPasteModal() {
    const modal = document.getElementById('smartPasteModalOverlay');
    if (!modal) return;
    const rawInput = document.getElementById('smartPasteRawText');
    const previewSection = document.getElementById('smartPastePreviewSection');
    if (previewSection) previewSection.style.display = 'none';
    if (rawInput) rawInput.value = '';

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeSmartPasteModal() {
    const modal = document.getElementById('smartPasteModalOverlay');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  function applySmartParsedRecipe() {
    const name = document.getElementById('smartParsedName').value.trim();
    const cals = document.getElementById('smartParsedCalories').value.trim();
    const protein = document.getElementById('smartParsedProtein').value.trim();
    const carbs = document.getElementById('smartParsedCarbs').value.trim();
    const fat = document.getElementById('smartParsedFat').value.trim();
    const spin = document.getElementById('smartParsedSpin').value.trim();
    const ings = document.getElementById('smartParsedIngredients').value.trim();
    const inst = document.getElementById('smartParsedInstructions').value.trim();

    closeSmartPasteModal();

    // Open Custom Recipe Modal
    openCustomRecipeModal();

    // Switch to Manual Freeform Form
    const btnManual = document.getElementById('btnModeManual');
    if (btnManual) btnManual.click();

    // Populate manual form fields
    const crName = document.getElementById('crName');
    const crCalories = document.getElementById('crCalories');
    const crProtein = document.getElementById('crProtein');
    const crCarbs = document.getElementById('crCarbs');
    const crFat = document.getElementById('crFat');
    const crSpinSetting = document.getElementById('crSpinSetting');
    const crIngredients = document.getElementById('crIngredients');
    const crInstructions = document.getElementById('crInstructions');

    if (crName && name) crName.value = name;
    if (crCalories && cals) crCalories.value = cals;
    if (crProtein && protein) crProtein.value = protein;
    if (crCarbs && carbs) crCarbs.value = carbs;
    if (crFat && fat) crFat.value = fat;
    if (crSpinSetting && spin) {
      for (let i = 0; i < crSpinSetting.options.length; i++) {
        if (crSpinSetting.options[i].value.toLowerCase() === spin.toLowerCase()) {
          crSpinSetting.selectedIndex = i;
          break;
        }
      }
    }
    if (crIngredients && ings) crIngredients.value = ings;
    if (crInstructions && inst) crInstructions.value = inst;

    showToast('✨ Recipe loaded into builder! Review details and click Save Custom Recipe.');
  }

  function openStudioPerkEditor(perkToEdit = null) {
    const form = document.getElementById('studioPerkEditorForm');
    const title = document.getElementById('studioPerkEditorTitle');
    const idInput = document.getElementById('studioPerkEditorId');
    const brandInput = document.getElementById('studioPerkEditorBrand');
    const codeInput = document.getElementById('studioPerkEditorCode');
    const discountInput = document.getElementById('studioPerkEditorDiscount');
    const categoryInput = document.getElementById('studioPerkEditorCategory');
    const urlInput = document.getElementById('studioPerkEditorUrl');
    const descInput = document.getElementById('studioPerkEditorDesc');

    if (!form) return;

    if (perkToEdit) {
      if (title) title.textContent = '✏️ Edit Brand Sponsor / Code';
      if (idInput) idInput.value = perkToEdit.id || '';
      if (brandInput) brandInput.value = perkToEdit.brand || '';
      if (codeInput) codeInput.value = perkToEdit.code || '';
      if (discountInput) discountInput.value = perkToEdit.discount || '';
      if (categoryInput) categoryInput.value = perkToEdit.category || '';
      if (urlInput) urlInput.value = perkToEdit.url || '';
      if (descInput) descInput.value = perkToEdit.description || '';
    } else {
      if (title) title.textContent = '➕ Add Brand Sponsor or Promo Code';
      if (idInput) idInput.value = '';
      if (brandInput) brandInput.value = '';
      if (codeInput) codeInput.value = '';
      if (discountInput) discountInput.value = '';
      if (categoryInput) categoryInput.value = '';
      if (urlInput) urlInput.value = '';
      if (descInput) descInput.value = '';
    }

    form.style.display = 'block';
    if (brandInput) brandInput.focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeStudioPerkEditor() {
    const form = document.getElementById('studioPerkEditorForm');
    if (form) form.style.display = 'none';
  }

  async function saveStudioPerk() {
    const idInput = document.getElementById('studioPerkEditorId');
    const brandInput = document.getElementById('studioPerkEditorBrand');
    const codeInput = document.getElementById('studioPerkEditorCode');
    const discountInput = document.getElementById('studioPerkEditorDiscount');
    const categoryInput = document.getElementById('studioPerkEditorCategory');
    const urlInput = document.getElementById('studioPerkEditorUrl');
    const descInput = document.getElementById('studioPerkEditorDesc');
    const saveBtn = document.getElementById('btnStudioPerkEditorSave');

    const brand = brandInput ? brandInput.value.trim() : '';
    const discount = discountInput ? discountInput.value.trim() : '';
    const url = urlInput ? urlInput.value.trim() : '';
    const code = codeInput ? codeInput.value.trim() : '';
    const category = categoryInput ? categoryInput.value.trim() : 'Sponsor / Partner';
    const description = descInput ? descInput.value.trim() : '';
    const perkId = idInput ? idInput.value.trim() : '';

    if (!brand) {
      showToast('⚠️ Please provide a Brand or Sponsor name.');
      if (brandInput) brandInput.focus();
      return;
    }
    if (!discount) {
      showToast('⚠️ Please provide a Discount or Offer Tag (e.g. 15% OFF or Special Deal).');
      if (discountInput) discountInput.focus();
      return;
    }
    if (!url) {
      showToast('⚠️ Please provide a link/URL for your sponsor.');
      if (urlInput) urlInput.focus();
      return;
    }

    const isMimicCreator = (realAdminUser && currentMimicRole === 'creator');
    const creatorId = (isMimicCreator && currentMimicCreatorId)
      ? currentMimicCreatorId
      : (currentUser && currentUser.creatorId ? currentUser.creatorId : 'fitness_product_finder');

    const creator = getCreatorById(creatorId);
    let currentPerks = (creator && Array.isArray(creator.perks)) ? JSON.parse(JSON.stringify(creator.perks)) : [];

    const perkData = {
      id: perkId || ('perk_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)),
      brand,
      discount,
      category: category || 'Sponsor / Partner',
      code: code || null,
      description,
      url
    };

    if (perkId) {
      const idx = currentPerks.findIndex(p => p.id === perkId);
      if (idx !== -1) {
        currentPerks[idx] = perkData;
      } else {
        currentPerks.push(perkData);
      }
    } else {
      currentPerks.push(perkData);
    }

    const origBtnHtml = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>Saving...</span>';
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
      if (currentUser && currentUser.email) headers['X-User-Email'] = currentUser.email;

      const res = await fetch('/api/creator/perks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: currentUser ? currentUser.token : '',
          creatorId,
          perks: currentPerks
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const finalPerks = Array.isArray(data.perks) ? data.perks : currentPerks;
        if (currentUser) {
          if (!currentUser.perks) currentUser.perks = [];
          currentUser.perks = finalPerks;
        }
        if (!serverCreatorProfiles[creatorId]) {
          serverCreatorProfiles[creatorId] = { creatorId, perks: finalPerks };
        } else {
          serverCreatorProfiles[creatorId].perks = finalPerks;
        }
        saveUserAuth();
        closeStudioPerkEditor();
        renderCreatorStudioPerks(creatorId);
        showToast(`✅ "${brand}" saved to your brand codes & sponsors!`);
      } else {
        throw new Error(data.error || 'Server rejected perk update');
      }
    } catch (err) {
      console.warn('Error saving creator perk:', err);
      if (currentUser) {
        if (!currentUser.perks) currentUser.perks = [];
        currentUser.perks = currentPerks;
      }
      if (!serverCreatorProfiles[creatorId]) {
        serverCreatorProfiles[creatorId] = { creatorId, perks: currentPerks };
      } else {
        serverCreatorProfiles[creatorId].perks = currentPerks;
      }
      saveUserAuth();
      closeStudioPerkEditor();
      renderCreatorStudioPerks(creatorId);
      showToast(`✅ "${brand}" saved.`);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origBtnHtml;
      }
    }
  }

  async function deleteStudioPerk(perkId, creatorId) {
    if (!perkId) return;
    if (!confirm('Are you sure you want to remove this sponsor / discount code from your page?')) {
      return;
    }

    const creator = getCreatorById(creatorId);
    let currentPerks = (creator && Array.isArray(creator.perks)) ? JSON.parse(JSON.stringify(creator.perks)) : [];
    currentPerks = currentPerks.filter(p => p.id !== perkId);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
      if (currentUser && currentUser.email) headers['X-User-Email'] = currentUser.email;

      const res = await fetch('/api/creator/perks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: currentUser ? currentUser.token : '',
          creatorId,
          perks: currentPerks
        })
      });

      const data = await res.json();
      const finalPerks = (res.ok && data.success && Array.isArray(data.perks)) ? data.perks : currentPerks;
      if (currentUser) {
        if (!currentUser.perks) currentUser.perks = [];
        currentUser.perks = finalPerks;
      }
      if (!serverCreatorProfiles[creatorId]) {
        serverCreatorProfiles[creatorId] = { creatorId, perks: finalPerks };
      } else {
        serverCreatorProfiles[creatorId].perks = finalPerks;
      }
      saveUserAuth();
      renderCreatorStudioPerks(creatorId);
      showToast('🗑️ Sponsor removed.');
    } catch (err) {
      console.warn('Error deleting perk:', err);
      if (currentUser) {
        if (!currentUser.perks) currentUser.perks = [];
        currentUser.perks = currentPerks;
      }
      if (!serverCreatorProfiles[creatorId]) {
        serverCreatorProfiles[creatorId] = { creatorId, perks: currentPerks };
      } else {
        serverCreatorProfiles[creatorId].perks = currentPerks;
      }
      saveUserAuth();
      renderCreatorStudioPerks(creatorId);
      showToast('🗑️ Sponsor removed.');
    }
  }

  function renderCreatorStudioPerks(creatorId) {
    const perksGrid = document.getElementById('studioPerksCompactGrid');
    if (!perksGrid) return;
    const creator = getCreatorById(creatorId);
    const perks = (creator && Array.isArray(creator.perks)) ? creator.perks : [];

    if (perks.length === 0) {
      perksGrid.innerHTML = `
        <div style="grid-column: 1 / -1; background: rgba(15, 23, 42, 0.4); border: 1px dashed rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 20px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
          No sponsors or brand codes added yet.<br>
          <span style="font-size: 0.78rem; color: #64748b;">Click <strong>➕ Add Brand / Sponsor</strong> above to feature your favorite ingredients, equipment, and coupon codes on your storefront!</span>
        </div>
      `;
      return;
    }

    perksGrid.innerHTML = perks.map(p => `
      <div class="perk-compact-card" data-perk-id="${escapeHtml(p.id)}">
        <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <strong style="color: #f8fafc; font-size: 0.88rem;">${escapeHtml(p.brand)}</strong>
            <span style="font-size: 0.7rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 4px; padding: 1px 6px;">${escapeHtml(p.category || 'Partner')}</span>
          </div>
          <div style="font-size: 0.78rem; color: #10b981; font-weight: 600;">
            ${escapeHtml(p.discount || 'Special Deal')}
          </div>
          ${p.description ? `<p style="margin: 2px 0 0 0; font-size: 0.76rem; color: #94a3b8; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${escapeHtml(p.description)}</p>` : ''}
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
            ${p.code ? `<span class="perk-compact-code">CODE: ${escapeHtml(p.code)}</span>` : '<span style="font-size: 0.74rem; color: #94a3b8;">(Direct link deal)</span>'}
            ${p.url ? `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" style="font-size: 0.74rem; color: #ec4899; text-decoration: underline;">Test Link ↗</a>` : ''}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end; flex-shrink: 0;">
          <button type="button" class="btn-secondary btn-sm btn-studio-edit-perk" data-perk-id="${escapeHtml(p.id)}" style="padding: 4px 8px; font-size: 0.76rem;" title="Edit this sponsor / code">
            ✏️ Edit
          </button>
          <button type="button" class="btn-secondary btn-sm btn-studio-delete-perk" data-perk-id="${escapeHtml(p.id)}" style="padding: 4px 8px; font-size: 0.76rem; color: #f87171; border-color: rgba(239, 68, 68, 0.3);" title="Delete this sponsor">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    perksGrid.querySelectorAll('.btn-studio-edit-perk').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.dataset.perkId;
        const p = perks.find(item => item.id === pId);
        if (p) openStudioPerkEditor(p);
      });
    });

    perksGrid.querySelectorAll('.btn-studio-delete-perk').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.dataset.perkId;
        deleteStudioPerk(pId, creatorId);
      });
    });
  }

  async function loadAndRenderCreatorVips(creatorId) {
    const listEl = document.getElementById('studioVipsList');
    const badgeEl = document.getElementById('studioVipCountBadge');
    if (!listEl) return;

    listEl.innerHTML = `<div style="text-align: center; color: #94a3b8; font-size: 0.85rem; padding: 12px;">Loading VIP members...</div>`;

    try {
      const headers = {};
      if (currentUser && currentUser.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
      const res = await fetch('/api/creator/vips', { headers });
      if (!res.ok) {
        listEl.innerHTML = `<div style="color: #ef4444; font-size: 0.85rem; padding: 10px;">Failed to load VIP members (${res.status})</div>`;
        return;
      }
      const data = await res.json();
      const vips = data.vips || [];
      if (badgeEl) badgeEl.textContent = `${vips.length} ${vips.length === 1 ? 'VIP' : 'VIPs'}`;
      renderCreatorVipsList(vips);
    } catch (err) {
      console.error('[CREATOR VIPS] Error fetching VIPs:', err);
      listEl.innerHTML = `<div style="color: #ef4444; font-size: 0.85rem; padding: 10px;">Error loading VIPs: ${escapeHtml(err.message)}</div>`;
    }
  }

  function renderCreatorVipsList(vips) {
    const listEl = document.getElementById('studioVipsList');
    if (!listEl) return;

    if (!vips || vips.length === 0) {
      listEl.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px dashed rgba(255, 255, 255, 0.12); border-radius: 8px; padding: 18px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
          No VIP members added yet. Enter an email above to grant 100% unlocked access to your cookbooks!
        </div>
      `;
      return;
    }

    listEl.innerHTML = vips.map(v => {
      const email = typeof v === 'object' ? v.email : v;
      const addedDate = (typeof v === 'object' && v.added_at) ? new Date(v.added_at).toLocaleDateString() : 'Active';
      return `
        <div class="creator-vip-row" style="display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 14px; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0;">
              ⭐
            </div>
            <div style="min-width: 0;">
              <div style="font-weight: 600; color: #f8fafc; font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(email)}
              </div>
              <div style="color: #94a3b8; font-size: 0.74rem;">
                VIP Access Active • Granted ${escapeHtml(addedDate)}
              </div>
            </div>
          </div>
          <button type="button" class="btn-secondary btn-sm" data-action="remove-creator-vip" data-email="${escapeHtml(email)}" style="color: #f87171; border-color: rgba(239, 68, 68, 0.3); padding: 5px 10px; font-size: 0.78rem;">
            ✕ Remove
          </button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-action="remove-creator-vip"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.dataset.email;
        handleRemoveCreatorVip(email);
      });
    });
  }

  async function handleAddCreatorVip() {
    const emailInput = document.getElementById('studioNewVipEmail');
    if (!emailInput) return;
    const email = emailInput.value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }

    const btn = document.getElementById('btnStudioAddVip');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Adding...</span>';
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
      const res = await fetch('/api/creator/vips/add', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, token: currentUser ? currentUser.token : '' })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showToast(`❌ ${data.error || 'Failed to add VIP'}`);
        return;
      }

      showToast(`⭐ ${data.message || 'VIP access granted!'}`);
      emailInput.value = '';
      const creatorId = (currentUser && currentUser.creatorId) ? currentUser.creatorId : 'fitness_product_finder';
      loadAndRenderCreatorVips(creatorId);
    } catch (err) {
      console.error('[CREATOR VIPS] Add VIP error:', err);
      showToast(`❌ Error: ${err.message}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>⭐ Grant VIP Access</span>';
      }
    }
  }

  async function handleRemoveCreatorVip(email) {
    if (!email) return;
    if (!confirm(`Are you sure you want to remove VIP access for ${email}?`)) return;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
      const res = await fetch('/api/creator/vips/remove', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, token: currentUser ? currentUser.token : '' })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showToast(`❌ ${data.error || 'Failed to remove VIP'}`);
        return;
      }
      showToast(`Removed VIP access for ${email}`);
      const creatorId = (currentUser && currentUser.creatorId) ? currentUser.creatorId : 'fitness_product_finder';
      loadAndRenderCreatorVips(creatorId);
    } catch (err) {
      console.error('[CREATOR VIPS] Remove VIP error:', err);
      showToast(`❌ Error: ${err.message}`);
    }
  }

  let activeClaimPackName = null;

  function openClaimAccessModal(packName = 'All-Access') {
    if (!currentUser) {
      if (recipePacksModalOverlay) closeRecipePacksModal();
      openGoogleAuthModal();
      showToast('🔑 Please sign in with Google first so we can attach your cookbook access to your account!');
      return;
    }

    activeClaimPackName = packName;
    const modal = document.getElementById('claimAccessModalOverlay');
    if (!modal) return;

    const packNameEl = document.getElementById('claimModalPackName');
    if (packNameEl) packNameEl.textContent = `${packName} E-Book`;

    const accountEmailInput = document.getElementById('claimAccountEmail');
    if (accountEmailInput) accountEmailInput.value = currentUser.email || '';

    const checkoutEmailInput = document.getElementById('claimCheckoutEmail');
    if (checkoutEmailInput) {
      checkoutEmailInput.value = currentUser.email || '';
    }

    const orderIdInput = document.getElementById('claimOrderId');
    if (orderIdInput) orderIdInput.value = '';

    const notesInput = document.getElementById('claimNotes');
    if (notesInput) notesInput.value = '';

    const formView = document.getElementById('claimModalFormView');
    const successView = document.getElementById('claimModalSuccessView');
    if (formView) formView.style.display = 'block';
    if (successView) successView.style.display = 'none';

    const submitBtn = document.getElementById('btnSubmitClaimModal');
    if (submitBtn) submitBtn.disabled = false;
    const submitText = document.getElementById('btnSubmitClaimText');
    if (submitText) submitText.textContent = '🚀 Submit Verification Claim';

    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeClaimAccessModal() {
    const modal = document.getElementById('claimAccessModalOverlay');
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
    activeClaimPackName = null;
  }

  async function handleClaimAccessSubmit(e) {
    e.preventDefault();
    if (!currentUser) {
      closeClaimAccessModal();
      openGoogleAuthModal();
      return;
    }

    const packName = activeClaimPackName || 'All-Access';
    const checkoutEmail = (document.getElementById('claimCheckoutEmail')?.value || '').trim();
    const orderId = (document.getElementById('claimOrderId')?.value || '').trim();
    const notes = (document.getElementById('claimNotes')?.value || '').trim();

    if (!orderId) {
      showToast('⚠️ Please enter your Payhip or Shopify Order ID / Receipt number.');
      return;
    }

    const submitBtn = document.getElementById('btnSubmitClaimModal');
    const submitText = document.getElementById('btnSubmitClaimText');
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = '⏳ Submitting claim...';

    try {
      const res = await fetch('/api/purchase-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          userId: currentUser.id,
          action: 'claim_existing',
          pack: packName,
          orderId: orderId,
          checkoutEmail: checkoutEmail,
          notes: notes,
          timestamp: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        userPendingClaimsState.add(packName);
        localStorage.setItem('creami_pending_claims_v1', JSON.stringify(Array.from(userPendingClaimsState)));

        updatePacksModalStatuses();
        recipeCardCache.clear();
        renderRecipes();

        const formView = document.getElementById('claimModalFormView');
        const successView = document.getElementById('claimModalSuccessView');
        const successPackEl = document.getElementById('claimSuccessPackName');
        if (successPackEl) successPackEl.textContent = `${packName} E-Book`;
        if (formView) formView.style.display = 'none';
        if (successView) successView.style.display = 'block';

        showToast(`🎉 Access claim for "${packName}" submitted successfully!`);
      } else {
        showToast(`⚠️ ${data.message || 'Failed to submit claim. Please try again.'}`);
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = '🚀 Submit Verification Claim';
      }
    } catch (err) {
      console.error('Submit claim error:', err);
      showToast('Connection error while submitting claim. Please try again.');
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = '🚀 Submit Verification Claim';
    }
  }

  function handleClaimPackAccess(packName) {
    if (!currentUser) {
      closeRecipePacksModal();
      openGoogleAuthModal();
      showToast('🔑 Please sign in with Google to claim access to your purchased e-book!');
      return;
    }
    openClaimAccessModal(packName);
  }

  function updateCategoryCounts() {
    const accessible = allRecipes.filter(r => isRecipeAccessible(r));

    const counts = {
      all: accessible.length,
      'Base Flavors': 0,
      'Community Legends': 0,
      'Fan Favorites': 0,
      'Keto': 0,
      'Lactose Free': 0,
      'No Protein': 0,
      favorites: favoritesState.size
    };

    accessible.forEach(r => {
      const cats = getAccessibleRecipeCategories(r);
      cats.forEach(cat => {
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });
    });

    const elAll = document.getElementById('countAll');
    const elBase = document.getElementById('countBase');
    const elLegends = document.getElementById('countLegends');
    const elFan = document.getElementById('countFan');
    const elKeto = document.getElementById('countKeto');
    const elLactose = document.getElementById('countLactose');
    const elNoPro = document.getElementById('countNoProtein');
    const elFav = document.getElementById('countFavorites');
    const elCustom = document.getElementById('countCustom');
    const tabCustom = document.getElementById('tabCustomRecipes');

    if (elAll) elAll.textContent = counts.all;
    if (elBase) elBase.textContent = counts['Base Flavors'] || 0;
    if (elLegends) elLegends.textContent = counts['Community Legends'] || 0;
    if (elFan) elFan.textContent = counts['Fan Favorites'] || 0;
    if (elKeto) elKeto.textContent = counts['Keto'] || 0;
    if (elLactose) elLactose.textContent = counts['Lactose Free'] || 0;
    if (elNoPro) elNoPro.textContent = counts['No Protein'] || 0;
    if (elFav) elFav.textContent = counts.favorites;
    if (elCustom) elCustom.textContent = customRecipesState.length;
    if (tabCustom) {
      tabCustom.style.display = (currentUser && customRecipesState.length > 0) ? 'inline-flex' : 'none';
    }

    // Update category tab visibility based on access
    const lockedCategories = ['Fan Favorites', 'Keto', 'Lactose Free', 'No Protein'];
    lockedCategories.forEach(cat => {
      const tab = categoryTabs ? categoryTabs.querySelector(`[data-category="${cat}"]`) : null;
      if (tab) {
        const unlocked = isCategoryUnlocked(cat);
        tab.style.display = unlocked ? 'inline-flex' : 'none';
      }
    });

    // Update lock indicators on category tabs
    const lockFan = document.getElementById('lockFan');
    const lockKeto = document.getElementById('lockKeto');
    const lockLactose = document.getElementById('lockLactose');
    const lockNoPro = document.getElementById('lockNoProtein');

    if (lockFan) lockFan.style.display = isCategoryUnlocked('Fan Favorites') ? 'none' : 'inline';
    if (lockKeto) lockKeto.style.display = isCategoryUnlocked('Keto') ? 'none' : 'inline';
    if (lockLactose) lockLactose.style.display = isCategoryUnlocked('Lactose Free') ? 'none' : 'inline';
    if (lockNoPro) lockNoPro.style.display = isCategoryUnlocked('No Protein') ? 'none' : 'inline';

    // Conditionally hide Keto / Low Carb filters & pantry preset if user has no access to Keto
    const isKetoUnlocked = isCategoryUnlocked('Keto');
    const presetKeto = document.getElementById('presetKetoChip');
    if (presetKeto) {
      presetKeto.style.display = isKetoUnlocked ? 'inline-flex' : 'none';
    }

    const dietOptLowCarb = document.getElementById('dietOptLowCarb');
    if (dietOptLowCarb) {
      dietOptLowCarb.style.display = isKetoUnlocked ? '' : 'none';
      dietOptLowCarb.hidden = !isKetoUnlocked;
      if (!isKetoUnlocked && activeDietFilter === 'low_carb') {
        activeDietFilter = 'all';
        if (dietFilterSelect) {
          dietFilterSelect.value = 'all';
          dietFilterSelect.classList.remove('active');
        }
      }
    }
  }

  function updateStats() {
    const visibleItems = getUserPantryIngredients();
    const inStockVisible = visibleItems.filter(it => pantryState.has(it.id)).length;
    if (statPantryCount) statPantryCount.textContent = inStockVisible;
    if (pantryInStockCount) pantryInStockCount.textContent = `${inStockVisible}/${visibleItems.length} items`;
    const tabRecipeCount = document.getElementById('mobileTabRecipeCount');
    const tabPantryCount = document.getElementById('mobileTabPantryCount');
    const navPantryBadge = document.getElementById('navPantryBadge');
    const accessibleTotal = (typeof allRecipes !== 'undefined' && Array.isArray(allRecipes))
      ? allRecipes.filter(r => isRecipeAccessible(r)).length
      : 0;
    if (tabRecipeCount) tabRecipeCount.textContent = accessibleTotal;
    if (tabPantryCount) tabPantryCount.textContent = inStockVisible;
    if (navPantryBadge) {
      navPantryBadge.textContent = inStockVisible;
      navPantryBadge.style.display = inStockVisible > 0 ? 'inline-block' : 'none';
    }
  }

  // --- Mobile View Switcher & Bottom Nav (Roadmap Item 13) ---
  let activeMobileView = 'recipes'; // 'recipes' or 'pantry'

  function setMobileView(view) {
    activeMobileView = view;
    const pantryPanel = document.getElementById('pantryPanel');
    const recipesPanel = document.querySelector('.recipes-panel');
    const tabRecipes = document.getElementById('mobileTabRecipes');
    const tabPantry = document.getElementById('mobileTabPantry');
    const navRecipes = document.getElementById('navItemRecipes');
    const navPantry = document.getElementById('navItemPantry');

    if (view === 'recipes') {
      if (pantryPanel) pantryPanel.classList.add('mobile-panel-hidden');
      if (recipesPanel) recipesPanel.classList.remove('mobile-panel-hidden');
      if (tabRecipes) {
        tabRecipes.classList.add('active');
        tabRecipes.setAttribute('aria-selected', 'true');
      }
      if (tabPantry) {
        tabPantry.classList.remove('active');
        tabPantry.setAttribute('aria-selected', 'false');
      }
      if (navRecipes) navRecipes.classList.add('active');
      if (navPantry) navPantry.classList.remove('active');
    } else {
      if (recipesPanel) recipesPanel.classList.add('mobile-panel-hidden');
      if (pantryPanel) pantryPanel.classList.remove('mobile-panel-hidden');
      if (tabRecipes) {
        tabRecipes.classList.remove('active');
        tabRecipes.setAttribute('aria-selected', 'false');
      }
      if (tabPantry) {
        tabPantry.classList.add('active');
        tabPantry.setAttribute('aria-selected', 'true');
      }
      if (navRecipes) navRecipes.classList.remove('active');
      if (navPantry) navPantry.classList.add('active');
    }
  }

  // --- Recipe Helper Functions ---
  function scaleQuantity(qtyStr, scale) {
    if (!qtyStr || scale === 1.0) return qtyStr;
    const s = String(qtyStr).trim();
    
    const fractionMap = {
      '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 0.33, '⅔': 0.67, '⅛': 0.125
    };
    if (fractionMap[s] !== undefined) {
      const val = fractionMap[s] * scale;
      return formatScaledNumber(val);
    }

    if (s.toLowerCase() === 'a pinch') {
      return scale > 1 ? '2 pinches' : 'A pinch';
    }

    return s.replace(/(\d+(?:\.\d+)?)/g, (match) => {
      const num = parseFloat(match);
      const scaled = num * scale;
      return formatScaledNumber(scaled);
    });
  }

  function formatScaledNumber(num) {
    if (Math.abs(num - Math.round(num)) < 0.05) {
      return Math.round(num).toString();
    }
    const frac = num - Math.floor(num);
    const whole = Math.floor(num);
    let fracStr = '';
    if (Math.abs(frac - 0.5) < 0.08) fracStr = '½';
    else if (Math.abs(frac - 0.25) < 0.08) fracStr = '¼';
    else if (Math.abs(frac - 0.75) < 0.08) fracStr = '¾';
    else if (Math.abs(frac - 0.33) < 0.08) fracStr = '⅓';

    if (fracStr) {
      return whole > 0 ? `${whole} ${fracStr}` : fracStr;
    }
    const rounded = Math.round(num * 10) / 10;
    return rounded.toString();
  }

  function scaleMacroVal(valStr, scale) {
    if (!valStr || valStr === '—' || scale === 1.0) return valStr;
    const match = String(valStr).match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return valStr;
    const num = parseFloat(match[1]);
    const unit = match[2] || '';
    const scaledNum = Math.round(num * scale);
    return `${scaledNum}${unit}`;
  }

  function extractSubstitution(notes) {
    if (!notes) return '';
    const n = String(notes);
    const subMatch = n.match(/(?:can sub with|sub with)\s+([^;,()]+)/i);
    if (subMatch) {
      return subMatch[1].trim();
    }
    const orMatch = n.match(/\bOR\s+([^;,()]+)/i);
    if (orMatch) {
      return orMatch[1].trim();
    }
    return '';
  }

  function formatIngredientAmount(ing, scale = 1.0, unitMode = 'metric') {
    if (!ing) return '';
    const notes = ing.notes || '';
    
    // Check if US/Spoons mode requested and alternate measurement exists in notes
    if (unitMode === 'spoons') {
      const altMatch = notes.match(/alt measurement:\s*([^;,\)]+)/i);
      if (altMatch) {
        return scaleQuantity(altMatch[1].trim(), scale);
      }
      const qtyNum = parseFloat(ing.quantity);
      const unit = (ing.unit || '').toLowerCase();
      if (!isNaN(qtyNum) && unit === 'g') {
        if (qtyNum === 1) return scaleQuantity('¼ tsp', scale);
        if (qtyNum === 2.5) return scaleQuantity('½ tsp', scale);
        if (qtyNum === 5) return scaleQuantity('1 tsp', scale);
        if (qtyNum === 10) return scaleQuantity('2 tsp', scale);
        if (qtyNum === 15) return scaleQuantity('1 tbsp', scale);
        if (qtyNum === 20 || qtyNum === 25) return scaleQuantity('1.5 tbsp', scale);
        if (qtyNum === 30) return scaleQuantity('1 scoop (~2 tbsp)', scale);
        if (qtyNum === 50) return scaleQuantity('~¼ cup', scale);
      }
    }

    const qty = (ing.quantity != null ? String(ing.quantity) : '').trim();
    const unit = (ing.unit != null ? String(ing.unit) : '').trim();
    if (!qty && !unit) return '';
    
    const scaledQty = scaleQuantity(qty, scale);
    if (!unit) return scaledQty;
    if (!scaledQty) return unit;
    if (scaledQty.toLowerCase().includes(unit.toLowerCase())) {
      return scaledQty;
    }
    return `${scaledQty} ${unit}`;
  }

  function getRatingLabel(rating) {
    switch (rating) {
      case 5: return '5/5 — Absolute Perfection! 🍨';
      case 4: return '4/5 — Delicious / Highly Recommended';
      case 3: return '3/5 — Good / Standard Creami';
      case 2: return '2/5 — Needed Adjustments';
      case 1: return '1/5 — Not a Fan';
      default: return 'Click a star to rate';
    }
  }

  // 1-Tap Clipboard Copy Helper (Roadmap Item 10)
  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((resolve, reject) => {
        try {
          const successful = document.execCommand('copy');
          textArea.remove();
          successful ? resolve() : reject(new Error('ExecCommand copy failed'));
        } catch (err) {
          textArea.remove();
          reject(err);
        }
      });
    }
  }

  // --- Portable Custom Recipe URL Encoding & Decoding ---
  function encodePortableCustomRecipe(recipe) {
    try {
      const compact = {
        n: recipe.name || 'Custom Creami Creation',
        c: recipe.category || 'Custom',
        s: recipe.spinSetting || 'Lite Ice Cream',
        ft: recipe.freezeTime || '16+ HOURS',
        pt: recipe.prepTime || '2 MIN',
        m: recipe.makes || '1 PINT (16 oz)',
        cs: recipe.creaminessScore || null,
        cg: recipe.creaminessGrade || null,
        mc: recipe.macros || {},
        ins: (recipe.instructions && Array.isArray(recipe.instructions)) ? recipe.instructions : [],
        by: (currentUser && (currentUser.name || currentUser.username)) || 'A Creami Chef',
        ing: (recipe.ingredients || []).map(ing => ({
          n: ing.name,
          q: ing.quantity || '',
          u: ing.unit || '',
          r: ing.raw || '',
          s: ing.section || '',
          m: ing.isMixin ? 1 : 0,
          c: ing.category || ''
        }))
      };
      const jsonStr = JSON.stringify(compact);
      // UTF-8 safe base64url encoding
      const b64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      console.error('Failed to encode custom recipe for sharing:', e);
      return null;
    }
  }

  function decodePortableCustomRecipe(encodedStr) {
    try {
      if (!encodedStr) return null;
      let b64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const jsonStr = decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const compact = JSON.parse(jsonStr);
      if (!compact || !compact.n) return null;

      const instructions = Array.isArray(compact.ins) && compact.ins.length > 0
        ? compact.ins
        : [
            `Add all base ingredients to your ${compact.m || 'Ninja Creami'} pint container.`,
            `Smooth the top surface flat, freeze on a level shelf for ${compact.ft || '16+ hours'}.`,
            `Spin on the "${compact.s || 'Lite Ice Cream'}" program.`,
            ...(compact.ing && compact.ing.some(i => i.m) ? ['Make a 1.5-inch core down the center, add mix-ins, and press Mix-In program.'] : ['Respin if needed for silky texture. Enjoy!'])
          ];

      const recipe = {
        id: `shared_cr_${Date.now()}`,
        name: compact.n,
        category: 'Custom',
        categories: ['Custom'],
        isPersonal: true,
        isSharedPortable: true,
        sharedAuthor: compact.by || 'A Creami Chef',
        sourceFile: `Shared by ${compact.by || 'A Creami Chef'}`,
        spinSetting: compact.s || 'Lite Ice Cream',
        freezeTime: compact.ft || '16+ HOURS',
        prepTime: compact.pt || '2 MIN',
        makes: compact.m || '1 PINT (16 oz)',
        creaminessScore: compact.cs,
        creaminessGrade: compact.cg,
        macros: compact.mc || { calories: '0', protein: '0g', carbs: '0g', fat: '0g', sugar: '0g', fiber: '0g' },
        instructions: instructions,
        ingredients: (compact.ing || []).map(ing => ({
          name: ing.n,
          quantity: ing.q || '',
          unit: ing.u || '',
          raw: ing.r || (ing.q ? `${ing.q} ${ing.n}` : ing.n),
          section: ing.s || (ing.m ? 'Mix-in' : 'Base'),
          isMixin: Boolean(ing.m),
          category: ing.c || (ing.m ? 'mixin' : 'liquid')
        }))
      };
      return recipe;
    } catch (e) {
      console.error('Failed to decode portable custom recipe:', e);
      return null;
    }
  }

  // Helper: Resolve creator and social media attribution for sharing & story cards
  function getStoryCardAttribution(recipe) {
    if (!recipe) return { isCreator: false };

    const isCurrentUserCreator = (currentUser && currentUser.role === 'creator');
    const mimicCreatorId = (typeof currentMimicCreatorId !== 'undefined' && currentMimicCreatorId) ? currentMimicCreatorId : null;
    const isMimicCreator = (typeof currentMimicRole !== 'undefined' && currentMimicRole === 'creator');

    const recipeCreator = (typeof getRecipeCreator === 'function') ? getRecipeCreator(recipe) : null;

    let creatorObj = null;
    let socialLinks = null;

    if (isCurrentUserCreator) {
      const cId = (currentUser && currentUser.creatorId) || 'fitness_product_finder';
      creatorObj = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === cId) : null;
      socialLinks = (currentUser && currentUser.socialLinks) || (creatorObj && creatorObj.socialLinks) || null;
    } else if (isMimicCreator && mimicCreatorId) {
      creatorObj = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === mimicCreatorId) : null;
      socialLinks = (creatorObj && creatorObj.socialLinks) || null;
    } else if (recipeCreator) {
      creatorObj = recipeCreator;
      const creatorUser = (typeof adminUsersState !== 'undefined' && Array.isArray(adminUsersState))
        ? adminUsersState.find(u => u.creatorId === recipeCreator.id && u.socialLinks)
        : null;
      socialLinks = (creatorUser && creatorUser.socialLinks) || recipeCreator.socialLinks || null;
    }

    if (!creatorObj && !socialLinks) {
      return { isCreator: false };
    }

    const name = (creatorObj ? creatorObj.name : null) || (currentUser ? (currentUser.name || currentUser.username) : 'Creator');
    const brandName = (creatorObj ? creatorObj.brandName : null) || (currentUser ? currentUser.brandName : '') || `${name}'s Kitchen`;
    const handle = (socialLinks && (socialLinks.instagram || socialLinks.tiktok)) || (creatorObj ? creatorObj.handle : '') || '';
    const cleanHandle = handle.startsWith('http')
      ? handle.replace(/https?:\/\/(www\.)?(instagram\.com|tiktok\.com)\/@?/i, '@')
      : (handle && !handle.startsWith('@') ? `@${handle}` : handle);

    return {
      isCreator: true,
      creatorObj,
      name,
      brandName,
      handle: cleanHandle,
      socialLinks: socialLinks || {},
      website: (socialLinks && socialLinks.website) || (creatorObj ? (creatorObj.storeUrl || creatorObj.url) : '') || ''
    };
  }

  function formatSocialUrl(platform, raw) {
    if (!raw) return '';
    const clean = String(raw).trim();
    if (!clean) return '';
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

    if (platform === 'instagram') {
      const handle = clean.replace(/^@+/, '');
      return `https://www.instagram.com/${handle}/`;
    }
    if (platform === 'tiktok') {
      const handle = clean.startsWith('@') ? clean : `@${clean}`;
      return `https://www.tiktok.com/${handle}`;
    }
    if (platform === 'youtube') {
      if (clean.startsWith('c/') || clean.startsWith('channel/') || clean.startsWith('user/')) {
        return `https://www.youtube.com/${clean}`;
      }
      const handle = clean.startsWith('@') ? clean : `@${clean}`;
      return `https://www.youtube.com/${handle}`;
    }
    if (platform === 'website') {
      return `https://${clean}`;
    }
    return clean;
  }

  function renderSocialLinksPills(socialLinks, compact = false, extraWebsite = '') {
    if (!socialLinks && !extraWebsite) return '';
    const links = socialLinks || {};
    const website = links.website || extraWebsite;
    const items = [];

    if (links.instagram) {
      const url = formatSocialUrl('instagram', links.instagram);
      const display = compact ? 'IG' : (links.instagram.startsWith('@') ? links.instagram : `@${links.instagram}`);
      items.push(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="social-pill-link ig ${compact ? 'compact' : ''}" onclick="event.stopPropagation();" title="Instagram: ${escapeHtml(links.instagram)}"><span class="social-icon">📸</span><span>${escapeHtml(display)}</span></a>`);
    }

    if (links.tiktok) {
      const url = formatSocialUrl('tiktok', links.tiktok);
      const display = compact ? 'TT' : (links.tiktok.startsWith('@') ? links.tiktok : `@${links.tiktok}`);
      items.push(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="social-pill-link tt ${compact ? 'compact' : ''}" onclick="event.stopPropagation();" title="TikTok: ${escapeHtml(links.tiktok)}"><span class="social-icon">🎵</span><span>${escapeHtml(display)}</span></a>`);
    }

    if (links.youtube) {
      const url = formatSocialUrl('youtube', links.youtube);
      const display = compact ? 'YT' : 'YouTube';
      items.push(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="social-pill-link yt ${compact ? 'compact' : ''}" onclick="event.stopPropagation();" title="YouTube"><span class="social-icon">▶️</span><span>${escapeHtml(display)}</span></a>`);
    }

    if (website) {
      const url = formatSocialUrl('website', website);
      const display = compact ? 'Store' : 'Website';
      items.push(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="social-pill-link web ${compact ? 'compact' : ''}" onclick="event.stopPropagation();" title="${escapeHtml(url)}"><span class="social-icon">🌐</span><span>${escapeHtml(display)}</span></a>`);
    }

    if (items.length === 0) return '';
    return `<div class="creator-social-pills-wrap ${compact ? 'compact' : ''}">${items.join('')}</div>`;
  }

  // 1-Tap Recipe Sharing & Deep Linking (Roadmap Item 22)
  function shareRecipe(recipe, buttonEl) {
    if (!recipe) return;
    const isCustom = Boolean(recipe.category === 'Custom' || recipe.isPersonal || (recipe.id && recipe.id.startsWith('custom_')));
    let shareUrl = `${window.location.origin}/recipe/${encodeURIComponent(recipe.id)}`;

    if (isCustom) {
      const portableCode = encodePortableCustomRecipe(recipe);
      if (portableCode) {
        shareUrl = `${window.location.origin}/recipe/share?r=${portableCode}`;
      }
    }

    const attrib = getStoryCardAttribution(recipe);
    const macroStr = recipe.macros ? ` (${recipe.macros.protein || ''} protein, ${recipe.macros.calories || ''} cal)` : '';
    let shareText = '';
    if (attrib.isCreator) {
      shareText = `Check out ${recipe.name} by ${attrib.name}!${macroStr} Follow ${attrib.handle || attrib.name}`;
    } else if (isCustom) {
      shareText = `Check out my custom Creami creation: ${recipe.name}!${macroStr}`;
    } else {
      shareText = `Check out ${recipe.name} on Creami Cravings!${macroStr}`;
    }

    const shareData = {
      title: attrib.isCreator ? `${recipe.name} by ${attrib.name}` : `${recipe.name} — Creami Cravings`,
      text: shareText,
      url: shareUrl
    };

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== 'AbortError') {
          copyRecipeLinkFallback(shareUrl, recipe.name, buttonEl, isCustom);
        }
      });
    } else {
      copyRecipeLinkFallback(shareUrl, recipe.name, buttonEl, isCustom);
    }
  }

  function copyRecipeLinkFallback(url, recipeName, buttonEl, isCustom = false) {
    copyTextToClipboard(url).then(() => {
      if (buttonEl) {
        const origHtml = buttonEl.innerHTML;
        buttonEl.innerHTML = '<span>✓ Copied!</span>';
        buttonEl.classList.add('copied');
        setTimeout(() => {
          buttonEl.innerHTML = origHtml;
          buttonEl.classList.remove('copied');
        }, 2500);
      }
      showToast(isCustom 
        ? `🔗 Portable share link for "${recipeName}" copied! Anyone can open and save it.`
        : `🔗 Share link for "${recipeName}" copied to clipboard!`
      );
    }).catch(() => {
      showToast('Failed to copy link to clipboard');
    });
  }

  // ==========================================================================
  // 📸 Story & Social Card Generator Engine (Canvas-Based)
  // ==========================================================================
  let currentStoryRecipe = null;
  let currentStoryRatio = 'story'; // 'story' (9:16) or 'square' (1:1)
  let currentStoryBlob = null;
  let currentStoryFile = null;
  let currentStoryDataUrl = null;
  let storyRenderingPromise = null;

  let currentStoryTheme = (function() {
    try {
      return localStorage.getItem('creami_story_theme') || 'berry';
    } catch (e) {
      return 'berry';
    }
  })();

  let currentStoryShowStreak = (function() {
    try {
      return localStorage.getItem('creami_story_show_streak') !== 'false';
    } catch (e) {
      return true;
    }
  })();

  const STORY_THEMES = {
    berry: {
      id: 'berry',
      name: 'Neon Berry',
      icon: '🍓',
      bgStops: [
        [0, '#831843'],    // Deep berry
        [0.22, '#be185d'], // Vivid magenta
        [0.50, '#4c1d95'], // Electric violet
        [0.78, '#1e1b4b'], // Night indigo
        [1, '#0f172a']     // Deep obsidian
      ],
      glows: [
        { x: 0.85, y: 0.08, r: 0.85, stops: ['rgba(244, 63, 94, 0.75)', 'rgba(236, 72, 153, 0.35)', 'transparent'] },
        { x: 0.15, y: 0.25, r: 0.75, stops: ['rgba(168, 85, 247, 0.65)', 'rgba(124, 58, 237, 0.25)', 'transparent'] },
        { x: 0.5, y: 0.92, r: 0.80, stops: ['rgba(244, 63, 94, 0.55)', 'rgba(217, 70, 239, 0.25)', 'transparent'] }
      ],
      particles: [
        { x: 90, y: 140, s: 20, char: '✦', color: 'rgba(244, 114, 182, 0.75)' },
        { x: 990, y: 160, s: 24, char: '✨', color: 'rgba(251, 191, 36, 0.8)' },
        { x: 50, y: 440, s: 22, char: '🍓', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 1030, y: 460, s: 18, char: '★', color: 'rgba(244, 114, 182, 0.65)' },
        { x: 45, y: 920, s: 22, char: '✨', color: 'rgba(249, 168, 212, 0.75)' },
        { x: 1035, y: 940, s: 20, char: '✦', color: 'rgba(192, 132, 252, 0.7)' },
        { x: 55, y: 1380, s: 22, char: '★', color: 'rgba(244, 114, 182, 0.65)' },
        { x: 1025, y: 1400, s: 24, char: '🍓', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 80, y: 1780, s: 22, char: '✨', color: 'rgba(251, 191, 36, 0.8)' },
        { x: 1000, y: 1760, s: 20, char: '✦', color: 'rgba(168, 85, 247, 0.75)' }
      ],
      cardBg: 'rgba(20, 10, 36, 0.88)',
      cardBorder: 'rgba(244, 114, 182, 0.35)',
      cardBorderGlow: 'rgba(236, 72, 153, 0.4)',
      accentPrimary: '#f472b6',
      accentSecondary: '#c084fc',
      brandPillBg: 'rgba(236, 72, 153, 0.2)',
      brandPillBorder: 'rgba(244, 114, 182, 0.6)',
      brandText: '#fbcfe8',
      subText: '#e2e8f0',
      titleColor: '#ffffff',
      titleGlow: 'rgba(236, 72, 153, 0.7)',
      scoreBg: 'rgba(20, 10, 36, 0.9)',
      scoreBorder: 'rgba(52, 211, 153, 0.7)',
      scoreText: '#6ee7b7',
      settingsDeckBorder: 'rgba(192, 132, 252, 0.5)',
      settingsDeckHeader: '#e879f9',
      settingsDeckVal: '#ffffff',
      ingsHeader: '#f472b6',
      dividerColor: 'rgba(255, 255, 255, 0.1)',
      tipBg: 'rgba(20, 10, 36, 0.92)',
      tipBorder: 'rgba(251, 191, 36, 0.6)',
      tipHeader: '#fbbf24',
      footerCtaBg: 'rgba(236, 72, 153, 0.25)',
      footerCtaBorder: 'rgba(244, 114, 182, 0.85)',
      footerCtaText: '#fce7f3'
    },
    chocolate: {
      id: 'chocolate',
      name: 'Midnight Mocha',
      icon: '🍫',
      bgStops: [
        [0, '#381604'],    // Rich chocolate cocoa
        [0.25, '#210d02'], // Dark espresso
        [0.55, '#150801'], // Midnight roast
        [0.80, '#271103'], // Warm molasses
        [1, '#0d0501']     // Dark truffle
      ],
      glows: [
        { x: 0.85, y: 0.10, r: 0.85, stops: ['rgba(245, 158, 11, 0.65)', 'rgba(217, 119, 6, 0.30)', 'transparent'] },
        { x: 0.15, y: 0.30, r: 0.75, stops: ['rgba(251, 191, 36, 0.50)', 'rgba(180, 83, 9, 0.25)', 'transparent'] },
        { x: 0.5, y: 0.92, r: 0.80, stops: ['rgba(245, 158, 11, 0.55)', 'rgba(217, 119, 6, 0.20)', 'transparent'] }
      ],
      particles: [
        { x: 90, y: 140, s: 20, char: '✨', color: 'rgba(251, 191, 36, 0.8)' },
        { x: 990, y: 160, s: 20, char: '✦', color: 'rgba(253, 230, 138, 0.75)' },
        { x: 50, y: 440, s: 22, char: '🍫', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 1030, y: 460, s: 22, char: '★', color: 'rgba(245, 158, 11, 0.65)' },
        { x: 45, y: 920, s: 20, char: '✨', color: 'rgba(251, 191, 36, 0.75)' },
        { x: 1035, y: 940, s: 18, char: '✦', color: 'rgba(253, 230, 138, 0.7)' },
        { x: 55, y: 1380, s: 22, char: '🍫', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 1025, y: 1400, s: 22, char: '★', color: 'rgba(245, 158, 11, 0.65)' },
        { x: 80, y: 1780, s: 22, char: '✨', color: 'rgba(251, 191, 36, 0.8)' },
        { x: 1000, y: 1760, s: 20, char: '✦', color: 'rgba(253, 230, 138, 0.75)' }
      ],
      cardBg: 'rgba(28, 14, 4, 0.90)',
      cardBorder: 'rgba(251, 191, 36, 0.40)',
      cardBorderGlow: 'rgba(245, 158, 11, 0.45)',
      accentPrimary: '#fbbf24',
      accentSecondary: '#f59e0b',
      brandPillBg: 'rgba(245, 158, 11, 0.2)',
      brandPillBorder: 'rgba(251, 191, 36, 0.65)',
      brandText: '#fef3c7',
      subText: '#fde68a',
      titleColor: '#ffffff',
      titleGlow: 'rgba(245, 158, 11, 0.65)',
      scoreBg: 'rgba(28, 14, 4, 0.92)',
      scoreBorder: 'rgba(251, 191, 36, 0.7)',
      scoreText: '#fde68a',
      settingsDeckBorder: 'rgba(251, 191, 36, 0.55)',
      settingsDeckHeader: '#fbbf24',
      settingsDeckVal: '#ffffff',
      ingsHeader: '#f59e0b',
      dividerColor: 'rgba(251, 191, 36, 0.15)',
      tipBg: 'rgba(28, 14, 4, 0.94)',
      tipBorder: 'rgba(251, 191, 36, 0.75)',
      tipHeader: '#fef08a',
      footerCtaBg: 'rgba(245, 158, 11, 0.25)',
      footerCtaBorder: 'rgba(251, 191, 36, 0.9)',
      footerCtaText: '#fffbeb'
    },
    glacier: {
      id: 'glacier',
      name: 'Glacier Chill',
      icon: '🧊',
      bgStops: [
        [0, '#0369a1'],    // Crisp ocean blue
        [0.25, '#075985'], // Electric sapphire
        [0.55, '#0f172a'], // Deep abyss
        [0.80, '#0c4a6e'], // Arctic twilight
        [1, '#082f49']     // Polar deep
      ],
      glows: [
        { x: 0.85, y: 0.10, r: 0.85, stops: ['rgba(6, 182, 212, 0.75)', 'rgba(14, 165, 233, 0.35)', 'transparent'] },
        { x: 0.15, y: 0.28, r: 0.75, stops: ['rgba(56, 189, 248, 0.65)', 'rgba(3, 105, 161, 0.25)', 'transparent'] },
        { x: 0.5, y: 0.92, r: 0.80, stops: ['rgba(34, 211, 238, 0.60)', 'rgba(6, 182, 212, 0.25)', 'transparent'] }
      ],
      particles: [
        { x: 90, y: 140, s: 22, char: '❄️', color: 'rgba(165, 243, 252, 0.85)' },
        { x: 990, y: 160, s: 22, char: '✦', color: 'rgba(103, 232, 249, 0.75)' },
        { x: 50, y: 440, s: 22, char: '🧊', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 1030, y: 460, s: 18, char: '★', color: 'rgba(56, 189, 248, 0.65)' },
        { x: 45, y: 920, s: 22, char: '❄️', color: 'rgba(165, 243, 252, 0.85)' },
        { x: 1035, y: 940, s: 20, char: '✦', color: 'rgba(34, 211, 238, 0.75)' },
        { x: 55, y: 1380, s: 22, char: '★', color: 'rgba(56, 189, 248, 0.65)' },
        { x: 1025, y: 1400, s: 22, char: '🧊', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 80, y: 1780, s: 22, char: '✨', color: 'rgba(165, 243, 252, 0.8)' },
        { x: 1000, y: 1760, s: 22, char: '❄️', color: 'rgba(56, 189, 248, 0.85)' }
      ],
      cardBg: 'rgba(8, 28, 48, 0.90)',
      cardBorder: 'rgba(34, 211, 238, 0.42)',
      cardBorderGlow: 'rgba(6, 182, 212, 0.5)',
      accentPrimary: '#38bdf8',
      accentSecondary: '#22d3ee',
      brandPillBg: 'rgba(6, 182, 212, 0.22)',
      brandPillBorder: 'rgba(34, 211, 238, 0.65)',
      brandText: '#cffafe',
      subText: '#e0f2fe',
      titleColor: '#ffffff',
      titleGlow: 'rgba(34, 211, 238, 0.7)',
      scoreBg: 'rgba(8, 28, 48, 0.92)',
      scoreBorder: 'rgba(45, 212, 191, 0.75)',
      scoreText: '#5eead4',
      settingsDeckBorder: 'rgba(56, 189, 248, 0.55)',
      settingsDeckHeader: '#38bdf8',
      settingsDeckVal: '#ffffff',
      ingsHeader: '#22d3ee',
      dividerColor: 'rgba(34, 211, 238, 0.15)',
      tipBg: 'rgba(8, 28, 48, 0.94)',
      tipBorder: 'rgba(251, 191, 36, 0.7)',
      tipHeader: '#fde047',
      footerCtaBg: 'rgba(6, 182, 212, 0.25)',
      footerCtaBorder: 'rgba(34, 211, 238, 0.9)',
      footerCtaText: '#ecfeff'
    },
    sunset: {
      id: 'sunset',
      name: 'Sunset Sorbet',
      icon: '🥭',
      bgStops: [
        [0, '#c2410c'],    // Sunburst fiery orange
        [0.25, '#9f1239'], // Passionfruit crimson
        [0.55, '#4c0519'], // Deep blackberry
        [0.80, '#2e1065'], // Sunset twilight purple
        [1, '#1e1b4b']     // Evening indigo
      ],
      glows: [
        { x: 0.85, y: 0.10, r: 0.85, stops: ['rgba(249, 115, 22, 0.80)', 'rgba(234, 88, 12, 0.35)', 'transparent'] },
        { x: 0.15, y: 0.28, r: 0.75, stops: ['rgba(244, 63, 94, 0.70)', 'rgba(225, 29, 72, 0.30)', 'transparent'] },
        { x: 0.5, y: 0.92, r: 0.80, stops: ['rgba(251, 146, 60, 0.60)', 'rgba(244, 63, 94, 0.25)', 'transparent'] }
      ],
      particles: [
        { x: 90, y: 140, s: 22, char: '☀️', color: 'rgba(254, 215, 170, 0.85)' },
        { x: 990, y: 160, s: 22, char: '✦', color: 'rgba(253, 186, 116, 0.75)' },
        { x: 50, y: 440, s: 22, char: '🥭', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 1030, y: 460, s: 18, char: '★', color: 'rgba(251, 113, 133, 0.7)' },
        { x: 45, y: 920, s: 22, char: '✨', color: 'rgba(253, 224, 71, 0.8)' },
        { x: 1035, y: 940, s: 20, char: '✦', color: 'rgba(251, 146, 60, 0.75)' },
        { x: 55, y: 1380, s: 22, char: '★', color: 'rgba(251, 113, 133, 0.7)' },
        { x: 1025, y: 1400, s: 22, char: '🥭', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 80, y: 1780, s: 22, char: '☀️', color: 'rgba(253, 186, 116, 0.85)' },
        { x: 1000, y: 1760, s: 22, char: '✨', color: 'rgba(253, 224, 71, 0.8)' }
      ],
      cardBg: 'rgba(32, 14, 18, 0.90)',
      cardBorder: 'rgba(251, 146, 60, 0.45)',
      cardBorderGlow: 'rgba(249, 115, 22, 0.5)',
      accentPrimary: '#fb923c',
      accentSecondary: '#f43f5e',
      brandPillBg: 'rgba(249, 115, 22, 0.22)',
      brandPillBorder: 'rgba(251, 146, 60, 0.7)',
      brandText: '#ffedd5',
      subText: '#fed7aa',
      titleColor: '#ffffff',
      titleGlow: 'rgba(249, 115, 22, 0.7)',
      scoreBg: 'rgba(32, 14, 18, 0.92)',
      scoreBorder: 'rgba(250, 204, 21, 0.75)',
      scoreText: '#fde047',
      settingsDeckBorder: 'rgba(251, 113, 133, 0.55)',
      settingsDeckHeader: '#fb7185',
      settingsDeckVal: '#ffffff',
      ingsHeader: '#fb923c',
      dividerColor: 'rgba(251, 146, 60, 0.15)',
      tipBg: 'rgba(32, 14, 18, 0.94)',
      tipBorder: 'rgba(250, 204, 21, 0.7)',
      tipHeader: '#fef08a',
      footerCtaBg: 'rgba(249, 115, 22, 0.25)',
      footerCtaBorder: 'rgba(251, 146, 60, 0.9)',
      footerCtaText: '#fff7ed'
    },
    matcha: {
      id: 'matcha',
      name: 'Matcha Dream',
      icon: '🍵',
      bgStops: [
        [0, '#064e3b'],    // Rich matcha emerald
        [0.25, '#065f46'], // Botanical green
        [0.55, '#042f2e'], // Forest deep
        [0.80, '#064e3b'], // Herbal moss
        [1, '#022c22']     // Dark botanical night
      ],
      glows: [
        { x: 0.85, y: 0.10, r: 0.85, stops: ['rgba(132, 204, 22, 0.75)', 'rgba(101, 163, 13, 0.35)', 'transparent'] },
        { x: 0.15, y: 0.28, r: 0.75, stops: ['rgba(52, 211, 153, 0.65)', 'rgba(5, 150, 105, 0.30)', 'transparent'] },
        { x: 0.5, y: 0.92, r: 0.80, stops: ['rgba(163, 230, 53, 0.60)', 'rgba(132, 204, 22, 0.25)', 'transparent'] }
      ],
      particles: [
        { x: 90, y: 140, s: 22, char: '🍃', color: 'rgba(190, 242, 100, 0.85)' },
        { x: 990, y: 160, s: 22, char: '✦', color: 'rgba(110, 231, 183, 0.75)' },
        { x: 50, y: 440, s: 22, char: '🍵', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 1030, y: 460, s: 18, char: '★', color: 'rgba(132, 204, 22, 0.65)' },
        { x: 45, y: 920, s: 22, char: '✨', color: 'rgba(217, 249, 157, 0.8)' },
        { x: 1035, y: 940, s: 20, char: '✦', color: 'rgba(52, 211, 153, 0.75)' },
        { x: 55, y: 1380, s: 22, char: '★', color: 'rgba(132, 204, 22, 0.65)' },
        { x: 1025, y: 1400, s: 22, char: '🍵', color: 'rgba(255, 255, 255, 0.85)' },
        { x: 80, y: 1780, s: 22, char: '✨', color: 'rgba(217, 249, 157, 0.8)' },
        { x: 1000, y: 1760, s: 22, char: '🍃', color: 'rgba(190, 242, 100, 0.85)' }
      ],
      cardBg: 'rgba(6, 32, 24, 0.92)',
      cardBorder: 'rgba(74, 222, 128, 0.45)',
      cardBorderGlow: 'rgba(132, 204, 22, 0.5)',
      accentPrimary: '#a3e635',
      accentSecondary: '#34d399',
      brandPillBg: 'rgba(132, 204, 22, 0.22)',
      brandPillBorder: 'rgba(163, 230, 53, 0.7)',
      brandText: '#ecfccb',
      subText: '#d1fae5',
      titleColor: '#ffffff',
      titleGlow: 'rgba(132, 204, 22, 0.7)',
      scoreBg: 'rgba(6, 32, 24, 0.94)',
      scoreBorder: 'rgba(163, 230, 53, 0.75)',
      scoreText: '#bef264',
      settingsDeckBorder: 'rgba(52, 211, 153, 0.55)',
      settingsDeckHeader: '#6ee7b7',
      settingsDeckVal: '#ffffff',
      ingsHeader: '#a3e635',
      dividerColor: 'rgba(74, 222, 128, 0.15)',
      tipBg: 'rgba(6, 32, 24, 0.95)',
      tipBorder: 'rgba(250, 204, 21, 0.7)',
      tipHeader: '#fef08a',
      footerCtaBg: 'rgba(132, 204, 22, 0.25)',
      footerCtaBorder: 'rgba(163, 230, 53, 0.9)',
      footerCtaText: '#f7fee7'
    }
  };

  function updateStoryStreakToggleUI() {
    const btn = document.getElementById('btnToggleStoryStreak');
    if (!btn) return;
    const hasStreak = habitStreakState && habitStreakState.currentStreak > 0;
    const wrapper = document.getElementById('storyOptionsBar');
    if (wrapper) {
      wrapper.style.display = hasStreak ? 'flex' : 'none';
    }
    btn.classList.toggle('active', currentStoryShowStreak);
    btn.setAttribute('aria-pressed', currentStoryShowStreak ? 'true' : 'false');
    const checkEl = btn.querySelector('.option-check');
    if (checkEl) {
      checkEl.textContent = currentStoryShowStreak ? '✓' : '✕';
    }
    const labelEl = btn.querySelector('.option-label');
    if (labelEl) {
      labelEl.textContent = currentStoryShowStreak ? 'Habit Streak: Shown' : 'Habit Streak: Hidden';
    }
  }

  function openStoryCardModal(recipeInput) {
    if (!recipeInput) return;
    const recipe = typeof recipeInput === 'string'
      ? ((typeof allRecipes !== 'undefined' ? allRecipes.find(r => r.id === recipeInput) : null) || (typeof customRecipesState !== 'undefined' ? customRecipesState.find(r => r.id === recipeInput) : null))
      : recipeInput;
    if (!recipe) return;
    currentStoryRecipe = recipe;
    currentStoryRatio = 'story';
    currentStoryBlob = null;
    currentStoryFile = null;
    currentStoryDataUrl = null;
    storyRenderingPromise = null;

    const overlay = document.getElementById('storyCardModalOverlay');
    if (!overlay) return;

    // Reset switcher tabs
    const btnStory = document.getElementById('btnRatioStory');
    const btnSquare = document.getElementById('btnRatioSquare');
    if (btnStory) btnStory.classList.add('active');
    if (btnSquare) btnSquare.classList.remove('active');

    // Sync theme switcher buttons
    const themeSwitcher = document.getElementById('storyThemeSwitcher');
    if (themeSwitcher) {
      themeSwitcher.querySelectorAll('.theme-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentStoryTheme);
      });
    }

    // Sync streak toggle pill UI
    updateStoryStreakToggleUI();

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();

    // Push history state so Android & browser back buttons close the story card modal
    try {
      history.pushState({ modal: 'story_card', recipeId: recipe.id }, '', window.location.href);
    } catch (e) {}

    // Populate clickable creator socials directly in the modal preview
    const socialsBox = document.getElementById('storyCreatorSocialsBox');
    const socialsTitle = document.getElementById('storyCreatorSocialsTitle');
    const socialsLinks = document.getElementById('storyCreatorSocialsLinks');
    if (socialsBox && socialsTitle && socialsLinks) {
      const attrib = getStoryCardAttribution(recipe);
      if (attrib && attrib.isCreator) {
        socialsTitle.textContent = `🧑‍🍳 Follow ${attrib.name}:`;
        socialsLinks.innerHTML = renderSocialLinksPills(attrib.socialLinks, false, attrib.website);
        socialsBox.style.display = 'flex';
      } else {
        socialsBox.style.display = 'none';
        socialsLinks.innerHTML = '';
      }
    }

    renderStoryCardGraphic();
  }
  window.openStoryCardModal = openStoryCardModal;
  window.triggerStoryDownload = triggerStoryDownload;
  window.shareStoryCardNative = shareStoryCardNative;
  window.openCreatorPortalModal = openCreatorPortalModal;
  window.closeCreatorPortalModal = closeCreatorPortalModal;
  window.openSmartPasteModal = openSmartPasteModal;
  window.closeSmartPasteModal = closeSmartPasteModal;
  window.openSocialCaptionModal = openSocialCaptionModal;
  window.closeSocialCaptionModal = closeSocialCaptionModal;
  window.generateSocialCaption = generateSocialCaption;
  window.parseRawRecipeText = parseRawRecipeText;

  function closeStoryCardModal(fromPopState = false) {
    const overlay = document.getElementById('storyCardModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      // If recipe modal is still open behind it, keep scroll locked
      if (!recipeModalOverlay || !recipeModalOverlay.classList.contains('active')) {
        unlockBackgroundScroll();
      }
    }
    // If closed via UI (X button, overlay tap, escape key), pop the history entry
    if (!fromPopState) {
      if (history.state && history.state.modal === 'story_card') {
        history.back();
      }
    }
  }

  async function triggerStoryDownload() {
    const btn = document.getElementById('btnDownloadStoryImage');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = '<span>⏳ Preparing...</span>';
      btn.disabled = true;
    }

    try {
      if (!currentStoryBlob && storyRenderingPromise) {
        await storyRenderingPromise;
      }
      if (!currentStoryBlob) {
        showToast('Please wait a moment, card is still rendering...');
        return;
      }

      const slug = (currentStoryRecipe?.id || currentStoryRecipe?.name || 'creami-recipe')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      const filename = `${slug}-${currentStoryRatio}-card.png`;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      // On iOS Safari:
      // WebKit forbids programmatic downloading of data URLs or blob URLs via <a download>.
      // Attempting window.open or window.location.href locks up or crashes iOS Safari tabs.
      // Instead, use Web Share API to "Save Image" or provide direct tap & hold instruction.
      if (isIOS) {
        const fileToShare = currentStoryFile || (currentStoryBlob ? new File([currentStoryBlob], filename, { type: 'image/png' }) : null);
        if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
          try {
            await navigator.share({
              files: [fileToShare],
              title: currentStoryRecipe?.name || 'Ninja Creami Recipe'
            });
            showToast('📸 Tap "Save Image" to save directly to your Photos!');
            return;
          } catch (e) {
            if (e.name === 'AbortError') return;
          }
        }
        showToast('📸 Tap & hold the card image above to "Save to Photos"!');
        const img = document.getElementById('storyCardPreviewImg');
        if (img) {
          img.scrollIntoView({ behavior: 'smooth', block: 'center' });
          img.style.boxShadow = '0 0 0 4px #ec4899, 0 20px 48px rgba(0, 0, 0, 0.9)';
          setTimeout(() => {
            if (img) img.style.boxShadow = '';
          }, 2500);
        }
        return;
      }

      // Standard Desktop & Android: direct blob URL download
      const blobUrl = URL.createObjectURL(currentStoryBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 2500);
      showToast(`⬇️ Downloaded ${filename}!`);

      trackAnalyticsEvent('download_story_card', {
        recipe_id: currentStoryRecipe?.id,
        recipe_name: currentStoryRecipe?.name,
        theme: currentStoryTheme,
        ratio: currentStoryRatio
      });
    } catch (err) {
      console.error('Download error:', err);
      showToast('📸 Tap & hold (or right-click) the image above to save directly!');
    } finally {
      if (btn) {
        btn.innerHTML = origHtml;
        btn.disabled = false;
      }
    }
  }

  async function shareStoryCardNative() {
    const btn = document.getElementById('btnShareStoryNative');
    const origHtml = btn ? btn.innerHTML : '';

    const slug = (currentStoryRecipe?.id || currentStoryRecipe?.name || 'creami-recipe')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const filename = `${slug}-${currentStoryRatio}-card.png`;

    // 1. FAST PATH: If image file is ALREADY rendered and navigator.share is supported,
    // invoke navigator.share immediately and SYNCHRONOUSLY without any await!
    // This preserves the transient user activation required by iOS Safari & Android Chrome.
    if (currentStoryFile && navigator.canShare && navigator.canShare({ files: [currentStoryFile] })) {
      try {
        await navigator.share({
          files: [currentStoryFile],
          title: currentStoryRecipe?.name || 'Ninja Creami Recipe'
        });
        showToast('Shared successfully!');
        trackAnalyticsEvent('share_story_card', {
          recipe_id: currentStoryRecipe?.id,
          recipe_name: currentStoryRecipe?.name,
          theme: currentStoryTheme,
          ratio: currentStoryRatio
        });
        return;
      } catch (shareErr) {
        if (shareErr.name === 'AbortError') return; // User tapped Cancel on the share sheet
        console.warn('Direct file share notice:', shareErr);
      }
    }

    // 2. Slow path: card was still rendering
    if (btn) {
      btn.innerHTML = '<span>⏳ Preparing...</span>';
      btn.disabled = true;
    }

    try {
      if (!currentStoryBlob && storyRenderingPromise) {
        await storyRenderingPromise;
      }
      if (!currentStoryBlob) {
        showToast('Card is rendering, please tap again in a moment.');
        return;
      }

      const fileToShare = currentStoryFile || new File([currentStoryBlob], filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        try {
          await navigator.share({
            files: [fileToShare],
            title: currentStoryRecipe?.name || 'Ninja Creami Recipe'
          });
          showToast('Shared successfully!');
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      // If share is not supported or failed, seamlessly fall back to download
      await triggerStoryDownload();
    } catch (err) {
      console.error('Share error:', err);
      await triggerStoryDownload();
    } finally {
      if (btn) {
        btn.innerHTML = origHtml;
        btn.disabled = false;
      }
    }
  }

  function formatCardIngredientAmount(ing) {
    if (!ing) return '';
    const rawQty = ing.quantity != null ? String(ing.quantity).trim() : '';
    const rawUnit = ing.unit != null ? String(ing.unit).trim() : '';

    if (rawQty && rawUnit) {
      if (rawQty.toLowerCase().endsWith(rawUnit.toLowerCase())) {
        return rawQty;
      }
      const u = rawUnit.toLowerCase();
      if (['g', 'ml', 'oz'].includes(u)) {
        return `${rawQty}${rawUnit}`;
      }
      return `${rawQty} ${rawUnit}`;
    }

    if (rawQty) {
      if (ing.raw) {
        const parenMatch = ing.raw.match(/\(([^)]+)\)/);
        if (parenMatch) return parenMatch[1].trim();
        const startMatch = ing.raw.match(/^(\d+(?:[./]\d+)?\s*[a-zA-Z]+)/);
        if (startMatch) return startMatch[1].trim();
      }
      return rawQty;
    }

    if (rawUnit) return rawUnit;
    if (ing.amount) return String(ing.amount);
    if (ing.raw) return ing.raw;
    return '';
  }

  function renderStoryCardGraphic() {
    if (!currentStoryRecipe) return;
    const recipe = currentStoryRecipe;
    const ratio = currentStoryRatio;
    const previewImg = document.getElementById('storyCardPreviewImg');
    const loadingInd = document.getElementById('storyLoadingIndicator');
    if (loadingInd) loadingInd.style.display = 'block';

    const width = 1080;
    const height = ratio === 'story' ? 1920 : 1080;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const theme = STORY_THEMES[currentStoryTheme] || STORY_THEMES.berry;

    // 1. Full-Bleed Radiant Gradient extending 100% to all borders
    const bg = ctx.createLinearGradient(0, 0, width, height);
    theme.bgStops.forEach(([stop, color]) => bg.addColorStop(stop, color));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Radiant mesh glows extending edge-to-edge
    theme.glows.forEach(g => {
      const gx = width * g.x;
      const gy = height * g.y;
      const gr = width * g.r;
      const radGlow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.stops.forEach((stopColor, idx) => {
        radGlow.addColorStop(idx / (g.stops.length - 1), stopColor);
      });
      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, width, height);
    });

    // 2.5 Decorative whimsical sparkles and particles
    ctx.save();
    theme.particles.forEach(p => {
      const py = ratio === 'story' ? p.y : p.y * (1080 / 1920);
      ctx.font = `${p.s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.fillText(p.char, p.x, py);
    });
    ctx.restore();

    // CRITICAL: Initialize textAlign to center for all canvas text
    ctx.textAlign = 'center';

    let curY = ratio === 'story' ? 110 : 65;

    const attrib = getStoryCardAttribution(recipe);

    // 3. Header Brand Pill
    let brandText = '🍨 CREAMICRAVINGS.COM';
    if (attrib.isCreator) {
      brandText = attrib.handle 
        ? `🧑‍🍳 ${attrib.name.toUpperCase()} • ${attrib.handle.toUpperCase()}`
        : `🧑‍🍳 ${attrib.name.toUpperCase()} RECIPES`;
    }
    ctx.font = ratio === 'story' ? '800 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    const brandWidth = ctx.measureText(brandText).width + (ratio === 'story' ? 56 : 46);
    const brandH = ratio === 'story' ? 56 : 46;
    drawRoundedRect(ctx, (width - brandWidth) / 2, curY - (brandH / 2), brandWidth, brandH, brandH / 2, theme.brandPillBg, theme.brandPillBorder, 1.5);
    ctx.fillStyle = theme.brandText;
    ctx.fillText(brandText, width / 2, curY + (ratio === 'story' ? 10 : 8));

    curY += ratio === 'story' ? 66 : 44;
    ctx.font = ratio === 'story' ? '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = theme.subText;
    let subheaderText = '✦ THE ULTIMATE NINJA CREAMI® COMPANION ✦';
    if (attrib.isCreator) {
      const s = [];
      const sl = attrib.socialLinks || {};
      if (sl.instagram) s.push(`IG: ${sl.instagram.replace(/https?:\/\/(www\.)?instagram\.com\/?/i, '@')}`);
      if (sl.tiktok) s.push(`TikTok: ${sl.tiktok.replace(/https?:\/\/(www\.)?tiktok\.com\/@?/i, '@')}`);
      if (sl.youtube) s.push(`YT: ${sl.youtube.replace(/https?:\/\/(www\.)?youtube\.com\/(c\/|@)?/i, '@')}`);
      if (s.length > 0) {
        subheaderText = `✦ ${s.join(' • ')} ✦`;
      } else if (attrib.brandName) {
        subheaderText = `✦ OFFICIAL ${attrib.brandName.toUpperCase()} RECIPE ✦`;
      }
    }
    ctx.fillText(subheaderText, width / 2, curY);

    // Habit Streak Badge Banner on Story Card (Path A Item 4)
    if (currentStoryShowStreak && habitStreakState && habitStreakState.currentStreak > 0) {
      curY += ratio === 'story' ? 58 : 42;
      const streakText = `🔥 ${habitStreakState.currentStreak} WEEK HABIT STREAK • ${habitStreakState.totalSpins || 1} SPINS`;
      ctx.font = ratio === 'story' ? '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const streakW = ctx.measureText(streakText).width + (ratio === 'story' ? 48 : 36);
      const streakH = ratio === 'story' ? 44 : 36;
      drawRoundedRect(ctx, (width - streakW) / 2, curY - (streakH / 2), streakW, streakH, streakH / 2, 'rgba(234, 88, 12, 0.35)', 'rgba(251, 146, 60, 0.85)', 1.5);
      ctx.fillStyle = '#fed7aa';
      ctx.fillText(streakText, width / 2, curY + (ratio === 'story' ? 8 : 6));
      curY += ratio === 'story' ? 70 : 48;
    } else {
      curY += ratio === 'story' ? 74 : 52;
    }

    // 4. Category Tag Pill
    const cat = (recipe.category || 'High Protein').toUpperCase();
    let catEmoji = '⭐';
    if (cat.includes('PROTEIN')) catEmoji = '💪';
    else if (cat.includes('SORBET') || cat.includes('FRUIT')) catEmoji = '🍧';
    else if (cat.includes('KETO') || cat.includes('CARB')) catEmoji = '🥑';
    else if (cat.includes('CHOCOLATE')) catEmoji = '🍫';

    ctx.font = ratio === 'story' ? '800 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    const tagText = attrib.isCreator
      ? `${catEmoji} ${cat} • BY ${attrib.name.toUpperCase()}`
      : `${catEmoji} ${cat} • OFFICIAL RECIPE`;
    const tagWidth = ctx.measureText(tagText).width + (ratio === 'story' ? 56 : 46);
    const tagH = ratio === 'story' ? 52 : 44;
    drawRoundedRect(ctx, (width - tagWidth) / 2, curY - (tagH / 2), tagWidth, tagH, tagH / 2, theme.brandPillBg, theme.cardBorder, 2);
    ctx.fillStyle = theme.accentPrimary;
    ctx.fillText(tagText, width / 2, curY + (ratio === 'story' ? 9 : 7));

    // Clear gap before title (so category bubble and title never collide!)
    curY += (tagH / 2) + (ratio === 'story' ? 62 : 42);

    // 5. Recipe Title (Wrapped & Scaled)
    const titleMaxWidth = width - 120;
    const isLongName = (recipe.name || '').length > 28;
    const titleFontSize = ratio === 'story' ? (isLongName ? 62 : 74) : (isLongName ? 48 : 56);
    const titleLineHeight = ratio === 'story' ? (isLongName ? 74 : 86) : (isLongName ? 58 : 66);

    ctx.font = `900 ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = theme.titleColor;
    ctx.shadowColor = theme.titleGlow;
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 6;
    ctx.textAlign = 'center';

    const lines = wrapCanvasText(ctx, recipe.name, titleMaxWidth);
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, curY + (titleFontSize * 0.75));
      curY += titleLineHeight;
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Dynamic gap adjustment if multi-line title
    const multiLineAdj = (lines.length > 1) ? (lines.length === 2 ? 14 : 26) : 0;

    // Clear gap after title before Creaminess Ribbon
    curY += (ratio === 'story' ? Math.max(16, 26 - multiLineAdj) : 18);

    // 6. Creaminess Score Ribbon
    const scoreVal = recipe.creaminessScore || '9.4';
    const scoreGrade = recipe.creaminessGrade || 'Balanced';
    const scoreText = `🧪 Creaminess: ${scoreVal}/10 (${scoreGrade}) • 🥣 16 oz Pint • ⏱️ ${recipe.prepTime || '2 Min'} Prep`;
    ctx.font = ratio === 'story' ? '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '700 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    const scoreWidth = ctx.measureText(scoreText).width + (ratio === 'story' ? 52 : 44);
    const scoreH = ratio === 'story' ? 48 : 40;
    drawRoundedRect(ctx, (width - scoreWidth) / 2, curY - (scoreH / 2), scoreWidth, scoreH, scoreH / 2, theme.scoreBg, theme.scoreBorder, 1.5);
    ctx.fillStyle = theme.scoreText;
    ctx.fillText(scoreText, width / 2, curY + (ratio === 'story' ? 8 : 6));

    curY += (scoreH / 2) + (ratio === 'story' ? Math.max(30, 48 - multiLineAdj) : 32);

    // 7. Macro 4-Grid Cards
    const macros = recipe.macros || {};
    const calVal = `${macros.calories || macros.cal || '240'}`.replace(/kcal|cal/i, '').trim();
    const proVal = `${macros.protein || '30g'}`.replace(/g/i, '').trim();
    const carbVal = `${macros.carbs || '15g'}`.replace(/g/i, '').trim();
    const fatVal = `${macros.fat || '4g'}`.replace(/g/i, '').trim();

    const cardW = 226;
    const cardH = ratio === 'story' ? 165 : 132;
    const gap = 16;
    const startX = (width - (cardW * 4 + gap * 3)) / 2;

    const macroItems = [
      { label: 'CALORIES', val: calVal, unit: 'KCAL', color: '#f43f5e', icon: '🔥' },
      { label: 'PROTEIN', val: proVal, unit: 'GRAMS', color: '#38bdf8', icon: '💪' },
      { label: 'CARBS', val: carbVal, unit: 'GRAMS', color: '#34d399', icon: '🌾' },
      { label: 'FAT', val: fatVal, unit: 'GRAMS', color: '#fbbf24', icon: '🥑' }
    ];

    for (let i = 0; i < macroItems.length; i++) {
      const it = macroItems[i];
      const cx = startX + i * (cardW + gap);

      // Card Background with soft drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      drawRoundedRect(ctx, cx, curY, cardW, cardH, 22, theme.cardBg, theme.cardBorder, 1.5);
      ctx.restore();

      // Top colored accent stripe
      drawRoundedRect(ctx, cx + 18, curY, cardW - 36, 6, 3, it.color, null);

      // Icon & Label
      ctx.textAlign = 'center';
      ctx.font = ratio === 'story' ? '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${it.icon} ${it.label}`, cx + cardW / 2, curY + (ratio === 'story' ? 38 : 32));

      // Value
      ctx.font = ratio === 'story' ? '900 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(it.val, cx + cardW / 2, curY + (ratio === 'story' ? 102 : 84));

      // Unit
      ctx.font = ratio === 'story' ? '800 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = it.color;
      ctx.fillText(it.unit, cx + cardW / 2, curY + (ratio === 'story' ? 138 : 112));
    }

    curY += cardH + (ratio === 'story' ? Math.max(30, 48 - multiLineAdj) : 28);

    // 8. Ninja Creami Machine Settings Deck (Stacked Label + Value in 3 Columns with Vertical Dividers)
    const specW = width - 120; // 960px
    const specH = ratio === 'story' ? 138 : 100;
    const specX = 60;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    drawRoundedRect(ctx, specX, curY, specW, specH, 22, theme.cardBg, theme.settingsDeckBorder, 1.5);
    ctx.restore();

    // Deck Header Tag
    ctx.textAlign = 'center';
    ctx.font = ratio === 'story' ? '800 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = theme.settingsDeckHeader;
    ctx.fillText('🌀 NINJA CREAMI® MACHINE SETTINGS', width / 2, curY + (ratio === 'story' ? 30 : 24));

    // 3 Columns: Stacked Label above Value
    const colW = specW / 3;
    const spinSetting = recipe.spinSetting || 'Lite Ice Cream';
    const freezeTime = recipe.freezeTime || '16+ Hours';
    const respinTip = 'Respin If Needed';

    const colItems = [
      { label: 'SPIN PROGRAM', val: spinSetting, color: '#ffffff' },
      { label: 'FREEZE TIME', val: freezeTime, color: '#38bdf8' },
      { label: 'RE-SPIN TIP', val: respinTip, color: '#f472b6' }
    ];

    for (let c = 0; c < 3; c++) {
      const colX = specX + c * colW;
      const item = colItems[c];

      // Vertical dividers between columns
      if (c > 0) {
        ctx.strokeStyle = theme.dividerColor || 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(colX, curY + (ratio === 'story' ? 44 : 34));
        ctx.lineTo(colX, curY + specH - 18);
        ctx.stroke();
      }

      // Column Label
      ctx.textAlign = 'center';
      ctx.font = ratio === 'story' ? '800 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(item.label, colX + colW / 2, curY + (ratio === 'story' ? 68 : 52));

      // Column Value
      ctx.font = ratio === 'story' ? '900 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '900 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = c === 0 ? (theme.settingsDeckVal || '#ffffff') : (c === 1 ? theme.accentPrimary : theme.accentSecondary);
      ctx.fillText(item.val, colX + colW / 2, curY + (ratio === 'story' ? 104 : 82));
    }

    curY += specH + (ratio === 'story' ? Math.max(30, 48 - multiLineAdj) : 26);

    // 9. Key Ingredients & Pro Tip (Story Mode vs Square Mode)
    if (ratio === 'story') {
      // Ingredients Card
      const ings = (recipe.ingredients || []);
      if (ings.length > 0) {
        const boxW = width - 120; // 960px
        const maxItems = 7;
        const displayIngs = ings.slice(0, maxItems);
        const rowH = displayIngs.length <= 5 ? 70 : Math.floor(360 / displayIngs.length);
        const boxH = Math.min(500, 90 + displayIngs.length * rowH);
        const boxX = 60;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;
        drawRoundedRect(ctx, boxX, curY, boxW, boxH, 24, theme.cardBg, theme.cardBorder, 1.5);
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.font = '800 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = theme.ingsHeader;
        ctx.fillText(`🥣 PINT INGREDIENTS LIST (${ings.length} ITEMS)`, width / 2, curY + 44);

        let ingY = curY + 98;
        for (let j = 0; j < displayIngs.length; j++) {
          const ing = displayIngs[j];
          const ingName = ing.name || ing.raw || '';
          const ingQty = formatCardIngredientAmount(ing);

          // Diamond icon
          ctx.font = rowH >= 65 ? '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = theme.accentPrimary;
          ctx.textAlign = 'left';
          ctx.fillText('✦', boxX + 32, ingY);

          // Qty Pill on right with explicit unit
          let qW = 0;
          if (ingQty) {
            ctx.font = rowH >= 65 ? '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            qW = ctx.measureText(ingQty).width + 36;
            const qX = boxX + boxW - 32 - qW;
            const pillH = rowH >= 65 ? 42 : 36;
            drawRoundedRect(ctx, qX, ingY - (pillH * 0.65), qW, pillH, pillH / 2, theme.brandPillBg, theme.cardBorder, 1.5);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(ingQty, qX + 18, ingY + (rowH >= 65 ? 2 : 1));
          }

          // Name with guaranteed clearance from Qty Pill
          ctx.font = rowH >= 65 ? '700 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#f8fafc';
          const maxNameWidth = boxW - 64 - qW - 30; // 30px clear gap
          let displayName = ingName;
          while (displayName.length > 4 && ctx.measureText(displayName).width > maxNameWidth) {
            displayName = displayName.slice(0, -1);
          }
          if (displayName !== ingName) {
            displayName = displayName.trim() + '...';
          }
          ctx.fillText(displayName, boxX + 68, ingY);

          // Row divider
          if (j < displayIngs.length - 1) {
            ctx.strokeStyle = theme.dividerColor || 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(boxX + 32, ingY + Math.floor(rowH * 0.38));
            ctx.lineTo(boxX + boxW - 32, ingY + Math.floor(rowH * 0.38));
            ctx.stroke();
          }

          ingY += rowH;
        }
        ctx.textAlign = 'center';
        curY += boxH + Math.max(28, 42 - multiLineAdj);
      }

      // Pro Tip Callout Box
      const tipBoxW = width - 120;
      const tipBoxH = 195;
      const tipBoxX = 60;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      drawRoundedRect(ctx, tipBoxX, curY, tipBoxW, tipBoxH, 22, theme.tipBg, theme.tipBorder, 1.5);
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.font = '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = theme.tipHeader;
      ctx.fillText('💡 NINJA CREAMI PRO SECRET', width / 2, curY + 44);

      ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('If pint looks crumbly or powdery on the first spin, don\'t worry!', width / 2, curY + 92);
      ctx.fillText('Run outer sides under warm water for 60s & hit RESPIN for silky texture.', width / 2, curY + 134);
    } else {
      // Square Mode (1:1): Key Ingredients Grid (Rendering ALL Ingredients) + Pro Tip
      const ings = recipe.ingredients || [];
      if (ings.length > 0) {
        const gridW = width - 120; // 960px
        const gridX = 60;
        const totalIngs = ings.length;

        // Dynamically choose 2 columns (up to 8 items) or 3 columns (9+ items) so ALL ingredients fit!
        const numCols = totalIngs > 8 ? 3 : 2;
        const colGap = numCols === 3 ? 12 : 16;
        const cellW = (gridW - (numCols - 1) * colGap) / numCols;
        const numRows = Math.ceil(totalIngs / numCols);

        let cellH = 54;
        let gapY = 10;
        let fontSize = 20;
        let textOffsetY = 34;

        if (numCols === 2) {
          if (totalIngs > 6) {
            cellH = 40;
            gapY = 6;
            fontSize = 17;
            textOffsetY = 26;
          } else if (totalIngs > 4) {
            cellH = 46;
            gapY = 8;
            fontSize = 18;
            textOffsetY = 29;
          }
        } else {
          // 3 Columns for 9+ ingredients
          cellH = 38;
          gapY = 6;
          fontSize = 15;
          textOffsetY = 24;
        }

        for (let j = 0; j < totalIngs; j++) {
          const row = Math.floor(j / numCols);
          const col = j % numCols;
          const gx = gridX + col * (cellW + colGap);
          const gy = curY + row * (cellH + gapY);

          drawRoundedRect(ctx, gx, gy, cellW, cellH, 16, theme.cardBg, theme.cardBorder, 1);

          const ing = ings[j];
          const ingName = ing.name || ing.raw || '';
          const ingQty = formatCardIngredientAmount(ing);
          const displayText = ingQty ? `🥣 ${ingQty} ${ingName}` : `🥣 ${ingName}`;

          ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.fillStyle = '#f8fafc';
          ctx.textAlign = 'center';

          let displayTrimmed = displayText;
          const maxCellTextWidth = cellW - 20;
          while (displayTrimmed.length > 4 && ctx.measureText(displayTrimmed).width > maxCellTextWidth) {
            displayTrimmed = displayTrimmed.slice(0, -1);
          }
          if (displayTrimmed !== displayText) {
            displayTrimmed = displayTrimmed.trim() + '...';
          }
          ctx.fillText(displayTrimmed, gx + cellW / 2, gy + textOffsetY);
        }
        curY += numRows * (cellH + gapY) + (totalIngs > 6 ? 12 : 18);
      }

      // Pro Tip Pill for Square
      const tipText = '💡 Pro Tip: Spin on Lite Ice Cream + Respin if needed for silky texture!';
      ctx.font = '700 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      const tipWidth = ctx.measureText(tipText).width + 46;
      drawRoundedRect(ctx, (width - tipWidth) / 2, curY, tipWidth, 44, 22, theme.tipBg, theme.tipBorder, 1);
      ctx.fillStyle = theme.tipHeader;
      ctx.fillText(tipText, width / 2, curY + 28);
    }

    // 10. Footer Callout & Link
    const footerY = height - (ratio === 'story' ? 120 : 65);

    // Glowing Action Pill
    let ctaText = '🍨 DISCOVER 200+ RECIPES • CREAMICRAVINGS.COM';
    if (attrib.isCreator) {
      const cleanWeb = (attrib.website || '')
        .replace(/https?:\/\/(www\.)?/i, '')
        .replace(/\/+$/, '');
      if (cleanWeb) {
        ctaText = `🧑‍🍳 FOLLOW ${attrib.handle.toUpperCase() || attrib.name.toUpperCase()} • ${cleanWeb.toUpperCase()}`;
      } else if (attrib.handle) {
        ctaText = `🧑‍🍳 FOLLOW ${attrib.handle.toUpperCase()} FOR MORE RECIPES`;
      } else {
        ctaText = `🧑‍🍳 CREATED BY ${attrib.name.toUpperCase()}`;
      }
    }
    ctx.font = ratio === 'story' ? '800 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    const ctaWidth = ctx.measureText(ctaText).width + (ratio === 'story' ? 60 : 48);
    const ctaH = ratio === 'story' ? 62 : 48;
    drawRoundedRect(ctx, (width - ctaWidth) / 2, footerY - (ctaH / 2) - 8, ctaWidth, ctaH, ctaH / 2, theme.footerCtaBg, theme.footerCtaBorder, 2);
    ctx.fillStyle = theme.footerCtaText;
    ctx.fillText(ctaText, width / 2, footerY + (ratio === 'story' ? 4 : 0));

    if (ratio === 'story') {
      ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      const subFooter = attrib.isCreator 
        ? `✦ More recipes & guides from ${attrib.name} • Powered by Creami Cravings ✦`
        : '✦ Match recipes to the exact ingredients in your pantry! ✦';
      ctx.fillText(subFooter, width / 2, footerY + 54);
      ctx.shadowBlur = 0;
    }

    // Export image to preview
    storyRenderingPromise = new Promise((resolve) => {
      try {
        currentStoryDataUrl = canvas.toDataURL('image/png');
      } catch (e) {
        console.warn('Canvas toDataURL failed:', e);
      }
      canvas.toBlob((blob) => {
        currentStoryBlob = blob;
        if (blob) {
          try {
            const slug = (recipe?.id || recipe?.name || 'creami-recipe')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-');
            const filename = `${slug}-${ratio}-card.png`;
            currentStoryFile = new File([blob], filename, { type: 'image/png' });
          } catch (e) {
            currentStoryFile = null;
          }
        } else {
          currentStoryFile = null;
        }
        if (previewImg && blob) {
          previewImg.style.aspectRatio = ratio === 'story' ? '9 / 16' : '1 / 1';
          previewImg.src = URL.createObjectURL(blob);
        }
        if (loadingInd) loadingInd.style.display = 'none';
        resolve(blob);
      }, 'image/png');
    });
  }

  function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth = 1) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.restore();
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const words = (text || '').split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines.slice(0, 3);
  }

  // Craving / Mood Flavor Matching (Roadmap Item 12)
  function matchesCraving(recipe, cravingType) {
    const kws = CRAVING_KEYWORDS[cravingType];
    if (!kws) return false;
    const text = (
      recipe.name + ' ' + 
      (recipe.spinSetting || '') + ' ' + 
      (recipe.ingredients || []).map(i => i.name + ' ' + (i.notes || '')).join(' ')
    ).toLowerCase();
    return kws.some(k => text.includes(k));
  }

  // Creami Roulette: "Surprise Me / Spin the Wheel" (Roadmap Item 12)
  function spinCreamiRoulette() {
    if (!allRecipes || allRecipes.length === 0) {
      showToast('No recipes available to spin!');
      return;
    }

    if (rouletteBtn) {
      rouletteBtn.classList.add('spinning');
    }

    // Determine candidate pool: prioritize accessible recipes the user can view & make
    const accessibleRecipes = allRecipes.filter(r => isRecipeAccessible(r));
    const poolSource = accessibleRecipes.length > 0 ? accessibleRecipes : allRecipes;
    const readyRecipes = poolSource.filter(r => computeRecipeMatch(r).isReady);
    const baseReadyRecipes = poolSource.filter(r => computeRecipeMatch(r).isBaseReady);
    
    let candidates = [];
    let poolType = 'any';

    if (readyRecipes.length > 0) {
      candidates = readyRecipes;
      poolType = 'ready';
    } else if (baseReadyRecipes.length > 0) {
      candidates = baseReadyRecipes;
      poolType = 'base';
    } else {
      candidates = poolSource;
      poolType = 'any';
    }

    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    lastRouletteWinner = winner;
    const winnerMatch = computeRecipeMatch(winner);

    // Track roulette spin count for gamification milestone
    try {
      const curRouletteSpins = parseInt(localStorage.getItem('creami_roulette_spins_count') || '0', 10);
      localStorage.setItem('creami_roulette_spins_count', (curRouletteSpins + 1).toString());
    } catch (e) {}
    evaluateBadges(true);

    // If modal overlay exists, trigger the animated slot machine ticker
    if (rouletteModalOverlay && rouletteSlotItem) {
      rouletteModalOverlay.classList.add('active');
      rouletteModalOverlay.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();

      const slotMachineEl = rouletteModalOverlay.querySelector('.roulette-slot-machine');
      const headlineEl = rouletteModalOverlay.querySelector('.roulette-headline');
      if (headlineEl) headlineEl.textContent = 'Spinning The Flavor Wheel!';
      if (slotMachineEl) slotMachineEl.style.display = 'block';
      if (rouletteWinnerCard) rouletteWinnerCard.style.display = 'none';

      if (rouletteSubtext) {
        rouletteSubtext.textContent = poolType === 'ready' 
          ? '🎰 Spinning exclusively from your 100% ready-to-make recipes...'
          : (poolType === 'base' ? '🥣 Spinning from recipes where base ingredients are ready...' : 'Selecting a winning recipe from the full cookbook...');
      }

      if (rouletteSpinInterval) clearInterval(rouletteSpinInterval);

      let ticks = 0;
      rouletteSpinInterval = setInterval(() => {
        const tempR = candidates[Math.floor(Math.random() * candidates.length)];
        rouletteSlotItem.textContent = `🍨 ${tempR.name}`;
        rouletteSlotItem.classList.add('blur');
        ticks++;
        playAudioTick();
        triggerHaptic(12);

        if (ticks >= 8) {
          clearInterval(rouletteSpinInterval);
          rouletteSpinInterval = null;
          rouletteSlotItem.classList.remove('blur');
          rouletteSlotItem.textContent = `🎉 ${winner.name}`;

          playAudioJackpot();
          triggerHaptic([30, 50, 40, 60, 80]);

          if (rouletteBtn) rouletteBtn.classList.remove('spinning');

          let metaText = '';
          if (winnerMatch.isReady) {
            metaText = '⚡ 100% Ready to make right now with items in your pantry!';
          } else if (winnerMatch.isBaseReady) {
            metaText = `🥣 Base Ready to freeze! (Missing ${winnerMatch.missing.length} mix-ins)`;
          } else {
            metaText = `Missing ${winnerMatch.missing.length} ingredient${winnerMatch.missing.length > 1 ? 's' : ''}`;
          }

          if (headlineEl) headlineEl.textContent = '🎉 Flavor Winner!';
          if (rouletteSubtext) rouletteSubtext.textContent = 'Here is your matched Ninja Creami flavor:';
          if (slotMachineEl) slotMachineEl.style.display = 'none';

          if (rouletteWinnerTitle) rouletteWinnerTitle.textContent = winner.name;
          if (rouletteWinnerMeta) rouletteWinnerMeta.textContent = metaText;
          if (rouletteWinnerCard) rouletteWinnerCard.style.display = 'block';

          // Reset modal scroll to ensure the buttons are immediately visible on all screens
          const modalContent = rouletteModalOverlay.querySelector('.roulette-modal-content');
          if (modalContent) modalContent.scrollTop = 0;

          // Note: Do NOT trigger a toast notification here; the modal card already announces
          // the winner and a bottom toast blocks the 'Open Recipe' and 'Spin Again' buttons.
        }
      }, 80);
    } else {
      if (rouletteBtn) rouletteBtn.classList.remove('spinning');
      openRecipeModal(winner, true);
      showToast(`🎰 Creami Roulette picked: "${winner.name}"!`);
    }
  }

  function closeRouletteModal() {
    if (rouletteSpinInterval) {
      clearInterval(rouletteSpinInterval);
      rouletteSpinInterval = null;
    }
    if (rouletteBtn) rouletteBtn.classList.remove('spinning');
    if (rouletteModalOverlay) {
      rouletteModalOverlay.classList.remove('active');
      rouletteModalOverlay.setAttribute('aria-hidden', 'true');
      const slotMachineEl = rouletteModalOverlay.querySelector('.roulette-slot-machine');
      const headlineEl = rouletteModalOverlay.querySelector('.roulette-headline');
      if (headlineEl) headlineEl.textContent = 'Spinning The Flavor Wheel!';
      if (slotMachineEl) slotMachineEl.style.display = 'block';
      if (rouletteWinnerCard) rouletteWinnerCard.style.display = 'none';
    }
    unlockBackgroundScroll();
  }

  // --- Phase 1 Gamification: Chef Badges & Milestones ---
  let userBadgesState = {};
  let currentBadgeFilter = 'all';

  const CHEF_BADGES_MASTER = [
    {
      id: 'first_spin',
      title: 'First Spin',
      icon: '🥇',
      category: 'Spins',
      desc: 'Spin your very first Ninja Creami pint ("I Made This!").',
      target: 1,
      check: (s) => s.totalSpins >= 1,
      progress: (s) => ({ current: Math.min(s.totalSpins, 1), target: 1, label: `${Math.min(s.totalSpins, 1)} / 1 spin` })
    },
    {
      id: 'spins_10',
      title: 'Spin Apprentice',
      icon: '🔟',
      category: 'Spins',
      desc: 'Reach 10 total recipe spins enjoyed.',
      target: 10,
      check: (s) => s.totalSpins >= 10,
      progress: (s) => ({ current: Math.min(s.totalSpins, 10), target: 10, label: `${Math.min(s.totalSpins, 10)} / 10 spins` })
    },
    {
      id: 'spins_50',
      title: 'Master Spinologist',
      icon: '👑',
      category: 'Spins',
      desc: 'Reach 50 total recipe spins across your favorite flavors.',
      target: 50,
      check: (s) => s.totalSpins >= 50,
      progress: (s) => ({ current: Math.min(s.totalSpins, 50), target: 50, label: `${Math.min(s.totalSpins, 50)} / 50 spins` })
    },
    {
      id: 'spins_100',
      title: 'Spin Centurion',
      icon: '💯',
      category: 'Spins',
      desc: 'Reach 100 total recipe spins. A true Creami legend!',
      target: 100,
      check: (s) => s.totalSpins >= 100,
      progress: (s) => ({ current: Math.min(s.totalSpins, 100), target: 100, label: `${Math.min(s.totalSpins, 100)} / 100 spins` })
    },
    {
      id: 'freezer_first',
      title: 'Chilly Pioneer',
      icon: '🧊',
      category: 'Freezer',
      desc: 'Place your first pint on the Virtual Freezer Shelf with a 16-hr timer.',
      target: 1,
      check: (s) => s.freezerPintsCount >= 1 || s.freezerEverAdded >= 1,
      progress: (s) => ({ current: (s.freezerPintsCount >= 1 || s.freezerEverAdded >= 1) ? 1 : 0, target: 1, label: (s.freezerPintsCount >= 1 || s.freezerEverAdded >= 1) ? '1 / 1 pint' : '0 / 1 pint' })
    },
    {
      id: 'freezer_full',
      title: 'Frozen Treasury',
      icon: '❄️',
      category: 'Freezer',
      desc: 'Fill at least 4 slots on your Virtual Freezer shelf at once.',
      target: 4,
      check: (s) => s.freezerPintsCount >= 4,
      progress: (s) => ({ current: Math.min(s.freezerPintsCount, 4), target: 4, label: `${Math.min(s.freezerPintsCount, 4)} / 4 pints` })
    },
    {
      id: 'pantry_10',
      title: 'Pantry Starter',
      icon: '📦',
      category: 'Pantry',
      desc: 'Stock at least 10 ingredients in your kitchen pantry.',
      target: 10,
      check: (s) => s.pantryCount >= 10,
      progress: (s) => ({ current: Math.min(s.pantryCount, 10), target: 10, label: `${Math.min(s.pantryCount, 10)} / 10 items` })
    },
    {
      id: 'pantry_30',
      title: 'Pantry Master',
      icon: '🏪',
      category: 'Pantry',
      desc: 'Stock 30+ ingredients in your kitchen pantry.',
      target: 30,
      check: (s) => s.pantryCount >= 30,
      progress: (s) => ({ current: Math.min(s.pantryCount, 30), target: 30, label: `${Math.min(s.pantryCount, 30)} / 30 items` })
    },
    {
      id: 'flavor_choc_3',
      title: 'Chocoholic',
      icon: '🍫',
      category: 'Flavors',
      desc: 'Spin 3 chocolate, cocoa, fudge, or brownie recipes.',
      target: 3,
      check: (s) => s.chocolateSpins >= 3,
      progress: (s) => ({ current: Math.min(s.chocolateSpins, 3), target: 3, label: `${Math.min(s.chocolateSpins, 3)} / 3 spins` })
    },
    {
      id: 'flavor_fruit_3',
      title: 'Berry Burst',
      icon: '🍓',
      category: 'Flavors',
      desc: 'Spin 3 fruit, berry, or citrus recipes.',
      target: 3,
      check: (s) => s.fruitSpins >= 3,
      progress: (s) => ({ current: Math.min(s.fruitSpins, 3), target: 3, label: `${Math.min(s.fruitSpins, 3)} / 3 spins` })
    },
    {
      id: 'custom_recipe',
      title: 'Mad Scientist',
      icon: '🧪',
      category: 'Creation',
      desc: 'Formulate and save your first custom recipe.',
      target: 1,
      check: (s) => s.customRecipesCount >= 1,
      progress: (s) => ({ current: Math.min(s.customRecipesCount, 1), target: 1, label: `${Math.min(s.customRecipesCount, 1)} / 1 custom` })
    },
    {
      id: 'roulette_spin',
      title: 'Flavor Gambler',
      icon: '🎰',
      category: 'Roulette',
      desc: 'Let Creami Roulette pick a surprise pint for you.',
      target: 1,
      check: (s) => s.rouletteSpun >= 1,
      progress: (s) => ({ current: Math.min(s.rouletteSpun, 1), target: 1, label: `${Math.min(s.rouletteSpun, 1)} / 1 spin` })
    }
  ];

  function getBadgesStorageKey() {
    return (currentUser && currentUser.id)
      ? `${STORAGE_PREFIX}creami_badges_${currentUser.id}`
      : `${STORAGE_PREFIX}creami_badges_guest`;
  }

  function loadUserBadges() {
    try {
      const saved = localStorage.getItem(getBadgesStorageKey());
      if (saved) {
        userBadgesState = JSON.parse(saved) || {};
      } else {
        userBadgesState = {};
      }
    } catch (e) {
      userBadgesState = {};
    }
  }

  function saveUserBadgesLocally() {
    try {
      localStorage.setItem(getBadgesStorageKey(), JSON.stringify(userBadgesState));
    } catch (e) {}
  }

  function getGamificationStats() {
    let totalSpins = 0;
    let chocolateSpins = 0;
    let fruitSpins = 0;

    if (recipeMadeCounts && typeof recipeMadeCounts === 'object') {
      Object.entries(recipeMadeCounts).forEach(([rId, count]) => {
        const c = Number(count) || 0;
        totalSpins += c;
        const r = (typeof allRecipes !== 'undefined') ? allRecipes.find(x => x.id === rId) : null;
        if (r) {
          const cat = (r.category || '').toLowerCase();
          const name = (r.name || '').toLowerCase();
          if (cat.includes('chocolate') || name.includes('chocolate') || name.includes('brownie') || name.includes('fudge') || name.includes('cocoa')) {
            chocolateSpins += c;
          }
          if (cat.includes('fruit') || cat.includes('sorbet') || name.includes('berry') || name.includes('strawberry') || name.includes('banana') || name.includes('lemon') || name.includes('mango') || name.includes('peach') || name.includes('apple')) {
            fruitSpins += c;
          }
        }
      });
    }

    const pantryCount = (pantryState && pantryState.size) ? pantryState.size : 0;
    const freezerPintsCount = (Array.isArray(freezerPintsState)) ? freezerPintsState.length : 0;
    const customRecipesCount = (Array.isArray(customRecipesState)) ? customRecipesState.length : 0;
    const rouletteSpun = parseInt(localStorage.getItem('creami_roulette_spins_count') || '0', 10);
    const freezerEverAdded = parseInt(localStorage.getItem('creami_freezer_ever_added') || (freezerPintsCount > 0 ? '1' : '0'), 10);

    return {
      totalSpins,
      chocolateSpins,
      fruitSpins,
      pantryCount,
      freezerPintsCount,
      freezerEverAdded,
      customRecipesCount,
      rouletteSpun
    };
  }

  function getChefRank(unlockedCount) {
    if (unlockedCount >= 12) return 'Ice Cream Alchemist 👑';
    if (unlockedCount >= 9) return 'Master Spinologist 🍦';
    if (unlockedCount >= 6) return 'Macro Mixologist 🥣';
    if (unlockedCount >= 3) return 'Pint Pioneer 🍨';
    return 'Spin Rookie 🥄';
  }

  function evaluateBadges(showCelebration = true) {
    const stats = getGamificationStats();
    let newlyUnlocked = [];

    CHEF_BADGES_MASTER.forEach(badge => {
      if (!userBadgesState[badge.id] && badge.check(stats)) {
        userBadgesState[badge.id] = {
          unlockedAt: Date.now()
        };
        newlyUnlocked.push(badge);
      }
    });

    if (newlyUnlocked.length > 0) {
      saveUserBadgesLocally();
      triggerCloudSync();
      if (showCelebration) {
        newlyUnlocked.forEach(b => {
          showBadgeCelebration(b);
        });
      }
    }

    updateBadgesUI();
  }

  function showBadgeCelebration(badge) {
    playAudioJackpot();
    triggerHaptic([40, 60, 40, 80]);
    showToast(`🏆 Badge Unlocked: ${badge.icon} ${badge.title}!`);
  }

  function updateBadgesUI() {
    const unlockedCount = Object.keys(userBadgesState).length;
    const totalCount = CHEF_BADGES_MASTER.length;
    const rank = getChefRank(unlockedCount);

    if (headerBadgesBadge) {
      headerBadgesBadge.textContent = `${unlockedCount}/${totalCount}`;
    }
    if (statBadgesUnlockedCount) {
      statBadgesUnlockedCount.textContent = `${unlockedCount}/${totalCount}`;
    }
    if (statBadgesRankLabel) {
      statBadgesRankLabel.textContent = rank;
    }
    if (badgesModalCountText) {
      badgesModalCountText.textContent = `${unlockedCount} / ${totalCount} Unlocked`;
    }
    if (badgesModalRankText) {
      badgesModalRankText.textContent = `👑 Rank: ${rank}`;
    }
    if (badgesModalProgressBar) {
      const pct = Math.round((unlockedCount / totalCount) * 100);
      badgesModalProgressBar.style.width = `${pct}%`;
    }
    if (badgeTabUnlocked) {
      badgeTabUnlocked.textContent = `Unlocked (${unlockedCount})`;
    }
    if (badgeTabLocked) {
      badgeTabLocked.textContent = `In Progress (${totalCount - unlockedCount})`;
    }

    if (badgesModalOverlay && badgesModalOverlay.classList.contains('active')) {
      renderBadgesGrid();
    }
  }

  function renderBadgesGrid() {
    if (!badgesGridContainer) return;
    const stats = getGamificationStats();

    let filtered = CHEF_BADGES_MASTER;
    if (currentBadgeFilter === 'unlocked') {
      filtered = CHEF_BADGES_MASTER.filter(b => userBadgesState[b.id]);
    } else if (currentBadgeFilter === 'locked') {
      filtered = CHEF_BADGES_MASTER.filter(b => !userBadgesState[b.id]);
    }

    if (filtered.length === 0) {
      badgesGridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; color: var(--text-dim);">
          ${currentBadgeFilter === 'unlocked' ? 'No badges unlocked yet! Keep spinning recipes to unlock milestones.' : 'All badges unlocked! You are a master! 🎉'}
        </div>
      `;
      return;
    }

    badgesGridContainer.innerHTML = filtered.map(badge => {
      const isUnlocked = Boolean(userBadgesState[badge.id]);
      const prog = badge.progress(stats);
      const pct = Math.round((prog.current / prog.target) * 100);
      const unlockedDateStr = isUnlocked && userBadgesState[badge.id].unlockedAt
        ? new Date(userBadgesState[badge.id].unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unlocked';

      return `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon-box">${badge.icon}</div>
          <div class="badge-info-col">
            <div class="badge-top-row">
              <span class="badge-title-text" title="${badge.title}">${badge.title}</span>
              <span class="badge-cat-tag">${badge.category}</span>
            </div>
            <div class="badge-desc-text">${badge.desc}</div>
            ${isUnlocked ? `
              <div class="badge-unlocked-status">
                <span>✓</span> ${unlockedDateStr}
              </div>
            ` : `
              <div class="badge-progress-wrap">
                <div class="badge-progress-label">
                  <span>Progress</span>
                  <span>${prog.label}</span>
                </div>
                <div class="badge-progress-bar">
                  <div class="badge-progress-fill-bar" style="width: ${pct}%;"></div>
                </div>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  function openBadgesModal() {
    if (!badgesModalOverlay) return;
    evaluateBadges(false);
    badgesModalOverlay.classList.add('active');
    badgesModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
    renderBadgesGrid();
  }

  function closeBadgesModal() {
    if (!badgesModalOverlay) return;
    badgesModalOverlay.classList.remove('active');
    badgesModalOverlay.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  async function shareBadgesAchievement() {
    const unlockedCount = Object.keys(userBadgesState).length;
    const totalCount = CHEF_BADGES_MASTER.length;
    const rank = getChefRank(unlockedCount);

    const shareText = `🏆 I've unlocked ${unlockedCount}/${totalCount} Chef Badges on Creami Cravings!\nCurrent Rank: ${rank}\nCheck out high-protein Ninja Creami recipes matching your kitchen pantry: https://creamicravings.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Creami Cravings Chef Badges',
          text: shareText,
          url: 'https://creamicravings.com'
        });
        return;
      } catch (e) {}
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('📋 Achievement summary copied to clipboard!');
        return;
      } catch (e) {}
    }

    showToast(shareText);
  }

  // Fitness & Macro Target Panel Helpers (Roadmap Item 10)
  function toggleMacroSliders() {
    if (!macroSlidersPanel) return;
    const isHidden = macroSlidersPanel.style.display === 'none';
    macroSlidersPanel.style.display = isHidden ? 'block' : 'none';
    if (toggleMacroSlidersBtn) {
      toggleMacroSlidersBtn.classList.toggle('active-panel', isHidden);
    }
  }

  function updateMacroFiltersUI() {
    if (minProteinDisplay) {
      minProteinDisplay.textContent = macroFilters.minProtein > 0 ? `≥ ${macroFilters.minProtein}g` : 'Any (≥0g)';
    }
    if (maxCaloriesDisplay) {
      maxCaloriesDisplay.textContent = macroFilters.maxCalories < 450 ? `≤ ${macroFilters.maxCalories} kcal` : 'Any (≤450)';
    }
    if (maxFatDisplay) {
      maxFatDisplay.textContent = macroFilters.maxFat < 20 ? `≤ ${macroFilters.maxFat}g` : 'Any (≤20g)';
    }

    const hasActive = macroFilters.minProtein > 0 || macroFilters.maxCalories < 450 || macroFilters.maxFat < 20;
    if (macroActiveIndicator) {
      macroActiveIndicator.style.display = hasActive ? 'inline-block' : 'none';
    }

    if (macroFilterSummary) {
      if (!hasActive) {
        macroFilterSummary.textContent = 'No filters active';
      } else {
        const parts = [];
        if (macroFilters.minProtein > 0) parts.push(`≥${macroFilters.minProtein}g P`);
        if (macroFilters.maxCalories < 450) parts.push(`≤${macroFilters.maxCalories} Cal`);
        if (macroFilters.maxFat < 20) parts.push(`≤${macroFilters.maxFat}g Fat`);
        macroFilterSummary.textContent = parts.join(' • ');
      }
    }
  }

  // --- Amazon Replacement Pint Lid Color System ---
  const PINT_LID_COLORS = [
    { id: 'blue', name: 'Blue', hex: '#38bdf8', border: '#0284c7', text: '#0c4a6e', bgTint: 'rgba(56, 189, 248, 0.18)', icon: '🔵' },
    { id: 'pink', name: 'Pink', hex: '#f472b6', border: '#db2777', text: '#831843', bgTint: 'rgba(244, 114, 182, 0.18)', icon: '🌸' },
    { id: 'green', name: 'Green', hex: '#4ade80', border: '#16a34a', text: '#14532d', bgTint: 'rgba(74, 222, 128, 0.18)', icon: '🟢' },
    { id: 'yellow', name: 'Yellow', hex: '#facc15', border: '#ca8a04', text: '#713f12', bgTint: 'rgba(250, 204, 21, 0.20)', icon: '🟡' },
    { id: 'purple', name: 'Purple', hex: '#c084fc', border: '#9333ea', text: '#581c87', bgTint: 'rgba(192, 132, 252, 0.18)', icon: '🟣' },
    { id: 'orange', name: 'Orange', hex: '#fb923c', border: '#ea580c', text: '#7c2d12', bgTint: 'rgba(251, 146, 60, 0.18)', icon: '🟠' },
    { id: 'teal', name: 'Teal', hex: '#2dd4bf', border: '#0d9488', text: '#134e4a', bgTint: 'rgba(45, 212, 191, 0.18)', icon: '🌊' },
    { id: 'gray', name: 'Gray', hex: '#94a3b8', border: '#64748b', text: '#334155', bgTint: 'rgba(148, 163, 184, 0.18)', icon: '⚪' }
  ];

  function getPintLidColor(colorIdOrSlot) {
    if (typeof colorIdOrSlot === 'string') {
      const found = PINT_LID_COLORS.find(c => c.id === colorIdOrSlot.toLowerCase());
      if (found) return found;
    }
    if (typeof colorIdOrSlot === 'number') {
      const idx = (colorIdOrSlot - 1) % PINT_LID_COLORS.length;
      return PINT_LID_COLORS[idx >= 0 ? idx : 0];
    }
    return PINT_LID_COLORS[0];
  }

  function renderLidColorSwatches(containerId, hiddenInputId, selectedColorId = 'blue') {
    const container = document.getElementById(containerId);
    const hiddenInput = document.getElementById(hiddenInputId);
    if (!container) return;
    if (hiddenInput) hiddenInput.value = selectedColorId;

    container.innerHTML = PINT_LID_COLORS.map(c => {
      const isSelected = c.id === selectedColorId;
      return `
        <button type="button" class="lid-swatch-btn ${isSelected ? 'active' : ''}" data-color-id="${c.id}" style="--swatch-glow: ${c.hex}; ${isSelected ? `border-color: ${c.border}; background: ${c.bgTint};` : ''}" title="${c.name} Lid">
          <span class="lid-swatch-circle" style="background: ${c.hex};">${isSelected ? '✓' : ''}</span>
          <span>${c.name}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.lid-swatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const colorId = btn.dataset.colorId;
        if (hiddenInput) hiddenInput.value = colorId;
        container.querySelectorAll('.lid-swatch-btn').forEach(b => {
          const isThis = b.dataset.colorId === colorId;
          const col = PINT_LID_COLORS.find(item => item.id === b.dataset.colorId);
          b.classList.toggle('active', isThis);
          if (isThis && col) {
            b.style.borderColor = col.border;
            b.style.background = col.bgTint;
          } else {
            b.style.borderColor = '';
            b.style.background = '';
          }
          const circle = b.querySelector('.lid-swatch-circle');
          if (circle) circle.textContent = isThis ? '✓' : '';
        });
      });
    });
  }

  function cyclePintLidColor(pintId) {
    const pint = freezerPintsState.find(p => p.id === pintId);
    if (!pint) return;
    const currentColor = getPintLidColor(pint.lidColor || pint.slot || 1);
    const currentIndex = PINT_LID_COLORS.findIndex(c => c.id === currentColor.id);
    const nextIndex = (currentIndex + 1) % PINT_LID_COLORS.length;
    const nextColor = PINT_LID_COLORS[nextIndex];
    pint.lidColor = nextColor.id;
    saveFreezerPints();
    renderFreezerShelfWidget();
    if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
      renderFreezerModal();
    }
    showToast(`${nextColor.icon} Assigned ${nextColor.name} lid to "${pint.recipeName}"!`);
  }

  // --- Freezer Inventory & 16-Hour Timer Engine (Roadmap Item 8) ---
  function computePintStatus(pint) {
    const now = Date.now();
    const frozenAt = pint.frozenAt || now;
    const durationMs = pint.freezeHours ? pint.freezeHours * 60 * 60 * 1000 : FREEZE_DURATION_MS;
    const elapsedMs = Math.max(0, now - frozenAt);
    const remainingMs = Math.max(0, durationMs - elapsedMs);
    const isReady = remainingMs <= 0;
    const percent = Math.min(100, Math.max(0, Math.round((elapsedMs / durationMs) * 100)));

    const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
    const minsLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    let timeRemainingLabel = '';
    if (isReady) {
      timeRemainingLabel = 'Ready to Spin! 🍨';
    } else if (hoursLeft > 0) {
      timeRemainingLabel = `${hoursLeft}h ${minsLeft}m left`;
    } else {
      timeRemainingLabel = `${minsLeft}m left`;
    }

    const mixedDate = new Date(frozenAt);
    const dateFormatted = mixedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isToday = mixedDate.toDateString() === new Date().toDateString();
    const mixedLabel = isToday ? `Today at ${dateFormatted}` : `${mixedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${dateFormatted}`;

    return {
      isReady,
      percent,
      hoursLeft,
      minsLeft,
      timeRemainingLabel,
      mixedLabel
    };
  }

  function updateFreezerBadges() {
    const total = freezerPintsState.length;
    let readyCount = 0;
    freezerPintsState.forEach(p => {
      if (computePintStatus(p).isReady) readyCount++;
    });

    if (freezerBadge) {
      freezerBadge.textContent = total;
      freezerBadge.classList.toggle('ready', readyCount > 0);
      if (readyCount > 0) {
        freezerBadge.title = `${readyCount} pint${readyCount === 1 ? '' : 's'} ready to spin!`;
      } else {
        freezerBadge.title = `${total} pint${total === 1 ? '' : 's'} in freezer`;
      }
    }

    if (navFreezerBadge) {
      navFreezerBadge.textContent = total;
      navFreezerBadge.style.display = total > 0 ? 'inline-block' : 'none';
      navFreezerBadge.classList.toggle('ready', readyCount > 0);
    }

    if (freezerPintsCount) {
      freezerPintsCount.textContent = `${total} Pint${total === 1 ? '' : 's'}`;
    }
  }

  // --- Hybrid Freezer Shelf Capacity Expansion Engine (Model B + Model C) ---
  function getUserMaxFreezerSlots(user = currentUser) {
    if (!user) return 4;
    const subs = Array.isArray(user.subscriptions) ? user.subscriptions : [];
    const vips = Array.isArray(user.creatorVips) ? user.creatorVips : [];
    const purchasedCap = Number(user.freezerCapacity) || 4;

    // Tier 2 (12 Slots — Deep Freeze Pro):
    // - Admin, Content Creator, or VIP Circle member
    // - Holds any Creator All-Access Bundle ('All-Access', 'Eli All-Access', 'TestContent All-Access')
    // - Purchased standalone 12-slot expansion
    const hasAllAccessBundle = subs.some(s =>
      ['All-Access', 'Eli All-Access', 'TestContent All-Access'].includes(s)
    );
    if (
      user.role === 'admin' ||
      user.role === 'creator' ||
      user.role === 'vip' ||
      vips.length > 0 ||
      hasAllAccessBundle ||
      purchasedCap >= 12
    ) {
      return 12;
    }

    // Tier 1 (8 Slots — Full Week Prep):
    // - Holds any paid Creator Cookbook / Pack
    // - Purchased standalone 8-slot expansion
    const paidCreatorPacks = [
      'Fan Favorites',
      'No Protein',
      'Keto',
      'Lactose Free',
      'TestContent Sampler',
      'Volume Pints'
    ];
    const hasPaidCreatorPack = subs.some(s => paidCreatorPacks.includes(s));
    if (hasPaidCreatorPack || purchasedCap >= 8) {
      return 8;
    }

    return 4;
  }

  function getFreezerTierInfo(user = currentUser) {
    const maxSlots = getUserMaxFreezerSlots(user);
    const subs = (user && Array.isArray(user.subscriptions)) ? user.subscriptions : [];
    const vips = (user && Array.isArray(user.creatorVips)) ? user.creatorVips : [];

    if (maxSlots >= 12) {
      let label = '👑 12-Slot Deep Freeze Pro';
      if (user && (user.role === 'admin' || user.role === 'creator')) {
        label = '👑 12-Slot Pro (Staff/Creator)';
      } else if (user && (user.role === 'vip' || vips.length > 0)) {
        label = '👑 12-Slot VIP Circle Perk';
      } else if (subs.some(s => ['All-Access', 'Eli All-Access', 'TestContent All-Access'].includes(s))) {
        label = '👑 12-Slot Bundle Bonus';
      }
      return {
        maxSlots: 12,
        label,
        bg: 'rgba(245, 158, 11, 0.16)',
        color: '#fbbf24',
        border: 'rgba(245, 158, 11, 0.35)'
      };
    }

    if (maxSlots >= 8) {
      const paidCreatorPacks = ['Fan Favorites', 'No Protein', 'Keto', 'Lactose Free', 'TestContent Sampler', 'Volume Pints'];
      const isPackBonus = subs.some(s => paidCreatorPacks.includes(s));
      return {
        maxSlots: 8,
        label: isPackBonus ? '🎁 8-Slot Cookbook Bonus' : '🧊 8-Slot Full Week',
        bg: 'rgba(56, 189, 248, 0.16)',
        color: '#38bdf8',
        border: 'rgba(56, 189, 248, 0.35)'
      };
    }

    return {
      maxSlots: 4,
      label: '4 Free Slots',
      bg: 'rgba(148, 163, 184, 0.14)',
      color: '#cbd5e1',
      border: 'rgba(148, 163, 184, 0.28)'
    };
  }

  function openFreezerUpgradeModal(requestedSlots = 8, triggerReason = 'locked_tab') {
    const overlay = document.getElementById('freezerUpgradeModalOverlay');
    if (!overlay) return;

    const tierInfo = getFreezerTierInfo(currentUser);
    const maxSlots = tierInfo.maxSlots;
    const reasonTextEl = document.getElementById('freezerUpgradeReasonText');
    const currentBadgeEl = document.getElementById('freezerUpgradeCurrentBadge');
    const btnBuy8 = document.getElementById('btnFreezerBuy8');
    const btnBuy12 = document.getElementById('btnFreezerBuy12');

    if (reasonTextEl) {
      if (triggerReason === 'overflow') {
        reasonTextEl.innerHTML = `🧊 Your <strong>${freezerSlotCapacity}-slot freezer shelf is 100% full!</strong> Extra slots beyond 4 require an upgrade. Buy separately below or unlock free with cookbooks.`;
      } else if (triggerReason === 'batch_overflow') {
        reasonTextEl.innerHTML = `🗓️ Your <strong>Sunday Batch Queue</strong> has more pints than open freezer slots! Upgrade to 8 or 12 slots to chill your entire batch.`;
      } else {
        const tierName = requestedSlots <= 8 ? 'Full Week Prep (6 & 8 Slots)' : 'Deep Freeze Pro (12 Slots)';
        reasonTextEl.innerHTML = `🔒 Spots after 4 are behind the <strong>${tierName}</strong> paywall. You can purchase them separately below (no cookbook purchase needed) or unlock free with creator packs.`;
      }
    }

    if (currentBadgeEl) {
      currentBadgeEl.textContent = `Current Max: ${maxSlots} Slots (${tierInfo.label})`;
      currentBadgeEl.style.background = tierInfo.bg;
      currentBadgeEl.style.color = tierInfo.color;
      currentBadgeEl.style.borderColor = tierInfo.border;
    }

    if (btnBuy8) {
      if (maxSlots >= 8) {
        btnBuy8.textContent = '✓ 8 Slots Already Unlocked';
        btnBuy8.disabled = true;
        btnBuy8.style.opacity = '0.55';
        btnBuy8.style.cursor = 'default';
      } else {
        btnBuy8.textContent = '⚡ Unlock 8 Slots — $1.99 One-Time';
        btnBuy8.disabled = false;
        btnBuy8.style.opacity = '1';
        btnBuy8.style.cursor = 'pointer';
      }
    }

    if (btnBuy12) {
      if (maxSlots >= 12) {
        btnBuy12.textContent = '✓ 12 Slots Already Unlocked';
        btnBuy12.disabled = true;
        btnBuy12.style.opacity = '0.55';
        btnBuy12.style.cursor = 'default';
      } else {
        btnBuy12.textContent = '👑 Unlock 12-Slot Pro Shelf — $3.99 One-Time';
        btnBuy12.disabled = false;
        btnBuy12.style.opacity = '1';
        btnBuy12.style.cursor = 'pointer';
      }
    }

    overlay.style.display = 'flex';
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeFreezerUpgradeModal() {
    const overlay = document.getElementById('freezerUpgradeModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        if (!overlay.classList.contains('active')) {
          overlay.style.display = 'none';
        }
      }, 200);
    }
    unlockBackgroundScroll();
  }

  const STRIPE_FREEZER_LINKS = {
    8: 'https://buy.stripe.com/6oU7sL2DZe3d2Bq9pfefC00',
    12: 'https://buy.stripe.com/6oUfZh0vRgbla3SatjefC01'
  };

  async function handleUpgradeFreezerCapacity(targetSlots) {
    const slots = parseInt(targetSlots, 10);
    if (slots !== 8 && slots !== 12) return;

    if (!currentUser || (!currentUser.token && !currentUser.email)) {
      closeFreezerUpgradeModal();
      openGoogleAuthModal();
      showToast('🔒 Please sign in to your free account first to unlock extra freezer shelf slots!');
      return;
    }

    const currentMax = getUserMaxFreezerSlots(currentUser);
    if (currentMax >= slots) {
      showToast(`🧊 You already have ${currentMax} container slots unlocked!`);
      closeFreezerUpgradeModal();
      return;
    }

    // Role Mimic & Super Admin Testing Mode: allow instant simulated unlock or real Stripe checkout
    const isSuperAdmin = Boolean(realAdminUser || isSuperAdminAccount(currentUser));
    if (isSuperAdmin) {
      const proceedRealStripe = window.confirm(
        `👑 Admin / Testing Mode:\n\nClick OK to open the REAL Stripe Checkout page (${slots} Slots — ${slots === 8 ? '$1.99' : '$3.99'}).\nClick CANCEL for an instant free simulated upgrade (test UI/DB without paying).`
      );
      if (!proceedRealStripe) {
        await executeFreezerUpgradeSuccess(slots, true);
        return;
      }
    }

    const stripeBase = STRIPE_FREEZER_LINKS[slots];
    if (!stripeBase) {
      showToast('Stripe checkout link not found.');
      return;
    }

    const btn = document.getElementById(slots === 8 ? 'btnFreezerBuy8' : 'btnFreezerBuy12');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Redirecting to Stripe...';
    }

    try {
      localStorage.setItem('pending_stripe_freezer_tier', slots.toString());
    } catch (e) {}

    const clientRef = encodeURIComponent(currentUser.id || currentUser.email || 'guest');
    const emailParam = currentUser.email ? `&prefilled_email=${encodeURIComponent(currentUser.email)}` : '';
    const checkoutUrl = `${stripeBase}?client_reference_id=${clientRef}${emailParam}`;

    showToast('🚀 Redirecting to secure Stripe Checkout...');
    setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 350);
  }

  async function executeFreezerUpgradeSuccess(targetSlots, isSimulated = false) {
    const slots = parseInt(targetSlots, 10);
    if (slots !== 8 && slots !== 12) return;

    const userEmail = (currentUser && currentUser.email) || (realAdminUser && realAdminUser.email) || '';
    const userToken = (currentUser && currentUser.token) || (realAdminUser && realAdminUser.token) || '';

    if (!currentUser || (!userToken && !userEmail)) {
      try {
        localStorage.setItem('pending_freezer_upgrade', slots.toString());
      } catch (e) {}
      showToast('🎉 Upgrade payment recognized! Please sign in to activate your spots.');
      openGoogleAuthModal();
      return;
    }

    const btn = document.getElementById(slots === 8 ? 'btnFreezerBuy8' : 'btnFreezerBuy12');
    const origText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Unlocking Shelf...';
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (userToken) headers['Authorization'] = `Bearer ${userToken}`;
      if (userEmail) headers['X-User-Email'] = userEmail;

      const res = await fetch('/api/user/freezer/upgrade', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: userToken,
          email: userEmail,
          targetSlots: slots
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to upgrade freezer capacity.');
        if (btn) {
          btn.disabled = false;
          btn.textContent = origText;
        }
        return;
      }

      currentUser.freezerCapacity = Math.max(Number(currentUser.freezerCapacity) || 4, slots);
      if (currentMimicRole && currentMimicRole !== 'admin') {
        try { localStorage.setItem('creami_mimic_user_freezer_capacity', slots.toString()); } catch (e) {}
      }
      if (realAdminUser) {
        realAdminUser.freezerCapacity = Math.max(Number(realAdminUser.freezerCapacity) || 4, slots);
        try { localStorage.setItem(REAL_ADMIN_STORAGE_KEY, JSON.stringify(realAdminUser)); } catch (e) {}
      }
      saveUserAuth();

      freezerSlotCapacity = slots;
      try { localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString()); } catch (e) {}
      try { localStorage.removeItem('pending_stripe_freezer_tier'); } catch (e) {}
      try { localStorage.removeItem('pending_freezer_upgrade'); } catch (e) {}

      closeFreezerUpgradeModal();
      renderFreezerShelfWidget();
      if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
        renderFreezerModal();
      }

      playAudioJackpot();
      if (navigator.vibrate) {
        try { navigator.vibrate([100, 50, 150]); } catch (e) {}
      }
      showToast(
        isSimulated
          ? `⚡ [Simulated] Unlocked the ${slots}-Container Freezer Shelf! Database updated.`
          : `🎉 Payment Confirmed! Unlocked your ${slots}-Container Freezer Shelf! Time to prep more pints! 🧊🍨`,
        6000
      );
    } catch (err) {
      console.error('Freezer upgrade error:', err);
      showToast('Network error while upgrading freezer shelf.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = origText;
      }
    }
  }

  function checkPaymentReturnRedirect() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const hasStripeSession = urlParams.has('session_id');
      const isFreezerUpgradeSuccess = urlParams.get('freezer_upgrade') === 'success';

      if (paymentStatus === 'cancel') {
        showToast('Freezer shelf upgrade was cancelled. You can upgrade anytime!', 4000);
        try { localStorage.removeItem('pending_stripe_freezer_tier'); } catch (e) {}
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (e) {}
        return;
      }

      if (paymentStatus === 'success' || hasStripeSession || isFreezerUpgradeSuccess) {
        let tierParam = urlParams.get('tier') || urlParams.get('slots') || urlParams.get('freezer');
        let targetSlots = parseInt(tierParam, 10);
        if (!targetSlots || isNaN(targetSlots)) {
          targetSlots = parseInt(localStorage.getItem('pending_stripe_freezer_tier') || '8', 10);
        }
        if (targetSlots !== 8 && targetSlots !== 12) {
          targetSlots = 8;
        }

        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (e) {}

        setTimeout(() => {
          executeFreezerUpgradeSuccess(targetSlots, false);
        }, 350);
      }
    } catch (e) {
      console.warn('Error checking payment return:', e);
    }
  }

  // --- Visual Freezer Shelf & Multi-Container Slots Engine ---
  function renderFreezerShelfWidget() {
    const widget = document.getElementById('freezerShelfWidget');
    const grid = document.getElementById('shelfSlotsGrid');
    const capText = document.getElementById('shelfCapacityText');
    const tierBadge = document.getElementById('shelfTierBadge');
    const wrapper = document.getElementById('shelfSlotsWrapper');
    const collapseIcon = document.getElementById('shelfCollapseIcon');
    if (!widget || !grid) return;

    const shelfHeaderEl = document.getElementById('freezerShelfHeader');
    const collapseBtnEl = document.getElementById('btnShelfToggleCollapse');
    if (shelfHeaderEl) {
      shelfHeaderEl.setAttribute('aria-expanded', isShelfCollapsed ? 'false' : 'true');
    }
    if (collapseBtnEl) {
      collapseBtnEl.setAttribute('aria-expanded', isShelfCollapsed ? 'false' : 'true');
      collapseBtnEl.setAttribute('title', isShelfCollapsed ? 'Expand Freezer Shelf' : 'Collapse Freezer Shelf');
    }

    if (wrapper && collapseIcon) {
      if (isShelfCollapsed) {
        wrapper.classList.add('collapsed');
        collapseIcon.textContent = '▸';
      } else {
        wrapper.classList.remove('collapsed');
        collapseIcon.textContent = '▾';
      }
    }

    const tierInfo = getFreezerTierInfo(currentUser);
    const maxAllowed = tierInfo.maxSlots;
    if (freezerSlotCapacity > maxAllowed) {
      freezerSlotCapacity = maxAllowed;
    }

    if (tierBadge) {
      if (maxAllowed < 12) {
        tierBadge.innerHTML = `${tierInfo.label} • <span style="text-decoration: underline; font-weight: 800;">⚡ Expand</span>`;
        tierBadge.style.cursor = 'pointer';
        tierBadge.title = 'Click to expand your freezer shelf spots (purchase separately or via cookbooks)';
      } else {
        tierBadge.textContent = tierInfo.label;
        tierBadge.style.cursor = 'default';
        tierBadge.title = tierInfo.label;
      }
      tierBadge.style.display = 'inline-flex';
      tierBadge.style.background = tierInfo.bg;
      tierBadge.style.color = tierInfo.color;
      tierBadge.style.border = `1px solid ${tierInfo.border}`;
    }

    // Ensure capacity toggle buttons reflect active & lock state
    widget.querySelectorAll('.btn-slot-cap').forEach(btn => {
      const cap = parseInt(btn.dataset.slots, 10);
      const isLocked = cap > maxAllowed;
      btn.classList.toggle('active', cap === freezerSlotCapacity);
      btn.classList.toggle('locked-cap', isLocked);
      if (isLocked) {
        btn.innerHTML = cap === 12 ? `12 <span style="font-size:0.75em;opacity:0.9;">👑</span>` : `${cap} <span style="font-size:0.75em;opacity:0.85;">🔒</span>`;
        btn.style.opacity = '0.78';
        btn.title = cap === 12
          ? 'Locked: Unlock 12-Slot Deep Freeze Pro ($3.99) or get FREE with any Creator All-Access Bundle / VIP Circle'
          : `Locked: Unlock ${cap}-Slot Full Week Shelf ($1.99) or get FREE with any Creator Cookbook`;
      } else {
        btn.textContent = `${cap}`;
        btn.style.opacity = '1';
        btn.title = `${cap} container slots (Unlocked)`;
      }
    });

    // Make sure pints in state have valid slots 1..freezerSlotCapacity
    const takenSlots = new Set();
    freezerPintsState.forEach(p => {
      if (typeof p.slot === 'number' && p.slot >= 1 && p.slot <= freezerSlotCapacity && !takenSlots.has(p.slot)) {
        takenSlots.add(p.slot);
      } else {
        // Find first untaken slot
        for (let s = 1; s <= freezerSlotCapacity; s++) {
          if (!takenSlots.has(s)) {
            p.slot = s;
            takenSlots.add(s);
            break;
          }
        }
      }
    });

    const activeCount = freezerPintsState.filter(p => p.slot && p.slot <= freezerSlotCapacity).length;
    let readyCount = 0;
    freezerPintsState.forEach(p => {
      if (computePintStatus(p).isReady) readyCount++;
    });

    if (capText) {
      if (readyCount > 0) {
        capText.innerHTML = `<span style="color: #4ade80; font-weight: 800;">🎉 ${readyCount} Pint${readyCount === 1 ? '' : 's'} Ready to Spin!</span> • ${activeCount} of ${freezerSlotCapacity} Full`;
      } else {
        capText.textContent = `${activeCount} of ${freezerSlotCapacity} Containers Chilling`;
      }
    }

    // Build slots HTML
    let html = '';
    for (let slotNum = 1; slotNum <= freezerSlotCapacity; slotNum++) {
      const pint = freezerPintsState.find(p => p.slot === slotNum);
      if (!pint) {
        // Empty Slot
        html += `
          <div class="shelf-slot-card empty" data-slot="${slotNum}" title="Click to fill container slot ${slotNum}">
            <div class="slot-number-badge">Slot ${slotNum}</div>
            <div class="slot-empty-icon">➕</div>
            <div class="slot-empty-label">Empty Container</div>
            <div class="slot-empty-sub">Ready to Prep</div>
            <button type="button" class="btn-slot-fill" data-action="fill-slot" data-slot="${slotNum}">Fill Slot ${slotNum}</button>
          </div>
        `;
      } else {
        const status = computePintStatus(pint);
        const isDeluxe = pint.scale === 1.5 || (pint.sizeLabel && pint.sizeLabel.includes('24 oz'));
        const sizeTag = isDeluxe ? '24 oz' : '16 oz';
        const lid = getPintLidColor(pint.lidColor || slotNum);
        const mixins = getPintMixins(pint);
        const mixinSummary = mixins.map(m => (m.qty ? `${m.qty} ${m.name}` : m.name)).join(', ');
        const mixinBadgeHtml = mixins.length > 0
          ? `<div class="slot-mixin-badge" title="Mix-in: ${escapeHtml(mixinSummary)}"><span class="mixin-badge-icon">🍪</span><span class="mixin-badge-text"><strong>Mix-in:</strong> ${escapeHtml(mixinSummary)}</span></div>`
          : '';
        if (status.isReady) {
          // Ready Slot
          html += `
            <div class="shelf-slot-card ready" data-slot="${slotNum}" data-pint-id="${pint.id}">
              <div class="slot-lid-bar" style="background: ${lid.hex}; box-shadow: 0 0 10px ${lid.hex}55;"></div>
              <div class="slot-header-row">
                <div class="slot-header-left">
                  <span class="slot-number-badge">Slot ${slotNum}</span>
                  <button type="button" class="slot-lid-pill" data-action="cycle-lid-color" data-pint-id="${pint.id}" style="border-color: ${lid.border}; color: ${lid.hex};" title="Lid: ${lid.name} (Click to change)">
                    <span class="lid-pill-dot" style="background: ${lid.hex};"></span>
                    <span>${lid.name}</span>
                  </button>
                </div>
                <span class="slot-status-pill ready">🟢 READY!</span>
              </div>
              <div class="slot-recipe-name" title="${escapeHtml(pint.recipeName)}">${escapeHtml(pint.recipeName)}</div>
              <div class="slot-meta-info">🍨 ${sizeTag} • 100% Solid &amp; Ready</div>
              ${mixinBadgeHtml}
              <button type="button" class="btn-slot-spin-ready" data-action="spin-slot" data-pint-id="${pint.id}">
                <span>🍨 Spin &amp; Enjoy (+1)</span>
              </button>
            </div>
          `;
        } else {
          // Chilling Slot
          html += `
            <div class="shelf-slot-card chilling" data-slot="${slotNum}" data-pint-id="${pint.id}">
              <div class="slot-lid-bar" style="background: ${lid.hex}; box-shadow: 0 0 10px ${lid.hex}55;"></div>
              <div class="slot-header-row">
                <div class="slot-header-left">
                  <span class="slot-number-badge">Slot ${slotNum}</span>
                  <button type="button" class="slot-lid-pill" data-action="cycle-lid-color" data-pint-id="${pint.id}" style="border-color: ${lid.border}; color: ${lid.hex};" title="Lid: ${lid.name} (Click to change)">
                    <span class="lid-pill-dot" style="background: ${lid.hex};"></span>
                    <span>${lid.name}</span>
                  </button>
                </div>
                <span class="slot-status-pill chilling">❄️ ${status.timeRemainingLabel}</span>
              </div>
              <div class="slot-recipe-name" title="${escapeHtml(pint.recipeName)}">${escapeHtml(pint.recipeName)}</div>
              <div class="slot-meta-info">${sizeTag} • ${status.percent}% Solid</div>
              ${mixinBadgeHtml}
              <div class="slot-progress-container">
                <div class="slot-progress-track">
                  <div class="slot-progress-bar" style="width: ${status.percent}%;"></div>
                </div>
              </div>
              <div class="slot-actions-row">
                <button type="button" class="btn-slot-action btn-slot-mark-ready" data-action="mark-slot-ready" data-pint-id="${pint.id}" title="Already froze this pint? Mark it as 100% solid &amp; ready to spin!">🟢 Ready to Spin</button>
                ${pint.recipeId ? `<button type="button" class="btn-slot-action btn-slot-recipe" data-action="view-recipe" data-recipe-id="${pint.recipeId}">📖 Recipe</button>` : ''}
                <button type="button" class="btn-slot-action btn-slot-discard" data-action="discard-slot" data-pint-id="${pint.id}" title="Remove container">🗑️</button>
              </div>
            </div>
          `;
        }
      }
    }

    // If user is at a locked tier (e.g. 4 slots), append an interactive locked paywall teaser card
    if (maxAllowed < 12 && freezerSlotCapacity < 12) {
      const nextSlot = freezerSlotCapacity + 1;
      const nextTier = maxAllowed < 8 ? 8 : 12;
      const nextPrice = maxAllowed < 8 ? '$1.99' : '$3.99';
      html += `
        <div class="shelf-slot-card locked-teaser" data-action="open-freezer-upgrade" data-target-tier="${nextTier}" title="Click to unlock ${nextTier} freezer container spots (${nextPrice})">
          <div class="slot-header-row">
            <span class="slot-number-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">Slot ${nextSlot} 🔒</span>
            <span class="slot-status-pill" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35);">⚡ Paywall</span>
          </div>
          <div class="slot-empty-icon" style="color: #fbbf24; font-size: 1.4rem;">🧊🔒</div>
          <div class="slot-empty-label" style="color: #f8fafc; font-size: 0.88rem;">Expand to ${nextTier} Slots</div>
          <div class="slot-empty-sub" style="color: #94a3b8; font-size: 0.74rem;">${nextTier === 8 ? 'Unlock 6 & 8 Spots • $1.99' : 'Deep Freeze Pro • $3.99'}</div>
          <button type="button" class="btn-slot-fill" style="background: rgba(245, 158, 11, 0.18); border-color: rgba(245, 158, 11, 0.45); color: #fbbf24; font-weight: 700;">
            ⚡ Unlock Standalone
          </button>
        </div>
      `;
    }
    grid.innerHTML = html;

    // Attach slot card event handlers
    grid.querySelectorAll('.shelf-slot-card.empty').forEach(card => {
      card.addEventListener('click', (e) => {
        const slot = parseInt(card.dataset.slot, 10);
        openSlotFillModal(slot);
      });
    });

    grid.querySelectorAll('[data-action="open-freezer-upgrade"]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetTier = parseInt(card.dataset.targetTier, 10) || 8;
        openFreezerUpgradeModal(targetTier, 'locked_teaser');
      });
    });

    grid.querySelectorAll('[data-action="cycle-lid-color"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pintId = btn.dataset.pintId;
        cyclePintLidColor(pintId);
      });
    });

    grid.querySelectorAll('[data-action="spin-slot"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pintId = btn.dataset.pintId;
        openSpinLogModal(pintId);
      });
    });

    grid.querySelectorAll('[data-action="mark-slot-ready"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pintId = btn.dataset.pintId;
        markPintAsReady(pintId);
      });
    });

    grid.querySelectorAll('[data-action="view-recipe"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rId = btn.dataset.recipeId;
        const rec = allRecipes.find(r => r.id === rId);
        if (rec) openRecipeModal(rec);
      });
    });

    grid.querySelectorAll('[data-action="discard-slot"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pintId = btn.dataset.pintId;
        if (confirm('Remove this pint container from the freezer?')) {
          removeFreezerPint(pintId);
        }
      });
    });
  }

  function getPintMixins(pint) {
    if (!pint) return [];
    if (Array.isArray(pint.mixins) && pint.mixins.length > 0) {
      return pint.mixins;
    }
    const rec = allRecipes.find(r => (pint.recipeId && r.id === pint.recipeId) || (pint.recipeName && r.name && r.name.toLowerCase() === pint.recipeName.toLowerCase()));
    if (!rec || !Array.isArray(rec.ingredients)) return [];
    const scale = pint.scale || 1.0;
    return rec.ingredients.filter(isMixinIngredient).map(ing => {
      const scaledQty = ing.amount ? scaleQuantity(ing.amount, scale) : '';
      const unit = ing.unit ? ing.unit.trim() : '';
      const qtyStr = [scaledQty, unit].filter(Boolean).join(' ');
      return {
        name: ing.name || ing.raw || 'Mix-in',
        qty: qtyStr
      };
    });
  }

  function updateSlotFillPreview() {
    const previewEl = document.getElementById('slotFillRecipePreview');
    const recipeInput = document.getElementById('slotFillRecipeInput');
    const scaleSelect = document.getElementById('slotFillPintScale');
    if (!previewEl || !recipeInput) return;

    const val = recipeInput.value.trim();
    if (!val) {
      previewEl.style.display = 'none';
      previewEl.innerHTML = '';
      return;
    }

    const scale = parseFloat(scaleSelect ? scaleSelect.value : '1.0') || 1.0;
    const recipeIdInput = document.getElementById('slotFillRecipeId');
    const recId = recipeIdInput ? recipeIdInput.value : '';

    const rec = allRecipes.find(r => (recId && r.id === recId) || (r.name && r.name.toLowerCase() === val.toLowerCase()));

    if (!rec) {
      previewEl.style.display = 'block';
      previewEl.innerHTML = `
        <div class="slot-fill-custom-hint">
          <span>✨ <strong>Custom Creation:</strong> Freeze base now. Add any mix-ins after your initial spin!</span>
          <span style="font-size: 0.75rem; color: #94a3b8;">Lite Ice Cream Cycle</span>
        </div>
      `;
      return;
    }

    const mixins = Array.isArray(rec.ingredients) ? rec.ingredients.filter(isMixinIngredient) : [];
    const spinSetting = rec.spinSetting || 'Lite Ice Cream';

    if (mixins.length > 0) {
      const itemsHtml = mixins.map(ing => {
        const scaledQty = ing.amount ? scaleQuantity(ing.amount, scale) : '';
        const unit = ing.unit ? ing.unit.trim() : '';
        const qtyDisplay = [scaledQty, unit].filter(Boolean).join(' ');
        const nameDisplay = ing.name || ing.raw || 'Mix-in';
        return `
          <div class="slot-fill-mixin-item">
            ${qtyDisplay ? `<span class="mixin-item-qty">${escapeHtml(qtyDisplay)}</span>` : ''}
            <span class="mixin-item-name">${escapeHtml(nameDisplay)}</span>
          </div>
        `;
      }).join('');

      previewEl.style.display = 'block';
      previewEl.innerHTML = `
        <div class="slot-fill-mixin-alert">
          <div class="slot-fill-mixin-header">
            <span class="slot-fill-mixin-icon">🍪</span>
            <div class="slot-fill-mixin-title-wrap">
              <span class="slot-fill-mixin-title">Mix-In Alert: Keep at Room Temp</span>
              <span class="slot-fill-mixin-sub">Do NOT freeze mix-ins with your liquid base!</span>
            </div>
          </div>
          <div class="slot-fill-mixin-list">
            ${itemsHtml}
          </div>
          <div class="slot-fill-mixin-instructions">
            💡 <strong>Prep Guide:</strong> Freeze only the blended base now. After your 16–24 hour freeze, do your primary spin on <strong>${escapeHtml(spinSetting)}</strong>, dig a 1.5" hole in the center to the bottom, drop in your mix-ins, and press the <strong>Mix-In</strong> button!
          </div>
        </div>
      `;
    } else {
      previewEl.style.display = 'block';
      previewEl.innerHTML = `
        <div class="slot-fill-nomixin-banner">
          <span style="color: #6ee7b7; font-size: 0.82rem; font-weight: 600;">✅ Pure Base Pint • No mix-ins required</span>
          <span class="slot-fill-cycle-badge">Spin: ${escapeHtml(spinSetting)}</span>
        </div>
      `;
    }
  }

  function openSlotFillModal(slotNum = 1, preselectedRecipe = null) {
    const modal = document.getElementById('slotFillModalOverlay');
    const slotInput = document.getElementById('slotFillTargetSlotNumber');
    const recipeInput = document.getElementById('slotFillRecipeInput');
    const recipeIdInput = document.getElementById('slotFillRecipeId');
    const titleEl = document.getElementById('slotFillModalTitle');
    const datalist = document.getElementById('slotFillDatalist');
    const scaleSelect = document.getElementById('slotFillPintScale');
    const hoursSelect = document.getElementById('slotFillFreezeHours');
    const notesInput = document.getElementById('slotFillNotes');
    if (!modal) return;

    if (slotInput) slotInput.value = slotNum;
    if (titleEl) titleEl.textContent = `Put a Pint in Container Slot ${slotNum}`;

    if (datalist) {
      datalist.innerHTML = '';
      allRecipes.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.name;
        datalist.appendChild(opt);
      });
    }

    if (preselectedRecipe) {
      if (recipeInput) recipeInput.value = preselectedRecipe.name;
      if (recipeIdInput) recipeIdInput.value = preselectedRecipe.id;
      if (scaleSelect) scaleSelect.value = (modalScale || 1.0).toString();
    } else {
      if (recipeInput) recipeInput.value = '';
      if (recipeIdInput) recipeIdInput.value = '';
    }
    if (notesInput) notesInput.value = '';
    if (hoursSelect) hoursSelect.value = '16';
    const alreadyFrozenCheckbox = document.getElementById('slotFillAlreadyFrozen');
    if (alreadyFrozenCheckbox) alreadyFrozenCheckbox.checked = false;
    const submitBtn = document.getElementById('slotFillSubmitBtn');
    if (submitBtn) submitBtn.textContent = '❄️ Start Freeze Countdown';

    const existingPint = freezerPintsState.find(p => p.slot === slotNum);
    const chosenLid = existingPint ? (existingPint.lidColor || getPintLidColor(slotNum).id) : getPintLidColor(slotNum).id;
    renderLidColorSwatches('slotFillLidSwatches', 'slotFillLidColor', chosenLid);

    updateSlotFillPreview();

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
    if (recipeInput && !preselectedRecipe) recipeInput.focus();
  }

  function closeSlotFillModal() {
    const modal = document.getElementById('slotFillModalOverlay');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
    const previewEl = document.getElementById('slotFillRecipePreview');
    if (previewEl) {
      previewEl.style.display = 'none';
      previewEl.innerHTML = '';
    }
  }

  // --- Freezer Notification Engine (Roadmap Item 17) ---
  function getNotificationSupportStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'granted', 'denied', or 'default'
  }

  function updateFreezerNotifUI() {
    if (!freezerNotifCard || !freezerNotifStatusBadge) return;

    if (!('Notification' in window)) {
      freezerNotifCard.className = 'freezer-notif-card off';
      freezerNotifStatusBadge.className = 'freezer-notif-badge off';
      freezerNotifStatusBadge.textContent = 'Unsupported';
      if (freezerNotifDesc) {
        freezerNotifDesc.textContent = 'Push notifications are not supported in this browser environment.';
      }
      if (btnToggleFreezeNotif) btnToggleFreezeNotif.style.display = 'none';
      if (btnTestFreezeNotif) btnTestFreezeNotif.style.display = 'none';
      return;
    }

    const perm = Notification.permission;
    if (perm === 'granted' && freezeNotifsEnabled) {
      freezerNotifCard.className = 'freezer-notif-card active';
      freezerNotifStatusBadge.className = 'freezer-notif-badge active';
      freezerNotifStatusBadge.textContent = 'Active 🔔';
      if (freezerNotifDesc) {
        freezerNotifDesc.textContent = 'Push alerts active! We will notify your device the moment your 16-hour freeze completes.';
      }
      if (freezerNotifToggleIcon) freezerNotifToggleIcon.textContent = '🔕';
      if (freezerNotifToggleLabel) freezerNotifToggleLabel.textContent = 'Pause Alerts';
      if (btnToggleFreezeNotif) {
        btnToggleFreezeNotif.className = 'btn-notif-action active';
        btnToggleFreezeNotif.style.display = 'inline-flex';
      }
      if (btnTestFreezeNotif) btnTestFreezeNotif.style.display = 'inline-flex';
    } else if (perm === 'denied') {
      freezerNotifCard.className = 'freezer-notif-card blocked';
      freezerNotifStatusBadge.className = 'freezer-notif-badge blocked';
      freezerNotifStatusBadge.textContent = 'Blocked ⚠️';
      if (freezerNotifDesc) {
        freezerNotifDesc.textContent = 'Notifications are blocked in your browser settings. Unblock them in your address bar to receive readiness alerts.';
      }
      if (freezerNotifToggleIcon) freezerNotifToggleIcon.textContent = '⚙️';
      if (freezerNotifToggleLabel) freezerNotifToggleLabel.textContent = 'How to Unblock';
      if (btnToggleFreezeNotif) {
        btnToggleFreezeNotif.className = 'btn-notif-action';
        btnToggleFreezeNotif.style.display = 'inline-flex';
      }
      if (btnTestFreezeNotif) btnTestFreezeNotif.style.display = 'none';
    } else {
      // Default or granted but paused
      freezerNotifCard.className = 'freezer-notif-card';
      freezerNotifStatusBadge.className = 'freezer-notif-badge off';
      freezerNotifStatusBadge.textContent = 'Off';
      if (freezerNotifDesc) {
        freezerNotifDesc.textContent = 'Get alerted on your lock screen the moment your pints freeze solid and are ready to spin.';
      }
      if (freezerNotifToggleIcon) freezerNotifToggleIcon.textContent = '🔔';
      if (freezerNotifToggleLabel) freezerNotifToggleLabel.textContent = 'Enable Alerts';
      if (btnToggleFreezeNotif) {
        btnToggleFreezeNotif.className = 'btn-notif-action';
        btnToggleFreezeNotif.style.display = 'inline-flex';
      }
      if (btnTestFreezeNotif) btnTestFreezeNotif.style.display = 'none';
    }
  }

  async function requestFreezeNotificationPermission(interactive = true) {
    if (!('Notification' in window)) {
      if (interactive) {
        showToast('ℹ️ Push notifications are not supported on this browser.');
      }
      return false;
    }

    if (Notification.permission === 'granted') {
      freezeNotifsEnabled = true;
      localStorage.setItem(NOTIF_STORAGE_KEY, 'true');
      updateFreezerNotifUI();
      scheduleAllPendingPintAlerts();
      if (interactive) {
        showToast('✅ Freeze Timer notifications are already active!');
      }
      return true;
    }

    if (Notification.permission === 'denied') {
      freezeNotifsEnabled = false;
      localStorage.setItem(NOTIF_STORAGE_KEY, 'false');
      updateFreezerNotifUI();
      if (interactive) {
        showToast('⚠️ Notifications are blocked in browser settings. Please allow notifications in site settings to receive freeze alerts.');
      }
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        freezeNotifsEnabled = true;
        localStorage.setItem(NOTIF_STORAGE_KEY, 'true');
        updateFreezerNotifUI();
        scheduleAllPendingPintAlerts();
        showToast('🔔 Freeze alerts enabled! We will notify you when pints are ready to spin.');
        return true;
      } else {
        freezeNotifsEnabled = false;
        localStorage.setItem(NOTIF_STORAGE_KEY, 'false');
        updateFreezerNotifUI();
        return false;
      }
    } catch (err) {
      console.warn('[Notification] requestPermission error:', err);
      return false;
    }
  }

  function toggleFreezeNotifications() {
    if (!('Notification' in window)) {
      showToast('⚠️ Push notifications are not supported on this browser.');
      return;
    }

    if (Notification.permission === 'default') {
      requestFreezeNotificationPermission(true);
      return;
    }

    if (Notification.permission === 'denied') {
      showToast('⚠️ Notifications are blocked in browser settings. Please enable them in your address bar or browser site permissions.');
      return;
    }

    if (Notification.permission === 'granted') {
      freezeNotifsEnabled = !freezeNotifsEnabled;
      localStorage.setItem(NOTIF_STORAGE_KEY, freezeNotifsEnabled ? 'true' : 'false');
      updateFreezerNotifUI();
      if (freezeNotifsEnabled) {
        scheduleAllPendingPintAlerts();
        showToast('🔔 Freeze Timer notifications turned ON.');
      } else {
        pintNotifTimers.forEach(id => clearTimeout(id));
        pintNotifTimers.clear();
        showToast('🔕 Freeze Timer notifications paused.');
      }
    }
  }

  function initFreezeNotifications() {
    updateFreezerNotifUI();
    if (btnToggleFreezeNotif) {
      btnToggleFreezeNotif.addEventListener('click', toggleFreezeNotifications);
    }
    if (btnTestFreezeNotif) {
      btnTestFreezeNotif.addEventListener('click', sendTestNotification);
    }
    if ('Notification' in window && Notification.permission === 'granted' && freezeNotifsEnabled) {
      scheduleAllPendingPintAlerts();
    }
  }

  function sendTestNotification() {
    if (!('Notification' in window)) {
      showToast('⚠️ Notifications are not supported by this browser.');
      return;
    }

    if (Notification.permission !== 'granted') {
      requestFreezeNotificationPermission(true).then(granted => {
        if (granted) triggerTestCountdown();
      });
    } else {
      triggerTestCountdown();
    }
  }

  function triggerTestCountdown() {
    showToast('🔔 Test alert scheduled in 3 seconds! Lock your screen or switch tabs to test...', 3500);
    setTimeout(() => {
      const sampleRecipe = allRecipes[0] || { id: 'test_sample', name: 'Triple Chocolate Gelato' };
      const title = `🍨 Ding! Test Alert: ${sampleRecipe.name}`;
      const notifData = {
        url: `/?action=freeze-ready&recipeId=${encodeURIComponent(sampleRecipe.id)}`,
        pintId: 'test_sample_pint',
        recipeId: sampleRecipe.id,
        recipeName: sampleRecipe.name,
        scale: 1.0
      };

      const notifOptions = {
        body: 'Your 16-Hour Freeze Timer notifications are working! When your chilling pints freeze solid, you will receive this alert.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-freeze-notification',
        renotify: true,
        vibrate: [200, 100, 200, 100, 200],
        data: notifData,
        actions: [
          { action: 'recipe', title: '📖 View Recipe' }
        ]
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          if (reg && reg.showNotification) {
            reg.showNotification(title, notifOptions);
          } else {
            fallbackShowNotification(title, notifOptions);
          }
        }).catch(() => fallbackShowNotification(title, notifOptions));
      } else {
        fallbackShowNotification(title, notifOptions);
      }
    }, 3000);
  }

  function schedulePintFreezeAlert(pint) {
    if (!pint || pint.notified) return;
    if (pintNotifTimers.has(pint.id)) {
      clearTimeout(pintNotifTimers.get(pint.id));
      pintNotifTimers.delete(pint.id);
    }

    const now = Date.now();
    const frozenAt = pint.frozenAt || now;
    const durationMs = pint.freezeHours ? (pint.freezeHours * 60 * 60 * 1000) : FREEZE_DURATION_MS;
    const elapsedMs = Math.max(0, now - frozenAt);
    const remainingMs = Math.max(0, durationMs - elapsedMs);

    if (remainingMs <= 0) {
      fireFreezeNotification(pint);
      return;
    }

    // Precise millisecond timer: fires the exact instant the countdown finishes
    const timerId = setTimeout(() => {
      fireFreezeNotification(pint);
      pintNotifTimers.delete(pint.id);
    }, remainingMs);

    pintNotifTimers.set(pint.id, timerId);
  }

  function scheduleAllPendingPintAlerts() {
    freezerPintsState.forEach(p => {
      if (!p.notified) {
        schedulePintFreezeAlert(p);
      }
    });
  }

  function checkAndNotifyReadyPints() {
    freezerPintsState.forEach(pint => {
      const status = computePintStatus(pint);
      if (status.isReady && !pint.notified) {
        fireFreezeNotification(pint);
      }
    });
  }

  function fireFreezeNotification(pint) {
    if (!pint || pint.notified) return;
    pint.notified = true;
    if (pintNotifTimers.has(pint.id)) {
      clearTimeout(pintNotifTimers.get(pint.id));
      pintNotifTimers.delete(pint.id);
    }
    saveFreezerPints();
    updateFreezerBadges();
    playAudioChime();
    triggerHaptic([250, 100, 250, 100, 250]);
    if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
      renderFreezerModal();
    }
    renderFreezerShelfWidget();

    const isDeluxe = pint.scale === 1.5 || (pint.sizeLabel && pint.sizeLabel.includes('24 oz'));
    const sizeStr = isDeluxe ? '24 oz Deluxe' : '16 oz Standard';
    const hours = pint.freezeHours || 16;
    const title = `🍨 Ding! Ready to Spin: ${pint.recipeName}`;
    const body = `Your ${sizeStr} pint has chilled for ${hours} hours and is frozen solid! Tap to open spin instructions & log your batch.`;

    const notifData = {
      url: `/?action=freeze-ready&pintId=${encodeURIComponent(pint.id)}${pint.recipeId ? '&recipeId=' + encodeURIComponent(pint.recipeId) : ''}`,
      pintId: pint.id,
      recipeId: pint.recipeId || null,
      recipeName: pint.recipeName,
      scale: pint.scale || 1.0
    };

    const notifOptions = {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `freeze-ready-${pint.id}`,
      renotify: true,
      vibrate: [250, 100, 250, 100, 250],
      data: notifData,
      actions: [
        { action: 'spin', title: '🍨 Spin & Enjoy' },
        { action: 'recipe', title: '📖 View Recipe' }
      ]
    };

    if (freezeNotifsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          if (reg && reg.showNotification) {
            return reg.showNotification(title, notifOptions);
          } else {
            fallbackShowNotification(title, notifOptions);
          }
        }).catch(err => {
          fallbackShowNotification(title, notifOptions);
        });
      } else {
        fallbackShowNotification(title, notifOptions);
      }
    }

    showToast(`🍨 Ding! "${pint.recipeName}" is frozen solid and ready to spin!`, 6000);
  }

  function fallbackShowNotification(title, options) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: options.body,
          icon: options.icon,
          tag: options.tag,
          data: options.data
        });
        notif.onclick = () => {
          window.focus();
          handleFreezeNotificationAction({
            action: 'open',
            pintId: options.data.pintId,
            recipeId: options.data.recipeId,
            recipeName: options.data.recipeName,
            scale: options.data.scale
          });
          notif.close();
        };
      } catch (e) {
        console.warn('[Notification] Direct Notification fallback error:', e);
      }
    }
  }

  function handleFreezeNotificationAction(data) {
    if (!data) return;
    const { action, pintId, recipeId, recipeName, scale } = data;

    if (action === 'spin' && pintId) {
      const pint = freezerPintsState.find(p => p.id === pintId);
      if (pint) {
        openSpinLogModal(pintId);
      } else if (recipeId) {
        logRecipeBatch(recipeId, 1, true);
        showToast(`🍨 Spun & Enjoyed! +1 Batch logged 🎉`);
      }
      if (recipeId) {
        const rec = allRecipes.find(r => r.id === recipeId);
        if (rec) {
          modalScale = scale || (pint ? pint.scale : 1.0) || 1.0;
          openRecipeModal(rec);
          return;
        }
      }
      openFreezerModal();
      return;
    }

    if (action === 'recipe' && recipeId) {
      const rec = allRecipes.find(r => r.id === recipeId);
      if (rec) {
        closeFreezerModal();
        modalScale = scale || 1.0;
        openRecipeModal(rec);
        return;
      }
    }

    // Default action (or 'open')
    if (recipeId) {
      const rec = allRecipes.find(r => r.id === recipeId);
      if (rec) {
        closeFreezerModal();
        modalScale = scale || 1.0;
        openRecipeModal(rec);
        return;
      }
    }

    openFreezerModal();
    if (pintId) {
      setTimeout(() => {
        const card = freezerPintsList ? freezerPintsList.querySelector(`[data-id="${pintId}"]`) : null;
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('highlight-pulse');
          setTimeout(() => card.classList.remove('highlight-pulse'), 3000);
        }
      }, 350);
    }
  }

  function updateFreezerCountdownsInPlace() {
    // 1. In-place updates for Virtual Freezer Shelf (shelfSlotsGrid)
    const grid = document.getElementById('shelfSlotsGrid');
    if (grid && freezerPintsState.length > 0) {
      let stateChanged = false;
      freezerPintsState.forEach(pint => {
        const slotCard = grid.querySelector(`.shelf-slot-card[data-pint-id="${pint.id}"]`);
        if (!slotCard) return;
        const status = computePintStatus(pint);
        const isCurrentlyReady = slotCard.classList.contains('ready');

        // Transition from chilling to ready requires full structural re-render
        if (status.isReady !== isCurrentlyReady) {
          stateChanged = true;
          return;
        }

        if (!status.isReady) {
          const isDeluxe = pint.scale === 1.5 || (pint.sizeLabel && pint.sizeLabel.includes('24 oz'));
          const sizeTag = isDeluxe ? '24 oz' : '16 oz';

          const pill = slotCard.querySelector('.slot-status-pill.chilling');
          const pillText = `❄️ ${status.timeRemainingLabel}`;
          if (pill && pill.textContent !== pillText) {
            pill.textContent = pillText;
          }

          const meta = slotCard.querySelector('.slot-meta-info');
          const metaText = `${sizeTag} • ${status.percent}% Solid`;
          if (meta && meta.textContent !== metaText) {
            meta.textContent = metaText;
          }

          const progressBar = slotCard.querySelector('.slot-progress-bar');
          const widthStr = `${status.percent}%`;
          if (progressBar && progressBar.style.width !== widthStr) {
            progressBar.style.width = widthStr;
          }
        }
      });

      if (stateChanged) {
        renderFreezerShelfWidget();
      }
    }

    // 2. In-place updates for Freezer Modal (#freezerPintsList)
    if (freezerModalOverlay && freezerModalOverlay.classList.contains('active') && freezerPintsList && freezerPintsState.length > 0) {
      let modalStateChanged = false;
      freezerPintsState.forEach(pint => {
        const card = freezerPintsList.querySelector(`.freezer-pint-card[data-id="${pint.id}"]`);
        if (!card) return;
        const status = computePintStatus(pint);
        const isCurrentlyReady = card.classList.contains('ready');

        // Transition between chilling and ready requires re-render for buttons
        if (status.isReady !== isCurrentlyReady) {
          modalStateChanged = true;
          return;
        }

        if (!status.isReady) {
          const badge = card.querySelector('.freezer-status-badge.chilling');
          const badgeText = `❄️ Chilling (${status.timeRemainingLabel})`;
          if (badge && badge.textContent.trim() !== badgeText) {
            badge.textContent = badgeText;
          }

          const progressInfo = card.querySelector('.freezer-progress-info');
          if (progressInfo) {
            const spans = progressInfo.querySelectorAll('span');
            if (spans.length >= 2) {
              const span0Text = `${status.percent}% Frozen`;
              const span1Text = `${status.hoursLeft}h ${status.minsLeft}m until ready`;
              if (spans[0].textContent !== span0Text) spans[0].textContent = span0Text;
              if (spans[1].textContent !== span1Text) spans[1].textContent = span1Text;
            }
          }

          const fill = card.querySelector('.freezer-progress-fill');
          const fillWidth = `${status.percent}%`;
          if (fill && fill.style.width !== fillWidth) {
            fill.style.width = fillWidth;
          }
        }
      });

      if (modalStateChanged) {
        renderFreezerModal();
      }
    }
  }

  function startFreezerTicker() {
    if (freezerTickerInterval) clearInterval(freezerTickerInterval);
    // Immediately check upon startup / ticker initialization
    checkAndNotifyReadyPints();
    scheduleAllPendingPintAlerts();
    updateFreezerBadges();

    // High-precision interval: checks notifications, updates badges, and updates countdown labels in-place without destroying DOM
    freezerTickerInterval = setInterval(() => {
      checkAndNotifyReadyPints();
      updateFreezerBadges();
      updateFreezerCountdownsInPlace();
    }, 1000);
  }

  function populateFreezerRecipeDatalist() {
    if (!freezerRecipeDatalist) return;
    freezerRecipeDatalist.replaceChildren();
    allRecipes.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.name;
      freezerRecipeDatalist.appendChild(opt);
    });
  }

  function openFreezerModal() {
    populateFreezerRecipeDatalist();
    renderFreezerModal();
    if (freezerModalOverlay) {
      freezerModalOverlay.classList.add('active');
      freezerModalOverlay.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
    }
  }

  function closeFreezerModal() {
    if (freezerModalOverlay) {
      freezerModalOverlay.classList.remove('active');
      freezerModalOverlay.setAttribute('aria-hidden', 'true');
    }
    unlockBackgroundScroll();
  }

  function toggleFreezerAddForm(show) {
    if (!freezerAddForm) return;
    const isVisible = freezerAddForm.style.display !== 'none';
    const nextState = show !== undefined ? show : !isVisible;
    freezerAddForm.style.display = nextState ? 'block' : 'none';
    if (freezerToggleAddText) {
      freezerToggleAddText.textContent = nextState ? 'Close Form' : 'Log a Chilling Pint';
    }
    if (nextState) {
      renderLidColorSwatches('freezerAddLidSwatches', 'freezerAddLidColor', 'blue');
      if (freezerRecipeNameInput) freezerRecipeNameInput.focus();
    }
  }

  async function addFreezerPint({ recipeId, recipeName, scale, notes, frozenAt, requestNotification, lidColor }) {
    if (!recipeName || !recipeName.trim()) return;

    const maxAllowed = getUserMaxFreezerSlots(currentUser);
    const activeCount = freezerPintsState.length;
    if (activeCount >= freezerSlotCapacity) {
      if (freezerSlotCapacity < maxAllowed) {
        // Auto-expand shelf to next unlocked tier so user doesn't hit an artificial ceiling
        freezerSlotCapacity = freezerSlotCapacity < 6 ? 6 : (freezerSlotCapacity < 8 ? 8 : 12);
        try { localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString()); } catch (e) {}
      } else if (maxAllowed < 12) {
        openFreezerUpgradeModal(maxAllowed < 8 ? 8 : 12, 'overflow');
        return;
      } else {
        showToast('⚠️ All 12 Pro freezer container slots are currently full! Spin or remove a pint first.');
        return;
      }
    }

    const finalFrozenAt = frozenAt || Date.now();
    const finalScale = scale || 1.0;

    let matchedRecipeId = recipeId;
    if (!matchedRecipeId) {
      const match = allRecipes.find(r => r.name.toLowerCase() === recipeName.trim().toLowerCase());
      if (match) matchedRecipeId = match.id;
    }

    const takenSlots = new Set(freezerPintsState.map(p => p.slot));
    let assignedSlot = null;
    for (let s = 1; s <= freezerSlotCapacity; s++) {
      if (!takenSlots.has(s)) {
        assignedSlot = s;
        break;
      }
    }
    const finalLidColor = lidColor || (assignedSlot ? getPintLidColor(assignedSlot).id : 'blue');

    const newPint = {
      id: `freezer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      slot: assignedSlot,
      recipeId: matchedRecipeId || null,
      recipeName: recipeName.trim(),
      scale: finalScale,
      sizeLabel: finalScale === 1.5 ? '24 oz Deluxe' : '16 oz Standard',
      frozenAt: finalFrozenAt,
      freezeHours: 16,
      lidColor: finalLidColor,
      notes: (notes || '').trim(),
      notified: false
    };

    freezerPintsState.unshift(newPint);
    saveFreezerPints();
    trackAnalyticsEvent('create_freezer_pint', {
      recipe_name: newPint.recipeName,
      size_label: newPint.sizeLabel
    });
    renderFreezerShelfWidget();
    renderFreezerModal();
    toggleFreezerAddForm(false);

    // Deduct single use items used in this newly prepped pint
    const deducted = deductSingleUseIngredients(newPint.recipeId || newPint.recipeName, newPint.scale || 1.0);
    if (deducted && deducted.length > 0) {
      setTimeout(() => notifyPantryDeduction(deducted), 1000);
    }

    // Request notification permission if requested and currently default
    if (requestNotification && 'Notification' in window && Notification.permission === 'default') {
      await requestFreezeNotificationPermission(false);
    }

    const calc = computePintStatus(newPint);
    if (calc.isReady) {
      fireFreezeNotification(newPint);
    } else {
      schedulePintFreezeAlert(newPint);
      if ('Notification' in window && Notification.permission === 'granted' && freezeNotifsEnabled) {
        showToast(`🧊 Logged "${newPint.recipeName}" in freezer! ${newPint.freezeHours || 16}h timer started (${calc.timeRemainingLabel}). Push alert scheduled! 🔔`);
      } else {
        showToast(`🧊 Logged "${newPint.recipeName}" in freezer! ${newPint.freezeHours || 16}h timer started (${calc.timeRemainingLabel}).`);
      }
    }
  }

  function markPintAsReady(pintId) {
    const pint = freezerPintsState.find(p => p.id === pintId);
    if (!pint) return;
    const freezeDurationHours = pint.freezeHours || 16;
    pint.frozenAt = Date.now() - ((freezeDurationHours + 1) * 3600 * 1000);
    saveFreezerPints();
    renderFreezerShelfWidget();
    if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
      renderFreezerModal();
    }
    // Fire the ready alert, audio chime, and notification instantly
    if (pintNotifTimers.has(pint.id)) {
      clearTimeout(pintNotifTimers.get(pint.id));
      pintNotifTimers.delete(pint.id);
    }
    fireFreezeNotification(pint);
  }
  window.markPintAsReady = markPintAsReady;

  function removeFreezerPint(pintId) {
    const pint = freezerPintsState.find(p => p.id === pintId);
    if (pintNotifTimers.has(pintId)) {
      clearTimeout(pintNotifTimers.get(pintId));
      pintNotifTimers.delete(pintId);
    }
    freezerPintsState = freezerPintsState.filter(p => p.id !== pintId);
    saveFreezerPints();
    renderFreezerModal();
    if (pint) {
      showToast(`Removed "${pint.recipeName}" from freezer.`);
    }
  }

  function spinAndEnjoyFreezerPint(pintId, skipToast = false) {
    const pint = freezerPintsState.find(p => p.id === pintId);
    if (!pint) return;

    if (pintNotifTimers.has(pintId)) {
      clearTimeout(pintNotifTimers.get(pintId));
      pintNotifTimers.delete(pintId);
    }

    // 1. Immediately remove from local freezer state and re-render first to prevent race conditions
    freezerPintsState = freezerPintsState.filter(p => p.id !== pintId);
    saveFreezerPints();
    renderFreezerShelfWidget();
    renderFreezerModal();

    // 2. Log batch made count for recipe if linked
    if (pint.recipeId) {
      logRecipeBatch(pint.recipeId, 1, true);
    }

    // 3. Record streak if not already recorded by modal
    if (!skipToast) {
      recordHabitStreakSpin({
        recipeId: pint.recipeId,
        recipeName: pint.recipeName,
        rating: 5
      });
    }

    // 4. Immediately trigger cloud sync so server updates right away without debounce risk
    triggerCloudSync(true);

    if (!skipToast) {
      showToast(`🍨 Spun & Enjoyed "${pint.recipeName}"! 🔥 Week ${habitStreakState.currentStreak} Streak Active 🎉`);
    }
  }

  function renderFreezerModal() {
    if (!freezerPintsList) return;
    updateFreezerBadges();
    updateFreezerNotifUI();

    const upgradeBanner = document.getElementById('freezerModalUpgradeBanner');
    if (upgradeBanner) {
      const maxAllowed = getUserMaxFreezerSlots(currentUser);
      upgradeBanner.style.display = maxAllowed < 12 ? 'flex' : 'none';
    }

    if (freezerPintsState.length === 0) {
      freezerPintsList.innerHTML = `
        <div class="freezer-empty-state">
          <div class="freezer-empty-icon">🧊</div>
          <h4 class="freezer-empty-title">Your freezer is empty!</h4>
          <p class="freezer-empty-desc">
            Mix up your favorite recipe base and log it here to start the 16-hour countdown timer. We'll let you know the moment it's frozen solid and ready to spin!
          </p>
          <button class="btn-primary" id="btnEmptyLogPint">➕ Log a Chilling Pint</button>
        </div>
      `;
      const btnEmpty = freezerPintsList.querySelector('#btnEmptyLogPint');
      if (btnEmpty) {
        btnEmpty.addEventListener('click', () => toggleFreezerAddForm(true));
      }
      return;
    }

    // Sort: Ready pints first, then by remaining time ascending
    const sorted = [...freezerPintsState].sort((a, b) => {
      const statusA = computePintStatus(a);
      const statusB = computePintStatus(b);
      if (statusA.isReady && !statusB.isReady) return -1;
      if (!statusA.isReady && statusB.isReady) return 1;
      return a.frozenAt - b.frozenAt;
    });

    freezerPintsList.innerHTML = sorted.map(pint => {
      const status = computePintStatus(pint);
      const isDeluxe = pint.scale === 1.5 || (pint.sizeLabel && pint.sizeLabel.includes('24 oz'));
      const hasRecipe = Boolean(pint.recipeId && allRecipes.some(r => r.id === pint.recipeId));
      const rec = hasRecipe ? allRecipes.find(r => r.id === pint.recipeId) : null;
      const lid = getPintLidColor(pint.lidColor || pint.slot || 1);

      return `
        <div class="freezer-pint-card ${status.isReady ? 'ready' : ''}" data-id="${pint.id}" style="border-left: 4px solid ${lid.hex};">
          <div class="freezer-card-top-row">
            <div class="freezer-pint-title-group">
              <div class="freezer-pint-title">${pint.recipeName}</div>
              <div class="freezer-meta-tags">
                <span class="freezer-tag ${isDeluxe ? 'size-deluxe' : 'size-standard'}">
                  ${isDeluxe ? '🥣 24 oz Deluxe' : '🍨 16 oz Standard'}
                </span>
                <button type="button" class="freezer-tag lid-color-tag" data-action="cycle-modal-lid" data-pint-id="${pint.id}" style="border-color: ${lid.border}; background: ${lid.bgTint}; color: ${lid.hex};" title="Lid Color: ${lid.name} (Click to change)">
                  <span class="lid-pill-dot" style="background: ${lid.hex};"></span> ${lid.name} Lid
                </button>
                <span class="freezer-tag">Mixed: ${status.mixedLabel}</span>
                ${pint.notified 
                  ? '<span class="freezer-tag notif-tag sent">🔔 Alert Sent</span>' 
                  : (freezeNotifsEnabled && 'Notification' in window && Notification.permission === 'granted' 
                    ? '<span class="freezer-tag notif-tag">🔔 Alert Set</span>' 
                    : '')}
              </div>
            </div>
            <div>
              <span class="freezer-status-badge ${status.isReady ? 'ready' : 'chilling'}">
                ${status.isReady ? 'Ready to Spin! 🍨' : `❄️ Chilling (${status.timeRemainingLabel})`}
              </span>
            </div>
          </div>

          <!-- 16-Hour Countdown Progress Bar -->
          <div class="freezer-countdown-row">
            <div class="freezer-progress-info">
              <span>${status.isReady ? '100% Solid &amp; Ready' : `${status.percent}% Frozen`}</span>
              <span>${status.isReady ? '16+ Hours Chilled' : `${status.hoursLeft}h ${status.minsLeft}m until ready`}</span>
            </div>
            <div class="freezer-progress-track">
              <div class="freezer-progress-fill ${status.isReady ? 'ready' : ''}" style="width: ${status.percent}%;"></div>
            </div>
          </div>

          ${pint.notes ? `<div class="freezer-notes-snippet">💡 ${pint.notes}</div>` : ''}

          <!-- Card Actions -->
          <div class="freezer-card-actions">
            <div class="freezer-card-actions-left">
              ${!status.isReady ? `
                <button class="btn-freezer-mark-ready" data-action="mark-ready" title="Already froze this pint? Mark it as 100% solid &amp; ready to spin!">
                  <span>🟢 Set as Frozen</span>
                </button>
              ` : ''}
              <button class="btn-spin-enjoyed" data-action="spin" title="Mark this pint as spun and add +1 to your batch counter">
                <span>🍨 Spun &amp; Enjoyed (+1 Made)</span>
              </button>
              ${hasRecipe ? `
                <button class="btn-freezer-recipe" data-action="view-recipe" title="View recipe and spin instructions">
                  📖 View Recipe
                </button>
              ` : ''}
            </div>
            <button class="btn-freezer-discard" data-action="delete" title="Remove pint without logging batch">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind Pint Card Buttons
    freezerPintsList.querySelectorAll('[data-action="cycle-modal-lid"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pintId = btn.dataset.pintId;
        cyclePintLidColor(pintId);
      });
    });

    freezerPintsList.querySelectorAll('.freezer-pint-card').forEach(card => {
      const pintId = card.dataset.id;
      const pint = freezerPintsState.find(p => p.id === pintId);
      if (!pint) return;

      const markReadyBtn = card.querySelector('[data-action="mark-ready"]');
      if (markReadyBtn) {
        markReadyBtn.addEventListener('click', () => markPintAsReady(pintId));
      }

      const spinBtn = card.querySelector('[data-action="spin"]');
      if (spinBtn) {
        spinBtn.addEventListener('click', () => openSpinLogModal(pintId));
      }

      const viewBtn = card.querySelector('[data-action="view-recipe"]');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          const rec = allRecipes.find(r => r.id === pint.recipeId);
          if (rec) {
            closeFreezerModal();
            modalScale = pint.scale || 1.0;
            openRecipeModal(rec);
          }
        });
      }

      const delBtn = card.querySelector('[data-action="delete"]');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          if (confirm(`Remove "${pint.recipeName}" from your freezer inventory?`)) {
            removeFreezerPint(pintId);
          }
        });
      }
    });
  }

  // ==========================================================================
  // Sunday Batch Prep Planner & Consolidated Grocery List Engine (Beta Staging)
  // ==========================================================================
  function saveBatchPrepQueue() {
    localStorage.setItem(BATCH_PREP_STORAGE_KEY, JSON.stringify(batchPrepQueueState));
    updateBatchPrepDockUI();
  }

  function getRecipeBatchPrepCount(recipeId) {
    if (!recipeId || !Array.isArray(batchPrepQueueState)) return 0;
    return batchPrepQueueState.filter(p => p.recipeId === recipeId).length;
  }

  function isRecipeInBatchPrep(recipeId) {
    return getRecipeBatchPrepCount(recipeId) > 0;
  }

  function addRecipeToBatchPrep(recipeId, scale = 1.0) {
    if (!currentUser) {
      showToast('🔒 Please sign in to use Sunday Batch Prep & Grocery List.');
      openGoogleAuthModal();
      return;
    }
    const rec = allRecipes.find(r => r.id === recipeId);
    if (!rec) return;

    batchPrepQueueState.push({
      recipeId: rec.id,
      recipeName: rec.name,
      scale: scale || 1.0
    });
    saveBatchPrepQueue();
    const count = getRecipeBatchPrepCount(rec.id);
    if (count > 1) {
      showToast(`🍱 Added another "${rec.name}" to Sunday Batch Prep! (${count} in prep)`);
    } else {
      showToast(`🍱 Added "${rec.name}" to Sunday Batch Prep! (${batchPrepQueueState.length} total)`);
    }
    updateBatchPrepDockUI();
    if (isBatchPrepModalOpen()) {
      renderBatchPrepModal();
    }
  }

  function removeRecipeFromBatchPrep(recipeId, removeAll = false) {
    const rec = allRecipes.find(r => r.id === recipeId);
    const name = rec ? rec.name : 'Pint';
    if (removeAll) {
      batchPrepQueueState = batchPrepQueueState.filter(p => p.recipeId !== recipeId);
      saveBatchPrepQueue();
      showToast(`Removed "${name}" from Sunday Batch Prep`);
    } else {
      for (let i = batchPrepQueueState.length - 1; i >= 0; i--) {
        if (batchPrepQueueState[i].recipeId === recipeId) {
          batchPrepQueueState.splice(i, 1);
          break;
        }
      }
      saveBatchPrepQueue();
      const remaining = getRecipeBatchPrepCount(recipeId);
      if (remaining > 0) {
        showToast(`Removed 1 "${name}" (${remaining} remaining in prep)`);
      } else {
        showToast(`Removed "${name}" from Sunday Batch Prep`);
      }
    }
    updateBatchPrepDockUI();
    if (isBatchPrepModalOpen()) {
      renderBatchPrepModal();
    }
  }

  function duplicatePintByIndex(index) {
    if (index >= 0 && index < batchPrepQueueState.length) {
      const orig = batchPrepQueueState[index];
      batchPrepQueueState.splice(index + 1, 0, {
        recipeId: orig.recipeId,
        recipeName: orig.recipeName,
        scale: orig.scale || 1.0
      });
      saveBatchPrepQueue();
      const count = getRecipeBatchPrepCount(orig.recipeId);
      showToast(`🍱 Added another "${orig.recipeName}" (${count} in prep)`);
      updateBatchPrepDockUI();
      renderBatchPrepModal();
    }
  }

  function removePintByIndex(index) {
    if (index >= 0 && index < batchPrepQueueState.length) {
      const removed = batchPrepQueueState.splice(index, 1)[0];
      saveBatchPrepQueue();
      if (removed) {
        const remaining = getRecipeBatchPrepCount(removed.recipeId);
        if (remaining > 0) {
          showToast(`Removed 1 "${removed.recipeName}" (${remaining} remaining in prep)`);
        } else {
          showToast(`Removed "${removed.recipeName}" from Sunday Batch Prep`);
        }
      }
      updateBatchPrepDockUI();
      renderBatchPrepModal();
    }
  }

  function toggleBatchPrepRecipe(recipeId, scale = 1.0) {
    if (isRecipeInBatchPrep(recipeId)) {
      removeRecipeFromBatchPrep(recipeId, false);
    } else {
      addRecipeToBatchPrep(recipeId, scale);
    }
  }

  function clearBatchPrepQueue() {
    batchPrepQueueState = [];
    saveBatchPrepQueue();
    closeBatchPrepModal();
    showToast('Cleared Sunday Batch Prep queue');
  }

  function isBatchPrepModalOpen() {
    const modal = document.getElementById('batchPrepModalOverlay');
    return Boolean(modal && modal.classList.contains('active'));
  }

  function renderCardBatchPrepControlHtml(recipeId, count) {
    if (count > 0) {
      return `
        <div class="card-batch-prep-stepper" data-recipe-id="${recipeId}">
          <button type="button" class="btn-prep-step dec" data-action="batch-prep-dec" title="Remove 1 from Sunday Batch Prep">−</button>
          <button type="button" class="prep-step-count" data-action="open-batch-prep" title="View Sunday Batch Prep (${count} queued)">🍱 ${count}</button>
          <button type="button" class="btn-prep-step inc" data-action="batch-prep-inc" title="Add another to Sunday Batch Prep">+</button>
        </div>
      `;
    }
    return `
      <button type="button" class="btn-card-batch-prep" data-recipe-id="${recipeId}" data-action="batch-prep-add" title="Add to Sunday Batch Prep">
        🍱 +Prep
      </button>
    `;
  }

  function bindCardBatchPrepSlotEvents(slot, recipeId) {
    if (!slot) return;
    const addBtn = slot.querySelector('[data-action="batch-prep-add"]');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        addRecipeToBatchPrep(recipeId, 1.0);
      });
    }
    const incBtn = slot.querySelector('[data-action="batch-prep-inc"]');
    if (incBtn) {
      incBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        addRecipeToBatchPrep(recipeId, 1.0);
      });
    }
    const decBtn = slot.querySelector('[data-action="batch-prep-dec"]');
    if (decBtn) {
      decBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        removeRecipeFromBatchPrep(recipeId, false);
      });
    }
    const openBtn = slot.querySelector('[data-action="open-batch-prep"]');
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        openBatchPrepModal();
      });
    }
  }

  function renderModalBatchPrepControlHtml(recipeId, count) {
    if (count > 0) {
      return `
        <div class="modal-batch-prep-stepper" data-recipe-id="${recipeId}">
          <button type="button" class="btn-modal-prep-step dec" data-action="modal-prep-dec" title="Remove 1 from Sunday Batch Prep">−</button>
          <button type="button" class="modal-prep-step-label" data-action="modal-prep-open" title="View Sunday Batch Prep">🍱 ${count} in Batch Prep</button>
          <button type="button" class="btn-modal-prep-step inc" data-action="modal-prep-inc" title="Add another to Sunday Batch Prep">+ Add Another</button>
        </div>
      `;
    }
    return `
      <button type="button" class="btn-modal-batch-prep" data-recipe-id="${recipeId}" data-action="modal-prep-add" title="Add to Sunday Batch Prep Queue">
        🍱 Add to Sunday Batch Prep
      </button>
    `;
  }

  function bindModalBatchPrepSlotEvents(slot, recipeId) {
    if (!slot) return;
    const addBtn = slot.querySelector('[data-action="modal-prep-add"]');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addRecipeToBatchPrep(recipeId, typeof modalScale === 'number' ? modalScale : 1.0);
      });
    }
    const incBtn = slot.querySelector('[data-action="modal-prep-inc"]');
    if (incBtn) {
      incBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addRecipeToBatchPrep(recipeId, typeof modalScale === 'number' ? modalScale : 1.0);
      });
    }
    const decBtn = slot.querySelector('[data-action="modal-prep-dec"]');
    if (decBtn) {
      decBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeRecipeFromBatchPrep(recipeId, false);
      });
    }
    const openBtn = slot.querySelector('[data-action="modal-prep-open"]');
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeRecipeModal();
        openBatchPrepModal();
      });
    }
  }

  function updateBatchPrepDockUI() {
    const dock = document.getElementById('batchPrepBar');
    const countEl = document.getElementById('batchPrepCountText');
    if (!dock) return;

    if (!currentUser) {
      dock.style.display = 'none';
      const headerBadge = document.getElementById('batchPrepHeaderBadge');
      if (headerBadge) headerBadge.style.display = 'none';
      return;
    }

    const count = batchPrepQueueState.length;
    if (count > 0) {
      dock.style.display = 'block';
      if (countEl) countEl.textContent = `${count} Pint${count === 1 ? '' : 's'} Queued`;
    } else {
      dock.style.display = 'none';
    }

    // Update Header Badge
    const headerBadge = document.getElementById('batchPrepHeaderBadge');
    if (headerBadge) {
      if (count > 0) {
        headerBadge.style.display = 'inline-block';
        headerBadge.textContent = count;
      } else {
        headerBadge.style.display = 'none';
      }
    }

    // Update controls on visible recipe cards
    document.querySelectorAll('.card-prep-slot').forEach(slot => {
      const rId = slot.dataset.recipeId;
      if (rId) {
        const pCount = getRecipeBatchPrepCount(rId);
        slot.innerHTML = renderCardBatchPrepControlHtml(rId, pCount);
        bindCardBatchPrepSlotEvents(slot, rId);
      }
    });

    // Fallback for any plain button on card
    document.querySelectorAll('.btn-card-batch-prep').forEach(btn => {
      const rId = btn.dataset.recipeId;
      if (rId) {
        const inQueue = isRecipeInBatchPrep(rId);
        btn.classList.toggle('active', inQueue);
      }
    });

    // Update control in active recipe modal if open
    const modalSlot = document.getElementById('modalBatchPrepSlot');
    if (modalSlot && currentModalRecipe) {
      const pCount = getRecipeBatchPrepCount(currentModalRecipe.id);
      modalSlot.innerHTML = renderModalBatchPrepControlHtml(currentModalRecipe.id, pCount);
      bindModalBatchPrepSlotEvents(modalSlot, currentModalRecipe.id);
    }
  }

  function openBatchPrepModal() {
    if (!currentUser) {
      showToast('🔒 Please sign in to use Sunday Batch Prep & Grocery List.');
      openGoogleAuthModal();
      return;
    }
    const modal = document.getElementById('batchPrepModalOverlay');
    if (!modal) return;
    renderBatchPrepModal();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeBatchPrepModal() {
    const modal = document.getElementById('batchPrepModalOverlay');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  // Helper to parse recipe ingredient quantity strings into numeric floats
  function parseIngredientQuantity(qtyStr) {
    if (qtyStr == null) return null;
    let s = String(qtyStr).trim();
    if (!s) return null;
    s = s.replace(/^[~≈\s]+/, '');
    const fracMap = {
      '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125
    };
    if (fracMap[s] !== undefined) return fracMap[s];
    if (s.includes('-')) {
      const parts = s.split('-');
      if (parts.length === 2) {
        const p1 = parseIngredientQuantity(parts[0]);
        const p2 = parseIngredientQuantity(parts[1]);
        if (p1 !== null && p2 !== null) return (p1 + p2) / 2;
      }
    }
    const mixedMatch = s.match(/^(\d+)\s+([¼½¾⅓⅔⅛]|\d+\/\d+)$/);
    if (mixedMatch) {
      const whole = parseFloat(mixedMatch[1]);
      let frac = 0;
      if (fracMap[mixedMatch[2]]) {
        frac = fracMap[mixedMatch[2]];
      } else if (mixedMatch[2].includes('/')) {
        const [num, den] = mixedMatch[2].split('/').map(Number);
        if (den) frac = num / den;
      }
      return whole + frac;
    }
    if (/^\d+\/\d+$/.test(s)) {
      const [num, den] = s.split('/').map(Number);
      if (den) return num / den;
    }
    const val = parseFloat(s);
    return isNaN(val) ? null : val;
  }

  // Helper to get friendly unit descriptors for count-based or unitless items (e.g. shakes, cookies, brownies)
  function getItemUnitDescriptor(name, count, rawUnit = '') {
    const cleanUnit = (rawUnit || '').trim().toLowerCase();
    const cleanName = (name || '').trim().toLowerCase();

    if (cleanUnit) {
      if (cleanUnit === 'shake' || cleanUnit === 'shakes') return count === 1 ? 'shake' : 'shakes';
      if (cleanUnit === 'cookie' || cleanUnit === 'cookies') return count === 1 ? 'cookie' : 'cookies';
      if (cleanUnit === 'brownie' || cleanUnit === 'brownies') return count === 1 ? 'brownie' : 'brownies';
      if (cleanUnit === 'bar' || cleanUnit === 'bars') return count === 1 ? 'bar' : 'bars';
      if (cleanUnit === 'pastry' || cleanUnit === 'pastries') return count === 1 ? 'pastry' : 'pastries';
      if (cleanUnit === 'muffin' || cleanUnit === 'muffins') return count === 1 ? 'muffin' : 'muffins';
      if (cleanUnit === 'can' || cleanUnit === 'cans') return count === 1 ? 'can' : 'cans';
      if (cleanUnit === 'pack' || cleanUnit === 'packs' || cleanUnit === 'package' || cleanUnit === 'packages' || cleanUnit === 'bag' || cleanUnit === 'bags') {
        return count === 1 ? 'pack' : 'packs';
      }
      if (cleanUnit === 'serving' || cleanUnit === 'servings') return count === 1 ? 'serving' : 'servings';
      if (cleanUnit === 'sheet' || cleanUnit === 'sheets') return count === 1 ? 'sheet' : 'sheets';
      if (cleanUnit === 'scoop' || cleanUnit === 'scoops') return count === 1 ? 'scoop' : 'scoops';
      if (cleanUnit === 'shot' || cleanUnit === 'shots') return count === 1 ? 'shot' : 'shots';
      if (cleanUnit === 'drop' || cleanUnit === 'drops') return count === 1 ? 'drop' : 'drops';
      if (cleanUnit === 'pinch' || cleanUnit === 'pinches') return count === 1 ? 'pinch' : 'pinches';
      return cleanUnit;
    }

    if (cleanName.includes('shake')) return count === 1 ? 'shake' : 'shakes';
    if (cleanName.includes('bite')) return count === 1 ? 'pack' : 'packs';
    if (cleanName.includes('cookie') || cleanName.includes('biscuit') || cleanName.includes('wafer') || cleanName.includes('oreo')) {
      return count === 1 ? 'cookie' : 'cookies';
    }
    if (cleanName.includes('brownie') || cleanName.includes('blondie')) return count === 1 ? 'brownie' : 'brownies';
    if (cleanName.includes('pastry') || cleanName.includes('pop-tart') || cleanName.includes('tart')) return count === 1 ? 'pastry' : 'pastries';
    if (cleanName.includes('muffin')) return count === 1 ? 'muffin' : 'muffins';
    if (cleanName.includes('bar')) return count === 1 ? 'bar' : 'bars';
    if (cleanName.includes('can')) return count === 1 ? 'can' : 'cans';
    if (cleanName.includes('pie')) return count === 1 ? 'pie' : 'pies';
    if (cleanName.includes('cup') && (cleanName.includes('reese') || cleanName.includes('peanut butter cup'))) {
      return count === 1 ? 'cup' : 'cups';
    }
    if (cleanName.includes('almond') || cleanName.includes('nut')) return count === 1 ? 'pc' : 'pcs';

    return '';
  }

  function renderBatchPrepModal() {
    const strip = document.getElementById('batchPrepPintsStrip');
    const pintsCount = document.getElementById('batchPrepPintsCount');
    const missingList = document.getElementById('batchPrepMissingList');
    const inStockList = document.getElementById('batchPrepInStockList');
    const missingCount = document.getElementById('batchPrepMissingCount');
    const inStockCount = document.getElementById('batchPrepInStockCount');
    const matchBadge = document.getElementById('batchPrepPantryMatchBadge');
    if (!strip || !missingList || !inStockList) return;

    if (pintsCount) pintsCount.textContent = `${batchPrepQueueState.length} Pints`;

    // 1. Render Queued Pints Strip
    if (batchPrepQueueState.length === 0) {
      strip.innerHTML = '<div style="color: #94a3b8; font-size: 0.85rem; padding: 6px;">No recipes queued yet. Click "+Prep" on any recipe card to add!</div>';
    } else {
      strip.innerHTML = batchPrepQueueState.map((item, idx) => {
        const isDeluxe = item.scale === 1.5;
        return `
          <div class="batch-pint-chip" data-recipe-id="${item.recipeId}" data-index="${idx}">
            <span style="font-size: 1.1rem;">🍨</span>
            <div class="batch-pint-chip-info">
              <span class="batch-pint-chip-title" title="${escapeHtml(item.recipeName)}">${escapeHtml(item.recipeName)}</span>
              <span class="batch-pint-chip-scale">${isDeluxe ? '24 oz Deluxe' : '16 oz Standard'}</span>
            </div>
            <div class="batch-pint-chip-actions">
              <button type="button" class="btn-batch-chip-add" data-action="duplicate-queued-pint" data-index="${idx}" title="Add another pint of this recipe">+</button>
              <button type="button" class="btn-batch-chip-remove" data-action="remove-queued-pint" data-index="${idx}" title="Remove this pint">✕</button>
            </div>
          </div>
        `;
      }).join('');

      strip.querySelectorAll('[data-action="duplicate-queued-pint"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.index, 10);
          duplicatePintByIndex(idx);
        });
      });

      strip.querySelectorAll('[data-action="remove-queued-pint"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.index, 10);
          removePintByIndex(idx);
        });
      });
    }

    // Populate Quick Add Select & Bind In-Modal Prep Controls
    const quickSelect = document.getElementById('batchPrepQuickAddSelect');
    if (quickSelect) {
      const accessible = allRecipes.filter(r => isRecipeAccessible(r)).slice(0, 150);
      quickSelect.innerHTML = '<option value="">+ Add a Recipe to this Batch...</option>' + 
        accessible.map(r => {
          const count = getRecipeBatchPrepCount(r.id);
          const countLabel = count > 0 ? ` (${count} in prep)` : '';
          return `<option value="${r.id}">${escapeHtml(r.name)} (${escapeHtml(r.category || 'High Protein')})${countLabel}</option>`;
        }).join('');
    }

    const quickAddBtn = document.getElementById('btnBatchPrepQuickAdd');
    if (quickAddBtn && !quickAddBtn._bound) {
      quickAddBtn._bound = true;
      quickAddBtn.addEventListener('click', () => {
        const select = document.getElementById('batchPrepQuickAddSelect');
        if (select && select.value) {
          addRecipeToBatchPrep(select.value, 1.0);
          renderBatchPrepModal();
        } else {
          showToast('Please select a recipe from the dropdown first!');
        }
      });
    }

    const samplerBtn = document.getElementById('btnBatchPrepLoadSampler');
    if (samplerBtn && !samplerBtn._bound) {
      samplerBtn._bound = true;
      samplerBtn.addEventListener('click', () => {
        const preferredIds = [
          'chocolate',
          'cookies_and_cream_fan_favorite',
          'vanilla_protein_shake',
          'peanut_butter_chocolate_banana',
          'vanilla',
          'strawberry',
          'mint_chocolate_chip',
          'cake_batter_fan_favorite'
        ];
        const accessiblePool = allRecipes.filter(r => isRecipeAccessible(r));
        const candidates = [];
        preferredIds.forEach(id => {
          const rec = accessiblePool.find(r => r.id === id) || allRecipes.find(r => r.id === id && isRecipeAccessible(r));
          if (rec && !candidates.some(c => c.id === rec.id)) {
            candidates.push(rec);
          }
        });
        accessiblePool.forEach(rec => {
          if (candidates.length < 8 && !candidates.some(c => c.id === rec.id)) {
            candidates.push(rec);
          }
        });

        // If user already had >= 4 pints queued, reset to a fresh 4-pint sampler; otherwise top up to 4 pints
        if (batchPrepQueueState.length >= 4) {
          batchPrepQueueState = [];
        }
        for (const rec of candidates) {
          if (batchPrepQueueState.length >= 4) break;
          if (!isRecipeInBatchPrep(rec.id)) {
            batchPrepQueueState.push({ recipeId: rec.id, recipeName: rec.name, scale: 1.0 });
          }
        }
        saveBatchPrepQueue();
        renderBatchPrepModal();
        showToast(`🍱 Loaded ${batchPrepQueueState.length} Signature Pints into Sunday Batch Prep!`);
      });
    }

    // 2. Aggregate ingredients across all queued recipes
    const aggregated = new Map();

    batchPrepQueueState.forEach(queued => {
      const rec = allRecipes.find(r => r.id === queued.recipeId);
      if (!rec || !rec.ingredients) return;
      const scale = queued.scale || 1.0;

      rec.ingredients.forEach(ing => {
        const cleanName = sanitizeShoppingItemName(ing.name);
        if (SHOPPING_EXCLUDED_ITEMS && SHOPPING_EXCLUDED_ITEMS.has(ing.id || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_'))) {
          return; // Skip salt, water, etc.
        }

        if (!aggregated.has(cleanName)) {
          aggregated.set(cleanName, {
            name: cleanName,
            id: ing.id,
            quantities: {},
            unitlessSum: 0,
            hasUnitless: false,
            preferredUnit: '',
            rawStrings: new Set(),
            usedInRecipes: new Set(),
            pintsCount: 0,
            isBase: Boolean(ing.isBase)
          });
        }

        const entry = aggregated.get(cleanName);
        entry.usedInRecipes.add(rec.name);
        entry.pintsCount = (entry.pintsCount || 0) + 1;

        const unit = (ing.unit || '').trim().toLowerCase();
        const parsedQty = parseIngredientQuantity(ing.quantity);

        const countUnitMap = {
          'shake': 'shake',
          'shakes': 'shake',
          'cookie': 'cookie',
          'cookies': 'cookie',
          'brownie': 'brownie',
          'brownies': 'brownie',
          'bar': 'bar',
          'bars': 'bar',
          'pastry': 'pastry',
          'pastries': 'pastry',
          'muffin': 'muffin',
          'muffins': 'muffin',
          'can': 'can',
          'cans': 'can',
          'package': 'pack',
          'packages': 'pack',
          'pack': 'pack',
          'packs': 'pack',
          'bag': 'pack',
          'bags': 'pack',
          'serving': 'serving',
          'servings': 'serving',
          'sheet': 'sheet',
          'sheets': 'sheet'
        };

        const normalizedCountUnit = countUnitMap[unit];

        if (parsedQty !== null && parsedQty > 0) {
          const scaledQty = parsedQty * scale;
          if (unit && !normalizedCountUnit) {
            // Standard mass/volume units (g, ml, oz, tsp, tbsp, scoop, shot, pinch, etc.)
            entry.quantities[unit] = (entry.quantities[unit] || 0) + scaledQty;
          } else {
            // Unitless or count-based item (e.g. shakes, cookies, brownies, cans)
            entry.unitlessSum += scaledQty;
            entry.hasUnitless = true;
            if (normalizedCountUnit && !entry.preferredUnit) {
              entry.preferredUnit = normalizedCountUnit;
            }
          }
        } else {
          // Qualitative / unparseable amount (e.g. "To fill line", "A pinch", "All")
          const formatted = formatIngredientAmount(ing, scale, 'metric');
          if (formatted) entry.rawStrings.add(formatted);
        }
      });
    });

    // 3. Categorize into Missing vs In Stock
    const missingItems = [];
    const inStockItems = [];

    aggregated.forEach(entry => {
      const inPantry = isItemInPantry({ id: entry.id, name: entry.name });
      
      const qtyParts = [];
      // Mass / volume measurements
      for (const [unit, sum] of Object.entries(entry.quantities)) {
        let displaySum = Math.round(sum * 10) / 10;
        if (displaySum % 1 === 0) displaySum = Math.round(displaySum);
        qtyParts.push(`${displaySum} ${unit}`);
      }

      // Unitless or single-use count items (shakes, cookies, brownies, etc.)
      if (entry.hasUnitless && entry.unitlessSum > 0) {
        const desc = getItemUnitDescriptor(entry.name, entry.unitlessSum, entry.preferredUnit);
        const formattedCount = formatScaledNumber(entry.unitlessSum);
        if (desc) {
          qtyParts.push(`${formattedCount} ${desc}`);
        } else if (entry.unitlessSum > 1 && (entry.usedInRecipes.size > 1 || (entry.pintsCount || 0) > 1)) {
          qtyParts.push(`${formattedCount} total`);
        } else {
          qtyParts.push(formattedCount);
        }
      }

      // Qualitative strings
      entry.rawStrings.forEach(raw => qtyParts.push(raw));
      const totalDisplay = qtyParts.join(' + ') || 'As needed';

      // Check pantry availability with exact single-use item quantities
      const pantryQty = getPantryItemQuantity(entry.id, entry.name);
      const isSingle = entry.hasUnitless && entry.unitlessSum > 0;

      let itemInStock = false;
      let qtyDisplayText = totalDisplay;

      if (isSingle) {
        if (pantryQty >= entry.unitlessSum) {
          itemInStock = true;
          if (pantryQty !== Infinity) {
            qtyDisplayText = `${totalDisplay} (${pantryQty} in pantry)`;
          }
        } else if (pantryQty > 0) {
          // Partially in stock! Has some, but needs more
          itemInStock = false;
          const missingQty = entry.unitlessSum - pantryQty;
          const missingDesc = getItemUnitDescriptor(entry.name, missingQty, entry.preferredUnit);
          const formattedMissing = formatScaledNumber(missingQty);
          const missingText = missingDesc ? `${formattedMissing} ${missingDesc}` : formattedMissing;
          qtyDisplayText = `Need ${missingText} more (have ${pantryQty} of ${formatScaledNumber(entry.unitlessSum)} in pantry)`;
        } else {
          itemInStock = false;
        }
      } else {
        itemInStock = inPantry;
      }

      const itemData = {
        name: entry.name,
        qtyText: qtyDisplayText,
        recipesCount: entry.pintsCount || entry.usedInRecipes.size
      };

      if (itemInStock) {
        inStockItems.push(itemData);
      } else {
        missingItems.push(itemData);
      }
    });

    if (missingCount) missingCount.textContent = missingItems.length;
    if (inStockCount) inStockCount.textContent = inStockItems.length;

    const totalIngs = missingItems.length + inStockItems.length;
    if (matchBadge) {
      if (totalIngs === 0) {
        matchBadge.textContent = 'No ingredients to check';
      } else if (missingItems.length === 0) {
        matchBadge.innerHTML = '<span style="color: #4ade80; font-weight: 800;">🎉 100% In Stock in Pantry!</span>';
      } else {
        matchBadge.textContent = `${inStockItems.length} of ${totalIngs} in pantry`;
      }
    }

    // Update Add All to Shopping List button state
    const addAllShopBtn = document.getElementById('btnBatchAddMissingToShopList');
    if (addAllShopBtn) {
      if (missingItems.length === 0) {
        addAllShopBtn.style.display = 'none';
      } else {
        addAllShopBtn.style.display = 'inline-flex';
        const unaddedCount = missingItems.filter(item => {
          const clean = sanitizeShoppingItemName(item.name);
          return !manualShoppingList.has(clean) && !manualShoppingList.has(item.name);
        }).length;

        if (unaddedCount === 0) {
          addAllShopBtn.classList.add('in-list');
          addAllShopBtn.innerHTML = '✓ All in Shopping List';
          addAllShopBtn.title = 'All missing ingredients are already in your app Shopping List';
        } else {
          addAllShopBtn.classList.remove('in-list');
          addAllShopBtn.innerHTML = `+ Add All (${unaddedCount}) to App List`;
          addAllShopBtn.title = 'Add all missing batch ingredients to your app Shopping List';
        }
      }
    }

    // Render Missing List
    if (missingItems.length === 0) {
      missingList.innerHTML = '<div style="color: #4ade80; font-size: 0.84rem; padding: 8px 6px;">🎉 Amazing! You have all ingredients needed for these pints in your pantry.</div>';
    } else {
      missingList.innerHTML = missingItems.map(item => {
        const cleanName = sanitizeShoppingItemName(item.name);
        const inShopList = manualShoppingList.has(cleanName) || manualShoppingList.has(item.name);
        return `
          <div class="batch-grocery-item-row ${inShopList ? 'is-in-shop-list' : ''}">
            <div class="batch-grocery-item-left">
              <span style="font-size: 0.95rem;">${inShopList ? '✅' : '🛒'}</span>
              <span class="batch-grocery-item-name">${escapeHtml(item.name)}</span>
              <span class="batch-grocery-item-used">in ${item.recipesCount} pint${item.recipesCount === 1 ? '' : 's'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="batch-grocery-item-qty">${escapeHtml(item.qtyText)}</div>
              <button type="button" class="btn-batch-item-toggle-shop ${inShopList ? 'in-list' : ''}" 
                      data-action="toggle-single-batch-shop" 
                      data-item-name="${escapeHtml(item.name)}" 
                      title="${inShopList ? 'In your Shopping List (click to remove)' : 'Add to Shopping List'}">
                ${inShopList ? '✓ In List' : '+ List'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      missingList.querySelectorAll('[data-action="toggle-single-batch-shop"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rawName = btn.dataset.itemName;
          const cleanName = sanitizeShoppingItemName(rawName);
          if (manualShoppingList.has(cleanName) || manualShoppingList.has(rawName)) {
            manualShoppingList.delete(cleanName);
            manualShoppingList.delete(rawName);
            showToast(`Removed "${rawName}" from Shopping List`);
          } else {
            manualShoppingList.add(cleanName);
            showToast(`🛒 Added "${rawName}" to Shopping List!`);
          }
          saveManualShoppingList();
          updateShoppingBadges();
          renderBatchPrepModal();
        });
      });
    }

    // Render In Stock List
    if (inStockItems.length === 0) {
      inStockList.innerHTML = '<div style="color: #94a3b8; font-size: 0.84rem; padding: 6px;">No pantry items matched yet.</div>';
    } else {
      inStockList.innerHTML = inStockItems.map(item => `
        <div class="batch-grocery-item-row">
          <div class="batch-grocery-item-left">
            <span style="color: #10b981;">✓</span>
            <span class="batch-grocery-item-name">${escapeHtml(item.name)}</span>
            <span class="batch-grocery-item-used">in ${item.recipesCount} pint${item.recipesCount === 1 ? '' : 's'}</span>
          </div>
          <div class="batch-grocery-item-qty" style="color: #94a3b8;">${escapeHtml(item.qtyText)}</div>
        </div>
      `).join('');
    }
  }

  function copyBatchPrepGroceryList() {
    if (batchPrepQueueState.length === 0) {
      showToast('No pints in batch prep queue.');
      return;
    }

    let text = `🍱 Sunday Batch Prep Grocery List (${batchPrepQueueState.length} Pints)\n`;
    text += `Pints: ${batchPrepQueueState.map(p => p.recipeName).join(', ')}\n\n`;

    const missingListEl = document.getElementById('batchPrepMissingList');
    const inStockListEl = document.getElementById('batchPrepInStockList');

    text += `🛒 NEED TO BUY:\n`;
    if (missingListEl) {
      missingListEl.querySelectorAll('.batch-grocery-item-row').forEach(row => {
        const name = row.querySelector('.batch-grocery-item-name')?.textContent || '';
        const qty = row.querySelector('.batch-grocery-item-qty')?.textContent || '';
        text += `[ ] ${name} — ${qty}\n`;
      });
    }

    text += `\n✅ IN KITCHEN PANTRY:\n`;
    if (inStockListEl) {
      inStockListEl.querySelectorAll('.batch-grocery-item-row').forEach(row => {
        const name = row.querySelector('.batch-grocery-item-name')?.textContent || '';
        const qty = row.querySelector('.batch-grocery-item-qty')?.textContent || '';
        text += `[x] ${name} — ${qty}\n`;
      });
    }

    text += `\nPrep on Creami Cravings: https://creamicravings.com/`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Copied consolidated grocery list to clipboard!');
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  function addMissingBatchToShoppingList() {
    const missingListEl = document.getElementById('batchPrepMissingList');
    if (!missingListEl) return;

    let addedCount = 0;
    missingListEl.querySelectorAll('.batch-grocery-item-name').forEach(el => {
      const name = el.textContent.trim();
      const clean = sanitizeShoppingItemName(name);
      if (clean && !manualShoppingList.has(clean) && !manualShoppingList.has(name)) {
        manualShoppingList.add(clean);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      saveManualShoppingList();
      updateShoppingBadges();
      showToast(`🛒 Added ${addedCount} missing ingredient${addedCount === 1 ? '' : 's'} to your app Shopping List!`);
    } else {
      showToast('✓ All missing items are already in your shopping list.');
    }
    renderBatchPrepModal();
  }

  function batchFillFreezerSlots(customConfigs = null) {
    if (!currentUser) {
      showToast('🔒 Please sign in to save pints to your freezer.');
      openGoogleAuthModal();
      return;
    }
    if (batchPrepQueueState.length === 0) {
      showToast('No pints in batch queue to fill.');
      return;
    }

    const maxAllowed = getUserMaxFreezerSlots(currentUser);
    const takenSlots = new Set(freezerPintsState.map(p => p.slot));

    // If batch needs more slots than currently active toggle, auto-expand up to maxAllowed
    const neededTotal = takenSlots.size + batchPrepQueueState.length;
    if (neededTotal > freezerSlotCapacity && freezerSlotCapacity < maxAllowed) {
      if (neededTotal <= 6 && maxAllowed >= 6) {
        freezerSlotCapacity = 6;
      } else if (neededTotal <= 8 && maxAllowed >= 8) {
        freezerSlotCapacity = 8;
      } else {
        freezerSlotCapacity = maxAllowed;
      }
      try { localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString()); } catch (e) {}
    }

    const emptySlots = [];
    for (let s = 1; s <= freezerSlotCapacity; s++) {
      if (!takenSlots.has(s)) emptySlots.push(s);
    }

    if (emptySlots.length === 0) {
      if (maxAllowed < 12) {
        openFreezerUpgradeModal(maxAllowed < 8 ? 8 : 12, 'batch_overflow');
      } else {
        showToast(`⚠️ All ${freezerSlotCapacity} freezer container slots are currently full! Spin or clear a container first.`);
      }
      return;
    }

    let filledCount = 0;
    const filledIndices = [];
    const allDeducted = [];

    batchPrepQueueState.forEach((queued, idx) => {
      if (emptySlots.length > 0) {
        const slotNum = emptySlots.shift();
        const fallbackLid = getPintLidColor(slotNum);
        const config = (customConfigs && customConfigs[idx]) || {};
        const chosenLid = config.lidColor || fallbackLid.id;

        let frozenAt = Date.now();
        const isAlreadyFrozen = Boolean(config.alreadyFrozen || (config.timeOffset && config.timeOffset >= 16));
        if (config.customTime) {
          const parsed = new Date(config.customTime).getTime();
          if (!isNaN(parsed) && parsed > 0) frozenAt = parsed;
        } else if (isAlreadyFrozen) {
          frozenAt = Date.now() - (17 * 3600 * 1000); // 17 hours ago -> ready to spin immediately
        } else if (config.timeOffset && config.timeOffset > 0) {
          frozenAt = Date.now() - (config.timeOffset * 3600 * 1000);
        }

        const recMatch = allRecipes.find(r => (queued.recipeId && r.id === queued.recipeId) || (r.name && r.name.toLowerCase() === queued.recipeName.toLowerCase()));
        const detectedMixins = recMatch && Array.isArray(recMatch.ingredients)
          ? recMatch.ingredients.filter(isMixinIngredient).map(ing => {
              const scaledQty = ing.amount ? scaleQuantity(ing.amount, queued.scale || 1.0) : '';
              const unit = ing.unit ? ing.unit.trim() : '';
              return {
                name: ing.name || ing.raw || 'Mix-in',
                qty: [scaledQty, unit].filter(Boolean).join(' ')
              };
            })
          : [];
        const recommendedCycle = (recMatch && recMatch.spinSetting) || 'Lite Ice Cream';

        const newPint = {
          id: `freezer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          slot: slotNum,
          recipeId: queued.recipeId || null,
          recipeName: queued.recipeName,
          scale: queued.scale || 1.0,
          sizeLabel: queued.scale === 1.5 ? '24 oz Deluxe' : '16 oz Standard',
          frozenAt: frozenAt,
          freezeHours: 16,
          lidColor: chosenLid,
          notes: 'Prepped during Sunday batch session',
          mixins: detectedMixins,
          spinSetting: recommendedCycle,
          notified: false
        };
        freezerPintsState.unshift(newPint);
        filledCount++;
        filledIndices.push(idx);

        const newlyDeducted = deductSingleUseIngredients(queued.recipeId || queued.recipeName, queued.scale || 1.0);
        if (newlyDeducted && newlyDeducted.length > 0) {
          allDeducted.push(...newlyDeducted);
        }
      }
    });

    // Clear filled pints from Sunday Batch Prep queue!
    if (filledCount >= batchPrepQueueState.length) {
      batchPrepQueueState = [];
    } else {
      batchPrepQueueState = batchPrepQueueState.filter((_, idx) => !filledIndices.includes(idx));
    }

    saveBatchPrepQueue();
    updateBatchPrepDockUI();
    renderBatchPrepModal();

    saveFreezerPints();
    renderFreezerShelfWidget();
    scheduleAllPendingPintAlerts();
    closeBatchPrepModal();
    closeBatchAssemblyModal();

    showToast(`❄️ Added ${filledCount} container${filledCount === 1 ? '' : 's'} to freezer & cleared from Prep Mode! 🎉`);

    if (allDeducted.length > 0) {
      const summaryMap = {};
      allDeducted.forEach(d => {
        if (!summaryMap[d.id]) {
          summaryMap[d.id] = { id: d.id, name: d.name, amountDeducted: 0, remaining: d.remaining };
        }
        summaryMap[d.id].amountDeducted = Math.round((summaryMap[d.id].amountDeducted + d.amountDeducted) * 10) / 10;
        summaryMap[d.id].remaining = d.remaining;
      });
      const summaryList = Object.values(summaryMap);
      setTimeout(() => notifyPantryDeduction(summaryList), 1000);
    }
  }

  // ==========================================================================
  // Habit Streaks & Weekly Momentum Engine (Path A Item 4)
  // ==========================================================================
  function getISOWeekString(d = new Date()) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  function getPreviousISOWeekString(d = new Date()) {
    const prev = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
    return getISOWeekString(prev);
  }

  function saveHabitStreakState() {
    try {
      localStorage.setItem(HABIT_STREAK_STORAGE_KEY, JSON.stringify(habitStreakState));
    } catch (e) {
      console.error('Error saving habit streak:', e);
    }
  }

  function recordHabitStreakSpin(pintData = {}) {
    const currentWeek = getISOWeekString();
    const prevWeek = getPreviousISOWeekString();

    if (!habitStreakState.lastSpinWeek) {
      habitStreakState.currentStreak = 1;
    } else if (habitStreakState.lastSpinWeek === currentWeek) {
      if (!habitStreakState.currentStreak || habitStreakState.currentStreak < 1) {
        habitStreakState.currentStreak = 1;
      }
    } else if (habitStreakState.lastSpinWeek === prevWeek) {
      habitStreakState.currentStreak = (habitStreakState.currentStreak || 0) + 1;
    } else {
      habitStreakState.currentStreak = 1;
    }

    habitStreakState.lastSpinWeek = currentWeek;
    habitStreakState.totalSpins = (habitStreakState.totalSpins || 0) + 1;

    if (!Array.isArray(habitStreakState.history)) habitStreakState.history = [];
    habitStreakState.history.unshift({
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      recipeId: pintData.recipeId || null,
      recipeName: pintData.recipeName || 'Creami Pint',
      cycle: pintData.cycle || 'Lite Ice Cream',
      respins: pintData.respins || '0',
      mixins: pintData.mixins || '',
      rating: pintData.rating || 5
    });
    if (habitStreakState.history.length > 50) {
      habitStreakState.history = habitStreakState.history.slice(0, 50);
    }

    saveHabitStreakState();
    return habitStreakState;
  }

  // ==========================================================================
  // Kitchen Assembly Mode Engine (Sunday Batch Prep Step-by-Step)
  // Distraction-free kitchen UI with Screen Wake Lock API (Path A Item 3)
  // ==========================================================================
  async function requestAssemblyWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        assemblyWakeLock = await navigator.wakeLock.request('screen');
        updateAssemblyWakeLockUI(true);
        assemblyWakeLock.addEventListener('release', () => {
          updateAssemblyWakeLockUI(false);
        });
      } else {
        updateAssemblyWakeLockUI(false);
      }
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
      updateAssemblyWakeLockUI(false);
    }
  }

  function releaseAssemblyWakeLock() {
    if (assemblyWakeLock) {
      assemblyWakeLock.release().catch(() => {});
      assemblyWakeLock = null;
    }
    updateAssemblyWakeLockUI(false);
  }

  function updateAssemblyWakeLockUI(isActive) {
    const pill = document.getElementById('assemblyWakeLockPill');
    if (!pill) return;
    if (isActive) {
      pill.innerHTML = '⚡ Screen Awake';
      pill.style.background = 'rgba(16, 185, 129, 0.2)';
      pill.style.borderColor = 'rgba(16, 185, 129, 0.45)';
      pill.style.color = '#34d399';
    } else {
      pill.innerHTML = '💤 Screen Normal';
      pill.style.background = 'rgba(255, 255, 255, 0.05)';
      pill.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      pill.style.color = '#94a3b8';
    }
  }

  function openBatchAssemblyModal() {
    if (!currentUser) {
      showToast('🔒 Please sign in to use Kitchen Assembly Prep Mode.');
      openGoogleAuthModal();
      return;
    }
    if (batchPrepQueueState.length === 0) {
      showToast('Add pints to Sunday Batch Prep first (+Prep on any recipe card)');
      return;
    }
    closeBatchPrepModal();

    const modal = document.getElementById('batchAssemblyModalOverlay');
    if (!modal) return;

    assemblyCurrentStep = 1;
    assemblyCheckedItems.clear();

    // Initialize assembly pint configurations for lid colors & freeze times
    const takenSlots = new Set(freezerPintsState.map(p => p.slot));
    const emptySlots = [];
    for (let s = 1; s <= freezerSlotCapacity; s++) {
      if (!takenSlots.has(s)) emptySlots.push(s);
    }
    assemblyPintConfigs = batchPrepQueueState.map((queued, idx) => {
      const slotNum = emptySlots[idx] || (idx + 1);
      const defaultLid = getPintLidColor(slotNum);
      return {
        lidColor: defaultLid.id,
        timeOffset: 0,
        alreadyFrozen: false,
        customTime: ''
      };
    });

    goToAssemblyStep(1);
    requestAssemblyWakeLock();

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeBatchAssemblyModal() {
    const modal = document.getElementById('batchAssemblyModalOverlay');
    if (!modal) return;
    releaseAssemblyWakeLock();
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  function isMixinIngredient(ing) {
    if (!ing) return false;
    if (ing.isMixin === true || ing.isMixIn === true || ing.isMixin === 'true' || ing.isMixIn === 'true') {
      return true;
    }
    const sec = (ing.section || '').toLowerCase();
    if (sec.includes('mix') || sec.includes('topping')) {
      return true;
    }
    const cat = (ing.category || '').toLowerCase();
    if (cat.includes('mixin') || cat === 'mixins_snacks') {
      return true;
    }
    const name = (ing.name || ing.raw || '').toLowerCase();
    if (/(pretzels?|oreos?|cookie dough|graham cracker|chocolate chips?|mini chips?|candy|sprinkles?|m&ms?|peanut butter cup|reeses|bites\b|wafers?|brownie|mini muffins?)/i.test(name)) {
      return true;
    }
    return false;
  }

  function isLiquidIngredient(ing) {
    if (isMixinIngredient(ing)) return false;
    const name = (ing.name || ing.raw || '').toLowerCase();
    const unit = (ing.unit || '').toLowerCase();
    if (/(powder|pudding|mix\b|gum|flour|sugar|sweetener|splenda|stevia|monk|erythritol|allulose|salt|cinnamon|cocoa|cacao)/i.test(name)) {
      return false;
    }
    if (/(milk|water|shake|juice|cream|syrup|puree|coffee|espresso|extract|paste|yogurt|applesauce|liquid)/i.test(name)) {
      return true;
    }
    if (['cup', 'cups', 'ml', 'fl oz', 'oz'].includes(unit)) {
      return true;
    }
    return Boolean(ing.isBase);
  }

  function isDryIngredient(ing) {
    if (isMixinIngredient(ing)) return false;
    return !isLiquidIngredient(ing);
  }

  function removePintFromAssembly(idx) {
    if (idx < 0 || idx >= batchPrepQueueState.length) return;
    const removed = batchPrepQueueState.splice(idx, 1)[0];
    if (Array.isArray(assemblyPintConfigs) && assemblyPintConfigs.length > idx) {
      assemblyPintConfigs.splice(idx, 1);
    }

    // Remap or discard checked items for shifted pint indices
    const newChecked = new Set();
    assemblyCheckedItems.forEach(key => {
      const parts = key.split('_');
      let pIdx = -1;
      if (parts[0] === 'step1' || parts[0] === 'step2') {
        pIdx = parseInt(parts[1], 10);
      } else if (parts[0] === 'step3' && parts[1] === 'froth') {
        pIdx = parseInt(parts[2], 10);
      } else if (parts[0] === 'step4' && parts[1] === 'mixin') {
        pIdx = parseInt(parts[2], 10);
      }
      if (pIdx !== idx) {
        if (pIdx > idx) {
          if (parts[0] === 'step1' || parts[0] === 'step2') {
            newChecked.add(`${parts[0]}_${pIdx - 1}_${parts[2]}`);
          } else if (parts[0] === 'step3' && parts[1] === 'froth') {
            newChecked.add(`step3_froth_${pIdx - 1}`);
          } else if (parts[0] === 'step4' && parts[1] === 'mixin') {
            newChecked.add(`step4_mixin_${pIdx - 1}_${parts[3]}`);
          }
        } else {
          newChecked.add(key);
        }
      }
    });
    assemblyCheckedItems = newChecked;

    saveBatchPrepQueue();
    updateBatchPrepDockUI();

    if (batchPrepQueueState.length === 0) {
      closeBatchAssemblyModal();
      showToast(`Removed "${removed ? removed.recipeName : 'Pint'}". Kitchen Prep finished!`);
      return;
    }

    showToast(`Removed "${removed ? removed.recipeName : 'Pint'}" (${batchPrepQueueState.length} left)`);

    // Update Header Pill
    const pintsPill = document.getElementById('assemblyPintsPill');
    if (pintsPill) {
      pintsPill.textContent = `${batchPrepQueueState.length} Pint${batchPrepQueueState.length === 1 ? '' : 's'} Queued`;
    }

    // Update Next/Back button text
    const nextBtn = document.getElementById('btnAssemblyNextStep');
    if (nextBtn && assemblyCurrentStep === 4) {
      nextBtn.textContent = batchPrepQueueState.length === 1 ? '❄️ Freeze Pint & Start Timer' : '❄️ Freeze Pints & Start Timers';
    }

    // Re-render current stage
    renderAssemblyStepBody(assemblyCurrentStep);
  }

  function goToAssemblyStep(step) {
    if (batchPrepQueueState.length === 0) {
      closeBatchAssemblyModal();
      return;
    }
    assemblyCurrentStep = Math.max(1, Math.min(4, step));

    // Update Step Bar Buttons
    const stepBar = document.getElementById('assemblyStepBar');
    if (stepBar) {
      stepBar.querySelectorAll('.assembly-step-btn').forEach(btn => {
        const s = parseInt(btn.dataset.step, 10);
        btn.classList.toggle('active', s === assemblyCurrentStep);
        btn.classList.toggle('completed', s < assemblyCurrentStep);
      });
    }

    // Update Header Pill
    const pintsPill = document.getElementById('assemblyPintsPill');
    if (pintsPill) {
      pintsPill.textContent = `${batchPrepQueueState.length} Pint${batchPrepQueueState.length === 1 ? '' : 's'} Queued`;
    }

    // Update Footer Navigation
    const prevBtn = document.getElementById('btnAssemblyPrevStep');
    const nextBtn = document.getElementById('btnAssemblyNextStep');
    if (prevBtn) {
      prevBtn.style.display = assemblyCurrentStep > 1 ? 'inline-flex' : 'none';
      if (assemblyCurrentStep === 2) prevBtn.textContent = '← Step 1';
      else if (assemblyCurrentStep === 3) prevBtn.textContent = '← Step 2';
      else if (assemblyCurrentStep === 4) prevBtn.textContent = '← Step 3';
    }
    if (nextBtn) {
      if (assemblyCurrentStep === 1) nextBtn.textContent = 'Next: Add Powders →';
      else if (assemblyCurrentStep === 2) nextBtn.textContent = 'Next: Froth & Whisk →';
      else if (assemblyCurrentStep === 3) nextBtn.textContent = 'Next: Lid & Freeze →';
      else if (assemblyCurrentStep === 4) {
        nextBtn.textContent = batchPrepQueueState.length === 1 ? '❄️ Freeze Pint & Start Timer' : '❄️ Freeze Pints & Start Timers';
      }
    }

    renderAssemblyStepBody(assemblyCurrentStep);

    // Always reset scroll position to top when switching steps
    const bodyEl = document.getElementById('assemblyBody');
    if (bodyEl) {
      bodyEl.scrollTop = 0;
      requestAnimationFrame(() => {
        bodyEl.scrollTop = 0;
      });
    }
  }

  function renderAssemblyStepBody(step) {
    const body = document.getElementById('assemblyBody');
    if (!body) return;

    if (step === 1) {
      // Step 1: Liquids
      let html = `
        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f8fafc; margin-bottom: 4px;">🥛 Stage 1: Line Up Pints &amp; Pour Liquids</h3>
          <p style="font-size: 0.88rem; color: #94a3b8; margin: 0;">Line up your clean containers on the counter. Pour liquid bases into each pint:</p>
        </div>
        <div class="assembly-pints-grid">
      `;

      batchPrepQueueState.forEach((queued, idx) => {
        const rec = allRecipes.find(r => r.id === queued.recipeId);
        const scale = queued.scale || 1.0;
        const sizeBadge = scale === 1.5 ? '24 oz Deluxe' : '16 oz Standard';
        const ings = rec ? (rec.ingredients || []).filter(isLiquidIngredient) : [];

        html += `
          <div class="assembly-pint-card" data-pint-idx="${idx}">
            <div class="assembly-pint-card-header">
              <span class="assembly-pint-title">#${idx + 1} ${escapeHtml(queued.recipeName)}</span>
              <div class="assembly-pint-header-actions">
                <span class="assembly-pint-badge">${sizeBadge}</span>
                <button type="button" class="btn-assembly-pint-remove" data-action="remove-assembly-pint" data-pint-idx="${idx}" title="Remove this pint from prep">✕</button>
              </div>
            </div>
            <div class="assembly-items-list">
        `;

        if (ings.length === 0) {
          html += `<div style="color: #94a3b8; font-size: 0.8rem; padding: 6px;">Follow standard milk fill line for this recipe.</div>`;
        } else {
          ings.forEach((ing, iIdx) => {
            const key = `step1_${idx}_${iIdx}`;
            const isChecked = assemblyCheckedItems.has(key);
            const formattedQty = formatIngredientAmount(ing, scale, 'metric');
            const cleanName = sanitizeShoppingItemName(ing.name);
            html += `
              <div class="assembly-item-row ${isChecked ? 'checked' : ''}" data-item-key="${key}">
                <span class="assembly-item-name">${escapeHtml(cleanName)}</span>
                <span class="assembly-item-qty">${escapeHtml(formattedQty || 'Fill line')}</span>
              </div>
            `;
          });
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `</div>`;
      body.innerHTML = html;

    } else if (step === 2) {
      // Step 2: Powders & Dry Mixes (Mix-ins strictly excluded until post-freeze spin)
      let html = `
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 1.15rem; color: #f8fafc; margin-bottom: 4px;">🥄 Stage 2: Measure &amp; Add Base Powders</h3>
          <p style="font-size: 0.88rem; color: #94a3b8; margin: 0;">Add base protein powders, pudding mixes, sweeteners, and stabilizers directly into each pint:</p>
        </div>
        <div style="margin-bottom: 16px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; font-size: 0.84rem; color: #bae6fd;">
          <span style="font-size: 1.2rem; flex-shrink: 0;">💡</span>
          <span><strong>Mix-ins are held for post-spin!</strong> Cookies, chips, pretzels, and dough bites are excluded here—they fold in after freezing &amp; your first Creami spin.</span>
        </div>
        <div class="assembly-pints-grid">
      `;

      batchPrepQueueState.forEach((queued, idx) => {
        const rec = allRecipes.find(r => r.id === queued.recipeId);
        const scale = queued.scale || 1.0;
        const sizeBadge = scale === 1.5 ? '24 oz Deluxe' : '16 oz Standard';
        const ings = rec ? (rec.ingredients || []).filter(isDryIngredient) : [];

        html += `
          <div class="assembly-pint-card" data-pint-idx="${idx}">
            <div class="assembly-pint-card-header">
              <span class="assembly-pint-title">#${idx + 1} ${escapeHtml(queued.recipeName)}</span>
              <div class="assembly-pint-header-actions">
                <span class="assembly-pint-badge">${sizeBadge}</span>
                <button type="button" class="btn-assembly-pint-remove" data-action="remove-assembly-pint" data-pint-idx="${idx}" title="Remove this pint from prep">✕</button>
              </div>
            </div>
            <div class="assembly-items-list">
        `;

        if (ings.length === 0) {
          html += `<div style="color: #94a3b8; font-size: 0.8rem; padding: 6px;">No dry powders required for this pint.</div>`;
        } else {
          ings.forEach((ing, iIdx) => {
            const key = `step2_${idx}_${iIdx}`;
            const isChecked = assemblyCheckedItems.has(key);
            const formattedQty = formatIngredientAmount(ing, scale, 'metric');
            const cleanName = sanitizeShoppingItemName(ing.name);
            html += `
              <div class="assembly-item-row ${isChecked ? 'checked' : ''}" data-item-key="${key}">
                <span class="assembly-item-name">${escapeHtml(cleanName)}</span>
                <span class="assembly-item-qty">${escapeHtml(formattedQty || 'As needed')}</span>
              </div>
            `;
          });
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `</div>`;
      body.innerHTML = html;

    } else if (step === 3) {
      // Step 3: Froth / Whisk
      let html = `
        <div style="margin-bottom: 18px;">
          <h3 style="font-size: 1.15rem; color: #f8fafc; margin-bottom: 4px;">🌀 Stage 3: The Essential 30-Second Froth</h3>
          <p style="font-size: 0.88rem; color: #94a3b8; margin: 0;">Do NOT freeze without frothing! An immersion milk frother ensures stabilizers dissolve completely so solids don't settle at the bottom during freezing.</p>
        </div>
        <div class="assembly-technique-card">
          <div class="assembly-tech-step">
            <div class="assembly-tech-step-icon">⚡</div>
            <div class="assembly-tech-step-text">
              <strong>1. Submerge Frother to Bottom</strong>
              <p>Place your handheld milk frother or mini immersion whisk all the way to the bottom before turning it on to avoid splashing.</p>
            </div>
          </div>
          <div class="assembly-tech-step">
            <div class="assembly-tech-step-icon">🌪️</div>
            <div class="assembly-tech-step-text">
              <strong>2. Whisk for 25–30 Seconds</strong>
              <p>Move slowly in small circles until completely smooth with zero dry powder clumps on the walls.</p>
            </div>
          </div>
          <div class="assembly-tech-step">
            <div class="assembly-tech-step-icon">✨</div>
            <div class="assembly-tech-step-text">
              <strong>3. Tap Container on Counter</strong>
              <p>Gently tap the pint base on your counter twice to release large air bubbles before lidding.</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <h4 style="font-size: 0.95rem; color: #cbd5e1; margin-bottom: 10px;">Check off each pint as you froth it:</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
      `;

      batchPrepQueueState.forEach((queued, idx) => {
        const key = `step3_froth_${idx}`;
        const isChecked = assemblyCheckedItems.has(key);
        html += `
          <div class="assembly-item-row ${isChecked ? 'checked' : ''}" data-item-key="${key}" style="padding: 12px 14px; font-size: 0.92rem;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span>${isChecked ? '✅' : '⏳'}</span>
              <span class="assembly-item-name">#${idx + 1} ${escapeHtml(queued.recipeName)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="assembly-item-qty">${isChecked ? 'Frothed ✓' : 'Froth 30s'}</span>
              <button type="button" class="btn-assembly-pint-remove" data-action="remove-assembly-pint" data-pint-idx="${idx}" title="Remove this pint from prep">✕</button>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
      body.innerHTML = html;

    } else if (step === 4) {
      // Step 4: Lid & Freeze Flat + Interactive Lid Color & Freeze Time Selector
      if (!assemblyPintConfigs || assemblyPintConfigs.length !== batchPrepQueueState.length) {
        const takenSlots = new Set(freezerPintsState.map(p => p.slot));
        const emptySlots = [];
        for (let s = 1; s <= freezerSlotCapacity; s++) {
          if (!takenSlots.has(s)) emptySlots.push(s);
        }
        assemblyPintConfigs = batchPrepQueueState.map((queued, idx) => {
          const slotNum = emptySlots[idx] || (idx + 1);
          const defaultLid = getPintLidColor(slotNum);
          return {
            lidColor: defaultLid.id,
            timeOffset: 0,
            alreadyFrozen: false,
            customTime: ''
          };
        });
      }

      let html = `
        <div class="assembly-freeze-stage-card">
          <div class="assembly-freeze-icon">❄️</div>
          <h3 style="font-size: 1.3rem; color: #f8fafc; margin: 0;">Lid Securely &amp; Freeze Flat</h3>
          <p style="font-size: 0.92rem; color: #cbd5e1; max-width: 540px; margin: 0; line-height: 1.5;">
            Select your lid color and mixed time for each container below. Place containers on a <strong>completely flat surface</strong> in the coldest part of your freezer.
          </p>
          <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 6px;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 10px 16px; text-align: center;">
              <span style="font-size: 1.2rem; display: block;">⏱️</span>
              <strong style="color: #38bdf8; font-size: 0.88rem;">16-Hour Calibrated Freeze</strong>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 10px 16px; text-align: center;">
              <span style="font-size: 1.2rem; display: block;">🔔</span>
              <strong style="color: #34d399; font-size: 0.88rem;">Automated Readiness Push Alerts</strong>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 10px 16px; text-align: center;">
              <span style="font-size: 1.2rem; display: block;">🔥</span>
              <strong style="color: #fb923c; font-size: 0.88rem;">Weekly Habit Streak Active</strong>
            </div>
          </div>
        </div>
      `;

      if (batchPrepQueueState.length > 1) {
        html += `
          <div class="assembly-batch-time-bar">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.3rem;">⚡</span>
              <div>
                <strong style="color: #f8fafc; font-size: 0.9rem; display: block;">Mixed Entire Batch at Once?</strong>
                <span style="color: #94a3b8; font-size: 0.78rem;">Quickly apply freeze time to all queued containers:</span>
              </div>
            </div>
            <div class="freezer-time-presets" id="assemblyBatchTimePresets">
              <button type="button" class="btn-time-preset active" data-batch-offset="0">Just now</button>
              <button type="button" class="btn-time-preset" data-batch-offset="4">4h ago</button>
              <button type="button" class="btn-time-preset" data-batch-offset="8">8h ago</button>
              <button type="button" class="btn-time-preset" data-batch-offset="12">12h ago</button>
              <button type="button" class="btn-time-preset" data-batch-offset="16">Already Frozen</button>
            </div>
          </div>
        `;
      }

      html += `<div class="assembly-freeze-grid">`;

      batchPrepQueueState.forEach((queued, idx) => {
        const scale = queued.scale || 1.0;
        const sizeBadge = scale === 1.5 ? '24 oz Deluxe' : '16 oz Standard';
        const cfg = assemblyPintConfigs[idx] || { lidColor: 'blue', timeOffset: 0, alreadyFrozen: false };
        const currentLid = cfg.lidColor || 'blue';
        const lidColorObj = getPintLidColor(currentLid);
        const currentOffset = cfg.timeOffset || 0;
        const isFrozen = Boolean(cfg.alreadyFrozen || currentOffset >= 16);

        let timeStatusText = '16h Freeze Timer';
        let timeStatusColor = '#38bdf8';
        if (isFrozen) {
          timeStatusText = 'Ready to Spin 🍨';
          timeStatusColor = '#34d399';
        } else if (currentOffset > 0) {
          timeStatusText = `Mixed ${currentOffset}h ago (${16 - currentOffset}h left)`;
          timeStatusColor = '#facc15';
        }

        html += `
          <div class="assembly-freeze-card" data-freeze-pint-idx="${idx}">
            <div class="assembly-pint-card-header">
              <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                <span style="font-size: 1.15rem;">🍨</span>
                <span class="assembly-pint-title" title="${escapeHtml(queued.recipeName)}">#${idx + 1} ${escapeHtml(queued.recipeName)}</span>
              </div>
              <div class="assembly-pint-header-actions">
                <span class="assembly-pint-badge">${sizeBadge}</span>
                <button type="button" class="btn-assembly-pint-remove" data-action="remove-assembly-pint" data-pint-idx="${idx}" title="Remove this pint from prep">✕</button>
              </div>
            </div>

            <!-- Lid Color Selector -->
            <div style="margin-top: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;">
                <span style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1;">Pint Lid Color:</span>
                <span id="assemblyLidLabel_${idx}" style="font-size: 0.78rem; font-weight: 800; color: ${lidColorObj.hex};">${lidColorObj.icon} ${lidColorObj.name}</span>
              </div>
              <div class="lid-color-swatches-grid assembly-lid-swatches" data-pint-idx="${idx}">
                ${PINT_LID_COLORS.map(c => {
                  const isSel = c.id === currentLid;
                  return `
                    <button type="button" class="lid-swatch-btn ${isSel ? 'active' : ''}" data-color-id="${c.id}" data-pint-idx="${idx}" style="--swatch-glow: ${c.hex}; ${isSel ? `border-color: ${c.border}; background: ${c.bgTint};` : ''}" title="${c.name} Lid">
                      <span class="lid-swatch-circle" style="background: ${c.hex};">${isSel ? '✓' : ''}</span>
                      <span>${c.name}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Time Preset Selector -->
            <div style="margin-top: 10px; border-top: 1px dashed rgba(255, 255, 255, 0.08); padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;">
                <span style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1;">When Did You Mix It?</span>
                <span id="assemblyTimeStatus_${idx}" style="font-size: 0.76rem; font-weight: 700; color: ${timeStatusColor};">${timeStatusText}</span>
              </div>
              <div class="freezer-time-presets assembly-pint-time-presets" data-pint-idx="${idx}">
                <button type="button" class="btn-time-preset ${!isFrozen && currentOffset === 0 ? 'active' : ''}" data-offset="0">Just now</button>
                <button type="button" class="btn-time-preset ${!isFrozen && currentOffset === 4 ? 'active' : ''}" data-offset="4">4h ago</button>
                <button type="button" class="btn-time-preset ${!isFrozen && currentOffset === 8 ? 'active' : ''}" data-offset="8">8h ago</button>
                <button type="button" class="btn-time-preset ${!isFrozen && currentOffset === 12 ? 'active' : ''}" data-offset="12">12h ago</button>
                <button type="button" class="btn-time-preset ${isFrozen ? 'active' : ''}" data-offset="16">Already Frozen</button>
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;

      // Check if any pints in queue have mix-ins to reserve for post-spin
      const pintsWithMixins = [];
      batchPrepQueueState.forEach((queued, idx) => {
        const rec = allRecipes.find(r => r.id === queued.recipeId);
        const scale = queued.scale || 1.0;
        const mixins = rec ? (rec.ingredients || []).filter(isMixinIngredient) : [];
        if (mixins.length > 0) {
          pintsWithMixins.push({
            idx,
            recipeName: queued.recipeName,
            scale,
            mixins
          });
        }
      });

      if (pintsWithMixins.length > 0) {
        html += `
          <div style="margin-top: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 18px 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.25rem;">🍪</span>
                <h4 style="margin: 0; font-size: 1.05rem; color: #fef3c7;">Post-Spin Mix-Ins to Reserve</h4>
              </div>
              <span style="font-size: 0.78rem; background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 3px 10px; border-radius: 12px; font-weight: 600;">
                Add Tomorrow on Mix-In Cycle
              </span>
            </div>
            <p style="font-size: 0.86rem; color: #cbd5e1; margin: 0 0 14px 0; line-height: 1.45;">
              Keep these in your pantry or fridge. Tomorrow, after freezing 16+ hours, run your Creami spin, core a center tunnel with a butter knife, drop in your mix-ins, and run the <strong>Mix-In cycle</strong>:
            </p>
            <div class="assembly-pints-grid">
        `;

        pintsWithMixins.forEach(item => {
          const sizeBadge = item.scale === 1.5 ? '24 oz Deluxe' : '16 oz Standard';
          html += `
            <div class="assembly-pint-card" style="border-color: rgba(245, 158, 11, 0.25);">
              <div class="assembly-pint-card-header" style="background: rgba(245, 158, 11, 0.08);">
                <span class="assembly-pint-title">#${item.idx + 1} ${escapeHtml(item.recipeName)}</span>
                <span class="assembly-pint-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">${sizeBadge}</span>
              </div>
              <div class="assembly-items-list">
          `;
          item.mixins.forEach((mix, mIdx) => {
            const key = `step4_mixin_${item.idx}_${mIdx}`;
            const isChecked = assemblyCheckedItems.has(key);
            const formattedQty = formatIngredientAmount(mix, item.scale, 'metric');
            const cleanName = sanitizeShoppingItemName(mix.name);
            html += `
              <div class="assembly-item-row ${isChecked ? 'checked' : ''}" data-item-key="${key}">
                <span class="assembly-item-name" style="color: #fef3c7;">🍪 ${escapeHtml(cleanName)}</span>
                <span class="assembly-item-qty" style="color: #fbbf24; font-weight: 600;">${escapeHtml(formattedQty || '1 portion')}</span>
              </div>
            `;
          });
          html += `
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }
      body.innerHTML = html;

      // Attach Step 4 Listeners
      const batchTimeContainer = body.querySelector('#assemblyBatchTimePresets');
      if (batchTimeContainer) {
        batchTimeContainer.querySelectorAll('.btn-time-preset').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const bOffset = parseFloat(btn.dataset.batchOffset) || 0;
            batchTimeContainer.querySelectorAll('.btn-time-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            assemblyPintConfigs.forEach((cfg, idx) => {
              cfg.timeOffset = bOffset;
              cfg.alreadyFrozen = (bOffset >= 16);

              const pintPresets = body.querySelector(`.assembly-pint-time-presets[data-pint-idx="${idx}"]`);
              if (pintPresets) {
                pintPresets.querySelectorAll('.btn-time-preset').forEach(pBtn => {
                  const pOff = parseFloat(pBtn.dataset.offset) || 0;
                  pBtn.classList.toggle('active', (bOffset >= 16 && pOff >= 16) || (bOffset < 16 && pOff === bOffset));
                });
              }

              const statusEl = body.querySelector(`#assemblyTimeStatus_${idx}`);
              if (statusEl) {
                if (bOffset >= 16) {
                  statusEl.textContent = 'Ready to Spin 🍨';
                  statusEl.style.color = '#34d399';
                } else if (bOffset > 0) {
                  statusEl.textContent = `Mixed ${bOffset}h ago (${16 - bOffset}h left)`;
                  statusEl.style.color = '#facc15';
                } else {
                  statusEl.textContent = '16h Freeze Timer';
                  statusEl.style.color = '#38bdf8';
                }
              }
            });
          });
        });
      }

      // Swatch Click Listeners
      body.querySelectorAll('.lid-swatch-btn[data-pint-idx]').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
          e.preventDefault();
          const pIdx = parseInt(swatch.dataset.pintIdx, 10);
          const colorId = swatch.dataset.colorId;
          const col = PINT_LID_COLORS.find(c => c.id === colorId);
          if (!col || isNaN(pIdx) || !assemblyPintConfigs[pIdx]) return;

          assemblyPintConfigs[pIdx].lidColor = colorId;

          const swatchesContainer = body.querySelector(`.assembly-lid-swatches[data-pint-idx="${pIdx}"]`);
          if (swatchesContainer) {
            swatchesContainer.querySelectorAll('.lid-swatch-btn').forEach(b => {
              const isThis = b.dataset.colorId === colorId;
              const thisCol = PINT_LID_COLORS.find(c => c.id === b.dataset.colorId);
              b.classList.toggle('active', isThis);
              if (isThis && thisCol) {
                b.style.borderColor = thisCol.border;
                b.style.background = thisCol.bgTint;
              } else {
                b.style.borderColor = '';
                b.style.background = '';
              }
              const circle = b.querySelector('.lid-swatch-circle');
              if (circle) circle.textContent = isThis ? '✓' : '';
            });
          }

          const label = body.querySelector(`#assemblyLidLabel_${pIdx}`);
          if (label) {
            label.textContent = `${col.icon} ${col.name}`;
            label.style.color = col.hex;
          }
        });
      });

      // Individual Pint Time Preset Listeners
      body.querySelectorAll('.assembly-pint-time-presets .btn-time-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const presetsWrap = btn.closest('.assembly-pint-time-presets');
          if (!presetsWrap) return;
          const pIdx = parseInt(presetsWrap.dataset.pintIdx, 10);
          const offset = parseFloat(btn.dataset.offset) || 0;
          if (isNaN(pIdx) || !assemblyPintConfigs[pIdx]) return;

          presetsWrap.querySelectorAll('.btn-time-preset').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          assemblyPintConfigs[pIdx].timeOffset = offset;
          assemblyPintConfigs[pIdx].alreadyFrozen = (offset >= 16);

          const statusEl = body.querySelector(`#assemblyTimeStatus_${pIdx}`);
          if (statusEl) {
            if (offset >= 16) {
              statusEl.textContent = 'Ready to Spin 🍨';
              statusEl.style.color = '#34d399';
            } else if (offset > 0) {
              statusEl.textContent = `Mixed ${offset}h ago (${16 - offset}h left)`;
              statusEl.style.color = '#facc15';
            } else {
              statusEl.textContent = '16h Freeze Timer';
              statusEl.style.color = '#38bdf8';
            }
          }

          if (batchTimeContainer) {
            batchTimeContainer.querySelectorAll('.btn-time-preset').forEach(b => b.classList.remove('active'));
          }
        });
      });
    }

    // Attach click listeners to checkable items in the rendered step
    body.querySelectorAll('.assembly-item-row[data-item-key]').forEach(row => {
      row.addEventListener('click', () => {
        const key = row.dataset.itemKey;
        if (assemblyCheckedItems.has(key)) {
          assemblyCheckedItems.delete(key);
          row.classList.remove('checked');
          if (step === 3) {
            const icon = row.querySelector('span:first-child');
            if (icon) icon.textContent = '⏳';
            const qty = row.querySelector('.assembly-item-qty');
            if (qty) qty.textContent = 'Froth 30s';
          }
        } else {
          assemblyCheckedItems.add(key);
          row.classList.add('checked');
          if (step === 3) {
            const icon = row.querySelector('span:first-child');
            if (icon) icon.textContent = '✅';
            const qty = row.querySelector('.assembly-item-qty');
            if (qty) qty.textContent = 'Frothed ✓';
          }
        }
      });
    });

    // Attach remove pint listeners across all steps
    body.querySelectorAll('.btn-assembly-pint-remove[data-pint-idx]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const pIdx = parseInt(btn.dataset.pintIdx, 10);
        removePintFromAssembly(pIdx);
      });
    });
  }

  // ==========================================================================
  // Interactive Spin Log Engine (Path A Item 4)
  // ==========================================================================
  let spinLogActivePint = null;
  let spinLogSelectedCycle = 'Lite Ice Cream';
  let spinLogSelectedRespins = '0';
  let spinLogSelectedRating = 5;

  // Spin Log Warm Water Bath Timer State
  let spinLogTimerInterval = null;
  let spinLogTimerRunning = false;
  let spinLogTimerDuration = 60;
  let spinLogTimerSeconds = 60;

  function resetSpinLogWaterTimer(newDuration = 60) {
    if (spinLogTimerInterval) {
      clearInterval(spinLogTimerInterval);
      spinLogTimerInterval = null;
    }
    spinLogTimerRunning = false;
    spinLogTimerDuration = Number(newDuration) || 60;
    spinLogTimerSeconds = spinLogTimerDuration;

    const badge = document.getElementById('spinLogTimerBadge');
    if (badge) {
      badge.textContent = `${spinLogTimerSeconds}s`;
      badge.classList.remove('pulsing', 'done');
    }

    const bar = document.getElementById('spinLogTimerBar');
    if (bar) {
      bar.style.width = '100%';
      bar.classList.remove('done');
    }

    const startBtn = document.getElementById('spinLogStartTimerBtn');
    if (startBtn) {
      startBtn.textContent = `▶️ Start ${spinLogTimerDuration}s Bath`;
      startBtn.className = 'btn-timer-primary';
    }

    const resetBtn = document.getElementById('spinLogResetTimerBtn');
    if (resetBtn) {
      resetBtn.style.display = 'none';
    }

    const presets = document.getElementById('spinLogTimerPresets');
    if (presets) {
      presets.querySelectorAll('.timer-preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.time, 10) === spinLogTimerDuration);
      });
    }
  }

  function toggleSpinLogWaterTimer() {
    const startBtn = document.getElementById('spinLogStartTimerBtn');
    const resetBtn = document.getElementById('spinLogResetTimerBtn');
    const badge = document.getElementById('spinLogTimerBadge');
    const bar = document.getElementById('spinLogTimerBar');

    if (spinLogTimerRunning) {
      // Pause
      if (spinLogTimerInterval) {
        clearInterval(spinLogTimerInterval);
        spinLogTimerInterval = null;
      }
      spinLogTimerRunning = false;
      if (startBtn) {
        startBtn.textContent = '▶️ Resume Bath';
        startBtn.className = 'btn-timer-primary';
      }
      if (badge) {
        badge.classList.remove('pulsing');
      }
      if (resetBtn) {
        resetBtn.style.display = 'inline-block';
      }
    } else {
      // Start or Resume
      if (spinLogTimerSeconds <= 0) {
        spinLogTimerSeconds = spinLogTimerDuration;
      }
      spinLogTimerRunning = true;
      if (startBtn) {
        startBtn.textContent = '⏸️ Pause';
        startBtn.className = 'btn-timer-primary running';
      }
      if (badge) {
        badge.classList.add('pulsing');
        badge.classList.remove('done');
      }
      if (bar) {
        bar.classList.remove('done');
      }
      if (resetBtn) {
        resetBtn.style.display = 'inline-block';
      }

      spinLogTimerInterval = setInterval(() => {
        spinLogTimerSeconds--;
        if (badge) badge.textContent = `${spinLogTimerSeconds}s`;
        if (bar) {
          const pct = Math.max(0, Math.min(100, (spinLogTimerSeconds / spinLogTimerDuration) * 100));
          bar.style.width = `${pct}%`;
        }
        if (spinLogTimerSeconds <= 0) {
          clearInterval(spinLogTimerInterval);
          spinLogTimerInterval = null;
          spinLogTimerRunning = false;
          if (badge) {
            badge.textContent = '0s';
            badge.classList.remove('pulsing');
            badge.classList.add('done');
          }
          if (bar) {
            bar.style.width = '100%';
            bar.classList.add('done');
          }
          if (startBtn) {
            startBtn.textContent = '✅ Ready to Spin! ❄️';
            startBtn.className = 'btn-timer-primary done';
          }
          playAudioChime();
          triggerHaptic([100, 50, 100, 50, 200]);
          showToast('❄️ 60-second bath complete! Pint edges thawed & ready to spin!');
        }
      }, 1000);
    }
  }

  function openSpinLogModal(pintId) {
    const pint = freezerPintsState.find(p => p.id === pintId);
    if (!pint) {
      showToast('Pint container not found in freezer.');
      return;
    }

    spinLogActivePint = pint;
    spinLogSelectedCycle = 'Lite Ice Cream';
    spinLogSelectedRespins = '0';
    spinLogSelectedRating = 5;

    const rec = allRecipes.find(r => (pint.recipeId && r.id === pint.recipeId) || (pint.recipeName && r.name && r.name.toLowerCase() === pint.recipeName.toLowerCase()));
    if (pint.spinSetting) {
      spinLogSelectedCycle = pint.spinSetting;
    } else if (rec && rec.spinSetting) {
      spinLogSelectedCycle = rec.spinSetting;
    } else if (rec) {
      const cat = (rec.category || '').toLowerCase();
      if (cat.includes('sorbet') || cat.includes('fruit')) spinLogSelectedCycle = 'Sorbet';
      else if (cat.includes('gelato')) spinLogSelectedCycle = 'Gelato';
      else if (cat.includes('milkshake')) spinLogSelectedCycle = 'Milkshake';
    }

    // Render Summary Card
    const summaryCard = document.getElementById('spinLogSummaryCard');
    if (summaryCard) {
      const ageHours = Math.round((Date.now() - pint.frozenAt) / (1000 * 60 * 60));
      summaryCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 2rem;">🍨</span>
          <div>
            <h3 style="margin: 0; font-size: 1.05rem; color: #f8fafc;">${escapeHtml(pint.recipeName)}</h3>
            <span style="font-size: 0.78rem; color: #cbd5e1;">${escapeHtml(pint.sizeLabel || '16 oz Standard')} • Frozen ~${ageHours}h</span>
          </div>
        </div>
        <span style="font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">Ready to Spin!</span>
      `;
    }

    // Update cycle pill active state
    document.querySelectorAll('#spinCycleButtons .cycle-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cycle === spinLogSelectedCycle);
    });

    // Update respin pill active state
    document.querySelectorAll('#spinRespinOptions .respin-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.respins === spinLogSelectedRespins);
    });

    // Update star ratings
    updateSpinStarRatingUI(spinLogSelectedRating);

    // Mix-ins display & pre-population
    const mixins = getPintMixins(pint);
    const mixInsInput = document.getElementById('spinMixInsInput');
    const mixinCalloutEl = document.getElementById('spinLogMixinCallout');

    if (mixins.length > 0) {
      const mixinText = mixins.map(m => (m.qty ? `${m.qty} ${m.name}` : m.name)).join(', ');
      if (mixInsInput) mixInsInput.value = mixinText;
      if (mixinCalloutEl) {
        mixinCalloutEl.style.display = 'block';
        mixinCalloutEl.innerHTML = `
          <div class="spin-recipe-mixin-callout">
            <div class="spin-mixin-header">
              <span style="font-size: 1.25rem;">🍪</span>
              <span class="spin-mixin-title">Required Recipe Mix-In:</span>
              <span class="spin-mixin-name">${escapeHtml(mixinText)}</span>
            </div>
            <p class="spin-mixin-instruction">
              💡 <strong>Mix-In Prep Tip:</strong> After your initial <em>${escapeHtml(spinLogSelectedCycle)}</em> spin, dig a 1.5-inch hole in the center down to the bottom of the pint. Drop in your mix-ins, place container back in the machine, and press the <strong>Mix-In</strong> button!
            </p>
          </div>
        `;
      }
    } else {
      if (mixInsInput) mixInsInput.value = '';
      if (mixinCalloutEl) {
        mixinCalloutEl.style.display = 'none';
        mixinCalloutEl.innerHTML = '';
      }
    }

    // Update streak banner
    const currentWeek = getISOWeekString();
    const prevWeek = getPreviousISOWeekString();
    let projectedStreak = 1;
    if (!habitStreakState.lastSpinWeek) {
      projectedStreak = 1;
    } else if (habitStreakState.lastSpinWeek === currentWeek) {
      projectedStreak = habitStreakState.currentStreak || 1;
    } else if (habitStreakState.lastSpinWeek === prevWeek) {
      projectedStreak = (habitStreakState.currentStreak || 0) + 1;
    } else {
      projectedStreak = 1;
    }

    const streakTitle = document.getElementById('spinStreakTitle');
    const streakSub = document.getElementById('spinStreakSub');
    if (streakTitle) {
      streakTitle.textContent = `Week ${projectedStreak} Habit Streak Active!`;
    }
    if (streakSub) {
      streakSub.textContent = `Logging this spin locks in week ${projectedStreak} of your Ninja Creami habit. Total spins: ${(habitStreakState.totalSpins || 0) + 1}`;
    }

    const modal = document.getElementById('spinLogModalOverlay');
    resetSpinLogWaterTimer(60);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeSpinLogModal() {
    resetSpinLogWaterTimer(60);
    const modal = document.getElementById('spinLogModalOverlay');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
    const mixinCalloutEl = document.getElementById('spinLogMixinCallout');
    if (mixinCalloutEl) {
      mixinCalloutEl.style.display = 'none';
      mixinCalloutEl.innerHTML = '';
    }
    spinLogActivePint = null;
  }
  window.closeSpinLogModal = closeSpinLogModal;

  function updateSpinStarRatingUI(rating) {
    document.querySelectorAll('#spinStarRating .star-btn').forEach(btn => {
      const star = parseInt(btn.dataset.star, 10);
      btn.classList.toggle('active', star <= rating);
    });
  }

  function confirmSpinLog() {
    if (!spinLogActivePint) {
      closeSpinLogModal();
      return;
    }
    const pint = spinLogActivePint;
    const mixinsVal = (document.getElementById('spinMixInsInput')?.value || '').trim();

    try {
      recordHabitStreakSpin({
        recipeId: pint.recipeId,
        recipeName: pint.recipeName,
        cycle: spinLogSelectedCycle,
        respins: spinLogSelectedRespins,
        mixins: mixinsVal,
        rating: spinLogSelectedRating
      });

      const pintId = pint.id;
      closeSpinLogModal();

      spinAndEnjoyFreezerPint(pintId, true);

      showToast(`🍨 Spun & Enjoyed "${pint.recipeName}"! 🔥 Week ${habitStreakState.currentStreak} Streak Logged!`);
    } catch (err) {
      console.error('Error confirming spin log:', err);
      closeSpinLogModal();
      showToast('Spin logged!');
    }
  }

  function shareStoryCardFromSpinLog() {
    if (!spinLogActivePint) return;
    const pint = spinLogActivePint;
    const rId = pint.recipeId;
    const pintId = pint.id;

    // Log the spin and consume the pint from the freezer so sharing doesn't leave pint unspun
    try {
      recordHabitStreakSpin({
        recipeId: pint.recipeId,
        recipeName: pint.recipeName,
        cycle: spinLogSelectedCycle,
        respins: spinLogSelectedRespins,
        mixins: (document.getElementById('spinMixInsInput')?.value || '').trim(),
        rating: spinLogSelectedRating
      });
      spinAndEnjoyFreezerPint(pintId, true);
    } catch (e) {
      console.warn('Error recording spin during story card share:', e);
    }

    closeSpinLogModal();
    if (rId) {
      openStoryCardModal(rId);
    } else {
      showToast('Custom pint without recipe link. Select any recipe to create a story card!');
    }
  }

  // ==========================================================================
  // 1-Tap Smart Ingredient Substitutions Database & Engine (Roadmap Item 16)
  // Tested substitutions specifically calibrated for Ninja Creami freezing
  // mechanics, high-shear blade dynamics, overrun, and macro targets.
  // ==========================================================================
  const CREAMI_SWAPS_DATABASE = [
    {
      id: 'milk_bases',
      categoryLabel: 'Milk & Liquid Bases',
      roleDescription: 'Forms the liquid volume of your pint. Milk sugars, proteins, and fats govern ice crystal size and blade churn aeration.',
      pattern: /(?:fairlife|ultra-filtered|skim milk|2% milk|whole milk|\bmilk\b|almond milk|oat milk|protein shake|core power|soy milk|cashew milk)/i,
      options: [
        {
          name: 'Unsweetened Almond Milk + 1 tbsp Heavy Cream',
          ratio: '1:1 liquid swap + 15g (1 tbsp) heavy whipping cream',
          textureImpact: 'Heavy cream lipids coat the water ice crystals, preventing almond milk from churning into powdery dry snow.',
          macroDelta: 'Slashes ~60–80 kcal; -11g protein, +5g fat compared to Fairlife 2%.',
          spinTip: 'Always run outer sides under warm tap water for 60s. May require 1 Respin cycle for maximum silkiness.',
          proTip: 'Never spin 100% water-thin almond milk alone without stabilizer or added fat, or it will churn into dry powdery shavings.'
        },
        {
          name: 'Ready-To-Drink Protein Shake (Core Power / Premier / Quest)',
          ratio: '1:1 direct volume replacement',
          textureImpact: 'Ultra-creamy custard soft-serve texture. Commercial emulsifiers (gellan/carrageenan) prevent ice crystallization.',
          macroDelta: 'Boosts protein by +10g to +18g per pint; adds ~30–50 kcal.',
          spinTip: 'Spins perfectly on Lite Ice Cream. Typically yields thick gelato on pass 1 with 0 respins needed!',
          proTip: 'You can omit additional xanthan or pudding mix when using RTD shakes—they already contain heavy industrial stabilizers.'
        },
        {
          name: 'Barista-Blend Oat Milk',
          ratio: '1:1 direct volume replacement',
          textureImpact: 'Velvety, dense mouthfeel from oat beta-glucan starches and emulsified plant lipids.',
          macroDelta: '+30–50 kcal, +8g carbs, -8g protein compared to ultra-filtered dairy milk.',
          spinTip: 'Processes cleanly on standard Ice Cream or Lite Ice Cream setting.',
          proTip: 'Opt for "Barista" oat milk versions; their higher lipid content produces superior micro-emulsion in sub-zero churning.'
        },
        {
          name: '2% or Whole Dairy Milk',
          ratio: '1:1 direct volume replacement',
          textureImpact: 'Classic rich traditional ice cream mouthfeel with natural dairy sweetness from lactose.',
          macroDelta: '+20–60 kcal, -5g protein, +3g to +6g dairy fat compared to Fairlife Skim/Fat-Free.',
          spinTip: 'Spins smooth on Lite Ice Cream or Ice Cream cycle with zero chalkiness.',
          proTip: 'Natural lactose depresses freezing points slightly better than unsweetened nut milks, making the pint less icy.'
        }
      ]
    },
    {
      id: 'stabilizers',
      categoryLabel: 'Stabilizers & Gels',
      roleDescription: 'Binds free water molecules to prevent hard ice crystallization and create stretchy, scoopable soft-serve.',
      pattern: /(?:xanthan|guar gum|tara gum|locust bean|stabilizer)/i,
      options: [
        {
          name: 'Sugar-Free Instant Pudding Mix (Jell-O)',
          ratio: '1/4 tsp gum → 7g to 10g (approx 1 tbsp) dry mix',
          textureImpact: 'The undisputed gold standard Creami hack. Modified cornstarch swells into a lush pudding gel that whips like soft-serve.',
          macroDelta: '+25–35 kcal, +6g carbs (slow-digesting modified food starch).',
          spinTip: 'Whisk into liquid thoroughly before freezing so no dry starch settles at the bottom of the container.',
          proTip: 'SF White Chocolate or SF Cheesecake pudding mix imparts an incredible gourmet bakery flavor foundation!'
        },
        {
          name: 'Guar Gum (Cold-Hydrating)',
          ratio: '1:1 by volume (1/4 tsp guar for 1/4 tsp xanthan)',
          textureImpact: 'Produces a stretchier, gelato-like consistency. Hydrates exceptionally well in near-freezing temperatures.',
          macroDelta: '0 net calories, 0g sugar, +1g soluble prebiotic fiber.',
          spinTip: 'Process on Lite Ice Cream cycle.',
          proTip: 'Guar gum hydrates faster in cold liquids than xanthan gum, making it superior if mixing cold bases right before freezing.'
        },
        {
          name: 'Blended Low-Fat Cottage Cheese or Light Cream Cheese',
          ratio: '1/4 tsp gum → 30g (2 tbsp) cottage cheese or 15g light cream cheese',
          textureImpact: 'Natural dairy caseins and phospholipids create dense, decadent New York cheesecake richness.',
          macroDelta: '+25–35 kcal, +4g protein, +1g fat.',
          spinTip: 'Must be blended completely smooth with an immersion or counter blender before freezing.',
          proTip: 'You cannot taste cottage cheese once frozen and spun—it transforms completely into a velvety dairy cream base.'
        }
      ]
    },
    {
      id: 'protein_powders',
      categoryLabel: 'Protein Powders',
      roleDescription: 'Provides primary structural body, density, and overrun. Blends dictate whether texture is creamy soft-serve or dry snow.',
      pattern: /(?:protein powder|whey|casein|pea protein|plant protein|vegan protein|isolate)/i,
      options: [
        {
          name: 'Whey / Casein 50/50 Blend (PEScience / Quest)',
          ratio: '1:1 scoop swap (approx 31g)',
          textureImpact: 'The holy grail for Ninja Creami. Micellar casein absorbs 3x its weight in liquid into a thick gel, while whey adds airy fluff.',
          macroDelta: 'Net neutral delta (within ±5 kcal and 1g protein of pure whey).',
          spinTip: 'Spins thick on pass 1; almost never requires a Respin cycle.',
          proTip: '100% Whey Isolate aerates too quickly into dry powdery snow; blending with casein locks in commercial ice cream density.'
        },
        {
          name: '100% Whey Isolate + 2 tbsp Nonfat Greek Yogurt',
          ratio: '1 scoop whey + 30g (2 tbsp) plain Greek yogurt',
          textureImpact: 'Lactic moisture from Greek yogurt counteracts whey isolate dryness, preventing icy crumbling.',
          macroDelta: '+18 kcal, +3g protein, 0g fat.',
          spinTip: '1st spin Lite Ice Cream → 1 Respin cycle for maximum velvet whip.',
          proTip: 'Ideal quick fix if you only have standard whey isolate tubs in your pantry.'
        },
        {
          name: 'Plant / Pea-Brown Rice Protein',
          ratio: '1:1 scoop swap + add 35ml (2 tbsp) extra milk',
          textureImpact: 'Plant proteins absorb significantly more water; the extra liquid prevents an overly clay-like or dense dry texture.',
          macroDelta: '-5 kcal, -2g protein, +1g fiber, 100% dairy-free / vegan.',
          spinTip: 'Always give a 60-second hot water bath to avoid icy ring on the perimeter.',
          proTip: 'Plant proteins pair especially well with cocoa powder, peanut butter, or chai spices to mask earthy undertones.'
        }
      ]
    },
    {
      id: 'sweeteners',
      categoryLabel: 'Sweeteners & Freezing Point Modifiers',
      roleDescription: 'Regulates taste and depresses freezing point so ice crystals remain tiny and sliceable by the high-speed blade.',
      pattern: /(?:allulose|erythritol|monk fruit|stevia|splenda|sweetener|maple syrup|honey|sugar|truvia|swerve)/i,
      options: [
        {
          name: 'Allulose (Pure Rare Sugar)',
          ratio: '1:1 with regular sugar, or 1.25:1 with erythritol',
          textureImpact: 'Freezing science champion! Depresses freezing point identical to table sugar without crystallizing into hard icy grit.',
          macroDelta: '0 net carbs, <1 kcal/tsp (zero glycemic impact, not absorbed as carbohydrate).',
          spinTip: 'Spins smoother, softer, and more scoopable straight from the freezer than any other zero-calorie sweetener.',
          proTip: 'Unlike erythritol, allulose does NOT form crunchy "cooling" crystals when held below 0°F.'
        },
        {
          name: 'Monk Fruit / Erythritol Blend (Lakanto)',
          ratio: '1:1 replacement for table sugar',
          textureImpact: 'Clean, neutral sweetness profile. Freezes harder than sugar/allulose, so always pair with a stabilizer.',
          macroDelta: '0 calories, 0 net carbs.',
          spinTip: 'Give pint a 60-second hot water bath around the sides to prevent outer icy ring.',
          proTip: 'If the texture looks powdery like snow after the initial spin, run the pint sides under warm water for 60 seconds and hit Respin!'
        },
        {
          name: 'Pure Maple Syrup or Raw Honey',
          ratio: '2 tbsp (30g to 40g) per 16 oz pint',
          textureImpact: 'Natural inverted sugars keep ice crystals microscopic; delivers a glossy sheen and luxurious authentic gelato mouthfeel.',
          macroDelta: '+100–120 kcal, +28g natural unrefined carbohydrates.',
          spinTip: 'Spins beautifully on Ice Cream or Gelato setting.',
          proTip: 'Outstanding choice for whole-food, unrefined clean-eating recipes where non-nutritive sweeteners are avoided.'
        }
      ]
    },
    {
      id: 'nut_butters',
      categoryLabel: 'Nut Butters & Powders',
      roleDescription: 'Delivers roasted nutty aromatics and natural emulsifying fats that lubricate blade shearing.',
      pattern: /(?:peanut butter|pb2|pb fit|powdered peanut|almond butter|cashew butter|sunbutter)/i,
      options: [
        {
          name: 'Powdered Peanut Butter (PB2 / PB Fit)',
          ratio: '2 tbsp regular PB → 2 tbsp PB2 + 1.5 tbsp water or milk',
          textureImpact: 'Slashes ~85% of fat while preserving rich roasted peanut taste; slightly less dense fat-coating.',
          macroDelta: 'Slashes ~130 kcal and -13g fat; adds +1g protein per 2 tbsp!',
          spinTip: 'Whisk PB2 with warm liquid before freezing so powder fully hydrates.',
          proTip: 'Pair with 1/4 tsp xanthan or pudding mix to replenish the mouthfeel lost from stripping out the peanut oil.'
        },
        {
          name: 'Real Creamy Peanut Butter (Jif / Natural PB)',
          ratio: '2 tbsp PB2 → 1 tbsp Real PB',
          textureImpact: 'Decadent, rich mouthfeel; natural peanut oils lubricate the Creami dual-drive blades for gelato consistency.',
          macroDelta: '+75–90 kcal, +8g healthy mono/polyunsaturated fats.',
          spinTip: 'Microwave peanut butter for 10s so it whisks smoothly into the cold liquid base.',
          proTip: 'Or warm it up and drizzle down the core hole during the Mix-In cycle for frozen peanut butter ribbons!'
        },
        {
          name: 'Sunflower Seed Butter (SunButter - Nut-Free)',
          ratio: '1:1 direct swap for peanut or almond butter',
          textureImpact: 'Creamy, rich viscosity; 100% allergy-friendly for school lunches or tree nut allergies.',
          macroDelta: 'Comparable calories and fat (within ±10 kcal).',
          spinTip: 'Blends seamlessly into base or mix-in channel.',
          proTip: 'Delivers deep roasted nutty richness with zero peanut or tree nut allergens.'
        }
      ]
    },
    {
      id: 'cocoa_chocolate',
      categoryLabel: 'Cocoa & Chocolate',
      roleDescription: 'Adds chocolate flavor and starch solids. Alkalization dictates bitterness, acidity, and color depth.',
      pattern: /(?:cocoa|cacao|chocolate powder|dutch process|black cocoa)/i,
      options: [
        {
          name: 'Black Cocoa Powder (The Oreo Cookie Secret)',
          ratio: '1:1 swap with regular cocoa (or 50/50 blend)',
          textureImpact: 'Ultra-alkalized with near-zero acidity; gives unmistakable authentic Nabisco Oreo wafer flavor and midnight jet-black color.',
          macroDelta: 'Virtually identical calories (~15 kcal/tbsp), rich in prebiotic cocoa solids.',
          spinTip: 'Whisk thoroughly with warm liquid before freezing.',
          proTip: 'This is the exact secret ingredient used in commercial cookies & cream ice cream.'
        },
        {
          name: 'Dutch-Process Cocoa Powder (Hershey Special Dark / Guittard)',
          ratio: '1:1 replacement for natural cocoa or cacao',
          textureImpact: 'Alkali-treated to eliminate sourness; dissolves smoother in dairy with zero gritty sediment.',
          macroDelta: 'Identical macros.',
          spinTip: 'Lite Ice Cream cycle.',
          proTip: 'Significantly preferred over natural un-Dutched cocoa powder, which can taste sour and sharp when frozen.'
        }
      ]
    },
    {
      id: 'creams_yogurts',
      categoryLabel: 'Creams, Yogurts & Dairy Fats',
      roleDescription: 'Provides creaminess, emulsified fat globules, and palate coating to temper sub-zero chill.',
      pattern: /(?:heavy cream|whipping cream|half and half|greek yogurt|cottage cheese|cream cheese|coconut cream)/i,
      options: [
        {
          name: '0% Nonfat Plain Greek Yogurt (Fage / Chobani)',
          ratio: '1:1 replacement for heavy cream or full-fat yogurt',
          textureImpact: 'Massive protein boost with thick tangy richness; creates a frozen yogurt or tart gelato body.',
          macroDelta: 'Slashes ~80 kcal per 1/4 cup; +6g protein, -11g fat!',
          spinTip: '1 spin on Lite Ice Cream + 1 Respin for maximum fluffy volume.',
          proTip: 'Lactic cultures add gourmet tartness that elevates fruit, strawberry, and cheesecake bases.'
        },
        {
          name: 'Canned Full-Fat Coconut Milk / Coconut Cream',
          ratio: '1:1 replacement for dairy cream',
          textureImpact: 'Plant-based medium-chain triglycerides (MCTs) yield dense, silky scoopability rivaling dairy cream.',
          macroDelta: '+30 kcal, healthy plant fats, 100% lactose-free and vegan.',
          spinTip: 'Shake can vigorously or warm gently so fat cap emulsifies into liquid before freezing.',
          proTip: 'Pairs divinely with chocolate, pineapple, mango, or matcha green tea flavors.'
        }
      ]
    },
    {
      id: 'mixins_cookies',
      categoryLabel: 'Mix-Ins & Cookies',
      roleDescription: 'Folded in after base spinning to create textural contrast without dulling the blades.',
      pattern: /(?:oreo|cookie|chips|chocolate chip|graham cracker|cereal|pretzels)/i,
      options: [
        {
          name: 'Mini Semi-Sweet Chocolate Chips',
          ratio: '1:1 swap with regular standard-size chips',
          textureImpact: 'Game changer! Regular chips freeze rock-hard like pebbles; mini chips shatter into pleasant stracciatella flakes.',
          macroDelta: 'Identical macros (saves calories by dispersing more chocolate bites per gram).',
          spinTip: 'Dedicated Mix-In button ONLY. Never use Respin when mix-ins are inside the container.',
          proTip: 'Chill or freeze your mini chips before dropping into the core hole so they stay crisp.'
        },
        {
          name: 'Oreo Thins (or High-Protein Sandwich Cookies)',
          ratio: '2 standard Oreos → 3 Oreo Thins (or 1 Protein Cookie)',
          textureImpact: 'Higher wafer-to-creme ratio means crispier cookie bits distributed evenly without greasy fat pockets.',
          macroDelta: '-40 kcal, -3g fat per serving (or +10g protein with protein cookies).',
          spinTip: 'Spoon out a 1.5-inch wide hole down to the bottom of the spun pint before adding cookies.',
          proTip: 'For soft doughy cookie bits, let pint rest for 2 minutes after spinning before eating.'
        },
        {
          name: 'High-Protein Cereal (Magic Spoon / Ghost / Premier)',
          ratio: '15g to 20g mix-in',
          textureImpact: 'Addictive crunch and nostalgic milk-and-cereal crunch with near-zero sugar.',
          macroDelta: '+60 kcal, +7g protein, <1g sugar.',
          spinTip: 'Use Mix-In cycle.',
          proTip: 'Add half to the core hole for spinning, and sprinkle the rest on top as a crunchy garnish!'
        }
      ]
    },
    {
      id: 'fruit_purees',
      categoryLabel: 'Fruit & Purees',
      roleDescription: 'Provides natural sweetness, high water volume, and fruit pectins that bind into sorbet consistency.',
      pattern: /(?:banana|pumpkin|apple sauce|puree|mango|strawberry|blueberries|berries|fruit)/i,
      options: [
        {
          name: '100% Pure Canned Pumpkin Puree (Libby\'s)',
          ratio: '1 medium banana (100g) → 100g canned pumpkin puree',
          textureImpact: 'The ultimate volume cheat! Natural pectin gives velvety custard thickness identical to frozen banana with zero banana flavor when sweetened.',
          macroDelta: 'Slashes ~65–70 kcal! Banana is ~90 kcal vs Pumpkin ~25 kcal (-15g net carbs).',
          spinTip: 'Process on Lite Ice Cream cycle.',
          proTip: 'Add 1/2 tsp pumpkin pie spice or cinnamon, and vanilla sweetener—tastes like pumpkin cheesecake!'
        },
        {
          name: 'Frozen Wild Blueberries or Strawberries',
          ratio: '1:1 fruit swap',
          textureImpact: 'High skin-to-pulp ratio yields jewel-toned sorbets with vibrant natural tartness.',
          macroDelta: '-30 kcal compared to tropical fruits (mango/banana), packed with antioxidant anthocyanins.',
          spinTip: 'Sorbet cycle. Warm outer rim for 60s or run a Respin for smooth cutting.',
          proTip: 'Microwave frozen berries for 15 seconds to release natural juices before blending base.'
        },
        {
          name: 'Unsweetened Applesauce',
          ratio: '1:1 swap for pureed banana or pumpkin',
          textureImpact: 'Mild, clean sweetness with soluble pectin that binds water into smooth gelato body.',
          macroDelta: 'Slashes ~40 kcal compared to banana.',
          spinTip: 'Lite Ice Cream or Sorbet cycle.',
          proTip: 'Infuse with cinnamon and nutmeg for an autumn apple pie gelato.'
        }
      ]
    },
    {
      id: 'extracts_flavorings',
      categoryLabel: 'Extracts & Flavorings',
      roleDescription: 'Volatile aromatic compounds. Freezing subdues sweetness and flavor notes by ~20%, demanding potent carriers.',
      pattern: /(?:vanilla extract|flavoring|extract|emulsion|cake batter)/i,
      options: [
        {
          name: 'Vanilla Bean Paste',
          ratio: '1:1 tsp swap with vanilla extract',
          textureImpact: 'Suspended real vanilla caviar specks give artisanal gelato presentation and rich non-alcoholic flavor.',
          macroDelta: 'Negligible (±2 kcal).',
          spinTip: 'Whisk into base liquid before freezing.',
          proTip: 'Vanilla bean paste withstands freezing temperatures far better than alcohol-based extracts without losing aroma.'
        },
        {
          name: 'Cake Batter or Butter Extract',
          ratio: '1/2 tsp in place of 1 tsp vanilla',
          textureImpact: 'Creates the psychological perception of high butterfat richness with zero added fat.',
          macroDelta: '0 calories, 0g fat.',
          spinTip: 'Blends into any sweet base.',
          proTip: 'Start with 1/4 tsp—concentrated extracts are potent!'
        }
      ]
    }
  ];

  function isSubstituteInPantry(subName) {
    if (!subName) return false;
    const clean = sanitizeShoppingItemName(subName).toLowerCase();
    if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
      const match = INGREDIENTS_MASTER.find(i => {
        const iClean = i.name.toLowerCase();
        return iClean === clean || clean.includes(iClean) || iClean.includes(clean);
      });
      if (match && pantryState.has(match.id)) return true;
    }
    const slug = clean.replace(/[^a-z0-9]+/g, '_').trim();
    if (pantryState.has(slug)) return true;
    return false;
  }

  function getSwapsForIngredient(ing) {
    if (!ing) return null;
    const name = (ing.name || '').trim();
    const notes = (ing.notes || '').trim();
    const clean = sanitizeShoppingItemName(name);

    // 1. Search CREAMI_SWAPS_DATABASE by regex matching against name or notes
    let matchedGroup = null;
    for (const group of CREAMI_SWAPS_DATABASE) {
      if (group.pattern.test(clean) || group.pattern.test(name) || (ing.id && group.pattern.test(ing.id))) {
        matchedGroup = group;
        break;
      }
    }

    // Check if author notes have an explicit substitution
    const authorSub = extractSubstitution(notes);

    if (matchedGroup) {
      // Clone group options to avoid mutating original
      const options = [...matchedGroup.options];
      
      // If author notes contain a specific sub not yet present, insert it at top!
      if (authorSub && !options.some(o => o.name.toLowerCase().includes(authorSub.toLowerCase()))) {
        options.unshift({
          name: authorSub,
          ratio: 'Author-recommended in recipe notes',
          textureImpact: 'Tested by recipe creator specifically for this formula.',
          macroDelta: 'Depends on brand used.',
          spinTip: 'Follow standard recipe spin cycle.',
          proTip: `Recipe note: "${notes}"`
        });
      }

      return {
        categoryLabel: matchedGroup.categoryLabel,
        roleDescription: matchedGroup.roleDescription,
        options: options
      };
    }

    // 2. If no database category matched, but recipe notes has an author substitution:
    if (authorSub) {
      return {
        categoryLabel: 'Author Recipe Substitution',
        roleDescription: 'Component tailored by the creator for this Ninja Creami recipe formula.',
        options: [
          {
            name: authorSub,
            ratio: 'Author-recommended in recipe notes',
            textureImpact: 'Calibrated by author for optimal pint consistency.',
            macroDelta: 'Varies by selected brand.',
            spinTip: 'Process according to recipe instructions.',
            proTip: `Recipe note: "${notes}"`
          }
        ]
      };
    }

    return null;
  }

  function openSwapInspector(ing, recipe) {
    if (!ing || !recipe) return;
    const cleanName = sanitizeShoppingItemName(ing.name);
    const swapData = getSwapsForIngredient(ing);
    if (!swapData || swapData.options.length === 0) {
      showToast(`No specific substitutions registered for "${cleanName}".`);
      return;
    }

    currentSwapContext = { ing, recipe, swapData };
    const activeSwap = (recipe.id && activeRecipeSwaps[recipe.id]) ? activeRecipeSwaps[recipe.id][cleanName] : null;

    // Populate Focus Card
    if (swapFocusCard) {
      swapFocusCard.innerHTML = `
        <div class="swap-focus-top">
          <div class="swap-focus-name">${escapeHtml(cleanName)}</div>
          <span class="swap-focus-category">${escapeHtml(swapData.categoryLabel)}</span>
        </div>
        <div class="swap-focus-role">${escapeHtml(swapData.roleDescription)}</div>
        ${activeSwap ? `
          <div class="swap-active-callout">
            <div><strong>Applied:</strong> Currently swapped with <em>${escapeHtml(activeSwap.name)}</em> (${escapeHtml(activeSwap.ratio)})</div>
            <button type="button" class="btn-reset-swap" id="btnFocusResetSwap">↩️ Revert to Original</button>
          </div>
        ` : ''}
      `;

      const resetBtn = swapFocusCard.querySelector('#btnFocusResetSwap');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          resetSwap(cleanName, recipe);
          openSwapInspector(ing, recipe);
        });
      }
    }

    // Populate Options List
    if (swapOptionsList) {
      swapOptionsList.innerHTML = swapData.options.map((opt, idx) => {
        const inPantry = isSubstituteInPantry(opt.name);
        const isCurrentActive = Boolean(activeSwap && activeSwap.name.toLowerCase() === opt.name.toLowerCase());
        return `
          <div class="swap-card ${isCurrentActive ? 'is-active-swap' : ''}">
            <div class="swap-card-top">
              <div class="swap-card-title-group">
                <div class="swap-card-title">${opt.name}</div>
                <div class="swap-card-badges">
                  <span class="swap-ratio-badge">⚖️ ${opt.ratio}</span>
                  ${inPantry ? '<span class="swap-pantry-badge">✓ In Your Pantry</span>' : ''}
                  ${isCurrentActive ? '<span class="swap-ratio-badge" style="background: rgba(168, 85, 247, 0.2); border-color: #a855f7; color: #e9d5ff;">★ Currently Applied</span>' : ''}
                </div>
              </div>
            </div>

            <div class="swap-details-grid">
              <div class="swap-detail-item">
                <span style="font-size: 1.1rem;">🍦</span>
                <div><strong>Texture Impact:</strong> ${opt.textureImpact}</div>
              </div>
              <div class="swap-detail-item">
                <span style="font-size: 1.1rem;">🔥</span>
                <div><strong>Macro Delta:</strong> ${opt.macroDelta}</div>
              </div>
              <div class="swap-detail-item">
                <span style="font-size: 1.1rem;">🌀</span>
                <div><strong>Spin Tip:</strong> ${opt.spinTip}</div>
              </div>
            </div>

            ${opt.proTip ? `
              <div class="swap-pro-note">
                <strong>💡 Pro Tip:</strong> ${opt.proTip}
              </div>
            ` : ''}

            <div class="swap-card-footer">
              ${isCurrentActive ? `
                <button type="button" class="btn-reset-swap" data-action="reset-swap">↩️ Revert to Original</button>
              ` : `
                <button type="button" class="btn-apply-swap" data-action="apply-swap" data-opt-idx="${idx}">
                  <span>🔄 Apply This Swap</span>
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');

      // Wire apply and reset buttons
      swapOptionsList.querySelectorAll('[data-action="apply-swap"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.optIdx, 10);
          const selectedSwap = swapData.options[idx];
          if (selectedSwap) {
            applySwap(cleanName, selectedSwap, recipe);
            openSwapInspector(ing, recipe);
          }
        });
      });

      swapOptionsList.querySelectorAll('[data-action="reset-swap"]').forEach(btn => {
        btn.addEventListener('click', () => {
          resetSwap(cleanName, recipe);
          openSwapInspector(ing, recipe);
        });
      });
    }

    if (swapModalOverlay) {
      swapModalOverlay.classList.add('active');
      swapModalOverlay.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
    }
  }

  function closeSwapInspector() {
    if (swapModalOverlay) {
      swapModalOverlay.classList.remove('active');
      swapModalOverlay.setAttribute('aria-hidden', 'true');
    }
    unlockBackgroundScroll();
    currentSwapContext = null;
  }

  function applySwap(originalName, swapObj, recipe) {
    if (!recipe || !originalName || !swapObj) return;
    if (!activeRecipeSwaps[recipe.id]) {
      activeRecipeSwaps[recipe.id] = {};
    }
    activeRecipeSwaps[recipe.id][originalName] = swapObj;
    saveActiveSwaps();

    // Auto-draft note in personal tasting notes if not already noted
    const swapTag = `[Substituted ${originalName} → ${swapObj.name}]`;
    if (!userRecipeData[recipe.id]) {
      userRecipeData[recipe.id] = { rating: 0, notes: '' };
    }
    if (!userRecipeData[recipe.id].notes.includes(swapTag)) {
      userRecipeData[recipe.id].notes = (userRecipeData[recipe.id].notes ? userRecipeData[recipe.id].notes + '\n' : '') + swapTag;
      saveUserRecipeData();
    }

    renderRecipeModalContent(recipe);
    renderRecipes();
    showToast(`🔄 Applied swap: "${swapObj.name}"!`);
  }

  function resetSwap(originalName, recipe) {
    if (!recipe || !originalName) return;
    if (activeRecipeSwaps[recipe.id] && activeRecipeSwaps[recipe.id][originalName]) {
      delete activeRecipeSwaps[recipe.id][originalName];
      if (Object.keys(activeRecipeSwaps[recipe.id]).length === 0) {
        delete activeRecipeSwaps[recipe.id];
      }
      saveActiveSwaps();
    }
    renderRecipeModalContent(recipe);
    renderRecipes();
    showToast(`↩️ Reverted "${originalName}" to original.`);
  }

  function formatProTip(rawTip) {
    if (!rawTip || typeof rawTip !== 'string') return { title: 'Author Pro Tip', body: '' };
    const text = rawTip.trim();
    if (!text) return { title: 'Author Pro Tip', body: '' };

    let title = 'Author Pro Tip';
    let body = text;

    const hackMatch = text.match(/^(THE (?:CHOCOLATE CHIP|PEANUT BUTTER SWIRL|WHITE CHOCOLATE SWIRL) HACK)\s+(.*)$/i);
    if (hackMatch) {
      title = toTitleCase(hackMatch[1]);
      body = hackMatch[2];
    } else {
      const oreoMatch = text.match(/^REMOVE THE CREAM FROM YOUR OREOS\s+(.*)$/i);
      if (oreoMatch) {
        title = 'Remove the Cream from Your Oreos';
        body = oreoMatch[1];
      } else if (text.toUpperCase().includes('FREEZE YOUR COOKIE DOUGH')) {
        title = 'Freeze Your Mix-In Bites';
        body = text;
      } else if (text.toUpperCase().includes('TOAST YOUR MARSHMALLOWS')) {
        title = 'Toast Your Marshmallows';
        body = text;
      }
    }

    return {
      title: title,
      body: cleanSentenceText(body)
    };
  }

  function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1));
  }

  function cleanSentenceText(str) {
    if (!str) return '';
    const parts = str.trim().split(/(\. |\? |\! )/);
    const out = [];
    for (let i = 0; i < parts.length; i += 2) {
      let chunk = parts[i].trim();
      if (chunk) {
        chunk = chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase();
        chunk = chunk.replace(/\b(\d+)\s*g\b/gi, '$1g');
        chunk = chunk.replace(/\b(\d+)\s*sec\b/gi, '$1 sec');
        chunk = chunk.replace(/\bvs\b/gi, 'vs');
        chunk = chunk.replace(/\boreos?\b/gi, m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
        chunk = chunk.replace(/\bmix-in\b/gi, 'Mix-In');
        chunk = chunk.replace(/\bmix-ins\b/gi, 'Mix-Ins');
      }
      const sep = parts[i + 1] || '';
      out.push(chunk + sep);
    }
    return out.join('');
  }

  // --- Recipe Detail Modal ---
  function openRecipeModal(recipe, isRoulettePick = false, updateHistory = true) {
    if (!recipe) return;
    if (isRecipeCreatorDisabled(recipe)) {
      showToast('⚠️ This recipe is currently unavailable because the creator has been disabled.');
      return;
    }
    currentModalRecipe = recipe;
    isCurrentModalRoulette = Boolean(isRoulettePick);
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerRunning = false;
    timerSecondsLeft = 60;

    renderRecipeModalContent(recipe);

    // Reset modal scroll position to top every time a recipe opens
    const modalContent = recipeModalOverlay.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTop = 0;
      requestAnimationFrame(() => {
        modalContent.scrollTop = 0;
      });
    }
    if (recipeModalBody) recipeModalBody.scrollTop = 0;
    recipeModalOverlay.scrollTop = 0;

    recipeModalOverlay.classList.add('active');
    recipeModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();

    // Sync browser URL with recipe deep-link
    if (updateHistory && recipe && recipe.id && !recipe.isSharedPortable) {
      const targetPath = (IS_BETA ? '/beta' : '') + `/recipe/${encodeURIComponent(recipe.id)}`;
      if (window.location.pathname !== targetPath || !history.state || history.state.modal !== 'recipe') {
        try {
          history.pushState({ modal: 'recipe', recipeId: recipe.id }, '', targetPath);
        } catch (e) {}
      }
      document.title = `${recipe.name} — Creami Cravings`;
    }

    if (recipe) {
      trackAnalyticsEvent('view_item', {
        item_id: recipe.id,
        item_name: recipe.title || recipe.name,
        item_category: recipe.category,
        is_roulette: Boolean(isRoulettePick)
      });
    }
  }

  function renderRecipeModalContent(recipe) {
    const match = computeRecipeMatch(recipe);
    const catClass = getCategoryClass(recipe.category);
    const isFav = favoritesState.has(recipe.id);
    const isAccessible = isRecipeAccessible(recipe);
    const requiredTier = getRecipeRequiredTier(recipe);
    const accessibleCategories = getAccessibleRecipeCategories(recipe);

    const baseIngs = (recipe.ingredients || []).filter(i => !i.isMixin);
    const mixinIngs = (recipe.ingredients || []).filter(i => i.isMixin);

    const userFeedback = userRecipeData[recipe.id] || { rating: 0, notes: '' };
    const userMade = recipeMadeCounts[recipe.id] || 0;
    const commMade = communityStats.madeCounts[recipe.id] || 0;
    const commRating = communityStats.ratings[recipe.id];
    const hasCommRating = Boolean(commRating && commRating.count > 0);
    const commAvg = hasCommRating ? commRating.avg : 0;
    const commCount = hasCommRating ? commRating.count : 0;
    const commDist = (commRating && commRating.distribution) ? commRating.distribution : {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    const isPersonal = Boolean(recipe.category === 'Custom' || recipe.isPersonal);
    const pintsInFreezer = freezerPintsState.filter(p => p.recipeId === recipe.id || p.recipeName.toLowerCase() === recipe.name.toLowerCase());

    recipeModalBody.innerHTML = `
      ${isCurrentModalRoulette ? `
        <div class="roulette-winner-banner">
          <div class="roulette-winner-text">
            <span>🎰</span>
            <span>Creami Roulette Pick: <strong>${escapeHtml(recipe.name)}</strong></span>
          </div>
          <button class="btn-modal-spin-again" id="modalSpinAgainBtn">🎲 Spin Again</button>
        </div>
      ` : ''}

      ${recipe.isSharedPortable ? `
        <div class="shared-recipe-portable-banner">
          <div>
            <div class="shared-banner-title">
              <span>🍧</span> <span>Shared Custom Creation</span>
            </div>
            <div class="shared-banner-byline">
              Crafted by <strong>${escapeHtml(recipe.sharedAuthor || 'A Creami Chef')}</strong> with Build-A-Pint.
            </div>
          </div>
          <button type="button" class="btn-save-shared-recipe" id="btnTopSaveSharedRecipe">
            <span>📥 Save to My Recipes</span>
          </button>
        </div>
      ` : ''}

      <div class="modal-header">
        <div class="modal-meta-row">
          ${recipe.isSharedPortable ? `<span class="book-tag" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: rgba(139, 92, 246, 0.4);">🍧 Shared by ${escapeHtml(recipe.sharedAuthor || 'A Friend')}</span>` : (isPersonal ? `<span class="book-tag custom">🔒 Personal Recipe</span>` : accessibleCategories.map(cat => {
            return `<span class="book-tag ${getCategoryClass(cat)}">${cat}</span>`;
          }).join(''))}
          ${!isAccessible ? `<span class="locked-badge" title="Exclusive ${requiredTier} tier recipe pack">🔒 ${requiredTier} Pack</span>` : ''}
          ${recipe.creaminessScore ? `<span class="book-tag" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #34d399;">🧪 Creaminess: ${recipe.creaminessScore}/10 (${recipe.creaminessGrade || 'Balanced'})</span>` : ''}
          <span class="book-tag">🌀 ${recipe.spinSetting || 'Lite Ice Cream'}</span>
          <span class="book-tag">⏱️ Prep: ${recipe.prepTime || '2 min'}</span>
          <span class="book-tag">❄️ Freeze: ${recipe.freezeTime || '16+ hrs'}</span>
          <button class="btn-modal-meta-share" id="modalMetaShareBtn" title="Share recipe link">
            <span>🔗 Share</span>
          </button>
          <button class="btn-modal-meta-share btn-story-card-share" id="modalStoryCardBtn" title="Generate Instagram / TikTok Story Pint Card">
            <span>🎨 Story Card</span>
          </button>
        </div>
        <h2 class="modal-title">${escapeHtml(recipe.name)}</h2>
        <p class="modal-subtitle">${recipe.isSharedPortable ? `Custom formulation shared by ${escapeHtml(recipe.sharedAuthor || 'a fellow Creami creator')}.` : (isPersonal ? '🔒 Private personal recipe tied only to your account.' : 'Official Creami Cravings recipe for Ninja Creami ice cream maker.')}</p>
        ${(!currentUser && !recipe.isSharedPortable) ? `
          <div class="guest-pantry-conversion-card">
            <div class="guest-pantry-icon">✨</div>
            <div class="guest-pantry-content">
              <div class="guest-pantry-title">Have these ingredients at home?</div>
              <div class="guest-pantry-desc">Check off what's in your kitchen to discover every Ninja Creami recipe you can spin right now!</div>
            </div>
            <button class="btn-guest-pantry-cta" id="btnGuestOpenPantry">
              🥫 Match My Pantry
            </button>
          </div>
        ` : ''}
        ${(recipe.sources && recipe.sources.length > 1 && accessibleCategories.length > 1) ? `
          <div class="multi-book-banner">
            <span>📚</span>
            <span>Featured in <strong>${accessibleCategories.length} Creami books:</strong> ${accessibleCategories.join(' • ')}</span>
          </div>
        ` : ''}
      </div>

      ${(() => {
        const creator = getRecipeCreator(recipe);
        const book = getRecipeBook(recipe);
        if (!creator || !book) return '';
        const pageNum = recipe.sourcePage || (recipe.sources && recipe.sources[0]?.sourcePage);
        const hasAccess = isRecipeAccessible(recipe) || isCategoryUnlocked(book.bookKey) || isCategoryUnlocked(book.categoryKey) || isCategoryUnlocked('All-Access');
        return `
          <div class="creator-attribution-card">
            <div class="creator-attribution-left">
              <div class="creator-attribution-icon">📖</div>
              <div class="creator-attribution-details">
                <div class="creator-attribution-title">
                  From <strong>${book.shortTitle || book.title}</strong>${pageNum ? `<span class="creator-book-page">(Page ${pageNum})</span>` : ''}
                </div>
                <div class="creator-attribution-byline">by <strong>${creator.name}</strong> • ${creator.brandName}</div>
              </div>
            </div>
            <div class="creator-attribution-actions">
              ${hasAccess ? `
                <span class="creator-book-owned-badge" title="Unlocked and active in your library">
                  <span>✅ Active in Library</span>
                </span>
              ` : `
                <span class="creator-book-locked-pill" title="Exclusive ${book.shortTitle || book.title} Pack">
                  <span>🔒 ${book.shortTitle || book.title}</span>
                </span>
              `}
            </div>
          </div>
        `;
      })()}

      ${(() => {
        const creator = getRecipeCreator(recipe);
        if (recipe.videoUrl) {
          return `
            <div class="recipe-modal-video-card">
              <div class="video-card-left">
                <span class="video-card-icon">🎬</span>
                <div class="video-card-details">
                  <div class="video-card-title">Creator Video Tutorial Available</div>
                  <div class="video-card-sub">Watch ${creator ? creator.name : 'the creator'} spin and review this pint on Instagram</div>
                </div>
              </div>
              <a href="${recipe.videoUrl}" target="_blank" rel="noopener noreferrer" class="btn-watch-creator-video" aria-label="Watch ${escapeHtml(recipe.name)} video reel by ${creator ? creator.name : 'creator'}" onclick="trackAnalyticsEvent('click_creator_video', { recipe_id: '${recipe.id}', recipe_name: '${escapeHtml(recipe.name)}', creator: '${creator ? escapeHtml(creator.name) : 'unknown'}', video_url: '${recipe.videoUrl}' });">
                <span>▶️ Watch Reel ↗</span>
              </a>
            </div>
          `;
        }
        return '';
      })()}

      ${(pintsInFreezer.length > 0 && isAccessible) ? (() => {
        const hasReady = pintsInFreezer.some(p => computePintStatus(p).isReady);
        const topPint = pintsInFreezer[0];
        const topStatus = computePintStatus(topPint);
        return `
          <div class="recipe-modal-freezer-banner ${hasReady ? 'ready' : ''}">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.25rem;">${hasReady ? '🎉' : '🧊'}</span>
              <div>
                <strong>${hasReady ? 'Ready to Spin!' : 'Chilling in Freezer:'}</strong>
                <span>${topStatus.isReady ? 'Frozen solid & ready to spin right now! 🍨' : `${topStatus.timeRemainingLabel} until 16-hr freeze complete`} (${pintsInFreezer.length} pint${pintsInFreezer.length === 1 ? '' : 's'})</span>
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              ${hasReady ? `
                <button class="btn-spin-enjoyed" id="modalQuickSpinBtn" data-pint-id="${topPint.id}" style="font-size: 0.78rem; padding: 5px 12px; white-space: nowrap;">
                  🍨 Spin &amp; Enjoy (+1)
                </button>
              ` : ''}
              <button class="btn-freezer-recipe" id="modalViewInFreezerBtn" style="font-size: 0.78rem; padding: 5px 12px; white-space: nowrap;">
                🧊 Open Freezer
              </button>
            </div>
          </div>
        `;
      })() : ''}

      <!-- Scaling & Unit Mode Selector -->
      <div class="modal-options-bar">
        <div class="modal-option-cluster">
          <span class="modal-option-label">Pint Size:</span>
          <div class="segment-btn-group" id="modalScaleGroup">
            <button class="segment-btn ${modalScale === 1.0 ? 'active' : ''}" data-scale="1.0">Standard 16 oz (1×)</button>
            <button class="segment-btn ${modalScale === 1.5 ? 'active' : ''}" data-scale="1.5">Deluxe 24 oz (1.5×)</button>
          </div>
        </div>

        <div class="modal-option-cluster">
          <span class="modal-option-label">Units:</span>
          <div class="segment-btn-group" id="modalUnitGroup">
            <button class="segment-btn ${modalUnitMode === 'metric' ? 'active' : ''}" data-unit="metric">Metric (g/ml)</button>
            <button class="segment-btn ${modalUnitMode === 'spoons' ? 'active' : ''}" data-unit="spoons">US / Spoons</button>
          </div>
        </div>
      </div>

      ${modalScale === 1.5 ? `
        <div class="deluxe-active-banner">
          <span>✨</span>
          <div><strong>Ninja Creami Deluxe (24 oz) Active:</strong> All quantities and nutrition facts are automatically scaled +50% for the larger Deluxe container.</div>
        </div>
      ` : ''}

      <!-- Macro Grid (Dynamically Scaled) -->
      <div class="modal-macro-grid">
        <div class="modal-macro-item">
          <div class="macro-val" style="color: #f472b6;">${scaleMacroVal(recipe.macros.calories, modalScale) || '0'}</div>
          <div class="macro-lbl">Calories</div>
        </div>
        <div class="modal-macro-item">
          <div class="macro-val" style="color: #34d399;">${scaleMacroVal(recipe.macros.protein, modalScale) || '0g'}</div>
          <div class="macro-lbl">Protein</div>
        </div>
        <div class="modal-macro-item">
          <div class="macro-val" style="color: #fbbf24;">${scaleMacroVal(recipe.macros.carbs, modalScale) || '0g'}</div>
          <div class="macro-lbl">Net Carbs</div>
        </div>
        <div class="modal-macro-item">
          <div class="macro-val" style="color: #38bdf8;">${scaleMacroVal(recipe.macros.fat, modalScale) || '0g'}</div>
          <div class="macro-lbl">Fat</div>
        </div>
        <div class="modal-macro-item">
          <div class="macro-val">${scaleMacroVal(recipe.macros.sugar, modalScale) || '0g'}</div>
          <div class="macro-lbl">Sugar</div>
        </div>
        <div class="modal-macro-item">
          <div class="macro-val">${scaleMacroVal(recipe.macros.fiber, modalScale) || '0g'}</div>
          <div class="macro-lbl">Fiber</div>
        </div>
      </div>

      ${!isAccessible ? `
        <!-- Locked Recipe Teaser Card (Roadmap Item 15) -->
        <div class="locked-recipe-teaser">
          <div class="locked-teaser-icon">🔒</div>
          <div class="locked-teaser-title">Exclusive ${requiredTier} Pack Recipe</div>
          <p class="locked-teaser-desc">
            This exclusive recipe is part of the <strong>${requiredTier} Collection</strong>. To unlock full secret ingredient ratios, step-by-step spin instructions, and author pro hacks, sign in with an authorized account or request pack access from your administrator.
          </p>
          <div class="locked-user-status">
            ${currentUser 
              ? `Signed in as <strong>${currentUser.email}</strong> • Active packs: <em>${(currentUser.subscriptions || ['Base Flavors']).join(', ')}</em>`
              : `Currently browsing as <strong>Guest</strong> (Standard Base Flavors tier)`}
          </div>
          <div class="locked-teaser-actions">
            ${(() => {
              const book = getRecipeBook(recipe);
              const creator = getRecipeCreator(recipe);
              const bookUrl = book ? book.url : 'https://fitnessproductfinder.com/collections/creami-cravings-recipe-books';
              const bookTitle = book ? (book.shortTitle || book.title) : `${requiredTier} E-Book`;
              const bookPrice = book ? book.price : '$27.99';
              const isClaimPending = userPendingClaimsState.has(requiredTier) || userPendingClaimsState.has('All-Access');
              return `
                <div class="locked-creator-store-box">
                  <a href="${bookUrl}" target="_blank" rel="noopener noreferrer" class="btn-creator-store-direct">
                    <span>📖 Buy ${bookTitle} (${bookPrice}) on Fitness Product Finder ↗</span>
                  </a>
                  <a href="https://fitnessproductfinder.com/products/complete-4-book-bundle" target="_blank" rel="noopener noreferrer" class="btn-creator-bundle-direct">
                    <span>✨ Get All 4 E-Books for $49.99 ($112 Value) ↗</span>
                  </a>
                  ${isClaimPending ? `
                    <div class="claim-pending-indicator-card">
                      <span class="claim-pending-icon">⏳</span>
                      <div class="claim-pending-text-wrap">
                        <strong>Access Request Under Review</strong>
                        <p>Your purchase verification claim for the <strong>${requiredTier}</strong> e-book is pending admin approval. You will receive access once verified!</p>
                      </div>
                    </div>
                  ` : `
                    <a href="#" class="btn-pack-own-link" id="btnLockedAlreadyOwn">
                      Already own this book from ${creator ? creator.name : 'Eli'}? Claim access here &rarr;
                    </a>
                  `}
                </div>
              `;
            })()}
            ${!currentUser ? `
              <button class="btn-primary" id="btnLockedSignIn">
                <span>🔑 Sign In to Unlock</span>
              </button>
            ` : `
              <button class="btn-primary" id="btnLockedRequestAccess">
                <span>✉️ Request ${requiredTier} Pack Access</span>
              </button>
              ${currentUser.role === 'admin' ? '' : `
                <button class="btn-secondary" id="btnLockedContactAdmin">
                  <span>👑 Contact Admin</span>
                </button>
              `}
            `}
          </div>
        </div>
      ` : `
        <!-- 1-Tap Macro Clipboard Export (Roadmap Item 10) -->
        <div class="macro-export-container">
          <button class="btn-copy-macros" id="btnCopyMacros" title="Copy formatted macros for MyFitnessPal, MacroFactor, or Cronometer">
            <span>📋</span>
            <span id="copyMacrosBtnText">Copy Macros for Fitness Tracker</span>
          </button>
          <span class="macro-export-hint">✨ Formatted for MyFitnessPal &amp; MacroFactor (${modalScale === 1.5 ? '24 oz Deluxe' : '16 oz Standard'})</span>
        </div>

        <!-- Missing Items Callout -->
        <div class="missing-items-callout ${match.isReady ? 'all-ready' : 'has-missing'}">
          <span style="font-size: 1.3rem;">${match.isReady ? '🎉' : '🛒'}</span>
          <div style="flex: 1;">
            <strong>${match.isReady ? 'You have all ingredients ready!' : `Missing ${match.missing.length} item${match.missing.length > 1 ? 's' : ''}:`}</strong>
            <div class="missing-items-text">${match.isReady ? 'Blend up your base, freeze solid for 16-24 hrs, and get spinning!' : match.missing.map(m => sanitizeShoppingItemName(m.name)).join(', ')}</div>
            ${!match.isReady && match.missing.length > 0 ? `
              <button class="btn-add-all-missing" id="btnAddAllMissingBtn">🛒 Add All Missing to Grocery List</button>
            ` : ''}
          </div>
        </div>

        <!-- Base Ingredients List -->
        <h3 class="modal-section-title">🥣 Base Ingredients (${baseIngs.length})</h3>
        <div class="modal-ingredients-list">
          ${baseIngs.map(ing => renderModalIngredientRow(ing, recipe)).join('')}
        </div>

        <!-- Mix-Ins List -->
        ${mixinIngs.length > 0 ? `
          <h3 class="modal-section-title">🍫 Mix-Ins (${mixinIngs.length})</h3>
          <div class="modal-ingredients-list">
            ${mixinIngs.map(ing => renderModalIngredientRow(ing, recipe)).join('')}
          </div>
        ` : ''}

        <!-- Author Ingredient Discounts Callout -->
        ${(() => {
          const creator = getRecipeCreator(recipe);
          if (!creator || !creator.perks || creator.perks.length === 0) return '';
          return `
            <div class="recipe-creator-perks-callout">
              <span class="perks-callout-icon">🎁</span>
              <div class="perks-callout-body">
                <strong>${creator.name}'s Ingredient Discounts Available:</strong>
                <span>Get 15% off Lakanto Monk Fruit Sweetener (code <code>ELI15</code>) and 15% off Prime Bites &amp; FUUL (code <code>FPF</code>).</span>
              </div>
              <button type="button" class="btn-view-creator-perks" id="btnModalViewCreatorPerks" data-creator-id="${creator.id}">
                <span>View All Perks &amp; Codes ↗</span>
              </button>
            </div>
          `;
        })()}

        <!-- Step-by-Step Instructions -->
        <h3 class="modal-section-title">📝 Instructions</h3>
        <div class="modal-instructions-list">
          ${(recipe.instructions && recipe.instructions.length > 0) ? recipe.instructions.map((step, idx) => {
            const isDefrostStep = step.toUpperCase().includes('HOT WATER') || step.toUpperCase().includes('WARM WATER');
            return `
              <div class="modal-step-item">
                <span class="step-num-badge">${idx + 1}</span>
                <div style="flex: 1;">
                  <span class="step-text">${escapeHtml(step)}</span>
                  ${isDefrostStep ? `
                    <div class="step-timer-widget" id="defrostTimerWidget">
                      <div class="timer-display">
                        <span class="timer-icon">⏱️</span>
                        <span class="timer-countdown ${timerRunning ? 'pulsing' : ''}" id="timerSeconds">${timerSecondsLeft}s</span>
                        <span class="timer-label">Hot Water Bath</span>
                      </div>
                      <div class="timer-controls">
                        <button class="btn-timer-action ${timerRunning ? 'running' : (timerSecondsLeft === 0 ? 'done' : '')}" id="startTimerBtn">
                          ${timerRunning ? 'Pause' : (timerSecondsLeft === 0 ? 'Done! Spin Time ❄️' : (timerSecondsLeft === 60 ? 'Start 60s Timer' : 'Resume'))}
                        </button>
                        <button class="btn-timer-reset" id="resetTimerBtn" style="${timerSecondsLeft < 60 ? '' : 'display: none;'}">Reset</button>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('') : `
            <p style="color: var(--text-muted); font-size: 0.9rem;">1. Blend all base ingredients thoroughly and freeze pint for at least 16-24 hours.<br>2. Run outer pint under warm water for 60 seconds.<br>3. Spin on Lite Ice Cream cycle.<br>4. Add mix-ins and spin on Mix-In cycle.</p>
          `}
        </div>

        <!-- Official Author Pro Tip -->
        ${recipe.proTip ? (() => {
          const tipObj = formatProTip(recipe.proTip);
          return `
            <div class="official-protip-card">
              <div class="official-protip-header">
                <span class="protip-badge-pill">💡 Author Pro Tip</span>
                ${tipObj.title ? `<span class="protip-hack-title">${escapeHtml(tipObj.title)}</span>` : ''}
              </div>
              <div class="official-protip-text">${escapeHtml(tipObj.body)}</div>
            </div>
          `;
        })() : ''}

        <!-- Creami Machine & Mix-In Tips -->
        <div class="spin-troubleshooter-card">
          <div class="troubleshooter-header">
            <div class="troubleshooter-title">🌀 Ninja Creami Machine & Mix-In Tips</div>
          </div>
          <div class="troubleshooter-grid">
            <div class="trouble-item">
              <div class="trouble-q">🧊 Icy outer edges or ring?</div>
              <div class="trouble-a">Run the outer sides of your pint under warm tap water for 60 seconds before processing, or scrape sides with a butter knife before respinning.</div>
            </div>
            <div class="trouble-item">
              <div class="trouble-q">🍫 Adding Mix-Ins?</div>
              <div class="trouble-a">Always create a 1.5-inch wide hole down to the bottom of the ice cream with a spoon before adding mix-ins, then use the <strong>Mix-In</strong> button (never Respin).</div>
            </div>
          </div>
        <!-- Put in Freezer & Batch Prep Action Card (Beta Staging) -->
        <div class="recipe-freezer-action-card" style="margin-bottom: 16px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.4rem;">🧊</span>
            <div>
              <strong style="color: #f8fafc; font-size: 0.92rem; display: block;">Prep &amp; Chill this Pint</strong>
              <span style="color: #94a3b8; font-size: 0.78rem;">Place into a Virtual Freezer slot or queue for Sunday Batch Prep</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <div id="modalBatchPrepSlot" data-recipe-id="${recipe.id}">
              ${renderModalBatchPrepControlHtml(recipe.id, getRecipeBatchPrepCount(recipe.id))}
            </div>
            <button type="button" class="btn-freeze-slot-primary" id="modalPutInFreezerBtn" title="Place this recipe into an open freezer container slot">
              <span>❄️ Put in Freezer Slot</span>
            </button>
          </div>
        </div>

        <!-- Recipe Batch & Spin Counter Tracker -->
        <div class="recipe-batch-tracker-card">
          <div class="batch-tracker-header">
            <div class="batch-tracker-title">
              <span class="batch-tracker-icon">🍨</span>
              <span>Batch & Spin Counter</span>
            </div>
            ${!isPersonal ? `
              <div class="batch-community-pill" id="modalCommunityBatchesBadge" title="Total times this recipe has been spun across all Creami users">
                🔥 <span id="modalCommunityBatchesVal">${commMade}</span> community spin${commMade === 1 ? '' : 's'}
              </div>
            ` : `<div class="batch-community-pill" style="color: #c084fc; background: rgba(168, 85, 247, 0.14); border-color: rgba(168, 85, 247, 0.35);">🔒 Private to your account</div>`}
          </div>
          <div class="batch-counter-controls">
            <div class="batch-personal-display">
              <span class="batch-counter-label">You've made this:</span>
              <span class="batch-count-number" id="modalUserBatchCount">${userMade}</span>
              <span class="batch-times-label">${userMade === 1 ? 'time' : 'times'}</span>
            </div>
            <div class="batch-btn-group">
              <button class="btn-batch-action btn-batch-minus" id="btnBatchMinus" title="Subtract 1 batch" ${userMade === 0 ? 'disabled' : ''}>−</button>
              <button class="btn-batch-action btn-batch-plus" id="btnBatchPlus" title="Log a batch (+1 spin)">
                <span>+ Log Batch</span>
                <span class="batch-btn-subtext">+1 Made</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Overall Community Rating & Reviews System -->
        <div class="recipe-community-rating-card">
          ${!isPersonal ? (hasCommRating ? `
            <div class="community-rating-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-family: var(--font-heading); font-weight: 700; color: var(--text-main); font-size: 0.95rem;">⭐ Overall Community Rating</span>
              <span class="comm-badge" id="modalOverallScoreBadge" style="font-weight: 700; color: #fbbf24; background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.35); padding: 3px 8px; border-radius: 999px; font-size: 0.8rem;">★ ${commAvg.toFixed(1)} / 5.0</span>
            </div>

            <div class="community-rating-overview">
              <div class="comm-score-box">
                <div class="comm-score-big" id="modalCommBigScore">${commAvg.toFixed(1)}</div>
                <div class="comm-score-stars" id="modalCommStars">${'★'.repeat(Math.round(commAvg))}${'☆'.repeat(5 - Math.round(commAvg))}</div>
                <div class="comm-score-count" id="modalCommTotalReviews">${commCount} rating${commCount === 1 ? '' : 's'}</div>
              </div>
              <div class="comm-bars-box">
                ${[5, 4, 3, 2, 1].map(starNum => {
                  const c = commDist[starNum] || 0;
                  const pct = commCount > 0 ? Math.round((c / commCount) * 100) : 0;
                  return `
                    <div class="comm-bar-row">
                      <span class="comm-bar-star">${starNum}★</span>
                      <div class="comm-bar-track">
                        <div class="comm-bar-fill" style="width: ${pct}%;"></div>
                      </div>
                      <span class="comm-bar-pct">${c}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : `
            <div class="community-rating-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-family: var(--font-heading); font-weight: 700; color: var(--text-main); font-size: 0.95rem;">⭐ Overall Community Rating</span>
              <span class="comm-badge" id="modalOverallScoreBadge" style="font-weight: 600; color: var(--text-dim); background: var(--bg-glass); border: 1px solid var(--border-item); padding: 3px 8px; border-radius: 999px; font-size: 0.8rem;">No reviews yet</span>
            </div>
            <div style="padding: 12px 14px; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-item); border-radius: var(--radius-md); text-align: center; color: var(--text-dim); font-size: 0.88rem; margin-bottom: 16px;">
              🍦 No community ratings yet for this recipe. Rate it below to be the first!
            </div>
          `) : `
            <div class="community-rating-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-family: var(--font-heading); font-weight: 700; color: var(--text-main); font-size: 0.95rem;">⭐ My Tasting Score & Notes</span>
              <span class="comm-badge" style="color: #c084fc; background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.35); padding: 3px 8px; border-radius: 999px; font-size: 0.8rem;">🔒 Personal</span>
            </div>
          `}

          <div class="personal-rating-box">
            <div class="personal-rating-header">
              <strong>Your Rating & Tasting Notes:</strong>
              <span class="rating-save-status" id="ratingSaveStatus"></span>
            </div>
            <div class="rating-stars-row">
              <div class="star-rating" id="modalStarRating">
                ${[1, 2, 3, 4, 5].map(starNum => `
                  <span class="star ${(userFeedback.rating || 0) >= starNum ? 'selected' : ''}" data-val="${starNum}">★</span>
                `).join('')}
              </div>
              <span class="rating-text-label" id="modalRatingLabel">
                ${getRatingLabel(userFeedback.rating || 0)}
              </span>
            </div>
            <div class="recipe-note-wrapper" style="margin-top: 10px;">
              <textarea id="modalRecipeNotes" placeholder="Write personal tasting notes, tweaks, or favorites (e.g. 'Subbed with almond milk, spun on Lite + 1 Respin, 10/10!')...">${userFeedback.notes || ''}</textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
              <button class="btn-primary" id="btnSaveNotes" style="font-size: 0.8rem; padding: 6px 14px;">Save Rating & Notes</button>
            </div>
          </div>
        </div>
      `}

      <div class="modal-footer" style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          ${canUserEditRecipe(recipe) ? `
            <button class="btn-secondary" id="modalEditRecipeBtn" style="padding: 8px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(236, 72, 153, 0.4); color: #f472b6; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Edit this recipe and push updates to followers">
              ✏️ Edit Recipe
            </button>
          ` : ''}
          ${recipe.isSharedPortable ? `
            <button class="btn-primary btn-save-shared-recipe" id="modalSaveSharedRecipeBtn">
              <span>📥 Save to My Recipes</span>
            </button>
          ` : ''}
          ${isAccessible ? `
            <button class="btn-freeze-pint-action" id="modalFreezeThisPintBtn" title="Log this recipe in your freezer and start the 16-hour countdown timer">
              🧊 Freeze This Pint
            </button>
          ` : ''}
          <button class="btn-secondary btn-share-recipe" id="modalShareBtn" title="Share this recipe">
            <span>🔗 Share Recipe</span>
          </button>
          <button class="btn-secondary" id="modalFavBtn">
            ${isFav ? '💖 Favorited' : '🤍 Add to Favorites'}
          </button>
          ${isPersonal && !recipe.isSharedPortable ? `
            <button class="btn-danger" id="modalDeleteRecipeBtn" style="padding: 8px 14px; border-radius: var(--radius-sm); background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; font-weight: 600; cursor: pointer;">
              🗑️ Delete Recipe
            </button>
          ` : ''}
        </div>
        <button class="btn-primary" id="modalDoneBtn">Done</button>
      </div>
    `;

    bindRecipeModalEvents(recipe);
  }

  function bindRecipeModalEvents(recipe) {
    // Locked Recipe Teaser Buttons (Roadmap Item 15)
    const btnLockedSignIn = recipeModalBody.querySelector('#btnLockedSignIn');
    if (btnLockedSignIn) {
      btnLockedSignIn.addEventListener('click', () => {
        closeRecipeModal();
        openGoogleAuthModal();
      });
    }

    const btnLockedRequestAccess = recipeModalBody.querySelector('#btnLockedRequestAccess');
    if (btnLockedRequestAccess) {
      btnLockedRequestAccess.addEventListener('click', () => {
        const requiredTier = getRecipeRequiredTier(recipe);
        const email = currentUser ? currentUser.email : 'Guest';
        showToast(`✉️ Access request for "${requiredTier} Pack" submitted for ${email}!`);
      });
    }

    const btnLockedContactAdmin = recipeModalBody.querySelector('#btnLockedContactAdmin');
    if (btnLockedContactAdmin) {
      btnLockedContactAdmin.addEventListener('click', () => {
        const requiredTier = getRecipeRequiredTier(recipe);
        showToast(`Please ask an administrator to grant access to the ${requiredTier} Pack.`);
      });
    }

    const btnLockedAlreadyOwn = recipeModalBody.querySelector('#btnLockedAlreadyOwn');
    if (btnLockedAlreadyOwn) {
      btnLockedAlreadyOwn.addEventListener('click', (e) => {
        e.preventDefault();
        const requiredTier = getRecipeRequiredTier(recipe);
        if (!currentUser) {
          showToast(`Please sign in first to claim access to your ${requiredTier} e-book!`);
          closeRecipeModal();
          openGoogleAuthModal();
        } else {
          openClaimAccessModal(requiredTier);
        }
      });
    }
    // Freeze This Pint Button (Roadmap Item 8 & 17)
    const freezePintBtn = recipeModalBody.querySelector('#modalFreezeThisPintBtn');
    if (freezePintBtn) {
      freezePintBtn.addEventListener('click', () => {
        addFreezerPint({
          recipeId: recipe.id,
          recipeName: recipe.name,
          scale: modalScale,
          notes: `Mixed from recipe • ${modalScale === 1.5 ? '24 oz Deluxe' : '16 oz Standard'}`,
          frozenAt: Date.now(),
          requestNotification: true
        });
        renderRecipeModalContent(recipe);
      });
    }

    // Quick Spin From Chilling Banner (Roadmap Item 17)
    const modalQuickSpinBtn = recipeModalBody.querySelector('#modalQuickSpinBtn');
    if (modalQuickSpinBtn) {
      modalQuickSpinBtn.addEventListener('click', () => {
        const pId = modalQuickSpinBtn.dataset.pintId;
        if (pId) {
          openSpinLogModal(pId);
        }
      });
    }

    // View in Freezer Tracker Button (Roadmap Item 8)
    const viewInFreezerBtn = recipeModalBody.querySelector('#modalViewInFreezerBtn');
    if (viewInFreezerBtn) {
      viewInFreezerBtn.addEventListener('click', () => {
        openFreezerModal();
      });
    }

    // Sunday Batch Prep Modal Slot Events
    const modalBatchSlot = recipeModalBody.querySelector('#modalBatchPrepSlot');
    if (modalBatchSlot) {
      bindModalBatchPrepSlotEvents(modalBatchSlot, recipe.id);
    }

    // Put in Freezer Slot Button (Beta Staging)
    const putInFreezerBtn = recipeModalBody.querySelector('#modalPutInFreezerBtn');
    if (putInFreezerBtn) {
      putInFreezerBtn.addEventListener('click', () => {
        closeRecipeModal();
        const takenSlots = new Set(freezerPintsState.map(p => p.slot));
        let targetSlot = 1;
        for (let s = 1; s <= freezerSlotCapacity; s++) {
          if (!takenSlots.has(s)) {
            targetSlot = s;
            break;
          }
        }
        openSlotFillModal(targetSlot, recipe);
      });
    }

    // Pint Scale Selector
    const scaleGroup = recipeModalBody.querySelector('#modalScaleGroup');
    if (scaleGroup) {
      scaleGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (!btn) return;
        modalScale = parseFloat(btn.dataset.scale) || 1.0;
        renderRecipeModalContent(recipe);
      });
    }

    // Unit Mode Selector
    const unitGroup = recipeModalBody.querySelector('#modalUnitGroup');
    if (unitGroup) {
      unitGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (!btn) return;
        modalUnitMode = btn.dataset.unit || 'metric';
        renderRecipeModalContent(recipe);
      });
    }

    // Pantry In Stock Toggle
    recipeModalBody.querySelectorAll('.modal-ing-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ingId = btn.dataset.id;
        togglePantryItem(ingId);
        const inPantry = isItemInPantry(ingId);
        btn.className = `modal-ing-toggle-btn ${inPantry ? 'in-pantry' : ''}`;
        btn.textContent = inPantry ? '✓ In Pantry' : '+ In Stock';
        const row = btn.closest('.modal-ing-row');
        if (row) {
          row.classList.toggle('in-pantry', inPantry);
        }
        
        // Refresh missing callout
        const newMatch = computeRecipeMatch(recipe);
        const callout = recipeModalBody.querySelector('.missing-items-callout');
        if (callout) {
          callout.className = `missing-items-callout ${newMatch.isReady ? 'all-ready' : 'has-missing'}`;
          callout.innerHTML = `
            <span style="font-size: 1.3rem;">${newMatch.isReady ? '🎉' : '🛒'}</span>
            <div style="flex: 1;">
              <strong>${newMatch.isReady ? 'You have all ingredients ready!' : `Missing ${newMatch.missing.length} item${newMatch.missing.length > 1 ? 's' : ''}:`}</strong>
              <div class="missing-items-text">${newMatch.isReady ? 'Blend up your base, freeze solid for 16-24 hrs, and get spinning!' : newMatch.missing.map(m => sanitizeShoppingItemName(m.name)).join(', ')}</div>
              ${!newMatch.isReady && newMatch.missing.length > 0 ? `
                <button class="btn-add-all-missing" id="btnAddAllMissingBtn">🛒 Add All Missing to Grocery List</button>
              ` : ''}
            </div>
          `;
          const addAllBtn = callout.querySelector('#btnAddAllMissingBtn');
          if (addAllBtn) {
            addAllBtn.addEventListener('click', () => {
              if (!currentUser) {
                showToast('🔒 Please sign in to manage your Grocery Shopping List.');
                openGoogleAuthModal();
                return;
              }
              const cleanMissing = newMatch.missing.filter(m => !isShoppingExcluded(m));
              if (cleanMissing.length === 0) {
                showToast('✅ All needed grocery items are already in stock!');
                return;
              }
              cleanMissing.forEach(m => manualShoppingList.add(sanitizeShoppingItemName(m.name)));
              saveManualShoppingList();
              showToast(`🛒 Added ${cleanMissing.length} items to shopping list`);
              renderRecipeModalContent(recipe);
            });
          }
        }
      });
    });

    // Add Single Ingredient to Grocery List
    recipeModalBody.querySelectorAll('.modal-ing-shop-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!currentUser) {
          showToast('🔒 Please sign in to manage your Grocery Shopping List.');
          openGoogleAuthModal();
          return;
        }
        const rawName = btn.dataset.name;
        const cleanName = sanitizeShoppingItemName(rawName);
        if (manualShoppingList.has(cleanName) || manualShoppingList.has(rawName)) {
          manualShoppingList.delete(cleanName);
          manualShoppingList.delete(rawName);
          btn.className = 'modal-ing-shop-btn';
          btn.textContent = '🛒 + List';
          showToast(`Removed "${cleanName}" from shopping list`);
        } else {
          manualShoppingList.add(cleanName);
          btn.className = 'modal-ing-shop-btn in-list';
          btn.textContent = '✓ On List';
          showToast(`🛒 Added "${cleanName}" to shopping list!`);
        }
        saveManualShoppingList();
      });
    });

    // Add All Missing Button
    const addAllBtn = recipeModalBody.querySelector('#btnAddAllMissingBtn');
    if (addAllBtn) {
      addAllBtn.addEventListener('click', () => {
        if (!currentUser) {
          showToast('🔒 Please sign in to manage your Grocery Shopping List.');
          openGoogleAuthModal();
          return;
        }
        const match = computeRecipeMatch(recipe);
        const cleanMissing = match.missing.filter(m => !isShoppingExcluded(m));
        if (cleanMissing.length === 0) {
          showToast('✅ All needed grocery items are already in stock!');
          return;
        }
        cleanMissing.forEach(m => manualShoppingList.add(sanitizeShoppingItemName(m.name)));
        saveManualShoppingList();
        showToast(`🛒 Added ${cleanMissing.length} items to shopping list!`);
        renderRecipeModalContent(recipe);
      });
    }

    // View Creator Perks from Recipe Modal
    const btnModalPerks = recipeModalBody.querySelector('#btnModalViewCreatorPerks');
    if (btnModalPerks) {
      btnModalPerks.addEventListener('click', () => {
        const creatorId = btnModalPerks.dataset.creatorId || 'fitness_product_finder';
        closeRecipeModal();
        openRecipePacksModal(creatorId, true);
      });
    }

    // Step Item Cross Off
    recipeModalBody.querySelectorAll('.modal-step-item').forEach(stepItem => {
      stepItem.addEventListener('click', (e) => {
        if (e.target.closest('#defrostTimerWidget')) return;
        stepItem.classList.toggle('completed');
      });
    });

    // Defrost 60s Timer Controls
    const startTimerBtn = recipeModalBody.querySelector('#startTimerBtn');
    const resetTimerBtn = recipeModalBody.querySelector('#resetTimerBtn');
    const timerSecondsEl = recipeModalBody.querySelector('#timerSeconds');

    if (startTimerBtn) {
      startTimerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (timerRunning) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerRunning = false;
          startTimerBtn.textContent = 'Resume';
          startTimerBtn.className = 'btn-timer-action';
          if (timerSecondsEl) timerSecondsEl.classList.remove('pulsing');
        } else {
          if (timerSecondsLeft <= 0) {
            timerSecondsLeft = 60;
          }
          timerRunning = true;
          startTimerBtn.textContent = 'Pause';
          startTimerBtn.className = 'btn-timer-action running';
          if (resetTimerBtn) resetTimerBtn.style.display = 'inline-block';
          if (timerSecondsEl) timerSecondsEl.classList.add('pulsing');

          timerInterval = setInterval(() => {
            timerSecondsLeft--;
            if (timerSecondsEl) timerSecondsEl.textContent = `${timerSecondsLeft}s`;
            if (timerSecondsLeft <= 0) {
              clearInterval(timerInterval);
              timerInterval = null;
              timerRunning = false;
              if (timerSecondsEl) {
                timerSecondsEl.textContent = '0s';
                timerSecondsEl.classList.remove('pulsing');
              }
              startTimerBtn.textContent = 'Done! Spin Time ❄️';
              startTimerBtn.className = 'btn-timer-action done';
              playAudioChime();
              triggerHaptic([100, 50, 100, 50, 200]);
              showToast('❄️ 60-Second Bath complete! Pint is ready to spin!');
            }
          }, 1000);
        }
      });
    }

    if (resetTimerBtn) {
      resetTimerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        timerRunning = false;
        timerSecondsLeft = 60;
        if (timerSecondsEl) {
          timerSecondsEl.textContent = '60s';
          timerSecondsEl.classList.remove('pulsing');
        }
        if (startTimerBtn) {
          startTimerBtn.textContent = 'Start 60s Timer';
          startTimerBtn.className = 'btn-timer-action';
        }
        resetTimerBtn.style.display = 'none';
      });
    }

    // Batch Counter Controls
    const plusBtn = recipeModalBody.querySelector('#btnBatchPlus');
    const minusBtn = recipeModalBody.querySelector('#btnBatchMinus');
    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logRecipeBatch(recipe.id, +1);
      });
    }
    if (minusBtn) {
      minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logRecipeBatch(recipe.id, -1);
      });
    }

    // 5-Star Rating & Overall Community Rating Sync
    const starRatingContainer = recipeModalBody.querySelector('#modalStarRating');
    const modalRatingLabel = recipeModalBody.querySelector('#modalRatingLabel');
    const ratingSaveStatus = recipeModalBody.querySelector('#ratingSaveStatus');

    if (starRatingContainer) {
      const stars = starRatingContainer.querySelectorAll('.star');
      stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
          const val = parseInt(star.dataset.val) || 0;
          stars.forEach(s => {
            s.classList.toggle('hover', (parseInt(s.dataset.val) || 0) <= val);
          });
        });

        star.addEventListener('mouseleave', () => {
          stars.forEach(s => s.classList.remove('hover'));
        });

        star.addEventListener('click', () => {
          const val = parseInt(star.dataset.val) || 0;
          const notes = (recipeModalBody.querySelector('#modalRecipeNotes')?.value || '').trim();
          submitRecipeRating(recipe.id, val, notes);

          stars.forEach(s => {
            s.classList.toggle('selected', (parseInt(s.dataset.val) || 0) <= val);
          });
          if (modalRatingLabel) modalRatingLabel.textContent = getRatingLabel(val);
          if (ratingSaveStatus) {
            ratingSaveStatus.textContent = 'Rating saved to account ✓';
            setTimeout(() => { ratingSaveStatus.textContent = ''; }, 2500);
          }
        });
      });
    }

    // Personal Tasting Notes
    const notesTextarea = recipeModalBody.querySelector('#modalRecipeNotes');
    if (notesTextarea) {
      let debounceTimer = null;
      notesTextarea.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const val = userRecipeData[recipe.id]?.rating || 0;
          const notes = notesTextarea.value.trim();
          if (!userRecipeData[recipe.id]) {
            userRecipeData[recipe.id] = { rating: 0, notes: '' };
          }
          userRecipeData[recipe.id].notes = notes;
          saveUserRecipeData();
          if (ratingSaveStatus) {
            ratingSaveStatus.textContent = 'Notes saved ✓';
            setTimeout(() => { ratingSaveStatus.textContent = ''; }, 2000);
          }
        }, 600);
      });
    }

    // Save Notes Button
    const saveNotesBtn = recipeModalBody.querySelector('#btnSaveNotes');
    if (saveNotesBtn) {
      saveNotesBtn.addEventListener('click', () => {
        const val = userRecipeData[recipe.id]?.rating || 0;
        const notes = (notesTextarea ? notesTextarea.value : '').trim();
        submitRecipeRating(recipe.id, val, notes);
        if (ratingSaveStatus) {
          ratingSaveStatus.textContent = 'Saved to account ✓';
          setTimeout(() => { ratingSaveStatus.textContent = ''; }, 2500);
        }
      });
    }

    // Share Buttons (Roadmap Item 22)
    const modalMetaShareBtn = recipeModalBody.querySelector('#modalMetaShareBtn');
    if (modalMetaShareBtn) {
      modalMetaShareBtn.addEventListener('click', () => {
        shareRecipe(recipe, modalMetaShareBtn);
      });
    }

    const modalStoryCardBtn = recipeModalBody.querySelector('#modalStoryCardBtn');
    if (modalStoryCardBtn) {
      modalStoryCardBtn.addEventListener('click', () => {
        openStoryCardModal(recipe);
      });
    }

    const btnGuestOpenPantry = recipeModalBody.querySelector('#btnGuestOpenPantry');
    if (btnGuestOpenPantry) {
      btnGuestOpenPantry.addEventListener('click', () => {
        closeModal();
        setMobileView('pantry');
        const pantryPanel = document.getElementById('pantryPanel');
        if (pantryPanel) {
          pantryPanel.scrollIntoView({ behavior: 'smooth' });
        }
        showToast('🥫 Select what ingredients you have to find instant matches!');
      });
    }

    const modalShareBtn = recipeModalBody.querySelector('#modalShareBtn');
    if (modalShareBtn) {
      modalShareBtn.addEventListener('click', () => {
        shareRecipe(recipe, modalShareBtn);
      });
    }

    // Favorite Button
    const modalFavBtn = recipeModalBody.querySelector('#modalFavBtn');
    if (modalFavBtn) {
      modalFavBtn.addEventListener('click', () => {
        toggleFavorite(recipe.id);
        const nowFav = favoritesState.has(recipe.id);
        modalFavBtn.innerHTML = nowFav ? '💖 Favorited' : '🤍 Add to Favorites';
      });
    }

    // Save Shared Recipe to Personal Custom Library
    function handleSaveSharedToMyRecipes(triggerBtn) {
      const alreadyHas = (customRecipesState || []).some(r => r.name.toLowerCase() === recipe.name.toLowerCase());
      if (alreadyHas) {
        showToast(`"${recipe.name}" is already in your Custom Recipes!`);
        recipeModalBody.querySelectorAll('.btn-save-shared-recipe').forEach(b => {
          b.innerHTML = '<span>✓ Already in Library</span>';
          b.disabled = true;
          b.style.opacity = '0.7';
        });
        return;
      }

      const myId = currentUser && currentUser.id ? currentUser.id : 'local';
      const savedRecipe = {
        ...recipe,
        id: `custom_${myId}_${Date.now()}`,
        isSharedPortable: false,
        isPersonal: true,
        category: 'Custom',
        categories: ['Custom'],
        sourceFile: `Shared by ${recipe.sharedAuthor || 'A Creami Chef'}`
      };

      customRecipesState.push(savedRecipe);

      // Auto-add missing ingredients to pantry
      let addedPantry = 0;
      (savedRecipe.ingredients || []).forEach(ing => {
        const ingId = ing.id || sanitizeShoppingItemName(ing.name).toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
        if (ingId && !pantryState.has(ingId)) {
          pantryState.add(ingId);
          addedPantry++;
        }
      });
      if (addedPantry > 0) {
        savePantry();
        updatePantryCheckboxVisuals();
      }

      saveCustomRecipes();
      renderRecipes();
      playAudioSuccess();
      showToast(`✅ Saved "${savedRecipe.name}" to your Custom Recipes & pantry!`);

      recipeModalBody.querySelectorAll('.btn-save-shared-recipe').forEach(b => {
        b.innerHTML = '<span>✓ Saved in Library</span>';
        b.disabled = true;
        b.style.opacity = '0.7';
      });
    }

    const saveSharedBtn1 = recipeModalBody.querySelector('#modalSaveSharedRecipeBtn');
    const saveSharedBtn2 = recipeModalBody.querySelector('#btnTopSaveSharedRecipe');
    if (saveSharedBtn1) saveSharedBtn1.addEventListener('click', () => handleSaveSharedToMyRecipes(saveSharedBtn1));
    if (saveSharedBtn2) saveSharedBtn2.addEventListener('click', () => handleSaveSharedToMyRecipes(saveSharedBtn2));

    // Edit Recipe Button
    const modalEditBtn = recipeModalBody.querySelector('#modalEditRecipeBtn');
    if (modalEditBtn) {
      modalEditBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeRecipeModal();
        openEditRecipeModal(recipe);
      });
    }

    // Delete Personal Recipe Button (with in-modal 2-step confirmation)
    const modalDeleteBtn = recipeModalBody.querySelector('#modalDeleteRecipeBtn');
    if (modalDeleteBtn) {
      let modalConfirm = false;
      let mTimer = null;
      modalDeleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!modalConfirm) {
          modalConfirm = true;
          modalDeleteBtn.innerHTML = '⚠️ Click again to confirm delete';
          modalDeleteBtn.style.background = '#ef4444';
          modalDeleteBtn.style.color = '#ffffff';
          modalDeleteBtn.style.borderColor = '#dc2626';
          mTimer = setTimeout(() => {
            modalConfirm = false;
            modalDeleteBtn.innerHTML = '🗑️ Delete Recipe';
            modalDeleteBtn.style.background = 'rgba(239, 68, 68, 0.12)';
            modalDeleteBtn.style.color = '#f87171';
            modalDeleteBtn.style.borderColor = 'rgba(239, 68, 68, 0.35)';
          }, 4000);
        } else {
          clearTimeout(mTimer);
          deleteCustomRecipe(recipe.id);
        }
      });
    }

    // 1-Tap Macro Clipboard Export (Roadmap Item 10)
    const btnCopyMacros = recipeModalBody.querySelector('#btnCopyMacros');
    if (btnCopyMacros) {
      btnCopyMacros.addEventListener('click', () => {
        const cal = scaleMacroVal(recipe.macros.calories, modalScale) || '0';
        const pro = scaleMacroVal(recipe.macros.protein, modalScale) || '0g';
        const carbs = scaleMacroVal(recipe.macros.carbs, modalScale) || '0g';
        const fat = scaleMacroVal(recipe.macros.fat, modalScale) || '0g';
        const sugar = scaleMacroVal(recipe.macros.sugar, modalScale) || '0g';
        const fiber = scaleMacroVal(recipe.macros.fiber, modalScale) || '0g';
        const sizeStr = modalScale === 1.5 ? '24 oz Deluxe' : '16 oz Standard';

        const macroString = `🍨 ${recipe.name} (${sizeStr}): ${cal} kcal | ${pro} P | ${carbs} C | ${fat} F (Sugar: ${sugar}, Fiber: ${fiber})`;

        copyTextToClipboard(macroString).then(() => {
          btnCopyMacros.classList.add('copied');
          const btnText = recipeModalBody.querySelector('#copyMacrosBtnText');
          if (btnText) btnText.textContent = '✓ Macros Copied!';
          showToast(`📋 Copied macros for "${recipe.name}"!`);
          setTimeout(() => {
            btnCopyMacros.classList.remove('copied');
            if (btnText) btnText.textContent = 'Copy Macros for Fitness Tracker';
          }, 2500);
        }).catch(() => {
          showToast('Failed to copy macros to clipboard');
        });
      });
    }

    // Modal Spin Again Button (Roadmap Item 12)
    const modalSpinAgainBtn = recipeModalBody.querySelector('#modalSpinAgainBtn');
    if (modalSpinAgainBtn) {
      modalSpinAgainBtn.addEventListener('click', () => {
        closeRecipeModal();
        spinCreamiRoulette();
      });
    }

    // 1-Tap Smart Ingredient Substitutions Trigger Badges (Roadmap Item 16)
    recipeModalBody.querySelectorAll('.ing-swap-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const ingName = badge.dataset.ingName;
        const ing = (recipe.ingredients || []).find(i => sanitizeShoppingItemName(i.name) === ingName || i.name === ingName);
        if (ing) {
          openSwapInspector(ing, recipe);
        }
      });
    });

    // Revert Swap Button inside ingredient row
    recipeModalBody.querySelectorAll('.btn-ing-revert-swap').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ingName = btn.dataset.ingName;
        resetSwap(ingName, recipe);
      });
    });

    // Author sub-chip click triggers swap inspector
    recipeModalBody.querySelectorAll('.ing-sub-chip').forEach(chip => {
      chip.style.cursor = 'pointer';
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = chip.closest('.modal-ing-row');
        const badge = row ? row.querySelector('.ing-swap-badge') : null;
        if (badge) {
          badge.click();
        }
      });
    });

    // Done Button
    const modalDoneBtn = recipeModalBody.querySelector('#modalDoneBtn');
    if (modalDoneBtn) {
      modalDoneBtn.addEventListener('click', closeRecipeModal);
    }
  }

  function formatSubText(text) {
    if (!text) return '';
    return text.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  }

  function renderModalIngredientRow(ing, recipe) {
    const rec = recipe || currentModalRecipe;
    const cleanName = sanitizeShoppingItemName(ing.name);
    const activeSwap = (rec && rec.id && activeRecipeSwaps[rec.id]) ? activeRecipeSwaps[rec.id][cleanName] : null;

    const inPantry = isItemInPantry(activeSwap ? activeSwap.name : ing);
    const amountText = formatIngredientAmount(ing, modalScale, modalUnitMode);
    const subText = extractSubstitution(ing.notes);
    const inShopList = manualShoppingList.has(cleanName) || manualShoppingList.has(ing.name) || (activeSwap && manualShoppingList.has(sanitizeShoppingItemName(activeSwap.name)));

    const swapData = getSwapsForIngredient(ing);
    const swapCount = swapData ? swapData.options.length : 0;

    let displayNotes = ing.notes || '';
    displayNotes = displayNotes.replace(/(?:;\s*)?CODE\s+[A-Z0-9]+(?:\s+SAVES\s+YOU\s+\d+%\s*|TO\s+SAVE\s*)?/gi, '').replace(/^;\s*|;\s*$/g, '').trim();
    if (subText && displayNotes) {
      const escapedSub = subText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      displayNotes = displayNotes.replace(new RegExp(`(?:;\\s*)?\\bOR\\s+${escapedSub}\\b`, 'i'), '').trim();
      displayNotes = displayNotes.replace(/^;\s*|;\s*$/g, '').trim();
    }

    if (activeSwap) {
      return `
        <div class="modal-ing-row ${inPantry ? 'in-pantry' : ''} is-swapped">
          <div class="modal-ing-main">
            <div class="modal-ing-info">
              <div class="modal-ing-name">
                <span style="text-decoration: line-through; opacity: 0.55; font-size: 0.88em; margin-right: 6px;">${escapeHtml(cleanName)}</span>
                <span style="color: #c084fc; font-weight: 700;">🔄 ${escapeHtml(activeSwap.name)}</span>
              </div>
              <div class="ing-active-swap-pill">
                <span>Ratio: ${escapeHtml(activeSwap.ratio)}</span>
                <button type="button" class="btn-ing-revert-swap" data-ing-name="${escapeHtml(cleanName)}" title="Revert to original ingredient">Revert</button>
              </div>
              ${displayNotes ? `<div class="modal-ing-notes">${escapeHtml(displayNotes)}</div>` : ''}
            </div>
            <div class="modal-ing-amount-box" title="${modalScale > 1 ? 'Scaled Deluxe (1.5×) amount' : 'Standard amount'}">
              <span class="modal-ing-amount-label">${modalScale > 1 ? 'Deluxe Amt' : 'Amount'}</span>
              <span class="modal-ing-amount-val ${!amountText ? 'empty' : ''}">${escapeHtml(amountText || 'As needed')}</span>
            </div>
          </div>
          <div class="modal-ing-actions">
            <button type="button" class="ing-swap-badge active-swap" data-ing-name="${escapeHtml(cleanName)}" title="Modify substitution">
              🔄 Swapped
            </button>
            <button type="button" class="modal-ing-shop-btn ${inShopList ? 'in-list' : ''}" data-name="${escapeHtml(sanitizeShoppingItemName(activeSwap.name))}" title="${inShopList ? 'Remove from shopping list' : 'Add to shopping list'}">
              ${inShopList ? '✓ On List' : '🛒 + List'}
            </button>
            <button type="button" class="modal-ing-toggle-btn ${inPantry ? 'in-pantry' : ''}" data-id="${escapeHtml(activeSwap.name)}">
              ${inPantry ? '✓ In Pantry' : '+ In Stock'}
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="modal-ing-row ${inPantry ? 'in-pantry' : ''}">
        <div class="modal-ing-main">
          <div class="modal-ing-info">
            <div class="modal-ing-name">${escapeHtml(cleanName)}</div>
            ${subText ? `<div class="ing-sub-chip" title="Click to explore substitutions">💡 Swap: ${escapeHtml(formatSubText(subText))}</div>` : ''}
            ${displayNotes ? `<div class="modal-ing-notes">${escapeHtml(displayNotes)}</div>` : ''}
          </div>
          <div class="modal-ing-amount-box" title="${modalScale > 1 ? 'Scaled Deluxe (1.5×) amount' : 'Standard amount'}">
            <span class="modal-ing-amount-label">${modalScale > 1 ? 'Deluxe Amt' : 'Amount'}</span>
            <span class="modal-ing-amount-val ${!amountText ? 'empty' : ''}">${escapeHtml(amountText || 'As needed')}</span>
          </div>
        </div>
        <div class="modal-ing-actions">
          ${(swapCount > 0 || subText) ? `
            <button type="button" class="ing-swap-badge" data-ing-name="${escapeHtml(cleanName)}" title="Explore ${swapCount || 1} tested substitutions for Ninja Creami">
              🔄 Swap ${swapCount > 0 ? `(${swapCount})` : ''}
            </button>
          ` : ''}
          <button type="button" class="modal-ing-shop-btn ${inShopList ? 'in-list' : ''}" data-name="${escapeHtml(cleanName)}" title="${inShopList ? 'Remove from shopping list' : 'Add to shopping list'}">
            ${inShopList ? '✓ On List' : '🛒 + List'}
          </button>
          <button type="button" class="modal-ing-toggle-btn ${inPantry ? 'in-pantry' : ''}" data-id="${escapeHtml(ing.id || ing.name)}">
            ${inPantry ? '✓ In Pantry' : '+ In Stock'}
          </button>
        </div>
      </div>
    `;
  }

  function closeRecipeModal(updateHistory = true) {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerRunning = false;
    timerSecondsLeft = 60;
    isCurrentModalRoulette = false;
    recipeModalOverlay.classList.remove('active');
    recipeModalOverlay.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
    const modalContent = recipeModalOverlay.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;
    if (recipeModalBody) recipeModalBody.scrollTop = 0;
    currentModalRecipe = null;

    if (updateHistory) {
      if (history.state && history.state.modal === 'recipe') {
        history.back();
      } else if (window.location.pathname.startsWith('/recipe/') || window.location.pathname.startsWith('/beta/recipe/')) {
        try {
          history.replaceState({ modal: null }, '', IS_BETA ? '/beta/' : '/');
        } catch (e) {}
        document.title = 'Creami Cravings';
      }
    } else {
      if (window.location.pathname.startsWith('/recipe/') || window.location.pathname.startsWith('/beta/recipe/')) {
        try {
          history.replaceState({ modal: null }, '', IS_BETA ? '/beta/' : '/');
        } catch (e) {}
      }
      document.title = 'Creami Cravings';
    }
  }

  // --- Shopping List Modal ---
  function openShoppingListModal() {
    if (!currentUser) {
      showToast('🔒 Please sign in to access your Grocery Shopping List.');
      openGoogleAuthModal();
      return;
    }

    // Sync view switcher buttons in header
    const btnShopViewStandard = document.getElementById('btnShopViewStandard');
    const btnShopViewStore = document.getElementById('btnShopViewStore');
    if (btnShopViewStandard && btnShopViewStore) {
      btnShopViewStandard.classList.toggle('active', shoppingViewMode === 'standard');
      btnShopViewStore.classList.toggle('active', shoppingViewMode === 'store');
    }

    if (shoppingViewMode === 'store') {
      requestShoppingStoreWakeLock();
    } else {
      releaseShoppingStoreWakeLock();
    }

    if (Array.isArray(storeSessionInCart) && storeSessionInCart.length > 0) {
      storeSessionInCart = storeSessionInCart.filter(item => pantryState.has(item.id));
    } else if (!Array.isArray(storeSessionInCart)) {
      storeSessionInCart = [];
    }

    // 1. Sanitize any legacy manual items first
    let manualChanged = false;
    const cleanManual = new Set();
    manualShoppingList.forEach(rawItem => {
      if (isShoppingExcluded(rawItem)) {
        manualChanged = true;
      } else {
        const clean = sanitizeShoppingItemName(rawItem);
        cleanManual.add(clean);
        if (clean !== rawItem) manualChanged = true;
      }
    });
    if (manualChanged) {
      manualShoppingList = cleanManual;
      saveManualShoppingList();
    }

    // 2. Gather missing items from Favorited / Pinned recipes (primary list)
    const favoritedMissingMap = new Map(); // cleanName -> { recipes: [], category: '' }
    const favoritedRecipes = allRecipes.filter(r => favoritesState.has(r.id));

    favoritedRecipes.forEach(r => {
      const match = computeRecipeMatch(r);
      match.missing.forEach(m => {
        if (!isShoppingExcluded(m)) {
          const cleanName = sanitizeShoppingItemName(m.name);
          if (!favoritedMissingMap.has(cleanName)) {
            favoritedMissingMap.set(cleanName, {
              recipes: [],
              category: getIngredientCategoryKey(m.name)
            });
          }
          const entry = favoritedMissingMap.get(cleanName);
          if (!entry.recipes.includes(r.name)) {
            entry.recipes.push(r.name);
          }
        }
      });
    });

    // 3. Gather almost-ready suggestions (recipes missing 1-2 items, not favorited)
    const suggestedMissingMap = new Map(); // cleanName -> { recipes: [], category: '' }
    const almostReadyRecipes = allRecipes.filter(r => !favoritesState.has(r.id) && computeRecipeMatch(r).missing.length <= 2 && computeRecipeMatch(r).missing.length > 0);

    almostReadyRecipes.forEach(r => {
      const match = computeRecipeMatch(r);
      match.missing.forEach(m => {
        if (!isShoppingExcluded(m)) {
          const cleanName = sanitizeShoppingItemName(m.name);
          // Only suggest if not already in manual or favorited lists
          if (!manualShoppingList.has(cleanName) && !favoritedMissingMap.has(cleanName)) {
            if (!suggestedMissingMap.has(cleanName)) {
              suggestedMissingMap.set(cleanName, {
                recipes: [],
                category: getIngredientCategoryKey(m.name)
              });
            }
            const entry = suggestedMissingMap.get(cleanName);
            if (!entry.recipes.includes(r.name)) {
              entry.recipes.push(r.name);
            }
          }
        }
      });
    });

    // 4. Combine manual items and favorited missing into grouped grocery items
    const groupedGroceries = {}; // catKey -> [ { name, source, isManual } ]
    
    // Add manual items
    manualShoppingList.forEach(name => {
      const cat = getIngredientCategoryKey(name);
      if (!groupedGroceries[cat]) groupedGroceries[cat] = [];
      groupedGroceries[cat].push({
        name: name,
        source: 'Added to your list',
        isManual: true
      });
    });

    // Add favorited missing items (if not already added as manual)
    favoritedMissingMap.forEach((data, name) => {
      if (!manualShoppingList.has(name)) {
        const cat = data.category || getIngredientCategoryKey(name);
        if (!groupedGroceries[cat]) groupedGroceries[cat] = [];
        const recList = data.recipes.slice(0, 3).join(', ') + (data.recipes.length > 3 ? ` + ${data.recipes.length - 3} more` : '');
        groupedGroceries[cat].push({
          name: name,
          source: `Needed for: ${recList}`,
          isManual: false
        });
      }
    });

    const totalPrimaryItems = Object.values(groupedGroceries).reduce((acc, list) => acc + list.length, 0);
    const inCartCount = storeSessionInCart.length;
    const totalStoreItems = totalPrimaryItems + inCartCount;
    const progressPct = totalStoreItems > 0 ? Math.round((inCartCount / totalStoreItems) * 100) : (totalPrimaryItems === 0 && inCartCount === 0 ? 0 : 100);

    // Build Modal HTML
    let html = '';

    if (shoppingViewMode === 'store') {
      html += `
        <div class="store-mode-banner">
          <div class="store-mode-banner-top">
            <div class="store-mode-title-wrap">
              <span class="store-mode-pill">🛒 In-Store Grocery Mode</span>
              <span style="font-size: 0.82rem; font-weight: 700; color: #f1f5f9;">
                ${inCartCount} of ${totalStoreItems} items in cart (${progressPct}%)
              </span>
            </div>
            <span class="store-wake-lock-pill" id="storeWakeLockPill" title="Keeps your screen awake while shopping in the aisles">
              ${shoppingStoreWakeLock ? '⚡ Screen Awake' : '💤 Screen Normal'}
            </span>
          </div>
          <div class="store-progress-track">
            <div class="store-progress-fill" style="width: ${progressPct}%;"></div>
          </div>
        </div>
      `;
    }

    html += `
      <div class="shopping-quick-add-wrap">
        <div class="shopping-quick-add-input-box">
          <input type="text" id="shopQuickAddInput" class="shopping-quick-add-input" placeholder="Quick add grocery item (e.g. Fairlife 2% Milk)..." autocomplete="off" />
          <div id="shopQuickAddDropdown" class="shopping-autocomplete-dropdown" style="display: none;"></div>
        </div>
        <button type="button" id="shopQuickAddBtn" class="btn-xs btn-primary">+ Add</button>
      </div>
    `;

    if (shoppingViewMode === 'store') {
      if (totalPrimaryItems === 0 && inCartCount === 0) {
        html += `
          <div class="shopping-empty-state">
            <div style="font-size: 2.8rem; margin-bottom: 10px;">🛒</div>
            <h3>Your Grocery List is Empty</h3>
            <p>Star recipes you plan to make to track their missing ingredients automatically, or type items above to add them to your list.</p>
          </div>
        `;
      } else if (totalPrimaryItems === 0 && inCartCount > 0) {
        html += `
          <div class="store-complete-card">
            <div class="store-complete-icon">🎉</div>
            <h3 style="color: #34d399; margin: 0 0 6px 0; font-size: 1.25rem;">All Done! Grocery Run Complete</h3>
            <p style="color: #94a3b8; font-size: 0.88rem; margin: 0;">You've picked up all items on your grocery list! Everything is synced to your pantry.</p>
          </div>
        `;
      } else {
        html += '<div class="store-aisles-wrap">';
        
        const categoryOrder = [
          'dairy_liquids',
          'protein_powders',
          'pudding_mixes',
          'sweeteners_binders',
          'baking_powders',
          'extracts_flavors',
          'syrups_sauces',
          'nut_butters_spreads',
          'produce_fruit',
          'beverages_drinks',
          'spices_seasonings',
          'mixins_snacks'
        ];

        Object.keys(groupedGroceries).forEach(cat => {
          if (!categoryOrder.includes(cat)) categoryOrder.push(cat);
        });

        categoryOrder.forEach(catKey => {
          const items = groupedGroceries[catKey];
          if (!items || items.length === 0) return;

          const catTitle = INGREDIENT_CATEGORIES[catKey] || 'Other Groceries';
          const catIcon = CATEGORY_ICONS[catKey] || '🛒';

          html += `
            <div class="store-aisle-group">
              <div class="store-aisle-header">
                <span class="store-aisle-icon">${catIcon}</span>
                <span class="store-aisle-title">${catTitle}</span>
                <span class="store-aisle-count" style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">(${items.length})</span>
              </div>
              <div class="store-aisle-items">
                ${items.map(item => `
                  <div class="store-item-card" data-name="${escapeHtml(item.name)}" data-manual="${item.isManual}">
                    <div class="store-item-left">
                      <div class="store-check-circle" aria-hidden="true"></div>
                      <div style="min-width: 0; flex: 1;">
                        <div class="store-item-name">${escapeHtml(item.name)}</div>
                        <div class="store-item-source" title="${escapeHtml(item.source)}">${escapeHtml(item.source)}</div>
                      </div>
                    </div>
                    <div class="store-item-tag">+ Got It</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        });

        html += '</div>';
      }

      // Render "In Your Cart" section if items have been collected
      if (inCartCount > 0) {
        html += `
          <div class="store-found-section">
            <div class="store-found-header">
              <span>🧺 In Your Cart (${inCartCount})</span>
              <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 500;">Tap Put Back if needed</span>
            </div>
            <div class="store-found-items">
              ${storeSessionInCart.map((item, idx) => `
                <div class="store-found-item-card">
                  <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                    <span style="color: #34d399; font-size: 0.9rem;">✓</span>
                    <span class="store-found-name">${escapeHtml(item.name)}</span>
                  </div>
                  <button type="button" class="btn-store-undo" data-idx="${idx}" data-name="${escapeHtml(item.name)}" title="Move back to missing list">
                    ↩️ Put Back
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    } else {
      if (totalPrimaryItems === 0) {
        html += `
          <div class="shopping-empty-state">
            <div style="font-size: 2.8rem; margin-bottom: 10px;">🛒</div>
            <h3>Your Grocery List is Empty</h3>
            <p>Star recipes you plan to make to track their missing ingredients automatically, or type items above to add them to your list.</p>
          </div>
        `;
      } else {
        html += '<div class="shopping-list-items">';
        
        // Render sorted categories
        const categoryOrder = [
          'dairy_liquids',
          'protein_powders',
          'pudding_mixes',
          'sweeteners_binders',
          'baking_powders',
          'extracts_flavors',
          'syrups_sauces',
          'nut_butters_spreads',
          'produce_fruit',
          'beverages_drinks',
          'spices_seasonings',
          'mixins_snacks'
        ];

        // Add any custom or remaining categories
        Object.keys(groupedGroceries).forEach(cat => {
          if (!categoryOrder.includes(cat)) categoryOrder.push(cat);
        });

        categoryOrder.forEach(catKey => {
          const items = groupedGroceries[catKey];
          if (!items || items.length === 0) return;

          const catTitle = INGREDIENT_CATEGORIES[catKey] || 'Other Groceries';
          const catIcon = CATEGORY_ICONS[catKey] || '🛒';

          html += `
            <div class="shopping-category-group">
              <div class="shopping-category-header">
                <span class="shopping-cat-icon">${catIcon}</span>
                <span class="shopping-cat-title">${catTitle}</span>
                <span class="shopping-cat-count">${items.length}</span>
              </div>
              <div class="shopping-category-items">
                ${items.map(item => `
                  <div class="shopping-item-row" data-name="${item.name}">
                    <div class="shopping-item-left">
                      <button type="button" class="shopping-item-check-btn add-bought-btn" data-name="${item.name}" title="Mark as bought (+ In Stock)">
                        <span class="shop-check-box"></span>
                      </button>
                      <div style="min-width: 0;">
                        <div class="shopping-item-name">${item.name}</div>
                        <div class="shopping-item-recipes" title="${item.source}">${item.source}</div>
                      </div>
                    </div>
                    <div class="shopping-item-actions">
                      <button type="button" class="btn-xs btn-outline add-bought-btn" data-name="${item.name}">+ In Stock</button>
                      ${item.isManual ? `<button type="button" class="btn-xs remove-shop-item-btn" data-name="${item.name}" style="background: transparent; border: 1px solid var(--border-glass); color: var(--text-dim); border-radius: var(--radius-sm); cursor: pointer;" title="Remove from list">✕</button>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        });

        html += '</div>';
      }
    }

    // Render suggestions section if available
    const suggestedEntries = Array.from(suggestedMissingMap.entries());
    if (suggestedEntries.length > 0) {
      html += `
        <div class="shopping-suggestions-card">
          <button type="button" class="shopping-suggestions-toggle" id="shopSuggestionsToggle">
            <span>💡 Recipes You Can Make with 1 More Item (${almostReadyRecipes.length} recipes)</span>
            <span class="toggle-arrow" id="shopSuggestionsArrow">▾</span>
          </button>
          <div class="shopping-suggestions-content" id="shopSuggestionsContent" style="display: none;">
            ${suggestedEntries.slice(0, 15).map(([ingName, data]) => {
              const recList = data.recipes.slice(0, 2).join(', ') + (data.recipes.length > 2 ? ` + ${data.recipes.length - 2} more` : '');
              return `
                <div class="shopping-suggested-row">
                  <div>
                    <div class="shopping-suggested-name">${ingName}</div>
                    <div class="shopping-suggested-reason">Unlocks: ${recList}</div>
                  </div>
                  <button type="button" class="btn-xs btn-primary add-suggestion-btn" data-name="${ingName}">+ Add to List</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    shoppingModalBody.innerHTML = html;

    // Attach Event Listeners inside Shopping Modal
    if (shoppingViewMode === 'store') {
      // 1. Store Mode: Tapping whole card marks bought and moves to cart
      shoppingModalBody.querySelectorAll('.store-item-card').forEach(card => {
        card.addEventListener('click', () => {
          const name = card.dataset.name;
          const isManual = card.dataset.manual === 'true';

          try { playAudioSuccess(); } catch (e) {}
          if (navigator.vibrate) {
            try { navigator.vibrate([40]); } catch (e) {}
          }

          let masterMatch = null;
          if (typeof INGREDIENTS_MASTER !== 'undefined') {
            masterMatch = INGREDIENTS_MASTER.find(i => i.name.toLowerCase() === name.toLowerCase());
          }
          const id = masterMatch ? masterMatch.id : name.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();

          storeSessionInCart.push({ name, id, isManual });
          markShoppingItemAsBought(name);
          showToast(`🛒 "${name}" added to cart & pantry!`);
          openShoppingListModal();
        });
      });

      // 2. Store Mode: Undo / Put Back
      shoppingModalBody.querySelectorAll('.btn-store-undo').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx, 10);
          if (isNaN(idx) || idx < 0 || idx >= storeSessionInCart.length) return;

          const item = storeSessionInCart[idx];
          pantryState.delete(item.id);
          if (item.isManual) {
            manualShoppingList.add(item.name);
          }
          savePantry();
          saveManualShoppingList();
          renderPantryList();
          renderRecipes();
          triggerCloudSync();

          storeSessionInCart.splice(idx, 1);
          showToast(`↩️ "${item.name}" moved back to list`);
          openShoppingListModal();
        });
      });
    } else {
      // Standard Mode Event Listeners
      // 1. Mark as Bought (+ In Stock)
      shoppingModalBody.querySelectorAll('.add-bought-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const ingName = btn.dataset.name;
          markShoppingItemAsBought(ingName);
          showToast(`✓ "${ingName}" added to pantry!`);
          openShoppingListModal();
        });
      });

      // 2. Remove Manual Item
      shoppingModalBody.querySelectorAll('.remove-shop-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const ingName = btn.dataset.name;
          manualShoppingList.delete(ingName);
          manualShoppingList.delete(sanitizeShoppingItemName(ingName));
          saveManualShoppingList();
          openShoppingListModal();
          showToast(`Removed "${ingName}" from shopping list`);
        });
      });
    }

    // 3. Quick Add Custom Item with Autocomplete from Pantry Database
    const quickInput = shoppingModalBody.querySelector('#shopQuickAddInput');
    const quickBtn = shoppingModalBody.querySelector('#shopQuickAddBtn');
    const quickDropdown = shoppingModalBody.querySelector('#shopQuickAddDropdown');
    let activeSuggestionIndex = -1;

    // Build autocomplete candidates list from INGREDIENTS_MASTER + custom recipe ingredients
    const candidateMap = new Map();
    if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
      INGREDIENTS_MASTER.forEach(ing => {
        if (!isShoppingExcluded(ing)) {
          const clean = sanitizeShoppingItemName(ing.name);
          if (!candidateMap.has(clean.toLowerCase())) {
            const cat = ing.category || getIngredientCategoryKey(clean);
            candidateMap.set(clean.toLowerCase(), {
              name: clean,
              icon: CATEGORY_ICONS[cat] || '🛒',
              category: cat,
              catTitle: INGREDIENT_CATEGORIES[cat] || 'Groceries'
            });
          }
        }
      });
    }

    if (Array.isArray(customRecipesState)) {
      customRecipesState.forEach(r => {
        (r.ingredients || []).forEach(ing => {
          if (!isShoppingExcluded(ing)) {
            const clean = sanitizeShoppingItemName(ing.name);
            if (!candidateMap.has(clean.toLowerCase())) {
              const cat = getIngredientCategoryKey(clean);
              candidateMap.set(clean.toLowerCase(), {
                name: clean,
                icon: CATEGORY_ICONS[cat] || '🛒',
                category: cat,
                catTitle: INGREDIENT_CATEGORIES[cat] || 'Groceries'
              });
            }
          }
        });
      });
    }

    const allCandidates = Array.from(candidateMap.values());

    function hideQuickDropdown() {
      if (quickDropdown) {
        quickDropdown.style.display = 'none';
        quickDropdown.innerHTML = '';
        activeSuggestionIndex = -1;
      }
    }

    function addGroceryItem(rawVal) {
      if (!rawVal) return;
      const trimmed = rawVal.trim();
      if (!trimmed) return;
      if (isShoppingExcluded(trimmed)) {
        showToast(`"${trimmed}" is a common household staple and is already excluded`);
        if (quickInput) quickInput.value = '';
        hideQuickDropdown();
        return;
      }
      const cleanVal = sanitizeShoppingItemName(trimmed);
      manualShoppingList.add(cleanVal);
      saveManualShoppingList();
      hideQuickDropdown();
      showToast(`🛒 Added "${cleanVal}" to grocery list!`);
      openShoppingListModal();
    }

    function renderAutocomplete(query) {
      if (!quickDropdown) return;
      const q = (query || '').toLowerCase().trim();
      if (!q || q.length < 1) {
        hideQuickDropdown();
        return;
      }

      const matches = allCandidates.filter(item => {
        return item.name.toLowerCase().includes(q);
      }).sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aWordStarts = aName.split(/\s+/).some(w => w.startsWith(q));
        const bWordStarts = bName.split(/\s+/).some(w => w.startsWith(q));
        if (aWordStarts && !bWordStarts) return -1;
        if (!aWordStarts && bWordStarts) return 1;

        return aName.localeCompare(bName);
      }).slice(0, 8);

      if (matches.length === 0) {
        hideQuickDropdown();
        return;
      }

      activeSuggestionIndex = -1;
      quickDropdown.innerHTML = matches.map((item, idx) => {
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const highlightedName = item.name.replace(regex, '<span class="shopping-autocomplete-match">$1</span>');

        return `
          <div class="shopping-autocomplete-item" data-index="${idx}" data-name="${item.name}">
            <span class="shopping-autocomplete-icon">${item.icon}</span>
            <div class="shopping-autocomplete-text">
              <div class="shopping-autocomplete-name">${highlightedName}</div>
              <div class="shopping-autocomplete-cat">${item.catTitle}</div>
            </div>
          </div>
        `;
      }).join('');

      quickDropdown.style.display = 'flex';

      quickDropdown.querySelectorAll('.shopping-autocomplete-item').forEach(el => {
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const chosenName = el.dataset.name;
          addGroceryItem(chosenName);
        });
      });
    }

    if (quickInput) {
      quickInput.addEventListener('input', (e) => {
        renderAutocomplete(e.target.value);
      });

      quickInput.addEventListener('focus', (e) => {
        if (e.target.value.trim().length > 0) {
          renderAutocomplete(e.target.value);
        }
      });

      quickInput.addEventListener('keydown', (e) => {
        if (!quickDropdown || quickDropdown.style.display === 'none') {
          if (e.key === 'Enter') {
            e.preventDefault();
            addGroceryItem(quickInput.value);
          }
          return;
        }

        const items = quickDropdown.querySelectorAll('.shopping-autocomplete-item');
        if (items.length === 0) {
          if (e.key === 'Enter') {
            e.preventDefault();
            addGroceryItem(quickInput.value);
          }
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
          items.forEach((it, i) => it.classList.toggle('active', i === activeSuggestionIndex));
          items[activeSuggestionIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
          items.forEach((it, i) => it.classList.toggle('active', i === activeSuggestionIndex));
          items[activeSuggestionIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeSuggestionIndex >= 0 && activeSuggestionIndex < items.length) {
            const chosen = items[activeSuggestionIndex].dataset.name;
            addGroceryItem(chosen);
          } else {
            addGroceryItem(quickInput.value);
          }
        } else if (e.key === 'Escape') {
          hideQuickDropdown();
        }
      });

      quickInput.addEventListener('blur', () => {
        setTimeout(hideQuickDropdown, 200);
      });
    }

    if (quickBtn && quickInput) {
      quickBtn.addEventListener('click', () => {
        addGroceryItem(quickInput.value);
      });
    }

    // 4. Toggle Suggestions Accordion
    const suggToggle = shoppingModalBody.querySelector('#shopSuggestionsToggle');
    const suggContent = shoppingModalBody.querySelector('#shopSuggestionsContent');
    const suggArrow = shoppingModalBody.querySelector('#shopSuggestionsArrow');
    if (suggToggle && suggContent) {
      suggToggle.addEventListener('click', () => {
        const isOpen = suggContent.style.display !== 'none';
        suggContent.style.display = isOpen ? 'none' : 'flex';
        if (suggArrow) suggArrow.textContent = isOpen ? '▾' : '▴';
      });
    }

    // 5. Add Suggestion to Primary List
    shoppingModalBody.querySelectorAll('.add-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ingName = btn.dataset.name;
        const clean = sanitizeShoppingItemName(ingName);
        manualShoppingList.add(clean);
        saveManualShoppingList();
        showToast(`🛒 Added "${clean}" to your grocery list!`);
        openShoppingListModal();
      });
    });

    shoppingModalOverlay.classList.add('active');
    shoppingModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeShoppingListModal() {
    releaseShoppingStoreWakeLock();
    shoppingModalOverlay.classList.remove('active');
    shoppingModalOverlay.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  function clearShoppingList() {
    if (manualShoppingList.size === 0 && (!storeSessionInCart || storeSessionInCart.length === 0)) {
      showToast('Manual shopping list is already empty');
      return;
    }
    const count = manualShoppingList.size;
    manualShoppingList.clear();
    storeSessionInCart = [];
    saveManualShoppingList();
    openShoppingListModal();
    showToast(count > 0 ? `🗑️ Cleared ${count} manual item${count === 1 ? '' : 's'} from shopping list` : '🗑️ Cleared shopping cart items');
  }

  function updateShoppingListBadge() {
    let missingTotal = 0;
    const seen = new Set();

    // Count manual items
    manualShoppingList.forEach(rawItem => {
      if (!isShoppingExcluded(rawItem)) {
        const clean = sanitizeShoppingItemName(rawItem);
        if (!seen.has(clean)) {
          seen.add(clean);
          missingTotal++;
        }
      }
    });

    // Count missing from favorited recipes
    allRecipes.filter(r => favoritesState.has(r.id)).forEach(r => {
      const match = computeRecipeMatch(r);
      match.missing.forEach(m => {
        if (!isShoppingExcluded(m)) {
          const cleanName = sanitizeShoppingItemName(m.name);
          if (!seen.has(cleanName)) {
            seen.add(cleanName);
            missingTotal++;
          }
        }
      });
    });

    if (shoppingListBadge) shoppingListBadge.textContent = missingTotal;
    const navShopBadge = document.getElementById('navShopBadge');
    if (navShopBadge) {
      navShopBadge.textContent = missingTotal;
      navShopBadge.style.display = missingTotal > 0 ? 'inline-block' : 'none';
    }
  }

  function getFormattedShoppingListText(format = 'standard') {
    const categoryGroups = shoppingModalBody.querySelectorAll('.shopping-category-group, .store-aisle-group');
    if (categoryGroups.length === 0) return null;

    let listText = '🛒 Creami Cravings Grocery List:\n';
    categoryGroups.forEach(grp => {
      const title = grp.querySelector('.shopping-cat-title, .store-aisle-title')?.textContent || 'Groceries';
      const icon = grp.querySelector('.shopping-cat-icon, .store-aisle-icon')?.textContent || '🛒';
      const items = Array.from(grp.querySelectorAll('.shopping-item-name, .store-item-name')).map(n => n.textContent.trim());
      if (items.length > 0) {
        listText += `\n${icon} ${title}:\n`;
        items.forEach(it => {
          if (format === 'checklist') {
            listText += `- [ ] ${it}\n`;
          } else {
            listText += `  • ${it}\n`;
          }
        });
      }
    });
    return listText.trim();
  }

  function copyShoppingList() {
    const listText = getFormattedShoppingListText('checklist');
    if (!listText) {
      showToast('Shopping list is empty');
      return;
    }

    navigator.clipboard.writeText(listText).then(() => {
      showToast('📋 Copied checklist (- [ ] items) to clipboard!');
    }).catch(() => {
      showToast('Failed to copy list to clipboard');
    });
  }

  function shareShoppingList() {
    const listText = getFormattedShoppingListText('checklist');
    if (!listText) {
      showToast('Shopping list is empty');
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: '🛒 Creami Cravings Grocery List',
        text: listText
      }).then(() => {
        showToast('📲 Shared to Notes / Reminders!');
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          copyShoppingList();
        }
      });
    } else {
      navigator.clipboard.writeText(listText).then(() => {
        showToast('📋 Copied checklist! Paste directly into Apple Notes or Reminders.');
      }).catch(() => {
        showToast('Failed to copy list to clipboard');
      });
    }
  }

  function exportToGoogleKeep() {
    const listText = getFormattedShoppingListText('checklist');
    if (!listText) {
      showToast('Shopping list is empty');
      return;
    }

    navigator.clipboard.writeText(listText).then(() => {
      showToast('📝 Checklist copied! Opening Google Keep in a new tab...');
      window.open('https://keep.google.com/', '_blank');
    }).catch(() => {
      window.open('https://keep.google.com/', '_blank');
    });
  }

  function printShoppingList() {
    window.print();
  }

  // --- Build-A-Pint Balancing Wizard & Creaminess Score (Roadmap Item 18) ---
  const BAP_DATA = {
    liquids: [
      {
        id: 'fairlife_nonfat',
        name: 'Fairlife Nonfat Milk',
        icon: '🥛',
        desc: 'Ultra-filtered, 13g protein per cup. Dense natural casein structure.',
        unit: 'g',
        defaultQty16: 380,
        defaultQty24: 570,
        step: 10,
        min: 150,
        max: 650,
        per100: { kcal: 40, p: 6.8, c: 3.2, f: 0 },
        fatScore: 0.2,
        caseinScore: 1.0,
        stabilizerScore: 0.2
      },
      {
        id: 'fairlife_2pct',
        name: 'Fairlife 2% Reduced Fat',
        icon: '🥛',
        desc: 'Balanced milkfat & high protein. Shaves into luscious gelato texture.',
        unit: 'g',
        defaultQty16: 380,
        defaultQty24: 570,
        step: 10,
        min: 150,
        max: 650,
        per100: { kcal: 60, p: 6.8, c: 3.2, f: 2.4 },
        fatScore: 1.8,
        caseinScore: 1.0,
        stabilizerScore: 0.4
      },
      {
        id: 'fairlife_whole',
        name: 'Fairlife Whole Milk',
        icon: '🥛',
        desc: 'Rich whole milkfat solids. Gourmet ice cream parlor richness.',
        unit: 'g',
        defaultQty16: 380,
        defaultQty24: 570,
        step: 10,
        min: 150,
        max: 650,
        per100: { kcal: 78, p: 6.8, c: 3.2, f: 4.5 },
        fatScore: 2.8,
        caseinScore: 1.0,
        stabilizerScore: 0.6
      },
      {
        id: 'almond_milk',
        name: 'Unsweetened Almond Milk',
        icon: '🌰',
        desc: 'Ultra-low calorie (30-45 kcal). Watery; strongly requires a stabilizer.',
        unit: 'g',
        defaultQty16: 360,
        defaultQty24: 540,
        step: 10,
        min: 150,
        max: 650,
        per100: { kcal: 13, p: 0.4, c: 0.3, f: 1.0 },
        fatScore: 0.3,
        caseinScore: 0,
        stabilizerScore: 0
      },
      {
        id: 'oat_milk',
        name: 'Oat Milk (Barista / Creamy)',
        icon: '🌾',
        desc: 'Naturally sweet with beta-glucan soluble fibers that coat shaved ice.',
        unit: 'g',
        defaultQty16: 380,
        defaultQty24: 570,
        step: 10,
        min: 150,
        max: 650,
        per100: { kcal: 60, p: 1.0, c: 8.0, f: 2.5 },
        fatScore: 1.2,
        caseinScore: 0,
        stabilizerScore: 0.8
      },
      {
        id: 'rtd_shake',
        name: 'RTD Protein Shake (Core Power/Premier)',
        icon: '💪',
        desc: 'Pre-blended liquid base with 26-30g protein and natural stabilizers.',
        unit: 'g',
        defaultQty16: 340,
        defaultQty24: 510,
        step: 10,
        min: 150,
        max: 650,
        per100: { kcal: 47, p: 7.6, c: 1.5, f: 0.9 },
        fatScore: 0.8,
        caseinScore: 1.0,
        stabilizerScore: 0.8
      },
      {
        id: 'coconut_milk',
        name: 'Canned Coconut Milk (Light)',
        icon: '🥥',
        desc: 'Plant-based medium-chain fats that freeze into velvety ice cream.',
        unit: 'g',
        defaultQty16: 360,
        defaultQty24: 540,
        step: 10,
        min: 150,
        max: 650,
        per100: { kcal: 65, p: 0.6, c: 1.5, f: 6.5 },
        fatScore: 2.8,
        caseinScore: 0,
        stabilizerScore: 0.8
      }
    ],
    powders: [
      {
        id: 'whey_casein',
        name: 'Whey/Casein Blend (PEScience/Quest)',
        icon: '⭐',
        desc: 'The #1 Creami secret. Casein absorbs water and forms thick velvet pudding.',
        unit: 'g',
        defaultQty16: 31,
        defaultQty24: 46,
        step: 5,
        min: 10,
        max: 70,
        serving: 31,
        perServing: { kcal: 120, p: 24, c: 2, f: 1.5 },
        caseinScore: 1.5
      },
      {
        id: 'casein_pure',
        name: '100% Micellar Casein',
        icon: '🥛',
        desc: 'Absorbs huge amounts of liquid for ultra-thick soft-serve.',
        unit: 'g',
        defaultQty16: 30,
        defaultQty24: 45,
        step: 5,
        min: 10,
        max: 70,
        serving: 30,
        perServing: { kcal: 115, p: 24, c: 1, f: 0.5 },
        caseinScore: 1.5
      },
      {
        id: 'whey_isolate',
        name: '100% Whey Protein Isolate',
        icon: '⚡',
        desc: 'Ultra-pure protein. Low fat; pairs best with xanthan or pudding mix.',
        unit: 'g',
        defaultQty16: 30,
        defaultQty24: 45,
        step: 5,
        min: 10,
        max: 70,
        serving: 30,
        perServing: { kcal: 110, p: 25, c: 1, f: 0.5 },
        caseinScore: 0.6
      },
      {
        id: 'plant_protein',
        name: 'Plant Protein (Pea/Brown Rice)',
        icon: '🌱',
        desc: 'Dense plant proteins. High water absorption prevents melting.',
        unit: 'g',
        defaultQty16: 32,
        defaultQty24: 48,
        step: 5,
        min: 10,
        max: 70,
        serving: 32,
        perServing: { kcal: 125, p: 24, c: 3, f: 2 },
        caseinScore: 0.8
      },
      {
        id: 'dutch_cocoa',
        name: 'Dutch-Process Dark Cocoa',
        icon: '🍫',
        desc: 'Adds rich fudge flavor and natural cocoa fiber solids.',
        unit: 'g',
        defaultQty16: 15,
        defaultQty24: 22,
        step: 5,
        min: 5,
        max: 40,
        serving: 15,
        perServing: { kcal: 45, p: 3, c: 8, f: 1.8 },
        caseinScore: 0.4
      },
      {
        id: 'black_cocoa',
        name: 'Black Cocoa Powder (Oreo Wafer)',
        icon: '🖤',
        desc: 'Authentic Nabisco Oreo flavor without added sugar or calories.',
        unit: 'g',
        defaultQty16: 15,
        defaultQty24: 22,
        step: 5,
        min: 5,
        max: 40,
        serving: 15,
        perServing: { kcal: 40, p: 3, c: 7, f: 1.5 },
        caseinScore: 0.4
      },
      {
        id: 'pb_fit',
        name: 'PB Fit / Peanut Butter Powder',
        icon: '🥜',
        desc: 'De-fatted peanut flour adds authentic peanut butter taste and thickness.',
        unit: 'g',
        defaultQty16: 16,
        defaultQty24: 24,
        step: 4,
        min: 8,
        max: 50,
        serving: 16,
        perServing: { kcal: 70, p: 8, c: 5, f: 2 },
        caseinScore: 0.5
      },
      {
        id: 'espresso_powder',
        name: 'Instant Espresso Powder',
        icon: '☕',
        desc: 'Intense barista espresso depth that cuts through rich dairy.',
        unit: 'g',
        defaultQty16: 4,
        defaultQty24: 6,
        step: 2,
        min: 2,
        max: 15,
        serving: 4,
        perServing: { kcal: 10, p: 0.5, c: 2, f: 0 },
        caseinScore: 0
      }
    ],
    stabilizers: [
      {
        id: 'xanthan_gum',
        name: 'Xanthan Gum',
        icon: '🧪',
        desc: 'Binds free water molecules, completely preventing rock-hard ice sheets.',
        unit: 'g',
        defaultQty16: 1,
        defaultQty24: 1.5,
        step: 0.5,
        min: 0.5,
        max: 3,
        serving: 1,
        perServing: { kcal: 3, p: 0, c: 1, f: 0 },
        stabilizerScore: 1.8
      },
      {
        id: 'guar_gum',
        name: 'Guar Gum',
        icon: '🌿',
        desc: 'Cold-hydrating natural galactomannan. Creates a smooth, creamy pull.',
        unit: 'g',
        defaultQty16: 1,
        defaultQty24: 1.5,
        step: 0.5,
        min: 0.5,
        max: 3,
        serving: 1,
        perServing: { kcal: 3, p: 0, c: 1, f: 0 },
        stabilizerScore: 1.8
      },
      {
        id: 'pudding_mix',
        name: 'Sugar-Free Pudding Mix',
        icon: '🍮',
        desc: 'Modified food starches turn liquids into instant custard consistency.',
        unit: 'g',
        defaultQty16: 7,
        defaultQty24: 11,
        step: 2,
        min: 4,
        max: 20,
        serving: 7,
        perServing: { kcal: 20, p: 0, c: 6, f: 0 },
        stabilizerScore: 1.5
      },
      {
        id: 'greek_yogurt',
        name: '0% Nonfat Plain Greek Yogurt',
        icon: '🥣',
        desc: 'Adds tangy creaminess and dense dairy solids without any fat.',
        unit: 'g',
        defaultQty16: 50,
        defaultQty24: 75,
        step: 10,
        min: 20,
        max: 120,
        serving: 50,
        perServing: { kcal: 30, p: 5, c: 2, f: 0 },
        stabilizerScore: 1.0
      },
      {
        id: 'cream_cheese',
        name: 'Light Cream Cheese / Neufchâtel',
        icon: '🧀',
        desc: 'Natural dairy fat & lactic culture. Emulsifies into gourmet cheesecake body.',
        unit: 'g',
        defaultQty16: 30,
        defaultQty24: 45,
        step: 5,
        min: 15,
        max: 75,
        serving: 30,
        perServing: { kcal: 60, p: 2, c: 2, f: 5 },
        stabilizerScore: 1.5
      },
      {
        id: 'cottage_cheese',
        name: 'Low-Fat Cottage Cheese (Blended)',
        icon: '🍦',
        desc: 'The viral Creami hack: rich, velvety volume and protein with minimal fat.',
        unit: 'g',
        defaultQty16: 50,
        defaultQty24: 75,
        step: 10,
        min: 25,
        max: 120,
        serving: 50,
        perServing: { kcal: 45, p: 6, c: 2, f: 1 },
        stabilizerScore: 1.2
      },
      {
        id: 'heavy_cream',
        name: 'Splash of Heavy Cream',
        icon: '🧈',
        desc: 'Dairy butterfat coats the Creami blade to shave micro-emulsions.',
        unit: 'ml',
        defaultQty16: 15,
        defaultQty24: 22,
        step: 5,
        min: 5,
        max: 45,
        serving: 15,
        perServing: { kcal: 50, p: 0, c: 0, f: 5 },
        stabilizerScore: 1.2
      }
    ],
    sweeteners: [
      {
        id: 'allulose',
        name: 'Allulose (Freezing Point Depressor)',
        icon: '✨',
        desc: 'Pure rare sugar: depresses freezing point like real sugar with 0 net carbs & 0 kcal!',
        unit: 'g',
        defaultQty16: 20,
        defaultQty24: 30,
        step: 5,
        min: 5,
        max: 45,
        serving: 20,
        perServing: { kcal: 0, p: 0, c: 20, f: 0 },
        freezingScore: 1.0
      },
      {
        id: 'monkfruit',
        name: 'Monk Fruit / Erythritol Sweetener',
        icon: '🍃',
        desc: 'Zero-calorie, zero-glycemic sweetness without bitterness.',
        unit: 'g',
        defaultQty16: 15,
        defaultQty24: 22,
        step: 5,
        min: 5,
        max: 40,
        serving: 15,
        perServing: { kcal: 0, p: 0, c: 15, f: 0 },
        freezingScore: 0.5
      },
      {
        id: 'maple_syrup',
        name: 'Pure Maple Syrup or Honey',
        icon: '🍁',
        desc: 'Natural invert sugars that soften ice crystal bonding.',
        unit: 'g',
        defaultQty16: 20,
        defaultQty24: 30,
        step: 5,
        min: 5,
        max: 50,
        serving: 20,
        perServing: { kcal: 60, p: 0, c: 17, f: 0 },
        freezingScore: 0.8
      },
      {
        id: 'vanilla_extract',
        name: 'Pure Vanilla Extract',
        icon: '🌼',
        desc: 'Alcohol extract base that rounds out all flavors.',
        unit: 'g',
        defaultQty16: 5,
        defaultQty24: 7,
        step: 1,
        min: 2,
        max: 15,
        serving: 5,
        perServing: { kcal: 12, p: 0, c: 1, f: 0 },
        freezingScore: 0.2
      }
    ],
    mixins: [
      {
        id: 'oreos',
        name: 'Crushed Oreo Cookies',
        icon: '🍪',
        desc: 'Roughly crushed sandwich cookies folded in on the "Mix-In" spin.',
        unit: 'g',
        defaultQty16: 15,
        defaultQty24: 22,
        step: 5,
        min: 5,
        max: 45,
        serving: 15,
        perServing: { kcal: 75, p: 1, c: 11, f: 3.5 },
        isMixin: true
      },
      {
        id: 'mini_chips',
        name: 'Mini Chocolate Chips',
        icon: '🍫',
        desc: 'Mini chips shatter into stracciatella flakes instead of tooth-breakers.',
        unit: 'g',
        defaultQty16: 15,
        defaultQty24: 22,
        step: 5,
        min: 5,
        max: 45,
        serving: 15,
        perServing: { kcal: 70, p: 1, c: 9, f: 4.5 },
        isMixin: true
      },
      {
        id: 'pb_cups',
        name: 'Chopped Peanut Butter Cups',
        icon: '🥜',
        desc: 'Rich chocolate peanut butter pockets throughout your pint.',
        unit: 'g',
        defaultQty16: 17,
        defaultQty24: 25,
        step: 5,
        min: 5,
        max: 50,
        serving: 17,
        perServing: { kcal: 90, p: 2, c: 10, f: 5 },
        isMixin: true
      },
      {
        id: 'graham_crackers',
        name: 'Crushed Graham Crackers',
        icon: '🥧',
        desc: 'Sweet honey-graham crust crunch.',
        unit: 'g',
        defaultQty16: 15,
        defaultQty24: 22,
        step: 5,
        min: 5,
        max: 45,
        serving: 15,
        perServing: { kcal: 65, p: 1, c: 11, f: 1.5 },
        isMixin: true
      },
      {
        id: 'sprinkles',
        name: 'Rainbow Sprinkles',
        icon: '🎉',
        desc: 'Colorful funfetti crunch for birthday cake pints.',
        unit: 'g',
        defaultQty16: 10,
        defaultQty24: 15,
        step: 2,
        min: 4,
        max: 30,
        serving: 10,
        perServing: { kcal: 40, p: 0, c: 9, f: 1 },
        isMixin: true
      },
      {
        id: 'cinnamon_toast_crunch',
        name: 'Cinnamon Toast Crunch',
        icon: '🥣',
        desc: 'Crispy cinnamon-sugar cereal crunch folded during the mix-in spin.',
        unit: 'g',
        defaultQty16: 20,
        defaultQty24: 30,
        step: 5,
        min: 5,
        max: 50,
        serving: 20,
        perServing: { kcal: 82, p: 1, c: 16, f: 2 },
        isMixin: true
      }
    ]
  };

  let bapState = {
    currentStep: 1,
    size: '16',
    selectedLiquid: 'fairlife_nonfat',
    liquidQty: 380,
    selectedPowders: {},
    selectedStabilizers: { xanthan_gum: 1 },
    selectedSweeteners: { allulose: 20, vanilla_extract: 5 },
    selectedMixins: {},
    customLiquids: [],
    customPowders: [],
    customStabilizers: [],
    customSweeteners: [],
    customMixins: []
  };

  let bapInitialized = false;

  function setBapMode(mode) {
    const btnWizard = document.getElementById('btnModeWizard');
    const btnManual = document.getElementById('btnModeManual');
    const wizardCont = document.getElementById('wizardContainer');
    const manualCont = document.getElementById('manualFormContainer');
    const modalMainTitle = document.getElementById('bapModalMainTitle');
    const modalSubTitle = document.getElementById('bapModalSubTitle');

    if (mode === 'wizard') {
      if (btnWizard) btnWizard.classList.add('active');
      if (btnManual) btnManual.classList.remove('active');
      if (wizardCont) wizardCont.style.display = 'block';
      if (manualCont) manualCont.style.display = 'none';
      if (modalMainTitle) modalMainTitle.textContent = '🧪 Build-A-Pint Balancing Wizard';
      if (modalSubTitle) modalSubTitle.textContent = 'Formulate balanced, high-protein custom Creami recipes with real-time texture diagnostics, Creaminess Score (1–10), and auto-computed nutrition.';
    } else {
      if (btnWizard) btnWizard.classList.remove('active');
      if (btnManual) btnManual.classList.add('active');
      if (wizardCont) wizardCont.style.display = 'none';
      if (manualCont) manualCont.style.display = 'block';
      if (modalMainTitle) modalMainTitle.textContent = '📝 Manual Custom Recipe';
      if (modalSubTitle) modalSubTitle.textContent = '🔒 Tied exclusively to your signed-in Google account. Personal recipes remain strictly private.';
    }
  }

  function setBapSize(size) {
    bapState.size = size;
    const btn16 = document.getElementById('bapSize16');
    const btn24 = document.getElementById('bapSize24');
    if (btn16 && btn24) {
      btn16.classList.toggle('active', size === '16');
      btn24.classList.toggle('active', size === '24');
    }

    // Scale current liquid quantity
    const allLiquids = [...BAP_DATA.liquids, ...(bapState.customLiquids || [])];
    const liquid = allLiquids.find(l => l.id === bapState.selectedLiquid);
    if (liquid) {
      bapState.liquidQty = size === '24' ? liquid.defaultQty24 : liquid.defaultQty16;
    }

    renderBapGrids();
    updateBapHUD();
  }

  function switchBapStep(stepNum) {
    const target = Math.max(1, Math.min(4, stepNum));
    bapState.currentStep = target;

    // Update Step Pills
    document.querySelectorAll('.bap-step-pill').forEach(pill => {
      const pStep = parseInt(pill.dataset.step);
      pill.classList.toggle('active', pStep === target);
    });

    // Update Step Content Panels
    for (let i = 1; i <= 4; i++) {
      const panel = document.getElementById(`bapStep${i}`);
      if (panel) {
        panel.style.display = (i === target) ? 'block' : 'none';
        if (i === target) panel.classList.add('active');
      }
    }

    // Update Prev / Next Buttons
    const btnPrev = document.getElementById('bapBtnPrev');
    const btnNext = document.getElementById('bapBtnNext');
    if (btnPrev) btnPrev.style.display = (target > 1) ? 'inline-flex' : 'none';
    if (btnNext) btnNext.style.display = (target < 4) ? 'inline-flex' : 'none';
  }

  function renderBapCard(item, isSelected, currentQty, onSelect, onQtyChange, onRemove) {
    const card = document.createElement('div');
    card.className = `bap-card ${isSelected ? 'active' : ''} ${item.isCustom ? 'is-custom' : ''}`;

    const macroText = item.per100 
      ? `${item.per100.kcal} kcal/100g • ${item.per100.p}g P` 
      : `${item.perServing ? item.perServing.kcal : 0} kcal • ${item.perServing ? item.perServing.p : 0}g P`;

    const customTag = item.isCustom ? `<span class="bap-custom-tag">Custom</span>` : '';
    const removeBtn = item.isCustom ? `<button type="button" class="bap-card-remove-custom" title="Remove custom ingredient">✕</button>` : '';

    card.innerHTML = `
      ${removeBtn}
      <div class="bap-card-check">✓</div>
      <div>
        <div class="bap-card-icon">${item.icon || '✨'}</div>
        <div class="bap-card-title">${item.name} ${customTag}</div>
        <div class="bap-card-desc">${item.desc}</div>
      </div>
      <div>
        <div class="bap-card-macros">${macroText}</div>
        ${isSelected ? `
          <div class="bap-card-stepper">
            <button type="button" class="bap-stepper-btn btn-minus">−</button>
            <span class="bap-stepper-val">${currentQty}${item.unit}</span>
            <button type="button" class="bap-stepper-btn btn-plus">+</button>
          </div>
        ` : ''}
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.bap-stepper-btn') || e.target.closest('.bap-card-remove-custom')) return;
      onSelect(item);
    });

    if (item.isCustom && onRemove) {
      const rm = card.querySelector('.bap-card-remove-custom');
      if (rm) {
        rm.addEventListener('click', (e) => {
          e.stopPropagation();
          onRemove(item);
        });
      }
    }

    const minusBtn = card.querySelector('.btn-minus');
    if (minusBtn) {
      minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stepVal = item.step || 5;
        const minVal = item.min || 1;
        const newQty = Math.max(minVal, currentQty - stepVal);
        onQtyChange(item, newQty);
      });
    }

    const plusBtn = card.querySelector('.btn-plus');
    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stepVal = item.step || 5;
        const maxVal = item.max || 1000;
        const newQty = Math.min(maxVal, currentQty + stepVal);
        onQtyChange(item, newQty);
      });
    }

    return card;
  }

  function renderBapGrids() {
    const isDeluxe = bapState.size === '24';
    if (!bapState.customLiquids) bapState.customLiquids = [];
    if (!bapState.customPowders) bapState.customPowders = [];
    if (!bapState.customStabilizers) bapState.customStabilizers = [];
    if (!bapState.customSweeteners) bapState.customSweeteners = [];
    if (!bapState.customMixins) bapState.customMixins = [];

    // 1. Liquids Grid
    const liquidsGrid = document.getElementById('bapGridLiquids');
    if (liquidsGrid) {
      liquidsGrid.innerHTML = '';
      const allLiquids = [...BAP_DATA.liquids, ...bapState.customLiquids];
      allLiquids.forEach(liquid => {
        const isSelected = bapState.selectedLiquid === liquid.id;
        const currentQty = isSelected ? bapState.liquidQty : (isDeluxe ? liquid.defaultQty24 : liquid.defaultQty16);
        const card = renderBapCard(liquid, isSelected, currentQty, 
          (l) => {
            bapState.selectedLiquid = l.id;
            bapState.liquidQty = isDeluxe ? l.defaultQty24 : l.defaultQty16;
            renderBapGrids();
            updateBapHUD();
          },
          (l, qty) => {
            bapState.liquidQty = qty;
            renderBapGrids();
            updateBapHUD();
          },
          (l) => removeBapCustomItem(l.id)
        );
        liquidsGrid.appendChild(card);
      });
    }

    // 2. Powders Grid
    const powdersGrid = document.getElementById('bapGridPowders');
    if (powdersGrid) {
      powdersGrid.innerHTML = '';
      const allPowders = [...BAP_DATA.powders, ...bapState.customPowders];
      allPowders.forEach(powder => {
        const isSelected = bapState.selectedPowders[powder.id] !== undefined;
        const currentQty = isSelected ? bapState.selectedPowders[powder.id] : (isDeluxe ? powder.defaultQty24 : powder.defaultQty16);
        const card = renderBapCard(powder, isSelected, currentQty,
          (p) => {
            if (bapState.selectedPowders[p.id]) {
              delete bapState.selectedPowders[p.id];
            } else {
              bapState.selectedPowders[p.id] = isDeluxe ? p.defaultQty24 : p.defaultQty16;
            }
            renderBapGrids();
            updateBapHUD();
          },
          (p, qty) => {
            bapState.selectedPowders[p.id] = qty;
            renderBapGrids();
            updateBapHUD();
          },
          (p) => removeBapCustomItem(p.id)
        );
        powdersGrid.appendChild(card);
      });
    }

    // 3. Stabilizers Grid
    const stabGrid = document.getElementById('bapGridStabilizers');
    if (stabGrid) {
      stabGrid.innerHTML = '';
      const allStabs = [...BAP_DATA.stabilizers, ...bapState.customStabilizers];
      allStabs.forEach(stab => {
        const isSelected = bapState.selectedStabilizers[stab.id] !== undefined;
        const currentQty = isSelected ? bapState.selectedStabilizers[stab.id] : (isDeluxe ? stab.defaultQty24 : stab.defaultQty16);
        const card = renderBapCard(stab, isSelected, currentQty,
          (s) => {
            if (bapState.selectedStabilizers[s.id]) {
              delete bapState.selectedStabilizers[s.id];
            } else {
              bapState.selectedStabilizers[s.id] = isDeluxe ? s.defaultQty24 : s.defaultQty16;
            }
            renderBapGrids();
            updateBapHUD();
          },
          (s, qty) => {
            bapState.selectedStabilizers[s.id] = qty;
            renderBapGrids();
            updateBapHUD();
          },
          (s) => removeBapCustomItem(s.id)
        );
        stabGrid.appendChild(card);
      });
    }

    // 4. Sweeteners Grid
    const sweetGrid = document.getElementById('bapGridSweeteners');
    if (sweetGrid) {
      sweetGrid.innerHTML = '';
      const allSweeteners = [...BAP_DATA.sweeteners, ...bapState.customSweeteners];
      allSweeteners.forEach(sw => {
        const isSelected = bapState.selectedSweeteners[sw.id] !== undefined;
        const currentQty = isSelected ? bapState.selectedSweeteners[sw.id] : (isDeluxe ? sw.defaultQty24 : sw.defaultQty16);
        const card = renderBapCard(sw, isSelected, currentQty,
          (item) => {
            if (bapState.selectedSweeteners[item.id]) {
              delete bapState.selectedSweeteners[item.id];
            } else {
              bapState.selectedSweeteners[item.id] = isDeluxe ? item.defaultQty24 : item.defaultQty16;
            }
            renderBapGrids();
            updateBapHUD();
          },
          (item, qty) => {
            bapState.selectedSweeteners[item.id] = qty;
            renderBapGrids();
            updateBapHUD();
          },
          (sw) => removeBapCustomItem(sw.id)
        );
        sweetGrid.appendChild(card);
      });
    }

    // 5. Mixins Grid
    const mixinsGrid = document.getElementById('bapGridMixins');
    if (mixinsGrid) {
      mixinsGrid.innerHTML = '';
      const allMixins = [...BAP_DATA.mixins, ...bapState.customMixins];
      allMixins.forEach(mix => {
        const isSelected = bapState.selectedMixins[mix.id] !== undefined;
        const currentQty = isSelected ? bapState.selectedMixins[mix.id] : (isDeluxe ? mix.defaultQty24 : mix.defaultQty16);
        const card = renderBapCard(mix, isSelected, currentQty,
          (item) => {
            if (bapState.selectedMixins[item.id]) {
              delete bapState.selectedMixins[item.id];
            } else {
              bapState.selectedMixins[item.id] = isDeluxe ? item.defaultQty24 : item.defaultQty16;
            }
            renderBapGrids();
            updateBapHUD();
          },
          (item, qty) => {
            bapState.selectedMixins[item.id] = qty;
            renderBapGrids();
            updateBapHUD();
          },
          (m) => removeBapCustomItem(m.id)
        );
        mixinsGrid.appendChild(card);
      });
    }
  }

  function calculateBapNutritionAndScore() {
    let totalKcal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    let fatScore = 0;
    let stabilizerScore = 0;
    let caseinScore = 0;
    let freezingScore = 0;

    const allLiquids = [...BAP_DATA.liquids, ...(bapState.customLiquids || [])];
    const allPowders = [...BAP_DATA.powders, ...(bapState.customPowders || [])];
    const allStabs = [...BAP_DATA.stabilizers, ...(bapState.customStabilizers || [])];
    const allSweeteners = [...BAP_DATA.sweeteners, ...(bapState.customSweeteners || [])];
    const allMixins = [...BAP_DATA.mixins, ...(bapState.customMixins || [])];

    // Liquid
    const liquid = allLiquids.find(l => l.id === bapState.selectedLiquid);
    if (liquid) {
      const factor = bapState.liquidQty / 100;
      const p100 = liquid.per100 || { kcal: 45, p: 3, c: 4, f: 1.5 };
      totalKcal += p100.kcal * factor;
      totalProtein += p100.p * factor;
      totalCarbs += p100.c * factor;
      totalFat += p100.f * factor;

      fatScore += (liquid.fatScore || 0);
      stabilizerScore += (liquid.stabilizerScore || 0);
      caseinScore += (liquid.caseinScore || 0);
    }

    // Powders
    Object.entries(bapState.selectedPowders).forEach(([id, qty]) => {
      const p = allPowders.find(x => x.id === id);
      if (p && qty > 0) {
        const factor = qty / (p.serving || 30);
        const pServ = p.perServing || { kcal: 40, p: 8, c: 1, f: 0.5 };
        totalKcal += pServ.kcal * factor;
        totalProtein += pServ.p * factor;
        totalCarbs += pServ.c * factor;
        totalFat += pServ.f * factor;

        caseinScore += (p.caseinScore || 0);
      }
    });

    // Stabilizers
    Object.entries(bapState.selectedStabilizers).forEach(([id, qty]) => {
      const s = allStabs.find(x => x.id === id);
      if (s && qty > 0) {
        const factor = qty / (s.serving || 1);
        const pServ = s.perServing || { kcal: 5, p: 0, c: 1, f: 0 };
        totalKcal += pServ.kcal * factor;
        totalProtein += pServ.p * factor;
        totalCarbs += pServ.c * factor;
        totalFat += pServ.f * factor;

        stabilizerScore += (s.stabilizerScore || 0.6);
      }
    });

    // Sweeteners
    Object.entries(bapState.selectedSweeteners).forEach(([id, qty]) => {
      const sw = allSweeteners.find(x => x.id === id);
      if (sw && qty > 0) {
        const factor = qty / (sw.serving || 10);
        const pServ = sw.perServing || { kcal: 5, p: 0, c: 1, f: 0 };
        totalKcal += pServ.kcal * factor;
        totalProtein += pServ.p * factor;
        totalCarbs += pServ.c * factor;
        totalFat += pServ.f * factor;

        freezingScore += (sw.freezingScore || 0.2);
      }
    });

    // Mixins
    Object.entries(bapState.selectedMixins).forEach(([id, qty]) => {
      const m = allMixins.find(x => x.id === id);
      if (m && qty > 0) {
        const factor = qty / (m.serving || 20);
        const pServ = m.perServing || { kcal: 50, p: 1, c: 8, f: 2 };
        totalKcal += pServ.kcal * factor;
        totalProtein += pServ.p * factor;
        totalCarbs += pServ.c * factor;
        totalFat += pServ.f * factor;
      }
    });

    // Calculate Creaminess Score (1.0 to 10.0)
    let dynamicFatBonus = 0.3;
    if (totalFat >= 12) dynamicFatBonus = 3.5;
    else if (totalFat >= 8) dynamicFatBonus = 3.0;
    else if (totalFat >= 5) dynamicFatBonus = 2.4;
    else if (totalFat >= 3) dynamicFatBonus = 1.7;
    else if (totalFat >= 1) dynamicFatBonus = 1.0;

    const cappedFat = Math.max(dynamicFatBonus, Math.min(3.5, fatScore));
    const cappedStab = Math.min(3.5, stabilizerScore);
    const cappedCasein = Math.min(2.0, caseinScore);
    const cappedFreeze = Math.min(1.0, freezingScore);

    const rawScore = 1.0 + cappedFat + cappedStab + cappedCasein + cappedFreeze;
    const creaminessScore = Math.min(10.0, Math.max(1.0, Math.round(rawScore * 10) / 10));

    // Determine Grade & Tip
    let grade = 'Balanced Soft-Serve';
    let tip = '';
    let recommendedSpin = 'Lite Ice Cream';

    const hasStabilizer = Object.keys(bapState.selectedStabilizers).length > 0 || (liquid && liquid.stabilizerScore >= 0.6);

    if (!hasStabilizer && totalFat < 3) {
      grade = '⚠️ Icy / Snow Warning';
      tip = '⚠️ Ice Crystal Alert: No stabilizer (pudding mix, xanthan gum, or dairy fats) detected. Shaving will result in dry powdery snow. Add 1g xanthan gum or 7g sugar-free pudding mix!';
      recommendedSpin = 'Lite Ice Cream';
    } else if (creaminessScore < 5.0) {
      grade = '❄️ Hard Freeze / Needs Respin';
      tip = '❄️ High water content detected. This pint will freeze into a hard block. Add protein powder, allulose, or a stabilizer to avoid having to respin 3+ times.';
      recommendedSpin = 'Lite Ice Cream';
    } else if (creaminessScore < 7.5) {
      grade = '🍦 Good Everyday Fitness Soft-Serve';
      tip = '🍦 Solid macro-friendly profile! Shaves nicely on "Lite Ice Cream". If slightly powdery after the 1st spin, add 1 tbsp liquid and hit "Respin".';
      recommendedSpin = 'Lite Ice Cream';
    } else if (creaminessScore < 9.0) {
      grade = '🍨 Creamy Gelato Grade';
      tip = '🍨 Excellent emulsion balance! Protein solids and stabilizers bind water molecules into thick, velvety ribbons with zero ice crystals.';
      recommendedSpin = totalFat >= 10 ? 'Ice Cream' : 'Lite Ice Cream';
    } else {
      grade = '🌟 Ultra-Decadent Custard Grade';
      tip = '🌟 Gourmet ice cream parlor consistency! High fat and optimal solids provide maximum mouthfeel lubrication. Spin on standard "Ice Cream".';
      recommendedSpin = 'Ice Cream';
    }

    return {
      totalKcal: Math.round(totalKcal),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      creaminessScore,
      grade,
      tip,
      recommendedSpin
    };
  }

  function updateBapHUD() {
    const nutrition = calculateBapNutritionAndScore();

    const scoreNum = document.getElementById('bapScoreNum');
    const scoreGrade = document.getElementById('bapScoreGrade');
    const meterBar = document.getElementById('bapMeterBar');
    const spinBadge = document.getElementById('bapSpinBadge');
    const scienceTip = document.getElementById('bapScienceTip');
    const macroKcal = document.getElementById('bapMacroKcal');
    const macroProtein = document.getElementById('bapMacroProtein');
    const macroCarbs = document.getElementById('bapMacroCarbs');
    const macroFat = document.getElementById('bapMacroFat');

    if (scoreNum) scoreNum.textContent = nutrition.creaminessScore.toFixed(1);
    if (scoreGrade) scoreGrade.textContent = nutrition.grade;
    if (meterBar) meterBar.style.width = `${Math.min(100, Math.round(nutrition.creaminessScore * 10))}%`;
    if (spinBadge) spinBadge.textContent = `🌀 ${nutrition.recommendedSpin}`;
    if (scienceTip) {
      scienceTip.textContent = nutrition.tip;
      if (nutrition.creaminessScore < 5.0 || nutrition.grade.includes('Warning')) {
        scienceTip.style.borderLeftColor = '#f59e0b';
      } else {
        scienceTip.style.borderLeftColor = '#34d399';
      }
    }

    if (macroKcal) macroKcal.textContent = nutrition.totalKcal;
    if (macroProtein) macroProtein.textContent = `${nutrition.totalProtein}g`;
    if (macroCarbs) macroCarbs.textContent = `${nutrition.totalCarbs}g`;
    if (macroFat) macroFat.textContent = `${nutrition.totalFat}g`;
  }

  function autoNameBapRecipe() {
    const allLiquids = [...BAP_DATA.liquids, ...(bapState.customLiquids || [])];
    const liquid = allLiquids.find(l => l.id === bapState.selectedLiquid);
    const powderKeys = Object.keys(bapState.selectedPowders);
    const stabilizerKeys = Object.keys(bapState.selectedStabilizers);
    const mixinKeys = Object.keys(bapState.selectedMixins);

    let flavor = 'Vanilla Silk';
    if (powderKeys.includes('black_cocoa') || mixinKeys.includes('oreos')) {
      flavor = 'Oreo Cookies & Cream';
    } else if (powderKeys.includes('pb_fit') || mixinKeys.includes('pb_cups')) {
      flavor = 'Chocolate Peanut Butter Cup';
    } else if (powderKeys.includes('dutch_cocoa') || mixinKeys.includes('mini_chips')) {
      flavor = 'Double Dark Chocolate Chunk';
    } else if (powderKeys.includes('espresso_powder')) {
      flavor = 'Barista Mocha Espresso';
    } else if (stabilizerKeys.includes('cream_cheese')) {
      flavor = 'Velvet Cheesecake Swirl';
    } else if (mixinKeys.includes('sprinkles')) {
      flavor = 'Birthday Cake Confetti';
    } else if (liquid && liquid.id === 'coconut_milk') {
      flavor = 'Toasted Coconut Gelato';
    }

    const baseName = liquid && liquid.id.includes('fairlife') ? 'Fairlife' : (liquid ? liquid.name.split(' ')[0] : 'Custom');
    const autoTitle = `${baseName} ${flavor}`;
    const input = document.getElementById('bapRecipeName');
    if (input) input.value = autoTitle;
    showToast(`✨ Generated recipe name: "${autoTitle}"`);
  }

  function saveBapRecipe() {
    if (!currentUser) {
      showToast('🔒 Please sign in with Google to save your balanced recipe to your account.');
      openGoogleAuthModal();
      return;
    }

    const titleInput = document.getElementById('bapRecipeName');
    let title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      autoNameBapRecipe();
      title = titleInput.value.trim() || 'Custom Balanced Creami';
    }

    const nutrition = calculateBapNutritionAndScore();
    const isDeluxe = bapState.size === '24';
    const allLiquids = [...BAP_DATA.liquids, ...(bapState.customLiquids || [])];
    const liquidObj = allLiquids.find(l => l.id === bapState.selectedLiquid) || allLiquids[0];

    const allPowders = [...BAP_DATA.powders, ...(bapState.customPowders || [])];
    const allStabs = [...BAP_DATA.stabilizers, ...(bapState.customStabilizers || [])];
    const allSweeteners = [...BAP_DATA.sweeteners, ...(bapState.customSweeteners || [])];
    const allMixins = [...BAP_DATA.mixins, ...(bapState.customMixins || [])];

    const parsedIngredients = [];
    const addedCustomItems = [];

    function recordCustomIfNew(item, catKey) {
      if (!item || !item.isCustom) return;
      const matched = findExistingPantryIngredient(item.name);
      if (matched && (matched.origin === 'master' || matched.origin === 'bap' || (matched.origin === 'pantry' && !matched.isCustom))) {
        return;
      }
      const catTitle = (typeof INGREDIENT_CATEGORIES !== 'undefined' && INGREDIENT_CATEGORIES[catKey]) 
        ? INGREDIENT_CATEGORIES[catKey] 
        : 'Pantry';
      if (!addedCustomItems.some(c => c.name.toLowerCase() === item.name.toLowerCase())) {
        addedCustomItems.push({ name: item.name, catTitle });
      }
    }

    // 1. Liquid
    const liquidCat = liquidObj.category || getIngredientCategoryKey(liquidObj.name, 'liquid');
    parsedIngredients.push({
      id: liquidObj.id,
      name: liquidObj.name,
      quantity: `${bapState.liquidQty}g`,
      unit: 'g',
      raw: `${bapState.liquidQty}g ${liquidObj.name}`,
      section: 'Base',
      isMixin: false,
      isCustom: !!liquidObj.isCustom,
      category: liquidCat,
      notes: ''
    });
    recordCustomIfNew(liquidObj, liquidCat);

    // 2. Powders
    Object.entries(bapState.selectedPowders).forEach(([id, qty]) => {
      const p = allPowders.find(x => x.id === id);
      if (p && qty > 0) {
        const cat = p.category || getIngredientCategoryKey(p.name, 'powder');
        parsedIngredients.push({
          id: p.id,
          name: p.name,
          quantity: `${qty}g`,
          unit: 'g',
          raw: `${qty}g ${p.name}`,
          section: 'Base',
          isMixin: false,
          isCustom: !!p.isCustom,
          category: cat,
          notes: ''
        });
        recordCustomIfNew(p, cat);
      }
    });

    // 3. Stabilizers
    Object.entries(bapState.selectedStabilizers).forEach(([id, qty]) => {
      const s = allStabs.find(x => x.id === id);
      if (s && qty > 0) {
        const cat = s.category || getIngredientCategoryKey(s.name, 'stabilizer');
        parsedIngredients.push({
          id: s.id,
          name: s.name,
          quantity: `${qty}${s.unit || 'g'}`,
          unit: s.unit || 'g',
          raw: `${qty}${s.unit || 'g'} ${s.name}`,
          section: 'Base',
          isMixin: false,
          isCustom: !!s.isCustom,
          category: cat,
          notes: ''
        });
        recordCustomIfNew(s, cat);
      }
    });

    // 4. Sweeteners
    Object.entries(bapState.selectedSweeteners).forEach(([id, qty]) => {
      const sw = allSweeteners.find(x => x.id === id);
      if (sw && qty > 0) {
        const cat = sw.category || getIngredientCategoryKey(sw.name, 'sweetener');
        parsedIngredients.push({
          id: sw.id,
          name: sw.name,
          quantity: `${qty}${sw.unit || 'g'}`,
          unit: sw.unit || 'g',
          raw: `${qty}${sw.unit || 'g'} ${sw.name}`,
          section: 'Base',
          isMixin: false,
          isCustom: !!sw.isCustom,
          category: cat,
          notes: ''
        });
        recordCustomIfNew(sw, cat);
      }
    });

    // 5. Mixins
    Object.entries(bapState.selectedMixins).forEach(([id, qty]) => {
      const m = allMixins.find(x => x.id === id);
      if (m && qty > 0) {
        const cat = m.category || getIngredientCategoryKey(m.name, 'mixin');
        parsedIngredients.push({
          id: m.id,
          name: m.name,
          quantity: `${qty}g`,
          unit: 'g',
          raw: `${qty}g ${m.name} (Mix-in)`,
          section: 'Mix-in',
          isMixin: true,
          isCustom: !!m.isCustom,
          category: cat,
          notes: ''
        });
        recordCustomIfNew(m, cat);
      }
    });

    const powderNames = Object.keys(bapState.selectedPowders).map(id => allPowders.find(p => p.id === id)?.name).filter(Boolean);
    const stabilizerNames = Object.keys(bapState.selectedStabilizers).map(id => allStabs.find(s => s.id === id)?.name).filter(Boolean);
    const mixinNames = Object.keys(bapState.selectedMixins).map(id => allMixins.find(m => m.id === id)?.name).filter(Boolean);

    const instructions = [];
    instructions.push(`Pour ${bapState.liquidQty}g ${liquidObj.name} into your ${isDeluxe ? 'Deluxe 24 oz' : 'Standard 16 oz'} Ninja Creami pint.`);
    if (powderNames.length > 0 || stabilizerNames.length > 0) {
      const dryItems = [...powderNames, ...stabilizerNames].join(', ');
      instructions.push(`Add ${dryItems}. Blend with an immersion blender or milk frother for 30–45 seconds until completely smooth.`);
    }
    instructions.push('Smooth top surface flat with a spatula, secure storage lid, and freeze on a level freezer shelf for 16+ hours.');
    instructions.push(`Lock pint into outer bowl and spin on the "${nutrition.recommendedSpin}" program.`);
    if (mixinNames.length > 0) {
      instructions.push(`Make a 1.5-inch hollow core down to the bottom center of the pint.`);
      instructions.push(`Add ${mixinNames.join(', ')} into the core and press the "Mix-In" program.`);
    } else {
      instructions.push('If texture is slightly powdery or crumbly after the first spin, add 1 tbsp liquid and press "Respin".');
    }
    instructions.push('Grab a spoon and enjoy your custom balanced Creami creation!');

    const chosenCat = (document.getElementById('bapCategory') ? document.getElementById('bapCategory').value : 'Custom') || 'Custom';
    const { finalCategory, creatorId: recipeCreatorId } = validateAndResolveRecipeCategory(chosenCat);
    const isPersonalRecipe = (finalCategory === 'Custom');

    const matchedBook = (typeof BOOKS_MASTER !== 'undefined' && !isPersonalRecipe)
      ? BOOKS_MASTER.find(b => b.categoryKey === finalCategory || (b.categories && b.categories.includes(finalCategory)))
      : null;
    const recipeSourceFile = isPersonalRecipe 
      ? 'Personal Custom' 
      : (matchedBook ? matchedBook.title : finalCategory);

    const bapVideoUrl = document.getElementById('bapVideoUrl') ? document.getElementById('bapVideoUrl').value.trim() : '';

    const newRecipe = {
      id: isPersonalRecipe ? `custom_${currentUser.id}_${Date.now()}` : `pub_${currentUser.id}_${Date.now()}`,
      name: title,
      category: finalCategory,
      categories: [finalCategory],
      userId: currentUser.id,
      isPersonal: isPersonalRecipe,
      sourceFile: recipeSourceFile,
      creatorId: recipeCreatorId,
      videoUrl: bapVideoUrl,
      page: 1,
      macros: {
        calories: String(nutrition.totalKcal),
        protein: `${nutrition.totalProtein}g`,
        carbs: `${nutrition.totalCarbs}g`,
        fat: `${nutrition.totalFat}g`,
        sugar: '0g',
        fiber: '0g'
      },
      spinSetting: nutrition.recommendedSpin,
      prepTime: '2 MIN',
      freezeTime: '16+ HOURS',
      makes: isDeluxe ? '1 DELUXE PINT (24 oz)' : '1 PINT (16 oz)',
      ingredients: parsedIngredients,
      instructions: instructions,
      creaminessScore: nutrition.creaminessScore,
      creaminessGrade: nutrition.grade
    };

    customRecipesState.push(newRecipe);

    // If publishing to an official book, push to server immediately
    if (!isPersonalRecipe && currentUser && (currentUser.token || currentUser.email)) {
      fetch('/api/recipe/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        },
        body: JSON.stringify({
          recipe: newRecipe
        })
      }).catch(err => console.warn('Could not publish recipe to server:', err));
    }

    // Auto-add required ingredients for this balanced recipe into the user's pantry
    let addedCount = 0;
    (parsedIngredients || []).forEach(ing => {
      const ingId = ing.id || sanitizeShoppingItemName(ing.name).toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      if (ingId) {
        if (!pantryState.has(ingId)) {
          pantryState.add(ingId);
          addedCount++;
        }
      }
    });
    if (addedCount > 0) {
      savePantry();
      updatePantryCheckboxVisuals();
    }

    saveCustomRecipes();
    closeCustomRecipeModal();
    updateAuthUI();
    renderPantryList();
    renderRecipes();
    updateStats();

    if (addedCustomItems.length > 0) {
      const summaryList = addedCustomItems.map(c => `"${c.name}" (${c.catTitle})`).join(', ');
      showToast(`🧪 Saved recipe "${title}"! Added to your pantry: ${summaryList}`);
    } else if (isPersonalRecipe) {
      showToast(`🧪 Saved balanced recipe "${title}" and added ingredients to your pantry!`);
    } else {
      showToast(`🧪 Published balanced recipe "${title}" to official cookbook "${finalCategory}"!`);
    }

    trackAnalyticsEvent('create_custom_recipe', {
      recipe_name: title,
      category: finalCategory,
      is_personal: isPersonalRecipe,
      calories: newRecipe.macros ? newRecipe.macros.calories : null,
      protein: newRecipe.macros ? newRecipe.macros.protein : null,
      creaminess_score: newRecipe.creaminessScore || null
    });
  }

  // --- Build-A-Pint Custom Ingredient Handlers ---
  function updateBapCustomCategoryNotice(step, rawName) {
    const section = document.querySelector(`.bap-custom-ing-section[data-step="${step}"]`);
    if (!section) return;
    const hint = section.dataset.hint || '';
    const clean = (rawName || '').trim();

    const iconEl = section.querySelector('.bap-category-notice-icon');
    const valEl = section.querySelector('.bap-category-notice-val');
    const labelEl = section.querySelector('.bap-category-notice-label');
    const msgEl = section.querySelector('.bap-category-notice-msg');
    const targetEl = section.querySelector('.bap-notice-target-cat');

    if (!clean) {
      const defaultCat = (hint === 'liquid') ? 'dairy_liquids' :
                         (hint === 'powder') ? 'protein_powders' :
                         (hint === 'stabilizer') ? 'sweeteners_binders' : 'mixins_snacks';
      const catTitle = (typeof INGREDIENT_CATEGORIES !== 'undefined' && INGREDIENT_CATEGORIES[defaultCat]) 
        ? INGREDIENT_CATEGORIES[defaultCat] 
        : 'Pantry';
      const catIcon = (typeof CATEGORY_ICONS !== 'undefined' && CATEGORY_ICONS[defaultCat]) 
        ? CATEGORY_ICONS[defaultCat] 
        : '📦';

      if (iconEl) iconEl.textContent = catIcon;
      if (valEl) valEl.textContent = catTitle;
      if (labelEl) labelEl.textContent = 'Auto-Detected Pantry Group:';
      if (msgEl) {
        msgEl.innerHTML = `ℹ️ Once you save this pint, this ingredient will automatically be added to your <strong class="bap-notice-target-cat">"${catTitle}"</strong> pantry group and marked in stock!`;
      }
      return;
    }

    const matched = findExistingPantryIngredient(clean, hint);
    const catKey = matched ? matched.category : getIngredientCategoryKey(clean, hint);
    const catTitle = (typeof INGREDIENT_CATEGORIES !== 'undefined' && INGREDIENT_CATEGORIES[catKey]) 
      ? INGREDIENT_CATEGORIES[catKey] 
      : 'Pantry';
    const catIcon = (typeof CATEGORY_ICONS !== 'undefined' && CATEGORY_ICONS[catKey]) 
      ? CATEGORY_ICONS[catKey] 
      : '✨';

    if (iconEl) iconEl.textContent = catIcon;

    if (matched) {
      if (labelEl) labelEl.textContent = '✅ Matches Existing Item:';
      if (valEl) valEl.textContent = `${matched.name} (${catTitle})`;
      if (msgEl) {
        const sourceDesc = matched.bapItem ? 'preset recipe ingredients' : (matched.inPantry ? 'your stocked pantry' : 'ingredient library');
        msgEl.innerHTML = `✅ Found in ${sourceDesc}: <strong>"${matched.name}"</strong> in <strong>"${catTitle}"</strong>. Adding will link directly to this existing item instead of creating a duplicate!`;
      }
    } else {
      if (labelEl) labelEl.textContent = 'Auto-Detected Pantry Group:';
      if (valEl) valEl.textContent = catTitle;
      if (msgEl) {
        msgEl.innerHTML = `ℹ️ Once you save this pint, this ingredient will automatically be added to your <strong class="bap-notice-target-cat">"${catTitle}"</strong> pantry group and marked in stock!`;
      }
    }
  }

  function toggleBapCustomCard(step, show) {
    const card = document.getElementById(`bapCustomCard${step}`);
    const btn = document.querySelector(`.bap-btn-add-custom[data-step="${step}"]`);
    if (card) {
      card.style.display = show ? 'block' : 'none';
    }
    if (btn) {
      btn.style.display = show ? 'none' : 'inline-flex';
    }
    if (show) {
      const input = document.querySelector(`.bap-custom-input-name[data-step="${step}"]`);
      if (input) {
        input.focus();
        updateBapCustomCategoryNotice(step, input.value.trim());
      }
    }
  }

  function handleBapCustomIngredientSubmit(step) {
    const nameInput = document.querySelector(`.bap-custom-input-name[data-step="${step}"]`);
    const qtyInput = document.querySelector(`.bap-custom-input-qty[data-step="${step}"]`);
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
      showToast('⚠️ Please enter an ingredient name.');
      if (nameInput) nameInput.focus();
      return;
    }

    const section = document.querySelector(`.bap-custom-ing-section[data-step="${step}"]`);
    const hint = section ? (section.dataset.hint || '') : '';
    const isDeluxe = bapState.size === '24';
    const parsedQty = qtyInput ? parseFloat(qtyInput.value) : 0;

    if (!bapState.customLiquids) bapState.customLiquids = [];
    if (!bapState.customPowders) bapState.customPowders = [];
    if (!bapState.customStabilizers) bapState.customStabilizers = [];
    if (!bapState.customSweeteners) bapState.customSweeteners = [];
    if (!bapState.customMixins) bapState.customMixins = [];

    // Check if ingredient already exists in pantry, master, BAP presets, or custom recipes
    const matched = findExistingPantryIngredient(name, hint);

    if (matched) {
      const catTitle = matched.catTitle || 'Pantry';

      // 1. If it's a built-in BAP preset: select it directly!
      if (matched.bapItem) {
        const item = matched.bapItem;
        if (step === 1 && (matched.bapStep === 'liquid' || BAP_DATA.liquids.some(l => l.id === item.id))) {
          bapState.selectedLiquid = item.id;
          bapState.liquidQty = parsedQty > 0 ? parsedQty : (isDeluxe ? item.defaultQty24 : item.defaultQty16);
        } else if (step === 2 && (matched.bapStep === 'powder' || BAP_DATA.powders.some(p => p.id === item.id))) {
          bapState.selectedPowders[item.id] = parsedQty > 0 ? parsedQty : (isDeluxe ? item.defaultQty24 : item.defaultQty16);
        } else if (step === 3 && (matched.bapStep === 'stabilizer' || BAP_DATA.stabilizers.some(s => s.id === item.id))) {
          bapState.selectedStabilizers[item.id] = parsedQty > 0 ? parsedQty : (isDeluxe ? item.defaultQty24 : item.defaultQty16);
        } else if (step === 4) {
          if (matched.bapStep === 'sweetener' || BAP_DATA.sweeteners.some(sw => sw.id === item.id)) {
            bapState.selectedSweeteners[item.id] = parsedQty > 0 ? parsedQty : (isDeluxe ? item.defaultQty24 : item.defaultQty16);
          } else {
            bapState.selectedMixins[item.id] = parsedQty > 0 ? parsedQty : (isDeluxe ? item.defaultQty24 : item.defaultQty16);
          }
        } else {
          // Cross-step BAP match
          if (['sweeteners_binders', 'extracts_flavors', 'syrups_sauces'].includes(matched.category)) {
            bapState.selectedSweeteners[item.id] = parsedQty > 0 ? parsedQty : (isDeluxe ? item.defaultQty24 : item.defaultQty16);
          } else {
            bapState.selectedMixins[item.id] = parsedQty > 0 ? parsedQty : (isDeluxe ? item.defaultQty24 : item.defaultQty16);
          }
        }

        if (nameInput) nameInput.value = '';
        toggleBapCustomCard(step, false);
        renderBapGrids();
        updateBapHUD();
        showToast(`✅ Selected existing "${item.name}" from recipe ingredients!`);
        return;
      }

      // 2. Existing pantry item or previous custom ingredient (not in BAP presets):
      // Reuse existing ID, existing Name, and existing Category!
      const catKey = matched.category;
      const catIcon = (typeof CATEGORY_ICONS !== 'undefined' && CATEGORY_ICONS[catKey]) 
        ? CATEGORY_ICONS[catKey] 
        : '✨';

      if (step === 1) {
        const qty = parsedQty > 0 ? parsedQty : (isDeluxe ? 570 : 380);
        let existingCard = bapState.customLiquids.find(c => c.id === matched.id);
        if (!existingCard) {
          existingCard = {
            id: matched.id,
            name: matched.name,
            icon: catIcon,
            desc: `Existing Pantry Liquid • ${catTitle}`,
            unit: 'g',
            defaultQty16: 380,
            defaultQty24: 570,
            step: 10,
            min: 10,
            max: 1000,
            per100: { kcal: 45, p: 3, c: 4, f: 1.5 },
            fatScore: 1.0,
            caseinScore: 0.5,
            stabilizerScore: 0.3,
            isCustom: matched.isCustom,
            category: catKey,
            stepType: 'liquid'
          };
          bapState.customLiquids.push(existingCard);
        }
        bapState.selectedLiquid = matched.id;
        bapState.liquidQty = qty;
      } else if (step === 2) {
        const qty = parsedQty > 0 ? parsedQty : (isDeluxe ? 30 : 25);
        let existingCard = bapState.customPowders.find(c => c.id === matched.id);
        if (!existingCard) {
          existingCard = {
            id: matched.id,
            name: matched.name,
            icon: catIcon,
            desc: `Existing Pantry Powder • ${catTitle}`,
            unit: 'g',
            defaultQty16: 25,
            defaultQty24: 30,
            step: 5,
            min: 5,
            max: 150,
            serving: 30,
            perServing: { kcal: 40, p: 8, c: 1, f: 0.5 },
            caseinScore: 0.5,
            isCustom: matched.isCustom,
            category: catKey,
            stepType: 'powder'
          };
          bapState.customPowders.push(existingCard);
        }
        bapState.selectedPowders[matched.id] = qty;
      } else if (step === 3) {
        const qty = parsedQty > 0 ? parsedQty : 1;
        let existingCard = bapState.customStabilizers.find(c => c.id === matched.id);
        if (!existingCard) {
          existingCard = {
            id: matched.id,
            name: matched.name,
            icon: catIcon,
            desc: `Existing Pantry Stabilizer • ${catTitle}`,
            unit: 'g',
            defaultQty16: 1,
            defaultQty24: 1,
            step: 1,
            min: 1,
            max: 50,
            serving: 1,
            perServing: { kcal: 5, p: 0, c: 1, f: 0 },
            stabilizerScore: 0.8,
            isCustom: matched.isCustom,
            category: catKey,
            stepType: 'stabilizer'
          };
          bapState.customStabilizers.push(existingCard);
        }
        bapState.selectedStabilizers[matched.id] = qty;
      } else if (step === 4) {
        const qty = parsedQty > 0 ? parsedQty : 20;
        const isSweetenerType = ['sweeteners_binders', 'extracts_flavors', 'syrups_sauces'].includes(catKey);
        if (isSweetenerType) {
          let existingCard = bapState.customSweeteners.find(c => c.id === matched.id);
          if (!existingCard) {
            existingCard = {
              id: matched.id,
              name: matched.name,
              icon: catIcon,
              desc: `Existing Pantry Sweetener/Flavor • ${catTitle}`,
              unit: 'g',
              defaultQty16: 20,
              defaultQty24: 25,
              step: 1,
              min: 1,
              max: 100,
              serving: 10,
              perServing: { kcal: 5, p: 0, c: 1, f: 0 },
              freezingScore: 0.3,
              isCustom: matched.isCustom,
              category: catKey,
              stepType: 'sweetener'
            };
            bapState.customSweeteners.push(existingCard);
          }
          bapState.selectedSweeteners[matched.id] = qty;
        } else {
          let existingCard = bapState.customMixins.find(c => c.id === matched.id);
          if (!existingCard) {
            existingCard = {
              id: matched.id,
              name: matched.name,
              icon: catIcon,
              desc: `Existing Pantry Item • ${catTitle}`,
              unit: 'g',
              defaultQty16: 20,
              defaultQty24: 25,
              step: 5,
              min: 5,
              max: 200,
              serving: 20,
              perServing: { kcal: 50, p: 1, c: 8, f: 2 },
              isMixin: true,
              isCustom: matched.isCustom,
              category: catKey,
              stepType: 'mixin'
            };
            bapState.customMixins.push(existingCard);
          }
          bapState.selectedMixins[matched.id] = qty;
        }
      }

      if (nameInput) nameInput.value = '';
      toggleBapCustomCard(step, false);
      renderBapGrids();
      updateBapHUD();
      showToast(`✅ Linked existing "${matched.name}" from your pantry!`);
      return;
    }

    // 3. Genuinely brand-new custom ingredient:
    const catKey = getIngredientCategoryKey(name, hint);
    const catTitle = (typeof INGREDIENT_CATEGORIES !== 'undefined' && INGREDIENT_CATEGORIES[catKey]) 
      ? INGREDIENT_CATEGORIES[catKey] 
      : 'Pantry';
    const catIcon = (typeof CATEGORY_ICONS !== 'undefined' && CATEGORY_ICONS[catKey]) 
      ? CATEGORY_ICONS[catKey] 
      : '✨';

    const customId = `bap_custom_${hint}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    if (step === 1) {
      const qty = parsedQty > 0 ? parsedQty : 380;
      const customItem = {
        id: customId,
        name: name,
        icon: catIcon,
        desc: `Custom Liquid • Auto-categorized to "${catTitle}"`,
        unit: 'g',
        defaultQty16: qty,
        defaultQty24: Math.round(qty * 1.5),
        step: 10,
        min: 10,
        max: 1000,
        per100: { kcal: 45, p: 3, c: 4, f: 1.5 },
        fatScore: 1.0,
        caseinScore: 0.5,
        stabilizerScore: 0.3,
        isCustom: true,
        category: catKey,
        stepType: 'liquid'
      };
      bapState.customLiquids.push(customItem);
      bapState.selectedLiquid = customId;
      bapState.liquidQty = qty;
    } else if (step === 2) {
      const qty = parsedQty > 0 ? parsedQty : 25;
      const customItem = {
        id: customId,
        name: name,
        icon: catIcon,
        desc: `Custom Powder • Auto-categorized to "${catTitle}"`,
        unit: 'g',
        defaultQty16: qty,
        defaultQty24: Math.round(qty * 1.2),
        step: 5,
        min: 5,
        max: 150,
        serving: 30,
        perServing: { kcal: 40, p: 8, c: 1, f: 0.5 },
        caseinScore: 0.5,
        isCustom: true,
        category: catKey,
        stepType: 'powder'
      };
      bapState.customPowders.push(customItem);
      bapState.selectedPowders[customId] = qty;
    } else if (step === 3) {
      const qty = parsedQty > 0 ? parsedQty : 1;
      const customItem = {
        id: customId,
        name: name,
        icon: catIcon,
        desc: `Custom Stabilizer • Auto-categorized to "${catTitle}"`,
        unit: 'g',
        defaultQty16: qty,
        defaultQty24: qty,
        step: 1,
        min: 1,
        max: 50,
        serving: 1,
        perServing: { kcal: 5, p: 0, c: 1, f: 0 },
        stabilizerScore: 0.8,
        isCustom: true,
        category: catKey,
        stepType: 'stabilizer'
      };
      bapState.customStabilizers.push(customItem);
      bapState.selectedStabilizers[customId] = qty;
    } else if (step === 4) {
      const qty = parsedQty > 0 ? parsedQty : 20;
      const isSweetenerType = ['sweeteners_binders', 'extracts_flavors', 'syrups_sauces'].includes(catKey);
      if (isSweetenerType) {
        const customItem = {
          id: customId,
          name: name,
          icon: catIcon,
          desc: `Custom Sweetener/Flavor • Auto-categorized to "${catTitle}"`,
          unit: 'g',
          defaultQty16: qty,
          defaultQty24: Math.round(qty * 1.2),
          step: 1,
          min: 1,
          max: 100,
          serving: 10,
          perServing: { kcal: 5, p: 0, c: 1, f: 0 },
          freezingScore: 0.3,
          isCustom: true,
          category: catKey,
          stepType: 'sweetener'
        };
        bapState.customSweeteners.push(customItem);
        bapState.selectedSweeteners[customId] = qty;
      } else {
        const customItem = {
          id: customId,
          name: name,
          icon: catIcon,
          desc: `Custom Mix-In • Auto-categorized to "${catTitle}"`,
          unit: 'g',
          defaultQty16: qty,
          defaultQty24: Math.round(qty * 1.2),
          step: 5,
          min: 5,
          max: 200,
          serving: 20,
          perServing: { kcal: 50, p: 1, c: 8, f: 2 },
          isMixin: true,
          isCustom: true,
          category: catKey,
          stepType: 'mixin'
        };
        bapState.customMixins.push(customItem);
        bapState.selectedMixins[customId] = qty;
      }
    }

    if (nameInput) nameInput.value = '';
    toggleBapCustomCard(step, false);
    renderBapGrids();
    updateBapHUD();
    showToast(`✨ Created "${name}"! Will be added to your "${catTitle}" pantry group upon saving.`);
  }

  function removeBapCustomItem(customId) {
    if (!customId) return;
    if (bapState.customLiquids) {
      bapState.customLiquids = bapState.customLiquids.filter(i => i.id !== customId);
      if (bapState.selectedLiquid === customId) {
        bapState.selectedLiquid = 'fairlife_nonfat';
        const isDeluxe = bapState.size === '24';
        const defL = BAP_DATA.liquids.find(l => l.id === 'fairlife_nonfat');
        bapState.liquidQty = isDeluxe ? (defL ? defL.defaultQty24 : 570) : (defL ? defL.defaultQty16 : 380);
      }
    }
    if (bapState.customPowders) {
      bapState.customPowders = bapState.customPowders.filter(i => i.id !== customId);
      delete bapState.selectedPowders[customId];
    }
    if (bapState.customStabilizers) {
      bapState.customStabilizers = bapState.customStabilizers.filter(i => i.id !== customId);
      delete bapState.selectedStabilizers[customId];
    }
    if (bapState.customSweeteners) {
      bapState.customSweeteners = bapState.customSweeteners.filter(i => i.id !== customId);
      delete bapState.selectedSweeteners[customId];
    }
    if (bapState.customMixins) {
      bapState.customMixins = bapState.customMixins.filter(i => i.id !== customId);
      delete bapState.selectedMixins[customId];
    }

    renderBapGrids();
    updateBapHUD();
    showToast('Removed custom ingredient from pint.');
  }

  function initBuildAPint() {
    if (!bapInitialized) {
      bapInitialized = true;

      // Mode toggles
      const btnModeWizard = document.getElementById('btnModeWizard');
      const btnModeManual = document.getElementById('btnModeManual');
      if (btnModeWizard) btnModeWizard.addEventListener('click', () => setBapMode('wizard'));
      if (btnModeManual) btnModeManual.addEventListener('click', () => setBapMode('manual'));

      // Size buttons
      const size16 = document.getElementById('bapSize16');
      const size24 = document.getElementById('bapSize24');
      if (size16) size16.addEventListener('click', () => setBapSize('16'));
      if (size24) size24.addEventListener('click', () => setBapSize('24'));

      // Step pills
      document.querySelectorAll('.bap-step-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const step = parseInt(pill.dataset.step);
          if (step) switchBapStep(step);
        });
      });

      // Prev / Next buttons
      const btnPrev = document.getElementById('bapBtnPrev');
      const btnNext = document.getElementById('bapBtnNext');
      if (btnPrev) btnPrev.addEventListener('click', () => switchBapStep(bapState.currentStep - 1));
      if (btnNext) btnNext.addEventListener('click', () => switchBapStep(bapState.currentStep + 1));

      // Category sync between Wizard & Manual forms
      const bapCatEl = document.getElementById('bapCategory');
      const crCatEl = document.getElementById('crCategory');
      if (bapCatEl && crCatEl) {
        bapCatEl.addEventListener('change', () => {
          crCatEl.value = bapCatEl.value;
        });
        crCatEl.addEventListener('change', () => {
          bapCatEl.value = crCatEl.value;
        });
      }

      // Auto-name & Save buttons
      const btnAutoName = document.getElementById('bapBtnAutoName');
      const btnSave = document.getElementById('bapBtnSave');
      if (btnAutoName) btnAutoName.addEventListener('click', autoNameBapRecipe);
      if (btnSave) btnSave.addEventListener('click', saveBapRecipe);

      // Wizard Custom Ingredient Triggers & Forms (Steps 1–4)
      for (let s = 1; s <= 4; s++) {
        const stepNum = s;
        const addBtn = document.querySelector(`.bap-btn-add-custom[data-step="${stepNum}"]`);
        const closeBtn = document.querySelector(`.bap-custom-close-btn[data-step="${stepNum}"]`);
        const cancelBtn = document.querySelector(`.bap-btn-cancel-custom[data-step="${stepNum}"]`);
        const submitBtn = document.querySelector(`.bap-btn-submit-custom[data-step="${stepNum}"]`);
        const nameInput = document.querySelector(`.bap-custom-input-name[data-step="${stepNum}"]`);

        if (addBtn) addBtn.addEventListener('click', () => toggleBapCustomCard(stepNum, true));
        if (closeBtn) closeBtn.addEventListener('click', () => toggleBapCustomCard(stepNum, false));
        if (cancelBtn) cancelBtn.addEventListener('click', () => toggleBapCustomCard(stepNum, false));
        if (submitBtn) submitBtn.addEventListener('click', () => handleBapCustomIngredientSubmit(stepNum));

        if (nameInput) {
          nameInput.addEventListener('input', () => {
            updateBapCustomCategoryNotice(stepNum, nameInput.value.trim());
          });
          nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleBapCustomIngredientSubmit(stepNum);
            }
          });
        }
      }
    }

    setBapMode('wizard');
    switchBapStep(1);
    renderBapGrids();
    updateBapHUD();

    // Reset custom form cards to closed and update default category notices
    for (let s = 1; s <= 4; s++) {
      toggleBapCustomCard(s, false);
      updateBapCustomCategoryNotice(s, '');
    }
  }

  function openCustomRecipeModal() {
    if (customRecipeForm) customRecipeForm.reset();
    const editingIdEl = document.getElementById('crEditingId');
    if (editingIdEl) editingIdEl.value = '';
    const submitBtn = document.getElementById('crSubmitBtn');
    if (submitBtn) submitBtn.textContent = 'Save Custom Recipe';

    initBuildAPint();
    updateRecipeCategorySelectors();

    const modalMainTitle = document.getElementById('bapModalMainTitle');
    const modalSubTitle = document.getElementById('bapModalSubTitle');
    if (modalMainTitle && modalSubTitle) {
      if (currentUser && currentUser.role === 'admin') {
        modalMainTitle.textContent = '🧪 Create & Publish Recipe';
        modalSubTitle.textContent = 'Formulate balanced recipes with real-time texture diagnostics and publish into any official cookbook or personal Custom library.';
      } else if (currentUser && currentUser.role === 'creator') {
        modalMainTitle.textContent = '🧪 Create & Publish Recipe';
        modalSubTitle.textContent = 'Formulate balanced recipes with real-time texture diagnostics and publish into your official cookbooks or personal Custom library.';
      } else {
        modalMainTitle.textContent = '🧪 Build-A-Pint Balancing Wizard';
        modalSubTitle.textContent = 'Formulate balanced, high-protein custom Creami recipes with real-time texture diagnostics, Creaminess Score (1–10), and auto-computed nutrition.';
      }
    }

    customRecipeModalOverlay.classList.add('active');
    customRecipeModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeCustomRecipeModal() {
    customRecipeModalOverlay.classList.remove('active');
    customRecipeModalOverlay.setAttribute('aria-hidden', 'true');
    const editingIdEl = document.getElementById('crEditingId');
    if (editingIdEl) editingIdEl.value = '';
    unlockBackgroundScroll();
  }

  function canUserEditRecipe(recipe) {
    if (!currentUser || !recipe) return false;
    // Super admin
    if (currentUser.role === 'admin' || (currentUser.email && currentUser.email.toLowerCase() === 'ahumpo7@gmail.com')) {
      return true;
    }
    // Author of custom or published recipe
    if (recipe.userId && recipe.userId === currentUser.id) {
      return true;
    }
    // Personal custom recipe owned by user
    if (recipe.isPersonal && (recipe.id.startsWith('custom_') || customRecipesState.some(r => r.id === recipe.id))) {
      return true;
    }
    // Verified Creator in their own books
    if (currentUser.role === 'creator') {
      const userCreatorId = currentUser.creatorId || 'fitness_product_finder';
      if (recipe.creatorId && recipe.creatorId === userCreatorId) return true;
      if (userCreatorId === 'fitness_product_finder') {
        const eliCategories = ['Fan Favorites', 'Keto', 'No Protein', 'Lactose Free', 'Community Legends', 'TestContent Sampler'];
        if (eliCategories.includes(recipe.category)) return true;
      }
    }
    return false;
  }

  function openEditRecipeModal(recipe) {
    if (!recipe) return;
    if (customRecipeForm) customRecipeForm.reset();
    initBuildAPint();
    updateRecipeCategorySelectors();

    // Switch to manual mode
    setBapMode('manual');
    const manualContainer = document.getElementById('manualFormContainer');
    const wizardContainer = document.getElementById('bapWizardContainer');
    if (manualContainer) manualContainer.style.display = 'block';
    if (wizardContainer) wizardContainer.style.display = 'none';

    // Set hidden editing ID
    const editingIdEl = document.getElementById('crEditingId');
    if (editingIdEl) editingIdEl.value = recipe.id;

    // Fill fields
    const nameEl = document.getElementById('crName');
    if (nameEl) nameEl.value = recipe.name || '';

    const catEl = document.getElementById('crCategory');
    if (catEl) {
      const targetCat = recipe.category || 'Custom';
      let optExists = Array.from(catEl.options).some(o => o.value === targetCat);
      if (!optExists) {
        const newOpt = document.createElement('option');
        newOpt.value = targetCat;
        newOpt.textContent = targetCat;
        catEl.appendChild(newOpt);
      }
      catEl.value = targetCat;
    }

    const videoUrlEl = document.getElementById('crVideoUrl');
    if (videoUrlEl) videoUrlEl.value = recipe.videoUrl || '';

    const calEl = document.getElementById('crCalories');
    if (calEl) calEl.value = (recipe.macros && recipe.macros.calories) ? String(recipe.macros.calories).replace(/[^\d]/g, '') : '';

    const proEl = document.getElementById('crProtein');
    if (proEl) proEl.value = (recipe.macros && recipe.macros.protein) ? String(recipe.macros.protein) : '';

    const carbEl = document.getElementById('crCarbs');
    if (carbEl) carbEl.value = (recipe.macros && recipe.macros.carbs) ? String(recipe.macros.carbs) : '';

    const fatEl = document.getElementById('crFat');
    if (fatEl) fatEl.value = (recipe.macros && recipe.macros.fat) ? String(recipe.macros.fat) : '';

    const spinEl = document.getElementById('crSpinSetting');
    if (spinEl) spinEl.value = recipe.spinSetting || 'Lite Ice Cream';

    const freezeEl = document.getElementById('crFreezeTime');
    if (freezeEl) freezeEl.value = recipe.freezeTime || '16+ HOURS';

    const ingsEl = document.getElementById('crIngredients');
    if (ingsEl) {
      if (Array.isArray(recipe.ingredients)) {
        ingsEl.value = recipe.ingredients.map(ing => {
          if (ing.raw) return ing.raw;
          let str = `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim();
          if (ing.isMixin && !str.toLowerCase().includes('(mix-in)')) {
            str += ' (Mix-in)';
          }
          return str;
        }).filter(Boolean).join('\n');
      } else {
        ingsEl.value = '';
      }
    }

    const instEl = document.getElementById('crInstructions');
    if (instEl) {
      if (Array.isArray(recipe.instructions)) {
        instEl.value = recipe.instructions.join('\n');
      } else {
        instEl.value = '';
      }
    }

    const modalMainTitle = document.getElementById('bapModalMainTitle');
    const modalSubTitle = document.getElementById('bapModalSubTitle');
    const submitBtn = document.getElementById('crSubmitBtn');
    if (modalMainTitle) modalMainTitle.textContent = `✏️ Edit Recipe: ${recipe.name}`;
    if (modalSubTitle) modalSubTitle.textContent = 'Update video tutorial link, ingredients, instructions, and macros. Edits push live to everyone with book access.';
    if (submitBtn) submitBtn.textContent = '💾 Save Changes & Push to Followers';

    customRecipeModalOverlay.classList.add('active');
    customRecipeModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function handleCustomRecipeSubmit(e) {
    e.preventDefault();
    if (!currentUser) {
      showToast('🔒 Please sign in with Google to save or edit recipes.');
      openGoogleAuthModal();
      return;
    }
    const name = document.getElementById('crName').value.trim();
    const chosenCat = (document.getElementById('crCategory') ? document.getElementById('crCategory').value : 'Custom') || 'Custom';
    const { finalCategory, creatorId: recipeCreatorId } = validateAndResolveRecipeCategory(chosenCat);
    const isPersonalRecipe = (finalCategory === 'Custom');
    const editingId = document.getElementById('crEditingId') ? document.getElementById('crEditingId').value.trim() : '';
    const videoUrl = document.getElementById('crVideoUrl') ? document.getElementById('crVideoUrl').value.trim() : '';

    const matchedBook = (typeof BOOKS_MASTER !== 'undefined' && !isPersonalRecipe)
      ? BOOKS_MASTER.find(b => b.categoryKey === finalCategory || (b.categories && b.categories.includes(finalCategory)))
      : null;
    const recipeSourceFile = isPersonalRecipe 
      ? 'Personal Custom' 
      : (matchedBook ? matchedBook.title : finalCategory);

    const calories = document.getElementById('crCalories').value.trim() || '0';
    const protein = document.getElementById('crProtein').value.trim() || '0g';
    const carbs = document.getElementById('crCarbs').value.trim() || '0g';
    const fat = document.getElementById('crFat').value.trim() || '0g';
    const spinSetting = document.getElementById('crSpinSetting').value;
    const freezeTime = document.getElementById('crFreezeTime').value.trim() || '16+ HOURS';
    const ingredientsRaw = document.getElementById('crIngredients').value.trim().split('\n');
    const instructionsRaw = document.getElementById('crInstructions').value.trim().split('\n');

    if (!name || ingredientsRaw.length === 0) return;

    const parsedIngs = ingredientsRaw.map(line => {
      const isMixin = line.toLowerCase().includes('(mix-in)');
      const cleanLine = sanitizeShoppingItemName(line);
      const matched = findExistingPantryIngredient(cleanLine, isMixin ? 'mixin' : null);

      const finalId = matched ? matched.id : cleanLine.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      const finalName = matched ? matched.name : cleanLine;
      const finalCategory = matched ? matched.category : getIngredientCategoryKey(cleanLine, isMixin ? 'mixin' : null);

      return {
        id: finalId,
        name: finalName,
        category: finalCategory,
        quantity: '',
        unit: '',
        raw: line.trim(),
        section: isMixin ? 'Mix-in' : 'Base',
        isMixin: isMixin,
        isCustom: matched ? matched.isCustom : true,
        notes: ''
      };
    }).filter(i => i.name.length > 0);

    const parsedInst = instructionsRaw.map(l => l.trim()).filter(l => l.length > 0);

    // Check if we are updating an existing recipe
    if (editingId) {
      const targetRecipe = allRecipes.find(r => r.id === editingId) || (window.RECIPES_MASTER || []).find(r => r.id === editingId) || { id: editingId };
      targetRecipe.name = name;
      targetRecipe.category = finalCategory;
      targetRecipe.categories = [finalCategory];
      targetRecipe.videoUrl = videoUrl;
      targetRecipe.macros = {
        calories: calories,
        protein: protein.endsWith('g') ? protein : protein + 'g',
        carbs: carbs.endsWith('g') ? carbs : carbs + 'g',
        fat: fat.endsWith('g') ? fat : fat + 'g',
        sugar: (targetRecipe.macros && targetRecipe.macros.sugar) || '0g',
        fiber: (targetRecipe.macros && targetRecipe.macros.fiber) || '0g'
      };
      targetRecipe.spinSetting = spinSetting;
      targetRecipe.freezeTime = freezeTime;
      targetRecipe.ingredients = parsedIngs;
      targetRecipe.instructions = parsedInst;
      if (!targetRecipe.creatorId && recipeCreatorId) {
        targetRecipe.creatorId = recipeCreatorId;
      }

      // Update in customRecipesState if present
      const crIdx = customRecipesState.findIndex(r => r.id === editingId);
      if (crIdx !== -1) {
        customRecipesState[crIdx] = Object.assign({}, customRecipesState[crIdx], targetRecipe);
        saveCustomRecipes();
      }

      // Sync to server so it is pushed to all followers
      if (currentUser && (currentUser.token || currentUser.email)) {
        fetch('/api/recipe/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
            'X-User-Email': currentUser.email || ''
          },
          body: JSON.stringify({
            recipe: targetRecipe
          })
        }).then(res => res.json()).then(resData => {
          if (resData && resData.recipe) {
            console.log('Recipe update saved to server and pushed to followers:', resData.recipe.name);
          }
        }).catch(err => console.warn('Could not sync recipe update to server:', err));
      }

      calculateIngredientUsage();
      closeCustomRecipeModal();
      updateAuthUI();
      renderPantryList();
      renderRecipes();
      updateStats();
      if (recipeModalOverlay.classList.contains('active') && currentModalRecipe && currentModalRecipe.id === editingId) {
        renderRecipeModalContent(targetRecipe);
      }
      showToast(`✨ Updated "${name}"! Changes pushed out to everyone with access.`);
      return;
    }

    const newRecipe = {
      id: isPersonalRecipe ? `custom_${currentUser.id}_${Date.now()}` : `pub_${currentUser.id}_${Date.now()}`,
      name: name,
      category: finalCategory,
      categories: [finalCategory],
      userId: currentUser.id,
      isPersonal: isPersonalRecipe,
      sourceFile: recipeSourceFile,
      creatorId: recipeCreatorId,
      videoUrl: videoUrl,
      page: 1,
      macros: {
        calories: calories,
        protein: protein.endsWith('g') ? protein : protein + 'g',
        carbs: carbs.endsWith('g') ? carbs : carbs + 'g',
        fat: fat.endsWith('g') ? fat : fat + 'g',
        sugar: '0g',
        fiber: '0g'
      },
      spinSetting: spinSetting,
      prepTime: '2 MIN',
      freezeTime: freezeTime,
      makes: '1 PINT',
      ingredients: parsedIngs,
      instructions: parsedInst
    };

    customRecipesState.push(newRecipe);

    // If publishing to an official book, push to server immediately
    if (!isPersonalRecipe && currentUser && (currentUser.token || currentUser.email)) {
      fetch('/api/recipe/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        },
        body: JSON.stringify({
          recipe: newRecipe
        })
      }).catch(err => console.warn('Could not publish recipe to server:', err));
    }

    // Auto-add required ingredients for this personal recipe into the user's pantry
    let addedCount = 0;
    (parsedIngs || []).forEach(ing => {
      const ingId = ing.id || sanitizeShoppingItemName(ing.name).toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      if (ingId && !pantryState.has(ingId)) {
        pantryState.add(ingId);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      savePantry();
      updatePantryCheckboxVisuals();
    }

    saveCustomRecipes();
    closeCustomRecipeModal();
    updateAuthUI();
    renderPantryList();
    renderRecipes();
    updateStats();
    if (isPersonalRecipe) {
      showToast(`✨ Saved personal recipe "${name}" and added ${parsedIngs.length} required ingredients to your pantry!`);
    } else {
      showToast(`✨ Published recipe "${name}" to official cookbook "${finalCategory}"!`);
    }
  }

  async function deleteCustomRecipe(recipeId) {
    if (!recipeId) return;

    // Set mutation lock so fetchLatestUserData doesn't overwrite with stale data
    lastLocalMutationTime = Date.now();

    // Remove from in-memory state
    customRecipesState = customRecipesState.filter(r => r.id !== recipeId);

    // Save to user localStorage
    if (currentUser && currentUser.id) {
      const userCustomKey = `${CUSTOM_RECIPES_STORAGE_KEY}_${currentUser.id}`;
      localStorage.setItem(userCustomKey, JSON.stringify(customRecipesState));
    }

    // Refresh UI & pantry
    mergeRecipes();
    calculateIngredientUsage();
    closeRecipeModal();
    updateAuthUI();
    renderPantryList();
    renderRecipes();
    updateStats();
    showToast('🗑️ Personal custom recipe deleted.');

    // Immediate server deletion call
    if (currentUser && (currentUser.token || currentUser.email)) {
      try {
        await fetch('/api/recipe/custom/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
            'X-User-Email': currentUser.email || ''
          },
          body: JSON.stringify({
            token: currentUser.token || '',
            email: currentUser.email || '',
            recipeId: recipeId
          })
        });
      } catch (err) {
        console.warn('Dedicated recipe delete API call error:', err);
      }

      // Flush full cloud sync immediately
      triggerCloudSync(true);
    }
  }

  // --- Theme Toggle ---
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    updateThemeUI();
    initGoogleAuth();
  }

  function updateThemeUI() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    if (themeToggleLabel) {
      themeToggleLabel.textContent = current === 'dark' ? 'Dark' : 'Light';
    }
  }

  // --- Toast Notification ---
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // --- Admin Portal & User Management (Roadmap Item 15) ---
  const ELI_SUBSCRIPTIONS = ['All-Access', 'Base Flavors', 'Fan Favorites', 'No Protein', 'Keto', 'Lactose Free'];
  const TEST_CONTENT_SUBSCRIPTIONS = ['TestContent All-Access', 'TestContent Sampler', 'Volume Pints'];
  const UNIVERSAL_SUBSCRIPTIONS = ['Community Legends'];
  const ALL_CATEGORY_SUBSCRIPTIONS = ['Community Legends', ...ELI_SUBSCRIPTIONS, ...TEST_CONTENT_SUBSCRIPTIONS];

  function openAdminPortal() {
    const isSuper = (realAdminUser && (realAdminUser.email === 'ahumpo7@gmail.com' || realAdminUser.email === 'ahumpo@gmail.com')) ||
                    (currentUser && (currentUser.email === 'ahumpo7@gmail.com' || currentUser.email === 'ahumpo@gmail.com'));
    if (!isSuper && (!currentUser || currentUser.role !== 'admin')) {
      showToast('⚠️ Admin privileges required to access the Admin Portal.');
      return;
    }
    if (adminModalOverlay) {
      adminModalOverlay.classList.add('active');
      adminModalOverlay.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
      switchAdminTab('users');
      fetchAdminUsers();
      fetchAdminClaims();
      fetchAdminFeedback();
      updateAdminCreatorsBadge();
    }
  }

  function closeAdminPortal() {
    if (adminModalOverlay) {
      adminModalOverlay.classList.remove('active');
      adminModalOverlay.setAttribute('aria-hidden', 'true');
      unlockBackgroundScroll();
    }
  }

  let adminAnalyticsState = null;

  function switchAdminTab(tab) {
    adminActiveTab = tab;
    const btnUsers = document.getElementById('tabBtnAdminUsers');
    const btnCreators = document.getElementById('tabBtnAdminCreators');
    const btnClaims = document.getElementById('tabBtnAdminClaims');
    const btnFeedback = document.getElementById('tabBtnAdminFeedback');
    const btnAnalytics = document.getElementById('tabBtnAdminAnalytics');
    const panelUsers = document.getElementById('adminPanelUsers');
    const panelCreators = document.getElementById('adminPanelCreators');
    const panelClaims = document.getElementById('adminPanelClaims');
    const panelFeedback = document.getElementById('adminPanelFeedback');
    const panelAnalytics = document.getElementById('adminPanelAnalytics');

    [btnUsers, btnCreators, btnClaims, btnFeedback, btnAnalytics].forEach(b => b && b.classList.remove('active'));
    [panelUsers, panelCreators, panelClaims, panelFeedback, panelAnalytics].forEach(p => p && (p.style.display = 'none'));

    if (tab === 'users') {
      if (btnUsers) btnUsers.classList.add('active');
      if (panelUsers) panelUsers.style.display = 'block';
      renderAdminUsers();
    } else if (tab === 'creators') {
      if (btnCreators) btnCreators.classList.add('active');
      if (panelCreators) panelCreators.style.display = 'block';
      renderAdminCreators();
    } else if (tab === 'claims') {
      if (btnClaims) btnClaims.classList.add('active');
      if (panelClaims) panelClaims.style.display = 'block';
      renderAdminClaims();
    } else if (tab === 'feedback') {
      if (btnFeedback) btnFeedback.classList.add('active');
      if (panelFeedback) panelFeedback.style.display = 'block';
      renderAdminFeedback();
    } else if (tab === 'analytics') {
      if (btnAnalytics) btnAnalytics.classList.add('active');
      if (panelAnalytics) panelAnalytics.style.display = 'block';
      fetchAdminAnalytics();
    }
  }

  function updateAdminCreatorsBadge() {
    const badge = document.getElementById('adminTabCreatorsBadge');
    if (!badge) return;
    const creators = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER : [];
    if (creatorSettings.disableAllCreators) {
      badge.textContent = 'All Off';
      badge.style.background = 'rgba(239, 68, 68, 0.2)';
      badge.style.color = '#f87171';
    } else {
      const offCount = (creatorSettings.disabledCreators || []).length;
      const activeCount = creators.length - offCount;
      if (offCount === 0) {
        badge.textContent = `${activeCount} Active`;
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
      } else {
        badge.textContent = `${activeCount} Active • ${offCount} Off`;
        badge.style.background = 'rgba(245, 158, 11, 0.2)';
        badge.style.color = '#fbbf24';
      }
    }
  }

  async function saveCreatorSettingsToServer() {
    if (!currentUser || (!currentUser.token && !currentUser.email)) return;
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser.token) headers['Authorization'] = `Bearer ${currentUser.token}`;
    if (currentUser.email) headers['X-User-Email'] = currentUser.email;

    try {
      const res = await fetch('/api/admin/creators/status', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          disabledCreators: creatorSettings.disabledCreators || [],
          disableAllCreators: Boolean(creatorSettings.disableAllCreators)
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'ok') {
          if (Array.isArray(data.disabledCreators)) creatorSettings.disabledCreators = data.disabledCreators;
          if (typeof data.disableAllCreators === 'boolean') creatorSettings.disableAllCreators = data.disableAllCreators;
          saveCreatorSettings();
        }
      }
    } catch (e) {
      console.warn('Could not sync creator settings to server:', e);
    }
  }

  async function setCreatorEnabledStatus(creatorId, enabled) {
    if (!creatorId) return;
    const currentDisabled = new Set(creatorSettings.disabledCreators || []);
    if (enabled) {
      currentDisabled.delete(creatorId);
    } else {
      currentDisabled.add(creatorId);
    }
    creatorSettings.disabledCreators = Array.from(currentDisabled);
    saveCreatorSettings();

    saveCreatorSettingsToServer();

    mergeRecipes();
    calculateIngredientUsage();
    renderRecipes();
    updateCategoryCounts();
    renderAdminCreators();
    updateCreatorDirectoryUI();

    const creator = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === creatorId) : null;
    const name = creator ? creator.name : creatorId;
    if (enabled) {
      showToast(`✅ ${name} enabled. Associated recipes and packs restored.`);
    } else {
      showToast(`🚫 ${name} disabled. All associated recipes and content hidden.`);
    }
  }

  async function setAllCreatorsEnabledStatus(enabled) {
    creatorSettings.disableAllCreators = !enabled;
    saveCreatorSettings();

    saveCreatorSettingsToServer();

    mergeRecipes();
    calculateIngredientUsage();
    renderRecipes();
    updateCategoryCounts();
    renderAdminCreators();
    updateCreatorDirectoryUI();

    if (enabled) {
      showToast('✅ Platform content creators enabled.');
    } else {
      showToast('🚫 All content creators disabled. Platform now displays only universal Community Legends & personal recipes.');
    }
  }

  function renderAdminCreators() {
    const listEl = document.getElementById('adminCreatorsList');
    const masterToggleEl = document.getElementById('adminToggleAllCreators');
    const masterSubtitleEl = document.getElementById('adminMasterCreatorsSubtitle');
    if (!listEl) return;

    const creators = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER : [];
    const isMasterOff = Boolean(creatorSettings.disableAllCreators);

    if (masterToggleEl) {
      masterToggleEl.checked = !isMasterOff;
    }
    if (masterSubtitleEl) {
      if (isMasterOff) {
        masterSubtitleEl.innerHTML = `<span style="color: #f87171; font-weight: 600;">🚫 Master Off: All third-party creator content and recipes are disabled platform-wide</span>`;
      } else {
        const offCount = (creatorSettings.disabledCreators || []).length;
        if (offCount === 0) {
          masterSubtitleEl.innerHTML = `<span style="color: #34d399; font-weight: 600;">✅ Master On: All creators enabled and active</span>`;
        } else {
          masterSubtitleEl.innerHTML = `<span style="color: #fbbf24; font-weight: 600;">⚠️ Master On: ${offCount} of ${creators.length} creators individually disabled</span>`;
        }
      }
    }

    const baseRecipes = (typeof RECIPES_MASTER !== 'undefined') ? RECIPES_MASTER : [];

    listEl.innerHTML = creators.map(c => {
      const isIndividuallyOff = (creatorSettings.disabledCreators || []).includes(c.id);
      const isEffectivelyOff = isMasterOff || isIndividuallyOff;

      // Count recipes belonging to this creator
      const recipeCount = baseRecipes.filter(r => {
        if (
          r.category === 'Community Legends' ||
          (r.categories && r.categories.includes('Community Legends')) ||
          r.category === 'Custom' ||
          r.isPersonal ||
          r.sourceFile === 'Community Legends' ||
          isExactBaseTrio(r)
        ) {
          return false;
        }
        const cId = r.creatorId || 'fitness_product_finder';
        return cId === c.id;
      }).length;

      // Count books
      const books = (typeof BOOKS_MASTER !== 'undefined') ? BOOKS_MASTER.filter(b => b.creatorId === c.id) : [];
      const booksCount = books.length;
      const perksCount = (c.perks && Array.isArray(c.perks)) ? c.perks.length : 0;

      // Count VIPs from adminUsersState
      let vipsCount = 0;
      if (typeof adminUsersState !== 'undefined' && Array.isArray(adminUsersState)) {
        vipsCount = adminUsersState.filter(u => u.creatorVips && Array.isArray(u.creatorVips) && u.creatorVips.includes(c.id)).length;
      }

      const bookPillsHtml = books.map(b => `<span class="creator-book-tag">${escapeHtml(b.shortTitle || b.title)}</span>`).join('');

      return `
        <div class="admin-creator-card ${isEffectivelyOff ? 'disabled' : ''}" data-creator-id="${c.id}">
          <div class="creator-card-top-bar">
            <div class="creator-avatar-badge">${c.id === 'fitness_product_finder' ? '📖' : '🥣'}</div>
            <div class="creator-id-info">
              <div class="creator-name-row">
                <h4 class="creator-name">${escapeHtml(c.name)}</h4>
                <span class="creator-handle">${escapeHtml(c.handle || `@${c.id}`)}</span>
                <span class="creator-status-pill ${isEffectivelyOff ? 'pill-disabled' : 'pill-active'}">
                  ${isEffectivelyOff ? '🚫 Off / Hidden' : '✅ Active &amp; Visible'}
                </span>
              </div>
              <div class="creator-brand-line">${escapeHtml(c.brandName || '')}</div>
            </div>
            <div class="creator-card-switch-wrap">
              <label class="creator-toggle-switch" title="Toggle ${escapeHtml(c.name)} on or off">
                <input type="checkbox" class="creator-individual-toggle" data-creator-id="${c.id}" ${isIndividuallyOff ? '' : 'checked'} ${isMasterOff ? 'disabled' : ''}>
                <span class="creator-toggle-slider"></span>
              </label>
            </div>
          </div>

          <p class="creator-bio-text">${escapeHtml(c.bio || '')}</p>

          <div class="creator-metrics-row">
            <div class="creator-metric-pill">
              <span class="metric-val">${recipeCount}</span>
              <span class="metric-lbl">Recipes</span>
            </div>
            <div class="creator-metric-pill">
              <span class="metric-val">${booksCount}</span>
              <span class="metric-lbl">Cookbooks</span>
            </div>
            <div class="creator-metric-pill">
              <span class="metric-val">${perksCount}</span>
              <span class="metric-lbl">Brand Perks</span>
            </div>
            <div class="creator-metric-pill">
              <span class="metric-val">${vipsCount}</span>
              <span class="metric-lbl">VIP Users</span>
            </div>
          </div>

          <div class="creator-books-preview">
            <div class="preview-title">Associated Cookbooks &amp; Recipe Packs:</div>
            <div class="preview-tags">
              ${bookPillsHtml || '<span style="color: var(--text-muted); font-size: 0.78rem;">No packs configured</span>'}
            </div>
          </div>

          ${isEffectivelyOff ? `
            <div class="creator-disabled-callout">
              <span>🚫 <strong>${isMasterOff ? 'Turned Off by Master Switch' : 'Creator Turned Off'}:</strong> All ${recipeCount} recipes, ${booksCount} cookbooks, brand perks, and storefront links for ${escapeHtml(c.name)} are currently hidden from recipe search, pantry matching, and public catalog views.</span>
            </div>
          ` : `
            <div class="creator-active-callout">
              <span>✨ <strong>Active:</strong> All ${recipeCount} recipes and ${booksCount} cookbooks are active, searchable, and available in the library.</span>
            </div>
          `}
        </div>
      `;
    }).join('');

    // Attach event listeners to individual toggles
    listEl.querySelectorAll('.creator-individual-toggle').forEach(chk => {
      chk.addEventListener('change', async () => {
        const cId = chk.dataset.creatorId;
        const enable = chk.checked;
        await setCreatorEnabledStatus(cId, enable);
      });
    });

    updateAdminCreatorsBadge();
  }

  async function fetchAdminAnalytics() {
    if (!currentUser || currentUser.role !== 'admin') return;
    const container = document.getElementById('adminAnalyticsContent');
    if (!adminAnalyticsState && container) {
      container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-dim);"><div style="font-size: 2rem; margin-bottom: 8px;">📊</div><div>Gathering live platform analytics...</div></div>`;
    }

    try {
      const res = await fetch('/api/admin/analytics', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        adminAnalyticsState = data;
        renderAdminAnalytics();
      } else if (container) {
        container.innerHTML = `<div style="text-align: center; padding: 30px; color: #f87171;">⚠️ ${data.error || 'Failed to load platform analytics.'}</div>`;
      }
    } catch (err) {
      console.warn('Fetch admin analytics error:', err);
      if (container) {
        container.innerHTML = `<div style="text-align: center; padding: 30px; color: #f87171;">⚠️ Connection error loading analytics.</div>`;
      }
    }
  }

  function renderAdminAnalytics() {
    const container = document.getElementById('adminAnalyticsContent');
    if (!container || !adminAnalyticsState) return;

    const { summary, topGeos, devices, topPantry, topFavorites } = adminAnalyticsState;
    const maxPantryCount = topPantry.length > 0 ? topPantry[0].count : 1;
    const maxFavCount = topFavorites.length > 0 ? topFavorites[0].count : 1;

    container.innerHTML = `
      <div class="admin-analytics-container">
        <!-- Hero KPI Cards -->
        <div class="admin-analytics-hero">
          <div class="admin-analytics-kpi-card green">
            <span class="admin-analytics-kpi-title">👥 Registered Accounts</span>
            <span class="admin-analytics-kpi-val">${summary.totalUsers}</span>
            <span class="admin-analytics-kpi-sub">Total database users</span>
          </div>
          <div class="admin-analytics-kpi-card cyan">
            <span class="admin-analytics-kpi-title">⚡ 24h Active Users</span>
            <span class="admin-analytics-kpi-val">${summary.active24h}</span>
            <span class="admin-analytics-kpi-sub">${summary.active7d} active past 7 days</span>
          </div>
          <div class="admin-analytics-kpi-card amber">
            <span class="admin-analytics-kpi-title">🧑‍🍳 Custom Formulations</span>
            <span class="admin-analytics-kpi-val">${summary.totalCustomRecipes}</span>
            <span class="admin-analytics-kpi-sub">Authored in Custom Lab</span>
          </div>
          <div class="admin-analytics-kpi-card">
            <span class="admin-analytics-kpi-title">⭐ Community Reviews</span>
            <span class="admin-analytics-kpi-val">${summary.totalRatings}</span>
            <span class="admin-analytics-kpi-sub">Pint ratings &amp; sub notes</span>
          </div>
        </div>

        <!-- 2-Column Analytics Grids -->
        <div class="admin-analytics-grid-two">
          <!-- Origin Geographies -->
          <div class="admin-analytics-block">
            <div class="admin-analytics-block-header">
              <span class="admin-analytics-block-title">📍 User Origins &amp; Geographies</span>
              <span style="font-size: 0.74rem; color: var(--text-dim);">By Registered Accounts</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${(topGeos && topGeos.length > 0) ? topGeos.map(g => `
                <div class="admin-analytics-row-item">
                  <span style="font-weight: 600; color: #f8fafc;">${escapeHtml(g.location)}</span>
                  <span class="admin-analytics-badge-count">${g.count} user${g.count === 1 ? '' : 's'}</span>
                </div>
              `).join('') : '<div style="color: var(--text-dim); padding: 12px; text-align: center;">No geo signals captured yet</div>'}
            </div>
          </div>

          <!-- Device Breakdown -->
          <div class="admin-analytics-block">
            <div class="admin-analytics-block-header">
              <span class="admin-analytics-block-title">📱 Device &amp; Platform Spread</span>
              <span style="font-size: 0.74rem; color: var(--text-dim);">Operating Systems</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${(devices && devices.length > 0) ? devices.map(d => `
                <div class="admin-analytics-row-item">
                  <span style="font-weight: 600; color: #f8fafc;">${escapeHtml(d.device)}</span>
                  <span class="admin-analytics-badge-count" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">${d.count} user${d.count === 1 ? '' : 's'}</span>
                </div>
              `).join('') : '<div style="color: var(--text-dim); padding: 12px; text-align: center;">No device telemetry yet</div>'}
            </div>
          </div>
        </div>

        <div class="admin-analytics-grid-two">
          <!-- Top Stocked Pantry Ingredients -->
          <div class="admin-analytics-block">
            <div class="admin-analytics-block-header">
              <span class="admin-analytics-block-title">📦 Top Stocked Pantry Staples</span>
              <span style="font-size: 0.74rem; color: var(--text-dim);">Most Checked Items</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${(topPantry && topPantry.length > 0) ? topPantry.map(p => {
                const pct = Math.round((p.count / maxPantryCount) * 100);
                const ingName = p.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `
                  <div class="admin-analytics-row-item">
                    <span style="font-weight: 600; color: #f8fafc; min-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(ingName)}</span>
                    <div class="admin-analytics-bar-bg">
                      <div class="admin-analytics-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                    <span class="admin-analytics-badge-count">${p.count}</span>
                  </div>
                `;
              }).join('') : '<div style="color: var(--text-dim); padding: 12px; text-align: center;">No pantry items stocked yet</div>'}
            </div>
          </div>

          <!-- Top Favorited Recipes -->
          <div class="admin-analytics-block">
            <div class="admin-analytics-block-header">
              <span class="admin-analytics-block-title">💖 Top Favorited Recipes</span>
              <span style="font-size: 0.74rem; color: var(--text-dim);">User Bookmarks</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${(topFavorites && topFavorites.length > 0) ? topFavorites.map(f => {
                const pct = Math.round((f.count / maxFavCount) * 100);
                const rec = (typeof allRecipes !== 'undefined') ? allRecipes.find(r => r.id === f.id) : null;
                const recName = rec ? rec.name : f.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `
                  <div class="admin-analytics-row-item">
                    <span style="font-weight: 600; color: #f8fafc; min-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(recName)}</span>
                    <div class="admin-analytics-bar-bg">
                      <div class="admin-analytics-bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, #f43f5e, #fbbf24);"></div>
                    </div>
                    <span class="admin-analytics-badge-count" style="background: rgba(244, 63, 94, 0.15); color: #fb7185;">${f.count}</span>
                  </div>
                `;
              }).join('') : '<div style="color: var(--text-dim); padding: 12px; text-align: center;">No favorites saved yet</div>'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function fetchAdminUsers() {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (adminUsersList) {
      adminUsersList.innerHTML = `<div style="text-align: center; padding: 36px 20px; color: var(--text-dim);">Loading user directory...</div>`;
    }

    try {
      const res = await fetch('/api/admin/users?limit=all', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.users) {
        adminUsersState = data.users;
        updateAdminStats();
        renderAdminUsers();
      } else {
        showToast('Error loading users: ' + (data.error || 'Server error'));
        if (adminUsersList) {
          adminUsersList.innerHTML = `<div style="text-align: center; padding: 30px; color: #f87171;">⚠️ ${data.error || 'Failed to load users.'}</div>`;
        }
      }
    } catch (err) {
      console.error('Fetch admin users error:', err);
      showToast('Could not connect to user database.');
      if (adminUsersList) {
        adminUsersList.innerHTML = `<div style="text-align: center; padding: 30px; color: #f87171;">⚠️ Connection error. Please verify the server is running.</div>`;
      }
    }
  }

  async function fetchAdminClaims() {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.inquiries) {
        adminClaimsState = data.inquiries;
        updateAdminStats();
        if (adminActiveTab === 'claims') {
          renderAdminClaims();
        }
      }
    } catch (err) {
      console.warn('Fetch admin claims error:', err);
    }
  }

  function updateAdminStats() {
    if (adminTotalUsers) adminTotalUsers.textContent = adminUsersState.length;
    const adminCount = adminUsersState.filter(u => u.role === 'admin').length;
    if (adminTotalAdmins) adminTotalAdmins.textContent = adminCount;
    const creatorCount = adminUsersState.filter(u => u.role === 'creator').length;
    const adminTotalCreators = document.getElementById('adminTotalCreators');
    if (adminTotalCreators) adminTotalCreators.textContent = creatorCount;
    const allAccessCount = adminUsersState.filter(u => Array.isArray(u.subscriptions) && u.subscriptions.includes('All-Access')).length;
    if (adminTotalAllAccess) adminTotalAllAccess.textContent = allAccessCount;

    const freezerUpgradeCount = adminUsersState.filter(u => getUserMaxFreezerSlots(u) > 4).length;
    const adminTotalFreezerUpgrades = document.getElementById('adminTotalFreezerUpgrades');
    if (adminTotalFreezerUpgrades) adminTotalFreezerUpgrades.textContent = freezerUpgradeCount;

    const pendingClaimsCount = adminClaimsState.filter(c => !c.status || c.status === 'pending').length;
    const adminTotalClaims = document.getElementById('adminTotalClaims');
    if (adminTotalClaims) adminTotalClaims.textContent = pendingClaimsCount;

    const tabUsersBadge = document.getElementById('adminTabUsersBadge');
    if (tabUsersBadge) tabUsersBadge.textContent = adminUsersState.length;
    const tabClaimsBadge = document.getElementById('adminTabClaimsBadge');
    if (tabClaimsBadge) tabClaimsBadge.textContent = pendingClaimsCount;

    const pendingFeedbackCount = adminFeedbackState.filter(f => !f.status || f.status === 'pending').length;
    const adminTotalFeedback = document.getElementById('adminTotalFeedback');
    if (adminTotalFeedback) adminTotalFeedback.textContent = adminFeedbackState.length;
    const tabFeedbackBadge = document.getElementById('adminTabFeedbackBadge');
    if (tabFeedbackBadge) tabFeedbackBadge.textContent = pendingFeedbackCount;
  }

  function renderAdminUsers() {
    if (!adminUsersList) return;

    const q = (adminSearchQuery || '').toLowerCase().trim();
    const roleFilter = adminFilterRole || 'all';

    const filtered = adminUsersState.filter(u => {
      const subs = Array.isArray(u.subscriptions) ? u.subscriptions : ['Community Legends'];
      if (roleFilter === 'admin' && u.role !== 'admin') return false;
      if (roleFilter === 'creator' && u.role !== 'creator') return false;
      if (roleFilter === 'vip' && u.role !== 'vip') return false;
      if (roleFilter === 'user' && (u.role && u.role !== 'user')) return false;
      if (roleFilter === 'allaccess' && !subs.includes('All-Access')) return false;
      if (q) {
        const nameMatch = (u.name || u.username || '').toLowerCase().includes(q);
        const emailMatch = (u.email || '').toLowerCase().includes(q);
        const roleMatch = (u.role || '').toLowerCase().includes(q);
        const subMatch = subs.some(s => s.toLowerCase().includes(q));
        const effectiveCap = getUserMaxFreezerSlots(u);
        const capStr = `${effectiveCap} slots`;
        const capMatch = (q === '8' && effectiveCap === 8) || (q === '12' && effectiveCap === 12) || ((q === 'freezer' || q === 'slots') && effectiveCap > 4);
        if (!nameMatch && !emailMatch && !roleMatch && !subMatch && !capStr.includes(q) && !capMatch) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      adminUsersList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <div>No users found matching "${q || roleFilter}".</div>
        </div>
      `;
      return;
    }

    const totalMatched = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalMatched / ADMIN_USERS_PER_PAGE));
    if (adminUsersCurrentPage > totalPages) {
      adminUsersCurrentPage = totalPages;
    }
    const startIndex = (adminUsersCurrentPage - 1) * ADMIN_USERS_PER_PAGE;
    const endIndex = Math.min(startIndex + ADMIN_USERS_PER_PAGE, totalMatched);
    const pagedUsers = filtered.slice(startIndex, endIndex);

    const paginationHtml = totalMatched > ADMIN_USERS_PER_PAGE ? `
      <div class="admin-pagination-bar">
        <div class="admin-pagination-info">Showing <strong>${startIndex + 1}–${endIndex}</strong> of <strong>${totalMatched}</strong> users</div>
        <div class="admin-pagination-controls">
          <button type="button" class="btn-pagination-nav" id="btnAdminPrevPage" ${adminUsersCurrentPage <= 1 ? 'disabled' : ''}>← Previous</button>
          <span class="admin-page-indicator">Page ${adminUsersCurrentPage} of ${totalPages}</span>
          <button type="button" class="btn-pagination-nav" id="btnAdminNextPage" ${adminUsersCurrentPage >= totalPages ? 'disabled' : ''}>Next →</button>
        </div>
      </div>
    ` : '';

    adminUsersList.innerHTML = pagedUsers.map(u => {
      const ADMIN_ROOTS = ['admin@creamicravings.com', 'ahumpo7@gmail.com', 'ahumpo@gmail.com', 'andrew@gmail.com'];
      const userEmail = (u.email || '').toLowerCase();
      const isRootAdmin = ADMIN_ROOTS.includes(userEmail);
      const isCurrentAdmin = (currentUser && currentUser.email && currentUser.email.toLowerCase() === userEmail);
      const subs = Array.isArray(u.subscriptions) ? u.subscriptions : ['Community Legends'];
      const hasAllAccess = subs.includes('All-Access');
      const effectiveCap = getUserMaxFreezerSlots(u);
      const avatarUrl = u.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.username || 'User')}&background=059669&color=fff&bold=true`;
      
      const createdDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A';
      const lastActiveDate = u.last_active ? new Date(u.last_active).toLocaleDateString() : 'Active';

      let roleBadge = '👤 Standard';
      if (u.role === 'admin') {
        roleBadge = '👑 Admin';
      } else if (u.role === 'creator') {
        const creatorObj = (u.creatorId && typeof CREATORS_MASTER !== 'undefined')
          ? CREATORS_MASTER.find(c => c.id === u.creatorId)
          : null;
        roleBadge = creatorObj ? `🧑‍🍳 Creator (${creatorObj.name})` : '🧑‍🍳 Creator';
      } else if (u.role === 'vip') {
        roleBadge = '⭐ VIP';
      }

      const isExpanded = expandedAdminUserIds.has(u.id);

      return `
        <div class="admin-user-card ${isExpanded ? 'expanded' : ''}" data-user-id="${u.id}" data-user-email="${u.email}">
          <!-- Compact Summary Bar (Always Visible, Click to Toggle) -->
          <div class="admin-user-summary-bar" title="Click to ${isExpanded ? 'collapse' : 'expand user details & permissions'}">
            <div class="admin-user-info-cluster">
              <img src="${avatarUrl}" alt="${escapeHtml(u.name || 'User')}" class="admin-user-avatar" onerror="this.src='https://ui-avatars.com/api/?name=U&background=059669&color=fff'">
              <div class="admin-user-summary-text">
                <div class="admin-user-name-row">
                  <span class="admin-user-name">${escapeHtml(u.name || u.username || 'Unnamed User')}</span>
                  ${isCurrentAdmin ? `<span class="badge" style="font-size: 0.68rem; background: rgba(5, 150, 105, 0.25); color: #34d399; padding: 1px 6px; border-radius: 4px; font-weight: 700; flex-shrink: 0;">You</span>` : ''}
                </div>
                <div class="admin-user-badges-row">
                  <span class="admin-user-badge ${u.role || 'user'}">${roleBadge}</span>
                  <span class="admin-shelf-pill" style="font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; font-weight: 700; background: ${(effectiveCap >= 12 ? 'rgba(245, 158, 11, 0.2)' : (effectiveCap >= 8 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.15)'))}; color: ${(effectiveCap >= 12 ? '#fbbf24' : (effectiveCap >= 8 ? '#38bdf8' : '#94a3b8'))}; border: 1px solid ${(effectiveCap >= 12 ? 'rgba(245, 158, 11, 0.35)' : (effectiveCap >= 8 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.25)'))};">
                    ${effectiveCap >= 12 ? '👑 12 Slots' : (effectiveCap >= 8 ? '🧊 8 Slots' : '4 Free Slots')}
                  </span>
                </div>
                <div class="admin-user-email">
                  <span class="admin-email-text" title="${escapeHtml(u.email || '')}">${escapeHtml(u.email || 'No email attached')}</span>
                  ${u.creatorId ? ` • <span style="color: #38bdf8; font-weight: 600;">Creator: ${escapeHtml(u.creatorId)}</span>` : ''}
                  ${(u.country || u.city) ? ` • <span style="color: #34d399; font-weight: 600;">📍 ${escapeHtml([u.city, u.country].filter(Boolean).join(', '))}</span>` : ''}
                  ${u.device ? ` • <span style="color: #94a3b8; font-size: 0.72rem;">📱 ${escapeHtml(u.device)}</span>` : ''}
                  <span class="admin-joined-text">• Joined: ${createdDate}</span>
                </div>
                ${(u.creatorVips && u.creatorVips.length > 0) ? `
                  <div class="admin-creator-vips-row" style="margin-top: 2px; display: flex; gap: 4px; flex-wrap: wrap;">
                    ${u.creatorVips.map(cv => {
                      const crObj = (typeof CREATORS_MASTER !== 'undefined') ? CREATORS_MASTER.find(c => c.id === cv) : null;
                      const crName = crObj ? crObj.name : cv;
                      return `<span style="font-size: 0.7rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 4px; padding: 1px 6px; font-weight: 600;">⭐ VIP: ${escapeHtml(crName)}</span>`;
                    }).join('')}
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="admin-card-expand-toggle">
              <span class="admin-expand-label">${isExpanded ? 'Collapse' : '<span class="label-full">Manage &amp; Packs</span><span class="label-short">Manage</span>'}</span>
              <span class="admin-expand-chevron">${isExpanded ? '▴' : '▾'}</span>
            </div>
          </div>

          <!-- Collapsible Details Drawer -->
          <div class="admin-user-details-drawer">
            <div class="admin-user-top" style="margin-bottom: 4px;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Account Role &amp; Shelf Capacity:</div>
              <div class="admin-user-actions" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <select class="admin-role-select" data-user-id="${u.id}" ${isRootAdmin ? 'disabled title="Root administrator role cannot be changed"' : 'title="Change user system role"'}>
                  <option value="user" ${(!u.role || u.role === 'user') ? 'selected' : ''}>👤 Standard User</option>
                  <option value="creator" ${u.role === 'creator' ? 'selected' : ''}>🧑‍🍳 Content Creator</option>
                  <option value="vip" ${u.role === 'vip' ? 'selected' : ''}>⭐ Legacy VIP / QA</option>
                  <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>👑 Administrator</option>
                </select>
                ${u.role === 'creator' ? `
                  <select class="admin-creator-select" data-user-id="${u.id}" title="Assign Creator Storefront Profile" style="font-size: 0.78rem; background: rgba(15, 23, 42, 0.85); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 6px 8px; font-weight: 600;">
                    <option value="fitness_product_finder" ${(u.creatorId === 'fitness_product_finder' || !u.creatorId) ? 'selected' : ''}>🧑‍🍳 Eli (FPF)</option>
                    <option value="test_content" ${u.creatorId === 'test_content' ? 'selected' : ''}>🧪 TestContent</option>
                  </select>
                ` : ''}
                <select class="admin-freezer-select" data-user-id="${u.id}" title="Grant or change freezer shelf container capacity" style="font-size: 0.78rem; background: rgba(15, 23, 42, 0.85); color: ${(effectiveCap >= 12 ? '#fbbf24' : (effectiveCap >= 8 ? '#38bdf8' : '#cbd5e1'))}; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 6px 8px; font-weight: 600;">
                  <option value="4" ${effectiveCap === 4 ? 'selected' : ''}>🧊 4 Slots (Default)</option>
                  <option value="8" ${effectiveCap === 8 ? 'selected' : ''}>🧊 8 Slots (Full Week)</option>
                  <option value="12" ${effectiveCap >= 12 ? 'selected' : ''}>👑 12 Slots (Deep Freeze Pro)</option>
                </select>
                <button class="btn-admin-reset-pw" data-user-id="${u.id}" data-user-email="${u.email}" title="Reset user password directly">
                  🔑 Reset PW
                </button>
                ${(!isRootAdmin && !isCurrentAdmin) ? `
                  <button class="btn-admin-del-user" data-user-id="${u.id}" data-user-email="${u.email}" title="Delete user account">
                    🗑️ Delete
                  </button>
                ` : ''}
              </div>
            </div>

            <div class="admin-user-stats-strip">
              <span>📅 Joined: <strong>${createdDate}</strong></span>
              <span>⚡ Last Active: <strong>${lastActiveDate}</strong></span>
              <span>🧊 Shelf: <strong style="${(effectiveCap >= 12 ? 'color: #fbbf24;' : (effectiveCap >= 8 ? 'color: #38bdf8;' : 'color: #94a3b8;'))}">${effectiveCap >= 12 ? '👑 12 Slots' : (effectiveCap >= 8 ? '🧊 8 Slots' : '4 Free Slots')}</strong></span>
              <span>📦 Pantry: <strong>${u.pantryCount || 0}</strong></span>
              <span>💖 Favs: <strong>${u.favoritesCount || 0}</strong></span>
              <span>🍨 Spins: <strong>${u.madeTotal || 0}</strong></span>
              <span>🧑‍🍳 Custom: <strong>${u.customCount || 0}</strong></span>
            </div>

            ${u.role === 'creator' ? `
              <div class="admin-creator-socials-box" style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 10px 12px; margin-top: 4px;">
                <div style="font-size: 0.74rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">📱 Creator Social Links &amp; Card Branding:</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px;">
                  <input type="text" class="admin-creator-ig" data-user-id="${u.id}" placeholder="📸 Instagram (@handle)" value="${escapeHtml((u.socialLinks && u.socialLinks.instagram) || '')}" style="font-size: 0.78rem; padding: 6px 8px; background: rgba(12, 14, 23, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff;" />
                  <input type="text" class="admin-creator-tiktok" data-user-id="${u.id}" placeholder="🎵 TikTok (@handle)" value="${escapeHtml((u.socialLinks && u.socialLinks.tiktok) || '')}" style="font-size: 0.78rem; padding: 6px 8px; background: rgba(12, 14, 23, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff;" />
                  <input type="text" class="admin-creator-yt" data-user-id="${u.id}" placeholder="▶️ YouTube Channel" value="${escapeHtml((u.socialLinks && u.socialLinks.youtube) || '')}" style="font-size: 0.78rem; padding: 6px 8px; background: rgba(12, 14, 23, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff;" />
                  <input type="text" class="admin-creator-web" data-user-id="${u.id}" placeholder="🌐 Website / Shop URL" value="${escapeHtml((u.socialLinks && u.socialLinks.website) || '')}" style="font-size: 0.78rem; padding: 6px 8px; background: rgba(12, 14, 23, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #fff;" />
                </div>
                <button type="button" class="btn-secondary btn-save-admin-social" data-user-id="${u.id}" style="margin-top: 8px; font-size: 0.74rem; padding: 5px 12px; font-weight: 700;">💾 Save Socials</button>
              </div>
            ` : ''}

            <div class="admin-subs-section">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
              <div class="admin-subs-title">📦 Recipe Pack Permissions:</div>
              <div class="admin-presets-row" style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button type="button" class="btn-preset-grant-eli" data-user-id="${u.id}" title="Grant Eli All-Access Bundle">
                  👑 Eli All-Access
                </button>
                <button type="button" class="btn-preset-grant-test" data-user-id="${u.id}" title="Grant TestContent All-Access">
                  🧪 TestContent All-Access
                </button>
                <button type="button" class="btn-preset-grant-all" data-user-id="${u.id}" title="Grant Everything Across All Creators">
                  ✨ All Creators
                </button>
                <button type="button" class="btn-preset-reset-free" data-user-id="${u.id}" title="Reset to Community Legends (Free)">
                  🔒 Reset to Free
                </button>
              </div>
            </div>

            <!-- Platform / Universal Free -->
            <div style="margin-bottom: 8px;">
              <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">🌐 Platform / Universal:</div>
              <div class="admin-subs-chips-wrap">
                ${UNIVERSAL_SUBSCRIPTIONS.map(subName => {
                  const isActive = subs.includes(subName);
                  return `
                    <button type="button" 
                      class="btn-sub-chip ${isActive ? 'active' : ''}" 
                      data-user-id="${u.id}" 
                      data-sub="${subName}"
                      title="${isActive ? 'Universal free community pack' : 'Click to enable ' + subName}">
                      ${subName} ${isActive ? '✓' : '+'}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Eli (FPF) Packs -->
            <div style="margin-bottom: 8px;">
              <div style="font-size: 0.72rem; color: #f59e0b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">🧑‍🍳 Eli (Fitness Product Finder):</div>
              <div class="admin-subs-chips-wrap">
                ${ELI_SUBSCRIPTIONS.map(subName => {
                  const hasEliAll = subs.includes('All-Access') || subs.includes('Eli All-Access');
                  const isActive = hasEliAll || subs.includes(subName);
                  const isAllAccessChip = (subName === 'All-Access');
                  return `
                    <button type="button" 
                      class="btn-sub-chip ${isActive ? 'active' : ''} ${isAllAccessChip ? 'all-access' : ''}" 
                      data-user-id="${u.id}" 
                      data-sub="${subName}"
                      title="${isActive ? 'Click to revoke ' + subName : 'Click to grant ' + subName}">
                      ${isAllAccessChip ? '👑 ' : ''}${subName} ${isActive ? '✓' : '+'}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- TestContent Studio Packs -->
            <div>
              <div style="font-size: 0.72rem; color: #38bdf8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">🧪 TestContent Studio:</div>
              <div class="admin-subs-chips-wrap">
                ${TEST_CONTENT_SUBSCRIPTIONS.map(subName => {
                  const hasTestAll = subs.includes('TestContent All-Access');
                  const isActive = hasTestAll || subs.includes(subName);
                  const isAllAccessChip = (subName === 'TestContent All-Access');
                  return `
                    <button type="button" 
                      class="btn-sub-chip ${isActive ? 'active' : ''} ${isAllAccessChip ? 'all-access' : ''}" 
                      data-user-id="${u.id}" 
                      data-sub="${subName}"
                      title="${isActive ? 'Click to revoke ' + subName : 'Click to grant ' + subName}">
                      ${isAllAccessChip ? '🧪 ' : ''}${subName} ${isActive ? '✓' : '+'}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('') + paginationHtml;

    bindAdminUserCardEvents();
  }

  function bindAdminUserCardEvents() {
    if (!adminUsersList) return;

    // Admin Directory Pagination Listeners
    const prevBtn = adminUsersList.querySelector('#btnAdminPrevPage');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (adminUsersCurrentPage > 1) {
          adminUsersCurrentPage--;
          renderAdminUsers();
          adminUsersList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    const nextBtn = adminUsersList.querySelector('#btnAdminNextPage');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        adminUsersCurrentPage++;
        renderAdminUsers();
        adminUsersList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Toggle expand/collapse when clicking user summary bar
    adminUsersList.querySelectorAll('.admin-user-summary-bar').forEach(bar => {
      bar.addEventListener('click', (e) => {
        if (e.target.closest('button, select, input, a')) return;
        const card = bar.closest('.admin-user-card');
        if (!card) return;
        const userId = card.dataset.userId;
        const willExpand = !card.classList.contains('expanded');
        card.classList.toggle('expanded');
        if (willExpand) {
          expandedAdminUserIds.add(userId);
        } else {
          expandedAdminUserIds.delete(userId);
        }
        const label = card.querySelector('.admin-expand-label');
        const chevron = card.querySelector('.admin-expand-chevron');
        if (label) {
          label.innerHTML = willExpand 
            ? 'Collapse' 
            : '<span class="label-full">Manage &amp; Packs</span><span class="label-short">Manage</span>';
        }
        if (chevron) chevron.textContent = willExpand ? '▴' : '▾';
      });
    });

    // Role Dropdown Select
    adminUsersList.querySelectorAll('.admin-role-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const userId = sel.dataset.userId;
        const newRole = sel.value;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;
        await updateUserPermissions(user.id, user.email, user.subscriptions || ['Community Legends'], newRole, user.creatorId);
      });
    });

    // Creator Profile Select (when role is creator)
    adminUsersList.querySelectorAll('.admin-creator-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const userId = sel.dataset.userId;
        const newCreatorId = sel.value;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;
        await updateUserPermissions(user.id, user.email, user.subscriptions || ['Community Legends'], user.role || 'creator', newCreatorId, user.freezerCapacity || 4);
      });
    });

    // Freezer Shelf Capacity Select
    adminUsersList.querySelectorAll('.admin-freezer-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const userId = sel.dataset.userId;
        const newCap = parseInt(sel.value, 10);
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;
        await updateUserPermissions(user.id, user.email, user.subscriptions || ['Community Legends'], user.role || 'user', user.creatorId, newCap);
        showToast(`🧊 Updated ${user.name || user.email}'s freezer shelf to ${newCap} slots!`);
      });
    });

    // Save Creator Socials from Admin Card
    adminUsersList.querySelectorAll('.btn-save-admin-social').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;
        const card = btn.closest('.admin-user-card');
        if (!card) return;
        const socialLinks = {
          instagram: card.querySelector('.admin-creator-ig')?.value.trim() || '',
          tiktok: card.querySelector('.admin-creator-tiktok')?.value.trim() || '',
          youtube: card.querySelector('.admin-creator-yt')?.value.trim() || '',
          website: card.querySelector('.admin-creator-web')?.value.trim() || ''
        };
        await updateUserPermissions(user.id, user.email, user.subscriptions || ['Community Legends'], user.role || 'creator', user.creatorId, user.freezerCapacity || 4, socialLinks);
        showToast(`✅ Saved social links for ${user.name || user.email}!`);
      });
    });

    // Preset: Grant Eli All-Access
    adminUsersList.querySelectorAll('.btn-preset-grant-eli').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;
        const existingOther = (user.subscriptions || []).filter(s => !ELI_SUBSCRIPTIONS.includes(s));
        const newSubs = Array.from(new Set([...existingOther, ...ELI_SUBSCRIPTIONS, 'Community Legends']));
        await updateUserPermissions(user.id, user.email, newSubs, user.role || 'user', user.creatorId);
      });
    });

    // Preset: Grant TestContent All-Access
    adminUsersList.querySelectorAll('.btn-preset-grant-test').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;
        const existingOther = (user.subscriptions || []).filter(s => !TEST_CONTENT_SUBSCRIPTIONS.includes(s));
        const newSubs = Array.from(new Set([...existingOther, ...TEST_CONTENT_SUBSCRIPTIONS, 'Community Legends']));
        await updateUserPermissions(user.id, user.email, newSubs, user.role || 'user', user.creatorId);
      });
    });

    // Preset: Grant All Creators
    adminUsersList.querySelectorAll('.btn-preset-grant-all').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;
        const newSubs = [...ALL_CATEGORY_SUBSCRIPTIONS];
        await updateUserPermissions(user.id, user.email, newSubs, user.role || 'user', user.creatorId);
      });
    });

    // Preset: Reset to Free Starter Tiers
    adminUsersList.querySelectorAll('.btn-preset-reset-free').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;
        const newSubs = ['Community Legends'];
        await updateUserPermissions(user.id, user.email, newSubs, user.role || 'user', user.creatorId);
      });
    });

    // Delete User Buttons
    adminUsersList.querySelectorAll('.btn-admin-del-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const userEmail = btn.dataset.userEmail;
        const user = adminUsersState.find(u => u.id === userId);
        const displayName = (user ? user.name : '') || userEmail || userId;

        if (!confirm(`⚠️ PERMANENT DELETION: Are you sure you want to delete user account "${displayName}"?\n\nThis will remove their account and all personal data.`)) {
          return;
        }

        await deleteUserAccount(userId, userEmail);
      });
    });

    // Admin Reset Password Buttons
    adminUsersList.querySelectorAll('.btn-admin-reset-pw').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const userEmail = btn.dataset.userEmail;
        await adminResetUserPassword(userId, userEmail);
      });
    });

    // Subscription Chip Toggles
    adminUsersList.querySelectorAll('.btn-sub-chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        const userId = chip.dataset.userId;
        const subName = chip.dataset.sub;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;

        let curSubs = Array.isArray(user.subscriptions) ? [...user.subscriptions] : ['Community Legends'];

        if (subName === 'All-Access') {
          if (curSubs.includes('All-Access')) {
            curSubs = curSubs.filter(s => !ELI_SUBSCRIPTIONS.includes(s));
            if (!curSubs.includes('Community Legends')) curSubs.push('Community Legends');
          } else {
            curSubs = Array.from(new Set([...curSubs, ...ELI_SUBSCRIPTIONS]));
          }
        } else if (subName === 'TestContent All-Access') {
          if (curSubs.includes('TestContent All-Access')) {
            curSubs = curSubs.filter(s => !TEST_CONTENT_SUBSCRIPTIONS.includes(s));
            if (!curSubs.includes('Community Legends')) curSubs.push('Community Legends');
          } else {
            curSubs = Array.from(new Set([...curSubs, ...TEST_CONTENT_SUBSCRIPTIONS]));
          }
        } else {
          if (curSubs.includes(subName)) {
            if (subName === 'Community Legends' && curSubs.length === 1) {
              showToast('Community Legends is universal free and cannot be removed.');
              return;
            }
            curSubs = curSubs.filter(s => s !== subName);
            if (ELI_SUBSCRIPTIONS.includes(subName)) {
              curSubs = curSubs.filter(s => s !== 'All-Access');
            }
            if (TEST_CONTENT_SUBSCRIPTIONS.includes(subName)) {
              curSubs = curSubs.filter(s => s !== 'TestContent All-Access');
            }
          } else {
            curSubs.push(subName);
            const nonAllEli = ELI_SUBSCRIPTIONS.filter(s => s !== 'All-Access');
            if (nonAllEli.every(s => curSubs.includes(s))) {
              if (!curSubs.includes('All-Access')) curSubs.push('All-Access');
            }
            const nonAllTest = TEST_CONTENT_SUBSCRIPTIONS.filter(s => s !== 'TestContent All-Access');
            if (nonAllTest.every(s => curSubs.includes(s))) {
              if (!curSubs.includes('TestContent All-Access')) curSubs.push('TestContent All-Access');
            }
          }
        }

        await updateUserPermissions(user.id, user.email, curSubs, user.role, user.creatorId);
      });
    });
  }

  function renderAdminClaims() {
    const listEl = document.getElementById('adminClaimsList');
    if (!listEl) return;

    const filterStatus = adminFilterClaimStatus || 'all';
    const filtered = adminClaimsState.filter(c => {
      const st = c.status || 'pending';
      if (filterStatus !== 'all' && st !== filterStatus) return false;
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
          <div style="font-size: 2rem; margin-bottom: 8px;">📬</div>
          <div>No ${filterStatus !== 'all' ? filterStatus : ''} claims or inquiries found.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(c => {
      const isPending = !c.status || c.status === 'pending';
      const isApproved = c.status === 'approved';
      const isDismissed = c.status === 'dismissed';
      const dateStr = c.timestamp ? new Date(c.timestamp).toLocaleString() : 'N/A';
      const actionType = (c.action === 'claim_existing') ? 'E-Book Access Claim' : 'Purchase Request';

      return `
        <div class="claim-card ${c.status || 'pending'}" data-inquiry-id="${c.id}">
          <div class="claim-info-left">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="claim-email">${c.email}</span>
              <span class="claim-badge-status ${c.status || 'pending'}">${c.status || 'pending'}</span>
            </div>
            <div class="claim-details-row">
              <span class="claim-pack-badge">📦 ${c.pack}</span>
              <span>• Type: <strong>${actionType}</strong></span>
              <span>• ${dateStr}</span>
            </div>
            ${(c.orderId || c.checkoutEmail || c.notes) ? `
              <div class="claim-verification-details">
                ${c.orderId ? `<div><strong>🧾 Order / Receipt #:</strong> <code>${escapeHtml(c.orderId)}</code></div>` : ''}
                ${c.checkoutEmail ? `<div><strong>📧 Checkout Email:</strong> <span>${escapeHtml(c.checkoutEmail)}</span></div>` : ''}
                ${c.notes ? `<div><strong>📝 Note:</strong> <span style="color: var(--text-secondary); font-style: italic;">"${escapeHtml(c.notes)}"</span></div>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="claim-actions">
            ${isPending ? `
              <button type="button" class="btn-claim-approve" data-inquiry-id="${c.id}" data-email="${c.email}" data-pack="${c.pack}">
                ✓ Approve &amp; Grant Pack
              </button>
              <button type="button" class="btn-claim-dismiss" data-inquiry-id="${c.id}">
                ✕ Dismiss
              </button>
            ` : `
              <span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
                ${isApproved ? '✅ Access granted' : '✕ Dismissed'}
              </span>
            `}
          </div>
        </div>
      `;
    }).join('');

    bindAdminClaimsEvents();
  }

  function bindAdminClaimsEvents() {
    const listEl = document.getElementById('adminClaimsList');
    if (!listEl) return;

    listEl.querySelectorAll('.btn-claim-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        const inquiryId = btn.dataset.inquiryId;
        const email = btn.dataset.email;
        const pack = btn.dataset.pack;
        if (!confirm(`Approve access claim and automatically grant "${pack}" pack to ${email}?`)) {
          return;
        }
        await resolveAdminClaim(inquiryId, 'approve');
      });
    });

    listEl.querySelectorAll('.btn-claim-dismiss').forEach(btn => {
      btn.addEventListener('click', async () => {
        const inquiryId = btn.dataset.inquiryId;
        await resolveAdminClaim(inquiryId, 'dismiss');
      });
    });
  }

  async function resolveAdminClaim(inquiryId, action) {
    try {
      showToast('Processing claim...');
      const res = await fetch('/api/admin/inquiry/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        },
        body: JSON.stringify({
          token: currentUser.token,
          adminEmail: currentUser.email,
          inquiryId,
          action
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(action === 'approve' ? '✅ Claim approved and pack granted!' : 'Claim dismissed.');
        await fetchAdminUsers();
        await fetchAdminClaims();
      } else {
        showToast('Error: ' + (data.error || 'Failed to update claim'));
      }
    } catch (err) {
      console.error('Resolve claim error:', err);
      showToast('Connection error while updating claim.');
    }
  }

  // --- Admin Portal Feedback Management (Roadmap Item 21) ---
  let adminFeedbackState = [];
  let adminFilterFeedbackStatus = 'all';

  async function fetchAdminFeedback() {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.email !== 'ahumpo7@gmail.com')) return;
    const listEl = document.getElementById('adminFeedbackList');
    if (listEl) {
      listEl.innerHTML = `<div style="text-align: center; padding: 36px 20px; color: var(--text-dim);">Loading feedback...</div>`;
    }

    try {
      const res = await fetch('/api/admin/feedback', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.feedback) {
        adminFeedbackState = data.feedback;
        updateAdminStats();
        if (adminActiveTab === 'feedback') {
          renderAdminFeedback();
        }
      }
    } catch (err) {
      console.warn('Fetch admin feedback error:', err);
      if (listEl) {
        listEl.innerHTML = `<div style="text-align: center; padding: 30px; color: #f87171;">⚠️ Failed to load feedback.</div>`;
      }
    }
  }

  function renderAdminFeedback() {
    const listEl = document.getElementById('adminFeedbackList');
    if (!listEl) return;

    const filterStatus = adminFilterFeedbackStatus || 'all';
    const filtered = adminFeedbackState.filter(f => {
      const st = f.status || 'pending';
      if (filterStatus !== 'all' && st !== filterStatus) return false;
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
          <div style="font-size: 2rem; margin-bottom: 8px;">💬</div>
          <div>No ${filterStatus !== 'all' ? filterStatus : ''} feedback submissions found.</div>
        </div>
      `;
      return;
    }

    const categoryIcons = {
      feature: '💡 Feature Request',
      recipe_idea: '🍨 Recipe Idea',
      bug: '🐞 Bug Report',
      general: '⭐ General'
    };

    listEl.innerHTML = filtered.map(f => {
      const isPending = !f.status || f.status === 'pending';
      const isReviewed = f.status === 'reviewed';
      const isDismissed = f.status === 'dismissed';
      const dateStr = f.timestamp ? new Date(f.timestamp).toLocaleString() : 'N/A';
      const catLabel = categoryIcons[f.category] || f.category || 'Feedback';

      let starsHtml = '';
      if (f.rating) {
        const ratingNum = Math.min(5, Math.max(1, parseInt(f.rating) || 5));
        starsHtml = `<span style="color: #fbbf24; font-size: 0.95rem; margin-left: 6px;">${'★'.repeat(ratingNum)}${'☆'.repeat(5 - ratingNum)}</span>`;
      }

      return `
        <div class="admin-feedback-card status-${f.status || 'pending'}" data-feedback-id="${f.id}">
          <div class="feedback-card-top">
            <div class="feedback-submitter-info">
              <span class="feedback-user-name">${escapeHtml(f.name || 'Anonymous')}</span>
              ${f.email ? `<span class="feedback-user-email">&lt;${escapeHtml(f.email)}&gt;</span>` : ''}
              ${starsHtml}
            </div>
            <div class="feedback-meta-badges">
              <span class="badge-feedback-cat">${catLabel}</span>
              <span class="badge-feedback-status ${f.status || 'pending'}">${f.status || 'pending'}</span>
            </div>
          </div>
          <div class="feedback-card-body">
            ${escapeHtml(f.message || '')}
          </div>
          <div class="feedback-card-footer">
            <span>📅 Submitted ${dateStr}</span>
            <div class="feedback-actions-row">
              ${isPending ? `
                <button type="button" class="btn-xs btn-claim-approve btn-feedback-review" data-feedback-id="${f.id}">
                  ✓ Mark Reviewed
                </button>
                <button type="button" class="btn-xs btn-claim-dismiss btn-feedback-dismiss" data-feedback-id="${f.id}">
                  ✕ Dismiss
                </button>
              ` : `
                <span style="font-size: 0.8rem; color: var(--text-dim); font-style: italic;">
                  ${isReviewed ? '✅ Reviewed' : '✕ Dismissed'}
                </span>
                <button type="button" class="btn-xs btn-outline btn-feedback-reopen" data-feedback-id="${f.id}" title="Reopen feedback">
                  ↺ Reopen
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindAdminFeedbackEvents();
  }

  function bindAdminFeedbackEvents() {
    const listEl = document.getElementById('adminFeedbackList');
    if (!listEl) return;

    listEl.querySelectorAll('.btn-feedback-review').forEach(btn => {
      btn.addEventListener('click', () => updateAdminFeedbackStatus(btn.dataset.feedbackId, 'reviewed'));
    });
    listEl.querySelectorAll('.btn-feedback-dismiss').forEach(btn => {
      btn.addEventListener('click', () => updateAdminFeedbackStatus(btn.dataset.feedbackId, 'dismissed'));
    });
    listEl.querySelectorAll('.btn-feedback-reopen').forEach(btn => {
      btn.addEventListener('click', () => updateAdminFeedbackStatus(btn.dataset.feedbackId, 'pending'));
    });
  }

  async function updateAdminFeedbackStatus(feedbackId, newStatus) {
    try {
      const res = await fetch('/api/admin/feedback/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        },
        body: JSON.stringify({ id: feedbackId, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const item = adminFeedbackState.find(f => f.id === feedbackId);
        if (item) item.status = newStatus;
        updateAdminStats();
        renderAdminFeedback();
        showToast(`Feedback status updated to "${newStatus}".`);
      } else {
        showToast('Error: ' + (data.error || 'Failed to update feedback.'));
      }
    } catch (err) {
      console.error('Update feedback error:', err);
      showToast('Network error while updating feedback.');
    }
  }

  async function downloadAdminDatabaseBackup() {
    const btn = document.getElementById('btnAdminDownloadBackup');
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.email !== 'ahumpo7@gmail.com')) return;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ Preparing .zip...</span>';
    }

    try {
      const res = await fetch('/api/admin/backup/download', {
        headers: {
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const nowStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.download = `creami_db_backup_${nowStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('📦 Production database snapshot (.zip) downloaded!');
    } catch (err) {
      console.error('Backup download failed:', err);
      showToast('❌ Backup download failed: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>📥 Backup DB (.zip)</span>';
      }
    }
  }

  async function updateUserPermissions(userId, email, newSubs, newRole, newCreatorId = null, newFreezerCapacity = null, newSocialLinks = null) {
    try {
      showToast('Updating permissions...');
      const payload = {
        token: currentUser.token,
        adminEmail: currentUser.email,
        userId,
        email,
        subscriptions: newSubs,
        role: newRole
      };
      if (newCreatorId) payload.creatorId = newCreatorId;
      if (newSocialLinks) payload.socialLinks = newSocialLinks;
      if (newFreezerCapacity !== null && newFreezerCapacity !== undefined) {
        payload.freezerCapacity = parseInt(newFreezerCapacity, 10);
      }

      const res = await fetch('/api/admin/user/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && (data.status === 'ok' || data.success)) {
        showToast('✅ Permissions updated successfully!');
        // Update local state
        const idx = adminUsersState.findIndex(u => u.id === userId || (email && u.email === email));
        if (idx !== -1) {
          adminUsersState[idx].subscriptions = newSubs;
          adminUsersState[idx].role = newRole;
          if (newCreatorId) adminUsersState[idx].creatorId = newCreatorId;
          if (newSocialLinks) adminUsersState[idx].socialLinks = newSocialLinks;
          if (newFreezerCapacity !== null && newFreezerCapacity !== undefined) {
            adminUsersState[idx].freezerCapacity = parseInt(newFreezerCapacity, 10);
          } else if (data.user && data.user.freezerCapacity) {
            adminUsersState[idx].freezerCapacity = data.user.freezerCapacity;
          }
        }

        // If updating the currently signed in user, refresh their session
        if (currentUser && (currentUser.id === userId || (email && currentUser.email === email))) {
          currentUser.subscriptions = newSubs;
          currentUser.role = newRole;
          if (newCreatorId) currentUser.creatorId = newCreatorId;
          if (newSocialLinks) currentUser.socialLinks = newSocialLinks;
          if (newFreezerCapacity !== null && newFreezerCapacity !== undefined) {
            currentUser.freezerCapacity = parseInt(newFreezerCapacity, 10);
            freezerSlotCapacity = currentUser.freezerCapacity;
          } else if (data.user && data.user.freezerCapacity) {
            currentUser.freezerCapacity = data.user.freezerCapacity;
            const newMax = getUserMaxFreezerSlots(currentUser);
            if (freezerSlotCapacity < newMax) freezerSlotCapacity = newMax;
          } else {
            const newMax = getUserMaxFreezerSlots(currentUser);
            if (freezerSlotCapacity < newMax) freezerSlotCapacity = newMax;
          }
          saveUserAuth();
          updateAuthUI();
          renderRecipes();
          renderFreezerShelfWidget();
        }

        updateAdminStats();
        renderAdminUsers();
      } else {
        showToast('Error updating permissions: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error('Update user permissions error:', err);
      showToast('Could not save user permissions.');
    }
  }

  async function deleteUserAccount(userId, email) {
    try {
      showToast('Deleting user...');
      const res = await fetch('/api/admin/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        },
        body: JSON.stringify({
          token: currentUser.token,
          adminEmail: currentUser.email,
          userId,
          email
        })
      });

      const data = await res.json();
      if (res.ok && (data.status === 'ok' || data.success)) {
        showToast('🗑️ User account deleted.');
        adminUsersState = adminUsersState.filter(u => u.id !== userId && (!email || u.email !== email));
        updateAdminStats();
        renderAdminUsers();
      } else {
        showToast('Error deleting user: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error('Delete user error:', err);
      showToast('Could not delete user account.');
    }
  }

  async function adminResetUserPassword(userId, email) {
    const targetDesc = email || userId || 'user';
    const newPassword = prompt(`🔑 Set new password for ${targetDesc}:\n(Must be at least 6 characters. Leave empty to cancel)`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      showToast('❌ Password must be at least 6 characters long.');
      return;
    }

    try {
      showToast('Updating password...');
      const res = await fetch('/api/admin/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        },
        body: JSON.stringify({
          token: currentUser.token,
          adminEmail: currentUser.email,
          userId,
          email,
          newPassword
        })
      });

      const data = await res.json();
      if (res.ok && (data.status === 'ok' || data.success)) {
        showToast(`✅ Password updated for ${targetDesc}!`);
      } else {
        showToast('❌ ' + (data.error || 'Failed to update password.'));
      }
    } catch (err) {
      console.error('Admin password reset error:', err);
      showToast('❌ Network error updating password.');
    }
  }

  function openAdminCreateUserModal() {
    const overlay = document.getElementById('adminCreateUserModalOverlay');
    const form = document.getElementById('adminCreateUserForm');
    if (!overlay) return;
    if (form) form.reset();
    const customSubsGrid = document.getElementById('adminNewUserCustomSubs');
    if (customSubsGrid) customSubsGrid.style.display = 'none';
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    const emailInput = document.getElementById('adminNewUserEmail');
    if (emailInput) setTimeout(() => emailInput.focus(), 50);
  }

  function closeAdminCreateUserModal() {
    const overlay = document.getElementById('adminCreateUserModalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }

  async function handleAdminCreateUser(e) {
    e.preventDefault();
    const emailInput = document.getElementById('adminNewUserEmail');
    const nameInput = document.getElementById('adminNewUserName');
    const usernameInput = document.getElementById('adminNewUserUsername');
    const passwordInput = document.getElementById('adminNewUserPassword');
    const roleSelect = document.getElementById('adminNewUserRole');

    const email = emailInput ? emailInput.value.trim() : '';
    const name = nameInput ? nameInput.value.trim() : '';
    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    const role = roleSelect ? roleSelect.value : 'user';

    if (!email && !username) {
      showToast('⚠️ Email or username is required.');
      return;
    }

    const presetRadio = document.querySelector('input[name="adminNewUserTierPreset"]:checked');
    const preset = presetRadio ? presetRadio.value : 'free';

    let subscriptions = ['Community Legends'];
    if (preset === 'allaccess') {
      subscriptions = [...ALL_CATEGORY_SUBSCRIPTIONS];
    } else if (preset === 'custom') {
      const checkedBoxes = document.querySelectorAll('#adminNewUserCustomSubs .chk-custom-sub:checked');
      checkedBoxes.forEach(chk => {
        if (!subscriptions.includes(chk.value)) subscriptions.push(chk.value);
      });
    }

    try {
      showToast('Creating user account...');
      const res = await fetch('/api/admin/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
          'X-User-Email': currentUser.email || ''
        },
        body: JSON.stringify({
          token: currentUser.token,
          adminEmail: currentUser.email,
          email,
          name,
          username,
          password,
          role,
          subscriptions
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        closeAdminCreateUserModal();
        const tempPass = data.user.tempPassword || password || 'creami123';
        showToast(`✅ Created user "${data.user.name}" (${data.user.role})!`);
        alert(`🎉 User Account Created Successfully!\n\nEmail: ${data.user.email}\nUsername: ${data.user.username}\nRole: ${data.user.role}\nPassword: ${tempPass}\n\nYou can share these credentials with the user or content creator.`);
        await fetchAdminUsers();
      } else {
        showToast('Error: ' + (data.error || 'Failed to create user'));
      }
    } catch (err) {
      console.error('Create user error:', err);
      showToast('Connection error while creating user.');
    }
  }

  // --- Event Bindings ---
  function bindEvents() {
    // Delegated click listener for Pantry items and category headers
    if (ingredientListContainer) {
      ingredientListContainer.addEventListener('click', (e) => {
        const incBtn = e.target.closest('[data-action="inc-pantry-qty"]');
        if (incBtn) {
          e.stopPropagation();
          const id = incBtn.dataset.id;
          if (id) incrementPantryQuantity(id);
          return;
        }

        const decBtn = e.target.closest('[data-action="dec-pantry-qty"]');
        if (decBtn) {
          e.stopPropagation();
          const id = decBtn.dataset.id;
          if (id) decrementPantryQuantity(id);
          return;
        }

        const editBtn = e.target.closest('[data-action="edit-pantry-qty"]');
        if (editBtn) {
          e.stopPropagation();
          const id = editBtn.dataset.id;
          if (id) openPantryQuantityModal(id);
          return;
        }

        if (e.target.closest('.pantry-qty-stepper')) {
          e.stopPropagation();
          return;
        }

        const row = e.target.closest('.ingredient-checkbox-item');
        if (row && row.dataset.id) {
          togglePantryItem(row.dataset.id);
          return;
        }
        const header = e.target.closest('.category-header');
        if (header) {
          const group = header.closest('.category-group');
          if (group) group.classList.toggle('open');
        }
      });
    }

    // Pantry Item Quantity Modal Listeners
    const pantryQtyModal = document.getElementById('pantryQtyModalOverlay');
    const pantryQtyCloseBtn = document.getElementById('pantryQtyModalCloseBtn');
    const btnModalQtyDec = document.getElementById('btnModalQtyDec');
    const btnModalQtyInc = document.getElementById('btnModalQtyInc');
    const btnModalQtySave = document.getElementById('btnModalQtySave');
    const btnModalQtyRemove = document.getElementById('btnModalQtyRemove');
    const pantryQtyInput = document.getElementById('pantryQtyModalInput');

    if (pantryQtyCloseBtn) {
      pantryQtyCloseBtn.addEventListener('click', closePantryQuantityModal);
    }
    if (pantryQtyModal) {
      pantryQtyModal.addEventListener('click', (e) => {
        if (e.target === pantryQtyModal) closePantryQuantityModal();
      });
    }
    if (btnModalQtyDec && pantryQtyInput) {
      btnModalQtyDec.addEventListener('click', () => {
        let val = parseInt(pantryQtyInput.value, 10) || 1;
        if (val > 1) pantryQtyInput.value = val - 1;
      });
    }
    if (btnModalQtyInc && pantryQtyInput) {
      btnModalQtyInc.addEventListener('click', () => {
        let val = parseInt(pantryQtyInput.value, 10) || 0;
        pantryQtyInput.value = val + 1;
      });
    }
    document.querySelectorAll('.pantry-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = parseInt(chip.dataset.qty, 10);
        if (!isNaN(q) && pantryQtyInput) {
          pantryQtyInput.value = q;
        }
      });
    });
    if (btnModalQtySave && pantryQtyInput) {
      btnModalQtySave.addEventListener('click', () => {
        if (!activePantryQtyId) return;
        const val = parseInt(pantryQtyInput.value, 10);
        if (!isNaN(val) && val > 0) {
          pantryState.add(activePantryQtyId);
          pantryItemQuantities[activePantryQtyId] = val;
          savePantry();
          updatePantryCheckboxVisuals();
          renderRecipes();
          showToast(`✓ Set ${getPantryItemDisplayName(activePantryQtyId)} to x${val} in pantry`);
        } else {
          pantryState.delete(activePantryQtyId);
          delete pantryItemQuantities[activePantryQtyId];
          savePantry();
          updatePantryCheckboxVisuals();
          renderRecipes();
          showToast(`Removed ${getPantryItemDisplayName(activePantryQtyId)} from pantry`);
        }
        closePantryQuantityModal();
      });
    }
    if (btnModalQtyRemove) {
      btnModalQtyRemove.addEventListener('click', () => {
        if (!activePantryQtyId) return;
        pantryState.delete(activePantryQtyId);
        delete pantryItemQuantities[activePantryQtyId];
        savePantry();
        updatePantryCheckboxVisuals();
        renderRecipes();
        showToast(`Removed ${getPantryItemDisplayName(activePantryQtyId)} from pantry`);
        closePantryQuantityModal();
      });
    }

    // Ingredient Search
    if (ingredientSearch) {
      ingredientSearch.addEventListener('input', (e) => {
        ingredientSearchQuery = e.target.value;
        if (clearIngSearchBtn) {
          clearIngSearchBtn.style.display = ingredientSearchQuery ? 'block' : 'none';
        }
        renderPantryList();
      });
    }

    if (clearIngSearchBtn) {
      clearIngSearchBtn.addEventListener('click', () => {
        ingredientSearch.value = '';
        ingredientSearchQuery = '';
        clearIngSearchBtn.style.display = 'none';
        renderPantryList();
      });
    }

    // Check All & Clear All Pantry
    if (checkAllBtn) {
      checkAllBtn.addEventListener('click', () => {
        const visibleItems = getUserPantryIngredients();
        visibleItems.forEach(i => {
          pantryState.add(i.id);
          if (isSingleUseItem(i) && !pantryItemQuantities[i.id]) {
            pantryItemQuantities[i.id] = 1;
          }
        });
        savePantry();
        updatePantryCheckboxVisuals();
        updateStats();
        renderRecipes();
        showToast(`✓ All ${visibleItems.length} pantry items checked`);
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        pantryState.clear();
        pantryItemQuantities = {};
        savePantry();
        updatePantryCheckboxVisuals();
        updateStats();
        renderRecipes();
        showToast('Cleared pantry');
      });
    }

    // Presets
    document.querySelectorAll('.preset-chips .chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        const presetItems = PANTRY_PRESETS[presetKey] || [];
        presetItems.forEach(id => {
          pantryState.add(id);
          if (isSingleUseItem(id) && !pantryItemQuantities[id]) {
            pantryItemQuantities[id] = 1;
          }
        });
        savePantry();
        updatePantryCheckboxVisuals();
        renderRecipes();
        showToast(`⚡ Added ${presetItems.length} items from ${btn.textContent.trim()}`);
      });
    });

    // Recipe Search (Debounced for silky-smooth typing performance)
    let recipeSearchDebounceTimer = null;
    if (recipeSearch) {
      recipeSearch.addEventListener('input', (e) => {
        recipeSearchQuery = e.target.value;
        if (clearRecipeSearchBtn) {
          clearRecipeSearchBtn.style.display = recipeSearchQuery ? 'block' : 'none';
        }
        if (recipeSearchDebounceTimer) clearTimeout(recipeSearchDebounceTimer);
        recipeSearchDebounceTimer = setTimeout(() => {
          renderRecipes();
        }, 120);
      });
    }

    if (clearRecipeSearchBtn) {
      clearRecipeSearchBtn.addEventListener('click', () => {
        recipeSearch.value = '';
        recipeSearchQuery = '';
        clearRecipeSearchBtn.style.display = 'none';
        if (recipeSearchDebounceTimer) clearTimeout(recipeSearchDebounceTimer);
        renderRecipes();
      });
    }

    // Toggles
    if (readyOnlyToggle) {
      readyOnlyToggle.addEventListener('change', (e) => {
        readyOnlyFilter = e.target.checked;
        if (readyOnlyFilter && baseOnlyToggle) {
          baseOnlyToggle.checked = false;
          baseOnlyFilter = false;
        }
        renderRecipes();
      });
    }

    if (baseOnlyToggle) {
      baseOnlyToggle.addEventListener('change', (e) => {
        baseOnlyFilter = e.target.checked;
        if (baseOnlyFilter && readyOnlyToggle) {
          readyOnlyToggle.checked = false;
          readyOnlyFilter = false;
        }
        renderRecipes();
      });
    }

    // Sort Select
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderRecipes();
      });
    }

    // Category Tabs
    if (categoryTabs) {
      categoryTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        if (btn.dataset.category === 'favorites' && !currentUser) {
          openGoogleAuthModal();
          showToast('🔒 Please sign in to view your favorite recipes!');
          return;
        }
        const targetCategory = btn.dataset.category;
        if (activeCategory === targetCategory && targetCategory !== 'all') {
          activeCategory = 'all';
          categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          const allTab = categoryTabs.querySelector('[data-category="all"]');
          if (allTab) allTab.classList.add('active');
          renderRecipes();
          return;
        }

        categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = targetCategory;
        renderRecipes();
      });
    }

    // Creami Roulette (Roadmap Item 12)
    if (rouletteBtn) {
      rouletteBtn.addEventListener('click', spinCreamiRoulette);
    }
    if (rouletteModalCloseBtn) {
      rouletteModalCloseBtn.addEventListener('click', closeRouletteModal);
    }
    if (rouletteModalOverlay) {
      rouletteModalOverlay.addEventListener('click', (e) => {
        if (e.target === rouletteModalOverlay) closeRouletteModal();
      });
    }
    if (btnRouletteOpenWinner) {
      btnRouletteOpenWinner.addEventListener('click', () => {
        if (lastRouletteWinner) {
          closeRouletteModal();
          openRecipeModal(lastRouletteWinner, true);
        }
      });
    }
    if (btnRouletteSpinAgain) {
      btnRouletteSpinAgain.addEventListener('click', spinCreamiRoulette);
    }

    // Chef Badges & Milestones (Phase 1 Gamification)
    if (openBadgesBtn) {
      openBadgesBtn.addEventListener('click', openBadgesModal);
    }
    if (statBadgesCard) {
      statBadgesCard.addEventListener('click', openBadgesModal);
    }
    if (badgesModalCloseBtn) {
      badgesModalCloseBtn.addEventListener('click', closeBadgesModal);
    }
    if (btnCloseBadgesFooter) {
      btnCloseBadgesFooter.addEventListener('click', closeBadgesModal);
    }
    if (badgesModalOverlay) {
      badgesModalOverlay.addEventListener('click', (e) => {
        if (e.target === badgesModalOverlay) closeBadgesModal();
      });
    }
    if (btnShareBadges) {
      btnShareBadges.addEventListener('click', shareBadgesAchievement);
    }

    const badgeTabs = document.querySelectorAll('.btn-badge-tab');
    if (badgeTabs && badgeTabs.length > 0) {
      badgeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          badgeTabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
          currentBadgeFilter = tab.dataset.filter || tab.dataset.tab || 'all';
          renderBadgesGrid();
        });
      });
    }

    // Fitness & Macro Target Sliders (Roadmap Item 10)
    if (toggleMacroSlidersBtn) {
      toggleMacroSlidersBtn.addEventListener('click', toggleMacroSliders);
    }

    let macroRafId = null;
    function scheduleMacroRender() {
      if (macroRafId) return;
      macroRafId = requestAnimationFrame(() => {
        macroRafId = null;
        renderRecipes();
      });
    }

    if (minProteinSlider) {
      minProteinSlider.addEventListener('input', (e) => {
        macroFilters.minProtein = parseInt(e.target.value) || 0;
        updateMacroFiltersUI();
        scheduleMacroRender();
      });
      minProteinSlider.addEventListener('change', () => {
        if (macroRafId) {
          cancelAnimationFrame(macroRafId);
          macroRafId = null;
        }
        renderRecipes();
      });
    }

    if (maxCaloriesSlider) {
      maxCaloriesSlider.addEventListener('input', (e) => {
        macroFilters.maxCalories = parseInt(e.target.value) || 450;
        updateMacroFiltersUI();
        scheduleMacroRender();
      });
      maxCaloriesSlider.addEventListener('change', () => {
        if (macroRafId) {
          cancelAnimationFrame(macroRafId);
          macroRafId = null;
        }
        renderRecipes();
      });
    }

    if (maxFatSlider) {
      maxFatSlider.addEventListener('input', (e) => {
        macroFilters.maxFat = parseInt(e.target.value) || 20;
        updateMacroFiltersUI();
        scheduleMacroRender();
      });
      maxFatSlider.addEventListener('change', () => {
        if (macroRafId) {
          cancelAnimationFrame(macroRafId);
          macroRafId = null;
        }
        renderRecipes();
      });
    }

    if (resetMacroSlidersBtn) {
      resetMacroSlidersBtn.addEventListener('click', () => {
        if (macroRafId) {
          cancelAnimationFrame(macroRafId);
          macroRafId = null;
        }
        macroFilters.minProtein = 0;
        macroFilters.maxCalories = 450;
        macroFilters.maxFat = 20;
        if (minProteinSlider) minProteinSlider.value = 0;
        if (maxCaloriesSlider) maxCaloriesSlider.value = 450;
        if (maxFatSlider) maxFatSlider.value = 20;
        updateMacroFiltersUI();
        renderRecipes();
        showToast('🎯 Macro target filters reset');
      });
    }

    // Condensed Secondary Filter Bar Events
    if (dietFilterSelect) {
      dietFilterSelect.addEventListener('change', (e) => {
        activeDietFilter = e.target.value;
        if (activeDietFilter !== 'all') {
          dietFilterSelect.classList.add('active');
        } else {
          dietFilterSelect.classList.remove('active');
        }
        renderRecipes();
      });
    }

    if (cravingFilterSelect) {
      cravingFilterSelect.addEventListener('change', (e) => {
        activeCravingFilter = e.target.value;
        if (activeCravingFilter !== 'all') {
          cravingFilterSelect.classList.add('active-craving');
        } else {
          cravingFilterSelect.classList.remove('active-craving');
        }
        renderRecipes();
      });
    }

    // Legacy quick filter chips handler (if present)
    const quickFilterChipsBar = document.getElementById('quickFilterChipsBar');
    if (quickFilterChipsBar) {
      quickFilterChipsBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn || btn.id === 'toggleMacroSlidersBtn') return;
        const filterVal = btn.dataset.filter;

        if (activeQuickFilter === filterVal && filterVal !== 'all') {
          activeQuickFilter = 'all';
          quickFilterChipsBar.querySelectorAll('.filter-chip').forEach(b => {
            if (b.id !== 'toggleMacroSlidersBtn') b.classList.remove('active');
          });
          const allChip = quickFilterChipsBar.querySelector('[data-filter="all"]');
          if (allChip) allChip.classList.add('active');
          renderRecipes();
          return;
        }

        quickFilterChipsBar.querySelectorAll('.filter-chip').forEach(b => {
          if (b.id !== 'toggleMacroSlidersBtn') b.classList.remove('active');
        });
        btn.classList.add('active');
        activeQuickFilter = filterVal;
        renderRecipes();
      });
    }

    // Complete Filter Reset Function
    function resetAllFilters() {
      if (recipeSearch) recipeSearch.value = '';
      recipeSearchQuery = '';
      if (clearRecipeSearchBtn) clearRecipeSearchBtn.style.display = 'none';
      if (readyOnlyToggle) readyOnlyToggle.checked = false;
      readyOnlyFilter = false;
      if (baseOnlyToggle) baseOnlyToggle.checked = false;
      baseOnlyFilter = false;
      if (readyOnlyPill) readyOnlyPill.classList.remove('checked');
      if (baseOnlyPill) baseOnlyPill.classList.remove('checked');

      activeCategory = 'all';
      activeDietFilter = 'all';
      activeCravingFilter = 'all';
      activeQuickFilter = 'all';
      if (dietFilterSelect) {
        dietFilterSelect.value = 'all';
        dietFilterSelect.classList.remove('active');
      }
      if (cravingFilterSelect) {
        cravingFilterSelect.value = 'all';
        cravingFilterSelect.classList.remove('active-craving');
      }

      // Reset macro target sliders
      macroFilters.minProtein = 0;
      macroFilters.maxCalories = 450;
      macroFilters.maxFat = 20;
      if (minProteinSlider) minProteinSlider.value = 0;
      if (maxCaloriesSlider) maxCaloriesSlider.value = 450;
      if (maxFatSlider) maxFatSlider.value = 20;
      updateMacroFiltersUI();
      if (macroSlidersPanel) macroSlidersPanel.style.display = 'none';
      if (toggleMacroSlidersBtn) toggleMacroSlidersBtn.classList.remove('active-panel');

      if (categoryTabs) {
        categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const allBtn = categoryTabs.querySelector('[data-category="all"]');
        if (allBtn) allBtn.classList.add('active');
      }
      renderRecipes();
    }

    if (clearAllFiltersBtn) {
      clearAllFiltersBtn.addEventListener('click', resetAllFilters);
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // Modals Close
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeRecipeModal);
    if (recipeModalOverlay) {
      recipeModalOverlay.addEventListener('click', (e) => {
        if (e.target === recipeModalOverlay) closeRecipeModal();
      });
    }

    if (shoppingModalCloseBtn) shoppingModalCloseBtn.addEventListener('click', closeShoppingListModal);
    if (shoppingModalOverlay) {
      shoppingModalOverlay.addEventListener('click', (e) => {
        if (e.target === shoppingModalOverlay) closeShoppingListModal();
      });
    }

    if (openShoppingListBtn) openShoppingListBtn.addEventListener('click', openShoppingListModal);
    if (copyShoppingListBtn) copyShoppingListBtn.addEventListener('click', copyShoppingList);
    const shareShoppingListBtn = document.getElementById('shareShoppingListBtn');
    const keepShoppingListBtn = document.getElementById('keepShoppingListBtn');
    if (shareShoppingListBtn) shareShoppingListBtn.addEventListener('click', shareShoppingList);
    if (keepShoppingListBtn) keepShoppingListBtn.addEventListener('click', exportToGoogleKeep);
    if (printShoppingListBtn) printShoppingListBtn.addEventListener('click', printShoppingList);
    if (clearShoppingListBtn) clearShoppingListBtn.addEventListener('click', clearShoppingList);

    const btnShopViewStandard = document.getElementById('btnShopViewStandard');
    const btnShopViewStore = document.getElementById('btnShopViewStore');
    if (btnShopViewStandard) {
      btnShopViewStandard.addEventListener('click', () => {
        if (shoppingViewMode !== 'standard') {
          shoppingViewMode = 'standard';
          localStorage.setItem('creami_shopping_view_mode', 'standard');
          openShoppingListModal();
        }
      });
    }
    if (btnShopViewStore) {
      btnShopViewStore.addEventListener('click', () => {
        if (shoppingViewMode !== 'store') {
          shoppingViewMode = 'store';
          localStorage.setItem('creami_shopping_view_mode', 'store');
          openShoppingListModal();
        }
      });
    }

    // Freezer Tracker Modal & Add Form (Roadmap Item 8)
    if (openFreezerTrackerBtn) openFreezerTrackerBtn.addEventListener('click', openFreezerModal);
    if (freezerModalCloseBtn) freezerModalCloseBtn.addEventListener('click', closeFreezerModal);
    if (freezerModalOverlay) {
      freezerModalOverlay.addEventListener('click', (e) => {
        if (e.target === freezerModalOverlay) closeFreezerModal();
      });
    }

    // Quick Slot Fill Modal & Virtual Freezer Shelf Controls (Beta Staging)
    const slotFillModalOverlay = document.getElementById('slotFillModalOverlay');
    const slotFillModalCloseBtn = document.getElementById('slotFillModalCloseBtn');
    const slotFillCancelBtn = document.getElementById('slotFillCancelBtn');
    const slotFillForm = document.getElementById('slotFillForm');

    if (slotFillModalCloseBtn) slotFillModalCloseBtn.addEventListener('click', closeSlotFillModal);
    if (slotFillCancelBtn) slotFillCancelBtn.addEventListener('click', closeSlotFillModal);
    if (slotFillModalOverlay) {
      slotFillModalOverlay.addEventListener('click', (e) => {
        if (e.target === slotFillModalOverlay) closeSlotFillModal();
      });
    }

    const slotFillRecipeInput = document.getElementById('slotFillRecipeInput');
    const slotFillPintScale = document.getElementById('slotFillPintScale');
    if (slotFillRecipeInput) {
      slotFillRecipeInput.addEventListener('input', () => {
        const val = slotFillRecipeInput.value.trim().toLowerCase();
        const match = allRecipes.find(r => r.name.toLowerCase() === val);
        const recipeIdInput = document.getElementById('slotFillRecipeId');
        if (match && recipeIdInput) {
          recipeIdInput.value = match.id;
        }
        updateSlotFillPreview();
      });
      slotFillRecipeInput.addEventListener('change', () => {
        const val = slotFillRecipeInput.value.trim().toLowerCase();
        const match = allRecipes.find(r => r.name.toLowerCase() === val);
        const recipeIdInput = document.getElementById('slotFillRecipeId');
        if (match && recipeIdInput) {
          recipeIdInput.value = match.id;
        }
        updateSlotFillPreview();
      });
    }
    if (slotFillPintScale) {
      slotFillPintScale.addEventListener('change', updateSlotFillPreview);
    }

    const slotFillAlreadyFrozen = document.getElementById('slotFillAlreadyFrozen');
    const slotFillFreezeHours = document.getElementById('slotFillFreezeHours');
    const slotFillSubmitBtn = document.getElementById('slotFillSubmitBtn');
    function updateSlotFillSubmitText() {
      if (!slotFillSubmitBtn) return;
      const slotNum = document.getElementById('slotFillTargetSlotNumber')?.value || '1';
      const isFrozen = Boolean((slotFillAlreadyFrozen && slotFillAlreadyFrozen.checked) || (slotFillFreezeHours && slotFillFreezeHours.value === '0'));
      if (isFrozen) {
        slotFillSubmitBtn.textContent = `🍨 Put in Slot ${slotNum} as Ready to Spin`;
      } else {
        slotFillSubmitBtn.textContent = '❄️ Start Freeze Countdown';
      }
    }
    if (slotFillAlreadyFrozen) slotFillAlreadyFrozen.addEventListener('change', updateSlotFillSubmitText);
    if (slotFillFreezeHours) slotFillFreezeHours.addEventListener('change', updateSlotFillSubmitText);

    if (slotFillForm) {
      slotFillForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const slotNum = parseInt(document.getElementById('slotFillTargetSlotNumber').value, 10);
        const recName = document.getElementById('slotFillRecipeInput').value.trim();
        let recId = document.getElementById('slotFillRecipeId').value;
        if (!recId) {
          const match = allRecipes.find(r => r.name.toLowerCase() === recName.toLowerCase());
          if (match) recId = match.id;
        }
        const scale = parseFloat(document.getElementById('slotFillPintScale').value) || 1.0;
        const hours = parseInt(document.getElementById('slotFillFreezeHours').value, 10);
        const notes = document.getElementById('slotFillNotes').value.trim();
        const lidColor = document.getElementById('slotFillLidColor') ? document.getElementById('slotFillLidColor').value : getPintLidColor(slotNum).id;

        const alreadyFrozenCheck = document.getElementById('slotFillAlreadyFrozen');
        const isAlreadyFrozen = Boolean((alreadyFrozenCheck && alreadyFrozenCheck.checked) || hours === 0);
        const actualHours = (isNaN(hours) || hours === 0) ? 16 : hours;

        const recMatch = allRecipes.find(r => (recId && r.id === recId) || (r.name && r.name.toLowerCase() === recName.toLowerCase()));
        const detectedMixins = recMatch && Array.isArray(recMatch.ingredients)
          ? recMatch.ingredients.filter(isMixinIngredient).map(ing => {
              const scaledQty = ing.amount ? scaleQuantity(ing.amount, scale) : '';
              const unit = ing.unit ? ing.unit.trim() : '';
              return {
                name: ing.name || ing.raw || 'Mix-in',
                qty: [scaledQty, unit].filter(Boolean).join(' ')
              };
            })
          : [];
        const recommendedCycle = (recMatch && recMatch.spinSetting) || 'Lite Ice Cream';

        // Remove any pint currently occupying this slot
        freezerPintsState = freezerPintsState.filter(p => p.slot !== slotNum);

        const newPint = {
          id: `freezer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          slot: slotNum,
          recipeId: recId || null,
          recipeName: recName,
          scale: scale,
          sizeLabel: scale === 1.5 ? '24 oz Deluxe' : '16 oz Standard',
          frozenAt: isAlreadyFrozen ? (Date.now() - ((actualHours + 1) * 3600 * 1000)) : Date.now(),
          freezeHours: actualHours,
          lidColor: lidColor,
          notes: notes,
          mixins: detectedMixins,
          spinSetting: recommendedCycle,
          notified: false
        };

        freezerPintsState.unshift(newPint);
        saveFreezerPints();
        closeSlotFillModal();
        renderFreezerShelfWidget();

        const deducted = deductSingleUseIngredients(newPint.recipeId || newPint.recipeName, newPint.scale || 1.0);
        if (deducted && deducted.length > 0) {
          setTimeout(() => notifyPantryDeduction(deducted), 800);
        }

        if (isAlreadyFrozen) {
          fireFreezeNotification(newPint);
        } else {
          schedulePintFreezeAlert(newPint);
          showToast(`❄️ Slot ${slotNum} filled with "${recName}"! ${actualHours}h countdown active. 🎉`);
        }
      });
    }

    // Shelf Capacity Toggle buttons (with Hybrid Model B + C Lock Check)
    document.querySelectorAll('.btn-slot-cap').forEach(btn => {
      btn.addEventListener('click', () => {
        const requestedCap = parseInt(btn.dataset.slots, 10);
        const maxAllowed = getUserMaxFreezerSlots(currentUser);
        if (requestedCap > maxAllowed) {
          openFreezerUpgradeModal(requestedCap, 'locked_tab');
          return;
        }
        freezerSlotCapacity = requestedCap;
        localStorage.setItem(FREEZER_CAPACITY_STORAGE_KEY, freezerSlotCapacity.toString());
        renderFreezerShelfWidget();
      });
    });

    // Freezer Shelf Upgrade Modal Listeners
    const freezerUpgradeOverlay = document.getElementById('freezerUpgradeModalOverlay');
    const freezerUpgradeCloseBtn = document.getElementById('freezerUpgradeModalCloseBtn');
    const freezerUpgradeCloseBottom = document.getElementById('btnFreezerUpgradeCloseBottom');
    const btnFreezerBuy8 = document.getElementById('btnFreezerBuy8');
    const btnFreezerBuy12 = document.getElementById('btnFreezerBuy12');
    const btnFreezerBrowseBooks8 = document.getElementById('btnFreezerBrowseBooks8');
    const btnFreezerBrowseBundles12 = document.getElementById('btnFreezerBrowseBundles12');

    if (freezerUpgradeCloseBtn) {
      freezerUpgradeCloseBtn.addEventListener('click', closeFreezerUpgradeModal);
    }
    if (freezerUpgradeCloseBottom) {
      freezerUpgradeCloseBottom.addEventListener('click', closeFreezerUpgradeModal);
    }
    if (freezerUpgradeOverlay) {
      freezerUpgradeOverlay.addEventListener('click', (e) => {
        if (e.target === freezerUpgradeOverlay) closeFreezerUpgradeModal();
      });
    }
    if (btnFreezerBuy8) {
      btnFreezerBuy8.addEventListener('click', () => handleUpgradeFreezerCapacity(8));
    }
    if (btnFreezerBuy12) {
      btnFreezerBuy12.addEventListener('click', () => handleUpgradeFreezerCapacity(12));
    }
    if (btnFreezerBrowseBooks8) {
      btnFreezerBrowseBooks8.addEventListener('click', () => {
        closeFreezerUpgradeModal();
        openRecipePacksModal();
      });
    }
    if (btnFreezerBrowseBundles12) {
      btnFreezerBrowseBundles12.addEventListener('click', () => {
        closeFreezerUpgradeModal();
        openRecipePacksModal();
      });
    }

    const btnFreezerModalUpgrade = document.getElementById('btnFreezerModalUpgrade');
    if (btnFreezerModalUpgrade) {
      btnFreezerModalUpgrade.addEventListener('click', () => {
        const maxAllowed = getUserMaxFreezerSlots(currentUser);
        openFreezerUpgradeModal(maxAllowed < 8 ? 8 : 12, 'modal_banner');
      });
    }

    const shelfTierBadge = document.getElementById('shelfTierBadge');
    if (shelfTierBadge) {
      shelfTierBadge.addEventListener('click', () => {
        const maxAllowed = getUserMaxFreezerSlots(currentUser);
        if (maxAllowed < 12) {
          openFreezerUpgradeModal(maxAllowed < 8 ? 8 : 12, 'tier_badge');
        }
      });
    }

    // Shelf Collapse Toggle: Entire header, title area, or button
    function toggleFreezerShelf() {
      isShelfCollapsed = !isShelfCollapsed;
      localStorage.setItem(FREEZER_COLLAPSED_STORAGE_KEY, isShelfCollapsed ? 'true' : 'false');
      renderFreezerShelfWidget();
    }

    const shelfHeaderEl = document.getElementById('freezerShelfHeader');
    if (shelfHeaderEl) {
      shelfHeaderEl.addEventListener('click', (e) => {
        // Do not toggle if clicking on action buttons or the upgrade tier badge
        if (e.target.closest('.shelf-actions') || e.target.closest('#shelfTierBadge')) {
          return;
        }
        toggleFreezerShelf();
      });
      shelfHeaderEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target === shelfHeaderEl) {
            e.preventDefault();
            toggleFreezerShelf();
          }
        }
      });
    }

    const shelfCollapseBtn = document.getElementById('btnShelfToggleCollapse');
    if (shelfCollapseBtn) {
      shelfCollapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFreezerShelf();
      });
    }

    // Smart Substitutions Modal (Roadmap Item 16)
    if (swapModalCloseBtn) swapModalCloseBtn.addEventListener('click', closeSwapInspector);
    if (swapBackToRecipeBtn) swapBackToRecipeBtn.addEventListener('click', closeSwapInspector);
    if (swapModalOverlay) {
      swapModalOverlay.addEventListener('click', (e) => {
        if (e.target === swapModalOverlay) closeSwapInspector();
      });
    }

    // Modal Background Scroll & Overscroll Containment
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      setupModalScrollLock(overlay);
    });

    if (freezerToggleAddBtn) {
      freezerToggleAddBtn.addEventListener('click', () => toggleFreezerAddForm());
    }
    if (freezerCancelAddBtn) {
      freezerCancelAddBtn.addEventListener('click', () => toggleFreezerAddForm(false));
    }

    if (freezerTimePresets) {
      freezerTimePresets.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-time-preset');
        if (!btn) return;
        freezerTimePresets.querySelectorAll('.btn-time-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        freezerSelectedTimeOffset = parseFloat(btn.dataset.offset) || 0;
        if (freezerCustomTime) freezerCustomTime.value = '';
      });
    }

    if (freezerCustomTime) {
      freezerCustomTime.addEventListener('input', () => {
        if (freezerCustomTime.value && freezerTimePresets) {
          freezerTimePresets.querySelectorAll('.btn-time-preset').forEach(b => b.classList.remove('active'));
        }
      });
    }

    const freezerAlreadyFrozen = document.getElementById('freezerAlreadyFrozen');
    const freezerSubmitAddBtn = document.getElementById('freezerSubmitAddBtn');
    if (freezerAlreadyFrozen) {
      freezerAlreadyFrozen.addEventListener('change', () => {
        if (freezerAlreadyFrozen.checked) {
          if (freezerSubmitAddBtn) freezerSubmitAddBtn.textContent = '🍨 Log as Frozen & Ready to Spin';
        } else {
          if (freezerSubmitAddBtn) freezerSubmitAddBtn.textContent = '🧊 Freeze Pint & Start 16h Timer';
        }
      });
    }

    if (freezerAddForm) {
      freezerAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (freezerRecipeNameInput ? freezerRecipeNameInput.value : '').trim();
        if (!name) return;
        const scale = parseFloat(freezerPintScale ? freezerPintScale.value : '1.0') || 1.0;
        const notes = (freezerNotes ? freezerNotes.value : '').trim();

        const alreadyFrozenCheck = document.getElementById('freezerAlreadyFrozen');
        const isAlreadyFrozen = Boolean(alreadyFrozenCheck && alreadyFrozenCheck.checked);

        let frozenAt = Date.now();
        if (isAlreadyFrozen) {
          frozenAt = Date.now() - (17 * 3600 * 1000);
        } else if (freezerCustomTime && freezerCustomTime.value) {
          const parsed = new Date(freezerCustomTime.value).getTime();
          if (!isNaN(parsed)) frozenAt = parsed;
        } else if (freezerSelectedTimeOffset > 0) {
          frozenAt = Date.now() - (freezerSelectedTimeOffset * 3600 * 1000);
        }

        const reqNotif = freezerNotifyOnReady ? freezerNotifyOnReady.checked : true;
        const lidColor = document.getElementById('freezerAddLidColor') ? document.getElementById('freezerAddLidColor').value : 'blue';

        addFreezerPint({
          recipeName: name,
          scale: scale,
          notes: notes,
          frozenAt: frozenAt,
          requestNotification: reqNotif,
          lidColor: lidColor
        });

        freezerAddForm.reset();
        if (freezerAlreadyFrozen) freezerAlreadyFrozen.checked = false;
        if (freezerSubmitAddBtn) freezerSubmitAddBtn.textContent = '🧊 Freeze Pint & Start 16h Timer';
        if (freezerNotifyOnReady) freezerNotifyOnReady.checked = true;
        freezerSelectedTimeOffset = 0;
        if (freezerTimePresets) {
          freezerTimePresets.querySelectorAll('.btn-time-preset').forEach(b => {
            b.classList.toggle('active', b.dataset.offset === '0');
          });
        }
      });
    }

    if (addCustomRecipeBtn) addCustomRecipeBtn.addEventListener('click', openCustomRecipeModal);
    if (customModalCloseBtn) customModalCloseBtn.addEventListener('click', closeCustomRecipeModal);
    if (cancelCustomRecipeBtn) cancelCustomRecipeBtn.addEventListener('click', closeCustomRecipeModal);
    if (customRecipeModalOverlay) {
      customRecipeModalOverlay.addEventListener('click', (e) => {
        if (e.target === customRecipeModalOverlay) closeCustomRecipeModal();
      });
    }
    if (customRecipeForm) customRecipeForm.addEventListener('submit', handleCustomRecipeSubmit);

    // Escape Key to Close Modals & Prevent Keyboard Background Scroll
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const storyModal = document.getElementById('storyCardModalOverlay');
        if (storyModal && storyModal.classList.contains('active')) {
          closeStoryCardModal();
          return;
        }
        closeSwapInspector();
        closeRecipeModal();
        closeRouletteModal();
        closeBadgesModal();
        closeShoppingListModal();
        closeFreezerModal();
        closeSlotFillModal();
        closeBatchPrepModal();
        closeBatchAssemblyModal();
        closeSpinLogModal();
        closeCreatorPortalModal();
        closeCustomRecipeModal();
        closeGoogleAuthModal();
        closeClaimAccessModal();
        return;
      }

      // Prevent arrow keys or space from scrolling background when a modal is active
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '].includes(e.key)) {
          const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
          if (tag !== 'input' && tag !== 'textarea') {
            e.preventDefault();
          }
        }
      }
    });

    // Theme Toggle
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    // Mobile Bottom Navigation Bar & View Switcher (Roadmap Item 13)
    const mobileBottomNav = document.getElementById('mobileBottomNav');
    if (mobileBottomNav) {
      mobileBottomNav.addEventListener('click', (e) => {
        const item = e.target.closest('.bottom-nav-item');
        if (!item) return;
        const action = item.dataset.action;
        if (action === 'view-recipes') {
          setMobileView('recipes');
          const switcher = document.getElementById('mobileSectionSwitcher');
          if (switcher) switcher.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (action === 'view-pantry') {
          setMobileView('pantry');
          const switcher = document.getElementById('mobileSectionSwitcher');
          if (switcher) switcher.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (action === 'open-freezer') {
          openFreezerModal();
        } else if (action === 'open-shopping') {
          openShoppingListModal();
        } else if (action === 'open-roulette') {
          spinCreamiRoulette();
        } else if (action === 'toggle-macros') {
          setMobileView('recipes');
          if (macroSlidersPanel && macroSlidersPanel.style.display === 'none') {
            toggleMacroSliders();
          }
          if (macroSlidersPanel) {
            macroSlidersPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }

    const mobileSectionSwitcher = document.getElementById('mobileSectionSwitcher');
    if (mobileSectionSwitcher) {
      mobileSectionSwitcher.addEventListener('click', (e) => {
        const btn = e.target.closest('.mobile-tab-btn');
        if (!btn) return;
        setMobileView(btn.dataset.view);
      });
    }

    // Optimized & Fluid Screen Size Adapter (Instant breakpoint updates & 60fps passive scrolling)
    let lastIsMobile = (window.innerWidth <= 768);
    let resizeRafId = null;

    const handleResponsiveLayout = () => {
      const isMobile = (window.innerWidth <= 768);
      if (isMobile) {
        setMobileView(activeMobileView || 'recipes');
      } else {
        const pantryPanel = document.getElementById('pantryPanel');
        const recipesPanel = document.querySelector('.recipes-panel');
        if (pantryPanel) pantryPanel.classList.remove('mobile-panel-hidden');
        if (recipesPanel) recipesPanel.classList.remove('mobile-panel-hidden');
      }
      lastIsMobile = isMobile;
    };

    window.addEventListener('resize', () => {
      const isMobile = (window.innerWidth <= 768);
      // When crossing the mobile/desktop boundary, update layout immediately!
      if (isMobile !== lastIsMobile) {
        handleResponsiveLayout();
        return;
      }
      // When resizing within the same breakpoint, throttle via requestAnimationFrame
      if (!resizeRafId) {
        resizeRafId = requestAnimationFrame(() => {
          resizeRafId = null;
          handleResponsiveLayout();
        });
      }
    }, { passive: true });

    window.addEventListener('orientationchange', () => {
      setTimeout(handleResponsiveLayout, 80);
    }, { passive: true });

    // Admin Portal & Gated Access Bindings (Roadmap Item 15)
    if (openAdminPortalBtn) {
      openAdminPortalBtn.addEventListener('click', () => {
        openAdminPortal();
      });
    }

    if (adminModalCloseBtn) {
      adminModalCloseBtn.addEventListener('click', () => {
        closeAdminPortal();
      });
    }

    if (adminModalOverlay) {
      adminModalOverlay.addEventListener('click', (e) => {
        if (e.target === adminModalOverlay) {
          closeAdminPortal();
        }
      });
    }

    if (adminRefreshUsersBtn) {
      adminRefreshUsersBtn.addEventListener('click', () => {
        fetchAdminUsers();
      });
    }

    const btnOpenCreateUser = document.getElementById('btnAdminOpenCreateUserModal');
    if (btnOpenCreateUser) {
      btnOpenCreateUser.addEventListener('click', openAdminCreateUserModal);
    }
    const btnCloseCreateUser = document.getElementById('btnCloseAdminCreateUser');
    if (btnCloseCreateUser) {
      btnCloseCreateUser.addEventListener('click', closeAdminCreateUserModal);
    }
    const btnCancelCreateUser = document.getElementById('btnAdminCancelCreateUser');
    if (btnCancelCreateUser) {
      btnCancelCreateUser.addEventListener('click', closeAdminCreateUserModal);
    }
    const createUserOverlay = document.getElementById('adminCreateUserModalOverlay');
    if (createUserOverlay) {
      createUserOverlay.addEventListener('click', (e) => {
        if (e.target === createUserOverlay) closeAdminCreateUserModal();
      });
    }
    const createUserForm = document.getElementById('adminCreateUserForm');
    if (createUserForm) {
      createUserForm.addEventListener('submit', handleAdminCreateUser);
    }
    document.querySelectorAll('input[name="adminNewUserTierPreset"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const customGrid = document.getElementById('adminNewUserCustomSubs');
        if (customGrid) customGrid.style.display = e.target.value === 'custom' ? 'grid' : 'none';
      });
    });

    // Admin Navigation Tabs Switcher
    const tabBtnAdminUsers = document.getElementById('tabBtnAdminUsers');
    if (tabBtnAdminUsers) {
      tabBtnAdminUsers.addEventListener('click', () => switchAdminTab('users'));
    }
    const tabBtnAdminCreators = document.getElementById('tabBtnAdminCreators');
    if (tabBtnAdminCreators) {
      tabBtnAdminCreators.addEventListener('click', () => switchAdminTab('creators'));
    }
    const tabBtnAdminClaims = document.getElementById('tabBtnAdminClaims');
    if (tabBtnAdminClaims) {
      tabBtnAdminClaims.addEventListener('click', () => switchAdminTab('claims'));
    }

    const adminToggleAllCreators = document.getElementById('adminToggleAllCreators');
    if (adminToggleAllCreators) {
      adminToggleAllCreators.addEventListener('change', async (e) => {
        await setAllCreatorsEnabledStatus(e.target.checked);
      });
    }

    const adminTotalCreatorsCard = document.getElementById('adminTotalCreators');
    if (adminTotalCreatorsCard) {
      const parentCard = adminTotalCreatorsCard.closest('.admin-stat-card');
      if (parentCard) {
        parentCard.style.cursor = 'pointer';
        parentCard.title = 'Manage Content Creators';
        parentCard.addEventListener('click', () => switchAdminTab('creators'));
      }
    }

    if (adminUserSearchInput) {
      adminUserSearchInput.addEventListener('input', (e) => {
        adminSearchQuery = e.target.value;
        adminUsersCurrentPage = 1;
        renderAdminUsers();
      });
    }

    if (adminRoleFilterPills) {
      adminRoleFilterPills.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-role]');
        if (!btn) return;
        adminRoleFilterPills.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        adminFilterRole = btn.dataset.role;
        adminUsersCurrentPage = 1;
        renderAdminUsers();
      });
    }

    const btnAdminToggleAllUsers = document.getElementById('btnAdminToggleAllUsers');
    if (btnAdminToggleAllUsers) {
      btnAdminToggleAllUsers.addEventListener('click', () => {
        const allCards = adminUsersList ? adminUsersList.querySelectorAll('.admin-user-card') : [];
        const anyCollapsed = Array.from(allCards).some(c => !c.classList.contains('expanded'));
        if (anyCollapsed) {
          allCards.forEach(c => {
            c.classList.add('expanded');
            if (c.dataset.userId) expandedAdminUserIds.add(c.dataset.userId);
            const label = c.querySelector('.admin-expand-label');
            const chevron = c.querySelector('.admin-expand-chevron');
            if (label) label.textContent = 'Collapse';
            if (chevron) chevron.textContent = '▴';
          });
          btnAdminToggleAllUsers.textContent = '▴ Collapse All';
        } else {
          allCards.forEach(c => {
            c.classList.remove('expanded');
            if (c.dataset.userId) expandedAdminUserIds.delete(c.dataset.userId);
            const label = c.querySelector('.admin-expand-label');
            const chevron = c.querySelector('.admin-expand-chevron');
            if (label) {
              label.innerHTML = '<span class="label-full">Manage &amp; Packs</span><span class="label-short">Manage</span>';
            }
            if (chevron) chevron.textContent = '▾';
          });
          btnAdminToggleAllUsers.textContent = '▾ Expand All';
        }
      });
    }

    const adminClaimsFilterPills = document.getElementById('adminClaimsFilterPills');
    if (adminClaimsFilterPills) {
      adminClaimsFilterPills.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-claim-status]');
        if (!btn) return;
        adminClaimsFilterPills.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        adminFilterClaimStatus = btn.dataset.claimStatus;
        renderAdminClaims();
      });
    }

    const adminRefreshClaimsBtn = document.getElementById('adminRefreshClaimsBtn');
    if (adminRefreshClaimsBtn) {
      adminRefreshClaimsBtn.addEventListener('click', fetchAdminClaims);
    }

    const tabBtnAdminFeedback = document.getElementById('tabBtnAdminFeedback');
    if (tabBtnAdminFeedback) {
      tabBtnAdminFeedback.addEventListener('click', () => switchAdminTab('feedback'));
    }

    const tabBtnAdminAnalytics = document.getElementById('tabBtnAdminAnalytics');
    if (tabBtnAdminAnalytics) {
      tabBtnAdminAnalytics.addEventListener('click', () => switchAdminTab('analytics'));
    }

    const adminRefreshAnalyticsBtn = document.getElementById('adminRefreshAnalyticsBtn');
    if (adminRefreshAnalyticsBtn) {
      adminRefreshAnalyticsBtn.addEventListener('click', () => {
        adminAnalyticsState = null;
        fetchAdminAnalytics();
        showToast('Refreshing platform telemetry...');
      });
    }

    const adminFeedbackFilterPills = document.getElementById('adminFeedbackFilterPills');
    if (adminFeedbackFilterPills) {
      adminFeedbackFilterPills.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-feedback-status]');
        if (!btn) return;
        adminFeedbackFilterPills.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        adminFilterFeedbackStatus = btn.dataset.feedbackStatus;
        renderAdminFeedback();
      });
    }

    const adminRefreshFeedbackBtn = document.getElementById('adminRefreshFeedbackBtn');
    if (adminRefreshFeedbackBtn) {
      adminRefreshFeedbackBtn.addEventListener('click', fetchAdminFeedback);
    }

    const btnAdminDownloadBackup = document.getElementById('btnAdminDownloadBackup');
    if (btnAdminDownloadBackup) {
      btnAdminDownloadBackup.addEventListener('click', downloadAdminDatabaseBackup);
    }

    if (btnAvailablePacksBadge) {
      btnAvailablePacksBadge.addEventListener('click', () => openRecipePacksModal());
    }
    if (btnBrowsePacksBanner) {
      btnBrowsePacksBanner.addEventListener('click', () => openRecipePacksModal());
    }
    if (btnViewAllPacksFromCategory) {
      btnViewAllPacksFromCategory.addEventListener('click', () => openRecipePacksModal());
    }
    if (btnUnlockCurrentCategory) {
      btnUnlockCurrentCategory.addEventListener('click', () => {
        const pack = btnUnlockCurrentCategory.dataset.pack || activeCategory;
        handlePackPurchase(pack);
      });
    }
    if (closeRecipePacksModalBtn) {
      closeRecipePacksModalBtn.addEventListener('click', closeRecipePacksModal);
    }

    const btnBackToCreators = document.getElementById('btnBackToCreators');
    if (btnBackToCreators) {
      btnBackToCreators.addEventListener('click', () => showCreatorDirectoryView());
    }

    const catalogBreadcrumbsWrap = document.querySelector('.creator-catalog-breadcrumbs');
    if (catalogBreadcrumbsWrap) {
      catalogBreadcrumbsWrap.style.cursor = 'pointer';
      catalogBreadcrumbsWrap.title = 'Back to All Creators';
      catalogBreadcrumbsWrap.addEventListener('click', () => showCreatorDirectoryView());
    }
    const btnCreatorPartnerInquire = document.getElementById('btnCreatorPartnerInquire');
    if (btnCreatorPartnerInquire) {
      btnCreatorPartnerInquire.addEventListener('click', (e) => {
        e.preventDefault();
        const u = 'andrew';
        const d = 'creamicravings.com';
        const subj = encodeURIComponent('Creator Partnership Inquiry - Creami Cravings');
        window.location.href = `mailto:${u}@${d}?subject=${subj}`;
      });
    }

    if (recipePacksModalOverlay) {
      recipePacksModalOverlay.addEventListener('click', (e) => {
        if (e.target === recipePacksModalOverlay) {
          closeRecipePacksModal();
          return;
        }

        // 1. Storefront button on Creator Catalog header banner (Visit Eli's Storefront ↗)
        const storeVisitBtn = e.target.closest('.btn-creator-store-visit, #catalogCreatorStoreBtn');
        if (storeVisitBtn) {
          e.preventDefault();
          e.stopPropagation();
          const creator = activeStoreCreatorId ? getCreatorById(activeStoreCreatorId) : getCreatorById('fitness_product_finder');
          const targetUrl = storeVisitBtn.getAttribute('href') || (creator ? (creator.storeUrl || creator.url) : 'https://fitnessproductfinder.com/collections/creami-cravings-recipe-books');
          if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:')) {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
          }
          return;
        }

        // 1b. Hit safety for catalog banner store visit button
        const catalogBanner = e.target.closest('.creator-catalog-banner');
        if (catalogBanner && !e.target.closest('.creator-banner-left')) {
          const bannerStoreBtn = catalogBanner.querySelector('.btn-creator-store-visit, #catalogCreatorStoreBtn');
          if (bannerStoreBtn) {
            const bRect = bannerStoreBtn.getBoundingClientRect();
            if (e.clientX >= bRect.left - 15 && e.clientY >= bRect.top - 10 && e.clientY <= bRect.bottom + 10) {
              e.preventDefault();
              e.stopPropagation();
              const creator = activeStoreCreatorId ? getCreatorById(activeStoreCreatorId) : getCreatorById('fitness_product_finder');
              const targetUrl = bannerStoreBtn.getAttribute('href') || (creator ? (creator.storeUrl || creator.url) : 'https://fitnessproductfinder.com/collections/creami-cravings-recipe-books');
              if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:')) {
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
              }
              return;
            }
          }
        }

        // 2. Storefront button on Creator Directory cards (Storefront ↗)
        const websiteLink = e.target.closest('.btn-creator-website-link');
        if (websiteLink) {
          e.preventDefault();
          e.stopPropagation();
          const targetUrl = websiteLink.getAttribute('href');
          if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:')) {
            if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = targetUrl;
            }
          }
          return;
        }

        // 3. Browse Books button on Directory cards
        const browseBtn = e.target.closest('.btn-browse-creator-books');
        if (browseBtn) {
          e.stopPropagation();
          const cId = browseBtn.dataset.creatorId || 'fitness_product_finder';
          showCreatorCatalogView(cId);
          return;
        }

        // 4. Click within Creator Card Actions container
        const cardActions = e.target.closest('.creator-card-actions');
        if (cardActions) {
          e.stopPropagation();
          // Hit-area safety: if clicked near the storefront button (including corners/gap), open storefront!
          const storefrontBtn = cardActions.querySelector('.btn-creator-website-link');
          if (storefrontBtn) {
            const storeRect = storefrontBtn.getBoundingClientRect();
            if (e.clientX >= storeRect.left - 12) {
              const targetUrl = storefrontBtn.getAttribute('href');
              if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:')) {
                if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                  window.open(targetUrl, '_blank', 'noopener,noreferrer');
                } else {
                  window.location.href = targetUrl;
                }
                return;
              }
            }
          }
          // Otherwise, if clicked near browse button, open books
          const cCard = cardActions.closest('.creator-directory-card');
          const cId = cCard ? (cCard.dataset.creatorId || 'fitness_product_finder') : 'fitness_product_finder';
          showCreatorCatalogView(cId);
          return;
        }

        // 5. Click anywhere on Creator Directory card (except links/actions) to browse books
        const creatorCard = e.target.closest('.creator-directory-card');
        if (creatorCard && !e.target.closest('.btn-creator-website-link') && !e.target.closest('.creator-card-actions')) {
          // Safety proximity check: If clicked in the quadrant near/above the storefront button, open storefront
          const storefrontBtn = creatorCard.querySelector('.btn-creator-website-link');
          if (storefrontBtn) {
            const storeRect = storefrontBtn.getBoundingClientRect();
            if (e.clientX >= storeRect.left - 10 && e.clientX <= storeRect.right + 16 &&
                e.clientY >= storeRect.top - 16 && e.clientY <= storeRect.bottom + 10) {
              const targetUrl = storefrontBtn.getAttribute('href');
              if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:')) {
                if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                  window.open(targetUrl, '_blank', 'noopener,noreferrer');
                } else {
                  window.location.href = targetUrl;
                }
                return;
              }
            }
          }
          const cId = creatorCard.dataset.creatorId || 'fitness_product_finder';
          showCreatorCatalogView(cId);
          return;
        }

        // 5. Pack Purchase Action button
        const actionBtn = e.target.closest('.btn-action-pack');
        if (actionBtn) {
          if (actionBtn.dataset.batchPack) {
            batchPrepCreatorPack(actionBtn.dataset.batchPack);
            return;
          }
          const pack = actionBtn.dataset.pack;
          if (pack) handlePackPurchase(pack);
          return;
        }

        // 6. Click on "Available on [Creator]" status row to purchase/visit
        const packStatus = e.target.closest('.pack-status-available');
        if (packStatus) {
          const card = packStatus.closest('.recipe-pack-card');
          const pack = card ? card.dataset.pack : null;
          if (pack) {
            handlePackPurchase(pack);
            return;
          }
        }

        // 7. Claim Owned Pack link
        const ownLink = e.target.closest('.btn-pack-own-link');
        if (ownLink) {
          e.preventDefault();
          const pack = ownLink.dataset.claimPack;
          if (pack) handleClaimPackAccess(pack);
          return;
        }
      });
    }

    // Creator CMS & Publishing Studio Bindings (Path B)
    if (openCreatorPortalBtn) {
      openCreatorPortalBtn.addEventListener('click', openCreatorPortalModal);
    }

    const closeCreatorPortalModalBtn = document.getElementById('closeCreatorPortalModalBtn');
    if (closeCreatorPortalModalBtn) {
      closeCreatorPortalModalBtn.addEventListener('click', closeCreatorPortalModal);
    }

    const btnStudioClose = document.getElementById('btnStudioClose');
    if (btnStudioClose) {
      btnStudioClose.addEventListener('click', closeCreatorPortalModal);
    }

    const creatorPortalModalOverlay = document.getElementById('creatorPortalModalOverlay');
    if (creatorPortalModalOverlay) {
      creatorPortalModalOverlay.addEventListener('click', (e) => {
        if (e.target === creatorPortalModalOverlay) closeCreatorPortalModal();
      });
    }

    const btnStudioSaveSocial = document.getElementById('btnStudioSaveSocial');
    if (btnStudioSaveSocial) {
      btnStudioSaveSocial.addEventListener('click', async () => {
        const inputIg = document.getElementById('studioSocialInstagram');
        const inputTiktok = document.getElementById('studioSocialTiktok');
        const inputYt = document.getElementById('studioSocialYoutube');
        const inputWeb = document.getElementById('studioSocialWebsite');
        const inputAnn = document.getElementById('studioAnnouncementInput');

        const socialLinks = {
          instagram: (inputIg ? inputIg.value.trim() : ''),
          tiktok: (inputTiktok ? inputTiktok.value.trim() : ''),
          youtube: (inputYt ? inputYt.value.trim() : ''),
          website: (inputWeb ? inputWeb.value.trim() : '')
        };
        const storeAnnouncement = inputAnn ? inputAnn.value.trim() : '';

        const origHtml = btnStudioSaveSocial.innerHTML;
        btnStudioSaveSocial.innerHTML = '<span>Saving...</span>';
        btnStudioSaveSocial.disabled = true;

        try {
          const res = await fetch('/api/creator/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': currentUser.token ? `Bearer ${currentUser.token}` : '',
              'X-User-Email': currentUser.email || ''
            },
            body: JSON.stringify({ socialLinks, storeAnnouncement })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            if (!currentUser.socialLinks) currentUser.socialLinks = {};
            currentUser.socialLinks = data.socialLinks || socialLinks;
            currentUser.storeAnnouncement = data.storeAnnouncement || storeAnnouncement;
            const cId = (currentUser && currentUser.creatorId) ? currentUser.creatorId : 'fitness_product_finder';
            const cr = getCreatorById(cId);
            if (cr) {
              cr.socialLinks = currentUser.socialLinks;
              cr.storeAnnouncement = currentUser.storeAnnouncement;
            }
            saveUserAuth();
            showToast('✅ Social links & storefront announcement saved!');
          } else {
            if (!currentUser.socialLinks) currentUser.socialLinks = {};
            currentUser.socialLinks = socialLinks;
            currentUser.storeAnnouncement = storeAnnouncement;
            saveUserAuth();
            showToast('✅ Profile saved.');
          }
        } catch (err) {
          console.warn('Save creator profile error:', err);
          if (!currentUser.socialLinks) currentUser.socialLinks = {};
          currentUser.socialLinks = socialLinks;
          currentUser.storeAnnouncement = storeAnnouncement;
          saveUserAuth();
          showToast('✅ Profile saved.');
        } finally {
          btnStudioSaveSocial.innerHTML = origHtml;
          btnStudioSaveSocial.disabled = false;
        }
      });
    }

    const btnStudioCopySlug = document.getElementById('btnStudioCopySlug');
    if (btnStudioCopySlug) {
      btnStudioCopySlug.addEventListener('click', () => {
        const creatorId = (currentUser && currentUser.creatorId) ? currentUser.creatorId : 'fitness_product_finder';
        const creator = getCreatorById(creatorId);
        const handle = creator && creator.handle ? creator.handle.replace('@', '') : 'fitnessproductfinder';
        const fullUrl = `${window.location.origin}${IS_BETA ? '/beta' : ''}/@${handle}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(fullUrl).then(() => {
            showToast(`📋 Copied storefront link: ${fullUrl}`);
          }).catch(() => fallbackCopyText(fullUrl));
        } else {
          fallbackCopyText(fullUrl);
        }
      });
    }

    const btnStudioViewPublic = document.getElementById('btnStudioViewPublic');
    if (btnStudioViewPublic) {
      btnStudioViewPublic.addEventListener('click', () => {
        const creatorId = (currentUser && currentUser.creatorId) ? currentUser.creatorId : 'fitness_product_finder';
        closeCreatorPortalModal();
        openRecipePacksModal(creatorId);
      });
    }

    const btnStudioCreateRecipe = document.getElementById('btnStudioCreateRecipe');
    if (btnStudioCreateRecipe) {
      btnStudioCreateRecipe.addEventListener('click', () => {
        closeCreatorPortalModal();
        openCustomRecipeModal();
      });
    }

    const btnStudioSmartImport = document.getElementById('btnStudioSmartImport');
    if (btnStudioSmartImport) {
      btnStudioSmartImport.addEventListener('click', () => {
        closeCreatorPortalModal();
        openSmartPasteModal();
      });
    }

    const btnModeSmartPaste = document.getElementById('btnModeSmartPaste');
    if (btnModeSmartPaste) {
      btnModeSmartPaste.addEventListener('click', () => {
        openSmartPasteModal();
      });
    }

    // Smart Recipe Importer Modal Bindings
    const closeSmartPasteModalBtn = document.getElementById('closeSmartPasteModalBtn');
    if (closeSmartPasteModalBtn) {
      closeSmartPasteModalBtn.addEventListener('click', closeSmartPasteModal);
    }

    const btnSmartPasteCancel = document.getElementById('btnSmartPasteCancel');
    if (btnSmartPasteCancel) {
      btnSmartPasteCancel.addEventListener('click', closeSmartPasteModal);
    }

    const btnSmartPasteParse = document.getElementById('btnSmartPasteParse');
    if (btnSmartPasteParse) {
      btnSmartPasteParse.addEventListener('click', () => {
        const rawText = document.getElementById('smartPasteRawText') ? document.getElementById('smartPasteRawText').value.trim() : '';
        if (!rawText) {
          showToast('⚠️ Please paste recipe text first.');
          return;
        }
        const parsed = parseRawRecipeText(rawText);
        if (!parsed) {
          showToast('⚠️ Could not extract recipe details from text.');
          return;
        }

        const previewSection = document.getElementById('smartPastePreviewSection');
        if (previewSection) previewSection.style.display = 'block';

        const nameInput = document.getElementById('smartParsedName');
        const spinInput = document.getElementById('smartParsedSpin');
        const calInput = document.getElementById('smartParsedCalories');
        const proInput = document.getElementById('smartParsedProtein');
        const carbInput = document.getElementById('smartParsedCarbs');
        const fatInput = document.getElementById('smartParsedFat');
        const ingInput = document.getElementById('smartParsedIngredients');
        const ingCount = document.getElementById('smartParsedIngCount');
        const instInput = document.getElementById('smartParsedInstructions');

        if (nameInput) nameInput.value = parsed.title;
        if (spinInput) spinInput.value = parsed.spin;
        if (calInput) calInput.value = parsed.calories;
        if (proInput) proInput.value = parsed.protein.replace('g', '');
        if (carbInput) carbInput.value = parsed.carbs.replace('g', '');
        if (fatInput) fatInput.value = parsed.fat.replace('g', '');
        if (ingInput) ingInput.value = parsed.ingredients.join('\n');
        if (ingCount) ingCount.textContent = parsed.ingredients.length;
        if (instInput) instInput.value = parsed.instructions;

        showToast(`✨ Extracted ${parsed.ingredients.length} ingredients and nutrition macros!`);
      });
    }

    const btnSmartPasteSample = document.getElementById('btnSmartPasteSample');
    if (btnSmartPasteSample) {
      btnSmartPasteSample.addEventListener('click', () => {
        const rawInput = document.getElementById('smartPasteRawText');
        if (rawInput) {
          rawInput.value = `High Protein Strawberry Shortcake Pint 🍓
Macros: 295 cals | 38g protein | 18g carbs | 4g fat
Spin Setting: Lite Ice Cream
Freeze Time: 24h

Ingredients:
360g Fairlife Fat Free Milk
30g Vanilla Whey Protein Powder
10g Sugar Free White Chocolate Pudding Mix
1g Xanthan Gum
40g Diced Fresh Strawberries (Mix-in)
15g Crushed Graham Crackers (Mix-in)

Instructions:
1. Whisk milk, protein powder, pudding mix, and xanthan gum until smooth.
2. Freeze flat for 24 hours.
3. Spin on Lite Ice Cream. Add 1 tbsp milk and re-spin once if powdery.
4. Make a center hole, add strawberries and graham crackers, spin on Mix-in!`;
          if (btnSmartPasteParse) btnSmartPasteParse.click();
        }
      });
    }

    const btnSmartPasteApply = document.getElementById('btnSmartPasteApply');
    if (btnSmartPasteApply) {
      btnSmartPasteApply.addEventListener('click', applySmartParsedRecipe);
    }

    // Social Caption Modal Bindings
    const closeSocialCaptionModalBtn = document.getElementById('closeSocialCaptionModalBtn');
    if (closeSocialCaptionModalBtn) {
      closeSocialCaptionModalBtn.addEventListener('click', closeSocialCaptionModal);
    }

    const btnCloseCaptionModal = document.getElementById('btnCloseCaptionModal');
    if (btnCloseCaptionModal) {
      btnCloseCaptionModal.addEventListener('click', closeSocialCaptionModal);
    }

    const btnCopyCaptionToClipboard = document.getElementById('btnCopyCaptionToClipboard');
    if (btnCopyCaptionToClipboard) {
      btnCopyCaptionToClipboard.addEventListener('click', () => {
        copySocialCaptionToClipboard(activeCaptionRecipe);
      });
    }

    // Caption Platform Tabs
    document.querySelectorAll('.caption-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.caption-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCaptionPlatform = btn.dataset.platform || 'instagram';
        if (activeCaptionRecipe) {
          const textEl = document.getElementById('socialCaptionText');
          const chkLink = document.getElementById('chkCaptionIncludeLink');
          const chkHash = document.getElementById('chkCaptionIncludeHashtags');
          if (textEl) {
            textEl.value = generateSocialCaption(
              activeCaptionRecipe,
              activeCaptionPlatform,
              chkLink ? chkLink.checked : true,
              chkHash ? chkHash.checked : true
            );
          }
        }
      });
    });

    const chkCaptionIncludeLink = document.getElementById('chkCaptionIncludeLink');
    const chkCaptionIncludeHashtags = document.getElementById('chkCaptionIncludeHashtags');
    [chkCaptionIncludeLink, chkCaptionIncludeHashtags].forEach(chk => {
      if (chk) {
        chk.addEventListener('change', () => {
          if (activeCaptionRecipe) {
            const textEl = document.getElementById('socialCaptionText');
            if (textEl) {
              textEl.value = generateSocialCaption(
                activeCaptionRecipe,
                activeCaptionPlatform,
                chkCaptionIncludeLink ? chkCaptionIncludeLink.checked : true,
                chkCaptionIncludeHashtags ? chkCaptionIncludeHashtags.checked : true
              );
            }
          }
        });
      }
    });

    const btnStudioBatchPrepAll = document.getElementById('btnStudioBatchPrepAll');
    if (btnStudioBatchPrepAll) {
      btnStudioBatchPrepAll.addEventListener('click', () => {
        closeCreatorPortalModal();
        const cId = (currentUser && currentUser.creatorId) ? currentUser.creatorId : 'fitness_product_finder';
        if (cId === 'test_content') {
          batchPrepCreatorPack('TestContent Sampler');
        } else {
          batchPrepCreatorPack('All-Access');
        }
      });
    }

    const btnStudioAddVip = document.getElementById('btnStudioAddVip');
    if (btnStudioAddVip) {
      btnStudioAddVip.addEventListener('click', handleAddCreatorVip);
    }

    const studioNewVipEmail = document.getElementById('studioNewVipEmail');
    if (studioNewVipEmail) {
      studioNewVipEmail.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddCreatorVip();
        }
      });
    }

    // Creator Studio: Brand Codes, Links & Sponsors
    const btnStudioOpenAddPerk = document.getElementById('btnStudioOpenAddPerk');
    if (btnStudioOpenAddPerk) {
      btnStudioOpenAddPerk.addEventListener('click', () => {
        openStudioPerkEditor(null);
      });
    }

    const btnStudioPerkEditorClose = document.getElementById('btnStudioPerkEditorClose');
    if (btnStudioPerkEditorClose) {
      btnStudioPerkEditorClose.addEventListener('click', () => {
        closeStudioPerkEditor();
      });
    }

    const btnStudioPerkEditorCancel = document.getElementById('btnStudioPerkEditorCancel');
    if (btnStudioPerkEditorCancel) {
      btnStudioPerkEditorCancel.addEventListener('click', () => {
        closeStudioPerkEditor();
      });
    }

    const btnStudioPerkEditorSave = document.getElementById('btnStudioPerkEditorSave');
    if (btnStudioPerkEditorSave) {
      btnStudioPerkEditorSave.addEventListener('click', () => {
        saveStudioPerk();
      });
    }

    // Handle PWA App Shortcuts & URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const actionParam = urlParams.get('action');
    if (actionParam === 'pantry') {
      setTimeout(() => {
        if (window.innerWidth <= 768) setMobileView('pantry');
      }, 250);
    } else if (actionParam === 'freezer') {
      setTimeout(() => openFreezerModal(), 300);
    } else if (actionParam === 'admin') {
      setTimeout(() => openAdminPortal(), 300);
    } else if (actionParam === 'build') {
      setTimeout(() => openCustomRecipeModal(), 300);
    } else if (actionParam === 'shopping') {
      setTimeout(() => openShoppingListModal(), 300);
    } else if (actionParam === 'freeze-spin') {
      const pintId = urlParams.get('pintId');
      const recipeId = urlParams.get('recipeId');
      setTimeout(() => {
        handleFreezeNotificationAction({ action: 'spin', pintId, recipeId });
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 350);
    } else if (actionParam === 'freeze-recipe') {
      const recipeId = urlParams.get('recipeId');
      setTimeout(() => {
        handleFreezeNotificationAction({ action: 'recipe', recipeId });
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 350);
    } else if (actionParam === 'freeze-ready') {
      const pintId = urlParams.get('pintId');
      const recipeId = urlParams.get('recipeId');
      setTimeout(() => {
        handleFreezeNotificationAction({ action: 'open', pintId, recipeId });
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 350);
    }

    // Sound & Haptics Toggle (Roadmap Item 20)
    if (btnSoundToggle) {
      btnSoundToggle.addEventListener('click', () => {
        toggleSoundState();
      });
    }

    // Kitchen Data Backup & Restore Modal Bindings (Roadmap Item 20)
    if (footerBackupBtn) {
      footerBackupBtn.addEventListener('click', () => {
        openBackupModal();
      });
    }

    if (backupModalCloseBtn) {
      backupModalCloseBtn.addEventListener('click', () => {
        closeBackupModal();
      });
    }

    if (backupModalOverlay) {
      backupModalOverlay.addEventListener('click', (e) => {
        if (e.target === backupModalOverlay) {
          closeBackupModal();
        }
      });
    }

    if (btnDownloadBackup) {
      btnDownloadBackup.addEventListener('click', () => {
        downloadKitchenBackup();
      });
    }

    if (btnTriggerRestore) {
      btnTriggerRestore.addEventListener('click', () => {
        if (backupFileInput) backupFileInput.click();
      });
    }

    if (backupFileInput) {
      backupFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const selectedMode = document.querySelector('input[name="backupRestoreMode"]:checked')?.value || 'merge';
          restoreKitchenBackup(file, selectedMode);
          backupFileInput.value = '';
        }
      });
    }

    if (btnResetKitchenData) {
      btnResetKitchenData.addEventListener('click', () => {
        resetAllKitchenData();
      });
    }

    // Sunday Batch Prep Planner & Consolidated Grocery List (Beta Staging)
    const btnBatchPrepOpen = document.getElementById('btnBatchPrepOpenModal');
    if (btnBatchPrepOpen) {
      btnBatchPrepOpen.addEventListener('click', openBatchPrepModal);
    }

    const openBatchPrepHeaderBtn = document.getElementById('openBatchPrepHeaderBtn');
    if (openBatchPrepHeaderBtn) {
      openBatchPrepHeaderBtn.addEventListener('click', openBatchPrepModal);
    }

    const btnShelfOpenBatchPrep = document.getElementById('btnShelfOpenBatchPrep');
    if (btnShelfOpenBatchPrep) {
      btnShelfOpenBatchPrep.addEventListener('click', openBatchPrepModal);
    }

    const btnFreezerModalOpenBatchPrep = document.getElementById('btnFreezerModalOpenBatchPrep');
    if (btnFreezerModalOpenBatchPrep) {
      btnFreezerModalOpenBatchPrep.addEventListener('click', () => {
        closeFreezerModal();
        openBatchPrepModal();
      });
    }

    const batchPrepCloseBtn = document.getElementById('batchPrepModalCloseBtn');
    if (batchPrepCloseBtn) {
      batchPrepCloseBtn.addEventListener('click', closeBatchPrepModal);
    }

    const batchPrepOverlay = document.getElementById('batchPrepModalOverlay');
    if (batchPrepOverlay) {
      batchPrepOverlay.addEventListener('click', (e) => {
        if (e.target === batchPrepOverlay) closeBatchPrepModal();
      });
    }

    const btnBatchClear = document.getElementById('btnBatchPrepClear');
    if (btnBatchClear) {
      btnBatchClear.addEventListener('click', clearBatchPrepQueue);
    }

    const btnBatchCopy = document.getElementById('btnBatchCopyList');
    if (btnBatchCopy) {
      btnBatchCopy.addEventListener('click', copyBatchPrepGroceryList);
    }

    const btnBatchAddMissing = document.getElementById('btnBatchAddMissingToShopList');
    if (btnBatchAddMissing) {
      btnBatchAddMissing.addEventListener('click', addMissingBatchToShoppingList);
    }

    const btnBatchFillSlots = document.getElementById('btnBatchFillFreezerSlots');
    if (btnBatchFillSlots) {
      btnBatchFillFreezerSlots.addEventListener('click', batchFillFreezerSlots);
    }

    // Kitchen Assembly Mode (Sunday Batch Prep Step-by-Step - Path A Item 3)
    const btnStartAssembly = document.getElementById('btnStartBatchAssembly');
    if (btnStartAssembly) {
      btnStartAssembly.addEventListener('click', openBatchAssemblyModal);
    }

    const btnBatchDockAssembly = document.getElementById('btnBatchDockAssembly');
    if (btnBatchDockAssembly) {
      btnBatchDockAssembly.addEventListener('click', openBatchAssemblyModal);
    }

    const btnAssemblyClose = document.getElementById('batchAssemblyModalCloseBtn');
    if (btnAssemblyClose) {
      btnAssemblyClose.addEventListener('click', closeBatchAssemblyModal);
    }

    const assemblyOverlay = document.getElementById('batchAssemblyModalOverlay');
    if (assemblyOverlay) {
      assemblyOverlay.addEventListener('click', (e) => {
        if (e.target === assemblyOverlay) closeBatchAssemblyModal();
      });
    }

    const btnAssemblyPrev = document.getElementById('btnAssemblyPrevStep');
    if (btnAssemblyPrev) {
      btnAssemblyPrev.addEventListener('click', () => {
        goToAssemblyStep(assemblyCurrentStep - 1);
      });
    }

    const btnAssemblyNext = document.getElementById('btnAssemblyNextStep');
    if (btnAssemblyNext) {
      btnAssemblyNext.addEventListener('click', () => {
        if (assemblyCurrentStep < 4) {
          goToAssemblyStep(assemblyCurrentStep + 1);
        } else {
          batchFillFreezerSlots(assemblyPintConfigs);
        }
      });
    }

    const assemblyStepBar = document.getElementById('assemblyStepBar');
    if (assemblyStepBar) {
      assemblyStepBar.querySelectorAll('.assembly-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const step = parseInt(btn.dataset.step, 10);
          if (step) goToAssemblyStep(step);
        });
      });
    }

    // Interactive Spin Log Modal & Habit Streaks (Path A Item 4)
    const spinLogCloseBtn = document.getElementById('spinLogModalCloseBtn');
    if (spinLogCloseBtn) {
      spinLogCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSpinLogModal();
      });
    }

    const btnCancelSpinLogModal = document.getElementById('btnCancelSpinLogModal');
    if (btnCancelSpinLogModal) {
      btnCancelSpinLogModal.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSpinLogModal();
      });
    }

    const spinLogOverlay = document.getElementById('spinLogModalOverlay');
    if (spinLogOverlay) {
      spinLogOverlay.addEventListener('click', (e) => {
        if (e.target === spinLogOverlay || e.target.classList.contains('modal-handle-bar')) {
          closeSpinLogModal();
        }
      });
    }

    const spinCycleButtons = document.getElementById('spinCycleButtons');
    if (spinCycleButtons) {
      spinCycleButtons.querySelectorAll('.cycle-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          spinCycleButtons.querySelectorAll('.cycle-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          spinLogSelectedCycle = btn.dataset.cycle || 'Lite Ice Cream';
        });
      });
    }

    const spinRespinOptions = document.getElementById('spinRespinOptions');
    if (spinRespinOptions) {
      spinRespinOptions.querySelectorAll('.respin-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          spinRespinOptions.querySelectorAll('.respin-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          spinLogSelectedRespins = btn.dataset.respins || '0';
        });
      });
    }

    const spinStarRating = document.getElementById('spinStarRating');
    if (spinStarRating) {
      spinStarRating.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const rating = parseInt(btn.dataset.star, 10) || 5;
          spinLogSelectedRating = rating;
          updateSpinStarRatingUI(rating);
        });
      });
    }

    const btnConfirmLogSpin = document.getElementById('btnConfirmLogSpin');
    if (btnConfirmLogSpin) {
      btnConfirmLogSpin.addEventListener('click', confirmSpinLog);
    }

    const btnShareStoryFromLog = document.getElementById('btnShareStoryCardFromLog');
    if (btnShareStoryFromLog) {
      btnShareStoryFromLog.addEventListener('click', shareStoryCardFromSpinLog);
    }

    // Warm Water Bath Timer event listeners in Spin Log modal
    const spinLogStartTimerBtn = document.getElementById('spinLogStartTimerBtn');
    if (spinLogStartTimerBtn) {
      spinLogStartTimerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSpinLogWaterTimer();
      });
    }

    const spinLogResetTimerBtn = document.getElementById('spinLogResetTimerBtn');
    if (spinLogResetTimerBtn) {
      spinLogResetTimerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetSpinLogWaterTimer(spinLogTimerDuration);
      });
    }

    const spinLogTimerPresets = document.getElementById('spinLogTimerPresets');
    if (spinLogTimerPresets) {
      spinLogTimerPresets.querySelectorAll('.timer-preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetSec = parseInt(btn.dataset.time, 10) || 60;
          resetSpinLogWaterTimer(targetSec);
        });
      });
    }

    // Initialize PWA Offline Engine & Service Worker
    initPWA();
  }

  // --- Service Worker & PWA Offline Engine (Roadmap Item 11 & 17) ---
  function initPWA() {
    if (IS_BETA) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let reg of registrations) {
            reg.unregister();
          }
        });
      }
      return;
    }

    const offlineBanner = document.getElementById('offlineIndicatorBanner');

    function updateOnlineStatus() {
      if (navigator.onLine) {
        if (offlineBanner) offlineBanner.style.display = 'none';
      } else {
        if (offlineBanner) offlineBanner.style.display = 'block';
        showToast('⚡ Offline Mode: Operating with 100% cached recipes & pantry.');
      }
    }

    window.addEventListener('online', () => {
      updateOnlineStatus();
      showToast('🟢 Back Online! Syncing with cloud...');
      if (currentUser && (currentUser.token || currentUser.email)) {
        triggerCloudSync(true);
        fetchLatestUserData();
      }
    });

    window.addEventListener('offline', () => {
      updateOnlineStatus();
    });

    if (!navigator.onLine && offlineBanner) {
      offlineBanner.style.display = 'block';
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_FREEZE_ACTION') {
          handleFreezeNotificationAction(event.data);
        }
      });

      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            registration.update();
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                });
              }
            });
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
            if (freezeNotifsEnabled && 'Notification' in window && Notification.permission === 'granted') {
              scheduleAllPendingPintAlerts();
            }
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  }

  // --- Synthesized Web Audio & Tactile Haptic Engine (Roadmap Item 20) ---
  const SOUND_STORAGE_KEY = 'creami_sound_enabled_v1';
  let soundEnabled = localStorage.getItem(SOUND_STORAGE_KEY) !== 'false';
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playAudioTick() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // Audio autoplay or browser audio permissions handled safely
    }
  }

  function playAudioJackpot() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // Multi-note triumphant fanfare: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + (idx * 0.07);
        const duration = (idx === notes.length - 1) ? 0.35 : 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration + 0.02);
      });
    } catch (e) {}
  }

  function playAudioChime() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // Resonant dual-bell chime: E5 (659.25) + B5 (987.77) then decay
      const chords = [
        { freq: 659.25, delay: 0, dur: 0.6 },
        { freq: 987.77, delay: 0.08, dur: 0.7 }
      ];
      const now = ctx.currentTime;
      chords.forEach(c => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + c.delay;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(c.freq, start);

        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + c.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + c.dur + 0.02);
      });
    } catch (e) {}
  }

  function playAudioSuccess() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // Pleasant two-tone completion chime: 587.33Hz (D5) -> 880Hz (A5)
      const now = ctx.currentTime;
      [
        { freq: 587.33, delay: 0, dur: 0.14 },
        { freq: 880.00, delay: 0.1, dur: 0.28 }
      ].forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + item.delay;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + item.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + item.dur + 0.02);
      });
    } catch (e) {}
  }

  function triggerHaptic(pattern = 15) {
    if (!soundEnabled) return;
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  }

  function updateSoundUI() {
    const btn = document.getElementById('btnSoundToggle');
    if (!btn) return;
    if (soundEnabled) {
      btn.textContent = '🔊';
      btn.setAttribute('title', 'Sound Effects & Haptics (Active - Tap to Mute)');
      btn.setAttribute('aria-label', 'Sound Effects & Haptics Active');
    } else {
      btn.textContent = '🔇';
      btn.setAttribute('title', 'Sound Effects & Haptics (Muted - Tap to Unmute)');
      btn.setAttribute('aria-label', 'Sound Effects & Haptics Muted');
    }
  }

  function toggleSoundState() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? 'true' : 'false');
    updateSoundUI();
    if (soundEnabled) {
      getAudioContext();
      playAudioSuccess();
      triggerHaptic(20);
      showToast('🔊 Sound Effects & Haptics Enabled');
    } else {
      showToast('🔇 Sound Effects & Haptics Muted');
    }
  }

  // --- 1-Tap PWA Install Engine (Roadmap Item 19) ---
  let deferredPrompt = null;
  const isIosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent || '');
  const isAndroidDevice = /android/i.test(navigator.userAgent || '');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function initPwaInstall() {
    const btnInstall = document.getElementById('btnInstallPwa');
    const footerInstall = document.getElementById('footerInstallBtn');
    const installModal = document.getElementById('iosInstallModalOverlay');
    const installClose = document.getElementById('iosInstallModalCloseBtn');
    const installDismiss = document.getElementById('btnDismissIosInstall');

    if (isStandalone) {
      if (btnInstall) btnInstall.style.display = 'none';
      if (footerInstall) footerInstall.style.display = 'none';
      return;
    }

    // Always display install options for standard browser sessions
    if (btnInstall) btnInstall.style.display = 'inline-flex';
    if (footerInstall) footerInstall.style.display = 'inline-flex';

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (btnInstall) btnInstall.style.display = 'inline-flex';
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (btnInstall) btnInstall.style.display = 'none';
      if (footerInstall) footerInstall.style.display = 'none';
      showToast('🎉 Creami Cravings installed! Enjoy offline cooking.');
    });

    // Tab switching inside the Install Guide Modal
    const tabButtons = installModal ? installModal.querySelectorAll('.install-tab-btn') : [];
    const panes = {
      ios: document.getElementById('paneInstallIos'),
      android: document.getElementById('paneInstallAndroid'),
      desktop: document.getElementById('paneInstallDesktop')
    };

    function switchInstallTab(platform) {
      tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-platform') === platform);
      });
      Object.keys(panes).forEach(p => {
        if (panes[p]) {
          panes[p].style.display = (p === platform) ? 'flex' : 'none';
        }
      });
    }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const plat = btn.getAttribute('data-platform');
        switchInstallTab(plat);
      });
    });

    function openInstallModal(defaultPlatform) {
      if (!installModal) return;
      const targetPlatform = defaultPlatform || (isIosDevice ? 'ios' : (isAndroidDevice ? 'android' : 'desktop'));
      switchInstallTab(targetPlatform);
      installModal.classList.add('active');
      installModal.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
    }

    function handleInstallTrigger() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult && choiceResult.outcome === 'accepted') {
            showToast('Installing Creami Cravings...');
            if (btnInstall) btnInstall.style.display = 'none';
          }
          deferredPrompt = null;
        }).catch(() => {
          openInstallModal();
        });
      } else {
        openInstallModal();
      }
    }

    if (btnInstall) {
      btnInstall.addEventListener('click', handleInstallTrigger);
    }
    if (footerInstall) {
      footerInstall.addEventListener('click', handleInstallTrigger);
    }
    if (installClose) {
      installClose.addEventListener('click', () => {
        if (installModal) {
          installModal.classList.remove('active');
          installModal.setAttribute('aria-hidden', 'true');
          unlockBackgroundScroll();
        }
      });
    }
    if (installDismiss) {
      installDismiss.addEventListener('click', () => {
        if (installModal) {
          installModal.classList.remove('active');
          installModal.setAttribute('aria-hidden', 'true');
          unlockBackgroundScroll();
        }
      });
    }
    if (installModal) {
      installModal.addEventListener('click', (e) => {
        if (e.target === installModal) {
          installModal.classList.remove('active');
          installModal.setAttribute('aria-hidden', 'true');
          unlockBackgroundScroll();
        }
      });
    }
  }

  // --- Kitchen Data Backup & Restore Engine (Roadmap Item 20) ---
  function openBackupModal() {
    const backupModal = document.getElementById('backupModalOverlay');
    if (backupModal) {
      backupModal.classList.add('active');
      backupModal.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
    }
  }

  function closeBackupModal() {
    const backupModal = document.getElementById('backupModalOverlay');
    if (backupModal) {
      backupModal.classList.remove('active');
      backupModal.setAttribute('aria-hidden', 'true');
      unlockBackgroundScroll();
    }
  }

  function downloadKitchenBackup() {
    try {
      const backupData = {
        app: 'Creami Cravings',
        schemaVersion: '1.2',
        exportedAt: new Date().toISOString(),
        pantry: Array.from(pantryState),
        pantryQuantities: pantryItemQuantities,
        favorites: Array.from(favoritesState),
        customRecipes: customRecipesState,
        freezerPints: freezerPintsState,
        recipeRatings: userRecipeData,
        recipeMadeCounts: recipeMadeCounts,
        manualShoppingList: Array.from(manualShoppingList),
        macroFilters: macroFilters,
        soundEnabled: soundEnabled,
        theme: localStorage.getItem(THEME_STORAGE_KEY) || 'dark'
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateSlug = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `creami-cravings-backup-${dateSlug}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      playAudioSuccess();
      triggerHaptic(25);
      showToast('📥 Kitchen backup downloaded successfully!');
    } catch (err) {
      console.error('Backup download error:', err);
      showToast('⚠️ Failed to generate backup file.');
    }
  }

  function restoreKitchenBackup(file, mode = 'merge') {
    if (!file) {
      showToast('Please select a valid .json backup file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid JSON structure');
        }

        if (mode === 'replace') {
          // Replace pantry
          if (Array.isArray(data.pantry)) {
            pantryState = new Set(data.pantry);
          }
          if (data.pantryQuantities && typeof data.pantryQuantities === 'object') {
            pantryItemQuantities = { ...data.pantryQuantities };
          } else {
            pantryItemQuantities = {};
          }
          // Replace favorites
          if (Array.isArray(data.favorites)) {
            favoritesState = new Set(data.favorites);
          }
          // Replace custom recipes
          if (Array.isArray(data.customRecipes)) {
            customRecipesState = data.customRecipes;
          }
          // Replace freezer pints
          if (Array.isArray(data.freezerPints)) {
            freezerPintsState = data.freezerPints;
          }
          // Replace ratings & notes
          if (data.recipeRatings && typeof data.recipeRatings === 'object') {
            userRecipeData = data.recipeRatings;
          }
          // Replace batch counts
          if (data.recipeMadeCounts && typeof data.recipeMadeCounts === 'object') {
            recipeMadeCounts = data.recipeMadeCounts;
          }
          // Replace manual shopping list
          if (Array.isArray(data.manualShoppingList)) {
            manualShoppingList = new Set(data.manualShoppingList);
          }
        } else {
          // Merge mode
          if (Array.isArray(data.pantry)) {
            data.pantry.forEach(id => pantryState.add(id));
          }
          if (data.pantryQuantities && typeof data.pantryQuantities === 'object') {
            Object.assign(pantryItemQuantities, data.pantryQuantities);
          }
          if (Array.isArray(data.favorites)) {
            data.favorites.forEach(id => favoritesState.add(id));
          }
          if (Array.isArray(data.customRecipes)) {
            data.customRecipes.forEach(incoming => {
              const existingIdx = customRecipesState.findIndex(r => r.name && incoming.name && r.name.toLowerCase() === incoming.name.toLowerCase());
              if (existingIdx >= 0) {
                customRecipesState[existingIdx] = incoming;
              } else {
                customRecipesState.push(incoming);
              }
            });
          }
          if (Array.isArray(data.freezerPints)) {
            data.freezerPints.forEach(incoming => {
              if (!freezerPintsState.some(p => p.id === incoming.id)) {
                freezerPintsState.push(incoming);
              }
            });
          }
          if (data.recipeRatings && typeof data.recipeRatings === 'object') {
            Object.assign(userRecipeData, data.recipeRatings);
          }
          if (data.recipeMadeCounts && typeof data.recipeMadeCounts === 'object') {
            Object.entries(data.recipeMadeCounts).forEach(([k, v]) => {
              recipeMadeCounts[k] = Math.max(recipeMadeCounts[k] || 0, v);
            });
          }
          if (Array.isArray(data.manualShoppingList)) {
            data.manualShoppingList.forEach(item => manualShoppingList.add(item));
          }
        }

        // Save all back to storage
        savePantry();
        saveFavorites();
        saveCustomRecipes();
        saveFreezerPints();
        saveUserRecipeData();
        saveRecipeMadeCounts();
        saveManualShoppingList();

        // Refresh calculations and UI
        mergeRecipes();
        calculateIngredientUsage();
        renderPantryList();
        renderRecipes();
        updateFreezerBadges();
        updateShoppingListBadge();
        triggerCloudSync();

        playAudioSuccess();
        triggerHaptic([30, 50, 40]);
        closeBackupModal();
        showToast(`🎉 Kitchen data restored (${mode === 'merge' ? 'merged' : 'replaced'}) successfully!`);
      } catch (err) {
        console.error('Backup restore error:', err);
        showToast('⚠️ Could not restore: file is not a valid Creami Cravings backup.');
      }
    };
    reader.readAsText(file);
  }

  function resetAllKitchenData() {
    if (!window.confirm('⚠️ Are you sure you want to reset all kitchen data?\n\nThis will clear your custom recipes, pantry checkmarks, freezer inventory, and ratings.\n(Default built-in recipes will remain intact).')) {
      return;
    }

    localStorage.removeItem(getPantryStorageKey());
    localStorage.removeItem(getShoppingStorageKey());
    localStorage.removeItem(getUserRecipeDataKey());
    localStorage.removeItem(getRecipeMadeStorageKey());
    localStorage.removeItem(PANTRY_STORAGE_KEY);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_RECIPES_STORAGE_KEY);
    localStorage.removeItem(FREEZER_STORAGE_KEY);
    localStorage.removeItem(USER_RECIPE_DATA_KEY);
    localStorage.removeItem(RECIPE_MADE_STORAGE_KEY);
    localStorage.removeItem(MANUAL_SHOPPING_STORAGE_KEY);
    if (currentUser && currentUser.id) {
      localStorage.removeItem(`${FAVORITES_STORAGE_KEY}_${currentUser.id}`);
      localStorage.removeItem(`${CUSTOM_RECIPES_STORAGE_KEY}_${currentUser.id}`);
      localStorage.removeItem(`${FREEZER_STORAGE_KEY}_${currentUser.id}`);
    }

    pantryState = new Set(DEFAULT_STAPLES);
    favoritesState = new Set();
    customRecipesState = [];
    freezerPintsState = [];
    userRecipeData = {};
    recipeMadeCounts = {};
    manualShoppingList = new Set();

    savePantry();
    saveFavorites();
    saveCustomRecipes();
    saveFreezerPints();
    saveUserRecipeData();
    saveRecipeMadeCounts();
    saveManualShoppingList();

    mergeRecipes();
    calculateIngredientUsage();
    renderPantryList();
    recipeCardCache.clear();
    renderRecipes();
    updateFreezerBadges();
    updateShoppingListBadge();
    triggerCloudSync();

    closeBackupModal();
    showToast('Kitchen data reset to factory defaults.');
  }

  // --- Google Analytics 4 Event Dispatcher ---
  function trackAnalyticsEvent(eventName, params = {}) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
    } catch (err) {
      console.warn('Analytics event dispatch warning:', err);
    }
  }

  // --- Cookie Consent & Google Consent Mode v2 Engine ---
  const COOKIE_CONSENT_KEY = 'creami_cookie_consent_v1';

  function getCookieConsent() {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function applyCookieConsent(consent) {
    if (!consent) return;
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));

    // Update Google Consent Mode v2 for GA4 & AdSense
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': consent.analytics ? 'granted' : 'denied',
        'ad_storage': consent.marketing ? 'granted' : 'denied',
        'ad_user_data': consent.marketing ? 'granted' : 'denied',
        'ad_personalization': consent.marketing ? 'granted' : 'denied'
      });
    }

    if (cookieConsentBanner) {
      cookieConsentBanner.style.display = 'none';
    }
    closeCookieModal();
  }

  function openCookieModal() {
    if (!cookieModalOverlay) return;
    const current = getCookieConsent() || { analytics: false, marketing: false };
    if (prefAnalyticsToggle) prefAnalyticsToggle.checked = Boolean(current.analytics);
    if (prefMarketingToggle) prefMarketingToggle.checked = Boolean(current.marketing);

    cookieModalOverlay.classList.add('active');
    cookieModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeCookieModal() {
    if (!cookieModalOverlay) return;
    cookieModalOverlay.classList.remove('active');
    cookieModalOverlay.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  function initCookieConsent() {
    const existingConsent = getCookieConsent();
    if (existingConsent) {
      // Re-apply saved consent into Google Consent Mode
      applyCookieConsent(existingConsent);
    } else {
      // Show consent banner after a short delay
      setTimeout(() => {
        if (cookieConsentBanner && !getCookieConsent()) {
          cookieConsentBanner.style.display = 'block';
        }
      }, 700);
    }

    // Button Bindings
    if (btnAcceptAllCookies) {
      btnAcceptAllCookies.addEventListener('click', () => {
        applyCookieConsent({ essential: true, analytics: true, marketing: true, timestamp: new Date().toISOString() });
        showToast('🍪 All preferences saved.');
      });
    }

    if (btnEssentialOnlyCookies) {
      btnEssentialOnlyCookies.addEventListener('click', () => {
        applyCookieConsent({ essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() });
        showToast('🍪 Essential storage active only.');
      });
    }

    if (btnCustomizeCookies) {
      btnCustomizeCookies.addEventListener('click', () => {
        openCookieModal();
      });
    }

    if (footerCookieBtn) {
      footerCookieBtn.addEventListener('click', () => {
        openCookieModal();
      });
    }

    if (cookieModalCloseBtn) {
      cookieModalCloseBtn.addEventListener('click', () => {
        closeCookieModal();
      });
    }

    if (cookieModalOverlay) {
      cookieModalOverlay.addEventListener('click', (e) => {
        if (e.target === cookieModalOverlay) {
          closeCookieModal();
        }
      });
    }

    if (btnRejectOptionalInModal) {
      btnRejectOptionalInModal.addEventListener('click', () => {
        applyCookieConsent({ essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() });
        showToast('🍪 Optional cookies declined.');
      });
    }

    if (btnSaveCustomCookies) {
      btnSaveCustomCookies.addEventListener('click', () => {
        const analytics = Boolean(prefAnalyticsToggle && prefAnalyticsToggle.checked);
        const marketing = Boolean(prefMarketingToggle && prefMarketingToggle.checked);
        applyCookieConsent({ essential: true, analytics, marketing, timestamp: new Date().toISOString() });
        showToast('🍪 Custom preferences saved.');
      });
    }
  }

  // --- Long-Tail SEO Category Landing Collections ---
  function initSeoCategoryLanding() {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const banner = document.getElementById('seoCategoryBanner');
    const bannerTitle = document.getElementById('seoBannerTitle');
    const bannerDesc = document.getElementById('seoBannerDesc');
    const clearBtn = document.getElementById('btnClearSeoFilterBtn');

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        activeSeoLanding = null;
        if (banner) banner.style.display = 'none';
        activeCategory = 'all';
        activeQuickFilter = 'all';
        if (categoryTabs) {
          categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          const allTab = categoryTabs.querySelector('[data-category="all"]');
          if (allTab) allTab.classList.add('active');
        }
        window.history.pushState({}, document.title, IS_BETA ? '/beta/' : '/');
        renderRecipes();
      });
    }

    if (path === '/category/without-protein-powder' || path === '/category/no-protein' || path === '/ninja-creami-recipes-without-protein-powder' || path === '/ninja-creami-no-protein-powder') {
      activeSeoLanding = 'without-protein-powder';
      activeCategory = 'No Protein';
      if (banner && bannerTitle && bannerDesc) {
        bannerTitle.textContent = '🎯 Curated Collection: Ninja Creami Without Protein Powder';
        bannerDesc.textContent = 'Showing 49+ tested recipes crafted with real fruit, gelato bases, and dairy without protein powder or chalkiness.';
        banner.style.display = 'flex';
      }
      if (categoryTabs) {
        categoryTabs.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.category === 'No Protein');
        });
      }
      renderRecipes();
    } else if (path === '/category/keto-low-carb' || path === '/category/keto' || path === '/category/low-carb' || path === '/ninja-creami-keto-recipes' || path === '/ninja-creami-low-carb-recipes') {
      activeSeoLanding = 'keto';
      activeCategory = 'Keto';
      if (banner && bannerTitle && bannerDesc) {
        bannerTitle.textContent = '🥑 Curated Collection: Keto & Low Carb Ninja Creami Recipes';
        bannerDesc.textContent = 'Ultra-creamy high-fat pints under 5g net carbs per pint made with heavy cream, almond milk, and allulose.';
        banner.style.display = 'flex';
      }
      if (categoryTabs) {
        categoryTabs.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.category === 'Keto');
        });
      }
      renderRecipes();
    } else if (path === '/category/under-300-cal' || path === '/category/under-300-calories' || path === '/category/low-calorie' || path === '/ninja-creami-low-calorie-recipes' || path === '/ninja-creami-low-calorie') {
      activeSeoLanding = 'under-300-cal';
      if (banner && bannerTitle && bannerDesc) {
        bannerTitle.textContent = '🔥 Curated Collection: Low-Calorie Ninja Creami (Under 300 kcal)';
        bannerDesc.textContent = '160+ macro-friendly pints designed for cutting, fat loss, and guilt-free daily snacking under 300 calories.';
        banner.style.display = 'flex';
      }
      renderRecipes();
    } else if (path === '/category/high-protein' || path === '/category/protein' || path === '/ninja-creami-protein-ice-cream' || path === '/ninja-creami-protein-recipes') {
      activeSeoLanding = 'high-protein';
      if (banner && bannerTitle && bannerDesc) {
        bannerTitle.textContent = '💪 Curated Collection: High-Protein Ninja Creami (25g - 50g+ Protein)';
        bannerDesc.textContent = '120+ anabolic recipe pints with tested macro ratios, silky smooth texture, and optimal spin settings.';
        banner.style.display = 'flex';
      }
      renderRecipes();
    } else if (path === '/category/sorbet' || path === '/category/fruit-sorbet' || path === '/ninja-creami-sorbet-recipes' || path === '/ninja-creami-fruit-sorbet') {
      activeSeoLanding = 'sorbet';
      if (banner && bannerTitle && bannerDesc) {
        bannerTitle.textContent = '🍧 Curated Collection: Ninja Creami Fruit Sorbets';
        bannerDesc.textContent = '40+ silky dairy-free fruit sorbet recipes made with fresh and canned fruit spun on the Sorbet cycle.';
        banner.style.display = 'flex';
      }
      renderRecipes();
    } else if (path === '/category/dairy-free' || path === '/category/vegan' || path === '/category/lactose-free' || path === '/ninja-creami-dairy-free-recipes' || path === '/ninja-creami-vegan-recipes') {
      activeSeoLanding = 'dairy-free';
      if (banner && bannerTitle && bannerDesc) {
        bannerTitle.textContent = '🌱 Curated Collection: Dairy-Free & Vegan Ninja Creami';
        bannerDesc.textContent = 'Plant-based pints crafted with almond milk, oat milk, and coconut cream that never turn icy.';
        banner.style.display = 'flex';
      }
      renderRecipes();
    } else if (path === '/category/deluxe' || path === '/category/deluxe-24oz' || path === '/ninja-creami-deluxe-recipes') {
      activeSeoLanding = 'deluxe';
      if (banner && bannerTitle && bannerDesc) {
        bannerTitle.textContent = '🥣 Curated Collection: Ninja Creami Deluxe (24 oz NC500 Series)';
        bannerDesc.textContent = 'All 212 tested recipes scaled for 24 oz Deluxe containers with 1.5x formulas and MAX FILL indicators.';
        banner.style.display = 'flex';
      }
      renderRecipes();
    } else if (path === '/category/gelato' || path === '/ninja-creami-gelato-recipes') {
      activeSeoLanding = 'gelato';
      if (banner && bannerTitle && bannerDesc) {
        bannerTitle.textContent = '🇮🇹 Curated Collection: Artisanal Ninja Creami Gelato';
        bannerDesc.textContent = 'Dense, velvety, and authentic Italian-style gelato and custard pints spun on the Gelato cycle.';
        banner.style.display = 'flex';
      }
      renderRecipes();
    } else if (path === '/freeze-guide' || path === '/guide/freeze-time' || path === '/guide/ninja-creami-freeze-time') {
      setTimeout(() => {
        openFreezerModal();
        showToast('❄️ Welcome to the Ninja Creami Freeze Time Guide! Log pints and set push alerts below.');
      }, 300);
    }
  }

  // --- User Feedback & Ideas (Roadmap Item 21) ---
  let userFeedbackCategory = 'feature';
  let userFeedbackRating = 5;

  function openFeedbackModal(defaultCategory = 'feature', defaultMessage = '') {
    const modal = document.getElementById('feedbackModalOverlay');
    if (!modal) return;

    userFeedbackCategory = defaultCategory;
    userFeedbackRating = 5;

    // Reset pills
    const pills = document.getElementById('feedbackCategoryPills');
    if (pills) {
      pills.querySelectorAll('.btn-time-preset').forEach(b => {
        b.classList.toggle('active', b.dataset.category === defaultCategory);
      });
    }

    // Reset stars
    updateFeedbackStarsUI(userFeedbackRating);

    // Prefill fields
    const msgInput = document.getElementById('feedbackMessageInput');
    if (msgInput) msgInput.value = defaultMessage || '';

    const emailInput = document.getElementById('feedbackEmailInput');
    if (emailInput) {
      emailInput.value = currentUser ? (currentUser.email || '') : '';
    }

    const nameInput = document.getElementById('feedbackNameInput');
    if (nameInput) {
      nameInput.value = currentUser ? (currentUser.name || currentUser.username || '') : '';
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
    if (msgInput) setTimeout(() => msgInput.focus(), 100);
  }

  function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModalOverlay');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    unlockBackgroundScroll();
  }

  function updateFeedbackStarsUI(rating) {
    const starsRow = document.getElementById('feedbackStarsRow');
    if (!starsRow) return;
    starsRow.querySelectorAll('.feedback-star-btn').forEach(btn => {
      const starVal = parseInt(btn.dataset.star) || 0;
      btn.classList.toggle('active', starVal <= rating);
    });
  }

  function initFeedbackSystem() {
    const openBtn = document.getElementById('openFeedbackBtn');
    if (openBtn) openBtn.addEventListener('click', () => openFeedbackModal('feature'));

    const footerBtn = document.getElementById('footerFeedbackBtn');
    if (footerBtn) footerBtn.addEventListener('click', () => openFeedbackModal('general'));

    const closeBtn = document.getElementById('btnCloseFeedbackModal');
    if (closeBtn) closeBtn.addEventListener('click', closeFeedbackModal);

    const cancelBtn = document.getElementById('btnCancelFeedback');
    if (cancelBtn) cancelBtn.addEventListener('click', closeFeedbackModal);

    const overlay = document.getElementById('feedbackModalOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeFeedbackModal();
      });
    }

    // Category pills click
    const pills = document.getElementById('feedbackCategoryPills');
    if (pills) {
      pills.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-time-preset');
        if (!btn) return;
        userFeedbackCategory = btn.dataset.category || 'general';
        pills.querySelectorAll('.btn-time-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    }

    // Stars click
    const starsRow = document.getElementById('feedbackStarsRow');
    if (starsRow) {
      starsRow.addEventListener('click', (e) => {
        const starBtn = e.target.closest('.feedback-star-btn');
        if (!starBtn) return;
        userFeedbackRating = parseInt(starBtn.dataset.star) || 5;
        updateFeedbackStarsUI(userFeedbackRating);
      });
    }

    // Form submit
    const form = document.getElementById('feedbackForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgInput = document.getElementById('feedbackMessageInput');
        const emailInput = document.getElementById('feedbackEmailInput');
        const nameInput = document.getElementById('feedbackNameInput');
        const submitBtn = document.getElementById('btnSubmitFeedback');

        const message = (msgInput ? msgInput.value : '').trim();
        if (!message || message.length < 3) {
          showToast('⚠️ Please write a message (at least 3 characters).');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>⏳ Sending...</span>';
        }

        try {
          const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': currentUser?.token ? `Bearer ${currentUser.token}` : '',
              'X-User-Email': currentUser?.email || ''
            },
            body: JSON.stringify({
              category: userFeedbackCategory,
              rating: userFeedbackRating,
              message: message,
              email: (emailInput ? emailInput.value : '').trim(),
              name: (nameInput ? nameInput.value : '').trim()
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            closeFeedbackModal();
            showToast('🎉 Thank you! Your feedback has been received.');
            if (form) form.reset();
          } else {
            showToast('⚠️ Error: ' + (data.error || 'Failed to submit feedback.'));
          }
        } catch (err) {
          console.error('Feedback submission error:', err);
          showToast('Network error submitting feedback.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>🚀 Send Feedback</span>';
          }
        }
      });
    }

    // Story Card Generator Modal Events
    const storyCardModalOverlay = document.getElementById('storyCardModalOverlay');
    const storyCardModalCloseBtn = document.getElementById('storyCardModalCloseBtn');
    const btnRatioStory = document.getElementById('btnRatioStory');
    const btnRatioSquare = document.getElementById('btnRatioSquare');
    const btnShareStoryNative = document.getElementById('btnShareStoryNative');
    const btnDownloadStoryImage = document.getElementById('btnDownloadStoryImage');

    if (storyCardModalCloseBtn) {
      storyCardModalCloseBtn.addEventListener('click', closeStoryCardModal);
    }
    if (storyCardModalOverlay) {
      storyCardModalOverlay.addEventListener('click', (e) => {
        if (e.target === storyCardModalOverlay) {
          closeStoryCardModal();
        }
      });
    }
    if (btnRatioStory) {
      btnRatioStory.addEventListener('click', () => {
        if (currentStoryRatio === 'story') return;
        currentStoryRatio = 'story';
        btnRatioStory.classList.add('active');
        if (btnRatioSquare) btnRatioSquare.classList.remove('active');
        renderStoryCardGraphic();
      });
    }
    if (btnRatioSquare) {
      btnRatioSquare.addEventListener('click', () => {
        if (currentStoryRatio === 'square') return;
        currentStoryRatio = 'square';
        btnRatioSquare.classList.add('active');
        if (btnRatioStory) btnRatioStory.classList.remove('active');
        renderStoryCardGraphic();
      });
    }
    const storyThemeSwitcher = document.getElementById('storyThemeSwitcher');
    if (storyThemeSwitcher) {
      storyThemeSwitcher.addEventListener('click', (e) => {
        const btn = e.target.closest('.theme-pill-btn');
        if (!btn) return;
        const themeId = btn.dataset.theme;
        if (!themeId || themeId === currentStoryTheme) return;
        currentStoryTheme = themeId;
        try {
          localStorage.setItem('creami_story_theme', currentStoryTheme);
        } catch (err) {}
        storyThemeSwitcher.querySelectorAll('.theme-pill-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.theme === currentStoryTheme);
        });
        renderStoryCardGraphic();
      });
    }

    const btnToggleStoryStreak = document.getElementById('btnToggleStoryStreak');
    if (btnToggleStoryStreak) {
      btnToggleStoryStreak.addEventListener('click', () => {
        currentStoryShowStreak = !currentStoryShowStreak;
        try {
          localStorage.setItem('creami_story_show_streak', currentStoryShowStreak ? 'true' : 'false');
        } catch (e) {}
        updateStoryStreakToggleUI();
        renderStoryCardGraphic();
      });
    }

    if (btnShareStoryNative) {
      btnShareStoryNative.addEventListener('click', shareStoryCardNative);
    }
    if (btnDownloadStoryImage) {
      btnDownloadStoryImage.addEventListener('click', triggerStoryDownload);
    }
    const storyCardPreviewImg = document.getElementById('storyCardPreviewImg');
    if (storyCardPreviewImg) {
      storyCardPreviewImg.addEventListener('click', () => {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
          showToast('📸 Tap & hold image to "Save to Photos"');
        } else if (navigator.canShare && currentStoryFile && navigator.canShare({ files: [currentStoryFile] })) {
          shareStoryCardNative();
        }
      });
    }

    // Floating Back to Top Button
    const btnBackToTop = document.getElementById('btnBackToTop');
    if (btnBackToTop) {
      let bttRafId = null;
      const handleBttScroll = () => {
        if (bttRafId) return;
        bttRafId = requestAnimationFrame(() => {
          bttRafId = null;
          const shouldShow = window.scrollY > 400;
          btnBackToTop.classList.toggle('visible', shouldShow);
        });
      };

      window.addEventListener('scroll', handleBttScroll, { passive: true });
      handleBttScroll();

      btnBackToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
