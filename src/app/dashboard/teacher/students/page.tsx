// "use client";

// import { useUserDetail } from "@/context/UserDetailContext";
// import { useQuery } from "convex/react";
// import { api } from "../../../../../convex/_generated/api";
// import { Id } from "../../../../../convex/_generated/dataModel";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import AttendanceHistoryCompact from "@/app/components/AttendanceHistoryCompact";
// import { useUser } from "@clerk/nextjs";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { StudentInfoSection } from "@/app/components/StudentInfoSection"; // ← NEW: Import StudentInfoSection

// export default function TeacherStudents() {
//   const { userDetail } = useUserDetail();
//   const { user } = useUser();

//   // 1. Get teacher's schedule
//   const schedules = useQuery(
//     api.schedules.getByTeacherWithTimezones,
//     userDetail?.role === "teacher"
//       ? { teacherId: userDetail._id as Id<"users"> }
//       : "skip",
//   );

//   // 2. Get ALL students (this function exists!)
//   const allStudents = useQuery(api.users.getAllStudents);

//   // 3. Find only MY students (who appear in my schedule)
//   const myStudents = allStudents?.filter((student) =>
//     schedules?.some((schedule) =>
//       schedule.lessons.some((lesson) => lesson.studentId === student._id),
//     ),
//   );

//   // Loading & auth
//   if (!userDetail) {
//     return (
//       <div className="flex min-h-screen items-center justify-center text-muted-foreground">
//         Loading profile...
//       </div>
//     );
//   }

//   if (userDetail.role !== "teacher") {
//     return (
//       <div className="flex min-h-screen items-center justify-center text-destructive">
//         Unauthorized – Teachers Only
//       </div>
//     );
//   }

//   if (schedules === undefined || allStudents === undefined) {
//     return (
//       <div className="container mx-auto p-6 space-y-6">
//         <Skeleton className="h-10 w-64" />
//         <Skeleton className="h-96 w-full rounded-xl" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 max-w-6xl">
//       <h1 className="text-3xl font-bold mb-8">My Students</h1>

//       {!myStudents || myStudents.length === 0 ? (
//         <Card>
//           <CardContent className="py-16 text-center text-muted-foreground text-lg">
//             No students assigned yet.
//           </CardContent>
//         </Card>
//       ) : (
//         <Card>
//           <CardHeader>
//             <CardTitle>My Active Students ({myStudents.length})</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Accordion type="multiple" className="w-full">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Instrument</TableHead>
//                     <TableHead>Timezone</TableHead>
//                     <TableHead>Total Lessons</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {myStudents.map((student) => {
//                     const lessonCount = schedules.reduce(
//                       (acc, sched) =>
//                         acc +
//                         sched.lessons.filter((l) => l.studentId === student._id)
//                           .length,
//                       0,
//                     );

//                     return (
//                       <AccordionItem value={student._id} key={student._id}>
//                         <AccordionTrigger asChild>
//                           <TableRow className="hover:bg-muted/50 cursor-pointer">
//                             <TableCell className="font-medium">
//                               {student.name || "Unnamed Student"}
//                             </TableCell>
//                             <TableCell>{student.instrument || "—"}</TableCell>
//                             <TableCell>
//                               {student.timezone || "Not set"}
//                             </TableCell>
//                             <TableCell>{lessonCount}</TableCell>
//                           </TableRow>
//                         </AccordionTrigger>
//                         <AccordionContent>
//                           <div className="p-4 border-t space-y-6">
//                             {" "}
//                             {/* ← UPDATED: Added space-y-6 for separation */}
//                             <StudentInfoSection studentId={student._id} />{" "}
//                             {/* ← NEW: Add StudentInfoSection here */}
//                             <AttendanceHistoryCompact
//                               studentId={student._id}
//                               itemsPerPage={10}
//                             />
//                           </div>
//                         </AccordionContent>
//                       </AccordionItem>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </Accordion>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AttendanceHistoryCompact from "@/app/components/AttendanceHistoryCompact";
import { useUser } from "@clerk/nextjs";
import { StudentInfoSection } from "@/app/components/StudentInfoSection"; // ← NEW: Import StudentInfoSection
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import React from "react";

export default function TeacherStudents() {
  const { userDetail } = useUserDetail();
  const { user } = useUser();

  // 1. Get teacher's schedule
  const schedules = useQuery(
    api.schedules.getByTeacherWithTimezones,
    userDetail?.role === "teacher"
      ? { teacherId: userDetail._id as Id<"users"> }
      : "skip",
  );

  // 2. Get ALL students (this function exists!)
  const allStudents = useQuery(api.users.getAllStudents);

  // 3. Find only MY students (who appear in my schedule)
  const myStudents = allStudents?.filter((student) =>
    schedules?.some((schedule) =>
      schedule.lessons.some((lesson) => lesson.studentId === student._id),
    ),
  );

  const [openItems, setOpenItems] = useState(new Set<string>());

  const toggleOpen = (id: string) => {
    const newSet = new Set(openItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setOpenItems(newSet);
  };

  // Loading & auth
  if (!userDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive">
        Unauthorized – Teachers Only
      </div>
    );
  }

  if (schedules === undefined || allStudents === undefined) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">My Students</h1>

      {!myStudents || myStudents.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground text-lg">
            No students assigned yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>My Active Students ({myStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Total Lessons</TableHead>
                  <TableHead className="w-[20px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myStudents.map((student) => {
                  const lessonCount = schedules.reduce(
                    (acc, sched) =>
                      acc +
                      sched.lessons.filter((l) => l.studentId === student._id)
                        .length,
                    0,
                  );
                  const isOpen = openItems.has(student._id);

                  return (
                    <React.Fragment key={student._id}>
                      <TableRow
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleOpen(student._id)}
                      >
                        <TableCell className="font-medium">
                          {student.name || "Unnamed Student"}
                        </TableCell>
                        <TableCell>{student.instrument || "—"}</TableCell>
                        <TableCell>{student.timezone || "Not set"}</TableCell>
                        <TableCell>{lessonCount}</TableCell>
                        <TableCell>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="p-4 space-y-6">
                              <StudentInfoSection studentId={student._id} />
                              <AttendanceHistoryCompact
                                studentId={student._id}
                                itemsPerPage={10}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
