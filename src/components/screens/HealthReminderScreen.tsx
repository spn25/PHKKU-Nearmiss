import React, { useState } from 'react';
import {
  HeartPulse,
  Droplets,
  Eye,
  ThermometerSun,
  Wind,
  Sun,
  Bell,
  BellOff,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { CurrentUser, ScreenName, HealthRemindersSettings } from '../../types';
import { translations } from '../../lib/i18n';
import { updateHealthReminderSettings } from '../../lib/storage';

interface HealthReminderScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  healthSettings: HealthRemindersSettings;
  onUpdateSettings: (settings: HealthRemindersSettings) => void;
}

export const HealthReminderScreen: React.FC<HealthReminderScreenProps> = ({
  currentUser,
  healthSettings,
  onUpdateSettings,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const [settings, setSettings] = useState<HealthRemindersSettings>(healthSettings);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleToggle = (key: keyof HealthRemindersSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    updateHealthReminderSettings(updated);
    onUpdateSettings(updated);
    triggerSaved();
  };

  const handleAdjustWater = (delta: number) => {
    const newAmount = Math.max(0, Math.min(settings.waterIntakeCurrent + delta, 4000));
    const updated = { ...settings, waterIntakeCurrent: newAmount };
    setSettings(updated);
    updateHealthReminderSettings(updated);
    onUpdateSettings(updated);
  };

  const triggerSaved = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const waterPercent = Math.min(
    100,
    Math.round((settings.waterIntakeCurrent / (settings.waterIntakeGoal || 2000)) * 100)
  );

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-blue-900 text-white rounded-3xl p-5 shadow-lg border border-teal-700/40">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
          <HeartPulse className="w-4 h-4 text-teal-400" />
          <span>{isTh ? 'อาชีวอนามัยและสุขภาวะการทำงาน' : 'Occupational Health & Wellness'}</span>
        </div>
        <h2 className="text-xl font-black text-white">{t.healthTitle}</h2>
        <p className="text-xs text-teal-200 mt-1 leading-relaxed">
          {t.healthDesc}
        </p>
      </div>

      {showSavedToast && (
        <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t.saved}</span>
        </div>
      )}

      {/* 1. Daily Hydration Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.waterTracker}
              </h3>
              <p className="text-xs text-slate-500">
                {isTh ? 'เป้าหมาย 2,000 มล. / วัน' : 'Goal: 2,000 ml / day'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle('waterReminder')}
            className={`p-2 rounded-xl transition-colors ${
              settings.waterReminder
                ? 'bg-blue-100 text-blue-700 font-bold'
                : 'bg-slate-100 text-slate-400'
            }`}
            title="Toggle Notification"
          >
            {settings.waterReminder ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-blue-700">{settings.waterIntakeCurrent} ml</span>
            <span className="text-slate-500">{waterPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${waterPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* Buttons to add water */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAdjustWater(-250)}
            className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center min-w-[48px]"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAdjustWater(250)}
            className="flex-1 min-h-[48px] p-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t.drinkGlass}</span>
          </button>
        </div>
      </div>

      {/* 2. Eye Rest 20-20-20 Rule */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.eyeRest}</h3>
              <p className="text-xs text-slate-500">{t.eyeRestDesc}</p>
            </div>
          </div>

          <button
            onClick={() => handleToggle('eyeRestReminder')}
            className={`p-2 rounded-xl transition-colors ${
              settings.eyeRestReminder
                ? 'bg-indigo-100 text-indigo-700 font-bold'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {settings.eyeRestReminder ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 font-medium">
          💡 {isTh
            ? 'เหมาะอย่างยิ่งสำหรับผู้ที่ทำงานหน้าจอคอมพิวเตอร์ หรือเพ่งมองงานวิจัย/กล้องจุลทรรศน์เป็นเวลานาน'
            : 'Recommended for screen workers, microscope researchers, and detail assemblers.'}
        </div>
      </div>

      {/* 3. Heat Stress Index & Environmental Metrics */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ThermometerSun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.heatStressIndex}
              </h3>
              <p className="text-xs text-slate-500">
                {isTh ? 'ดัชนีความร้อนและคุณภาพอากาศ มข.' : 'Campus Heat & Air Quality'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle('heatStressAlertEnabled')}
            className={`p-2 rounded-xl transition-colors ${
              settings.heatStressAlertEnabled
                ? 'bg-amber-100 text-amber-700 font-bold'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {settings.heatStressAlertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>

        {/* 3 Metric Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xs text-amber-800 font-bold block">Heat Index</span>
            <span className="text-lg font-black text-amber-900">33°C</span>
            <span className="text-[10px] text-amber-700 block font-medium">ระดับเฝ้าระวัง</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-800 font-bold block">AQI PM2.5</span>
            <span className="text-lg font-black text-emerald-900">38</span>
            <span className="text-[10px] text-emerald-700 block font-medium">คุณภาพดีมาก</span>
          </div>

          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200">
            <span className="text-xs text-orange-800 font-bold block">UV Index</span>
            <span className="text-lg font-black text-orange-900">6 High</span>
            <span className="text-[10px] text-orange-700 block font-medium">ทากันแดด/ใส่หมวก</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-950 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{t.heatStressWarning}</span>
        </div>
      </div>
    </div>
  );
};
