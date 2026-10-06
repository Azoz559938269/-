import React, { useState } from 'react';
import { api } from '../services/api';
import { Student, Circle, User } from '../types';
import { X, UserPlus, Phone, BookOpen, Layers } from 'lucide-react';

interface StudentModalProps {
  circle: Circle;
  currentUser: User;
  editingStudent?: Student | null;
  onClose: () => void;
  onSuccess: (student: Student) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  circle,
  currentUser,
  editingStudent,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(editingStudent?.name || '');
  const [phone, setPhone] = useState(editingStudent?.phone || '');
  const [currentJuz, setCurrentJuz] = useState(editingStudent?.currentJuz || 'سورة الفاتحة وجزء عم');
  const [level, setLevel] = useState(editingStudent?.level || 'مبتدئ');
  const [notes, setNotes] = useState(editingStudent?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentLevel = editingStudent?.level || circle.level || 'مبتدئ';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الطالب');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingStudent) {
        const res = await api.updateStudent(editingStudent.id, {
          name: name.trim(),
          phone: phone.trim(),
          currentJuz: currentJuz.trim(),
          level: studentLevel,
          notes: notes.trim(),
        });
        onSuccess(res.student);
      } else {
        const res = await api.addStudent({
          name: name.trim(),
          circleId: circle.id,
          phone: phone.trim(),
          currentJuz: currentJuz.trim(),
          level: studentLevel,
          notes: notes.trim(),
          teacherId: currentUser.id,
          teacherName: currentUser.name,
        });
        onSuccess(res.student);
      }
    } catch (err: any) {
      setError(err.message || 'فشلت العملية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">
                {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد للحلقة'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                الحلقة: {circle.name}
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
              اسم الطالب الثلاثي أو الرباعي
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: عبد الله بن محمد العتيبي"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                رقم هاتف ولي الأمر
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full pr-8 pl-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-emerald-600 outline-none font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                المستوى القرآني
              </label>
              <div className="py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between">
                <span>{editingStudent ? (editingStudent.level || circle.level || 'مبتدئ') : (circle.level || 'مبتدئ')}</span>
                <span className="text-[10px] text-emerald-700 font-normal">(محدد تلقائياً من الحلقة)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              المقرر أو السورة الحالية
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentJuz}
                onChange={(e) => setCurrentJuz(e.target.value)}
                placeholder="مثال: سورة الكهف أو جزء تبارك"
                className="w-full pr-8 pl-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <BookOpen className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              ملاحظات أو توصيات
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يحرص على أحكام النون الساكنة / يحتاج عناية بالتسميع المنزلي"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
            />
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
              {loading ? 'جاري الحفظ...' : editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
