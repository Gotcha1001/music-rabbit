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
        className="text-center py-20"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FileText className="h-20 w-20 mx-auto mb-6 text-purple-400" />
        </motion.div>
        <p className="text-3xl text-purple-300 font-serif">
          Loading ancient tome...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12 min-h-screen bg-gradient-to-b from-black via-purple-950 to-black py-12">
      {/* Title & Info */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center relative"
      >
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-purple-600/10 blur-3xl"
        />

        <motion.h3
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 flex items-center justify-center gap-4 font-serif relative z-10"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Music className="h-14 w-14 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          </motion.div>
          {book.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl text-purple-300 mt-6 font-medium font-serif"
        >
          {book.instrument} • Level {book.level}
        </motion.p>

        {/* Decorative lines */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center justify-center gap-4 mt-6"
        >
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          <div className="h-1.5 w-1.5 bg-purple-500 rounded-full" />
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Book Cover + Open Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="max-w-4xl mx-auto px-4"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-purple-950 to-black rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden border-4 border-purple-800/30 relative"
        >
          {/* Gothic corner decorations */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-purple-700/40 pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-purple-700/40 pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-purple-700/40 pointer-events-none z-10" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-purple-700/40 pointer-events-none z-10" />

          {/* Fake Book Cover */}
          <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-black h-96 flex items-center justify-center relative overflow-hidden">
            {/* Animated background pattern */}
            <motion.div
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center text-purple-100 relative z-10"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FileText className="h-32 w-32 mx-auto mb-8 opacity-90 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
              </motion.div>
              <p className="text-5xl font-bold tracking-wider font-serif drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                {book.title}
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-3xl mt-6 opacity-90 font-serif"
              >
                Level {book.level}
              </motion.p>

              {/* Decorative flourish */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-6 flex items-center justify-center gap-3"
              >
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-purple-400" />
                <div className="h-2 w-2 bg-purple-400 rounded-full" />
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-purple-400" />
              </motion.div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="p-10 bg-gradient-to-br from-black via-purple-950/50 to-black border-t border-purple-800/30">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="text-xl px-14 py-8 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-500 hover:to-purple-600 text-purple-50 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-300 border border-purple-500/30 font-serif"
                  asChild
                >
                  <a
                    href={book.driveViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-3 h-7 w-7" />
                    Open Book Now
                  </a>
                </Button>
              </motion.div>

              {book.driveDownloadLink && (
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-xl px-14 py-8 border-2 border-purple-600/50 text-purple-300 hover:bg-purple-900/30 hover:text-purple-100 hover:border-purple-500 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] font-serif"
                    asChild
                  >
                    <a
                      href={book.driveDownloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-3 h-7 w-7" />
                      Download PDF
                    </a>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="text-center text-xl text-purple-400/80 italic font-serif"
      >
        Practice makes progress — the path to mastery awaits...
      </motion.p>
    </div>
  );
}
