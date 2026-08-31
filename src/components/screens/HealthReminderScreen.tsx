import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse,
  Droplets,
  Eye,
  ThermometerSun,
  Bell,
  BellOff,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
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

  // -------------------------------------------------------------
  // 20-20-20 Eye Rest Real Timer State
  // -------------------------------------------------------------
  const [timerMode, setTimerMode] = useState<'work' | 'rest'>('work'); // 'work' = 20 mins, 'rest' = 20 secs
  const [isDemoMode, setIsDemoMode] = useState(false); // Quick 20-second work mode for instant testing!
  const WORK_DURATION = isDemoMode ? 20 : 20 * 60; // 20 seconds (demo) or 1200 seconds (20 mins)
  const REST_DURATION = 20; // 20 seconds break

  const [timeLeft, setTimeLeft] = useState<number>(WORK_DURATION);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedBreaks, setCompletedBreaks] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [restTipIndex, setRestTipIndex] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const restTipsTh = [
    'มองออกไปนอกหน้าต่าง มองต้นไม้หรือวัตถุสีเขียวระยะ 20 ฟุต (6 เมตร)',
    'กระพริบตาช้าๆ 5 ครั้ง เพื่อเพิ่มความชุ่มชื้นให้ดวงตา',
    'กลอกลูกตาเบาๆ เป็นวงกลมตามเข็มนาฬิกา 3 รอบ และทวนเข็ม 3 รอบ',
    'มองขึ้น-ลง ซ้าย-ขวา ช้าๆ โดยไม่หันศีรษะ',
    'สูดลมหายใจเข้าลึกๆ ผ่อนคลายกล้ามเนื้อคอ บ่า ไหล่',
  ];

  const restTipsEn = [
    'Look away at an object/tree at least 20 feet (6 meters) away.',
    'Blink slowly 5 times to lubricate your eyes naturally.',
    'Roll your eyes gently clockwise 3 times and counter-clockwise 3 times.',
    'Look up, down, left, right slowly without moving your head.',
    'Take a deep breath and gently relax your neck and shoulder muscles.',
  ];

  const restTips = isTh ? restTipsTh : restTipsEn;

  // Sound chime using Web Audio API
  const playChime = (type: 'break_start' | 'break_end') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'break_start') {
        // High dual chime
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      } else {
        // Completion warm chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.1);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  };

  // Reset timer when demo mode toggles
  useEffect(() => {
    if (timerMode === 'work') {
      setTimeLeft(isDemoMode ? 20 : 20 * 60);
      setIsRunning(false);
    }
  }, [isDemoMode]);

  // Main countdown loop
  useEffect(() => {
    let interval: any = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft <= 0) {
      if (timerMode === 'work') {
        // Work finished -> Start 20-second Rest Phase!
        playChime('break_start');
        setTimerMode('rest');
        setTimeLeft(REST_DURATION);
        setRestTipIndex((prev) => (prev + 1) % restTips.length);
      } else {
        // Rest phase finished -> Return to Work Mode
        playChime('break_end');
        setCompletedBreaks((prev) => prev + 1);
        setTimerMode('work');
        setTimeLeft(isDemoMode ? 20 : 20 * 60);
        setIsRunning(false);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode, isDemoMode]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimerMode('work');
    setTimeLeft(isDemoMode ? 20 : 20 * 60);
  };

  const handleTriggerInstantBreak = () => {
    playChime('break_start');
    setTimerMode('rest');
    setTimeLeft(REST_DURATION);
    setIsRunning(true);
    setRestTipIndex((prev) => (prev + 1) % restTips.length);
  };

  // Formatter for MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const totalDuration = timerMode === 'work' ? WORK_DURATION : REST_DURATION;
  const progressPercent = Math.max(0, Math.min(100, Math.round(((totalDuration - timeLeft) / totalDuration) * 100)));

  // Hydration logic
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
          <span>{isTh ? 'อาชีวอนามัยและสุขภาวะการทำงาน มข.' : 'Occupational Health & Wellness'}</span>
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

      {/* 1. Real Working 20-20-20 Eye Rest Timer Card */}
      <div
        id="card-eye-rest-timer"
        className={`rounded-3xl p-5 shadow-sm border transition-all ${
          timerMode === 'rest'
            ? 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-500 shadow-xl ring-2 ring-emerald-400/50'
            : 'bg-white text-slate-900 border-indigo-100'
        }`}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform ${
                timerMode === 'rest'
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm sm:text-base font-black ${
                    timerMode === 'rest' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {isTh ? 'นาฬิกาจับเวลากฎพักสายตา 20-20-20' : '20-20-20 Eye Rest Timer'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    timerMode === 'rest'
                      ? 'bg-emerald-400 text-slate-950 animate-bounce'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {timerMode === 'rest'
                    ? isTh
                      ? '🌿 ช่วงพัก 20 วินาที'
                      : '🌿 Rest 20s'
                    : isTh
                    ? '💻 ช่วงทำงาน 20 นาที'
                    : '💻 Work 20m'}
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  timerMode === 'rest' ? 'text-teal-200' : 'text-slate-500'
                }`}
              >
                {isTh
                  ? 'ทำงาน 20 นาที • พักสายตามองไกล 20 ฟุต • นาน 20 วินาที'
                  : 'Work 20m • Look 20ft away • Rest 20s'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs transition-colors ${
                soundEnabled
                  ? timerMode === 'rest'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
              title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleToggle('eyeRestReminder')}
              className={`p-2 rounded-xl transition-colors ${
                settings.eyeRestReminder
                  ? timerMode === 'rest'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 text-indigo-700 font-bold'
                  : 'bg-slate-100 text-slate-400'
              }`}
              title="Toggle Auto Reminder"
            >
              {settings.eyeRestReminder ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Big Timer Display & Circular Ring */}
        <div className="py-4 flex flex-col items-center justify-center text-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="7"
                fill="transparent"
                className={timerMode === 'rest' ? 'text-emerald-950/60' : 'text-slate-100'}
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-500 ${
                  timerMode === 'rest' ? 'text-emerald-400' : 'text-indigo-600'
                }`}
              />
            </svg>

            {/* Inner Timer Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                  timerMode === 'rest' ? 'text-emerald-300' : 'text-slate-900'
                }`}
              >
                {formatTime(timeLeft)}
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${
                  timerMode === 'rest' ? 'text-teal-200' : 'text-indigo-600'
                }`}
              >
                {timerMode === 'rest' ? (isTh ? 'กำลังพักสายตา' : 'Eye Rest Active') : isRunning ? (isTh ? 'กำลังทำงาน' : 'Working') : (isTh ? 'หยุดชั่วคราว' : 'Paused')}
              </span>
            </div>
          </div>

          {/* Rest Phase Animated Exercise Prompt */}
          {timerMode === 'rest' ? (
            <div className="mt-3 p-3.5 bg-emerald-800/60 border border-emerald-400/40 rounded-2xl text-xs sm:text-sm text-emerald-100 max-w-sm animate-fade-in text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-300">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{isTh ? 'คำแนะนำขณะพักสายตา:' : 'Eye Relaxation Guide:'}</span>
              </div>
              <p className="font-medium text-white">{restTips[restTipIndex]}</p>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
              <span>{isTh ? 'พักสายตาไปแล้ว:' : 'Completed Breaks:'}</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {completedBreaks} {isTh ? 'ครั้ง' : 'times'}
              </span>
            </div>
          )}
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleStartPause}
            className={`flex-1 min-h-[48px] p-3 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
              timerMode === 'rest'
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                : isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{isTh ? 'หยุดชั่วคราว' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isTh ? 'เริ่มจับเวลา' : 'Start Timer'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetTimer}
            className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-center min-w-[48px] min-h-[48px] active:scale-95 transition-all ${
              timerMode === 'rest'
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTriggerInstantBreak}
            className={`px-3 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
              timerMode === 'rest'
                ? 'bg-emerald-950/80 border border-emerald-400/40 text-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isTh ? 'พัก 20s ตอนนี้' : 'Break Now'}</span>
          </button>
        </div>

        {/* Demo Fast Mode Toggle */}
        <div className="mt-3 pt-3 border-t border-slate-100/30 flex items-center justify-between text-[11px]">
          <span className={timerMode === 'rest' ? 'text-teal-200' : 'text-slate-400'}>
            ⚡ {isTh ? 'โหมดทดสอบจับเวลาไว (20 วินาที):' : 'Fast Demo Test Mode (20s):'}
          </span>
          <button
            type="button"
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
              isDemoMode
                ? 'bg-amber-400 text-slate-950 font-black'
                : timerMode === 'rest'
                ? 'bg-white/10 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isDemoMode ? (isTh ? 'เปิดอยู่ (20s)' : 'ON (20s)') : (isTh ? 'ปิด (20 นาที)' : 'OFF (20m)')}
          </button>
        </div>
      </div>

      {/* 2. Daily Hydration Card */}
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
