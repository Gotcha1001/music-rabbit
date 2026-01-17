// components/TeacherStatsComponent.tsx
"use client";

import React from "react";
import { useQuery } from "convex/react";

import { useUserDetail } from "@/context/UserDetailContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

const COLORS = {
  completed: "#10b981",
  teacher_late: "#f59e0b",
  na: "#ef4444",
  finished_early: "#8b5cf6",
  technical_difficulty: "#3b82f6",
} as const;

interface TimeDiff {
  text: string;
  color: string;
}

type ScheduleDoc = Doc<"schedules">;
type Lesson = ScheduleDoc["lessons"][number];
interface TeacherStatsComponentProps {
  teacherIdOverride?: Id<"users">;
}

export default function TeacherStatsComponent({
  teacherIdOverride,
}: TeacherStatsComponentProps) {
  const { userDetail } = useUserDetail();
  const teacherId = teacherIdOverride ?? userDetail?._id;

  const currentMonth = format(new Date(), "yyyy-MM");

  const stats = useQuery(
    api.stats.getTeacherStats,
    teacherId ? { teacherId, month: currentMonth } : "skip"
  );
  const earnings = useQuery(
    api.payments.getEarningsSummary,
    teacherId ? { teacherId } : "skip"
  );
  const schedules = useQuery(
    api.schedules.getByTeacher,
    teacherId ? { teacherId } : "skip"
  );

  if (!teacherId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Please log in to view your dashboard
        </p>
      </div>
    );
  }

  if (
    stats === undefined ||
    earnings === undefined ||
    schedules === undefined
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-purple-600" />
      </div>
    );
  }

  const {
    totalLessons,
    onTimeRate,
    lateRate,
    onTimeLessons,
    lateLessons,
    na: naLessons,
    finishedEarly,
    technical,
  } = stats;

  const netEarnings = earnings.month.earnings;
  const grossEarnings = netEarnings + earnings.month.deductions;
  const deductions = earnings.month.deductions;

  // FIXED: Simple filter + type assertion (safest & cleanest)
  const statusDistribution = [
    { name: "On Time", value: onTimeLessons, color: COLORS.completed },
    { name: "Late", value: lateLessons, color: COLORS.teacher_late },
    { name: "No Answer", value: naLessons, color: COLORS.na },
    {
      name: "Finished Early",
      value: finishedEarly,
      color: COLORS.finished_early,
    },
    {
      name: "Tech Issues",
      value: technical,
      color: COLORS.technical_difficulty,
    },
  ].filter((item) => item.value > 0) as {
    name: string;
    value: number;
    color: string;
  }[];

  const getTimeDifference = (
    scheduled: string,
    actualStartTime?: number
  ): TimeDiff => {
    if (!actualStartTime) return { text: "N/A", color: "text-gray-500" };

    const scheduledDate = new Date(scheduled.replace(" ", "T"));
    const diffSeconds = Math.floor(
      (actualStartTime - scheduledDate.getTime()) / 1000
    );

    if (diffSeconds > 60) {
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      return {
        text: `+${minutes}m ${seconds}s`,
        color: "text-red-600 font-semibold",
      };
    }
    if (diffSeconds > 0)
      return { text: `+${diffSeconds}s`, color: "text-yellow-600" };
    return { text: `${Math.abs(diffSeconds)}s early`, color: "text-green-600" };
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Teacher Performance Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          {format(new Date(), "MMMM yyyy")} • Real-time stats
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalLessons}</div>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 shadow-lg ${
            onTimeRate >= 90
              ? "border-l-green-500"
              : onTimeRate >= 70
                ? "border-l-yellow-500"
                : "border-l-red-500"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              {onTimeRate >= 90 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              On-Time Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{onTimeRate.toFixed(1)}%</div>
            <Progress value={onTimeRate} className="mt-2 h-3" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Late Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">
              {lateLessons}
            </div>
            <p className="text-sm text-gray-500">{lateRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Net Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              ${netEarnings.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">
              After ${deductions.toFixed(2)} deductions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Lesson Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Summary */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
            <span>Gross Earnings</span>
            <span className="font-bold">${grossEarnings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between p-4 bg-red-50 rounded-lg">
            <span>Deductions</span>
            <span className="font-bold text-red-600">
              −${deductions.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between p-6 bg-green-100 rounded-lg font-bold text-xl">
            <span>Net Earnings</span>
            <span className="text-3xl text-green-700">
              ${netEarnings.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Lesson Table – Fully typed */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Time</th>
                  <th className="text-left p-4">Student</th>
                  <th className="text-center p-4">Duration</th>
                  <th className="text-center p-4">Started</th>
                  <th className="text-center p-4">Delay</th>
                  <th className="text-center p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.flatMap((sched: ScheduleDoc) =>
                  sched.lessons.map((lesson: Lesson) => {
                    const scheduledFull = `${sched.date} ${lesson.time}`;
                    const timeDiff = getTimeDifference(
                      scheduledFull,
                      lesson.startedAt // ✅ FIXED: Changed from actualStartTime
                    );

                    return (
                      <tr
                        key={lesson.lessonId}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">{sched.date}</td>
                        <td className="p-4 font-mono">{lesson.time}</td>
                        <td className="p-4">
                          Student #{lesson.studentId.slice(-6)}
                        </td>
                        <td className="p-4 text-center">
                          {lesson.duration} min
                        </td>
                        <td className="p-4 text-center font-mono">
                          {lesson.startedAt // ✅ FIXED: Changed from actualStartTime
                            ? new Date(lesson.startedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )
                            : "—"}
                        </td>
                        <td
                          className={`p-4 text-center font-medium ${timeDiff.color}`}
                        >
                          {timeDiff.text}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant={
                              lesson.status === "completed"
                                ? "default"
                                : lesson.status === "teacher_late"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {lesson.status.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
