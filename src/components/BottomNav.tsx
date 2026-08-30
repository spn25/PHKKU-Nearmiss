import React from 'react';
import {
  Home,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  Settings,
} from 'lucide-react';
import { ScreenName, Language, CurrentUser } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  lang?: Language;
  currentUser?: CurrentUser;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  lang,
  currentUser,
}) => {
  const activeLang = lang || currentUser?.language || 'th';
  const isTh = activeLang === 'th';

  const navItems = [
    {
      id: 'home' as ScreenName,
      label: isTh ? 'หน้าหลัก' : 'Home',
      icon: Home,
    },
    {
      id: 'near_miss' as ScreenName,
      label: isTh ? 'แจ้งอันตราย' : 'Report',
      icon: AlertTriangle,
      highlight: true,
    },
    {
      id: 'checklist' as ScreenName,
      label: isTh ? 'Checklist' : 'Checklist',
      icon: ClipboardCheck,
    },
    {
      id: 'dashboard' as ScreenName,
      label: isTh ? 'แดชบอร์ด' : 'Stats',
      icon: BarChart3,
    },
    {
      id: 'manual' as ScreenName,
      label: isTh ? 'คู่มือ' : 'Manual',
      icon: BookOpen,
    },
    {
      id: 'settings' as ScreenName,
      label: isTh ? 'ตั้งค่า' : 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-6 items-center px-1 py-1.5 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center -mt-4 group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all transform group-active:scale-95 ${
                    isActive
                      ? 'bg-amber-500 text-slate-900 ring-4 ring-amber-100 shadow-amber-500/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] mt-1 font-semibold leading-tight ${
                    isActive ? 'text-amber-700' : 'text-slate-700'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all min-h-[48px] active:scale-95 ${
                isActive
                  ? 'text-emerald-700 font-bold bg-emerald-50'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
