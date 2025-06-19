const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkChefs() {
  try {
    const chefs = await prisma.chef.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
      },
      take: 5,
    });

    console.log("=== CHEF IMAGE URLS IN DATABASE ===");
    chefs.forEach((chef) => {
      console.log(`${chef.name} (${chef.email}): ${chef.image || "NULL"}`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    await prisma.$disconnect();
  }
}

checkChefs();
