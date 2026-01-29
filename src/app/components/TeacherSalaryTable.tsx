// components/TeacherSalaryTable.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  Clock,
  BookOpen,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface TeacherSalaryData {
  teacher: {
    _id: string;
    name: string;
    email?: string | null; // ✅ Changed from string to string | null
    imageUrl?: string;
  };
  completedLessons?: number;
  totalHours?: number;
  totalEarnings?: number;
  paymentStatus?: string; // ✅ Changed from "Paid" | "Pending" | "Processing" to string
  lessonBreakdown?: {
    instrument: string;
    count: number;
    hours: number;
    earnings: number;
  }[];
}

interface TeacherSalaryTableProps {
  data?: TeacherSalaryData[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type SortField = "name" | "lessons" | "hours" | "earnings";
type SortDirection = "asc" | "desc";

// ✅ FIXED: Move SortIcon component outside the main component
function SortIcon({
  field,
  currentField,
  direction,
}: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}) {
  if (currentField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
  return direction === "asc" ? (
    <ArrowUp className="ml-2 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4" />
  );
}

// ✅ Helper function for status colors
function getStatusColor(status?: string) {
  switch (status) {
    case "Paid":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "Processing":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

export function TeacherSalaryTable({
  data,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}: TeacherSalaryTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = data
    ? [...data].sort((a, b) => {
        let aVal, bVal;

        switch (sortField) {
          case "name":
            aVal = a.teacher.name.toLowerCase();
            bVal = b.teacher.name.toLowerCase();
            break;
          case "lessons":
            aVal = a.completedLessons || 0;
            bVal = b.completedLessons || 0;
            break;
          case "hours":
            aVal = a.totalHours || 0;
            bVal = b.totalHours || 0;
            break;
          case "earnings":
            aVal = a.totalEarnings || 0;
            bVal = b.totalEarnings || 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  const toggleRowExpansion = (teacherId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(teacherId)) {
      newExpanded.delete(teacherId);
    } else {
      newExpanded.add(teacherId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-950/80 to-black/80 border-purple-800/50">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-purple-900/20" />
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-purple-950/80 to-black/80 border-purple-800/50">
        <User className="h-12 w-12 mx-auto text-purple-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-purple-100">
          No salary data found
        </h3>
        <p className="text-purple-300">
          Try selecting a different month or adjusting your search filters.
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-950/80 to-black/80 border-purple-800/50">
      <Table>
        <TableHeader>
          <TableRow className="border-purple-800/50 hover:bg-purple-900/20">
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="font-semibold text-purple-200 hover:text-purple-100 hover:bg-purple-900/30"
              >
                Teacher
                <SortIcon
                  field="name"
                  currentField={sortField}
                  direction={sortDirection}
                />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("lessons")}
                className="font-semibold text-purple-200 hover:text-purple-100 hover:bg-purple-900/30"
              >
                Lessons
                <SortIcon
                  field="lessons"
                  currentField={sortField}
                  direction={sortDirection}
                />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("hours")}
                className="font-semibold text-purple-200 hover:text-purple-100 hover:bg-purple-900/30"
              >
                Hours
                <SortIcon
                  field="hours"
                  currentField={sortField}
                  direction={sortDirection}
                />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("earnings")}
                className="font-semibold text-purple-200 hover:text-purple-100 hover:bg-purple-900/30"
              >
                Earnings (ZAR)
                <SortIcon
                  field="earnings"
                  currentField={sortField}
                  direction={sortDirection}
                />
              </Button>
            </TableHead>
            <TableHead className="text-purple-200">Status</TableHead>
            <TableHead className="text-right text-purple-200">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <React.Fragment key={item.teacher._id}>
              <TableRow className="border-purple-900/50 hover:bg-purple-900/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={item.teacher.imageUrl} />
                      <AvatarFallback className="bg-purple-800 text-purple-100">
                        {item.teacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-purple-100">
                        {item.teacher.name}
                      </div>
                      <div className="text-sm text-purple-300">
                        {item.teacher.email || "No email"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-400" />
                    <span className="font-medium text-purple-100">
                      {item.completedLessons || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-100">
                      {(item.totalHours || 0).toFixed(1)}h
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-400" />
                    <span className="font-semibold text-green-400">
                      R{(item.totalEarnings || 0).toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(item.paymentStatus)}
                  >
                    {item.paymentStatus || "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {item.lessonBreakdown && item.lessonBreakdown.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(item.teacher._id)}
                      className="text-purple-200 hover:text-purple-100 hover:bg-purple-900/30"
                    >
                      {expandedRows.has(item.teacher._id) ? "Hide" : "Details"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>

              {/* Expanded row showing lesson breakdown */}
              {expandedRows.has(item.teacher._id) && item.lessonBreakdown && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="bg-purple-900/30 border-purple-800/50"
                  >
                    <div className="p-4 space-y-2">
                      <h4 className="font-semibold text-sm mb-3 text-purple-100">
                        Lesson Breakdown by Instrument
                      </h4>
                      <div className="grid grid-cols-4 gap-4">
                        {item.lessonBreakdown.map((breakdown, idx) => (
                          <div
                            key={idx}
                            className="bg-purple-950/50 rounded-lg p-3 border border-purple-800/50"
                          >
                            <div className="font-medium text-sm text-purple-100">
                              {breakdown.instrument}
                            </div>
                            <div className="text-xs text-purple-300 mt-1">
                              {breakdown.count} lessons •{" "}
                              {breakdown.hours.toFixed(1)}h
                            </div>
                            <div className="text-sm font-semibold mt-1 text-green-400">
                              R{breakdown.earnings.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-purple-800/50">
          <div className="text-sm text-purple-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="border-purple-700 text-purple-200 hover:bg-purple-900/30 hover:text-purple-100"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-purple-700 text-purple-200 hover:bg-purple-900/30 hover:text-purple-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-purple-700 text-purple-200 hover:bg-purple-900/30 hover:text-purple-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="border-purple-700 text-purple-200 hover:bg-purple-900/30 hover:text-purple-100"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
