import {
  mutation,
  query,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";

// Save or update a push subscription for the current user
export const save = mutation({
  args: {
    subscription: v.string(), // JSON.stringify(PushSubscriptionJSON)
  },
  handler: async (ctx, { subscription }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized - no identity");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        subscription,
        updatedAt: now,
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("pushSubscriptions", {
        userId: user._id,
        clerkId: identity.subject,
        subscription,
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

// Remove the push subscription for the current user (opt-out)
export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true, message: "Subscription removed" };
    }

    return { success: false, message: "No subscription found" };
  },
});

// Check if the current user has an active push subscription
// Used for showing the toggle state in the UI
export const hasActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return false;
    }

    const sub = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return !!sub;
  },
});

// Internal: Get subscription for a specific user (called by cron action)
// MUST be internalQuery — regular query is NOT visible on internal.*
export const getForUser = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Internal: Remove a specific subscription (called when we get 410 Gone from web-push)
export const removeExpired = internalMutation({
  args: {
    subscriptionId: v.id("pushSubscriptions"),
  },
  handler: async (ctx, { subscriptionId }) => {
    await ctx.db.delete(subscriptionId);
  },
});
