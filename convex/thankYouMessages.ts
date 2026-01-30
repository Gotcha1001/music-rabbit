// convex/thankYouMessages.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Send a thank you message from student to teacher
export const send = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    teacherId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const student = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!student) throw new Error("Student not found");
    if (student.role !== "student")
      throw new Error("Only students can send thank you messages");

    // Check if a thank you message already exists for this lesson
    const existing = await ctx.db
      .query("thankYouMessages")
      .withIndex("by_schedule_lesson", (q) =>
        q.eq("scheduleId", args.scheduleId).eq("lessonId", args.lessonId),
      )
      .first();

    if (existing) {
      throw new Error(
        "You have already sent a thank you message for this lesson",
      );
    }

    const messageId = await ctx.db.insert("thankYouMessages", {
      scheduleId: args.scheduleId,
      lessonId: args.lessonId,
      studentId: student._id,
      teacherId: args.teacherId,
      message: args.message,
      timestamp: Date.now(),
      isRead: false,
    });

    return messageId;
  },
});

// Get all thank you messages for a teacher
export const getForTeacher = query({
  args: {
    teacherId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("thankYouMessages")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .order("desc")
      .take(args.limit || 50);

    // Get student details for each message
    const messagesWithDetails = await Promise.all(
      messages.map(async (msg) => {
        const student = await ctx.db.get(msg.studentId);
        const schedule = await ctx.db.get(msg.scheduleId);

        // Find the specific lesson
        const lesson = schedule?.lessons.find(
          (l) => l.lessonId === msg.lessonId,
        );

        return {
          ...msg,
          studentName: student?.name || "Unknown Student",
          studentImage: student?.imageUrl,
          lessonDate: schedule?.date,
          lessonTime: lesson?.time,
        };
      }),
    );

    return messagesWithDetails;
  },
});

// Get unread count for teacher
export const getUnreadCount = query({
  args: {
    teacherId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unreadMessages = await ctx.db
      .query("thankYouMessages")
      .withIndex("by_teacher_unread", (q) =>
        q.eq("teacherId", args.teacherId).eq("isRead", false),
      )
      .collect();

    return unreadMessages.length;
  },
});

// Mark message as read
export const markAsRead = mutation({
  args: {
    messageId: v.id("thankYouMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!teacher || teacher._id !== message.teacherId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.messageId, {
      isRead: true,
    });
  },
});

// Teacher responds to thank you message
export const respond = mutation({
  args: {
    messageId: v.id("thankYouMessages"),
    emoji: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const thankYouMessage = await ctx.db.get(args.messageId);
    if (!thankYouMessage) throw new Error("Message not found");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!teacher || teacher._id !== thankYouMessage.teacherId) {
      throw new Error("Only the teacher can respond");
    }

    if (!args.emoji && !args.message) {
      throw new Error("Must provide either emoji or message");
    }

    await ctx.db.patch(args.messageId, {
      teacherResponse: {
        emoji: args.emoji,
        message: args.message,
        timestamp: Date.now(),
      },
      isRead: true,
    });

    return { success: true };
  },
});

// Check if student has already sent a thank you message for a lesson
export const hasStudentSentMessage = query({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const student = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!student || student.role !== "student") return false;

    const existing = await ctx.db
      .query("thankYouMessages")
      .withIndex("by_schedule_lesson", (q) =>
        q.eq("scheduleId", args.scheduleId).eq("lessonId", args.lessonId),
      )
      .first();

    return !!existing;
  },
});

// Get thank you message for a specific lesson (for student to see teacher response)
export const getForLesson = query({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query("thankYouMessages")
      .withIndex("by_schedule_lesson", (q) =>
        q.eq("scheduleId", args.scheduleId).eq("lessonId", args.lessonId),
      )
      .first();

    if (!message) return null;

    const teacher = await ctx.db.get(message.teacherId);

    return {
      ...message,
      teacherName: teacher?.name || "Teacher",
      teacherImage: teacher?.imageUrl,
    };
  },
});

// Get all thank you messages sent by a student (for student history page)
export const getForStudent = query({
  args: {
    studentId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("thankYouMessages")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .take(args.limit || 50);

    // Get teacher details and lesson info for each message
    const messagesWithDetails = await Promise.all(
      messages.map(async (msg) => {
        const teacher = await ctx.db.get(msg.teacherId);
        const schedule = await ctx.db.get(msg.scheduleId);

        // Find the specific lesson
        const lesson = schedule?.lessons.find(
          (l) => l.lessonId === msg.lessonId,
        );

        return {
          ...msg,
          teacherName: teacher?.name || "Unknown Teacher",
          teacherImage: teacher?.imageUrl,
          lessonDate: schedule?.date,
          lessonTime: lesson?.time,
        };
      }),
    );

    return messagesWithDetails;
  },
});
