// convex/globalMessages.ts

import { v } from "convex/values";
import { mutation, query } from "./\_generated/server";

// Admin creates a global message
export const create = mutation({
  args: {
    content: v.string(),
    priority: v.union(
      v.literal("normal"),
      v.literal("important"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin only");
    }

    const messageId = await ctx.db.insert("globalMessages", {
      content: args.content,
      createdBy: admin._id,
      createdAt: Date.now(),
      priority: args.priority,
      isActive: true,
      readBy: [],
    });

    return messageId;
  },
});

// Get active unread messages for current teacher
export const getUnreadForTeacher = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!teacher || teacher.role !== "teacher") return [];

    const activeMessages = await ctx.db
      .query("globalMessages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();

    // Filter out messages already read by this teacher
    return activeMessages.filter((msg) => !msg.readBy.includes(teacher._id));
  },
});

// Teacher marks message as read
export const markAsRead = mutation({
  args: { messageId: v.id("globalMessages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Teachers only");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Add teacher to readBy array if not already there
    if (!message.readBy.includes(teacher._id)) {
      await ctx.db.patch(args.messageId, {
        readBy: [...message.readBy, teacher._id],
      });
    }
  },
});

// Admin gets all messages with stats
export const getAllWithStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin only");
    }

    const messages = await ctx.db
      .query("globalMessages")
      .order("desc")
      .collect();

    const teachers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "teacher"))
      .collect();

    const totalTeachers = teachers.length;

    return messages.map((msg) => ({
      ...msg,
      readCount: msg.readBy.length,
      totalTeachers,
      percentageRead:
        totalTeachers > 0
          ? Math.round((msg.readBy.length / totalTeachers) * 100)
          : 0,
    }));
  },
});

// Admin deactivates a message (removes it from teacher feeds)
export const deactivate = mutation({
  args: { messageId: v.id("globalMessages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin only");
    }

    await ctx.db.patch(args.messageId, { isActive: false });
  },
});

// Admin deletes a message permanently
export const remove = mutation({
  args: { messageId: v.id("globalMessages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin only");
    }

    await ctx.db.delete(args.messageId);
  },
});

export const getActiveMessages = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("globalMessages")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});
