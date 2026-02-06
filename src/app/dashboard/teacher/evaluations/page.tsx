"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { TeacherEvaluationModal } from "@/app/components/TeacherEvaluationModal";

// Define the exact shape that comes from the query
type StudentNeedingEvaluation = {
  student: {
    _id: Id<"users">;
    name?: string;
    email?: string;
    // ... other fields you might need
  };
  lastEval: {
    year: number;
    month: number;
    // you can make this more precise if needed
  } | null;
  lessonsCompleted: number;
  firstLessonDate: number;
};

export default function TeacherEvaluationsPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.convexId as Id<"users"> | undefined;

  const studentsNeedingEvaluation = useQuery(
    api.evaluations.getStudentsNeedingEvaluation,
    userId ? { teacherId: userId } : "skip",
  ) as StudentNeedingEvaluation[] | undefined;

  // Better typed selected student state
  const [selectedStudent, setSelectedStudent] = useState<{
    id: Id<"users">;
    name: string; // we will ensure it's string
    lastEvaluation: StudentNeedingEvaluation["lastEval"];
  } | null>(null);

  if (!userId) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Evaluations</h1>
        <p className="text-muted-foreground mt-1">
          Submit monthly evaluations for students you&apos;ve taught for more than a
          month
        </p>
      </div>

      {!studentsNeedingEvaluation || studentsNeedingEvaluation.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Evaluations Needed
            </h3>
            <p className="text-muted-foreground">
              All your students have been evaluated for this month, or no
              students have completed a month of lessons yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {studentsNeedingEvaluation.map((item) => {
            // Safely get name with fallback
            const studentName = item.student.name ?? "Unnamed Student";

            return (
              <Card
                key={item.student._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{studentName}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.student.email ?? "No email"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {item.lessonsCompleted} lesson
                      {item.lessonsCompleted !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      First lesson:{" "}
                      {new Date(item.firstLessonDate).toLocaleDateString()}
                      {item.lastEval && (
                        <span className="ml-4">
                          Last evaluation:{" "}
                          {new Date(
                            item.lastEval.year,
                            item.lastEval.month,
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() =>
                        setSelectedStudent({
                          id: item.student._id,
                          name: studentName,
                          lastEvaluation: item.lastEval,
                        })
                      }
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Create Evaluation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedStudent && (
        <TeacherEvaluationModal
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          teacherId={userId}
          previousEvaluation={selectedStudent.lastEvaluation}
        />
      )}
    </div>
  );
}
