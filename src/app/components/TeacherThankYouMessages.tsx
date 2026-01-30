// components/TeacherThankYouMessages.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Clock, Send, Smile } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface TeacherThankYouMessagesProps {
  teacherId: Id<"users">;
}

const EMOJI_OPTIONS = ["❤️", "🙏", "😊", "⭐", "🎵", "💯", "👏", "🌟"];

export function TeacherThankYouMessages({
  teacherId,
}: TeacherThankYouMessagesProps) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [responseEmoji, setResponseEmoji] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");
  const [isResponding, setIsResponding] = useState(false);

  const messages = useQuery(api.thankYouMessages.getForTeacher, {
    teacherId,
    limit: 20,
  });

  const unreadCount = useQuery(api.thankYouMessages.getUnreadCount, {
    teacherId,
  });

  const respond = useMutation(api.thankYouMessages.respond);
  const markAsRead = useMutation(api.thankYouMessages.markAsRead);

  const handleQuickEmoji = async (
    messageId: Id<"thankYouMessages">,
    emoji: string,
  ) => {
    try {
      await respond({
        messageId,
        emoji,
      });
      toast.success("Response sent! " + emoji);
    } catch (error) {
      console.error("Error sending emoji:", error);
      toast.error("Failed to send response");
    }
  };

  const handleOpenResponse = async (messageId: Id<"thankYouMessages">) => {
    setSelectedMessage(messageId);
    setResponseEmoji("");
    setResponseText("");

    // Mark as read when opening
    try {
      await markAsRead({ messageId });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || (!responseEmoji && !responseText.trim())) {
      toast.error("Please select an emoji or write a message");
      return;
    }

    setIsResponding(true);
    try {
      await respond({
        messageId: selectedMessage as Id<"thankYouMessages">,
        emoji: responseEmoji || undefined,
        message: responseText.trim() || undefined,
      });

      toast.success("Response sent! 💝");
      setSelectedMessage(null);
      setResponseEmoji("");
      setResponseText("");
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Failed to send response");
    } finally {
      setIsResponding(false);
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Thank You Messages
          </CardTitle>
          <CardDescription>Messages from your students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No thank you messages yet</p>
            <p className="text-sm">
              Students can send you thank you messages after lessons
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Thank You Messages
                {unreadCount !== undefined && unreadCount > 0 && (
                  <Badge className="bg-pink-500">{unreadCount} new</Badge>
                )}
              </CardTitle>
              <CardDescription>Messages from your students</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`border rounded-lg p-4 transition-all ${
                    !msg.isRead
                      ? "bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* Student Info and Message */}
                  <div className="flex gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={msg.studentImage} />
                      <AvatarFallback>
                        {msg.studentName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{msg.studentName}</p>
                        {!msg.isRead && (
                          <Badge
                            variant="secondary"
                            className="bg-pink-500 text-white text-xs"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {msg.lessonDate} at {msg.lessonTime}
                        </span>
                        <span>•</span>
                        <span>
                          {format(new Date(msg.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  {/* Teacher Response or Actions */}
                  {msg.teacherResponse ? (
                    <div className="mt-3 ml-13 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                        Your response:
                      </p>
                      {msg.teacherResponse.emoji && (
                        <div className="text-2xl mb-1">
                          {msg.teacherResponse.emoji}
                        </div>
                      )}
                      {msg.teacherResponse.message && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {msg.teacherResponse.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Quick Emoji Responses */}
                      {EMOJI_OPTIONS.map((emoji) => (
                        <Button
                          key={emoji}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickEmoji(msg._id, emoji)}
                          className="text-xl hover:scale-110 transition-transform"
                        >
                          {emoji}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenResponse(msg._id)}
                        className="ml-auto"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Write Response
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-purple-500" />
              Respond to Thank You
            </DialogTitle>
            <DialogDescription>
              Send an emoji or write a message back to your student
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Emoji Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Choose an emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant={responseEmoji === emoji ? "default" : "outline"}
                    size="lg"
                    onClick={() =>
                      setResponseEmoji(responseEmoji === emoji ? "" : emoji)
                    }
                    className="text-2xl"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Optional Text Response */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Add a message (optional)
              </label>
              <Textarea
                placeholder="Write a personal message..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {responseText.length}/300 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedMessage(null)}
              disabled={isResponding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={
                (!responseEmoji && !responseText.trim()) || isResponding
              }
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isResponding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
