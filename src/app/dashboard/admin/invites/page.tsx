"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { api } from "../../../../../convex/_generated/api";

export default function AdminInvitesPage() {
  const inviteCodes = useQuery(api.inviteCodes.getAll) ?? [];

  const createInviteCode = useMutation(api.inviteCodes.create);
  const deleteInviteCode = useMutation(api.inviteCodes.remove);

  const [newCodeRole, setNewCodeRole] = useState<"teacher" | "student">(
    "teacher",
  );
  const [newCodeDescription, setNewCodeDescription] = useState("");

  const handleCreateInviteCode = async () => {
    if (!newCodeDescription.trim()) {
      toast.error("Please add a description");
      return;
    }

    await createInviteCode({
      description: newCodeDescription.trim(),
      role: newCodeRole,
    });

    toast.success(`Invite code created!`);
    setNewCodeDescription("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Key className="h-8 w-8 text-primary" />
            Invite Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 p-4 border rounded-lg bg-muted/30">
            <Select
              value={newCodeRole}
              onValueChange={(v: "teacher" | "student") => setNewCodeRole(v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Description (e.g., John Smith - Piano)"
              value={newCodeDescription}
              onChange={(e) => setNewCodeDescription(e.target.value)}
              className="flex-1"
            />

            <Button onClick={handleCreateInviteCode}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Code
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inviteCodes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No invite codes
                  </TableCell>
                </TableRow>
              ) : (
                inviteCodes.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-mono font-bold text-lg">
                      {c.code}
                    </TableCell>
                    <TableCell>
                      <Badge>{c.role}</Badge>
                    </TableCell>
                    <TableCell>{c.description || "---"}</TableCell>
                    <TableCell>{c.usedCount}</TableCell>
                    <TableCell>{format(c._creationTime, "PP")}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteInviteCode({ inviteId: c._id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
