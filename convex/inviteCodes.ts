// convex/inviteCodes.ts (updated with activate mutation)
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate random 8-char code
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create invite code (admin only)
export const create = mutation({
  args: {
    description: v.optional(v.string()),
    role: v.union(v.literal("teacher"), v.literal("student")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") {
      throw new Error("Admin access required");
    }
    const code = generateCode();
    const inviteId = await ctx.db.insert("inviteCodes", {
      code,
      createdBy: identity.subject,
      usedCount: 0,
      isActive: true,
      createdAt: Date.now(),
      description: args.description,
      role: args.role,
    });
    return await ctx.db.get(inviteId);
  },
});

// Get all invite codes (admin only)
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") {
      throw new Error("Admin access required");
    }
    return await ctx.db.query("inviteCodes").order("desc").collect();
  },
});

// Validate invite code (public, returns role if valid)
export const validate = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    if (!invite) {
      return { valid: false, message: "Invalid invite code" };
    }
    if (!invite.isActive) {
      return { valid: false, message: "This invite code is no longer active" };
    }
    return {
      valid: true,
      message: "Valid invite code",
      role: invite.role,
    };
  },
});

// Deactivate invite code (admin only)
export const deactivate = mutation({
  args: { inviteId: v.id("inviteCodes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Admin access required");
    await ctx.db.patch(args.inviteId, { isActive: false });
  },
});

// Activate invite code (admin only) - NEW
export const activate = mutation({
  args: { inviteId: v.id("inviteCodes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Admin access required");
    await ctx.db.patch(args.inviteId, { isActive: true });
  },
});

// Delete invite code (admin only)
export const remove = mutation({
  args: { inviteId: v.id("inviteCodes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Admin access required");
    await ctx.db.delete(args.inviteId);
  },
});
