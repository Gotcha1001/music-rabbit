// app/components/CancelLessonDialog.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner"; // Use Sonner for toasts
import { Loader2 } from "lucide-react";

import { format, parseISO, differenceInHours } from "date-fns";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface CancelLessonDialogProps {
  scheduleId: Id<"schedules">;
  lessonId: string;
  date: string;
  time: string;
  duration: number;
  isStudent: boolean;
}

export function CancelLessonDialog({
  scheduleId,
  lessonId,
  date,
  time,
  duration,
  isStudent,
}: CancelLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use appropriate mutation based on role
  const studentCancel = useMutation(api.schedules.studentCancelLesson);
  const adminDelete = useMutation(api.schedules.adminDeleteLesson);

  // Fetch the lesson to verify details (optional, but good for validation)
  const lesson = useQuery(api.schedules.getLesson, { scheduleId, lessonId });

  const handleCancel = async () => {
    if (!lesson) return;

    setIsLoading(true);
    try {
      let result;
      if (isStudent) {
        // Student cancel with potential penalty
        result = await studentCancel({
          scheduleId,
          lessonId,
          reason: "Student requested cancellation", // Optional, can make dynamic if needed
        });

        if (result.penaltyApplied) {
          toast.warning("Late Cancellation", {
            description:
              "Lesson canceled with less than 24h notice. Package minutes deducted.",
          });
        } else {
          toast.success("Lesson Canceled", {
            description:
              "The lesson has been successfully canceled (no penalty).",
          });
        }
      } else {
        // Teacher/Admin delete (no penalty)
        result = await adminDelete({ scheduleId, lessonId });
        toast.success("Lesson Deleted", {
          description: "The lesson has been removed.",
        });
      }

      setOpen(false);
    } catch (error) {
      toast.error("Error", {
        description: "Failed to cancel the lesson. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Cancel Lesson</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-950 to-black border-purple-800/30">
        <DialogHeader>
          <DialogTitle className="text-purple-200">Cancel Lesson</DialogTitle>
          <DialogDescription className="text-purple-300">
            Are you sure you want to cancel this lesson scheduled for{" "}
            {format(parseISO(`${date}T${time}`), "PPP p")}?
            {isStudent && " If within 24 hours, this may incur a penalty."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="text-purple-300 border-purple-600/50"
          >
            No, Keep It
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Yes, Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
