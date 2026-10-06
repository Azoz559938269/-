import { User, Circle, Student, Transaction, AdminOverview } from '../types';

const BASE_URL = '/api';

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تسجيل الدخول' }));
      throw new Error(err.error || 'فشل تسجيل الدخول');
    }
    return res.json();
  },

  async register(name: string, username: string, password: string): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إنشاء الحساب' }));
      throw new Error(err.error || 'فشل إنشاء الحساب');
    }
    return res.json();
  },

  // Circles
  async getCircles(teacherId?: string): Promise<{ circles: Circle[] }> {
    const url = teacherId ? `${BASE_URL}/circles?teacherId=${encodeURIComponent(teacherId)}` : `${BASE_URL}/circles`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل جلب الحلقات');
    return res.json();
  },

  async createCircle(data: {
    name: string;
    teacherId: string;
    teacherName: string;
    level?: string;
    targetJuz?: string;
    meetingTime?: string;
  }): Promise<{ circle: Circle }> {
    const res = await fetch(`${BASE_URL}/circles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إنشاء الحلقة' }));
      throw new Error(err.error || 'فشل إنشاء الحلقة');
    }
    return res.json();
  },

  async deleteCircle(circleId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/circles/${circleId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('فشل حذف الحلقة');
  },

  // Students
  async getStudents(params?: { circleId?: string; teacherId?: string; search?: string }): Promise<{ students: Student[] }> {
    const query = new URLSearchParams();
    if (params?.circleId) query.set('circleId', params.circleId);
    if (params?.teacherId) query.set('teacherId', params.teacherId);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${BASE_URL}/students?${query.toString()}`);
    if (!res.ok) throw new Error('فشل جلب الطلاب');
    return res.json();
  },

  async getStudent(id: string): Promise<{ student: Student; transactions: Transaction[] }> {
    const res = await fetch(`${BASE_URL}/students/${id}`);
    if (!res.ok) throw new Error('فشل جلب بيانات الطالب');
    return res.json();
  },

  async addStudent(data: {
    name: string;
    circleId: string;
    phone?: string;
    currentJuz?: string;
    level?: string;
    notes?: string;
    teacherId?: string;
    teacherName?: string;
  }): Promise<{ student: Student }> {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إضافة الطالب' }));
      throw new Error(err.error || 'فشل إضافة الطالب');
    }
    return res.json();
  },

  async updateStudent(id: string, data: Partial<Student>): Promise<{ student: Student }> {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('فشل تعديل بيانات الطالب');
    return res.json();
  },

  async deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/students/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('فشل حذف الطالب');
  },

  // Smart Points Action: Award or Deduct
  async performPointsAction(studentId: string, payload: {
    type: 'award' | 'deduct';
    points: number;
    category: string;
    categoryLabel: string;
    reason: string;
    teacherId?: string;
    teacherName?: string;
  }): Promise<{ success: boolean; student: Student; transaction: Transaction }> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تنفيذ عملية النقاط' }));
      throw new Error(err.error || 'فشل تنفيذ عملية النقاط');
    }
    return res.json();
  },

  // Admin
  async getAdminOverview(): Promise<AdminOverview> {
    const res = await fetch(`${BASE_URL}/admin/overview`);
    if (!res.ok) throw new Error('فشل جلب تقرير الإدارة');
    return res.json();
  },

  async resetAllPoints(adminName: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/admin/reset-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تصفير النقاط' }));
      throw new Error(err.error || 'فشل تصفير النقاط');
    }
    return res.json();
  },

  // Transactions
  async getTransactions(params?: { circleId?: string; teacherId?: string; studentId?: string; limit?: number }): Promise<{ transactions: Transaction[] }> {
    const query = new URLSearchParams();
    if (params?.circleId) query.set('circleId', params.circleId);
    if (params?.teacherId) query.set('teacherId', params.teacherId);
    if (params?.studentId) query.set('studentId', params.studentId);
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${BASE_URL}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error('فشل جلب سجل العمليات');
    return res.json();
  },

  // Real-time EventSource listener
  subscribeToLiveEvents(onMessage: (event: any) => void): () => void {
    let evtSource: EventSource | null = null;
    let isClosed = false;

    const connect = () => {
      if (isClosed) return;
      try {
        evtSource = new EventSource(`${BASE_URL}/events`);
        evtSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            onMessage(data);
          } catch {
            // Ignore parse errors
          }
        };
        evtSource.onerror = () => {
          if (evtSource) {
            evtSource.close();
            evtSource = null;
          }
          if (!isClosed) {
            setTimeout(connect, 3000);
          }
        };
      } catch (err) {
        console.warn('SSE connection warning:', err);
      }
    };

    connect();

    return () => {
      isClosed = true;
      if (evtSource) {
        evtSource.close();
        evtSource = null;
      }
    };
  },
};
