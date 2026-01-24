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
import { toast } from "sonner";
import { format, isAfter, isBefore } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Loader2,
  ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface StudentRequestRescheduleDialogProps {
  scheduleId: Id<"schedules">;
  lessonId: string;
  teacherId: Id<"users">;
  duration: number;
  currentDate: string;
  currentTime: string;
  children?: React.ReactNode;
}

export function StudentRequestRescheduleDialog({
  scheduleId,
  lessonId,
  teacherId,
  duration,
  currentDate,
  currentTime,
  children,
}: StudentRequestRescheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available slots for the selected date
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

  const requestReschedule = useMutation(api.schedules.studentRequestReschedule);

  const currentLessonDateTime = new Date(`${currentDate}T${currentTime}:00`);

  // Disable dates: Past dates and same day (since same-day uses different flow)
  const disabledDates = (date: Date) => {
    return (
      isBefore(date, new Date()) || format(date, "yyyy-MM-dd") === currentDate
    );
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a new date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestReschedule({
        scheduleId,
        lessonId,
        newDate: format(selectedDate, "yyyy-MM-dd"),
        newTime: selectedTime,
        reason: reason.trim() || undefined,
      });
      toast.success("Reschedule request sent to your teacher!");
      setOpen(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setReason("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send request";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-950 to-black border-purple-800/30">
        <DialogHeader>
          <DialogTitle className="text-purple-200 flex items-center gap-2 text-2xl">
            <CalendarIcon className="h-6 w-6" />
            Request Lesson Reschedule
          </DialogTitle>
          <DialogDescription className="text-purple-300 text-base">
            Request a new date and time. Your teacher will review and approve.
            <br />
            Currently: {format(currentLessonDateTime, "PPP")} at {currentTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-purple-200 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              New Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-purple-700/50 text-purple-300 hover:bg-purple-900/30",
                    !selectedDate && "text-purple-400/70",
                  )}
                >
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-purple-950 border-purple-800/50">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDates}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-2">
              <Label className="text-purple-200 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Times on {format(selectedDate, "PPP")}
              </Label>
              {availableSlots === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                </div>
              ) : availableSlots && availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-purple-950/20 rounded-lg border border-purple-800/30">
                  {availableSlots.map((timeSlot) => (
                    <Button
                      key={timeSlot}
                      variant={
                        selectedTime === timeSlot ? "default" : "outline"
                      }
                      onClick={() => setSelectedTime(timeSlot)}
                      className={
                        selectedTime === timeSlot
                          ? "bg-purple-700 hover:bg-purple-600 text-white border-purple-600 h-12 text-base"
                          : "border-purple-700/50 text-purple-300 hover:bg-purple-900/50 h-12 text-base"
                      }
                    >
                      {timeSlot}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-purple-400/70 border border-purple-800/30 rounded-lg bg-purple-950/20">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-base">No available slots on this day</p>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label className="text-purple-200">Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need to reschedule?"
              className="border-purple-700/50 bg-purple-950/30 text-purple-200 placeholder-purple-400/50 min-h-[100px]"
            />
          </div>

          {selectedDate && selectedTime && (
            <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-green-300 text-sm">Proposed new time</p>
                  <p className="text-xl font-bold text-green-200">
                    {format(selectedDate, "PPP")} at {selectedTime}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setSelectedDate(undefined);
              setSelectedTime(undefined);
              setReason("");
            }}
            className="border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedDate || !selectedTime || isSubmitting}
            onClick={handleSubmit}
            className="bg-purple-700 hover:bg-purple-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
