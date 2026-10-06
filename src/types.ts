export type Role = 'admin' | 'teacher';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  createdAt?: string;
}

export interface Circle {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  level: string; // 'مبتدئ' | 'متوسط' | 'متقدم' | 'خاتم'
  targetJuz: string;
  meetingTime: string;
  studentCount?: number;
  totalPoints?: number;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  circleId: string;
  circleName: string;
  teacherId: string;
  teacherName: string;
  points: number;
  phone: string;
  currentJuz: string;
  level: string; // 'مبتدئ' | 'متوسط' | 'متقدم' | 'خاتم'
  notes: string;
  attendanceCount: number;
  lateCount: number;
  disruptiveCount: number;
  absentCount: number;
  createdAt: string;
}

export type TransactionType = 'award' | 'deduct';

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  circleId: string;
  circleName: string;
  teacherId: string;
  teacherName: string;
  type: TransactionType;
  points: number;
  category: string;
  categoryLabel: string;
  reason: string;
  pointsBefore: number;
  pointsAfter: number;
  timestamp: string;
}

export interface ResetLog {
  id: string;
  adminName: string;
  timestamp: string;
  affectedStudentsCount: number;
  totalPointsReset: number;
}

export interface AdminOverview {
  totalStudents: number;
  totalCircles: number;
  totalTeachers: number;
  totalPointsInSystem: number;
  totalAwarded: number;
  totalDeducted: number;
  lateDeductionsCount: number;
  disruptiveDeductionsCount: number;
  absentDeductionsCount: number;
  teachers: { id: string; name: string; username: string }[];
  topStudents: Student[];
  recentTransactions: Transaction[];
  resetLogs: ResetLog[];
}
