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
 * ซิงค์ข้อมูลกับ Google Cloud Server แบบสองทิศทาง (Bidirectional Cloud Sync)
 * 1. ส่งข้อมูลที่สร้างจากเครื่องนี้ขึ้นคลาวด์
 * 2. รับข้อมูลที่อุปกรณ์อื่นสร้าง/แก้ไขกลับมา
 * 3. รวมข้อมูลและบันทึกอัปเดตให้อุปกรณ์นี้ทันที
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

    // รวบรวมข้อมูลในเครื่องเพื่อนำไปซิงค์รวมกับคลาวด์
    let localNearMiss: NearMissReport[] = [];
    let localEnv: EnvReport[] = [];
    let localChecklists: ChecklistSubmission[] = [];

    try {
      const rawNM = localStorage.getItem(STORAGE_KEYS.NEAR_MISS_REPORTS);
      if (rawNM) localNearMiss = JSON.parse(rawNM);
    } catch {}

    try {
      const rawEnv = localStorage.getItem(STORAGE_KEYS.ENV_REPORTS);
      if (rawEnv) localEnv = JSON.parse(rawEnv);
    } catch {}

    try {
      const rawChk = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
      if (rawChk) localChecklists = JSON.parse(rawChk);
    } catch {}

    // ยิง API สองทางเพื่อ Merge ข้อมูลบนเซิร์ฟเวอร์
    let data: any = null;
    try {
      const res = await fetch('/api/cloud/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nearMissReports: localNearMiss,
          envReports: localEnv,
          checklists: localChecklists,
        }),
      });

      if (res.ok) {
        data = await res.json();
      }
    } catch (postErr) {
      console.warn('Bidirectional sync failed, trying fallback GET:', postErr);
    }

    // Fallback: ดึง GET /api/cloud/data หาก POST ขัดข้อง
    if (!data || !data.success) {
      const getRes = await fetch('/api/cloud/data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (getRes.ok) {
        data = await getRes.json();
      }
    }

    if (data && data.success) {
      const nearMiss = Array.isArray(data.nearMissReports) ? data.nearMissReports : [];
      const env = Array.isArray(data.envReports) ? data.envReports : [];
      const checklists = Array.isArray(data.checklists) ? data.checklists : [];

      // เซฟข้อมูลที่เชื่อมโยงตรงกันทั้งหมดลง Local Storage
      localStorage.setItem(STORAGE_KEYS.NEAR_MISS_REPORTS, JSON.stringify(nearMiss));
      localStorage.setItem(STORAGE_KEYS.ENV_REPORTS, JSON.stringify(env));
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));

      lastSyncTimestamp = new Date().toISOString();

      // แจ้งทุกหน้าจอของ React ให้รีเฟรชข้อมูลแสดงผลตรงกันทันที
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
      throw new Error(data?.error || 'Invalid response from cloud');
    }
  } catch (err: any) {
    console.warn('Cloud sync offline or error, retaining local data:', err?.message || err);
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
