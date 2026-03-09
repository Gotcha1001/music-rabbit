// // app/components/BulkSchedulingSection.tsx
// "use client";

// import { useState } from "react";
// import { useQuery, useMutation } from "convex/react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";
// import { format, addWeeks, addDays } from "date-fns";
// import { Calendar, Plus, Loader2 } from "lucide-react";
// import { api } from "../../../convex/_generated/api";
// import { Id } from "../../../convex/_generated/dataModel";

// export function BulkSchedulingSection() {
//   const [selectedStudent, setSelectedStudent] = useState<Id<"users"> | null>(
//     null,
//   );
//   const [selectedTeacher, setSelectedTeacher] = useState<Id<"users"> | null>(
//     null,
//   );
//   const [weeksAhead, setWeeksAhead] = useState<number>(4);
//   const [startDate, setStartDate] = useState<string>(
//     format(new Date(), "yyyy-MM-dd"),
//   );
//   const [time, setTime] = useState<string>("10:00");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const activePackage = useQuery(
//     api.studentPackages.getActivePackage,
//     selectedStudent ? { studentId: selectedStudent } : "skip",
//   );

//   const allStudents = useQuery(api.users.getAllStudents) ?? [];
//   const allTeachers = useQuery(api.users.getAllTeachers) ?? [];

//   const adminBulkCreateLessons = useMutation(
//     api.schedules.adminBulkCreateLessons,
//   );

//   // Helper to check if date is Mon-Fri
//   const isWorkingDay = (dateStr: string): boolean => {
//     const date = new Date(dateStr);
//     const day = date.getDay();
//     return day >= 1 && day <= 5; // Monday = 1, Friday = 5
//   };

//   // Generate dates based on package settings
//   const generateRecurringDates = (lessonsPerWeek: number): string[] => {
//     const dates: string[] = [];
//     const current = new Date(startDate);
//     const endDate = addWeeks(current, weeksAhead);

//     // Calculate how many days to spread lessons across the week
//     const daysPerWeek = 5; // Mon-Fri
//     const interval = Math.floor(daysPerWeek / lessonsPerWeek);

//     let weekStart = new Date(current);

//     while (weekStart < endDate) {
//       let lessonsThisWeek = 0;
//       let dayOffset = 0;

//       while (lessonsThisWeek < lessonsPerWeek && dayOffset < 7) {
//         const checkDate = addDays(weekStart, dayOffset);
//         const dateStr = format(checkDate, "yyyy-MM-dd");

//         if (
//           isWorkingDay(dateStr) &&
//           checkDate >= current &&
//           checkDate < endDate
//         ) {
//           dates.push(dateStr);
//           lessonsThisWeek++;
//           dayOffset += interval > 0 ? interval : 1;
//         } else {
//           dayOffset++;
//         }
//       }

//       // Move to next week
//       weekStart = addDays(weekStart, 7);
//     }

//     return dates;
//   };

//   const handleBulkSchedule = async () => {
//     if (!selectedTeacher || !selectedStudent || !activePackage) {
//       toast.error("Missing required information");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const dates = generateRecurringDates(activePackage.lessonsPerWeek);

//       if (dates.length === 0) {
//         toast.error("No valid dates generated");
//         return;
//       }

//       const result = await adminBulkCreateLessons({
//         teacherId: selectedTeacher,
//         studentId: selectedStudent,
//         dates,
//         time,
//         duration: activePackage.minutesPerLesson,
//         bookId: undefined,
//       });

//       toast.success(
//         `Scheduled ${result.created} lessons! ${
//           result.skipped > 0
//             ? `(${result.skipped} skipped due to conflicts)`
//             : ""
//         }`,
//       );

//       // Reset form
//       setSelectedStudent(null);
//       setSelectedTeacher(null);
//       setTime("10:00");
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to create schedule";
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Card className="bg-gradient-to-br from-purple-950/60 to-black/60 border-2 border-purple-800/30 shadow-lg">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-3 text-2xl font-serif text-purple-200">
//           <Calendar className="h-7 w-7 text-purple-400" />
//           Bulk Schedule Lessons (Package-Based)
//         </CardTitle>
//         <p className="text-purple-400 text-sm mt-2">
//           Automatically create recurring lessons based on student&apos;s package
//         </p>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Student Selection */}
//         <div>
//           <Label className="text-purple-300">Student</Label>
//           <Select
//             onValueChange={(v) => setSelectedStudent(v as Id<"users">)}
//             value={selectedStudent || undefined}
//           >
//             <SelectTrigger className="bg-purple-900/30 border-purple-700 text-purple-200">
//               <SelectValue placeholder="Select Student" />
//             </SelectTrigger>
//             <SelectContent>
//               {allStudents.map((s) => (
//                 <SelectItem key={s._id} value={s._id}>
//                   {s.name || s.email.split("@")[0]} (
//                   {s.instrument || "No instrument"})
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Teacher Selection */}
//         <div>
//           <Label className="text-purple-300">Teacher</Label>
//           <Select
//             onValueChange={(v) => setSelectedTeacher(v as Id<"users">)}
//             value={selectedTeacher || undefined}
//           >
//             <SelectTrigger className="bg-purple-900/30 border-purple-700 text-purple-200">
//               <SelectValue placeholder="Select Teacher" />
//             </SelectTrigger>
//             <SelectContent>
//               {allTeachers.map((t) => (
//                 <SelectItem key={t._id} value={t._id}>
//                   {t.name || t.email.split("@")[0]} (
//                   {t.instrument || "No instrument"})
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Package Info Display */}
//         {activePackage && (
//           <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
//             <p className="text-purple-200 font-semibold mb-2">
//               Active Package:
//             </p>
//             <div className="text-purple-300 text-sm space-y-1">
//               <p>• {activePackage.lessonsPerWeek} lessons per week</p>
//               <p>• {activePackage.minutesPerLesson} minutes per lesson</p>
//               <p>• {activePackage.remainingMinutes} minutes remaining</p>
//             </div>
//           </div>
//         )}

//         {/* Start Date */}
//         <div>
//           <Label className="text-purple-300">Start Date</Label>
//           <Input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="bg-purple-900/30 border-purple-700 text-purple-200"
//           />
//         </div>

//         {/* Weeks Ahead */}
//         <div>
//           <Label className="text-purple-300">Weeks Ahead</Label>
//           <Input
//             type="number"
//             value={weeksAhead}
//             onChange={(e) => setWeeksAhead(parseInt(e.target.value))}
//             min={1}
//             max={12}
//             className="bg-purple-900/30 border-purple-700 text-purple-200"
//           />
//         </div>

//         {/* Lesson Time */}
//         <div>
//           <Label className="text-purple-300">Lesson Time (same for all)</Label>
//           <Input
//             type="time"
//             value={time}
//             onChange={(e) => setTime(e.target.value)}
//             className="bg-purple-900/30 border-purple-700 text-purple-200"
//           />
//           <p className="text-xs text-purple-400/70 mt-1">
//             Time will be in teacher&apos;s timezone (10:00 - 17:00)
//           </p>
//         </div>

//         {/* Submit Button */}
//         <Button
//           onClick={handleBulkSchedule}
//           disabled={
//             !activePackage ||
//             !selectedTeacher ||
//             !selectedStudent ||
//             isSubmitting
//           }
//           className="w-full bg-purple-700 hover:bg-purple-600 text-white"
//         >
//           {isSubmitting ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Creating Schedule...
//             </>
//           ) : (
//             <>
//               <Plus className="mr-2 h-4 w-4" />
//               Create Bulk Schedule
//             </>
//           )}
//         </Button>

//         {!activePackage && selectedStudent && (
//           <p className="text-red-400 text-sm text-center">
//             {"This student doesn't have an active package"}
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
"use client";

// Drop-in replacement for the BulkSchedulingSection inside Admin/schedules/page.tsx
// Key improvements:
//   - Shows per-teacher lesson distribution after company schedule runs
//   - Shows per-student result breakdown (who got scheduled, who was skipped and why)
//   - Toast now shows meaningful numbers, not just "success"
//   - Manual smart schedule section unchanged (it already works)

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar,
  Plus,
  Loader2,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type ScheduleResult = {
  studentName: string;
  teacherName: string;
  lessonsCreated: number;
  reason?: string;
};

type TeacherSummary = {
  teacherName: string;
  lessonsAssigned: number;
};

export function BulkSchedulingSection() {
  const [selectedStudent, setSelectedStudent] = useState<Id<"users"> | null>(
    null,
  );
  const [selectedTeacher, setSelectedTeacher] = useState<Id<"users"> | null>(
    null,
  );
  const [weeksAhead, setWeeksAhead] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Company schedule result state
  const [companyResults, setCompanyResults] = useState<ScheduleResult[] | null>(
    null,
  );
  const [teacherSummary, setTeacherSummary] = useState<TeacherSummary[] | null>(
    null,
  );
  const [showResults, setShowResults] = useState(false);

  const allStudents = useQuery(api.users.getAllStudents) ?? [];
  const allTeachers = useQuery(api.users.getAllTeachers) ?? [];

  const smartBulkSchedule = useMutation(api.schedules.smartBulkSchedule);
  const autoScheduleCompany = useMutation(
    api.schedules.autoScheduleEntireCompany,
  );

  // ── Company-wide auto schedule ────────────────────────────────────────────
  const handleAutoScheduleCompany = async () => {
    if (
      !confirm(
        "⚠️ This will schedule lessons for ALL students with active packages. Continue?",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setShowResults(false);

    try {
      const result = await autoScheduleCompany({ startDate, weeksAhead });

      setCompanyResults(result.results);
      setTeacherSummary(result.teacherSummary ?? null);
      setShowResults(true);

      const skippedCount = result.results.filter(
        (r) => r.lessonsCreated === 0,
      ).length;

      toast.success(
        `🎉 Done! ${result.totalCreated} lessons created across ${result.studentsProcessed} students`,
        { duration: 6000 },
      );

      if (skippedCount > 0) {
        toast.warning(
          `${skippedCount} students had issues — check the breakdown below.`,
          {
            duration: 6000,
          },
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to schedule";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Manual smart schedule (single student) ────────────────────────────────
  const handleSmartSchedule = async () => {
    if (!selectedTeacher || !selectedStudent) {
      toast.error("Please select both teacher and student");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await smartBulkSchedule({
        teacherId: selectedTeacher,
        studentId: selectedStudent,
        startDate,
        weeksAhead,
      });

      toast.success(
        `✅ Created ${result.created} lessons${result.skipped > 0 ? ` (${result.skipped} skipped)` : ""}`,
      );
      setSelectedStudent(null);
      setSelectedTeacher(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to schedule";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-950/60 to-black/60 border-2 border-purple-800/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-serif text-purple-200">
          <Calendar className="h-7 w-7 text-purple-400" />
          Smart Bulk Scheduling
        </CardTitle>
        <p className="text-purple-400 text-sm mt-2">
          Auto-find available slots based on packages and distribute evenly
          across teachers
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Global date settings ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
          <div>
            <Label className="text-purple-300">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-purple-900/30 border-purple-700 text-purple-200"
            />
          </div>
          <div>
            <Label className="text-purple-300">Weeks Ahead</Label>
            <Input
              type="number"
              value={weeksAhead}
              onChange={(e) => setWeeksAhead(parseInt(e.target.value))}
              min={1}
              max={12}
              className="bg-purple-900/30 border-purple-700 text-purple-200"
            />
          </div>
        </div>

        {/* ── Company-wide section ──────────────────────────────────────── */}
        <div className="p-6 bg-gradient-to-br from-emerald-900/30 to-green-900/20 rounded-lg border-2 border-emerald-700/50">
          <h3 className="text-xl font-bold text-emerald-200 mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Auto-Schedule Entire Company
          </h3>
          <p className="text-emerald-300/80 text-sm mb-4">
            Schedules ALL students with active packages. Distributes lessons
            evenly across teachers using round-robin. Respects each
            student&apos;s assigned teacher if set. Deducts package minutes
            automatically.
          </p>

          <div className="flex items-center gap-3 mb-4 text-xs text-emerald-400/70">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {allStudents.length} students
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" /> {allTeachers.length}{" "}
              teachers
            </span>
          </div>

          <Button
            onClick={handleAutoScheduleCompany}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scheduling company-wide…
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Schedule Entire Company ({allStudents.length} Students)
              </>
            )}
          </Button>
        </div>

        {/* ── Results breakdown (shown after run) ──────────────────────── */}
        {showResults && companyResults && (
          <div className="space-y-4">
            {/* Teacher distribution */}
            {teacherSummary && teacherSummary.length > 0 && (
              <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                <h4 className="text-purple-200 font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Teacher Distribution
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {teacherSummary.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-purple-900/30 rounded border border-purple-700/30"
                    >
                      <span className="text-purple-200 text-sm">
                        {t.teacherName}
                      </span>
                      <Badge className="bg-emerald-700 text-white text-xs">
                        {t.lessonsAssigned} lessons
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Per-student results */}
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
              <h4 className="text-purple-200 font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Student Results
              </h4>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {companyResults.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm px-3 py-1.5 rounded bg-purple-950/40"
                  >
                    <div className="flex items-center gap-2">
                      {r.lessonsCreated > 0 ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      )}
                      <span className="text-purple-200">{r.studentName}</span>
                      {r.teacherName !== "N/A" && (
                        <span className="text-purple-500 text-xs">
                          → {r.teacherName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.lessonsCreated > 0 && (
                        <Badge className="bg-emerald-900 text-emerald-300 text-xs py-0">
                          {r.lessonsCreated} lessons
                        </Badge>
                      )}
                      {r.reason && (
                        <span className="text-red-400 text-xs">{r.reason}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full border-purple-700 text-purple-300"
              onClick={() => setShowResults(false)}
            >
              Dismiss Results
            </Button>
          </div>
        )}

        {/* ── Manual smart schedule (single student) ───────────────────── */}
        <div className="p-6 bg-purple-900/20 rounded-lg border border-purple-700/50">
          <h3 className="text-lg font-bold text-purple-200 mb-3">
            📅 Manual Smart Schedule (Single Student)
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-purple-300">Student</Label>
              <Select
                onValueChange={(v) => setSelectedStudent(v as Id<"users">)}
                value={selectedStudent || undefined}
              >
                <SelectTrigger className="bg-purple-900/30 border-purple-700 text-purple-200">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {allStudents.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name || s.email.split("@")[0]} (
                      {s.instrument || "No instrument"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-purple-300">Teacher</Label>
              <Select
                onValueChange={(v) => setSelectedTeacher(v as Id<"users">)}
                value={selectedTeacher || undefined}
              >
                <SelectTrigger className="bg-purple-900/30 border-purple-700 text-purple-200">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {allTeachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name || t.email.split("@")[0]} (
                      {t.instrument || "No instrument"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSmartSchedule}
              disabled={!selectedTeacher || !selectedStudent || isSubmitting}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Slots…
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Auto-Find Slots &amp; Schedule
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
