"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export default function AdminMessagesPage() {
  const teachers = (useQuery(api.users.getAllTeachers) as Doc<"users">[]) || [];
  const me = useQuery(api.users.getMe);

  const sendMessage = useMutation(api.messages.send);

  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Send className="h-7 w-7 text-primary" />
            Send Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger>
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

          <Textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Your message..."
            className="min-h-32"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!selectedTeacher || !messageContent.trim()}
          >
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-primary" />
            Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          {me ? (
            <TeacherInboxItem teacher={me} />
          ) : (
            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
