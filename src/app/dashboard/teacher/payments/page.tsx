// app/dashboard/teacher/payments/page.tsx
"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default function TeacherPayments() {
  const { userDetail } = useUserDetail();

  const earningsSummary = useQuery(
    api.payments.getEarningsSummary,
    userDetail?.role === "teacher"
      ? { teacherId: userDetail._id as Id<"users"> }
      : "skip"
  );

  const detailedEarnings = useQuery(
    api.payments.getDetailedEarnings,
    userDetail?.role === "teacher"
      ? { teacherId: userDetail._id as Id<"users"> }
      : "skip"
  );

  const [chartData] = useState([]);

  if (!userDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive">
        Unauthorized
      </div>
    );
  }

  if (earningsSummary === undefined || detailedEarnings === undefined) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Time,Duration,Status,Earnings,Deduction\n" +
      detailedEarnings
        .map(
          (earning) =>
            `${earning.date},${earning.time},${earning.duration},${earning.status},${earning.earnings.toFixed(2)},${earning.deduction.toFixed(2)}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "earnings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">My Earnings</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold">
              ${earningsSummary.today.earnings.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {earningsSummary.today.hours.toFixed(1)} hours taught
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold">
              ${earningsSummary.month.earnings.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {earningsSummary.month.hours.toFixed(1)} hours • $
              {earningsSummary.month.deductions.toFixed(2)} deductions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Earnings Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="earnings" fill="#8884d8" />
              <Bar dataKey="deductions" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detailed Earnings</CardTitle>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration (min)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Deduction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailedEarnings.map((earning, index) => (
                <TableRow key={index}>
                  <TableCell>{earning.date}</TableCell>
                  <TableCell>{earning.time}</TableCell>
                  <TableCell>{earning.duration}</TableCell>
                  <TableCell>{earning.status}</TableCell>
                  <TableCell>${earning.earnings.toFixed(2)}</TableCell>
                  <TableCell className="text-red-600">
                    -${earning.deduction.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
