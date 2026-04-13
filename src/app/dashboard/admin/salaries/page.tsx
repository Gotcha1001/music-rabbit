// app/dashboard/admin/salaries/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Download, DollarSign } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { generateSalaryPDF } from "@/lib/generateSalaryPDF";
import { SalaryOverview } from "@/app/components/SalaryOverview";
import { SalaryFilters } from "@/app/components/SalaryFilters";
import { TeacherSalaryTable } from "@/app/components/TeacherSalaryTable";
import { TeacherSalaryData } from "@/app/types/salaries";

const SAL_STYLES = `
  .sal-page                   { background: #ffffff !important; }
  .dark .sal-page             { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .sal-title                  { color: hsl(var(--foreground)) !important; }
  .sal-subtitle               { color: hsl(var(--muted-foreground)) !important; }
  .dark .sal-title            { color: #ede9fe !important; }
  .dark .sal-subtitle         { color: #a78bfa !important; }

  .sal-icon                   { color: hsl(var(--primary)) !important; }
  .dark .sal-icon             { color: #c4b5fd !important; }

  /* Export buttons */
  .sal-csv-btn                { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; background: transparent !important; }
  .sal-csv-btn:hover          { background: hsl(var(--primary)/0.08) !important; }
  .dark .sal-csv-btn          { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; }
  .dark .sal-csv-btn:hover    { background: rgba(76,29,149,0.3) !important; }

  .sal-pdf-btn                { background: hsl(var(--primary)) !important; color: #ffffff !important; border: none !important; }
  .sal-pdf-btn:hover          { background: hsl(var(--primary)/0.9) !important; }
  .dark .sal-pdf-btn          { background: #7c3aed !important; }
  .dark .sal-pdf-btn:hover    { background: #6d28d9 !important; }

  /* Filter card */
  .sal-filter-card            { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important; }
  .dark .sal-filter-card      { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }
`;

export default function TeacherSalariesPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const teachers = useQuery(api.users.getAllTeachers);
  const salaryData = useQuery(api.payments.getTeacherSalariesForMonth, {
    month: selectedMonth,
  });
  const loading = teachers === undefined || salaryData === undefined;

  const filteredTeachers =
    teachers?.filter((teacher) => {
      const q = searchQuery.toLowerCase();
      return (
        (teacher.name?.toLowerCase().includes(q) ?? false) ||
        (teacher.email?.toLowerCase().includes(q) ?? false) ||
        teacher.clerkId.toLowerCase().includes(q)
      );
    }) ?? [];

  const teacherSalaries: TeacherSalaryData[] = filteredTeachers.map(
    (teacher) => {
      const salary = salaryData?.find((s) => s.teacherId === teacher._id);
      return {
        teacher: {
          _id: teacher._id,
          name: teacher.name ?? teacher.email ?? teacher.clerkId ?? "Unknown",
          email: teacher.email ?? null,
        },
        completedLessons: salary?.completedLessons,
        totalHours: salary?.totalHours,
        totalEarnings: salary?.totalEarnings,
        lessonBreakdown: salary?.lessonBreakdown,
        paymentStatus: salary?.paymentStatus,
      };
    },
  );

  const totalPages = Math.ceil(teacherSalaries.length / itemsPerPage);
  const paginatedData = teacherSalaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalEarnings =
    salaryData?.reduce((sum, s) => sum + (s.totalEarnings ?? 0), 0) ?? 0;
  const totalLessons =
    salaryData?.reduce((sum, s) => sum + (s.completedLessons ?? 0), 0) ?? 0;
  const totalHours =
    salaryData?.reduce((sum, s) => sum + (s.totalHours ?? 0), 0) ?? 0;

  const handleExportPDF = async () => {
    if (!teacherSalaries.length || !selectedMonth) return;
    await generateSalaryPDF({
      teacherSalaries,
      month: selectedMonth,
      totalEarnings,
      totalLessons,
      totalHours,
    });
  };

  const handleExportCSV = () => {
    if (!teacherSalaries.length || !selectedMonth) return;
    const headers = [
      "Teacher Name",
      "Email",
      "Completed Lessons",
      "Total Hours",
      "Earnings (ZAR)",
      "Status",
    ];
    const rows = teacherSalaries.map((ts) => [
      ts.teacher.name,
      ts.teacher.email ?? "N/A",
      ts.completedLessons ?? 0,
      (ts.totalHours ?? 0).toFixed(2),
      (ts.totalEarnings ?? 0).toFixed(2),
      ts.paymentStatus ?? "Pending",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvContent], { type: "text/csv" }));
    a.download = `teacher-salaries-${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="sal-page min-h-screen">
      <style>{SAL_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="sal-title text-2xl sm:text-3xl font-bold flex items-center gap-2 font-serif">
              <DollarSign className="sal-icon h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
              Teacher Salaries
            </h1>
            <p className="sal-subtitle text-sm sm:text-base mt-1">
              Monitor monthly teacher payments and lesson placements
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="sal-csv-btn flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-200"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="sal-pdf-btn flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Overview cards — child component, themed via globals */}
        <SalaryOverview
          totalEarnings={totalEarnings}
          totalLessons={totalLessons}
          totalHours={totalHours}
          teacherCount={teacherSalaries.length}
          loading={loading}
        />

        {/* Filters */}
        <div className="sal-filter-card rounded-xl border p-3 sm:p-4 shadow-sm">
          <SalaryFilters
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Table */}
        <TeacherSalaryTable
          data={paginatedData}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
