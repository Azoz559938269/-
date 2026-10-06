import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { BookOpen, UserCheck, Lock, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(loginUsername.trim(), loginPassword.trim());
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. تحقق من البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(regName.trim(), regUsername.trim(), regPassword.trim());
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Emblem */}
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-emerald-100 flex items-center justify-center shadow-lg border border-emerald-600/30">
            <BookOpen className="w-9 h-9" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          نِظَام إِتْـقَـان القُرْآنِي
        </h2>
        <p className="mt-1 text-center text-sm text-stone-600">
          منظومة إدارة حلقات التحفيظ، احتساب النقاط، ومتابعة سلوك الطلاب
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-stone-200 rounded-2xl sm:px-10">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-stone-100 p-1 mb-6 border border-stone-200">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === 'login'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === 'register'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              إنشاء حساب معلم جديد
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Admin أو اسم مستخدم المعلم"
                    className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                    required
                  />
                  <UserIcon className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'جاري التحقق...' : 'دخول للنظام'}
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Register Form for Teachers */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الاسم الكامل للمعلم
                </label>
                <p className="text-[11px] text-stone-500 mb-1.5">
                  هذا الاسم سيظهر للإدارة في لوحة التحكم المركزية وبجانب حلقاته
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: الشيخ عبد الرحمن السديس"
                    className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                    required
                  />
                  <UserCheck className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  اسم المستخدم للدخول
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="مثال: teacher_ahmed"
                    className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                    required
                  />
                  <UserIcon className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="اختر كلمة مرور آمنة"
                    className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
                ✓ سيتم حفظ هذا الحساب في قاعدة البيانات دائماً لتسجيل الدخول به في أي وقت لاحقاً.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب المعلم والدخول'}
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
