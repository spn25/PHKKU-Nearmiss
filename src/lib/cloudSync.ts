/**
 * Google Cloud Data Synchronization Service
 * ซิงค์ข้อมูลการแจ้งเหตุและรายงานความปลอดภัยขึ้น Google Cloud
 * เพื่อให้ผู้ใช้งานทุกคน ทุกเครื่อง (มือถือ คอมพิวเตอร์ แท็บเล็ต) เห็นข้อมูลตรงกันแบบเรียลไทม์
 */

import { NearMissReport, EnvReport, ChecklistSubmission, ReportStatus } from '../types';
import { STORAGE_KEYS } from './storage';

export const CLOUD_SYNC_EVENT = 'kku_cloud_data_synced';

let isSyncing = false;
let lastSyncTimestamp: string | null = null;
let syncError: string | null = null;

export function getLastSyncTime(): string | null {
  return lastSyncTimestamp;
}

export function getSyncStatus(): { isSyncing: boolean; lastSync: string | null; error: string | null } {
  return { isSyncing, lastSync: lastSyncTimestamp, error: syncError };
}

/**
 * ดึงข้อมูลล่าสุดทั้งหมดจาก Google Cloud Server มาอัปเดตลงเครื่อง
 */
export async function syncWithCloud(): Promise<{
  success: boolean;
  nearMissReports?: NearMissReport[];
  envReports?: EnvReport[];
  checklists?: ChecklistSubmission[];
  error?: string;
}> {
  if (isSyncing) return { success: false, error: 'Sync already in progress' };

  try {
    isSyncing = true;
    syncError = null;

    const res = await fetch('/api/cloud/data', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Cloud server responded with status: ${res.status}`);
    }

    const data = await res.json();

    if (data && data.success) {
      const nearMiss = Array.isArray(data.nearMissReports) ? data.nearMissReports : [];
      const env = Array.isArray(data.envReports) ? data.envReports : [];
      const checklists = Array.isArray(data.checklists) ? data.checklists : [];

      // Save to local storage cache
      localStorage.setItem(STORAGE_KEYS.NEAR_MISS_REPORTS, JSON.stringify(nearMiss));
      localStorage.setItem(STORAGE_KEYS.ENV_REPORTS, JSON.stringify(env));
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));

      lastSyncTimestamp = new Date().toISOString();

      // Dispatch event to inform all active React screens
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(CLOUD_SYNC_EVENT, {
            detail: { nearMiss, env, checklists, timestamp: lastSyncTimestamp },
          })
        );
      }

      return {
        success: true,
        nearMissReports: nearMiss,
        envReports: env,
        checklists,
      };
    } else {
      throw new Error(data?.error || 'Invalid response format');
    }
  } catch (err: any) {
    console.warn('Cloud sync offline or error:', err?.message || err);
    syncError = err?.message || 'Network error';
    return { success: false, error: syncError || undefined };
  } finally {
    isSyncing = false;
  }
}

/**
 * ส่งรายงาน Near Miss ขึ้น Google Cloud
 */
export async function postNearMissToCloud(report: NearMissReport): Promise<boolean> {
  try {
    const res = await fetch('/api/cloud/near-miss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (res.ok) {
      lastSyncTimestamp = new Date().toISOString();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to post near miss to cloud:', err);
    return false;
  }
}

/**
 * อัปเดตสถานะ Near Miss บน Google Cloud (เช่น แอดมินแก้ไขแล้ว)
 */
export async function patchNearMissToCloud(
  id: string,
  status: ReportStatus,
  adminNote?: string,
  resolvedPhotoDataUrl?: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloud/near-miss/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote, resolvedPhotoDataUrl }),
    });
    if (res.ok) {
      lastSyncTimestamp = new Date().toISOString();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to patch near miss to cloud:', err);
    return false;
  }
}

/**
 * ลบรายงาน Near Miss บน Google Cloud
 */
export async function deleteNearMissFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloud/near-miss/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete near miss from cloud:', err);
    return false;
  }
}

/**
 * ส่งรายงานสิ่งแวดล้อมขึ้น Google Cloud
 */
export async function postEnvToCloud(report: EnvReport): Promise<boolean> {
  try {
    const res = await fetch('/api/cloud/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (res.ok) {
      lastSyncTimestamp = new Date().toISOString();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to post env report to cloud:', err);
    return false;
  }
}

/**
 * อัปเดตสถานะรายงานสิ่งแวดล้อมบน Google Cloud
 */
export async function patchEnvToCloud(
  id: string,
  status: ReportStatus,
  adminNote?: string,
  resolvedPhotoDataUrl?: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloud/env/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote, resolvedPhotoDataUrl }),
    });
    if (res.ok) {
      lastSyncTimestamp = new Date().toISOString();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to patch env report to cloud:', err);
    return false;
  }
}

/**
 * ลบรายงานสิ่งแวดล้อมบน Google Cloud
 */
export async function deleteEnvFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cloud/env/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete env report from cloud:', err);
    return false;
  }
}

/**
 * ส่งผล Checklist ขึ้น Google Cloud
 */
export async function postChecklistToCloud(checklist: ChecklistSubmission): Promise<boolean> {
  try {
    const res = await fetch('/api/cloud/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checklist),
    });
    if (res.ok) {
      lastSyncTimestamp = new Date().toISOString();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to post checklist to cloud:', err);
    return false;
  }
}
