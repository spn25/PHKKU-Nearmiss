/**
 * SafeMate Types & Interfaces
 * ระบบ AI Safety & Environment Assistant สำหรับสถานศึกษาและองค์กร
 */

export type Language = 'th' | 'en';

export type UserRole =
  | 'worker'
  | 'student'
  | 'staff'
  | 'safety_officer'
  | 'admin'
  | 'นักศึกษา'
  | 'อาจารย์'
  | 'บุคลากร'
  | 'กองอาคารสถานที่'
  | 'เจ้าหน้าที่รักษาความปลอดภัย'
  | 'จป. (เจ้าหน้าที่ความปลอดภัย)'
  | 'ฝ่ายสิ่งแวดล้อม/อาคารสีเขียว'
  | 'พนักงานทำความสะอาด/แม่บ้าน'
  | 'ผู้รับเหมา/ช่างซ่อมบำรุง'
  | 'ผู้ดูแลหอพักนักศึกษา'
  | 'นักวิจัย/เจ้าหน้าที่ห้องแล็บ'
  | 'อื่น ๆ';

export interface CurrentUser {
  userId: string;
  name: string;
  role: UserRole;
  facultyDepartment?: string;
  faculty?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  language: Language;
}

export type ScreenName =
  | 'home'
  | 'near_miss'
  | 'checklist'
  | 'ppe_scan'
  | 'ai_hazard'
  | 'health'
  | 'environment'
  | 'env_report'
  | 'emergency'
  | 'manual'
  | 'dashboard'
  | 'profile'
  | 'settings';

export type NearMissType = 'near_miss' | 'unsafe_act' | 'unsafe_condition';
export type Severity = 'low' | 'medium' | 'high';
export type ReportStatus = 'new' | 'in_progress' | 'resolved';

export interface NearMissReport {
  id: string;
  type: NearMissType;
  description: string;
  photoDataUrl?: string;
  location: string;
  severity: Severity;
  reportedBy: string;
  reporterName?: string;
  status: ReportStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  aiAnalysisTag?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  labelEn: string;
  category: 'ppe' | 'tools' | 'area' | 'machinery' | 'chemical' | 'health';
  checked: boolean;
  required: boolean;
}

export interface ChecklistSubmission {
  id: string;
  userId: string;
  userName?: string;
  area: string;
  checklistType: string;
  items: { label: string; checked: boolean }[];
  passed: boolean;
  notes?: string;
  createdAt: string; // ISO string
}

export interface PPESite {
  siteId: string;
  siteName: string;
  siteNameEn: string;
  location: string;
  requiredPPE: string[];
  riskLevel: Severity;
  workInstruction: string;
  workInstructionEn: string;
  supervisorName?: string;
  supervisorPhone?: string;
}

export type EnvCategory =
  | 'waste'
  | 'chemical_spill'
  | 'wastewater'
  | 'oil_leak'
  | 'dust'
  | 'noise';

export interface EnvReport {
  id: string;
  category: EnvCategory;
  description: string;
  photoDataUrl?: string;
  location: string;
  reportedBy: string;
  reporterName?: string;
  status: ReportStatus;
  severity?: Severity;
  createdAt: string; // ISO string
}

export interface HealthRemindersSettings {
  waterReminder: boolean;
  eyeRestReminder: boolean;
  heatStressAlertEnabled: boolean;
  noiseAlertEnabled: boolean;
  airQualityAlertEnabled: boolean;
  lastReminderShownAt: string;
  waterIntakeGoal: number; // in ml
  waterIntakeCurrent: number; // in ml
}

export interface EmergencyContact {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  phone: string;
  category: 'medical' | 'security' | 'fire' | 'facility' | 'safety';
  is24h: boolean;
}

export interface SafetyManualItem {
  id: string;
  title: string;
  titleEn: string;
  category: 'PPE' | 'Heat Stress' | 'Ergonomics' | 'Fatigue' | 'Chemical Safety' | 'Emergency Procedure' | 'Fire Safety' | 'Lab Safety';
  summaryTh: string;
  summaryEn: string;
  content: string;
  contentEn: string;
  keySteps: string[];
  keyStepsEn: string[];
}
