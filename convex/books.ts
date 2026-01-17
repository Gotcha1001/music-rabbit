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
    categoryId: v.id("bookCategories"), // ← Make sure this is in args
    levelNumber: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    driveFileId: v.string(),
    driveViewLink: v.string(),
    driveDownloadLink: v.optional(v.string()),
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
          `Level must be between 1 and ${maxLevel} for this category`
        );
      }
    }

    // ✅ NOW INSERT WITH ALL REQUIRED FIELDS
    await ctx.db.insert("books", {
      title: args.title,
      instrument: args.instrument,
      categoryId: args.categoryId, // ← REQUIRED
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
    });
  },
});

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

// Remove getUrl if no longer using Convex storage
// export const getUrl = query({
//   args: { storageId: v.id("_storage") },
//   handler: async (ctx, { storageId }) => {
//     return await ctx.storage.getUrl(storageId);
//   },
// });
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

    // Optional: also delete the file from Google Drive
    // (we will do it from the Next.js API route below so we can use the service account)

    await ctx.db.delete(bookId);
  },
});

// convex/books.ts — REPLACE the entire getByCategory function
export const getByCategory = query({
  args: {
    categoryId: v.id("bookCategories"),
    // Remove instrument filtering completely — we want ALL books in the category
    search: v.optional(v.string()),
  },
  handler: async (ctx, { categoryId, search }) => {
    const books = await ctx.db
      .query("books")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect();

    if (!search) return books;

    const lowerSearch = search.toLowerCase();
    return books.filter((book) => {
      return (
        book.title.toLowerCase().includes(lowerSearch) ||
        (book.levelNumber?.toString() ?? "").includes(lowerSearch) ||
        book.subcategory?.toLowerCase().includes(lowerSearch)
      );
    });
  },
});
