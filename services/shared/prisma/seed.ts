import { PrismaClient, UserRole, OrderStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Categories
  console.log("📁 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Italian" } }),
    prisma.category.create({ data: { name: "Mexican" } }),
    prisma.category.create({ data: { name: "Indian" } }),
    prisma.category.create({ data: { name: "Chinese" } }),
    prisma.category.create({ data: { name: "American" } }),
    prisma.category.create({ data: { name: "Mediterranean" } }),
    prisma.category.create({ data: { name: "Thai" } }),
    prisma.category.create({ data: { name: "Japanese" } }),
  ]);

  // Create Users
  console.log("👥 Creating users...");
  const users = await Promise.all([
    // Admin User
    prisma.user.create({
      data: {
        email: "admin@forkcast.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        phone: "+1234567890",
        address: "123 Admin St, Admin City, AC 12345",
        role: UserRole.ADMIN,
      },
    }),
    // Chef Users
    prisma.user.create({
      data: {
        email: "mario@forkcast.com",
        password: hashedPassword,
        firstName: "Mario",
        lastName: "Rossi",
        phone: "+1234567891",
        address: "456 Chef St, Italian Quarter, IQ 12346",
        role: UserRole.CHEF,
      },
    }),
    prisma.user.create({
      data: {
        email: "carlos@forkcast.com",
        password: hashedPassword,
        firstName: "Carlos",
        lastName: "Rodriguez",
        phone: "+1234567892",
        address: "789 Spice Ave, Mexican District, MD 12347",
        role: UserRole.CHEF,
      },
    }),
    prisma.user.create({
      data: {
        email: "priya@forkcast.com",
        password: hashedPassword,
        firstName: "Priya",
        lastName: "Sharma",
        phone: "+1234567893",
        address: "321 Curry Lane, Indian Village, IV 12348",
        role: UserRole.CHEF,
      },
    }),
    prisma.user.create({
      data: {
        email: "david@forkcast.com",
        password: hashedPassword,
        firstName: "David",
        lastName: "Johnson",
        phone: "+1234567894",
        address: "654 Burger Blvd, American Town, AT 12349",
        role: UserRole.CHEF,
      },
    }),
    // Customer Users
    prisma.user.create({
      data: {
        email: "john@customer.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567895",
        address: "987 Customer St, Customer City, CC 12350",
        role: UserRole.CUSTOMER,
      },
    }),
    prisma.user.create({
      data: {
        email: "jane@customer.com",
        password: hashedPassword,
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1234567896",
        address: "147 Foodie Ave, Foodie Town, FT 12351",
        role: UserRole.CUSTOMER,
      },
    }),
    prisma.user.create({
      data: {
        email: "alice@customer.com",
        password: hashedPassword,
        firstName: "Alice",
        lastName: "Wilson",
        phone: "+1234567897",
        address: "258 Hungry St, Delivery District, DD 12352",
        role: UserRole.CUSTOMER,
      },
    }),
  ]);

  // Create Chefs
  console.log("👨‍🍳 Creating chef profiles...");
  const chefs = await Promise.all([
    prisma.chef.create({
      data: {
        userId: users[1].id, // Mario
        name: "Mario's Italian Kitchen",
        bio: "Authentic Italian cuisine with recipes passed down through generations. Specializing in handmade pasta and traditional wood-fired pizzas.",
        cuisine: "Italian",
        rating: 4.8,
        totalRating: 240,
        ratingCount: 50,
        image:
          "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400",
        isVerified: true,
      },
    }),
    prisma.chef.create({
      data: {
        userId: users[2].id, // Carlos
        name: "Carlos's Mexican Cantina",
        bio: "Fresh and vibrant Mexican flavors using traditional cooking methods. Famous for our homemade salsas and slow-cooked carnitas.",
        cuisine: "Mexican",
        rating: 4.6,
        totalRating: 184,
        ratingCount: 40,
        image:
          "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400",
        isVerified: true,
      },
    }),
    prisma.chef.create({
      data: {
        userId: users[3].id, // Priya
        name: "Priya's Spice Palace",
        bio: "Aromatic Indian dishes with carefully balanced spices. From mild curries to fiery vindaloos, experience the diversity of Indian cuisine.",
        cuisine: "Indian",
        rating: 4.9,
        totalRating: 294,
        ratingCount: 60,
        image:
          "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400",
        isVerified: true,
      },
    }),
    prisma.chef.create({
      data: {
        userId: users[4].id, // David
        name: "David's All-American Diner",
        bio: "Classic American comfort food with a modern twist. Juicy burgers, crispy fries, and hearty milkshakes made with premium ingredients.",
        cuisine: "American",
        rating: 4.5,
        totalRating: 135,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        isVerified: true,
      },
    }),
  ]);

  // Create Menu Items with Customization Options
  console.log("🍽️ Creating menu items...");

  // Mario's Italian Menu
  const italianItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Margherita Pizza",
        description:
          "Classic wood-fired pizza with fresh mozzarella, basil, and tomato sauce",
        price: 18.99,
        preparationTime: 15,
        rating: 4.7,
        totalRating: 188,
        ratingCount: 40,
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
        chefId: chefs[0].id,
        categoryId: categories[0].id, // Italian
        customizationOptions: {
          create: [
            { name: "Extra Cheese", price: 2.5 },
            { name: "Pepperoni", price: 3.0 },
            { name: "Mushrooms", price: 2.0 },
            { name: "Olives", price: 1.5 },
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Fettuccine Alfredo",
        description:
          "Creamy homemade pasta with parmesan cheese and fresh herbs",
        price: 22.99,
        preparationTime: 20,
        rating: 4.8,
        totalRating: 144,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
        chefId: chefs[0].id,
        categoryId: categories[0].id,
        customizationOptions: {
          create: [
            { name: "Grilled Chicken", price: 5.0 },
            { name: "Shrimp", price: 7.0 },
            { name: "Extra Parmesan", price: 2.0 },
          ],
        },
      },
    }),
  ]);

  // Carlos's Mexican Menu
  const mexicanItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Beef Tacos",
        description:
          "Three soft tacos with seasoned ground beef, lettuce, cheese, and salsa",
        price: 14.99,
        preparationTime: 10,
        rating: 4.6,
        totalRating: 138,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        chefId: chefs[1].id,
        categoryId: categories[1].id, // Mexican
        customizationOptions: {
          create: [
            { name: "Extra Meat", price: 3.0 },
            { name: "Guacamole", price: 2.5 },
            { name: "Sour Cream", price: 1.0 },
            { name: "Hot Sauce", price: 0.5 },
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Chicken Burrito Bowl",
        description:
          "Grilled chicken with rice, beans, corn, peppers, and cilantro-lime dressing",
        price: 16.99,
        preparationTime: 12,
        rating: 4.7,
        totalRating: 141,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
        chefId: chefs[1].id,
        categoryId: categories[1].id,
        customizationOptions: {
          create: [
            { name: "Extra Chicken", price: 4.0 },
            { name: "Avocado", price: 2.0 },
            { name: "Cheese", price: 1.5 },
          ],
        },
      },
    }),
  ]);

  // Priya's Indian Menu
  const indianItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Butter Chicken",
        description:
          "Tender chicken in a rich and creamy tomato-based curry sauce",
        price: 19.99,
        preparationTime: 25,
        rating: 4.9,
        totalRating: 196,
        ratingCount: 40,
        image:
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
        chefId: chefs[2].id,
        categoryId: categories[2].id, // Indian
        customizationOptions: {
          create: [
            { name: "Mild Spice", price: 0 },
            { name: "Medium Spice", price: 0 },
            { name: "Hot Spice", price: 0 },
            { name: "Extra Hot", price: 0 },
            { name: "Basmati Rice", price: 3.0 },
            { name: "Naan Bread", price: 2.5 },
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Vegetable Biryani",
        description:
          "Aromatic basmati rice with mixed vegetables and traditional spices",
        price: 17.99,
        preparationTime: 30,
        rating: 4.8,
        totalRating: 144,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1563379091339-03246963d4b3?w=400",
        chefId: chefs[2].id,
        categoryId: categories[2].id,
        customizationOptions: {
          create: [
            { name: "Extra Vegetables", price: 2.0 },
            { name: "Raita (Yogurt Sauce)", price: 1.5 },
            { name: "Papad", price: 1.0 },
          ],
        },
      },
    }),
  ]);

  // David's American Menu
  const americanItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Classic Cheeseburger",
        description:
          "Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce",
        price: 15.99,
        preparationTime: 15,
        rating: 4.5,
        totalRating: 135,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        chefId: chefs[3].id,
        categoryId: categories[4].id, // American
        customizationOptions: {
          create: [
            { name: "Extra Patty", price: 4.0 },
            { name: "Bacon", price: 2.5 },
            { name: "Avocado", price: 2.0 },
            { name: "Onion Rings", price: 1.5 },
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "BBQ Pulled Pork Sandwich",
        description:
          "Slow-cooked pulled pork with tangy BBQ sauce and coleslaw",
        price: 17.99,
        preparationTime: 20,
        rating: 4.6,
        totalRating: 138,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400",
        chefId: chefs[3].id,
        categoryId: categories[4].id,
        customizationOptions: {
          create: [
            { name: "Extra Pork", price: 3.5 },
            { name: "Spicy BBQ Sauce", price: 0 },
            { name: "Pickles", price: 0.5 },
          ],
        },
      },
    }),
  ]);

  // Create Sample Orders
  console.log("📦 Creating sample orders...");
  const orders = await Promise.all([
    // Order 1 - John's order
    prisma.order.create({
      data: {
        userId: users[5].id, // John
        status: OrderStatus.DELIVERED,
        totalAmount: 37.98,
        deliveryFee: 4.99,
        tax: 3.04,
        finalAmount: 46.01,
        deliveryAddress: "987 Customer St, Customer City, CC 12350",
        specialInstructions: "Ring doorbell twice",
        estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        completedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        orderItems: {
          create: [
            {
              quantity: 1,
              price: 18.99,
              totalPrice: 18.99,
              menuItemId: italianItems[0].id, // Margherita Pizza
            },
            {
              quantity: 1,
              price: 18.99,
              totalPrice: 18.99,
              menuItemId: italianItems[0].id, // Another Margherita Pizza
            },
          ],
        },
      },
    }),
    // Order 2 - Jane's order
    prisma.order.create({
      data: {
        userId: users[6].id, // Jane
        status: OrderStatus.PREPARING,
        totalAmount: 31.98,
        deliveryFee: 4.99,
        tax: 2.56,
        finalAmount: 39.53,
        deliveryAddress: "147 Foodie Ave, Foodie Town, FT 12351",
        orderItems: {
          create: [
            {
              quantity: 1,
              price: 14.99,
              totalPrice: 14.99,
              menuItemId: mexicanItems[0].id, // Beef Tacos
            },
            {
              quantity: 1,
              price: 16.99,
              totalPrice: 16.99,
              menuItemId: mexicanItems[1].id, // Chicken Burrito Bowl
            },
          ],
        },
      },
    }),
    // Order 3 - Alice's order
    prisma.order.create({
      data: {
        userId: users[7].id, // Alice
        status: OrderStatus.PENDING,
        totalAmount: 19.99,
        deliveryFee: 4.99,
        tax: 1.6,
        finalAmount: 26.58,
        deliveryAddress: "258 Hungry St, Delivery District, DD 12352",
        specialInstructions: "Medium spice level please",
        orderItems: {
          create: [
            {
              quantity: 1,
              price: 19.99,
              totalPrice: 19.99,
              menuItemId: indianItems[0].id, // Butter Chicken
            },
          ],
        },
      },
    }),
  ]);

  console.log("✅ Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- ${categories.length} categories created`);
  console.log(
    `- ${users.length} users created (1 admin, 4 chefs, 3 customers)`
  );
  console.log(`- ${chefs.length} chef profiles created`);
  console.log(
    `- ${
      italianItems.length +
      mexicanItems.length +
      indianItems.length +
      americanItems.length
    } menu items created`
  );
  console.log(`- ${orders.length} sample orders created`);

  console.log("\n🔐 Test Login Credentials:");
  console.log("Admin: admin@forkcast.com / password123");
  console.log("Chef (Mario): mario@forkcast.com / password123");
  console.log("Chef (Carlos): carlos@forkcast.com / password123");
  console.log("Chef (Priya): priya@forkcast.com / password123");
  console.log("Chef (David): david@forkcast.com / password123");
  console.log("Customer (John): john@customer.com / password123");
  console.log("Customer (Jane): jane@customer.com / password123");
  console.log("Customer (Alice): alice@customer.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
