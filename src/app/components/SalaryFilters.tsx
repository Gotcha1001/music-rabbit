// components/SalaryFilters.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";

interface SalaryFiltersProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SalaryFilters({
  selectedMonth,
  onMonthChange,
  searchQuery,
  onSearchChange,
}: SalaryFiltersProps) {
  // Generate month options for the past 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const value = `${year}-${month}`;
    const label = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    return { value, label };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="month-select" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Select Month
        </Label>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger id="month-select">
            <SelectValue placeholder="Select a month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option, index) => (
              <SelectItem key={index} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="search-teacher" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Teacher
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-teacher"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
