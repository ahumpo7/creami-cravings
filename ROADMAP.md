# 🍦 Creami Cravings — Project Roadmap

A prioritized checklist of fixes, features, and refinements for the Creami Cravings Ninja Creami Companion web app.

---

## 📌 Original Refinements (The 7-Item List)

### 1. Finish Google Sign-In
- [ ] **Google OAuth Client ID:** Replace placeholder client ID (`992837461234-...`) in `app.js` with a production Google Cloud Console OAuth 2.0 Client ID.
- [ ] **Authorized JavaScript Origins:** Configure `http://localhost:8000`, `http://127.0.0.1:8000`, and your live Render domain (`https://creami-cravings.onrender.com`) in the Google Cloud Console.
- [ ] **Seamless Sign-In Experience:** Ensure Google One-Tap and the header sign-in button work smoothly across desktop and mobile browsers, falling back gracefully to email sign-in.

### 2. Move Favorites Behind Login (Completed ✅)
- [x] **Require Authentication:** When an unauthenticated / guest user clicks the favorite heart button on a recipe card, prompt them to sign in instead of saving locally.
- [x] **User Isolation:** Ensure favorites are strictly associated with the authenticated user account and synced via `/api/user/sync`.
- [x] **Offline/Guest UI:** Show a friendly tooltip or modal explaining that favorites require an account so they can be saved across devices.

### 3. Reset Counts of Everything & Community Rankings
- [ ] **Clean Slate:** Clear out mock/seed community numbers from `db_ratings.json` and `db_recipe_stats.json`.
- [ ] **Remove Seed Batches:** Reset total community batches from 540+ down to real organic user data (or 0).
- [ ] **Fresh Rankings:** Allow recipe popularities and star ratings to grow organically from real user logs and ratings.

### 4. Fix Shopping List Populating "Weird Things"
- [ ] **Sanitize Missing Items:** Review missing ingredient extraction logic in `app.js` to prevent non-standard items, compound instructions, or un-slugged strings from entering the shopping list.
- [ ] **Deduplication:** Ensure pantry staples, water, ice, and optional mix-ins don't inadvertently clutter the shopping list.
- [ ] **Cleaner Display:** Clean ingredient display names so only recognizable grocery items appear in the shopping list modal.

### 5. Remove "Pro Tip" Badge on All Recipe Screen (Completed ✅)
- [x] **Card Streamlining:** Remove or hide the "Pro Tip" badge / banner from individual recipe cards in the main grid view.
- [x] **Move to Modal:** Keep tips accessible inside the Recipe Detail modal where they are helpful, without cluttering the recipe overview browse view.

### 6. Fix Rating Size Inconsistency Across Recipe Tags (Completed ✅)
- [x] **Card Layout Uniformity:** Fix the flexbox / CSS layout in `styles.css` where the star rating badge shrinks or expands depending on how many category badges (e.g. "Keto", "High Protein", "No Protein Powder") are present.
- [x] **Consistent Positioning:** Lock rating badge dimensions and align bottom action bars across all recipe cards regardless of title length or tag count.

### 7. Fix Ingredient Categories
- [ ] **Audit Categorization:** Review `INGREDIENTS_MASTER` in `recipes-data.js` and `build_recipes_data.py`.
- [ ] **Accurate Taxonomy:** Re-categorize misclassified ingredients (e.g. ensure powders, extracts, dairy liquids, mix-ins, and fruit bases are in their intuitive grocery sections).
- [ ] **Pantry Drawer Organization:** Ensure the collapsible categories in the kitchen pantry drawer make finding and checking off ingredients effortless.

---

## 🚀 Major Feature Expansions (New Additions)

### 8. 🧊 "Pints in the Freezer" Tracker & 16-Hour Timer
- [ ] **Freezer Inventory:** Dedicated manager to log pints currently chilling in your freezer (recipe name, date/time mixed, notes/customizations).
- [ ] **16-Hour Freeze Timer:** Custom countdown timer specifically calibrated to **16 hours** (instead of standard 24) until the pint is ready to spin.
- [ ] **Readiness Indicator:** Real-time visual status badges: `Chilling (X hours left)` $\rightarrow$ `Ready to Spin! 🍨`.
- [ ] **One-Tap Spin Logging:** Mark a frozen pint as "Spun & Enjoyed" to automatically increment your batch counter.

### 9. 🥣 16 oz Standard $\leftrightarrow$ 24 oz Deluxe Sizing Toggle (Completed in Modal ✅)
- [x] **Machine Switcher:** Simple toggle in recipe detail modals switching between Standard (16 oz / NC300) and Deluxe (24 oz / NC500) models.
- [x] **Dynamic Scaling ($1.5\times$):** Automatically scale ingredient quantities (grams, tablespoons, scoops, milliliters) with clean culinary rounding.
- [x] **Dynamic Macro Calculation:** Recalculate full calories, protein, carbs, and fat automatically for the 24 oz Deluxe pint.

### 10. 📊 Fitness & Macro Power Features (Completed ✅)
- [x] **1-Tap Macro Clipboard Export:** "Copy Macros" button in the recipe modal copying clean nutrition strings (e.g. `Oreo McFlurry (16 oz Standard): 233 kcal | 23g P | 29g C | 4g F (Sugar: 18g, Fiber: 1g)`) for instant pasting into MyFitnessPal, MacroFactor, or Cronometer.
- [x] **Target Nutrition Filter Sliders:** Interactive, collapsible Fitness & Macro Targets panel:
  - Minimum Protein slider (0 to 50g+)
  - Maximum Calories slider (150 to 450 kcal)
  - Maximum Fat slider (2 to 20g)
  - Quick-action "🧈 Low Fat (≤5g)" filter chip
  - Active target indicator dot and instant reset

### 11. 📦 Grocery PWA & Offline Support
- [ ] **Full PWA Offline Support:** Install a Web App Manifest and Service Worker so all 149+ recipes and images load 100% offline in grocery stores with zero signal.
- [ ] **Shopping List Export:** 1-click export of missing ingredients to Apple Notes, Apple Reminders, Google Keep, or clipboard text.

### 12. 🎰 Fun & Discovery ("Creami Roulette") (Completed ✅)
- [x] **"Surprise Me / Spin the Wheel":** Animated Creami Roulette slot machine modal that picks a winning recipe—intelligently prioritizing 100% ready-to-make recipes from your pantry, with instant "Spin Again" and recipe opening.
- [x] **Craving / Mood Filter Chips:** Instant flavor filter chips with comprehensive keyword matching:
  - 🍫 Chocolate Craving
  - 🍓 Fruity & Refreshing
  - 🍪 Bakery, Cookie & Dough
  - ☕ Coffee & Latte

### 13. 📱 Increased Mobile Friendliness & Touch Optimization
- [ ] **Touch & Tap Target Sizing:** Minimum 44×44px comfortable tap targets for all mobile buttons, pantry checkboxes, modal close icons, and filter chips.
- [ ] **Sticky Mobile Bottom Navigation / Action Bar:** Floating quick-access mobile toolbar for 1-tap jumping between Recipes, Pantry Drawer, Shopping List, and Roulette without scrolling.
- [ ] **Mobile Bottom-Sheet Modals:** Responsive slide-up sheet presentation on mobile screens with iOS safe-area support (`env(safe-area-inset-bottom)`).
- [ ] **Prevent iOS Safari Auto-Zoom:** Enforce 16px minimum base font sizes on search inputs and notes textareas to prevent annoying iOS viewport auto-zooming.
- [ ] **Touch-Optimized Sliders:** Smooth mobile touch targets on macro range sliders with `touch-action: pan-y` to prevent vertical page stuttering while dragging.
- [ ] **Horizontal Scroll Momentum:** Smooth swipeable filter chip rows with subtle edge fade gradients.

---

## 🏆 Remaining Items Ranked by Easiest to Hardest

| Rank | Task | Why & Scope | Est. Effort |
| :---: | :--- | :--- | :---: |
| **1** | **Item 3: Reset Counts & Community Rankings** | Clean data wipe of mock/seed numbers in `db_recipe_stats.json`, `db_ratings.json`, and initial seed constants so counts start at 0. | 🟢 ~5 mins |
| **2** | **Item 4: Fix Shopping List Populating "Weird Things"** | Add ingredient blacklist/sanitization (exclude water, ice, non-grocery prep notes) and user-curated missing item rules. | 🟢 ~10–15 mins |
| **3** | **Item 7: Fix Ingredient Categories in Pantry** | Reorganize pantry drawer taxonomy in `recipes-data.js` into intuitive grocery aisles (baking, sweeteners, extracts, powders, etc.). | 🟡 ~15–20 mins |
| **4** | **Item 13: Increased Mobile Friendliness & Touch UX** | Touch targets (44px), sticky bottom navigation bar, iOS zoom prevention, touch-slider ergonomics, and bottom-sheet styling. | 🟡 ~25–35 mins |
| **5** | **Item 8: 🧊 "Pints in Freezer" Tracker & 16-Hr Timer** | New freezer inventory manager, 16-hour countdown calculation, status badges, and 1-tap spin logging. | 🟡 ~35–45 mins |
| **6** | **Item 11: 📦 Grocery PWA & Offline Support** | Web App Manifest, Service Worker offline caching strategy, and 1-click export to Apple Notes/Reminders/Keep. | 🟠 ~35–45 mins |
| **7** | **Item 1: Finish Google Sign-In** | Requires generating OAuth 2.0 Client ID in Google Cloud Console and setting authorized origins. | ⚪ External Credential |
