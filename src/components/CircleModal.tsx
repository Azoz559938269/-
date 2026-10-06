import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Circle } from '../types';
import { X, Layers, Clock, BookOpen, GraduationCap, UserCheck } from 'lucide-react';

interface CircleModalProps {
  currentUser: User;
  onClose: () => void;
  onSuccess: (newCircle: Circle) => void;
}

export const CircleModal: React.FC<CircleModalProps> = ({
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<'مبتدئ' | 'متوسط' | 'متقدم' | 'خاتم'>('مبتدئ');
  const [targetJuz, setTargetJuz] = useState('جزء عم وجزء تبارك');
  const [meetingTime, setMeetingTime] = useState('بعد صلاة العصر - يومياً');

  // If Admin is creating the circle, they can choose the teacher
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(currentUser.id);
  const [selectedTeacherName, setSelectedTeacherName] = useState(currentUser.name);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser.role === 'admin') {
      api.getAdminOverview().then((res) => {
        if (res.teachers && res.teachers.length > 0) {
          setTeachers(res.teachers);
          setSelectedTeacherId(res.teachers[0].id);
          setSelectedTeacherName(res.teachers[0].name);
        }
      }).catch(console.error);
    }
  }, [currentUser.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم الحلقة');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.createCircle({
        name: name.trim(),
        teacherId: currentUser.role === 'admin' ? selectedTeacherId : currentUser.id,
        teacherName: currentUser.role === 'admin' ? selectedTeacherName : currentUser.name,
        level,
        targetJuz: targetJuz.trim(),
        meetingTime: meetingTime.trim(),
      });
      onSuccess(res.circle);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحلقة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">إنشاء حلقة تحفيظ جديدة</h3>
              <p className="text-[11px] text-emerald-200">
                {currentUser.role === 'admin' ? 'إضافة حلقة بصلاحيات المشرف العام' : 'إضافة حلقة جديدة للمعلم'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              اسم الحلقة
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حلقة الإمام الشاطبي أو حلقة الفجر"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
              required
              autoFocus
            />
          </div>

          {/* Quranic Level specified at Circle Level */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                المستوى القرآني للحلقة
              </label>
            </div>
            <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 mb-2 leading-relaxed">
              ✓ يُحدد المستوى هنا للحلقة، وسيحصل عليه أي طالب يُضاف لهذه الحلقة تلقائياً.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'مبتدئ', label: 'مبتدئ (تأسيسي)' },
                { id: 'متوسط', label: 'متوسط' },
                { id: 'متقدم', label: 'متقدم' },
                { id: 'خاتم', label: 'خاتم لكتاب الله' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                    level === lvl.id
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Assignment for Admin */}
          {currentUser.role === 'admin' ? (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                إسناد الحلقة للمعلم
              </label>
              <div className="relative">
                <select
                  value={selectedTeacherId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setSelectedTeacherId(tId);
                    const tObj = teachers.find((t) => t.id === tId);
                    if (tObj) setSelectedTeacherName(tObj.name);
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                  <option value={currentUser.id}>{currentUser.name} (المشرف العام)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-[11px] flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>معلم الحلقة: <strong className="text-stone-900">{currentUser.name}</strong></span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              المقرر أو السور المستهدفة
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetJuz}
                onChange={(e) => setTargetJuz(e.target.value)}
                placeholder="مثال: الأجزاء 25 إلى 30"
                className="w-full pr-9 pl-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <BookOpen className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              أوقات اللقاء
            </label>
            <div className="relative">
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="مثال: من الأحد إلى الخميس بعد صلاة العصر"
                className="w-full pr-9 pl-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <Clock className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-sm transition"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحلقة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
