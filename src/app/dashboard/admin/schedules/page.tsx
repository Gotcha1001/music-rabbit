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
import { Calendar, Plus } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import TeacherScheduleManager from "@/app/components/TeacherScheduleManager";

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
