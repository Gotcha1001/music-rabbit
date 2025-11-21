"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function EarningsPage() {
  // Get current user first
  const user = useQuery(api.users.get);
  const userId = user?._id as Id<"users"> | undefined;

  // Only fetch payments if we have a user ID
  const payments = useQuery(
    api.payments.getByTeacher,
    userId ? { teacherId: userId } : "skip"
  );

  // Show loading state
  if (!user || payments === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If no payments yet
  if (!payments || payments.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">My Earnings</h1>
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-lg text-muted-foreground">
              No earnings yet. Complete some lessons to see your payouts!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = payments.reduce((sum, p) => sum + p.earnings, 0);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold">My Earnings</h1>

      {/* Total All-Time Earnings */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            Total Earned All Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-green-600">
            ${total.toFixed(2)}
          </p>
          <p className="text-sm text-green-700 mt-2">
            From {payments.length} month{payments.length > 1 ? "s" : ""} of
            teaching
          </p>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {payments
          .sort((a, b) => b.month.localeCompare(a.month))
          .map((p) => (
            <Card key={p._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">
                  {format(new Date(p.month + "-01"), "MMMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-green-600">
                    ${p.earnings.toFixed(2)}
                  </span>
                  {p.deductions > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      −${p.deductions}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{p.totalHours.toFixed(1)} hours taught</p>
                  {p.deductions > 0 && (
                    <p className="text-red-600">
                      Deductions: late/no-show penalties
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
