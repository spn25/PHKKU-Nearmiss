import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Trash2,
  ShieldCheck,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';
import { ReportStatus } from '../types';
import { compressImageFile } from '../lib/imageCompressor';

interface AdminResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportItem: {
    id: string;
    kind: 'hazard' | 'env';
    title: string;
    location: string;
    status: ReportStatus;
    photoDataUrl?: string;
    resolvedPhotoDataUrl?: string;
    adminNote?: string;
  };
  onSave: (id: string, kind: 'hazard' | 'env', status: ReportStatus, note: string, resolvedPhotoUrl?: string) => void;
  isTh: boolean;
}

export const AdminResolutionModal: React.FC<AdminResolutionModalProps> = ({
  isOpen,
  onClose,
  reportItem,
  onSave,
  isTh,
}) => {
  if (!isOpen) return null;

  const [status, setStatus] = useState<ReportStatus>(reportItem.status || 'resolved');
  const [note, setNote] = useState<string>(reportItem.adminNote || '');
  const [resolvedPhoto, setResolvedPhoto] = useState<string | undefined>(reportItem.resolvedPhotoDataUrl);
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 1024, 1024, 0.72);
      setResolvedPhoto(compressed);
    } catch (err) {
      console.warn('Error compressing resolution photo, falling back to raw:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setResolvedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setResolvedPhoto(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(reportItem.id, reportItem.kind, status, note, resolvedPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {isTh ? 'อัปเดตสถานะและแนบรูปภาพหลังแก้ไข' : 'Update Status & Resolution Proof'}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                {isTh ? 'โหมดผู้ดูแลระบบ / จป. (Admin Action)' : 'Admin Resolution Management'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-slate-900">
          {/* Report Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isTh ? 'รายการที่แจ้ง:' : 'Incident Report:'}
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2">
              {reportItem.title}
            </p>
            <p className="text-[11px] text-slate-500">
              📍 {reportItem.location}
            </p>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {isTh ? 'เลือกสถานะการดำเนินการ:' : 'Select Resolution Status:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('new')}
                className={`p-2.5 rounded-2xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  status === 'new'
                    ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🔴</span>
                <span>{isTh ? 'รอดำเนินการ' : 'New'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`p-2.5 rounded-2xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  status === 'in_progress'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🟡</span>
                <span>{isTh ? 'กำลังดำเนินการ' : 'In Progress'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('resolved')}
                className={`p-2.5 rounded-2xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  status === 'resolved'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🟢</span>
                <span>{isTh ? 'แก้ไขแล้ว ✓' : 'Resolved ✓'}</span>
              </button>
            </div>
          </div>

          {/* Photo Comparison Tabs (Before vs After) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>{isTh ? 'รูปภาพหลักฐานการแก้ไข (Before & After):' : 'Before & After Proof:'}</span>
              </label>

              {/* View switcher */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('after')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeTab === 'after'
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isTh ? '✨ ภาพหลังแก้ไข' : '✨ After'}
                </button>
                {reportItem.photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('before')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeTab === 'before'
                        ? 'bg-white text-indigo-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {isTh ? '📸 ภาพก่อนแก้ไข' : '📸 Before'}
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'after' ? (
              <div className="space-y-2">
                {resolvedPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 max-h-52 flex items-center justify-center group">
                    <img
                      src={resolvedPhoto}
                      alt="Resolved / After proof"
                      className="max-h-52 w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isTh ? 'รูปหลังการแก้ไข (After)' : 'After Resolution'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all active:scale-95"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group active:scale-[0.99]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 group-hover:bg-indigo-200 text-indigo-700 flex items-center justify-center transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-950">
                        {isTh ? 'คลิกหรือถ่ายรูปภาพหลังการแก้ไข' : 'Upload or Take After-Resolution Photo'}
                      </p>
                      <p className="text-[11px] text-indigo-600/80 mt-0.5">
                        {isTh ? 'รองรับ JPG, PNG หรือกล้องมือถือ' : 'Supports JPG, PNG or Camera'}
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 max-h-52 flex items-center justify-center">
                <img
                  src={reportItem.photoDataUrl}
                  alt="Original / Before incident"
                  className="max-h-52 w-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-slate-800/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  {isTh ? '📸 รูปภาพแจ้งเหตุตอนแรก (Before)' : 'Initial Report Photo'}
                </div>
              </div>
            )}
          </div>

          {/* Admin Note / Resolution Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>{isTh ? 'บันทึกการปฏิบัติงาน / หมายเหตุการแก้ไข:' : 'Action & Resolution Notes:'}</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isTh
                  ? 'ระบุการดำเนินการ เช่น "ทีมช่างกองอาคารสถานที่ได้เปลี่ยนสายไฟใหม่และปิดฝาครอบเรียบร้อยแล้วเมื่อ 14:30 น."'
                  : 'Specify actions taken e.g. "Maintenance team replaced wiring and sealed junction box."'
              }
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all"
            >
              {isTh ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isTh ? 'บันทึกการแก้ไข' : 'Save Resolution'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
