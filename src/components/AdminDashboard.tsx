import React, { useState, useEffect } from 'react';
import { User, Circle, Student, Transaction, AdminOverview } from '../types';
import { api } from '../services/api';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  ShieldCheck,
  RotateCcw,
  Users,
  Layers,
  Award,
  Radio,
  Clock,
  Volume2,
  UserX,
  Search,
  BookOpen,
  Filter,
  ArrowUpRight,
  MinusCircle,
  PlusCircle,
  Sparkles,
  Trophy,
  History,
  AlertCircle,
  Plus,
  Trash2,
  GraduationCap
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onOpenProfile: (student: Student) => void;
  onOpenPointsAction: (student: Student, type: 'award' | 'deduct') => void;
  onOpenResetConfirm: (totalStudents: number, totalPoints: number) => void;
  onOpenNewCircle: () => void;
  refreshTrigger: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenProfile,
  onOpenPointsAction,
  onOpenResetConfirm,
  onOpenNewCircle,
  refreshTrigger,
}) => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [allCircles, setAllCircles] = useState<Circle[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedCircleId, setSelectedCircleId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'circles' | 'live' | 'leaderboard' | 'resets'>('circles');
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'student' | 'circle'; id: string; name: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, circlesData, studentsData] = await Promise.all([
        api.getAdminOverview(),
        api.getCircles(),
        api.getStudents(),
      ]);
      setOverview(overviewData);
      setAllCircles(circlesData.circles);
      setAllStudents(studentsData.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'student') {
        await api.deleteStudent(itemToDelete.id);
      } else {
        await api.deleteCircle(itemToDelete.id);
      }
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setItemToDelete(null);
    }
  };

  const filteredCircles = allCircles.filter((c) => {
    if (selectedTeacherId !== 'all' && c.teacherId !== selectedTeacherId) return false;
    return true;
  });

  const filteredStudents = allStudents.filter((s) => {
    if (selectedTeacherId !== 'all' && s.teacherId !== selectedTeacherId) return false;
    if (selectedCircleId !== 'all' && s.circleId !== selectedCircleId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.circleName.toLowerCase().includes(q) ||
        s.teacherName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Command Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>لوحة الإشراف العام المركزية · الحساب: Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              إدارة الحلقات القرآنية الشاملة
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              اطلاع مباشر على كل المعلمين والحلقات والطلاب مع متابعة العمليات بالثانية والقدرة على التحكم الكامل وتصفير النقاط الشامل.
            </p>
          </div>

          {/* Master Reset Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                if (overview) {
                  onOpenResetConfirm(overview.totalStudents, overview.totalPointsInSystem);
                }
              }}
              className="py-3 px-5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border border-rose-500 hover:scale-[1.01] active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4 text-white shrink-0" />
              <span>تصفير نقاط كافة الحلقات (ريستارت)</span>
            </button>
          </div>
        </div>

        {/* Global Key Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-stone-800 text-xs">
          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
            <div className="text-stone-400 text-[11px] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              إجمالي الطلاب
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {overview?.totalStudents || 0}
            </div>
          </div>

          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
            <div className="text-stone-400 text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              الحلقات النشطة
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {overview?.totalCircles || 0}
            </div>
          </div>

          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
            <div className="text-stone-400 text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              المعلمون المسجلون
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {overview?.totalTeachers || 0}
            </div>
          </div>

          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
            <div className="text-stone-400 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              النقاط الحالية بالنظام
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
              {overview?.totalPointsInSystem || 0}
            </div>
          </div>

          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60 col-span-2 sm:col-span-1">
            <div className="text-stone-400 text-[11px] flex items-center gap-1.5">
              <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
              المخالفات المسجلة
            </div>
            <div className="text-xs text-stone-300 font-mono mt-1 space-y-0.5">
              <div>تأخر: <span className="text-amber-400 font-bold">{overview?.lateDeductionsCount || 0}</span></div>
              <div>مشاغبة: <span className="text-rose-400 font-bold">{overview?.disruptiveDeductionsCount || 0}</span></div>
              <div>غياب: <span className="text-red-400 font-bold">{overview?.absentDeductionsCount || 0}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-stone-200 shadow-2xs gap-1">
        <button
          onClick={() => setActiveTab('circles')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'circles'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>كافة الحلقات والطلاب</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'live'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>البث اللحظي للعمليات</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-mono hidden sm:inline">
            مباشر بالثانية
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>لوحة شرف الأوائل</span>
        </button>

        <button
          onClick={() => setActiveTab('resets')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'resets'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <History className="w-4 h-4 text-stone-500" />
          <span>سجل التصفير</span>
        </button>
      </div>

      {/* TAB 1: CIRCLES & STUDENTS DIRECTORY */}
      {activeTab === 'circles' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-stone-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                تصفية:
              </span>

              {/* Teacher filter */}
              <select
                value={selectedTeacherId}
                onChange={(e) => {
                  setSelectedTeacherId(e.target.value);
                  setSelectedCircleId('all');
                }}
                className="py-1.5 px-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">جميع المعلمين ({overview?.teachers?.length || 0})</option>
                {overview?.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (@{t.username})
                  </option>
                ))}
              </select>

              {/* Circle filter */}
              <select
                value={selectedCircleId}
                onChange={(e) => setSelectedCircleId(e.target.value)}
                className="py-1.5 px-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">جميع الحلقات ({filteredCircles.length})</option>
                {filteredCircles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="ابحث عن طالب أو حلقة أو معلم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Circles summary header with Add Circle button */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-stone-900">
                الحلقات القرآنية ({filteredCircles.length} حلقة)
              </h3>
              <span className="text-xs text-stone-500">
                (يحدد المستوى القرآني لكل حلقة ويطبّق على طلابها تلقائياً)
              </span>
            </div>

            <button
              onClick={onOpenNewCircle}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حلقة جديدة</span>
            </button>
          </div>

          {/* Circles summary chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCircles.map((circle) => {
              const studentsCount = allStudents.filter((s) => s.circleId === circle.id).length;
              const circlePoints = allStudents
                .filter((s) => s.circleId === circle.id)
                .reduce((sum, s) => sum + s.points, 0);

              return (
                <div
                  key={circle.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-600/40 transition relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-stone-900">{circle.name}</h3>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md border border-emerald-200/80">
                          {circle.level || 'مبتدئ'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        المعلم: <strong className="text-stone-800">{circle.teacherName}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                        {circlePoints} نقطة
                      </span>
                      <button
                        onClick={() => setItemToDelete({ type: 'circle', id: circle.id, name: circle.name })}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="حذف الحلقة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-2 flex items-center justify-between border-t border-stone-100 pt-2">
                    <span>المقرر: {circle.targetJuz}</span>
                    <span className="font-medium text-stone-700">{studentsCount} طالب</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Students Master Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-stone-900">
                قائمة جميع الطلاب في الحلقات ({filteredStudents.length} طالب)
              </h3>
              <span className="text-xs text-stone-500">
                انقر على اسم الطالب لعرض ملفه وسجل عملياته
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">الطالب</th>
                    <th className="py-3 px-4">الحلقة</th>
                    <th className="py-3 px-4">المعلم المسند</th>
                    <th className="py-3 px-4 text-center">المخالفات (تأخر/شغب/غياب)</th>
                    <th className="py-3 px-4 text-center">النقاط الحالية</th>
                    <th className="py-3 px-4 text-left">إجراءات الإدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        لا يوجد طلاب مطابقين للبحث أو التصفية الحالية
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-stone-50 transition">
                        <td className="py-3 px-4 font-bold text-stone-900">
                          <button
                            onClick={() => onOpenProfile(student)}
                            className="hover:text-emerald-700 hover:underline transition text-right"
                          >
                            {student.name}
                          </button>
                          <div className="text-[10px] text-stone-400 font-normal">
                            {student.level} · {student.currentJuz}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-700 font-medium">
                          {student.circleName}
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {student.teacherName}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className="text-amber-700">{student.lateCount || 0}</span> /{' '}
                          <span className="text-rose-700">{student.disruptiveCount || 0}</span> /{' '}
                          <span className="text-red-700">{student.absentCount || 0}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono text-base font-black text-emerald-800">
                            {student.points}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenPointsAction(student, 'deduct')}
                              className="py-1 px-2 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                              title="خصم نقاط"
                            >
                              خصم
                            </button>
                            <button
                              onClick={() => onOpenPointsAction(student, 'award')}
                              className="py-1 px-2 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                              title="إضافة نقاط"
                            >
                              إضافة
                            </button>
                            <button
                              onClick={() => onOpenProfile(student)}
                              className="py-1 px-2.5 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                            >
                              البروفايل
                            </button>
                            <button
                              onClick={() => setItemToDelete({ type: 'student', id: student.id, name: student.name })}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="حذف الطالب من الحلقة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REAL-TIME LIVE STREAM */}
      {activeTab === 'live' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-extrabold text-sm text-stone-900">
                شريط العمليات اللحظي عبر جميع الحلقات (مباشر بالثانية)
              </h3>
            </div>
            <span className="text-xs text-stone-500">
              يتم تحديث كل خصم أو إضافة تجري في أي حلقة تلقائياً
            </span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {overview?.recentTransactions && overview.recentTransactions.length > 0 ? (
              overview.recentTransactions.map((tx) => {
                const isAward = tx.type === 'award';
                return (
                  <div key={tx.id} className="p-4 hover:bg-stone-50 transition flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isAward ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isAward ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-stone-900">
                            {tx.studentName}
                          </span>
                          <span className="text-xs text-stone-400">·</span>
                          <span className="text-xs font-semibold text-stone-600">
                            {tx.circleName}
                          </span>
                          <span className="text-xs text-stone-400">·</span>
                          <span className="text-xs text-stone-500">
                            المعلم: {tx.teacherName}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 mt-1 font-medium">
                          {tx.reason}
                        </p>
                        <div className="text-[11px] text-stone-400 font-mono mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {formatTime(tx.timestamp)} ({formatDate(tx.timestamp)})
                          </span>
                          <span>·</span>
                          <span>الرصيد: {tx.pointsBefore} ← <strong>{tx.pointsAfter}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-lg font-black font-mono shrink-0 ${
                        isAward ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isAward ? `+${tx.points}` : `-${tx.points}`}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-xs text-stone-400">
                لا توجد عمليات مسجلة حتى الآن
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-extrabold text-base text-stone-900">
                  لوحة الشرف لأوائل الطلاب على مستوى المجمع القرآني
                </h3>
                <p className="text-xs text-stone-600">
                  الطلاب الأعلى جمعاً للنقاط عبر جميع الحلقات
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {overview?.topStudents && overview.topStudents.length > 0 ? (
              overview.topStudents.map((std, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={std.id}
                    className="p-4 hover:bg-stone-50 transition flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-sm'
                            : rank === 2
                            ? 'bg-stone-300 text-stone-800'
                            : rank === 3
                            ? 'bg-amber-700/80 text-amber-100'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {rank}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenProfile(std)}
                          className="font-extrabold text-sm text-stone-900 hover:text-emerald-700 transition text-right"
                        >
                          {std.name}
                        </button>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {std.circleName} · المعلم: {std.teacherName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left font-mono">
                        <div className="text-lg font-black text-emerald-800">{std.points}</div>
                        <div className="text-[10px] text-stone-400">نقطة تميز</div>
                      </div>
                      <button
                        onClick={() => onOpenProfile(std)}
                        className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition"
                      >
                        البروفايل
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-xs text-stone-400">
                لا توجد بيانات طلاب حالياً
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RESETS AUDIT TRAIL */}
      {activeTab === 'resets' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <History className="w-4 h-4 text-stone-600" />
              <span>سجل عمليات تصفير النقاط الشاملة (Audit Trail)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              توثيق لجميع عمليات التصفير التي قام بها المشرف العام
            </p>
          </div>

          <div className="divide-y divide-stone-100">
            {overview?.resetLogs && overview.resetLogs.length > 0 ? (
              overview.resetLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-stone-50 transition flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-stone-900">
                      تصفير شامل للنقاط بواسطة: <span className="text-emerald-700">{log.adminName}</span>
                    </div>
                    <div className="text-stone-500 text-[11px] mt-0.5">
                      التاريخ: {formatDate(log.timestamp)} - {formatTime(log.timestamp)}
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="text-rose-700 font-bold">
                      تم تصفير {log.totalPointsReset} نقطة
                    </div>
                    <div className="text-stone-400 text-[11px]">
                      شمل {log.affectedStudentsCount} طالباً
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-stone-400 text-xs">
                لم يتم تنفيذ أي عملية تصفير شامل حتى الآن
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {itemToDelete && (
        <ConfirmDeleteModal
          title={itemToDelete.type === 'student' ? 'تأكيد حذف الطالب نهائياً' : 'تأكيد حذف الحلقة القرآنية'}
          itemName={itemToDelete.name}
          warningText={
            itemToDelete.type === 'student'
              ? 'هل أنت متأكد من حذف هذا الطالب بصلاحيات الإدارة؟ سيتم مسح كافة سجلات عملياته ونقاطه.'
              : 'هل أنت متأكد من حذف هذه الحلقة؟ سيتم مسح الحلقة وكافة الطلاب المقيدين بها.'
          }
          confirmButtonText={itemToDelete.type === 'student' ? 'حذف الطالب الآن' : 'حذف الحلقة الآن'}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};
