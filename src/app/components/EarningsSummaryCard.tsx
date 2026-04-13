import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DollarSign, Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const ESC_STYLES = `
  /* Loading card */
  .esc-loading                  { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: none !important; }
  .dark .esc-loading            { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 40px rgba(168,85,247,0.2) !important; }

  /* Today card */
  .esc-today                    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .esc-today:hover              { box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important; }
  .dark .esc-today              { background: linear-gradient(to bottom right, rgba(88,28,135,0.6), rgba(30,27,75,0.6)) !important; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 0 30px rgba(168,85,247,0.25) !important; }
  .dark .esc-today:hover        { box-shadow: 0 0 40px rgba(168,85,247,0.35) !important; }

  /* Month card */
  .esc-month                    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .esc-month:hover              { box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important; }
  .dark .esc-month              { background: linear-gradient(to bottom right, rgba(59,7,100,0.8), rgba(46,16,101,0.6)) !important; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 0 30px rgba(168,85,247,0.25) !important; }
  .dark .esc-month:hover        { box-shadow: 0 0 40px rgba(168,85,247,0.35) !important; }

  /* Card titles */
  .esc-card-title               { color: hsl(var(--foreground)) !important; }
  .dark .esc-card-title         { color: #ede9fe !important; }

  /* Dollar icon */
  .esc-dollar-icon              { color: hsl(var(--primary)) !important; }
  .dark .esc-dollar-icon        { color: #c4b5fd !important; }

  /* Big earnings number — gradient in dark, solid foreground in light */
  .esc-amount                   { color: hsl(var(--foreground)) !important; background: none !important; -webkit-text-fill-color: hsl(var(--foreground)) !important; }
  .dark .esc-amount             { color: transparent !important; -webkit-text-fill-color: transparent !important; background: linear-gradient(to right, #e9d5ff, #c4b5fd, #e9d5ff) !important; -webkit-background-clip: text !important; background-clip: text !important; }

  /* Sub text */
  .esc-sub                      { color: hsl(var(--muted-foreground)) !important; }
  .dark .esc-sub                { color: rgba(196,181,253,0.8) !important; }

  /* Deduction text */
  .esc-deduction                { color: #dc2626 !important; }
  .dark .esc-deduction          { color: #f87171 !important; }

  /* Loader spinner */
  .esc-spinner                  { color: hsl(var(--primary)) !important; }
  .dark .esc-spinner            { color: #a78bfa !important; }
`;

export function EarningsSummaryCard({ teacherId }: { teacherId: Id<"users"> }) {
  const summary = useQuery(api.payments.getEarningsSummary, { teacherId });

  if (!summary) {
    return (
      <div className="esc-loading rounded-xl border-2 p-6 sm:p-8 text-center shadow-sm">
        <style>{ESC_STYLES}</style>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <Loader2 className="esc-spinner h-7 w-7 sm:h-8 sm:w-8 mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <style>{ESC_STYLES}</style>

      {/* ── Today's Earnings ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="esc-today rounded-xl border-2 overflow-hidden transition-shadow">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="esc-card-title text-xl sm:text-2xl font-bold font-serif flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="shrink-0"
              >
                <DollarSign className="esc-dollar-icon h-6 w-6 sm:h-8 sm:w-8" />
              </motion.div>
              Today&apos;s Earnings
            </h2>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6">
            <motion.p
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="esc-amount text-4xl sm:text-5xl font-bold font-serif"
            >
              ${summary.today.earnings.toFixed(2)}
            </motion.p>
            <p className="esc-sub mt-2 font-serif text-sm sm:text-base">
              {summary.today.hours} hours taught today
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── This Month ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="esc-month rounded-xl border-2 overflow-hidden transition-shadow">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="esc-card-title text-xl sm:text-2xl font-bold font-serif">
              This Month So Far
            </h2>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-0">
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="esc-amount text-3xl sm:text-4xl font-bold font-serif"
              >
                ${summary.month.earnings.toFixed(2)}
              </motion.p>
              {summary.month.deductions > 0 && (
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="esc-deduction text-base sm:text-lg font-serif font-semibold"
                >
                  −${summary.month.deductions} deductions
                </motion.p>
              )}
            </div>
            <p className="esc-sub font-serif text-sm sm:text-base">
              {summary.month.hours} hours
              {summary.month.deductions > 0 &&
                ` · ${summary.month.deductions / 5} penalties`}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
