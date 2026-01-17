"use client";

import { useQuery } from "convex/react";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../../../../convex/_generated/api";

export default function AdminTeacherStats() {
  const currentMonth = format(new Date(), "yyyy-MM");
  const allStats = useQuery(api.stats.getAllTeachersStats, {
    month: currentMonth,
  });

  if (!allStats) return <div>Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Teacher</TableHead>
          <TableHead>On-Time %</TableHead>
          <TableHead>Late %</TableHead>
          <TableHead>Completion %</TableHead>
          <TableHead>Total Lessons</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allStats.map(({ teacher, stats }) => (
          <TableRow key={teacher._id}>
            <TableCell>{teacher.name}</TableCell>
            <TableCell>{stats.onTimeRate}%</TableCell>
            <TableCell>{stats.lateRate}%</TableCell>
            <TableCell>{stats.completionRate}%</TableCell>
            <TableCell>{stats.totalLessons}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
