"use client";

import { useRouter } from "next/navigation";
import { Lightbulb, Sparkles, Video } from "lucide-react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const TWC_STYLES = `
  .twc-page                     { background: #ffffff !important; }
  .dark .twc-page               { background: linear-gradient(to bottom, #1e1b4b, #000000, #000000) !important; }

  .twc-icon                     { color: hsl(var(--primary)) !important; }
  .dark .twc-icon               { color: #818cf8 !important; }

  .twc-title                    { color: hsl(var(--foreground)) !important; }
  .dark .twc-title              { color: #ffffff !important; }

  .twc-subtitle                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .twc-subtitle           { color: #c7d2fe !important; }

  /* Tips card */
  .twc-card                     { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 16px rgba(0,0,0,0.08) !important; }
  .dark .twc-card               { background: rgba(49,46,129,0.4) !important; border-color: rgba(99,102,241,0.5) !important; }

  .twc-card-title               { color: hsl(var(--foreground)) !important; }
  .dark .twc-card-title         { color: #e0e7ff !important; }

  /* Individual tip tiles */
  .twc-tip                      { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .twc-tip                { background: rgba(0,0,0,0.4) !important; border-color: rgba(99,102,241,0.5) !important; }

  .twc-tip-title                { color: hsl(var(--foreground)) !important; }
  .dark .twc-tip-title          { color: #e0e7ff !important; }

  .twc-tip-icon                 { color: hsl(var(--primary)) !important; }
  .dark .twc-tip-icon           { color: #818cf8 !important; }

  .twc-tip-text                 { color: hsl(var(--foreground)) !important; }
  .dark .twc-tip-text           { color: #c7d2fe !important; }

  /* OBS list items */
  .twc-tip-list                 { color: hsl(var(--foreground)) !important; }
  .dark .twc-tip-list           { color: #c7d2fe !important; }

  .twc-tip-link                 { color: hsl(var(--primary)) !important; }
  .twc-tip-link:hover           { color: hsl(var(--primary)/0.8) !important; }
  .dark .twc-tip-link           { color: #818cf8 !important; }
  .dark .twc-tip-link:hover     { color: #a5b4fc !important; }

  .twc-tip-highlight            { color: hsl(var(--primary)) !important; }
  .dark .twc-tip-highlight      { color: #a5b4fc !important; }

  /* CTA */
  .twc-cta-btn                  { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .twc-cta-btn:hover            { background: hsl(var(--primary)/0.9) !important; }
  .dark .twc-cta-btn            { background: #4f46e5 !important; }
  .dark .twc-cta-btn:hover      { background: #4338ca !important; }

  .twc-cta-sub                  { color: hsl(var(--muted-foreground)) !important; }
  .dark .twc-cta-sub            { color: #a5b4fc !important; }
`;

const weeklyTips = [
  {
    title: "Start with clear goals",
    content:
      "At the beginning of each term, ask your student: 'What song do you dream of playing?' Write it down — it keeps motivation high.",
  },
  {
    title: "Use the 3:1 praise-to-correction ratio",
    content:
      "For every correction, give at least 3 specific praises. Students stay confident and engaged longer.",
  },
  {
    title: "Record short 15-second wins",
    content:
      "After a breakthrough, ask permission to record a quick clip. Send it via message — huge morale boost!",
  },
  {
    title: "Pro Tip: Use Dual Cameras for Better Lessons",
    icon: Video,
    richContent: true,
  },
];

export default function TeacherWelcome() {
  const router = useRouter();

  return (
    <div className="twc-page min-h-screen flex items-center justify-center p-4 sm:p-6">
      <style>{TWC_STYLES}</style>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        {/* ── Hero ── */}
        <div className="text-center mb-10 sm:mb-12">
          <Sparkles className="twc-icon h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6" />
          <h1 className="twc-title text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 font-serif">
            Welcome back, Teacher!
          </h1>
          <p className="twc-subtitle text-base sm:text-xl max-w-xl mx-auto">
            You&apos;re making a real difference — one lesson at a time.
          </p>
        </div>

        {/* ── Tips card ── */}
        <div className="twc-card rounded-2xl border-2 overflow-hidden mb-8 sm:mb-10">
          {/* Card header */}
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="twc-card-title text-lg sm:text-2xl font-bold flex items-center justify-center gap-3 font-serif">
              <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 shrink-0" />
              Teaching Tips &amp; Setup Guide
            </h2>
          </div>

          {/* Tips grid */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {weeklyTips.map((tip, i) => {
              const Icon = tip.icon || null;
              return (
                <div key={i} className="twc-tip p-4 sm:p-6 rounded-xl border">
                  <h3 className="twc-tip-title text-base sm:text-xl font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                    {Icon && (
                      <Icon className="twc-tip-icon h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    )}
                    {tip.title}
                  </h3>

                  {tip.richContent ? (
                    /* OBS dual camera guide */
                    <div className="space-y-3">
                      <ol className="twc-tip-list list-decimal pl-5 space-y-2 text-sm sm:text-base">
                        <li>
                          Open OBS Studio (free download:{" "}
                          <a
                            href="https://obsproject.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="twc-tip-link underline"
                          >
                            obsproject.com
                          </a>
                          )
                        </li>
                        <li>
                          Install Iriun Webcam app on your phone and PC (
                          <a
                            href="https://iriun.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="twc-tip-link underline"
                          >
                            iriun.com
                          </a>
                          ). Connect them.
                        </li>
                        <li>
                          In OBS, add your main webcam and phone as sources for
                          a dual-view setup.
                        </li>
                        <li>
                          In Zoom, select &quot;OBS Virtual Camera&quot; as your
                          video source.
                        </li>
                      </ol>
                      <p className="twc-tip-highlight font-medium mt-3 sm:mt-4 text-sm sm:text-base">
                        ✨ This shows both your face and hands/instrument
                        clearly!
                      </p>
                    </div>
                  ) : (
                    <p className="twc-tip-text text-sm sm:text-base">
                      {tip.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard/teacher")}
            className="twc-cta-btn px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Go to My Schedule →
          </button>
          <p className="twc-cta-sub mt-4 text-sm sm:text-base">
            View upcoming lessons, availability, earnings &amp; messages
          </p>
        </div>
      </motion.div>
    </div>
  );
}
