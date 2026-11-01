// "use client";

// import { useState } from "react";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "../../../../../convex/_generated/api";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";
// import { Calendar, Plus, Sparkles, Zap, Loader2 } from "lucide-react";
// import { Id } from "../../../../../convex/_generated/dataModel";
// import TeacherScheduleManager from "@/app/components/TeacherScheduleManager";
// import { format } from "date-fns";
// import { BlankDayButton } from "@/app/components/BlankDayButton";
// import { WavyBackground } from "@/components/ui/wavy-background";

// /* ─────────────────────────────────────────────────────────────
//    !important overrides
//    Light = default  |  Dark = .dark prefix
// ───────────────────────────────────────────────────────────── */
// const ADMIN_SCH_STYLES = `
//   .asch-page                    { background: #ffffff !important; }
//   .dark .asch-page              { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

//   /* Cards */
//   .asch-card                    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
//   .dark .asch-card              { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 24px rgba(139,92,246,0.1) !important; }

//   .asch-card-title              { color: hsl(var(--foreground)) !important; }
//   .dark .asch-card-title        { color: #ddd6fe !important; }

//   .asch-card-sub                { color: hsl(var(--muted-foreground)) !important; }
//   .dark .asch-card-sub          { color: #a78bfa !important; }

//   /* Section panels inside cards (company-wide + single student) */
//   .asch-panel                   { background: hsl(var(--muted)/0.4) !important; border-color: hsl(var(--border)) !important; }
//   .dark .asch-panel             { background: rgba(76,29,149,0.15) !important; border-color: rgba(109,40,217,0.3) !important; }

//   .asch-panel-title             { color: hsl(var(--foreground)) !important; }
//   .asch-panel-sub               { color: hsl(var(--muted-foreground)) !important; }
//   .dark .asch-panel-title       { color: #ede9fe !important; }
//   .dark .asch-panel-sub         { color: #c4b5fd !important; }

//   .asch-panel-light             { background: hsl(var(--muted)/0.2) !important; border-color: hsl(var(--border)) !important; }
//   .dark .asch-panel-light       { background: rgba(46,16,101,0.2) !important; border-color: rgba(109,40,217,0.2) !important; }

//   .asch-panel-light-title       { color: hsl(var(--foreground)) !important; }
//   .dark .asch-panel-light-title { color: #ddd6fe !important; }

//   /* Labels */
//   .asch-label                   { color: hsl(var(--foreground)) !important; }
//   .dark .asch-label             { color: #c4b5fd !important; }

//   /* Inputs & selects */
//   .asch-input                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
//   .asch-input:focus             { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
//   .dark .asch-input             { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
// `;

// export default function AdminSchedulesPage() {
//   const teachers = useQuery(api.users.getAllTeachers) || [];
//   const students = useQuery(api.users.getAllStudents) || [];
//   const books = useQuery(api.books.getAll) || [];

//   const addLesson = useMutation(api.schedules.addLesson);
//   const autoAssignTeacher = useMutation(api.users.autoAssignTeacher);

//   const [selectedTeacher, setSelectedTeacher] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [duration, setDuration] = useState(30);
//   const [bookId, setBookId] = useState("");
//   const [zoomLink, setZoomLink] = useState("");

//   const handleAddLesson = async () => {
//     if (!selectedTeacher || !selectedStudent || !date || !time) {
//       toast.error("Please fill all required fields");
//       return;
//     }
//     try {
//       await addLesson({
//         teacherId: selectedTeacher as Id<"users">,
//         date,
//         lesson: {
//           studentId: selectedStudent as Id<"users">,
//           time,
//           duration,
//           bookId: bookId ? (bookId as Id<"books">) : undefined,
//           zoomLink: zoomLink || undefined,
//           notes: "",
//           completed: false,
//           status: "no_answer_on_time" as const,
//         },
//       });
//       await autoAssignTeacher({
//         studentId: selectedStudent as Id<"users">,
//         teacherId: selectedTeacher as Id<"users">,
//       });
//       toast.success("Lesson added & teacher assigned!");
//       setSelectedTeacher("");
//       setSelectedStudent("");
//       setDate("");
//       setTime("");
//       setZoomLink("");
//       setDuration(30);
//       setBookId("");
//     } catch (error) {
//       toast.error(
//         error instanceof Error ? error.message : "Failed to add lesson",
//       );
//     }
//   };

//   return (
//     <div className="asch-page min-h-screen relative">
//       <style>{ADMIN_SCH_STYLES}</style>
//       <WavyBackground
//         colors={["#7c3aed", "#6d28d9", "#22054e", "#c4b5fd", "#8b5cf6"]}
//         backgroundFill="transparent"
//         blur={4}
//         speed="slow"
//         waveOpacity={0.06}
//         waveWidth={60}
//         waveYOffset={350}
//         containerClassName="fixed inset-0 pointer-events-none"
//         className="hidden"
//       />
//       <div className="relative z-10 space-y-6 sm:space-y-8 p-4 sm:p-6">
//         <BulkSchedulingSection />

//         <BlankDayButton />

//         {/* ── Add New Lesson ── */}
//         <div className="asch-card rounded-xl border-2 overflow-hidden shadow-sm">
//           <div className="p-4 sm:p-6 border-b border-inherit">
//             <h2 className="asch-card-title flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold font-serif">
//               <Calendar className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
//               Add New Lesson
//             </h2>
//           </div>
//           <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">
//                   Teacher
//                 </label>
//                 <Select
//                   value={selectedTeacher}
//                   onValueChange={setSelectedTeacher}
//                 >
//                   <SelectTrigger className="asch-input">
//                     <SelectValue placeholder="Select teacher" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {teachers.map((t) => (
//                       <SelectItem key={t._id} value={t._id}>
//                         {t.name || t.email.split("@")[0]} (
//                         {t.instrument || "No instrument"})
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">
//                   Student
//                 </label>
//                 <Select
//                   value={selectedStudent}
//                   onValueChange={setSelectedStudent}
//                 >
//                   <SelectTrigger className="asch-input">
//                     <SelectValue placeholder="Select student" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {students.map((s) => (
//                       <SelectItem key={s._id} value={s._id}>
//                         {s.name || s.email.split("@")[0]} (
//                         {s.instrument || "No instrument"})
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">
//                   Book (Optional)
//                 </label>
//                 <Select value={bookId} onValueChange={setBookId}>
//                   <SelectTrigger className="asch-input">
//                     <SelectValue placeholder="No book" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {books.map((b) => (
//                       <SelectItem key={b._id} value={b._id}>
//                         {b.title} ({b.instrument})
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">
//                   Zoom Link (Optional)
//                 </label>
//                 <Input
//                   value={zoomLink}
//                   onChange={(e) => setZoomLink(e.target.value)}
//                   placeholder="https://zoom.us/..."
//                   className="asch-input"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">Date</label>
//                 <Input
//                   type="date"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                   className="asch-input"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">Time</label>
//                 <Input
//                   type="time"
//                   value={time}
//                   onChange={(e) => setTime(e.target.value)}
//                   className="asch-input"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">
//                   Duration (min)
//                 </label>
//                 <Input
//                   type="number"
//                   value={duration}
//                   onChange={(e) => setDuration(Number(e.target.value))}
//                   className="asch-input"
//                 />
//               </div>
//             </div>

//             <Button
//               onClick={handleAddLesson}
//               className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
//             >
//               <Plus className="mr-2 h-4 w-4" /> Add Lesson
//             </Button>
//           </div>
//         </div>

//         <TeacherScheduleManager />
//       </div>
//     </div>
//   );
// }

// function BulkSchedulingSection() {
//   const [selectedStudent, setSelectedStudent] = useState<Id<"users"> | null>(
//     null,
//   );
//   const [selectedTeacher, setSelectedTeacher] = useState<Id<"users"> | null>(
//     null,
//   );
//   const [weeksAhead, setWeeksAhead] = useState(4);
//   const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const allStudents = useQuery(api.users.getAllStudents) ?? [];
//   const allTeachers = useQuery(api.users.getAllTeachers) ?? [];
//   const smartBulkSchedule = useMutation(api.schedules.smartBulkSchedule);
//   const autoScheduleCompany = useMutation(
//     api.schedules.autoScheduleEntireCompany,
//   );

//   const handleSmartSchedule = async () => {
//     if (!selectedTeacher || !selectedStudent) {
//       toast.error("Please select both teacher and student");
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const result = await smartBulkSchedule({
//         teacherId: selectedTeacher,
//         studentId: selectedStudent,
//         startDate,
//         weeksAhead,
//       });
//       toast.success(
//         `✅ Created ${result.created} lessons! ${result.skipped > 0 ? `(${result.skipped} skipped)` : ""}`,
//       );
//       setSelectedStudent(null);
//       setSelectedTeacher(null);
//     } catch (error) {
//       const msg = error instanceof Error ? error.message : "Failed to schedule";
//       const cleanMsg = msg.includes("no active package")
//         ? "⚠️ No active package — purchase or credit a package first."
//         : msg.includes("Teacher timezone")
//           ? "⚠️ Teacher has no timezone set. Ask them to update profile."
//           : "Failed to schedule. Please try again.";
//       toast.error(cleanMsg, { duration: 5000 });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleAutoScheduleCompany = async () => {
//     if (!confirm("⚠️ This will schedule lessons for ALL students. Continue?"))
//       return;
//     setIsSubmitting(true);
//     try {
//       const result = await autoScheduleCompany({ startDate, weeksAhead });
//       toast.success(
//         `🎉 Company-wide scheduling complete!\n${result.totalCreated} lessons created\n${result.studentsProcessed} students processed`,
//       );
//     } catch (error) {
//       toast.error(
//         error instanceof Error ? error.message : "Failed to schedule",
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="asch-card rounded-xl border-2 overflow-hidden shadow-sm">
//       <div className="p-4 sm:p-6 border-b border-inherit">
//         <h2 className="asch-card-title flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold font-serif">
//           <Calendar className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
//           Smart Bulk Scheduling
//         </h2>
//         <p className="asch-card-sub text-sm sm:text-base mt-1">
//           Automatically find available slots based on packages
//         </p>
//       </div>

//       <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
//         {/* Global settings */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//           <div className="space-y-2">
//             <label className="asch-label text-sm font-medium">Start Date</label>
//             <Input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="asch-input"
//             />
//           </div>
//           <div className="space-y-2">
//             <label className="asch-label text-sm font-medium">
//               Weeks Ahead
//             </label>
//             <Input
//               type="number"
//               value={weeksAhead}
//               onChange={(e) => setWeeksAhead(parseInt(e.target.value) || 4)}
//               min={1}
//               max={12}
//               className="asch-input"
//             />
//           </div>
//         </div>

//         {/* Company-wide */}
//         <div className="asch-panel p-4 sm:p-6 border rounded-lg">
//           <h3 className="asch-panel-title text-lg sm:text-xl font-semibold mb-2 sm:mb-3 flex items-center gap-2">
//             <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
//             Auto-Schedule Entire Company
//           </h3>
//           <p className="asch-panel-sub text-sm sm:text-base mb-4">
//             Assign lessons for ALL students based on their packages
//           </p>
//           <Button
//             onClick={handleAutoScheduleCompany}
//             disabled={isSubmitting}
//             className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-700 dark:hover:bg-purple-600"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
//                 Scheduling...
//               </>
//             ) : (
//               <>
//                 <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
//                 Schedule All ({allStudents.length} students)
//               </>
//             )}
//           </Button>
//         </div>

//         {/* Single student */}
//         <div className="asch-panel-light p-4 sm:p-6 border rounded-lg">
//           <h3 className="asch-panel-light-title text-base sm:text-lg font-semibold mb-3 sm:mb-4">
//             Manual Smart Schedule (Single Student)
//           </h3>
//           <div className="space-y-4 sm:space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">
//                   Student
//                 </label>
//                 <Select
//                   value={selectedStudent ?? undefined}
//                   onValueChange={(v) => setSelectedStudent(v as Id<"users">)}
//                 >
//                   <SelectTrigger className="asch-input">
//                     <SelectValue placeholder="Select student" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {allStudents.map((s) => (
//                       <SelectItem key={s._id} value={s._id}>
//                         {s.name || s.email.split("@")[0]} ({s.instrument || "—"}
//                         )
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <label className="asch-label text-sm font-medium">
//                   Teacher
//                 </label>
//                 <Select
//                   value={selectedTeacher ?? undefined}
//                   onValueChange={(v) => setSelectedTeacher(v as Id<"users">)}
//                 >
//                   <SelectTrigger className="asch-input">
//                     <SelectValue placeholder="Select teacher" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {allTeachers.map((t) => (
//                       <SelectItem key={t._id} value={t._id}>
//                         {t.name || t.email.split("@")[0]} ({t.instrument || "—"}
//                         )
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <Button
//               onClick={handleSmartSchedule}
//               disabled={!selectedTeacher || !selectedStudent || isSubmitting}
//               className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-700 dark:hover:bg-purple-600"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Finding slots...
//                 </>
//               ) : (
//                 <>
//                   <Plus className="mr-2 h-4 w-4" />
//                   Auto-find slots &amp; schedule
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Calendar,
  CalendarOff,
  CalendarPlus,
  Plus,
  Sparkles,
  Zap,
  Loader2,
} from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import TeacherScheduleManager from "@/app/components/TeacherScheduleManager";
import { format } from "date-fns";
import { BlankDayButton } from "@/app/components/BlankDayButton";
import { WavyBackground } from "@/components/ui/wavy-background";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const ADMIN_SCH_STYLES = `
  .asch-page                    { background: #ffffff !important; }
  .dark .asch-page              { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  /* Cards */
  .asch-card                    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .asch-card              { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 24px rgba(139,92,246,0.1) !important; }

  .asch-card-title              { color: hsl(var(--foreground)) !important; }
  .dark .asch-card-title        { color: #ddd6fe !important; }

  .asch-card-sub                { color: hsl(var(--muted-foreground)) !important; }
  .dark .asch-card-sub          { color: #a78bfa !important; }

  /* Section panels inside cards (tool tiles) */
  .asch-panel                   { background: hsl(var(--muted)/0.4) !important; border-color: hsl(var(--border)) !important; }
  .dark .asch-panel             { background: rgba(76,29,149,0.15) !important; border-color: rgba(109,40,217,0.3) !important; }

  .asch-panel-title             { color: hsl(var(--foreground)) !important; }
  .asch-panel-sub               { color: hsl(var(--muted-foreground)) !important; }
  .dark .asch-panel-title       { color: #ede9fe !important; }
  .dark .asch-panel-sub         { color: #c4b5fd !important; }

  .asch-panel-light             { background: hsl(var(--muted)/0.2) !important; border-color: hsl(var(--border)) !important; }
  .dark .asch-panel-light       { background: rgba(46,16,101,0.2) !important; border-color: rgba(109,40,217,0.2) !important; }

  .asch-panel-light-title       { color: hsl(var(--foreground)) !important; }
  .dark .asch-panel-light-title { color: #ddd6fe !important; }

  /* Labels */
  .asch-label                   { color: hsl(var(--foreground)) !important; }
  .dark .asch-label             { color: #c4b5fd !important; }

  /* Inputs & selects */
  .asch-input                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .asch-input:focus             { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .dark .asch-input             { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
`;

type Tool = "company" | "student" | "blank" | "lesson" | null;

const TOOLS: {
  id: Exclude<Tool, null>;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
}[] = [
  {
    id: "company",
    title: "Auto-Schedule Company",
    description: "Schedule lessons for ALL students from their packages",
    icon: Sparkles,
  },
  {
    id: "student",
    title: "Smart Schedule Student",
    description: "Find slots for a single student & teacher",
    icon: Zap,
  },
  {
    id: "lesson",
    title: "Add New Lesson",
    description: "Manually add one lesson",
    icon: CalendarPlus,
  },
  {
    id: "blank",
    title: "Blank Out a Day",
    description: "Cancel all lessons on a date (e.g. public holiday)",
    icon: CalendarOff,
    danger: true,
  },
];

export default function AdminSchedulesPage() {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const close = () => setActiveTool(null);
  const handleOpenChange = (tool: Exclude<Tool, null>) => (open: boolean) =>
    setActiveTool(open ? tool : null);

  return (
    <div className="asch-page min-h-screen relative">
      <style>{ADMIN_SCH_STYLES}</style>
      <WavyBackground
        colors={["#7c3aed", "#6d28d9", "#22054e", "#c4b5fd", "#8b5cf6"]}
        backgroundFill="transparent"
        blur={4}
        speed="slow"
        waveOpacity={0.06}
        waveWidth={60}
        waveYOffset={350}
        containerClassName="fixed inset-0 pointer-events-none"
        className="hidden"
      />
      <div className="relative z-10 space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* ── Scheduling tools: each opens a modal ── */}
        <div className="asch-card rounded-xl border-2 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="asch-card-title flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold font-serif">
              <Calendar className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
              Scheduling Tools
            </h2>
            <p className="asch-card-sub text-sm sm:text-base mt-1">
              Pick a tool to open it
            </p>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {TOOLS.map(({ id, title, description, icon: Icon, danger }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTool(id)}
                className={`${
                  danger ? "asch-panel-light" : "asch-panel"
                } text-left p-4 rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      danger ? "text-red-500" : "text-primary"
                    }`}
                  />
                  <span className="asch-panel-title font-semibold">
                    {title}
                  </span>
                </div>
                <p className="asch-panel-sub text-sm">{description}</p>
              </button>
            ))}
          </div>
        </div>

        <TeacherScheduleManager />
      </div>

      {/* ── Modals ── */}
      <AutoScheduleCompanyDialog
        open={activeTool === "company"}
        onOpenChange={handleOpenChange("company")}
        onDone={close}
      />
      <SmartScheduleStudentDialog
        open={activeTool === "student"}
        onOpenChange={handleOpenChange("student")}
        onDone={close}
      />
      <AddLessonDialog
        open={activeTool === "lesson"}
        onOpenChange={handleOpenChange("lesson")}
        onDone={close}
      />
      <Dialog
        open={activeTool === "blank"}
        onOpenChange={handleOpenChange("blank")}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Blank Out a Day</DialogTitle>
            <DialogDescription>
              Cancel all lessons on a specific date.
            </DialogDescription>
          </DialogHeader>
          <BlankDayButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

/* ── Shared start date / weeks ahead fields ── */
function ScheduleRangeFields({
  startDate,
  setStartDate,
  weeksAhead,
  setWeeksAhead,
}: {
  startDate: string;
  setStartDate: (v: string) => void;
  weeksAhead: number;
  setWeeksAhead: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="space-y-2">
        <label className="asch-label text-sm font-medium">Start Date</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="asch-input"
        />
      </div>
      <div className="space-y-2">
        <label className="asch-label text-sm font-medium">Weeks Ahead</label>
        <Input
          type="number"
          value={weeksAhead}
          onChange={(e) => setWeeksAhead(parseInt(e.target.value) || 4)}
          min={1}
          max={12}
          className="asch-input"
        />
      </div>
    </div>
  );
}

/* ── Auto-Schedule Entire Company ── */
function AutoScheduleCompanyDialog({
  open,
  onOpenChange,
  onDone,
}: ToolDialogProps) {
  const [weeksAhead, setWeeksAhead] = useState(4);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allStudents = useQuery(api.users.getAllStudents) ?? [];
  const autoScheduleCompany = useMutation(
    api.schedules.autoScheduleEntireCompany,
  );

  const handleAutoScheduleCompany = async () => {
    if (!confirm("⚠️ This will schedule lessons for ALL students. Continue?"))
      return;
    setIsSubmitting(true);
    try {
      const result = await autoScheduleCompany({ startDate, weeksAhead });
      toast.success(
        `🎉 Company-wide scheduling complete!\n${result.totalCreated} lessons created\n${result.studentsProcessed} students processed`,
      );
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="asch-card-title flex items-center gap-2 text-xl font-bold font-serif">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            Auto-Schedule Entire Company
          </DialogTitle>
          <DialogDescription>
            Assign lessons for ALL students based on their packages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ScheduleRangeFields
            startDate={startDate}
            setStartDate={setStartDate}
            weeksAhead={weeksAhead}
            setWeeksAhead={setWeeksAhead}
          />
          <Button
            onClick={handleAutoScheduleCompany}
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-700 dark:hover:bg-purple-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Schedule All ({allStudents.length} students)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Manual Smart Schedule (Single Student) ── */
function SmartScheduleStudentDialog({
  open,
  onOpenChange,
  onDone,
}: ToolDialogProps) {
  const [selectedStudent, setSelectedStudent] = useState<Id<"users"> | null>(
    null,
  );
  const [selectedTeacher, setSelectedTeacher] = useState<Id<"users"> | null>(
    null,
  );
  const [weeksAhead, setWeeksAhead] = useState(4);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allStudents = useQuery(api.users.getAllStudents) ?? [];
  const allTeachers = useQuery(api.users.getAllTeachers) ?? [];
  const smartBulkSchedule = useMutation(api.schedules.smartBulkSchedule);

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
        `✅ Created ${result.created} lessons! ${result.skipped > 0 ? `(${result.skipped} skipped)` : ""}`,
      );
      setSelectedStudent(null);
      setSelectedTeacher(null);
      onDone();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to schedule";
      const cleanMsg = msg.includes("no active package")
        ? "⚠️ No active package — purchase or credit a package first."
        : msg.includes("Teacher timezone")
          ? "⚠️ Teacher has no timezone set. Ask them to update profile."
          : "Failed to schedule. Please try again.";
      toast.error(cleanMsg, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="asch-card-title flex items-center gap-2 text-xl font-bold font-serif">
            <Zap className="h-5 w-5 text-primary shrink-0" />
            Manual Smart Schedule (Single Student)
          </DialogTitle>
          <DialogDescription>
            Automatically find available slots based on the student&apos;s
            package
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ScheduleRangeFields
            startDate={startDate}
            setStartDate={setStartDate}
            weeksAhead={weeksAhead}
            setWeeksAhead={setWeeksAhead}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">Student</label>
              <Select
                value={selectedStudent ?? undefined}
                onValueChange={(v) => setSelectedStudent(v as Id<"users">)}
              >
                <SelectTrigger className="asch-input">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {allStudents.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name || s.email.split("@")[0]} ({s.instrument || "—"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">Teacher</label>
              <Select
                value={selectedTeacher ?? undefined}
                onValueChange={(v) => setSelectedTeacher(v as Id<"users">)}
              >
                <SelectTrigger className="asch-input">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {allTeachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name || t.email.split("@")[0]} ({t.instrument || "—"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSmartSchedule}
            disabled={!selectedTeacher || !selectedStudent || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-700 dark:hover:bg-purple-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding slots...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Auto-find slots &amp; schedule
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Add New Lesson (manual) ── */
function AddLessonDialog({ open, onOpenChange, onDone }: ToolDialogProps) {
  const teachers = useQuery(api.users.getAllTeachers) || [];
  const students = useQuery(api.users.getAllStudents) || [];
  const books = useQuery(api.books.getAll) || [];

  const addLesson = useMutation(api.schedules.addLesson);
  const autoAssignTeacher = useMutation(api.users.autoAssignTeacher);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [bookId, setBookId] = useState("");
  const [zoomLink, setZoomLink] = useState("");

  const handleAddLesson = async () => {
    if (!selectedTeacher || !selectedStudent || !date || !time) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await addLesson({
        teacherId: selectedTeacher as Id<"users">,
        date,
        lesson: {
          studentId: selectedStudent as Id<"users">,
          time,
          duration,
          bookId: bookId ? (bookId as Id<"books">) : undefined,
          zoomLink: zoomLink || undefined,
          notes: "",
          completed: false,
          status: "no_answer_on_time" as const,
        },
      });
      await autoAssignTeacher({
        studentId: selectedStudent as Id<"users">,
        teacherId: selectedTeacher as Id<"users">,
      });
      toast.success("Lesson added & teacher assigned!");
      setSelectedTeacher("");
      setSelectedStudent("");
      setDate("");
      setTime("");
      setZoomLink("");
      setDuration(30);
      setBookId("");
      onDone();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add lesson",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="asch-card-title flex items-center gap-2 text-xl font-bold font-serif">
            <CalendarPlus className="h-5 w-5 text-primary shrink-0" />
            Add New Lesson
          </DialogTitle>
          <DialogDescription>
            Manually add a single lesson for a student
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">Teacher</label>
              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
              >
                <SelectTrigger className="asch-input">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name || t.email.split("@")[0]} (
                      {t.instrument || "No instrument"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">Student</label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger className="asch-input">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name || s.email.split("@")[0]} (
                      {s.instrument || "No instrument"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">
                Book (Optional)
              </label>
              <Select value={bookId} onValueChange={setBookId}>
                <SelectTrigger className="asch-input">
                  <SelectValue placeholder="No book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.title} ({b.instrument})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">
                Zoom Link (Optional)
              </label>
              <Input
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/..."
                className="asch-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="asch-input"
              />
            </div>
            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="asch-input"
              />
            </div>
            <div className="space-y-2">
              <label className="asch-label text-sm font-medium">
                Duration (min)
              </label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="asch-input"
              />
            </div>
          </div>

          <Button
            onClick={handleAddLesson}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Lesson
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
