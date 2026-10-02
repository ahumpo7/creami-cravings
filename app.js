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
    totalBatches: 539,
    totalSpins: 539,
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
  
  const shoppingModalOverlay = document.getElementById('shoppingModalOverlay');
  const shoppingModalBody = document.getElementById('shoppingModalBody') || document.getElementById('shoppingListBody');
  const shoppingModalCloseBtn = document.getElementById('shoppingModalCloseBtn');
  const openShoppingListBtn = document.getElementById('openShoppingListBtn');
  const shoppingListBadge = document.getElementById('shoppingListBadge');
  const copyShoppingListBtn = document.getElementById('copyShoppingListBtn');
  const printShoppingListBtn = document.getElementById('printShoppingListBtn');
  
  const customRecipeModalOverlay = document.getElementById('customRecipeModalOverlay');
  const customModalCloseBtn = document.getElementById('customModalCloseBtn');
  const addCustomRecipeBtn = document.getElementById('addCustomRecipeBtn');
  const cancelCustomRecipeBtn = document.getElementById('cancelCustomRecipeBtn');
  const customRecipeForm = document.getElementById('customRecipeForm');
  
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleLabel = document.getElementById('themeToggleLabel');
  const toastContainer = document.getElementById('toastContainer');

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
    renderRecipes();
    fetchCommunityStats();
    initGoogleAuth();
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
        manualShoppingList = new Set(JSON.parse(savedShop));
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
          totalBatches: parsed.totalBatches || 539,
          totalSpins: parsed.totalSpins || 539,
          totalUsers: parsed.totalUsers || 1
        };
      } catch (e) {
        // default remains
      }
    }
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
            shoppingList: Array.from(manualShoppingList)
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
            totalBatches: data.totalBatches || 539,
            totalSpins: data.totalSpins || 539,
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
      el.textContent = (communityStats.totalBatches || 539).toLocaleString();
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
    currentUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      picture: data.user.picture,
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
      data.user.shoppingList.forEach(item => manualShoppingList.add(item));
      saveManualShoppingList();
    }

    closeGoogleAuthModal();
    updateAuthUI();
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
    } else {
      if (signInBtn) signInBtn.style.display = 'inline-flex';
      if (profileWidget) profileWidget.style.display = 'none';
      // Hide + Custom Recipe button when signed out
      if (customActions) customActions.style.display = 'none';
      if (customTab) customTab.style.display = 'none';
    }
  }

  function openGoogleAuthModal() {
    const modal = document.getElementById('googleAuthModalOverlay');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      initGoogleAuth();
    }
  }

  function closeGoogleAuthModal() {
    const modal = document.getElementById('googleAuthModalOverlay');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
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

    // Optimistic community update
    const currentComm = communityStats.madeCounts[recipeId] || 0;
    communityStats.madeCounts[recipeId] = Math.max(0, currentComm + delta);
    communityStats.totalBatches = Math.max(0, (communityStats.totalBatches || 539) + delta);
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
    const rInfo = communityStats.ratings[recipeId] || { avg: 4.8, count: 5, distribution: { 5: 4, 4: 1, 3: 0, 2: 0, 1: 0 } };
    const overallScoreBadge = document.getElementById('modalOverallScoreBadge');
    const bigScore = document.getElementById('modalCommBigScore');
    const totalReviews = document.getElementById('modalCommTotalReviews');

    if (overallScoreBadge) overallScoreBadge.textContent = `★ ${rInfo.avg.toFixed(1)} / 5.0`;
    if (bigScore) bigScore.textContent = rInfo.avg.toFixed(1);
    if (totalReviews) totalReviews.textContent = `${rInfo.count} rating${rInfo.count === 1 ? '' : 's'}`;
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

      groupEl.innerHTML = `
        <div class="category-header">
          <div class="category-header-title">
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
      const hasItem = pantryState.has(ing.id);
      if (ing.isMixin) {
        // mixin
      } else {
        baseTotal++;
        if (hasItem) baseInPantry++;
      }

      if (hasItem) {
        inPantryCount++;
      } else {
        missing.push(ing);
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

    recipeGrid.innerHTML = '';

    const q = recipeSearchQuery.toLowerCase().trim();
    let readyCount = 0;
    let baseReadyCount = 0;

    // Filter and score recipes
    const scoredRecipes = allRecipes.map(recipe => {
      const match = computeRecipeMatch(recipe);
      if (match.isReady) readyCount++;
      if (match.isBaseReady) baseReadyCount++;
      return { recipe, match };
    });

    // Update Dashboard Stats
    statTotalRecipes.textContent = allRecipes.length;
    statReadyRecipes.textContent = readyCount;
    statBaseReadyRecipes.textContent = baseReadyCount;

    // Apply active category and filter toggles
    let filtered = scoredRecipes.filter(({ recipe, match }) => {
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
      } else if (activeQuickFilter === 'my_rated') {
        if (!userRecipeData[recipe.id] || !userRecipeData[recipe.id].rating) return false;
      } else if (activeQuickFilter === 'pro_tips') {
        if (!recipe.proTip) return false;
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
        const rateA = communityStats.ratings[a.recipe.id]?.avg ?? (4.5 + (Math.abs(hashString(a.recipe.id)) % 5) * 0.1);
        const rateB = communityStats.ratings[b.recipe.id]?.avg ?? (4.5 + (Math.abs(hashString(b.recipe.id)) % 5) * 0.1);
        if (rateB !== rateA) return rateB - rateA;
        return a.recipe.name.localeCompare(b.recipe.name);
      } else if (sortBy === 'community_made_desc') {
        const commA = communityStats.madeCounts[a.recipe.id] ?? (12 + (Math.abs(hashString(a.recipe.id)) % 30));
        const commB = communityStats.madeCounts[b.recipe.id] ?? (12 + (Math.abs(hashString(b.recipe.id)) % 30));
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

    // Update Results Summary
    resultsSummary.textContent = `Showing ${filtered.length} of ${allRecipes.length} recipes`;
    if (readyOnlyFilter) {
      activePantryHint.textContent = `• Filtered by 100% Ready to Make`;
    } else if (baseOnlyFilter) {
      activePantryHint.textContent = `• Filtered by Base Ready to Freeze`;
    } else if (activeQuickFilter === 'high_protein') {
      activePantryHint.textContent = `• Filtered by High Protein (≥35g)`;
    } else if (activeQuickFilter === 'low_cal') {
      activePantryHint.textContent = `• Filtered by Low Calorie (<200 cal)`;
    } else if (activeQuickFilter === 'low_carb') {
      activePantryHint.textContent = `• Filtered by Low Carb (≤10g)`;
    } else if (activeQuickFilter === 'my_rated') {
      activePantryHint.textContent = `• Showing My Rated Recipes`;
    } else if (activeQuickFilter === 'pro_tips') {
      activePantryHint.textContent = `• Filtered by Official Author Pro Tips (${filtered.length} recipes)`;
    } else {
      activePantryHint.textContent = ``;
    }

    updateCategoryCounts();
    updateShoppingListBadge();

    // Render Cards or Empty State
    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      recipeGrid.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    recipeGrid.style.display = 'grid';

    filtered.forEach(({ recipe, match }) => {
      const card = createRecipeCard(recipe, match);
      recipeGrid.appendChild(card);
    });
  }

  function createRecipeCard(recipe, match) {
    const card = document.createElement('div');
    card.className = `recipe-card ${match.isReady ? 'ready-to-make' : ''}`;
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
    const commAvg = commRating ? commRating.avg : (4.5 + (Math.abs(hashString(recipe.id)) % 5) * 0.1);
    const commCount = commRating ? commRating.count : (3 + (Math.abs(hashString(recipe.id)) % 8));
    const userFeedback = userRecipeData[recipe.id] || {};
    const userMade = recipeMadeCounts[recipe.id] || 0;
    const commMade = communityStats.madeCounts[recipe.id] ?? (12 + (Math.abs(hashString(recipe.id)) % 30));

    card.innerHTML = `
      <div>
        <div class="recipe-card-top">
          <div class="card-book-tags">
            ${isPersonal ? `<span class="book-tag custom" title="Personal custom recipe saved to your Google account">🔒 Personal Recipe</span>` : categories.map(c => `<span class="book-tag ${getCategoryClass(c)}">${c}</span>`).join('')}
          </div>
          <div class="card-actions-top">
            ${!isPersonal ? `
              <span class="card-community-rating" title="Community rating: ${commAvg.toFixed(1)} / 5.0 (${commCount} reviews)">
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
        <div class="card-made-row">
          ${userMade > 0 ? `<span class="made-pill personal" title="You have spun this ${userMade} times">🍨 You spun ${userMade}×</span>` : ''}
          ${!isPersonal ? `<span class="made-pill community" title="Spun ${commMade} times across all users">🔥 ${commMade} community spin${commMade === 1 ? '' : 's'}</span>` : ''}
        </div>

        <div class="card-ingredients-preview">
          ${previewIngs.map(ing => {
            const has = pantryState.has(ing.id);
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
        <button class="btn-view-recipe">View Recipe</button>
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
    if (favoritesState.has(recipeId)) {
      favoritesState.delete(recipeId);
      showToast('Removed from favorites');
    } else {
      favoritesState.add(recipeId);
      showToast('💖 Added to favorites!');
    }
    saveFavorites();
    renderRecipes();
  }

  function updateCategoryCounts() {
    const counts = {
      all: allRecipes.length,
      'Fan Favorites': 0,
      'Keto': 0,
      'Lactose Free': 0,
      'No Protein': 0,
      favorites: favoritesState.size
    };

    allRecipes.forEach(r => {
      const cats = r.categories || (r.category ? [r.category] : []);
      cats.forEach(cat => {
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });
    });

    const elAll = document.getElementById('countAll');
    const elFan = document.getElementById('countFan');
    const elKeto = document.getElementById('countKeto');
    const elLactose = document.getElementById('countLactose');
    const elNoPro = document.getElementById('countNoProtein');
    const elFav = document.getElementById('countFavorites');
    const elCustom = document.getElementById('countCustom');
    const tabCustom = document.getElementById('tabCustomRecipes');

    if (elAll) elAll.textContent = counts.all;
    if (elFan) elFan.textContent = counts['Fan Favorites'];
    if (elKeto) elKeto.textContent = counts['Keto'];
    if (elLactose) elLactose.textContent = counts['Lactose Free'];
    if (elNoPro) elNoPro.textContent = counts['No Protein'];
    if (elFav) elFav.textContent = counts.favorites;
    if (elCustom) elCustom.textContent = customRecipesState.length;
    if (tabCustom) {
      tabCustom.style.display = (currentUser && customRecipesState.length > 0) ? 'inline-flex' : 'none';
    }
  }

  function updateStats() {
    if (statPantryCount) statPantryCount.textContent = pantryState.size;
    if (pantryInStockCount) pantryInStockCount.textContent = `${pantryState.size} items in stock`;
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
  function openRecipeModal(recipe) {
    currentModalRecipe = recipe;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerRunning = false;
    timerSecondsLeft = 60;

    renderRecipeModalContent(recipe);

    recipeModalOverlay.classList.add('active');
    recipeModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function renderRecipeModalContent(recipe) {
    const match = computeRecipeMatch(recipe);
    const catClass = getCategoryClass(recipe.category);
    const isFav = favoritesState.has(recipe.id);

    const baseIngs = (recipe.ingredients || []).filter(i => !i.isMixin);
    const mixinIngs = (recipe.ingredients || []).filter(i => i.isMixin);

    const userFeedback = userRecipeData[recipe.id] || { rating: 0, notes: '' };
    const userMade = recipeMadeCounts[recipe.id] || 0;
    const commMade = communityStats.madeCounts[recipe.id] ?? (12 + (Math.abs(hashString(recipe.id)) % 30));
    const commRating = communityStats.ratings[recipe.id];
    const commAvg = commRating ? commRating.avg : (4.5 + (Math.abs(hashString(recipe.id)) % 5) * 0.1);
    const commCount = commRating ? commRating.count : (3 + (Math.abs(hashString(recipe.id)) % 8));
    const commDist = (commRating && commRating.distribution) ? commRating.distribution : {
      5: Math.max(1, commCount - 2),
      4: 1,
      3: 1,
      2: 0,
      1: 0
    };

    const isPersonal = Boolean(recipe.isPersonal || (recipe.id && recipe.id.startsWith('custom_')));

    recipeModalBody.innerHTML = `
      <div class="modal-header">
        <div class="modal-meta-row">
          ${isPersonal ? `<span class="book-tag custom">🔒 Personal Recipe</span>` : (recipe.categories && recipe.categories.length > 0 ? recipe.categories : [recipe.category]).map(cat => {
            return `<span class="book-tag ${getCategoryClass(cat)}">${cat}</span>`;
          }).join('')}
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

      <!-- Missing Items Callout -->
      <div class="missing-items-callout ${match.isReady ? 'all-ready' : 'has-missing'}">
        <span style="font-size: 1.3rem;">${match.isReady ? '🎉' : '🛒'}</span>
        <div style="flex: 1;">
          <strong>${match.isReady ? 'You have all ingredients ready!' : `Missing ${match.missing.length} item${match.missing.length > 1 ? 's' : ''}:`}</strong>
          <div>${match.isReady ? 'Blend up your base, freeze solid for 16-24 hrs, and get spinning!' : match.missing.map(m => m.name).join(', ')}</div>
          ${!match.isReady && match.missing.length > 0 ? `
            <button class="btn-add-all-missing" id="btnAddAllMissingBtn">🛒 Add All Missing to Grocery List</button>
          ` : ''}
        </div>
      </div>

      <!-- Base Ingredients List -->
      <h3 class="modal-section-title">🥣 Base Ingredients (${baseIngs.length})</h3>
      <div class="modal-ingredients-list">
        ${baseIngs.map(ing => renderModalIngredientRow(ing)).join('')}
      </div>

      <!-- Mix-Ins List -->
      ${mixinIngs.length > 0 ? `
        <h3 class="modal-section-title">🍫 Mix-Ins (${mixinIngs.length})</h3>
        <div class="modal-ingredients-list">
          ${mixinIngs.map(ing => renderModalIngredientRow(ing)).join('')}
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
              🔥 <span id="modalCommunityBatchesVal">${commMade}</span> community spins
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
        ${!isPersonal ? `
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

      <div class="modal-footer" style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 8px; align-items: center;">
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
        const inPantry = pantryState.has(ingId);
        btn.className = `modal-ing-toggle-btn ${inPantry ? 'in-pantry' : ''}`;
        btn.textContent = inPantry ? '✓ In Pantry' : '+ In Stock';
        btn.closest('.modal-ing-row').className = `modal-ing-row ${inPantry ? 'in-pantry' : ''}`;
        
        // Refresh missing callout
        const newMatch = computeRecipeMatch(recipe);
        const callout = recipeModalBody.querySelector('.missing-items-callout');
        if (callout) {
          callout.className = `missing-items-callout ${newMatch.isReady ? 'all-ready' : 'has-missing'}`;
          callout.innerHTML = `
            <span style="font-size: 1.3rem;">${newMatch.isReady ? '🎉' : '🛒'}</span>
            <div style="flex: 1;">
              <strong>${newMatch.isReady ? 'You have all ingredients ready!' : `Missing ${newMatch.missing.length} item${newMatch.missing.length > 1 ? 's' : ''}:`}</strong>
              <div>${newMatch.isReady ? 'Blend up your base, freeze solid for 16-24 hrs, and get spinning!' : newMatch.missing.map(m => m.name).join(', ')}</div>
              ${!newMatch.isReady && newMatch.missing.length > 0 ? `
                <button class="btn-add-all-missing" id="btnAddAllMissingBtn">🛒 Add All Missing to Grocery List</button>
              ` : ''}
            </div>
          `;
          const addAllBtn = callout.querySelector('#btnAddAllMissingBtn');
          if (addAllBtn) {
            addAllBtn.addEventListener('click', () => {
              newMatch.missing.forEach(m => manualShoppingList.add(m.name));
              saveManualShoppingList();
              showToast(`🛒 Added ${newMatch.missing.length} items to shopping list`);
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
        const ingName = btn.dataset.name;
        if (manualShoppingList.has(ingName)) {
          manualShoppingList.delete(ingName);
          btn.className = 'modal-ing-shop-btn';
          btn.textContent = '🛒 + List';
          showToast(`Removed "${ingName}" from shopping list`);
        } else {
          manualShoppingList.add(ingName);
          btn.className = 'modal-ing-shop-btn in-list';
          btn.textContent = '✓ On List';
          showToast(`🛒 Added "${ingName}" to shopping list!`);
        }
        saveManualShoppingList();
      });
    });

    // Add All Missing Button
    const addAllBtn = recipeModalBody.querySelector('#btnAddAllMissingBtn');
    if (addAllBtn) {
      addAllBtn.addEventListener('click', () => {
        const match = computeRecipeMatch(recipe);
        match.missing.forEach(m => manualShoppingList.add(m.name));
        saveManualShoppingList();
        showToast(`🛒 Added ${match.missing.length} items to shopping list!`);
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

    // Done Button
    const modalDoneBtn = recipeModalBody.querySelector('#modalDoneBtn');
    if (modalDoneBtn) {
      modalDoneBtn.addEventListener('click', closeRecipeModal);
    }
  }

  function renderModalIngredientRow(ing) {
    const inPantry = pantryState.has(ing.id);
    const amountText = formatIngredientAmount(ing, modalScale, modalUnitMode);
    const subText = extractSubstitution(ing.notes);
    const inShopList = manualShoppingList.has(ing.name);

    return `
      <div class="modal-ing-row ${inPantry ? 'in-pantry' : ''}">
        <div class="modal-ing-info">
          <div class="modal-ing-name">${ing.name}</div>
          ${subText ? `<div class="ing-sub-chip">💡 Swap: ${subText}</div>` : ''}
          ${ing.notes ? `<div class="modal-ing-notes">${ing.notes}</div>` : ''}
        </div>
        <div class="modal-ing-right-group">
          <div class="modal-ing-amount-box" title="${modalScale > 1 ? 'Scaled Deluxe (1.5×) amount' : 'Standard amount'}">
            <span class="modal-ing-amount-label">${modalScale > 1 ? 'Deluxe Amt' : 'Amount'}</span>
            <span class="modal-ing-amount-val ${!amountText ? 'empty' : ''}">${amountText || 'As needed'}</span>
          </div>
          <button class="modal-ing-shop-btn ${inShopList ? 'in-list' : ''}" data-name="${ing.name}" title="${inShopList ? 'Remove from shopping list' : 'Add to shopping list'}">
            ${inShopList ? '✓ On List' : '🛒 + List'}
          </button>
          <button class="modal-ing-toggle-btn ${inPantry ? 'in-pantry' : ''}" data-id="${ing.id}">
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
    recipeModalOverlay.classList.remove('active');
    recipeModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentModalRecipe = null;
  }

  // --- Shopping List Modal ---
  function openShoppingListModal() {
    const missingMap = new Map(); // ingName -> list of recipe names

    // Gather missing items from Favorites first, and then general ready-pending
    const targetRecipes = allRecipes.filter(r => favoritesState.has(r.id) || computeRecipeMatch(r).missing.length <= 2);

    targetRecipes.forEach(r => {
      const match = computeRecipeMatch(r);
      match.missing.forEach(m => {
        if (!missingMap.has(m.name)) {
          missingMap.set(m.name, []);
        }
        if (!missingMap.get(m.name).includes(r.name)) {
          missingMap.get(m.name).push(r.name);
        }
      });
    });

    const manualItems = Array.from(manualShoppingList);
    const hasItems = manualItems.length > 0 || missingMap.size > 0;

    if (!hasItems) {
      shoppingModalBody.innerHTML = `
        <div style="text-align: center; padding: 40px 10px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; margin-bottom: 8px;">Your Shopping List is Empty!</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">You have all ingredients needed for your target recipes, or haven't added any items to your grocery list yet.</p>
        </div>
      `;
    } else {
      let html = '<div class="shopping-list-items">';

      // Manual items first
      if (manualItems.length > 0) {
        html += `<div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin: 4px 0 6px;">Items Added by You (${manualItems.length})</div>`;
        manualItems.forEach(name => {
          html += `
            <div class="shopping-item-row" data-name="${name}">
              <div>
                <div class="shopping-item-name">${name}</div>
                <div class="shopping-item-recipes">Added from recipe details</div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn-xs btn-outline add-bought-btn" data-name="${name}">+ In Stock</button>
                <button class="btn-xs remove-shop-item-btn" data-name="${name}" style="background: transparent; border: 1px solid var(--border-glass); color: var(--text-dim); border-radius: var(--radius-sm); cursor: pointer;" title="Remove from list">✕</button>
              </div>
            </div>
          `;
        });
      }

      // Missing items next
      if (missingMap.size > 0) {
        html += `<div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 14px 0 6px;">Missing from Selected Recipes (${missingMap.size})</div>`;
        Array.from(missingMap.entries()).forEach(([ingName, recipes]) => {
          if (!manualShoppingList.has(ingName)) {
            html += `
              <div class="shopping-item-row" data-name="${ingName}">
                <div>
                  <div class="shopping-item-name">${ingName}</div>
                  <div class="shopping-item-recipes">Needed for: ${recipes.slice(0, 3).join(', ')}${recipes.length > 3 ? ` + ${recipes.length - 3} more` : ''}</div>
                </div>
                <button class="btn-xs btn-outline add-bought-btn" data-name="${ingName}">+ In Stock</button>
              </div>
            `;
          }
        });
      }

      html += '</div>';
      shoppingModalBody.innerHTML = html;

      // Event listeners in shopping modal
      shoppingModalBody.querySelectorAll('.add-bought-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const ingName = btn.dataset.name;
          const matchItem = INGREDIENTS_MASTER.find(i => i.name === ingName);
          if (matchItem) {
            togglePantryItem(matchItem.id);
            manualShoppingList.delete(ingName);
            saveManualShoppingList();
            btn.textContent = '✓ Added to Pantry';
            btn.style.borderColor = 'var(--success)';
            btn.style.color = 'var(--success)';
            setTimeout(() => {
              openShoppingListModal();
            }, 500);
          }
        });
      });

      shoppingModalBody.querySelectorAll('.remove-shop-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const ingName = btn.dataset.name;
          manualShoppingList.delete(ingName);
          saveManualShoppingList();
          openShoppingListModal();
        });
      });
    }

    shoppingModalOverlay.classList.add('active');
    shoppingModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeShoppingListModal() {
    shoppingModalOverlay.classList.remove('active');
    shoppingModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateShoppingListBadge() {
    let missingTotal = manualShoppingList.size;
    const seen = new Set();
    allRecipes.filter(r => favoritesState.has(r.id)).forEach(r => {
      computeRecipeMatch(r).missing.forEach(m => {
        if (!seen.has(m.id) && !manualShoppingList.has(m.name)) {
          seen.add(m.id);
          missingTotal++;
        }
      });
    });
    if (shoppingListBadge) shoppingListBadge.textContent = missingTotal;
  }

  function copyShoppingList() {
    const items = shoppingModalBody.querySelectorAll('.shopping-item-name');
    if (items.length === 0) {
      showToast('Shopping list is empty');
      return;
    }
    const listText = Array.from(items).map(i => `• ${i.textContent}`).join('\n');
    navigator.clipboard.writeText(`🛒 Creami Cravings Grocery List:\n${listText}`).then(() => {
      showToast('📋 Copied shopping list to clipboard!');
    });
  }

  function printShoppingList() {
    window.print();
  }

  // --- Custom Recipe Builder (Gated to Signed-In Google Account) ---
  function openCustomRecipeModal() {
    if (!currentUser) {
      showToast('🔒 Please sign in with Google to create and save personal custom recipes.');
      openGoogleAuthModal();
      return;
    }
    customRecipeForm.reset();
    customRecipeModalOverlay.classList.add('active');
    customRecipeModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCustomRecipeModal() {
    customRecipeModalOverlay.classList.remove('active');
    customRecipeModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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
      const cleanLine = line.replace(/\(mix-in\)/gi, '').trim();
      const slugId = cleanLine.toLowerCase().replace(/[^a-z0-9]+/g, '_').trim();
      return {
        id: slugId,
        name: cleanLine,
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

    // Quick Nutrition & Macro Filter Chips
    const quickFilterChipsBar = document.getElementById('quickFilterChipsBar');
    if (quickFilterChipsBar) {
      quickFilterChipsBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn) return;
        quickFilterChipsBar.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
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
        if (quickFilterChipsBar) {
          quickFilterChipsBar.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
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
    if (printShoppingListBtn) printShoppingListBtn.addEventListener('click', printShoppingList);

    if (addCustomRecipeBtn) addCustomRecipeBtn.addEventListener('click', openCustomRecipeModal);
    if (customModalCloseBtn) customModalCloseBtn.addEventListener('click', closeCustomRecipeModal);
    if (cancelCustomRecipeBtn) cancelCustomRecipeBtn.addEventListener('click', closeCustomRecipeModal);
    if (customRecipeModalOverlay) {
      customRecipeModalOverlay.addEventListener('click', (e) => {
        if (e.target === customRecipeModalOverlay) closeCustomRecipeModal();
      });
    }
    if (customRecipeForm) customRecipeForm.addEventListener('submit', handleCustomRecipeSubmit);

    // Escape Key to Close Modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeRecipeModal();
        closeShoppingListModal();
        closeCustomRecipeModal();
        closeGoogleAuthModal();
      }
    });

    // Theme Toggle
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
