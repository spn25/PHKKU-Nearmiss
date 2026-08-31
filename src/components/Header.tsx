import React from 'react';
import { Shield, Globe, PhoneCall, ChevronLeft, Wifi } from 'lucide-react';
import { ScreenName, CurrentUser, Language } from '../types';
import { translations } from '../lib/i18n';

interface HeaderProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  currentUser: CurrentUser;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  currentUser,
  onLanguageChange,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];

  const getScreenTitle = (): { title: string; subtitle: string } => {
    switch (currentScreen) {
      case 'near_miss':
        return { title: t.nearMissTitle, subtitle: t.nearMissDesc };
      case 'checklist':
        return { title: t.checklistTitle, subtitle: t.checklistDesc };
      case 'ppe_scan':
        return { title: t.ppeScanTitle, subtitle: t.ppeScanDesc };
      case 'ai_hazard':
        return { title: t.aiHazardTitle, subtitle: t.aiHazardDesc };
      case 'health':
        return { title: t.healthTitle, subtitle: t.healthDesc };
      case 'environment':
      case 'env_report':
        return { title: t.envTitle, subtitle: t.envDesc };
      case 'emergency':
        return { title: t.emergencyTitle, subtitle: t.emergencyDesc };
      case 'manual':
        return { title: t.manualTitle, subtitle: t.manualDesc };
      case 'dashboard':
        return { title: t.dashboardTitle, subtitle: t.dashboardDesc };
      case 'ai_chat':
        return {
          title: lang === 'th' ? 'พูดคุยปรึกษากับ AI ความปลอดภัย' : 'Safety AI Advisor',
          subtitle: lang === 'th' ? 'ผู้ช่วยตอบคำถามความปลอดภัย สารเคมี และการปฐมพยาบาล' : 'AI Safety & First Aid Advisor',
        };
      case 'profile':
      case 'settings':
        return { title: t.settingsTitle, subtitle: t.profileSection };
      default:
        return { title: t.appName, subtitle: t.tagline };
    }
  };

  const isHome = currentScreen === 'home';
  const screenInfo = getScreenTitle();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top utility bar */}
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="w-3.5 h-3.5" />
          <span>{lang === 'th' ? 'ออฟไลน์สมบูรณ์ (Local-First)' : '100% Offline Ready'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bilingual Switcher */}
          <button
            id="btn-lang-toggle"
            onClick={() => onLanguageChange(lang === 'th' ? 'en' : 'th')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-200 border border-slate-700 font-semibold"
            title="Switch Language (TH/EN)"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'th' ? 'EN' : 'ไทย'}</span>
          </button>

          {/* Quick SOS button */}
          {currentScreen !== 'emergency' && (
            <button
              id="btn-quick-sos"
              onClick={() => onNavigate('emergency')}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold transition-all shadow-sm animate-pulse"
            >
              <PhoneCall className="w-3 h-3" />
              <span>SOS</span>
            </button>
          )}
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isHome ? (
            <button
              id="btn-header-back"
              onClick={() => onNavigate('home')}
              className="p-2 -ml-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
          )}

          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 leading-snug">
              {isHome ? (
                <>
                  <span>KKU Nearmiss Safety</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700 font-normal">
                    OSHE
                  </span>
                </>
              ) : (
                <span>{screenInfo.title}</span>
              )}
            </h1>
            <p className="text-xs text-slate-400 line-clamp-1">
              {isHome ? (
                <span>
                  {currentUser.name} • {currentUser.role}
                </span>
              ) : (
                screenInfo.subtitle
              )}
            </p>
          </div>
        </div>

        {/* User avatar / profile button */}
        <button
          id="btn-header-profile"
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors text-right"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
            {currentUser.name ? currentUser.name.charAt(0) : 'S'}
          </div>
        </button>
      </div>
    </header>
  );
};
