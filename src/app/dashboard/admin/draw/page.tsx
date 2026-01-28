"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function AdminDrawPage() {
  const students = (useQuery(api.users.getAllStudents) as Doc<"users">[]) || [];

  const adminCreditFreePackage = useMutation(
    api.studentPackages.adminCreditFreePackage,
  );

  const [drawStudentId, setDrawStudentId] = useState<string>("");
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
              toast.info("Message copied to clipboard!");
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Message
          </Button>
        </div>,
        { duration: 15000 },
      );

      // Reset form
      setDrawStudentId("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to credit package",
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card border-2 border-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-serif">
            <Sparkles className="h-7 w-7 text-primary" />
            Monthly Draw - Credit Free Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Select Winner</Label>
            <Select value={drawStudentId} onValueChange={setDrawStudentId}>
              <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Package Type</Label>
              <Input
                value={drawPackageType}
                onChange={(e) => setDrawPackageType(e.target.value)}
              />
            </div>
            <div>
              <Label>Lessons/Week</Label>
              <Input
                type="number"
                value={drawLessonsPerWeek}
                onChange={(e) => setDrawLessonsPerWeek(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Min/Lesson</Label>
              <Input
                type="number"
                value={drawMinutesPerLesson}
                onChange={(e) =>
                  setDrawMinutesPerLesson(Number(e.target.value))
                }
              />
            </div>
            <div>
              <Label>Total Minutes</Label>
              <Input
                type="number"
                value={drawTotalMinutes}
                onChange={(e) => setDrawTotalMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            onClick={handleCreditPackage}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Credit Free Package
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
