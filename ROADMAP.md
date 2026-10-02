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

### 9. 🥣 16 oz Standard $\leftrightarrow$ 24 oz Deluxe Sizing Toggle
- [ ] **Machine Switcher:** Simple toggle on recipe cards and detail modals switching between Standard (16 oz / NC300) and Deluxe (24 oz / NC500) models.
- [ ] **Dynamic Scaling ($1.5\times$):** Automatically scale ingredient quantities (grams, tablespoons, scoops, milliliters) with clean culinary rounding.
- [ ] **Dynamic Macro Calculation:** Recalculate full calories, protein, carbs, and fat automatically for the 24 oz Deluxe pint.

### 10. 📊 Fitness & Macro Power Features
- [ ] **1-Tap Macro Clipboard Export:** "Copy Macros" button in the recipe modal copying clean nutrition strings (e.g. `Oreo McFlurry: 310 kcal | 38g P | 24g C | 5g F`) for instant pasting into MyFitnessPal, MacroFactor, or Cronometer.
- [ ] **Target Nutrition Filter Sliders:** Filter recipes by customizable ranges:
  - Minimum Protein (e.g., $\ge 30\text{g}$)
  - Maximum Calories (e.g., $\le 300\text{ kcal}$)
  - Low Fat filter (e.g., $\le 5\text{g}$)

### 11. 📱 Grocery & Mobile Experience
- [ ] **Full PWA Offline Support:** Install a Web App Manifest and Service Worker so all 149+ recipes and images load 100% offline in grocery stores with zero signal.
- [ ] **Shopping List Export:** 1-click export of missing ingredients to Apple Notes, Apple Reminders, Google Keep, or clipboard text.

### 12. 🎰 Fun & Discovery ("Creami Roulette")
- [ ] **"Surprise Me / Spin the Wheel":** Random recipe picker that chooses a ready-to-make pint from your matched ingredients when you have decision paralysis.
- [ ] **Craving / Mood Filter Chips:** Quick filter tags for specific flavor cravings:
  - 🍫 Chocolate Craving
  - 🍓 Fruity & Refreshing
  - 🍪 Bakery, Cookie & Dough
  - ☕ Coffee & Latte
