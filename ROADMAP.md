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

### 4. Fix Shopping List Populating "Weird Things" (Completed ✅)
- [x] **Sanitize Missing Items:** Review missing ingredient extraction logic in `app.js` to prevent non-standard items, compound instructions, or un-slugged strings from entering the shopping list.
- [x] **Deduplication & Staples Filter:** Common household staples (water, ice, tap water, salt, table salt, pinch of salt, cooking spray) are cleanly excluded from cluttering grocery shopping lists.
- [x] **Clean Grocery Aisle Display:** Ingredient names are sanitized into recognizable grocery store items (e.g. `Vanilla Extract (or Bean Paste)`, `Peppermint Bark (or Candies)`), grouped with category aisle badges (Dairy, Mix-Ins, Produce, Pudding Mixes, etc.), equipped with 1-tap `+ In Stock` checkoff, quick custom item adder, and organized clipboard copy.

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

#### 13. 📱 Increased Mobile Friendliness & Touch Optimization (Completed ✅)
- [x] **Touch & Tap Target Sizing:** Minimum 44×44px comfortable tap targets for all mobile buttons, pantry checkboxes, modal close icons, and filter chips.
- [x] **Sticky Mobile Bottom Navigation / Action Bar:** Floating quick-access mobile toolbar for 1-tap jumping between Recipes, Pantry Drawer, Shopping List, and Roulette without scrolling.
- [x] **Mobile Bottom-Sheet Modals:** Responsive slide-up sheet presentation on mobile screens with iOS safe-area support (`env(safe-area-inset-bottom)`).
- [x] **Prevent iOS Safari Auto-Zoom:** Enforce 16px minimum base font sizes on search inputs and notes textareas to prevent annoying iOS viewport auto-zooming.
- [x] **Touch-Optimized Sliders:** Smooth mobile touch targets on macro range sliders with `touch-action: pan-y` to prevent vertical page stuttering while dragging.
- [x] **Horizontal Scroll Momentum:** Smooth swipeable filter chip rows with subtle edge fade gradients.
- [x] **Mobile View Switcher:** Fast segmented toggle between Recipes and My Pantry on screens $\le 768px$.

### 14. 🤖 Google Play Store Android App (TWA via Bubblewrap)
- [ ] **Prerequisite Foundation (PWA):** Leverages the `manifest.json` and `service-worker.js` built in Item 11.
- [ ] **Bubblewrap TWA Generation:** Use Google's official `@bubblewrap/cli` to generate a production-ready Android App Bundle (`.aab`) signed with a release keystore.
- [ ] **Digital Asset Links Verification:** Deploy `/.well-known/assetlinks.json` on Render containing the app's SHA-256 fingerprint so Android verifies ownership and eliminates any browser framing.
- [ ] **Play Store Assets Preparation:**
  - High-res App Icon ($512 \times 512$ PNG)
  - Feature Graphic Banner ($1024 \times 500$ PNG)
  - Mobile phone screenshots (pantry, recipe cards, macro tracker, roulette)
- [ ] **Privacy Policy Page:** Deploy a clean, minimal `/privacy.html` compliance page on Render required by Google Play Console policies.
- [ ] **Over-The-Air (OTA) Sync:** Verify that web app changes pushed to GitHub automatically reflect inside the installed Android app without requiring new Play Store binary submissions.

### 15. 👥 User Management & Tiered Recipe Access (Admin Portal & Gated Categories)
- [ ] **Admin Account & Roles:**
  - Designate admin account(s) by verified Google email in server config.
  - Automatically grant admin privileges upon signing in with that verified Google email.
- [ ] **User Directory & Permissions Store (`db_users.json`):**
  - Track all registered users who sign in with Google (email, name, avatar, date joined, role, allowed categories).
  - Configurable default access tier for new sign-ups (e.g. "Fan Favorites" pack enabled by default).
- [ ] **Admin Dashboard / Management Portal:**
  - Admin-only management portal accessible exclusively to designated admin accounts.
  - Searchable user table displaying all registered users, last active date, and current category access.
  - 1-click category permission toggles per user (e.g. grant/revoke "Keto", "No Protein Powder", "Lactose-Free", "Fan Favorites", or "Full All-Access Pass").
- [ ] **Recipe Gating & Lock UI:**
  - Recipe cards check the authenticated user's assigned permissions against recipe category tags.
  - Gated recipe cards display a sleek lock indicator (e.g. `🔒 Keto Pack Required`).
  - Opening a locked recipe presents a teaser card with a friendly "Locked Recipe — Contact Admin / Upgrade Access" prompt instead of full instructions.
  - Quick filter toggle to "Show Only My Accessible Recipes" or preview all available recipes.

### 16. 🔄 1-Tap Smart Ingredient Substitutions ("What Can I Swap?")
- [ ] **Modal Swap Inspector:** Tapping or clicking any ingredient in the recipe detail modal reveals tested, recommended substitutions.
- [ ] **Curated Creami Swaps Database:**
  - Fairlife milk $\leftrightarrow$ Unsweetened almond milk + 1 tbsp heavy cream (reduces calories by ~60 while retaining creamy fat emulsion) or 2% milk.
  - Xanthan gum $\leftrightarrow$ Sugar-Free Jell-O Instant Pudding Mix (7g) or guar gum.
  - Whey protein $\leftrightarrow$ Whey/casein blend (explains why casein yields thicker soft-serve body) or plant protein.
  - Granulated sugar $\leftrightarrow$ Allulose, erythritol/monk fruit blend, or stevia.
  - PB2 powdered peanut butter $\leftrightarrow$ Creamy peanut butter (with macro adjustment note).
- [ ] **Texture & Macro Delta Hints:** Explains how each swap shifts texture (iciness, thickness) and approximate calorie/protein trade-offs.

### 17. 🔔 Native Push Notifications for 16-Hour Freeze Timer
- [ ] **PWA / Android Notification Integration:** Prompts for notification permission when the user logs a chilling pint and starts the 16-hour countdown.
- [ ] **Background Readiness Alert:** Fires a local push notification when the timer elapses:
  - *"🍨 Ding! Your [Recipe Name] pint has chilled for 16 hours. Time to spin and enjoy!"*
- [ ] **Direct Spin Shortcut:** Tapping the notification opens Creami Cravings directly to that recipe card with recommended spin cycle and batch logger.

### 18. 🧪 "Build-A-Pint" Custom Recipe Balancing Wizard & Creaminess Score
- [ ] **Guided 4-Step Pint Creator:** Step-by-step interactive builder to formulate balanced custom recipes:
  - Step 1: Base Liquid (Almond milk, Fairlife, coconut milk, oat milk)
  - Step 2: Protein & Flavor Powders (Whey, casein, cocoa, peanut butter powder)
  - Step 3: Stabilizer & Emulsifier (Xanthan gum, sugar-free pudding mix, cream cheese, cottage cheese)
  - Step 4: Sweeteners & Mix-Ins (Allulose, stevia, monk fruit, Oreos, chocolate chips)
- [ ] **Real-Time "Creaminess Score" (1 to 10):** Evaluates fat, total dissolved solids, and stabilizer ratios to warn if the pint will freeze into an icy block or turn powdery.
- [ ] **Automatic Macro Computation:** Recalculates total calories, protein, carbs, and fat per pint, with 1-click save to "My Recipes".

---

## 🏆 Remaining Items Ranked by Easiest to Hardest

| Rank | Task | Why & Scope | Est. Effort |
| :---: | :--- | :--- | :--- |
| **🥇 1** | **Item 3: Reset Counts & Community Rankings** | Clean data wipe of mock/seed numbers in `db_recipe_stats.json`, `db_ratings.json`, and initial seed constants so counts start at 0. | 🟢 ~5 mins |
| **🥈 2** | **Item 7: Fix Ingredient Categories in Pantry** | Reorganize pantry drawer taxonomy in `recipes-data.js` into intuitive grocery aisles (baking, sweeteners, extracts, powders, etc.). | 🟡 ~15–20 mins |
| **🥉 3** | **Item 16: 🔄 1-Tap Smart Ingredient Substitutions** | Modal swap popup with tested substitutions for milks, gums, proteins, and sweeteners with texture/macro delta hints. | 🟡 ~20–30 mins |
| **4** | **Item 8: 🧊 "Pints in Freezer" Tracker & 16-Hr Timer** | New freezer inventory manager, 16-hour countdown calculation, status badges, and 1-tap spin logging. | 🟡 ~35–45 mins |
| **5** | **Item 17: 🔔 Freeze Timer Push Notifications** | Web/Android notification trigger when 16-hour freeze timer reaches zero. *(Hooks into Item 8 & PWA)* | 🟡 ~25–35 mins |
| **6** | **Item 11: 📦 Grocery PWA & Offline Support** | Web App Manifest, Service Worker offline caching strategy, and 1-click export to Apple Notes/Reminders/Keep. *(Prerequisite for Android App)* | 🟠 ~30–40 mins |
| **7** | **Item 18: 🧪 "Build-A-Pint" Balancing Wizard** | 4-step custom recipe creator with real-time Creaminess Score (1-10) and auto-calculated macros. | 🟠 ~35–45 mins |
| **8** | **Item 15: 👥 User Management & Tiered Recipe Access** | Admin portal, user database, Google auth role assignment, and category-based recipe gating/locks. | 🟠 ~40–50 mins |
| **9** | **Item 14: 🤖 Google Play Store Android App (Bubblewrap)** | Generate signed `.aab` bundle, deploy `assetlinks.json`, generate $1024\times500$ banner and $512\times512$ store icon, and prepare `/privacy.html`. | 🟠 ~30–45 mins |
| **10** | **Item 1: Finish Google Sign-In** | Requires generating OAuth 2.0 Client ID in Google Cloud Console and setting authorized origins. | ⚪ External Credential |
