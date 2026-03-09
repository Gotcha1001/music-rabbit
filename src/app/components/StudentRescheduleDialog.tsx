"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format, getDay } from "date-fns";
import {
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface StudentRescheduleDialogProps {
  scheduleId: Id<"schedules">;
  lessonId: string;
  teacherId: Id<"users">;
  duration: number;
  currentDate: string;
  currentTime: string;
  children?: React.ReactNode;
}

export function StudentRescheduleDialog({
  scheduleId,
  lessonId,
  teacherId,
  duration,
  currentDate,
  currentTime,
  children,
}: StudentRescheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSlots = useQuery(
    api.schedules.getAvailableSlots,
    selectedDate
      ? {
          teacherId,
          date: format(selectedDate, "yyyy-MM-dd"),
          duration,
        }
      : "skip",
  );

  const reschedule = useMutation(api.schedules.studentRescheduleLesson);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a new date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      await reschedule({
        scheduleId,
        lessonId,
        newDate: format(selectedDate, "yyyy-MM-dd"),
        newTime: selectedTime,
      });

      toast.success("Lesson rescheduled successfully!");
      setOpen(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reschedule";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Merged from current: Calculate hours to lesson for potential UI feedback
  const lessonDateTime = new Date(`${currentDate}T${currentTime}:00`);
  const now = new Date();
  const hoursToLesson =
    (lessonDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canReschedule = hoursToLesson >= 2; // But backend enforces it anyway

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            📅 Reschedule
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-950 to-black border-purple-800/30">
        <DialogHeader>
          <DialogTitle className="text-purple-200 flex items-center gap-2 text-2xl">
            <CalendarIcon className="h-6 w-6" />
            Reschedule Lesson
          </DialogTitle>
          <DialogDescription className="text-purple-300 text-base">
            Pick any available time between 10 AM - 5 PM (teacher&apos;s local
            time). Must be at least 2 hours in advance. Currently scheduled for{" "}
            {format(lessonDateTime, "PPP")} at {currentTime}.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-400">Current Time</p>
              <p className="text-2xl font-bold text-purple-200">
                {currentTime}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-400">Lesson Length</p>
              <p className="text-2xl font-bold text-purple-200">
                {duration} min
              </p>
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) =>
            date < new Date() || getDay(date) === 0 || getDay(date) === 6
          }
        />

        {/* Time Slots */}
        {selectedDate && (
          <div className="space-y-2 mt-4">
            <Label className="text-purple-200 flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Available Times on {format(selectedDate, "PPP")}
            </Label>
            {availableSlots === undefined ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {availableSlots.map((timeSlot) => (
                  <Button
                    key={timeSlot}
                    variant={selectedTime === timeSlot ? "default" : "outline"}
                    onClick={() => setSelectedTime(timeSlot)}
                  >
                    {timeSlot}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No slots available this day
              </p>
            )}
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selectedTime || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rescheduling...
              </>
            ) : (
              "Confirm Reschedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
