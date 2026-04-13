"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar, Loader2 } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { TeacherEvaluationModal } from "@/app/components/TeacherEvaluationModal";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const TEVAL_STYLES = `
  .teval-page                   { background: #ffffff !important; }
  .dark .teval-page             { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .teval-title                  { color: hsl(var(--foreground)) !important; }
  .teval-subtitle               { color: hsl(var(--muted-foreground)) !important; }
  .dark .teval-title            { color: #ede9fe !important; }
  .dark .teval-subtitle         { color: #c4b5fd !important; }

  /* Empty state card */
  .teval-empty-card             { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .teval-empty-card       { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }

  .teval-empty-title            { color: hsl(var(--foreground)) !important; }
  .teval-empty-sub              { color: hsl(var(--muted-foreground)) !important; }
  .dark .teval-empty-title      { color: #ede9fe !important; }
  .dark .teval-empty-sub        { color: #c4b5fd !important; }

  /* Student cards */
  .teval-card                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important; }
  .teval-card:hover             { box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important; }
  .dark .teval-card             { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .dark .teval-card:hover       { box-shadow: 0 4px 24px rgba(139,92,246,0.2) !important; }

  .teval-student-name           { color: hsl(var(--foreground)) !important; }
  .teval-student-email          { color: hsl(var(--muted-foreground)) !important; }
  .teval-meta                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .teval-student-name     { color: #ede9fe !important; }
  .dark .teval-student-email    { color: #a78bfa !important; }
  .dark .teval-meta             { color: #c4b5fd !important; }

  /* Card divider */
  .teval-card-divider           { border-color: hsl(var(--border)) !important; }
  .dark .teval-card-divider     { border-color: rgba(109,40,217,0.2) !important; }

  /* Create evaluation button */
  .teval-btn                    { background: hsl(var(--primary)) !important; color: #ffffff !important; border: none !important; }
  .teval-btn:hover              { background: hsl(var(--primary)/0.9) !important; }
  .dark .teval-btn              { background: #7c3aed !important; }
  .dark .teval-btn:hover        { background: #6d28d9 !important; }
`;

type StudentNeedingEvaluation = {
  student: {
    _id: Id<"users">;
    name?: string;
    email?: string;
  };
  lastEval: { year: number; month: number } | null;
  lessonsCompleted: number;
  firstLessonDate: number;
};

export default function TeacherEvaluationsPage() {
  const { user, isLoaded } = useUser();

  // Primary: from Clerk publicMetadata (set by webhook)
  // Fallback: query Convex directly — handles cases where metadata isn't populated yet
  const convexUser = useQuery(api.users.get);
  const userId =
    (user?.publicMetadata?.convexId as Id<"users"> | undefined) ??
    convexUser?._id;

  const studentsNeedingEvaluation = useQuery(
    api.evaluations.getStudentsNeedingEvaluation,
    userId ? { teacherId: userId } : "skip",
  ) as StudentNeedingEvaluation[] | undefined;

  const [selectedStudent, setSelectedStudent] = useState<{
    id: Id<"users">;
    name: string;
    lastEvaluation: StudentNeedingEvaluation["lastEval"];
  } | null>(null);

  // Still loading Clerk + Convex user
  if (!isLoaded || convexUser === undefined) {
    return (
      <div className="teval-page min-h-screen flex items-center justify-center">
        <style>{TEVAL_STYLES}</style>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Clerk loaded but no userId resolved at all
  if (!userId) {
    return (
      <div className="teval-page min-h-screen p-4 sm:p-6">
        <style>{TEVAL_STYLES}</style>
        <p className="teval-subtitle">
          Unable to load user. Please try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="teval-page min-h-screen">
      <style>{TEVAL_STYLES}</style>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl">
        {/* Heading */}
        <div>
          <h1 className="teval-title text-2xl sm:text-3xl font-bold font-serif">
            Student Evaluations
          </h1>
          <p className="teval-subtitle text-sm sm:text-base mt-1">
            Submit monthly evaluations for students you&apos;ve taught for more
            than a month
          </p>
        </div>

        {/* Empty state */}
        {!studentsNeedingEvaluation ||
        studentsNeedingEvaluation.length === 0 ? (
          <div className="teval-empty-card rounded-xl border-2 p-10 sm:p-12 text-center shadow-sm">
            <ClipboardList className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary dark:text-purple-400 opacity-50 mb-4" />
            <h3 className="teval-empty-title text-base sm:text-lg font-semibold mb-2">
              No Evaluations Needed
            </h3>
            <p className="teval-empty-sub text-sm sm:text-base max-w-md mx-auto">
              All your students have been evaluated for this month, or no
              students have completed a month of lessons yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {studentsNeedingEvaluation.map((item) => {
              const studentName = item.student.name ?? "Unnamed Student";

              return (
                <div
                  key={item.student._id}
                  className="teval-card rounded-xl border-2 overflow-hidden transition-shadow"
                >
                  {/* Card header */}
                  <div className="p-4 sm:p-6 border-b teval-card-divider">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <h2 className="teval-student-name font-bold text-base sm:text-lg truncate">
                          {studentName}
                        </h2>
                        <p className="teval-student-email text-xs sm:text-sm mt-0.5">
                          {item.student.email ?? "No email"}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-xs sm:text-sm"
                      >
                        {item.lessonsCompleted} lesson
                        {item.lessonsCompleted !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="teval-meta text-xs sm:text-sm flex flex-col gap-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          First lesson:{" "}
                          {new Date(item.firstLessonDate).toLocaleDateString()}
                        </span>
                        {item.lastEval && (
                          <span className="flex items-center gap-1.5">
                            <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                            Last evaluation:{" "}
                            {new Date(
                              item.lastEval.year,
                              item.lastEval.month,
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setSelectedStudent({
                            id: item.student._id,
                            name: studentName,
                            lastEvaluation: item.lastEval,
                          })
                        }
                        className="teval-btn flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 w-full sm:w-auto"
                      >
                        <ClipboardList className="h-4 w-4 shrink-0" />
                        Create Evaluation
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedStudent && (
        <TeacherEvaluationModal
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          teacherId={userId}
          previousEvaluation={selectedStudent.lastEvaluation}
        />
      )}
    </div>
  );
}
