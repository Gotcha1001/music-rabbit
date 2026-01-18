// "use client";
// import { useUserDetail } from "@/context/UserDetailContext";
// import { useQuery } from "convex/react";
// import { format } from "date-fns";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { Doc } from "../../../../../convex/_generated/dataModel";
// import { api } from "../../../../../convex/_generated/api";

// // Types
// type Schedule = Doc<"schedules">;
// type Lesson = Schedule["lessons"][number];
// type LessonWithDate = Lesson & { date: string };

// export default function TeacherStatsComponent() {
//   const { userDetail } = useUserDetail();
//   const teacherId = userDetail?._id;

//   const currentMonth = format(new Date(), "yyyy-MM");

//   const stats = useQuery(
//     api.stats.getTeacherStats,
//     teacherId ? { teacherId, month: currentMonth } : "skip",
//   );
//   const schedules = useQuery(
//     api.schedules.getByTeacher,
//     teacherId ? { teacherId } : "skip",
//   );
//   const earnings = useQuery(
//     api.payments.getDetailedEarnings,
//     teacherId ? { teacherId, month: currentMonth } : "skip",
//   );

//   if (!teacherId) return <div className="p-8 text-center">Please log in</div>;

//   if (!stats || !schedules || !earnings)
//     return <div className="p-8 text-center">Loading...</div>;

//   return (
//     <div className="space-y-8 p-6 max-w-6xl mx-auto">
//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>On-Time Rate</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Progress value={stats.onTimeRate} className="h-3" />
//             <p className="mt-2 text-sm">
//               {stats.onTimeRate}% ({stats.onTimeLessons}/{stats.startedLessons})
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Late Rate</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Progress value={stats.lateRate} className="h-3" />
//             <Badge variant="destructive" className="mt-2">
//               {stats.lateRate}% ({stats.lateLessons} late)
//             </Badge>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Completion Rate</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Progress value={stats.completionRate} className="h-3" />
//             <p className="mt-2 text-sm">
//               {stats.completionRate}% ({stats.totalLessons} total)
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Earnings Graph */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Earnings Breakdown</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={earnings}>
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="earnings" fill="#10b981" name="Earnings" />
//               <Bar dataKey="deduction" fill="#ef4444" name="Deductions" />
//             </BarChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       {/* Detailed Lessons Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Lessons</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Time</TableHead>
//                 <TableHead>Duration</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Lateness</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {schedules.flatMap((sched: Schedule) =>
//                 sched.lessons.map((lesson: Lesson) => {
//                   const lessonWithDate: LessonWithDate = {
//                     ...lesson,
//                     date: sched.date,
//                   };
//                   return (
//                     <TableRow key={lesson.lessonId}>
//                       <TableCell>{sched.date}</TableCell>
//                       <TableCell>{lesson.time}</TableCell>
//                       <TableCell>{lesson.duration} min</TableCell>
//                       <TableCell>{lesson.status}</TableCell>
//                       <TableCell>
//                         <LessonLateness lesson={lessonWithDate} />
//                       </TableCell>
//                     </TableRow>
//                   );
//                 }),
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // ──────────────────────────────────────────────────────────────
// // Fixed Lateness Badge - uses startedAt instead of actualStartTime
// // ──────────────────────────────────────────────────────────────
// function LessonLateness({ lesson }: { lesson: LessonWithDate }) {
//   if (!lesson.startedAt) return <Badge variant="secondary">Not Started</Badge>;

//   const scheduled = new Date(`${lesson.date}T${lesson.time}:00`).getTime();
//   const started = lesson.startedAt;
//   const delayMinutes = (started - scheduled) / (60 * 1000);

//   return (
//     <Badge variant={delayMinutes > 1 ? "destructive" : "default"}>
//       {delayMinutes > 1 ? `Late by ${Math.round(delayMinutes)} min` : "On Time"}
//     </Badge>
//   );
// }
"use client";
import { useUserDetail } from "@/context/UserDetailContext";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { Star } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";

// Types
type Schedule = Doc<"schedules">;
type Lesson = Schedule["lessons"][number];
type LessonWithDate = Lesson & { date: string };

export default function TeacherStatsComponent() {
  const { userDetail } = useUserDetail();
  const teacherId = userDetail?._id;

  const currentMonth = format(new Date(), "yyyy-MM");

  const stats = useQuery(
    api.stats.getTeacherStats,
    teacherId ? { teacherId, month: currentMonth } : "skip",
  );
  const schedules = useQuery(
    api.schedules.getByTeacher,
    teacherId ? { teacherId } : "skip",
  );
  const ratingStats = useQuery(
    api.lessonRatings.getTeacherStats,
    teacherId ? { teacherId } : "skip",
  );
  const earnings = useQuery(
    api.payments.getDetailedEarnings,
    teacherId ? { teacherId, month: currentMonth } : "skip",
  );

  if (!teacherId) return <div className="p-8 text-center">Please log in</div>;

  if (!stats || !schedules || !earnings || !ratingStats)
    return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>On-Time Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.onTimeRate} className="h-3" />
            <p className="mt-2 text-sm">
              {stats.onTimeRate}% ({stats.onTimeLessons}/{stats.startedLessons})
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Late Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.lateRate} className="h-3" />
            <Badge variant="destructive" className="mt-2">
              {stats.lateRate}% ({stats.lateLessons} late)
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.completionRate} className="h-3" />
            <p className="mt-2 text-sm">
              {stats.completionRate}% ({stats.totalLessons} total)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-4xl font-bold text-yellow-400 flex items-center gap-2">
              <Star className="h-8 w-8" fill="currentColor" />
              {ratingStats.average.toFixed(1)} / 5
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on {ratingStats.count} ratings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earnings}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earnings" fill="#10b981" name="Earnings" />
              <Bar dataKey="deduction" fill="#ef4444" name="Deductions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Lessons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lateness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.flatMap((sched: Schedule) =>
                sched.lessons.map((lesson: Lesson) => {
                  const lessonWithDate: LessonWithDate = {
                    ...lesson,
                    date: sched.date,
                  };
                  return (
                    <TableRow key={lesson.lessonId}>
                      <TableCell>{sched.date}</TableCell>
                      <TableCell>{lesson.time}</TableCell>
                      <TableCell>{lesson.duration} min</TableCell>
                      <TableCell>{lesson.status}</TableCell>
                      <TableCell>
                        <LessonLateness lesson={lessonWithDate} />
                      </TableCell>
                    </TableRow>
                  );
                }),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Fixed Lateness Badge - uses startedAt instead of actualStartTime
// ──────────────────────────────────────────────────────────────
function LessonLateness({ lesson }: { lesson: LessonWithDate }) {
  if (!lesson.startedAt) return <Badge variant="secondary">Not Started</Badge>;

  const scheduled = new Date(`${lesson.date}T${lesson.time}:00`).getTime();
  const started = lesson.startedAt;
  const delayMinutes = (started - scheduled) / (60 * 1000);

  return (
    <Badge variant={delayMinutes > 1 ? "destructive" : "default"}>
      {delayMinutes > 1 ? `Late by ${Math.round(delayMinutes)} min` : "On Time"}
    </Badge>
  );
}
