import React, { useState } from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  ShoppingBag,
  CalendarCheck,
  FileText,
  BellRing,
  Leaf,
  ChevronDown,
  ChevronRight,
  List,
  PlusCircle,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NAV_ROUTES } from '../utils/Routes';
import type { AuthUser } from '../types';

export interface NavSubItem {
  label: string;
  subView: 'manage' | 'add';
  icon: LucideIcon;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  isDropdown: boolean;
  subItems?: NavSubItem[];
}

interface Props {
  user: AuthUser;
  activeTab: string;
  subView: 'manage' | 'add';
  onNavigate: (tab: string, subView?: 'manage' | 'add') => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
}

export const Sidebar: React.FC<Props> = ({ user, activeTab, subView, onNavigate, onLogout, theme }) => {
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({
    [NAV_ROUTES.DOCTORS]: true,
    [NAV_ROUTES.PRODUCTS]: true,
  });

  const toggleDropdown = (id: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isSuperAdmin = user.role === 'super_admin';

  const superAdminNavItems: NavItem[] = [
    {
      id: NAV_ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: LayoutDashboard,
      isDropdown: false,
    },
    {
      id: NAV_ROUTES.DOCTORS,
      label: 'Doctors Management',
      icon: Stethoscope,
      isDropdown: true,
      subItems: [
        { label: 'Manage Doctors', subView: 'manage' as const, icon: List },
        { label: 'Add New Doctor', subView: 'add' as const, icon: PlusCircle },
      ],
    },
    {
      id: NAV_ROUTES.PRODUCTS,
      label: 'Products Store',
      icon: ShoppingBag,
      isDropdown: true,
      subItems: [
        { label: 'Manage Products', subView: 'manage' as const, icon: List },
        { label: 'Add New Product', subView: 'add' as const, icon: PlusCircle },
      ],
    },
    {
      id: NAV_ROUTES.BOOKINGS,
      label: 'All Consultations',
      icon: CalendarCheck,
      isDropdown: false,
    },
    {
      id: NAV_ROUTES.RECORDS,
      label: 'Health Records',
      icon: FileText,
      isDropdown: false,
    },
    {
      id: NAV_ROUTES.NOTIFICATIONS,
      label: 'Push Notifications',
      icon: BellRing,
      isDropdown: false,
    },
  ];

  const doctorNavItems: NavItem[] = [
    {
      id: NAV_ROUTES.DASHBOARD,
      label: 'Doctor Portal',
      icon: LayoutDashboard,
      isDropdown: false,
    },
    {
      id: NAV_ROUTES.BOOKINGS,
      label: 'My Consultations',
      icon: CalendarCheck,
      isDropdown: false,
    },
  ];

  const navItems: NavItem[] = isSuperAdmin ? superAdminNavItems : doctorNavItems;
  const isDark = theme === 'dark';

  return (
    <aside
      className={`w-64 border-r flex flex-col justify-between h-screen sticky top-0 transition-colors duration-200 ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
      <div>
        {/* Brand Header */}
        <div className={`p-6 flex items-center gap-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-lg font-black tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>AMRUTAM</h1>
            <p className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
              {isSuperAdmin ? 'Super Admin' : 'Doctor Portal'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map((item: NavItem) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            const isOpen = !!openDropdowns[item.id];

            if (item.isDropdown && item.subItems) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      toggleDropdown(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                      isTabActive
                        ? isDark
                          ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isTabActive ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    )}
                  </button>

                  {isOpen && (
                    <div className={`pl-6 space-y-1 my-1 border-l-2 ml-5 animate-in fade-in duration-200 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      {item.subItems.map((sub: NavSubItem) => {
                        const SubIcon = sub.icon;
                        const isSubActive = isTabActive && subView === sub.subView;
                        return (
                          <button
                            type="button"
                            key={sub.subView}
                            onClick={() => onNavigate(item.id, sub.subView)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                              isSubActive
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : isDark
                                ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}>
                            <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id, 'manage')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  isTabActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                <Icon className={`w-4 h-4 ${isTabActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Logout Button */}
      <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className={`text-xs font-black truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</p>
            <p className="text-[11px] font-semibold text-emerald-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout Portal"
            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
