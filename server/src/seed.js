import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // ── Clean existing data (order matters due to foreign keys) ───────────────
  await prisma.observation.deleteMany();
  await prisma.field.deleteMany();
  await prisma.user.deleteMany();
  console.log("   ✓ Cleared existing data");

  // ── Users ─────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email:    "admin@farmops.com",
      name:     "Admin",
      password: await bcrypt.hash("admin123", 12),
      role:     "ADMIN",
    },
  });

  const john = await prisma.user.create({
    data: {
      email:    "john@farmops.com",
      name:     "John Smith",
      password: await bcrypt.hash("john123", 12),
      role:     "AGENT",
    },
  });

  const maria = await prisma.user.create({
    data: {
      email:    "maria@farmops.com",
      name:     "Maria Garcia",
      password: await bcrypt.hash("maria123", 12),
      role:     "AGENT",
    },
  });

  const david = await prisma.user.create({
    data: {
      email:    "david@farmops.com",
      name:     "David Osei",
      password: await bcrypt.hash("david123", 12),
      role:     "AGENT",
    },
  });

  console.log("   ✓ Created 1 admin, 3 agents");

  // ── Fields ────────────────────────────────────────────────────────────────
  const fieldA = await prisma.field.create({
    data: {
      name:         "North Block A",
      cropType:     "Maize",
      plantingDate: new Date("2025-02-10"),
      currentStage: "GROWING",
      agentId:      john.id,
    },
  });

  const fieldB = await prisma.field.create({
    data: {
      name:         "South Ridge",
      cropType:     "Wheat",
      plantingDate: new Date("2025-01-20"),
      currentStage: "AT_RISK",
      agentId:      john.id,
    },
  });

  const fieldC = await prisma.field.create({
    data: {
      name:         "Eastern Plateau",
      cropType:     "Soya",
      plantingDate: new Date("2025-02-01"),
      currentStage: "GROWING",
      agentId:      maria.id,
    },
  });

  const fieldD = await prisma.field.create({
    data: {
      name:         "River Bend",
      cropType:     "Sunflower",
      plantingDate: new Date("2024-12-15"),
      currentStage: "HARVESTED",
      agentId:      david.id,
    },
  });

  const fieldE = await prisma.field.create({
    data: {
      name:         "West Flats",
      cropType:     "Barley",
      plantingDate: new Date("2025-03-01"),
      currentStage: "PLANTED",
      agentId:      maria.id,
    },
  });

  const fieldF = await prisma.field.create({
    data: {
      name:         "Hilltop Section",
      cropType:     "Sorghum",
      plantingDate: new Date("2025-03-15"),
      currentStage: "AT_RISK",
      agentId:      david.id,
    },
  });

  console.log("   ✓ Created 6 fields");

  // ── Observations ──────────────────────────────────────────────────────────
  await prisma.observation.createMany({
    data: [
      // North Block A — John, progressing normally
      {
        notes:       "Seedlings emerging uniformly across the block.",
        stageAtTime: "PLANTED",
        fieldId:     fieldA.id,
        userId:      john.id,
        createdAt:   new Date("2025-02-18"),
      },
      {
        notes:       "Tillering has begun. Soil moisture adequate.",
        stageAtTime: "GROWING",
        fieldId:     fieldA.id,
        userId:      john.id,
        createdAt:   new Date("2025-03-05"),
      },

      // South Ridge — John, flagged at risk
      {
        notes:       "Crop looking healthy. Growth on track.",
        stageAtTime: "GROWING",
        fieldId:     fieldB.id,
        userId:      john.id,
        createdAt:   new Date("2025-02-28"),
      },
      {
        notes:       "Signs of rust fungus on lower leaves. Applied fungicide. Marking field at risk.",
        stageAtTime: "AT_RISK",
        fieldId:     fieldB.id,
        userId:      john.id,
        createdAt:   new Date("2025-03-14"),
      },

      // Eastern Plateau — Maria, growing well
      {
        notes:       "Germination rate excellent. Even stand across plateau.",
        stageAtTime: "PLANTED",
        fieldId:     fieldC.id,
        userId:      maria.id,
        createdAt:   new Date("2025-02-10"),
      },
      {
        notes:       "Pods developing well. Watch for aphid pressure on eastern edge.",
        stageAtTime: "GROWING",
        fieldId:     fieldC.id,
        userId:      maria.id,
        createdAt:   new Date("2025-03-20"),
      },

      // River Bend — David, harvested
      {
        notes:       "Heads fully dried. Moisture at 9%. Ready for combine.",
        stageAtTime: "READY",
        fieldId:     fieldD.id,
        userId:      david.id,
        createdAt:   new Date("2025-04-10"),
      },
      {
        notes:       "Harvest complete. Yield above expectation. Field cleared.",
        stageAtTime: "HARVESTED",
        fieldId:     fieldD.id,
        userId:      david.id,
        createdAt:   new Date("2025-04-20"),
      },

      // West Flats — Maria, just planted, no issues yet
      {
        notes:       "Seeds planted. Irrigation set up. Awaiting germination.",
        stageAtTime: "PLANTED",
        fieldId:     fieldE.id,
        userId:      maria.id,
        createdAt:   new Date("2025-03-02"),
      },

      // Hilltop Section — David, at risk due to drought
      {
        notes:       "Planted successfully. Soil conditions good.",
        stageAtTime: "PLANTED",
        fieldId:     fieldF.id,
        userId:      david.id,
        createdAt:   new Date("2025-03-16"),
      },
      {
        notes:       "Drought conditions developing. Irrigation system struggling to keep up. Flagging as at risk.",
        stageAtTime: "AT_RISK",
        fieldId:     fieldF.id,
        userId:      david.id,
        createdAt:   new Date("2025-04-01"),
      },
    ],
  });

  console.log("   ✓ Created 11 observations");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n✅ Seed complete.\n");
  console.log("   Accounts:");
  console.log("   Admin  → admin@farmops.com  / admin123");
  console.log("   John   → john@farmops.com   / john123  (2 fields: North Block A, South Ridge)");
  console.log("   Maria  → maria@farmops.com  / maria123 (2 fields: Eastern Plateau, West Flats)");
  console.log("   David  → david@farmops.com  / david123 (2 fields: River Bend, Hilltop Section)");
  console.log("\n   Stages:");
  console.log("   PLANTED   → West Flats");
  console.log("   GROWING   → North Block A, Eastern Plateau");
  console.log("   AT_RISK   → South Ridge, Hilltop Section");
  console.log("   HARVESTED → River Bend");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());