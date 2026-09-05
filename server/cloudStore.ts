import fs from 'fs';
import path from 'path';
import { NearMissReport, EnvReport, ChecklistSubmission } from '../src/types';

export interface CloudDatabase {
  nearMissReports: NearMissReport[];
  envReports: EnvReport[];
  checklists: ChecklistSubmission[];
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cloud_db.json');

const INITIAL_NEAR_MISS_REPORTS: NearMissReport[] = [
  {
    id: 'nm-101',
    type: 'unsafe_condition',
    description: 'พบบันไดทางขึ้นอาคารเรียนรวมมีกระเบื้องแตกหลุดร่อนและมีน้ำขัง เสี่ยงต่อการลื่นล้ม',
    location: 'อาคารเรียนรวม 1 (GL1) บันไดฝั่งทิศเหนือ',
    severity: 'medium',
    reportedBy: 'kku-user-001',
    reporterName: 'นายสาสุข รักปลอดภัย',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    aiAnalysisTag: 'ตรวจพบพื้นผิวลื่นและชำรุด',
  },
  {
    id: 'nm-102',
    type: 'near_miss',
    description: 'กิ่งไม้ใหญ่หักห้อยลงมาพาดสายไฟฟ้าแรงสูงใกล้ทางเดินเท้า เกือบหล่นใส่รถจักรยานยนต์',
    location: 'ถนนริมบึงสีฐาน ตรงข้ามศูนย์ประชุมอเนกประสงค์กาญจนาภิเษก',
    severity: 'high',
    reportedBy: 'kku-user-001',
    reporterName: 'นายสาสุข รักปลอดภัย',
    status: 'new',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    aiAnalysisTag: 'เสี่ยงอันตรายจากไฟฟ้าและวัตถุตกหล่น',
  },
  {
    id: 'nm-103',
    type: 'unsafe_act',
    description: 'ผู้รับเหมากำลังตัดเหล็กบนที่สูงโดยไม่สวมสายรัดนิรภัย (Safety Harness)',
    location: 'ไซต์งานต่อเติมอาคารคณะแพทยศาสตร์',
    severity: 'high',
    reportedBy: 'kku-user-001',
    reporterName: 'นายสาสุข รักปลอดภัย',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    resolvedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    adminNote: 'เจ้าหน้าที่ จป. ลงพื้นที่ตักเตือนและผู้รับเหมาสวมสายรัดนิรภัยเรียบร้อย',
    aiAnalysisTag: 'ไม่สวมอุปกรณ์ป้องกันการตกจากที่สูง',
  },
];

const INITIAL_ENV_REPORTS: EnvReport[] = [
  {
    id: 'env-201',
    category: 'waste',
    description: 'ถังขยะแยกประเภทหน้าโรงอาหารเต็มและมีขยะอิเล็กทรอนิกส์ปะปนกับขยะทั่วไป',
    location: 'ศูนย์อาหารและบริการ 1 (KKU Complex)',
    reportedBy: 'kku-user-001',
    reporterName: 'นายสาสุข รักปลอดภัย',
    status: 'in_progress',
    severity: 'medium',
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    adminNote: 'ประสานงานฝ่ายจัดการขยะเข้าเคลียร์พื้นที่แล้ว',
  },
  {
    id: 'env-202',
    category: 'wastewater',
    description: 'ท่อระบายน้ำอุดตัน มีน้ำท่วมขังและส่งกลิ่นเหม็นหลังฝนตก',
    location: 'ด้านหลังอาคารโรงประลอง วิศวกรรมเครื่องกล',
    reportedBy: 'kku-user-001',
    reporterName: 'นายสาสุข รักปลอดภัย',
    status: 'new',
    severity: 'medium',
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
];

const INITIAL_CHECKLISTS: ChecklistSubmission[] = [
  {
    id: 'chk-301',
    userId: 'kku-user-001',
    userName: 'นายสาสุข รักปลอดภัย',
    area: 'โรงประลองภาควิชาวิศวกรรมเครื่องกล (EN Workshop)',
    checklistType: 'งานซ่อมบำรุงเครื่องจักร',
    items: [
      { label: 'สวมหมวกและแว่นตานิรภัย', checked: true },
      { label: 'สวมรองเท้านิรภัยหัวเหล็ก', checked: true },
      { label: 'ตรวจสอบปุ่มหยุดฉุกเฉิน (Emergency Stop)', checked: true },
      { label: 'พื้นที่ทำงานแห้ง สะอาด ไม่มีคราบน้ำมัน', checked: true },
      { label: 'ถังดับเพลิงพร้อมใช้งานในระยะ 15 เมตร', checked: true },
    ],
    passed: true,
    notes: 'อุปกรณ์พร้อมใช้งาน เจ้าหน้าที่ตรวจสอบครบถ้วน',
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  },
];

class CloudStore {
  private db: CloudDatabase;

  constructor() {
    this.db = this.loadFromDisk();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private loadFromDisk(): CloudDatabase {
    this.ensureDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.nearMissReports)) {
          return {
            nearMissReports: parsed.nearMissReports || [],
            envReports: parsed.envReports || [],
            checklists: parsed.checklists || [],
            lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.error('Error reading cloud_db.json, recreating with defaults:', err);
      }
    }

    const defaultDb: CloudDatabase = {
      nearMissReports: INITIAL_NEAR_MISS_REPORTS,
      envReports: INITIAL_ENV_REPORTS,
      checklists: INITIAL_CHECKLISTS,
      lastUpdated: new Date().toISOString(),
    };
    this.saveToDisk(defaultDb);
    return defaultDb;
  }

  private saveToDisk(data: CloudDatabase) {
    this.ensureDir();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write cloud_db.json:', err);
    }
  }

  public getData(): CloudDatabase {
    this.db = this.loadFromDisk();
    return this.db;
  }

  /**
   * Two-way sync: Merges client-submitted reports with server state
   * Ensures no report created on any device is ever lost.
   */
  public sync(clientData: {
    nearMissReports?: NearMissReport[];
    envReports?: EnvReport[];
    checklists?: ChecklistSubmission[];
  }): CloudDatabase {
    this.db = this.loadFromDisk();

    // 1. Merge Near Miss
    if (Array.isArray(clientData.nearMissReports)) {
      for (const clientReport of clientData.nearMissReports) {
        if (!clientReport || !clientReport.id) continue;
        const idx = this.db.nearMissReports.findIndex((r) => r.id === clientReport.id);
        if (idx === -1) {
          // Newly submitted report from a device
          this.db.nearMissReports.unshift(clientReport);
        } else {
          // Reconcile status and notes: keep whichever has newer updatedAt
          const existing = this.db.nearMissReports[idx];
          const clientTime = new Date(clientReport.updatedAt || clientReport.createdAt || 0).getTime();
          const serverTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          if (clientTime > serverTime) {
            this.db.nearMissReports[idx] = { ...existing, ...clientReport };
          }
        }
      }
    }

    // 2. Merge Env Reports
    if (Array.isArray(clientData.envReports)) {
      for (const clientReport of clientData.envReports) {
        if (!clientReport || !clientReport.id) continue;
        const idx = this.db.envReports.findIndex((r) => r.id === clientReport.id);
        if (idx === -1) {
          this.db.envReports.unshift(clientReport);
        } else {
          const existing = this.db.envReports[idx];
          const clientTime = new Date(clientReport.updatedAt || clientReport.createdAt || 0).getTime();
          const serverTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          if (clientTime > serverTime) {
            this.db.envReports[idx] = { ...existing, ...clientReport };
          }
        }
      }
    }

    // 3. Merge Checklists
    if (Array.isArray(clientData.checklists)) {
      for (const clientChk of clientData.checklists) {
        if (!clientChk || !clientChk.id) continue;
        const idx = this.db.checklists.findIndex((c) => c.id === clientChk.id);
        if (idx === -1) {
          this.db.checklists.unshift(clientChk);
        }
      }
    }

    // Sort newest first
    this.db.nearMissReports.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    this.db.envReports.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    this.db.lastUpdated = new Date().toISOString();
    this.saveToDisk(this.db);
    return this.db;
  }

  // --- Near Miss Reports ---
  public addNearMiss(report: NearMissReport): NearMissReport {
    this.db = this.loadFromDisk();
    // If id exists, update instead of duplicating
    const idx = this.db.nearMissReports.findIndex((r) => r.id === report.id);
    if (idx !== -1) {
      this.db.nearMissReports[idx] = { ...this.db.nearMissReports[idx], ...report };
    } else {
      this.db.nearMissReports.unshift(report);
    }
    this.db.lastUpdated = new Date().toISOString();
    this.saveToDisk(this.db);
    return report;
  }

  public updateNearMiss(
    id: string,
    updates: {
      status?: NearMissReport['status'];
      adminNote?: string;
      resolvedPhotoDataUrl?: string;
    }
  ): NearMissReport | null {
    this.db = this.loadFromDisk();
    const idx = this.db.nearMissReports.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const current = this.db.nearMissReports[idx];
    const now = new Date().toISOString();

    if (updates.status) current.status = updates.status;
    if (updates.adminNote !== undefined) current.adminNote = updates.adminNote;
    if (updates.resolvedPhotoDataUrl !== undefined) {
      current.resolvedPhotoDataUrl = updates.resolvedPhotoDataUrl;
    }
    if (updates.status === 'resolved' && !current.resolvedAt) {
      current.resolvedAt = now;
    }
    current.updatedAt = now;

    this.db.lastUpdated = now;
    this.saveToDisk(this.db);
    return current;
  }

  public deleteNearMiss(id: string): boolean {
    const initialLen = this.db.nearMissReports.length;
    this.db.nearMissReports = this.db.nearMissReports.filter((r) => r.id !== id);
    if (this.db.nearMissReports.length !== initialLen) {
      this.db.lastUpdated = new Date().toISOString();
      this.saveToDisk(this.db);
      return true;
    }
    return false;
  }

  // --- Environment Reports ---
  public addEnvReport(report: EnvReport): EnvReport {
    this.db = this.loadFromDisk();
    const idx = this.db.envReports.findIndex((r) => r.id === report.id);
    if (idx !== -1) {
      this.db.envReports[idx] = { ...this.db.envReports[idx], ...report };
    } else {
      this.db.envReports.unshift(report);
    }
    this.db.lastUpdated = new Date().toISOString();
    this.saveToDisk(this.db);
    return report;
  }

  public updateEnvReport(
    id: string,
    updates: {
      status?: EnvReport['status'];
      adminNote?: string;
      resolvedPhotoDataUrl?: string;
    }
  ): EnvReport | null {
    this.db = this.loadFromDisk();
    const idx = this.db.envReports.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const current = this.db.envReports[idx];
    const now = new Date().toISOString();

    if (updates.status) current.status = updates.status;
    if (updates.adminNote !== undefined) current.adminNote = updates.adminNote;
    if (updates.resolvedPhotoDataUrl !== undefined) {
      current.resolvedPhotoDataUrl = updates.resolvedPhotoDataUrl;
    }
    if (updates.status === 'resolved' && !current.resolvedAt) {
      current.resolvedAt = now;
    }
    current.updatedAt = now;

    this.db.lastUpdated = now;
    this.saveToDisk(this.db);
    return current;
  }

  public deleteEnvReport(id: string): boolean {
    this.db = this.loadFromDisk();
    const initialLen = this.db.envReports.length;
    this.db.envReports = this.db.envReports.filter((r) => r.id !== id);
    if (this.db.envReports.length !== initialLen) {
      this.db.lastUpdated = new Date().toISOString();
      this.saveToDisk(this.db);
      return true;
    }
    return false;
  }

  // --- Checklists ---
  public addChecklist(submission: ChecklistSubmission): ChecklistSubmission {
    this.db = this.loadFromDisk();
    const idx = this.db.checklists.findIndex((c) => c.id === submission.id);
    if (idx !== -1) {
      this.db.checklists[idx] = submission;
    } else {
      this.db.checklists.unshift(submission);
    }
    this.db.lastUpdated = new Date().toISOString();
    this.saveToDisk(this.db);
    return submission;
  }
}

export const cloudStore = new CloudStore();
