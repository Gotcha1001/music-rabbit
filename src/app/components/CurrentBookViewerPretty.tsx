"use client";

import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Music, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function CurrentBookViewerPretty({ bookId }: { bookId: Id<"books"> }) {
  const book = useQuery(api.books.getById, { id: bookId });

  if (!book) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 sm:py-20"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <FileText className="h-14 w-14 sm:h-20 sm:w-20 mx-auto mb-4 sm:mb-6 text-primary dark:text-purple-400" />
        </motion.div>
        <p className="text-xl sm:text-3xl text-muted-foreground dark:text-purple-300 font-serif">
          Loading your book...
        </p>
      </motion.div>
    );
  }

  return (
    /* Outer wrapper: white in light mode, dark purple gradient in dark mode */
    <div className="space-y-8 sm:space-y-12 bg-white dark:bg-gradient-to-b dark:from-black dark:via-purple-950 dark:to-black py-8 sm:py-12">
      {/* ── Title & Info ── */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center relative px-4"
      >
        {/* Book title — dark in light mode, gradient in dark mode */}
        <motion.h3
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif relative z-10 leading-tight
            text-white
            dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-purple-200 dark:via-purple-400 dark:to-purple-200
            flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0"
          >
            <Music className="h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-primary dark:text-purple-400 dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          </motion.div>
          <span className="break-words">{book.title}</span>
        </motion.h3>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-base sm:text-xl lg:text-2xl text-purple-300 mt-3 sm:mt-6 font-medium font-serif"
        >
          {book.instrument} • Level {book.levelNumber || "N/A"}
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6"
        >
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
          <div className="h-1.5 w-1.5 bg-purple-400 rounded-full" />
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
        </motion.div>
      </motion.div>

      {/* ── Book Cover Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="max-w-2xl lg:max-w-4xl mx-auto px-4"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          /* Card shell: bordered in light, glowing in dark */
          className="rounded-2xl sm:rounded-3xl overflow-hidden relative
            border-2 sm:border-4 border-primary/25 dark:border-purple-800/30
            shadow-[0_4px_24px_rgba(109,40,217,0.18)] dark:shadow-[0_0_50px_rgba(168,85,247,0.3)]"
        >
          {/* Corner decorations — visible in both modes */}
          <div className="absolute top-0 left-0 w-14 h-14 sm:w-24 sm:h-24 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-primary/40 dark:border-purple-700/50 pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-14 h-14 sm:w-24 sm:h-24 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-primary/40 dark:border-purple-700/50 pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-14 h-14 sm:w-24 sm:h-24 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-primary/40 dark:border-purple-700/50 pointer-events-none z-10" />
          <div className="absolute bottom-0 right-0 w-14 h-14 sm:w-24 sm:h-24 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-primary/40 dark:border-purple-700/50 pointer-events-none z-10" />

          {/* ── Cover illustration ──
              Always dark purple — this is intentional cover art, like a physical book spine.
              Text inside is always white since the bg is always dark. */}
          <div className="h-56 sm:h-72 lg:h-96 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-black">
            {/* Ambient radial glow */}
            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/25 via-transparent to-transparent"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center relative z-10 px-6"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FileText className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 mx-auto mb-4 sm:mb-8 text-purple-200 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
              </motion.div>

              <p className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wide font-serif text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] break-words leading-tight">
                {book.title}
              </p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-lg sm:text-2xl lg:text-3xl mt-3 sm:mt-6 text-purple-200 font-serif"
              >
                Level {book.levelNumber || "N/A"}
              </motion.p>

              {/* Flourish */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3"
              >
                <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-purple-400" />
                <div className="h-2 w-2 bg-purple-400 rounded-full" />
                <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-purple-400" />
              </motion.div>
            </motion.div>
          </div>

          {/* ── Action buttons footer ──
              White in light mode, dark in dark mode */}
          <div
            className="p-5 sm:p-8 lg:p-10
            bg-white border-t border-primary/15
            dark:bg-gradient-to-br dark:from-black dark:via-purple-950/50 dark:to-black dark:border-t dark:border-purple-800/30"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center"
            >
              {/* Open button */}
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-xl px-8 sm:px-14 py-5 sm:py-8 font-serif
                    bg-primary hover:bg-primary/90 text-primary-foreground
                    border border-primary/30
                    shadow-[0_4px_16px_rgba(109,40,217,0.3)] hover:shadow-[0_6px_24px_rgba(109,40,217,0.45)]
                    dark:bg-gradient-to-r dark:from-purple-700 dark:via-purple-600 dark:to-purple-700
                    dark:hover:from-purple-600 dark:hover:via-purple-500 dark:hover:to-purple-600
                    dark:text-purple-50 dark:border-purple-500/30
                    dark:shadow-[0_0_30px_rgba(168,85,247,0.4)] dark:hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]
                    transition-all duration-300"
                  asChild
                >
                  <a
                    href={book.driveViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 sm:mr-3 h-5 w-5 sm:h-7 sm:w-7 shrink-0" />
                    Open Book Now
                  </a>
                </Button>
              </motion.div>

              {/* Download button */}
              {book.driveDownloadLink && (
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-base sm:text-xl px-8 sm:px-14 py-5 sm:py-8 font-serif
                      border-2 border-primary/40 text-primary
                      hover:bg-primary/8 hover:border-primary/70 hover:text-primary
                      dark:border-purple-600/50 dark:text-purple-300
                      dark:hover:bg-purple-900/30 dark:hover:text-purple-100 dark:hover:border-purple-500
                      dark:shadow-[0_0_20px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]
                      transition-all duration-300"
                    asChild
                  >
                    <a
                      href={book.driveDownloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 sm:mr-3 h-5 w-5 sm:h-7 sm:w-7 shrink-0" />
                      Download PDF
                    </a>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="text-center text-sm sm:text-xl text-muted-foreground dark:text-purple-400/80 italic font-serif px-4"
      >
        Practice makes progress — the path to mastery awaits...
      </motion.p>
    </div>
  );
}
