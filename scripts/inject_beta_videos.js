const fs = require('fs');

const matched = JSON.parse(fs.readFileSync('matched_recipe_videos.json', 'utf8'));
let recipesData = fs.readFileSync('recipes-data.js', 'utf8');

// Load full RECIPES_MASTER
const fn = new Function(recipesData + '; return { INGREDIENT_CATEGORIES, CREATORS_MASTER, BOOKS_MASTER, INGREDIENTS_MASTER, RECIPES_MASTER };');
const loaded = fn();

let count = 0;
loaded.RECIPES_MASTER.forEach(r => {
  if (matched[r.id] && matched[r.id].videoUrl) {
    r.videoUrl = matched[r.id].videoUrl;
    count++;
  }
});

console.log(`Injected videoUrl into ${count} recipes.`);

// Reconstruct recipes-data.js cleanly preserving all master arrays
const newContent = `// Creami Cravings Master Database & Pantry Matcher

const INGREDIENT_CATEGORIES = ${JSON.stringify(loaded.INGREDIENT_CATEGORIES, null, 2)};

const CREATORS_MASTER = ${JSON.stringify(loaded.CREATORS_MASTER, null, 2)};

const BOOKS_MASTER = ${JSON.stringify(loaded.BOOKS_MASTER, null, 2)};

const INGREDIENTS_MASTER = ${JSON.stringify(loaded.INGREDIENTS_MASTER, null, 2)};

const RECIPES_MASTER = ${JSON.stringify(loaded.RECIPES_MASTER, null, 2)};
`;

fs.writeFileSync('recipes-data.js', newContent, 'utf8');
console.log('Successfully updated recipes-data.js!');
