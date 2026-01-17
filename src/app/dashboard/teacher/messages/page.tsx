// app/dashboard/teacher/messages/page.tsx - Enhanced with delete functionality
"use client";

import { useQuery, useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Send,
  MessageSquare,
  Trash2,
  CheckCheck,
  Mail,
  MailOpen,
  X,
} from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TeacherMessages() {
  const currentUser = useQuery(api.users.get);
  const admin = useQuery(api.users.getAdmin);
  const messages = useQuery(
    api.messages.getByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const unreadCount = useQuery(
    api.messages.getUnreadCount,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.messages.markAsRead);
  const markAllAsRead = useMutation(api.messages.markAllAsRead);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const [content, setContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Id<"messages"> | null>(
    null
  );

  if (!currentUser || currentUser.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-400 text-2xl">
        Access Denied - Teachers Only
      </div>
    );
  }

  if (!messages || !admin) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-purple-900/20 rounded w-64"></div>
          <div className="space-y-3">
            <div className="h-24 bg-purple-900/10 rounded"></div>
            <div className="h-24 bg-purple-900/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!content.trim()) return toast.error("Message cannot be empty");

    try {
      await sendMessage({
        toId: admin._id,
        content: content.trim(),
      });
      setContent("");
      toast.success("Message sent to HR!");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleMarkAsRead = async (messageId: Id<"messages">) => {
    try {
      await markAsRead({ messageId });
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      toast.success(`Marked ${result.markedCount} messages as read`);
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const confirmDelete = (messageId: Id<"messages">) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      const result = await deleteMessage({ messageId: messageToDelete });

      if (result.permanentlyDeleted) {
        toast.success("Message permanently deleted");
      } else {
        toast.success("Message deleted from your view");
      }
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const isFromAdmin = (fromId: Id<"users">) => fromId === admin._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Messages
            </h1>
            {unreadCount !== undefined && unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-purple-300 mt-3">Chat with HR / Admin</p>
        </div>

        {/* Action Buttons */}
        {unreadCount !== undefined && unreadCount > 0 && (
          <div className="mb-6 flex justify-end">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="border-purple-600 text-purple-300 hover:bg-purple-900/50"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          </div>
        )}

        {/* Message Thread */}
        <Card className="mb-6 bg-purple-950/50 border-purple-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-purple-200">
              <MessageSquare className="h-7 w-7" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-center text-purple-400 py-12 italic">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${isFromAdmin(msg.fromId) ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl relative group ${
                      isFromAdmin(msg.fromId)
                        ? "bg-purple-800 text-purple-100 border border-purple-600"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    }`}
                  >
                    {/* Read/Unread indicator for received messages */}
                    {isFromAdmin(msg.fromId) && (
                      <div className="absolute -top-2 -right-2">
                        {msg.isRead ? (
                          <MailOpen className="h-4 w-4 text-green-400" />
                        ) : (
                          <Mail className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                    )}

                    {/* Delete button (shows on hover) */}
                    <button
                      onClick={() => confirmDelete(msg._id)}
                      className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 rounded-full p-1"
                      title="Delete message"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>

                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">
                        {isFromAdmin(msg.fromId) ? "HR / Admin" : "You"}
                      </p>
                      {!msg.isRead && isFromAdmin(msg.fromId) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(msg._id)}
                          className="h-6 text-xs hover:bg-purple-700"
                        >
                          Mark read
                        </Button>
                      )}
                    </div>

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    <p className="text-xs opacity-70 mt-2">
                      {formatDistanceToNow(new Date(msg.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Send Box */}
        <Card className="bg-purple-950/70 border-purple-600">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder="Type your message to HR..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                className="bg-purple-900/50 border-purple-500 text-white placeholder-purple-400 focus:ring-purple-400"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-purple-950 border-purple-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-purple-100">
              Delete Message?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-purple-300">
              This will remove the message from your view. If the other person
              also deletes it, the message will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-purple-800 text-purple-200 border-purple-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
