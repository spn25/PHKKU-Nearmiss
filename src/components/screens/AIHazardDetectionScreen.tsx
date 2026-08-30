import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { CurrentUser, ScreenName } from '../../types';
import { translations } from '../../lib/i18n';
import { analyzeHazardPhoto, AIHazardResult } from '../../lib/storage';

interface AIHazardDetectionScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  onSelectForNearMiss: (prefillData: {
    type: 'unsafe_act' | 'unsafe_condition' | 'near_miss';
    description: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
    photoDataUrl?: string;
    aiAnalysisTag: string;
  }) => void;
}

export const AIHazardDetectionScreen: React.FC<AIHazardDetectionScreenProps> = ({
  currentUser,
  onNavigate,
  onSelectForNearMiss,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIHazardResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset sample photo generator for quick instant demo if camera isn't convenient
  const loadDemoPhoto = (scenarioIndex: number) => {
    // Generate clean canvas placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (scenarioIndex === 0) {
        // Construction / Workshop scenario
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#334155';
        ctx.fillRect(40, 60, 560, 360);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 22px Kanit, sans-serif';
        ctx.fillText('⚡ KKU Workshop & Construction Area (Site Demo)', 60, 110);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Kanit, sans-serif';
        ctx.fillText('Worker operating machinery near walkway', 60, 150);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(80, 200, 200, 180);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Kanit, sans-serif';
        ctx.fillText('No Helmet Zone', 100, 300);
      } else {
        // Lab / Chemical scenario
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(40, 60, 560, 360);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px Kanit, sans-serif';
        ctx.fillText('🧪 KKU Science Chemical Laboratory (Demo)', 60, 110);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(340, 180, 220, 190);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Kanit, sans-serif';
        ctx.fillText('Unlabeled Chemical Spill', 360, 280);
      }
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotoDataUrl(dataUrl);
      runAnalysis(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPhotoDataUrl(dataUrl);
        runAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (dataUrl: string) => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      const res = await analyzeHazardPhoto(dataUrl);
      setResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTransferToNearMiss = () => {
    if (!result || result.hazards.length === 0) return;
    const primaryHazard = result.hazards[0];
    onSelectForNearMiss({
      type: primaryHazard.type,
      description: `${isTh ? primaryHazard.label : primaryHazard.labelEn} — ข้อแนะนำ: ${isTh ? primaryHazard.recommendation : primaryHazard.recommendationEn}`,
      location: primaryHazard.locationSuggestion,
      severity: primaryHazard.severity,
      photoDataUrl: photoDataUrl || undefined,
      aiAnalysisTag: `AI_CONFIDENCE_${result.confidence}%`,
    });
    onNavigate('near_miss');
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-indigo-700/40">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AI Computer Vision Simulator (Offline Rule-Based)</span>
        </div>
        <h2 className="text-xl font-black text-white">{t.aiHazardTitle}</h2>
        <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
          {t.aiHazardDesc}
        </p>
      </div>

      {/* Photo Capture / Upload Area */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {!photoDataUrl ? (
        <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-indigo-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.uploadToScan}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isTh
                ? 'ถ่ายภาพพื้นที่ทำงาน เครื่องจักร หรือจุดที่น่าสงสัยว่ามีอันตราย'
                : 'Take a photo of the workspace, machinery, or potential hazards'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[50px] px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>{t.takePhoto}</span>
            </button>
            <button
              onClick={() => loadDemoPhoto(0)}
              className="flex-1 min-h-[50px] px-4 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl border border-slate-300 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isTh ? 'ลองภาพตัวอย่าง' : 'Try Demo Image'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Photo View with AI Bounding Box Overlay */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-indigo-400 shadow-md">
            <img
              src={photoDataUrl}
              alt="Analyzed Scene"
              className="w-full max-h-72 object-contain mx-auto"
              referrerPolicy="no-referrer"
            />

            {/* Visual bounding boxes overlay */}
            {result?.hazards.map((h, i) => (
              <div
                key={i}
                style={{
                  top: `${h.bbox?.y || 25}%`,
                  left: `${h.bbox?.x || 25}%`,
                  width: `${h.bbox?.width || 50}%`,
                  height: `${h.bbox?.height || 40}%`,
                }}
                className="absolute border-2 border-red-500 bg-red-500/20 rounded-lg flex items-start p-1 animate-pulse pointer-events-none"
              >
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  🚨 {h.severity.toUpperCase()} HAZARD
                </span>
              </div>
            ))}

            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => {
                  setPhotoDataUrl(null);
                  setResult(null);
                }}
                className="px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-bold backdrop-blur-sm flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isTh ? 'ถ่ายใหม่' : 'Retake'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-2">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-indigo-900">{t.analyzing}</p>
              <p className="text-[11px] text-indigo-600 font-mono">
                Running PPE Classifier & Safety Rule Engine...
              </p>
            </div>
          )}

          {/* AI Result Card */}
          {result && (
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t.analysisResult}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      AI Confidence: {result.confidence}% (High Certainty)
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    result.hazardDetected
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {result.hazardDetected
                    ? (isTh ? 'ตรวจพบจุดเสี่ยง!' : 'Hazard Found!')
                    : (isTh ? 'ปลอดภัย' : 'Safe Area')}
                </span>
              </div>

              {/* Detected Hazards List */}
              {result.hazards.length > 0 ? (
                <div className="space-y-2.5">
                  {result.hazards.map((h, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 space-y-1 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-red-950 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          {isTh ? h.label : h.labelEn}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-200 text-red-900 uppercase">
                          {h.severity}
                        </span>
                      </div>
                      <p className="text-xs text-red-900 font-medium">
                        💡 {isTh ? h.recommendation : h.recommendationEn}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs text-emerald-900 font-medium">
                  ✓ ไม่พบความเสี่ยงที่ผิดปกติ ผู้ปฏิบัติงานสวมใส่อุปกรณ์ PPE ครบถ้วน
                </div>
              )}

              {/* PPE Verification Breakdown */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-700">
                  {isTh ? 'การตรวจสอบอุปกรณ์คุ้มครอง (PPE Detection):' : 'Detected PPE Checklist:'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {result.detectedPPE.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                        item.status === 'detected'
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-red-50/60 border-red-200 text-red-900 font-bold'
                      }`}
                    >
                      <span className="line-clamp-1">{item.item}</span>
                      {item.status === 'detected' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer CTA Button */}
              {result.hazardDetected && (
                <button
                  onClick={handleTransferToNearMiss}
                  className="w-full min-h-[54px] p-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t.convertToReport}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
