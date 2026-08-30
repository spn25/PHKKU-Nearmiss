import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, X, AlertCircle, KeyRound, Check } from 'lucide-react';
import { verifyAdminPasscode, ADMIN_PASSCODE } from '../lib/storage';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isTh?: boolean;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isTh = true,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!passcode) {
      setError(isTh ? 'กรุณากรอกรหัสผ่าน' : 'Please enter passcode');
      return;
    }

    const isValid = verifyAdminPasscode(passcode);
    if (isValid) {
      setPasscode('');
      setError(null);
      onSuccess();
      onClose();
    } else {
      setError(isTh ? 'รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง' : 'Incorrect passcode! Please try again');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (passcode.length < 5) {
      const next = passcode + digit;
      setPasscode(next);
      setError(null);
      if (next.length === 5) {
        if (next === ADMIN_PASSCODE) {
          verifyAdminPasscode(next);
          setPasscode('');
          setError(null);
          onSuccess();
          onClose();
        } else {
          setError(isTh ? 'รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง' : 'Incorrect passcode! Please try again');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPasscode((prev) => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {isTh ? 'เข้าสู่ระบบแอดมิน (Admin Access)' : 'Admin Authorization'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed px-2">
            {isTh
              ? 'กรุณากรอกรหัสผ่านเพื่อเข้าจัดการสถานะการดำเนินงานแก้ไขปัญหา'
              : 'Enter admin passcode to manage incident resolution progress'}
          </p>
        </div>

        {/* PIN Circles Display */}
        <div className="flex justify-center items-center gap-3 py-2">
          {[0, 1, 2, 3, 4].map((i) => {
            const hasChar = passcode.length > i;
            return (
              <div
                key={i}
                className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-lg font-black transition-all ${
                  hasChar
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                {hasChar ? (showPassword ? passcode[i] : '●') : ''}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 justify-center animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="min-h-[48px] rounded-2xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 active:scale-95 text-slate-800 font-bold text-lg transition-all flex items-center justify-center border border-slate-200/80 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="min-h-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-medium text-xs transition-all flex items-center justify-center"
            title={showPassword ? 'Hide PIN' : 'Show PIN'}
          >
            {showPassword ? (isTh ? 'ซ่อน' : 'Hide') : (isTh ? 'แสดง' : 'Show')}
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="min-h-[48px] rounded-2xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 active:scale-95 text-slate-800 font-bold text-lg transition-all flex items-center justify-center border border-slate-200/80 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="min-h-[48px] rounded-2xl bg-slate-100 hover:bg-red-50 hover:text-red-700 active:scale-95 text-slate-600 font-semibold text-xs transition-all flex items-center justify-center"
          >
            {isTh ? 'ลบ ⌫' : 'Del ⌫'}
          </button>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>{isTh ? 'ความปลอดภัยระดับแอดมิน' : 'Admin Security Access'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all text-xs"
          >
            {isTh ? 'ปิดหน้าต่าง' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
