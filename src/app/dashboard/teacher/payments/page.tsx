// app/dashboard/teacher/payments/page.tsx
"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useQuery } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const PAY_STYLES = `
  .pay-page                     { background: #ffffff !important; }
  .dark .pay-page               { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .pay-title                    { color: hsl(var(--foreground)) !important; }
  .dark .pay-title              { color: #ede9fe !important; }

  /* Summary + detail cards */
  .pay-card                     { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .pay-card               { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 24px rgba(139,92,246,0.1) !important; }

  .pay-card-title               { color: hsl(var(--foreground)) !important; }
  .dark .pay-card-title         { color: #ddd6fe !important; }

  .pay-big-num                  { color: hsl(var(--foreground)) !important; }
  .dark .pay-big-num            { color: #ede9fe !important; }

  .pay-sub                      { color: hsl(var(--muted-foreground)) !important; }
  .dark .pay-sub                { color: #a78bfa !important; }

  /* Table header */
  .pay-thead-row                { background: hsl(var(--primary)) !important; border-bottom-color: hsl(var(--primary)/0.2) !important; }
  .dark .pay-thead-row          { background: rgba(76,29,149,0.4) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }

  .pay-th                       { color: #ffffff !important; font-weight: 600 !important; }
  .dark .pay-th                 { color: #c4b5fd !important; }

  /* Table body rows */
  .pay-tr                       { border-bottom-color: hsl(var(--border)) !important; }
  .pay-tr:hover                 { background: hsl(var(--muted)/0.4) !important; }
  .dark .pay-tr                 { border-bottom-color: rgba(109,40,217,0.2) !important; }
  .dark .pay-tr:hover           { background: rgba(76,29,149,0.15) !important; }

  .pay-td                       { color: hsl(var(--foreground)) !important; }
  .dark .pay-td                 { color: #ddd6fe !important; }

  /* Export button */
  .pay-export-btn               { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; background: transparent !important; }
  .pay-export-btn:hover         { background: hsl(var(--primary)/0.08) !important; }
  .dark .pay-export-btn         { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; }
  .dark .pay-export-btn:hover   { background: rgba(76,29,149,0.3) !important; }

  /* Chart container */
  .pay-chart-bg                 { background: hsl(var(--muted)/0.3) !important; border-radius: 0.75rem !important; }
  .dark .pay-chart-bg           { background: rgba(76,29,149,0.1) !important; }
`;

export default function TeacherPayments() {
  const { userDetail } = useUserDetail();

  const earningsSummary = useQuery(
    api.payments.getEarningsSummary,
    userDetail?.role === "teacher"
      ? { teacherId: userDetail._id as Id<"users"> }
      : "skip",
  );
  const detailedEarnings = useQuery(
    api.payments.getDetailedEarnings,
    userDetail?.role === "teacher"
      ? { teacherId: userDetail._id as Id<"users"> }
      : "skip",
  );
  const [chartData] = useState([]);

  if (!userDetail) {
    return (
      <div className="pay-page min-h-screen flex items-center justify-center">
        <style>{PAY_STYLES}</style>
        <p className="pay-sub">Loading profile...</p>
      </div>
    );
  }
  if (userDetail.role !== "teacher") {
    return (
      <div className="pay-page min-h-screen flex items-center justify-center">
        <style>{PAY_STYLES}</style>
        <p className="text-destructive">Unauthorized</p>
      </div>
    );
  }
  if (earningsSummary === undefined || detailedEarnings === undefined) {
    return (
      <div className="pay-page min-h-screen container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <style>{PAY_STYLES}</style>
        <Skeleton className="h-9 w-48 sm:w-64" />
        <Skeleton className="h-36 sm:h-40 w-full rounded-xl" />
        <Skeleton className="h-72 sm:h-96 w-full rounded-xl" />
      </div>
    );
  }

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Time,Duration,Status,Earnings,Deduction\n" +
      detailedEarnings
        .map(
          (e) =>
            `${e.date},${e.time},${e.duration},${e.status},${e.earnings.toFixed(2)},${e.deduction.toFixed(2)}`,
        )
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "earnings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pay-page min-h-screen">
      <style>{PAY_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <h1 className="pay-title text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-serif">
          My Earnings
        </h1>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Today */}
          <div className="pay-card rounded-xl border-2 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-inherit">
              <h2 className="pay-card-title text-base sm:text-lg font-bold">
                Today&apos;s Earnings
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-1 sm:space-y-2">
              <p className="pay-big-num text-2xl sm:text-3xl font-bold">
                ${earningsSummary.today.earnings.toFixed(2)}
              </p>
              <p className="pay-sub text-xs sm:text-sm">
                {earningsSummary.today.hours.toFixed(1)} hours taught
              </p>
            </div>
          </div>

          {/* Month */}
          <div className="pay-card rounded-xl border-2 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-inherit">
              <h2 className="pay-card-title text-base sm:text-lg font-bold">
                This Month
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-1 sm:space-y-2">
              <p className="pay-big-num text-2xl sm:text-3xl font-bold">
                ${earningsSummary.month.earnings.toFixed(2)}
              </p>
              <p className="pay-sub text-xs sm:text-sm">
                {earningsSummary.month.hours.toFixed(1)} hours • $
                {earningsSummary.month.deductions.toFixed(2)} deductions
              </p>
            </div>
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="pay-card rounded-xl border-2 overflow-hidden shadow-sm mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="pay-card-title text-base sm:text-lg font-bold">
              Earnings Chart
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="pay-chart-bg p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="earnings"
                    fill="#7c3aed"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="deductions"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Detailed earnings table ── */}
        <div className="pay-card rounded-xl border-2 overflow-hidden shadow-sm">
          {/* Header row with export */}
          <div className="p-4 sm:p-6 border-b border-inherit flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="pay-card-title text-base sm:text-lg font-bold">
              Detailed Earnings
            </h2>
            <button
              onClick={handleExport}
              className="pay-export-btn flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 w-full sm:w-auto justify-center"
            >
              <Download className="h-4 w-4 shrink-0" />
              Export CSV
            </button>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="pay-thead-row">
                  {[
                    "Date",
                    "Time",
                    "Duration (min)",
                    "Status",
                    "Earnings",
                    "Deduction",
                  ].map((h) => (
                    <th
                      key={h}
                      className="pay-th px-4 sm:px-6 py-3 text-left font-serif whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailedEarnings.map((earning, index) => (
                  <tr key={index} className="pay-tr border-b">
                    <td className="pay-td px-4 sm:px-6 py-3 whitespace-nowrap">
                      {earning.date}
                    </td>
                    <td className="pay-td px-4 sm:px-6 py-3 whitespace-nowrap">
                      {earning.time}
                    </td>
                    <td className="pay-td px-4 sm:px-6 py-3 whitespace-nowrap">
                      {earning.duration}
                    </td>
                    <td className="pay-td px-4 sm:px-6 py-3 whitespace-nowrap">
                      {earning.status}
                    </td>
                    <td className="pay-td px-4 sm:px-6 py-3 font-semibold whitespace-nowrap">
                      ${earning.earnings.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                      -${earning.deduction.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {detailedEarnings.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="pay-sub px-6 py-10 text-center text-sm"
                    >
                      No earnings recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
