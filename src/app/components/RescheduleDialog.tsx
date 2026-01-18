// NEW COMPONENT: app/components/RescheduleDialog.tsx

"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";

import { toast } from "sonner";

import { format } from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface RescheduleDialogProps {
  scheduleId: Id<"schedules">;
  lessonId: string;
  teacherId: Id<"users">;
  duration: number;
}

export function RescheduleDialog({
  scheduleId,
  lessonId,
  teacherId,
  duration,
}: RescheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );

  const availableSlots = useQuery(
    api.schedules.getAvailableSlots,
    selectedDate
      ? { teacherId, date: format(selectedDate, "yyyy-MM-dd"), duration }
      : "skip",
  );

  const createRequest = useMutation(api.schedules.teacherRequestReschedule);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      await createRequest({
        scheduleId,
        lessonId,
        newDate: format(selectedDate, "yyyy-MM-dd"),
        newTime: selectedTime,
        reason: "Teacher requested reschedule", // Make this dynamic if needed (e.g., add a textarea)
      });
      toast.success("Reschedule request sent");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to send request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Reschedule Lesson</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Lesson</DialogTitle>
          <DialogDescription>Select a new date and time.</DialogDescription>
        </DialogHeader>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => date < new Date()}
        />
        {availableSlots && availableSlots.length > 0 && (
          <Select onValueChange={setSelectedTime} value={selectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedTime} onClick={handleSubmit}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
