"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useState } from "react";
import { Copy, Trash, ToggleLeft, ToggleRight } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function InviteCodes() {
  const invites = useQuery(api.inviteCodes.getAll) || [];
  const createInvite = useMutation(api.inviteCodes.create);
  const deactivateInvite = useMutation(api.inviteCodes.deactivate);
  const activateInvite = useMutation(api.inviteCodes.activate);
  const removeInvite = useMutation(api.inviteCodes.remove);

  const [description, setDescription] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");

  const handleCreate = async () => {
    await createInvite({ description, role });
    setDescription("");
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // Optional: toast("Code copied!")
  };

  const toggleActive = async (
    inviteId: Id<"inviteCodes">,
    currentActive: boolean
  ) => {
    if (currentActive) {
      await deactivateInvite({ inviteId });
    } else {
      await activateInvite({ inviteId });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Invite Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(val) => setRole(val as "teacher" | "student")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate}>Generate Code</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Invite Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite._id}>
                  <TableCell>{invite.code}</TableCell>
                  <TableCell>{invite.role}</TableCell>
                  <TableCell>{invite.usedCount}</TableCell>
                  <TableCell>{invite.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell>{invite.description || "-"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => copyToClipboard(invite.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => toggleActive(invite._id, invite.isActive)}
                    >
                      {invite.isActive ? (
                        <ToggleLeft className="h-4 w-4" />
                      ) : (
                        <ToggleRight className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => removeInvite({ inviteId: invite._id })}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
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
