"use client";

import { useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Crown, Zap, Star } from "lucide-react";
import { PACKAGE_DEFINITIONS } from "@/lib/packages";
import { toast } from "sonner";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const PKG_STYLES = `
  /* Page */
  .pkg-page                     { background: #ffffff !important; }
  .dark .pkg-page               { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  /* Heading */
  .pkg-title                    { color: hsl(var(--foreground)) !important; }
  .pkg-subtitle                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .pkg-title              { color: #ddd6fe !important; }
  .dark .pkg-subtitle           { color: #c4b5fd !important; }

  /* Active package banner */
  .pkg-active-banner            { background: linear-gradient(to bottom right, #f0fdf4, #dcfce7) !important; border-color: #86efac !important; }
  .pkg-active-banner-title      { color: #166534 !important; }
  .pkg-active-banner-label      { color: #15803d !important; }
  .pkg-active-banner-value      { color: #14532d !important; }
  .dark .pkg-active-banner      { background: linear-gradient(to bottom right, #052e16, #064e3b) !important; border-color: #15803d !important; }
  .dark .pkg-active-banner-title { color: #bbf7d0 !important; }
  .dark .pkg-active-banner-label { color: #86efac !important; }
  .dark .pkg-active-banner-value { color: #dcfce7 !important; }

  /* Package cards — default */
  .pkg-card                     { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important; }
  .pkg-card-active              { background: linear-gradient(to bottom right, #f0fdf4, #dcfce7) !important; border-color: #22c55e !important; }
  .dark .pkg-card               { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-color: rgba(109,40,217,0.5) !important; box-shadow: 0 0 30px rgba(139,92,246,0.15) !important; }
  .dark .pkg-card-active        { background: linear-gradient(to bottom right, #052e16, #064e3b) !important; border-color: #15803d !important; }

  /* Package card text */
  .pkg-card-name                { color: hsl(var(--foreground)) !important; }
  .pkg-card-price               { color: hsl(var(--foreground)) !important; }
  .pkg-card-price-unit          { color: hsl(var(--muted-foreground)) !important; }
  .pkg-card-desc                { color: hsl(var(--muted-foreground)) !important; }
  .pkg-card-feature             { color: hsl(var(--foreground)) !important; }
  .dark .pkg-card-name          { color: #ede9fe !important; }
  .dark .pkg-card-price         { color: #ede9fe !important; }
  .dark .pkg-card-price-unit    { color: #c4b5fd !important; }
  .dark .pkg-card-desc          { color: #c4b5fd !important; }
  .dark .pkg-card-feature       { color: #ddd6fe !important; }

  /* Package icon circle */
  .pkg-icon-circle              { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .dark .pkg-icon-circle        { background: rgba(109,40,217,0.7) !important; color: #ede9fe !important; }

  /* CTA button */
  .pkg-btn                      { background: hsl(var(--primary)) !important; color: #ffffff !important; border: none !important; }
  .pkg-btn:hover                { background: hsl(var(--primary)/0.9) !important; }
  .pkg-btn-active               { background: #16a34a !important; color: #ffffff !important; }
  .dark .pkg-btn                { background: linear-gradient(to right, #7c3aed, #6d28d9) !important; color: #ede9fe !important; }
  .dark .pkg-btn:hover          { background: linear-gradient(to right, #6d28d9, #5b21b6) !important; }
  .dark .pkg-btn-active         { background: #15803d !important; color: #dcfce7 !important; }

  /* FAQ card */
  .pkg-faq-card                 { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .pkg-faq-title                { color: hsl(var(--foreground)) !important; }
  .pkg-faq-q                    { color: hsl(var(--foreground)) !important; }
  .pkg-faq-a                    { color: hsl(var(--muted-foreground)) !important; }
  .dark .pkg-faq-card           { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-color: rgba(109,40,217,0.5) !important; }
  .dark .pkg-faq-title          { color: #ddd6fe !important; }
  .dark .pkg-faq-q              { color: #ede9fe !important; }
  .dark .pkg-faq-a              { color: #c4b5fd !important; }
`;

export default function StudentPackagesPage() {
  const currentUser = useQuery(api.users.get);
  const activePackage = useQuery(
    api.studentPackages.getActivePackage,
    currentUser ? { studentId: currentUser._id } : "skip",
  );
  const stats = useQuery(
    api.studentPackages.getPackageStats,
    currentUser ? { studentId: currentUser._id } : "skip",
  );

  const [purchasing, setPurchasing] = useState<string | null>(null);
  const processingRef = useRef(false);

  const handlePurchase = async (pkg: (typeof PACKAGE_DEFINITIONS)[number]) => {
    if (!currentUser) {
      toast.error("Please log in first");
      return;
    }
    if (processingRef.current) return;
    if (purchasing) return;

    processingRef.current = true;
    setPurchasing(pkg.id);

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.name || currentUser.email.split("@")[0],
          email: currentUser.email,
          amount: pkg.monthlyPrice.toFixed(2),
          packageName: pkg.name,
          packageId: pkg.id,
          studentId: currentUser._id,
        }),
      });
      const data = await response.json();
      if (data.paymentUrl) {
        window.location.replace(data.paymentUrl);
      } else {
        toast.error(data.error || "Failed to create payment session");
        processingRef.current = false;
        setPurchasing(null);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      processingRef.current = false;
      setPurchasing(null);
    }
  };

  const getPackageIcon = (id: string) => {
    if (id.includes("30")) return <Crown className="h-8 w-8" />;
    if (id.includes("20")) return <Star className="h-8 w-8" />;
    return <Zap className="h-8 w-8" />;
  };

  if (!currentUser) {
    return (
      <div className="pkg-page flex min-h-screen items-center justify-center">
        <style>{PKG_STYLES}</style>
        <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-purple-400" />
      </div>
    );
  }

  return (
    <div className="pkg-page min-h-screen p-4 sm:p-6">
      <style>{PKG_STYLES}</style>
      <div className="container mx-auto max-w-7xl">
        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h1 className="pkg-title text-3xl sm:text-5xl font-bold mb-4 font-serif">
            Choose Your Learning Package
          </h1>
          <p className="pkg-subtitle text-base sm:text-xl">
            Select the perfect plan for your musical journey
          </p>
        </motion.div>

        {/* ── Active package banner ── */}
        {activePackage && stats?.hasActivePackage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 sm:mb-12"
          >
            <div className="pkg-active-banner rounded-xl border-2 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-6 border-b border-inherit">
                <h2 className="pkg-active-banner-title flex items-center gap-3 text-lg sm:text-xl font-bold">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  Current Active Package
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="pkg-active-banner-label text-sm">Package</p>
                    <p className="pkg-active-banner-value text-xl sm:text-2xl font-bold mt-1">
                      {activePackage.packageType}
                    </p>
                  </div>
                  <div>
                    <p className="pkg-active-banner-label text-sm">
                      Minutes Used
                    </p>
                    <p className="pkg-active-banner-value text-xl sm:text-2xl font-bold mt-1">
                      {stats.minutesUsed} / {stats.totalMinutes}
                    </p>
                  </div>
                  <div>
                    <p className="pkg-active-banner-label text-sm">
                      Lessons Remaining
                    </p>
                    <p className="pkg-active-banner-value text-xl sm:text-2xl font-bold mt-1">
                      {stats.lessonsRemaining}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Package cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {PACKAGE_DEFINITIONS.map((pkg, index) => {
            const isActive = activePackage?.packageType === pkg.id;
            const isPopular = pkg.id === "20-twice";
            const isProcessing = purchasing === pkg.id;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`relative overflow-hidden rounded-xl border-2 shadow-sm ${isActive ? "pkg-card-active" : "pkg-card"}`}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-1 text-xs sm:text-sm font-bold z-10">
                      MOST POPULAR
                    </div>
                  )}

                  {/* Header */}
                  <div className="p-5 sm:p-6 text-center space-y-3 sm:space-y-4 border-b border-inherit">
                    <div className="pkg-icon-circle mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center">
                      {getPackageIcon(pkg.id)}
                    </div>
                    <h3 className="pkg-card-name text-xl sm:text-2xl font-bold font-serif">
                      {pkg.name}
                    </h3>
                    <div>
                      <span className="pkg-card-price text-4xl sm:text-5xl font-bold">
                        R{pkg.monthlyPrice.toFixed(2)}
                      </span>
                      <span className="pkg-card-price-unit text-base sm:text-lg">
                        /month
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 sm:p-6 space-y-4 sm:space-y-6">
                    <p className="pkg-card-desc text-center text-sm">
                      {pkg.description}
                    </p>

                    <div className="space-y-2 sm:space-y-3">
                      {[
                        `${pkg.minutesPerLesson} min per lesson`,
                        `${pkg.lessonsPerWeek}x per week`,
                        `${pkg.totalMinutesPerMonth} min/month total`,
                        "Live Zoom lessons",
                        "Personal teacher",
                      ].map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                          <span className="pkg-card-feature text-sm sm:text-base">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={isActive || !!purchasing}
                      className={`w-full py-4 sm:py-5 text-base sm:text-lg rounded-lg font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${isActive ? "pkg-btn-active" : "pkg-btn"}`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </span>
                      ) : isActive ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="h-5 w-5" />
                          Current Package
                        </span>
                      ) : (
                        "Choose This Package"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── FAQ ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="pkg-faq-card rounded-xl border-2 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-inherit">
              <h2 className="pkg-faq-title text-lg sm:text-xl font-bold font-serif">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {[
                {
                  q: "Can I change my package?",
                  a: "Yes! You can upgrade or change your package at any time.",
                },
                {
                  q: "What happens if I miss a lesson?",
                  a: "Your minutes are deducted only for completed lessons.",
                },
                {
                  q: "Is payment secure?",
                  a: "Yes! All payments are processed securely through PayFast.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="pkg-faq-q font-semibold text-sm sm:text-base">
                    {q}
                  </p>
                  <p className="pkg-faq-a text-sm mt-1">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
