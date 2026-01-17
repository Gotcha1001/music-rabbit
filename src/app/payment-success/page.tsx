// "use client";

// import { useSearchParams } from "next/navigation";
// import { useQuery } from "convex/react";
// import { api } from "../../../convex/_generated/api";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   CheckCircle,
//   Home,
//   Calendar,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import { useEffect, useState, useRef } from "react";
// import { PACKAGE_DEFINITIONS } from "@/lib/packages";
// import confetti from "canvas-confetti";

// export default function PaymentSuccess() {
//   const searchParams = useSearchParams();
//   const currentUser = useQuery(api.users.get);
//   const [pollingCount, setPollingCount] = useState(0);
//   const hasTriggeredConfetti = useRef(false);

//   // ✅ Extract payment details from URL
//   const amount =
//     searchParams.get("amount_gross") || searchParams.get("amount") || "0.00";
//   const itemName =
//     searchParams.get("item_name") || searchParams.get("package") || "Package";

//   // ✅ Extract package ID from payment ID (format: studentId_packageId_timestamp)
//   const paymentId =
//     searchParams.get("m_payment_id") ||
//     searchParams.get("payment_id") ||
//     "Unknown";
//   const packageIdFromPayment = paymentId.split("_")[1];

//   // ✅ Poll for package every 2 seconds (max 30 seconds)
//   const activePackage = useQuery(
//     api.studentPackages.getActivePackage,
//     currentUser ? { studentId: currentUser._id } : "skip"
//   );

//   // ✅ Get package details from definitions
//   let packageInfo = null;

//   if (packageIdFromPayment) {
//     const pkgDef = PACKAGE_DEFINITIONS.find(
//       (p) => p.id === packageIdFromPayment
//     );
//     if (pkgDef) {
//       packageInfo = {
//         name: pkgDef.name,
//         amount: pkgDef.monthlyPrice.toFixed(2),
//       };
//     }
//   }

//   if (!packageInfo && itemName && amount) {
//     packageInfo = {
//       name: itemName,
//       amount: parseFloat(amount).toFixed(2),
//     };
//   }

//   // Polling effect
//   useEffect(() => {
//     if (!activePackage && pollingCount < 15) {
//       const timer = setTimeout(() => {
//         setPollingCount((c) => c + 1);
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [activePackage, pollingCount]);

//   // Trigger celebratory confetti when package is activated
//   useEffect(() => {
//     if (activePackage && !hasTriggeredConfetti.current) {
//       hasTriggeredConfetti.current = true;

//       const duration = 7 * 1000; // 7 seconds
//       const animationEnd = Date.now() + duration;
//       const defaults = {
//         startVelocity: 30,
//         spread: 360,
//         ticks: 60,
//         zIndex: 9999,
//         colors: [
//           "#FFD700",
//           "#FF6B6B",
//           "#4ECDC4",
//           "#45B7D1",
//           "#FFA07A",
//           "#98D8C8",
//           "#F7DC6F",
//           "#BB8FCE",
//           "#85C1E2",
//           "#F8B739",
//           "#FF1493",
//           "#00CED1",
//           "#FF69B4",
//           "#32CD32",
//           "#FF4500",
//           "#9370DB",
//           "#20B2AA",
//           "#FF8C00",
//           "#DA70D6",
//           "#00FA9A",
//         ],
//       };

//       const randomInRange = (min: number, max: number) =>
//         Math.random() * (max - min) + min;

//       const interval = window.setInterval(() => {
//         const timeLeft = animationEnd - Date.now();

//         if (timeLeft <= 0) {
//           return clearInterval(interval);
//         }

//         const particleCount = 50 * (timeLeft / duration);

//         // Fire from left side
//         confetti({
//           ...defaults,
//           particleCount,
//           origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
//         });

//         // Fire from right side
//         confetti({
//           ...defaults,
//           particleCount,
//           origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
//         });
//       }, 250);

//       return () => clearInterval(interval);
//     }
//   }, [activePackage]);

//   const isProcessing = !activePackage && pollingCount < 15;
//   const timedOut = pollingCount >= 15 && !activePackage;

//   // Show package info from URL params or active package
//   const displayPackage = activePackage
//     ? {
//         name:
//           PACKAGE_DEFINITIONS.find((p) => p.id === activePackage.packageType)
//             ?.name || activePackage.packageType,
//         amount: activePackage.monthlyPrice.toFixed(2),
//       }
//     : packageInfo;

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-6">
//       <motion.div
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-2xl w-full"
//       >
//         <Card className="bg-gradient-to-br from-green-950 to-emerald-900 border-green-700 shadow-2xl">
//           <CardHeader className="text-center pb-8">
//             {isProcessing ? (
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                 className="mx-auto w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mb-6"
//               >
//                 <Loader2 className="h-16 w-16 text-white" />
//               </motion.div>
//             ) : timedOut ? (
//               <motion.div className="mx-auto w-24 h-24 rounded-full bg-yellow-600 flex items-center justify-center mb-6">
//                 <AlertCircle className="h-16 w-16 text-white" />
//               </motion.div>
//             ) : (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: "spring" }}
//                 className="mx-auto w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mb-6"
//               >
//                 <CheckCircle className="h-16 w-16 text-white" />
//               </motion.div>
//             )}
//             <CardTitle className="text-4xl font-bold text-green-100 mb-2">
//               {isProcessing
//                 ? "Processing Payment..."
//                 : timedOut
//                   ? "Payment Received!"
//                   : "Payment Successful!"}
//             </CardTitle>
//             <p className="text-green-200 text-lg">
//               {isProcessing
//                 ? "Your package is being activated. Please wait..."
//                 : timedOut
//                   ? "Your payment was successful. Package activation may take a few minutes."
//                   : "Your package is now active and ready to use"}
//             </p>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Payment Details */}
//             <div className="bg-green-900/30 rounded-lg p-6 space-y-4">
//               {displayPackage && (
//                 <>
//                   <div className="flex justify-between items-center border-b border-green-700/50 pb-3">
//                     <span className="text-green-300">Package</span>
//                     <span className="text-green-100 font-semibold">
//                       {displayPackage.name}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center border-b border-green-700/50 pb-3">
//                     <span className="text-green-300">Amount Paid</span>
//                     <span className="text-green-100 font-semibold text-xl">
//                       R{displayPackage.amount}
//                     </span>
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* Status Message */}
//             {isProcessing && (
//               <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50">
//                 <p className="text-yellow-200 text-center">
//                   ⏳ Confirming payment with PayFast... (Attempt {pollingCount}
//                   /15)
//                 </p>
//               </div>
//             )}

//             {timedOut && (
//               <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
//                 <p className="text-blue-200 text-center">
//                   ℹ️ Your payment was successful! If your package doesn&apos;t
//                   appear shortly, please refresh the page or contact support.
//                 </p>
//               </div>
//             )}

//             {/* Next Steps */}
//             {!isProcessing && (
//               <div className="bg-green-900/20 rounded-lg p-6">
//                 <h3 className="text-green-100 font-semibold text-lg mb-4 flex items-center gap-2">
//                   <Calendar className="h-5 w-5" />
//                   What&apos;s Next?
//                 </h3>
//                 <ul className="space-y-3 text-green-200">
//                   <li className="flex items-start gap-2">
//                     <span className="text-green-400 mt-1">✓</span>
//                     <span>Check your email for payment confirmation</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-green-400 mt-1">✓</span>
//                     <span>View your package details in your dashboard</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-green-400 mt-1">✓</span>
//                     <span>Book your first lesson with your teacher</span>
//                   </li>
//                 </ul>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 pt-4">
//               <Button
//                 asChild
//                 className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
//                 disabled={isProcessing}
//               >
//                 <Link href="/dashboard/student">
//                   <Home className="mr-2 h-5 w-5" />
//                   Go to Dashboard
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="flex-1 border-green-600 text-green-100 hover:bg-green-900/30 py-6 text-lg"
//                 disabled={isProcessing}
//               >
//                 <Link href="/dashboard/student/packages">
//                   View Package Details
//                 </Link>
//               </Button>
//             </div>

//             {/* Support */}
//             <p className="text-center text-green-300/70 text-sm pt-4">
//               Questions? Contact us at{" "}
//               <a
//                 href="mailto:support@musicrabbit.com"
//                 className="text-green-400 hover:underline"
//               >
//                 support@musicrabbit.com
//               </a>
//             </p>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Home,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef, Suspense } from "react";
import { PACKAGE_DEFINITIONS } from "@/lib/packages";
import confetti from "canvas-confetti";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const currentUser = useQuery(api.users.get);
  const [pollingCount, setPollingCount] = useState(0);
  const hasTriggeredConfetti = useRef(false);

  // ✅ Extract payment details from URL
  const amount =
    searchParams.get("amount_gross") || searchParams.get("amount") || "0.00";
  const itemName =
    searchParams.get("item_name") || searchParams.get("package") || "Package";

  // ✅ Extract package ID from payment ID (format: studentId_packageId_timestamp)
  const paymentId =
    searchParams.get("m_payment_id") ||
    searchParams.get("payment_id") ||
    "Unknown";
  const packageIdFromPayment = paymentId.split("_")[1];

  // ✅ Poll for package every 2 seconds (max 30 seconds)
  const activePackage = useQuery(
    api.studentPackages.getActivePackage,
    currentUser ? { studentId: currentUser._id } : "skip"
  );

  // ✅ Get package details from definitions
  let packageInfo = null;

  if (packageIdFromPayment) {
    const pkgDef = PACKAGE_DEFINITIONS.find(
      (p) => p.id === packageIdFromPayment
    );
    if (pkgDef) {
      packageInfo = {
        name: pkgDef.name,
        amount: pkgDef.monthlyPrice.toFixed(2),
      };
    }
  }

  if (!packageInfo && itemName && amount) {
    packageInfo = {
      name: itemName,
      amount: parseFloat(amount).toFixed(2),
    };
  }

  // Polling effect
  useEffect(() => {
    if (!activePackage && pollingCount < 15) {
      const timer = setTimeout(() => {
        setPollingCount((c) => c + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePackage, pollingCount]);

  // Trigger celebratory confetti when package is activated
  useEffect(() => {
    if (activePackage && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;

      const duration = 7 * 1000; // 7 seconds
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
        colors: [
          "#FFD700",
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#FFA07A",
          "#98D8C8",
          "#F7DC6F",
          "#BB8FCE",
          "#85C1E2",
          "#F8B739",
          "#FF1493",
          "#00CED1",
          "#FF69B4",
          "#32CD32",
          "#FF4500",
          "#9370DB",
          "#20B2AA",
          "#FF8C00",
          "#DA70D6",
          "#00FA9A",
        ],
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from left side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });

        // Fire from right side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [activePackage]);

  const isProcessing = !activePackage && pollingCount < 15;
  const timedOut = pollingCount >= 15 && !activePackage;

  // Show package info from URL params or active package
  const displayPackage = activePackage
    ? {
        name:
          PACKAGE_DEFINITIONS.find((p) => p.id === activePackage.packageType)
            ?.name || activePackage.packageType,
        amount: activePackage.monthlyPrice.toFixed(2),
      }
    : packageInfo;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-gradient-to-br from-green-950 to-emerald-900 border-green-700 shadow-2xl">
          <CardHeader className="text-center pb-8">
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mb-6"
              >
                <Loader2 className="h-16 w-16 text-white" />
              </motion.div>
            ) : timedOut ? (
              <motion.div className="mx-auto w-24 h-24 rounded-full bg-yellow-600 flex items-center justify-center mb-6">
                <AlertCircle className="h-16 w-16 text-white" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mb-6"
              >
                <CheckCircle className="h-16 w-16 text-white" />
              </motion.div>
            )}
            <CardTitle className="text-4xl font-bold text-green-100 mb-2">
              {isProcessing
                ? "Processing Payment..."
                : timedOut
                  ? "Payment Received!"
                  : "Payment Successful!"}
            </CardTitle>
            <p className="text-green-200 text-lg">
              {isProcessing
                ? "Your package is being activated. Please wait..."
                : timedOut
                  ? "Your payment was successful. Package activation may take a few minutes."
                  : "Your package is now active and ready to use"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-green-900/30 rounded-lg p-6 space-y-4">
              {displayPackage && (
                <>
                  <div className="flex justify-between items-center border-b border-green-700/50 pb-3">
                    <span className="text-green-300">Package</span>
                    <span className="text-green-100 font-semibold">
                      {displayPackage.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-green-700/50 pb-3">
                    <span className="text-green-300">Amount Paid</span>
                    <span className="text-green-100 font-semibold text-xl">
                      R{displayPackage.amount}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Status Message */}
            {isProcessing && (
              <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50">
                <p className="text-yellow-200 text-center">
                  ⏳ Confirming payment with PayFast... (Attempt {pollingCount}
                  /15)
                </p>
              </div>
            )}

            {timedOut && (
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
                <p className="text-blue-200 text-center">
                  ℹ️ Your payment was successful! If your package doesn&apos;t
                  appear shortly, please refresh the page or contact support.
                </p>
              </div>
            )}

            {/* Next Steps */}
            {!isProcessing && (
              <div className="bg-green-900/20 rounded-lg p-6">
                <h3 className="text-green-100 font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  What&apos;s Next?
                </h3>
                <ul className="space-y-3 text-green-200">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Check your email for payment confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>View your package details in your dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Book your first lesson with your teacher</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                disabled={isProcessing}
              >
                <Link href="/dashboard/student">
                  <Home className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 border-green-600 text-green-100 hover:bg-green-900/30 py-6 text-lg"
                disabled={isProcessing}
              >
                <Link href="/dashboard/student/packages">
                  View Package Details
                </Link>
              </Button>
            </div>

            {/* Support */}
            <p className="text-center text-green-300/70 text-sm pt-4">
              Questions? Contact us at{" "}
              <a
                href="mailto:support@musicrabbit.com"
                className="text-green-400 hover:underline"
              >
                support@musicrabbit.com
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
