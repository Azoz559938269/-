import React, { useState } from 'react';
import { api } from '../services/api';
import { AlertOctagon, X, RotateCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  adminName: string;
  totalStudents: number;
  totalPoints: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  adminName,
  totalStudents,
  totalPoints,
  onClose,
  onSuccess,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText.trim() === 'تصفير';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      setError('يرجى كتابة كلمة "تصفير" في الحقل لتأكيد العملية الحساسة');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.resetAllPoints(adminName);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'فشل تنفيذ عملية التصفير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-800">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-rose-950">تصفير شامل لجميع نقاط الطلاب</h3>
              <p className="text-[11px] text-rose-700">خاص بصلاحيات المشرف العام (Admin)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-800 hover:bg-rose-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReset} className="p-6 space-y-4">
          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2 leading-relaxed">
            <p className="font-bold">
              تنبيه مهم: هذا الإجراء سيقوم بما يلي:
            </p>
            <ul className="list-disc list-inside space-y-1 text-rose-800 text-[11px]">
              <li>إعادة تعيين رصيد كافة الطلاب في جميع الحلقات إلى <strong className="font-bold">0 نقطة</strong>.</li>
              <li>يشمل العملية حالياً <strong className="font-bold">{totalStudents} طالب</strong> بمجموع نقاط <strong className="font-bold">{totalPoints} نقطة</strong>.</li>
              <li>سيتم تسجيل حدث التصفير في السجل العام الشامل باسم المشرف: <strong className="font-bold">{adminName}</strong>.</li>
              <li>تحديث الحسابات أونلاين بالثانية لجميع شاشات المعلمين فوراً.</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              لتأكيد العملية، يرجى كتابة كلمة <span className="text-rose-600 font-mono">"تصفير"</span> في الحقل أدناه:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="اكتب: تصفير"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-rose-500 transition"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-100 rounded-lg text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
            >
              إلغاء وتراجع
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || loading}
              className="px-5 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {loading ? 'جاري تصفير النقاط...' : 'تأكيد التصفير الشامل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
