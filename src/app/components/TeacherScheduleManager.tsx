// export default TeacherScheduleManager;
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  format,
  addDays,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Trash2, X, Loader2 } from "lucide-react";
import { ScheduleDownloadButton } from "./Scheduledownloadbutton";

function TeacherScheduleManager() {
  const [selectedTeacherId, setSelectedTeacherId] =
    useState<Id<"users"> | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Create a filter key to detect changes
  const filterKey = useMemo(
    () => `${selectedTeacherId || "all"}-${currentWeekOffset}-${searchTerm}`,
    [selectedTeacherId, currentWeekOffset, searchTerm],
  );

  // Use filterKey as part of state to auto-reset
  const [stateKey, setStateKey] = useState(filterKey);
  const [displayedItemsCount, setDisplayedItemsCount] = useState(5);

  // Reset when filters change
  if (filterKey !== stateKey) {
    setStateKey(filterKey);
    setDisplayedItemsCount(5);
  }

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const itemsPerLoad = 5;

  const allTeachers = useQuery(api.users.getAllTeachers) || [];
  const schedules = useQuery(api.schedules.getAll) || [];
  const students = useQuery(api.users.getAllStudents) || [];
  const books = useQuery(api.books.getAll) || [];

  const adminDeleteLesson = useMutation(api.schedules.adminDeleteLesson);

  // Calculate current week range
  const today = new Date();
  const startOfWeekDate = addDays(
    today,
    -today.getDay() + currentWeekOffset * 7 + 1,
  );
  const endOfWeekDate = addDays(startOfWeekDate, 4);

  const weekLabel = `${format(startOfWeekDate, "MMM d")} - ${format(endOfWeekDate, "MMM d, yyyy")}`;

  // Filter schedules by teacher and week
  let filteredSchedules = schedules.filter((sched) => {
    if (selectedTeacherId && sched.teacherId !== selectedTeacherId)
      return false;

    const schedDate = new Date(sched.date);
    return (
      schedDate >= startOfWeekDate &&
      schedDate <= endOfWeekDate &&
      (isMonday(schedDate) ||
        isTuesday(schedDate) ||
        isWednesday(schedDate) ||
        isThursday(schedDate) ||
        isFriday(schedDate))
    );
  });

  // Sort by date ascending
  filteredSchedules = filteredSchedules.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Filter by search term
  const searchFilteredSchedules = filteredSchedules.filter((sched) => {
    const hasMatchingLesson = sched.lessons.some((lesson) => {
      const student = students.find(
        (s: Doc<"users">) => s._id === lesson.studentId,
      );
      const studentDisplayName =
        student?.name || student?.email.split("@")[0] || "Unknown";
      const book = lesson.bookId
        ? books.find((b: Doc<"books">) => b._id === lesson.bookId)
        : null;
      const bookTitle = book?.title || "";

      const lowerSearch = searchTerm.toLowerCase();
      return (
        studentDisplayName.toLowerCase().includes(lowerSearch) ||
        lesson.time.toLowerCase().includes(lowerSearch) ||
        bookTitle.toLowerCase().includes(lowerSearch) ||
        lesson.state.toLowerCase().includes(lowerSearch)
      );
    });
    return hasMatchingLesson;
  });

  // Get schedules to display based on infinite scroll
  const displayedSchedules = searchFilteredSchedules.slice(
    0,
    displayedItemsCount,
  );
  const hasMore = displayedItemsCount < searchFilteredSchedules.length;

  const selectedTeacher = selectedTeacherId
    ? allTeachers.find((t) => t._id === selectedTeacherId)
    : null;

  // Load more function - simplified
  const loadMore = useCallback(() => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedItemsCount((prev) => prev + itemsPerLoad);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <Card className="bg-card border-2 border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-serif">
            Current Schedules
          </CardTitle>

          {/* Teacher Filter Dropdown */}
          <div className="flex items-center gap-4">
            <Select
              value={selectedTeacherId || "all"}
              onValueChange={(v) =>
                setSelectedTeacherId(v === "all" ? null : (v as Id<"users">))
              }
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {allTeachers.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name || t.email.split("@")[0]} (
                    {t.instrument || "No instrument"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ScheduleDownloadButton
              schedules={schedules}
              teachers={allTeachers}
              students={students}
              books={books}
              teacherId={selectedTeacherId}
              referenceDate={startOfWeekDate} // already in scope
            />
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mt-4 p-4 bg-muted/30 rounded-lg border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Week
          </Button>

          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{weekLabel}</p>
            {currentWeekOffset === 0 && (
              <Badge className="mt-1 bg-green-500 text-white">
                Current Week
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
          >
            Next Week
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Search Input */}
        <Input
          placeholder="Search by student, time, book, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-4"
        />

        {/* Reset Button */}
        {(selectedTeacherId || currentWeekOffset !== 0 || searchTerm) && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setSelectedTeacherId(null);
              setCurrentWeekOffset(0);
              setSearchTerm("");
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        )}

        {/* Results count */}
        {searchFilteredSchedules.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            Showing {displayedSchedules.length} of{" "}
            {searchFilteredSchedules.length} schedule days
          </div>
        )}
      </CardHeader>

      <CardContent>
        {searchFilteredSchedules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No lessons scheduled
              {selectedTeacher &&
                ` for ${selectedTeacher.name || selectedTeacher.email.split("@")[0]}`}
              {` during ${weekLabel}`}
            </CardContent>
          </Card>
        ) : (
          <>
            {displayedSchedules.map((sched) => {
              const teacher = allTeachers.find(
                (t: Doc<"users">) => t._id === sched.teacherId,
              );
              const teacherDisplayName =
                teacher?.name || teacher?.email.split("@")[0] || "Unknown";

              // Filter lessons by search term
              const filteredLessons = sched.lessons.filter((lesson) => {
                const student = students.find(
                  (s: Doc<"users">) => s._id === lesson.studentId,
                );
                const studentDisplayName =
                  student?.name || student?.email.split("@")[0] || "Unknown";
                const book = lesson.bookId
                  ? books.find((b: Doc<"books">) => b._id === lesson.bookId)
                  : null;
                const bookTitle = book?.title || "";

                const lowerSearch = searchTerm.toLowerCase();
                return (
                  studentDisplayName.toLowerCase().includes(lowerSearch) ||
                  lesson.time.toLowerCase().includes(lowerSearch) ||
                  bookTitle.toLowerCase().includes(lowerSearch) ||
                  lesson.state.toLowerCase().includes(lowerSearch)
                );
              });

              return (
                <>
                  <div
                    key={sched._id}
                    className="mb-8 border rounded-lg overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-muted/50 p-4 font-bold text-foreground">
                      {teacherDisplayName} •{" "}
                      {format(new Date(sched.date), "EEEE, MMMM d, yyyy")} (
                      {filteredLessons.length} lessons)
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Book</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLessons.map((lesson, idx) => {
                          const student = students.find(
                            (s: Doc<"users">) => s._id === lesson.studentId,
                          );
                          const studentDisplayName =
                            student?.name ||
                            student?.email.split("@")[0] ||
                            "Unknown";
                          const book = lesson.bookId
                            ? books.find(
                                (b: Doc<"books">) => b._id === lesson.bookId,
                              )
                            : null;

                          return (
                            <TableRow key={idx}>
                              <TableCell>{studentDisplayName}</TableCell>
                              <TableCell>{lesson.time}</TableCell>
                              <TableCell>{lesson.duration} min</TableCell>
                              <TableCell>{book?.title || "---"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    lesson.state === "completed"
                                      ? "default"
                                      : lesson.state === "scheduled"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {lesson.state}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={async () => {
                                    if (confirm("Cancel this lesson?")) {
                                      await adminDeleteLesson({
                                        scheduleId: sched._id,
                                        lessonId: lesson.lessonId,
                                      });
                                      toast.success("Lesson cancelled");
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              );
            })}

            {/* Infinite scroll trigger element */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading more schedules...
                  </div>
                )}
              </div>
            )}

            {/* Manual load more button (fallback) */}
            {hasMore && !isLoadingMore && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                >
                  Load More Schedules
                </Button>
              </div>
            )}

            {/* End message */}
            {!hasMore && displayedSchedules.length > 5 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No more schedules to load
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TeacherScheduleManager;
