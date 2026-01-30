// components/ThankYouButton.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Heart, Check } from "lucide-react";
import { ThankYouMessageModal } from "./ThankYouMessageModal";
import { Badge } from "@/components/ui/badge";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface ThankYouButtonProps {
  scheduleId: Id<"schedules">;
  lessonId: string;
  teacherId: Id<"users">;
  teacherName: string;
  lessonCompleted: boolean;
}

export function ThankYouButton({
  scheduleId,
  lessonId,
  teacherId,
  teacherName,
  lessonCompleted,
}: ThankYouButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if student has already sent a thank you message
  const hasMessage = useQuery(api.thankYouMessages.hasStudentSentMessage, {
    scheduleId,
    lessonId,
  });

  // Get the message details to show teacher response
  const messageDetails = useQuery(api.thankYouMessages.getForLesson, {
    scheduleId,
    lessonId,
  });

  // Don't show the button if lesson is not completed
  if (!lessonCompleted) {
    return null;
  }

  // If message sent and teacher responded, show the response
  if (hasMessage && messageDetails?.teacherResponse) {
    return (
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
            <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-medium text-sm">Thank you message sent!</p>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                <Check className="h-3 w-3 mr-1" />
                Read
              </Badge>
            </div>

            {messageDetails.teacherResponse.emoji && (
              <div className="text-3xl mb-2">
                {messageDetails.teacherResponse.emoji}
              </div>
            )}

            {messageDetails.teacherResponse.message && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {teacherName} replied:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {messageDetails.teacherResponse.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If message sent but no teacher response yet
  if (hasMessage) {
    return (
      <div className="bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
            <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Thank you message sent!</p>
            <p className="text-xs text-muted-foreground">
              {teacherName} will see your message
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show the send button
  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="w-full border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-400 transition-all"
      >
        <Heart className="h-4 w-4 mr-2 text-pink-500" />
        <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-medium">
          Send Thank You to {teacherName}
        </span>
      </Button>

      <ThankYouMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scheduleId={scheduleId}
        lessonId={lessonId}
        teacherId={teacherId}
        teacherName={teacherName}
      />
    </>
  );
}
