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

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const EVAL_STYLES = `
  .eval-page                      { background: #ffffff !important; }
  .dark .eval-page                { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .eval-title                     { color: hsl(var(--foreground)) !important; }
  .eval-subtitle                  { color: hsl(var(--muted-foreground)) !important; }
  .dark .eval-title               { color: #ede9fe !important; }
  .dark .eval-subtitle            { color: #c4b5fd !important; }

  /* Spinner */
  .eval-spinner                   { border-bottom-color: hsl(var(--primary)) !important; }
  .dark .eval-spinner             { border-bottom-color: #a78bfa !important; }

  /* Encouragement alert */
  .eval-alert                     { background: hsl(var(--primary)/0.05) !important; border-color: hsl(var(--primary)/0.25) !important; }
  .eval-alert-text                { color: hsl(var(--primary)) !important; }
  .eval-alert-sub                 { color: hsl(var(--primary)/0.8) !important; }
  .dark .eval-alert               { background: rgba(76,29,149,0.15) !important; border-color: rgba(124,58,237,0.35) !important; }
  .dark .eval-alert-text          { color: #ede9fe !important; }
  .dark .eval-alert-sub           { color: #c4b5fd !important; }

  /* Evaluation cards */
  .eval-card                      { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important; }
  .dark .eval-card                { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 24px rgba(139,92,246,0.1) !important; }

  .eval-card-title                { color: hsl(var(--foreground)) !important; }
  .eval-card-sub                  { color: hsl(var(--muted-foreground)) !important; }
  .dark .eval-card-title          { color: #ede9fe !important; }
  .dark .eval-card-sub            { color: #c4b5fd !important; }

  /* Criteria rows */
  .eval-criteria-row              { background: hsl(var(--muted)) !important; }
  .dark .eval-criteria-row        { background: rgba(76,29,149,0.2) !important; }
  .eval-criteria-label            { color: hsl(var(--foreground)) !important; }
  .dark .eval-criteria-label      { color: #ddd6fe !important; }

  /* Section headings inside card */
  .eval-section-title             { color: hsl(var(--foreground)) !important; }
  .dark .eval-section-title       { color: #ede9fe !important; }

  /* Pieces + notes text */
  .eval-body-text                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .eval-body-text           { color: #c4b5fd !important; }

  /* Download button */
  .eval-dl-btn                    { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; background: transparent !important; }
  .eval-dl-btn:hover              { background: hsl(var(--primary)/0.08) !important; }
  .dark .eval-dl-btn              { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; }
  .dark .eval-dl-btn:hover        { background: rgba(76,29,149,0.3) !important; }

  /* Empty state card */
  .eval-empty-card                { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .eval-empty-card          { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .eval-empty-title               { color: hsl(var(--foreground)) !important; }
  .dark .eval-empty-title         { color: #ede9fe !important; }
`;

/* ── Types ─────────────────────────────────────────────────── */
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

/* ── Helpers ───────────────────────────────────────────────── */
function getTrendIcon(current: string, previous: string | undefined) {
  if (!previous) return <Minus className="h-4 w-4 text-muted-foreground" />;
  const cur = SCALE_VALUES[current as EvaluationScale] ?? 0;
  const prev = SCALE_VALUES[previous as EvaluationScale] ?? 0;
  if (cur > prev) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
  if (cur < prev) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function downloadEvaluationPDF(evaluation: EvaluationWithTeacher) {
  const pdf = new jsPDF();
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Music Rabbit - Student Evaluation", 105, 20, { align: "center" });
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  const monthYear = new Date(
    evaluation.year,
    evaluation.month,
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  pdf.text(`Month: ${monthYear}`, 20, 35);
  pdf.text(`Teacher: ${evaluation.teacher?.name || "Unknown"}`, 20, 42);
  pdf.text(
    `Date: ${new Date(evaluation.createdAt).toLocaleDateString()}`,
    20,
    49,
  );
  pdf.setLineWidth(0.5);
  pdf.line(20, 55, 190, 55);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Evaluation Criteria", 20, 65);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  let yPos = 75;
  [
    { label: "Scales", value: evaluation.scales },
    { label: "Chords", value: evaluation.chords },
    { label: "Sight Reading", value: evaluation.sightReading },
    { label: "Rhythm", value: evaluation.rhythm },
    { label: "Improvisation", value: evaluation.improvisation },
  ].forEach((item) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(`${item.label}:`, 25, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(item.value, 70, yPos);
    yPos += 8;
  });
  yPos += 5;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Pieces Worked On", 20, yPos);
  yPos += 10;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  if (evaluation.piecesWorkedOn.length > 0) {
    evaluation.piecesWorkedOn.forEach((p) => {
      pdf.text(`• ${p}`, 25, yPos);
      yPos += 7;
    });
  } else {
    pdf.text("No pieces recorded this month", 25, yPos);
    yPos += 7;
  }
  if (evaluation.notes) {
    yPos += 5;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Teacher's Notes", 20, yPos);
    yPos += 10;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdf.splitTextToSize(evaluation.notes, 170), 25, yPos);
  }
  pdf.save(
    `Evaluation_${monthYear.replace(" ", "_")}_${evaluation.teacher?.name || "Teacher"}.pdf`,
  );
}

/* ── Spinner helper ────────────────────────────────────────── */
function Spinner({ label }: { label: string }) {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <div className="eval-spinner animate-spin rounded-full h-10 w-10 border-b-2 border-transparent mx-auto mb-4" />
        <p className="eval-subtitle text-sm">{label}</p>
      </div>
    </div>
  );
}

/* ── Page header ───────────────────────────────────────────── */
function PageHeader() {
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="eval-title text-2xl sm:text-3xl font-bold font-serif">
        My Evaluations
      </h1>
      <p className="eval-subtitle mt-1 text-sm sm:text-base">
        Monthly progress evaluations from your teachers
      </p>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function StudentEvaluationsPage() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.get);
  const data = useQuery(
    api.evaluations.getStudentEvaluations,
    convexUser?._id ? { studentId: convexUser._id } : "skip",
  ) as EvaluationData | undefined;

  if (!user || convexUser === undefined) {
    return (
      <div className="eval-page min-h-screen p-4 sm:p-6">
        <style>{EVAL_STYLES}</style>
        <PageHeader />
        <Spinner label="Loading user information..." />
      </div>
    );
  }

  if (!convexUser) {
    return (
      <div className="eval-page min-h-screen p-4 sm:p-6">
        <style>{EVAL_STYLES}</style>
        <PageHeader />
        <div className="eval-empty-card rounded-xl border-2 p-8 sm:p-12 text-center shadow-sm">
          <ClipboardList className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-red-500 mb-4" />
          <h3 className="eval-empty-title text-base sm:text-lg font-semibold mb-3">
            Unable to Load Evaluations
          </h3>
          <p className="eval-body-text text-sm sm:text-base max-w-md mx-auto">
            Your user account is not properly set up. Please contact support or
            try logging out and back in.
          </p>
        </div>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="eval-page min-h-screen p-4 sm:p-6">
        <style>{EVAL_STYLES}</style>
        <PageHeader />
        <Spinner label="Loading your evaluations..." />
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
    <div className="eval-page min-h-screen p-4 sm:p-6 space-y-4 sm:space-y-6">
      <style>{EVAL_STYLES}</style>

      <PageHeader />

      {/* Encouragement alert */}
      {status === "waiting" && encouragementMessage && (
        <div className="eval-alert rounded-xl border p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 mt-0.5 eval-alert-text shrink-0" />
            <div>
              <p className="eval-alert-text font-medium text-sm sm:text-base mb-2">
                {encouragementMessage}
              </p>
              {nextEvaluationDate && (
                <div className="eval-alert-sub flex items-center gap-2 text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 shrink-0" />
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
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasEvaluations ? (
        <div className="eval-empty-card rounded-xl border-2 border-dashed p-8 sm:p-12 text-center shadow-sm">
          <ClipboardList className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="eval-empty-title text-base sm:text-lg font-semibold mb-3">
            No Evaluations Yet
          </h3>
          <p className="eval-body-text text-sm sm:text-base max-w-md mx-auto">
            You need at least 1 month (4+ weeks) of lessons with the same
            teacher to start receiving monthly evaluations.
          </p>
          <p className="eval-subtitle text-xs sm:text-sm mt-4">
            Keep attending your lessons consistently — your first evaluation
            will appear here automatically!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
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
              <div
                key={evaluation._id}
                className="eval-card rounded-xl border-2 overflow-hidden"
              >
                {/* Card header */}
                <div className="p-4 sm:p-6 border-b border-inherit">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="eval-card-title text-lg sm:text-xl font-bold font-serif">
                        {monthYear}
                      </h2>
                      <p className="eval-card-sub text-xs sm:text-sm mt-1">
                        Teacher: {evaluation.teacher?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {new Date(evaluation.createdAt).toLocaleDateString()}
                      </Badge>
                      <button
                        onClick={() => downloadEvaluationPDF(evaluation)}
                        className="eval-dl-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-200"
                      >
                        <Download className="h-3.5 w-3.5 shrink-0" />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  {/* Criteria grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
                        className="eval-criteria-row flex items-center justify-between p-2.5 sm:p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="eval-criteria-label font-medium text-xs sm:text-sm">
                            {item.label}:
                          </span>
                          <Badge
                            className={`text-xs ${SCALE_COLORS[item.value as EvaluationScale]}`}
                          >
                            {item.value}
                          </Badge>
                        </div>
                        {getTrendIcon(item.value, item.previous)}
                      </div>
                    ))}
                  </div>

                  {/* Pieces */}
                  <div>
                    <h4 className="eval-section-title font-semibold text-sm sm:text-base mb-2">
                      Pieces Worked On:
                    </h4>
                    {evaluation.piecesWorkedOn.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {evaluation.piecesWorkedOn.map((piece, i) => (
                          <li key={i} className="eval-body-text text-sm">
                            {piece}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="eval-body-text text-xs sm:text-sm italic">
                        No pieces recorded this month
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  {evaluation.notes && (
                    <div>
                      <h4 className="eval-section-title font-semibold text-sm sm:text-base mb-2">
                        Teacher&apos;s Notes:
                      </h4>
                      <p className="eval-body-text text-sm italic">
                        {evaluation.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
