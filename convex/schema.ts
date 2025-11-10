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
    instrument: v.optional(v.string()), // For teachers/students
    tokenIdentifier: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token", ["tokenIdentifier"]),

  schedules: defineTable({
    teacherId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    lessons: v.array(
      v.object({
        studentId: v.id("users"),
        time: v.string(), // HH:MM
        duration: v.number(), // Minutes
        bookId: v.optional(v.id("books")),
        zoomLink: v.optional(v.string()),
        completed: v.boolean(),
        notes: v.optional(v.string()),
      })
    ),
  }).index("by_teacher_date", ["teacherId", "date"]),

  books: defineTable({
    title: v.string(),
    level: v.string(), // basic/advanced
    instrument: v.string(),
    fileId: v.id("_storage"), // Convex storage ID for PDF
  }),

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
  }),
});
