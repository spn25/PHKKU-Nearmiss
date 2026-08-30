import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CheckSquare,
  Square,
  Shield,
  Send,
} from 'lucide-react';
import { CurrentUser, ScreenName, ChecklistItem } from '../../types';
import { translations } from '../../lib/i18n';
import { submitChecklist, KKU_CAMPUS_LOCATIONS } from '../../lib/storage';

interface ChecklistScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  onChecklistSubmitted: (msg: string) => void;
}

const CHECKLIST_TEMPLATES: Record<string, ChecklistItem[]> = {
  general: [
    {
      id: 'g-1',
      label: 'สวมใส่อุปกรณ์ PPE ครบถ้วนตามที่กำหนดในพื้นที่ (หมวก, แว่นตา, รองเท้าเซฟตี้)',
      labelEn: 'Wear all mandatory PPE specified for the area (Hardhat, Glasses, Safety Shoes)',
      category: 'ppe',
      checked: false,
      required: true,
    },
    {
      id: 'g-2',
      label: 'ร่างกายพร้อมปฏิบัติงาน ไม่มีอาการมึนเมา ง่วงนอน หรืออ่อนเพลียจัด',
      labelEn: 'Physically fit for work; no severe fatigue, alcohol, or medication impairment',
      category: 'health',
      checked: false,
      required: true,
    },
    {
      id: 'g-3',
      label: 'พื้นที่ปฏิบัติงานสะอาด ไม่มีสิ่งกีดขวางทางเดิน และพื้นไม่ลื่น',
      labelEn: 'Workplace is tidy, walkways unobstructed, and floors free from slip hazards',
      category: 'area',
      checked: false,
      required: true,
    },
    {
      id: 'g-4',
      label: 'เครื่องมือและอุปกรณ์อยู่ในสภาพสมบูรณ์ ไม่ชำรุด มีสายดินหรือฉนวนหุ้มครบ',
      labelEn: 'Tools and equipment in safe working condition with proper grounding/insulation',
      category: 'tools',
      checked: false,
      required: true,
    },
    {
      id: 'g-5',
      label: 'ทราบตำแหน่งถังดับเพลิง ทางหนีไฟ และเบอร์โทรฉุกเฉิน มข.',
      labelEn: 'Aware of fire extinguisher location, emergency egress, and KKU emergency hotlines',
      category: 'area',
      checked: false,
      required: true,
    },
  ],
  hot_work: [
    {
      id: 'hw-1',
      label: 'ได้รับใบอนุญาตทำงานที่มีความร้อนและประกายไฟ (Hot Work Permit)',
      labelEn: 'Authorized Hot Work Permit is obtained and displayed at worksite',
      category: 'area',
      checked: false,
      required: true,
    },
    {
      id: 'hw-2',
      label: 'สวมหน้ากากเชื่อม แว่นตัดแสง และถุงมือหนังกันสะเก็ดไฟ',
      labelEn: 'Wear welding shield/goggles and heavy leather welding gloves',
      category: 'ppe',
      checked: false,
      required: true,
    },
    {
      id: 'hw-3',
      label: 'เคลื่อนย้ายสารไวไฟ/วัสดุติดไฟออกจากรัศมี 10 เมตร หรือคลุมด้วยผ้ากันไฟ',
      labelEn: 'Clear all flammable items within 10m radius or cover with fire-blankets',
      category: 'area',
      checked: false,
      required: true,
    },
    {
      id: 'hw-4',
      label: 'มีถังดับเพลิงเคมีแห้งขนาด 15 ปอนด์ ประจำจุดอย่างน้อย 1 ถัง',
      labelEn: 'At least one certified dry chemical fire extinguisher standby within reach',
      category: 'machinery',
      checked: false,
      required: true,
    },
    {
      id: 'hw-5',
      label: 'มีผู้เฝ้าระวังไฟ (Fire Watcher) ประจำตลอดการทำงาน',
      labelEn: 'Designated Fire Watcher assigned on-site during and 30 mins after hot work',
      category: 'area',
      checked: false,
      required: true,
    },
  ],
  lab_work: [
    {
      id: 'lab-1',
      label: 'สวมเสื้อกาวน์ แว่นตานิรภัย/Goggles และถุงมือที่ทนต่อสารเคมี',
      labelEn: 'Wear lab coat, safety goggles, and chemical-resistant gloves',
      category: 'ppe',
      checked: false,
      required: true,
    },
    {
      id: 'lab-2',
      label: 'ตรวจสอบตู้ดูดควัน (Fume Hood) เปิดพัดลมและแรงลมทำงานปกติ',
      labelEn: 'Inspect chemical fume hood; airflow velocity normal before use',
      category: 'machinery',
      checked: false,
      required: true,
    },
    {
      id: 'lab-3',
      label: 'อ่านเอกสารข้อมูลความปลอดภัยสารเคมี (SDS) ก่อนเริ่มงาน',
      labelEn: 'Reviewed Chemical Safety Data Sheets (SDS) for all chemicals in use',
      category: 'chemical',
      checked: false,
      required: true,
    },
    {
      id: 'lab-4',
      label: 'ตรวจสอบฝักบัวฉุกเฉินและอ่างล้างตาฉุกเฉินสามารถเปิดใช้งานได้',
      labelEn: 'Emergency shower and eyewash station tested and accessible',
      category: 'area',
      checked: false,
      required: true,
    },
    {
      id: 'lab-5',
      label: 'เตรียมถังและภาชนะรองรับของเสียอันตรายแยกตามประเภท',
      labelEn: 'Designated hazardous chemical waste disposal containers prepared and labeled',
      category: 'chemical',
      checked: false,
      required: true,
    },
  ],
  height_work: [
    {
      id: 'h-1',
      label: 'สวมเข็มขัดนิรภัยเต็มตัว (Full Body Harness) พร้อมเชือกนิรภัยคู่คล้องจุดยึด',
      labelEn: 'Wear Full Body Harness with double lanyards hooked to rigid anchorage',
      category: 'ppe',
      checked: false,
      required: true,
    },
    {
      id: 'h-2',
      label: 'ตรวจสอบนั่งร้าน บันได หรือกระเช้า มีความแข็งแรงและล็อกล้อเรียบรม่อง',
      labelEn: 'Inspect scaffold, ladder, or MEWP platform stability & wheel locks',
      category: 'tools',
      checked: false,
      required: true,
    },
    {
      id: 'h-3',
      label: 'กั้นแนวเขตเตือนอันตรายและติดป้ายเตือนบุคคลภายนอกด้านล่าง',
      labelEn: 'Barricade safety perimeter below and install warning signage for pedestrians',
      category: 'area',
      checked: false,
      required: true,
    },
    {
      id: 'h-4',
      label: 'สวมหมวกนิรภัยพร้อมสายรัดคางอย่างแน่นหนา',
      labelEn: 'Wear hardhat with secured chin strap',
      category: 'ppe',
      checked: false,
      required: true,
    },
  ],
};

export const ChecklistScreen: React.FC<ChecklistScreenProps> = ({
  currentUser,
  onNavigate,
  onChecklistSubmitted,
}) => {
  const lang = currentUser.language || 'th';
  const t = translations[lang];
  const isTh = lang === 'th';

  const [selectedTask, setSelectedTask] = useState<string>('general');
  const [area, setArea] = useState<string>(KKU_CAMPUS_LOCATIONS[3]);
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLIST_TEMPLATES.general);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<boolean | null>(null);

  const handleTaskChange = (taskKey: string) => {
    setSelectedTask(taskKey);
    setItems(CHECKLIST_TEMPLATES[taskKey].map((i) => ({ ...i, checked: false })));
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleSelectAll = () => {
    const allChecked = items.every((i) => i.checked);
    setItems((prev) => prev.map((i) => ({ ...i, checked: !allChecked })));
  };

  const handleReset = () => {
    setItems((prev) => prev.map((i) => ({ ...i, checked: false })));
  };

  // Auto calculate pass
  const passedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const isAllPassed = passedCount === totalCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskLabels: Record<string, string> = {
      general: isTh ? 'ความปลอดภัยทั่วไป' : 'General Safety',
      hot_work: isTh ? 'งานประกายไฟ/ตัดเชื่อม (Hot Work)' : 'Hot Work',
      lab_work: isTh ? 'งานห้องปฏิบัติการเคมี (Lab Work)' : 'Chemical Lab Work',
      height_work: isTh ? 'งานบนที่สูง (Work at Height)' : 'Working at Heights',
    };

    submitChecklist({
      userId: currentUser.userId,
      userName: currentUser.name,
      area: area || 'พื้นที่มหาวิทยาลัยขอนแก่น',
      checklistType: taskLabels[selectedTask] || selectedTask,
      items: items.map((i) => ({ label: isTh ? i.label : i.labelEn, checked: i.checked })),
      passed: isAllPassed,
      notes: notes.trim() || undefined,
    });

    setLastSubmissionResult(isAllPassed);
    setIsSubmitted(true);
    onChecklistSubmitted(
      isAllPassed
        ? (isTh ? '✓ บันทึกผลตรวจ: ผ่านเกณฑ์ความปลอดภัย' : '✓ Checklist Passed Successfully')
        : (isTh ? '⚠️ บันทึกผลตรวจ: ไม่ผ่านเกณฑ์ (ต้องแก้ไข)' : '⚠️ Checklist Incomplete')
    );

    setTimeout(() => {
      onNavigate('home');
    }, 1800);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-lg border border-slate-200 max-w-lg mx-auto my-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            lastSubmissionResult
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          {lastSubmissionResult ? (
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          ) : (
            <XCircle className="w-12 h-12 stroke-[2.5]" />
          )}
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {lastSubmissionResult ? t.checklistPassed : t.checklistFailed}
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          {isTh
            ? `ผลการตรวจความพร้อม: ${passedCount}/${totalCount} รายการ • บันทึกเข้าระบบแล้ว`
            : `Verified: ${passedCount}/${totalCount} items completed • Saved in local storage`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* 1. Header description */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <ClipboardCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900">
          <span className="font-bold">{t.checklistTitle}</span>
          <p className="text-emerald-700 mt-0.5">{t.checklistDesc}</p>
        </div>
      </div>

      {/* 2. Select Template Type */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          1. {isTh ? 'เลือกประเภทงานที่กำลังจะปฏิบัติ' : 'Select Work Activity Type'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTaskChange('general')}
            className={`p-3 rounded-2xl text-xs font-bold border-2 transition-all text-left ${
              selectedTask === 'general'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            🛡️ {isTh ? 'ความปลอดภัยทั่วไป' : 'General Safety'}
          </button>

          <button
            type="button"
            onClick={() => handleTaskChange('hot_work')}
            className={`p-3 rounded-2xl text-xs font-bold border-2 transition-all text-left ${
              selectedTask === 'hot_work'
                ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            🔥 {isTh ? 'งานตัดเชื่อม/ประกายไฟ' : 'Hot Work'}
          </button>

          <button
            type="button"
            onClick={() => handleTaskChange('lab_work')}
            className={`p-3 rounded-2xl text-xs font-bold border-2 transition-all text-left ${
              selectedTask === 'lab_work'
                ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            🧪 {isTh ? 'ห้องแล็บ / สารเคมี' : 'Lab / Chemical'}
          </button>

          <button
            type="button"
            onClick={() => handleTaskChange('height_work')}
            className={`p-3 rounded-2xl text-xs font-bold border-2 transition-all text-left ${
              selectedTask === 'height_work'
                ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            🪜 {isTh ? 'งานบนที่สูง' : 'Work at Height'}
          </button>
        </div>
      </div>

      {/* 3. Select Work Area */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          2. {t.areaSelect}
        </label>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
        >
          {KKU_CAMPUS_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Quick Action Helpers */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {isTh ? 'รายการตรวจเช็ก:' : 'Checklist items:'}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              isAllPassed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {passedCount}/{totalCount} {isTh ? 'รายการ' : 'passed'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-1"
          >
            {items.every((i) => i.checked)
              ? (isTh ? 'ยกเลิกทั้งหมด' : 'Uncheck All')
              : (isTh ? '✓ ติ๊กทั้งหมด' : '✓ Check All')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 p-1 flex items-center gap-0.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.resetChecklist}</span>
          </button>
        </div>
      </div>

      {/* 5. Big Checkbox Items (Single hand friendly) */}
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const isChecked = item.checked;
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none active:scale-[0.99] min-h-[64px] ${
                isChecked
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isChecked ? (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl border-2 border-slate-300 bg-slate-50 flex items-center justify-center text-transparent hover:border-emerald-500">
                    <Square className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold leading-snug ${
                    isChecked ? 'text-emerald-950' : 'text-slate-800'
                  }`}
                >
                  {idx + 1}. {isTh ? item.label : item.labelEn}
                </p>
                {isTh && (
                  <p className="text-xs text-slate-600 mt-0.5 font-normal">
                    {item.labelEn}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Optional Notes */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          {isTh ? 'หมายเหตุเพิ่มเติม (ถ้ามี)' : 'Additional Notes (Optional)'}
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={isTh ? 'เช่น เครื่องจักรผ่านการสอบเทียบแล้ว...' : 'e.g. equipment calibrated...'}
          className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* 7. Big Submit Button */}
      <button
        type="submit"
        id="btn-submit-checklist"
        className={`w-full min-h-[58px] p-4 font-black text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 border active:scale-[0.99] ${
          isAllPassed
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white border-emerald-400/30'
            : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 text-white border-amber-400/30'
        }`}
      >
        <Send className="w-5 h-5" />
        <span>
          {isAllPassed
            ? (isTh ? '✓ ยืนยันผ่านเกณฑ์ความปลอดภัย' : '✓ Submit (All Safety Criteria Met)')
            : (isTh ? '⚠️ บันทึกผลตรวจ (มีรายการที่ยังไม่พร้อม)' : '⚠️ Submit (Pending Items)')}
        </span>
      </button>
    </form>
  );
};
