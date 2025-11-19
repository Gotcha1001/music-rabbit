// import { v } from "convex/values";
// import { mutation, query } from "./\_generated/server";

// export const createOrGet = mutation({
//   args: {
//     inviteCode: v.optional(v.string()),
//     role: v.optional(
//       v.union(v.literal("admin"), v.literal("teacher"), v.literal("student"))
//     ),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const existing = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (existing) return existing;

//     const allUsers = await ctx.db.query("users").collect();
//     const isFirstUser = allUsers.length === 0;

//     let role: "admin" | "teacher" | "student" = "student";

//     if (args.role) {
//       if (args.role === "admin" && !isFirstUser) {
//         throw new Error("Admin role can only be assigned to the first user");
//       }
//       role = args.role;
//     } else if (isFirstUser) {
//       role = "admin";
//     } else if (args.inviteCode) {
//       const invite = await ctx.db
//         .query("inviteCodes")
//         .withIndex("by_code", (q) => q.eq("code", args.inviteCode!))
//         .first();

//       if (!invite) throw new Error("Invalid invite code");
//       if (!invite.isActive)
//         throw new Error("This invite code is no longer active");
//       if (invite.role !== "teacher")
//         throw new Error("This code is not for teacher registration");

//       role = "teacher";
//       await ctx.db.patch(invite._id, { usedCount: invite.usedCount + 1 });
//     } else {
//       role = "student";
//     }

//     // Extract user information from Clerk identity
//     // Extract user information from Clerk identity
//     const email = typeof identity.email === "string" ? identity.email : "";
//     const name =
//       identity.name ||
//       identity.nickname ||
//       (email ? email.split("@")[0] : "") ||
//       "User";
//     const imageUrl = identity.pictureUrl || "";

//     const userId = await ctx.db.insert("users", {
//       clerkId: identity.subject,
//       role,
//       email,
//       name, // ← Now storing name from Clerk
//       imageUrl, // ← Now storing imageUrl from Clerk
//       instrument: "",
//       currentTeacher: undefined,
//       tokenIdentifier: identity.tokenIdentifier || "",
//     });

//     return await ctx.db.get(userId);
//   },
// });

// export const get = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) return null;

//     return await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();
//   },
// });

// export const getCount = query({
//   handler: async (ctx) => {
//     return (await ctx.db.query("users").collect()).length;
//   },
// });

// export const updateRole = mutation({
//   args: {
//     userId: v.id("users"),
//     role: v.union(
//       v.literal("admin"),
//       v.literal("teacher"),
//       v.literal("student")
//     ),
//     instrument: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const caller = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (caller?.role !== "admin") throw new Error("Not admin");

//     await ctx.db.patch(args.userId, {
//       role: args.role,
//       instrument: args.instrument,
//     });
//   },
// });

// export const getAllTeachers = query({
//   handler: async (ctx) => {
//     return await ctx.db
//       .query("users")
//       .withIndex("by_role", (q) => q.eq("role", "teacher"))
//       .collect();
//   },
// });

// export const getAllStudents = query({
//   handler: async (ctx) => {
//     return await ctx.db
//       .query("users")
//       .withIndex("by_role", (q) => q.eq("role", "student"))
//       .collect();
//   },
// });

// export const remove = mutation({
//   args: { userId: v.id("users") },
//   handler: async (ctx, { userId }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const caller = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (caller?.role !== "admin") throw new Error("Not admin");

//     await ctx.db.delete(userId);
//   },
// });

// export const getById = query({
//   args: { id: v.id("users") },
//   handler: async (ctx, { id }) => {
//     return await ctx.db.get(id);
//   },
// });

// export const setMyTeacher = mutation({
//   args: { teacherId: v.optional(v.id("users")) },
//   handler: async (ctx, { teacherId }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const student = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!student || student.role !== "student")
//       throw new Error("Only students can set a teacher");

//     if (teacherId) {
//       const teacher = await ctx.db.get(teacherId);
//       if (!teacher || teacher.role !== "teacher")
//         throw new Error("Invalid teacher");
//       if (teacher.instrument !== student.instrument)
//         throw new Error(`This teacher does not teach ${student.instrument}`);
//     }

//     await ctx.db.patch(student._id, { currentTeacher: teacherId ?? undefined });

//     return { success: true };
//   },
// });

// export const setInstrument = mutation({
//   args: { instrument: v.string() },
//   handler: async (ctx, { instrument }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!user) throw new Error("User not found");

//     await ctx.db.patch(user._id, { instrument });
//   },
// });

// export const getTeachersByInstrument = query({
//   args: { instrument: v.string() },
//   handler: async (ctx, { instrument }) => {
//     return await ctx.db
//       .query("users")
//       .withIndex("by_role_instrument", (q) =>
//         q.eq("role", "teacher").eq("instrument", instrument)
//       )
//       .collect();
//   },
// });

// export const setZoomLink = mutation({
//   args: { zoomLink: v.string() },
//   handler: async (ctx, { zoomLink }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!user || user.role !== "teacher")
//       throw new Error("Only teachers can set a Zoom link");

//     const trimmed = zoomLink.trim();
//     if (!trimmed) throw new Error("Zoom link cannot be empty");

//     await ctx.db.patch(user._id, { zoomLink: trimmed });
//   },
// });

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrGet = mutation({
  args: {
    inviteCode: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("teacher"), v.literal("student"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) return existing;

    const allUsers = await ctx.db.query("users").collect();
    const isFirstUser = allUsers.length === 0;

    let role: "admin" | "teacher" | "student" = "student";

    if (args.role) {
      if (args.role === "admin" && !isFirstUser) {
        throw new Error("Admin role can only be assigned to the first user");
      }
      role = args.role;
    } else if (isFirstUser) {
      role = "admin";
    } else if (args.inviteCode) {
      const invite = await ctx.db
        .query("inviteCodes")
        .withIndex("by_code", (q) => q.eq("code", args.inviteCode!))
        .first();

      if (!invite) throw new Error("Invalid invite code");
      if (!invite.isActive)
        throw new Error("This invite code is no longer active");
      if (invite.role !== "teacher")
        throw new Error("This code is not for teacher registration");

      role = "teacher";
      await ctx.db.patch(invite._id, { usedCount: invite.usedCount + 1 });
    } else {
      role = "student";
    }

    // Extract user information from Clerk identity
    const email = typeof identity.email === "string" ? identity.email : "";
    const name =
      identity.name ||
      identity.givenName ||
      identity.nickname ||
      (email ? email.split("@")[0] : "") ||
      "User";

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      role,
      email,
      name,
      imageUrl: "", // Will be synced from frontend
      instrument: "",
      currentTeacher: undefined,
      tokenIdentifier: identity.tokenIdentifier || "",
    });

    return await ctx.db.get(userId);
  },
});

// NEW: Sync user profile data from Clerk frontend
export const syncProfile = mutation({
  args: {
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const updates: { name?: string; imageUrl?: string } = {};
    if (args.name) updates.name = args.name;
    if (args.imageUrl) updates.imageUrl = args.imageUrl;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return await ctx.db.get(user._id);
  },
});

export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const getCount = query({
  handler: async (ctx) => {
    return (await ctx.db.query("users").collect()).length;
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student")
    ),
    instrument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (caller?.role !== "admin") throw new Error("Not admin");

    await ctx.db.patch(args.userId, {
      role: args.role,
      instrument: args.instrument,
    });
  },
});

export const getAllTeachers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "teacher"))
      .collect();
  },
});

export const getAllStudents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();
  },
});

export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (caller?.role !== "admin") throw new Error("Not admin");

    await ctx.db.delete(userId);
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const setMyTeacher = mutation({
  args: { teacherId: v.optional(v.id("users")) },
  handler: async (ctx, { teacherId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!student || student.role !== "student")
      throw new Error("Only students can set a teacher");

    if (teacherId) {
      const teacher = await ctx.db.get(teacherId);
      if (!teacher || teacher.role !== "teacher")
        throw new Error("Invalid teacher");
      if (teacher.instrument !== student.instrument)
        throw new Error(`This teacher does not teach ${student.instrument}`);
    }

    await ctx.db.patch(student._id, { currentTeacher: teacherId ?? undefined });

    return { success: true };
  },
});

export const setInstrument = mutation({
  args: { instrument: v.string() },
  handler: async (ctx, { instrument }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { instrument });
  },
});

export const getTeachersByInstrument = query({
  args: { instrument: v.string() },
  handler: async (ctx, { instrument }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role_instrument", (q) =>
        q.eq("role", "teacher").eq("instrument", instrument)
      )
      .collect();
  },
});

export const setZoomLink = mutation({
  args: { zoomLink: v.string() },
  handler: async (ctx, { zoomLink }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "teacher")
      throw new Error("Only teachers can set a Zoom link");

    const trimmed = zoomLink.trim();
    if (!trimmed) throw new Error("Zoom link cannot be empty");

    await ctx.db.patch(user._id, { zoomLink: trimmed });
  },
});
