// app/components/BookLessonCalendar.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // shadcn/ui (assume installed)
import { Badge } from "@/components/ui/badge";
import { format, addWeeks } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";
import { toast } from "sonner";
import { useUserDetail } from "@/context/UserDetailContext"; // Your context for student timezone
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function BookLessonCalendar({ teacherId }: { teacherId: Id<"users"> }) {
  const { userDetail: student } = useUserDetail(); // Get student timezone

  const studentTz = student?.timezone || "UTC"; // Fallback
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [duration] = useState<number>(30); // Default duration, or make state if needed

  const availableSlots = useQuery(
    api.availability.getAvailableSlots,
    selectedDate
      ? {
          teacherId,
          startDate: format(new Date(), "yyyy-MM-dd"), // Today
          endDate: format(addWeeks(new Date(), 4), "yyyy-MM-dd"), // 4 weeks
          duration,
          studentId: student?._id ?? ("" as Id<"users">), // Handle possible undefined with fallback or guard
        }
      : "skip",
  );

  const bookLesson = useMutation(api.schedules.bookLesson); // Assume this mutation exists in your Convex schema

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;

    // Convert selectedTime (which is local? Wait, in code selectedTime is UTC from slots)
    // Assuming selectedTime is UTC, but if UI shows local, adjust accordingly
    // For now, assuming slots.time is UTC
    const utcTime = selectedTime; // Already UTC

    try {
      await bookLesson({
        teacherId,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: utcTime,
        duration,
        // Add other required args like studentId: student._id, etc.
      });
      toast.success("Lesson booked!");
      setSelectedTime(undefined);
    } catch (error) {
      toast.error("Failed to book lesson");
    }
  };

  if (!student) return null; // Handle null student

  const slotsForDate =
    availableSlots?.filter(
      (slot) => slot.date === format(selectedDate || new Date(), "yyyy-MM-dd"),
    ) || [];

  // Convert UTC time to student's local for display
  const getLocalTime = (utcTime: string, date: string) => {
    const utcDateTime = `${date}T${utcTime}:00Z`;
    return formatInTimeZone(new Date(utcDateTime), studentTz, "HH:mm");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Lesson</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) =>
            date < new Date() || date > addWeeks(new Date(), 4)
          }
          className="rounded-md border"
        />

        {/* Available Times */}
        {selectedDate && (
          <div>
            <h3 className="font-semibold mb-3">
              Available Times for {format(selectedDate, "PPP")}
            </h3>
            {slotsForDate.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {slotsForDate.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    {getLocalTime(slot.time, slot.date)}{" "}
                    {slot.isOptimal && <Badge>Optimal</Badge>}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No slots available</p>
            )}
          </div>
        )}

        {/* Book Button */}
        {selectedTime && (
          <Button onClick={handleBook} className="w-full" size="lg">
            Book{" "}
            {getLocalTime(selectedTime, format(selectedDate!, "yyyy-MM-dd"))} on{" "}
            {format(selectedDate!, "MMM d")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
