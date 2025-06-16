import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Database seeding...");

  // Add your own seed data here if needed
  console.log("✅ No seed data to create - ready for your CRUD operations!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    globalThis.process?.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
