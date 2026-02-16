import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("books").collect();
  },
});

export const upload = mutation({
  args: {
    title: v.string(),
    instrument: v.string(),
    categoryId: v.id("bookCategories"),
    levelNumber: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    driveFileId: v.string(),
    driveViewLink: v.string(),
    driveDownloadLink: v.optional(v.string()),

    // ────────────────────────────────────────────────
    // NEW arguments — added here
    // ────────────────────────────────────────────────
    seriesGroup: v.optional(v.string()), // "C Major Complete"
    seriesOrder: v.optional(v.number()), // 1, 2, 3...
    seriesCategory: v.optional(v.string()), // "Major Scales"
    isSeriesEnd: v.optional(v.boolean()), // true only on last lesson
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (user?.role !== "admin") throw new Error("Not admin");

    // Verify category exists and is active
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    if (!category.isActive) throw new Error("Category is disabled");

    // Validate level number if category has levels
    if (category.hasLevels && args.levelNumber) {
      const maxLevel = category.maxLevel || 10;
      if (args.levelNumber < 1 || args.levelNumber > maxLevel) {
        throw new Error(
          `Level must be between 1 and ${maxLevel} for this category`,
        );
      }
    }

    // Optional: validate series fields if used
    if (args.seriesGroup && !args.seriesOrder) {
      throw new Error("seriesOrder is required when seriesGroup is provided");
    }

    // Insert with ALL fields (old + new)
    await ctx.db.insert("books", {
      title: args.title,
      instrument: args.instrument,
      categoryId: args.categoryId,
      levelNumber: args.levelNumber,
      difficulty: args.difficulty,
      subcategory: args.subcategory,
      description: args.description,
      tags: args.tags,
      driveFileId: args.driveFileId,
      driveViewLink: args.driveViewLink,
      driveDownloadLink: args.driveDownloadLink,
      uploadedBy: user._id,
      uploadedAt: Date.now(),
      timesUsed: 0,

      // ────────────────────────────────────────────────
      // NEW fields being saved
      // ────────────────────────────────────────────────
      seriesGroup: args.seriesGroup,
      seriesOrder: args.seriesOrder,
      seriesCategory: args.seriesCategory,
      isSeriesEnd: args.isSeriesEnd,
    });
  },
});

// ────────────────────────────────────────────────
// Existing queries (unchanged)
// ────────────────────────────────────────────────

export const getById = query({
  args: { id: v.id("books") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByInstrument = query({
  args: { instrument: v.string() },
  handler: async (ctx, { instrument }) => {
    return await ctx.db
      .query("books")
      .withIndex("by_instrument", (q) => q.eq("instrument", instrument))
      .collect();
  },
});

export const remove = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, { bookId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (user?.role !== "admin") throw new Error("Admin only");

    await ctx.db.delete(bookId);
  },
});

export const getByCategory = query({
  args: {
    categoryId: v.id("bookCategories"),
    search: v.optional(v.string()),
  },
  handler: async (ctx, { categoryId, search }) => {
    const books = await ctx.db
      .query("books")
      .withIndex("by_category_uploadedAt", (q) =>
        q.eq("categoryId", categoryId),
      )
      .order("desc")
      .collect();

    if (!search) return books;

    const lowerSearch = search.toLowerCase().trim();

    return books.filter((book) => {
      return (
        book.title.toLowerCase().includes(lowerSearch) ||
        (book.description ?? "").toLowerCase().includes(lowerSearch) ||
        (book.subcategory ?? "").toLowerCase().includes(lowerSearch) ||
        (book.levelNumber?.toString() ?? "").includes(lowerSearch) ||
        (book.tags ?? []).some((tag) => tag.toLowerCase().includes(lowerSearch))
      );
    });
  },
});

export const getAllActive = query({
  handler: async (ctx) => {
    return await ctx.db.query("books").collect();
  },
});

export const searchBooks = query({
  args: {
    search: v.optional(v.string()),
    instrument: v.optional(v.string()),
    categoryId: v.optional(v.id("bookCategories")),
  },
  handler: async (ctx, { search, instrument, categoryId }) => {
    let books;

    if (instrument) {
      books = await ctx.db
        .query("books")
        .withIndex("by_instrument", (q) => q.eq("instrument", instrument))
        .collect();
    } else if (categoryId) {
      books = await ctx.db
        .query("books")
        .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
        .collect();
    } else {
      books = await ctx.db.query("books").collect();
    }

    if (categoryId && instrument) {
      books = books.filter((b) => b.categoryId === categoryId);
    }

    if (!search) return books;

    const lower = search.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.description?.toLowerCase().includes(lower) ||
        b.subcategory?.toLowerCase().includes(lower) ||
        b.tags?.some((t) => t.toLowerCase().includes(lower)),
    );
  },
});

export const fullTextSearch = query({
  args: {
    query: v.string(),
    instrument: v.optional(v.string()),
    categoryId: v.optional(v.id("bookCategories")),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("books")
      .withSearchIndex("search_books", (q) => q.search("title", args.query));

    if (args.instrument) {
      q = q.filter((q) => q.eq(q.field("instrument"), args.instrument));
    }
    if (args.categoryId) {
      q = q.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }

    return await q.collect();
  },
});

// ────────────────────────────────────────────────
// NEW HELPER QUERY — we'll use this later for auto-next
// ────────────────────────────────────────────────
export const getNextInSeries = query({
  args: {
    currentBookId: v.id("books"),
  },
  handler: async (ctx, { currentBookId }) => {
    const current = await ctx.db.get(currentBookId);
    if (!current) return null;

    if (!current.seriesGroup || !current.seriesOrder) {
      return null; // Not part of a series
    }

    // Find the next book in the same seriesGroup with order +1
    const nextBook = await ctx.db
      .query("books")
      .withIndex("by_series_group_order", (q) =>
        q
          .eq("seriesGroup", current.seriesGroup!)
          .eq("seriesOrder", (current.seriesOrder ?? 0) + 1),
      )
      .first();

    return nextBook || null;
  },
});
