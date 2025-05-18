import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create ticket types
  const vipTicket = await prisma.ticketType.upsert({
    where: { name: "VIP" },
    update: { price: 800 },
    create: { name: "VIP", price: 800 },
  })

  const regularTicket = await prisma.ticketType.upsert({
    where: { name: "Regular" },
    update: { price: 500 },
    create: { name: "Regular", price: 500 },
  })

  console.log({ vipTicket, regularTicket })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
