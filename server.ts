import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Database Types
export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher';
  createdAt: string;
}

export interface Circle {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  level: string; // 'مبتدئ' | 'متوسط' | 'متقدم' | 'خاتم'
  targetJuz: string;
  meetingTime: string;
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
  level: string;
  notes: string;
  attendanceCount: number;
  lateCount: number;
  disruptiveCount: number;
  absentCount: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  circleId: string;
  circleName: string;
  teacherId: string;
  teacherName: string;
  type: 'award' | 'deduct';
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

interface DBData {
  users: User[];
  circles: Circle[];
  students: Student[];
  transactions: Transaction[];
  resetLogs: ResetLog[];
}

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Initial seed data
const initialData: DBData = {
  users: [
    {
      id: 'admin_root',
      name: 'المشرف العام (الإدارة)',
      username: 'Admin',
      password: '1234Aa1234Aa',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ],
  circles: [],
  students: [],
  transactions: [],
  resetLogs: [],
};

// Database read/write helpers
function readDB(): DBData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      writeDB(initialData);
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const data: DBData = JSON.parse(content);
    // Ensure Admin always exists with specified credentials
    const adminIndex = data.users.findIndex((u) => u.username.toLowerCase() === 'admin');
    if (adminIndex === -1) {
      data.users.push(initialData.users[0]);
      writeDB(data);
    } else {
      // Ensure credentials match prompt specification: Admin / 1234Aa1234Aa
      if (data.users[adminIndex].password !== '1234Aa1234Aa') {
        data.users[adminIndex].password = '1234Aa1234Aa';
        data.users[adminIndex].username = 'Admin';
        data.users[adminIndex].role = 'admin';
        writeDB(data);
      }
    }
    return data;
  } catch (err) {
    console.error('Error reading DB, using initial data:', err);
    return initialData;
  }
}

function writeDB(data: DBData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// SSE Real-time client manager
const sseClients = new Set<Response>();

function broadcastSSE(event: { type: string; data?: any; message?: string }) {
  const payload = `data: ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// SSE endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'متصل بالنظام اللحظي' })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const db = readDB();
  const user = db.users.find(
    (u) =>
      u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
      u.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  // Return user without exposing raw sensitive list
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, username, password } = req.body;
  if (!name?.trim() || !username?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة (الاسم، اسم المستخدم، كلمة المرور)' });
  }

  const db = readDB();
  const cleanUsername = username.trim();

  if (cleanUsername.toLowerCase() === 'admin') {
    return res.status(400).json({ error: 'اسم المستخدم Admin محجوز للإدارة' });
  }

  const existing = db.users.find(
    (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر' });
  }

  const newUser: User = {
    id: `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    username: cleanUsername,
    password: password.trim(),
    role: 'teacher',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  broadcastSSE({ type: 'USER_REGISTERED', data: { id: newUser.id, name: newUser.name, role: newUser.role } });

  return res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  });
});

// Circles Endpoints
app.get('/api/circles', (req: Request, res: Response) => {
  const { teacherId } = req.query;
  const db = readDB();

  let circles = db.circles;
  if (teacherId && typeof teacherId === 'string') {
    circles = circles.filter((c) => c.teacherId === teacherId);
  }

  // Attach student counts and total points to each circle for quick insights
  const enrichedCircles = circles.map((circle) => {
    const studentsInCircle = db.students.filter((s) => s.circleId === circle.id);
    const totalPoints = studentsInCircle.reduce((sum, s) => sum + s.points, 0);
    return {
      ...circle,
      studentCount: studentsInCircle.length,
      totalPoints,
    };
  });

  return res.json({ circles: enrichedCircles });
});

app.post('/api/circles', (req: Request, res: Response) => {
  const { name, teacherId, teacherName, level, targetJuz, meetingTime } = req.body;
  if (!name?.trim() || !teacherId) {
    return res.status(400).json({ error: 'اسم الحلقة ومعرف المعلم مطلوبان' });
  }

  const db = readDB();
  const newCircle: Circle = {
    id: `circle_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    teacherId,
    teacherName: teacherName?.trim() || 'المعلم',
    level: level?.trim() || 'مبتدئ',
    targetJuz: targetJuz?.trim() || 'عام',
    meetingTime: meetingTime?.trim() || 'بعد صلاة العصر',
    createdAt: new Date().toISOString(),
  };

  db.circles.push(newCircle);
  writeDB(db);

  broadcastSSE({ type: 'CIRCLE_CREATED', data: newCircle });
  return res.status(201).json({ circle: newCircle });
});

app.delete('/api/circles/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const circleIndex = db.circles.findIndex((c) => c.id === id);
  if (circleIndex === -1) {
    return res.status(404).json({ error: 'الحلقة غير موجودة' });
  }

  const deletedCircle = db.circles[circleIndex];
  db.circles.splice(circleIndex, 1);
  // Also remove students belonging to this circle
  db.students = db.students.filter((s) => s.circleId !== id);
  writeDB(db);

  broadcastSSE({ type: 'CIRCLE_DELETED', data: { id, name: deletedCircle.name } });
  return res.json({ success: true, message: 'تم حذف الحلقة بنجاح' });
});

// Students Endpoints
app.get('/api/students', (req: Request, res: Response) => {
  const { circleId, teacherId, search } = req.query;
  const db = readDB();

  let students = db.students;
  if (circleId && typeof circleId === 'string') {
    students = students.filter((s) => s.circleId === circleId);
  } else if (teacherId && typeof teacherId === 'string') {
    students = students.filter((s) => s.teacherId === teacherId);
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.circleName.toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
  }

  return res.json({ students });
});

app.get('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const student = db.students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'الطالب غير موجود' });
  }

  const transactions = db.transactions
    .filter((t) => t.studentId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return res.json({ student, transactions });
});

app.post('/api/students', (req: Request, res: Response) => {
  const { name, circleId, phone, currentJuz, level, notes, teacherId, teacherName } = req.body;
  if (!name?.trim() || !circleId) {
    return res.status(400).json({ error: 'اسم الطالب والحلقة مطلوبان' });
  }

  const db = readDB();
  const circle = db.circles.find((c) => c.id === circleId);
  if (!circle) {
    return res.status(404).json({ error: 'الحلقة المحددة غير موجودة' });
  }

  const newStudent: Student = {
    id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    circleId,
    circleName: circle.name,
    teacherId: teacherId || circle.teacherId,
    teacherName: teacherName || circle.teacherName,
    points: 0,
    phone: phone?.trim() || '',
    currentJuz: currentJuz?.trim() || 'جزء عم',
    level: level?.trim() || circle.level || 'مبتدئ',
    notes: notes?.trim() || '',
    attendanceCount: 0,
    lateCount: 0,
    disruptiveCount: 0,
    absentCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.students.push(newStudent);
  writeDB(db);

  broadcastSSE({ type: 'STUDENT_ADDED', data: newStudent });
  return res.status(201).json({ student: newStudent });
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, currentJuz, level, notes, circleId } = req.body;

  const db = readDB();
  const student = db.students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'الطالب غير موجود' });
  }

  if (name?.trim()) student.name = name.trim();
  if (phone !== undefined) student.phone = phone.trim();
  if (currentJuz !== undefined) student.currentJuz = currentJuz.trim();
  if (level !== undefined) student.level = level.trim();
  if (notes !== undefined) student.notes = notes.trim();

  if (circleId && circleId !== student.circleId) {
    const circle = db.circles.find((c) => c.id === circleId);
    if (circle) {
      student.circleId = circle.id;
      student.circleName = circle.name;
    }
  }

  writeDB(db);
  broadcastSSE({ type: 'STUDENT_UPDATED', data: student });
  return res.json({ student });
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'الطالب غير موجود' });
  }

  const deletedStudent = db.students[index];
  db.students.splice(index, 1);
  writeDB(db);

  broadcastSSE({ type: 'STUDENT_DELETED', data: { id, name: deletedStudent.name } });
  return res.json({ success: true });
});

// Points Operation: Smart Deduct & Award
app.post('/api/students/:id/points', (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    type, // 'award' | 'deduct'
    points,
    category, // 'late' | 'disruptive' | 'absent' | 'memorization' | 'revision' | 'etiquette' | 'early' | 'custom'
    categoryLabel,
    reason,
    teacherId,
    teacherName,
  } = req.body;

  const pts = parseInt(points, 10);
  if (isNaN(pts) || pts <= 0) {
    return res.status(400).json({ error: 'يجب تحديد عدد نقاط صحيح وأكبر من صفر' });
  }

  if (type !== 'award' && type !== 'deduct') {
    return res.status(400).json({ error: 'نوع العملية غير صالح (إضافة أو خصم)' });
  }

  if (type === 'deduct' && !category) {
    return res.status(400).json({ error: 'يجب تحديد سبب الخصم أولاً (متأخر، مشاغب، غائب، أو سبب آخر)' });
  }

  const db = readDB();
  const student = db.students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'الطالب غير موجود' });
  }

  const pointsBefore = student.points;
  let pointsAfter = pointsBefore;

  if (type === 'award') {
    pointsAfter = pointsBefore + pts;
    student.points = pointsAfter;
    if (category === 'early' || category === 'attendance') {
      student.attendanceCount += 1;
    }
  } else {
    // Deduction: points subtracted
    pointsAfter = Math.max(0, pointsBefore - pts);
    student.points = pointsAfter;

    if (category === 'late') {
      student.lateCount += 1;
    } else if (category === 'disruptive') {
      student.disruptiveCount += 1;
    } else if (category === 'absent') {
      student.absentCount += 1;
    }
  }

  const newTransaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    studentId: student.id,
    studentName: student.name,
    circleId: student.circleId,
    circleName: student.circleName,
    teacherId: teacherId || student.teacherId,
    teacherName: teacherName || student.teacherName,
    type,
    points: pts,
    category: category || 'custom',
    categoryLabel: categoryLabel || (type === 'award' ? 'نقاط تشجيعية' : 'خصم سلوكي'),
    reason: reason?.trim() || (type === 'award' ? 'إنجاز متميز' : 'خصم بموجب النظام'),
    pointsBefore,
    pointsAfter,
    timestamp: new Date().toISOString(),
  };

  db.transactions.unshift(newTransaction);
  writeDB(db);

  broadcastSSE({
    type: 'TRANSACTION_CREATED',
    data: {
      transaction: newTransaction,
      student,
    },
  });

  return res.json({
    success: true,
    student,
    transaction: newTransaction,
  });
});

// Global Admin Endpoints
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const db = readDB();

  const totalStudents = db.students.length;
  const totalCircles = db.circles.length;
  const teachers = db.users.filter((u) => u.role === 'teacher');
  const totalTeachers = teachers.length;

  const totalPointsInSystem = db.students.reduce((sum, s) => sum + s.points, 0);

  const totalAwarded = db.transactions
    .filter((t) => t.type === 'award')
    .reduce((sum, t) => sum + t.points, 0);

  const totalDeducted = db.transactions
    .filter((t) => t.type === 'deduct')
    .reduce((sum, t) => sum + t.points, 0);

  const lateDeductionsCount = db.transactions.filter((t) => t.category === 'late').length;
  const disruptiveDeductionsCount = db.transactions.filter((t) => t.category === 'disruptive').length;
  const absentDeductionsCount = db.transactions.filter((t) => t.category === 'absent').length;

  // Leaderboard across all circles
  const topStudents = [...db.students]
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  // Recent transactions (last 30)
  const recentTransactions = db.transactions.slice(0, 30);

  return res.json({
    totalStudents,
    totalCircles,
    totalTeachers,
    totalPointsInSystem,
    totalAwarded,
    totalDeducted,
    lateDeductionsCount,
    disruptiveDeductionsCount,
    absentDeductionsCount,
    teachers: teachers.map((t) => ({ id: t.id, name: t.name, username: t.username })),
    topStudents,
    recentTransactions,
    resetLogs: db.resetLogs,
  });
});

// Admin Reset All Points across all circles
app.post('/api/admin/reset-points', (req: Request, res: Response) => {
  const { adminName } = req.body;
  const db = readDB();

  const affectedCount = db.students.length;
  const totalPointsReset = db.students.reduce((sum, s) => sum + s.points, 0);

  // Set all students' points to 0
  db.students.forEach((s) => {
    s.points = 0;
  });

  const resetLog: ResetLog = {
    id: `reset_${Date.now()}`,
    adminName: adminName?.trim() || 'المشرف العام',
    timestamp: new Date().toISOString(),
    affectedStudentsCount: affectedCount,
    totalPointsReset,
  };

  db.resetLogs.unshift(resetLog);

  // Also add a system transaction noting the reset
  const resetTx: Transaction = {
    id: `tx_reset_${Date.now()}`,
    studentId: 'ALL',
    studentName: 'جميع طلاب الحلقات',
    circleId: 'ALL',
    circleName: 'كافة الحلقات القرآنية',
    teacherId: 'admin_root',
    teacherName: resetLog.adminName,
    type: 'deduct',
    points: totalPointsReset,
    category: 'reset',
    categoryLabel: 'تصفير النقاط الشامل',
    reason: `إجراء إعادة ضبط النقاط السنوي/الفصلي من قبل الإدارة (${resetLog.adminName})`,
    pointsBefore: totalPointsReset,
    pointsAfter: 0,
    timestamp: resetLog.timestamp,
  };
  db.transactions.unshift(resetTx);

  writeDB(db);

  broadcastSSE({
    type: 'POINTS_RESET',
    data: resetLog,
  });

  return res.json({
    success: true,
    message: 'تم تصفير جميع نقاط الطلاب في كافة الحلقات بنجاح',
    resetLog,
  });
});

// All Transactions with filter
app.get('/api/transactions', (req: Request, res: Response) => {
  const { circleId, teacherId, studentId, limit } = req.query;
  const db = readDB();

  let txs = db.transactions;
  if (studentId && typeof studentId === 'string') {
    txs = txs.filter((t) => t.studentId === studentId);
  } else if (circleId && typeof circleId === 'string') {
    txs = txs.filter((t) => t.circleId === circleId);
  } else if (teacherId && typeof teacherId === 'string') {
    txs = txs.filter((t) => t.teacherId === teacherId);
  }

  const maxLimit = limit ? parseInt(limit as string, 10) : 100;
  return res.json({ transactions: txs.slice(0, maxLimit) });
});

// Frontend Serving (Dev Vite Middleware vs Production Static)
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`نظام إتقان لحلقات التحفيظ يعمل على: http://localhost:${PORT}`);
  });
}

startServer();
