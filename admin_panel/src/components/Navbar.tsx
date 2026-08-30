import React from 'react';
import { Bell, Search, RefreshCw, UserCheck, Sun, Moon } from 'lucide-react';

interface Props {
  onRefresh: () => void;
  isRefreshing: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<Props> = ({ onRefresh, isRefreshing, theme, onToggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`h-16 backdrop-blur border-b px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200 ${
        isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
      }`}>
      {/* Global Search Bar */}
      <div
        className={`flex items-center gap-3 border rounded-xl px-3.5 py-2 w-96 transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
        <Search className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        <input
          type="text"
          placeholder="Search doctors, products, consultations..."
          className={`bg-transparent border-none outline-none text-xs w-full ${
            isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
          }`}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}>
          {isDark ? <Sun className="w-4 h-4 animate-in fade-in duration-200" /> : <Moon className="w-4 h-4 animate-in fade-in duration-200" />}
        </button>

        {/* Sync Database Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
          }`}>
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Database'}</span>
        </button>

        <div className="relative">
          <button
            className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}>
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </button>
        </div>

        <div className={`h-6 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            A
          </div>
          <div>
            <h4 className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>Admin Vaidya</span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            </h4>
            <p className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Super Admin • Amrutam</p>
          </div>
        </div>
      </div>
    </header>
  );
};
