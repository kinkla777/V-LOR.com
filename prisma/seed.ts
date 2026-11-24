import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  if (!ownerEmail) throw new Error('Set OWNER_EMAIL before seeding.');
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!owner) console.log('Owner account not found. Register using OWNER_EMAIL to create the initial Owner.');
  await prisma.product.createMany({ data: [
    { name: 'VΛLOR Operator Tee', description: 'Official team apparel. Details coming soon.', price: 2500 },
    { name: 'VΛLOR Drop Hoodie', description: 'Built for the lobby and beyond.', price: 5500 },
  ], skipDuplicates: true });
}
main().finally(() => prisma.$disconnect());
