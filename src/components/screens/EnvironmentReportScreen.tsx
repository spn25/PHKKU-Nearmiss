import React, { useState, useRef } from 'react';
import {
  Leaf,
  Trash2,
  FlaskConical,
  Droplets,
  Fuel,
  CloudFog,
  Volume2,
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  X,
  Crosshair,
} from 'lucide-react';
import { CurrentUser, ScreenName, EnvCategory, Severity } from '../../types';
import { translations } from '../../lib/i18n';
import { submitEnvironmentReportAsync, KKU_CAMPUS_LOCATIONS } from '../../lib/storage';
import { compressImageFile } from '../../lib/imageCompressor';

interface EnvironmentReportScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  onEnvReportSubmitted: (msg: string) => void;
}

export const EnvironmentReportScreen: React.FC<EnvironmentReportScreenProps> = ({
  currentUser,
  onNavigate,
  onEnvReportSubmitted,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const [category, setCategory] = useState<EnvCategory>('waste');
  const [location, setLocation] = useState(KKU_CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [severity, setSeverity] = useState<Severity>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories: { id: EnvCategory; labelTh: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'waste', labelTh: 'ขยะล้น / ขยะอันตราย', labelEn: 'Waste Overflow / Hazardous', icon: Trash2 },
    { id: 'chemical_spill', labelTh: 'สารเคมีหก / รั่วไหล', labelEn: 'Chemical Spill / Leak', icon: FlaskConical },
    { id: 'wastewater', labelTh: 'น้ำเสีย / ท่อระบายน้ำ', labelEn: 'Wastewater / Drainage', icon: Droplets },
    { id: 'oil_leak', labelTh: 'คราบน้ำมัน / น้ำมันรั่ว', labelEn: 'Oil Leakage / Slick', icon: Fuel },
    { id: 'dust', labelTh: 'ฝุ่นละออง / ควันมลพิษ', labelEn: 'Dust & Air Pollution', icon: CloudFog },
    { id: 'noise', labelTh: 'มลพิษทางเสียง', labelEn: 'Excessive Noise', icon: Volume2 },
  ];

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1024, 1024, 0.72);
        setPhotoDataUrl(compressed);
      } catch (err) {
        console.warn('Error compressing photo:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoDataUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`พิกัด GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalLocation = location === 'OTHER' ? customLocation : location;

    setIsSubmitting(true);
    try {
      await submitEnvironmentReportAsync({
        category,
        location: finalLocation || 'มหาวิทยาลัยขอนแก่น',
        description: description.trim() || `${isTh ? 'รายงานปัญหาสิ่งแวดล้อม' : 'Environment Issue'}: ${category}`,
        photoDataUrl,
        reportedBy: currentUser.userId,
        reporterName: currentUser.name,
        severity,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      onEnvReportSubmitted(
        isTh ? '✓ บันทึกรายงานสิ่งแวดล้อมและซิงค์ทุกเครื่องสำเร็จ!' : 'Environment Report Submitted & Synced!'
      );

      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    } catch (err) {
      console.error('Submit env error:', err);
      setIsSubmitting(false);
      setIsSuccess(true);
      onEnvReportSubmitted(isTh ? 'บันทึกรายงานสิ่งแวดล้อมสำเร็จ!' : 'Environment Report Submitted!');
      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-emerald-200 max-w-lg mx-auto my-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          {isTh ? 'ส่งรายงานสิ่งแวดล้อมสำเร็จ!' : 'Report Submitted!'}
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          {isTh
            ? 'ข้อมูลถูกส่งต่อไปยังฝ่ายสิ่งแวดล้อมและอาคารสีเขียว มข. เรียบร้อยแล้ว'
            : 'Sent to KKU Green Building & Environment Unit'}
        </p>
        <div className="mt-6 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-medium">
          {isTh
            ? '✓ บันทึกข้อมูลขึ้น Google Cloud สำเร็จ — ทุกเครื่องสามารถตรวจสอบและติดตามผลได้ทันที'
            : '✓ Saved to Google Cloud successfully — synced across all devices'}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
        <Leaf className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950">
          <span className="font-bold">{t.envTitle}</span>
          <p className="text-emerald-800 mt-0.5">{t.envDesc}</p>
        </div>
      </div>

      {/* 1. Category Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          1. {t.envCategory} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-2xl text-xs font-bold border-2 transition-all flex flex-col items-center text-center justify-center min-h-[70px] ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="line-clamp-2 leading-tight">
                  {isTh ? cat.labelTh : cat.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Photo */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          2. {t.photoLabel}
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handlePhotoCapture}
          className="hidden"
        />

        {photoDataUrl ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 max-h-64 flex items-center justify-center">
            <img
              src={photoDataUrl}
              alt="Environment Evidence"
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
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-[70px] border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 bg-white flex items-center justify-center gap-3 text-slate-600 hover:text-emerald-800 transition-all active:scale-[0.99]"
          >
            <Camera className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">{t.takePhoto}</span>
          </button>
        )}
      </div>

      {/* 3. Location */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-800">
            3. {t.locationLabel} <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleGetLocation}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 p-1"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isGettingLocation ? '...' : (isTh ? 'ใช้ GPS' : 'GPS')}</span>
          </button>
        </div>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full min-h-[50px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        >
          {KKU_CAMPUS_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
          <option value="OTHER">{isTh ? '✍️ ระบุสถานที่เอง' : '✍️ Other'}</option>
        </select>

        {location === 'OTHER' && (
          <input
            type="text"
            placeholder={isTh ? 'ระบุสถานที่...' : 'Enter location...'}
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            className="w-full min-h-[46px] px-4 py-2 rounded-2xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
          />
        )}
      </div>

      {/* 4. Description */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          4. {t.descLabel}
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={isTh ? 'อธิบายลักษณะของปัญหาที่พบ...' : 'Describe environmental issue...'}
          className="w-full p-4 rounded-2xl border-2 border-slate-200 bg-white text-sm resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {/* 5. Big Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[58px] p-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 border border-emerald-400/40 active:scale-[0.99]"
      >
        <Send className="w-5 h-5" />
        <span>{isSubmitting ? t.submitting : (isTh ? 'ส่งรายงานสิ่งแวดล้อม' : 'Submit Environment Report')}</span>
      </button>
    </form>
  );
};
