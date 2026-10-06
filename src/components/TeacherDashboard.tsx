import React, { useState, useEffect } from 'react';
import { User, Circle, Student } from '../types';
import { api } from '../services/api';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  Layers,
  Plus,
  Users,
  Award,
  Search,
  MinusCircle,
  PlusCircle,
  UserCheck,
  ChevronLeft,
  Trash2,
  Edit,
  Clock,
  Volume2,
  UserX,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: User;
  onOpenProfile: (student: Student) => void;
  onOpenPointsAction: (student: Student, type: 'award' | 'deduct') => void;
  onOpenNewCircle: () => void;
  onOpenNewStudent: (circle: Circle) => void;
  onEditStudent: (student: Student, circle: Circle) => void;
  refreshTrigger: number;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onOpenProfile,
  onOpenPointsAction,
  onOpenNewCircle,
  onOpenNewStudent,
  onEditStudent,
  refreshTrigger,
}) => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'student' | 'circle'; id: string; name: string } | null>(null);

  // Load teacher's circles
  const loadCircles = async () => {
    try {
      setLoading(true);
      const res = await api.getCircles(currentUser.id);
      setCircles(res.circles);
      if (res.circles.length > 0) {
        // If current selected is still valid keep it, otherwise select first
        setSelectedCircle((prev) => {
          if (prev) {
            const found = res.circles.find((c) => c.id === prev.id);
            return found || res.circles[0];
          }
          return res.circles[0];
        });
      } else {
        setSelectedCircle(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load students for selected circle
  const loadStudents = async (circleId: string) => {
    try {
      const res = await api.getStudents({ circleId });
      setStudents(res.students);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCircles();
  }, [currentUser.id, refreshTrigger]);

  useEffect(() => {
    if (selectedCircle) {
      loadStudents(selectedCircle.id);
    } else {
      setStudents([]);
    }
  }, [selectedCircle?.id, refreshTrigger]);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'student') {
        await api.deleteStudent(itemToDelete.id);
        if (selectedCircle) loadStudents(selectedCircle.id);
      } else {
        await api.deleteCircle(itemToDelete.id);
        await loadCircles();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemToDelete(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.currentJuz && s.currentJuz.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalStudentsCount = circles.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalCirclePoints = students.reduce((sum, s) => sum + s.points, 0);

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>لوحة المعلم الخاصة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              أهلاً وسهلاً بك، {currentUser.name}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» · هنا يمكنك إدارة حلقاتك، متابعة حضور وسلوك طلابك، واحتساب النقاط بالثانية.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[95px]">
              <div className="text-[11px] text-emerald-200">إجمالي الطلاب</div>
              <div className="text-2xl font-black font-mono">{totalStudentsCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[95px]">
              <div className="text-[11px] text-emerald-200">نقاط الحلقة</div>
              <div className="text-2xl font-black font-mono text-emerald-300">{totalCirclePoints}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Circles Navigation & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-stone-500 shrink-0">حلقاتي:</span>
          {circles.length === 0 ? (
            <span className="text-xs text-stone-400">لا توجد حلقات حالياً</span>
          ) : (
            circles.map((circle) => {
              const isSelected = selectedCircle?.id === circle.id;
              return (
                <button
                  key={circle.id}
                  onClick={() => setSelectedCircle(circle)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{circle.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {circle.studentCount || 0}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Create Circle button */}
        <button
          onClick={onOpenNewCircle}
          className="self-start sm:self-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء حلقة جديدة</span>
        </button>
      </div>

      {/* Active Circle Panel */}
      {selectedCircle ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          {/* Circle Details Subheader */}
          <div className="p-5 border-b border-stone-200 bg-stone-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-900">{selectedCircle.name}</h2>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  {students.length} طالب مسجل
                </span>
              </div>
              <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                  المقرر: {selectedCircle.targetJuz}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  الموعد: {selectedCircle.meetingTime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenNewStudent(selectedCircle)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طالب للحلقة</span>
              </button>

              <button
                onClick={() => setItemToDelete({ type: 'circle', id: selectedCircle.id, name: selectedCircle.name })}
                title="حذف هذه الحلقة"
                className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar inside circle */}
          <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="ابحث باسم الطالب أو السورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-900 outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>

            <div className="text-xs text-stone-500">
              إجمالي نقاط طلاب الحلقة: <strong className="font-mono text-emerald-800 text-sm font-bold">{totalCirclePoints}</strong>
            </div>
          </div>

          {/* Students List */}
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-700 text-sm">لا يوجد طلاب في هذه الحلقة بعد</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                قم بالضغط على زر "إضافة طالب للحلقة" لإدراج طلابك والبدء باحتساب النقاط وتسجيل الحضور والمخالفات
              </p>
              <button
                onClick={() => onOpenNewStudent(selectedCircle)}
                className="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أول طالب</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              <div className="min-w-[680px]">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 hover:bg-stone-50/80 transition flex items-center justify-between gap-4"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenProfile(student)}
                          className="font-bold text-sm text-stone-900 hover:text-emerald-700 transition text-right block"
                        >
                          {student.name}
                        </button>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-700 font-medium">{student.level}</span>
                          <span>·</span>
                          <span>{student.currentJuz || 'عام'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Behavior stats */}
                    <div className="flex items-center gap-3 text-xs text-stone-600">
                      <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md" title="مرات التأخر">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono text-[11px]">تأخر: {student.lateCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md" title="مرات المشاغبة">
                        <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                        <span className="font-mono text-[11px]">مشاغبة: {student.disruptiveCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md" title="مرات الغياب">
                        <UserX className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-mono text-[11px]">غياب: {student.absentCount || 0}</span>
                      </div>
                    </div>

                    {/* Points Total */}
                    <div className="text-center px-3 min-w-[80px]">
                      <div className="font-mono text-lg font-black text-emerald-700">
                        {student.points}
                      </div>
                      <div className="text-[10px] text-stone-400">نقطة</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Deduct button */}
                      <button
                        onClick={() => onOpenPointsAction(student, 'deduct')}
                        className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="خصم نقاط مع تحديد السبب (متأخر / مشاغب / غائب)"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>خصم</span>
                      </button>

                      {/* Award button */}
                      <button
                        onClick={() => onOpenPointsAction(student, 'award')}
                        className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="إضافة نقاط تشجيعية أو إتقان"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>إضافة</span>
                      </button>

                      {/* Profile button */}
                      <button
                        onClick={() => onOpenProfile(student)}
                        className="py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition"
                        title="عرض بروفايل وسجل عمليات الطالب"
                      >
                        البروفايل
                      </button>

                      {/* Edit student */}
                      <button
                        onClick={() => onEditStudent(student, selectedCircle)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                        title="تعديل بيانات الطالب"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete student */}
                      <button
                        onClick={() => setItemToDelete({ type: 'student', id: student.id, name: student.name })}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="حذف الطالب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-700 text-base">لم تنشئ أي حلقة بعد</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            ابدأ بإنشاء أول حلقة تحفيظ خاصة بك لإضافة طلابك والبدء باحتساب النقاط
          </p>
          <button
            onClick={onOpenNewCircle}
            className="mt-4 px-5 py-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء أول حلقة تحفيظ</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {itemToDelete && (
        <ConfirmDeleteModal
          title={itemToDelete.type === 'student' ? 'تأكيد حذف الطالب من الحلقة' : 'تأكيد حذف الحلقة القرآنية'}
          itemName={itemToDelete.name}
          warningText={
            itemToDelete.type === 'student'
              ? 'هل أنت متأكد من حذف هذا الطالب نهائياً من الحلقة؟ سيتم مسح كافة سجلات عملياته ونقاطه.'
              : 'هل أنت متأكد من حذف هذه الحلقة؟ سيتم مسح الحلقة وجميع الطلاب المقيدين بها.'
          }
          confirmButtonText={itemToDelete.type === 'student' ? 'حذف الطالب الآن' : 'حذف الحلقة الآن'}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};
