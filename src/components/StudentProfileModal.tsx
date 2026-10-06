import React, { useState, useEffect } from 'react';
import { Student, Transaction, User } from '../types';
import { api } from '../services/api';
import {
  X,
  Award,
  MinusCircle,
  PlusCircle,
  Clock,
  Volume2,
  UserX,
  BookOpen,
  Calendar,
  UserCheck,
  Phone,
  FileText,
  Printer,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface StudentProfileModalProps {
  student: Student;
  currentUser: User;
  onClose: () => void;
  onOpenPointsAction: (student: Student, type: 'award' | 'deduct') => void;
  onStudentUpdated?: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student: initialStudent,
  currentUser,
  onClose,
  onOpenPointsAction,
}) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'notes_ledger' | 'all_tx'>('notes_ledger');
  const [filterType, setFilterType] = useState<'all' | 'deduct' | 'award'>('all');

  const loadData = async () => {
    try {
      const res = await api.getStudent(student.id);
      setStudent(res.student);
      setTransactions(res.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [student.id]);

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-l from-emerald-900 to-stone-900 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/90 border border-emerald-400/40 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{student.name}</h2>
                  <span className="text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-700/60 font-semibold flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 inline" />
                    المستوى: {student.level}
                  </span>
                </div>
                <div className="text-xs text-stone-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>الحلقة: {student.circleName}</span>
                  <span aria-hidden="true">·</span>
                  <span>المعلم: {student.teacherName}</span>
                  {student.phone && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 inline text-emerald-400" />
                        {student.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Points Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center min-w-[120px] self-start sm:self-auto">
              <div className="text-[11px] text-emerald-200 font-medium">رصيد النقاط الكلي</div>
              <div className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
                {student.points}
              </div>
              <div className="text-[10px] text-stone-300">نقطة تميز</div>
            </div>
          </div>
        </div>

        {/* Behavioral Metrics Bar */}
        <div className="px-6 py-3.5 bg-stone-100 border-b border-stone-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-stone-500 text-[11px]">مرات التأخر</div>
                <div className="font-bold text-stone-800 font-mono text-sm">{student.lateCount || 0} مرات</div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-stone-500 text-[11px]">مرات المشاغبة</div>
                <div className="font-bold text-stone-800 font-mono text-sm">{student.disruptiveCount || 0} مرات</div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                <UserX className="w-4 h-4" />
              </div>
              <div>
                <div className="text-stone-500 text-[11px]">مرات الغياب</div>
                <div className="font-bold text-stone-800 font-mono text-sm">{student.absentCount || 0} مرات</div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-stone-500 text-[11px]">المقرر الحالي</div>
                <div className="font-bold text-emerald-800 text-xs truncate max-w-[90px]">{student.currentJuz || 'عام'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="px-6 py-3 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPointsAction(student, 'deduct')}
              className="py-1.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <MinusCircle className="w-3.5 h-3.5" />
              <span>خصم نقاط (متأخر / مشاغب / غائب)</span>
            </button>
            <button
              onClick={() => onOpenPointsAction(student, 'award')}
              className="py-1.5 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>إضافة نقاط (حفظ / مراجعة / تميز)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
              title="طباعة التقرير"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة الكشف</span>
            </button>
          </div>
        </div>

        {/* Notes (if any) */}
        {student.notes && (
          <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-200/60 text-xs text-amber-900 flex items-start gap-2 shrink-0">
            <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span><strong className="font-semibold">توصية المعلم الدائمة:</strong> {student.notes}</span>
          </div>
        )}

        {/* Section Header with Tabs for Notes & Ledger */}
        <div className="px-6 pt-4 pb-2 border-b border-stone-200 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setActiveTab('notes_ledger')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'notes_ledger'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>سجل الملاحظات (ليش انخصم / ليش زاد)</span>
              </button>
              <button
                onClick={() => setActiveTab('all_tx')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'all_tx'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>كافة العمليات والأرصدة ({transactions.length})</span>
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 print:hidden text-xs self-start sm:self-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filterType === 'all' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType('deduct')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filterType === 'deduct' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-stone-600 hover:text-rose-700'
                }`}
              >
                الخصومات
              </button>
              <button
                onClick={() => setFilterType('award')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filterType === 'award' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-stone-600 hover:text-emerald-800'
                }`}
              >
                الإضافات
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-stone-500">جاري تحميل سجل الملاحظات والعمليات...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300">
              <Award className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-600 font-medium">لا توجد ملاحظات أو عمليات مسجلة حتى الآن لهذا الطالب</p>
              <p className="text-[11px] text-stone-400 mt-1">
                استخدم أزرار الإضافة أو الخصم بالأعلى لتسجيل أول عملية مع ملاحظتها
              </p>
            </div>
          ) : activeTab === 'notes_ledger' ? (
            /* TAB 1: Prominent Reason Notes Ledger (ليش انخصم وليش زاد) */
            <div className="space-y-3">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
                <span>يعرض هذا السجل كل ملاحظة كتبها المعلم موضحاً فيها سبب الخصم أو الإضافة بالثانية.</span>
                <span className="font-bold text-stone-800">{filteredTransactions.length} ملاحظة</span>
              </div>

              {filteredTransactions.map((tx) => {
                const isAward = tx.type === 'award';
                return (
                  <div
                    key={tx.id}
                    className={`p-4 rounded-2xl border transition shadow-2xs relative ${
                      isAward
                        ? 'bg-emerald-50/50 border-emerald-200/90'
                        : 'bg-rose-50/50 border-rose-200/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        {/* Type & Reason Title Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              isAward
                                ? 'bg-emerald-700 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {isAward ? 'سبب الإضافة (ليش زاد)' : 'سبب الخصم (ليش انخصم)'}
                          </span>

                          <span
                            className={`text-xs font-bold ${
                              isAward ? 'text-emerald-900' : 'text-rose-900'
                            }`}
                          >
                            {tx.categoryLabel}
                          </span>

                          <span className="text-[11px] text-stone-400 font-sans">
                            · {formatDate(tx.timestamp)}
                          </span>
                        </div>

                        {/* Teacher's note / exact reason */}
                        <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs mt-2">
                          <div className="text-[11px] font-bold text-stone-500 mb-0.5 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-stone-400" />
                            ملاحظة المعلم:
                          </div>
                          <p className="text-xs sm:text-sm text-stone-900 font-semibold leading-relaxed">
                            {tx.reason}
                          </p>
                        </div>

                        {/* Context Footer */}
                        <div className="text-[11px] text-stone-500 pt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>المعلم المنفذ: <strong className="text-stone-700">{tx.teacherName}</strong></span>
                          <span>·</span>
                          <span>الحلقة: {tx.circleName}</span>
                          <span>·</span>
                          <span>رصيد الطالب بعد العملية: <strong className="font-mono text-stone-800">{tx.pointsAfter} نقطة</strong></span>
                        </div>
                      </div>

                      {/* Points badge */}
                      <div
                        className={`text-lg sm:text-xl font-black font-mono px-3 py-1.5 rounded-xl border shrink-0 ${
                          isAward
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {isAward ? `+${tx.points}` : `-${tx.points}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TAB 2: Standard Ledger */
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => {
                const isAward = tx.type === 'award';
                return (
                  <div
                    key={tx.id}
                    className={`p-3.5 rounded-xl border transition shadow-2xs ${
                      isAward
                        ? 'bg-emerald-50/30 border-emerald-200/70'
                        : 'bg-rose-50/30 border-rose-200/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isAward ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                          }`}
                        >
                          {isAward ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-xs ${
                                isAward ? 'text-emerald-900' : 'text-rose-900'
                              }`}
                            >
                              {tx.categoryLabel || (isAward ? 'إضافة نقاط' : 'خصم نقاط')}
                            </span>
                            <span className="text-[11px] text-stone-400 font-sans">
                              {formatDate(tx.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-stone-700 mt-1 font-medium leading-relaxed">
                            {tx.reason}
                          </p>
                          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-3">
                            <span>المعلم: <strong className="text-stone-700">{tx.teacherName}</strong></span>
                            <span>·</span>
                            <span>الرصيد: <span className="font-mono">{tx.pointsBefore}</span> ← <span className="font-mono font-bold text-stone-800">{tx.pointsAfter}</span></span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-base font-black font-mono shrink-0 ${
                          isAward ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isAward ? `+${tx.points}` : `-${tx.points}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
