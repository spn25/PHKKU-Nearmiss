import React, { useState } from 'react';
import {
  User,
  Shield,
  Award,
  Globe,
  Smartphone,
  RotateCcw,
  Save,
  CheckCircle2,
  Phone,
  Building,
  Sparkles,
  Database,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { CurrentUser, ScreenName, UserRole, Language } from '../../types';
import { translations } from '../../lib/i18n';
import {
  saveCurrentUser,
  resetAllDataToDefault,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from '../../lib/storage';
import { AdminPasscodeModal } from '../AdminPasscodeModal';

interface ProfileSettingsScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  onUpdateUser: (user: CurrentUser) => void;
  onShowToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  currentUser,
  onUpdateUser,
  onShowToast,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [facultyDepartment, setFacultyDepartment] = useState(currentUser.facultyDepartment);
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser.emergencyContactName);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(currentUser.emergencyContactPhone);

  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminAuthenticated());
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CurrentUser = {
      ...currentUser,
      name,
      role,
      facultyDepartment,
      emergencyContactName,
      emergencyContactPhone,
    };
    saveCurrentUser(updated);
    onUpdateUser(updated);
    onShowToast(isTh ? '✓ บันทึกข้อมูลส่วนตัวสำเร็จ' : '✓ Profile updated successfully');
  };

  const handleToggleLang = (newLang: Language) => {
    const updated: CurrentUser = { ...currentUser, language: newLang };
    saveCurrentUser(updated);
    onUpdateUser(updated);
    onShowToast(newLang === 'th' ? 'เปลี่ยนภาษาเป็น: ภาษาไทย' : 'Language changed to: English');
  };

  const handleResetData = () => {
    if (window.confirm(isTh ? 'ต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดหรือไม่?' : 'Reset all data to default demo state?')) {
      resetAllDataToDefault();
      window.location.reload();
    }
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    setAdminAuthenticated(true);
    onShowToast(
      isTh
        ? '✓ เข้าสู่ระบบสิทธิ์แอดมินสำเร็จ (สามารถแก้ไขสถานะปัญหาได้)'
        : '✓ Admin access authorized (full permissions)',
      'success'
    );
  };

  const handleAdminLogout = () => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
    onShowToast(
      isTh
        ? '🔒 ออกจากระบบแอดมินแล้ว (กลับสู่สิทธิ์ผู้ใช้ทั่วไป)'
        : '🔒 Switched to General User permissions',
      'info'
    );
  };

  const roles: { id: UserRole; labelTh: string; labelEn: string }[] = [
    { id: 'worker', labelTh: 'เจ้าหน้าที่ภาคสนาม / ช่างเทคนิค', labelEn: 'Field Worker / Technician' },
    { id: 'student', labelTh: 'นักศึกษา / นักวิจัยในห้องแล็บ', labelEn: 'Student / Lab Researcher' },
    { id: 'staff', labelTh: 'บุคลากร / อาจารย์ประจำคณะ', labelEn: 'University Staff / Faculty' },
    { id: 'safety_officer', labelTh: 'เจ้าหน้าที่ความปลอดภัย (จป.)', labelEn: 'Safety Officer (OSHE)' },
    { id: 'admin', labelTh: 'ผู้ดูแลระบบส่วนกลาง', labelEn: 'System Administrator' },
  ];

  const badges = [
    { id: 'badge-1', title: isTh ? 'นักรายงานความปลอดภัย' : 'Safety Reporter', icon: '⭐', desc: isTh ? 'แจ้งรายงาน Near Miss สม่ำเสมอ' : 'Active Near Miss Reporter', unlocked: true },
    { id: 'badge-2', title: isTh ? 'ผู้ตรวจเช็กยอดเยี่ยม' : 'Checklist Master', icon: '📋', desc: isTh ? 'ทำ Pre-work Checklist ครบถ้วน' : 'Pre-work Check completed', unlocked: true },
    { id: 'badge-3', title: isTh ? 'รักษ์สิ่งแวดล้อม มข.' : 'KKU Green Guardian', icon: '🌱', desc: isTh ? 'ช่วยแจ้งปัญหาสิ่งแวดล้อม' : 'Eco Hazard Reporter', unlocked: true },
    { id: 'badge-4', title: isTh ? 'อุบัติเหตุเป็นศูนย์ 30 วัน' : 'Zero Accident 30d', icon: '🛡️', desc: isTh ? 'ทำงานปลอดภัยต่อเนื่อง' : '30-day Safe Milestone', unlocked: true },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* Admin Passcode Modal */}
      <AdminPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={handleAdminSuccess}
        isTh={isTh}
      />

      {/* 1. Header with Avatar */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-lg border border-slate-800 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-2xl flex items-center justify-center shadow-md">
          {name.charAt(0) || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white truncate">{name}</h2>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-300 font-medium">
            {isTh
              ? roles.find((r) => r.id === role)?.labelTh
              : roles.find((r) => r.id === role)?.labelEn}
          </p>
          <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded bg-slate-800 text-slate-300 font-mono">
            {facultyDepartment}
          </span>
        </div>
      </div>

      {/* 2. Admin Authentication / Permission Control Card */}
      <div
        className={`rounded-3xl p-5 shadow-sm border transition-all ${
          isAdmin
            ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-indigo-500/40'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isAdmin
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span>
                  {isAdmin
                    ? (isTh ? 'สิทธิ์ผู้ดูแลระบบ (Admin Authorized)' : 'Admin Authorized Mode')
                    : (isTh ? 'สิทธิ์ผู้ใช้งานทั่วไป (General User)' : 'General User Access')}
                </span>
              </h3>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isAdmin ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {isAdmin
                  ? (isTh
                      ? 'คุณกำลังใช้สิทธิ์แอดมิน สามารถปรับเปลี่ยนสถานะการดำเนินงาน (รอดำเนินการ, กำลังทำ, แก้ไขแล้ว) และลบรายงานได้'
                      : 'You have full admin rights to edit task resolution statuses and manage incident reports.')
                  : (isTh
                      ? 'ผู้ใช้ทั่วไปสามารถแจ้งปัญหาและดูรายการได้เท่านั้น หากต้องการสิทธิ์ปรับสถานะ โปรดกรอกรหัสผ่านแอดมิน'
                      : 'General users can only report and view items. Enter admin passcode to unlock status management.')}
              </p>
            </div>
          </div>

          <div className="shrink-0 pt-0.5">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-200 border border-slate-600 transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isTh ? 'ออกจากแอดมิน' : 'Lock'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPasscodeModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isTh ? 'กรุณาใส่รหัส' : 'Enter Passcode'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Language Switcher Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{t.language} (Language)</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleToggleLang('th')}
            className={`min-h-[48px] p-3 rounded-2xl font-bold text-xs border-2 transition-all flex items-center justify-center gap-2 ${
              lang === 'th'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <span>🇹🇭</span>
            <span>ภาษาไทย (TH)</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleLang('en')}
            className={`min-h-[48px] p-3 rounded-2xl font-bold text-xs border-2 transition-all flex items-center justify-center gap-2 ${
              lang === 'en'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <span>🇬🇧</span>
            <span>English (EN)</span>
          </button>
        </div>
      </div>

      {/* 4. Profile Information Fields */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>{isTh ? 'ข้อมูลผู้ใช้งาน' : 'User Information'}</span>
        </h3>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t.roleLabel}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {isTh ? r.labelTh : r.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Faculty / Dept */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t.deptLabel}
          </label>
          <input
            type="text"
            value={facultyDepartment}
            onChange={(e) => setFacultyDepartment(e.target.value)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
      </div>

      {/* 5. ICE Emergency Contact */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4 text-red-600" />
          <span>{isTh ? 'ผู้ติดต่อกรณีฉุกเฉิน (In Case of Emergency)' : 'Emergency ICE Contact'}</span>
        </h3>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t.iceContactName}
          </label>
          <input
            type="text"
            value={emergencyContactName}
            onChange={(e) => setEmergencyContactName(e.target.value)}
            placeholder={isTh ? 'เช่น คุณสมศรี (มารดา)' : 'e.g. Spouse / Relative'}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t.iceContactPhone}
          </label>
          <input
            type="tel"
            value={emergencyContactPhone}
            onChange={(e) => setEmergencyContactPhone(e.target.value)}
            placeholder="08X-XXX-XXXX"
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 6. Safety Badges & Gamification */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>{isTh ? 'เหรียญรางวัลความปลอดภัย (Badges)' : 'Safety Achievements'}</span>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5"
            >
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-xs font-bold text-amber-950">{b.title}</p>
                <p className="text-[10px] text-amber-800 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Save Profile Button */}
      <button
        type="submit"
        className="w-full min-h-[54px] p-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base rounded-2xl shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        <span>{t.save}</span>
      </button>

      {/* 8. Offline Storage State & Reset Action */}
      <div className="pt-4 border-t border-slate-200 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local Storage: 100% Client-side Offline Persistent</span>
        </div>
        <button
          type="button"
          onClick={handleResetData}
          className="text-xs text-red-600 hover:text-red-700 underline font-medium p-2"
        >
          {isTh ? 'รีเซ็ตข้อมูลตัวอย่างทั้งหมด (Reset Sample Data)' : 'Reset All Sample Data'}
        </button>
      </div>
    </form>
  );
};

