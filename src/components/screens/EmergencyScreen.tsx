import React, { useState } from 'react';
import {
  PhoneCall,
  AlertOctagon,
  Shield,
  Ambulance,
  Flame,
  Wrench,
  CheckCircle2,
  PhoneForwarded,
} from 'lucide-react';
import { CurrentUser, ScreenName, EmergencyContact } from '../../types';
import { translations } from '../../lib/i18n';
import { getEmergencyContacts, triggerEmergencyAlert } from '../../lib/storage';

interface EmergencyScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  onEmergencyTriggered: (msg: string) => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  currentUser,
  onEmergencyTriggered,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const contacts: EmergencyContact[] = getEmergencyContacts();
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosNote, setSosNote] = useState('');

  const handleTriggerSOS = () => {
    // Attempt haptic feedback vibration if supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([300, 100, 300, 100, 500]);
      } catch {
        // ignore
      }
    }

    triggerEmergencyAlert(undefined, sosNote);
    setSosTriggered(true);
    onEmergencyTriggered(
      isTh
        ? '🚨 ส่งสัญญาณฉุกเฉิน SOS ไปยังศูนย์ รปภ. มข. เรียบร้อยแล้ว!'
        : '🚨 Emergency SOS Signal Dispatched to KKU Security!'
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical':
        return <Ambulance className="w-5 h-5 text-red-600" />;
      case 'fire':
        return <Flame className="w-5 h-5 text-orange-600" />;
      case 'facility':
        return <Wrench className="w-5 h-5 text-blue-600" />;
      default:
        return <Shield className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* 1. Giant SOS Panic Button */}
      <div className="bg-gradient-to-br from-red-950 via-red-900 to-rose-950 text-white rounded-3xl p-6 shadow-2xl border-2 border-red-500/60 text-center space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>KKU 24/7 Rapid Emergency Response</span>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white">
          {t.emergencyTitle}
        </h2>
        <p className="text-xs text-rose-200 max-w-xs mx-auto">
          {t.emergencyDesc}
        </p>

        {/* Big Pulsating Action Button */}
        <button
          id="btn-trigger-sos-giant"
          onClick={handleTriggerSOS}
          className="w-36 h-36 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 active:scale-95 text-white font-black text-xl shadow-2xl mx-auto flex flex-col items-center justify-center gap-1 border-4 border-white/40 ring-8 ring-red-500/30 transition-all cursor-pointer animate-pulse"
        >
          <PhoneCall className="w-10 h-10" />
          <span>SOS</span>
          <span className="text-[10px] font-normal tracking-wide opacity-90">
            {isTh ? 'แตะแจ้งเหตุทันที' : 'TAP TO ALERT'}
          </span>
        </button>

        {sosTriggered && (
          <div className="p-3 bg-red-800/90 border border-red-400 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isTh
                ? '✓ สัญญาณเตือนภัย SOS ถูกบันทึกและส่งรายงานไปยังเจ้าหน้าที่แล้ว'
                : '✓ SOS Alarm Dispatched to Response Center'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Direct KKU Emergency Contact Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {isTh ? 'สายด่วนฉุกเฉิน มข. (โทรออกทันที)' : 'KKU Emergency Contacts'}
          </h3>
          <span className="text-xs font-semibold text-emerald-700">
            {isTh ? 'บริการ 24 ชั่วโมง' : '24/7 Available'}
          </span>
        </div>

        <div className="space-y-2.5">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center justify-between gap-3 hover:border-red-300 transition-all"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(contact.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {isTh ? contact.name : contact.nameEn}
                    </h4>
                    {contact.is24h && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                        24H
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-1">
                    {isTh ? contact.role : contact.roleEn}
                  </p>
                  <p className="text-xs font-mono font-bold text-red-600 mt-1">
                    {contact.phone}
                  </p>
                </div>
              </div>

              {/* Call Button */}
              <a
                href={`tel:${contact.phone.replace(/\D/g, '')}`}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 shrink-0 min-h-[46px]"
              >
                <PhoneForwarded className="w-4 h-4" />
                <span>{t.callNow}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
