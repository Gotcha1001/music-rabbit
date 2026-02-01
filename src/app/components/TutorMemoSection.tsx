import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Calendar, User } from "lucide-react";
// Using built-in date formatting

type MemoStatus = "OK" | "ET" | "NA" | "TI" | "TL";

interface TutorMemoSectionProps {
  scheduleId: Id<"schedules">;
  lessonId: string;
  studentId: Id<"users">;
}

export function TutorMemoSection({
  scheduleId,
  lessonId,
  studentId,
}: TutorMemoSectionProps) {
  const [status, setStatus] = useState<MemoStatus>("OK");
  const [bookUsed, setBookUsed] = useState("");
  const [pageProgress, setPageProgress] = useState("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all memos for this student
  const studentMemos = useQuery(api.tutorMemos.getByStudent, {
    studentId,
  });

  // Fetch lesson with book to prefill bookUsed
  const lesson = useQuery(api.schedules.getLessonWithBook, {
    scheduleId,
    lessonId,
  });

  useEffect(() => {
    if (status === "OK" && lesson?.bookTitle && !bookUsed) {
      setBookUsed(lesson.bookTitle);
    }
  }, [lesson, status, bookUsed]);

  const saveMemo = useMutation(api.tutorMemos.create);
  const updateLesson = useMutation(api.schedules.updateLesson);

  const statusMap: Record<
    MemoStatus,
    | "completed"
    | "finished_early"
    | "no_answer_on_time"
    | "technical_difficulty"
    | "teacher_late"
  > = {
    OK: "completed",
    ET: "finished_early",
    NA: "no_answer_on_time",
    TI: "technical_difficulty",
    TL: "teacher_late",
  };

  const handleSaveMemo = async () => {
    if (status === "OK" && !bookUsed) {
      toast.error("Please specify which book was used");
      return;
    }
    setIsSaving(true);
    try {
      await saveMemo({
        scheduleId,
        lessonId,
        studentId,
        status,
        bookUsed: bookUsed || undefined,
        pageProgress: pageProgress || undefined,
        reason: reason || undefined,
      });
      await updateLesson({
        scheduleId,
        lessonId,
        updates: { forceStatus: statusMap[status] },
      });
      toast.success("Tutor memo saved!");
      // Reset form
      setStatus("OK");
      setBookUsed("");
      setPageProgress("");
      setReason("");
    } catch (error) {
      toast.error("Failed to save memo");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const statusLabels: Record<MemoStatus, string> = {
    OK: "OK - Lesson completed successfully",
    ET: "ET - Ended Early",
    NA: "NA - Student did not attend",
    TI: "TI - Technical Issues",
    TL: "TL - Teacher was late",
  };

  const statusColors: Record<MemoStatus, string> = {
    OK: "bg-green-500",
    ET: "bg-yellow-500",
    NA: "bg-red-500",
    TI: "bg-purple-500",
    TL: "bg-orange-500",
  };

  return (
    <div className="space-y-6 pt-6 border-t-2 border-purple-700/50">
      {/* New Memo Form */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 border-2 border-purple-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-200">
            <FileText className="h-6 w-6" />
            Tutor Memo
          </CardTitle>
          <p className="text-sm text-purple-400">
            Record lesson details for HR and future reference
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Selection */}
          <div>
            <Label className="text-purple-300">Lesson Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as MemoStatus)}
            >
              <SelectTrigger className="bg-purple-900/30 border-purple-700 text-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusLabels) as MemoStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${statusColors[key]}`}
                      />
                      {statusLabels[key]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Book Used (only for OK status) */}
          {status === "OK" && (
            <>
              <div>
                <Label className="text-purple-300">Book Used</Label>
                <Input
                  value={bookUsed}
                  onChange={(e) => setBookUsed(e.target.value)}
                  placeholder="e.g., Piano Adventures Level 1"
                  className="bg-purple-900/30 border-purple-700 text-purple-200"
                />
              </div>
              <div>
                <Label className="text-purple-300">
                  Progress (Page/Section)
                </Label>
                <Input
                  value={pageProgress}
                  onChange={(e) => setPageProgress(e.target.value)}
                  placeholder="e.g., Pages 4-5 or Section 2"
                  className="bg-purple-900/30 border-purple-700 text-purple-200"
                />
              </div>
            </>
          )}
          {/* Reason (optional for all statuses) */}
          <div>
            <Label className="text-purple-300">
              Reason / Comments (optional)
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Student requested to end early due to... or additional notes"
              rows={3}
              className="bg-purple-900/30 border-purple-700 text-purple-200"
            />
          </div>
          <Button
            onClick={handleSaveMemo}
            disabled={isSaving}
            className="w-full bg-purple-700 hover:bg-purple-600"
          >
            {isSaving ? "Saving..." : "Save Memo"}
          </Button>
        </CardContent>
      </Card>
      {/* Memo History */}
      {studentMemos && studentMemos.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-950/60 to-black/60 border-2 border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-purple-200">Lesson History</CardTitle>
            <p className="text-sm text-purple-400">
              Previous memos for this student
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {studentMemos.map((memo) => (
                <div
                  key={memo._id}
                  className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {memo.status && (
                        <>
                          <div
                            className={`h-4 w-4 rounded-full ${statusColors[memo.status]}`}
                          />
                          <span className="font-semibold text-purple-200">
                            {statusLabels[memo.status]}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(memo._creationTime).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </div>
                  </div>
                  {memo.bookUsed && (
                    <div className="mb-2">
                      <span className="text-sm text-purple-300">Book: </span>
                      <span className="text-purple-200">{memo.bookUsed}</span>
                      {memo.pageProgress && (
                        <>
                          <span className="text-purple-400"> • </span>
                          <span className="text-purple-200">
                            {memo.pageProgress}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {memo.reason && (
                    <div className="mt-2 p-3 bg-purple-950/50 rounded border border-purple-800/30">
                      <p className="text-sm text-purple-300">{memo.reason}</p>
                    </div>
                  )}
                  {memo.teacherName && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-400">
                      <User className="h-3 w-3" />
                      {memo.teacherName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
