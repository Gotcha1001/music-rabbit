import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get students that need evaluation (taught for more than a month)
export const getStudentsNeedingEvaluation = query({
  args: {
    teacherId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Get all schedules where this teacher is involved
    const schedules = await ctx.db
      .query("schedules")
      .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
      .collect();

    // 2. Collect all completed lessons across all these schedules
    const completedLessonsByStudent = new Map<
      Id<"users">,
      {
        lessons: Doc<"schedules">["lessons"][number][];
        firstDate: number;
        totalCompleted: number;
      }
    >();

    for (const schedule of schedules) {
      // Filter only completed lessons in this schedule
      const completed = schedule.lessons.filter(
        (lesson) => lesson.status === "completed",
      );
      for (const lesson of completed) {
        const studentId = lesson.studentId;

        if (!completedLessonsByStudent.has(studentId)) {
          completedLessonsByStudent.set(studentId, {
            lessons: [],
            firstDate: Infinity,
            totalCompleted: 0,
          });
        }

        const entry = completedLessonsByStudent.get(studentId)!;

        entry.lessons.push(lesson);
        entry.totalCompleted += 1;

        // FIXED: only update if date exists
        if (lesson.date !== undefined) {
          entry.firstDate = Math.min(entry.firstDate, lesson.date);
        }
      }
    }

    const studentsNeedingEvaluation: Array<{
      student: Doc<"users">;
      lastEval: Doc<"evaluations"> | null;
      lessonsCompleted: number;
      firstLessonDate: number;
    }> = [];

    // 3. Evaluate each student
    for (const [studentId, data] of completedLessonsByStudent) {
      const { firstDate: firstLessonDate, totalCompleted: lessonsCompleted } =
        data;

      if (firstLessonDate === Infinity) continue;

      const monthsSinceFirst =
        (now.getTime() - firstLessonDate) / (1000 * 60 * 60 * 24 * 30);

      if (monthsSinceFirst < 1) continue;

      // Check if evaluation already exists for current month/year + this teacher
      const existingEval = await ctx.db
        .query("evaluations")
        .withIndex("by_student_date", (q) =>
          q
            .eq("studentId", studentId)
            .eq("year", currentYear)
            .eq("month", currentMonth),
        )
        .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
        .first();

      if (existingEval) continue;

      // Get the most recent previous evaluation by this teacher
      const lastEval = await ctx.db
        .query("evaluations")
        .withIndex("by_student", (q) => q.eq("studentId", studentId))
        .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
        .order("desc")
        .first();

      const student = await ctx.db.get(studentId);
      if (!student) continue;

      studentsNeedingEvaluation.push({
        student,
        lastEval,
        lessonsCompleted,
        firstLessonDate,
      });
    }

    // Optional: sort by student name or first lesson date
    studentsNeedingEvaluation.sort((a, b) =>
      a.student.name && b.student.name
        ? a.student.name.localeCompare(b.student.name)
        : 0,
    );

    return studentsNeedingEvaluation;
  },
});

// Create a new evaluation
export const createEvaluation = mutation({
  args: {
    studentId: v.id("users"),
    teacherId: v.id("users"),
    scales: v.string(),
    chords: v.string(),
    sightReading: v.string(),
    rhythm: v.string(),
    improvisation: v.string(),
    piecesWorkedOn: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // Check if evaluation already exists for this month
    const existing = await ctx.db
      .query("evaluations")
      .withIndex("by_student_date", (q) =>
        q.eq("studentId", args.studentId).eq("year", year).eq("month", month),
      )
      .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
      .first();

    if (existing) {
      throw new Error("Evaluation already exists for this month");
    }

    const evaluationId = await ctx.db.insert("evaluations", {
      studentId: args.studentId,
      teacherId: args.teacherId,
      month,
      year,
      createdAt: Date.now(),
      scales: args.scales,
      chords: args.chords,
      sightReading: args.sightReading,
      rhythm: args.rhythm,
      improvisation: args.improvisation,
      piecesWorkedOn: args.piecesWorkedOn,
      notes: args.notes,
    });

    return evaluationId;
  },
});

// Get evaluations for a student
export const getStudentEvaluations = query({
  args: {
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const evaluations = await ctx.db
      .query("evaluations")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();

    // Get teacher info for each evaluation
    // GOOD
    const evaluationsWithTeacher = await Promise.all(
      evaluations.map(async (evaluation) => {
        const teacher = await ctx.db.get(evaluation.teacherId);
        return {
          ...evaluation,
          teacher,
        };
      }),
    );

    return evaluationsWithTeacher;
  },
});

// Get a specific evaluation with comparison to previous
export const getEvaluationWithComparison = query({
  args: {
    evaluationId: v.id("evaluations"),
  },
  handler: async (ctx, args) => {
    const currentEval = await ctx.db.get(args.evaluationId);
    if (!currentEval) return null;

    // Get previous evaluation from the same teacher
    const previousEval = await ctx.db
      .query("evaluations")
      .withIndex("by_student", (q) => q.eq("studentId", currentEval.studentId))
      .filter((q) => q.eq(q.field("teacherId"), currentEval.teacherId))
      .filter((q) =>
        q.or(
          q.lt(q.field("year"), currentEval.year),
          q.and(
            q.eq(q.field("year"), currentEval.year),
            q.lt(q.field("month"), currentEval.month),
          ),
        ),
      )
      .order("desc")
      .first();

    const teacher = await ctx.db.get(currentEval.teacherId);

    return {
      current: currentEval,
      previous: previousEval,
      teacher,
    };
  },
});
