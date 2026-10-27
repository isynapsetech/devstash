// Seeds system item types and a demo user with sample collections and items.
// Run with `npm run db:seed` (Prisma 7 no longer seeds automatically after migrations).
// Safe to re-run: the demo user is recreated and system types are updated in place.

import "dotenv/config";
import { hash } from "bcryptjs";
import type { ContentType } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const DEMO_USER = {
  email: "demo@devstash.io",
  name: "Demo User",
  password: "12345678",
};
const BCRYPT_ROUNDS = 12;

// Users created by earlier versions of this seed, removed so they don't linger in dev databases.
const LEGACY_SEED_EMAILS = ["john@example.com"];

const SYSTEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
] as const;

type SystemTypeName = (typeof SYSTEM_TYPES)[number]["name"];

interface SeedItem {
  type: SystemTypeName;
  title: string;
  description: string;
  content?: string;
  language?: string;
  url?: string;
}

interface SeedCollection {
  name: string;
  description: string;
  items: SeedItem[];
}

const COLLECTIONS: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    items: [
      {
        type: "snippet",
        title: "useDebounce & useLocalStorage Hooks",
        description: "Debounce a changing value and persist state to localStorage",
        language: "typescript",
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
      },
      {
        type: "snippet",
        title: "Compound Component with Context",
        description: "Tabs built as a compound component sharing state through a context provider",
        language: "typescript",
        content: `import { createContext, useContext, useState, type ReactNode } from "react";

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs components must be used inside <Tabs>");
  return context;
}

export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}

Tabs.Trigger = function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { active, setActive } = useTabs();
  return (
    <button aria-selected={active === value} onClick={() => setActive(value)}>
      {children}
    </button>
  );
};

Tabs.Panel = function TabsPanel({ value, children }: { value: string; children: ReactNode }) {
  const { active } = useTabs();
  return active === value ? <div>{children}</div> : null;
};`,
      },
      {
        type: "snippet",
        title: "Everyday Utility Functions",
        description: "Small typed helpers: sleep, groupBy, formatBytes and truncate",
        language: "typescript",
        content: `export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function groupBy<T, K extends PropertyKey>(items: T[], getKey: (item: T) => K) {
  return items.reduce(
    (groups, item) => {
      (groups[getKey(item)] ??= []).push(item);
      return groups;
    },
    {} as Record<K, T[]>
  );
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return \`\${(bytes / 1024 ** i).toFixed(decimals)} \${units[i]}\`;
}

export const truncate = (text: string, max = 80) =>
  text.length > max ? \`\${text.slice(0, max - 1)}…\` : text;`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        type: "prompt",
        title: "Thorough Code Review",
        description: "Review code for bugs, security issues and maintainability",
        content: `You are a senior engineer reviewing a pull request. Review the code below for:

1. Bugs and edge cases (null/undefined, empty inputs, off-by-one, race conditions)
2. Security issues (injection, missing auth checks, unvalidated input, leaked secrets)
3. Performance problems (unnecessary work, N+1 queries, re-renders)
4. Readability and maintainability

For each issue give: severity (high/medium/low), the line or snippet, why it matters, and a concrete fix.
Skip style nitpicks a linter would catch. If the code is solid, say so briefly.

\`\`\`
{{code}}
\`\`\``,
      },
      {
        type: "prompt",
        title: "Generate Documentation",
        description: "Write clear docs and JSDoc comments for a module",
        content: `Write documentation for the following code.

- Start with a 2–3 sentence overview of what the module does and when to use it
- Document each exported function/component: purpose, parameters, return value, and thrown errors
- Add a short, realistic usage example
- Note any side effects, assumptions or gotchas
- Output JSDoc comments I can paste above each export, followed by a README section in Markdown

\`\`\`
{{code}}
\`\`\``,
      },
      {
        type: "prompt",
        title: "Refactoring Assistant",
        description: "Refactor code for clarity without changing behavior",
        content: `Refactor the code below to improve readability and maintainability without changing its behavior.

Constraints:
- Keep the public API (exports, function signatures) the same
- Prefer small, well-named functions and early returns over deep nesting
- Remove duplication, but don't introduce abstractions that only have one use
- Keep the existing code style and libraries

First list the problems you see, then show the refactored code, then explain each change in one line.

\`\`\`
{{code}}
\`\`\``,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        type: "snippet",
        title: "Next.js Multi-stage Dockerfile",
        description: "Small production image for a Next.js app using standalone output",
        language: "dockerfile",
        content: `FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]`,
      },
      {
        type: "command",
        title: "Deploy to Production",
        description: "Apply pending database migrations, then deploy to Vercel",
        language: "bash",
        content: "npx prisma migrate deploy && vercel deploy --prod",
      },
      {
        type: "link",
        title: "Docker Docs",
        description: "Official Docker documentation and Dockerfile reference",
        url: "https://docs.docker.com/",
      },
      {
        type: "link",
        title: "GitHub Actions Docs",
        description: "Workflows, runners and CI/CD with GitHub Actions",
        url: "https://docs.github.com/en/actions",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        type: "command",
        title: "Pretty Git Log",
        description: "Compact commit graph across all branches",
        language: "bash",
        content: "git log --oneline --graph --decorate --all",
      },
      {
        type: "command",
        title: "Docker Cleanup",
        description: "Remove stopped containers, unused images, networks and build cache",
        language: "bash",
        content: "docker system prune -a",
      },
      {
        type: "command",
        title: "Kill Process on Port",
        description: "Free up a port held by a stuck dev server",
        language: "bash",
        content: "lsof -ti :3000 | xargs kill -9",
      },
      {
        type: "command",
        title: "Interactive Dependency Updates",
        description: "Pick which npm packages to upgrade to their latest versions",
        language: "bash",
        content: "npx npm-check-updates --interactive",
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        type: "link",
        title: "Tailwind CSS Docs",
        description: "Utility classes, theme configuration and v4 reference",
        url: "https://tailwindcss.com/docs",
      },
      {
        type: "link",
        title: "shadcn/ui",
        description: "Accessible, copy-paste React components built on Tailwind",
        url: "https://ui.shadcn.com",
      },
      {
        type: "link",
        title: "Material Design 3",
        description: "Google's design system: foundations, styles and components",
        url: "https://m3.material.io",
      },
      {
        type: "link",
        title: "Lucide Icons",
        description: "Open-source icon library used across DevStash",
        url: "https://lucide.dev/icons",
      },
    ],
  },
];

// System types have userId = null, and Postgres treats NULLs as distinct in unique
// constraints, so upsert on [userId, name] isn't possible. Match by name case-insensitively
// so types from earlier seeds (e.g. "Snippet") are renamed in place rather than duplicated.
async function seedSystemTypes(): Promise<Map<SystemTypeName, string>> {
  const typeIds = new Map<SystemTypeName, string>();
  for (const type of SYSTEM_TYPES) {
    const existing = await prisma.itemType.findFirst({
      where: { isSystem: true, userId: null, name: { equals: type.name, mode: "insensitive" } },
    });
    const record = existing
      ? await prisma.itemType.update({ where: { id: existing.id }, data: type })
      : await prisma.itemType.create({ data: { ...type, isSystem: true } });
    typeIds.set(type.name, record.id);
  }
  console.log(`✔ System item types: ${SYSTEM_TYPES.map((type) => type.name).join(", ")}`);
  return typeIds;
}

function contentTypeFor(type: SystemTypeName): ContentType {
  if (type === "link") return "URL";
  if (type === "file" || type === "image") return "FILE";
  return "TEXT";
}

async function seedDemoUser(typeIds: Map<SystemTypeName, string>) {
  // Deleting a user cascades to their items, collections and tags.
  const { count } = await prisma.user.deleteMany({
    where: { email: { in: [DEMO_USER.email, ...LEGACY_SEED_EMAILS] } },
  });
  if (count > 0) console.log(`✔ Removed ${count} existing seed user(s)`);

  const user = await prisma.user.create({
    data: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      password: await hash(DEMO_USER.password, BCRYPT_ROUNDS),
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log(`✔ Demo user: ${user.email}`);

  for (const collection of COLLECTIONS) {
    await prisma.collection.create({
      data: {
        name: collection.name,
        description: collection.description,
        userId: user.id,
        items: {
          create: collection.items.map(({ type, ...item }) => ({
            item: {
              create: {
                ...item,
                contentType: contentTypeFor(type),
                userId: user.id,
                typeId: typeIds.get(type)!,
              },
            },
          })),
        },
      },
    });
    console.log(`  ✔ ${collection.name}: ${collection.items.length} items`);
  }
}

async function main() {
  const typeIds = await seedSystemTypes();
  await seedDemoUser(typeIds);
  console.log("\nSeed complete.");
}

main()
  .catch((error) => {
    console.error("✖ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
