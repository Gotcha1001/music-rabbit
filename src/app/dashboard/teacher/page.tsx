"use client";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Video,
  MessageSquare,
  DollarSign,
  FileText,
} from "lucide-react";

type Lesson = {
  studentId: Id<"users">;
  time: string;
  duration: number;
  bookId?: Id<"books">;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
};

type Schedule = Doc<"schedules"> & { lessons: Lesson[] };

export default function TeacherDashboard() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const currentUser = useQuery(api.users.get);

  // Redirect if no instrument selected yet
  useEffect(() => {
    if (currentUser && !currentUser.instrument) {
      router.replace("/onboarding/teacher");
    }
  }, [currentUser, router]);

  const schedules =
    useQuery(
      api.schedules.getByTeacher,
      currentUser ? { teacherId: currentUser._id } : "skip"
    ) ?? [];

  const messages =
    useQuery(
      api.messages.getByUser,
      currentUser ? { userId: currentUser._id } : "skip"
    ) ?? [];

  const payments =
    useQuery(
      api.payments.getByTeacher,
      currentUser ? { teacherId: currentUser._id } : "skip"
    ) ?? [];

  const updateLesson = useMutation(api.schedules.updateLesson);

  const [now] = useState<number>(() => Date.now()); // Removed setNow since not used
  const [selectedLesson, setSelectedLesson] = useState<{
    scheduleId: Id<"schedules">;
    lessonIndex: number;
  } | null>(null);
  const [notes, setNotes] = useState("");

  if (!clerkLoaded || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "teacher") {
    return (
      <div className="p-8 text-center text-red-600">
        Access denied – teachers only
      </div>
    );
  }

  const upcomingSchedules = schedules.filter(
    (s: Schedule) => new Date(s.date).getTime() >= now - 24 * 60 * 60 * 1000
  );

  const handleStartMeeting = async (
    scheduleId: Id<"schedules">,
    lessonIndex: number
  ) => {
    // Placeholder for Zoom integration: generate link
    const zoomLink = "https://zoom.us/j/123456789"; // Replace with actual API call
    await updateLesson({ scheduleId, lessonIndex, updates: { zoomLink } });
  };

  const handleCompleteLesson = async (
    scheduleId: Id<"schedules">,
    lessonIndex: number
  ) => {
    await updateLesson({
      scheduleId,
      lessonIndex,
      updates: { completed: true, notes },
    });
    setSelectedLesson(null);
    setNotes("");
  };

  const handleOpenBook = (bookId?: Id<"books">) => {
    if (bookId) {
      // Placeholder: open PDF viewer or download
      console.log(`Opening book ${bookId}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">
        Welcome back, {clerkUser?.firstName || "Teacher"}! 🎵
      </h1>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6" />
                Today&apos;s Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleTable
                schedules={upcomingSchedules}
                now={now}
                onStartMeeting={handleStartMeeting}
                onCompleteLesson={handleCompleteLesson}
                onOpenBook={handleOpenBook}
                selectedLesson={selectedLesson}
                setSelectedLesson={setSelectedLesson}
                notes={notes}
                setNotes={setNotes}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Messages from HR
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Render messages */}
              {messages.map((msg: Doc<"messages">) => (
                <div key={msg._id} className="mb-4">
                  <p>{msg.content}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(msg.timestamp, "PPP p")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Render payments */}
              {payments.map((pay: Doc<"payments">) => (
                <div key={pay._id}>
                  <p>
                    {pay.month}: ${pay.earnings}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Lesson Recordings
              </CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable components
function StudentName({ id }: { id: Id<"users"> }) {
  const student = useQuery(api.users.getById, { id });
  return <span>{student?.email ?? "Loading…"}</span>;
}

function BookTitle({ id }: { id?: Id<"books"> }) {
  const book = useQuery(api.books.getById, id ? { id } : "skip");
  if (!id) return <span>—</span>;
  return <span>{book?.title ?? "Loading…"}</span>;
}

function ScheduleTable({
  schedules,
  now,
  onStartMeeting,
  onCompleteLesson,
  onOpenBook,
  selectedLesson,
  setSelectedLesson,
  notes,
  setNotes,
}: {
  schedules: Schedule[];
  now: number;
  onStartMeeting: (scheduleId: Id<"schedules">, lessonIndex: number) => void;
  onCompleteLesson: (scheduleId: Id<"schedules">, lessonIndex: number) => void;
  onOpenBook: (bookId?: Id<"books">) => void;
  selectedLesson: { scheduleId: Id<"schedules">; lessonIndex: number } | null;
  setSelectedLesson: (
    val: { scheduleId: Id<"schedules">; lessonIndex: number } | null
  ) => void;
  notes: string;
  setNotes: (val: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Book</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.flatMap((s) =>
          s.lessons.map((l, idx) => {
            const startMs = new Date(`${s.date}T${l.time}:00`).getTime();
            const isActive =
              startMs <= now && startMs + l.duration * 60 * 1000 > now;

            return (
              <TableRow key={`${s._id}-${idx}`}>
                <TableCell>{format(startMs, "PPP")}</TableCell>
                <TableCell>{l.time}</TableCell>
                <TableCell>
                  <StudentName id={l.studentId} />
                </TableCell>
                <TableCell>{l.duration} min</TableCell>
                <TableCell>
                  <Button variant="link" onClick={() => onOpenBook(l.bookId)}>
                    <BookTitle id={l.bookId} />
                  </Button>
                </TableCell>
                <TableCell>
                  {l.completed ? (
                    <Badge variant="secondary">Completed</Badge>
                  ) : (
                    <Badge variant={isActive ? "default" : "outline"}>
                      {isActive ? "In Progress" : "Scheduled"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {!l.zoomLink && isActive && (
                    <Button
                      size="sm"
                      onClick={() => onStartMeeting(s._id, idx)}
                    >
                      Start Meeting
                    </Button>
                  )}
                  {l.zoomLink && (
                    <Button size="sm" asChild>
                      <a
                        href={l.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join Zoom
                      </a>
                    </Button>
                  )}
                  {isActive && !l.completed && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setSelectedLesson({
                          scheduleId: s._id,
                          lessonIndex: idx,
                        })
                      }
                    >
                      Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
