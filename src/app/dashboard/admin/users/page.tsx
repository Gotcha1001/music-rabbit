"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Edit, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

export default function AdminUsersPage() {
  const teachers = (useQuery(api.users.getAllTeachers) as Doc<"users">[]) || [];
  const students = (useQuery(api.users.getAllStudents) as Doc<"users">[]) || [];

  const updateUserRole = useMutation(api.users.updateRole);
  const deleteUser = useMutation(api.users.remove);
  const calculateMonth = useMutation(api.payments.calculateMonth);

  const [calcMonth, setCalcMonth] = useState("");
  const [selectedTeacherForStats, setSelectedTeacherForStats] =
    useState<Id<"users"> | null>(null);

  const handleUpdateRole = async (
    userId: Id<"users">,
    newRole: "admin" | "teacher" | "student",
  ) => {
    await updateUserRole({ userId, role: newRole });
    toast.success("Role updated");
  };

  const handleDeleteUser = async (userId: Id<"users">) => {
    if (!confirm("Delete this user permanently?")) return;
    await deleteUser({ userId });
    toast.success("User deleted");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Users className="h-8 w-8 text-primary" />
            Manage Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="teachers">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="teachers">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>{t.email}</TableCell>
                      <TableCell>{t.instrument || "---"}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateRole(t._id, "admin")}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Admin
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setSelectedTeacherForStats(t._id)}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" /> Stats
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(t._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="students">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.instrument || "---"}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateRole(s._id, "teacher")}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Promote
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(s._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="payments">
              <div className="flex gap-3">
                <Input
                  placeholder="2025-11"
                  value={calcMonth}
                  onChange={(e) => setCalcMonth(e.target.value)}
                />
                <Button
                  onClick={async () => {
                    await calculateMonth({ month: calcMonth });
                    toast.success("Payments calculated!");
                  }}
                >
                  Calculate Month
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
