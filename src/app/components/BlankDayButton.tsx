"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  CalendarOff,
  Loader2,
  AlertTriangle,
  History,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

export function BlankDayButton() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reason, setReason] = useState("Public Holiday");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const blankOutDay = useMutation(api.publicHolidays.blankOutDay);
  const holidays = useQuery(api.publicHolidays.getAll) ?? [];

  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const displayDate = selectedDate ? format(selectedDate, "PPP") : null; // e.g. "April 18, 2025"

  const handleBlank = async () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const result = await blankOutDay({
        date: formattedDate,
        reason: reason.trim() || undefined,
      });
      toast.success(
        `Done — ${result.totalLessonsAffected} lesson${result.totalLessonsAffected !== 1 ? "s" : ""} cancelled on ${displayDate}`,
      );
      setSelectedDate(undefined);
      setReason("Public Holiday");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to blank out day";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-red-700/40 bg-red-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-300 text-lg">
            <CalendarOff className="h-5 w-5" />
            Blank Out a Day
          </CardTitle>
          <p className="text-sm text-red-400/80">
            Cancel all lessons on a specific date (e.g. public holidays). Admin
            only.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Calendar date picker */}
            <div>
              <Label className="text-red-300 text-sm mb-1.5 block">Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-red-700/50 bg-red-950/30 hover:bg-red-900/40 hover:border-red-500",
                      selectedDate ? "text-red-100" : "text-red-600",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {displayDate ?? "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reason */}
            <div>
              <Label className="text-red-300 text-sm mb-1.5 block">
                Reason
              </Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Public Holiday, School closed"
                className="border-red-700/50 bg-red-950/30 text-red-100 placeholder:text-red-700 focus:border-red-500"
              />
            </div>
          </div>

          {/* Inline confirm */}
          {showConfirm ? (
            <div className="p-4 rounded-lg border-2 border-amber-500/50 bg-amber-950/30 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-200">Are you sure?</p>
                  <p className="text-sm text-amber-400/90 mt-0.5">
                    This will cancel <strong>all lessons</strong> on{" "}
                    <strong>{displayDate}</strong> with reason:{" "}
                    <em>&#34;{reason || "Public Holiday"}&#34;</em>. This cannot
                    be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleConfirm}
                  className="bg-red-600 hover:bg-red-500"
                >
                  Yes, cancel all lessons
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowConfirm(false)}
                  className="text-amber-300 hover:text-amber-100"
                >
                  Go back
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleBlank}
              disabled={loading || !selectedDate}
              variant="destructive"
              className="w-full bg-red-700 hover:bg-red-600 border border-red-500/50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Cancelling lessons...
                </>
              ) : (
                <>
                  <CalendarOff className="mr-2 h-4 w-4" />
                  Cancel All Lessons on This Day
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* History of blanked days */}
      {holidays.length > 0 && (
        <Card className="border border-slate-700/50 bg-slate-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-300 text-sm">
              <History className="h-4 w-4" />
              Previous Blanked Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {holidays.map((h) => (
                <div
                  key={h._id}
                  className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/50 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-300">
                      {format(new Date(h.date + "T00:00:00"), "PPP")}
                    </span>
                    <span className="text-slate-400">{h.reason}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs border-slate-600 text-slate-400"
                  >
                    {h.lessonsAffected} lesson
                    {h.lessonsAffected !== 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
