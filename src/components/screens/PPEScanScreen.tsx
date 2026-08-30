import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Phone,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { CurrentUser, ScreenName, PPESite } from '../../types';
import { translations } from '../../lib/i18n';
import { getPPESites, lookupPPESite } from '../../lib/storage';

interface PPEScanScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
}

export const PPEScanScreen: React.FC<PPEScanScreenProps> = ({
  currentUser,
  onNavigate,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const sites = getPPESites();
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.siteId || '');
  const [isScanningSim, setIsScanningSim] = useState(false);

  const currentSite: PPESite | undefined = lookupPPESite(selectedSiteId) || sites[0];

  const handleSimulateScan = (siteId: string) => {
    setIsScanningSim(true);
    setTimeout(() => {
      setSelectedSiteId(siteId);
      setIsScanningSim(false);
    }, 600);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            {isTh ? 'ความเสี่ยงสูง (High Risk Area)' : 'High Risk Area'}
          </span>
        );
      case 'medium':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {isTh ? 'ความเสี่ยงปานกลาง (Medium Risk)' : 'Medium Risk Area'}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {isTh ? 'ความเสี่ยงต่ำ (Low Risk)' : 'Low Risk Area'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* 1. Header & QR Scanner Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <QrCode className="w-4 h-4" />
          <span>{isTh ? 'เครื่องมือสแกน QR PPE ประจำจุด' : 'PPE QR Site Scanner'}</span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-white">
          {t.ppeScanTitle}
        </h2>
        <p className="text-xs text-slate-400 mt-1">{t.ppeScanDesc}</p>

        {/* Interactive QR Simulation Viewfinder */}
        <div className="mt-4 p-4 bg-slate-800/80 rounded-2xl border-2 border-dashed border-emerald-500/50 relative max-w-xs mx-auto flex flex-col items-center justify-center min-h-[140px]">
          {isScanningSim ? (
            <div className="space-y-2 py-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-emerald-400 font-bold">
                {isTh ? 'กำลังอ่านรหัส QR จุดตรวจ...' : 'Reading QR tag...'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 mx-auto shadow-md flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {currentSite?.siteId}
              </p>
              <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                ✓ {isTh ? 'ตรวจสอบพิกัดตรงกัน' : 'QR Verified'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Select Site Dropdown (Simulator) */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          {t.selectSiteSim}
        </label>
        <select
          id="select-ppe-site"
          value={selectedSiteId}
          onChange={(e) => handleSimulateScan(e.target.value)}
          className="w-full min-h-[52px] px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
        >
          {(sites || []).map((site) => (
            <option key={site.siteId} value={site.siteId}>
              {site.siteId} — {isTh ? site.siteName : site.siteNameEn}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Site PPE Details Card */}
      {currentSite && (
        <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-200 space-y-4">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentSite.location}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                {isTh ? currentSite.siteName : currentSite.siteNameEn}
              </h3>
            </div>
            {getRiskBadge(currentSite.riskLevel)}
          </div>

          {/* Required PPE Badges */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.requiredPpeList}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(currentSite.requiredPPE || []).map((ppe, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs font-bold text-emerald-950"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>{ppe}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Work Instructions */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>{t.workInstruction}</span>
            </h4>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              {isTh ? currentSite.workInstruction : currentSite.workInstructionEn}
            </p>
          </div>

          {/* Supervisor Contact */}
          {currentSite.supervisorName && (
            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">
                  {isTh ? 'ผู้ควบคุมพื้นที่ / Supervisor' : 'Site Supervisor'}
                </span>
                <span className="font-semibold text-slate-800">
                  {currentSite.supervisorName}
                </span>
              </div>
              {currentSite.supervisorPhone && (
                <a
                  href={`tel:${currentSite.supervisorPhone.replace(/\D/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 border border-slate-300"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentSite.supervisorPhone}</span>
                </a>
              )}
            </div>
          )}

          {/* Direct CTA: Jump to Pre-Work Checklist for this site */}
          <button
            onClick={() => onNavigate('checklist')}
            className="w-full min-h-[52px] p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>{isTh ? 'เริ่มทำ Checklist ความปลอดภัยจุดนี้' : 'Start Pre-work Checklist'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
