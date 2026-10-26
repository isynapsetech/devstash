// Temporary mock data for the dashboard UI. Replace with database queries once Prisma is set up.

export type ContentType = "TEXT" | "FILE" | "URL";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export interface MockItemType {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  color: string;
  itemCount: number;
}

export interface MockCollection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  isPinned: boolean;
  itemCount: number;
  typeIds: string[]; // item types shown as icons on the collection card
}

export interface MockItem {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  content?: string;
  language?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  typeId: string;
  collectionIds: string[];
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const currentUser: MockUser = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
  isPro: true,
};

export const itemTypes: MockItemType[] = [
  { id: "type_snippet", name: "Snippets", slug: "snippets", icon: "Code", color: "#3b82f6", itemCount: 24 },
  { id: "type_prompt", name: "Prompts", slug: "prompts", icon: "Sparkles", color: "#8b5cf6", itemCount: 18 },
  { id: "type_command", name: "Commands", slug: "commands", icon: "Terminal", color: "#f97316", itemCount: 15 },
  { id: "type_note", name: "Notes", slug: "notes", icon: "StickyNote", color: "#fde047", itemCount: 12 },
  { id: "type_file", name: "Files", slug: "files", icon: "File", color: "#6b7280", itemCount: 5 },
  { id: "type_image", name: "Images", slug: "images", icon: "Image", color: "#ec4899", itemCount: 3 },
  { id: "type_link", name: "Links", slug: "links", icon: "Link", color: "#10b981", itemCount: 8 },
];

export const collections: MockCollection[] = [
  {
    id: "col_react",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    isPinned: false,
    itemCount: 12,
    typeIds: ["type_snippet", "type_note", "type_link"],
  },
  {
    id: "col_python",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    isPinned: false,
    itemCount: 8,
    typeIds: ["type_snippet", "type_note"],
  },
  {
    id: "col_context",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    isPinned: false,
    itemCount: 5,
    typeIds: ["type_file", "type_note"],
  },
  {
    id: "col_interview",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    isPinned: false,
    itemCount: 24,
    typeIds: ["type_note", "type_snippet", "type_link", "type_prompt"],
  },
  {
    id: "col_git",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    isPinned: false,
    itemCount: 15,
    typeIds: ["type_command", "type_note"],
  },
  {
    id: "col_ai",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    isPinned: false,
    itemCount: 18,
    typeIds: ["type_prompt", "type_snippet", "type_note"],
  },
];

export const items: MockItem[] = [
  {
    id: "item_1",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    contentType: "TEXT",
    language: "typescript",
    content: `import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}`,
    typeId: "type_snippet",
    collectionIds: ["col_react"],
    tags: ["react", "auth", "hooks"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "item_2",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    contentType: "TEXT",
    language: "typescript",
    content: `export async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url)
      if (res.ok) return res
    } catch {}
    await new Promise((r) => setTimeout(r, 2 ** attempt * 500))
  }
  throw new Error(\`Request failed after \${retries} retries\`)
}`,
    typeId: "type_snippet",
    collectionIds: ["col_react", "col_interview"],
    tags: ["fetch", "error-handling", "api"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2024-01-12T09:30:00Z",
    updatedAt: "2024-01-12T09:30:00Z",
  },
  {
    id: "item_3",
    title: "Code Review Prompt",
    description: "Thorough code review focusing on bugs and security",
    contentType: "TEXT",
    content:
      "Review the following code for bugs, security issues and performance problems. List each issue with its severity and a suggested fix.",
    typeId: "type_prompt",
    collectionIds: ["col_ai"],
    tags: ["ai", "code-review"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-11T08:00:00Z",
  },
  {
    id: "item_4",
    title: "Undo Last Commit",
    description: "Undo the last commit but keep the changes staged",
    contentType: "TEXT",
    language: "bash",
    content: "git reset --soft HEAD~1",
    typeId: "type_command",
    collectionIds: ["col_git"],
    tags: ["git"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-08T16:20:00Z",
    updatedAt: "2024-01-08T16:20:00Z",
  },
  {
    id: "item_5",
    title: "List Comprehension Tricks",
    description: "Nested and conditional list comprehensions",
    contentType: "TEXT",
    language: "python",
    content: "evens = [x for x in range(20) if x % 2 == 0]\npairs = [(a, b) for a in range(3) for b in range(3)]",
    typeId: "type_snippet",
    collectionIds: ["col_python"],
    tags: ["python", "lists"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-06T11:00:00Z",
    updatedAt: "2024-01-06T11:00:00Z",
  },
  {
    id: "item_6",
    title: "Big-O Cheat Sheet",
    description: "Time complexity of common data structure operations",
    contentType: "TEXT",
    language: "markdown",
    content: "## Big-O\n\n- Array access: O(1)\n- Hash map lookup: O(1) avg\n- Binary search: O(log n)\n- Sorting: O(n log n)",
    typeId: "type_note",
    collectionIds: ["col_interview"],
    tags: ["algorithms", "interview"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-05T13:45:00Z",
    updatedAt: "2024-01-07T10:15:00Z",
  },
  {
    id: "item_7",
    title: "React Docs",
    description: "Official React documentation",
    contentType: "URL",
    url: "https://react.dev",
    typeId: "type_link",
    collectionIds: ["col_react"],
    tags: ["react", "docs"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-04T09:00:00Z",
    updatedAt: "2024-01-04T09:00:00Z",
  },
  {
    id: "item_8",
    title: "CLAUDE.md Template",
    description: "Starter context file for AI coding assistants",
    contentType: "FILE",
    fileName: "CLAUDE.md",
    fileSize: 2048,
    typeId: "type_file",
    collectionIds: ["col_context"],
    tags: ["ai", "context"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-03T15:30:00Z",
    updatedAt: "2024-01-03T15:30:00Z",
  },
  {
    id: "item_9",
    title: "Architecture Diagram",
    description: "System overview diagram for the DevStash app",
    contentType: "FILE",
    fileName: "architecture.png",
    fileSize: 184320,
    typeId: "type_image",
    collectionIds: [],
    tags: ["architecture"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-02T12:00:00Z",
    updatedAt: "2024-01-02T12:00:00Z",
  },
];
