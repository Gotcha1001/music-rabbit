// "use client";

// import { useQuery } from "convex/react";
// import { useUser } from "@clerk/nextjs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   ClipboardList,
//   TrendingUp,
//   TrendingDown,
//   Minus,
//   Sparkles,
//   Calendar,
// } from "lucide-react";
// import { api } from "../../../../../convex/_generated/api";
// import { Id } from "../../../../../convex/_generated/dataModel";

// type EvaluationScale =
//   | "weak"
//   | "ok"
//   | "better"
//   | "good"
//   | "excellent"
//   | "perfection";

// const SCALE_VALUES: Record<EvaluationScale, number> = {
//   weak: 1,
//   ok: 2,
//   better: 3,
//   good: 4,
//   excellent: 5,
//   perfection: 6,
// };

// const SCALE_COLORS: Record<EvaluationScale, string> = {
//   weak: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
//   ok: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
//   better:
//     "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
//   good: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
//   excellent:
//     "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
//   perfection:
//     "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
// };

// type EvaluationWithTeacher = {
//   _id: Id<"evaluations">;
//   month: number;
//   year: number;
//   createdAt: number;
//   scales: string;
//   chords: string;
//   sightReading: string;
//   rhythm: string;
//   improvisation: string;
//   piecesWorkedOn: string[];
//   notes?: string;
//   teacher?: { name?: string } | null;
// };

// type EvaluationData = {
//   evaluations: EvaluationWithTeacher[];
//   status: "waiting" | "available" | "no_lessons";
//   nextEvaluationDate: number | null;
//   encouragementMessage: string | null;
//   hasEvaluations: boolean;
// };

// function getTrendIcon(current: string, previous: string | undefined) {
//   if (!previous) return <Minus className="h-4 w-4" />;

//   const currentValue = SCALE_VALUES[current as EvaluationScale] ?? 0;
//   const previousValue = SCALE_VALUES[previous as EvaluationScale] ?? 0;

//   if (currentValue > previousValue) {
//     return <TrendingUp className="h-4 w-4 text-green-600" />;
//   }
//   if (currentValue < previousValue) {
//     return <TrendingDown className="h-4 w-4 text-red-600" />;
//   }
//   return <Minus className="h-4 w-4 text-gray-400" />;
// }

// export default function StudentEvaluationsPage() {
//   const { user } = useUser();

//   // Use the existing get query which gets user by Clerk ID from auth
//   const convexUser = useQuery(api.users.get);

//   const data = useQuery(
//     api.evaluations.getStudentEvaluations,
//     convexUser?._id ? { studentId: convexUser._id } : "skip",
//   ) as EvaluationData | undefined;

//   // Show a nicer loading state while fetching
//   if (!user || convexUser === undefined) {
//     return (
//       <div className="p-6 space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold">My Evaluations</h1>
//           <p className="text-muted-foreground mt-1">
//             Monthly progress evaluations from your teachers
//           </p>
//         </div>
//         <div className="flex justify-center items-center min-h-[50vh]">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4" />
//             <p className="text-muted-foreground">Loading user information...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!convexUser) {
//     return (
//       <div className="p-6 space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold">My Evaluations</h1>
//           <p className="text-muted-foreground mt-1">
//             Monthly progress evaluations from your teachers
//           </p>
//         </div>
//         <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
//           <CardContent className="py-12 text-center">
//             <ClipboardList className="h-12 w-12 mx-auto text-red-500 mb-4" />
//             <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-100">
//               Unable to Load Evaluations
//             </h3>
//             <p className="text-red-700 dark:text-red-300 max-w-md mx-auto">
//               Your user account is not properly set up. Please contact support
//               or try logging out and back in.
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (data === undefined) {
//     return (
//       <div className="p-6 space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold">My Evaluations</h1>
//           <p className="text-muted-foreground mt-1">
//             Monthly progress evaluations from your teachers
//           </p>
//         </div>
//         <div className="flex justify-center items-center min-h-[50vh]">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4" />
//             <p className="text-muted-foreground">Loading your evaluations...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const {
//     evaluations,
//     status,
//     nextEvaluationDate,
//     encouragementMessage,
//     hasEvaluations,
//   } = data;

//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">My Evaluations</h1>
//         <p className="text-muted-foreground mt-1">
//           Monthly progress evaluations from your teachers
//         </p>
//       </div>

//       {/* Show encouragement message if status is waiting */}
//       {status === "waiting" && encouragementMessage && (
//         <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
//           <Sparkles className="h-4 w-4 text-purple-600" />
//           <AlertDescription className="text-purple-900 dark:text-purple-100">
//             <p className="font-medium mb-2">{encouragementMessage}</p>
//             {nextEvaluationDate && (
//               <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
//                 <Calendar className="h-3 w-3" />
//                 <span>
//                   Next evaluation expected:{" "}
//                   {new Date(nextEvaluationDate).toLocaleDateString("en-US", {
//                     month: "long",
//                     day: "numeric",
//                     year: "numeric",
//                   })}
//                 </span>
//               </div>
//             )}
//           </AlertDescription>
//         </Alert>
//       )}

//       {!hasEvaluations ? (
//         <Card className="border-dashed">
//           <CardContent className="py-12 text-center">
//             <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//             <h3 className="text-lg font-semibold mb-3">No Evaluations Yet</h3>
//             <p className="text-muted-foreground max-w-md mx-auto">
//               You need at least 1 month (4+ weeks) of lessons with the same
//               teacher to start receiving monthly evaluations.
//             </p>
//             <p className="text-sm text-muted-foreground mt-4">
//               Keep attending your lessons consistently — your first evaluation
//               will appear here automatically!
//             </p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-6">
//           {evaluations.map((evaluation, index) => {
//             const previousEval =
//               index < evaluations.length - 1 ? evaluations[index + 1] : null;

//             const monthYear = new Date(
//               evaluation.year,
//               evaluation.month,
//             ).toLocaleDateString("en-US", {
//               month: "long",
//               year: "numeric",
//             });

//             return (
//               <Card key={evaluation._id}>
//                 <CardHeader>
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <CardTitle>{monthYear}</CardTitle>
//                       <p className="text-sm text-muted-foreground mt-1">
//                         Teacher: {evaluation.teacher?.name || "Unknown"}
//                       </p>
//                     </div>
//                     <Badge variant="outline">
//                       {new Date(evaluation.createdAt).toLocaleDateString()}
//                     </Badge>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {[
//                       {
//                         label: "Scales",
//                         value: evaluation.scales,
//                         previous: previousEval?.scales,
//                       },
//                       {
//                         label: "Chords",
//                         value: evaluation.chords,
//                         previous: previousEval?.chords,
//                       },
//                       {
//                         label: "Sight Reading",
//                         value: evaluation.sightReading,
//                         previous: previousEval?.sightReading,
//                       },
//                       {
//                         label: "Rhythm",
//                         value: evaluation.rhythm,
//                         previous: previousEval?.rhythm,
//                       },
//                       {
//                         label: "Improvisation",
//                         value: evaluation.improvisation,
//                         previous: previousEval?.improvisation,
//                       },
//                     ].map((item) => (
//                       <div
//                         key={item.label}
//                         className="flex items-center justify-between p-3 bg-muted rounded-lg"
//                       >
//                         <div className="flex items-center gap-2">
//                           <span className="font-medium">{item.label}:</span>
//                           <Badge
//                             className={
//                               SCALE_COLORS[item.value as EvaluationScale]
//                             }
//                           >
//                             {item.value}
//                           </Badge>
//                         </div>
//                         {getTrendIcon(item.value, item.previous)}
//                       </div>
//                     ))}
//                   </div>

//                   <div>
//                     <h4 className="font-semibold mb-2">Pieces Worked On:</h4>
//                     {evaluation.piecesWorkedOn.length > 0 ? (
//                       <ul className="list-disc list-inside space-y-1">
//                         {evaluation.piecesWorkedOn.map((piece, i) => (
//                           <li key={i} className="text-muted-foreground">
//                             {piece}
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <p className="text-sm text-muted-foreground italic">
//                         No pieces recorded this month
//                       </p>
//                     )}
//                   </div>

//                   {evaluation.notes && (
//                     <div>
//                       <h4 className="font-semibold mb-2">
//                         Teacher&apos;s Notes:
//                       </h4>
//                       <p className="text-muted-foreground italic">
//                         {evaluation.notes}
//                       </p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  Download,
} from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import jsPDF from "jspdf";

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

type EvaluationData = {
  evaluations: EvaluationWithTeacher[];
  status: "waiting" | "available" | "no_lessons";
  nextEvaluationDate: number | null;
  encouragementMessage: string | null;
  hasEvaluations: boolean;
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

function downloadEvaluationPDF(evaluation: EvaluationWithTeacher) {
  const pdf = new jsPDF();

  // Title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Music Rabbit - Student Evaluation", 105, 20, { align: "center" });

  // Date and Teacher
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  const monthYear = new Date(
    evaluation.year,
    evaluation.month,
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  pdf.text(`Month: ${monthYear}`, 20, 35);
  pdf.text(`Teacher: ${evaluation.teacher?.name || "Unknown"}`, 20, 42);
  pdf.text(
    `Date: ${new Date(evaluation.createdAt).toLocaleDateString()}`,
    20,
    49,
  );

  // Line separator
  pdf.setLineWidth(0.5);
  pdf.line(20, 55, 190, 55);

  // Evaluation Criteria
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Evaluation Criteria", 20, 65);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  let yPos = 75;

  const criteria = [
    { label: "Scales", value: evaluation.scales },
    { label: "Chords", value: evaluation.chords },
    { label: "Sight Reading", value: evaluation.sightReading },
    { label: "Rhythm", value: evaluation.rhythm },
    { label: "Improvisation", value: evaluation.improvisation },
  ];

  criteria.forEach((item) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(`${item.label}:`, 25, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(item.value, 70, yPos);
    yPos += 8;
  });

  // Pieces Worked On
  yPos += 5;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Pieces Worked On", 20, yPos);

  yPos += 10;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");

  if (evaluation.piecesWorkedOn.length > 0) {
    evaluation.piecesWorkedOn.forEach((piece) => {
      pdf.text(`• ${piece}`, 25, yPos);
      yPos += 7;
    });
  } else {
    pdf.text("No pieces recorded this month", 25, yPos);
    yPos += 7;
  }

  // Teacher's Notes
  if (evaluation.notes) {
    yPos += 5;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Teacher's Notes", 20, yPos);

    yPos += 10;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    // Split long text into lines
    const splitNotes = pdf.splitTextToSize(evaluation.notes, 170);
    pdf.text(splitNotes, 25, yPos);
  }

  // Save the PDF
  const filename = `Evaluation_${monthYear.replace(" ", "_")}_${evaluation.teacher?.name || "Teacher"}.pdf`;
  pdf.save(filename);
}

export default function StudentEvaluationsPage() {
  const { user } = useUser();

  // Use the existing get query which gets user by Clerk ID from auth
  const convexUser = useQuery(api.users.get);

  const data = useQuery(
    api.evaluations.getStudentEvaluations,
    convexUser?._id ? { studentId: convexUser._id } : "skip",
  ) as EvaluationData | undefined;

  // Show a nicer loading state while fetching
  if (!user || convexUser === undefined) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Evaluations</h1>
          <p className="text-muted-foreground mt-1">
            Monthly progress evaluations from your teachers
          </p>
        </div>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading user information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!convexUser) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Evaluations</h1>
          <p className="text-muted-foreground mt-1">
            Monthly progress evaluations from your teachers
          </p>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-100">
              Unable to Load Evaluations
            </h3>
            <p className="text-red-700 dark:text-red-300 max-w-md mx-auto">
              Your user account is not properly set up. Please contact support
              or try logging out and back in.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Evaluations</h1>
          <p className="text-muted-foreground mt-1">
            Monthly progress evaluations from your teachers
          </p>
        </div>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your evaluations...</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    evaluations,
    status,
    nextEvaluationDate,
    encouragementMessage,
    hasEvaluations,
  } = data;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Evaluations</h1>
        <p className="text-muted-foreground mt-1">
          Monthly progress evaluations from your teachers
        </p>
      </div>

      {/* Show encouragement message if status is waiting */}
      {status === "waiting" && encouragementMessage && (
        <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-900 dark:text-purple-100">
            <p className="font-medium mb-2">{encouragementMessage}</p>
            {nextEvaluationDate && (
              <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                <Calendar className="h-3 w-3" />
                <span>
                  Next evaluation expected:{" "}
                  {new Date(nextEvaluationDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!hasEvaluations ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-3">No Evaluations Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You need at least 1 month (4+ weeks) of lessons with the same
              teacher to start receiving monthly evaluations.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Keep attending your lessons consistently — your first evaluation
              will appear here automatically!
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {new Date(evaluation.createdAt).toLocaleDateString()}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadEvaluationPDF(evaluation)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </div>
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
