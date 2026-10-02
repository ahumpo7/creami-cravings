# 🍦 Creami Cravings — Project Roadmap

A prioritized checklist of fixes, features, and refinements for the Creami Cravings Ninja Creami Companion web app.

---

## 📌 Active Development Priorities (The 7-Item List)

### 1. Finish Google Sign-In
- [ ] **Google OAuth Client ID:** Replace placeholder client ID (`992837461234-...`) in `app.js` with a production Google Cloud Console OAuth 2.0 Client ID.
- [ ] **Authorized JavaScript Origins:** Configure `http://localhost:8000`, `http://127.0.0.1:8000`, and your live Render domain (`https://creami-cravings.onrender.com`) in the Google Cloud Console.
- [ ] **Seamless Sign-In Experience:** Ensure Google One-Tap and the header sign-in button work smoothly across desktop and mobile browsers, falling back gracefully to email sign-in.

### 2. Move Favorites Behind Login
- [ ] **Require Authentication:** When an unauthenticated / guest user clicks the favorite heart button on a recipe card, prompt them to sign in instead of saving locally.
- [ ] **User Isolation:** Ensure favorites are strictly associated with the authenticated user account and synced via `/api/user/sync`.
- [ ] **Offline/Guest UI:** Show a friendly tooltip or modal explaining that favorites require an account so they can be saved across devices.

### 3. Reset Counts of Everything & Community Rankings
- [ ] **Clean Slate:** Clear out mock/seed community numbers from `db_ratings.json` and `db_recipe_stats.json`.
- [ ] **Remove Seed Batches:** Reset total community batches from 540+ down to real organic user data (or 0).
- [ ] **Fresh Rankings:** Allow recipe popularities and star ratings to grow organically from real user logs and ratings.

### 4. Fix Shopping List Populating "Weird Things"
- [ ] **Sanitize Missing Items:** Review missing ingredient extraction logic in `app.js` to prevent non-standard items, compound instructions, or un-slugged strings from entering the shopping list.
- [ ] **Deduplication:** Ensure pantry staples, water, ice, and optional mix-ins don't inadvertently clutter the shopping list.
- [ ] **Cleaner Display:** Clean ingredient display names so only recognizable grocery items appear in the shopping list modal.

### 5. Remove "Pro Tip" Badge on All Recipe Screen
- [ ] **Card Streamlining:** Remove or hide the "Pro Tip" badge / banner from individual recipe cards in the main grid view.
- [ ] **Move to Modal:** Keep tips accessible inside the Recipe Detail modal where they are helpful, without cluttering the recipe overview browse view.

### 6. Fix Rating Size Inconsistency Across Recipe Tags
- [ ] **Card Layout Uniformity:** Fix the flexbox / CSS layout in `styles.css` where the star rating badge shrinks or expands depending on how many category badges (e.g. "Keto", "High Protein", "No Protein Powder") are present.
- [ ] **Consistent Positioning:** Lock rating badge dimensions and align bottom action bars across all recipe cards regardless of title length or tag count.

### 7. Fix Ingredient Categories
- [ ] **Audit Categorization:** Review `INGREDIENTS_MASTER` in `recipes-data.js` and `build_recipes_data.py`.
- [ ] **Accurate Taxonomy:** Re-categorize misclassified ingredients (e.g. ensure powders, extracts, dairy liquids, mix-ins, and fruit bases are in their intuitive grocery sections).
- [ ] **Pantry Drawer Organization:** Ensure the collapsible categories in the kitchen pantry drawer make finding and checking off ingredients effortless.

---

## 🚀 Future Enhancements (Backlog)
- [ ] **PWA Offline Service Worker:** Full offline caching for 100% offline usage in grocery stores without cellular service.
- [ ] **Macro & Calorie Range Sliders:** Filter recipes by target ranges (e.g. `< 250 cal`, `> 35g protein`).
- [ ] **Grocery Export:** 1-click export of missing items to Apple Notes, Google Keep, or Instacart.
