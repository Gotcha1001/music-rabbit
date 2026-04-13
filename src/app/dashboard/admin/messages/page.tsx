"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TeacherInboxItem } from "@/app/components/TeacherInboxItem";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

const AMSG_STYLES = `
  .amsg-card                    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .amsg-card              { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 24px rgba(139,92,246,0.1) !important; }
  .amsg-card-title              { color: hsl(var(--foreground)) !important; }
  .dark .amsg-card-title        { color: #ddd6fe !important; }
  .amsg-select                  { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .amsg-select            { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
  .amsg-textarea                { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .amsg-textarea:focus          { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .amsg-textarea::placeholder   { color: hsl(var(--muted-foreground)) !important; }
  .dark .amsg-textarea          { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
  .dark .amsg-textarea::placeholder { color: rgba(196,181,253,0.5) !important; }
  .amsg-send-btn                { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .amsg-send-btn:hover:not(:disabled) { background: hsl(var(--primary)/0.9) !important; }
  .amsg-send-btn:disabled       { opacity: 0.5 !important; cursor: not-allowed !important; }
  .dark .amsg-send-btn          { background: #7c3aed !important; }
  .dark .amsg-send-btn:hover:not(:disabled) { background: #6d28d9 !important; }
  .amsg-spinner                 { color: hsl(var(--primary)) !important; }
  .dark .amsg-spinner           { color: #a78bfa !important; }
`;

export default function AdminMessagesPage() {
  const teachers = (useQuery(api.users.getAllTeachers) as Doc<"users">[]) || [];
  const me = useQuery(api.users.getMe);

  const sendMessage = useMutation(api.messages.send);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const handleSendMessage = async () => {
    if (!selectedTeacher || !messageContent.trim()) return;
    await sendMessage({
      toId: selectedTeacher as Id<"users">,
      content: messageContent,
    });
    setMessageContent("");
    toast.success("Message sent");
  };

  return (
    <>
      <style>{AMSG_STYLES}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 sm:space-y-8"
      >
        {/* ── Send Message ── */}
        <div className="amsg-card rounded-xl border-2 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="amsg-card-title flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold font-serif">
              <Send className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
              Send Message
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="amsg-select">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.email.split("@")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Your message..."
              rows={5}
              className="amsg-textarea w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-all duration-200"
            />

            <button
              onClick={handleSendMessage}
              disabled={!selectedTeacher || !messageContent.trim()}
              className="amsg-send-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              <Send className="h-4 w-4 shrink-0" />
              Send
            </button>
          </div>
        </div>

        {/* ── Inbox ── */}
        <div className="amsg-card rounded-xl border-2 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="amsg-card-title flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold font-serif">
              <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
              Inbox
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {me ? (
              <TeacherInboxItem teacher={me} />
            ) : (
              <Loader2 className="amsg-spinner h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto" />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
