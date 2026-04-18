"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Video,
  MessageSquare,
  DollarSign,
  FileText,
  Clock,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  BookOpen,
} from "lucide-react";
import LiveClock from "@/app/components/LiveClock";
import { EarningsSummaryCard } from "@/app/components/EarningsSummaryCard";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import TeacherStatsComponent from "../stats/page";
import RecordingsTab from "@/app/components/RecordingsTab";
import { ScheduleDownloadButton } from "@/app/components/Scheduledownloadbutton";
import { WavyBackground } from "@/components/ui/wavy-background";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const TDASH_STYLES = `
  /* Date navigator strip */
  .tdash-date-nav                   { background: hsl(270, 80%, 30%) !important; border-color: hsl(270, 70%, 40%) !important; }
  .dark .tdash-date-nav             { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.5) !important; }

  .tdash-nav-btn                    { border-color: rgba(255,255,255,0.25) !important; color: #ffffff !important; background: rgba(255,255,255,0.08) !important; }
  .tdash-nav-btn:hover              { background: rgba(255,255,255,0.18) !important; }
  .dark .tdash-nav-btn              { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; background: transparent !important; }
  .dark .tdash-nav-btn:hover        { background: rgba(76,29,149,0.5) !important; }

  .tdash-nav-day                    { color: #ffffff !important; }
  .dark .tdash-nav-day              { color: #ede9fe !important; }

  .tdash-nav-date                   { color: rgba(255,255,255,0.75) !important; }
  .dark .tdash-nav-date             { color: #c4b5fd !important; }

  /* Table header */
  .tdash-thead-row                  { background: hsl(var(--primary)) !important; }
  .dark .tdash-thead-row            { background: rgba(76,29,149,0.4) !important; }

  .tdash-th                         { color: #ffffff !important; font-weight: 600 !important; }
  .dark .tdash-th                   { color: #c4b5fd !important; }

  /* Mobile lesson cards — header strip */
  .tdash-card-header                { background: hsl(270, 80%, 30%) !important; border-bottom-color: hsl(270, 70%, 40%) !important; }
  .dark .tdash-card-header          { background: rgba(76,29,149,0.4) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }

  .tdash-card-date                  { color: #ffffff !important; }
  .dark .tdash-card-date            { color: #ede9fe !important; }
`;

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

type BaseLesson = {
  lessonId: string;
  studentId: Id<"users">;
  time: string;
  duration: number;
  bookId: Id<"books"> | null;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
  startedAt?: number;
  status: LessonStatus;
  state: LessonState;
  endedAt?: number;
  actualMinutes?: number;
  onTime?: boolean;
};
type EnrichedLesson = BaseLesson & {
  studentTimezone?: string;
  studentCountry?: string;
};
type Schedule = Doc<"schedules"> & { lessons: EnrichedLesson[] };

export default function TeacherDashboard() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const currentUser = useQuery(api.users.get);

  useEffect(() => {
    if (currentUser && !currentUser.instrument)
      router.replace("/onboarding/teacher");
  }, [currentUser, router]);

  const schedules =
    (useQuery(
      api.schedules.getByTeacherWithTimezones,
      currentUser ? { teacherId: currentUser._id } : "skip",
    ) as Schedule[]) || [];

  const allStudents = useQuery(api.users.getAllStudents) || [];
  const allBooks = useQuery(api.books.getAll) || [];

  const messages =
    (useQuery(
      api.messages.getByUser,
      currentUser ? { userId: currentUser._id } : "skip",
    ) as Doc<"messages">[]) || [];

  const [now] = useState<number>(() => Date.now());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const goToPreviousDay = () =>
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  const goToNextDay = () =>
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  const goToToday = () => setSelectedDate(new Date());

  if (!clerkLoaded || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "teacher") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 text-center text-red-500 bg-red-950/30 border-2 border-red-500/50 rounded-lg"
        >
          <p className="text-xl font-serif">Access denied - teachers only</p>
        </motion.div>
      </div>
    );
  }

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = selectedDateStr === format(new Date(), "yyyy-MM-dd");
  const daySchedules = schedules.filter(
    (s: Schedule) => s.date === selectedDateStr,
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <style>{TDASH_STYLES}</style>
      <div className="pointer-events-none absolute inset-0">
        <WavyBackground
          colors={["#7c3aed", "#6d28d9", "#22054e", "#c4b5fd", "#8b5cf6"]}
          backgroundFill="transparent"
          blur={4}
          speed="slow"
          waveOpacity={0.06}
          waveWidth={60}
          waveYOffset={350}
          containerClassName="h-full"
          className="hidden"
        />
      </div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <LiveClock />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-foreground font-serif leading-tight"
        >
          Welcome back, {clerkUser?.firstName || "Teacher"}! 🎵
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="bg-card border border-border p-1 mb-6 sm:mb-8 w-full sm:w-auto flex flex-wrap gap-1 h-auto">
              <TabsTrigger value="schedule" className="text-xs sm:text-sm">
                Schedule
              </TabsTrigger>
              <TabsTrigger value="messages" className="text-xs sm:text-sm">
                Messages
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm">
                Payments
              </TabsTrigger>
              <TabsTrigger value="recordings" className="text-xs sm:text-sm">
                Recordings
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs sm:text-sm">
                Stats
              </TabsTrigger>
            </TabsList>

            {/* ── Schedule tab ── */}
            <TabsContent value="schedule">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                      {/* Left: Title + Camera Icon */}
                      <CardTitle className="flex items-center gap-2 sm:gap-3 text-card-foreground font-serif text-xl sm:text-2xl">
                        <Video className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
                        Daily Schedule
                      </CardTitle>

                      {/* Right Side: Download Button + Today Button */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <ScheduleDownloadButton
                          schedules={schedules}
                          teachers={[currentUser]}
                          students={allStudents}
                          books={allBooks}
                          teacherId={currentUser._id}
                          referenceDate={selectedDate}
                        />

                        {!isToday && (
                          <Button
                            onClick={goToToday}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs sm:text-sm"
                          >
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Today
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* ── Date navigator — deep purple via !important ── */}
                    <div className="tdash-date-nav flex items-center justify-between gap-2 p-3 sm:p-4 rounded-lg border">
                      <Button
                        onClick={goToPreviousDay}
                        variant="outline"
                        size="sm"
                        className="tdash-nav-btn gap-1 sm:gap-2 px-2 sm:px-3 shrink-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>

                      <div className="text-center flex-1 min-w-0">
                        <p className="tdash-nav-day text-lg sm:text-2xl font-bold font-serif truncate">
                          {format(selectedDate, "EEEE")}
                        </p>
                        <p className="tdash-nav-date text-sm sm:text-lg truncate">
                          {format(selectedDate, "MMM d, yyyy")}
                        </p>
                        {isToday && (
                          <Badge className="mt-1 bg-green-600 dark:bg-green-500 text-white text-xs">
                            Today
                          </Badge>
                        )}
                      </div>

                      <Button
                        onClick={goToNextDay}
                        variant="outline"
                        size="sm"
                        className="tdash-nav-btn gap-1 sm:gap-2 px-2 sm:px-3 shrink-0"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardDescription className="text-muted-foreground mt-3 sm:mt-4 text-sm">
                      {daySchedules.length === 0
                        ? "No lessons scheduled for this day"
                        : `${daySchedules.reduce((sum, s) => sum + s.lessons.length, 0)} lessons scheduled`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <ScheduleTable
                      schedules={daySchedules}
                      now={now}
                      selectedDate={selectedDateStr}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ── Stats tab ── */}
            <TabsContent value="stats">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-card-foreground font-serif text-xl sm:text-2xl">
                      <DollarSign className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
                      Your Performance This Month
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {format(new Date(), "MMMM yyyy")} • Real-time stats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeacherStatsComponent />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ── Messages tab ── */}
            <TabsContent value="messages">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-card-foreground font-serif text-xl sm:text-2xl">
                      <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
                      Messages from HR
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {messages.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-muted-foreground py-10 sm:py-12 font-serif italic text-sm sm:text-base"
                      >
                        No messages yet
                      </motion.div>
                    ) : (
                      messages.map((msg: Doc<"messages">, index: number) => (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="mb-3 sm:mb-4 p-3 sm:p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="text-foreground font-serif text-sm sm:text-base">
                            {msg.content}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground mt-2 font-serif">
                            {format(msg.timestamp, "PPP p")}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ── Payments tab ── */}
            <TabsContent value="payments">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <EarningsSummaryCard teacherId={currentUser._id} />
              </motion.div>
            </TabsContent>

            {/* ── Recordings tab ── */}
            <TabsContent value="recordings">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <RecordingsTab />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */
function StudentName({ id }: { id: Id<"users"> }) {
  const student = useQuery(api.users.getById, { id });
  return (
    <span className="text-foreground text-sm">
      {student?.email ?? "Loading..."}
    </span>
  );
}

function BookTitle({ id }: { id: Id<"books"> | null }) {
  const book = useQuery(api.books.getById, id ? { id } : "skip");
  if (!id || !book)
    return <span className="text-muted-foreground text-sm">No book</span>;
  return (
    <Button
      variant="link"
      onClick={() => window.open(book.driveViewLink, "_blank")}
      className="p-0 h-auto flex items-center gap-1.5 text-primary hover:text-primary/80 text-xs sm:text-sm"
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate max-w-[120px]">{book.title}</span>
    </Button>
  );
}

function ScheduleTable({
  schedules,
  now,
  selectedDate,
}: {
  schedules: Schedule[];
  now: number;
  selectedDate: string;
}) {
  if (schedules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10 sm:py-12"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Video className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-40 text-primary" />
        </motion.div>
        <p className="text-base sm:text-lg text-foreground font-serif">
          No lessons scheduled for{" "}
          {format(new Date(selectedDate), "MMMM d, yyyy")}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-serif">
          {selectedDate === format(new Date(), "yyyy-MM-dd")
            ? "Enjoy your day off! 🎉"
            : "Check another day using the navigation above"}
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* ── DESKTOP table (md+) ── */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="tdash-thead-row border-b border-primary/20 hover:bg-transparent">
              {[
                "Time",
                "Student",
                "Scheduled",
                "Actual Time",
                "Book",
                "State",
                "Actions",
              ].map((h) => (
                <TableHead
                  key={h}
                  className="tdash-th font-serif whitespace-nowrap"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.flatMap((s, sIndex) =>
              s.lessons.map((l, lIndex) => {
                const startMs = new Date(`${s.date}T${l.time}:00`).getTime();
                const globalIndex = sIndex * 10 + lIndex;
                return (
                  <motion.tr
                    key={`${s._id}-${l.lessonId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: globalIndex * 0.05 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-foreground font-serif font-mono text-base sm:text-lg whitespace-nowrap">
                      {l.time}
                    </TableCell>
                    <TableCell>
                      <StudentName id={l.studentId} />
                    </TableCell>
                    <TableCell className="text-foreground font-serif whitespace-nowrap">
                      {l.duration} min
                    </TableCell>
                    <TableCell className="text-foreground font-serif">
                      <ActualTime l={l} />
                    </TableCell>
                    <TableCell>
                      <BookTitle id={l.bookId} />
                    </TableCell>
                    <TableCell>
                      <StateBadges l={l} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        asChild
                        className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-sm text-xs sm:text-sm"
                      >
                        <Link href={`/dashboard/lesson/${s._id}/${l.lessonId}`}>
                          <Video className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              }),
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── MOBILE: stacked lesson cards (below md) ── */}
      <div className="md:hidden space-y-3">
        {schedules.flatMap((s, sIndex) =>
          s.lessons.map((l, lIndex) => {
            const globalIndex = sIndex * 10 + lIndex;
            return (
              <motion.div
                key={`${s._id}-${l.lessonId}-mob`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: globalIndex * 0.05 }}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                {/* Header */}
                <div className="tdash-card-header flex items-center justify-between px-4 py-2.5 border-b">
                  <span className="tdash-card-date font-serif font-semibold text-sm">
                    {l.time} · {l.duration} min
                  </span>
                  <StateBadges l={l} compact />
                </div>
                {/* Body */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <StudentName id={l.studentId} />
                  </div>
                  {l.bookId && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                      <BookTitle id={l.bookId} />
                    </div>
                  )}
                  <ActualTime l={l} />
                </div>
                {/* Actions */}
                <div className="px-4 pb-3">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-primary text-sm"
                  >
                    <Link href={`/dashboard/lesson/${s._id}/${l.lessonId}`}>
                      <Video className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          }),
        )}
      </div>
    </>
  );
}

function ActualTime({ l }: { l: EnrichedLesson }) {
  if (l.actualMinutes !== undefined && l.state === "completed") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-foreground text-sm">
          {l.actualMinutes} min
        </span>
        {l.actualMinutes < l.duration && (
          <Badge
            variant="outline"
            className="text-xs border-orange-400 text-orange-600"
          >
            -{l.duration - l.actualMinutes} min
          </Badge>
        )}
        {l.actualMinutes > l.duration && (
          <Badge
            variant="outline"
            className="text-xs border-blue-400 text-blue-600"
          >
            +{l.actualMinutes - l.duration} min
          </Badge>
        )}
      </div>
    );
  }
  if (l.state === "missed_teacher" || l.state === "missed_student") {
    return <span className="text-xs text-red-500 italic">Lesson missed</span>;
  }
  return (
    <span className="text-xs text-muted-foreground italic">Not finished</span>
  );
}

function StateBadges({ l, compact }: { l: EnrichedLesson; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-1 ${compact ? "" : "items-center"}`}>
      <Badge
        variant={getStateVariant(l.state)}
        className={`text-xs ${
          l.state === "completed"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100"
            : l.state === "missed_teacher" || l.state === "missed_student"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100"
              : l.state === "in_progress"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        {getStateIcon(l.state)}
        <span className="ml-1">{l.state.replace("_", " ")}</span>
      </Badge>
      {l.onTime === false && (
        <Badge
          variant="destructive"
          className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100"
        >
          Late
        </Badge>
      )}
    </div>
  );
}

function getStateVariant(state: LessonState) {
  switch (state) {
    case "scheduled":
      return "secondary";
    case "in_progress":
      return "default";
    case "completed":
      return "default";
    case "missed_teacher":
    case "missed_student":
      return "destructive";
    default:
      return "outline";
  }
}

function getStateIcon(state: LessonState) {
  switch (state) {
    case "scheduled":
      return <Clock className="h-3.5 w-3.5 inline" />;
    case "in_progress":
      return <PlayCircle className="h-3.5 w-3.5 inline" />;
    case "completed":
      return <CheckCircle className="h-3.5 w-3.5 inline" />;
    case "missed_teacher":
    case "missed_student":
      return <AlertCircle className="h-3.5 w-3.5 inline" />;
    default:
      return null;
  }
}
