// app/dashboard/teacher/page.tsx
"use client";

import { redirect } from "next/navigation";

export default function TeacherDashboard() {
  redirect("/dashboard/teacher/schedule");
}
