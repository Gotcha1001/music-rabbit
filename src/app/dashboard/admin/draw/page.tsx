"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

const DRAW_STYLES = `
  .draw-card    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .draw-card { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 24px rgba(139,92,246,0.1) !important; }

  .draw-title   { color: hsl(var(--foreground)) !important; }
  .dark .draw-title { color: #ddd6fe !important; }

  .draw-label   { color: hsl(var(--foreground)) !important; }
  .dark .draw-label { color: #c4b5fd !important; }

  .draw-input   { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .draw-input:focus { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .dark .draw-input { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }

  .draw-select  { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .draw-select { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }

  .draw-btn     { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .draw-btn:hover { background: hsl(var(--primary)/0.9) !important; }
  .dark .draw-btn { background: #7c3aed !important; }
  .dark .draw-btn:hover { background: #6d28d9 !important; }
`;

export default function AdminDrawPage() {
  const students = (useQuery(api.users.getAllStudents) as Doc<"users">[]) || [];
  const adminCreditFreePackage = useMutation(
    api.studentPackages.adminCreditFreePackage,
  );

  const [drawStudentId, setDrawStudentId] = useState("");
  const [drawPackageType, setDrawPackageType] = useState("Premium");
  const [drawLessonsPerWeek, setDrawLessonsPerWeek] = useState(3);
  const [drawMinutesPerLesson, setDrawMinutesPerLesson] = useState(30);
  const [drawTotalMinutes, setDrawTotalMinutes] = useState(360);

  const handleCreditPackage = async () => {
    if (!drawStudentId) {
      toast.error("Select a student");
      return;
    }
    try {
      const result = await adminCreditFreePackage({
        studentId: drawStudentId as Id<"users">,
        packageType: drawPackageType,
        lessonsPerWeek: drawLessonsPerWeek,
        minutesPerLesson: drawMinutesPerLesson,
        totalMinutesPerMonth: drawTotalMinutes,
      });
      const student = students.find((s) => s._id === drawStudentId);
      const congratsMsg = `Congratulations, ${student?.name || student?.email.split("@")[0]}! You've won the monthly draw. Your free ${drawPackageType} package (${drawLessonsPerWeek} lessons/week, ${drawMinutesPerLesson} min each) is now active for ${result.assignedMonth}. Log in to schedule your lessons!`;
      toast.success(
        <div className="flex flex-col gap-3">
          <p>Package credited successfully!</p>
          <p>Copy this message for manual email:</p>
          <Textarea readOnly value={congratsMsg} className="h-32 bg-muted" />
          <Button
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(congratsMsg);
              toast.info("Message copied!");
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Message
          </Button>
        </div>,
        { duration: 15000 },
      );
      setDrawStudentId("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to credit package",
      );
    }
  };

  return (
    <>
      <style>{DRAW_STYLES}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="draw-card rounded-xl border-2 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="draw-title flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold font-serif">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
              Monthly Draw — Credit Free Package
            </h2>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Student selector */}
            <div className="space-y-1.5">
              <label className="draw-label text-sm font-medium">
                Select Winner
              </label>
              <Select value={drawStudentId} onValueChange={setDrawStudentId}>
                <SelectTrigger className="draw-select">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name || s.email.split("@")[0]} (
                      {s.instrument || "No instrument"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package config grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="draw-label text-sm font-medium">
                  Package Type
                </label>
                <input
                  value={drawPackageType}
                  onChange={(e) => setDrawPackageType(e.target.value)}
                  className="draw-input w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="draw-label text-sm font-medium">
                  Lessons / Week
                </label>
                <input
                  type="number"
                  value={drawLessonsPerWeek}
                  onChange={(e) =>
                    setDrawLessonsPerWeek(Number(e.target.value))
                  }
                  className="draw-input w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="draw-label text-sm font-medium">
                  Min / Lesson
                </label>
                <input
                  type="number"
                  value={drawMinutesPerLesson}
                  onChange={(e) =>
                    setDrawMinutesPerLesson(Number(e.target.value))
                  }
                  className="draw-input w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="draw-label text-sm font-medium">
                  Total Minutes
                </label>
                <input
                  type="number"
                  value={drawTotalMinutes}
                  onChange={(e) => setDrawTotalMinutes(Number(e.target.value))}
                  className="draw-input w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleCreditPackage}
              className="draw-btn w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              Credit Free Package
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
