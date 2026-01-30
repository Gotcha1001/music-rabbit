// app/dashboard/thanks-messages/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useUserDetail } from "@/context/UserDetailContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Send, Smile } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["❤️", "🙏", "😊", "⭐", "🎵", "💯", "👏", "🌟"];

export default function ThanksMessagesPage() {
  const { userDetail } = useUserDetail();
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [responseEmoji, setResponseEmoji] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");
  const [isResponding, setIsResponding] = useState(false);

  const messages = useQuery(
    api.thankYouMessages.getForTeacher,
    userDetail?.role === "teacher" && userDetail?._id
      ? { teacherId: userDetail._id, limit: 50 }
      : "skip",
  );

  const respond = useMutation(api.thankYouMessages.respond);
  const markAsRead = useMutation(api.thankYouMessages.markAsRead);

  if (!userDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only teachers can view thank you messages
          </p>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Decorative balloons background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-20 bg-green-400 rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-40 left-32 w-20 h-24 bg-yellow-400 rounded-full opacity-30 animate-float-delay-1"></div>
          <div className="absolute top-32 right-20 w-18 h-22 bg-red-400 rounded-full opacity-30 animate-float-delay-2"></div>
          <div className="absolute top-60 right-40 w-14 h-18 bg-blue-400 rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-10 right-60 w-12 h-16 bg-purple-400 rounded-full opacity-30 animate-float-delay-1"></div>
          <div className="absolute top-80 left-1/4 w-10 h-14 bg-orange-400 rounded-full opacity-30 animate-float-delay-2"></div>
          {/* Confetti dots */}
          <div className="absolute top-40 left-1/3 w-2 h-2 bg-red-400 rounded-full opacity-40"></div>
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-40"></div>
          <div className="absolute top-60 left-1/2 w-2 h-2 bg-green-400 rounded-full opacity-40"></div>
          <div className="absolute top-20 right-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-40"></div>
          <div className="absolute top-50 left-2/3 w-2 h-2 bg-purple-400 rounded-full opacity-40"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Heart className="h-24 w-24 mx-auto mb-6 text-pink-300 animate-pulse" />
              <h1 className="text-4xl font-bold mb-2">Thanks Message</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 border-2 border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xl text-muted-foreground mb-2">
                  No thank you messages yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Your students will be able to send you thank you messages
                  after lessons
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Decorative balloons background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-20 bg-green-400 rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-40 left-32 w-20 h-24 bg-yellow-400 rounded-full opacity-30 animate-float-delay-1"></div>
          <div className="absolute top-32 right-20 w-18 h-22 bg-red-400 rounded-full opacity-30 animate-float-delay-2"></div>
          <div className="absolute top-60 right-40 w-14 h-18 bg-blue-400 rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-10 right-60 w-12 h-16 bg-purple-400 rounded-full opacity-30 animate-float-delay-1"></div>
          <div className="absolute top-80 left-1/4 w-10 h-14 bg-orange-400 rounded-full opacity-30 animate-float-delay-2"></div>
          {/* Confetti dots */}
          <div className="absolute top-40 left-1/3 w-2 h-2 bg-red-400 rounded-full opacity-40"></div>
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-40"></div>
          <div className="absolute top-60 left-1/2 w-2 h-2 bg-green-400 rounded-full opacity-40"></div>
          <div className="absolute top-20 right-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-40"></div>
          <div className="absolute top-50 left-2/3 w-2 h-2 bg-purple-400 rounded-full opacity-40"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Thanks Message</h1>
            </div>

            {/* Messages Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-100 dark:border-gray-700">
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`border-2 rounded-xl p-6 transition-all ${
                      !msg.isRead
                        ? "bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-700"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {/* Student Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                        <AvatarImage src={msg.studentImage} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-lg font-bold">
                          {msg.studentName?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">
                              {msg.studentName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {msg.studentName?.split(" ")[1] || "Student"}@
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {msg.lessonDate
                                ? format(new Date(msg.lessonDate), "yyyy.MM.dd")
                                : ""}
                            </p>
                            {!msg.isRead && (
                              <Badge className="bg-pink-500 text-white mt-1">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-3">
                          <p className="text-gray-700 dark:text-gray-300">
                            {msg.message}
                          </p>
                        </div>

                        {/* Teacher Response or Quick Actions */}
                        {msg.teacherResponse ? (
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 border-2 border-white">
                                <AvatarImage src={userDetail.imageUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold">
                                  {userDetail.name?.charAt(0) || "T"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm">
                                    {userDetail.name || "Teacher"}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20"
                                  >
                                    ✓{" "}
                                    {format(
                                      new Date(msg.teacherResponse.timestamp),
                                      "yyyy-MM-dd HH:mm:ss",
                                    )}
                                  </Badge>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                  {msg.teacherResponse.emoji && (
                                    <div className="text-3xl mb-2">
                                      {msg.teacherResponse.emoji}
                                    </div>
                                  )}
                                  {msg.teacherResponse.message && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {msg.teacherResponse.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {EMOJI_OPTIONS.map((emoji) => (
                              <Button
                                key={emoji}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickEmoji(msg._id, emoji)}
                                className="text-2xl hover:scale-110 transition-transform hover:bg-pink-50 dark:hover:bg-pink-900/20"
                              >
                                {emoji}
                              </Button>
                            ))}
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenResponse(msg._id)}
                              className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Write Response
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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

            <div>
              <label className="text-sm font-medium mb-2 block">
                Add a message (optional)
              </label>
              <Textarea
                placeholder="No worries, thanks for letting me know , have a beautiful rest of the week thanks"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[120px] resize-none"
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

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delay-1 {
          animation: float 7s ease-in-out infinite;
          animation-delay: -2s;
        }

        .animate-float-delay-2 {
          animation: float 8s ease-in-out infinite;
          animation-delay: -4s;
        }
      `}</style>
    </>
  );
}
