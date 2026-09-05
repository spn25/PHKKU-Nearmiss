import React, { useState, useEffect } from 'react';
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
  Camera,
  Image as ImageIcon,
  Sparkles,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import {
  CurrentUser,
  ScreenName,
  NearMissReport,
  EnvReport,
  ReportStatus,
} from '../../types';
import { translations } from '../../lib/i18n';
import { syncWithCloud } from '../../lib/cloudSync';
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
import { AdminResolutionModal } from '../AdminResolutionModal';

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

  // Admin Resolution Modal state (for status update + photo after resolution)
  const [resolutionModalItem, setResolutionModalItem] = useState<{
    id: string;
    kind: 'hazard' | 'env';
    title: string;
    location: string;
    status: ReportStatus;
    photoDataUrl?: string;
    resolvedPhotoDataUrl?: string;
    adminNote?: string;
  } | null>(null);

  // Note editing state for Admin
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Auto-sync polling every 3.5s while Dashboard is active so incoming reports appear in real-time
  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const res = await syncWithCloud();
        if (res.success && isMounted) {
          onRefreshData();
        }
      } catch (err) {
        // silent catch
      }
    };

    poll();
    const interval = setInterval(poll, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [onRefreshData]);

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
      resolvedPhotoDataUrl: r.resolvedPhotoDataUrl,
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
      resolvedPhotoDataUrl: e.resolvedPhotoDataUrl,
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

  const handleOpenResolutionModal = (item: typeof allReportItems[0]) => {
    if (!isAdmin) {
      setIsPasscodeModalOpen(true);
      return;
    }
    setResolutionModalItem(item);
  };

  const handleSaveResolution = (
    id: string,
    kind: 'hazard' | 'env',
    status: ReportStatus,
    note: string,
    resolvedPhotoUrl?: string
  ) => {
    if (kind === 'hazard') {
      updateNearMissStatus(id, status, note, resolvedPhotoUrl);
    } else {
      updateEnvReportStatus(id, status, note, resolvedPhotoUrl);
    }
    onRefreshData();
    syncWithCloud().then(() => onRefreshData());
    onShowToast(
      isTh
        ? `✓ [แอดมิน] บันทึกการแก้ไขและอัปเดตรูปภาพเรียบร้อยแล้ว`
        : `✓ [Admin] Resolution details & photo updated`,
      'success'
    );
  };

  const handleRequestStatusChange = (id: string, kind: 'hazard' | 'env', newStatus: ReportStatus) => {
    if (!isAdmin) {
      setPendingStatusUpdate({ id, kind, newStatus });
      setIsPasscodeModalOpen(true);
      return;
    }
    executeStatusUpdate(id, kind, newStatus);
  };

  const executeStatusUpdate = (
    id: string,
    kind: 'hazard' | 'env',
    newStatus: ReportStatus,
    note?: string,
    resolvedPhotoUrl?: string
  ) => {
    if (kind === 'hazard') {
      updateNearMissStatus(id, newStatus, note, resolvedPhotoUrl);
    } else {
      updateEnvReportStatus(id, newStatus, note, resolvedPhotoUrl);
    }
    onRefreshData();
    syncWithCloud().then(() => onRefreshData());
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
        ? '✓ เข้าสู่ระบบแอดมินสำเร็จ! ท่านสามารถจัดการสถานะและแนบรูปภาพหลังแก้ไขได้แล้ว'
        : '✓ Admin unlocked! You can now manage statuses and after-photos.',
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
    onRefreshData();
    onShowToast(isTh ? '✓ บันทึกหมายเหตุเรียบร้อย' : '✓ Note saved', 'success');
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto">
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

      {/* Admin Resolution & Photo Modal */}
      {resolutionModalItem && (
        <AdminResolutionModal
          isOpen={Boolean(resolutionModalItem)}
          onClose={() => setResolutionModalItem(null)}
          reportItem={resolutionModalItem}
          onSave={handleSaveResolution}
          isTh={isTh}
        />
      )}

      {/* 1. Header Banner & Mode Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>{isTh ? 'ระบบสถิติและความปลอดภัย มข.' : 'KKU Safety Statistics'}</span>
          </div>

          {/* Admin Mode Badge & Toggle */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isTh ? 'โหมดแอดมิน (Admin)' : 'Admin Mode'}</span>
              <button
                type="button"
                onClick={handleLogoutAdmin}
                className="ml-1 text-slate-300 hover:text-white p-0.5"
                title="Log out Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsPasscodeModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Enter Admin Passcode"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isTh ? 'เข้าสู่ระบบแอดมิน' : 'Admin Login'}</span>
            </button>
          )}
        </div>

        <h2 className="text-xl font-black text-white">{t.dashTitle}</h2>
        <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
          {isTh
            ? 'ผู้ใช้ทั่วไปดูสถิติและสถานะได้ ส่วนแอดมินสามารถจัดการสถานะและแนบรูปภาพหลังแก้ไขได้'
            : 'General users can view progress. Admins can manage statuses and post-resolution photos.'}
        </p>

        {/* Google Cloud Cross-Device Sync Notice */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              {isTh
                ? 'ข้อมูลเชื่อมต่อ Google Cloud: ทุกเครื่องมองเห็นข้อมูลตรงกันแบบเรียลไทม์'
                : 'Connected to Google Cloud: Real-time sync across all devices'}
            </span>
          </div>
          <button
            type="button"
            onClick={async () => {
              const res = await syncWithCloud();
              if (res.success) {
                onRefreshData();
                onShowToast(
                  isTh ? '✓ ซิงค์ข้อมูลกับ Google Cloud สำเร็จ' : '✓ Synced with Google Cloud',
                  'success'
                );
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-sky-300 text-[11px] font-semibold transition-all border border-indigo-700/50"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isTh ? 'ซิงค์ข้อมูล' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            {t.totalNearMiss}
          </span>
          <p className="text-2xl font-black text-slate-900">{stats.totalNearMiss}</p>
          <span className="text-[10px] text-slate-400">{isTh ? 'เรื่องทั้งหมด' : 'Reports'}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold text-red-600 block mb-1">
            {t.highSeverity}
          </span>
          <p className="text-2xl font-black text-red-700">{stats.highSeverityCount}</p>
          <span className="text-[10px] text-red-400">{isTh ? 'ความเสี่ยงสูง' : 'Critical'}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold text-emerald-600 block mb-1">
            {t.resolvedCount}
          </span>
          <p className="text-2xl font-black text-emerald-700">{stats.statusResolvedCount}</p>
          <span className="text-[10px] text-emerald-500">
            {stats.resolutionRate}% {isTh ? 'สำเร็จ' : 'Rate'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold text-indigo-600 block mb-1">
            {isTh ? 'เฉลี่ยแก้ไข' : 'Avg Resolve'}
          </span>
          <p className="text-2xl font-black text-indigo-900">{stats.avgResolutionHours}h</p>
          <span className="text-[10px] text-indigo-400">{isTh ? 'ชั่วโมง' : 'Hours'}</span>
        </div>
      </div>

      {/* 3. Safety vs Environment Breakdown */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'hazard' ? 'all' : 'hazard')}
          className={`p-4 rounded-3xl border-2 transition-all cursor-pointer text-center ${
            selectedTypeFilter === 'hazard'
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-rose-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[11px] font-bold text-slate-600">Near Miss & Hazard</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalNearMiss}</p>
          <span className="text-[10px] text-slate-400">{isTh ? 'รายงานความเสี่ยง' : 'Safety Reports'}</span>
        </div>

        <div
          onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'env' ? 'all' : 'env')}
          className={`p-4 rounded-3xl border-2 transition-all cursor-pointer text-center ${
            selectedTypeFilter === 'env'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200'
          }`}
        >
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

      {/* 6. Reports Table & Status / Photo Updater */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {isTh ? 'รายการแจ้งเหตุทั้งหมด' : 'All Incident Logs'} ({filteredItems.length})
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isTh ? 'ทั้งหมด' : 'All'}
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {isTh ? 'ทุกสถานะ' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
              activeTab === 'new'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-red-700 border border-red-200'
            }`}
          >
            🔴 {t.statusNew} ({stats.statusNewCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('in_progress')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
              activeTab === 'in_progress'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'bg-white text-amber-700 border border-amber-200'
            }`}
          >
            🟡 {t.statusInProgress} ({stats.statusInProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resolved')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
              activeTab === 'resolved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-700 border border-emerald-200'
            }`}
          >
            🟢 {t.statusResolved} ({stats.statusResolvedCount})
          </button>
        </div>

        {/* Report List Cards */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {isTh ? 'ไม่มีรายการแจ้งเหตุในหมวดนี้' : 'No reports found'}
              </p>
              <p className="text-xs text-slate-400">
                {isTh ? 'สามารถสลับแท็บเพื่อดูสถานะอื่นๆ ได้' : 'Switch tabs to see other statuses'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3"
              >
                {/* Card Header: Kind badge & Status badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        item.kind === 'hazard'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.kind === 'hazard' ? '⚠️ Near Miss / Safety' : '🌿 Environment'}
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

                {/* Admin Note Record */}
                {item.adminNote && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-0.5">
                    <span className="font-bold flex items-center gap-1 text-[11px] text-indigo-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isTh ? 'บันทึกการแก้ไขโดยแอดมิน:' : 'Admin Action Record:'}
                    </span>
                    <p className="text-slate-700">{item.adminNote}</p>
                  </div>
                )}

                {/* Photos Section: Before and After Images */}
                {(item.photoDataUrl || item.resolvedPhotoDataUrl) && (
                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Before Photo */}
                      {item.photoDataUrl && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <span>📸</span>
                            <span>{isTh ? 'รูปภาพแจ้งเหตุ (Before)' : 'Initial Photo'}</span>
                          </span>
                          <div className="rounded-xl overflow-hidden max-h-36 bg-slate-900 flex items-center justify-center border border-slate-200">
                            <img
                              src={item.photoDataUrl}
                              alt="Report Attachment"
                              className="max-h-36 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      )}

                      {/* After / Resolved Photo */}
                      {item.resolvedPhotoDataUrl && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isTh ? 'รูปภาพหลังการแก้ไข (After)' : 'After Resolution'}</span>
                          </span>
                          <div className="rounded-xl overflow-hidden max-h-36 bg-slate-900 flex items-center justify-center border border-emerald-300">
                            <img
                              src={item.resolvedPhotoDataUrl}
                              alt="Resolved Photo Proof"
                              className="max-h-36 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
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

                  {/* Comprehensive Admin Action Bar (Photo After Resolution + Note + Delete) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenResolutionModal(item)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                        isAdmin
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>
                        {item.resolvedPhotoDataUrl
                          ? isTh
                            ? 'ดู/เปลี่ยนรูปหลังแก้ไข'
                            : 'Edit After Photo'
                          : isTh
                          ? '+ เพิ่มรูปภาพหลังการแก้ไข'
                          : '+ Add After Photo'}
                      </span>
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(item.id, item.kind)}
                        className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1 text-[11px] p-1"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isTh ? 'ลบรายการ' : 'Delete'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
