// useScheduleDownload.ts
// Drop this hook into your project (e.g. src/hooks/useScheduleDownload.ts)
// Usage: see TeacherScheduleManager patch below

import { useCallback } from "react";
import * as XLSX from "xlsx";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

// ─── Types (mirror your Convex schema) ────────────────────────────────────────

type LessonState =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "missed_teacher"
  | "missed_student";

type LessonStatus =
  | "completed"
  | "finished_early"
  | "no_answer_on_time"
  | "teacher_never_called"
  | "technical_difficulty"
  | "teacher_late";

interface Lesson {
  lessonId: string;
  studentId: string;
  time: string; // "HH:MM"
  duration: number; // minutes
  bookId: string | null;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
  scheduledTime: number;
  status: LessonStatus;
  state: LessonState;
  startedAt?: number;
  endedAt?: number;
  actualMinutes?: number;
  onTime?: boolean;
  joinedAt?: number;
  markedBy?: string;
  markedAt?: number;
}

interface Schedule {
  _id: string;
  teacherId: string;
  date: string; // "YYYY-MM-DD"
  instrument?: string;
  lessons: Lesson[];
}

interface User {
  _id: string;
  name?: string;
  email: string;
  instrument?: string;
}

interface Book {
  _id: string;
  title: string;
}

export type DownloadRange = "day" | "week" | "month";

interface UseScheduleDownloadOptions {
  schedules: Schedule[];
  teachers: User[];
  students: User[];
  books: Book[];
  /** The teacher whose schedule is being shown (null = all teachers / admin view) */
  teacherId: string | null;
  /** The reference date for day/week/month calculation (defaults to today) */
  referenceDate?: Date;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScheduleDownload({
  schedules,
  teachers,
  students,
  books,
  teacherId,
  referenceDate = new Date(),
}: UseScheduleDownloadOptions) {
  const downloadSchedule = useCallback(
    (range: DownloadRange) => {
      // 1. Determine date window
      let from: Date;
      let to: Date;
      let rangeLabel: string;

      switch (range) {
        case "day":
          from = startOfDay(referenceDate);
          to = endOfDay(referenceDate);
          rangeLabel = format(referenceDate, "yyyy-MM-dd");
          break;
        case "week":
          // Mon–Sun week (locale-independent; weekStartsOn: 1)
          from = startOfWeek(referenceDate, { weekStartsOn: 1 });
          to = endOfWeek(referenceDate, { weekStartsOn: 1 });
          rangeLabel = `Week_${format(from, "yyyy-MM-dd")}_to_${format(to, "yyyy-MM-dd")}`;
          break;
        case "month":
        default:
          from = startOfMonth(referenceDate);
          to = endOfMonth(referenceDate);
          rangeLabel = format(referenceDate, "yyyy-MM");
          break;
      }

      // 2. Filter schedules
      const filtered = schedules.filter((sched) => {
        if (teacherId && sched.teacherId !== teacherId) return false;
        const d = new Date(sched.date);
        return d >= from && d <= to;
      });

      // 3. Flatten to rows
      const rows: Record<string, string | number>[] = [];

      filtered
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach((sched) => {
          const teacher = teachers.find((t) => t._id === sched.teacherId);
          const teacherName =
            teacher?.name ?? teacher?.email.split("@")[0] ?? "Unknown";

          sched.lessons
            .slice()
            .sort((a, b) => a.time.localeCompare(b.time))
            .forEach((lesson) => {
              const student = students.find((s) => s._id === lesson.studentId);
              const studentName =
                student?.name ?? student?.email.split("@")[0] ?? "Unknown";

              const book = lesson.bookId
                ? books.find((b) => b._id === lesson.bookId)
                : null;

              rows.push({
                Date: sched.date,
                Teacher: teacherName,
                Instrument: sched.instrument ?? teacher?.instrument ?? "",
                "Student Name": studentName,
                Time: lesson.time,
                "Duration (min)": lesson.duration,
                Book: book?.title ?? "",
                State: lesson.state,
                Status: lesson.state === "scheduled" ? "" : lesson.status,
                "Zoom Link": lesson.zoomLink ?? "",
                Notes: lesson.notes ?? "",
                "Actual Minutes": lesson.actualMinutes ?? "",
                "On Time":
                  lesson.onTime === undefined
                    ? ""
                    : lesson.onTime
                      ? "Yes"
                      : "No",
              });
            });
        });

      if (rows.length === 0) {
        alert(`No lessons found for the selected ${range}.`);
        return;
      }

      // 4. Build worksheet
      const ws = XLSX.utils.json_to_sheet(rows);

      // Column widths
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 20 }, // Teacher
        { wch: 14 }, // Instrument
        { wch: 22 }, // Student Name
        { wch: 8 }, // Time
        { wch: 14 }, // Duration
        { wch: 28 }, // Book
        { wch: 14 }, // State
        { wch: 22 }, // Status
        { wch: 32 }, // Zoom Link
        { wch: 30 }, // Notes
        { wch: 14 }, // Actual Minutes
        { wch: 10 }, // On Time
      ];
      ws["!cols"] = colWidths;

      // 5. Build workbook with summary sheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Schedule");

      // Summary: lessons per teacher per day
      const summaryMap: Record<string, Record<string, number>> = {};
      rows.forEach((r) => {
        const t = String(r["Teacher"]);
        const d = String(r["Date"]);
        if (!summaryMap[t]) summaryMap[t] = {};
        summaryMap[t][d] = (summaryMap[t][d] ?? 0) + 1;
      });

      const summaryRows: Record<string, string | number>[] = [];
      Object.entries(summaryMap).forEach(([teacher, days]) => {
        Object.entries(days).forEach(([date, count]) => {
          summaryRows.push({ Teacher: teacher, Date: date, Lessons: count });
        });
      });

      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 22 }, { wch: 12 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // 6. Download
      const teacherSuffix = teacherId
        ? `_${teacherName(teachers, teacherId)}`
        : "_AllTeachers";

      XLSX.writeFile(wb, `Schedule_${rangeLabel}${teacherSuffix}.xlsx`);
    },
    [schedules, teachers, students, books, teacherId, referenceDate],
  );

  return { downloadSchedule };
}

// Helper
function teacherName(teachers: User[], id: string): string {
  const t = teachers.find((x) => x._id === id);
  return (t?.name ?? t?.email.split("@")[0] ?? "Unknown").replace(/\s+/g, "_");
}
