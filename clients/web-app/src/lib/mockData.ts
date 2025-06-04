export const mockChefs = [
  {
    id: 1,
    name: "Chef Maria Rossi",
    cuisine: "Italian",
    bio: "Authentic Italian chef with 15 years of experience from Tuscany. Specializes in traditional pasta and wood-fired pizzas.",
    rating: 4.8,
    image: "/chef1.jpg",
  },
  {
    id: 2,
    name: "Chef Hiroshi Tanaka",
    cuisine: "Japanese",
    bio: "Master sushi chef trained in Tokyo. Expert in traditional Japanese cuisine with modern presentation.",
    rating: 4.9,
    image: "/chef2.jpg",
  },
  {
    id: 3,
    name: "Chef Pierre Dubois",
    cuisine: "French",
    bio: "Classically trained French chef from Lyon. Passionate about fine dining and wine pairings.",
    rating: 4.7,
    image: "/chef3.jpg",
  },
  {
    id: 4,
    name: "Chef Rajesh Patel",
    cuisine: "Indian",
    bio: "Specialist in authentic Indian cuisine from Mumbai. Expert in spices and traditional cooking methods.",
    rating: 4.6,
    image: "/chef4.jpg",
  },
  {
    id: 5,
    name: "Chef Isabella Garcia",
    cuisine: "Mexican",
    bio: "Traditional Mexican chef from Oaxaca. Known for authentic mole and handmade tortillas.",
    rating: 4.8,
    image: "/chef5.jpg",
  },
  {
    id: 6,
    name: "Chef David Kim",
    cuisine: "Korean",
    bio: "Modern Korean chef blending traditional flavors with contemporary techniques.",
    rating: 4.5,
    image: "/chef6.jpg",
  },
];

export const mockCategories = [
  // Italian Chef Categories
  { id: 1, name: "Appetizers" },
  { id: 2, name: "Pasta & Risotto" },
  { id: 3, name: "Pizza" },
  { id: 4, name: "Desserts" },

  // Japanese Chef Categories
  { id: 5, name: "Sushi & Sashimi" },
  { id: 6, name: "Ramen & Noodles" },
  { id: 7, name: "Tempura" },
  { id: 8, name: "Traditional Dishes" },

  // French Chef Categories
  { id: 9, name: "Hors d'oeuvres" },
  { id: 10, name: "Soups & Salads" },
  { id: 11, name: "Main Courses" },
  { id: 12, name: "Pastries" },

  // Indian Chef Categories
  { id: 13, name: "Appetizers" },
  { id: 14, name: "Curries" },
  { id: 15, name: "Tandoor Specialties" },
  { id: 16, name: "Breads & Rice" },

  // Mexican Chef Categories
  { id: 17, name: "Antojitos" },
  { id: 18, name: "Tacos & Quesadillas" },
  { id: 19, name: "Main Dishes" },
  { id: 20, name: "Drinks" },

  // Korean Chef Categories
  { id: 21, name: "Banchan" },
  { id: 22, name: "BBQ & Grilled" },
  { id: 23, name: "Stews & Soups" },
  { id: 24, name: "Rice & Noodles" },
];

export const mockMenuItems = [
  // Italian Chef Items
  {
    id: 1,
    name: "Bruschetta Trio",
    description:
      "Three varieties: classic tomato, mushroom truffle, and ricotta honey",
    price: 12.99,
    preparationTime: 15,
    rating: 4.7,
    image: "/bruschetta.jpg",
    categoryId: 1,
    chefId: 1,
    customizableOptions: [
      { id: 1, name: "Extra Truffle Oil", price: 2.5 },
      { id: 2, name: "Gluten-Free Bread", price: 2.0 },
      { id: 3, name: "Vegan Option", price: 0 },
    ],
  },
  {
    id: 19,
    name: "Antipasto Platter",
    description:
      "Selection of cured meats, cheeses, olives, and marinated vegetables",
    price: 18.99,
    preparationTime: 10,
    rating: 4.5,
    image: "/antipasto.jpg",
    categoryId: 1,
    chefId: 1,
    customizableOptions: [
      { id: 46, name: "Extra Prosciutto", price: 4.0 },
      { id: 47, name: "Vegetarian Version", price: -2.0 },
      { id: 48, name: "Add Burrata", price: 5.0 },
    ],
  },
  {
    id: 20,
    name: "Arancini Siciliani",
    description:
      "Crispy risotto balls stuffed with mozzarella and peas, served with marinara",
    price: 10.99,
    preparationTime: 18,
    rating: 4.6,
    image: "/arancini.jpg",
    categoryId: 1,
    chefId: 1,
    customizableOptions: [
      { id: 49, name: "Spicy Marinara", price: 0 },
      { id: 50, name: "Extra Cheese Filling", price: 2.0 },
    ],
  },
  {
    id: 2,
    name: "Spaghetti Carbonara",
    description:
      "Classic Roman pasta with eggs, pecorino cheese, guanciale, and black pepper",
    price: 18.99,
    preparationTime: 20,
    rating: 4.9,
    image: "/carbonara.jpg",
    categoryId: 2,
    chefId: 1,
    customizableOptions: [
      { id: 4, name: "Extra Guanciale", price: 4.0 },
      { id: 5, name: "Vegetarian Version", price: 0 },
      { id: 6, name: "Extra Pecorino", price: 2.0 },
    ],
  },
  {
    id: 21,
    name: "Risotto ai Porcini",
    description:
      "Creamy Arborio rice with wild porcini mushrooms and Parmigiano-Reggiano",
    price: 22.99,
    preparationTime: 35,
    rating: 4.8,
    image: "/risotto.jpg",
    categoryId: 2,
    chefId: 1,
    customizableOptions: [
      { id: 51, name: "Extra Mushrooms", price: 3.5 },
      { id: 52, name: "Truffle Oil Drizzle", price: 4.0 },
      { id: 53, name: "Vegan Cheese", price: 2.0 },
    ],
  },
  {
    id: 22,
    name: "Fettuccine Alfredo",
    description:
      "Fresh fettuccine in rich butter and Parmigiano-Reggiano cream sauce",
    price: 16.99,
    preparationTime: 15,
    rating: 4.4,
    image: "/alfredo.jpg",
    categoryId: 2,
    chefId: 1,
    customizableOptions: [
      { id: 54, name: "Add Grilled Chicken", price: 6.0 },
      { id: 55, name: "Add Shrimp", price: 8.0 },
      { id: 56, name: "Extra Cheese", price: 2.0 },
    ],
  },
  {
    id: 23,
    name: "Penne Puttanesca",
    description:
      "Penne pasta with tomatoes, olives, capers, anchovies, and garlic",
    price: 15.99,
    preparationTime: 18,
    rating: 4.6,
    image: "/puttanesca.jpg",
    categoryId: 2,
    chefId: 1,
    customizableOptions: [
      { id: 57, name: "No Anchovies", price: 0 },
      { id: 58, name: "Extra Olives", price: 1.5 },
      { id: 59, name: "Spicy Level", price: 0 },
    ],
  },
  {
    id: 3,
    name: "Margherita Pizza",
    description:
      "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil",
    price: 16.99,
    preparationTime: 12,
    rating: 4.8,
    image: "/margherita.jpg",
    categoryId: 3,
    chefId: 1,
    customizableOptions: [
      { id: 7, name: "Buffalo Mozzarella", price: 3.5 },
      { id: 8, name: "Gluten-Free Crust", price: 3.0 },
      { id: 9, name: "Extra Basil", price: 1.0 },
    ],
  },
  {
    id: 24,
    name: "Quattro Stagioni Pizza",
    description:
      "Four seasons pizza with mushrooms, artichokes, ham, and olives",
    price: 21.99,
    preparationTime: 15,
    rating: 4.7,
    image: "/quattrostagioni.jpg",
    categoryId: 3,
    chefId: 1,
    customizableOptions: [
      { id: 60, name: "No Ham (Vegetarian)", price: -1.0 },
      { id: 61, name: "Extra Mushrooms", price: 2.0 },
      { id: 62, name: "Thin Crust", price: 0 },
    ],
  },
  {
    id: 25,
    name: "Prosciutto e Rucola Pizza",
    description:
      "White pizza with mozzarella, prosciutto di Parma, arugula, and cherry tomatoes",
    price: 19.99,
    preparationTime: 14,
    rating: 4.9,
    image: "/prosciuttopizza.jpg",
    categoryId: 3,
    chefId: 1,
    customizableOptions: [
      { id: 63, name: "Extra Prosciutto", price: 5.0 },
      { id: 64, name: "Add Burrata", price: 4.5 },
      { id: 65, name: "Balsamic Glaze", price: 1.0 },
    ],
  },
  {
    id: 26,
    name: "Diavola Pizza",
    description:
      "Spicy pizza with tomatoes, mozzarella, spicy salami, and hot peppers",
    price: 18.99,
    preparationTime: 13,
    rating: 4.5,
    image: "/diavola.jpg",
    categoryId: 3,
    chefId: 1,
    customizableOptions: [
      { id: 66, name: "Extra Spicy", price: 0 },
      { id: 67, name: "Mild Version", price: 0 },
      { id: 68, name: "Extra Salami", price: 3.0 },
    ],
  },
  {
    id: 4,
    name: "Tiramisu",
    description:
      "Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone",
    price: 8.99,
    preparationTime: 5,
    rating: 4.6,
    image: "/tiramisu.jpg",
    categoryId: 4,
    chefId: 1,
    customizableOptions: [
      { id: 10, name: "Extra Espresso", price: 1.0 },
      { id: 11, name: "Alcohol-Free", price: 0 },
    ],
  },
  {
    id: 27,
    name: "Panna Cotta",
    description: "Silky vanilla custard topped with mixed berry compote",
    price: 7.99,
    preparationTime: 5,
    rating: 4.4,
    image: "/pannacotta.jpg",
    categoryId: 4,
    chefId: 1,
    customizableOptions: [
      { id: 69, name: "Caramel Sauce", price: 1.0 },
      { id: 70, name: "Chocolate Version", price: 0 },
      { id: 71, name: "Dairy-Free", price: 1.5 },
    ],
  },
  {
    id: 28,
    name: "Cannoli Siciliani",
    description:
      "Crispy pastry shells filled with sweet ricotta and chocolate chips",
    price: 9.99,
    preparationTime: 8,
    rating: 4.7,
    image: "/cannoli.jpg",
    categoryId: 4,
    chefId: 1,
    customizableOptions: [
      { id: 72, name: "Pistachio Filling", price: 1.5 },
      { id: 73, name: "Extra Chocolate Chips", price: 1.0 },
      { id: 74, name: "Mini Cannoli (6 pieces)", price: 2.0 },
    ],
  },
  {
    id: 29,
    name: "Gelato Trio",
    description:
      "Three scoops of authentic Italian gelato: pistachio, stracciatella, and limoncello",
    price: 10.99,
    preparationTime: 3,
    rating: 4.8,
    image: "/gelato.jpg",
    categoryId: 4,
    chefId: 1,
    customizableOptions: [
      { id: 75, name: "Choose Your Flavors", price: 0 },
      { id: 76, name: "Add Whipped Cream", price: 1.0 },
      { id: 77, name: "Gluten-Free Cone", price: 1.0 },
    ],
  },

  // Japanese Chef Items
  {
    id: 5,
    name: "Omakase Sushi Set",
    description: "Chef's selection of 8 pieces of premium sushi with miso soup",
    price: 45.99,
    preparationTime: 30,
    rating: 4.9,
    image: "/omakase.jpg",
    categoryId: 5,
    chefId: 2,
    customizableOptions: [
      { id: 12, name: "Premium Fish Upgrade", price: 12.0 },
      { id: 13, name: "Vegetarian Set", price: -5.0 },
      { id: 14, name: "Extra Wasabi", price: 0 },
    ],
  },
  {
    id: 6,
    name: "Tonkotsu Ramen",
    description:
      "Rich pork bone broth with chashu, soft-boiled egg, and green onions",
    price: 16.99,
    preparationTime: 25,
    rating: 4.8,
    image: "/tonkotsu.jpg",
    categoryId: 6,
    chefId: 2,
    customizableOptions: [
      { id: 15, name: "Extra Chashu", price: 4.0 },
      { id: 16, name: "Spicy Level", price: 0 },
      { id: 17, name: "Extra Egg", price: 2.0 },
    ],
  },
  {
    id: 7,
    name: "Ebi Tempura",
    description: "Lightly battered and fried shrimp with tempura dipping sauce",
    price: 14.99,
    preparationTime: 15,
    rating: 4.7,
    image: "/tempura.jpg",
    categoryId: 7,
    chefId: 2,
    customizableOptions: [
      { id: 18, name: "Vegetable Tempura Add-on", price: 6.0 },
      { id: 19, name: "Extra Sauce", price: 1.0 },
    ],
  },

  // French Chef Items
  {
    id: 8,
    name: "Escargots de Bourgogne",
    description: "Classic Burgundy snails with garlic herb butter and parsley",
    price: 14.99,
    preparationTime: 20,
    rating: 4.5,
    image: "/escargot.jpg",
    categoryId: 9,
    chefId: 3,
    customizableOptions: [
      { id: 20, name: "Extra Garlic", price: 1.0 },
      { id: 21, name: "Herb Substitution", price: 0 },
    ],
  },
  {
    id: 9,
    name: "Coq au Vin",
    description:
      "Braised chicken in red wine with mushrooms, lardons, and pearl onions",
    price: 28.99,
    preparationTime: 35,
    rating: 4.8,
    image: "/coqauvin.jpg",
    categoryId: 11,
    chefId: 3,
    customizableOptions: [
      { id: 22, name: "White Wine Version", price: 0 },
      { id: 23, name: "Extra Vegetables", price: 3.0 },
    ],
  },

  // Indian Chef Items
  {
    id: 10,
    name: "Samosa Chaat",
    description:
      "Crispy samosas topped with yogurt, chutneys, and pomegranate seeds",
    price: 9.99,
    preparationTime: 10,
    rating: 4.6,
    image: "/samosa.jpg",
    categoryId: 13,
    chefId: 4,
    customizableOptions: [
      { id: 24, name: "Extra Spicy", price: 0 },
      { id: 25, name: "Vegan Yogurt", price: 1.0 },
    ],
  },
  {
    id: 11,
    name: "Butter Chicken",
    description:
      "Tender chicken in rich, creamy tomato-based curry with aromatic spices",
    price: 19.99,
    preparationTime: 25,
    rating: 4.9,
    image: "/butterchicken.jpg",
    categoryId: 14,
    chefId: 4,
    customizableOptions: [
      { id: 26, name: "Spice Level", price: 0 },
      { id: 27, name: "Extra Chicken", price: 5.0 },
      { id: 28, name: "Dairy-Free Version", price: 0 },
    ],
  },
  {
    id: 12,
    name: "Tandoori Lamb Chops",
    description: "Marinated lamb chops cooked in traditional tandoor oven",
    price: 32.99,
    preparationTime: 30,
    rating: 4.7,
    image: "/tandoori.jpg",
    categoryId: 15,
    chefId: 4,
    customizableOptions: [
      { id: 29, name: "Mild Marinade", price: 0 },
      { id: 30, name: "Extra Portion", price: 8.0 },
    ],
  },

  // Mexican Chef Items
  {
    id: 13,
    name: "Guacamole & Chips",
    description:
      "Fresh avocado with lime, cilantro, onions, and house-made tortilla chips",
    price: 8.99,
    preparationTime: 10,
    rating: 4.5,
    image: "/guacamole.jpg",
    categoryId: 17,
    chefId: 5,
    customizableOptions: [
      { id: 31, name: "Extra Spicy", price: 0 },
      { id: 32, name: "Add Pomegranate", price: 2.0 },
    ],
  },
  {
    id: 14,
    name: "Carnitas Tacos",
    description:
      "Slow-cooked pork with onions, cilantro, and salsa verde on corn tortillas",
    price: 15.99,
    preparationTime: 15,
    rating: 4.8,
    image: "/carnitas.jpg",
    categoryId: 18,
    chefId: 5,
    customizableOptions: [
      { id: 33, name: "Flour Tortillas", price: 0 },
      { id: 34, name: "Extra Salsa", price: 1.5 },
      { id: 35, name: "Add Cheese", price: 2.0 },
    ],
  },
  {
    id: 15,
    name: "Mole Poblano",
    description:
      "Traditional chicken with complex mole sauce containing over 20 ingredients",
    price: 24.99,
    preparationTime: 40,
    rating: 4.9,
    image: "/mole.jpg",
    categoryId: 19,
    chefId: 5,
    customizableOptions: [
      { id: 36, name: "Vegetarian Version", price: 0 },
      { id: 37, name: "Extra Mole Sauce", price: 3.0 },
    ],
  },

  // Korean Chef Items
  {
    id: 16,
    name: "Kimchi Pancake",
    description: "Crispy pancake made with fermented kimchi and scallions",
    price: 11.99,
    preparationTime: 12,
    rating: 4.6,
    image: "/kimchipancake.jpg",
    categoryId: 21,
    chefId: 6,
    customizableOptions: [
      { id: 38, name: "Extra Kimchi", price: 2.0 },
      { id: 39, name: "Gluten-Free Version", price: 2.0 },
    ],
  },
  {
    id: 17,
    name: "Korean BBQ Bulgogi",
    description:
      "Marinated beef grilled and served with lettuce wraps and banchan",
    price: 26.99,
    preparationTime: 20,
    rating: 4.8,
    image: "/bulgogi.jpg",
    categoryId: 22,
    chefId: 6,
    customizableOptions: [
      { id: 40, name: "Extra Meat", price: 6.0 },
      { id: 41, name: "Pork Option", price: 0 },
      { id: 42, name: "Extra Banchan", price: 4.0 },
    ],
  },
  {
    id: 18,
    name: "Kimchi Jjigae",
    description: "Spicy kimchi stew with pork, tofu, and vegetables",
    price: 16.99,
    preparationTime: 25,
    rating: 4.7,
    image: "/kimchijjigae.jpg",
    categoryId: 23,
    chefId: 6,
    customizableOptions: [
      { id: 43, name: "Vegetarian Version", price: 0 },
      { id: 44, name: "Extra Tofu", price: 2.0 },
      { id: 45, name: "Spice Level", price: 0 },
    ],
  },
];
