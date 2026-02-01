"use client";

import { useState } from "react";
import { useQuery } from "convex/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { format } from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

type LessonStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "teacher_late"
  | "missed_teacher"
  | "missed_student";

interface LessonData {
  _id: string;
  date: string;
  time: string;
  duration: number;
  instrument: string;
  teacherName: string;
  status: string;
  state: string;
  markedByName?: string;
  markedAt?: number;
  notes?: string;
}

const STATUS_LABELS: Record<LessonStatus, string> = {
  completed: "Attended ✓",
  teacher_late: "Teacher Late",
  missed_teacher: "Teacher Absent",
  missed_student: "Student Absent",
  cancelled: "Cancelled",
  scheduled: "Scheduled",
};

const STATUS_COLORS: Record<LessonStatus, string> = {
  completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
  teacher_late: "text-orange-600 bg-orange-50 border-orange-200",
  missed_teacher: "text-red-600 bg-red-50 border-red-200",
  missed_student: "text-amber-600 bg-amber-50 border-amber-200",
  cancelled: "text-gray-600 bg-gray-50 border-gray-200",
  scheduled: "text-blue-600 bg-blue-50 border-blue-200",
};

interface AttendanceHistoryCompactProps {
  studentId: Id<"users">;
  itemsPerPage?: number;
}

export default function AttendanceHistoryCompact({
  studentId,
  itemsPerPage = 10,
}: AttendanceHistoryCompactProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("attendance");

  // Fetch all lessons for the student
  const lessons = useQuery(api.attendanceQueries.getStudentLessons, {
    studentId,
  }) as LessonData[] | undefined;

  if (!lessons) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // Filter past lessons
  const pastLessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return lessonDate < today || lesson.status !== "scheduled";
  });

  // Sort by date descending
  const sortedLessons = [...pastLessons].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLessons = sortedLessons.slice(startIndex, endIndex);

  // Calculate makeup lessons needed (missed by student)
  const makeupNeeded = sortedLessons.filter(
    (l) => l.status === "missed_student",
  ).length;

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getStatusColor = (status: string): string => {
    return STATUS_COLORS[status as LessonStatus] || STATUS_COLORS.scheduled;
  };

  const getStatusLabel = (status: string): string => {
    return STATUS_LABELS[status as LessonStatus] || STATUS_LABELS.scheduled;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Attendance</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Your lesson attendance history</CardDescription>
          </div>
          {makeupNeeded > 0 && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                number of makeup needed:
              </div>
              <div className="text-2xl font-bold text-red-600">
                {makeupNeeded}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="marking">Marking History</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            {currentLessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance history yet
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Date & Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentLessons.map((lesson, index) => {
                        const globalIndex = startIndex + index + 1;
                        const lessonDate = new Date(lesson.date);
                        const dateStr = format(lessonDate, "yyyy-MM-dd EEE");
                        const timeRange = `${lesson.time} ~ ${calculateEndTime(
                          lesson.time,
                          lesson.duration,
                        )}`;

                        return (
                          <TableRow key={lesson._id}>
                            <TableCell className="font-medium">
                              {globalIndex}
                            </TableCell>
                            <TableCell>{dateStr}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {timeRange}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getStatusColor(lesson.status)}
                              >
                                {getStatusLabel(lesson.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                S
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        ),
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Marking History Tab */}
          <TabsContent value="marking" className="space-y-4">
            {currentLessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No marking history yet
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Date & Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marked By</TableHead>
                        <TableHead>Marked At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentLessons.map((lesson, index) => {
                        const globalIndex = startIndex + index + 1;
                        const lessonDate = new Date(lesson.date);
                        const dateStr = format(lessonDate, "yyyy-MM-dd EEE");
                        const timeRange = `${lesson.time} ~ ${calculateEndTime(
                          lesson.time,
                          lesson.duration,
                        )}`;

                        return (
                          <TableRow key={lesson._id}>
                            <TableCell className="font-medium">
                              {globalIndex}
                            </TableCell>
                            <TableCell>{dateStr}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {timeRange}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getStatusColor(lesson.status)}
                              >
                                {getStatusLabel(lesson.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {lesson.markedByName || "System"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {lesson.markedAt
                                ? format(
                                    new Date(lesson.markedAt),
                                    "MMM dd, HH:mm",
                                  )
                                : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination for Marking History */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        ),
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate end time
function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  const period = endHours >= 12 ? "PM" : "AM";
  const displayHours = endHours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")} ${period}`;
}
