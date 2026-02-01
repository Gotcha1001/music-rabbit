"use client";

import { useMutation, useQuery } from "convex/react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react"; // For loading spinner
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface StudentInfoSectionProps {
  studentId: string; // Pass the student's Convex _id
}

export function StudentInfoSection({ studentId }: StudentInfoSectionProps) {
  const typedStudentId = studentId as Id<"users">;
  const info = useQuery(api.tutorsMemos.getGeneralInfoForStudent, {
    studentId: typedStudentId,
  });
  const updateInfo = useMutation(api.tutorsMemos.updateGeneralInfoForStudent);

  const [content, setContent] = useState(info?.content || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateInfo({ studentId: typedStudentId, content });
      // Optional: Add a toast notification here, e.g., toast.success("Saved!");
    } catch (error) {
      console.error("Error saving student info:", error);
      // Optional: toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">
        Student Information (By teachers)
      </h3>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write some basic knowledge of the student, e.g., their preferred name, what they're good at and not, family background, etc. This is visible to all teachers."
        className="min-h-[120px] mb-4 bg-white"
      />
      <Button
        onClick={handleSave}
        disabled={isSaving || content === info?.content}
        className="bg-blue-500 hover:bg-blue-600"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </Button>
    </div>
  );
}
