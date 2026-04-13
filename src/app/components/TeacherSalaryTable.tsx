// components/TeacherSalaryTable.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import React from "react";

const TST_STYLES = `
  /* Main card */
  .tst-card                     { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .tst-card               { background: linear-gradient(to bottom right, rgba(59,7,100,0.8), rgba(0,0,0,0.8)) !important; border-color: rgba(109,40,217,0.5) !important; }

  /* Table header */
  .tst-thead-row                { background: hsl(var(--primary)) !important; border-bottom-color: hsl(var(--primary)/0.2) !important; }
  .dark .tst-thead-row          { background: rgba(76,29,149,0.3) !important; border-bottom-color: rgba(109,40,217,0.5) !important; }

  .tst-sort-btn                 { color: #ffffff !important; font-weight: 600 !important; background: transparent !important; }
  .tst-sort-btn:hover           { background: hsl(var(--primary)/0.8) !important; color: #ffffff !important; }
  .dark .tst-sort-btn           { color: #ddd6fe !important; }
  .dark .tst-sort-btn:hover     { background: rgba(76,29,149,0.5) !important; color: #ffffff !important; }

  .tst-th                       { color: #ffffff !important; font-weight: 600 !important; }
  .dark .tst-th                 { color: #c4b5fd !important; }

  /* Body rows */
  .tst-tr                       { border-bottom-color: hsl(var(--border)) !important; }
  .tst-tr:hover                 { background: hsl(var(--muted)/0.4) !important; }
  .dark .tst-tr                 { border-bottom-color: rgba(76,29,149,0.5) !important; }
  .dark .tst-tr:hover           { background: rgba(76,29,149,0.2) !important; }

  .tst-name                     { color: hsl(var(--foreground)) !important; font-weight: 500 !important; }
  .tst-email                    { color: hsl(var(--muted-foreground)) !important; }
  .tst-icon                     { color: hsl(var(--primary)) !important; }
  .tst-count                    { color: hsl(var(--foreground)) !important; font-weight: 500 !important; }
  .dark .tst-name               { color: #ede9fe !important; }
  .dark .tst-email              { color: #c4b5fd !important; }
  .dark .tst-icon               { color: #a78bfa !important; }
  .dark .tst-count              { color: #ede9fe !important; }

  /* Expanded breakdown row */
  .tst-expanded-cell            { background: hsl(var(--muted)/0.3) !important; border-color: hsl(var(--border)) !important; }
  .dark .tst-expanded-cell      { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.5) !important; }
  .tst-breakdown-title          { color: hsl(var(--foreground)) !important; }
  .dark .tst-breakdown-title    { color: #ede9fe !important; }

  .tst-breakdown-tile           { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .tst-breakdown-tile     { background: rgba(46,16,101,0.5) !important; border-color: rgba(109,40,217,0.5) !important; }
  .tst-breakdown-instrument     { color: hsl(var(--foreground)) !important; font-weight: 500 !important; }
  .tst-breakdown-sub            { color: hsl(var(--muted-foreground)) !important; }
  .dark .tst-breakdown-instrument { color: #ede9fe !important; }
  .dark .tst-breakdown-sub      { color: #c4b5fd !important; }

  /* Details / toggle button */
  .tst-details-btn              { color: hsl(var(--primary)) !important; background: transparent !important; }
  .tst-details-btn:hover        { background: hsl(var(--primary)/0.08) !important; }
  .dark .tst-details-btn        { color: #c4b5fd !important; }
  .dark .tst-details-btn:hover  { background: rgba(76,29,149,0.3) !important; }

  /* Pagination */
  .tst-pag-border               { border-color: hsl(var(--border)) !important; }
  .dark .tst-pag-border         { border-color: rgba(109,40,217,0.5) !important; }
  .tst-pag-text                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .tst-pag-text           { color: #c4b5fd !important; }
  .tst-pag-btn                  { border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; background: transparent !important; }
  .tst-pag-btn:hover:not(:disabled) { background: hsl(var(--muted)) !important; }
  .tst-pag-btn:disabled         { opacity: 0.4 !important; }
  .dark .tst-pag-btn            { border-color: rgba(109,40,217,0.5) !important; color: #c4b5fd !important; }
  .dark .tst-pag-btn:hover:not(:disabled) { background: rgba(76,29,149,0.3) !important; color: #ffffff !important; }

  /* Empty / loading card */
  .tst-empty-card               { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .tst-empty-card         { background: linear-gradient(to bottom right, rgba(59,7,100,0.8), rgba(0,0,0,0.8)) !important; border-color: rgba(109,40,217,0.5) !important; }
  .tst-empty-title              { color: hsl(var(--foreground)) !important; }
  .tst-empty-sub                { color: hsl(var(--muted-foreground)) !important; }
  .dark .tst-empty-title        { color: #ede9fe !important; }
  .dark .tst-empty-sub          { color: #c4b5fd !important; }
`;

interface TeacherSalaryData {
  teacher: {
    _id: string;
    name: string;
    email?: string | null;
    imageUrl?: string;
  };
  completedLessons?: number;
  totalHours?: number;
  totalEarnings?: number;
  paymentStatus?: string;
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

function SortIcon({
  field,
  currentField,
  direction,
}: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}) {
  if (currentField !== field)
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />;
  return direction === "asc" ? (
    <ArrowUp className="ml-2 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4" />
  );
}

function getStatusColor(status?: string) {
  switch (status) {
    case "Paid":
      return "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400";
    case "Processing":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400";
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
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = data
    ? [...data].sort((a, b) => {
        let aVal: string | number, bVal: string | number;
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

  const toggleRowExpansion = (id: string) => {
    const next = new Set(expandedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedRows(next);
  };

  if (loading) {
    return (
      <div className="tst-empty-card rounded-xl border p-4 sm:p-6 shadow-sm">
        <style>{TST_STYLES}</style>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 sm:h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="tst-empty-card rounded-xl border p-10 sm:p-12 text-center shadow-sm">
        <style>{TST_STYLES}</style>
        <User className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary dark:text-purple-400 opacity-40 mb-4" />
        <h3 className="tst-empty-title text-base sm:text-lg font-semibold mb-2">
          No salary data found
        </h3>
        <p className="tst-empty-sub text-sm sm:text-base">
          Try selecting a different month or adjusting your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="tst-card rounded-xl border overflow-hidden shadow-sm">
      <style>{TST_STYLES}</style>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="tst-thead-row">
              {(["name", "lessons", "hours", "earnings"] as SortField[]).map(
                (field) => (
                  <th key={field} className="text-left px-3 sm:px-4 py-3">
                    <button
                      onClick={() => handleSort(field)}
                      className="tst-sort-btn flex items-center text-xs sm:text-sm font-semibold px-2 py-1 rounded transition-all whitespace-nowrap"
                    >
                      {field === "name"
                        ? "Teacher"
                        : field === "lessons"
                          ? "Lessons"
                          : field === "hours"
                            ? "Hours"
                            : "Earnings (ZAR)"}
                      <SortIcon
                        field={field}
                        currentField={sortField}
                        direction={sortDirection}
                      />
                    </button>
                  </th>
                ),
              )}
              <th className="tst-th px-3 sm:px-4 py-3 text-left text-xs sm:text-sm whitespace-nowrap">
                Status
              </th>
              <th className="tst-th px-3 sm:px-4 py-3 text-right text-xs sm:text-sm whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <React.Fragment key={item.teacher._id}>
                <tr className="tst-tr border-b">
                  {/* Teacher */}
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                        <AvatarImage src={item.teacher.imageUrl} />
                        <AvatarFallback className="bg-primary dark:bg-purple-800 text-white text-xs">
                          {item.teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="tst-name text-xs sm:text-sm truncate">
                          {item.teacher.name}
                        </div>
                        <div className="tst-email text-xs truncate">
                          {item.teacher.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Lessons */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="tst-icon h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="tst-count text-xs sm:text-sm">
                        {item.completedLessons || 0}
                      </span>
                    </div>
                  </td>

                  {/* Hours */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="tst-icon h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="tst-count text-xs sm:text-sm">
                        {(item.totalHours || 0).toFixed(1)}h
                      </span>
                    </div>
                  </td>

                  {/* Earnings */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="tst-icon h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
                        R{(item.totalEarnings || 0).toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(item.paymentStatus)}`}
                    >
                      {item.paymentStatus || "Pending"}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">
                    {item.lessonBreakdown &&
                      item.lessonBreakdown.length > 0 && (
                        <button
                          onClick={() => toggleRowExpansion(item.teacher._id)}
                          className="tst-details-btn px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all"
                        >
                          {expandedRows.has(item.teacher._id)
                            ? "Hide"
                            : "Details"}
                        </button>
                      )}
                  </td>
                </tr>

                {/* Expanded breakdown */}
                {expandedRows.has(item.teacher._id) && item.lessonBreakdown && (
                  <tr>
                    <td
                      colSpan={6}
                      className="tst-expanded-cell border-b px-3 sm:px-4 py-3 sm:py-4"
                    >
                      <h4 className="tst-breakdown-title font-semibold text-xs sm:text-sm mb-3">
                        Lesson Breakdown by Instrument
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                        {item.lessonBreakdown.map((b, idx) => (
                          <div
                            key={idx}
                            className="tst-breakdown-tile rounded-lg p-2 sm:p-3 border"
                          >
                            <div className="tst-breakdown-instrument text-xs sm:text-sm">
                              {b.instrument}
                            </div>
                            <div className="tst-breakdown-sub text-xs mt-1">
                              {b.count} lessons · {b.hours.toFixed(1)}h
                            </div>
                            <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold mt-1">
                              R{b.earnings.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="tst-pag-border flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t flex-wrap gap-2">
          <span className="tst-pag-text text-xs sm:text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              {
                icon: ChevronsLeft,
                action: () => onPageChange(1),
                disabled: currentPage === 1,
              },
              {
                icon: ChevronLeft,
                action: () => onPageChange(currentPage - 1),
                disabled: currentPage === 1,
              },
              {
                icon: ChevronRight,
                action: () => onPageChange(currentPage + 1),
                disabled: currentPage === totalPages,
              },
              {
                icon: ChevronsRight,
                action: () => onPageChange(totalPages),
                disabled: currentPage === totalPages,
              },
            ].map(({ icon: Icon, action, disabled }, i) => (
              <button
                key={i}
                onClick={action}
                disabled={disabled}
                className="tst-pag-btn p-1.5 sm:p-2 rounded-lg border transition-all"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
