// app/components/EnhancedTeacherInboxItem.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  MessageSquare,
  Trash2,
  Mail,
  MailOpen,
  CheckCheck,
} from "lucide-react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
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

export function TeacherInboxItem({ teacher }: { teacher: Doc<"users"> }) {
  const messages =
    useQuery(api.messages.getByUser, { userId: teacher._id }) || [];
  const unreadCount = useQuery(api.messages.getUnreadCount, {
    userId: teacher._id,
  });

  const markAsRead = useMutation(api.messages.markAsRead);
  const adminDeleteMessage = useMutation(api.messages.adminDeleteMessage);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Id<"messages"> | null>(
    null
  );
  const [expanded, setExpanded] = useState(false);

  if (messages.length === 0) return null;

  const latest = messages[0];

  const handleMarkAsRead = async (messageId: Id<"messages">) => {
    try {
      await markAsRead({ messageId });
      toast.success("Message marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const confirmDelete = (messageId: Id<"messages">) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      await adminDeleteMessage({ messageId: messageToDelete });
      toast.success("Message permanently deleted");
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-border rounded-lg overflow-hidden hover:bg-muted/30 transition-colors"
      >
        <div
          className="p-5 cursor-pointer relative group"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-serif font-semibold text-foreground">
                    {teacher.email.split("@")[0]}
                  </p>
                  {unreadCount !== undefined && unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {teacher.instrument || "Teacher"}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {format(new Date(latest.timestamp), "MMM d, h:mm a")}
            </div>
          </div>

          <p className={`text-foreground ${expanded ? "" : "line-clamp-2"}`}>
            {latest.content}
          </p>

          {messages.length > 1 && (
            <p className="text-primary text-sm mt-2">
              {expanded ? "▲" : "▼"} {messages.length} messages
            </p>
          )}

          {/* Delete and Mark as Read for Latest Message */}
          <div className="absolute top-5 right-5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!latest.isRead && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead(latest._id);
                }}
                title="Mark as read"
                className="h-8 w-8 p-0"
              >
                <CheckCheck className="h-4 w-4 text-green-500" />
              </Button>
            )}
            {latest.isRead && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(latest._id);
                }}
                title="Delete message"
                className="h-8 w-8 p-0 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>

        {expanded && messages.length > 1 && (
          <div className="border-t border-border bg-muted/10">
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {messages.slice(1).map((msg) => (
                <div
                  key={msg._id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 relative group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.isRead ? (
                        <MailOpen className="h-4 w-4 text-green-500" />
                      ) : (
                        <Mail className="h-4 w-4 text-yellow-500" />
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(msg.timestamp), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <p className="text-sm text-foreground">{msg.content}</p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!msg.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(msg._id);
                        }}
                        title="Mark as read"
                        className="h-8 w-8 p-0"
                      >
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    {msg.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(msg._id);
                        }}
                        title="Delete message"
                        className="h-8 w-8 p-0 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message from the database. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
