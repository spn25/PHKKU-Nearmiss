import React, { useState } from 'react';
import {
  Shield,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  ShieldCheck,
  Building,
  ArrowRight,
  Globe,
  HelpCircle,
  Sparkles,
  AlertCircle,
  HardHat,
  HeartHandshake,
} from 'lucide-react';
import { CurrentUser, Language, UserRole } from '../types';
import { ADMIN_PASSCODE, loginUser } from '../lib/storage';

interface LoginScreenProps {
  onLoginSuccess: (user: CurrentUser) => void;
  currentUser: CurrentUser;
  onLanguageChange: (lang: Language) => void;
}

export const USER_STATUS_OPTIONS: { id: UserRole; labelTh: string; labelEn: string; icon: string }[] = [
  { id: 'บุคลากร', labelTh: '1. บุคลากร', labelEn: '1. Staff / Personnel', icon: '💼' },
  { id: 'อาจารย์', labelTh: '2. อาจารย์', labelEn: '2. Faculty / Lecturer', icon: '🎓' },
  { id: 'นักศึกษา', labelTh: '3. นักศึกษา', labelEn: '3. Student', icon: '🎒' },
  { id: 'บุคคลทั่วไป', labelTh: '4. บุคคลทั่วไป', labelEn: '4. General Public / Visitor', icon: '👤' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  currentUser,
  onLanguageChange,
}) => {
  const [loginMode, setLoginMode] = useState<'general' | 'admin'>('general');
  
  // Only prefill name and phone if user previously logged in and checked "rememberMe"
  const isRemembered = Boolean(currentUser?.rememberMe && currentUser?.name && currentUser?.phone);
  const [name, setName] = useState(isRemembered ? currentUser.name : '');
  const [phone, setPhone] = useState(isRemembered ? currentUser.phone : '');
  const [userStatus, setUserStatus] = useState<UserRole>(
    (currentUser?.role as UserRole) || 'บุคลากร'
  );
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [rememberMe, setRememberMe] = useState(isRemembered);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lang = currentUser?.language || 'th';
  const isTh = lang === 'th';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMessage(isTh ? 'กรุณากรอกชื่อ-นามสกุล' : 'Please enter your Full Name');
      return;
    }

    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 9) {
      setErrorMessage(
        isTh
          ? 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (อย่างน้อย 9-10 หลัก)'
          : 'Please enter a valid phone number (at least 9-10 digits)'
      );
      return;
    }

    if (loginMode === 'admin') {
      if (passcode.trim() !== ADMIN_PASSCODE) {
        setErrorMessage(
          isTh
            ? 'รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง'
            : 'Incorrect Admin Passcode. Please check and try again.'
        );
        return;
      }
    }

    const selectedRole: UserRole = loginMode === 'admin' ? 'จป. (เจ้าหน้าที่ความปลอดภัย)' : userStatus;

    const user = loginUser({
      name: trimmedName,
      phone: trimmedPhone,
      isAdmin: loginMode === 'admin',
      rememberMe: rememberMe,
      role: selectedRole,
      facultyDepartment: loginMode === 'admin' ? 'ศูนย์บริหารความปลอดภัย OSHE มข.' : `สถานะ: ${selectedRole}`,
    });

    onLoginSuccess(user);
  };

  const handleQuickDemo = (type: 'worker' | 'admin') => {
    if (type === 'worker') {
      setLoginMode('general');
      setName('นายสาสุข รักปลอดภัย');
      setPhone('081-234-5678');
      setUserStatus('บุคลากร');
      setRememberMe(true);
      setErrorMessage(null);
    } else {
      setLoginMode('admin');
      setName('จป.วิชัย คุ้มภัย');
      setPhone('089-999-1234');
      setPasscode(ADMIN_PASSCODE);
      setUserStatus('จป. (เจ้าหน้าที่ความปลอดภัย)');
      setRememberMe(true);
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col justify-between text-slate-100 p-4 sm:p-6 font-sans">
      {/* Top Bar with Language switcher */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">KKU Nearmiss Safety</h1>
            <p className="text-[10px] text-emerald-400 font-medium">OSHE Smart Safety</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLanguageChange(lang === 'th' ? 'en' : 'th')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 border border-slate-700 transition-all font-medium"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'th' ? 'EN' : 'ไทย'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg mx-auto my-auto bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTh ? 'ระบบความปลอดภัย มหาวิทยาลัยขอนแก่น' : 'KKU Safety & OSHE Portal'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isTh ? 'ลงชื่อเข้าใช้งาน KKU Nearmiss Safety' : 'Sign in to KKU Nearmiss Safety'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              {isTh
                ? 'กรุณาระบุชื่อ-นามสกุล และเบอร์โทรศัพท์เพื่อเริ่มใช้งาน'
                : 'Please provide your full name and phone number to continue'}
            </p>
          </div>
        </div>

        {/* 2-Mode Segmented Switcher */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              id="btn-mode-general"
              onClick={() => {
                setLoginMode('general');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                loginMode === 'general'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>{isTh ? '1. ผู้ใช้งานทั่วไป' : '1. General User'}</span>
            </button>

            <button
              type="button"
              id="btn-mode-admin"
              onClick={() => {
                setLoginMode('admin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                loginMode === 'admin'
                  ? 'bg-slate-900 text-amber-300 shadow-sm border border-slate-800'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isTh ? '2. ผู้ดูแลระบบ / จป.' : '2. Admin / Safety'}</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleLogin} className="p-4 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <span className="font-bold">{isTh ? 'แจ้งเตือน: ' : 'Error: '}</span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isTh ? 'ชื่อ - นามสกุล' : 'Full Name'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="login-input-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTh ? 'ตัวอย่าง: นายสมเกียรติ สาสุขดี' : 'e.g. Somkiat Sasookdee'}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isTh ? 'เบอร์โทรศัพท์ติดต่อ' : 'Phone Number'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                id="login-input-phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isTh ? 'ตัวอย่าง: 081-234-5678' : 'e.g. 081-234-5678'}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50 transition-all font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isTh
                ? 'ใช้สำหรับยืนยันและประสานงานกรณีเกิดเหตุฉุกเฉินหรือความปลอดภัย'
                : 'For emergency coordination & incident reporting follow-up'}
            </p>
          </div>

          {/* User Status Selector (General Mode) */}
          {loginMode === 'general' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {isTh ? 'สถานะผู้ใช้' : 'User Status'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {USER_STATUS_OPTIONS.map((opt) => {
                  const isSelected = userStatus === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setUserStatus(opt.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="text-lg leading-none">{opt.icon}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs block leading-tight truncate">
                          {isTh ? opt.labelTh : opt.labelEn}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Passcode (Admin Mode only) */}
          {loginMode === 'admin' && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isTh ? 'รหัสผ่านผู้ดูแลระบบ (Admin Passcode)' : 'Admin Passcode'}</span>
                  <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  id="login-input-passcode"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={isTh ? 'กรุณาใส่รหัสผ่านผู้ดูแลระบบ' : 'Enter confidential passcode'}
                  className="w-full pl-4 pr-11 py-3 rounded-xl border-2 border-amber-300 bg-white text-slate-900 text-sm focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me Checkbox */}
          <div className="pt-1">
            <button
              type="button"
              id="btn-toggle-remember"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2.5 text-left text-xs sm:text-sm text-slate-700 hover:text-slate-900 select-none group"
            >
              <div className="text-emerald-600 group-hover:scale-110 transition-transform">
                {rememberMe ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <span className="font-semibold">
                  {isTh ? 'จดจำข้อมูลผู้ใช้งานในเครื่องนี้' : 'Remember me on this device'}
                </span>
                <span className="block text-[11px] text-slate-400 font-normal">
                  {isTh
                    ? 'ไม่ต้องกรอกข้อมูลอีกในครั้งถัดไป'
                    : 'Stay signed in for quick safety reporting next time'}
                </span>
              </div>
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-login-submit"
              className={`w-full py-3.5 px-5 rounded-2xl text-sm sm:text-base font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all ${
                loginMode === 'admin'
                  ? 'bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-amber-300 hover:from-slate-800 hover:to-slate-900 shadow-slate-900/30 border border-amber-500/30'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/30'
              }`}
            >
              <span>
                {loginMode === 'admin'
                  ? isTh
                    ? '🛡️ ยืนยันเข้าสู่ระบบผู้ดูแลระบบ (Admin)'
                    : '🛡️ Sign In as Safety Admin'
                  : isTh
                  ? '🚀 เข้าสู่ระบบใช้งาน KKU Nearmiss Safety'
                  : '🚀 Enter KKU Nearmiss Safety'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Demo Pre-fill Bar */}
        <div className="bg-slate-50 border-t border-slate-200/80 p-4 sm:p-5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isTh ? 'ตัวเลือกทดลองใช้งานด่วน (Demo Quick-Fill):' : 'Demo Fast Fill:'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('worker')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTh ? 'ผู้ใช้ทั่วไป (Demo)' : 'General User'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{isTh ? 'แอดมิน จป. (Demo)' : 'Admin (Demo)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="w-full max-w-lg mx-auto text-center py-3 text-xs text-slate-400">
        <p>มหาวิทยาลัยขอนแก่น • KKU Occupational Safety, Health and Environment (OSHE)</p>
        <p className="text-[10px] text-slate-700 mt-0.5">Offline-Ready Local Database Protection</p>
      </div>
    </div>
  );
};
