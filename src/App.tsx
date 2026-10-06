import React, { useState, useEffect, useCallback } from 'react';
import { User, Circle, Student } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentProfileModal } from './components/StudentProfileModal';
import { PointsActionModal } from './components/PointsActionModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { CircleModal } from './components/CircleModal';
import { StudentModal } from './components/StudentModal';
import { Bell, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('itqan_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals state
  const [activeProfileStudent, setActiveProfileStudent] = useState<Student | null>(null);
  const [activePointsStudent, setActivePointsStudent] = useState<{ student: Student; type: 'award' | 'deduct' } | null>(null);
  const [resetModalData, setResetModalData] = useState<{ totalStudents: number; totalPoints: number } | null>(null);
  const [showNewCircleModal, setShowNewCircleModal] = useState(false);
  const [studentModalData, setStudentModalData] = useState<{ circle: Circle; editingStudent?: Student | null } | null>(null);

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Save user session
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('itqan_user', JSON.stringify(user));
    } catch {
      // Ignore local storage error
    }
    addToast(`مرحباً بك يا ${user.name}`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('itqan_user');
    } catch {
      // Ignore
    }
  };

  // Subscribe to real-time events via SSE
  useEffect(() => {
    const unsubscribe = api.subscribeToLiveEvents((event) => {
      if (event.type === 'CONNECTED') {
        setIsLiveConnected(true);
      } else if (event.type === 'TRANSACTION_CREATED') {
        const tx = event.data?.transaction;
        if (tx) {
          const ptsText = tx.type === 'award' ? `+${tx.points}` : `-${tx.points}`;
          addToast(
            `عملية جديدة (${ptsText} نقطة): ${tx.studentName} · السبب: ${tx.categoryLabel}`,
            tx.type === 'award' ? 'success' : 'warning'
          );
        }
        setRefreshTrigger((prev) => prev + 1);
      } else if (event.type === 'POINTS_RESET') {
        addToast('تم تصفير جميع نقاط الطلاب في كافة الحلقات بواسطة الإدارة', 'warning');
        setRefreshTrigger((prev) => prev + 1);
      } else if (event.type === 'CIRCLE_CREATED' || event.type === 'STUDENT_ADDED' || event.type === 'STUDENT_DELETED') {
        setRefreshTrigger((prev) => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addToast]);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        isLive={isLiveConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!currentUser ? (
          <AuthScreen onSuccess={handleAuthSuccess} />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard
            currentUser={currentUser}
            onOpenProfile={(student) => setActiveProfileStudent(student)}
            onOpenPointsAction={(student, type) => setActivePointsStudent({ student, type })}
            onOpenResetConfirm={(totalStudents, totalPoints) => setResetModalData({ totalStudents, totalPoints })}
            onOpenNewCircle={() => setShowNewCircleModal(true)}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <TeacherDashboard
            currentUser={currentUser}
            onOpenProfile={(student) => setActiveProfileStudent(student)}
            onOpenPointsAction={(student, type) => setActivePointsStudent({ student, type })}
            onOpenNewCircle={() => setShowNewCircleModal(true)}
            onOpenNewStudent={(circle) => setStudentModalData({ circle, editingStudent: null })}
            onEditStudent={(student, circle) => setStudentModalData({ circle, editingStudent: student })}
            refreshTrigger={refreshTrigger}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام إتقان لحلقات تحفيظ القرآن الكريم © {new Date().getFullYear()}</span>
          <span className="text-stone-400">نظام احتساب النقاط وتتبع السلوك الميداني بالثانية</span>
        </div>
      </footer>

      {/* TOASTS CONTAINER */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg text-xs font-medium flex items-start gap-2.5 transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-800'
                : 'bg-stone-900 text-stone-100 border-stone-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Bell className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {/* 1. Student Profile Modal */}
      {activeProfileStudent && currentUser && (
        <StudentProfileModal
          student={activeProfileStudent}
          currentUser={currentUser}
          onClose={() => setActiveProfileStudent(null)}
          onOpenPointsAction={(student, type) => {
            setActivePointsStudent({ student, type });
          }}
          onStudentUpdated={(updated) => {
            setActiveProfileStudent(updated);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      {/* 2. Points Action Modal (Award or Deduct with specific reasons first) */}
      {activePointsStudent && currentUser && (
        <PointsActionModal
          student={activePointsStudent.student}
          currentUser={currentUser}
          initialType={activePointsStudent.type}
          onClose={() => setActivePointsStudent(null)}
          onSuccess={(updatedStudent) => {
            setActivePointsStudent(null);
            if (activeProfileStudent?.id === updatedStudent.id) {
              setActiveProfileStudent(updatedStudent);
            }
            setRefreshTrigger((prev) => prev + 1);
            addToast(`تم تحديث نقاط الطالب ${updatedStudent.name} بنجاح`, 'success');
          }}
        />
      )}

      {/* 3. Admin Reset Confirmation Modal */}
      {resetModalData && currentUser && currentUser.role === 'admin' && (
        <ResetConfirmModal
          adminName={currentUser.name}
          totalStudents={resetModalData.totalStudents}
          totalPoints={resetModalData.totalPoints}
          onClose={() => setResetModalData(null)}
          onSuccess={() => {
            setResetModalData(null);
            setRefreshTrigger((prev) => prev + 1);
            addToast('تم تصفير جميع نقاط الطلاب بنجاح', 'success');
          }}
        />
      )}

      {/* 4. Circle Creation Modal */}
      {showNewCircleModal && currentUser && (
        <CircleModal
          currentUser={currentUser}
          onClose={() => setShowNewCircleModal(false)}
          onSuccess={() => {
            setShowNewCircleModal(false);
            setRefreshTrigger((prev) => prev + 1);
            addToast('تم إنشاء الحلقة بنجاح', 'success');
          }}
        />
      )}

      {/* 5. Student Add/Edit Modal */}
      {studentModalData && currentUser && (
        <StudentModal
          circle={studentModalData.circle}
          currentUser={currentUser}
          editingStudent={studentModalData.editingStudent}
          onClose={() => setStudentModalData(null)}
          onSuccess={() => {
            setStudentModalData(null);
            setRefreshTrigger((prev) => prev + 1);
            addToast('تم حفظ بيانات الطالب بنجاح', 'success');
          }}
        />
      )}
    </div>
  );
}
