import React from 'react';
import {
  Shield,
  Ambulance,
  Flame,
  Wrench,
  PhoneForwarded,
  PhoneCall,
} from 'lucide-react';
import { CurrentUser, ScreenName, EmergencyContact } from '../../types';
import { translations } from '../../lib/i18n';
import { getEmergencyContacts } from '../../lib/storage';

interface EmergencyScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  onEmergencyTriggered?: (msg: string) => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  currentUser,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const contacts: EmergencyContact[] = getEmergencyContacts();

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
    <div className="space-y-4 pb-24 max-w-xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-red-950 text-white rounded-3xl p-5 shadow-lg border border-red-800/60 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-800/80 border border-red-500/40 text-[11px] font-bold text-rose-200">
            <PhoneCall className="w-3.5 h-3.5 text-rose-300" />
            <span>{isTh ? 'สายด่วนฉุกเฉิน 24 ชั่วโมง มหาวิทยาลัยขอนแก่น' : 'KKU 24/7 Rapid Emergency Response'}</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            {t.emergencyTitle}
          </h2>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            {t.emergencyDesc}
          </p>
        </div>
      </div>

      {/* Direct KKU Emergency Contact Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {isTh ? 'รายชื่อสายด่วนฉุกเฉิน มข. (แตะเพื่อโทรออกทันที)' : 'KKU Emergency Contacts (Tap to Call)'}
          </h3>
          <span className="text-xs font-semibold text-emerald-700">
            {isTh ? 'บริการ 24 ชม.' : '24/7 Available'}
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
