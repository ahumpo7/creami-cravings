# 🍦 Creami Cravings — Project Roadmap

A prioritized checklist of fixes, features, and refinements for the Creami Cravings Ninja Creami Companion web app.

---

## 📌 Original Refinements (The 7-Item List)

### 1. Finish Google Sign-In (Completed ✅)
- [x] **Google OAuth Client ID:** Replaced placeholder client ID with production Google Cloud Console OAuth 2.0 Client ID (`547238002283-f4t0s8qto34ef86sah16q71csg8797vo.apps.googleusercontent.com`) in `.env` and `app.js`.
- [x] **Authorized JavaScript Origins:** Configured `http://localhost:8000`, `http://127.0.0.1:8000`, and live Render domain (`https://creami-cravings.onrender.com`) in the Google Cloud Console.
- [x] **Seamless Sign-In Experience:** Enabled dynamic client ID loading via `/api/config`, Google One-Tap (`prompt()`), theme-aware button rendering, and automatic asynchronous library loading fallback.

### 2. Move Favorites Behind Login (Completed ✅)
- [x] **Require Authentication:** When an unauthenticated / guest user clicks the favorite heart button on a recipe card, prompt them to sign in instead of saving locally.
- [x] **User Isolation:** Ensure favorites are strictly associated with the authenticated user account and synced via `/api/user/sync`.
- [x] **Offline/Guest UI:** Show a friendly tooltip or modal explaining that favorites require an account so they can be saved across devices.

### 3. Reset Counts of Everything & Community Rankings (Completed ✅)
- [x] **Clean Slate:** Wiped mock and seed community numbers from `db_ratings.json` and `db_recipe_stats.json`. Removed mock auto-seed initialization in `server.py` so the database remains pure.
- [x] **Remove Seed Batches:** Reset total community spins from the hardcoded 539+ down to real organic count (0) across `index.html`, `app.js`, and `server.py`.
- [x] **Fresh Organic Rankings:** Recipe cards, modal reviews, and sorting algorithms now rely 100% on genuine user-submitted ratings and logged spins. Unreviewed recipes cleanly display a friendly prompt to be the first to rate without fake star averages or review bar distributions.

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

### 7. Fix Ingredient Categories (Completed ✅)
- [x] **Audit Categorization:** Audited all 172 ingredients in `INGREDIENTS_MASTER` across `recipes-data.js` and `build_recipes_data.py`.
- [x] **Accurate Taxonomy:** Re-categorized misclassified ingredients into a clean 12-category grocery aisle taxonomy:
  - 🥛 **Milk & Liquid Bases (16):** Milk, creamers, Greek yogurts, cream cheese, mascarpone, eggs, butter, almond nog.
  - 🍦 **Protein Powders & Shakes (11):** Whey powder, all ready-to-drink shakes, and high-protein PB Fit / peanut butter powder.
  - 🍮 **Pudding Mixes (3):** Sugar-free cheesecake, chocolate, and vanilla Jell-O instant pudding mixes.
  - 🍯 **Sweeteners & Binders (3):** Allulose/monkfruit sweetener, brown sugar sweetener, and xanthan gum.
  - 🍫 **Cocoa & Baking Staples (5):** Cocoa powder, black cocoa powder, flour, oats, and malted milk powder.
  - 🧂 **Extracts & Flavorings (13):** Vanilla extract/bean paste, peppermint extract, cake batter extract, emulsions, and food colorings.
  - 🥞 **Syrups & Sauces (9):** Syrups, low-calorie ganache, salted caramel sauce/syrup, and chocolate sauce.
  - 🥜 **Nut Butters & Spreads (7):** Peanut butter, Nutella, pistachio butter, strawberry jam, marshmallow fluff/creme, and protein frosting.
  - 🍓 **Fruits & Fresh Produce (20):** Fresh and frozen berries, bananas, apples, mango, citrus zest/juice, peaches, and pumpkin.
  - ☕ **Coffee, Tea & Beverages (9):** Espresso, instant coffee, matcha, loose chai, Thai tea, Diet Dr Pepper, Diet Root Beer, Sprite Zero, and Zero Sugar Lemonade.
  - 🌿 **Spices & Seasonings (8):** Cinnamon, ground cinnamon, nutmeg, cloves, pumpkin pie spice, cayenne pepper, and flaky salt.
  - 🍪 **Mix-Ins, Cookies & Candies (68):** Oreos, cookies, candy bars, M&Ms, chocolate chips, cereals, graham crackers, marshmallows, and nuts.
- [x] **Pantry Drawer Organization:** Collapsible categories in the pantry drawer now display emoji icons, live stock counters (`3/16`), and interactive search filtering.
- [x] **Ingredient Equivalents:** Bidirectional alias matching for interchangeable ingredients (cinnamon $\leftrightarrow$ ground cinnamon, canned pumpkin $\leftrightarrow$ pure pumpkin, Reese's cups $\leftrightarrow$ peanut butter cups, toasted marshmallows $\leftrightarrow$ mini marshmallows).

---

## 🚀 Major Feature Expansions (New Additions)

### 8. 🧊 "Pints in the Freezer" Tracker & 16-Hour Timer (Completed ✅)
- [x] **Freezer Inventory Manager:** Dedicated modal to log and track pints chilling in the freezer (recipe title with autocomplete, mixed date/time with fast presets, container size [Standard 16 oz vs Deluxe 24 oz], custom tweaks/notes).
- [x] **16-Hour Freeze Timer Countdown:** Ninja Creami-calibrated 16-hour countdown timer with live progress bar (% elapsed) and dynamic status badges (`❄️ Chilling (Xh Ym left)` $\rightarrow$ `Ready to Spin! 🍨` at $\ge 16$ hours).
- [x] **One-Tap Spin Logging:** Mark a chilled pint as "Spun & Enjoyed (+1 Made)" to automatically increment user batch count and community spins, remove it from freezer inventory, and trigger celebration toast.
- [x] **Fast Entry Points:**
  - Header action button: `🧊 Freezer (count)` with pulsating emerald green ready glow when pints are ready to spin.
  - Mobile bottom navigation bar item: `🧊 Freezer` with ready badge.
  - Direct 1-tap button inside Recipe Detail Modal: `🧊 Freeze This Pint` (pre-populating recipe title and current size toggle).
  - Recipe modal active chilling status banner (`🧊 1 Pint in Freezer: Chilling / Ready to Spin`).
- [x] **Cloud & Local Persistence:** Stored locally in `localStorage` and automatically synced to Google accounts via `/api/user/sync`, `/api/auth/google`, and `/api/user/data`.

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

### 11. 📦 Grocery PWA & Offline Support (Completed ✅)
- [x] **Full PWA Offline Support:** Installed production Web App Manifest (`manifest.json`) and Service Worker (`service-worker.js`) caching all 149+ recipes, stylesheets, script logic, and vector icons so the app functions 100% offline in signal-dead grocery stores.
- [x] **High-Res App Icons & Metadata:** Generated 192×192, 512×512, maskable icons, apple-touch-icon, and SVG favicon with dark cosmic styling.
- [x] **Offline Status Detection & App Shortcuts:** Live offline indicator banner (`⚡ Offline Mode Active`) and PWA quick-action launch shortcuts (Browse Recipes, My Pantry, Freezer Pints, Build-A-Pint).
- [x] **1-Click Shopping List Export:** Export grocery lists directly to:
  - 📲 **Apple Notes & Reminders** (via native Web Share API with markdown checklist support)
  - 📝 **Google Keep** (1-tap checklist copy and Keep link)
  - 📋 **Copy Checklist** (formatted `- [ ]` checkboxes ready for any to-do app)
  - 🖨️ **Print List**

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

### 15. 👥 User Management & Tiered Recipe Access (Admin Portal & Gated Categories) (Completed ✅)
- [x] **Admin Account & Roles:**
  - Designate admin account(s) by verified Google email in server config (`ADMIN_EMAILS` env var or defaults including `admin@creamicravings.com`, `ahumpo7@gmail.com`, `ahumpo@gmail.com`, `andrew@gmail.com`).
  - Automatically grant admin privileges upon signing in with that verified Google email, with protected root accounts preventing accidental deletion or demotion.
- [x] **User Directory & Permissions Store (`db_users.json`):**
  - Track all registered users who sign in with Google (email, name, avatar, date joined, role, allowed categories, custom pint counts, and spin totals).
  - Configurable default access tier for new sign-ups (free universal "Fan Favorites" pack enabled by default).
- [x] **Admin Dashboard / Management Portal:**
  - Admin-only management portal (`#adminModalOverlay`) accessible exclusively to designated admin accounts via the `👑 Admin Portal` header button.
  - Searchable user table displaying all registered users, last active date, pantry counts, and current category access.
  - Quick summary stat counters: Total Users, Total Admins, and Active All-Access Passes.
  - 1-click category permission toggles per user (grant/revoke "⭐ Fan Favorites", "🥑 Keto", "💪 No Protein", "🥛 Lactose Free", or "👑 All-Access Pass").
  - Role switcher (Admin $\leftrightarrow$ Standard User) with automatic protection of root administrator accounts.
  - User deletion modal action with confirmation safety dialog.
- [x] **Recipe Gating & Lock UI:**
  - Recipe cards check the authenticated user's assigned permissions against recipe category tags.
  - Gated recipe cards display a sleek lock indicator (e.g. `🔒 Keto Pack`, `🔒 No Protein Pack`, `🔒 Lactose Free Pack`).
  - Opening a locked recipe presents an engaging teaser card with user account status and sign-in / request access prompts instead of revealing full secret ingredients and instructions.
  - Quick filter toggle (`🔒 Unlocked Only`) allowing users to easily hide locked recipes or preview the entire cookbook catalog.

### 16. 🔄 1-Tap Smart Ingredient Substitutions ("What Can I Swap?") (Completed ✅)
- [x] **Modal Swap Inspector:** Tapping or clicking any ingredient row or its `🔄 Swap (count)` badge in the Recipe Detail modal opens the Smart Swap Inspector (`#swapModalOverlay`).
- [x] **Curated Creami Swaps Database:** Tested, calibrated substitutions for Ninja Creami freezing mechanics, dual-drive blade shearing, and mouthfeel:
  - *Milk & Liquid Bases:* Fairlife / Ultra-Filtered $\leftrightarrow$ Unsweetened almond milk + 1 tbsp heavy cream (slashes ~60–80 kcal while maintaining creamy emulsion), Ready-To-Drink Protein Shakes (Core Power/Premier), Barista-blend oat milk, and whole milk.
  - *Stabilizers & Gels:* Xanthan gum $\leftrightarrow$ Sugar-Free Jell-O Instant Pudding Mix (7–10g modified cornstarch custard gel), Guar gum (cold-hydrating 1:1), and blended low-fat cottage cheese / light cream cheese.
  - *Protein Powders:* Whey isolate $\leftrightarrow$ Whey/Casein 50/50 blend (explains why casein forms thick gels preventing icy snow), 100% Whey + Greek yogurt, and Plant/Pea-Brown Rice protein (+35ml liquid).
  - *Sweeteners & Freezing Point Modifiers:* Allulose (pure rare sugar that depresses freezing point identical to table sugar without sub-zero recrystallization), Monk Fruit / Erythritol blend, and Pure Maple Syrup / Raw Honey.
  - *Nut Butters & Powders:* PB2 / PB Fit powdered peanut butter $\leftrightarrow$ Creamy peanut butter (with macro adjustment note) and Sunflower seed butter (nut-free).
  - *Cocoa & Chocolate:* Dutch-process cocoa $\leftrightarrow$ Black cocoa powder (the authentic Nabisco Oreo wafer dark chocolate secret).
  - *Creams, Yogurts & Dairy Fats:* 0% Nonfat Plain Greek Yogurt (slashes ~80 kcal and adds 6g protein) and Canned full-fat coconut cream.
  - *Mix-Ins & Cookies:* Mini semi-sweet chocolate chips (prevents rock-hard frozen teeth-breakers; shatters into stracciatella flakes), Oreo Thins, and high-protein cereal.
  - *Fruit & Purees:* 1 medium banana $\leftrightarrow$ 100g pure canned pumpkin puree (miracle volume hack slashing 70 kcal with natural pectin) and wild berries.
  - *Extracts & Flavorings:* Vanilla extract $\leftrightarrow$ Vanilla bean paste and butter/cake batter extract.
- [x] **Texture & Macro Delta Hints:** Every substitution card provides dedicated `🍦 Texture Impact`, `🔥 Macro Delta`, `🌀 Spin Tip`, and `💡 Pro Tip`.
- [x] **Pantry Awareness (`✓ In Your Pantry`):** Real-time emerald green badge indicating if the user already has that substitute in stock in their pantry.
- [x] **1-Tap Dynamic Swap Application & Reversion:** Click "Apply This Swap" to dynamically update the active recipe ingredient and amount in the recipe modal, tag it with an active swap pill, update pantry match calculations, auto-draft a tasting note tag, and persist choices in `localStorage`.
- [x] **1-Tap Revert:** Easy 1-tap "Revert to Original" button in both the ingredient row and the swap inspector card.

### 17. 🔔 Native Push Notifications for 16-Hour Freeze Timer (Completed ✅)
- [x] **PWA / Android Notification Integration:** Prompts for notification permission when the user logs a chilling pint and starts the 16-hour countdown, with an inline status card (`🔔 Enable Alerts` / `Active 🔔` / `Blocked ⚠️`), permission state recovery, and opt-in checkbox on the pint logging form.
- [x] **Background Readiness Alert:** Fires a rich local push notification through the Service Worker when the 16-hour freeze timer reaches zero:
  - *"🍨 Ding! Ready to Spin: [Recipe Name] — Your [16 oz / 24 oz] pint has chilled for 16 hours and is frozen solid! Tap to open spin instructions & log your batch."*
  - Includes vibration pattern, action buttons (`🍨 Spin & Enjoy`, `📖 View Recipe`), and in-app celebratory visual alerts.
- [x] **3-Second Lock Screen Test Alert:** "⚡ Test Alert (3s)" button in the Freezer Tracker modal letting users immediately test and experience their lock screen/notification shade alert with sound and vibration.
- [x] **Direct Spin Shortcut & Dynamic Routing:** Tapping the notification (or action buttons) focuses or opens Creami Cravings directly to that recipe card with recommended spin cycle and batch logger, or 1-tap "Spin & Enjoy Now (+1 Made)" banner right inside the recipe view!

### 18. 🧪 "Build-A-Pint" Custom Recipe Balancing Wizard & Creaminess Score (Completed ✅)
- [x] **Guided 4-Step Pint Creator:** Step-by-step interactive builder to formulate balanced custom recipes:
  - Step 1: Base Liquid (Almond milk, Fairlife [nonfat/2%/whole], coconut milk, oat milk, RTD shakes)
  - Step 2: Protein & Flavor Powders (Whey isolate, casein, whey/casein blend, cocoa, black cocoa, peanut butter powder, espresso)
  - Step 3: Stabilizer & Emulsifier (Xanthan gum, guar gum, sugar-free pudding mix, cream cheese, cottage cheese, Greek yogurt, heavy cream)
  - Step 4: Sweeteners & Mix-Ins (Allulose, erythritol/monk fruit, maple syrup, vanilla extract, Oreos, chocolate chips, PB cups, graham crackers, sprinkles)
- [x] **Real-Time "Creaminess Score" (1 to 10):** Evaluates fat, total dissolved solids, and stabilizer ratios with live meter bar, grade badge, and science-backed diagnostic tips.
- [x] **Automatic Macro Computation & Spin Recommendation:** Live recalculation of total calories, protein, carbs, and fat per pint, auto-recommended spin setting (Lite Ice Cream vs Ice Cream), auto-namer, and 1-click save to "My Recipes".

### 19. 🛡️ Store Compliance, Legal Pages & 1-Tap PWA Install Banner (Completed ✅)
- [x] **Privacy Policy Page (`/privacy.html`):**
  - Full Google Play Console and GDPR compliance policy.
  - Explains local storage caching, Google Sign-In profile usage (email, name, avatar), and zero third-party data tracking.
  - Official trademark & food safety disclaimer: *"Ninja® and Ninja Creami® are registered trademarks of SharkNinja Operating LLC. Creami Cravings is an independent recipe companion app and is not affiliated with, endorsed by, or sponsored by SharkNinja."*
- [x] **Terms of Use Page (`/terms.html`):**
  - Companion legal disclaimer, user-generated custom recipes guidelines, and nutritional estimates disclaimer.
- [x] **1-Tap PWA Install Engine:**
  - Capture the browser `beforeinstallprompt` event on Chromium / Android browsers.
  - Display a sleek `📲 Install App` header action button when the app is installable.
  - Responsive iOS Safari install modal walkthrough ("Tap Share ⎋ → Add to Home Screen ⊞") for iPhone/iPad users.
- [x] **Footer Navigation:**
  - Clean footer with copyright, links to `/privacy.html`, `/terms.html`, backup & restore modal, and PWA install trigger.

### 20. 🔊 Sensory Delight: Web Audio, Haptics & Local Data Backup (Completed ✅)
- [x] **Offline Web Audio Engine:**
  - Pure synthetic Web Audio API sound effects (no external audio files required; functions 100% offline).
  - Mechanical slot machine ticking and triumphant winning chord fanfare for Creami Roulette.
  - Crisp resonant dual-bell chime alert when the 60-second warm water bath or 16-hour freeze timer reaches zero.
  - Pleasant completion dings when logging batches or enjoying pints.
- [x] **Tactile Haptic Feedback:**
  - Native device vibrations (`navigator.vibrate`) on supported mobile devices for Roulette spins, batch logs, and timer completion.
  - Header toggle (`🔊` / `🔇`) to easily mute/unmute audio and haptics anytime with persistent state in `localStorage`.
- [x] **Data Backup & Restore (JSON Export / Import):**
  - 1-Click "Download Kitchen Backup" generating a timestamped `.json` file of all personal custom recipes, pantry staples, freezer pints, and tasting notes.
  - "Restore Backup" file picker with safety validation and merge/overwrite options, allowing frictionless data migration without requiring sign-in.
  - Factory reset safety tool to clear local kitchen caches.

### 21. ✉️ Admin Account Email Setup & Transactional Messaging
- [ ] **Custom Domain Business Email (`admin@creamicravings.com`):**
  - Establish a professional custom domain mailbox or email forwarding route (via Cloudflare Email Routing, Google Workspace, Zoho Mail, or Forward Email).
  - Configure MX records, SPF (`v=spf1`), DKIM, and DMARC policies on DNS to guarantee high deliverability and prevent spoofing.
- [ ] **Transactional Email Provider & SMTP Integration:**
  - Connect a reliable developer-friendly transactional email service (Resend, SendGrid, Amazon SES, or Postmark) with credentials stored securely in `.env`.
  - Build a centralized email utility module in `server.py` supporting branded HTML & plain-text fallback templates.
- [ ] **Admin Inbound & System Event Alerts:**
  - Automated alert emails dispatched to `admin@creamicravings.com` when:
    - A creator submits new recipes or requests a creator account.
    - System health checks detect server or storage exceptions.
    - Contact or feedback forms are submitted by users.
- [ ] **User-Facing Transactional Notifications:**
  - Welcome email on initial registration with quick-start tips and PWA install guide.
  - Account verification or passwordless magic link sign-in option.
  - Creator approval notification and cookbook release alerts to subscribed users.

### 22. 🔍 Search Engine Optimization (SEO) & Web Discoverability
- [ ] **Schema.org JSON-LD Structured Data for Recipes:**
  - Embed valid Google-compliant `Recipe` schema markup (`name`, `description`, `image`, `recipeIngredient`, `recipeInstructions`, `nutrition`, `prepTime`, `cookTime`, `aggregateRating`).
  - Enable Google Rich Snippets (star ratings, calorie counts, photos directly in Google Search and Discover cards).
- [ ] **Dynamic XML Sitemap & Search Engine Directives (`sitemap.xml` & `robots.txt`):**
  - Deploy a dynamically generated `/sitemap.xml` indexing all public recipes, creator showcase pages, and guides.
  - Optimize `/robots.txt` to allow complete search engine crawling while disallowing administrative or sensitive endpoints (`/api/admin/*`).
- [ ] **Social Sharing Cards (Open Graph & Twitter Cards):**
  - Add dynamic `<meta property="og:...">` and `<meta name="twitter:...">` tags.
  - Ensure recipe links shared across iMessage, Discord, Twitter/X, and Facebook render rich cards with high-res ice cream pint photos, macro callouts, and creator attribution.
- [ ] **Canonical URLs & Indexable Recipe Routing:**
  - Implement clean permalinks / deep linking (e.g. `/recipe/[slug]` or prerendered static snapshots) so search engine crawlers can index individual recipe pages without requiring client-side JavaScript execution.
  - Specify canonical tags (`<link rel="canonical">`) to consolidate link equity and eliminate duplicate content penalties.
- [ ] **Core Web Vitals & Target Keyword Strategy:**
  - Optimize Lighthouse SEO and Performance scores (LCP, CLS, INP) for fast crawler rendering.
  - On-page keyword optimization targeting high-intent search terms (e.g., *"Ninja Creami protein ice cream recipes"*, *"low calorie ninja creami"*, *"keto creami recipes"*, *"ninja creami swaps"*).

---

## 🏆 Remaining Items Ranked by Logical Order

| Step | Task | Why & Scope | Est. Effort | Status |
| :---: | :--- | :--- | :--- | :--- |
| **Step 5** | **Item 19: 🛡️ Store Compliance & 1-Tap PWA Install** | Compliance `/privacy.html` (mandatory for Play Store), `/terms.html`, trademark disclaimers, and 1-tap `📲 Install App` prompt. | 🟢 ~15–20 mins | ✅ **Done** |
| **Step 6** | **Item 20: 🔊 Audio, Haptics & Local Data Backup** | Web Audio slot sounds/timer chimes, mobile haptics, and JSON export/import for disaster recovery. | 🟢 ~20–25 mins | ✅ **Done** |
| **Step 7** | **Item 1: 🔑 Finish Google Sign-In** | Production Google Cloud Console OAuth 2.0 Client ID configured in `.env` and `app.js` with One-Tap and theme matching. | ⚪ Completed | ✅ **Done** |
| **Step 8** | **Item 14: 🤖 Google Play Store Android App (Bubblewrap)** | Generate signed `.aab` bundle, deploy `assetlinks.json`, generate $1024\times500$ banner and $512\times512$ store icon. | 🟠 ~30–45 mins | ⏳ **Next** |
| **Step 9** | **Item 21: ✉️ Admin Email Setup & Notifications** | Domain inbox (`admin@creamicravings.com`), transactional SMTP (Resend/SendGrid), SPF/DKIM/DMARC DNS, and admin alert triggers. | 🟡 ~25–35 mins | 📋 **Planned** |
| **Step 10** | **Item 22: 🔍 SEO & Rich Recipe Snippets** | Schema.org JSON-LD recipes for Google rich snippets, sitemap.xml, robots.txt, Open Graph preview cards, and crawlable permalinks. | 🟡 ~30–40 mins | 📋 **Planned** |



