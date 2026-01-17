// app/dashboard/student/stats/page.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Award } from "lucide-react";

export default function StudentStatsPage() {
  const currentUser = useQuery(api.users.get);
  const stats = useQuery(
    api.studentPackages.getPackageStats,
    currentUser ? { studentId: currentUser._id } : "skip"
  );

  if (!stats?.hasActivePackage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black p-6 flex items-center justify-center">
        <Card className="max-w-md bg-gradient-to-br from-purple-950 to-black border-purple-800">
          <CardContent className="pt-6 text-center">
            <p className="text-purple-300 text-lg">
              No active package. Please purchase a package to start learning!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black p-6">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-5xl font-bold text-purple-200 mb-8">
          Your Learning Statistics
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-200">
                <Clock className="h-6 w-6" />
                Minutes Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-100 mb-4">
                {stats.minutesUsed} / {stats.totalMinutes}
              </div>
              <Progress value={stats.percentageUsed} className="h-3" />
              <p className="text-sm text-purple-400 mt-2">
                {stats.percentageUsed}% of monthly minutes used
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-200">
                <TrendingUp className="h-6 w-6" />
                Lessons Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-100 mb-2">
                {stats.lessonsCompleted}
              </div>
              <p className="text-purple-300">Lessons completed this month</p>
              <Badge className="mt-3 bg-purple-700">
                {stats.lessonsRemaining} lessons remaining
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-200">
              <Award className="h-6 w-6" />
              Package Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-purple-200">
            <div className="flex justify-between">
              <span>Package Type:</span>
              <Badge className="bg-purple-700">
                {stats.package.packageType}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Minutes Per Lesson:</span>
              <span className="font-bold">
                {stats.package.minutesPerLesson} min
              </span>
            </div>
            <div className="flex justify-between">
              <span>Lessons Per Week:</span>
              <span className="font-bold">{stats.package.lessonsPerWeek}x</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Price:</span>
              <span className="font-bold">${stats.package.monthlyPrice}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
