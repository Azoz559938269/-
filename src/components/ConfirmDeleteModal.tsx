import React, { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  title: string;
  itemName: string;
  warningText?: string;
  confirmButtonText?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  title,
  itemName,
  warningText = 'هل أنت متأكد من هذا الحذف؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.',
  confirmButtonText = 'تأكيد الحذف النهائي',
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-800">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-rose-950">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-800 hover:bg-rose-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center sm:text-right">
            <p className="text-xs text-stone-500 mb-1">العنصر المحدد للحذف:</p>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-sm">
              {itemName}
            </div>
            <p className="text-xs text-rose-700 mt-3 leading-relaxed">
              {warningText}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
            >
              إلغاء وتراجع
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{loading ? 'جاري الحذف...' : confirmButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
