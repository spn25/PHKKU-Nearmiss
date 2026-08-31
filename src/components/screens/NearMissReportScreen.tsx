import React, { useState, useRef } from 'react';
import {
  Camera,
  MapPin,
  AlertTriangle,
  Send,
  CheckCircle2,
  X,
  Upload,
  Crosshair,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  NearMissType,
  Severity,
  CurrentUser,
  ScreenName,
} from '../../types';
import { translations } from '../../lib/i18n';
import {
  submitNearMissReport,
  KKU_CAMPUS_LOCATIONS,
} from '../../lib/storage';

interface NearMissReportScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  onReportSubmitted: (msg: string) => void;
  initialData?: {
    type?: NearMissType;
    description?: string;
    location?: string;
    severity?: Severity;
    photoDataUrl?: string;
    aiAnalysisTag?: string;
  };
}

export const NearMissReportScreen: React.FC<NearMissReportScreenProps> = ({
  currentUser,
  onNavigate,
  onReportSubmitted,
  initialData,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const [type, setType] = useState<NearMissType>(initialData?.type || 'near_miss');
  const [severity, setSeverity] = useState<Severity>(initialData?.severity || 'medium');
  const [location, setLocation] = useState(initialData?.location || '');
  const [customLocation, setCustomLocation] = useState('');
  const [description, setDescription] = useState(initialData?.description || '');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(
    initialData?.photoDataUrl
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Photo Upload / Camera Capture
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(isTh ? 'เบราว์เซอร์ไม่รองรับ GPS' : 'Geolocation is not supported');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `พิกัด GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (มข.)`;
        setLocation(coords);
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        setLocation('บริเวณพื้นที่มหาวิทยาลัยขอนแก่น');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLocation = location === 'OTHER' ? customLocation : location || 'มหาวิทยาลัยขอนแก่น';

    setIsSubmitting(true);

    setTimeout(() => {
      submitNearMissReport({
        type,
        severity,
        location: finalLocation,
        description: description.trim() || (isTh ? 'แจ้งรายงานอันตรายด่วน' : 'Hazard incident report'),
        photoDataUrl,
        reportedBy: currentUser.userId,
        reporterName: currentUser.name,
        aiAnalysisTag: initialData?.aiAnalysisTag,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      onReportSubmitted(isTh ? 'ส่งรายงาน Near Miss สำเร็จแล้ว!' : 'Report Submitted Successfully!');

      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    }, 400);
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-red-200 animate-in zoom-in-95 duration-200 max-w-lg mx-auto my-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {t.reportSuccess}
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {t.reportSuccessDesc}
        </p>
        <div className="mt-6 p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 font-medium">
          {isTh
            ? '✓ บันทึกข้อมูลลงเครื่องสำเร็จและส่งข้อมูลไปยังศูนย์ความปลอดภัยเรียบร้อย'
            : '✓ Stored in Local Storage and notified Safety Center'}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* 1. Header / Guidance */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="text-xs text-red-950 leading-relaxed">
          <span className="font-bold">{t.nearMissTitle}</span>
          <p className="text-red-700 mt-0.5">{t.nearMissDesc}</p>
        </div>
      </div>

      {/* 2. Choose Type (Big 3 Segmented Buttons) */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          1. {t.hazardType} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Near Miss */}
          <button
            type="button"
            id="btn-type-near-miss"
            onClick={() => setType('near_miss')}
            className={`min-h-[58px] p-3 rounded-2xl font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-center text-center ${
              type === 'near_miss'
                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-md ring-2 ring-amber-200'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{isTh ? 'Near Miss' : 'Near Miss'}</span>
              </div>
              <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                {isTh ? 'เกือบเกิดอุบัติเหตุ' : 'Close Call'}
              </p>
            </div>
          </button>

          {/* Unsafe Act */}
          <button
            type="button"
            id="btn-type-unsafe-act"
            onClick={() => setType('unsafe_act')}
            className={`min-h-[58px] p-3 rounded-2xl font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-center text-center ${
              type === 'unsafe_act'
                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-md ring-2 ring-rose-200'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-center gap-1">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>{isTh ? 'พฤติกรรมเสี่ยง' : 'Unsafe Act'}</span>
              </div>
              <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                {isTh ? 'ไม่สวม PPE / ประมาท' : 'Human Behavior'}
              </p>
            </div>
          </button>

          {/* Unsafe Condition */}
          <button
            type="button"
            id="btn-type-unsafe-condition"
            onClick={() => setType('unsafe_condition')}
            className={`min-h-[58px] p-3 rounded-2xl font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-center text-center ${
              type === 'unsafe_condition'
                ? 'bg-red-50 border-red-500 text-red-900 shadow-md ring-2 ring-red-200'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>{isTh ? 'สภาพแวดล้อมเสี่ยง' : 'Unsafe Condition'}</span>
              </div>
              <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                {isTh ? 'สายไฟ / พื้นลื่น / กีดขวาง' : 'Hazard Environment'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Severity Level */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          2. {t.severityLabel} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Low */}
          <button
            type="button"
            id="btn-severity-low"
            onClick={() => setSeverity('low')}
            className={`min-h-[50px] p-2.5 rounded-2xl font-bold text-xs border-2 transition-all flex items-center justify-center ${
              severity === 'low'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-2 ring-emerald-200'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            🟢 {t.severityLow}
          </button>

          {/* Medium */}
          <button
            type="button"
            id="btn-severity-medium"
            onClick={() => setSeverity('medium')}
            className={`min-h-[50px] p-2.5 rounded-2xl font-bold text-xs border-2 transition-all flex items-center justify-center ${
              severity === 'medium'
                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-200'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            🟡 {t.severityMedium}
          </button>

          {/* High */}
          <button
            type="button"
            id="btn-severity-high"
            onClick={() => setSeverity('high')}
            className={`min-h-[50px] p-2.5 rounded-2xl font-bold text-xs border-2 transition-all flex items-center justify-center ${
              severity === 'high'
                ? 'bg-red-50 border-red-500 text-red-900 shadow-sm ring-2 ring-red-200'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            🔴 {t.severityHigh}
          </button>
        </div>
      </div>

      {/* 4. Photo Capture / Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          3. {t.photoLabel}
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handlePhotoCapture}
          className="hidden"
          id="photo-upload-input"
        />

        {photoDataUrl ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-red-500 bg-slate-900 max-h-64 flex items-center justify-center">
            <img
              src={photoDataUrl}
              alt="Hazard Evidence"
              className="max-h-64 w-full object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setPhotoDataUrl(undefined)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
              <span>{t.photoAttached}</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            id="btn-trigger-camera"
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-[76px] border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-4 bg-white flex items-center justify-center gap-3 text-slate-600 hover:text-red-700 transition-all group active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 group-hover:text-red-700">
                {t.takePhoto}
              </p>
              <p className="text-xs text-slate-400">
                {isTh ? 'แตะเพื่อเปิดกล้องมือถือ หรือเลือกไฟล์รูป' : 'Tap to open camera or browse files'}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* 5. Location in KKU */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-800">
            4. {t.locationLabel} <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 p-1"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isGettingLocation ? (isTh ? 'กำลังค้นหา...' : 'Locating...') : (isTh ? 'ใช้ GPS ปัจจุบัน' : 'Use GPS')}</span>
          </button>
        </div>

        <select
          id="select-kku-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full min-h-[52px] px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
          required
        >
          <option value="">-- {t.locationPlaceholder} --</option>
          {KKU_CAMPUS_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
          <option value="OTHER">{isTh ? '✍️ ระบุสถานที่อื่น ๆ เอง' : '✍️ Specify other location'}</option>
        </select>

        {location === 'OTHER' && (
          <input
            type="text"
            placeholder={isTh ? 'พิมพ์ระบุชื่ออาคาร / ชั้น / ห้อง...' : 'Enter building / floor / area...'}
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-red-500"
            required
          />
        )}
      </div>

      {/* 6. Short Description (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          5. {t.descLabel}
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.descPlaceholder}
          className="w-full p-4 rounded-2xl border-2 border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
        />
      </div>

      {/* 7. Big Touch Submit Button (<30s Action) */}
      <button
        type="submit"
        id="btn-submit-near-miss"
        disabled={isSubmitting}
        className="w-full min-h-[58px] p-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 active:scale-[0.99] text-white font-black text-base sm:text-lg rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 border border-red-400/30 disabled:opacity-50"
      >
        <Send className="w-5 h-5" />
        <span>{isSubmitting ? t.submitting : t.submitReport}</span>
      </button>
    </form>
  );
};
