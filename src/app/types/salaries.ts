// app/types/salaries.ts
export interface TeacherSalaryData {
  teacher: {
    _id: string;
    name: string;
    email?: string | null;
  };
  completedLessons?: number;
  totalHours?: number;
  totalEarnings?: number;
  paymentStatus?: string;
  lessonBreakdown?: {
    instrument: string;
    count: number;
    hours: number;
    earnings: number;
  }[];
}

export interface SalaryPDFData {
  teacherSalaries: TeacherSalaryData[];
  month: string;
  totalEarnings: number;
  totalLessons: number;
  totalHours: number;
}
