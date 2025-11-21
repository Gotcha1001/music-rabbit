// import { useQuery } from "convex/react";
// import { api } from "../../../convex/_generated/api";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DollarSign, Loader2 } from "lucide-react";
// import { Id } from "../../../convex/_generated/dataModel";

// export function EarningsSummaryCard({ teacherId }: { teacherId: Id<"users"> }) {
//   const summary = useQuery(api.payments.getEarningsSummary, { teacherId });

//   if (!summary) {
//     return (
//       <Card>
//         <CardContent className="pt-6">
//           <Loader2 className="h-8 w-8 animate-spin mx-auto" />
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Today's Earnings */}
//       <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
//         <CardHeader>
//           <CardTitle className="text-2xl flex items-center gap-2">
//             <DollarSign className="h-8 w-8 text-blue-600" />
//             Today&apos;s Earnings
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-5xl font-bold text-blue-600">
//             ${summary.today.earnings.toFixed(2)}
//           </p>
//           <p className="text-muted-foreground mt-2">
//             {summary.today.hours} hours taught today
//           </p>
//         </CardContent>
//       </Card>

//       {/* This Month */}
//       <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
//         <CardHeader>
//           <CardTitle className="text-2xl">This Month So Far</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex justify-between items-baseline">
//             <p className="text-4xl font-bold text-green-600">
//               ${summary.month.earnings.toFixed(2)}
//             </p>
//             {summary.month.deductions > 0 && (
//               <p className="text-red-600 text-lg">
//                 −${summary.month.deductions} deductions
//               </p>
//             )}
//           </div>
//           <p className="text-muted-foreground">
//             {summary.month.hours} hours ·{" "}
//             {summary.month.deductions > 0 &&
//               `${summary.month.deductions / 5} penalties`}
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { motion } from "framer-motion";

export function EarningsSummaryCard({ teacherId }: { teacherId: Id<"users"> }) {
  const summary = useQuery(api.payments.getEarningsSummary, { teacherId });

  if (!summary) {
    return (
      <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        <CardContent className="pt-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 mx-auto text-purple-400" />
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Earnings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/60 to-indigo-950/60 border-2 border-purple-700/40 shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_40px_rgba(168,85,247,0.35)] transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3 text-purple-100 font-serif">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <DollarSign className="h-8 w-8 text-purple-300" />
              </motion.div>
              Today&apos;s Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 font-serif"
            >
              ${summary.today.earnings.toFixed(2)}
            </motion.p>
            <p className="text-purple-300/80 mt-2 font-serif">
              {summary.today.hours} hours taught today
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* This Month */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-purple-950/80 to-violet-950/60 border-2 border-purple-700/40 shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_40px_rgba(168,85,247,0.35)] transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-100 font-serif">
              This Month So Far
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-baseline">
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 font-serif"
              >
                ${summary.month.earnings.toFixed(2)}
              </motion.p>
              {summary.month.deductions > 0 && (
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-red-400 text-lg font-serif"
                >
                  −${summary.month.deductions} deductions
                </motion.p>
              )}
            </div>
            <p className="text-purple-300/80 font-serif">
              {summary.month.hours} hours
              {summary.month.deductions > 0 &&
                ` · ${summary.month.deductions / 5} penalties`}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
