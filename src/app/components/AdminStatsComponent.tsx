"use client";

import { useQuery } from "convex/react";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../../convex/_generated/api";

export default function AdminStatsComponent() {
  const currentMonth = format(new Date(), "yyyy-MM");
  const allStats = useQuery(api.stats.getAllTeachersStats, {
    month: currentMonth,
  });

  if (!allStats)
    return <div className="p-8 text-center">Loading admin stats...</div>;

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>All Teachers Stats ({currentMonth})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>On-Time Rate</TableHead>
                <TableHead>Late Rate</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Total Lessons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStats.map(({ teacher, stats }) => (
                <TableRow key={teacher._id}>
                  <TableCell>{teacher.name || teacher.email}</TableCell>
                  <TableCell>{stats.onTimeRate}%</TableCell>
                  <TableCell>{stats.lateRate}%</TableCell>
                  <TableCell>{stats.completionRate}%</TableCell>
                  <TableCell>{stats.totalLessons}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
