// Prisma 7 no longer loads .env automatically, so dotenv is imported explicitly.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // The CLI (migrations) uses the direct, non-pooled Neon connection.
    // Read optionally (not via env()) so `prisma generate` works without a database, e.g. on install.
    url: process.env.DIRECT_URL,
  },
});
