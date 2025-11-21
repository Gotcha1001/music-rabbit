import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student")
    ),
    email: v.string(),
    name: v.optional(v.string()), // ← ADD THIS
    imageUrl: v.optional(v.string()),
    instrument: v.optional(v.string()),
    currentTeacher: v.optional(v.id("users")), // ← student’s preferred teacher
    tokenIdentifier: v.string(),
    zoomLink: v.optional(v.string()),
    currentBookId: v.optional(v.id("books")),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_role", ["role"])
    .index("by_role_instrument", ["role", "instrument"]),

  schedules: defineTable({
    teacherId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    lessons: v.array(
      v.object({
        lessonId: v.string(), // unique string ID
        studentId: v.id("users"),
        time: v.string(), // HH:MM
        duration: v.number(), // Minutes
        bookId: v.optional(v.id("books")),
        zoomLink: v.optional(v.string()),
        completed: v.boolean(),
        notes: v.optional(v.string()),
        // ADD THESE TWO NEW FIELDS
        status: v.optional(
          v.union(
            v.literal("scheduled"),
            v.literal("calling"),
            v.literal("in_progress"),
            v.literal("completed"),
            v.literal("finished_early"),
            v.literal("no_answer"),
            v.literal("teacher_late"),
            v.literal("cancelled")
          )
        ),
        statusNote: v.optional(v.string()),
      })
    ),
  }).index("by_teacher_date", ["teacherId", "date"]),

  books: defineTable({
    title: v.string(),
    level: v.string(),
    instrument: v.string(),
    driveFileId: v.string(),
    driveViewLink: v.string(),
    driveDownloadLink: v.optional(v.string()),
    uploadedBy: v.optional(v.id("users")),
    uploadedAt: v.number(),
  }).index("by_instrument", ["instrument"]), // Add this index

  messages: defineTable({
    fromId: v.id("users"),
    toId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_to", ["toId"]),

  payments: defineTable({
    teacherId: v.id("users"),
    month: v.string(), // YYYY-MM
    totalHours: v.number(),
    earnings: v.number(), // Calculated
    deductions: v.number(),
  }).index("by_teacher", ["teacherId"]),

  // NEW: Invite codes table
  inviteCodes: defineTable({
    code: v.string(),
    createdBy: v.string(), // Clerk ID of admin who created it
    usedCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    description: v.optional(v.string()),
    role: v.union(v.literal("teacher"), v.literal("student")), // Role-specific
  })
    .index("by_code", ["code"])
    .index("by_createdBy", ["createdBy"])
    .index("by_isActive", ["isActive"])
    .index("by_role", ["role"]),

  // FIXED: Recordings table (now inside schema)
  recordings: defineTable({
    scheduleId: v.id("schedules"), // Parent schedule ID
    lessonStringId: v.string(), // Matches lesson.lessonId (string) to identify specific lesson
    teacherId: v.id("users"),
    recordingUrl: v.string(), // Zoom cloud recording URL
    timestamp: v.number(),
    notes: v.optional(v.string()), // Teacher comments on recording
  }).index("by_teacher", ["teacherId"]),
});
