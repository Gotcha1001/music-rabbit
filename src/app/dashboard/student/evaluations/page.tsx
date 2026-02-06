"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

type EvaluationScale =
  | "weak"
  | "ok"
  | "better"
  | "good"
  | "excellent"
  | "perfection";

const SCALE_VALUES: Record<EvaluationScale, number> = {
  weak: 1,
  ok: 2,
  better: 3,
  good: 4,
  excellent: 5,
  perfection: 6,
};

const SCALE_COLORS: Record<EvaluationScale, string> = {
  weak: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  ok: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  better:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  good: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  excellent:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  perfection:
    "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
};

type EvaluationWithTeacher = {
  _id: Id<"evaluations">;
  month: number;
  year: number;
  createdAt: number;
  scales: string;
  chords: string;
  sightReading: string;
  rhythm: string;
  improvisation: string;
  piecesWorkedOn: string[];
  notes?: string;
  teacher?: { name?: string } | null;
};

function getTrendIcon(current: string, previous: string | undefined) {
  if (!previous) return <Minus className="h-4 w-4" />;

  const currentValue = SCALE_VALUES[current as EvaluationScale] ?? 0;
  const previousValue = SCALE_VALUES[previous as EvaluationScale] ?? 0;

  if (currentValue > previousValue) {
    return <TrendingUp className="h-4 w-4 text-green-600" />;
  }
  if (currentValue < previousValue) {
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  }
  return <Minus className="h-4 w-4 text-gray-400" />;
}

export default function StudentEvaluationsPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.convexId as Id<"users"> | undefined;

  const evaluations = useQuery(
    api.evaluations.getStudentEvaluations,
    userId ? { studentId: userId } : "skip",
  ) as EvaluationWithTeacher[] | undefined;

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
        <h1 className="text-3xl font-bold">My Evaluations</h1>
        <p className="text-muted-foreground mt-1">
          Monthly progress evaluations from your teachers
        </p>
      </div>

      {!evaluations || evaluations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Evaluations Yet</h3>
            <p className="text-muted-foreground">
              Wait at least a month after starting lessons to receive your first
              evaluation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {evaluations.map((evaluation, index) => {
            const previousEval =
              index < evaluations.length - 1 ? evaluations[index + 1] : null;
            const monthYear = new Date(
              evaluation.year,
              evaluation.month,
            ).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });

            return (
              <Card key={evaluation._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{monthYear}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Teacher: {evaluation.teacher?.name || "Unknown"}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Scales",
                        value: evaluation.scales,
                        previous: previousEval?.scales,
                      },
                      {
                        label: "Chords",
                        value: evaluation.chords,
                        previous: previousEval?.chords,
                      },
                      {
                        label: "Sight Reading",
                        value: evaluation.sightReading,
                        previous: previousEval?.sightReading,
                      },
                      {
                        label: "Rhythm",
                        value: evaluation.rhythm,
                        previous: previousEval?.rhythm,
                      },
                      {
                        label: "Improvisation",
                        value: evaluation.improvisation,
                        previous: previousEval?.improvisation,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}:</span>
                          <Badge
                            className={
                              SCALE_COLORS[item.value as EvaluationScale]
                            }
                          >
                            {item.value}
                          </Badge>
                        </div>
                        {getTrendIcon(item.value, item.previous)}
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Pieces Worked On:</h4>
                    {evaluation.piecesWorkedOn.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {evaluation.piecesWorkedOn.map((piece, i) => (
                          <li key={i} className="text-muted-foreground">
                            {piece}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No pieces recorded this month
                      </p>
                    )}
                  </div>

                  {evaluation.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        Teacher&apos;s Notes:
                      </h4>
                      <p className="text-muted-foreground italic">
                        {evaluation.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
