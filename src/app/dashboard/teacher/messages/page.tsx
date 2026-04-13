// app/dashboard/teacher/messages/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const MSG_STYLES = `
  .msg-page                       { background: #ffffff !important; }
  .dark .msg-page                 { background: linear-gradient(to bottom right, #000000, #1a0030, #000000) !important; }

  /* Heading */
  .msg-title                      { color: hsl(var(--foreground)) !important; -webkit-text-fill-color: hsl(var(--foreground)) !important; background: none !important; }
  .dark .msg-title                { color: transparent !important; -webkit-text-fill-color: transparent !important; background: linear-gradient(to right, #a78bfa, #f472b6) !important; -webkit-background-clip: text !important; background-clip: text !important; }

  .msg-subtitle                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .msg-subtitle             { color: #c4b5fd !important; }

  /* Conversation card */
  .msg-conv-card                  { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .msg-conv-card            { background: rgba(46,16,101,0.5) !important; border-color: rgba(109,40,217,0.5) !important; backdrop-filter: blur(8px) !important; }

  .msg-conv-title                 { color: hsl(var(--foreground)) !important; }
  .dark .msg-conv-title           { color: #ddd6fe !important; }

  .msg-empty                      { color: hsl(var(--muted-foreground)) !important; }
  .dark .msg-empty                { color: #a78bfa !important; }

  /* Received bubble (from admin) */
  .msg-bubble-in                  { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .msg-bubble-in            { background: rgba(109,40,217,0.5) !important; border-color: rgba(124,58,237,0.5) !important; color: #ede9fe !important; }

  /* Sent bubble (from teacher) */
  .msg-bubble-out                 { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .dark .msg-bubble-out           { background: linear-gradient(to right, #7c3aed, #db2777) !important; color: #ffffff !important; }

  /* Bubble meta text */
  .msg-bubble-sender              { color: hsl(var(--foreground)) !important; }
  .dark .msg-bubble-sender        { color: inherit !important; }
  .msg-bubble-time                { color: hsl(var(--muted-foreground)) !important; }
  .dark .msg-bubble-time          { opacity: 0.7 !important; color: inherit !important; }

  /* Mark read button inside bubble */
  .msg-mark-read-btn              { color: hsl(var(--primary)) !important; }
  .msg-mark-read-btn:hover        { background: hsl(var(--primary)/0.1) !important; }
  .dark .msg-mark-read-btn        { color: #c4b5fd !important; }
  .dark .msg-mark-read-btn:hover  { background: rgba(109,40,217,0.4) !important; }

  /* Mark all read button */
  .msg-mark-all-btn               { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; background: transparent !important; }
  .msg-mark-all-btn:hover         { background: hsl(var(--primary)/0.08) !important; }
  .dark .msg-mark-all-btn         { border-color: rgba(124,58,237,0.6) !important; color: #c4b5fd !important; }
  .dark .msg-mark-all-btn:hover   { background: rgba(76,29,149,0.5) !important; }

  /* Send box */
  .msg-send-card                  { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .msg-send-card            { background: rgba(46,16,101,0.7) !important; border-color: rgba(124,58,237,0.6) !important; }

  .msg-input                      { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .msg-input:focus                { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .msg-input::placeholder         { color: hsl(var(--muted-foreground)) !important; }
  .dark .msg-input                { background: rgba(76,29,149,0.5) !important; border-color: rgba(124,58,237,0.5) !important; color: #ffffff !important; }
  .dark .msg-input::placeholder   { color: rgba(196,181,253,0.6) !important; }

  .msg-send-btn                   { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .msg-send-btn:hover             { background: hsl(var(--primary)/0.9) !important; }
  .dark .msg-send-btn             { background: linear-gradient(to right, #7c3aed, #db2777) !important; }
  .dark .msg-send-btn:hover       { background: linear-gradient(to right, #6d28d9, #be185d) !important; }

  /* Delete confirmation dialog */
  .msg-dialog                     { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .msg-dialog               { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.5) !important; }
  .msg-dialog-title               { color: hsl(var(--foreground)) !important; }
  .dark .msg-dialog-title         { color: #ede9fe !important; }
  .msg-dialog-desc                { color: hsl(var(--muted-foreground)) !important; }
  .dark .msg-dialog-desc          { color: #c4b5fd !important; }
  .msg-dialog-cancel              { background: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; border-color: hsl(var(--border)) !important; }
  .dark .msg-dialog-cancel        { background: rgba(76,29,149,0.5) !important; color: #ddd6fe !important; border-color: rgba(109,40,217,0.5) !important; }

  /* Loading skeleton */
  .msg-skeleton                   { background: hsl(var(--muted)) !important; }
  .dark .msg-skeleton             { background: rgba(76,29,149,0.2) !important; }
`;

export default function TeacherMessages() {
  const currentUser = useQuery(api.users.get);
  const admin = useQuery(api.users.getAdmin);
  const messages = useQuery(
    api.messages.getByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip",
  );
  const unreadCount = useQuery(
    api.messages.getUnreadCount,
    currentUser?._id ? { userId: currentUser._id } : "skip",
  );

  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.messages.markAsRead);
  const markAllAsRead = useMutation(api.messages.markAllAsRead);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const [content, setContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Id<"messages"> | null>(
    null,
  );

  if (!currentUser || currentUser.role !== "teacher") {
    return (
      <div className="msg-page min-h-screen flex items-center justify-center">
        <style>{MSG_STYLES}</style>
        <p className="text-destructive text-xl">
          Access Denied — Teachers Only
        </p>
      </div>
    );
  }

  if (!messages || !admin) {
    return (
      <div className="msg-page min-h-screen container mx-auto p-4 sm:p-8">
        <style>{MSG_STYLES}</style>
        <div className="space-y-4 animate-pulse">
          <div className="msg-skeleton h-10 sm:h-12 rounded w-48 sm:w-64" />
          <div className="space-y-3">
            <div className="msg-skeleton h-20 sm:h-24 rounded" />
            <div className="msg-skeleton h-20 sm:h-24 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!content.trim()) return toast.error("Message cannot be empty");
    try {
      await sendMessage({ toId: admin._id, content: content.trim() });
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
      toast.success(
        result.permanentlyDeleted
          ? "Message permanently deleted"
          : "Message deleted from your view",
      );
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const isFromAdmin = (fromId: Id<"users">) => fromId === admin._id;

  return (
    <div className="msg-page min-h-screen">
      <style>{MSG_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
        {/* ── Header ── */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-wrap">
            <h1 className="msg-title text-4xl sm:text-5xl font-bold font-serif">
              Messages
            </h1>
            {unreadCount !== undefined && unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="msg-subtitle mt-2 sm:mt-3 text-sm sm:text-base">
            Chat with HR / Admin
          </p>
        </div>

        {/* Mark all read */}
        {unreadCount !== undefined && unreadCount > 0 && (
          <div className="mb-4 sm:mb-6 flex justify-end">
            <button
              onClick={handleMarkAllAsRead}
              className="msg-mark-all-btn flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
            >
              <CheckCheck className="h-4 w-4 shrink-0" />
              Mark All as Read
            </button>
          </div>
        )}

        {/* ── Conversation card ── */}
        <div className="msg-conv-card rounded-xl border-2 overflow-hidden shadow-sm mb-4 sm:mb-6">
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="msg-conv-title flex items-center gap-3 text-base sm:text-lg font-bold">
              <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7 shrink-0 text-primary dark:text-purple-400" />
              Conversation
            </h2>
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="msg-empty text-center py-10 sm:py-12 italic text-sm sm:text-base">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${isFromAdmin(msg.fromId) ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 sm:px-5 py-3 sm:py-4 rounded-2xl relative group ${
                      isFromAdmin(msg.fromId)
                        ? "msg-bubble-in border"
                        : "msg-bubble-out"
                    }`}
                  >
                    {/* Read/unread indicator */}
                    {isFromAdmin(msg.fromId) && (
                      <div className="absolute -top-2 -right-2">
                        {msg.isRead ? (
                          <MailOpen className="h-4 w-4 text-green-500" />
                        ) : (
                          <Mail className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    )}

                    {/* Delete button on hover */}
                    <button
                      onClick={() => confirmDelete(msg._id)}
                      className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 rounded-full p-1"
                      title="Delete message"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>

                    <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                      <p className="msg-bubble-sender font-semibold text-xs sm:text-sm">
                        {isFromAdmin(msg.fromId) ? "HR / Admin" : "You"}
                      </p>
                      {!msg.isRead && isFromAdmin(msg.fromId) && (
                        <button
                          onClick={() => handleMarkAsRead(msg._id)}
                          className="msg-mark-read-btn text-xs px-2 py-0.5 rounded font-medium transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>

                    <p className="whitespace-pre-wrap text-sm sm:text-base">
                      {msg.content}
                    </p>

                    <p className="msg-bubble-time text-xs mt-1.5 sm:mt-2">
                      {formatDistanceToNow(new Date(msg.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Send box ── */}
        <div className="msg-send-card rounded-xl border-2 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex gap-2 sm:gap-3">
              <input
                placeholder="Type your message to HR..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                className="msg-input flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm outline-none transition-all duration-200"
              />
              <button
                onClick={handleSend}
                className="msg-send-btn p-2.5 sm:p-3 rounded-lg transition-all duration-200 shrink-0"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete dialog ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="msg-dialog border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="msg-dialog-title">
              Delete Message?
            </AlertDialogTitle>
            <AlertDialogDescription className="msg-dialog-desc">
              This will remove the message from your view. If the other person
              also deletes it, the message will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="msg-dialog-cancel">
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
