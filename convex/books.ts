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
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Not admin");

    await ctx.db.insert("books", args);
  },
});
// convex/books.ts  (add this query)
export const getById = query({
  args: { id: v.id("books") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
