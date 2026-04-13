"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Music, Quote } from "lucide-react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const WELCOME_STYLES = `
  .wlc-page                   { background: #ffffff !important; }
  .dark .wlc-page             { background: linear-gradient(to bottom, hsl(270 90% 5%), #000000, #000000) !important; }

  .wlc-icon                   { color: hsl(var(--primary)) !important; }
  .dark .wlc-icon             { color: #a78bfa !important; }

  .wlc-title                  { color: hsl(var(--foreground)) !important; }
  .dark .wlc-title            { color: #ffffff !important; }

  .wlc-subtitle               { color: hsl(var(--muted-foreground)) !important; }
  .dark .wlc-subtitle         { color: #ddd6fe !important; }

  /* Quotes card */
  .wlc-quotes-card            { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 16px rgba(0,0,0,0.08) !important; }
  .dark .wlc-quotes-card      { background: rgba(46,16,101,0.4) !important; border-color: rgba(109,40,217,0.5) !important; box-shadow: 0 0 40px rgba(139,92,246,0.15) !important; }

  .wlc-quotes-title           { color: hsl(var(--foreground)) !important; }
  .dark .wlc-quotes-title     { color: #ede9fe !important; }

  .wlc-quote-icon             { color: hsl(var(--primary)) !important; }
  .dark .wlc-quote-icon       { color: #a78bfa !important; }

  /* Individual quote tiles */
  .wlc-quote-tile             { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .wlc-quote-tile       { background: rgba(0,0,0,0.4) !important; border-color: rgba(109,40,217,0.5) !important; }

  .wlc-quote-text             { color: hsl(var(--foreground)) !important; }
  .dark .wlc-quote-text       { color: #ede9fe !important; }

  .wlc-quote-author           { color: hsl(var(--primary)) !important; }
  .dark .wlc-quote-author     { color: #c4b5fd !important; }

  /* CTA */
  .wlc-cta-btn                { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .wlc-cta-btn:hover          { background: hsl(var(--primary)/0.9) !important; }
  .dark .wlc-cta-btn          { background: #7c3aed !important; }
  .dark .wlc-cta-btn:hover    { background: #6d28d9 !important; }

  .wlc-cta-sub                { color: hsl(var(--muted-foreground)) !important; }
  .dark .wlc-cta-sub          { color: #c4b5fd !important; }
`;

const studentQuotes = [
  {
    text: "I used to hate scales… now I actually look forward to them!",
    author: "Liam, 11 – Piano",
  },
  {
    text: "My teacher makes learning guitar feel like playing with a friend.",
    author: "Zara, 14 – Guitar",
  },
  {
    text: "I passed my first exam and cried happy tears. Thank you Music Rabbit!",
    author: "Amahle, 9 – Violin",
  },
  {
    text: "I never thought I could sing in front of people… now I do it every week.",
    author: "Thandi, 16 – Voice",
  },
];

export default function StudentWelcome() {
  const router = useRouter();

  return (
    <div className="wlc-page min-h-screen flex items-center justify-center p-4 sm:p-6">
      <style>{WELCOME_STYLES}</style>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        {/* ── Hero ── */}
        <div className="text-center mb-10 sm:mb-12">
          <Music className="wlc-icon h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6" />
          <h1 className="wlc-title text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 font-serif">
            Welcome to Music Rabbit! 🎶
          </h1>
          <p className="wlc-subtitle text-base sm:text-xl max-w-xl mx-auto">
            You&apos;re about to start your musical journey with amazing
            teachers.
          </p>
        </div>

        {/* ── Quotes card ── */}
        <div className="wlc-quotes-card rounded-2xl border-2 overflow-hidden mb-8 sm:mb-10">
          {/* Card header */}
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="wlc-quotes-title text-lg sm:text-2xl font-bold font-serif flex items-center justify-center gap-3">
              <Quote className="wlc-quote-icon h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              What other students are saying
            </h2>
          </div>

          {/* Quote grid */}
          <div className="p-4 sm:p-6 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {studentQuotes.map((quote, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className="wlc-quote-tile p-4 sm:p-6 rounded-xl border"
              >
                <p className="wlc-quote-text text-base sm:text-lg italic mb-3 sm:mb-4 leading-relaxed">
                  &quot;{quote.text}&quot;
                </p>
                <p className="wlc-quote-author text-right text-sm sm:text-base font-medium">
                  — {quote.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard/student")}
            className="wlc-cta-btn px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Go to My Dashboard →
          </button>
          <p className="wlc-cta-sub mt-4 text-sm sm:text-base">
            Find teachers, book lessons, track your progress
          </p>
        </div>
      </motion.div>
    </div>
  );
}
