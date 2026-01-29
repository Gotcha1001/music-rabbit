// // lib/generateSalaryPDF.ts
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// interface TeacherSalaryData {
//   teacher: {
//     _id: string;
//     name: string;
//     email?: string;
//   };
//   completedLessons?: number;
//   totalHours?: number;
//   totalEarnings?: number;
//   paymentStatus?: string;
//   lessonBreakdown?: {
//     instrument: string;
//     count: number;
//     hours: number;
//     earnings: number;
//   }[];
// }

// interface SalaryPDFData {
//   teacherSalaries: TeacherSalaryData[];
//   month: string;
//   totalEarnings: number;
//   totalLessons: number;
//   totalHours: number;
// }

// export async function generateSalaryPDF(data: SalaryPDFData) {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.width;

//   // Format the month for display
//   const [year, month] = data.month.split("-");
//   const monthDate = new Date(parseInt(year), parseInt(month) - 1);
//   const monthName = monthDate.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//   });

//   // Header
//   doc.setFontSize(20);
//   doc.setTextColor(40, 40, 40);
//   doc.text("Teacher Salary Report", pageWidth / 2, 20, { align: "center" });

//   doc.setFontSize(12);
//   doc.setTextColor(100, 100, 100);
//   doc.text(monthName, pageWidth / 2, 28, { align: "center" });

//   // Add generation date
//   doc.setFontSize(9);
//   doc.text(
//     `Generated on ${new Date().toLocaleDateString("en-US")}`,
//     pageWidth / 2,
//     34,
//     { align: "center" },
//   );

//   // Summary section
//   doc.setFontSize(14);
//   doc.setTextColor(40, 40, 40);
//   doc.text("Summary", 14, 45);

//   // Summary box
//   doc.setDrawColor(200, 200, 200);
//   doc.setFillColor(249, 250, 251);
//   doc.roundedRect(14, 48, pageWidth - 28, 30, 3, 3, "FD");

//   doc.setFontSize(10);
//   doc.setTextColor(60, 60, 60);

//   const summaryY = 56;
//   const col1X = 20;
//   const col2X = pageWidth / 2 + 10;

//   doc.text(`Total Earnings:`, col1X, summaryY);
//   doc.setFont(undefined, "bold");
//   doc.text(`R${data.totalEarnings.toFixed(2)}`, col1X + 40, summaryY);
//   doc.setFont(undefined, "normal");

//   doc.text(`Completed Lessons:`, col2X, summaryY);
//   doc.setFont(undefined, "bold");
//   doc.text(`${data.totalLessons}`, col2X + 45, summaryY);
//   doc.setFont(undefined, "normal");

//   doc.text(`Total Hours:`, col1X, summaryY + 8);
//   doc.setFont(undefined, "bold");
//   doc.text(`${data.totalHours.toFixed(1)}h`, col1X + 40, summaryY + 8);
//   doc.setFont(undefined, "normal");

//   doc.text(`Active Teachers:`, col2X, summaryY + 8);
//   doc.setFont(undefined, "bold");
//   doc.text(`${data.teacherSalaries.length}`, col2X + 45, summaryY + 8);
//   doc.setFont(undefined, "normal");

//   // Teacher breakdown table
//   const tableData = data.teacherSalaries.map((ts) => [
//     ts.teacher.name,
//     ts.teacher.email || "N/A",
//     (ts.completedLessons || 0).toString(),
//     (ts.totalHours || 0).toFixed(1),
//     `R${(ts.totalEarnings || 0).toFixed(2)}`,
//     ts.paymentStatus || "Pending",
//   ]);

//   autoTable(doc, {
//     head: [["Teacher Name", "Email", "Lessons", "Hours", "Earnings", "Status"]],
//     body: tableData,
//     startY: 88,
//     theme: "striped",
//     headStyles: {
//       fillColor: [59, 130, 246],
//       textColor: 255,
//       fontSize: 10,
//       fontStyle: "bold",
//     },
//     styles: {
//       fontSize: 9,
//       cellPadding: 4,
//     },
//     columnStyles: {
//       0: { cellWidth: 40 },
//       1: { cellWidth: 50 },
//       2: { cellWidth: 20, halign: "center" },
//       3: { cellWidth: 20, halign: "center" },
//       4: { cellWidth: 30, halign: "right" },
//       5: { cellWidth: 25, halign: "center" },
//     },
//     alternateRowStyles: {
//       fillColor: [249, 250, 251],
//     },
//     didDrawPage: (data) => {
//       // Footer
//       const pageCount = doc.getNumberOfPages();
//       doc.setFontSize(8);
//       doc.setTextColor(150);
//       doc.text(
//         `Page ${data.pageNumber} of ${pageCount}`,
//         pageWidth / 2,
//         doc.internal.pageSize.height - 10,
//         { align: "center" },
//       );
//     },
//   });

//   // Add detailed breakdown for each teacher on separate pages
//   data.teacherSalaries.forEach((ts, index) => {
//     if (ts.lessonBreakdown && ts.lessonBreakdown.length > 0) {
//       doc.addPage();

//       // Teacher header
//       doc.setFontSize(16);
//       doc.setTextColor(40, 40, 40);
//       doc.text(`${ts.teacher.name} - Lesson Breakdown`, 14, 20);

//       doc.setFontSize(10);
//       doc.setTextColor(100, 100, 100);
//       doc.text(ts.teacher.email || "No email", 14, 28);

//       // Breakdown table
//       const breakdownData = ts.lessonBreakdown.map((bd) => [
//         bd.instrument,
//         bd.count.toString(),
//         bd.hours.toFixed(1),
//         `R${bd.earnings.toFixed(2)}`,
//       ]);

//       autoTable(doc, {
//         head: [["Instrument", "Lessons", "Hours", "Earnings"]],
//         body: breakdownData,
//         startY: 35,
//         theme: "grid",
//         headStyles: {
//           fillColor: [59, 130, 246],
//           textColor: 255,
//           fontSize: 10,
//           fontStyle: "bold",
//         },
//         styles: {
//           fontSize: 9,
//           cellPadding: 4,
//         },
//         columnStyles: {
//           0: { cellWidth: 80 },
//           1: { cellWidth: 30, halign: "center" },
//           2: { cellWidth: 30, halign: "center" },
//           3: { cellWidth: 40, halign: "right" },
//         },
//       });

//       // Summary for this teacher
//       const finalY = (doc as any).lastAutoTable.finalY + 10;
//       doc.setDrawColor(59, 130, 246);
//       doc.setLineWidth(0.5);
//       doc.line(14, finalY, pageWidth - 14, finalY);

//       doc.setFontSize(11);
//       doc.setTextColor(40, 40, 40);
//       doc.text("Total:", 14, finalY + 8);
//       doc.setFont(undefined, "bold");
//       doc.text(
//         `${ts.completedLessons} lessons • ${(ts.totalHours || 0).toFixed(1)} hours • R${(
//           ts.totalEarnings || 0
//         ).toFixed(2)}`,
//         pageWidth - 14,
//         finalY + 8,
//         { align: "right" },
//       );
//       doc.setFont(undefined, "normal");
//     }
//   });

//   // Save the PDF
//   doc.save(`teacher-salaries-${data.month}.pdf`);
// }
// lib/generateSalaryPDF.ts

import { SalaryPDFData } from "@/app/types/salaries";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the types

interface AutoTableOptions {
  head?: string[][];
  body?: string[][];
  startY?: number;
  theme?: string;
  headStyles?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  columnStyles?: Record<number, Record<string, unknown>>;
  alternateRowStyles?: Record<string, unknown>;
  didDrawPage?: (data: AutoTableHookData) => void;
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => { finalY: number };
    lastAutoTable: { finalY: number };
  }
}

// Import from new file

interface AutoTableHookData {
  pageNumber: number;
}

export async function generateSalaryPDF(data: SalaryPDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Format the month for display
  const [yearStr, monthStr] = data.month.split("-");
  const year = parseInt(yearStr ?? "0", 10);
  const month = parseInt(monthStr ?? "0", 10) - 1;
  const monthDate = new Date(year, month);
  const monthName = monthDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Teacher Salary Report", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(monthName, pageWidth / 2, 28, { align: "center" });

  // Add generation date
  doc.setFontSize(9);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-US")}`,
    pageWidth / 2,
    34,
    { align: "center" },
  );

  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Summary", 14, 45);

  // Summary box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 48, pageWidth - 28, 30, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const summaryY = 56;
  const col1X = 20;
  const col2X = pageWidth / 2 + 10;

  doc.text(`Total Earnings:`, col1X, summaryY);
  doc.setFont("helvetica", "bold");
  doc.text(`R${data.totalEarnings.toFixed(2)}`, col1X + 40, summaryY);
  doc.setFont("helvetica", "normal");

  doc.text(`Completed Lessons:`, col2X, summaryY);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.totalLessons}`, col2X + 45, summaryY);
  doc.setFont("helvetica", "normal");

  doc.text(`Total Hours:`, col1X, summaryY + 8);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.totalHours.toFixed(1)}h`, col1X + 40, summaryY + 8);
  doc.setFont("helvetica", "normal");

  doc.text(`Active Teachers:`, col2X, summaryY + 8);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.teacherSalaries.length}`, col2X + 45, summaryY + 8);
  doc.setFont("helvetica", "normal");

  // Teacher breakdown table
  const tableData: string[][] = data.teacherSalaries.map((ts) => [
    ts.teacher.name,
    ts.teacher.email ?? "N/A",
    (ts.completedLessons ?? 0).toString(),
    (ts.totalHours ?? 0).toFixed(1),
    `R${(ts.totalEarnings ?? 0).toFixed(2)}`,
    ts.paymentStatus ?? "Pending",
  ]);

  doc.autoTable({
    head: [["Teacher Name", "Email", "Lessons", "Hours", "Earnings", "Status"]],
    body: tableData,
    startY: 88,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 25, halign: "center" },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    didDrawPage: (hookData: AutoTableHookData) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${hookData.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    },
  });

  // Add detailed breakdown for each teacher on separate pages
  data.teacherSalaries.forEach((ts) => {
    if (ts.lessonBreakdown && ts.lessonBreakdown.length > 0) {
      doc.addPage();

      // Teacher header
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(`${ts.teacher.name} - Lesson Breakdown`, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(ts.teacher.email ?? "No email", 14, 28);

      // Breakdown table
      const breakdownData: string[][] = ts.lessonBreakdown.map((bd) => [
        bd.instrument,
        bd.count.toString(),
        bd.hours.toFixed(1),
        `R${bd.earnings.toFixed(2)}`,
      ]);

      doc.autoTable({
        head: [["Instrument", "Lessons", "Hours", "Earnings"]],
        body: breakdownData,
        startY: 35,
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 10,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 40, halign: "right" },
        },
      });

      // Summary for this teacher
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(14, finalY, pageWidth - 14, finalY);

      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text("Total:", 14, finalY + 8);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${ts.completedLessons ?? 0} lessons • ${(ts.totalHours ?? 0).toFixed(1)} hours • R${(ts.totalEarnings ?? 0).toFixed(2)}`,
        pageWidth - 14,
        finalY + 8,
        { align: "right" },
      );
      doc.setFont("helvetica", "normal");
    }
  });

  // Save the PDF
  doc.save(`teacher-salaries-${data.month}.pdf`);
}
