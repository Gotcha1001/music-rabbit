// app/dashboard/admin/student-payments/page.tsx

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, TrendingUp } from "lucide-react";

export default function AdminStudentPayments() {
  const studentsWithPackages = useQuery(
    api.studentPackages.getAllStudentPackages
  );

  if (!studentsWithPackages) {
    return <div className="p-8">Loading...</div>;
  }

  const totalRevenue = studentsWithPackages.reduce(
    (sum, { activePackage }) => sum + (activePackage?.monthlyPrice || 0),
    0
  );

  const activeStudents = studentsWithPackages.filter(
    ({ activePackage }) => activePackage?.status === "active"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black p-6">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-5xl font-bold text-purple-200 mb-8">
          Student Payment Management
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-200">
                <Users className="h-6 w-6" />
                Active Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-100">
                {activeStudents}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-200">
                <DollarSign className="h-6 w-6" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-100">
                ${totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-200">
                <TrendingUp className="h-6 w-6" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-100">
                {studentsWithPackages.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-200">
              Student Package Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-purple-300">Student</TableHead>
                  <TableHead className="text-purple-300">Package</TableHead>
                  <TableHead className="text-purple-300">
                    Minutes Used
                  </TableHead>
                  <TableHead className="text-purple-300">Progress</TableHead>
                  <TableHead className="text-purple-300">Status</TableHead>
                  <TableHead className="text-purple-300">Monthly Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithPackages.map(
                  ({ student, activePackage, stats }) => (
                    <TableRow key={student._id}>
                      <TableCell className="text-purple-200">
                        {student.name || student.email}
                      </TableCell>
                      <TableCell className="text-purple-200">
                        {activePackage?.packageType || "No package"}
                      </TableCell>
                      <TableCell className="text-purple-200">
                        {stats.minutesUsed} / {stats.totalMinutes}
                      </TableCell>
                      <TableCell>
                        <Progress
                          value={stats.percentageUsed}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            activePackage?.status === "active"
                              ? "bg-green-700"
                              : "bg-red-700"
                          }
                        >
                          {activePackage?.status || "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-purple-200">
                        ${activePackage?.monthlyPrice.toFixed(2) || "0.00"}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
