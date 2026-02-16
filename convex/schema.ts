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

    // ────────────────────────────────────────────────
    // NEW FIELD — Required for automated series progression
    // Tracks the active series + current position
    // (makes auto-next safe even if teacher temporarily changes books)
    // ────────────────────────────────────────────────
    currentSeriesProgress: v.optional(
      v.object({
        seriesGroup: v.string(), // "C Major Complete", "Alfred Lesson Book 1"
        currentOrder: v.number(), // e.g. 3 (last assigned/completed lesson number)
        totalLessons: v.optional(v.number()), // optional: known total, e.g. 12
        lastAssignedAt: v.optional(v.number()), // timestamp of last auto-assign
      }),
    ),

    timezone: v.optional(v.string()),
    country: v.optional(v.string()),
    state: v.optional(v.string()),
    degree: v.optional(v.string()),
    institution: v.optional(v.string()),
    bio: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    hourlyRate: v.optional(v.number()),

    // ────────────────────────────────────────────────
    // NEW FIELDS FOR PHONE / WHATSAPP CONTACT
    countryCode: v.optional(v.string()), // e.g. "+27", "+1", "+44"
    phoneNumber: v.optional(v.string()), // e.g. "821234567", "5551234567"
    // ────────────────────────────────────────────────
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
        date: v.optional(v.number()),
        bookId: v.union(v.id("books"), v.null()),
        zoomLink: v.optional(v.string()),
        completed: v.boolean(),
        notes: v.optional(v.string()),
        startedAt: v.optional(v.number()),
        markedBy: v.optional(v.id("users")), // Teacher/admin who marked
        markedAt: v.optional(v.number()), // Timestamp

        scheduledTime: v.number(),

        status: v.union(
          v.literal("completed"),
          v.literal("finished_early"),
          v.literal("no_answer_on_time"),
          v.literal("teacher_never_called"),
          v.literal("technical_difficulty"),
          v.literal("teacher_late"),
        ),

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
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    hasLevels: v.boolean(),
    maxLevel: v.optional(v.number()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_name", ["name"])
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

    isPublic: v.optional(v.boolean()),
    coverImageUrl: v.optional(v.string()),

    isFeatured: v.optional(v.boolean()),
    featuredUntil: v.optional(v.number()),

    seriesGroup: v.optional(v.string()),
    seriesOrder: v.optional(v.number()),
    seriesCategory: v.optional(v.string()),
    isSeriesEnd: v.optional(v.boolean()),
  })
    .index("by_instrument", ["instrument"])
    .index("by_category", ["categoryId"])
    .index("by_instrument_category", ["instrument", "categoryId"])
    .index("by_category_level", ["categoryId", "levelNumber"])
    .index("by_category_uploadedAt", ["categoryId", "uploadedAt"])
    .index("by_title", ["title"])
    .index("by_series_group_order", ["seriesGroup", "seriesOrder"])
    .index("by_series_group", ["seriesGroup"])
    .searchIndex("search_books", {
      searchField: "title",
      filterFields: [
        "categoryId",
        "instrument",
        "levelNumber",
        "isPublic",
        "seriesGroup",
      ],
    }),

  // All other tables remain **completely unchanged** below this line
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
    month: v.string(),
    totalHours: v.number(),
    earnings: v.number(),
    deductions: v.number(),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    paidBy: v.optional(v.id("users")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    studentId: v.optional(v.id("users")),
    packageId: v.optional(v.id("studentPackages")),
    amount: v.optional(v.number()),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_month", ["month"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

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
    scheduleId: v.optional(v.id("schedules")),
    lessonId: v.optional(v.string()),
    studentId: v.optional(v.id("users")),
    teacherId: v.optional(v.id("users")),
    teacherName: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("OK"),
        v.literal("ET"),
        v.literal("NA"),
        v.literal("TI"),
        v.literal("TL"),
      ),
    ),
    bookUsed: v.optional(v.string()),
    pageProgress: v.optional(v.string()),
    reason: v.optional(v.string()),
    createdAt: v.number(),
    type: v.optional(v.union(v.literal("lesson"), v.literal("general"))),
    content: v.optional(v.string()),
    nextLessonFocus: v.optional(v.string()),
    nextBookPageRef: v.optional(v.string()),
    nextPiece: v.optional(v.string()),
    wentWell: v.optional(v.array(v.string())),
    skillRatings: v.optional(
      v.object({
        technique: v.optional(v.number()),
        rhythm: v.optional(v.number()),
        reading: v.optional(v.number()),
        theory: v.optional(v.number()),
        expression: v.optional(v.number()),
      }),
    ),
    feedbackCompleted: v.optional(v.boolean()),
    markedBy: v.optional(v.id("users")),
    markedAt: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_teacher", ["teacherId"])
    .index("by_schedule_lesson", ["scheduleId", "lessonId"])
    .index("by_type", ["type"])
    .index("by_teacher_completed", ["teacherId", "feedbackCompleted"])
    .index("by_created_recent", ["createdAt"]),

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
    updatedBy: v.optional(v.id("users")),
    updatedAt: v.optional(v.number()),
  }).index("by_student", ["studentId"]),

  evaluations: defineTable({
    studentId: v.id("users"),
    teacherId: v.id("users"),
    month: v.number(),
    year: v.number(),
    createdAt: v.number(),

    scales: v.string(),
    chords: v.string(),
    sightReading: v.string(),
    rhythm: v.string(),
    improvisation: v.string(),

    piecesWorkedOn: v.array(v.string()),

    notes: v.optional(v.string()),
  })
    .index("by_student", ["studentId"])
    .index("by_teacher", ["teacherId"])
    .index("by_student_date", ["studentId", "year", "month"])
    .index("by_teacher_date", ["teacherId", "year", "month"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    subscription: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_clerkId", ["clerkId"]),
});
