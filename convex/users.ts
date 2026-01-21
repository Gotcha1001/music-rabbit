import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const createOrGet = mutation({
  args: {
    inviteCode: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("teacher"), v.literal("student")),
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
      v.literal("student"),
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

    // ✅ Auto-initialize availability for teachers
    if (user.role === "teacher" && user.timezone) {
      await ctx.runMutation(api.availability.autoSetAvailability, {
        teacherId: user._id,
      });
    }
  },
});

export const getTeachersByInstrument = query({
  args: { instrument: v.string() },
  handler: async (ctx, { instrument }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role_instrument", (q) =>
        q.eq("role", "teacher").eq("instrument", instrument),
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
export const setTimezone = mutation({
  args: {
    timezone: v.string(),
    country: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      timezone: args.timezone,
      country: args.country,
      state: args.state,
    });

    return await ctx.db.get(user._id);
  },
});
export const getAdmin = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();
  },
});
// convex/users.ts
export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const updateTeacherProfile = mutation({
  args: {
    degree: v.optional(v.string()),
    institution: v.optional(v.string()),
    bio: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "teacher")
      throw new Error("Only teachers can update their profile");

    await ctx.db.patch(user._id, {
      degree: args.degree?.trim() || undefined,
      institution: args.institution?.trim() || undefined,
      bio: args.bio?.trim() || undefined,
      specialties: args.specialties?.filter(Boolean) || undefined,
    });

    return { success: true };
  },
});
// convex/users.ts — add this
export const autoAssignTeacher = mutation({
  args: { studentId: v.id("users"), teacherId: v.id("users") },
  handler: async (ctx, { studentId, teacherId }) => {
    const student = await ctx.db.get(studentId);
    const teacher = await ctx.db.get(teacherId);

    if (!student || student.role !== "student") return;
    if (!teacher || teacher.role !== "teacher") return;

    // Only update if not already set or if different
    if (student.currentTeacher !== teacherId) {
      await ctx.db.patch(studentId, { currentTeacher: teacherId });
    }
  },
});
