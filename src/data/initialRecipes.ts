import { Recipe } from "../types";

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: "rec-1",
    title: "Creamy Tuscan Garlic Butter Chicken",
    description: "Tender pan-seared chicken breasts enveloped in a luscious garlic sun-dried tomato and baby spinach cream sauce.",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=80",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Italian",
    category: "Dinner",
    tags: ["High Protein", "Quick <30m", "Keto", "Weeknight Dinner"],
    cookbooks: ["Weeknight Dinners", "High Protein", "Favorites"],
    isFavorite: true,
    rating: 4.9,
    chefNotes: "Pat the chicken dry with paper towels before seasoning to achieve a golden-brown crust. Serve over al dente fettuccine or crusty sourdough.",
    nutrition: {
      calories: 460,
      protein: 44,
      carbs: 8,
      fat: 28,
      fiber: 2
    },
    ingredients: [
      { id: "i1", amount: 2, unit: "large", name: "boneless chicken breasts", notes: "sliced horizontally into cutlets", category: "Meat & Seafood" },
      { id: "i2", amount: 2, unit: "tbsp", name: "extra virgin olive oil", category: "Oils & Condiments" },
      { id: "i3", amount: 2, unit: "tbsp", name: "unsalted butter", category: "Dairy & Eggs" },
      { id: "i4", amount: 5, unit: "cloves", name: "fresh garlic", notes: "finely minced", category: "Produce" },
      { id: "i5", amount: 0.5, unit: "cup", name: "sun-dried tomatoes", notes: "drained and chopped", category: "Pantry & Spices" },
      { id: "i6", amount: 1, unit: "cup", name: "heavy cream", category: "Dairy & Eggs" },
      { id: "i7", amount: 3, unit: "cups", name: "fresh baby spinach", notes: "packed", category: "Produce" },
      { id: "i8", amount: 0.5, unit: "cup", name: "Parmigiano-Reggiano", notes: "freshly grated", category: "Dairy & Eggs" },
      { id: "i9", amount: 0.5, unit: "tsp", name: "Italian seasoning & red pepper flakes", category: "Pantry & Spices" }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Season the chicken cutlets generously with salt, freshly ground black pepper, and Italian herb blend on both sides.",
        tip: "Ensuring cutlets are uniform in thickness ensures even cooking."
      },
      {
        stepNumber: 2,
        instruction: "Heat olive oil and 1 tablespoon butter in a large skillet over medium-high heat. Sear chicken cutlets for 5 minutes per side until golden and cooked through (165°F internally). Transfer to a warm plate.",
        timerMinutes: 10,
        tip: "Avoid overcrowding the pan; sear in batches if needed for maximum caramelization."
      },
      {
        stepNumber: 3,
        instruction: "Reduce heat to medium. Melt the remaining butter, add minced garlic and sun-dried tomatoes, and sauté for 1 minute until fragrant.",
        timerMinutes: 1,
        tip: "Do not let garlic brown too deeply or it will become bitter."
      },
      {
        stepNumber: 4,
        instruction: "Pour in heavy cream and chicken broth (if using). Bring to a gentle simmer for 3 minutes, then stir in grated Parmesan until smooth and velvety.",
        timerMinutes: 3,
        tip: "Turn heat down to low before adding cheese to prevent clumping."
      },
      {
        stepNumber: 5,
        instruction: "Add baby spinach and cook for 2 minutes until wilted. Return chicken and rested juices to the skillet, spoon sauce over the top, and simmer for 2 minutes before serving.",
        timerMinutes: 2
      }
    ],
    createdAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "rec-2",
    title: "15-Minute Chili Crisp Peanut Noodles",
    description: "Silky noodles tossed in a rich, savory peanut, garlic, soy, and spicy chili crisp sauce with fresh scallions and toasted sesame.",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1000&q=80",
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: "Easy",
    cuisine: "Asian Fusion",
    category: "Lunch",
    tags: ["Quick <30m", "Vegetarian", "Vegan", "Budget-Friendly"],
    cookbooks: ["Weeknight Dinners", "Quick Weeknights"],
    isFavorite: true,
    rating: 4.8,
    chefNotes: "Reserve a couple tablespoons of hot noodle water to loosen the peanut sauce into a restaurant-quality glossy glaze.",
    nutrition: {
      calories: 420,
      protein: 14,
      carbs: 58,
      fat: 16,
      fiber: 4
    },
    ingredients: [
      { id: "i21", amount: 7, unit: "oz", name: "ramen or udon noodles", notes: "dry or fresh", category: "Pantry & Spices" },
      { id: "i22", amount: 3, unit: "tbsp", name: "creamy peanut butter", notes: "or tahini", category: "Pantry & Spices" },
      { id: "i23", amount: 2, unit: "tbsp", name: "low-sodium soy sauce", category: "Oils & Condiments" },
      { id: "i24", amount: 1, unit: "tbsp", name: "toasted sesame oil", category: "Oils & Condiments" },
      { id: "i25", amount: 1, unit: "tbsp", name: "chili crisp oil", notes: "adjust for heat preference", category: "Oils & Condiments" },
      { id: "i26", amount: 1, unit: "tbsp", name: "maple syrup or honey", category: "Pantry & Spices" },
      { id: "i27", amount: 2, unit: "cloves", name: "garlic", notes: "grated on a microplane", category: "Produce" },
      { id: "i28", amount: 2, unit: "stalks", name: "scallions", notes: "thinly sliced", category: "Produce" },
      { id: "i29", amount: 1, unit: "tbsp", name: "toasted sesame seeds", category: "Pantry & Spices" }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Bring a pot of salted water to a rapid boil. Cook noodles according to package instructions (about 4–5 minutes). Reserve 1/4 cup starchy cooking water, then drain noodles.",
        timerMinutes: 5,
        tip: "Rinse under cool water briefly if using fresh ramen to stop overcooking."
      },
      {
        stepNumber: 2,
        instruction: "In a medium bowl, whisk together peanut butter, soy sauce, sesame oil, chili crisp, sweetener, grated garlic, and 2 tablespoons of hot noodle water until smooth and creamy.",
        tip: "Whisking vigorously helps emulsify the peanut butter into a rich glossy sauce."
      },
      {
        stepNumber: 3,
        instruction: "Toss hot noodles directly into the bowl with the peanut sauce. Garnish generously with sliced scallions, crushed peanuts, and toasted sesame seeds.",
        timerMinutes: 1
      }
    ],
    createdAt: "2026-03-02T12:00:00Z"
  },
  {
    id: "rec-3",
    title: "Classic Shakshuka with Feta & Fresh Herbs",
    description: "Vibrant North African and Middle Eastern skillet of gently poached eggs in a simmering, spiced tomato, roasted bell pepper, and cumin sauce.",
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1000&q=80",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    difficulty: "Easy",
    cuisine: "Mediterranean",
    category: "Breakfast",
    tags: ["Vegetarian", "High Protein", "Gluten-Free", "Brunch"],
    cookbooks: ["Favorites", "Healthy Eats"],
    isFavorite: false,
    rating: 5.0,
    chefNotes: "Cover the pan during the final egg poach for gently cooked whites while keeping the golden yolks gloriously runny.",
    nutrition: {
      calories: 290,
      protein: 16,
      carbs: 18,
      fat: 17,
      fiber: 4
    },
    ingredients: [
      { id: "i31", amount: 2, unit: "tbsp", name: "extra virgin olive oil", category: "Oils & Condiments" },
      { id: "i32", amount: 1, unit: "medium", name: "yellow onion", notes: "diced", category: "Produce" },
      { id: "i33", amount: 1, unit: "large", name: "red bell pepper", notes: "stemmed, seeded and sliced", category: "Produce" },
      { id: "i34", amount: 4, unit: "cloves", name: "garlic", notes: "thinly sliced", category: "Produce" },
      { id: "i35", amount: 1, unit: "tsp", name: "ground cumin & smoked paprika", category: "Pantry & Spices" },
      { id: "i36", amount: 28, unit: "oz", name: "crushed San Marzano tomatoes", category: "Pantry & Spices" },
      { id: "i37", amount: 5, unit: "large", name: "fresh pasture-raised eggs", category: "Dairy & Eggs" },
      { id: "i38", amount: 3, unit: "oz", name: "Greek feta cheese", notes: "crumbled", category: "Dairy & Eggs" },
      { id: "i39", amount: 0.25, unit: "cup", name: "fresh cilantro and parsley", notes: "chopped", category: "Produce" }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Heat olive oil in a deep 12-inch cast iron skillet over medium heat. Add onion and bell pepper, sautéing for 6–8 minutes until soft and caramelized at edges.",
        timerMinutes: 7,
        tip: "A cast iron skillet holds heat best for even egg poaching."
      },
      {
        stepNumber: 2,
        instruction: "Stir in sliced garlic, ground cumin, and smoked paprika. Toast spices for 1 minute until fragrant.",
        timerMinutes: 1
      },
      {
        stepNumber: 3,
        instruction: "Pour in crushed tomatoes. Season with 1/2 tsp salt and pepper. Reduce heat to medium-low and simmer gently for 10 minutes until sauce thickens slightly.",
        timerMinutes: 10
      },
      {
        stepNumber: 4,
        instruction: "Use a spoon to create 5 small indentations in the sauce. Crack an egg directly into each well. Cover skillet with a lid and cook on low for 5–7 minutes until egg whites are set and yolks remain soft.",
        timerMinutes: 6,
        tip: "Keep an eye on the eggs in the last 2 minutes to achieve your ideal yolk doneness."
      },
      {
        stepNumber: 5,
        instruction: "Remove lid, scatter crumbled feta cheese, freshly cracked pepper, and fresh cilantro over the top. Serve immediately with warm pita bread.",
        timerMinutes: 1
      }
    ],
    createdAt: "2026-03-03T09:30:00Z"
  },
  {
    id: "rec-4",
    title: "Miso Maple Glazed Wild Salmon",
    description: "Flaky pan-seared salmon fillets caramelized in an umami-packed white miso, pure maple syrup, and ginger glaze.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80",
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: "Medium",
    cuisine: "Japanese",
    category: "Dinner",
    tags: ["High Protein", "Quick <30m", "Gluten-Free", "Healthy Eats"],
    cookbooks: ["High Protein", "Weeknight Dinners", "Favorites"],
    isFavorite: true,
    rating: 4.9,
    chefNotes: "Baste the salmon continuously with the glaze during the final two minutes for an irresistible shiny lacquered finish.",
    nutrition: {
      calories: 380,
      protein: 36,
      carbs: 14,
      fat: 19,
      fiber: 1
    },
    ingredients: [
      { id: "i41", amount: 2, unit: "fillets (6 oz each)", name: "wild salmon", notes: "skin-on, pin bones removed", category: "Meat & Seafood" },
      { id: "i42", amount: 2, unit: "tbsp", name: "sweet white miso paste", category: "Pantry & Spices" },
      { id: "i43", amount: 1.5, unit: "tbsp", name: "pure maple syrup", category: "Pantry & Spices" },
      { id: "i44", amount: 1, unit: "tbsp", name: "mirin or rice vinegar", category: "Oils & Condiments" },
      { id: "i45", amount: 1, unit: "tsp", name: "fresh ginger", notes: "finely grated", category: "Produce" },
      { id: "i46", amount: 1, unit: "tbsp", name: "avocado oil", category: "Oils & Condiments" },
      { id: "i47", amount: 1, unit: "tbsp", name: "sliced scallions & sesame seeds", notes: "for garnish", category: "Produce" }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "In a small bowl, whisk together white miso paste, pure maple syrup, mirin, and grated ginger until silky and uniform.",
        tip: "White miso is mild, sweet, and doesn't overpower delicate salmon."
      },
      {
        stepNumber: 2,
        instruction: "Heat avocado oil in an oven-safe skillet over medium-high heat. Season salmon fillets lightly with salt. Place salmon skin-side down and press gently with a spatula for 20 seconds. Sear for 4 minutes until skin is crispy.",
        timerMinutes: 4,
        tip: "Pressing the fish keeps the skin flat so the entire surface crisps evenly."
      },
      {
        stepNumber: 3,
        instruction: "Flip fillets. Brush the miso glaze generously over the top and sides of the salmon. Reduce heat to medium and cook for 3-4 minutes, spooning bubbling glaze over fish until cooked to medium.",
        timerMinutes: 4
      },
      {
        stepNumber: 4,
        instruction: "Plate over steamed jasmine rice or bok choy, garnishing with toasted sesame seeds and fresh scallions.",
        timerMinutes: 1
      }
    ],
    createdAt: "2026-03-04T18:00:00Z"
  },
  {
    id: "rec-5",
    title: "Artisan Sourdough French Toast with Berry Compote",
    description: "Thick golden slices of sourdough soaked in rich vanilla cinnamon custard, topped with warm honey-simmered blackberries and fresh mint.",
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1000&q=80",
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 4,
    difficulty: "Easy",
    cuisine: "French American",
    category: "Breakfast",
    tags: ["Vegetarian", "Family Favorite", "Dessert"],
    cookbooks: ["Favorites", "Family Desserts"],
    isFavorite: false,
    rating: 4.7,
    chefNotes: "Day-old sourdough absorbs custard without disintegrating, giving the interior a pillowy soufflé-like crumb.",
    nutrition: {
      calories: 340,
      protein: 11,
      carbs: 45,
      fat: 13,
      fiber: 3
    },
    ingredients: [
      { id: "i51", amount: 8, unit: "slices", name: "thick-cut sourdough or brioche", notes: "slightly stale works best", category: "Bakery" },
      { id: "i52", amount: 4, unit: "large", name: "eggs", category: "Dairy & Eggs" },
      { id: "i53", amount: 0.75, unit: "cup", name: "whole milk or oat milk", category: "Dairy & Eggs" },
      { id: "i54", amount: 1, unit: "tsp", name: "pure vanilla extract", category: "Pantry & Spices" },
      { id: "i55", amount: 1, unit: "tsp", name: "ground cinnamon & pinch of nutmeg", category: "Pantry & Spices" },
      { id: "i56", amount: 2, unit: "tbsp", name: "butter", category: "Dairy & Eggs" },
      { id: "i57", amount: 1.5, unit: "cups", name: "fresh or frozen mixed berries", category: "Produce" },
      { id: "i58", amount: 2, unit: "tbsp", name: "pure maple syrup", category: "Pantry & Spices" }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "In a wide shallow dish, vigorously whisk eggs, milk, vanilla extract, cinnamon, nutmeg, and a pinch of salt until frothy.",
        tip: "Whisk well so no unincorporated egg whites remain on the crust."
      },
      {
        stepNumber: 2,
        instruction: "In a small saucepan over medium heat, combine berries and maple syrup. Simmer for 5 minutes until berries burst into a glossy warm compote.",
        timerMinutes: 5
      },
      {
        stepNumber: 3,
        instruction: "Melt 1 tbsp butter in a large skillet or griddle over medium heat. Dip sourdough slices into custard, letting each side soak for 20 seconds.",
        timerMinutes: 1
      },
      {
        stepNumber: 4,
        instruction: "Cook slices for 3–4 minutes per side until deeply golden and slightly puffed. Serve hot drenched with warm berry compote.",
        timerMinutes: 7
      }
    ],
    createdAt: "2026-03-05T08:15:00Z"
  },
  {
    id: "rec-6",
    title: "Classic Spaghetti Carbonara Tradizionale",
    description: "The Roman standard: al dente spaghetti tossed with crispy guanciale, rich egg yolks, aged Pecorino Romano, and cracked black pepper.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1000&q=80",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    difficulty: "Medium",
    cuisine: "Italian",
    category: "Dinner",
    tags: ["Classic", "Quick <30m", "Pasta", "Weeknight Dinners"],
    cookbooks: ["Weeknight Dinners", "Favorites"],
    isFavorite: true,
    rating: 5.0,
    chefNotes: "Take pan completely off the heat before swirling the egg yolk and Pecorino mixture to prevent curdling into scrambled eggs.",
    nutrition: {
      calories: 540,
      protein: 26,
      carbs: 62,
      fat: 22,
      fiber: 3
    },
    ingredients: [
      { id: "i61", amount: 14, unit: "oz", name: "bronze-cut spaghetti", category: "Pantry & Spices" },
      { id: "i62", amount: 6, unit: "oz", name: "guanciale or thick pancetta", notes: "cut into matchsticks", category: "Meat & Seafood" },
      { id: "i63", amount: 4, unit: "large", name: "egg yolks + 1 whole egg", category: "Dairy & Eggs" },
      { id: "i64", amount: 1.5, unit: "cups", name: "Pecorino Romano DOP", notes: "freshly grated", category: "Dairy & Eggs" },
      { id: "i65", amount: 1.5, unit: "tsp", name: "whole black peppercorns", notes: "coarsely cracked", category: "Pantry & Spices" }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Bring a large pot of water to a gentle boil with modest salt. Drop spaghetti and cook until 2 minutes shy of al dente.",
        timerMinutes: 8,
        tip: "Guanciale and Pecorino are very salty; salt cooking water less than usual."
      },
      {
        stepNumber: 2,
        instruction: "In a wide skillet over medium-low heat, render guanciale until crispy and deep golden. Transfer half the crispy pork to a plate, leaving the hot rendered fat in the pan.",
        timerMinutes: 6
      },
      {
        stepNumber: 3,
        instruction: "In a mixing bowl, vigorously whisk together egg yolks, whole egg, grated Pecorino Romano, and freshly cracked black pepper into a thick paste.",
        tip: "The residual heat of pasta water will cook this into a glossy, velvety emulsion."
      },
      {
        stepNumber: 4,
        instruction: "Transfer spaghetti directly into the guanciale skillet with 1/3 cup hot starchy water. Remove pan from heat. Vigorously fold in the egg-cheese mixture, tossing continuously until an ultra-creamy sauce clings to every strand.",
        timerMinutes: 2
      },
      {
        stepNumber: 5,
        instruction: "Plate in warmed bowls, crown with reserved crispy guanciale, extra Pecorino, and more coarse black pepper.",
        timerMinutes: 1
      }
    ],
    createdAt: "2026-03-06T19:00:00Z"
  },
  {
    id: "rec-7",
    title: "Crispy Beef Birria Tacos con Consomé",
    description: "Slow-braised beef chuck in a smoky guajillo and ancho chili broth, griddled in broth-dipped corn tortillas with melted Oaxaca cheese.",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=80",
    prepTimeMinutes: 25,
    cookTimeMinutes: 60,
    servings: 6,
    difficulty: "Hard",
    cuisine: "Mexican",
    category: "Dinner",
    tags: ["High Protein", "Slow-Cooked", "Street Food", "Family Feast"],
    cookbooks: ["High Protein", "Favorites"],
    isFavorite: true,
    rating: 4.9,
    chefNotes: "Dip the corn tortillas into the top chili-fat layer of the warm consomé before putting them on the screaming hot skillet for maximum crunch.",
    nutrition: {
      calories: 620,
      protein: 42,
      carbs: 45,
      fat: 32,
      fiber: 4
    },
    ingredients: [
      { id: "i71", amount: 3, unit: "lbs", name: "beef chuck roast & short ribs", category: "Meat & Seafood" },
      { id: "i72", amount: 5, unit: "pieces", name: "dried guajillo chilies", notes: "seeded and stemmed", category: "Pantry & Spices" },
      { id: "i73", amount: 3, unit: "pieces", name: "dried ancho chilies", notes: "seeded and stemmed", category: "Pantry & Spices" },
      { id: "i74", amount: 6, unit: "cloves", name: "garlic", category: "Produce" },
      { id: "i75", amount: 1, unit: "tsp", name: "Mexican oregano, cumin & cloves", category: "Pantry & Spices" },
      { id: "i76", amount: 16, unit: "pieces", name: "corn tortillas", category: "Pantry & Spices" },
      { id: "i77", amount: 2, unit: "cups", name: "Oaxaca or mozzarella cheese", notes: "shredded", category: "Dairy & Eggs" },
      { id: "i78", amount: 1, unit: "cup", name: "diced white onion & fresh cilantro", category: "Produce" }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Toast dried chilies in a dry pot for 2 minutes. Add 3 cups boiling water and steep for 10 minutes. Blend with garlic, onion, vinegar, and spices into a smooth adobo purée.",
        timerMinutes: 10
      },
      {
        stepNumber: 2,
        instruction: "Sear seasoned beef chunks in a Dutch oven until browned. Pour chili purée and beef broth over the meat. Cover and simmer gently for 2 hours until fork tender.",
        timerMinutes: 60,
        tip: "Skim and reserve the fragrant orange rendered fat from the surface of the broth."
      },
      {
        stepNumber: 3,
        instruction: "Shred the tender beef with two forks. Ladle warm consomé into individual dipping bowls garnished with diced onions and cilantro.",
        timerMinutes: 5
      },
      {
        stepNumber: 4,
        instruction: "Dip corn tortillas into the reserved chili fat, lay onto a hot griddle, top with shredded cheese and juicy birria beef. Fold in half and fry until shatteringly crispy on both sides.",
        timerMinutes: 6
      }
    ],
    createdAt: "2026-03-07T14:30:00Z"
  },
  {
    id: "rec-8",
    title: "San Sebastián Basque Burnt Cheesecake",
    description: "Iconic Spanish dessert baked at high heat until deeply caramelized and scorched on top, revealing an impossibly rich custardy center.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=80",
    prepTimeMinutes: 15,
    cookTimeMinutes: 45,
    servings: 10,
    difficulty: "Easy",
    cuisine: "Spanish",
    category: "Dessert",
    tags: ["Baking", "Dessert", "Gluten-Free", "Entertaining"],
    cookbooks: ["Family Desserts", "Favorites"],
    isFavorite: false,
    rating: 4.9,
    chefNotes: "Do not fear the dark scorched top! The burnt sugar flavor is the essential signature that balances the velvety cream cheese interior.",
    nutrition: {
      calories: 390,
      protein: 7,
      carbs: 28,
      fat: 28,
      fiber: 0
    },
    ingredients: [
      { id: "i81", amount: 2, unit: "lbs", name: "full-fat cream cheese", notes: "softened at room temperature", category: "Dairy & Eggs" },
      { id: "i82", amount: 1.5, unit: "cups", name: "granulated sugar", category: "Pantry & Spices" },
      { id: "i83", amount: 6, unit: "large", name: "fresh eggs", category: "Dairy & Eggs" },
      { id: "i84", amount: 2, unit: "cups", name: "heavy cream", category: "Dairy & Eggs" },
      { id: "i85", amount: 1, unit: "tsp", name: "pure vanilla bean extract & kosher salt", category: "Pantry & Spices" },
      { id: "i86", amount: 2, unit: "tbsp", name: "all-purpose flour or cornstarch", category: "Pantry & Spices" }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: "Preheat oven to 425°F (220°C). Line a 9-inch springform pan with two overlapping sheets of parchment paper, leaving 2 inches of overhang.",
        tip: "Creasing the parchment against the pan creates the rustic ruffled edge."
      },
      {
        stepNumber: 2,
        instruction: "Beat room temperature cream cheese and sugar in a stand mixer on medium speed for 2 minutes until completely smooth.",
        timerMinutes: 2
      },
      {
        stepNumber: 3,
        instruction: "Add eggs one at a time, mixing well between each addition. Pour in heavy cream, vanilla, and salt. Sift flour over the batter and gently mix until glossy and combined.",
        timerMinutes: 3
      },
      {
        stepNumber: 4,
        instruction: "Pour batter into prepared pan. Bake for 45–50 minutes until top is deeply browned and nearly black in spots, while the center still jiggles when gently shaken.",
        timerMinutes: 45,
        tip: "Cool completely at room temperature for 3 hours before slicing."
      }
    ],
    createdAt: "2026-03-08T11:00:00Z"
  }
];

export const INITIAL_COOKBOOKS = [
  { id: "cb-all", name: "All Recipes", description: "Your complete culinary collection", coverEmoji: "🍳" },
  { id: "cb-favs", name: "Favorites", description: "Top-rated family staples", coverEmoji: "❤️" },
  { id: "cb-weeknight", name: "Weeknight Dinners", description: "Quick, comforting meals ready in under 30 minutes", coverEmoji: "⏱️" },
  { id: "cb-protein", name: "High Protein", description: "Macro-balanced fuel for active days", coverEmoji: "💪" },
  { id: "cb-healthy", name: "Healthy Eats", description: "Nourishing, whole-food recipes", coverEmoji: "🥗" },
  { id: "cb-dessert", name: "Family Desserts", description: "Sweet bakes and weekend treats", coverEmoji: "🍰" }
];
