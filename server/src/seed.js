import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // ── Admin ────────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@farmops.com" },
    update: {},
    create: {
      email:    "admin@farmops.com",
      name:     "Admin",
      password: await bcrypt.hash("admin123", 12),
      role:     "ADMIN",
    },
  });

  // ── Agents ───────────────────────────────────────────────────────────────────
  const john = await prisma.user.upsert({
    where: { email: "john@farmops.com" },
    update: {},
    create: {
      email:    "john@farmops.com",
      name:     "John Smith",
      password: await bcrypt.hash("john123", 12),
      role:     "AGENT",
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: "maria@farmops.com" },
    update: {},
    create: {
      email:    "maria@farmops.com",
      name:     "Maria Garcia",
      password: await bcrypt.hash("maria123", 12),
      role:     "AGENT",
    },
  });

  const david = await prisma.user.upsert({
    where: { email: "david@farmops.com" },
    update: {},
    create: {
      email:    "david@farmops.com",
      name:     "David Osei",
      password: await bcrypt.hash("david123", 12),
      role:     "AGENT",
    },
  });

  // ── Fields ───────────────────────────────────────────────────────────────────
  const fieldA = await prisma.field.upsert({
    where: { id: "seed-field-1" },
    update: {},
    create: {
      id:           "seed-field-1",
      name:         "North Block A",
      cropType:     "Maize",
      plantingDate: new Date("2025-02-10"),
      currentStage: "GROWING",
      agentId:      john.id,
    },
  });

  const fieldB = await prisma.field.upsert({
    where: { id: "seed-field-2" },
    update: {},
    create: {
      id:           "seed-field-2",
      name:         "South Ridge",
      cropType:     "Wheat",
      plantingDate: new Date("2025-01-20"),
      currentStage: "GROWING",
      agentId:      john.id,
    },
  });

  const fieldC = await prisma.field.upsert({
    where: { id: "seed-field-3" },
    update: {},
    create: {
      id:           "seed-field-3",
      name:         "Eastern Plateau",
      cropType:     "Soya",
      plantingDate: new Date("2025-02-01"),
      currentStage: "READY",
      agentId:      maria.id,
    },
  });

  const fieldD = await prisma.field.upsert({
    where: { id: "seed-field-4" },
    update: {},
    create: {
      id:           "seed-field-4",
      name:         "River Bend",
      cropType:     "Sunflower",
      plantingDate: new Date("2024-12-15"),
      currentStage: "HARVESTED",
      agentId:      david.id,
    },
  });

  // ── Observations ─────────────────────────────────────────────────────────────
  await prisma.observation.createMany({
    skipDuplicates: true,
    data: [
      {
        id:          "seed-obs-1",
        notes:       "Seedlings emerging uniformly across the block.",
        stageAtTime: "PLANTED",
        fieldId:     fieldA.id,
        userId:      john.id,
        createdAt:   new Date("2025-02-18"),
      },
      {
        id:          "seed-obs-2",
        notes:       "Tillering has begun. Soil moisture adequate.",
        stageAtTime: "GROWING",
        fieldId:     fieldA.id,
        userId:      john.id,
        createdAt:   new Date("2025-03-05"),
      },
      {
        id:          "seed-obs-3",
        notes:       "Signs of rust fungus on lower leaves. Applied fungicide.",
        stageAtTime: "GROWING",
        fieldId:     fieldB.id,
        userId:      john.id,
        createdAt:   new Date("2025-03-14"),
      },
      {
        id:          "seed-obs-4",
        notes:       "Pods developing well. Watch for aphid pressure.",
        stageAtTime: "READY",
        fieldId:     fieldC.id,
        userId:      maria.id,
        createdAt:   new Date("2025-03-20"),
      },
      {
        id:          "seed-obs-5",
        notes:       "Moisture at 9%. Ready for combine.",
        stageAtTime: "HARVESTED",
        fieldId:     fieldD.id,
        userId:      david.id,
        createdAt:   new Date("2025-04-20"),
      },
    ],
  });

  console.log("✅ Seed complete.");
  console.log(`   Admin  → admin@farmops.com / admin123`);
  console.log(`   Agents → john@farmops.com, maria@farmops.com, david@farmops.com`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());