// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// export default defineSchema({
//   users: defineTable({
//     clerkId: v.string(),
//     role: v.union(
//       v.literal("admin"),
//       v.literal("teacher"),
//       v.literal("student")
//     ),
//     email: v.string(),
//     name: v.optional(v.string()), // ← ADD THIS
//     imageUrl: v.optional(v.string()),
//     instrument: v.optional(v.string()),
//     currentTeacher: v.optional(v.id("users")), // ← student’s preferred teacher
//     tokenIdentifier: v.string(),
//     zoomLink: v.optional(v.string()),
//     currentBookId: v.optional(v.id("books")),
//     timezone: v.optional(v.string()), // e.g., "America/New_York"
//     country: v.optional(v.string()), // e.g., "United States"
//     state: v.optional(v.string()), // e.g., "New York" (for US)
//     degree: v.optional(v.string()),
//     institution: v.optional(v.string()),
//     bio: v.optional(v.string()),
//     specialties: v.optional(v.array(v.string())),
//   })
//     .index("by_clerk_id", ["clerkId"])
//     .index("by_token", ["tokenIdentifier"])
//     .index("by_role", ["role"])
//     .index("by_role_instrument", ["role", "instrument"]),

//   schedules: defineTable({
//     teacherId: v.id("users"),
//     date: v.string(), // YYYY-MM-DD
//     lessons: v.array(
//       v.object({
//         lessonId: v.string(), // unique string ID
//         studentId: v.id("users"),
//         time: v.string(), // HH:MM
//         duration: v.number(), // Minutes

//         // ✅ FIXED: allow null (unchanged)
//         bookId: v.union(v.id("books"), v.null()),

//         zoomLink: v.optional(v.string()),
//         completed: v.boolean(), // Unchanged (can derive from state === "completed" later if desired)
//         notes: v.optional(v.string()), // Unchanged

//         // RENAMED: From actualStartTime → startedAt for clarity (update any references in code)
//         startedAt: v.optional(v.number()), // Timestamp (Date.now()) when teacher starts

//         // UPDATED: Keep existing status for final outcomes/payments (e.g., "teacher_late" derived from onTime)
//         status: v.union(
//           v.literal("completed"),
//           v.literal("finished_early"),
//           v.literal("na"),
//           v.literal("teacher_late"),
//           v.literal("technical_difficulty")
//         ),

//         // NEW: Lifecycle state (defaults to "scheduled" in create mutation)
//         state: v.union(
//           v.literal("scheduled"),
//           v.literal("teacher_ready"),
//           v.literal("in_progress"),
//           v.literal("completed"),
//           v.literal("missed_teacher"),
//           v.literal("missed_student")
//         ),

//         // NEW: Timestamp when lesson ends
//         endedAt: v.optional(v.number()),

//         // NEW: Computed actual duration in minutes
//         actualMinutes: v.optional(v.number()),

//         // NEW: Was teacher on time? (Boolean, computed on start)
//         onTime: v.optional(v.boolean()),
//       })
//     ),
//   }).index("by_teacher_date", ["teacherId", "date"]),

//   bookCategories: defineTable({
//     name: v.string(),
//     slug: v.string(),
//     description: v.string(),
//     icon: v.string(),
//     color: v.string(),
//     hasLevels: v.boolean(),
//     maxLevel: v.optional(v.number()),
//     isActive: v.boolean(),
//     sortOrder: v.number(),
//     createdAt: v.number(),
//     createdBy: v.id("users"),
//   })
//     .index("by_slug", ["slug"])
//     .index("by_active", ["isActive"])
//     .index("by_sort_order", ["sortOrder"]),

//   books: defineTable({
//     title: v.string(),
//     instrument: v.string(),
//     categoryId: v.id("bookCategories"), // ← This references bookCategories
//     levelNumber: v.optional(v.number()),
//     difficulty: v.optional(v.number()),
//     subcategory: v.optional(v.string()),
//     driveFileId: v.string(),
//     driveViewLink: v.string(),
//     driveDownloadLink: v.optional(v.string()),
//     description: v.optional(v.string()),
//     tags: v.optional(v.array(v.string())),
//     uploadedBy: v.optional(v.id("users")),
//     uploadedAt: v.number(),
//     timesUsed: v.optional(v.number()),
//     lastUsed: v.optional(v.number()),
//   })
//     .index("by_instrument", ["instrument"])
//     .index("by_category", ["categoryId"])
//     .index("by_instrument_category", ["instrument", "categoryId"])
//     .index("by_category_level", ["categoryId", "levelNumber"]),

//   // convex/schema.ts - Update messages table
//   messages: defineTable({
//     fromId: v.id("users"),
//     toId: v.id("users"),
//     content: v.string(),
//     timestamp: v.number(),
//     // NEW FIELDS
//     isRead: v.boolean(), // Has the recipient read it?
//     deletedBy: v.optional(v.array(v.id("users"))), // Array of user IDs who deleted it
//   })
//     .index("by_to", ["toId"])
//     .index("by_from", ["fromId"])
//     .index("by_to_unread", ["toId", "isRead"]), // For filtering unread messages

//   payments: defineTable({
//     teacherId: v.id("users"),
//     month: v.string(), // YYYY-MM
//     totalHours: v.number(),
//     earnings: v.number(), // Calculated
//     deductions: v.number(),
//   }).index("by_teacher", ["teacherId"]),

//   // NEW: Invite codes table
//   inviteCodes: defineTable({
//     code: v.string(),
//     createdBy: v.string(), // Clerk ID of admin who created it
//     usedCount: v.number(),
//     isActive: v.boolean(),
//     createdAt: v.number(),
//     description: v.optional(v.string()),
//     role: v.union(v.literal("teacher"), v.literal("student")), // Role-specific
//   })
//     .index("by_code", ["code"])
//     .index("by_createdBy", ["createdBy"])
//     .index("by_isActive", ["isActive"])
//     .index("by_role", ["role"]),

//   // FIXED: Recordings table (now inside schema)
//   recordings: defineTable({
//     scheduleId: v.id("schedules"), // Parent schedule ID
//     lessonStringId: v.string(), // Matches lesson.lessonId (string) to identify specific lesson
//     teacherId: v.id("users"),
//     recordingUrl: v.string(), // Zoom cloud recording URL
//     timestamp: v.number(),
//     notes: v.optional(v.string()), // Teacher comments on recording
//   }).index("by_teacher", ["teacherId"]),

//   globalMessages: defineTable({
//     content: v.string(),
//     createdBy: v.id("users"), // Admin who created it
//     createdAt: v.number(),
//     priority: v.union(
//       v.literal("normal"),
//       v.literal("important"),
//       v.literal("urgent")
//     ),
//     isActive: v.boolean(), // Admin can deactivate old messages
//     readBy: v.array(v.id("users")), // Track who has read it
//   })
//     .index("by_active", ["isActive"])
//     .index("by_created", ["createdAt"]),

//   studentPackages: defineTable({
//     studentId: v.id("users"),
//     packageType: v.string(), // "10-once", "10-twice", "20-once", etc.
//     minutesPerLesson: v.number(), // 10, 20, or 30
//     lessonsPerWeek: v.number(), // 1 or 2
//     totalMinutesPerMonth: v.number(), // calculated total
//     minutesRemaining: v.number(),
//     monthlyPrice: v.number(),
//     currentMonth: v.string(), // "2025-12"
//     purchaseDate: v.number(),
//     expiryDate: v.number(),
//     remainingMinutes: v.number(),
//     paymentId: v.string(),
//     status: v.union(
//       v.literal("active"),
//       v.literal("expired"),
//       v.literal("cancelled")
//     ),
//     stripeSubscriptionId: v.optional(v.string()),
//   })
//     .index("by_student", ["studentId"])
//     .index("by_status", ["status"])
//     .index("by_month", ["currentMonth"])
//     .index("by_payment_id", ["paymentId"]),

//   studentPaymentHistory: defineTable({
//     studentId: v.id("users"),
//     packageId: v.id("studentPackages"),
//     amount: v.number(),
//     month: v.string(),
//     paymentDate: v.number(),
//     stripePaymentIntentId: v.string(),
//     status: v.union(
//       v.literal("pending"),
//       v.literal("completed"),
//       v.literal("failed"),
//       v.literal("refunded")
//     ),
//   })
//     .index("by_student", ["studentId"])
//     .index("by_month", ["month"]),

//   failedPayments: defineTable({
//     paymentId: v.string(),
//     studentId: v.id("users"),
//     status: v.string(),
//     amount: v.number(),
//     reason: v.string(),
//     timestamp: v.number(),
//     resolved: v.boolean(),
//   }).index("by_student", ["studentId"]),
// });
// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// export default defineSchema({
//   users: defineTable({
//     clerkId: v.string(),
//     role: v.union(
//       v.literal("admin"),
//       v.literal("teacher"),
//       v.literal("student")
//     ),
//     email: v.string(),
//     name: v.optional(v.string()), // ← ADD THIS
//     imageUrl: v.optional(v.string()),
//     instrument: v.optional(v.string()),
//     currentTeacher: v.optional(v.id("users")), // ← student’s preferred teacher
//     tokenIdentifier: v.string(),
//     zoomLink: v.optional(v.string()),
//     currentBookId: v.optional(v.id("books")),
//     timezone: v.optional(v.string()), // e.g., "America/New_York"
//     country: v.optional(v.string()), // e.g., "United States"
//     state: v.optional(v.string()), // e.g., "New York" (for US)
//     degree: v.optional(v.string()),
//     institution: v.optional(v.string()),
//     bio: v.optional(v.string()),
//     specialties: v.optional(v.array(v.string())),
//   })
//     .index("by_clerk_id", ["clerkId"])
//     .index("by_token", ["tokenIdentifier"])
//     .index("by_role", ["role"])
//     .index("by_role_instrument", ["role", "instrument"]),

//   schedules: defineTable({
//     teacherId: v.id("users"),
//     date: v.string(), // YYYY-MM-DD
//     lessons: v.array(
//       v.object({
//         lessonId: v.string(), // unique string ID
//         studentId: v.id("users"),
//         time: v.string(), // HH:MM
//         duration: v.number(), // Minutes

//         // ✅ FIXED: allow null (unchanged)
//         bookId: v.union(v.id("books"), v.null()),

//         zoomLink: v.optional(v.string()),
//         completed: v.boolean(), // Unchanged (can derive from state === "completed" later if desired)
//         notes: v.optional(v.string()), // Unchanged

//         // RENAMED: From actualStartTime → startedAt for clarity (update any references in code)
//         startedAt: v.optional(v.number()), // Timestamp (Date.now()) when teacher starts

//         // UPDATED: Keep existing status for final outcomes/payments (e.g., "teacher_late" derived from onTime)
//         status: v.union(
//           v.literal("completed"),
//           v.literal("finished_early"),
//           v.literal("na"),
//           v.literal("teacher_late"),
//           v.literal("technical_difficulty")
//         ),

//         // NEW: Lifecycle state (defaults to "scheduled" in create mutation)
//         // CHANGE: Removed "teacher_ready" to simplify flow
//         state: v.union(
//           v.literal("scheduled"),
//           v.literal("in_progress"),
//           v.literal("completed"),
//           v.literal("missed_teacher"),
//           v.literal("missed_student")
//         ),

//         // NEW: Timestamp when lesson ends
//         endedAt: v.optional(v.number()),

//         // NEW: Computed actual duration in minutes
//         actualMinutes: v.optional(v.number()),

//         // NEW: Was teacher on time? (Boolean, computed on start)
//         onTime: v.optional(v.boolean()),
//       })
//     ),
//   }).index("by_teacher_date", ["teacherId", "date"]),

//   bookCategories: defineTable({
//     name: v.string(),
//     slug: v.string(),
//     description: v.string(),
//     icon: v.string(),
//     color: v.string(),
//     hasLevels: v.boolean(),
//     maxLevel: v.optional(v.number()),
//     isActive: v.boolean(),
//     sortOrder: v.number(),
//     createdAt: v.number(),
//     createdBy: v.id("users"),
//   })
//     .index("by_slug", ["slug"])
//     .index("by_active", ["isActive"])
//     .index("by_sort_order", ["sortOrder"]),

//   books: defineTable({
//     title: v.string(),
//     instrument: v.string(),
//     categoryId: v.id("bookCategories"), // ← This references bookCategories
//     levelNumber: v.optional(v.number()),
//     difficulty: v.optional(v.number()),
//     subcategory: v.optional(v.string()),
//     driveFileId: v.string(),
//     driveViewLink: v.string(),
//     driveDownloadLink: v.optional(v.string()),
//     description: v.optional(v.string()),
//     tags: v.optional(v.array(v.string())),
//     uploadedBy: v.optional(v.id("users")),
//     uploadedAt: v.number(),
//     timesUsed: v.optional(v.number()),
//     lastUsed: v.optional(v.number()),
//   })
//     .index("by_instrument", ["instrument"])
//     .index("by_category", ["categoryId"])
//     .index("by_instrument_category", ["instrument", "categoryId"])
//     .index("by_category_level", ["categoryId", "levelNumber"]),

//   // convex/schema.ts - Update messages table
//   messages: defineTable({
//     fromId: v.id("users"),
//     toId: v.id("users"),
//     content: v.string(),
//     timestamp: v.number(),
//     // NEW FIELDS
//     isRead: v.boolean(), // Has the recipient read it?
//     deletedBy: v.optional(v.array(v.id("users"))), // Array of user IDs who deleted it
//   })
//     .index("by_to", ["toId"])
//     .index("by_from", ["fromId"])
//     .index("by_to_unread", ["toId", "isRead"]), // For filtering unread messages

//   payments: defineTable({
//     teacherId: v.id("users"),
//     month: v.string(), // YYYY-MM
//     totalHours: v.number(),
//     earnings: v.number(), // Calculated
//     deductions: v.number(),
//   }).index("by_teacher", ["teacherId"]),

//   // NEW: Invite codes table
//   inviteCodes: defineTable({
//     code: v.string(),
//     createdBy: v.string(), // Clerk ID of admin who created it
//     usedCount: v.number(),
//     isActive: v.boolean(),
//     createdAt: v.number(),
//     description: v.optional(v.string()),
//     role: v.union(v.literal("teacher"), v.literal("student")), // Role-specific
//   })
//     .index("by_code", ["code"])
//     .index("by_createdBy", ["createdBy"])
//     .index("by_isActive", ["isActive"])
//     .index("by_role", ["role"]),

//   // FIXED: Recordings table (now inside schema)
//   recordings: defineTable({
//     scheduleId: v.id("schedules"), // Parent schedule ID
//     lessonStringId: v.string(), // Matches lesson.lessonId (string) to identify specific lesson
//     teacherId: v.id("users"),
//     recordingUrl: v.string(), // Zoom cloud recording URL
//     timestamp: v.number(),
//     notes: v.optional(v.string()), // Teacher comments on recording
//   }).index("by_teacher", ["teacherId"]),

//   globalMessages: defineTable({
//     content: v.string(),
//     createdBy: v.id("users"), // Admin who created it
//     createdAt: v.number(),
//     priority: v.union(
//       v.literal("normal"),
//       v.literal("important"),
//       v.literal("urgent")
//     ),
//     isActive: v.boolean(), // Admin can deactivate old messages
//     readBy: v.array(v.id("users")), // Track who has read it
//   })
//     .index("by_active", ["isActive"])
//     .index("by_created", ["createdAt"]),

//   studentPackages: defineTable({
//     studentId: v.id("users"),
//     packageType: v.string(), // "10-once", "10-twice", "20-once", etc.
//     minutesPerLesson: v.number(), // 10, 20, or 30
//     lessonsPerWeek: v.number(), // 1 or 2
//     totalMinutesPerMonth: v.number(), // calculated total
//     minutesRemaining: v.number(),
//     monthlyPrice: v.number(),
//     currentMonth: v.string(), // "2025-12"
//     purchaseDate: v.number(),
//     expiryDate: v.number(),
//     remainingMinutes: v.number(),
//     paymentId: v.string(),
//     status: v.union(
//       v.literal("active"),
//       v.literal("expired"),
//       v.literal("cancelled")
//     ),
//     stripeSubscriptionId: v.optional(v.string()),
//   })
//     .index("by_student", ["studentId"])
//     .index("by_status", ["status"])
//     .index("by_month", ["currentMonth"])
//     .index("by_payment_id", ["paymentId"]),

//   studentPaymentHistory: defineTable({
//     studentId: v.id("users"),
//     packageId: v.id("studentPackages"),
//     amount: v.number(),
//     month: v.string(),
//     paymentDate: v.number(),
//     stripePaymentIntentId: v.string(),
//     status: v.union(
//       v.literal("pending"),
//       v.literal("completed"),
//       v.literal("failed"),
//       v.literal("refunded")
//     ),
//   })
//     .index("by_student", ["studentId"])
//     .index("by_month", ["month"]),

//   failedPayments: defineTable({
//     paymentId: v.string(),
//     studentId: v.id("users"),
//     status: v.string(),
//     amount: v.number(),
//     reason: v.string(),
//     timestamp: v.number(),
//     resolved: v.boolean(),
//   }).index("by_student", ["studentId"]),

//   // Add this to your convex/schema.js file

//   tutorMemos: defineTable({
//     scheduleId: v.id("schedules"),
//     lessonId: v.string(),
//     studentId: v.id("users"),
//     teacherId: v.id("users"),
//     teacherName: v.string(),
//     status: v.union(
//       v.literal("OK"),
//       v.literal("ET"), // Ended Early
//       v.literal("NA"), // No Answer
//       v.literal("TI"), // Technical Issues
//       v.literal("TL") // Teacher Late
//     ),
//     bookUsed: v.optional(v.string()),
//     pageProgress: v.optional(v.string()),
//     reason: v.optional(v.string()),
//   })
//     .index("by_student", ["studentId"])
//     .index("by_teacher", ["teacherId"])
//     .index("by_schedule_lesson", ["scheduleId", "lessonId"]),
// });
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
});
