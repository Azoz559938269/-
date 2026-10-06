import React, { useState } from 'react';
import { Student, User } from '../types';
import { api } from '../services/api';
import { X, MinusCircle, PlusCircle, AlertTriangle, Sparkles, Check, Clock, Volume2, UserX, BookmarkCheck } from 'lucide-react';

interface PointsActionModalProps {
  student: Student;
  currentUser: User;
  initialType?: 'award' | 'deduct';
  onClose: () => void;
  onSuccess: (updatedStudent: Student) => void;
}

export const PointsActionModal: React.FC<PointsActionModalProps> = ({
  student,
  currentUser,
  initialType = 'deduct',
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<'award' | 'deduct'>(initialType);

  // Deduction state
  const [deductCategory, setDeductCategory] = useState<'late' | 'disruptive' | 'absent' | 'homework' | 'custom'>('late');
  const [customDeductCategoryLabel, setCustomDeductCategoryLabel] = useState('');
  
  // Award state
  const [awardCategory, setAwardCategory] = useState<'memorization' | 'revision' | 'etiquette' | 'early' | 'custom'>('memorization');
  const [customAwardCategoryLabel, setCustomAwardCategoryLabel] = useState('');

  // Points amount
  const [points, setPoints] = useState<number>(initialType === 'deduct' ? 5 : 10);
  
  // Reason / detail text
  const [reasonDetail, setReasonDetail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-configured deduction templates
  const deductionTemplates = [
    {
      id: 'late',
      label: 'متأخر',
      subtext: 'جاء التحفيظ متأخراً عن موعد الحلقة',
      defaultPoints: 5,
      icon: Clock,
      color: 'amber',
    },
    {
      id: 'disruptive',
      label: 'مشاغب',
      subtext: 'سلوك مشاغب، مقاطعة التسميع أو إحداث فوضى',
      defaultPoints: 10,
      icon: Volume2,
      color: 'rose',
    },
    {
      id: 'absent',
      label: 'غائب',
      subtext: 'غياب عن الحلقة دون عذر مقبول مسبقاً',
      defaultPoints: 15,
      icon: UserX,
      color: 'red',
    },
    {
      id: 'homework',
      label: 'إهمال الواجب / المصحف',
      subtext: 'عدم إحضار المصحف أو عدم التحضير المنزلي',
      defaultPoints: 5,
      icon: BookmarkCheck,
      color: 'stone',
    },
    {
      id: 'custom',
      label: 'سبب مخصص آخر',
      subtext: 'كتابة سبب مخالفة مخصص',
      defaultPoints: 5,
      icon: AlertTriangle,
      color: 'purple',
    },
  ];

  // Pre-configured award templates
  const awardTemplates = [
    {
      id: 'memorization',
      label: 'حفظ جديد متقن',
      subtext: 'تسميع المقرر بدون أخطاء وإتقان الأحكام',
      defaultPoints: 15,
      icon: Sparkles,
    },
    {
      id: 'revision',
      label: 'مراجعة متميزة',
      subtext: 'مراجعة المحفوظ السابق بسرد متقن',
      defaultPoints: 10,
      icon: BookmarkCheck,
    },
    {
      id: 'etiquette',
      label: 'حسن الأدب والتوقير',
      subtext: 'أدب رفيع في مجلس القرآن وإنصات تام',
      defaultPoints: 5,
      icon: Check,
    },
    {
      id: 'early',
      label: 'حضور مبكر',
      subtext: 'المبادرة بالحضور قبل موعد الحلقة',
      defaultPoints: 5,
      icon: Clock,
    },
    {
      id: 'custom',
      label: 'إنجاز أو تميز مخصص',
      subtext: 'إضافة نقاط تشجيعية حرة',
      defaultPoints: 10,
      icon: Sparkles,
    },
  ];

  const handleSelectDeductCategory = (catId: any, defPts: number) => {
    setDeductCategory(catId);
    setPoints(defPts);
  };

  const handleSelectAwardCategory = (catId: any, defPts: number) => {
    setAwardCategory(catId);
    setPoints(defPts);
  };

  const currentPoints = student.points;
  const simulatedPoints = type === 'award'
    ? currentPoints + (Number(points) || 0)
    : Math.max(0, currentPoints - (Number(points) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ptsNum = Number(points);
    if (!ptsNum || ptsNum <= 0) {
      setError('يرجى تحديد عدد نقاط أكبر من صفر');
      return;
    }

    let categoryStr = '';
    let categoryLabelStr = '';
    let finalReason = '';

    if (type === 'deduct') {
      const template = deductionTemplates.find((t) => t.id === deductCategory);
      categoryStr = deductCategory;
      categoryLabelStr = deductCategory === 'custom'
        ? (customDeductCategoryLabel.trim() || 'خصم سلوكي')
        : (template?.label || 'خصم');

      finalReason = reasonDetail.trim()
        ? `${categoryLabelStr}: ${reasonDetail.trim()}`
        : `${categoryLabelStr} (${template?.subtext || ''})`;
    } else {
      const template = awardTemplates.find((t) => t.id === awardCategory);
      categoryStr = awardCategory;
      categoryLabelStr = awardCategory === 'custom'
        ? (customAwardCategoryLabel.trim() || 'نقاط تشجيعية')
        : (template?.label || 'تميز');

      finalReason = reasonDetail.trim()
        ? `${categoryLabelStr}: ${reasonDetail.trim()}`
        : `${categoryLabelStr} (${template?.subtext || ''})`;
    }

    setLoading(true);
    try {
      const res = await api.performPointsAction(student.id, {
        type,
        points: ptsNum,
        category: categoryStr,
        categoryLabel: categoryLabelStr,
        reason: finalReason,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
      });

      onSuccess(res.student);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تنفيذ العملية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-lg w-full overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="font-bold text-base text-stone-900">
              إجراء نقاط على الطالب: <span className="text-emerald-700">{student.name}</span>
            </h3>
            <p className="text-xs text-stone-500">
              الحلقة: {student.circleName} · الرصيد الحالي: {student.points} نقطة
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Toggle */}
        <div className="p-6">
          <div className="flex rounded-xl bg-stone-100 p-1 mb-5 border border-stone-200">
            <button
              type="button"
              onClick={() => {
                setType('deduct');
                setPoints(5);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                type === 'deduct'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              خصم نقاط (مخالفة أو تأخر)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('award');
                setPoints(10);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                type === 'award'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              إضافة نقاط (إنجاز وتميز)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'deduct' ? (
              /* DEDUCT FLOW */
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  أولاً: اختر وش على الطالب (سبب الخصم)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {deductionTemplates.map((item) => {
                    const isSelected = deductCategory === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectDeductCategory(item.id, item.defaultPoints)}
                        className={`text-right p-2.5 rounded-xl border text-xs font-medium transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/80 text-rose-950 ring-1 ring-rose-500'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-rose-200 text-rose-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1">
                            {item.label}
                            {isSelected && <span className="text-[10px] text-rose-600">✓ محدد</span>}
                          </div>
                          <div className="text-[10px] text-stone-500 leading-tight mt-0.5">
                            {item.subtext}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {deductCategory === 'custom' && (
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="اكتب سبب المخالفة هنا..."
                      value={customDeductCategoryLabel}
                      onChange={(e) => setCustomDeductCategoryLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                )}
              </div>
            ) : (
              /* AWARD FLOW */
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  اختر نوع الإنجاز أو التميز
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {awardTemplates.map((item) => {
                    const isSelected = awardCategory === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectAwardCategory(item.id, item.defaultPoints)}
                        className={`text-right p-2.5 rounded-xl border text-xs font-medium transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1">
                            {item.label}
                            {isSelected && <span className="text-[10px] text-emerald-700">✓ محدد</span>}
                          </div>
                          <div className="text-[10px] text-stone-500 leading-tight mt-0.5">
                            {item.subtext}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {awardCategory === 'custom' && (
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="اكتب اسم الإنجاز المخصص..."
                      value={customAwardCategoryLabel}
                      onChange={(e) => setCustomAwardCategoryLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Points Stepper / Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800">
                  {type === 'deduct' ? 'ثانياً: حدد كم نقطة تخصم من الطالب' : 'حدد كم نقطة تضيف للطالب'}
                </label>
                <span className="text-[11px] text-stone-500">
                  يمكنك الاختيار السريع أو كتابة الرقم
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={points}
                  onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-center text-lg font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  required
                />

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[5, 10, 15, 20].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPoints(val)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        points === val
                          ? 'bg-stone-800 text-white border-stone-800'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {type === 'deduct' ? `-${val}` : `+${val}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Details/Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                تفاصيل إضافية للسبب (ستُحفظ في بروفايل وسجل الطالب)
              </label>
              <textarea
                rows={2}
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder={
                  type === 'deduct'
                    ? 'مثال: تأخر 20 دقيقة عن موعد الحلقة / مقاطعة زميله أثناء تسميع سورة النبأ'
                    : 'مثال: سرد الجزء الثلاثين دون أي توقف وبأحكام مدود متقنة'
                }
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none focus:ring-2 focus:ring-emerald-600 transition resize-none"
              />
            </div>

            {/* Live Balance Impact Preview */}
            <div className="p-3 bg-stone-100/90 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">أثر العملية على رصيد الطالب:</span>
              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="text-stone-700">{currentPoints} نقطة</span>
                <span className="text-stone-400">←</span>
                <span className={type === 'award' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  {simulatedPoints} نقطة
                </span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-sans ${
                    type === 'award' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  ({type === 'award' ? `+${points}` : `-${points}`})
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
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
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 ${
                  type === 'deduct'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {loading ? 'جاري التنفيذ...' : type === 'deduct' ? 'تأكيد خصم النقاط' : 'تأكيد إضافة النقاط'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
