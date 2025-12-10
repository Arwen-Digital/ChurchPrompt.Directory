import { query } from "./_generated/server";

// Raw category document shape stored in Convex.
interface CategoryDoc {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  icon: string;
  promptCount: number;
  createdAt: number;
  updatedAt: number;
}

// Reduced prompt summary returned for boot hydration.
interface PromptSummary {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  usageCount: number;
  executionCount: number;
  tags: string[];
  createdAt: number;
  featured?: boolean;
}

export interface DirectoryBootData {
  categories: CategoryDoc[];
  recentPrompts: PromptSummary[];
  meta: {
    categoryCount: number;
    recentCount: number;
    generatedAt: number;
  };
}

// Aggregated boot data for directory page.
// Reduces multiple round trips (categories + recent prompts) into one.
// Extendable: add featured summaries, counts, etc.
export const getDirectoryBootData = query({
  args: {},
  handler: async ({ db }): Promise<DirectoryBootData> => {
    const categories: CategoryDoc[] = (await db.query("categories").collect()).sort(
      (a: any, b: any) => a.name.localeCompare(b.name)
    );

    const approved = await db
      .query("prompts")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    // Calculate actual prompt counts per category from approved prompts
    const categoryCountMap = new Map<string, number>();
    approved.forEach((p: any) => {
      const count = categoryCountMap.get(p.category) || 0;
      categoryCountMap.set(p.category, count + 1);
    });

    // Update category promptCount with actual counts
    const categoriesWithCounts = categories.map((cat: any) => ({
      ...cat,
      promptCount: categoryCountMap.get(cat.categoryId) || 0,
    }));

    const recentPrompts: PromptSummary[] = approved
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .slice(0, 3)
      .map((p: any) => ({
        id: p._id,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        authorName: p.authorName,
        usageCount: p.usageCount,
        executionCount: p.executionCount,
        tags: p.tags,
        createdAt: p.createdAt,
        featured: p.featured,
      }));

    return {
      categories: categoriesWithCounts,
      recentPrompts,
      meta: {
        categoryCount: categories.length,
        recentCount: recentPrompts.length,
        generatedAt: Date.now(),
      },
    };
  },
});
