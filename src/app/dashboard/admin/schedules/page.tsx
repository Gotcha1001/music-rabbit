// // app/dashboard/admin/schedules/page.tsx
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
// import { Calendar, Plus } from "lucide-react";
// import { Id } from "../../../../../convex/_generated/dataModel";
// import TeacherScheduleManager from "@/app/components/TeacherScheduleManager";

// export default function AdminSchedulesPage() {
//   const teachers = useQuery(api.users.getAllTeachers) || [];
//   const students = useQuery(api.users.getAllStudents) || [];
//   const books = useQuery(api.books.getAll) || [];

//   const addLesson = useMutation(api.schedules.addLesson);
//   const autoAssignTeacher = useMutation(api.users.autoAssignTeacher);

//   const [selectedTeacher, setSelectedTeacher] = useState<string>("");
//   const [selectedStudent, setSelectedStudent] = useState<string>("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [duration, setDuration] = useState(30);
//   const [bookId, setBookId] = useState<string>("");
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
//       toast.error("Failed to add lesson");
//       console.error(error);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <Card className="bg-card border-2 border-border shadow-lg">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3 text-2xl font-serif">
//             <Calendar className="h-7 w-7 text-primary" />
//             Add New Lesson
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label>Teacher</Label>
//               <Select
//                 value={selectedTeacher}
//                 onValueChange={setSelectedTeacher}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select teacher" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {teachers.map((t) => (
//                     <SelectItem key={t._id} value={t._id}>
//                       {t.name || t.email.split("@")[0]} (
//                       {t.instrument || "No instrument"})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label>Student</Label>
//               <Select
//                 value={selectedStudent}
//                 onValueChange={setSelectedStudent}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select student" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {students.map((s) => (
//                     <SelectItem key={s._id} value={s._id}>
//                       {s.name || s.email.split("@")[0]} (
//                       {s.instrument || "No instrument"})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label>Book (Optional)</Label>
//               <Select value={bookId} onValueChange={setBookId}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="No book" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {books.map((b) => (
//                     <SelectItem key={b._id} value={b._id}>
//                       {b.title} ({b.instrument})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label>Zoom Link (Optional)</Label>
//               <Input
//                 value={zoomLink}
//                 onChange={(e) => setZoomLink(e.target.value)}
//                 placeholder="https://zoom.us/..."
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <Label>Date</Label>
//               <Input
//                 type="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>Time</Label>
//               <Input
//                 type="time"
//                 value={time}
//                 onChange={(e) => setTime(e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>Duration (min)</Label>
//               <Input
//                 type="number"
//                 value={duration}
//                 onChange={(e) => setDuration(Number(e.target.value))}
//               />
//             </div>
//           </div>

//           <Button
//             onClick={handleAddLesson}
//             className="bg-primary text-primary-foreground"
//           >
//             <Plus className="mr-2 h-4 w-4" /> Add Lesson
//           </Button>
//         </CardContent>
//       </Card>

//       <TeacherScheduleManager />
//     </div>
//   );
// }

// app/dashboard/admin/schedules/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Plus, Sparkles, Zap, Loader2 } from "lucide-react"; // ← ADDED: Sparkles, Zap, Loader2
import { Id } from "../../../../../convex/_generated/dataModel";
import TeacherScheduleManager from "@/app/components/TeacherScheduleManager";
import { format } from "date-fns"; // ← ADDED: Import format from date-fns
import { BlankDayButton } from "@/app/components/BlankDayButton";

export default function AdminSchedulesPage() {
  const teachers = useQuery(api.users.getAllTeachers) || [];
  const students = useQuery(api.users.getAllStudents) || [];
  const books = useQuery(api.books.getAll) || [];

  const addLesson = useMutation(api.schedules.addLesson);
  const autoAssignTeacher = useMutation(api.users.autoAssignTeacher);

  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [bookId, setBookId] = useState<string>("");
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
    } catch (error) {
      toast.error("Failed to add lesson");
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      {/* ← ADDED: BulkSchedulingSection */}
      <BulkSchedulingSection />

      <BlankDayButton />

      <Card className="bg-card border-2 border-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-serif">
            <Calendar className="h-7 w-7 text-primary" />
            Add New Lesson
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Teacher</Label>
              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
              >
                <SelectTrigger>
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

            <div>
              <Label>Student</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
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

            <div>
              <Label>Book (Optional)</Label>
              <Select value={bookId} onValueChange={setBookId}>
                <SelectTrigger>
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

            <div>
              <Label>Zoom Link (Optional)</Label>
              <Input
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            onClick={handleAddLesson}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Lesson
          </Button>
        </CardContent>
      </Card>

      <TeacherScheduleManager />
    </div>
  );
}

// ← ADDED: BulkSchedulingSection from previous code
function BulkSchedulingSection() {
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
  const allStudents = useQuery(api.users.getAllStudents) ?? [];
  const allTeachers = useQuery(api.users.getAllTeachers) ?? [];
  const smartBulkSchedule = useMutation(api.schedules.smartBulkSchedule);
  const autoScheduleCompany = useMutation(
    api.schedules.autoScheduleEntireCompany,
  );
  // Manual smart schedule (1 student, auto-find slots)
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
        `✅ Created ${result.created} lessons! ${
          result.skipped > 0 ? `(${result.skipped} skipped)` : ""
        }`,
      );
      setSelectedStudent(null);
      setSelectedTeacher(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to schedule";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Auto-schedule entire company
  const handleAutoScheduleCompany = async () => {
    if (!confirm("⚠️ This will schedule lessons for ALL students. Continue?")) {
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await autoScheduleCompany({
        startDate,
        weeksAhead,
      });
      toast.success(
        `🎉 Company-wide scheduling complete!\n✅ ${result.totalCreated} lessons created\n📊 ${result.studentsProcessed} students processed`,
      );
      // Show detailed results
      console.log("Scheduling Results:", result.results);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to schedule";
      toast.error(errorMessage);
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
          Automatically find available slots based on packages
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Settings */}
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
        {/* Company-Wide Auto-Schedule */}
        <div className="p-6 bg-gradient-to-br from-emerald-900/30 to-green-900/20 rounded-lg border-2 border-emerald-700/50">
          <h3 className="text-xl font-bold text-emerald-200 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            🚀 Auto-Schedule Entire Company
          </h3>
          <p className="text-emerald-300/80 text-sm mb-4">
            Automatically assign lessons for ALL students based on their
            packages. System will find available slots for each teacher.
          </p>
          <Button
            onClick={handleAutoScheduleCompany}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scheduling Company-Wide...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Schedule Entire Company ({allStudents.length} Students)
              </>
            )}
          </Button>
        </div>
        {/* Manual Smart Schedule (Single Student) */}
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
                  Finding Slots...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Auto-Find Slots & Schedule
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
