import React, { useState } from 'react';
import {
  AlertTriangle,
  ClipboardCheck,
  Leaf,
  PhoneCall,
  BookOpen,
  Sparkles,
  QrCode,
  BarChart3,
  Droplets,
  Eye,
  ThermometerSun,
  Wind,
  Sun,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Bot,
  MessageSquare,
} from 'lucide-react';
import {
  ScreenName,
  CurrentUser,
  NearMissReport,
  EnvReport,
  HealthRemindersSettings,
} from '../../types';
import { translations } from '../../lib/i18n';
import { updateHealthReminderSettings } from '../../lib/storage';

interface HomeScreenProps {
  onNavigate: (screen: ScreenName) => void;
  currentUser: CurrentUser;
  nearMissReports?: NearMissReport[];
  envReports?: EnvReport[];
  healthSettings?: HealthRemindersSettings;
  onRefreshData?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  currentUser,
  nearMissReports = [],
  envReports = [],
  healthSettings,
  onRefreshData,
}) => {
  const lang = currentUser?.language || 'th';
  const t = translations[lang] || translations.th;
  const isTh = lang === 'th';

  const [waterCount, setWaterCount] = useState(healthSettings?.waterIntakeCurrent || 750);

  const handleDrinkWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newAmount = Math.min(waterCount + 250, 3000);
    setWaterCount(newAmount);
    updateHealthReminderSettings({ waterIntakeCurrent: newAmount });
    if (onRefreshData) onRefreshData();
  };

  // Combine and sort recent activities
  const safeNearMiss = Array.isArray(nearMissReports) ? nearMissReports : [];
  const safeEnv = Array.isArray(envReports) ? envReports : [];

  const recentItems = [
    ...safeNearMiss.map((r) => ({
      id: r.id,
      title: r.description || (r.type === 'near_miss' ? t.typeNearMiss : t.typeUnsafeCondition),
      location: r.location,
      status: r.status,
      time: r.createdAt,
      type: 'hazard' as const,
      severity: r.severity,
      hasResolvedPhoto: Boolean(r.resolvedPhotoDataUrl),
    })),
    ...safeEnv.map((e) => ({
      id: e.id,
      title: `[${(e.category || '').toUpperCase()}] ${e.description || ''}`,
      location: e.location,
      status: e.status,
      time: e.createdAt,
      type: 'env' as const,
      severity: e.severity || 'medium',
      hasResolvedPhoto: Boolean(e.resolvedPhotoDataUrl),
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 4);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t.statusResolved}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {t.statusInProgress}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            {t.statusNew}
          </span>
        );
    }
  };

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString(isTh ? 'th-TH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* 1. Hero Greeting Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {isTh ? 'มหาวิทยาลัยขอนแก่น (KKU Safety)' : 'KKU Safety Network'}
            </div>
            <span className="text-xs text-slate-300 font-mono">
              {new Date().toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>

          <div className="mt-3">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isTh ? 'วันนี้ปลอดภัยไหม?' : 'Are you safe today?'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 font-light">
              {isTh
                ? `สวัสดีคุณ ${currentUser.name} (${currentUser.role})`
                : `Hello, ${currentUser.name} (${currentUser.role})`}
            </p>
          </div>

          {/* Quick Target Indicator (Removed 30s text) */}
          <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
            <span>{isTh ? '⚡ แจ้งอันตรายสะดวกรวดเร็ว' : '⚡ Fast hazard report'}</span>
            <span className="text-emerald-400 font-semibold">
              {isTh ? 'ปลอดภัย • ง่าย • รวดเร็ว' : 'Safe • Simple • Fast'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Primary Action Buttons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {isTh ? 'เมนูหลักความปลอดภัย / Action Tools' : 'Primary Safety Tools'}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Action 1: Report Near Miss / Hazard (Removed 'ด่วน 30s' badge) */}
          <button
            id="btn-home-report-hazard"
            onClick={() => onNavigate('near_miss')}
            className="w-full min-h-[68px] p-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 active:scale-[0.99] text-white rounded-2xl shadow-md flex items-center justify-between transition-all group border border-red-400/40 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-7 h-7 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                    {t.actionReportHazard}
                  </h4>
                </div>
                <p className="text-xs text-red-100 mt-0.5 line-clamp-1 font-normal">
                  {t.actionReportHazardSub}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Action 2: Safety Checklist (BLUE / VERIFICATION) */}
          <button
            id="btn-home-checklist"
            onClick={() => onNavigate('checklist')}
            className="w-full min-h-[64px] p-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.99] text-white rounded-2xl shadow-md flex items-center justify-between transition-all group border border-blue-500/30 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-base font-bold tracking-tight leading-tight">
                  {t.actionChecklist}
                </h4>
                <p className="text-xs text-blue-100 mt-0.5 line-clamp-1 font-normal">
                  {t.actionChecklistSub}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Action 3: Environment Report (GREEN / SUSTAINABILITY & ECO) */}
          <button
            id="btn-home-env-report"
            onClick={() => onNavigate('env_report')}
            className="w-full min-h-[64px] p-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.99] text-white rounded-2xl shadow-md flex items-center justify-between transition-all group border border-emerald-400/30 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-base font-bold tracking-tight leading-tight">
                  {t.actionEnvReport}
                </h4>
                <p className="text-xs text-emerald-100 mt-0.5 line-clamp-1 font-normal">
                  {t.actionEnvReportSub}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Action 4: Emergency SOS */}
          <button
            id="btn-home-emergency"
            onClick={() => onNavigate('emergency')}
            className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 active:scale-[0.99] rounded-2xl border border-rose-200 flex items-center justify-between transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900 leading-tight">
                  {t.actionEmergency}
                </h4>
                <p className="text-xs text-rose-700 mt-0.5 line-clamp-1">
                  {t.actionEmergencySub}
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-rose-200/60 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform text-rose-700">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Action 5: Safety Manual */}
          <button
            id="btn-home-manual"
            onClick={() => onNavigate('manual')}
            className="w-full p-3.5 bg-white hover:bg-slate-50 active:scale-[0.99] rounded-2xl border border-slate-200 flex items-center justify-between transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-tight">
                  {t.actionSafetyManual}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {t.actionSafetyManualSub}
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform text-slate-500">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </section>

      {/* 3. Secondary Smart Tools (AI Hazard, PPE Scan, Dashboard, AI Chat) */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-1">
          {isTh ? 'เครื่องมือเสริม / Smart Assistants' : 'Smart Assistants'}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {/* AI Chat Advisor */}
          <button
            id="btn-home-ai-chat"
            onClick={() => onNavigate('ai_chat')}
            className="p-2.5 bg-white rounded-2xl border border-purple-100 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95 min-h-[96px] justify-center"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight">
              {isTh ? 'ปรึกษา AI' : 'AI Advisor'}
            </span>
            <span className="text-[9px] text-purple-600 font-medium mt-0.5">
              {isTh ? 'ถามตอบ' : 'Chat'}
            </span>
          </button>

          {/* AI Hazard Detection */}
          <button
            id="btn-home-ai-hazard"
            onClick={() => onNavigate('ai_hazard')}
            className="p-2.5 bg-white rounded-2xl border border-indigo-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95 min-h-[96px] justify-center"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight">
              {isTh ? 'AI สแกนภาพ' : 'AI Vision'}
            </span>
            <span className="text-[9px] text-indigo-600 font-medium mt-0.5">
              {isTh ? 'วิเคราะห์' : 'Scan'}
            </span>
          </button>

          {/* QR PPE Site */}
          <button
            id="btn-home-ppe-scan"
            onClick={() => onNavigate('ppe_scan')}
            className="p-2.5 bg-white rounded-2xl border border-teal-100 shadow-sm hover:border-teal-300 hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95 min-h-[96px] justify-center"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight">
              {isTh ? 'สแกน PPE' : 'PPE QR'}
            </span>
            <span className="text-[9px] text-teal-600 font-medium mt-0.5">
              {isTh ? 'เช็กจุด' : 'Site'}
            </span>
          </button>

          {/* Dashboard */}
          <button
            id="btn-home-dashboard"
            onClick={() => onNavigate('dashboard')}
            className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95 min-h-[96px] justify-center"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight">
              {isTh ? 'แดชบอร์ด' : 'Dashboard'}
            </span>
            <span className="text-[9px] text-slate-700 font-medium mt-0.5">
              {isTh ? 'สถิติ' : 'Live Stats'}
            </span>
          </button>
        </div>
      </section>

      {/* 4. Health & Environmental Widget (Hydration, Heat Stress, AQI, 20-20-20) */}
      <section
        onClick={() => onNavigate('health')}
        className="bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl p-4 border border-blue-200/80 shadow-sm cursor-pointer hover:border-blue-300 transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
              <ThermometerSun className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isTh ? 'สภาพอากาศ & สุขภาพประจำวัน' : 'Weather & Daily Wellness'}
              </h4>
              <span className="text-[10px] text-slate-700">Khon Kaen Campus</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
            {isTh ? 'จับเวลาพักสายตา / ดื่มน้ำ' : 'Eye Rest & Water'} <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {/* AQI */}
          <div className="bg-white p-2 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
              <Wind className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">38</span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium">AQI (ดีมาก)</p>
          </div>

          {/* Heat Stress */}
          <div className="bg-white p-2 rounded-xl border border-amber-100">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-0.5">
              <ThermometerSun className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">33°C</span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium">Heat Index</p>
          </div>

          {/* UV */}
          <div className="bg-white p-2 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
              <Sun className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">6 High</span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium">UV Index</p>
          </div>

          {/* Water Quick Tap */}
          <div
            onClick={handleDrinkWater}
            className="bg-blue-600 text-white p-2 rounded-xl shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex flex-col items-center justify-center"
            title="Tap to log 250ml water"
          >
            <div className="flex items-center gap-0.5 text-xs font-bold">
              <Droplets className="w-3.5 h-3.5 fill-current" />
              <span>{waterCount}ml</span>
            </div>
            <span className="text-[9px] text-blue-100 font-medium flex items-center gap-0.5 mt-0.5">
              <Plus className="w-2.5 h-2.5" /> 250ml
            </span>
          </div>
        </div>

        {/* 20-20-20 Prompt */}
        <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5 text-indigo-700 font-medium">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            {isTh ? 'นาฬิกาจับเวลากฎพักสายตา 20-20-20' : '20-20-20 Eye Rest Timer'}
          </span>
          <span className="text-slate-500 font-medium">{isTh ? 'กดเพื่อเริ่มจับเวลา ⏱️' : 'Tap to start timer ⏱️'}</span>
        </div>
      </section>

      {/* 5. Recent Activity Feed (with Color-coded Statuses) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {isTh ? 'รายงานล่าสุด / Recent Activity' : 'Recent Reports'}
          </h3>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            {isTh ? 'ดูทั้งหมด' : 'View All'} ({recentItems.length})
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-400">
            <p className="text-sm">{isTh ? 'ยังไม่มีรายงานในขณะนี้' : 'No recent reports found.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('dashboard')}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(item.status)}
                    {item.hasResolvedPhoto && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        📷 {isTh ? 'มีรูปหลังแก้ไข' : 'Proof Attached'}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.time)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {item.location}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-3" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
