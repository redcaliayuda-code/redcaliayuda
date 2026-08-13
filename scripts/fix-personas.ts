import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const result = await prisma.need.updateMany({
    where: { personasAfectadas: { gt: 1 } },
    data: { personasAfectadas: 1 },
  });

  console.log(`Actualizado ${result.count} necesidades: personasAfectadas = 1`);
}

main().catch(console.error);
