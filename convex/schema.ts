import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student"),
    ),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    instrument: v.optional(v.string()),
    currentTeacher: v.optional(v.id("users")),
    tokenIdentifier: v.string(),
    zoomLink: v.optional(v.string()),
    currentBookId: v.optional(v.id("books")),
    timezone: v.optional(v.string()),
    country: v.optional(v.string()),
    state: v.optional(v.string()),
    degree: v.optional(v.string()),
    institution: v.optional(v.string()),
    bio: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
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
        lessonId: v.string(),
        studentId: v.id("users"),
        time: v.string(), // HH:MM
        duration: v.number(), // Minutes
        bookId: v.union(v.id("books"), v.null()),
        zoomLink: v.optional(v.string()),
        completed: v.boolean(),
        notes: v.optional(v.string()),
        startedAt: v.optional(v.number()),

        // UPDATED: New payment-based status system
        status: v.union(
          v.literal("completed"), // Full pay
          v.literal("finished_early"), // Full pay - student requested
          v.literal("no_answer_on_time"), // Full pay - teacher on time, student no-show
          v.literal("teacher_never_called"), // $20 deduction - teacher missed
          v.literal("technical_difficulty"), // No pay from either side
          v.literal("teacher_late"), // Full pay - $5 deduction
        ),

        // Lifecycle state
        state: v.union(
          v.literal("scheduled"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("missed_teacher"),
          v.literal("missed_student"),
        ),

        endedAt: v.optional(v.number()),
        actualMinutes: v.optional(v.number()),
        onTime: v.optional(v.boolean()),
        joinedAt: v.optional(v.number()),
      }),
    ),
  }).index("by_teacher_date", ["teacherId", "date"]),

  bookCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    hasLevels: v.boolean(),
    maxLevel: v.optional(v.number()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"])
    .index("by_sort_order", ["sortOrder"]),

  books: defineTable({
    title: v.string(),
    instrument: v.string(),
    categoryId: v.id("bookCategories"),
    levelNumber: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    subcategory: v.optional(v.string()),
    driveFileId: v.string(),
    driveViewLink: v.string(),
    driveDownloadLink: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    uploadedBy: v.optional(v.id("users")),
    uploadedAt: v.number(),
    timesUsed: v.optional(v.number()),
    lastUsed: v.optional(v.number()),
  })
    .index("by_instrument", ["instrument"])
    .index("by_category", ["categoryId"])
    .index("by_instrument_category", ["instrument", "categoryId"])
    .index("by_category_level", ["categoryId", "levelNumber"]),

  messages: defineTable({
    fromId: v.id("users"),
    toId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    isRead: v.boolean(),
    deletedBy: v.optional(v.array(v.id("users"))),
  })
    .index("by_to", ["toId"])
    .index("by_from", ["fromId"])
    .index("by_to_unread", ["toId", "isRead"]),

  payments: defineTable({
    teacherId: v.id("users"),
    month: v.string(), // YYYY-MM
    totalHours: v.number(),
    earnings: v.number(),
    deductions: v.number(),
  }).index("by_teacher", ["teacherId"]),

  inviteCodes: defineTable({
    code: v.string(),
    createdBy: v.string(),
    usedCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    description: v.optional(v.string()),
    role: v.union(v.literal("teacher"), v.literal("student")),
  })
    .index("by_code", ["code"])
    .index("by_createdBy", ["createdBy"])
    .index("by_isActive", ["isActive"])
    .index("by_role", ["role"]),

  recordings: defineTable({
    scheduleId: v.id("schedules"),
    lessonStringId: v.string(),
    teacherId: v.id("users"),
    recordingUrl: v.string(),
    timestamp: v.number(),
    notes: v.optional(v.string()),
  }).index("by_teacher", ["teacherId"]),

  globalMessages: defineTable({
    content: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    priority: v.union(
      v.literal("normal"),
      v.literal("important"),
      v.literal("urgent"),
    ),
    isActive: v.boolean(),
    readBy: v.array(v.id("users")),
  })
    .index("by_active", ["isActive"])
    .index("by_created", ["createdAt"]),

  studentPackages: defineTable({
    studentId: v.id("users"),
    packageType: v.string(),
    minutesPerLesson: v.number(),
    lessonsPerWeek: v.number(),
    totalMinutesPerMonth: v.number(),
    minutesRemaining: v.number(),
    monthlyPrice: v.number(),
    currentMonth: v.string(),
    purchaseDate: v.number(),
    expiryDate: v.number(),
    remainingMinutes: v.number(),
    paymentId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled"),
    ),
    stripeSubscriptionId: v.optional(v.string()),
    source: v.optional(v.union(v.literal("paid"), v.literal("draw"))),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_month", ["currentMonth"])
    .index("by_payment_id", ["paymentId"]),

  studentPaymentHistory: defineTable({
    studentId: v.id("users"),
    packageId: v.id("studentPackages"),
    amount: v.number(),
    month: v.string(),
    paymentDate: v.number(),
    stripePaymentIntentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
  })
    .index("by_student", ["studentId"])
    .index("by_month", ["month"]),

  failedPayments: defineTable({
    paymentId: v.string(),
    studentId: v.id("users"),
    status: v.string(),
    amount: v.number(),
    reason: v.string(),
    timestamp: v.number(),
    resolved: v.boolean(),
  }).index("by_student", ["studentId"]),

  tutorMemos: defineTable({
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    studentId: v.id("users"),
    teacherId: v.id("users"),
    teacherName: v.string(),
    status: v.union(
      v.literal("OK"), // Lesson completed successfully (Full Pay)
      v.literal("ET"), // Ended Early (Full Pay)
      v.literal("NA"), // No Answer (Full Pay)
      v.literal("TI"), // Technical Issues (No Pay)
      v.literal("TL"), // Teacher was late (Full Pay - $5)
    ),
    bookUsed: v.optional(v.string()),
    pageProgress: v.optional(v.string()),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_teacher", ["teacherId"])
    .index("by_schedule_lesson", ["scheduleId", "lessonId"]),

  lessonCancellations: defineTable({
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    cancelledBy: v.id("users"),
    cancelledAt: v.number(),
    originalDate: v.string(),
    originalTime: v.string(),
    reason: v.optional(v.string()),
    hoursNotice: v.number(),
    penaltyApplied: v.boolean(),
    refundAmount: v.optional(v.number()),
  })
    .index("by_cancelled_by", ["cancelledBy"])
    .index("by_schedule", ["scheduleId"]),

  rescheduleRequests: defineTable({
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    requestedBy: v.id("users"),
    requestedAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    originalDate: v.string(),
    originalTime: v.string(),
    newDate: v.string(),
    newTime: v.string(),
    reason: v.optional(v.string()),
    respondedBy: v.optional(v.id("users")),
    respondedAt: v.optional(v.number()),
  })
    .index("by_requested_by", ["requestedBy"])
    .index("by_status", ["status"])
    .index("by_schedule", ["scheduleId"])
    .index("by_schedule_lesson", ["scheduleId", "lessonId"]),

  lessonRatings: defineTable({
    scheduleId: v.id("schedules"),
    lessonId: v.string(), // Matches lesson.lessonId in schedules
    studentId: v.id("users"),
    teacherId: v.id("users"),
    rating: v.number(), // 1-5, enforced in mutation
    timestamp: v.number(), // Date.now()
  })
    .index("by_teacher", ["teacherId"]) // For quick stats aggregation
    .index("by_lesson", ["scheduleId", "lessonId"]) // To check if rated
    .index("by_student_lesson", ["studentId", "scheduleId", "lessonId"]),

  teacherAvailability: defineTable({
    teacherId: v.id("users"),
    dayOfWeek: v.number(), // 0=Sun, 1=Mon, ... 6=Sat (only 1-5 populated)
    startTime: v.string(), // "10:00" local
    endTime: v.string(), // "17:00" local
    isActive: v.boolean(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_teacher_day", ["teacherId", "dayOfWeek"]),
});
