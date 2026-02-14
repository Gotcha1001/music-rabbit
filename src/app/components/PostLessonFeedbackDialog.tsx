// components/teacher/PostLessonFeedbackDialog.tsx
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const wentWellOptions = [
  "Great focus",
  "Good rhythm",
  "Nice dynamics",
  "Strong technique",
  "Improved reading",
  "Creative expression",
  "Solid theory understanding",
  "Excellent effort",
  "Quick progress",
  "Very attentive",
];

interface PostLessonFeedbackDialogProps {
  memoId?: Id<"tutorMemos">;
  studentName: string;
  initialDateTime?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PostLessonFeedbackDialog({
  memoId,
  studentName,
  initialDateTime,
  open,
  onOpenChange,
  onSuccess,
}: PostLessonFeedbackDialogProps) {
  const submitFeedback = useMutation(api.tutorMemos.submitLessonFeedback);

  const [nextLessonFocus, setNextLessonFocus] = useState("");
  const [nextBookPageRef, setNextBookPageRef] = useState("");
  const [nextPiece, setNextPiece] = useState("");
  const [wentWell, setWentWell] = useState<string[]>([]);
  const [skillRatings, setSkillRatings] = useState({
    technique: 0,
    rhythm: 0,
    reading: 0,
    theory: 0,
    expression: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWentWell = (option: string) => {
    if (!wentWell.includes(option)) {
      setWentWell([...wentWell, option]);
    }
  };

  const handleRemoveWentWell = (option: string) => {
    setWentWell(wentWell.filter((item) => item !== option));
  };

  const handleRatingChange = (
    skill: keyof typeof skillRatings,
    value: number,
  ) => {
    setSkillRatings((prev) => ({ ...prev, [skill]: value }));
  };

  const handleSubmit = async () => {
    if (!nextLessonFocus.trim()) {
      toast.error("Please enter the focus for the next lesson");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedback({
        memoId,
        nextLessonFocus: nextLessonFocus.trim(),
        nextBookPageRef: nextBookPageRef.trim() || undefined,
        nextPiece: nextPiece.trim() || undefined,
        wentWell,
        skillRatings: {
          technique: skillRatings.technique || undefined,
          rhythm: skillRatings.rhythm || undefined,
          reading: skillRatings.reading || undefined,
          theory: skillRatings.theory || undefined,
          expression: skillRatings.expression || undefined,
        },
      });

      toast.success("Feedback submitted successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Feedback for {studentName}</DialogTitle>
          {initialDateTime && (
            <DialogDescription>Lesson on {initialDateTime}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Next Lesson Focus – required */}
          <div className="space-y-2">
            <Label htmlFor="focus" className="text-base font-medium">
              Focus for next lesson *
            </Label>
            <Textarea
              id="focus"
              placeholder="e.g. Improve left-hand coordination and finger independence"
              value={nextLessonFocus}
              onChange={(e) => setNextLessonFocus(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Optional refs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="book-page">Book / Page Reference</Label>
              <Input
                id="book-page"
                placeholder="e.g. Alfred Book 1, pages 34-35"
                value={nextBookPageRef}
                onChange={(e) => setNextBookPageRef(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="piece">Next Piece / Exercise</Label>
              <Input
                id="piece"
                placeholder="e.g. Ode to Joy variation"
                value={nextPiece}
                onChange={(e) => setNextPiece(e.target.value)}
              />
            </div>
          </div>

          {/* What went well – multi-select */}
          <div className="space-y-3">
            <Label className="text-base font-medium">What went well</Label>
            <div className="flex flex-wrap gap-2">
              {wentWellOptions.map((option) => (
                <Badge
                  key={option}
                  variant={wentWell.includes(option) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-primary/90 transition-colors",
                    wentWell.includes(option) &&
                      "bg-primary text-primary-foreground",
                  )}
                  onClick={() =>
                    wentWell.includes(option)
                      ? handleRemoveWentWell(option)
                      : handleAddWentWell(option)
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
            {wentWell.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {wentWell.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {item}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveWentWell(item)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Skill Ratings – 1 to 5 */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Skill Snapshot (1–5)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(skillRatings).map(([skill, value]) => (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between text-sm capitalize">
                    <span>{skill}</span>
                    <span className="font-medium">{value || "—"}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-6 w-6 cursor-pointer transition-colors",
                          star <= value
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-300",
                        )}
                        onClick={() =>
                          handleRatingChange(
                            skill as keyof typeof skillRatings,
                            star,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !nextLessonFocus.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
