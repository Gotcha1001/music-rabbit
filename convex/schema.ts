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

    // ✅ ADD THIS - Teacher hourly rate
    hourlyRate: v.optional(v.number()), // ZAR per hour, defaults to 300 in code
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_role", ["role"])
    .index("by_role_instrument", ["role", "instrument"]),

  schedules: defineTable({
    teacherId: v.id("users"),
    date: v.string(), // YYYY-MM-DD

    instrument: v.optional(v.string()),

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
        markedBy: v.optional(v.id("users")), // Teacher/admin who marked
        markedAt: v.optional(v.number()), // Timestamp

        // ✅ ADD THIS - Timestamp when lesson was scheduled (for date filtering)
        scheduledTime: v.optional(v.number()),

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
    description: v.optional(v.string()), // ← make optional (not always needed)
    icon: v.optional(v.string()), // ← optional is fine
    color: v.optional(v.string()), // ← optional
    hasLevels: v.boolean(),
    maxLevel: v.optional(v.number()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_name", ["name"]) // ← NEW: very useful for "Daily piece"
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"])
    .index("by_sort_order", ["sortOrder"]),

  books: defineTable({
    title: v.string(),
    instrument: v.string(),
    categoryId: v.id("bookCategories"),

    levelNumber: v.optional(v.number()),
    levelName: v.optional(v.string()),
    difficulty: v.optional(v.number()),

    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    driveFileId: v.string(),
    driveViewLink: v.string(),
    driveDownloadLink: v.optional(v.string()),

    uploadedBy: v.optional(v.id("users")),
    uploadedAt: v.number(),
    timesUsed: v.optional(v.number()),
    lastUsed: v.optional(v.number()),

    isPublic: v.optional(v.boolean()), // default true later in code
    coverImageUrl: v.optional(v.string()),

    // NEW — helpful for daily piece & future features
    isFeatured: v.optional(v.boolean()), // can mark special daily pieces
    featuredUntil: v.optional(v.number()), // timestamp — auto-unfeature after day?
  })
    .index("by_instrument", ["instrument"])
    .index("by_category", ["categoryId"])
    .index("by_instrument_category", ["instrument", "categoryId"])
    .index("by_category_level", ["categoryId", "levelNumber"])

    // Very useful for Daily Piece (show newest first)
    .index("by_category_uploadedAt", ["categoryId", "uploadedAt"]) // ← composite index

    // For title-based lookup / search
    .index("by_title", ["title"])

    // Full-text search (already good, but can be improved)
    .searchIndex("search_books", {
      searchField: "title",
      filterFields: ["categoryId", "instrument", "levelNumber", "isPublic"],
    }),

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

  // ✅ REPLACE YOUR EXISTING payments TABLE WITH THIS:
  payments: defineTable({
    teacherId: v.id("users"),
    month: v.string(), // YYYY-MM
    totalHours: v.number(),
    earnings: v.number(),
    deductions: v.number(),

    // ✅ ADD THESE FIELDS:
    type: v.optional(v.string()), // "teacher_salary" for salary payments
    status: v.optional(v.string()), // "Pending", "Processing", "Paid"
    paidAt: v.optional(v.number()), // Timestamp when marked as paid
    paidBy: v.optional(v.id("users")), // Admin who marked it paid
    createdAt: v.optional(v.number()), // When record was created
    updatedAt: v.optional(v.number()), // Last update
    notes: v.optional(v.string()), // Optional notes about payment

    // For student payments (if you use this table for both)
    studentId: v.optional(v.id("users")),
    packageId: v.optional(v.id("studentPackages")),
    amount: v.optional(v.number()),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_month", ["month"]) // ✅ ADD THIS INDEX
    .index("by_type", ["type"]) // ✅ ADD THIS INDEX
    .index("by_status", ["status"]), // ✅ ADD THIS INDEX

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
    scheduleId: v.optional(v.id("schedules")), // Optional now
    lessonId: v.optional(v.string()), // Optional now
    studentId: v.id("users"),
    teacherId: v.optional(v.id("users")), // Optional now
    teacherName: v.optional(v.string()), // Optional now
    status: v.optional(
      // Optional now
      v.union(
        v.literal("OK"), // Lesson completed successfully (Full Pay)
        v.literal("ET"), // Ended Early (Full Pay)
        v.literal("NA"), // No Answer (Full Pay)
        v.literal("TI"), // Technical Issues (No Pay)
        v.literal("TL"), // Teacher was late (Full Pay - $5)
      ),
    ),
    bookUsed: v.optional(v.string()),
    pageProgress: v.optional(v.string()),
    reason: v.optional(v.string()),
    createdAt: v.number(),
    // NEW FIELDS for general info
    type: v.optional(v.union(v.literal("lesson"), v.literal("general"))), // To distinguish entry types
    content: v.optional(v.string()), // Free-text for general notes
    updatedBy: v.optional(v.id("users")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_teacher", ["teacherId"])
    .index("by_schedule_lesson", ["scheduleId", "lessonId"])
    .index("by_type", ["type"]),

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
  }).index("by_status", ["status"]),

  lessonRatings: defineTable({
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    studentId: v.id("users"),
    teacherId: v.id("users"),
    rating: v.number(),
    timestamp: v.number(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_lesson", ["scheduleId", "lessonId"])
    .index("by_student_lesson", ["studentId", "scheduleId", "lessonId"]),

  thankYouMessages: defineTable({
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    studentId: v.id("users"),
    teacherId: v.id("users"),
    message: v.string(),
    timestamp: v.number(),
    isRead: v.boolean(),
    teacherResponse: v.optional(
      v.object({
        emoji: v.optional(v.string()),
        message: v.optional(v.string()),
        timestamp: v.number(),
      }),
    ),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_teacher_unread", ["teacherId", "isRead"])
    .index("by_student", ["studentId"])
    .index("by_schedule_lesson", ["scheduleId", "lessonId"]),

  teacherAvailability: defineTable({
    teacherId: v.id("users"),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    isActive: v.boolean(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_teacher_day", ["teacherId", "dayOfWeek"]),

  studentInfos: defineTable({
    studentId: v.id("users"),
    content: v.string(),
    updatedBy: v.optional(v.id("users")), // Teacher who last updated
    updatedAt: v.optional(v.number()), // Timestamp
  }).index("by_student", ["studentId"]),
});
