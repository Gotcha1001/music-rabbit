"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DownloadRange,
  useScheduleDownload,
} from "@/hooks/useScheduledownload";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface ScheduleDownloadButtonProps {
  schedules: Doc<"schedules">[];
  teachers: Doc<"users">[];
  students: Doc<"users">[];
  books: Doc<"books">[];
  /** Pass the currently-selected teacher ID (or null for all teachers) */
  teacherId: Id<"users"> | null;
  /** The reference date for the range window — use the week-start date
   *  that is already shown in the calendar header */
  referenceDate?: Date;
}

const RANGE_LABELS: Record<DownloadRange, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
};

export function ScheduleDownloadButton({
  schedules,
  teachers,
  students,
  books,
  teacherId,
  referenceDate,
}: ScheduleDownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { downloadSchedule } = useScheduleDownload({
    schedules,
    teachers,
    students,
    books,
    teacherId,
    referenceDate,
  });

  const handleSelect = (range: DownloadRange) => {
    setIsOpen(false);
    downloadSchedule(range);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Schedule
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {(Object.keys(RANGE_LABELS) as DownloadRange[]).map((range) => (
          <DropdownMenuItem
            key={range}
            onClick={() => handleSelect(range)}
            className="cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4 opacity-60" />
            {RANGE_LABELS[range]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
