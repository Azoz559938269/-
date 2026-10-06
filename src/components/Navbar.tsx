import React from 'react';
import { User } from '../types';
import { BookOpen, ShieldCheck, UserCheck, LogOut, Radio } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  isLive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isLive }) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-emerald-200 shadow-inner">
            <BookOpen className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-emerald-400 tracking-wide">إِتْـقَـان</span>
              <span className="text-stone-400 text-xs font-normal hidden sm:inline">|</span>
              <span className="text-stone-300 text-sm font-medium hidden sm:inline">نظام حلقات تحفيظ القرآن الكريم</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-none">إدارة النقاط والسلوك بالثانية</p>
          </div>
        </div>

        {/* Live Pulse & User Info */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Real-time Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700/60">
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-stone-500'}`} />
            <span className="hidden md:inline">{isLive ? 'مزامنة حية بالثانية' : 'جاري الاتصال...'}</span>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-left md:text-right hidden sm:block">
                <div className="text-xs font-bold text-stone-200 flex items-center gap-1">
                  {user.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 inline" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                  )}
                  <span>{user.name}</span>
                </div>
                <div className="text-[11px] text-stone-400">
                  {user.role === 'admin' ? 'المشرف العام (صلاحيات كاملة)' : `@${user.username} - معلم`}
                </div>
              </div>

              <button
                onClick={onLogout}
                title="تسجيل الخروج"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 hover:text-white border border-stone-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
