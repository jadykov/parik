import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { login: "admin" },
    update: {},
    create: { login: "admin", passwordHash: adminHash, role: "admin", name: "Администратор" }
  });

  await prisma.knowledgeBase.upsert({ where: { key: "address" }, update: { value: "д. Примерово, ул. Центральная 1" }, create: { key: "address", value: "д. Примерово, ул. Центральная 1" } });
  await prisma.knowledgeBase.upsert({ where: { key: "phone" }, update: { value: "+7 900 000-00-00" }, create: { key: "phone", value: "+7 900 000-00-00" } });
  await prisma.knowledgeBase.upsert({ where: { key: "work_hours" }, update: { value: "Ежедневно 09:00-19:00, без выходных" }, create: { key: "work_hours", value: "Ежедневно 09:00-19:00, без выходных" } });

  const services = [
    { title: "Мужская стрижка", price: 500, durationMin: 30, description: "Классическая мужская стрижка" },
    { title: "Стрижка + борода", price: 800, durationMin: 45, description: "Стрижка и оформление бороды" },
    { title: "Детская стрижка", price: 400, durationMin: 30, description: "До 12 лет" },
    { title: "Женская стрижка", price: 700, durationMin: 45, description: "Стрижка и укладка" }
  ];
  for (const s of services) {
    const exists = await prisma.service.findFirst({ where: { title: s.title } });
    if (!exists) await prisma.service.create({ data: s });
  }

  console.log("Seed done: admin/admin123, 4 services, knowledge_base");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
