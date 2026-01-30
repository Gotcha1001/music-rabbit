// components/ThankYouMessageModal.tsx
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface ThankYouMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: Id<"schedules">;
  lessonId: string;
  teacherId: Id<"users">;
  teacherName: string;
}

const QUICK_MESSAGES = [
  "Thank you for the great lesson today! 🎵",
  "I really enjoyed today's session!",
  "Thanks for being patient with me!",
  "You're an amazing teacher! 🌟",
  "Looking forward to our next lesson!",
  "Thanks for all your help!",
];

export function ThankYouMessageModal({
  isOpen,
  onClose,
  scheduleId,
  lessonId,
  teacherId,
  teacherName,
}: ThankYouMessageModalProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sendMessage = useMutation(api.thankYouMessages.send);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }

    setIsSending(true);
    try {
      await sendMessage({
        scheduleId,
        lessonId,
        teacherId,
        message: message.trim(),
      });

      toast.success("Thank you message sent! 💝", {
        description: `${teacherName} will see your message`,
      });

      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error sending thank you message:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickMessage = (quickMsg: string) => {
    setMessage(quickMsg);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-full">
              <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <DialogTitle>Send a Thank You! 💝</DialogTitle>
              <DialogDescription>
                Let {teacherName} know you appreciate the lesson
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Message Templates */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Quick Messages
            </label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {QUICK_MESSAGES.map((quickMsg, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickMessage(quickMsg)}
                  className="text-left justify-start h-auto py-2 px-3 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-300"
                >
                  {quickMsg}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Or write your own message
            </label>
            <Textarea
              placeholder="Type your thank you message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {message.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Thank You
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
