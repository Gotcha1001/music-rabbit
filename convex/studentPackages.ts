// // convex/studentPackages.ts

// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";
// import { format } from "date-fns";
// import { api } from "./_generated/api";

// // Get student's active package
// export const getActivePackage = query({
//   args: { studentId: v.id("users") },
//   handler: async (ctx, { studentId }) => {
//     const currentMonth = format(new Date(), "yyyy-MM");

//     return await ctx.db
//       .query("studentPackages")
//       .withIndex("by_student", (q) => q.eq("studentId", studentId))
//       .filter((q) =>
//         q.and(
//           q.eq(q.field("status"), "active"),
//           q.eq(q.field("currentMonth"), currentMonth)
//         )
//       )
//       .first();
//   },
// });

// // Create new package subscription
// export const createPackage = mutation({
//   args: {
//     studentId: v.id("users"),
//     packageType: v.string(),
//     minutesPerLesson: v.number(),
//     lessonsPerWeek: v.number(),
//     totalMinutesPerMonth: v.number(),
//     monthlyPrice: v.number(),
//     stripeSubscriptionId: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const now = new Date();
//     const currentMonth = format(now, "yyyy-MM");
//     const expiryDate = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       0
//     ).getTime();

//     // Deactivate any existing active packages
//     const existingPackages = await ctx.db
//       .query("studentPackages")
//       .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
//       .filter((q) => q.eq(q.field("status"), "active"))
//       .collect();

//     for (const pkg of existingPackages) {
//       await ctx.db.patch(pkg._id, { status: "cancelled" });
//     }

//     // Create new package
//     return await ctx.db.insert("studentPackages", {
//       studentId: args.studentId,
//       packageType: args.packageType,
//       minutesPerLesson: args.minutesPerLesson,
//       lessonsPerWeek: args.lessonsPerWeek,
//       totalMinutesPerMonth: args.totalMinutesPerMonth,
//       minutesRemaining: args.totalMinutesPerMonth,
//       monthlyPrice: args.monthlyPrice,
//       currentMonth,
//       purchaseDate: Date.now(),
//       expiryDate,
//       status: "active",
//       stripeSubscriptionId: args.stripeSubscriptionId,
//     });
//   },
// });

// // Deduct minutes after lesson
// export const deductMinutes = mutation({
//   args: {
//     packageId: v.id("studentPackages"),
//     minutesUsed: v.number(),
//   },
//   handler: async (ctx, { packageId, minutesUsed }) => {
//     const pkg = await ctx.db.get(packageId);
//     if (!pkg) throw new Error("Package not found");

//     const newRemaining = Math.max(0, pkg.minutesRemaining - minutesUsed);

//     await ctx.db.patch(packageId, {
//       minutesRemaining: newRemaining,
//     });

//     return { minutesRemaining: newRemaining };
//   },
// });

// // Get package statistics
// export const getPackageStats = query({
//   args: { studentId: v.id("users") },
//   handler: async (ctx, { studentId }) => {
//     const pkg = await ctx.runQuery(api.studentPackages.getActivePackage, {
//       studentId,
//     });

//     if (!pkg) {
//       return {
//         hasActivePackage: false,
//         minutesUsed: 0,
//         minutesRemaining: 0,
//         totalMinutes: 0,
//         percentageUsed: 0,
//         lessonsCompleted: 0,
//         lessonsRemaining: 0,
//       };
//     }

//     const minutesUsed = pkg.totalMinutesPerMonth - pkg.minutesRemaining;
//     const percentageUsed = (minutesUsed / pkg.totalMinutesPerMonth) * 100;
//     const lessonsCompleted = Math.floor(minutesUsed / pkg.minutesPerLesson);
//     const lessonsRemaining = Math.floor(
//       pkg.minutesRemaining / pkg.minutesPerLesson
//     );

//     return {
//       hasActivePackage: true,
//       package: pkg,
//       minutesUsed,
//       minutesRemaining: pkg.minutesRemaining,
//       totalMinutes: pkg.totalMinutesPerMonth,
//       percentageUsed: Math.round(percentageUsed),
//       lessonsCompleted,
//       lessonsRemaining,
//     };
//   },
// });

// // Admin: Get all students with package info
// export const getAllStudentPackages = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const admin = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!admin || admin.role !== "admin") {
//       throw new Error("Admin only");
//     }

//     const students = await ctx.db
//       .query("users")
//       .withIndex("by_role", (q) => q.eq("role", "student"))
//       .collect();

//     const studentsWithPackages = await Promise.all(
//       students.map(async (student) => {
//         const activePackage = await ctx.runQuery(
//           api.studentPackages.getActivePackage,
//           { studentId: student._id }
//         );

//         const stats = await ctx.runQuery(api.studentPackages.getPackageStats, {
//           studentId: student._id,
//         });

//         return {
//           student,
//           activePackage,
//           stats,
//         };
//       })
//     );

//     return studentsWithPackages;
//   },
// });

// convex/studentPackages.ts

// Full corrected studentPackages.ts file with consistent property naming

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { format } from "date-fns";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// Type definitions for return values
type ActivePackage = Doc<"studentPackages"> | null;

type PackageStats =
  | {
      hasActivePackage: false;
      minutesUsed: 0;
      minutesRemaining: 0;
      totalMinutes: 0;
      percentageUsed: 0;
      lessonsCompleted: 0;
      lessonsRemaining: 0;
    }
  | {
      hasActivePackage: true;
      package: Doc<"studentPackages">;
      minutesUsed: number;
      minutesRemaining: number;
      totalMinutes: number;
      percentageUsed: number;
      lessonsCompleted: number;
      lessonsRemaining: number;
    };

type StudentWithPackage = {
  student: Doc<"users">;
  activePackage: ActivePackage;
  stats: PackageStats;
};

// Get student's active package
export const getActivePackage = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }): Promise<ActivePackage> => {
    const currentMonth = format(new Date(), "yyyy-MM");

    return await ctx.db
      .query("studentPackages")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("currentMonth"), currentMonth)
        )
      )
      .first();
  },
});

// Create new package subscription
export const createPackage = mutation({
  args: {
    studentId: v.id("users"),
    packageType: v.string(),
    minutesPerLesson: v.number(),
    lessonsPerWeek: v.number(),
    totalMinutesPerMonth: v.number(),
    monthlyPrice: v.number(),
    paymentId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"studentPackages">> => {
    const now = new Date();
    const currentMonth = format(now, "yyyy-MM");
    const expiryDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getTime();

    // Deactivate any existing active packages
    const existingPackages = await ctx.db
      .query("studentPackages")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const pkg of existingPackages) {
      await ctx.db.patch(pkg._id, { status: "cancelled" });
    }

    // Create new package - schema requires BOTH remainingMinutes AND minutesRemaining
    return await ctx.db.insert("studentPackages", {
      studentId: args.studentId,
      packageType: args.packageType,
      minutesPerLesson: args.minutesPerLesson,
      lessonsPerWeek: args.lessonsPerWeek,
      totalMinutesPerMonth: args.totalMinutesPerMonth,
      remainingMinutes: args.totalMinutesPerMonth,
      minutesRemaining: args.totalMinutesPerMonth, // ✅ Add this - schema requires it
      monthlyPrice: args.monthlyPrice,
      currentMonth,
      purchaseDate: Date.now(),
      expiryDate,
      status: "active",
      paymentId: args.paymentId,
      stripeSubscriptionId: args.stripeSubscriptionId,
    });
  },
});

// Deduct minutes after lesson
export const deductMinutes = mutation({
  args: {
    packageId: v.id("studentPackages"),
    minutesUsed: v.number(),
  },
  handler: async (
    ctx,
    { packageId, minutesUsed }
  ): Promise<{ remainingMinutes: number }> => {
    const pkg = await ctx.db.get(packageId);
    if (!pkg) throw new Error("Package not found");

    const newRemaining = Math.max(0, pkg.remainingMinutes - minutesUsed);

    await ctx.db.patch(packageId, {
      remainingMinutes: newRemaining, // ✅ Use remainingMinutes
    });

    return { remainingMinutes: newRemaining };
  },
});

// Get package statistics
export const getPackageStats = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }): Promise<PackageStats> => {
    const pkg: ActivePackage = await ctx.runQuery(
      api.studentPackages.getActivePackage,
      {
        studentId,
      }
    );

    if (!pkg) {
      return {
        hasActivePackage: false,
        minutesUsed: 0,
        minutesRemaining: 0,
        totalMinutes: 0,
        percentageUsed: 0,
        lessonsCompleted: 0,
        lessonsRemaining: 0,
      };
    }

    const minutesUsed = pkg.totalMinutesPerMonth - pkg.remainingMinutes; // ✅ Use remainingMinutes
    const percentageUsed = (minutesUsed / pkg.totalMinutesPerMonth) * 100;
    const lessonsCompleted = Math.floor(minutesUsed / pkg.minutesPerLesson);
    const lessonsRemaining = Math.floor(
      pkg.remainingMinutes / pkg.minutesPerLesson // ✅ Use remainingMinutes
    );

    return {
      hasActivePackage: true,
      package: pkg,
      minutesUsed,
      minutesRemaining: pkg.remainingMinutes, // ✅ Use remainingMinutes
      totalMinutes: pkg.totalMinutesPerMonth,
      percentageUsed: Math.round(percentageUsed),
      lessonsCompleted,
      lessonsRemaining,
    };
  },
});

// Admin: Get all students with package info
export const getAllStudentPackages = query({
  handler: async (ctx): Promise<StudentWithPackage[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin only");
    }

    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();

    const studentsWithPackages: StudentWithPackage[] = await Promise.all(
      students.map(async (student): Promise<StudentWithPackage> => {
        const activePackage: ActivePackage = await ctx.runQuery(
          api.studentPackages.getActivePackage,
          { studentId: student._id }
        );

        const stats: PackageStats = await ctx.runQuery(
          api.studentPackages.getPackageStats,
          {
            studentId: student._id,
          }
        );

        return {
          student,
          activePackage,
          stats,
        };
      })
    );

    return studentsWithPackages;
  },
});

export const getByPaymentId = query({
  args: { paymentId: v.string() },
  handler: async (ctx, { paymentId }) => {
    return await ctx.db
      .query("studentPackages")
      .withIndex("by_payment_id", (q) => q.eq("paymentId", paymentId))
      .first();
  },
});
