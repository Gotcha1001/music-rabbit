// app/dashboard/admin/salaries/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Download, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { api } from "../../../../../convex/_generated/api";
import { generateSalaryPDF } from "@/lib/generateSalaryPDF";
import { SalaryOverview } from "@/app/components/SalaryOverview";
import { SalaryFilters } from "@/app/components/SalaryFilters";
import { TeacherSalaryTable } from "@/app/components/TeacherSalaryTable";
import { TeacherSalaryData } from "@/app/types/salaries";

export default function TeacherSalariesPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all teachers
  const teachers = useQuery(api.users.getAllTeachers);

  // Fetch salary data for the selected month
  const salaryData = useQuery(api.payments.getTeacherSalariesForMonth, {
    month: selectedMonth,
  });

  const loading = teachers === undefined || salaryData === undefined;

  // Filter teachers based on search query
  const filteredTeachers =
    teachers?.filter((teacher) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (teacher.name?.toLowerCase().includes(searchLower) ?? false) ||
        (teacher.email?.toLowerCase().includes(searchLower) ?? false) ||
        teacher.clerkId.toLowerCase().includes(searchLower)
      );
    }) ?? [];

  // Combine teacher info with salary data
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

  // Pagination
  const totalPages = Math.ceil(teacherSalaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = teacherSalaries.slice(startIndex, endIndex);

  // Calculate totals
  const totalEarnings =
    salaryData?.reduce((sum, s) => sum + (s.totalEarnings ?? 0), 0) ?? 0;
  const totalLessons =
    salaryData?.reduce((sum, s) => sum + (s.completedLessons ?? 0), 0) ?? 0;
  const totalHours =
    salaryData?.reduce((sum, s) => sum + (s.totalHours ?? 0), 0) ?? 0;

  const handleExportPDF = async () => {
    if (teacherSalaries.length === 0 || !selectedMonth) return;

    await generateSalaryPDF({
      teacherSalaries,
      month: selectedMonth,
      totalEarnings,
      totalLessons,
      totalHours,
    });
  };

  const handleExportCSV = () => {
    if (teacherSalaries.length === 0 || !selectedMonth) return;

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
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teacher-salaries-${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Teacher Salaries
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor monthly teacher payments and lesson placements
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            Export CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <SalaryOverview
        totalEarnings={totalEarnings}
        totalLessons={totalLessons}
        totalHours={totalHours}
        teacherCount={teacherSalaries.length}
        loading={loading}
      />

      {/* Filters */}
      <Card className="p-4">
        <SalaryFilters
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </Card>

      {/* Table */}
      <TeacherSalaryTable
        data={paginatedData}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
