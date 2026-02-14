// components/teacher/PendingFeedbackList.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUserDetail } from "@/context/UserDetailContext";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock, User } from "lucide-react";
import { useState } from "react";
import { PostLessonFeedbackDialog } from "./PostLessonFeedbackDialog";

export function PendingFeedbackList() {
  const { userDetail } = useUserDetail();
  const teacherId = userDetail?._id as Id<"users"> | undefined;

  const pendingFeedback = useQuery(
    api.tutorMemos.getPendingFeedbackForTeacher,
    teacherId ? { teacherId } : "skip",
  );

  const [selectedMemo, setSelectedMemo] = useState<
    | {
        _id: Id<"tutorMemos">;
        studentName: string;
        scheduleDate: string | null;
        lessonTime: string | null;
      }
    | undefined
  >(undefined);

  if (!teacherId) {
    return null; // Not logged in as teacher
  }

  if (pendingFeedback === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (pendingFeedback.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="py-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
            All caught up!
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No pending feedback at the moment. Great job!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle>Pending Feedback ({pendingFeedback.length})</CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            >
              Complete before end of shift
            </Badge>
          </div>
          <CardDescription>
            {pendingFeedback.length === 1
              ? "1 lesson needs your feedback"
              : `${pendingFeedback.length} lessons need feedback`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {pendingFeedback.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-800 hover:border-orange-400 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium truncate">
                    {item.studentName}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  {item.scheduleDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {item.scheduleDate}
                      {item.lessonTime && ` • ${item.lessonTime}`}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-orange-100 dark:bg-orange-950 px-2 py-0.5 rounded-full">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() =>
                  setSelectedMemo({
                    _id: item._id,
                    studentName: item.studentName,
                    scheduleDate: item.scheduleDate,
                    lessonTime: item.lessonTime,
                  })
                }
                className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                size="sm"
              >
                Complete Feedback
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dialog for completing feedback */}
      {selectedMemo && (
        <PostLessonFeedbackDialog
          memoId={selectedMemo._id}
          studentName={selectedMemo.studentName}
          initialDateTime={
            selectedMemo.scheduleDate && selectedMemo.lessonTime
              ? `${selectedMemo.scheduleDate} ${selectedMemo.lessonTime}`
              : undefined
          }
          open={!!selectedMemo}
          onOpenChange={(open) => {
            if (!open) setSelectedMemo(undefined);
          }}
          onSuccess={() => {
            // Optional: invalidate/re-fetch query if needed
            setSelectedMemo(undefined);
          }}
        />
      )}
    </>
  );
}
