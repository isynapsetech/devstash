import { connection } from "next/server";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Temporary until auth is in place: every request acts as the seeded demo user.
const DEMO_USER_EMAIL = "demo@devstash.io";

// Wrapped in cache() so several server components in one request share a single lookup.
export const getCurrentUserId = cache(async (): Promise<string> => {
  // User data is per-request: opt out of prerendering (auth's cookie read will do this later).
  await connection();
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });
  if (!user) throw new Error(`Demo user ${DEMO_USER_EMAIL} not found. Run \`npm run db:seed\`.`);
  return user.id;
});
