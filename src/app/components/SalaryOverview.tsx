// components/SalaryOverview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, BookOpen, Clock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SalaryOverviewProps {
  totalEarnings: number;
  totalLessons: number;
  totalHours: number;
  teacherCount: number;
  loading: boolean;
}

export function SalaryOverview({
  totalEarnings,
  totalLessons,
  totalHours,
  teacherCount,
  loading,
}: SalaryOverviewProps) {
  const stats = [
    {
      title: "Total Earnings",
      value: `R${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      description: "Total teacher earnings this month",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Completed Lessons",
      value: totalLessons.toString(),
      icon: BookOpen,
      description: "Lessons completed this month",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Teaching Hours",
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      description: "Total hours taught",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Active Teachers",
      value: teacherCount.toString(),
      icon: Users,
      description: "Teachers with lessons",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-full`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
