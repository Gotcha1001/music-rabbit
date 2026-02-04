// convex/bookCategories.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user || user.role !== "admin") {
    throw new Error("Admin only");
  }
  return user;
}

// 1. Get all categories (admin view)
export const getAllForAdmin = query({
  handler: async (ctx) => {
    return await ctx.db.query("bookCategories").collect();
  },
});
// Add this near the other queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("bookCategories").collect();
  },
});

// 2. Get categories + book count (for badges)
export const getCategoriesWithBookCounts = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("bookCategories").collect();
    const books = await ctx.db.query("books").collect();

    return categories.map((cat) => ({
      ...cat,
      bookCount: books.filter((b) => b.categoryId === cat._id).length,
    }));
  },
});

// 3. Create category
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    hasLevels: v.boolean(),
    maxLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const all = await ctx.db.query("bookCategories").collect();
    const nextSort =
      all.length === 0 ? 0 : Math.max(...all.map((c) => c.sortOrder ?? 0)) + 1;

    return await ctx.db.insert("bookCategories", {
      name: args.name,
      slug: generateSlug(args.name),
      description: args.description ?? "",
      icon: args.icon ?? "BookOpen",
      color: args.color ?? "#3b82f6",
      hasLevels: args.hasLevels,
      maxLevel: args.maxLevel ?? (args.hasLevels ? 10 : undefined),
      isActive: true,
      sortOrder: nextSort,
      createdAt: Date.now(),
      createdBy: admin._id,
    });
  },
});

// 4. Update category
export const update = mutation({
  args: {
    categoryId: v.id("bookCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    hasLevels: v.optional(v.boolean()),
    maxLevel: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { categoryId, ...updates }) => {
    await requireAdmin(ctx);

    const patch: Record<string, string | number | boolean | undefined> = {
      ...updates,
    };
    if (updates.name) patch.slug = generateSlug(updates.name);

    // Clean undefined
    Object.keys(patch).forEach(
      (key) => patch[key] === undefined && delete patch[key],
    );

    await ctx.db.patch(categoryId, patch);
  },
});

// 5. Soft delete (disable)
export const softDelete = mutation({
  args: { categoryId: v.id("bookCategories") },
  handler: async (ctx, { categoryId }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(categoryId, { isActive: false });
  },
});

// 6. Reorder categories (drag & drop)
export const reorder = mutation({
  args: {
    orderedIds: v.array(v.id("bookCategories")),
  },
  handler: async (ctx, { orderedIds }) => {
    await requireAdmin(ctx);

    const promises = orderedIds.map((id, index) =>
      ctx.db.patch(id, { sortOrder: index }),
    );

    await Promise.all(promises);
  },
});

// Add this to convex/bookCategories.ts (right after getAllForAdmin)
export const getActive = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("bookCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
});
