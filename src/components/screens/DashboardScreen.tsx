import React, { useState } from 'react';
import {
  BarChart3,
  AlertTriangle,
  ShieldAlert,
  Leaf,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Filter,
  CheckCheck,
  ChevronRight,
  TrendingUp,
  Lock,
  Unlock,
  ShieldCheck,
  Trash2,
  FileEdit,
  KeyRound,
  LogOut,
} from 'lucide-react';
import {
  CurrentUser,
  ScreenName,
  NearMissReport,
  EnvReport,
  ReportStatus,
} from '../../types';
import { translations } from '../../lib/i18n';
import {
  getDashboardStats,
  updateNearMissStatus,
  updateEnvReportStatus,
  deleteNearMissReport,
  deleteEnvReport,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from '../../lib/storage';
import { AdminPasscodeModal } from '../AdminPasscodeModal';

interface DashboardScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  nearMissReports?: NearMissReport[];
  envReports?: EnvReport[];
  onRefreshData?: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'info') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentUser,
  nearMissReports = [],
  envReports = [],
  onRefreshData = () => {},
  onShowToast = (_msg?: string, _type?: 'success' | 'danger' | 'info') => {},
}) => {
  const lang = currentUser?.language || 'th';
  const t = translations[lang] || translations.th;
  const isTh = lang === 'th';

  const stats = getDashboardStats();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'hazard' | 'env'>('all');

  // Admin state & passcode modal
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminAuthenticated());
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    id: string;
    kind: 'hazard' | 'env';
    newStatus: ReportStatus;
  } | null>(null);

  // Note editing state for Admin
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const safeNearMiss = Array.isArray(nearMissReports) ? nearMissReports : [];
  const safeEnv = Array.isArray(envReports) ? envReports : [];

  // Combine all report items
  const allReportItems = [
    ...safeNearMiss.map((r) => ({
      id: r.id,
      rawType: r.type,
      kind: 'hazard' as const,
      title: r.description || r.type,
      location: r.location,
      status: r.status,
      severity: r.severity,
      reporter: r.reporterName || 'นิรนาม (Anonymous)',
      createdAt: r.createdAt,
      aiTag: r.aiAnalysisTag,
      photoDataUrl: r.photoDataUrl,
      adminNote: r.adminNote,
      resolvedAt: r.resolvedAt,
    })),
    ...safeEnv.map((e) => ({
      id: e.id,
      rawType: e.category,
      kind: 'env' as const,
      title: `[${(e.category || '').toUpperCase()}] ${e.description || ''}`,
      location: e.location,
      status: e.status,
      severity: e.severity || 'medium',
      reporter: e.reporterName || 'ผู้แจ้งสิ่งแวดล้อม',
      createdAt: e.createdAt,
      aiTag: undefined,
      photoDataUrl: e.photoDataUrl,
      adminNote: e.adminNote,
      resolvedAt: e.resolvedAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter items
  const filteredItems = allReportItems.filter((item) => {
    if (activeTab !== 'all' && item.status !== activeTab) return false;
    if (selectedTypeFilter !== 'all' && item.kind !== selectedTypeFilter) return false;
    return true;
  });

  const handleRequestStatusChange = (id: string, kind: 'hazard' | 'env', newStatus: ReportStatus) => {
    if (!isAdmin) {
      setPendingStatusUpdate({ id, kind, newStatus });
      setIsPasscodeModalOpen(true);
      return;
    }
    executeStatusUpdate(id, kind, newStatus);
  };

  const executeStatusUpdate = (id: string, kind: 'hazard' | 'env', newStatus: ReportStatus, note?: string) => {
    if (kind === 'hazard') {
      updateNearMissStatus(id, newStatus, note);
    } else {
      updateEnvReportStatus(id, newStatus, note);
    }
    onRefreshData();
    onShowToast(
      isTh
        ? `✓ [แอดมิน] อัปเดตสถานะเป็น: ${newStatus === 'resolved' ? 'แก้ไขแล้ว' : newStatus === 'in_progress' ? 'กำลังดำเนินการ' : 'รอดำเนินการ'}`
        : `✓ [Admin] Status updated to ${newStatus}`,
      'success'
    );
  };

  const handleAdminAuthSuccess = () => {
    setIsAdmin(true);
    setAdminAuthenticated(true);
    onShowToast(
      isTh
        ? '✓ เข้าสู่ระบบแอดมินสำเร็จ! ท่านสามารถจัดการสถานะได้แล้ว'
        : '✓ Admin unlocked! You can now manage report statuses.',
      'success'
    );

    // If user clicked a specific button before unlocking
    if (pendingStatusUpdate) {
      executeStatusUpdate(
        pendingStatusUpdate.id,
        pendingStatusUpdate.kind,
        pendingStatusUpdate.newStatus
      );
      setPendingStatusUpdate(null);
    }
  };

  const handleLogoutAdmin = () => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
    onShowToast(
      isTh
        ? '🔒 ออกจากโหมดแอดมินแล้ว (กลับสู่โหมดผู้ใช้ทั่วไป)'
        : '🔒 Switched back to General User mode',
      'info'
    );
  };

  const handleDeleteReport = (id: string, kind: 'hazard' | 'env') => {
    if (!isAdmin) {
      setIsPasscodeModalOpen(true);
      return;
    }
    if (window.confirm(isTh ? 'ต้องการลบรายงานนี้ใช่หรือไม่?' : 'Delete this report?')) {
      if (kind === 'hazard') {
        deleteNearMissReport(id);
      } else {
        deleteEnvReport(id);
      }
      onRefreshData();
      onShowToast(isTh ? '✓ ลบรายการเรียบร้อยแล้ว' : '✓ Report deleted', 'info');
    }
  };

  const handleSaveNote = (id: string, kind: 'hazard' | 'env', currentStatus: ReportStatus) => {
    if (kind === 'hazard') {
      updateNearMissStatus(id, currentStatus, noteText);
    } else {
      updateEnvReportStatus(id, currentStatus, noteText);
    }
    setEditingNoteId(null);
    setNoteText('');
    onRefreshData();
    onShowToast(isTh ? '✓ บันทึกหมายเหตุการแก้ไขแล้ว' : '✓ Admin note saved', 'success');
  };

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* Admin Passcode Modal */}
      <AdminPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => {
          setIsPasscodeModalOpen(false);
          setPendingStatusUpdate(null);
        }}
        onSuccess={handleAdminAuthSuccess}
        isTh={isTh}
      />

      {/* 1. Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Safety Officer & Executive Management</span>
          </div>

          {/* Admin badge */}
          {isAdmin ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Active</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>User Mode</span>
            </span>
          )}
        </div>

        <h2 className="text-xl font-black text-white">{t.dashboardTitle}</h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {t.dashboardDesc}
        </p>
      </div>

      {/* 2. Access Level & Role Banner */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isAdmin
            ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-emerald-500/40 text-emerald-100 shadow-sm'
            : 'bg-white border-amber-200 shadow-sm text-slate-800'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isAdmin
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isAdmin ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider">
                  {isAdmin
                    ? (isTh ? '🛡️ โหมดผู้ดูแลระบบ (Admin Mode)' : '🛡️ Admin Authorized')
                    : (isTh ? '👤 โหมดผู้ใช้ทั่วไป (General User Mode)' : '👤 General User Mode')}
                </h4>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isAdmin
                  ? (isTh
                      ? 'ท่านมีสิทธิ์จัดการและอัปเดตสถานะการดำเนินงานแก้ไขปัญหา รวมถึงบันทึกหมายเหตุการซ่อมบำรุง'
                      : 'You have full permission to update task statuses and manage maintenance records.')
                  : (isTh
                      ? 'ผู้ใช้ทั่วไปสามารถแจ้งปัญหาและดูความคืบหน้าได้เท่านั้น การแก้ไขสถานะต้องใช้รหัสผ่านแอดมิน'
                      : 'General users can only report and view incidents. Enter admin passcode to edit status.')}
              </p>
            </div>
          </div>

          {/* Action button to unlock or logout admin */}
          <div className="shrink-0">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleLogoutAdmin}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-200 border border-slate-600 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isTh ? 'ออกจากแอดมิน' : 'Lock Admin'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPasscodeModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isTh ? 'เข้าสู่ระบบแอดมิน' : 'Admin Login'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Key Metrics Grid (4 Blocks) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Near Miss */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[11px] font-bold text-slate-600">Near Miss</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.nearMissCount}</p>
          <span className="text-[10px] text-slate-400">{isTh ? 'เกือบเกิดเหตุ' : 'Incidents'}</span>
        </div>

        {/* Unsafe Acts */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-rose-500 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[11px] font-bold text-slate-600">Unsafe Acts</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.unsafeActCount}</p>
          <span className="text-[10px] text-slate-400">{isTh ? 'พฤติกรรมเสี่ยง' : 'Behaviors'}</span>
        </div>

        {/* Unsafe Conditions */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[11px] font-bold text-slate-600">Unsafe Cond.</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.unsafeConditionCount}</p>
          <span className="text-[10px] text-slate-400">{isTh ? 'สภาพแวดล้อม' : 'Hazards'}</span>
        </div>

        {/* Environment Reports */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <Leaf className="w-4 h-4" />
            <span className="text-[11px] font-bold text-slate-600">Environment</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalEnvReports}</p>
          <span className="text-[10px] text-slate-400">{isTh ? 'รายงานขยะ/น้ำ' : 'Eco Reports'}</span>
        </div>
      </div>

      {/* 4. Status Pipeline Summary (New vs In-Progress vs Resolved) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
          <span>{isTh ? 'สถานะการดำเนินงานแก้ไขปัญหา' : 'Resolution Pipeline'}</span>
          <span className="text-slate-400 font-mono text-[11px]">
            {stats.statusResolvedCount}/{stats.totalNearMiss + stats.totalEnvReports} {isTh ? 'แก้ไขแล้ว' : 'Resolved'}
          </span>
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            onClick={() => setActiveTab('new')}
            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-red-50 border-red-500 ring-2 ring-red-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-bold text-red-700 block">
              🔴 {t.statusNew}
            </span>
            <span className="text-xl font-black text-red-900">{stats.statusNewCount}</span>
          </div>

          <div
            onClick={() => setActiveTab('in_progress')}
            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
              activeTab === 'in_progress'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-700 block">
              🟡 {t.statusInProgress}
            </span>
            <span className="text-xl font-black text-amber-900">{stats.statusInProgressCount}</span>
          </div>

          <div
            onClick={() => setActiveTab('resolved')}
            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
              activeTab === 'resolved'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-bold text-emerald-700 block">
              🟢 {t.statusResolved}
            </span>
            <span className="text-xl font-black text-emerald-900">{stats.statusResolvedCount}</span>
          </div>
        </div>
      </div>

      {/* 5. Top Incident Locations in KKU */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{isTh ? 'จุดเสี่ยงสูงสุดตามพื้นที่ (Top Hazard Zones)' : 'Top Hazard Locations'}</span>
        </h3>

        <div className="space-y-2">
          {stats.reportsByLocation.map((loc, idx) => {
            const maxCount = Math.max(...stats.reportsByLocation.map((l) => l.count), 1);
            const pct = Math.round((loc.count / maxCount) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {loc.location}
                  </span>
                  <span className="font-mono text-slate-500 shrink-0">
                    {loc.count} {isTh ? 'เรื่อง' : 'reports'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Reports Table & Status Updater */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {t.recentActivity} ({filteredItems.length})
          </h3>

          <button
            onClick={() => setActiveTab('all')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {isTh ? 'ล้างตัวกรอง' : 'Clear Filters'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: isTh ? 'ทั้งหมด' : 'All' },
            { id: 'new', label: `🔴 ${t.statusNew}` },
            { id: 'in_progress', label: `🟡 ${t.statusInProgress}` },
            { id: 'resolved', label: `🟢 ${t.statusResolved}` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Report Cards with In-line Status Modifier */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 text-slate-400 text-sm">
              {isTh ? 'ไม่มีรายการในหมวดหมู่นี้' : 'No reports found for this filter.'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {item.id} • {item.kind === 'hazard' ? 'SAFETY' : 'ENV'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      item.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status === 'resolved'
                      ? t.statusResolved
                      : item.status === 'in_progress'
                      ? t.statusInProgress
                      : t.statusNew}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.location}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isTh ? 'ผู้แจ้ง:' : 'Reported by:'} {item.reporter} •{' '}
                    {new Date(item.createdAt).toLocaleString(isTh ? 'th-TH' : 'en-US', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                {item.adminNote && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-0.5">
                    <span className="font-bold flex items-center gap-1 text-[11px] text-indigo-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isTh ? 'บันทึกการแก้ไขโดยแอดมิน:' : 'Admin Action Record:'}
                    </span>
                    <p className="text-slate-700">{item.adminNote}</p>
                  </div>
                )}

                {item.photoDataUrl && (
                  <div className="rounded-xl overflow-hidden max-h-36 bg-slate-900 flex items-center justify-center">
                    <img
                      src={item.photoDataUrl}
                      alt="Report Attachment"
                      className="max-h-36 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Status Switcher & Management Section */}
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-600">
                        {t.updateStatus}:
                      </span>
                      {!isAdmin && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-amber-200/60">
                          <Lock className="w-3 h-3" />
                          {isTh ? 'เฉพาะแอดมิน' : 'Admin only'}
                        </span>
                      )}
                    </div>

                    {/* Status Switcher Buttons */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleRequestStatusChange(item.id, item.kind, 'new')}
                        disabled={item.status === 'new' && isAdmin}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          item.status === 'new'
                            ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                            : 'bg-slate-100 hover:bg-red-50 text-slate-700'
                        }`}
                        title={!isAdmin ? (isTh ? 'กรุณาใส่รหัสผ่านแอดมิน' : 'Enter Admin Passcode') : undefined}
                      >
                        {!isAdmin && <Lock className="w-2.5 h-2.5 opacity-60" />}
                        <span>รอดำเนินการ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestStatusChange(item.id, item.kind, 'in_progress')}
                        disabled={item.status === 'in_progress' && isAdmin}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          item.status === 'in_progress'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm ring-1 ring-amber-400'
                            : 'bg-slate-100 hover:bg-amber-50 text-slate-700'
                        }`}
                        title={!isAdmin ? (isTh ? 'กรุณาใส่รหัสผ่านแอดมิน' : 'Enter Admin Passcode') : undefined}
                      >
                        {!isAdmin && <Lock className="w-2.5 h-2.5 opacity-60" />}
                        <span>กำลังทำ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestStatusChange(item.id, item.kind, 'resolved')}
                        disabled={item.status === 'resolved' && isAdmin}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          item.status === 'resolved'
                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700'
                        }`}
                        title={!isAdmin ? (isTh ? 'กรุณาใส่รหัสผ่านแอดมิน' : 'Enter Admin Passcode') : undefined}
                      >
                        {!isAdmin && <Lock className="w-2.5 h-2.5 opacity-60" />}
                        <span>แก้ไขแล้ว ✓</span>
                      </button>
                    </div>
                  </div>

                  {/* Extra Admin Actions: Note & Delete */}
                  {isAdmin && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {editingNoteId === item.id ? (
                          <div className="flex items-center gap-1.5 w-full">
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder={isTh ? 'ใส่หมายเหตุการแก้ไข...' : 'Action notes...'}
                              className="px-2 py-1 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNote(item.id, item.kind, item.status)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs"
                            >
                              {isTh ? 'บันทึก' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 py-1 text-slate-500 text-xs"
                            >
                              {isTh ? 'ยกเลิก' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setNoteText(item.adminNote || '');
                            }}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 text-[11px]"
                          >
                            <FileEdit className="w-3 h-3" />
                            <span>{item.adminNote ? (isTh ? 'แก้ไขหมายเหตุ' : 'Edit Note') : (isTh ? '+ บันทึกหมายเหตุ' : '+ Add Note')}</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteReport(item.id, item.kind)}
                        className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1 text-[11px] p-1"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isTh ? 'ลบรายการ' : 'Delete'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
