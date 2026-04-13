// app/dashboard/student/stats/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Award } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const STATS_STYLES = `
  .stats-page                   { background: #ffffff !important; }
  .dark .stats-page             { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .stats-title                  { color: hsl(var(--foreground)) !important; }
  .dark .stats-title            { color: #ddd6fe !important; }

  .stats-card                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .stats-card             { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-color: rgba(109,40,217,0.5) !important; box-shadow: 0 0 30px rgba(139,92,246,0.12) !important; }

  .stats-card-title             { color: hsl(var(--foreground)) !important; }
  .dark .stats-card-title       { color: #ddd6fe !important; }

  .stats-big-num                { color: hsl(var(--foreground)) !important; }
  .dark .stats-big-num          { color: #ede9fe !important; }

  .stats-sub                    { color: hsl(var(--muted-foreground)) !important; }
  .dark .stats-sub              { color: #c4b5fd !important; }

  .stats-badge                  { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .dark .stats-badge            { background: rgba(109,40,217,0.7) !important; color: #ede9fe !important; }

  .stats-row                    { color: hsl(var(--foreground)) !important; border-color: hsl(var(--border)) !important; }
  .dark .stats-row              { color: #ddd6fe !important; border-color: rgba(109,40,217,0.2) !important; }

  .stats-row-val                { color: hsl(var(--foreground)) !important; }
  .dark .stats-row-val          { color: #ede9fe !important; }
`;

export default function StudentStatsPage() {
  const currentUser = useQuery(api.users.get);
  const stats = useQuery(
    api.studentPackages.getPackageStats,
    currentUser ? { studentId: currentUser._id } : "skip",
  );

  if (!stats?.hasActivePackage) {
    return (
      <div className="stats-page min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <style>{STATS_STYLES}</style>
        <div className="stats-card max-w-md w-full rounded-xl border-2 p-6 sm:p-8 text-center shadow-sm">
          <p className="stats-sub text-base sm:text-lg">
            No active package. Please purchase a package to start learning!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page min-h-screen p-4 sm:p-6">
      <style>{STATS_STYLES}</style>
      <div className="container mx-auto max-w-5xl">
        <h1 className="stats-title text-3xl sm:text-5xl font-bold mb-6 sm:mb-8 font-serif">
          Your Learning Statistics
        </h1>

        {/* ── Top two cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Minutes used */}
          <div className="stats-card rounded-xl border-2 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-inherit">
              <h2 className="stats-card-title flex items-center gap-2 text-base sm:text-lg font-bold">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-purple-400 shrink-0" />
                Minutes Used
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="stats-big-num text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
                {stats.minutesUsed} / {stats.totalMinutes}
              </div>
              <Progress value={stats.percentageUsed} className="h-2.5 sm:h-3" />
              <p className="stats-sub text-xs sm:text-sm mt-2">
                {stats.percentageUsed}% of monthly minutes used
              </p>
            </div>
          </div>

          {/* Lessons progress */}
          <div className="stats-card rounded-xl border-2 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-inherit">
              <h2 className="stats-card-title flex items-center gap-2 text-base sm:text-lg font-bold">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-purple-400 shrink-0" />
                Lessons Progress
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="stats-big-num text-3xl sm:text-4xl font-bold mb-2">
                {stats.lessonsCompleted}
              </div>
              <p className="stats-sub text-sm sm:text-base">
                Lessons completed this month
              </p>
              <span className="stats-badge inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold">
                {stats.lessonsRemaining} lessons remaining
              </span>
            </div>
          </div>
        </div>

        {/* ── Package details ── */}
        <div className="stats-card rounded-xl border-2 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="stats-card-title flex items-center gap-2 text-base sm:text-lg font-bold">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-purple-400 shrink-0" />
              Package Details
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {[
              {
                label: "Package Type",
                value: (
                  <span className="stats-badge px-3 py-1 rounded-full text-sm font-semibold">
                    {stats.package.packageType}
                  </span>
                ),
              },
              {
                label: "Minutes Per Lesson",
                value: `${stats.package.minutesPerLesson} min`,
              },
              {
                label: "Lessons Per Week",
                value: `${stats.package.lessonsPerWeek}x`,
              },
              {
                label: "Monthly Price",
                value: `$${stats.package.monthlyPrice}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="stats-row flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <span className="text-sm sm:text-base">{label}</span>
                <span className="stats-row-val font-bold text-sm sm:text-base">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
