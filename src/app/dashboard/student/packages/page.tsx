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
  const processingRef = useRef(false); // ✅ Prevent double-clicks

  const handlePurchase = async (pkg: (typeof PACKAGE_DEFINITIONS)[number]) => {
    if (!currentUser) {
      toast.error("Please log in first");
      return;
    }

    // ✅ CRITICAL FIX: Prevent double-click with ref
    if (processingRef.current) {
      console.log("❌ Already processing payment, ignoring click");
      return;
    }

    if (purchasing) {
      console.log("❌ Purchase in progress, ignoring click");
      return;
    }

    // Lock the process
    processingRef.current = true;
    setPurchasing(pkg.id);

    try {
      console.log("🚀 Starting payment for package:", pkg.id);

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
      console.log("📦 Payment API response:", data);

      if (data.paymentUrl) {
        console.log("✅ Redirecting to:", data.paymentUrl);
        // Use window.location.href (not replace) for external redirect
        window.location.replace(data.paymentUrl);
        // Don't reset state - let the redirect happen
      } else {
        toast.error(data.error || "Failed to create payment session");
        processingRef.current = false;
        setPurchasing(null);
      }
    } catch (error) {
      console.error("❌ Payment error:", error);
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black p-6">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-purple-200 mb-4">
            Choose Your Learning Package
          </h1>
          <p className="text-xl text-purple-300">
            Select the perfect plan for your musical journey
          </p>
        </motion.div>

        {/* Current Package Status */}
        {activePackage && stats?.hasActivePackage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-green-950 to-emerald-900 border-green-700">
              <CardHeader>
                <CardTitle className="text-green-100 flex items-center gap-3">
                  <Check className="h-6 w-6" />
                  Current Active Package
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-green-200 text-sm">Package</p>
                    <p className="text-2xl font-bold text-green-100">
                      {activePackage.packageType}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-200 text-sm">Minutes Used</p>
                    <p className="text-2xl font-bold text-green-100">
                      {stats.minutesUsed} / {stats.totalMinutes}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-200 text-sm">Lessons Remaining</p>
                    <p className="text-2xl font-bold text-green-100">
                      {stats.lessonsRemaining}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Package Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
                <Card
                  className={`relative overflow-hidden ${
                    isActive
                      ? "border-green-500 bg-gradient-to-br from-green-950 to-emerald-900"
                      : "bg-gradient-to-br from-purple-950 to-black border-purple-800"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-1 text-sm font-bold">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center text-purple-100">
                      {getPackageIcon(pkg.id)}
                    </div>
                    <CardTitle className="text-2xl text-purple-100">
                      {pkg.name}
                    </CardTitle>
                    <div className="text-center">
                      <span className="text-5xl font-bold text-purple-100">
                        R{pkg.monthlyPrice.toFixed(2)}
                      </span>
                      <span className="text-purple-300 text-lg">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-center text-purple-300 text-sm">
                      {pkg.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-purple-200">
                        <Check className="h-5 w-5 text-green-400" />
                        <span>{pkg.minutesPerLesson} min per lesson</span>
                      </div>
                      <div className="flex items-center gap-3 text-purple-200">
                        <Check className="h-5 w-5 text-green-400" />
                        <span>{pkg.lessonsPerWeek}x per week</span>
                      </div>
                      <div className="flex items-center gap-3 text-purple-200">
                        <Check className="h-5 w-5 text-green-400" />
                        <span>{pkg.totalMinutesPerMonth} min/month total</span>
                      </div>
                      <div className="flex items-center gap-3 text-purple-200">
                        <Check className="h-5 w-5 text-green-400" />
                        <span>Live Zoom lessons</span>
                      </div>
                      <div className="flex items-center gap-3 text-purple-200">
                        <Check className="h-5 w-5 text-green-400" />
                        <span>Personal teacher</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePurchase(pkg)}
                      disabled={isActive || !!purchasing}
                      className={`w-full py-6 text-lg ${
                        isActive
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gradient-to-r from-purple-600 to-pink-600"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : isActive ? (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Current Package
                        </>
                      ) : (
                        "Choose This Package"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-purple-950 to-black border-purple-800">
            <CardHeader>
              <CardTitle className="text-purple-200">
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-purple-300">
              <div>
                <p className="font-semibold text-purple-100">
                  Can I change my package?
                </p>
                <p className="text-sm">
                  Yes! You can upgrade or change your package at any time.
                </p>
              </div>
              <div>
                <p className="font-semibold text-purple-100">
                  What happens if I miss a lesson?
                </p>
                <p className="text-sm">
                  Your minutes are deducted only for completed lessons.
                </p>
              </div>
              <div>
                <p className="font-semibold text-purple-100">
                  Is payment secure?
                </p>
                <p className="text-sm">
                  Yes! All payments are processed securely through PayFast.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
