"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Quote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

/**
 * Render the student welcome hub with a hero header, animated testimonials, and a CTA to the student dashboard.
 *
 * The component displays a decorative music icon and welcome text, a card with student quotes shown in a responsive,
 * animated grid, and a button that navigates the user to "/dashboard/student".
 *
 * @returns A JSX element representing the student welcome page UI.
 */
export default function StudentWelcome() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <Music className="h-16 w-16 mx-auto text-purple-400 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to Music Rabbit! 🎶
          </h1>
          <p className="text-xl text-purple-200">
            You&apos;re about to start your musical journey with amazing
            teachers.
          </p>
        </div>

        <Card className="bg-purple-950/40 border-purple-700/50 mb-10">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
              <Quote className="h-6 w-6 text-purple-400" />
              What other students are saying
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {studentQuotes.map((quote, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className="bg-black/40 p-6 rounded-xl border border-purple-800/50"
              >
                <p className="text-lg italic text-purple-100 mb-4">
                  &quot;{quote.text}&quot;
                </p>
                <p className="text-right text-purple-300">— {quote.author}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-7 text-xl"
            onClick={() => router.push("/dashboard/student")}
          >
            Go to My Dashboard →
          </Button>
          <p className="mt-4 text-purple-300">
            Find teachers, book lessons, track your progress
          </p>
        </div>
      </motion.div>
    </div>
  );
}