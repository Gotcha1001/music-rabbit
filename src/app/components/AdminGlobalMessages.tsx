// app/components/AdminGlobalMessages.tsx

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Send,
  Trash2,
  EyeOff,
  AlertTriangle,
  Bell,
  Info,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type MessageWithStats = {
  _id: Id<"globalMessages">;
  _creationTime: number;
  isActive: boolean;
  createdAt: number;
  createdBy: Id<"users">;
  content: string;
  priority: "normal" | "important" | "urgent";
  readBy: Id<"users">[];
  totalTeachers: number;
  readCount: number;
  percentageRead: number;
};

type BasicMessage = {
  _id: Id<"globalMessages">;
  _creationTime: number;
  isActive: boolean;
  createdAt: number;
  createdBy: Id<"users">;
  content: string;
  priority: "normal" | "important" | "urgent";
  readBy: Id<"users">[];
};

const hasStats = (
  msg: BasicMessage | MessageWithStats
): msg is MessageWithStats => {
  return "totalTeachers" in msg;
};

export default function AdminGlobalMessages() {
  const currentUser = useQuery(api.users.getMe);

  const isAdmin = currentUser?.role === "admin";

  // Query separately based on role
  const adminMessages = useQuery(
    api.globalMessages.getAllWithStats,
    isAdmin ? {} : "skip"
  );
  const teacherMessages = useQuery(
    api.globalMessages.getActiveMessages,
    !isAdmin ? {} : "skip"
  );

  const messages = (isAdmin ? adminMessages : teacherMessages) ?? [];

  const createMessage = useMutation(api.globalMessages.create);
  const deactivateMessage = useMutation(api.globalMessages.deactivate);
  const deleteMessage = useMutation(api.globalMessages.remove);

  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">(
    "normal"
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!content.trim()) return toast.error("Message content is required");

    setIsCreating(true);
    try {
      await createMessage({ content: content.trim(), priority });
      toast.success("Global message sent to all teachers!");
      setContent("");
      setPriority("normal");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivate = async (messageId: Id<"globalMessages">) => {
    try {
      await deactivateMessage({ messageId });
      toast.success("Message deactivated");
    } catch {
      toast.error("Failed to deactivate");
    }
  };

  const handleDelete = async (messageId: Id<"globalMessages">) => {
    try {
      await deleteMessage({ messageId });
      toast.success("Message deleted permanently");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "important":
        return <Bell className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // For teachers: show only active messages, no stats
  if (!isAdmin && messages?.length === 0) {
    return null; // Teacher sees nothing (modal handles announcements)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black p-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 bg-clip-text text-transparent mb-4">
            Global Teacher Announcements
          </h1>
          <p className="text-purple-300 text-lg">
            Send important messages that all teachers must acknowledge
          </p>
        </motion.div>

        {/* Only admins can create messages */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-200 text-2xl">
                  <Send className="h-7 w-7 text-purple-400" />
                  Create New Announcement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-purple-300 text-lg mb-2 block">
                    Priority Level
                  </Label>
                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setPriority(value as "normal" | "important" | "urgent")
                    }
                  >
                    <SelectTrigger className="bg-purple-900/30 border-purple-700 text-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" /> Normal
                        </div>
                      </SelectItem>
                      <SelectItem value="important">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-orange-500" /> Important
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />{" "}
                          Urgent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-purple-300 text-lg mb-2 block">
                    Message Content
                  </Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your announcement..."
                    rows={6}
                    className="bg-purple-900/30 border-purple-700 text-purple-200 placeholder:text-purple-400/50"
                  />
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !content.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  {isCreating ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Send to All Teachers
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Message History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-200 text-2xl">
                <Clock className="h-7 w-7 text-purple-400" />
                Message History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!messages || messages.length === 0 ? (
                <div className="text-center py-12 text-purple-400">
                  No messages sent yet
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-6 rounded-lg border-2 ${msg.isActive ? "bg-purple-900/30 border-purple-700/50" : "bg-purple-950/20 border-purple-800/30 opacity-60"}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getPriorityIcon(msg.priority)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-purple-300">
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                              {!msg.isActive && (
                                <Badge variant="secondary">Deactivated</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            {msg.isActive && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeactivate(msg._id)}
                                className="text-orange-400"
                              >
                                <EyeOff className="h-4 w-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Message?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(msg._id)}
                                    className="bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>

                      <p className="text-purple-200 whitespace-pre-wrap mb-4">
                        {msg.content}
                      </p>

                      {/* Only show stats if admin */}
                      {isAdmin && hasStats(msg) && (
                        <div className="flex items-center gap-6 pt-4 border-t border-purple-700/30">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-purple-300">
                              {msg.totalTeachers} teachers
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-purple-300">
                              {msg.readCount || 0} read (
                              {msg.percentageRead || 0}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
