// app/dashboard/student/thank-yous/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUserDetail } from "@/context/UserDetailContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function StudentThankYousPage() {
  const { userDetail } = useUserDetail();

  const messages = useQuery(
    api.thankYouMessages.getForStudent,
    userDetail?.role === "student" && userDetail?._id
      ? { studentId: userDetail._id, limit: 50 }
      : "skip",
  );

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

  if (userDetail.role !== "student") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only students can view this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="h-10 w-10 text-pink-500" />
              My Thank You Messages
            </h1>
            <p className="text-muted-foreground">
              View all the thank you messages you&apos;ve sent to your teachers
            </p>
          </div>

          {/* Messages List */}
          {!messages || messages.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">
                    No thank you messages yet
                  </h3>
                  <p className="text-muted-foreground">
                    After completing a lesson, you can send a thank you message
                    to your teacher
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card
                  key={msg._id}
                  className="overflow-hidden border-2 hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={msg.teacherImage} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold">
                            {msg.teacherName?.charAt(0) || "T"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            To: {msg.teacherName}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {msg.lessonDate} at {msg.lessonTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(msg.timestamp), "MMM d, yyyy")}
                        </p>
                        {msg.teacherResponse ? (
                          <Badge className="mt-1 bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Replied
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="mt-1">
                            Sent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {/* Your Message */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Your message:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border">
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>

                    {/* Teacher Response */}
                    {msg.teacherResponse && (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
                          {msg.teacherName}&apos;s response:
                        </p>
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
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(
                            new Date(msg.teacherResponse.timestamp),
                            "MMM d, h:mm a",
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
