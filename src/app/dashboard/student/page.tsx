// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { Id, Doc } from "../../../../convex/_generated/dataModel";
// import { api } from "../../../../convex/_generated/api";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, Video, User } from "lucide-react";

// type LessonRow = {
//   scheduleId: Id<"schedules">;
//   date: string;
//   time: string;
//   duration: number;
//   teacherId: Id<"users">;
//   bookId?: Id<"books">;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
// };

// export default function StudentDashboard() {
//   const router = useRouter();
//   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

//   const currentUser = useQuery(api.users.get);

//   // Redirect if no instrument selected yet
//   useEffect(() => {
//     if (currentUser && !currentUser.instrument) {
//       router.replace("/onboarding/student");
//     }
//   }, [currentUser, router]);

//   // Always call hooks unconditionally – only the args become "skip"
//   const lessons =
//     useQuery(
//       api.schedules.getByStudent,
//       currentUser ? { studentId: currentUser._id } : "skip"
//     ) ?? [];

//   const teachers =
//     useQuery(
//       api.users.getTeachersByInstrument,
//       currentUser?.instrument ? { instrument: currentUser.instrument } : "skip"
//     ) ?? [];

//   const setMyTeacher = useMutation(api.users.setMyTeacher);

//   const handleSetTeacher = async (teacherId?: Id<"users">) => {
//     await setMyTeacher(teacherId ? { teacherId } : {});
//   };

//   const [now, setNow] = useState<number>(() => Date.now());

//   if (!clerkLoaded || currentUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (!currentUser || currentUser.role !== "student") {
//     return (
//       <div className="p-8 text-center text-red-600">
//         Access denied – students only
//       </div>
//     );
//   }

//   const upcomingLessons = lessons.filter(
//     (l: LessonRow) =>
//       new Date(`${l.date}T${l.time}:00`).getTime() >= now - 5 * 60 * 1000
//   );

//   const pastLessons = lessons.filter(
//     (l: LessonRow) => new Date(`${l.date}T${l.time}:00`).getTime() < now
//   );

//   return (
//     <div className="container mx-auto p-6 max-w-7xl">
//       <h1 className="text-4xl font-bold mb-8">
//         Welcome back, {clerkUser?.firstName || "Student"}! 🎵
//       </h1>

//       {/* Profile */}
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3">
//             <User className="h-6 w-6" />
//             My Profile
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <strong>Learning:</strong> {currentUser.instrument}
//           </div>
//           <div>
//             <strong>Preferred teacher:</strong>{" "}
//             {currentUser.currentTeacher ? (
//               <TeacherName id={currentUser.currentTeacher} />
//             ) : (
//               <span className="text-muted-foreground">
//                 None – HR will assign you automatically
//               </span>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Upcoming */}
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Video className="h-6 w-6" />
//             Upcoming Lessons
//           </CardTitle>
//           {upcomingLessons.length === 0 && (
//             <CardDescription>No lessons scheduled yet.</CardDescription>
//           )}
//         </CardHeader>
//         <CardContent>
//           <LessonsTable lessons={upcomingLessons} now={now} />
//         </CardContent>
//       </Card>

//       {/* Past */}
//       {pastLessons.length > 0 && (
//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle>Past Lessons</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <LessonsTable lessons={pastLessons} now={now} />
//           </CardContent>
//         </Card>
//       )}

//       {/* Teacher selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Choose / Change Preferred Teacher</CardTitle>
//           <CardDescription>
//             Pick any teacher who teaches {currentUser.instrument}.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {teachers.map((teacher: Doc<"users">) => (
//             <Card key={teacher._id} className="p-4">
//               <div className="font-medium">{teacher.email}</div>
//               {currentUser.currentTeacher === teacher._id && (
//                 <Badge className="mt-2">Current teacher</Badge>
//               )}
//               <div className="mt-4 flex gap-2">
//                 <Button
//                   size="sm"
//                   className="flex-1"
//                   variant={
//                     currentUser.currentTeacher === teacher._id
//                       ? "secondary"
//                       : "default"
//                   }
//                   onClick={() => handleSetTeacher(teacher._id)}
//                   disabled={currentUser.currentTeacher === teacher._id}
//                 >
//                   {currentUser.currentTeacher === teacher._id
//                     ? "Selected"
//                     : "Choose"}
//                 </Button>
//                 {currentUser.currentTeacher === teacher._id && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleSetTeacher()}
//                   >
//                     Clear
//                   </Button>
//                 )}
//               </div>
//             </Card>
//           ))}
//           {teachers.length === 0 && (
//             <p className="col-span-full text-center text-muted-foreground">
//               No teachers available for {currentUser.instrument} yet.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------
// // Reusable components – hooks are never conditional
// // ---------------------------------------------------------------------

// function TeacherName({ id }: { id: Id<"users"> }) {
//   const teacher = useQuery(api.users.getById, { id });
//   return <span>{teacher?.email ?? "Loading…"}</span>;
// }

// function BookTitle({ id }: { id?: Id<"books"> }) {
//   const book = useQuery(api.books.getById, id ? { id } : "skip");
//   if (!id) return <span>—</span>;
//   return <span>{book?.title ?? "Loading…"}</span>;
// }

// function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Date</TableHead>
//           <TableHead>Time</TableHead>
//           <TableHead>Duration</TableHead>
//           <TableHead>Teacher</TableHead>
//           <TableHead>Book</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Notes / Homework</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {lessons.map((l) => {
//           const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
//           const isActive = Math.abs(startMs - now) < 30 * 60 * 1000;

//           return (
//             <TableRow key={`${l.scheduleId}-${l.time}`}>
//               <TableCell>{format(startMs, "PPP")}</TableCell>
//               <TableCell>{l.time}</TableCell>
//               <TableCell>{l.duration} min</TableCell>
//               <TableCell>
//                 <TeacherName id={l.teacherId} />
//               </TableCell>
//               <TableCell>
//                 <BookTitle id={l.bookId} />
//               </TableCell>
//               <TableCell>
//                 {l.completed ? (
//                   <Badge variant="secondary">Completed</Badge>
//                 ) : (
//                   <Badge variant={isActive ? "default" : "outline"}>
//                     Scheduled
//                   </Badge>
//                 )}
//               </TableCell>
//               <TableCell>
//                 {l.zoomLink && (isActive || startMs > now) && (
//                   <Button size="sm" asChild>
//                     <a
//                       href={l.zoomLink}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       Join Lesson
//                     </a>
//                   </Button>
//                 )}
//               </TableCell>
//             </TableRow>
//           );
//         })}
//       </TableBody>
//     </Table>
//   );
// }
// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { Id, Doc } from "../../../../convex/_generated/dataModel";
// import { api } from "../../../../convex/_generated/api";
// import Link from "next/link";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, Video, User } from "lucide-react";

// type LessonRow = {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   date: string;
//   time: string;
//   duration: number;
//   teacherId: Id<"users">;
//   bookId?: Id<"books">;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
// };

// export default function StudentDashboard() {
//   const router = useRouter();
//   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

//   const currentUser = useQuery(api.users.get);

//   // Redirect if no instrument selected yet
//   useEffect(() => {
//     if (currentUser && !currentUser.instrument) {
//       router.replace("/onboarding/student");
//     }
//   }, [currentUser, router]);

//   // Always call hooks unconditionally – only the args become "skip"
//   const lessons =
//     useQuery(
//       api.schedules.getByStudent,
//       currentUser ? { studentId: currentUser._id } : "skip"
//     ) ?? [];

//   const teachers =
//     useQuery(
//       api.users.getTeachersByInstrument,
//       currentUser?.instrument ? { instrument: currentUser.instrument } : "skip"
//     ) ?? [];

//   const setMyTeacher = useMutation(api.users.setMyTeacher);

//   const handleSetTeacher = async (teacherId?: Id<"users">) => {
//     await setMyTeacher(teacherId ? { teacherId } : {});
//   };

//   const [now, setNow] = useState<number>(() => Date.now());

//   if (!clerkLoaded || currentUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (!currentUser || currentUser.role !== "student") {
//     return (
//       <div className="p-8 text-center text-red-600">
//         Access denied – students only
//       </div>
//     );
//   }

//   const upcomingLessons = lessons.filter(
//     (l: LessonRow) =>
//       new Date(`${l.date}T${l.time}:00`).getTime() >= now - 5 * 60 * 1000
//   );

//   const pastLessons = lessons.filter(
//     (l: LessonRow) => new Date(`${l.date}T${l.time}:00`).getTime() < now
//   );

//   return (
//     <div className="container mx-auto p-6 max-w-7xl">
//       <h1 className="text-4xl font-bold mb-8">
//         Welcome back, {clerkUser?.firstName || "Student"}! 🎵
//       </h1>

//       {/* Profile */}
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3">
//             <User className="h-6 w-6" />
//             My Profile
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <strong>Learning:</strong> {currentUser.instrument}
//           </div>
//           <div>
//             <strong>Preferred teacher:</strong>{" "}
//             {currentUser.currentTeacher ? (
//               <TeacherName id={currentUser.currentTeacher} />
//             ) : (
//               <span className="text-muted-foreground">
//                 None – HR will assign you automatically
//               </span>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Upcoming */}
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Video className="h-6 w-6" />
//             Upcoming Lessons
//           </CardTitle>
//           {upcomingLessons.length === 0 && (
//             <CardDescription>No lessons scheduled yet.</CardDescription>
//           )}
//         </CardHeader>
//         <CardContent>
//           <LessonsTable lessons={upcomingLessons} now={now} />
//         </CardContent>
//       </Card>

//       {/* Past */}
//       {pastLessons.length > 0 && (
//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle>Past Lessons</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <LessonsTable lessons={pastLessons} now={now} />
//           </CardContent>
//         </Card>
//       )}

//       {/* Teacher selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Choose / Change Preferred Teacher</CardTitle>
//           <CardDescription>
//             Pick any teacher who teaches {currentUser.instrument}.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {teachers.map((teacher: Doc<"users">) => (
//             <Card key={teacher._id} className="p-4">
//               <div className="font-medium">{teacher.email}</div>
//               {currentUser.currentTeacher === teacher._id && (
//                 <Badge className="mt-2">Current teacher</Badge>
//               )}
//               <div className="mt-4 flex gap-2">
//                 <Button
//                   size="sm"
//                   className="flex-1"
//                   variant={
//                     currentUser.currentTeacher === teacher._id
//                       ? "secondary"
//                       : "default"
//                   }
//                   onClick={() => handleSetTeacher(teacher._id)}
//                   disabled={currentUser.currentTeacher === teacher._id}
//                 >
//                   {currentUser.currentTeacher === teacher._id
//                     ? "Selected"
//                     : "Choose"}
//                 </Button>
//                 {currentUser.currentTeacher === teacher._id && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleSetTeacher()}
//                   >
//                     Clear
//                   </Button>
//                 )}
//               </div>
//             </Card>
//           ))}
//           {teachers.length === 0 && (
//             <p className="col-span-full text-center text-muted-foreground">
//               No teachers available for {currentUser.instrument} yet.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------
// // Reusable components – hooks are never conditional
// // ---------------------------------------------------------------------

// function TeacherName({ id }: { id: Id<"users"> }) {
//   const teacher = useQuery(api.users.getById, { id });
//   return <span>{teacher?.email ?? "Loading…"}</span>;
// }

// function BookTitle({ id }: { id?: Id<"books"> }) {
//   const book = useQuery(api.books.getById, id ? { id } : "skip");
//   if (!id) return <span>—</span>;
//   return <span>{book?.title ?? "Loading…"}</span>;
// }

// function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Date</TableHead>
//           <TableHead>Time</TableHead>
//           <TableHead>Duration</TableHead>
//           <TableHead>Teacher</TableHead>
//           <TableHead>Book</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {lessons.map((l) => {
//           const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
//           const isActive = Math.abs(startMs - now) < 30 * 60 * 1000;

//           return (
//             <TableRow key={`${l.scheduleId}-${l.lessonId}`}>
//               <TableCell>{format(startMs, "PPP")}</TableCell>
//               <TableCell>{l.time}</TableCell>
//               <TableCell>{l.duration} min</TableCell>
//               <TableCell>
//                 <TeacherName id={l.teacherId} />
//               </TableCell>
//               <TableCell>
//                 <BookTitle id={l.bookId} />
//               </TableCell>
//               <TableCell>
//                 {l.completed ? (
//                   <Badge variant="secondary">Completed</Badge>
//                 ) : (
//                   <Badge variant={isActive ? "default" : "outline"}>
//                     Scheduled
//                   </Badge>
//                 )}
//               </TableCell>
//               <TableCell>
//                 <Button variant="link" asChild>
//                   <Link
//                     href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
//                   >
//                     View Details & Join Zoom
//                   </Link>
//                 </Button>
//               </TableCell>
//             </TableRow>
//           );
//         })}
//       </TableBody>
//     </Table>
//   );
// }
// app/dashboard/student/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, User } from "lucide-react";
import LiveClock from "@/app/components/LiveClock";

type LessonRow = {
  scheduleId: Id<"schedules">;
  lessonId: string;
  date: string;
  time: string;
  duration: number;
  teacherId: Id<"users">;
  bookId?: Id<"books">;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
};

export default function StudentDashboard() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const currentUser = useQuery(api.users.get);

  // Redirect if no instrument selected yet
  useEffect(() => {
    if (currentUser && !currentUser.instrument) {
      router.replace("/onboarding/student");
    }
  }, [currentUser, router]);

  const lessons =
    useQuery(
      api.schedules.getByStudent,
      currentUser ? { studentId: currentUser._id } : "skip"
    ) ?? [];

  const teachers =
    useQuery(
      api.users.getTeachersByInstrument,
      currentUser?.instrument ? { instrument: currentUser.instrument } : "skip"
    ) ?? [];

  const setMyTeacher = useMutation(api.users.setMyTeacher);

  const handleSetTeacher = async (teacherId?: Id<"users">) => {
    await setMyTeacher(teacherId ? { teacherId } : {});
  };

  const [now, setNow] = useState<number>(() => Date.now());

  if (!clerkLoaded || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "student") {
    return (
      <div className="p-8 text-center text-red-600">
        Access denied -- students only
      </div>
    );
  }

  const upcomingLessons = lessons.filter(
    (l: LessonRow) =>
      new Date(`${l.date}T${l.time}:00`).getTime() >= now - 5 * 60 * 1000
  );

  const pastLessons = lessons.filter(
    (l: LessonRow) => new Date(`${l.date}T${l.time}:00`).getTime() < now
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Clock at the top */}
      <div className="mb-6">
        <LiveClock />
      </div>

      <h1 className="text-4xl font-bold mb-8">
        Welcome back, {clerkUser?.firstName || "Student"}! 🎵
      </h1>

      {/* Profile */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-6 w-6" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Learning:</strong> {currentUser.instrument}
          </div>
          <div>
            <strong>Preferred teacher:</strong>{" "}
            {currentUser.currentTeacher ? (
              <TeacherName id={currentUser.currentTeacher} />
            ) : (
              <span className="text-muted-foreground">
                None -- HR will assign you automatically
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Upcoming Lessons
          </CardTitle>
          {upcomingLessons.length === 0 && (
            <CardDescription>No lessons scheduled yet.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <LessonsTable lessons={upcomingLessons} now={now} />
        </CardContent>
      </Card>

      {/* Past */}
      {pastLessons.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Past Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <LessonsTable lessons={pastLessons} now={now} />
          </CardContent>
        </Card>
      )}

      {/* Teacher selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose / Change Preferred Teacher</CardTitle>
          <CardDescription>
            Pick any teacher who teaches {currentUser.instrument}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher: Doc<"users">) => (
            <Card key={teacher._id} className="p-4">
              <div className="font-medium">{teacher.email}</div>
              {currentUser.currentTeacher === teacher._id && (
                <Badge className="mt-2">Current teacher</Badge>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  variant={
                    currentUser.currentTeacher === teacher._id
                      ? "secondary"
                      : "default"
                  }
                  onClick={() => handleSetTeacher(teacher._id)}
                  disabled={currentUser.currentTeacher === teacher._id}
                >
                  {currentUser.currentTeacher === teacher._id
                    ? "Selected"
                    : "Choose"}
                </Button>
                {currentUser.currentTeacher === teacher._id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetTeacher()}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {teachers.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
              No teachers available for {currentUser.instrument} yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable components
function TeacherName({ id }: { id: Id<"users"> }) {
  const teacher = useQuery(api.users.getById, { id });
  return <span>{teacher?.email ?? "Loading..."}</span>;
}

function BookTitle({ id }: { id?: Id<"books"> }) {
  const book = useQuery(api.books.getById, id ? { id } : "skip");
  if (!id) return <span>---</span>;
  return <span>{book?.title ?? "Loading..."}</span>;
}

function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Book</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessons.map((l) => {
          const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
          const isActive = Math.abs(startMs - now) < 30 * 60 * 1000;

          return (
            <TableRow key={`${l.scheduleId}-${l.lessonId}`}>
              <TableCell>{format(startMs, "PPP")}</TableCell>
              <TableCell>{l.time}</TableCell>
              <TableCell>{l.duration} min</TableCell>
              <TableCell>
                <TeacherName id={l.teacherId} />
              </TableCell>
              <TableCell>
                <BookTitle id={l.bookId} />
              </TableCell>
              <TableCell>
                {l.completed ? (
                  <Badge variant="secondary">Completed</Badge>
                ) : (
                  <Badge variant={isActive ? "default" : "outline"}>
                    Scheduled
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Button variant="link" asChild>
                  <Link
                    href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
                  >
                    View Details & Join Zoom
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
