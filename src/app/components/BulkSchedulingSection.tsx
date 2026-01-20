// app/components/BulkSchedulingSection.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, addWeeks, addDays } from "date-fns";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function BulkSchedulingSection() {
  const [selectedStudent, setSelectedStudent] = useState<Id<"users"> | null>(
    null,
  );
  const [selectedTeacher, setSelectedTeacher] = useState<Id<"users"> | null>(
    null,
  );
  const [weeksAhead, setWeeksAhead] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [time, setTime] = useState<string>("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePackage = useQuery(
    api.studentPackages.getActivePackage,
    selectedStudent ? { studentId: selectedStudent } : "skip",
  );

  const allStudents = useQuery(api.users.getAllStudents) ?? [];
  const allTeachers = useQuery(api.users.getAllTeachers) ?? [];

  const adminBulkCreateLessons = useMutation(
    api.schedules.adminBulkCreateLessons,
  );

  // Helper to check if date is Mon-Fri
  const isWorkingDay = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  };

  // Generate dates based on package settings
  const generateRecurringDates = (lessonsPerWeek: number): string[] => {
    const dates: string[] = [];
    const current = new Date(startDate);
    const endDate = addWeeks(current, weeksAhead);

    // Calculate how many days to spread lessons across the week
    const daysPerWeek = 5; // Mon-Fri
    const interval = Math.floor(daysPerWeek / lessonsPerWeek);

    let weekStart = new Date(current);

    while (weekStart < endDate) {
      let lessonsThisWeek = 0;
      let dayOffset = 0;

      while (lessonsThisWeek < lessonsPerWeek && dayOffset < 7) {
        const checkDate = addDays(weekStart, dayOffset);
        const dateStr = format(checkDate, "yyyy-MM-dd");

        if (
          isWorkingDay(dateStr) &&
          checkDate >= current &&
          checkDate < endDate
        ) {
          dates.push(dateStr);
          lessonsThisWeek++;
          dayOffset += interval > 0 ? interval : 1;
        } else {
          dayOffset++;
        }
      }

      // Move to next week
      weekStart = addDays(weekStart, 7);
    }

    return dates;
  };

  const handleBulkSchedule = async () => {
    if (!selectedTeacher || !selectedStudent || !activePackage) {
      toast.error("Missing required information");
      return;
    }

    setIsSubmitting(true);

    try {
      const dates = generateRecurringDates(activePackage.lessonsPerWeek);

      if (dates.length === 0) {
        toast.error("No valid dates generated");
        return;
      }

      const result = await adminBulkCreateLessons({
        teacherId: selectedTeacher,
        studentId: selectedStudent,
        dates,
        time,
        duration: activePackage.minutesPerLesson,
        bookId: undefined,
      });

      toast.success(
        `Scheduled ${result.created} lessons! ${
          result.skipped > 0
            ? `(${result.skipped} skipped due to conflicts)`
            : ""
        }`,
      );

      // Reset form
      setSelectedStudent(null);
      setSelectedTeacher(null);
      setTime("10:00");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create schedule";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-950/60 to-black/60 border-2 border-purple-800/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-serif text-purple-200">
          <Calendar className="h-7 w-7 text-purple-400" />
          Bulk Schedule Lessons (Package-Based)
        </CardTitle>
        <p className="text-purple-400 text-sm mt-2">
          Automatically create recurring lessons based on student&apos;s package
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Student Selection */}
        <div>
          <Label className="text-purple-300">Student</Label>
          <Select
            onValueChange={(v) => setSelectedStudent(v as Id<"users">)}
            value={selectedStudent || undefined}
          >
            <SelectTrigger className="bg-purple-900/30 border-purple-700 text-purple-200">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {allStudents.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name || s.email.split("@")[0]} (
                  {s.instrument || "No instrument"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teacher Selection */}
        <div>
          <Label className="text-purple-300">Teacher</Label>
          <Select
            onValueChange={(v) => setSelectedTeacher(v as Id<"users">)}
            value={selectedTeacher || undefined}
          >
            <SelectTrigger className="bg-purple-900/30 border-purple-700 text-purple-200">
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent>
              {allTeachers.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.name || t.email.split("@")[0]} (
                  {t.instrument || "No instrument"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Package Info Display */}
        {activePackage && (
          <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
            <p className="text-purple-200 font-semibold mb-2">
              Active Package:
            </p>
            <div className="text-purple-300 text-sm space-y-1">
              <p>• {activePackage.lessonsPerWeek} lessons per week</p>
              <p>• {activePackage.minutesPerLesson} minutes per lesson</p>
              <p>• {activePackage.remainingMinutes} minutes remaining</p>
            </div>
          </div>
        )}

        {/* Start Date */}
        <div>
          <Label className="text-purple-300">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-purple-900/30 border-purple-700 text-purple-200"
          />
        </div>

        {/* Weeks Ahead */}
        <div>
          <Label className="text-purple-300">Weeks Ahead</Label>
          <Input
            type="number"
            value={weeksAhead}
            onChange={(e) => setWeeksAhead(parseInt(e.target.value))}
            min={1}
            max={12}
            className="bg-purple-900/30 border-purple-700 text-purple-200"
          />
        </div>

        {/* Lesson Time */}
        <div>
          <Label className="text-purple-300">Lesson Time (same for all)</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-purple-900/30 border-purple-700 text-purple-200"
          />
          <p className="text-xs text-purple-400/70 mt-1">
            Time will be in teacher&apos;s timezone (10:00 - 17:00)
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleBulkSchedule}
          disabled={
            !activePackage ||
            !selectedTeacher ||
            !selectedStudent ||
            isSubmitting
          }
          className="w-full bg-purple-700 hover:bg-purple-600 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Schedule...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Bulk Schedule
            </>
          )}
        </Button>

        {!activePackage && selectedStudent && (
          <p className="text-red-400 text-sm text-center">
            {"This student doesn't have an active package"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
