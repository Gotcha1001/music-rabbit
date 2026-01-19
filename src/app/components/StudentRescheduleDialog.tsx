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
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format, addWeeks } from "date-fns";
import { Clock } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface StudentRescheduleDialogProps {
  scheduleId: Id<"schedules">;
  lessonId: string;
  teacherId: Id<"users">;
  duration: number;
  currentDate: string;
  currentTime: string;
}

export function StudentRescheduleDialog({
  scheduleId,
  lessonId,
  teacherId,
  duration,
  currentDate,
  currentTime,
}: StudentRescheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  // Get available slots for the selected date
  const availableSlots = useQuery(
    api.schedules.getAvailableSlots,
    selectedDate
      ? { teacherId, date: format(selectedDate, "yyyy-MM-dd"), duration }
      : "skip",
  );

  const createRequest = useMutation(api.schedules.studentRequestReschedule);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    try {
      await createRequest({
        scheduleId,
        lessonId,
        newDate: format(selectedDate, "yyyy-MM-dd"),
        newTime: selectedTime,
        reason: "Student requested time change",
      });

      toast.success("Reschedule request sent to teacher!");
      setOpen(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    } catch (err) {
      toast.error("Failed to send request");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Reschedule</DialogTitle>
          <DialogDescription>
            Currently scheduled for {format(new Date(currentDate), "PPP")} at{" "}
            {currentTime}. Select a new date and available time slot.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                date < new Date() || date > addWeeks(new Date(), 4)
              }
              className="rounded-md border"
            />
          </div>

          {/* Available Times */}
          {selectedDate && (
            <div>
              <h3 className="font-semibold mb-3 text-purple-200">
                Available Times for {format(selectedDate, "PPP")}
              </h3>
              {availableSlots && availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className="w-full"
                      size="sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No available slots on this date
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selectedDate || !selectedTime}
            onClick={handleSubmit}
          >
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
