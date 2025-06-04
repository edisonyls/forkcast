import { PrismaClient } from "@prisma/client";
import { OrderStatus } from "../src/types/common";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customizationOption.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.chef.deleteMany();
  await prisma.category.deleteMany();

  console.log("🗑️ Cleaned up existing data");

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Italian" },
    }),
    prisma.category.create({
      data: { name: "Mexican" },
    }),
    prisma.category.create({
      data: { name: "Indian" },
    }),
    prisma.category.create({
      data: { name: "American" },
    }),
    prisma.category.create({
      data: { name: "Chinese" },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create Chefs
  const chefs = await Promise.all([
    prisma.chef.create({
      data: {
        name: "Mario Rossi",
        bio: "Authentic Italian chef with 15 years of experience in traditional Tuscan cuisine",
        cuisine: "Italian",
        rating: 4.8,
        totalRating: 240,
        ratingCount: 50,
        image:
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300",
        isVerified: true,
      },
    }),
    prisma.chef.create({
      data: {
        name: "Carlos Rodriguez",
        bio: "Mexican cuisine specialist bringing authentic flavors from Oaxaca",
        cuisine: "Mexican",
        rating: 4.6,
        totalRating: 184,
        ratingCount: 40,
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
        isVerified: true,
      },
    }),
    prisma.chef.create({
      data: {
        name: "Priya Sharma",
        bio: "Indian chef specializing in North Indian and Mughlai cuisine",
        cuisine: "Indian",
        rating: 4.9,
        totalRating: 294,
        ratingCount: 60,
        image:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300",
        isVerified: true,
      },
    }),
    prisma.chef.create({
      data: {
        name: "David Johnson",
        bio: "American comfort food expert with a modern twist on classic dishes",
        cuisine: "American",
        rating: 4.4,
        totalRating: 132,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${chefs.length} chef profiles`);

  // Create Menu Items for each chef
  const italianItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Margherita Pizza",
        description:
          "Classic pizza with fresh mozzarella, basil, and tomato sauce",
        price: 18.99,
        preparationTime: 25,
        chefId: chefs[0].id,
        categoryId: categories[0].id,
        rating: 4.8,
        totalRating: 96,
        ratingCount: 20,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Fettuccine Alfredo",
        description: "Rich and creamy pasta with parmesan cheese and butter",
        price: 22.99,
        preparationTime: 20,
        chefId: chefs[0].id,
        categoryId: categories[0].id,
        rating: 4.6,
        totalRating: 69,
        ratingCount: 15,
        image:
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400",
      },
    }),
  ]);

  const mexicanItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Beef Tacos",
        description:
          "Three soft tacos with seasoned beef, lettuce, tomato, and cheese",
        price: 14.99,
        preparationTime: 15,
        chefId: chefs[1].id,
        categoryId: categories[1].id,
        rating: 4.5,
        totalRating: 90,
        ratingCount: 20,
        image:
          "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Chicken Burrito Bowl",
        description: "Grilled chicken with rice, beans, salsa, and guacamole",
        price: 16.99,
        preparationTime: 18,
        chefId: chefs[1].id,
        categoryId: categories[1].id,
        rating: 4.7,
        totalRating: 75.2,
        ratingCount: 16,
        image:
          "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
      },
    }),
  ]);

  const indianItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Butter Chicken",
        description: "Tender chicken in a rich, creamy tomato-based curry",
        price: 19.99,
        preparationTime: 30,
        chefId: chefs[2].id,
        categoryId: categories[2].id,
        rating: 4.9,
        totalRating: 147,
        ratingCount: 30,
        image:
          "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Biryani",
        description:
          "Fragrant basmati rice with spiced chicken and aromatic herbs",
        price: 24.99,
        preparationTime: 45,
        chefId: chefs[2].id,
        categoryId: categories[2].id,
        rating: 4.8,
        totalRating: 120,
        ratingCount: 25,
        image:
          "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400",
      },
    }),
  ]);

  const americanItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Classic Burger",
        description:
          "Juicy beef patty with lettuce, tomato, onion, and special sauce",
        price: 16.99,
        preparationTime: 20,
        chefId: chefs[3].id,
        categoryId: categories[3].id,
        rating: 4.3,
        totalRating: 64.5,
        ratingCount: 15,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      },
    }),
  ]);

  console.log(
    `✅ Created ${
      italianItems.length +
      mexicanItems.length +
      indianItems.length +
      americanItems.length
    } menu items`
  );

  // Create some customization options
  await Promise.all([
    prisma.customizationOption.create({
      data: {
        name: "Extra Cheese",
        price: 2.99,
        menuItemId: italianItems[0].id,
      },
    }),
    prisma.customizationOption.create({
      data: {
        name: "Gluten-Free Crust",
        price: 3.99,
        menuItemId: italianItems[0].id,
      },
    }),
    prisma.customizationOption.create({
      data: {
        name: "Extra Guacamole",
        price: 2.5,
        menuItemId: mexicanItems[1].id,
      },
    }),
    prisma.customizationOption.create({
      data: {
        name: "Mild Spice",
        price: 0,
        menuItemId: indianItems[0].id,
      },
    }),
    prisma.customizationOption.create({
      data: {
        name: "Extra Spicy",
        price: 0,
        menuItemId: indianItems[0].id,
      },
    }),
  ]);

  console.log("✅ Created customization options");

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        customerName: "John Doe",
        status: OrderStatus.DELIVERED,
        specialInstructions: "Ring doorbell twice",
        estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000),
        completedAt: new Date(Date.now() - 60 * 60 * 1000),
        orderItems: {
          create: [
            {
              quantity: 2,
              price: 18.99,
              totalPrice: 37.98,
              menuItemId: italianItems[0].id,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        customerName: "Jane Smith",
        status: OrderStatus.PREPARING,
        orderItems: {
          create: [
            {
              quantity: 1,
              price: 14.99,
              totalPrice: 14.99,
              menuItemId: mexicanItems[0].id,
            },
            {
              quantity: 1,
              price: 16.99,
              totalPrice: 16.99,
              menuItemId: mexicanItems[1].id,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        customerName: "Alice Johnson",
        status: OrderStatus.PENDING,
        specialInstructions: "Medium spice level please",
        orderItems: {
          create: [
            {
              quantity: 1,
              price: 19.99,
              totalPrice: 19.99,
              menuItemId: indianItems[0].id,
            },
          ],
        },
      },
    }),
  ]);

  console.log("✅ Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- ${categories.length} categories created`);
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
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
