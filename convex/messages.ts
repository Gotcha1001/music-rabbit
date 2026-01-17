// convex/messages.ts - Enhanced with read/delete functionality
import { v } from "convex/values";
import { mutation, query } from ".//_generated/server";

// Send a message
export const send = mutation({
  args: {
    toId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const fromUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!fromUser) throw new Error("Sender not found");

    await ctx.db.insert("messages", {
      fromId: fromUser._id,
      toId: args.toId,
      content: args.content,
      timestamp: Date.now(),
      isRead: false, // NEW
      deletedBy: [], // NEW
    });
  },
});

// Get messages for a user (excluding deleted ones)
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_to", (q) => q.eq("toId", userId))
      .order("desc")
      .collect();

    // Filter out messages that current user has deleted
    return allMessages.filter((msg) => !msg.deletedBy?.includes(userId));
  },
});

// Get unread count for a user
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_to_unread", (q) =>
        q.eq("toId", userId).eq("isRead", false)
      )
      .collect();

    // Filter out deleted messages
    return unread.filter((msg) => !msg.deletedBy?.includes(userId)).length;
  },
});

// Mark message as read
export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    // Only the recipient can mark as read
    if (message.toId !== user._id) {
      throw new Error("You can only mark your own messages as read");
    }

    await ctx.db.patch(messageId, { isRead: true });
    return { success: true };
  },
});

// Mark all messages as read for current user
export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_to_unread", (q) =>
        q.eq("toId", user._id).eq("isRead", false)
      )
      .collect();

    // Batch update all unread messages
    await Promise.all(
      unreadMessages.map((msg) => ctx.db.patch(msg._id, { isRead: true }))
    );

    return { markedCount: unreadMessages.length };
  },
});

// Soft delete a message (only hides from user's view)
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    // Can only delete if you're the sender or recipient
    if (message.fromId !== user._id && message.toId !== user._id) {
      throw new Error("You can only delete your own messages");
    }

    const currentDeletedBy = message.deletedBy || [];

    // Add user to deletedBy array if not already there
    if (!currentDeletedBy.includes(user._id)) {
      await ctx.db.patch(messageId, {
        deletedBy: [...currentDeletedBy, user._id],
      });
    }

    // If both sender and recipient have deleted, permanently delete
    const bothDeleted =
      currentDeletedBy.includes(message.fromId) &&
      currentDeletedBy.includes(message.toId);

    if (
      bothDeleted ||
      (currentDeletedBy.includes(message.fromId) &&
        message.toId === user._id) ||
      (currentDeletedBy.includes(message.toId) && message.fromId === user._id)
    ) {
      await ctx.db.delete(messageId);
      return { permanentlyDeleted: true };
    }

    return { success: true, permanentlyDeleted: false };
  },
});

// Admin only: Permanently delete a message
export const adminDeleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    await ctx.db.delete(messageId);
    return { success: true };
  },
});

// Get conversation between two users
export const getConversation = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) return [];

    // Get all messages between the two users
    const allMessages = await ctx.db.query("messages").collect();

    const conversation = allMessages.filter((msg) => {
      const isBetweenUsers =
        (msg.fromId === currentUser._id && msg.toId === otherUserId) ||
        (msg.fromId === otherUserId && msg.toId === currentUser._id);

      const notDeleted = !msg.deletedBy?.includes(currentUser._id);

      return isBetweenUsers && notDeleted;
    });

    // Sort by timestamp (newest first)
    return conversation.sort((a, b) => b.timestamp - a.timestamp);
  },
});
