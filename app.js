/**
 * Creami Cravings - Modern Ninja Creami Pantry & Recipe Logic Engine
 */

(function () {
  'use strict';

  // LocalStorage Keys
  const PANTRY_STORAGE_KEY = 'creami_pantry_v2';
  const THEME_STORAGE_KEY = 'creami_theme_mode';
  const FAVORITES_STORAGE_KEY = 'creami_favorites_v2';
  const CUSTOM_RECIPES_STORAGE_KEY = 'creami_custom_recipes_v2';
  const MANUAL_SHOPPING_STORAGE_KEY = 'creami_manual_shopping_v2';
  const USER_RECIPE_DATA_KEY = 'creami_user_recipe_data_v2';
  const USER_AUTH_STORAGE_KEY = 'creami_user_auth_v2';
  const RECIPE_MADE_STORAGE_KEY = 'creami_recipe_made_v2';
  const COMMUNITY_STATS_CACHE_KEY = 'creami_community_stats_v2';
  const FREEZER_STORAGE_KEY = 'creami_freezer_pints_v2';

  // Default Staples Checked for New Users
  const DEFAULT_STAPLES = [
    'fat_free_ultra_filtered_milk',
    'sweetener',
    'xanthan_gum',
    'salt',
    'vanilla_bean_paste',
    'cocoa_powder'
  ];

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
    'Mini Lucky-Charms-Style Marshmallows': 'Mini Cereal Marshmallows'
  };

  // Interchangeable ingredients in pantry matcher
  const INGREDIENT_EQUIVALENTS = {
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
    mini_marshmallows: ['toasted_mini_marshmallows']
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

  function isItemInPantry(ing) {
    if (!ing) return false;
    const id = typeof ing === 'string' ? ing : (ing.id || '');
    if (!id) return false;
    if (pantryState.has(id)) return true;
    const equivs = INGREDIENT_EQUIVALENTS[id];
    if (equivs && equivs.some(eqId => pantryState.has(eqId))) return true;

    const rawName = typeof ing === 'object' ? (ing.name || '') : ing;
    if (rawName && typeof INGREDIENTS_MASTER !== 'undefined') {
      const clean = sanitizeShoppingItemName(rawName).toLowerCase();
      const masterMatch = INGREDIENTS_MASTER.find(m => m.name.toLowerCase() === clean);
      if (masterMatch && pantryState.has(masterMatch.id)) return true;
    }

    return false;
  }

  function getIngredientCategoryKey(nameOrId) {
    if (!nameOrId) return 'mixins_snacks';
    const clean = sanitizeShoppingItemName(nameOrId).toLowerCase();
    const id = clean.replace(/[^a-z0-9]+/g, '_').trim();
    if (typeof INGREDIENTS_MASTER !== 'undefined') {
      const match = INGREDIENTS_MASTER.find(i => i.id === id || i.name.toLowerCase() === clean);
      if (match && match.category) return match.category;
    }

    if (/cocoa powder|flour|oats|malted milk/i.test(clean)) return 'baking_powders';
    if (/coffee|espresso|tea|matcha|dr pepper|root beer|sprite|lemonade/i.test(clean)) return 'beverages_drinks';
    if (/protein shake|protein powder|pb fit|peanut butter powder/i.test(clean)) return 'protein_powders';
    if (/creamer|milk|shake|yogurt|buttermilk|cheese|butter|egg/i.test(clean)) return 'dairy_liquids';
    if (/protein/i.test(clean)) return 'protein_powders';
    if (/pudding/i.test(clean)) return 'pudding_mixes';
    if (/syrup|sauce|ganache/i.test(clean)) return 'syrups_sauces';
    if (/sweetener|sugar|gum|stevia|allulose/i.test(clean)) return 'sweeteners_binders';
    if (/extract|flavor|emulsion|paste|coloring/i.test(clean)) return 'extracts_flavors';
    if (/cinnamon|spice|nutmeg|salt|clove/i.test(clean)) return 'spices_seasonings';
    if (/peanut butter|pb|nutella|spread|jam|marshmallow fluff|marshmallow creme|frosting/i.test(clean)) return 'nut_butters_spreads';
    if (/berry|fruit|apple|banana|mango|peach|lemon|lime|orange|pumpkin/i.test(clean)) return 'produce_fruit';
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
  let favoritesState = new Set();
  let customRecipesState = [];
  let allRecipes = [];
  let ingredientRecipeCount = {};
  let manualShoppingList = new Set();
  let userRecipeData = {};
  let currentUser = null; // { id, email, name, picture, token }
  let recipeMadeCounts = {}; // { [recipeId]: number }
  let communityStats = {
    ratings: {},
    madeCounts: {},
    totalBatches: 0,
    totalSpins: 0,
    totalUsers: 1
  };

  // Active Filters
  let activeCategory = 'all';
  let activeQuickFilter = 'all';
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
  
  const shoppingModalOverlay = document.getElementById('shoppingModalOverlay');
  const shoppingModalBody = document.getElementById('shoppingModalBody') || document.getElementById('shoppingListBody');
  const shoppingModalCloseBtn = document.getElementById('shoppingModalCloseBtn');
  const openShoppingListBtn = document.getElementById('openShoppingListBtn');
  const shoppingListBadge = document.getElementById('shoppingListBadge');
  const copyShoppingListBtn = document.getElementById('copyShoppingListBtn');
  const printShoppingListBtn = document.getElementById('printShoppingListBtn');
  const clearShoppingListBtn = document.getElementById('clearShoppingListBtn');
  
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
  let adminFilterRole = 'all';
  let adminSearchQuery = '';

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
    initGoogleAuth();
    populateFreezerRecipeDatalist();
    updateFreezerBadges();
    startFreezerTicker();
    initFreezeNotifications();
    initPwaInstall();
    initCookieConsent();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAndNotifyReadyPints();
        updateFreezerBadges();
        if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
          renderFreezerModal();
        }
      }
    });

    window.addEventListener('focus', () => {
      checkAndNotifyReadyPints();
      updateFreezerBadges();
    });

    if (window.innerWidth <= 768) {
      setMobileView('recipes');
    }
  }

  // --- Storage Management ---
  function loadStorage() {
    // Pantry
    const savedPantry = localStorage.getItem(PANTRY_STORAGE_KEY);
    if (savedPantry) {
      try {
        pantryState = new Set(JSON.parse(savedPantry));
      } catch (e) {
        pantryState = new Set(DEFAULT_STAPLES);
      }
    } else {
      pantryState = new Set(DEFAULT_STAPLES);
      savePantry();
    }

    // Google User Profile / Auth (Loaded first so user identity is known)
    const savedUser = localStorage.getItem(USER_AUTH_STORAGE_KEY);
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        if (currentUser) {
          const ADMIN_EMAILS = ['admin@creamicravings.com', 'ahumpo7@gmail.com', 'ahumpo@gmail.com', 'andrew@gmail.com'];
          const userEmail = (currentUser.email || '').toLowerCase();
          const isAdmin = currentUser.role === 'admin' || ADMIN_EMAILS.includes(userEmail);
          currentUser.role = isAdmin ? 'admin' : (currentUser.role || 'user');
          if (!currentUser.subscriptions || !Array.isArray(currentUser.subscriptions)) {
            currentUser.subscriptions = isAdmin 
              ? ['All-Access', 'Base Flavors', 'Fan Favorites', 'No Protein', 'Keto', 'Lactose Free'] 
              : ['Base Flavors'];
          } else if (isAdmin && !currentUser.subscriptions.includes('All-Access')) {
            currentUser.subscriptions = ['All-Access', 'Base Flavors', 'Fan Favorites', 'No Protein', 'Keto', 'Lactose Free'];
          }
        }
      } catch (e) {
        currentUser = null;
      }
    }

    // Favorites: strictly tied to logged-in user account
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
      // Guest mode: favorites require login
      favoritesState = new Set();
    }

    // Custom Recipes: strictly tied to logged-in user account
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
        // One-time migration of any legacy local custom recipes to this signed-in user
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
      // Offline / guest mode: personal recipes are hidden
      customRecipesState = [];
      localStorage.removeItem(CUSTOM_RECIPES_STORAGE_KEY);
    }

    // Manual Shopping List
    const savedShop = localStorage.getItem(MANUAL_SHOPPING_STORAGE_KEY);
    if (savedShop) {
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
    }

    // User Recipe Ratings & Notes
    const savedUserData = localStorage.getItem(USER_RECIPE_DATA_KEY);
    if (savedUserData) {
      try {
        userRecipeData = JSON.parse(savedUserData);
      } catch (e) {
        userRecipeData = {};
      }
    }

    // Personal Recipe Made Batch Counts
    const savedMade = localStorage.getItem(RECIPE_MADE_STORAGE_KEY);
    if (savedMade) {
      try {
        recipeMadeCounts = JSON.parse(savedMade);
      } catch (e) {
        recipeMadeCounts = {};
      }
    }

    // Cached Community Stats
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
      } catch (e) {
        // default remains
      }
    }

    // Freezer Pints (Roadmap Item 8)
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
      const savedFreezer = localStorage.getItem(FREEZER_STORAGE_KEY);
      if (savedFreezer) {
        try {
          freezerPintsState = JSON.parse(savedFreezer);
        } catch (e) {
          freezerPintsState = [];
        }
        freezerPintsState = [];
      }
    }

    // Active Recipe Substitutions (Roadmap Item 16)
    const savedSwaps = localStorage.getItem('creami_active_swaps_v1');
    if (savedSwaps) {
      try {
        activeRecipeSwaps = JSON.parse(savedSwaps);
      } catch (e) {
        activeRecipeSwaps = {};
      }
    }
  }

  function saveActiveSwaps() {
    try {
      localStorage.setItem('creami_active_swaps_v1', JSON.stringify(activeRecipeSwaps));
    } catch (e) {}
  }

  function savePantry() {
    localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(Array.from(pantryState)));
    updateStats();
    triggerCloudSync();
  }

  function saveFavorites() {
    if (currentUser && currentUser.id) {
      const userFavKey = `${FAVORITES_STORAGE_KEY}_${currentUser.id}`;
      localStorage.setItem(userFavKey, JSON.stringify(Array.from(favoritesState)));
    }
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    updateCategoryCounts();
    triggerCloudSync();
  }

  function saveManualShoppingList() {
    localStorage.setItem(MANUAL_SHOPPING_STORAGE_KEY, JSON.stringify(Array.from(manualShoppingList)));
    updateShoppingListBadge();
    triggerCloudSync();
  }

  function saveUserRecipeData() {
    localStorage.setItem(USER_RECIPE_DATA_KEY, JSON.stringify(userRecipeData));
    triggerCloudSync();
  }

  function saveUserAuth() {
    if (currentUser) {
      localStorage.setItem(USER_AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_AUTH_STORAGE_KEY);
    }
    updateAuthUI();
  }

  function saveRecipeMadeCounts() {
    localStorage.setItem(RECIPE_MADE_STORAGE_KEY, JSON.stringify(recipeMadeCounts));
    triggerCloudSync();
  }

  function saveCommunityStats() {
    localStorage.setItem(COMMUNITY_STATS_CACHE_KEY, JSON.stringify(communityStats));
    updateCommunityStatsUI();
  }

  function saveCustomRecipes() {
    if (currentUser && currentUser.id) {
      const userCustomKey = `${CUSTOM_RECIPES_STORAGE_KEY}_${currentUser.id}`;
      localStorage.setItem(userCustomKey, JSON.stringify(customRecipesState));
    }
    mergeRecipes();
    calculateIngredientUsage();
    renderPantryList();
    renderRecipes();
    triggerCloudSync();
  }

  function saveFreezerPints() {
    if (currentUser && currentUser.id) {
      const userFreezerKey = `${FREEZER_STORAGE_KEY}_${currentUser.id}`;
      localStorage.setItem(userFreezerKey, JSON.stringify(freezerPintsState));
    } else {
      localStorage.setItem(FREEZER_STORAGE_KEY, JSON.stringify(freezerPintsState));
    }
    updateFreezerBadges();
    triggerCloudSync();
  }

  // --- Background Cloud Sync to Google Account ---
  let syncTimeout = null;
  function triggerCloudSync() {
    if (!currentUser || !currentUser.token) return;
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: currentUser.token,
            pantry: Array.from(pantryState),
            favorites: Array.from(favoritesState),
            madeCounts: recipeMadeCounts,
            ratings: userRecipeData,
            customRecipes: customRecipesState,
            shoppingList: Array.from(manualShoppingList),
            freezerPints: freezerPintsState
          })
        });
      } catch (err) {
        console.warn('Background sync notice:', err);
      }
    }, 1200);
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
          saveCommunityStats();
          renderRecipes();
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
  function initGoogleAuth() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: '992837461234-creamicravings.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const gsiContainer = document.getElementById('gsiButtonContainer');
        if (gsiContainer) {
          gsiContainer.innerHTML = '';
          window.google.accounts.id.renderButton(gsiContainer, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'signin_with',
            width: 280
          });
        }
      } catch (err) {
        console.warn('Google Identity Services init notice:', err);
      }
    }
  }

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

  function applyUserSession(data) {
    const ADMIN_EMAILS = ['admin@creamicravings.com', 'ahumpo7@gmail.com', 'ahumpo@gmail.com', 'andrew@gmail.com'];
    const email = (data.user.email || '').toLowerCase();
    const isAdmin = data.user.role === 'admin' || ADMIN_EMAILS.includes(email);

    currentUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      picture: data.user.picture,
      role: isAdmin ? 'admin' : (data.user.role || 'user'),
      subscriptions: isAdmin 
        ? ['All-Access', 'Base Flavors', 'Fan Favorites', 'No Protein', 'Keto', 'Lactose Free']
        : (data.user.subscriptions || ['Base Flavors']),
      token: data.token
    };
    saveUserAuth();

    // Restore & merge user's stored kitchen data from Google cloud
    if (data.user.pantry && data.user.pantry.length > 0) {
      data.user.pantry.forEach(id => pantryState.add(id));
      savePantry();
      renderPantryList();
    }
    if (data.user.favorites && data.user.favorites.length > 0) {
      data.user.favorites.forEach(id => favoritesState.add(id));
      saveFavorites();
    }
    if (data.user.madeCounts) {
      recipeMadeCounts = { ...recipeMadeCounts, ...data.user.madeCounts };
      saveRecipeMadeCounts();
    }
    if (data.user.ratings) {
      userRecipeData = { ...userRecipeData, ...data.user.ratings };
      saveUserRecipeData();
    }
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
    if (data.user.shoppingList && data.user.shoppingList.length > 0) {
      data.user.shoppingList.forEach(item => {
        if (!isShoppingExcluded(item)) {
          manualShoppingList.add(sanitizeShoppingItemName(item));
        }
      });
      saveManualShoppingList();
    }
    if (data.user.freezerPints && Array.isArray(data.user.freezerPints)) {
      const existingIds = new Set(freezerPintsState.map(p => p.id));
      data.user.freezerPints.forEach(p => {
        if (!existingIds.has(p.id)) {
          freezerPintsState.push(p);
        }
      });
      saveFreezerPints();
    }

    closeGoogleAuthModal();
    updateAuthUI();
    updateFreezerBadges();
    renderRecipes();
    showToast(`✨ Welcome back, ${currentUser.name || 'Ice Cream Craver'}! All data synced.`);
    
    // Push updated combined state to cloud
    triggerCloudSync();
  }

  function logoutUser() {
    currentUser = null;
    saveUserAuth();
    // Hide personal custom recipes and clear favorites upon sign-out
    customRecipesState = [];
    favoritesState = new Set();
    freezerPintsState = [];
    updateFreezerBadges();
    localStorage.removeItem(CUSTOM_RECIPES_STORAGE_KEY);
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
    renderRecipes();
    showToast('Signed out of Google account. Personal data hidden.');
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
      if (customActions) customActions.style.display = 'block';
      if (customTab) {
        customTab.style.display = (customRecipesState.length > 0) ? 'inline-flex' : 'none';
      }
      if (openAdminPortalBtn) {
        openAdminPortalBtn.style.display = (currentUser && currentUser.role === 'admin') ? 'inline-flex' : 'none';
      }
    } else {
      if (signInBtn) signInBtn.style.display = 'inline-flex';
      if (profileWidget) profileWidget.style.display = 'none';
      // Hide + Custom Recipe button when signed out
      if (customActions) customActions.style.display = 'none';
      if (customTab) customTab.style.display = 'none';
      if (openAdminPortalBtn) {
        openAdminPortalBtn.style.display = 'none';
      }
    }
  }

  // --- Tiered Recipe Access & Gating Helpers (Roadmap Item 15) ---
  function normalizeCategoryName(cat) {
    if (!cat) return '';
    return String(cat).toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function getRecipeRequiredTier(recipe) {
    if (!recipe) return 'Base Flavors';
    if (recipe.category === 'Custom' || recipe.isPersonal || (recipe.id && recipe.id.startsWith('custom_'))) {
      return 'Custom';
    }
    const cats = (recipe.categories && recipe.categories.length > 0)
      ? recipe.categories
      : [recipe.category || 'Base Flavors'];

    // Universal free starter tier: Base Flavors is accessible to all
    if (cats.some(c => normalizeCategoryName(c).includes('base'))) {
      return 'Base Flavors';
    }

    for (const c of cats) {
      const norm = normalizeCategoryName(c);
      if (norm.includes('fanfav')) return 'Fan Favorites';
      if (norm.includes('keto')) return 'Keto';
      if (norm.includes('lactose')) return 'Lactose Free';
      if (norm.includes('noprot')) return 'No Protein';
    }
    return cats[0] || 'Fan Favorites';
  }

  function isRecipeAccessible(recipe) {
    if (!recipe) return true;
    if (recipe.category === 'Custom' || recipe.isPersonal || (recipe.id && recipe.id.startsWith('custom_'))) {
      return true;
    }

    const cats = (recipe.categories && recipe.categories.length > 0)
      ? recipe.categories
      : [recipe.category || 'Base Flavors'];

    // Universal free starter tier: Base Flavors is always accessible to everyone
    if (cats.some(c => normalizeCategoryName(c).includes('base'))) {
      return true;
    }

    // Admins have all-access
    if (currentUser && currentUser.role === 'admin') {
      return true;
    }

    const subs = (currentUser && Array.isArray(currentUser.subscriptions))
      ? currentUser.subscriptions
      : ['Base Flavors'];

    if (subs.includes('All-Access')) {
      return true;
    }

    // Check if any category of the recipe matches an active subscription
    return cats.some(c => {
      const normC = normalizeCategoryName(c);
      return subs.some(s => {
        const normS = normalizeCategoryName(s);
        return normS.includes(normC) || normC.includes(normS);
      });
    });
  }

  // --- Modal Scroll & Overscroll Containment Helpers ---
  let savedScrollY = 0;
  let isScrollLocked = false;

  function lockBackgroundScroll() {
    if (isScrollLocked) return;
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    isScrollLocked = true;

    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  function unlockBackgroundScroll() {
    requestAnimationFrame(() => {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      if (activeModals.length > 0) return;
      if (!isScrollLocked) return;
      isScrollLocked = false;

      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY);
    });
  }

  function setupModalScrollLock(overlay) {
    if (!overlay) return;

    // Prevent background scrolling via wheel
    overlay.addEventListener('wheel', (e) => {
      if (!overlay.classList.contains('active')) return;

      const content = overlay.querySelector('.modal-content');
      // If wheel event occurs directly on the backdrop or outside modal content
      if (!content || !content.contains(e.target) || e.target === overlay) {
        e.preventDefault();
        return;
      }

      // If content has no internal scrollable overflow
      const canScroll = content.scrollHeight > (content.clientHeight + 4);
      if (!canScroll) {
        e.preventDefault();
        return;
      }

      // If content can scroll, prevent overscroll chaining at top or bottom limits
      const isAtTop = content.scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) && e.deltaY > 0;
      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    }, { passive: false });

    // Prevent touch-drag background scrolling on mobile
    let touchStartY = 0;
    overlay.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    overlay.addEventListener('touchmove', (e) => {
      if (!overlay.classList.contains('active')) return;

      const content = overlay.querySelector('.modal-content');
      if (!content || !content.contains(e.target) || e.target === overlay) {
        e.preventDefault();
        return;
      }

      const canScroll = content.scrollHeight > (content.clientHeight + 4);
      if (!canScroll) {
        e.preventDefault();
        return;
      }

      const currentY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : 0;
      const deltaY = touchStartY - currentY; // positive = scrolling down

      const isAtTop = content.scrollTop <= 0 && deltaY < 0;
      const isAtBottom = (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) && deltaY > 0;
      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  function openGoogleAuthModal() {
    const modal = document.getElementById('googleAuthModalOverlay');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
      initGoogleAuth();
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
      signInBtn.addEventListener('click', openGoogleAuthModal);
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

    const quickForm = document.getElementById('quickGoogleAuthForm');
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
  }

  // --- Recipe Batch Counter API & Helper ---
  async function logRecipeBatch(recipeId, delta) {
    const currentCount = recipeMadeCounts[recipeId] || 0;
    const newCount = Math.max(0, currentCount + delta);
    recipeMadeCounts[recipeId] = newCount;
    saveRecipeMadeCounts();

    if (delta > 0) {
      playAudioSuccess();
      triggerHaptic(25);
    }

    // Optimistic community update
    const currentComm = communityStats.madeCounts[recipeId] || 0;
    communityStats.madeCounts[recipeId] = Math.max(0, currentComm + delta);
    communityStats.totalBatches = Math.max(0, (communityStats.totalBatches || 0) + delta);
    saveCommunityStats();

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
          communityStats.madeCounts[recipeId] = data.communityMade ?? data.communityTotalMade ?? data.madeCounts?.[recipeId];
          communityStats.totalBatches = data.totalBatches ?? data.totalCommunityBatches;
          recipeMadeCounts[recipeId] = data.userMade ?? data.userMadeCount;
          saveRecipeMadeCounts();
          saveCommunityStats();
        }
      }
    } catch (err) {
      console.warn('Batch logging sync warning:', err);
    }

    if (delta > 0) {
      showToast(`🍨 Batch logged! You have spun this ${newCount} time${newCount === 1 ? '' : 's'}.`);
    } else {
      showToast(`Batch counter updated (${newCount}).`);
    }

    updateModalBatchDisplay(recipeId);
    renderRecipes();
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
    allRecipes = [...baseRecipes, ...customRecipesState];
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
  }

  function calculateIngredientUsage() {
    ingredientRecipeCount = {};
    allRecipes.forEach(recipe => {
      const seen = new Set();
      (recipe.ingredients || []).forEach(ing => {
        if (ing.id && !seen.has(ing.id)) {
          seen.add(ing.id);
          ingredientRecipeCount[ing.id] = (ingredientRecipeCount[ing.id] || 0) + 1;
        }
      });
    });
  }

  // --- Pantry List Rendering ---
  function renderPantryList() {
    if (!ingredientListContainer || typeof INGREDIENTS_MASTER === 'undefined') return;

    ingredientListContainer.innerHTML = '';
    const q = ingredientSearchQuery.toLowerCase().trim();

    // Group items by category
    const grouped = {};
    Object.keys(INGREDIENT_CATEGORIES).forEach(cat => grouped[cat] = []);

    INGREDIENTS_MASTER.forEach(item => {
      if (q && !item.name.toLowerCase().includes(q)) return;
      const cat = item.category || 'mixins_snacks';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    let renderedAny = false;

    Object.entries(INGREDIENT_CATEGORIES).forEach(([catKey, catLabel]) => {
      const items = grouped[catKey] || [];
      if (items.length === 0) return;

      renderedAny = true;
      const groupEl = document.createElement('div');
      groupEl.className = 'category-group open';

      const inStockInCat = items.filter(it => pantryState.has(it.id)).length;

      const catIcon = CATEGORY_ICONS[catKey] || '📦';

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
        <div class="category-items-list"></div>
      `;

      const headerEl = groupEl.querySelector('.category-header');
      headerEl.addEventListener('click', () => {
        groupEl.classList.toggle('open');
      });

      const listEl = groupEl.querySelector('.category-items-list');

      items.forEach(item => {
        const isChecked = pantryState.has(item.id);
        const count = ingredientRecipeCount[item.id] || 0;

        const row = document.createElement('div');
        row.className = `ingredient-checkbox-item ${isChecked ? 'checked' : ''}`;
        row.dataset.id = item.id;

        row.innerHTML = `
          <div class="custom-checkbox"></div>
          <span class="ingredient-name-text">${item.name}</span>
          ${count > 0 ? `<span class="ingredient-recipe-count" title="Used in ${count} recipes">${count}</span>` : ''}
        `;

        row.addEventListener('click', (e) => {
          e.stopPropagation();
          togglePantryItem(item.id);
        });

        listEl.appendChild(row);
      });

      ingredientListContainer.appendChild(groupEl);
    });

    if (!renderedAny) {
      ingredientListContainer.innerHTML = `
        <div style="padding: 24px 10px; text-align: center; color: var(--text-dim); font-size: 0.88rem;">
          No ingredients match "${ingredientSearchQuery}"
        </div>
      `;
    }

    updateStats();
  }

  function togglePantryItem(id) {
    if (pantryState.has(id)) {
      pantryState.delete(id);
    } else {
      pantryState.add(id);
    }
    savePantry();
    updatePantryCheckboxVisuals();
    renderRecipes();
  }

  function updatePantryCheckboxVisuals() {
    document.querySelectorAll('.ingredient-checkbox-item').forEach(el => {
      const id = el.dataset.id;
      if (pantryState.has(id)) {
        el.classList.add('checked');
      } else {
        el.classList.remove('checked');
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

    // Smart Visibility: Only show Base Ready card when it provides distinct value
    // (i.e. when there are recipes where base can be frozen today, but mix-ins are needed later)
    const baseReadyCard = document.getElementById('statBaseReadyCard');
    const statsBar = document.querySelector('.stats-bar');
    const shouldShowBaseReady = baseReadyCount > readyCount;
    if (baseReadyCard) {
      baseReadyCard.style.display = shouldShowBaseReady ? '' : 'none';
    }
    if (statsBar) {
      statsBar.classList.toggle('base-ready-hidden', !shouldShowBaseReady);
    }

    const tabRecipeCount = document.getElementById('mobileTabRecipeCount');
    if (tabRecipeCount) tabRecipeCount.textContent = accessibleTotal;

    // Apply active category and filter toggles
    let filtered = scoredRecipes.filter(({ recipe, match }) => {
      // Only show recipes the user has access to!
      // If they are locked, hide them.
      if (!isRecipeAccessible(recipe)) return false;

      // Category filter
      if (activeCategory === 'favorites') {
        if (!favoritesState.has(recipe.id)) return false;
      } else if (activeCategory !== 'all') {
        const cats = recipe.categories || (recipe.category ? [recipe.category] : []);
        if (!cats.includes(activeCategory)) return false;
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

      // Quick Filter Chips
      if (activeQuickFilter === 'high_protein') {
        const pro = parseInt(recipe.macros.protein) || 0;
        if (pro < 35) return false;
      } else if (activeQuickFilter === 'low_cal') {
        const cal = parseInt(recipe.macros.calories) || 999;
        if (cal >= 200) return false;
      } else if (activeQuickFilter === 'low_carb') {
        const carbs = parseInt(recipe.macros.carbs) || 999;
        if (carbs > 10) return false;
      } else if (activeQuickFilter === 'low_fat') {
        const fat = parseInt(recipe.macros.fat) || 0;
        if (fat > 5) return false;
      } else if (activeQuickFilter === 'my_rated') {
        if (!userRecipeData[recipe.id] || !userRecipeData[recipe.id].rating) return false;
      } else if (activeQuickFilter === 'pro_tips') {
        if (!recipe.proTip) return false;
      } else if (activeQuickFilter === 'craving_chocolate') {
        if (!matchesCraving(recipe, 'chocolate')) return false;
      } else if (activeQuickFilter === 'craving_fruit') {
        if (!matchesCraving(recipe, 'fruit')) return false;
      } else if (activeQuickFilter === 'craving_bakery') {
        if (!matchesCraving(recipe, 'bakery')) return false;
      } else if (activeQuickFilter === 'craving_coffee') {
        if (!matchesCraving(recipe, 'coffee')) return false;
      }

      // Search Query
      if (q) {
        const nameMatch = recipe.name.toLowerCase().includes(q);
        const spinMatch = (recipe.spinSetting || '').toLowerCase().includes(q);
        const ingMatch = (recipe.ingredients || []).some(i => i.name.toLowerCase().includes(q));
        if (!nameMatch && !spinMatch && !ingMatch) return false;
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
        const catA = (a.recipe.categories && a.recipe.categories[0]) || a.recipe.category || '';
        const catB = (b.recipe.categories && b.recipe.categories[0]) || b.recipe.category || '';
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
    if (activeQuickFilter === 'high_protein') hintParts.push('💪 High Protein (≥35g)');
    if (activeQuickFilter === 'low_cal') hintParts.push('🔥 Low Calorie (<200 cal)');
    if (activeQuickFilter === 'low_carb') hintParts.push('🥑 Low Carb (≤10g)');
    if (activeQuickFilter === 'low_fat') hintParts.push('🧈 Low Fat (≤5g)');
    if (activeQuickFilter === 'my_rated') hintParts.push('⭐ My Rated');
    if (activeQuickFilter === 'pro_tips') hintParts.push(`💡 Official Author Pro Tips (${filtered.length} recipes)`);
    if (activeQuickFilter === 'craving_chocolate') hintParts.push('🍫 Chocolate Craving');
    if (activeQuickFilter === 'craving_fruit') hintParts.push('🍓 Fruity & Refreshing');
    if (activeQuickFilter === 'craving_bakery') hintParts.push('🍪 Bakery, Cookie & Dough');
    if (activeQuickFilter === 'craving_coffee') hintParts.push('☕ Coffee & Latte');

    const macroParts = [];
    if (macroFilters.minProtein > 0) macroParts.push(`≥${macroFilters.minProtein}g P`);
    if (macroFilters.maxCalories < 450) macroParts.push(`≤${macroFilters.maxCalories} Cal`);
    if (macroFilters.maxFat < 20) macroParts.push(`≤${macroFilters.maxFat}g Fat`);
    if (macroParts.length > 0) hintParts.push(`🎯 Targets: ${macroParts.join(', ')}`);

    activePantryHint.textContent = hintParts.length > 0 ? `• Filtered by ${hintParts.join(' • ')}` : '';

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
      }
      recipeGrid.style.display = 'none';
      recipeGrid.replaceChildren();
      return;
    }

    emptyState.style.display = 'none';
    recipeGrid.style.display = 'grid';

    const cardsToDisplay = filtered.map(({ recipe, match }) => getOrCreateRecipeCard(recipe, match));
    recipeGrid.replaceChildren(...cardsToDisplay);
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
    card.className = `recipe-card ${match.isReady ? 'ready-to-make' : ''} ${!isAccessible ? 'locked' : ''}`;

    const viewBtn = card.querySelector('.btn-view-recipe');
    if (viewBtn) {
      viewBtn.textContent = isAccessible ? 'View Recipe' : '🔒 Locked Preview';
    }

    // Update Locked Badge
    const bookTags = card.querySelector('.card-book-tags');
    let lockedBadge = card.querySelector('.locked-badge');
    if (!isAccessible) {
      const requiredTier = getRecipeRequiredTier(recipe);
      if (!lockedBadge && bookTags) {
        const badge = document.createElement('span');
        badge.className = 'locked-badge';
        badge.title = `Exclusive ${requiredTier} pack`;
        badge.textContent = `🔒 ${requiredTier} Pack`;
        bookTags.appendChild(badge);
      }
    } else if (lockedBadge) {
      lockedBadge.remove();
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
    const isPersonal = Boolean(recipe.isPersonal || (recipe.id && recipe.id.startsWith('custom_')));
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

    const categories = recipe.categories && recipe.categories.length > 0 
      ? recipe.categories 
      : [recipe.category || 'Fan Favorites'];

    const isPersonal = Boolean(recipe.isPersonal || (recipe.id && recipe.id.startsWith('custom_')));
    const commRating = communityStats.ratings[recipe.id];
    const hasCommRating = Boolean(!isPersonal && commRating && commRating.count > 0);
    const commAvg = hasCommRating ? commRating.avg : 0;
    const commCount = hasCommRating ? commRating.count : 0;
    const userFeedback = userRecipeData[recipe.id] || {};
    const userMade = recipeMadeCounts[recipe.id] || 0;
    const commMade = communityStats.madeCounts[recipe.id] || 0;

    card.innerHTML = `
      <div class="recipe-card-body">
        <div class="recipe-card-top">
          <div class="card-book-tags">
            ${isPersonal ? `<span class="book-tag custom" title="Personal custom recipe saved to your Google account">🔒 Personal Recipe</span>` : categories.map(c => `<span class="book-tag ${getCategoryClass(c)}">${c}</span>`).join('')}
            ${!isAccessible ? `<span class="locked-badge" title="Exclusive ${requiredTier} pack">🔒 ${requiredTier} Pack</span>` : ''}
            ${recipe.creaminessScore ? `<span class="recipe-creaminess-badge" title="Build-A-Pint Creaminess Score">🧪 ${recipe.creaminessScore}/10</span>` : ''}
          </div>
          <div class="card-actions-top">
            ${hasCommRating ? `
              <span class="card-community-rating" title="Community rating: ${commAvg.toFixed(1)} / 5.0 (${commCount} review${commCount === 1 ? '' : 's'})">
                ★ ${commAvg.toFixed(1)} <span class="rating-sub">(${commCount})</span>
              </span>
            ` : ''}
            ${userFeedback.rating ? `<span class="recipe-card-rating" title="Your rating: ${userFeedback.rating} stars">⭐ You: ${userFeedback.rating}★</span>` : ''}
            <button class="favorite-btn ${isFav ? 'is-favorite' : ''}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ${isFav ? '💖' : '🤍'}
            </button>
          </div>
        </div>

        <h3 class="recipe-card-title">${recipe.name}</h3>

        <div class="match-status-bar">
          <div class="match-status-row">
            ${matchBadgeHtml}
            <span class="match-percent">${match.matchPercent}%</span>
          </div>
          <div class="match-progress-track">
            <div class="match-progress-fill ${match.isReady ? 'ready' : ''}" style="width: ${match.matchPercent}%;"></div>
          </div>
        </div>

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

      <div class="recipe-card-bottom">
        <span class="spin-tag" title="Recommended spin cycle">🌀 ${recipe.spinSetting || 'Lite Ice Cream'}</span>
        <button class="btn-view-recipe">${isAccessible ? 'View Recipe' : '🔒 Locked Preview'}</button>
      </div>
    `;

    // Favorite button click
    const favBtn = card.querySelector('.favorite-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(recipe.id);
    });

    // View button click & card click
    const viewBtn = card.querySelector('.btn-view-recipe');
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openRecipeModal(recipe);
    });

    card.addEventListener('click', () => {
      openRecipeModal(recipe);
    });

    return card;
  }

  function getCategoryClass(category) {
    if (!category) return '';
    const c = category.toLowerCase();
    if (c.includes('base')) return 'base-flavors';
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
    } else {
      favoritesState.add(recipeId);
      showToast('💖 Added to favorites!');
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

  function isCategoryUnlocked(categoryName) {
    if (!categoryName || categoryName === 'all' || categoryName === 'Base Flavors' || categoryName === 'favorites' || categoryName === 'Custom') {
      return true;
    }
    if (currentUser && currentUser.role === 'admin') return true;
    const subs = (currentUser && Array.isArray(currentUser.subscriptions)) ? currentUser.subscriptions : ['Base Flavors'];
    if (subs.includes('All-Access')) return true;
    const norm = normalizeCategoryName(categoryName);
    return subs.some(s => {
      const normS = normalizeCategoryName(s);
      return normS.includes(norm) || norm.includes(normS);
    });
  }

  function updateCategoryPackPromo(category) {
    const titleEl = document.getElementById('packPromoTitle');
    const descEl = document.getElementById('packPromoDesc');
    const iconEl = document.getElementById('packPromoIcon');
    const unlockBtn = document.getElementById('btnUnlockCurrentCategory');

    const packInfo = {
      'Fan Favorites': {
        icon: '⭐',
        title: 'Fan Favorites Collection (75 Recipes)',
        desc: 'Unlock 75 signature recipes including viral dessert dupes, mix-in masterpieces, and bakery creations like Oreo McFlurry, Cookie Dough Craze, Cosmic Brownie, and Birthday Cake.',
        btnText: '🛒 Unlock Fan Favorites Pack'
      },
      'Keto': {
        icon: '🥑',
        title: 'Keto & Low-Carb Collection (22 Recipes)',
        desc: 'Ultra-low net carbs without sacrificing rich, creamy texture. Includes Keto Chocolate Fudge, Peanut Butter Swirl, Mint Chip, Butter Pecan, and Sea Salt Caramel (under 5g net carbs).',
        btnText: '🛒 Unlock Keto Pack'
      },
      'Lactose Free': {
        icon: '🥛',
        title: 'Lactose-Free Collection (43 Recipes)',
        desc: '100% real dairy flavor without digestive distress, formulated with ultra-filtered Fairlife and lactase enzyme bases. Includes Vanilla Latte, Strawberry Cheesecake & Mocha Chip.',
        btnText: '🛒 Unlock Lactose Free Pack'
      },
      'No Protein': {
        icon: '💪',
        title: 'No Protein Powder Collection (83 Recipes)',
        desc: 'Pure, authentic ice cream parlor decadence made without any protein powders. Whole milk, pudding bases, and authentic churned texture for true dessert lovers.',
        btnText: '🛒 Unlock No Protein Pack'
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

  function openRecipePacksModal() {
    if (!recipePacksModalOverlay) return;
    updatePacksModalStatuses();
    recipePacksModalOverlay.classList.add('active');
    recipePacksModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeRecipePacksModal() {
    if (!recipePacksModalOverlay) return;
    recipePacksModalOverlay.classList.remove('active');
    recipePacksModalOverlay.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  function updatePacksModalStatuses() {
    if (!recipePacksModalOverlay) return;
    const packs = [
      { id: 'Fan Favorites', statusEl: 'statusPackFan' },
      { id: 'Keto', statusEl: 'statusPackKeto' },
      { id: 'Lactose Free', statusEl: 'statusPackLactose' },
      { id: 'No Protein', statusEl: 'statusPackNoProtein' },
      { id: 'All-Access', statusEl: 'statusPackAllAccess' }
    ];

    packs.forEach(p => {
      const el = document.getElementById(p.statusEl);
      const isUnlocked = isCategoryUnlocked(p.id);
      const card = recipePacksModalOverlay.querySelector(`.recipe-pack-card[data-pack="${p.id}"]`);
      const btn = card ? card.querySelector('.btn-action-pack') : null;

      if (el) {
        if (isUnlocked) {
          el.innerHTML = '<span class="pack-status-active">✅ In Your Library</span>';
        } else {
          el.innerHTML = '<span class="pack-status-available">🛍️ Available for Purchase</span>';
        }
      }
      if (btn) {
        if (isUnlocked) {
          btn.disabled = true;
          btn.innerHTML = '<span>✅ Active</span>';
          btn.style.opacity = '0.6';
          btn.style.cursor = 'default';
        } else {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
          btn.innerHTML = p.id === 'All-Access' ? '<span>👑 Unlock All-Access Bundle</span>' : `<span>🛒 Unlock ${p.id} Pack</span>`;
        }
      }
    });
  }

  async function handlePackPurchase(packName) {
    if (!currentUser) {
      closeRecipePacksModal();
      openGoogleAuthModal();
      showToast('🔑 Please sign in with Google to purchase recipe packs!');
      return;
    }
    showToast(`✉️ Purchase request for "${packName}" submitted! Admin notified for ${currentUser.email}.`);
    try {
      await fetch('/api/purchase-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          userId: currentUser.id,
          pack: packName,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn('Purchase inquiry send error:', e);
    }
  }

  function updateCategoryCounts() {
    const accessible = allRecipes.filter(r => isRecipeAccessible(r));

    const counts = {
      all: accessible.length,
      'Base Flavors': 0,
      'Fan Favorites': 0,
      'Keto': 0,
      'Lactose Free': 0,
      'No Protein': 0,
      favorites: favoritesState.size
    };

    accessible.forEach(r => {
      const cats = r.categories || (r.category ? [r.category] : []);
      cats.forEach(cat => {
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });
    });

    const elAll = document.getElementById('countAll');
    const elBase = document.getElementById('countBase');
    const elFan = document.getElementById('countFan');
    const elKeto = document.getElementById('countKeto');
    const elLactose = document.getElementById('countLactose');
    const elNoPro = document.getElementById('countNoProtein');
    const elFav = document.getElementById('countFavorites');
    const elCustom = document.getElementById('countCustom');
    const tabCustom = document.getElementById('tabCustomRecipes');

    if (elAll) elAll.textContent = counts.all;
    if (elBase) elBase.textContent = counts['Base Flavors'];
    if (elFan) elFan.textContent = counts['Fan Favorites'];
    if (elKeto) elKeto.textContent = counts['Keto'];
    if (elLactose) elLactose.textContent = counts['Lactose Free'];
    if (elNoPro) elNoPro.textContent = counts['No Protein'];
    if (elFav) elFav.textContent = counts.favorites;
    if (elCustom) elCustom.textContent = customRecipesState.length;
    if (tabCustom) {
      tabCustom.style.display = (currentUser && customRecipesState.length > 0) ? 'inline-flex' : 'none';
    }

    // Update lock indicators on category tabs
    const lockFan = document.getElementById('lockFan');
    const lockKeto = document.getElementById('lockKeto');
    const lockLactose = document.getElementById('lockLactose');
    const lockNoPro = document.getElementById('lockNoProtein');

    if (lockFan) lockFan.style.display = isCategoryUnlocked('Fan Favorites') ? 'none' : 'inline';
    if (lockKeto) lockKeto.style.display = isCategoryUnlocked('Keto') ? 'none' : 'inline';
    if (lockLactose) lockLactose.style.display = isCategoryUnlocked('Lactose Free') ? 'none' : 'inline';
    if (lockNoPro) lockNoPro.style.display = isCategoryUnlocked('No Protein') ? 'none' : 'inline';
  }

  function updateStats() {
    if (statPantryCount) statPantryCount.textContent = pantryState.size;
    if (pantryInStockCount) pantryInStockCount.textContent = `${pantryState.size} items in stock`;
    const tabRecipeCount = document.getElementById('mobileTabRecipeCount');
    const tabPantryCount = document.getElementById('mobileTabPantryCount');
    const navPantryBadge = document.getElementById('navPantryBadge');
    if (tabRecipeCount) tabRecipeCount.textContent = allRecipes.length;
    if (tabPantryCount) tabPantryCount.textContent = pantryState.size;
    if (navPantryBadge) {
      navPantryBadge.textContent = pantryState.size;
      navPantryBadge.style.display = pantryState.size > 0 ? 'inline-block' : 'none';
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

  // --- Freezer Inventory & 16-Hour Timer Engine (Roadmap Item 8) ---
  function computePintStatus(pint) {
    const now = Date.now();
    const frozenAt = pint.frozenAt || now;
    const elapsedMs = Math.max(0, now - frozenAt);
    const remainingMs = Math.max(0, FREEZE_DURATION_MS - elapsedMs);
    const isReady = remainingMs <= 0;
    const percent = Math.min(100, Math.max(0, Math.round((elapsedMs / FREEZE_DURATION_MS) * 100)));

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

    if (!freezeNotifsEnabled) return;

    const now = Date.now();
    const frozenAt = pint.frozenAt || now;
    const elapsedMs = Math.max(0, now - frozenAt);
    const remainingMs = Math.max(0, FREEZE_DURATION_MS - elapsedMs);

    if (remainingMs <= 0) {
      fireFreezeNotification(pint);
      return;
    }

    const timerId = setTimeout(() => {
      fireFreezeNotification(pint);
      pintNotifTimers.delete(pint.id);
    }, remainingMs);

    pintNotifTimers.set(pint.id, timerId);
  }

  function scheduleAllPendingPintAlerts() {
    if (!freezeNotifsEnabled) return;
    freezerPintsState.forEach(p => {
      if (!p.notified) {
        schedulePintFreezeAlert(p);
      }
    });
  }

  function checkAndNotifyReadyPints() {
    if (!freezeNotifsEnabled) return;
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
    saveFreezerPints();
    updateFreezerBadges();
    playAudioChime();
    triggerHaptic([250, 100, 250, 100, 250]);
    if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
      renderFreezerModal();
    }

    const isDeluxe = pint.scale === 1.5 || (pint.sizeLabel && pint.sizeLabel.includes('24 oz'));
    const sizeStr = isDeluxe ? '24 oz Deluxe' : '16 oz Standard';
    const title = `🍨 Ding! Ready to Spin: ${pint.recipeName}`;
    const body = `Your ${sizeStr} pint has chilled for 16 hours and is frozen solid! Tap to open spin instructions & log your batch.`;

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
        spinAndEnjoyFreezerPint(pintId);
      } else if (recipeId) {
        logRecipeBatch(recipeId, 1);
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

  function startFreezerTicker() {
    if (freezerTickerInterval) clearInterval(freezerTickerInterval);
    // Refresh countdown every 30 seconds and check for completed pints
    freezerTickerInterval = setInterval(() => {
      checkAndNotifyReadyPints();
      updateFreezerBadges();
      if (freezerModalOverlay && freezerModalOverlay.classList.contains('active')) {
        renderFreezerModal();
      }
    }, 30000);
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
      if (freezerRecipeNameInput) freezerRecipeNameInput.focus();
    }
  }

  async function addFreezerPint({ recipeId, recipeName, scale, notes, frozenAt, requestNotification }) {
    if (!recipeName || !recipeName.trim()) return;
    const finalFrozenAt = frozenAt || Date.now();
    const finalScale = scale || 1.0;

    let matchedRecipeId = recipeId;
    if (!matchedRecipeId) {
      const match = allRecipes.find(r => r.name.toLowerCase() === recipeName.trim().toLowerCase());
      if (match) matchedRecipeId = match.id;
    }

    const newPint = {
      id: `freezer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      recipeId: matchedRecipeId || null,
      recipeName: recipeName.trim(),
      scale: finalScale,
      sizeLabel: finalScale === 1.5 ? '24 oz Deluxe' : '16 oz Standard',
      frozenAt: finalFrozenAt,
      notes: (notes || '').trim(),
      notified: false
    };

    freezerPintsState.unshift(newPint);
    saveFreezerPints();
    renderFreezerModal();
    toggleFreezerAddForm(false);

    // Request notification permission if requested and currently default
    if (requestNotification && 'Notification' in window && Notification.permission === 'default') {
      await requestFreezeNotificationPermission(false);
    }

    const calc = computePintStatus(newPint);
    if (calc.isReady) {
      showToast(`🎉 "${newPint.recipeName}" logged as Ready to Spin! 🍨`);
    } else {
      if ('Notification' in window && Notification.permission === 'granted' && freezeNotifsEnabled) {
        schedulePintFreezeAlert(newPint);
        showToast(`🧊 Logged "${newPint.recipeName}" in freezer! 16h timer started (${calc.timeRemainingLabel}). Push alert scheduled! 🔔`);
      } else {
        showToast(`🧊 Logged "${newPint.recipeName}" in freezer! 16h timer started (${calc.timeRemainingLabel}).`);
      }
    }
  }

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

  function spinAndEnjoyFreezerPint(pintId) {
    const pint = freezerPintsState.find(p => p.id === pintId);
    if (!pint) return;

    if (pintNotifTimers.has(pintId)) {
      clearTimeout(pintNotifTimers.get(pintId));
      pintNotifTimers.delete(pintId);
    }

    // Log batch made count for recipe if linked
    if (pint.recipeId) {
      logRecipeBatch(pint.recipeId, 1);
    }

    // Remove from freezer
    freezerPintsState = freezerPintsState.filter(p => p.id !== pintId);
    saveFreezerPints();
    renderFreezerModal();

    showToast(`🍨 Spun & Enjoyed "${pint.recipeName}"! +1 Batch logged 🎉`);
  }

  function renderFreezerModal() {
    if (!freezerPintsList) return;
    updateFreezerBadges();
    updateFreezerNotifUI();

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

      return `
        <div class="freezer-pint-card ${status.isReady ? 'ready' : ''}" data-id="${pint.id}">
          <div class="freezer-card-top-row">
            <div class="freezer-pint-title-group">
              <div class="freezer-pint-title">${pint.recipeName}</div>
              <div class="freezer-meta-tags">
                <span class="freezer-tag ${isDeluxe ? 'size-deluxe' : 'size-standard'}">
                  ${isDeluxe ? '🥣 24 oz Deluxe' : '🍨 16 oz Standard'}
                </span>
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
    freezerPintsList.querySelectorAll('.freezer-pint-card').forEach(card => {
      const pintId = card.dataset.id;
      const pint = freezerPintsState.find(p => p.id === pintId);
      if (!pint) return;

      const spinBtn = card.querySelector('[data-action="spin"]');
      if (spinBtn) {
        spinBtn.addEventListener('click', () => spinAndEnjoyFreezerPint(pintId));
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
          spinTip: '1st spin Lite Ice Cream → add 1 tbsp splash of milk → 1 Respin for maximum velvet whip.',
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
          proTip: 'If the texture looks powdery like snow after the initial spin, add 1 tbsp of milk and hit Respin!'
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
          spinTip: 'Sorbet cycle. Add 1 tbsp lemon juice or almond milk for smooth cutting.',
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
          <div class="swap-focus-name">${cleanName}</div>
          <span class="swap-focus-category">${swapData.categoryLabel}</span>
        </div>
        <div class="swap-focus-role">${swapData.roleDescription}</div>
        ${activeSwap ? `
          <div class="swap-active-callout">
            <div><strong>Applied:</strong> Currently swapped with <em>${activeSwap.name}</em> (${activeSwap.ratio})</div>
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
  function openRecipeModal(recipe, isRoulettePick = false) {
    currentModalRecipe = recipe;
    isCurrentModalRoulette = Boolean(isRoulettePick);
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerRunning = false;
    timerSecondsLeft = 60;

    renderRecipeModalContent(recipe);

    recipeModalOverlay.classList.add('active');
    recipeModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function renderRecipeModalContent(recipe) {
    const match = computeRecipeMatch(recipe);
    const catClass = getCategoryClass(recipe.category);
    const isFav = favoritesState.has(recipe.id);
    const isAccessible = isRecipeAccessible(recipe);
    const requiredTier = getRecipeRequiredTier(recipe);

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

    const isPersonal = Boolean(recipe.isPersonal || (recipe.id && recipe.id.startsWith('custom_')));
    const pintsInFreezer = freezerPintsState.filter(p => p.recipeId === recipe.id || p.recipeName.toLowerCase() === recipe.name.toLowerCase());

    recipeModalBody.innerHTML = `
      ${isCurrentModalRoulette ? `
        <div class="roulette-winner-banner">
          <div class="roulette-winner-text">
            <span>🎰</span>
            <span>Creami Roulette Pick: <strong>${recipe.name}</strong></span>
          </div>
          <button class="btn-modal-spin-again" id="modalSpinAgainBtn">🎲 Spin Again</button>
        </div>
      ` : ''}

      <div class="modal-header">
        <div class="modal-meta-row">
          ${isPersonal ? `<span class="book-tag custom">🔒 Personal Recipe</span>` : (recipe.categories && recipe.categories.length > 0 ? recipe.categories : [recipe.category]).map(cat => {
            return `<span class="book-tag ${getCategoryClass(cat)}">${cat}</span>`;
          }).join('')}
          ${!isAccessible ? `<span class="locked-badge" title="Exclusive ${requiredTier} tier recipe pack">🔒 ${requiredTier} Pack</span>` : ''}
          ${recipe.creaminessScore ? `<span class="book-tag" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #34d399;">🧪 Creaminess: ${recipe.creaminessScore}/10 (${recipe.creaminessGrade || 'Balanced'})</span>` : ''}
          <span class="book-tag">🌀 ${recipe.spinSetting || 'Lite Ice Cream'}</span>
          <span class="book-tag">⏱️ Prep: ${recipe.prepTime || '2 min'}</span>
          <span class="book-tag">❄️ Freeze: ${recipe.freezeTime || '16+ hrs'}</span>
        </div>
        <h2 class="modal-title">${recipe.name}</h2>
        <p class="modal-subtitle">${isPersonal ? '🔒 Private personal recipe tied only to your Google account.' : 'Official Creami Cravings recipe for Ninja Creami ice cream maker.'}</p>
        ${(recipe.sources && recipe.sources.length > 1) ? `
          <div class="multi-book-banner">
            <span>📚</span>
            <span>Featured in <strong>${recipe.sources.length} Creami books:</strong> ${recipe.categories.join(' • ')}</span>
          </div>
        ` : ''}
      </div>

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

        <!-- Step-by-Step Instructions -->
        <h3 class="modal-section-title">📝 Instructions</h3>
        <div class="modal-instructions-list">
          ${(recipe.instructions && recipe.instructions.length > 0) ? recipe.instructions.map((step, idx) => {
            const isDefrostStep = step.toUpperCase().includes('HOT WATER') || step.toUpperCase().includes('WARM WATER');
            return `
              <div class="modal-step-item">
                <span class="step-num-badge">${idx + 1}</span>
                <div style="flex: 1;">
                  <span class="step-text">${step}</span>
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
                ${tipObj.title ? `<span class="protip-hack-title">${tipObj.title}</span>` : ''}
              </div>
              <div class="official-protip-text">${tipObj.body}</div>
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
          ${isAccessible ? `
            <button class="btn-freeze-pint-action" id="modalFreezeThisPintBtn" title="Log this recipe in your freezer and start the 16-hour countdown timer">
              🧊 Freeze This Pint
            </button>
          ` : ''}
          <button class="btn-secondary" id="modalFavBtn">
            ${isFav ? '💖 Favorited' : '🤍 Add to Favorites'}
          </button>
          ${isPersonal ? `
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
          spinAndEnjoyFreezerPint(pId);
          renderRecipeModalContent(recipe);
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

    // Favorite Button
    const modalFavBtn = recipeModalBody.querySelector('#modalFavBtn');
    if (modalFavBtn) {
      modalFavBtn.addEventListener('click', () => {
        toggleFavorite(recipe.id);
        const nowFav = favoritesState.has(recipe.id);
        modalFavBtn.innerHTML = nowFav ? '💖 Favorited' : '🤍 Add to Favorites';
      });
    }

    // Delete Personal Recipe Button
    const modalDeleteBtn = recipeModalBody.querySelector('#modalDeleteRecipeBtn');
    if (modalDeleteBtn) {
      modalDeleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to permanently delete "${recipe.name}" from your personal recipes?`)) {
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
                <span style="text-decoration: line-through; opacity: 0.55; font-size: 0.88em; margin-right: 6px;">${cleanName}</span>
                <span style="color: #c084fc; font-weight: 700;">🔄 ${activeSwap.name}</span>
              </div>
              <div class="ing-active-swap-pill">
                <span>Ratio: ${activeSwap.ratio}</span>
                <button type="button" class="btn-ing-revert-swap" data-ing-name="${cleanName}" title="Revert to original ingredient">Revert</button>
              </div>
              ${displayNotes ? `<div class="modal-ing-notes">${displayNotes}</div>` : ''}
            </div>
            <div class="modal-ing-amount-box" title="${modalScale > 1 ? 'Scaled Deluxe (1.5×) amount' : 'Standard amount'}">
              <span class="modal-ing-amount-label">${modalScale > 1 ? 'Deluxe Amt' : 'Amount'}</span>
              <span class="modal-ing-amount-val ${!amountText ? 'empty' : ''}">${amountText || 'As needed'}</span>
            </div>
          </div>
          <div class="modal-ing-actions">
            <button type="button" class="ing-swap-badge active-swap" data-ing-name="${cleanName}" title="Modify substitution">
              🔄 Swapped
            </button>
            <button type="button" class="modal-ing-shop-btn ${inShopList ? 'in-list' : ''}" data-name="${sanitizeShoppingItemName(activeSwap.name)}" title="${inShopList ? 'Remove from shopping list' : 'Add to shopping list'}">
              ${inShopList ? '✓ On List' : '🛒 + List'}
            </button>
            <button type="button" class="modal-ing-toggle-btn ${inPantry ? 'in-pantry' : ''}" data-id="${activeSwap.name}">
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
            <div class="modal-ing-name">${cleanName}</div>
            ${subText ? `<div class="ing-sub-chip" title="Click to explore substitutions">💡 Swap: ${formatSubText(subText)}</div>` : ''}
            ${displayNotes ? `<div class="modal-ing-notes">${displayNotes}</div>` : ''}
          </div>
          <div class="modal-ing-amount-box" title="${modalScale > 1 ? 'Scaled Deluxe (1.5×) amount' : 'Standard amount'}">
            <span class="modal-ing-amount-label">${modalScale > 1 ? 'Deluxe Amt' : 'Amount'}</span>
            <span class="modal-ing-amount-val ${!amountText ? 'empty' : ''}">${amountText || 'As needed'}</span>
          </div>
        </div>
        <div class="modal-ing-actions">
          ${(swapCount > 0 || subText) ? `
            <button type="button" class="ing-swap-badge" data-ing-name="${cleanName}" title="Explore ${swapCount || 1} tested substitutions for Ninja Creami">
              🔄 Swap ${swapCount > 0 ? `(${swapCount})` : ''}
            </button>
          ` : ''}
          <button type="button" class="modal-ing-shop-btn ${inShopList ? 'in-list' : ''}" data-name="${cleanName}" title="${inShopList ? 'Remove from shopping list' : 'Add to shopping list'}">
            ${inShopList ? '✓ On List' : '🛒 + List'}
          </button>
          <button type="button" class="modal-ing-toggle-btn ${inPantry ? 'in-pantry' : ''}" data-id="${ing.id}">
            ${inPantry ? '✓ In Pantry' : '+ In Stock'}
          </button>
        </div>
      </div>
    `;
  }

  function closeRecipeModal() {
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
    currentModalRecipe = null;
  }

  // --- Shopping List Modal ---
  function openShoppingListModal() {
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

    // Build Modal HTML
    let html = `
      <div class="shopping-quick-add-wrap">
        <div class="shopping-quick-add-input-box">
          <input type="text" id="shopQuickAddInput" class="shopping-quick-add-input" placeholder="Quick add grocery item (e.g. Fairlife 2% Milk)..." autocomplete="off" />
          <div id="shopQuickAddDropdown" class="shopping-autocomplete-dropdown" style="display: none;"></div>
        </div>
        <button type="button" id="shopQuickAddBtn" class="btn-xs btn-primary">+ Add</button>
      </div>
    `;

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
    shoppingModalOverlay.classList.remove('active');
    shoppingModalOverlay.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  function clearShoppingList() {
    if (manualShoppingList.size === 0) {
      showToast('Manual shopping list is already empty');
      return;
    }
    const count = manualShoppingList.size;
    manualShoppingList.clear();
    saveManualShoppingList();
    openShoppingListModal();
    showToast(`🗑️ Cleared ${count} manual item${count === 1 ? '' : 's'} from shopping list`);
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
    const categoryGroups = shoppingModalBody.querySelectorAll('.shopping-category-group');
    if (categoryGroups.length === 0) return null;

    let listText = '🛒 Creami Cravings Grocery List:\n';
    categoryGroups.forEach(grp => {
      const title = grp.querySelector('.shopping-cat-title')?.textContent || 'Groceries';
      const icon = grp.querySelector('.shopping-cat-icon')?.textContent || '🛒';
      const items = Array.from(grp.querySelectorAll('.shopping-item-name')).map(n => n.textContent.trim());
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
    selectedMixins: {}
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
    const liquid = BAP_DATA.liquids.find(l => l.id === bapState.selectedLiquid);
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

  function renderBapCard(item, isSelected, currentQty, onSelect, onQtyChange) {
    const card = document.createElement('div');
    card.className = `bap-card ${isSelected ? 'active' : ''}`;

    const macroText = item.per100 
      ? `${item.per100.kcal} kcal/100g • ${item.per100.p}g P` 
      : `${item.perServing.kcal} kcal • ${item.perServing.p}g P`;

    card.innerHTML = `
      <div class="bap-card-check">✓</div>
      <div>
        <div class="bap-card-icon">${item.icon}</div>
        <div class="bap-card-title">${item.name}</div>
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
      if (e.target.closest('.bap-stepper-btn')) return;
      onSelect(item);
    });

    const minusBtn = card.querySelector('.btn-minus');
    if (minusBtn) {
      minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newQty = Math.max(item.min, currentQty - item.step);
        onQtyChange(item, newQty);
      });
    }

    const plusBtn = card.querySelector('.btn-plus');
    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newQty = Math.min(item.max, currentQty + item.step);
        onQtyChange(item, newQty);
      });
    }

    return card;
  }

  function renderBapGrids() {
    const isDeluxe = bapState.size === '24';

    // 1. Liquids Grid
    const liquidsGrid = document.getElementById('bapGridLiquids');
    if (liquidsGrid) {
      liquidsGrid.innerHTML = '';
      BAP_DATA.liquids.forEach(liquid => {
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
          }
        );
        liquidsGrid.appendChild(card);
      });
    }

    // 2. Powders Grid
    const powdersGrid = document.getElementById('bapGridPowders');
    if (powdersGrid) {
      powdersGrid.innerHTML = '';
      BAP_DATA.powders.forEach(powder => {
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
          }
        );
        powdersGrid.appendChild(card);
      });
    }

    // 3. Stabilizers Grid
    const stabGrid = document.getElementById('bapGridStabilizers');
    if (stabGrid) {
      stabGrid.innerHTML = '';
      BAP_DATA.stabilizers.forEach(stab => {
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
          }
        );
        stabGrid.appendChild(card);
      });
    }

    // 4. Sweeteners Grid
    const sweetGrid = document.getElementById('bapGridSweeteners');
    if (sweetGrid) {
      sweetGrid.innerHTML = '';
      BAP_DATA.sweeteners.forEach(sw => {
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
          }
        );
        sweetGrid.appendChild(card);
      });
    }

    // 5. Mixins Grid
    const mixinsGrid = document.getElementById('bapGridMixins');
    if (mixinsGrid) {
      mixinsGrid.innerHTML = '';
      BAP_DATA.mixins.forEach(mix => {
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
          }
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

    // Liquid
    const liquid = BAP_DATA.liquids.find(l => l.id === bapState.selectedLiquid);
    if (liquid) {
      const factor = bapState.liquidQty / 100;
      totalKcal += liquid.per100.kcal * factor;
      totalProtein += liquid.per100.p * factor;
      totalCarbs += liquid.per100.c * factor;
      totalFat += liquid.per100.f * factor;

      fatScore += (liquid.fatScore || 0);
      stabilizerScore += (liquid.stabilizerScore || 0);
      caseinScore += (liquid.caseinScore || 0);
    }

    // Powders
    Object.entries(bapState.selectedPowders).forEach(([id, qty]) => {
      const p = BAP_DATA.powders.find(x => x.id === id);
      if (p && qty > 0) {
        const factor = qty / p.serving;
        totalKcal += p.perServing.kcal * factor;
        totalProtein += p.perServing.p * factor;
        totalCarbs += p.perServing.c * factor;
        totalFat += p.perServing.f * factor;

        caseinScore += (p.caseinScore || 0);
      }
    });

    // Stabilizers
    Object.entries(bapState.selectedStabilizers).forEach(([id, qty]) => {
      const s = BAP_DATA.stabilizers.find(x => x.id === id);
      if (s && qty > 0) {
        const factor = qty / s.serving;
        totalKcal += s.perServing.kcal * factor;
        totalProtein += s.perServing.p * factor;
        totalCarbs += s.perServing.c * factor;
        totalFat += s.perServing.f * factor;

        stabilizerScore += (s.stabilizerScore || 0);
      }
    });

    // Sweeteners
    Object.entries(bapState.selectedSweeteners).forEach(([id, qty]) => {
      const sw = BAP_DATA.sweeteners.find(x => x.id === id);
      if (sw && qty > 0) {
        const factor = qty / sw.serving;
        totalKcal += sw.perServing.kcal * factor;
        totalProtein += sw.perServing.p * factor;
        totalCarbs += sw.perServing.c * factor;
        totalFat += sw.perServing.f * factor;

        freezingScore += (sw.freezingScore || 0);
      }
    });

    // Mixins
    Object.entries(bapState.selectedMixins).forEach(([id, qty]) => {
      const m = BAP_DATA.mixins.find(x => x.id === id);
      if (m && qty > 0) {
        const factor = qty / m.serving;
        totalKcal += m.perServing.kcal * factor;
        totalProtein += m.perServing.p * factor;
        totalCarbs += m.perServing.c * factor;
        totalFat += m.perServing.f * factor;
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
    const liquid = BAP_DATA.liquids.find(l => l.id === bapState.selectedLiquid);
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
    const liquidObj = BAP_DATA.liquids.find(l => l.id === bapState.selectedLiquid) || BAP_DATA.liquids[0];

    const parsedIngredients = [];
    parsedIngredients.push({
      id: liquidObj.id,
      name: liquidObj.name,
      quantity: `${bapState.liquidQty}g`,
      unit: 'g',
      raw: `${bapState.liquidQty}g ${liquidObj.name}`,
      section: 'Base',
      isMixin: false,
      notes: ''
    });

    Object.entries(bapState.selectedPowders).forEach(([id, qty]) => {
      const p = BAP_DATA.powders.find(x => x.id === id);
      if (p && qty > 0) {
        parsedIngredients.push({
          id: p.id,
          name: p.name,
          quantity: `${qty}g`,
          unit: 'g',
          raw: `${qty}g ${p.name}`,
          section: 'Base',
          isMixin: false,
          notes: ''
        });
      }
    });

    Object.entries(bapState.selectedStabilizers).forEach(([id, qty]) => {
      const s = BAP_DATA.stabilizers.find(x => x.id === id);
      if (s && qty > 0) {
        parsedIngredients.push({
          id: s.id,
          name: s.name,
          quantity: `${qty}${s.unit}`,
          unit: s.unit,
          raw: `${qty}${s.unit} ${s.name}`,
          section: 'Base',
          isMixin: false,
          notes: ''
        });
      }
    });

    Object.entries(bapState.selectedSweeteners).forEach(([id, qty]) => {
      const sw = BAP_DATA.sweeteners.find(x => x.id === id);
      if (sw && qty > 0) {
        parsedIngredients.push({
          id: sw.id,
          name: sw.name,
          quantity: `${qty}${sw.unit}`,
          unit: sw.unit,
          raw: `${qty}${sw.unit} ${sw.name}`,
          section: 'Base',
          isMixin: false,
          notes: ''
        });
      }
    });

    Object.entries(bapState.selectedMixins).forEach(([id, qty]) => {
      const m = BAP_DATA.mixins.find(x => x.id === id);
      if (m && qty > 0) {
        parsedIngredients.push({
          id: m.id,
          name: m.name,
          quantity: `${qty}g`,
          unit: 'g',
          raw: `${qty}g ${m.name} (Mix-in)`,
          section: 'Mix-in',
          isMixin: true,
          notes: ''
        });
      }
    });

    const powderNames = Object.keys(bapState.selectedPowders).map(id => BAP_DATA.powders.find(p => p.id === id)?.name).filter(Boolean);
    const stabilizerNames = Object.keys(bapState.selectedStabilizers).map(id => BAP_DATA.stabilizers.find(s => s.id === id)?.name).filter(Boolean);
    const mixinNames = Object.keys(bapState.selectedMixins).map(id => BAP_DATA.mixins.find(m => m.id === id)?.name).filter(Boolean);

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

    const newRecipe = {
      id: `custom_${currentUser.id}_${Date.now()}`,
      name: title,
      category: 'Custom',
      categories: ['Custom'],
      userId: currentUser.id,
      isPersonal: true,
      sourceFile: 'Personal Custom',
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
    saveCustomRecipes();
    closeCustomRecipeModal();
    updateAuthUI();
    renderRecipes();
    showToast(`🧪 Saved balanced recipe "${title}" with Creaminess Score ${nutrition.creaminessScore}/10!`);
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

      // Auto-name & Save buttons
      const btnAutoName = document.getElementById('bapBtnAutoName');
      const btnSave = document.getElementById('bapBtnSave');
      if (btnAutoName) btnAutoName.addEventListener('click', autoNameBapRecipe);
      if (btnSave) btnSave.addEventListener('click', saveBapRecipe);
    }

    setBapMode('wizard');
    switchBapStep(1);
    renderBapGrids();
    updateBapHUD();
  }

  function openCustomRecipeModal() {
    if (customRecipeForm) customRecipeForm.reset();
    initBuildAPint();
    customRecipeModalOverlay.classList.add('active');
    customRecipeModalOverlay.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();
  }

  function closeCustomRecipeModal() {
    customRecipeModalOverlay.classList.remove('active');
    customRecipeModalOverlay.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  function handleCustomRecipeSubmit(e) {
    e.preventDefault();
    if (!currentUser) {
      showToast('🔒 Please sign in with Google to save personal recipes.');
      openGoogleAuthModal();
      return;
    }
    const name = document.getElementById('crName').value.trim();
    const category = document.getElementById('crCategory').value;
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
      let masterMatch = null;
      if (typeof INGREDIENTS_MASTER !== 'undefined' && Array.isArray(INGREDIENTS_MASTER)) {
        masterMatch = INGREDIENTS_MASTER.find(i => i.name.toLowerCase() === cleanLine.toLowerCase());
      }
      const slugId = masterMatch ? masterMatch.id : cleanLine.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      return {
        id: slugId,
        name: masterMatch ? masterMatch.name : cleanLine,
        quantity: '',
        unit: '',
        raw: line.trim(),
        section: isMixin ? 'Mix-in' : 'Base',
        isMixin: isMixin,
        notes: ''
      };
    }).filter(i => i.name.length > 0);

    const parsedInst = instructionsRaw.map(l => l.trim()).filter(l => l.length > 0);

    const newRecipe = {
      id: `custom_${currentUser.id}_${Date.now()}`,
      name: name,
      category: 'Custom',
      categories: ['Custom'],
      userId: currentUser.id,
      isPersonal: true,
      sourceFile: 'Personal Custom',
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
    saveCustomRecipes();
    closeCustomRecipeModal();
    updateAuthUI();
    renderRecipes();
    showToast(`✨ Saved personal recipe "${name}" to your Google account!`);
  }

  function deleteCustomRecipe(recipeId) {
    if (!currentUser) return;
    customRecipesState = customRecipesState.filter(r => r.id !== recipeId);
    saveCustomRecipes();
    closeRecipeModal();
    updateAuthUI();
    showToast('🗑️ Personal custom recipe deleted.');
  }

  // --- Theme Toggle ---
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    updateThemeUI();
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
  const ALL_CATEGORY_SUBSCRIPTIONS = ['All-Access', 'Base Flavors', 'Fan Favorites', 'No Protein', 'Keto', 'Lactose Free'];

  function openAdminPortal() {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('⚠️ Admin privileges required to access the Admin Portal.');
      return;
    }
    if (adminModalOverlay) {
      adminModalOverlay.classList.add('active');
      adminModalOverlay.setAttribute('aria-hidden', 'false');
      lockBackgroundScroll();
      fetchAdminUsers();
    }
  }

  function closeAdminPortal() {
    if (adminModalOverlay) {
      adminModalOverlay.classList.remove('active');
      adminModalOverlay.setAttribute('aria-hidden', 'true');
      unlockBackgroundScroll();
    }
  }

  async function fetchAdminUsers() {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (adminUsersList) {
      adminUsersList.innerHTML = `<div style="text-align: center; padding: 36px 20px; color: var(--text-dim);">Loading user directory...</div>`;
    }

    try {
      const res = await fetch('/api/admin/users', {
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

  function updateAdminStats() {
    if (adminTotalUsers) adminTotalUsers.textContent = adminUsersState.length;
    const adminCount = adminUsersState.filter(u => u.role === 'admin').length;
    if (adminTotalAdmins) adminTotalAdmins.textContent = adminCount;
    const allAccessCount = adminUsersState.filter(u => Array.isArray(u.subscriptions) && u.subscriptions.includes('All-Access')).length;
    if (adminTotalAllAccess) adminTotalAllAccess.textContent = allAccessCount;
  }

  function renderAdminUsers() {
    if (!adminUsersList) return;

    const q = (adminSearchQuery || '').toLowerCase().trim();
    const roleFilter = adminFilterRole || 'all';

    const filtered = adminUsersState.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (q) {
        const nameMatch = (u.name || u.username || '').toLowerCase().includes(q);
        const emailMatch = (u.email || '').toLowerCase().includes(q);
        const roleMatch = (u.role || '').toLowerCase().includes(q);
        const subMatch = (u.subscriptions || []).some(s => s.toLowerCase().includes(q));
        if (!nameMatch && !emailMatch && !roleMatch && !subMatch) return false;
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

    adminUsersList.innerHTML = filtered.map(u => {
      const ADMIN_ROOTS = ['admin@creamicravings.com', 'ahumpo7@gmail.com', 'ahumpo@gmail.com', 'andrew@gmail.com'];
      const userEmail = (u.email || '').toLowerCase();
      const isRootAdmin = ADMIN_ROOTS.includes(userEmail);
      const isCurrentAdmin = (currentUser && currentUser.email && currentUser.email.toLowerCase() === userEmail);
      const subs = Array.isArray(u.subscriptions) ? u.subscriptions : ['Base Flavors'];
      const hasAllAccess = subs.includes('All-Access');
      const avatarUrl = u.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.username || 'User')}&background=059669&color=fff&bold=true`;
      
      const createdDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A';
      const lastActiveDate = u.last_active ? new Date(u.last_active).toLocaleDateString() : 'Active';

      return `
        <div class="admin-user-card" data-user-id="${u.id}" data-user-email="${u.email}">
          <div class="admin-user-top">
            <div class="admin-user-info-cluster">
              <img src="${avatarUrl}" alt="${u.name || 'User'}" class="admin-user-avatar" onerror="this.src='https://ui-avatars.com/api/?name=U&background=059669&color=fff'">
              <div>
                <div class="admin-user-name-row">
                  <span class="admin-user-name">${u.name || u.username || 'Unnamed User'}</span>
                  <span class="admin-user-badge ${u.role}">${u.role === 'admin' ? '👑 Admin' : '👤 Standard'}</span>
                  ${isCurrentAdmin ? `<span class="badge" style="font-size: 0.68rem; background: rgba(5, 150, 105, 0.2); color: #34d399; padding: 2px 6px; border-radius: 4px; font-weight: 700;">You</span>` : ''}
                </div>
                <div class="admin-user-email">${u.email || 'No email attached'}</div>
              </div>
            </div>

            <div class="admin-user-actions">
              <button class="btn-role-toggle" data-user-id="${u.id}" data-current-role="${u.role}" ${isRootAdmin ? 'disabled title="Root administrator cannot be demoted"' : `title="Toggle role between Admin and Standard User"`}>
                ${u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
              </button>
              ${(!isRootAdmin && !isCurrentAdmin) ? `
                <button class="btn-admin-del-user" data-user-id="${u.id}" data-user-email="${u.email}" title="Delete user account">
                  🗑️
                </button>
              ` : ''}
            </div>
          </div>

          <div class="admin-user-stats-strip">
            <span>📅 Joined: <strong>${createdDate}</strong></span>
            <span>⚡ Last Active: <strong>${lastActiveDate}</strong></span>
            <span>📦 Pantry: <strong>${u.pantryCount || 0}</strong></span>
            <span>💖 Favs: <strong>${u.favoritesCount || 0}</strong></span>
            <span>🍨 Spins: <strong>${u.madeTotal || 0}</strong></span>
            <span>🧑‍🍳 Custom: <strong>${u.customCount || 0}</strong></span>
          </div>

          <div class="admin-subs-section">
            <div class="admin-subs-title">📦 Category Pack Subscriptions:</div>
            <div class="admin-subs-chips-wrap">
              ${ALL_CATEGORY_SUBSCRIPTIONS.map(subName => {
                const isActive = hasAllAccess || subs.includes(subName);
                const isAllAccessChip = (subName === 'All-Access');
                return `
                  <button type="button" 
                    class="btn-sub-chip ${isActive ? 'active' : ''} ${isAllAccessChip ? 'all-access' : ''}" 
                    data-user-id="${u.id}" 
                    data-sub="${subName}"
                    title="${isActive ? 'Click to revoke ' + subName : 'Click to grant ' + subName}">
                    ${isAllAccessChip ? '👑' : ''} ${subName} ${isActive ? '✓' : '+'}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindAdminUserCardEvents();
  }

  function bindAdminUserCardEvents() {
    if (!adminUsersList) return;

    // Role Toggle Buttons
    adminUsersList.querySelectorAll('.btn-role-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const currentRole = btn.dataset.currentRole;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;

        if (!confirm(`Are you sure you want to change ${user.name || user.email}'s role to "${newRole.toUpperCase()}"?`)) {
          return;
        }

        await updateUserPermissions(user.id, user.email, user.subscriptions || ['Base Flavors'], newRole);
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

    // Subscription Chip Toggles
    adminUsersList.querySelectorAll('.btn-sub-chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        const userId = chip.dataset.userId;
        const subName = chip.dataset.sub;
        const user = adminUsersState.find(u => u.id === userId);
        if (!user) return;

        let curSubs = Array.isArray(user.subscriptions) ? [...user.subscriptions] : ['Base Flavors'];

        if (subName === 'All-Access') {
          if (curSubs.includes('All-Access')) {
            // Turn off All-Access, reset to Base Flavors
            curSubs = ['Base Flavors'];
          } else {
            // Grant All-Access
            curSubs = [...ALL_CATEGORY_SUBSCRIPTIONS];
          }
        } else {
          // Individual category pack toggle
          if (curSubs.includes(subName)) {
            // Prevent removing Base Flavors if it's the only one
            if (subName === 'Base Flavors' && curSubs.length === 1) {
              showToast('Base Flavors is the universal starter pack and cannot be removed.');
              return;
            }
            curSubs = curSubs.filter(s => s !== subName && s !== 'All-Access');
          } else {
            curSubs.push(subName);
            // If all individual packs are active, enable All-Access as well
            const nonAll = ALL_CATEGORY_SUBSCRIPTIONS.filter(s => s !== 'All-Access');
            if (nonAll.every(s => curSubs.includes(s))) {
              curSubs.push('All-Access');
            }
          }
        }

        await updateUserPermissions(user.id, user.email, curSubs, user.role);
      });
    });
  }

  async function updateUserPermissions(userId, email, newSubs, newRole) {
    try {
      showToast('Updating permissions...');
      const res = await fetch('/api/admin/user/permissions', {
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
          subscriptions: newSubs,
          role: newRole
        })
      });

      const data = await res.json();
      if (res.ok && (data.status === 'ok' || data.success)) {
        showToast('✅ Permissions updated successfully!');
        // Update local state
        const idx = adminUsersState.findIndex(u => u.id === userId || (email && u.email === email));
        if (idx !== -1) {
          adminUsersState[idx].subscriptions = newSubs;
          adminUsersState[idx].role = newRole;
        }

        // If updating the currently signed in user, refresh their session
        if (currentUser && (currentUser.id === userId || (email && currentUser.email === email))) {
          currentUser.subscriptions = newSubs;
          currentUser.role = newRole;
          saveUserAuth();
          updateAuthUI();
          renderRecipes();
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

  // --- Event Bindings ---
  function bindEvents() {
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
        INGREDIENTS_MASTER.forEach(i => pantryState.add(i.id));
        savePantry();
        updatePantryCheckboxVisuals();
        renderRecipes();
        showToast('✓ All pantry items checked');
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        pantryState.clear();
        savePantry();
        updatePantryCheckboxVisuals();
        renderRecipes();
        showToast('Cleared pantry');
      });
    }

    // Presets
    document.querySelectorAll('.preset-chips .chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        const presetItems = PANTRY_PRESETS[presetKey] || [];
        presetItems.forEach(id => pantryState.add(id));
        savePantry();
        updatePantryCheckboxVisuals();
        renderRecipes();
        showToast(`⚡ Added ${presetItems.length} items from ${btn.textContent.trim()}`);
      });
    });

    // Recipe Search
    if (recipeSearch) {
      recipeSearch.addEventListener('input', (e) => {
        recipeSearchQuery = e.target.value;
        if (clearRecipeSearchBtn) {
          clearRecipeSearchBtn.style.display = recipeSearchQuery ? 'block' : 'none';
        }
        renderRecipes();
      });
    }

    if (clearRecipeSearchBtn) {
      clearRecipeSearchBtn.addEventListener('click', () => {
        recipeSearch.value = '';
        recipeSearchQuery = '';
        clearRecipeSearchBtn.style.display = 'none';
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
        categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.category;
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

    // Quick Nutrition & Macro Filter Chips
    const quickFilterChipsBar = document.getElementById('quickFilterChipsBar');
    if (quickFilterChipsBar) {
      quickFilterChipsBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn || btn.id === 'toggleMacroSlidersBtn') return;
        quickFilterChipsBar.querySelectorAll('.filter-chip').forEach(b => {
          if (b.id !== 'toggleMacroSlidersBtn') b.classList.remove('active');
        });
        btn.classList.add('active');
        activeQuickFilter = btn.dataset.filter;
        renderRecipes();
      });
    }

    // Reset Filters in Empty State
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        if (recipeSearch) recipeSearch.value = '';
        recipeSearchQuery = '';
        if (readyOnlyToggle) readyOnlyToggle.checked = false;
        readyOnlyFilter = false;
        if (baseOnlyToggle) baseOnlyToggle.checked = false;
        baseOnlyFilter = false;
        activeCategory = 'all';
        activeQuickFilter = 'all';

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

        if (quickFilterChipsBar) {
          quickFilterChipsBar.querySelectorAll('.filter-chip').forEach(b => {
            if (b.id !== 'toggleMacroSlidersBtn') b.classList.remove('active');
          });
          const allChip = quickFilterChipsBar.querySelector('[data-filter="all"]');
          if (allChip) allChip.classList.add('active');
        }
        if (categoryTabs) {
          categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          const allBtn = categoryTabs.querySelector('[data-category="all"]');
          if (allBtn) allBtn.classList.add('active');
        }
        renderRecipes();
      });
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

    // Freezer Tracker Modal & Add Form (Roadmap Item 8)
    if (openFreezerTrackerBtn) openFreezerTrackerBtn.addEventListener('click', openFreezerModal);
    if (freezerModalCloseBtn) freezerModalCloseBtn.addEventListener('click', closeFreezerModal);
    if (freezerModalOverlay) {
      freezerModalOverlay.addEventListener('click', (e) => {
        if (e.target === freezerModalOverlay) closeFreezerModal();
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

    if (freezerAddForm) {
      freezerAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (freezerRecipeNameInput ? freezerRecipeNameInput.value : '').trim();
        if (!name) return;
        const scale = parseFloat(freezerPintScale ? freezerPintScale.value : '1.0') || 1.0;
        const notes = (freezerNotes ? freezerNotes.value : '').trim();

        let frozenAt = Date.now();
        if (freezerCustomTime && freezerCustomTime.value) {
          const parsed = new Date(freezerCustomTime.value).getTime();
          if (!isNaN(parsed)) frozenAt = parsed;
        } else if (freezerSelectedTimeOffset > 0) {
          frozenAt = Date.now() - (freezerSelectedTimeOffset * 3600 * 1000);
        }

        const reqNotif = freezerNotifyOnReady ? freezerNotifyOnReady.checked : true;

        addFreezerPint({
          recipeName: name,
          scale: scale,
          notes: notes,
          frozenAt: frozenAt,
          requestNotification: reqNotif
        });

        freezerAddForm.reset();
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
        closeSwapInspector();
        closeRecipeModal();
        closeRouletteModal();
        closeShoppingListModal();
        closeFreezerModal();
        closeCustomRecipeModal();
        closeGoogleAuthModal();
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

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        setMobileView(activeMobileView);
      }
    });

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

    if (adminUserSearchInput) {
      adminUserSearchInput.addEventListener('input', (e) => {
        adminSearchQuery = e.target.value;
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
        renderAdminUsers();
      });
    }

    if (btnAvailablePacksBadge) {
      btnAvailablePacksBadge.addEventListener('click', openRecipePacksModal);
    }
    if (btnBrowsePacksBanner) {
      btnBrowsePacksBanner.addEventListener('click', openRecipePacksModal);
    }
    if (btnViewAllPacksFromCategory) {
      btnViewAllPacksFromCategory.addEventListener('click', openRecipePacksModal);
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
    if (recipePacksModalOverlay) {
      recipePacksModalOverlay.addEventListener('click', (e) => {
        if (e.target === recipePacksModalOverlay) closeRecipePacksModal();
      });
      recipePacksModalOverlay.querySelectorAll('.btn-action-pack').forEach(btn => {
        btn.addEventListener('click', () => {
          const pack = btn.dataset.pack;
          if (pack) handlePackPurchase(pack);
        });
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

    // Initialize PWA Offline Engine & Service Worker
    initPWA();
  }

  // --- Service Worker & PWA Offline Engine (Roadmap Item 11 & 17) ---
  function initPWA() {
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
      if (currentUser && typeof syncUserDataWithServer === 'function') {
        syncUserDataWithServer();
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
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function initPwaInstall() {
    const btnInstall = document.getElementById('btnInstallPwa');
    const footerInstall = document.getElementById('footerInstallBtn');
    const iosModal = document.getElementById('iosInstallModalOverlay');
    const iosClose = document.getElementById('iosInstallModalCloseBtn');
    const iosDismiss = document.getElementById('btnDismissIosInstall');

    if (isStandalone) {
      if (btnInstall) btnInstall.style.display = 'none';
      if (footerInstall) footerInstall.style.display = 'none';
      return;
    }

    if (isIosDevice) {
      if (btnInstall) btnInstall.style.display = 'inline-flex';
    }

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

    function handleInstallTrigger() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult && choiceResult.outcome === 'accepted') {
            showToast('Installing Creami Cravings...');
          }
          deferredPrompt = null;
          if (btnInstall) btnInstall.style.display = 'none';
        });
      } else if (isIosDevice) {
        if (iosModal) {
          iosModal.classList.add('active');
          iosModal.setAttribute('aria-hidden', 'false');
          lockBackgroundScroll();
        }
      } else {
        showToast('💡 Creami Cravings is installable! Click the install/download icon in your browser URL bar.');
      }
    }

    if (btnInstall) {
      btnInstall.addEventListener('click', handleInstallTrigger);
    }
    if (footerInstall) {
      footerInstall.addEventListener('click', handleInstallTrigger);
    }
    if (iosClose) {
      iosClose.addEventListener('click', () => {
        if (iosModal) {
          iosModal.classList.remove('active');
          iosModal.setAttribute('aria-hidden', 'true');
          unlockBackgroundScroll();
        }
      });
    }
    if (iosDismiss) {
      iosDismiss.addEventListener('click', () => {
        if (iosModal) {
          iosModal.classList.remove('active');
          iosModal.setAttribute('aria-hidden', 'true');
          unlockBackgroundScroll();
        }
      });
    }
    if (iosModal) {
      iosModal.addEventListener('click', (e) => {
        if (e.target === iosModal) {
          iosModal.classList.remove('active');
          iosModal.setAttribute('aria-hidden', 'true');
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

    localStorage.removeItem(PANTRY_STORAGE_KEY);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_RECIPES_STORAGE_KEY);
    localStorage.removeItem(FREEZER_STORAGE_KEY);
    localStorage.removeItem(USER_RECIPE_DATA_KEY);
    localStorage.removeItem(RECIPE_MADE_STORAGE_KEY);
    localStorage.removeItem(MANUAL_SHOPPING_STORAGE_KEY);

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
    renderRecipes();
    updateFreezerBadges();
    updateShoppingListBadge();
    triggerCloudSync();

    closeBackupModal();
    showToast('Kitchen data reset to factory defaults.');
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

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
