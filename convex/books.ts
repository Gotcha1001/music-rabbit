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
    level: v.string(),
    instrument: v.string(),
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

    await ctx.db.insert("books", {
      ...args,
      uploadedBy: user._id,
      uploadedAt: Date.now(),
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
