import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrGet = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) return existing;

    // Pull from Clerk identity with type assertion and safe access
    const emailAddresses = identity.emailAddresses as
      | Array<{ emailAddress: string }>
      | undefined;
    const email = emailAddresses?.[0]?.emailAddress || "";

    // Default role (now const)
    const role: "admin" | "teacher" | "student" = "student"; // Placeholder; update via Clerk webhook or form
    const instrument = ""; // Set later

    // Optional: Validate role explicitly if needed
    if (!["admin", "teacher", "student"].includes(role)) {
      throw new Error("Invalid role");
    }

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      role, // Direct assignment; Convex validates against schema
      email,
      instrument,
      tokenIdentifier: identity.tokenIdentifier || "",
    });

    // Sync role to Clerk metadata (optional, for navbar)
    // Use Clerk SDK in a Next.js server action if needed

    return await ctx.db.get(userId);
  },
});

export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// Add updateRole mutation for admin to set teacher/student/admin
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student")
    ),
    instrument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auth check: Only admin can update
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (caller?.role !== "admin") throw new Error("Not admin");

    await ctx.db.patch(args.userId, {
      role: args.role,
      instrument: args.instrument,
    });
  },
});
