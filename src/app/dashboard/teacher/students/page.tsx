"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const STUDENTS_STYLES = `
  .sts-page                     { background: #ffffff !important; }
  .dark .sts-page               { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .sts-title                    { color: hsl(var(--foreground)) !important; }
  .dark .sts-title              { color: #ede9fe !important; }

  /* Card */
  .sts-card                     { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .sts-card               { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 30px rgba(139,92,246,0.1) !important; }

  .sts-card-title               { color: hsl(var(--foreground)) !important; }
  .dark .sts-card-title         { color: #ddd6fe !important; }

  /* Table header row */
  .sts-thead-row                { background: hsl(var(--primary)) !important; border-bottom-color: hsl(var(--primary)/0.2) !important; }
  .dark .sts-thead-row          { background: rgba(76,29,149,0.4) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }

  .sts-th                       { color: #ffffff !important; font-weight: 600 !important; }
  .dark .sts-th                 { color: #c4b5fd !important; }

  /* Table body rows */
  .sts-tr                       { border-bottom-color: hsl(var(--border)) !important; }
  .sts-tr:hover                 { background: hsl(var(--muted)/0.5) !important; }
  .dark .sts-tr                 { border-bottom-color: rgba(109,40,217,0.2) !important; }
  .dark .sts-tr:hover           { background: rgba(76,29,149,0.15) !important; }

  .sts-td                       { color: hsl(var(--foreground)) !important; }
  .dark .sts-td                 { color: #ddd6fe !important; }

  .sts-td-sub                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .sts-td-sub             { color: #a78bfa !important; }

  /* Empty state */
  .sts-empty                    { color: hsl(var(--muted-foreground)) !important; }
  .dark .sts-empty              { color: #c4b5fd !important; }
`;

export default function TeacherStudents() {
  const { userDetail } = useUserDetail();
  const { user } = useUser();

  const schedules = useQuery(
    api.schedules.getByTeacherWithTimezones,
    userDetail?.role === "teacher"
      ? { teacherId: userDetail._id as Id<"users"> }
      : "skip",
  );
  const allStudents = useQuery(api.users.getAllStudents);

  const myStudents = allStudents?.filter((student) =>
    schedules?.some((schedule) =>
      schedule.lessons.some((lesson) => lesson.studentId === student._id),
    ),
  );

  if (!userDetail) {
    return (
      <div className="sts-page min-h-screen flex items-center justify-center">
        <style>{STUDENTS_STYLES}</style>
        <p className="sts-empty text-base">Loading profile...</p>
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="sts-page min-h-screen flex items-center justify-center">
        <style>{STUDENTS_STYLES}</style>
        <p className="text-destructive text-base">
          Unauthorized – Teachers Only
        </p>
      </div>
    );
  }

  if (schedules === undefined || allStudents === undefined) {
    return (
      <div className="sts-page min-h-screen container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <style>{STUDENTS_STYLES}</style>
        <Skeleton className="h-9 w-48 sm:w-64" />
        <Skeleton className="h-72 sm:h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="sts-page min-h-screen">
      <style>{STUDENTS_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <h1 className="sts-title text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-serif">
          My Students
        </h1>

        {!myStudents || myStudents.length === 0 ? (
          <div className="sts-card rounded-xl border-2 p-10 sm:p-16 text-center shadow-sm">
            <p className="sts-empty text-base sm:text-lg">
              No students assigned yet.
            </p>
          </div>
        ) : (
          <div className="sts-card rounded-xl border-2 overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="p-4 sm:p-6 border-b border-inherit">
              <h2 className="sts-card-title text-base sm:text-lg font-bold">
                My Active Students ({myStudents.length})
              </h2>
            </div>

            {/* Table — scrollable on mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="sts-thead-row">
                    {["Name", "Instrument", "Timezone", "Total Lessons"].map(
                      (h) => (
                        <th
                          key={h}
                          className="sts-th px-4 sm:px-6 py-3 text-left font-serif whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {myStudents.map((student) => {
                    const lessonCount = schedules.reduce(
                      (acc, sched) =>
                        acc +
                        sched.lessons.filter((l) => l.studentId === student._id)
                          .length,
                      0,
                    );

                    return (
                      <tr key={student._id} className="sts-tr border-b">
                        <td className="sts-td font-medium px-4 sm:px-6 py-3 whitespace-nowrap">
                          {student.name || "Unnamed Student"}
                        </td>
                        <td className="sts-td-sub px-4 sm:px-6 py-3 whitespace-nowrap">
                          {student.instrument || "—"}
                        </td>
                        <td className="sts-td-sub px-4 sm:px-6 py-3 whitespace-nowrap">
                          {student.timezone || "Not set"}
                        </td>
                        <td className="sts-td px-4 sm:px-6 py-3 font-semibold whitespace-nowrap">
                          {lessonCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
