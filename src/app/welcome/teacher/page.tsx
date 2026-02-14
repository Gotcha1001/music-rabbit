"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Calendar, Users, Sparkles, Video } from "lucide-react";
import { motion } from "framer-motion";

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
    content: (
      <div className="space-y-3">
        <ol className="list-decimal pl-5 space-y-2 text-indigo-200">
          <li>
            Open OBS Studio (free download:{" "}
            <a
              href="https://obsproject.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
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
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              iriun.com
            </a>
            ). Connect them.
          </li>
          <li>
            In OBS, add your main webcam and phone as sources for a dual-view
            setup.
          </li>
          <li>
            In Zoom, select &quot;OBS Virtual Camera&quot; as your video source.
          </li>
        </ol>
        <p className="text-indigo-300 font-medium mt-4">
          ✨ This shows both your face and hands/instrument clearly!
        </p>
      </div>
    ),
  },
];

export default function TeacherWelcome() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-black to-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <Sparkles className="h-16 w-16 mx-auto text-indigo-400 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, Teacher!
          </h1>
          <p className="text-xl text-indigo-200">
            You&apos;re making a real difference — one lesson at a time.
          </p>
        </div>

        <Card className="bg-indigo-950/40 border-indigo-700/50 mb-10">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              Teaching Tips & Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {weeklyTips.map((tip, i) => {
              const Icon = tip.icon || null;
              return (
                <div
                  key={i}
                  className="bg-black/40 p-6 rounded-xl border border-indigo-800/50"
                >
                  <h3 className="text-xl font-semibold text-indigo-100 mb-3 flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-indigo-400" />}
                    {tip.title}
                  </h3>
                  {typeof tip.content === "string" ? (
                    <p className="text-indigo-200">{tip.content}</p>
                  ) : (
                    tip.content
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-7 text-xl"
            onClick={() => router.push("/dashboard/teacher")}
          >
            Go to My Schedule →
          </Button>
          <p className="mt-4 text-indigo-300">
            View upcoming lessons, availability, earnings & messages
          </p>
        </div>
      </motion.div>
    </div>
  );
}
