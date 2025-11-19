// app/dashboard/admin/invite-codes/page.tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Copy,
  Trash,
  ToggleLeft,
  ToggleRight,
  Plus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function InviteCodes() {
  const invites = useQuery(api.inviteCodes.getAll) || [];
  const createInvite = useMutation(api.inviteCodes.create);
  const deactivateInvite = useMutation(api.inviteCodes.deactivate);
  const activateInvite = useMutation(api.inviteCodes.activate);
  const removeInvite = useMutation(api.inviteCodes.remove);

  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Filter to show only teacher invite codes
  const teacherInvites = invites.filter((invite) => invite.role === "teacher");

  const handleCreate = async () => {
    if (!description.trim()) {
      toast.error("Please add a description for this invite code");
      return;
    }

    setIsCreating(true);
    try {
      await createInvite({
        description: description.trim(),
        role: "teacher", // Always create teacher codes
      });
      setDescription("");
      toast.success("Teacher invite code created!");
    } catch (error) {
      toast.error("Failed to create invite code");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const toggleActive = async (
    inviteId: Id<"inviteCodes">,
    currentActive: boolean
  ) => {
    try {
      if (currentActive) {
        await deactivateInvite({ inviteId });
        toast.success("Invite code deactivated");
      } else {
        await activateInvite({ inviteId });
        toast.success("Invite code activated");
      }
    } catch (error) {
      toast.error("Failed to update invite code");
    }
  };

  const handleRemove = async (inviteId: Id<"inviteCodes">) => {
    if (!confirm("Are you sure you want to delete this invite code?")) return;

    try {
      await removeInvite({ inviteId });
      toast.success("Invite code deleted");
    } catch (error) {
      toast.error("Failed to delete invite code");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Teacher Invite Codes
        </h1>
        <p className="text-muted-foreground">
          Create and manage invite codes for new teachers. Students can sign up
          directly without codes.
        </p>
      </div>

      {/* Create New Invite Code */}
      <Card className="mb-8 border-green-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Create New Teacher Invite Code
          </CardTitle>
          <CardDescription>
            Generate a unique code for a new teacher to join the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              placeholder="e.g., John Smith - Piano Teacher, November Hiring"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Add a description to help you remember who this code is for
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Badge variant="secondary" className="bg-blue-600 text-white">
              Teacher
            </Badge>
            <span className="text-sm text-muted-foreground">
              This code will allow someone to register as a teacher
            </span>
          </div>

          <Button
            onClick={handleCreate}
            disabled={isCreating || !description.trim()}
            className="w-full"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Teacher Invite Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Invite Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Existing Teacher Invite Codes</span>
            <Badge variant="outline" className="text-sm font-normal">
              {teacherInvites.length}{" "}
              {teacherInvites.length === 1 ? "code" : "codes"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage active and inactive teacher invitation codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacherInvites.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No invite codes yet
              </h3>
              <p className="text-muted-foreground">
                Create your first teacher invite code to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Times Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherInvites.map((invite) => (
                  <TableRow key={invite._id}>
                    <TableCell className="font-mono font-semibold">
                      {invite.code}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {invite.description || (
                          <span className="text-muted-foreground italic">
                            No description
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {invite.usedCount}{" "}
                        {invite.usedCount === 1 ? "use" : "uses"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invite.isActive ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(invite.code)}
                          title="Copy code"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleActive(invite._id, invite.isActive)
                          }
                          title={invite.isActive ? "Deactivate" : "Activate"}
                        >
                          {invite.isActive ? (
                            <ToggleLeft className="h-4 w-4 text-orange-600" />
                          ) : (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(invite._id)}
                          title="Delete"
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600 mt-1">ℹ️</div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900">
                About Teacher Invite Codes:
              </p>
              <ul className="space-y-1 text-blue-800">
                <li>• Each code can be used multiple times</li>
                <li>• Deactivated codes cannot be used for new signups</li>
                <li>
                  • Students no longer need invite codes - they can sign up
                  directly!
                </li>
                <li>
                  • Teachers must use a valid invite code during registration
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
