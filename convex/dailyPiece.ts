import { v } from "convex/values";
import { query } from "./_generated/server";

// Get the Daily piece category (by name — reliable)
export const getDailyCategory = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("bookCategories")
      .withIndex("by_name", (q) => q.eq("name", "Daily piece"))
      .first();
  },
});

// Get all books in Daily piece category, newest first
export const getDailyPieces = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("bookCategories")
      .withIndex("by_name", (q) => q.eq("name", "Daily piece"))
      .first();

    if (!category) return [];

    const allBooks = await ctx.db
      .query("books")
      .withIndex("by_category_uploadedAt", (q) =>
        q.eq("categoryId", category._id),
      )
      .order("desc")
      .collect();

    let books = allBooks;

    // Apply limit in JS (safe and type-clear)
    if (args.limit !== undefined && args.limit > 0) {
      books = books.slice(0, args.limit);
    }

    // Optional client-side search/filter
    if (args.search) {
      const term = args.search.toLowerCase().trim();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          (b.description ?? "").toLowerCase().includes(term) ||
          (b.tags ?? []).some((t) => t.toLowerCase().includes(term)),
      );
    }

    return books;
  },
});

export const getTodaysPiece = query({
  handler: async (ctx) => {
    const category = await ctx.db
      .query("bookCategories")
      .withIndex("by_name", (q) => q.eq("name", "Daily piece"))
      .first();

    if (!category) return null;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = todayStart.getTime();

    return await ctx.db
      .query("books")
      .withIndex("by_category_uploadedAt", (q) =>
        q.eq("categoryId", category._id),
      )
      .filter((q) => q.gte(q.field("uploadedAt"), todayTimestamp))
      .order("desc")
      .first();
  },
});
