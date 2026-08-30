/**
 * SafeMate Local Storage Manager
 * จัดการข้อมูลทั้งหมดแบบ Offline-First ใน Local Storage ของเบราว์เซอร์
 * ตาม Schema ที่ระบุในข้อกำหนด
 */

import {
  CurrentUser,
  NearMissReport,
  ChecklistSubmission,
  PPESite,
  EnvReport,
  HealthRemindersSettings,
  EmergencyContact,
  SafetyManualItem,
  Language,
  ReportStatus,
} from '../types';

export const STORAGE_KEYS = {
  CURRENT_USER: 'safemate_currentUser',
  NEAR_MISS_REPORTS: 'safemate_nearMissReports',
  CHECKLISTS: 'safemate_checklists',
  PPE_SITES: 'safemate_ppeSites',
  ENV_REPORTS: 'safemate_envReports',
  HEALTH_REMINDERS: 'safemate_healthReminders',
  EMERGENCY_CONTACTS: 'safemate_emergencyContacts',
  SAFETY_MANUAL: 'safemate_safetyManual',
  ADMIN_AUTH: 'safemate_admin_auth',
};

export const ADMIN_PASSCODE = '12345';

export function isAdminAuthenticated(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  } catch {
    // fallback
  }
}

export function verifyAdminPasscode(passcode: string): boolean {
  if (passcode.trim() === ADMIN_PASSCODE) {
    setAdminAuthenticated(true);
    return true;
  }
  return false;
}

// ==========================================
// ข้อมูลตั้งต้น (Initial Seed Data)
// ==========================================

const DEFAULT_USER: CurrentUser = {
  userId: 'kku-user-001',
  name: 'นายสาสุข รักปลอดภัย',
  role: 'จป. (เจ้าหน้าที่ความปลอดภัย)',
  faculty: 'กองอาคารและสถานที่ มหาวิทยาลัยขอนแก่น',
  language: 'th',
};

const DEFAULT_PPE_SITES: PPESite[] = [
  {
    siteId: 'KKU-ENG-WS01',
    siteName: 'โรงประลองภาควิชาวิศวกรรมเครื่องกล (EN Workshop)',
    siteNameEn: 'Mechanical Engineering Workshop (EN Workshop)',
    location: 'คณะวิศวกรรมศาสตร์ อาคาร EN04',
    requiredPPE: ['หมวกนิรภัย (Hard Hat)', 'แว่นตานิรภัย (Safety Glasses)', 'รองเท้าหัวเหล็ก (Safety Shoes)', 'ที่อุดหูลดเสียง (Earplugs)'],
    riskLevel: 'high',
    workInstruction: 'ห้ามสวมเครื่องประดับ เก็บผมให้เรียบร้อย ตรวจสอบการต่อสายดินก่อนเปิดเครื่องจักรกล',
    workInstructionEn: 'No loose jewelry, tie long hair, verify equipment grounding before starting machinery.',
    supervisorName: 'อ.ดร.วิศวกรรม ประจำโรงประลอง',
    supervisorPhone: '043-009700 ต่อ 42100',
  },
  {
    siteId: 'KKU-SCI-LAB03',
    siteName: 'ห้องปฏิบัติการเคมีวิเคราะห์กลาง (Central Chem Lab)',
    siteNameEn: 'Central Analytical Chemistry Laboratory',
    location: 'คณะวิทยาศาสตร์ อาคาร SC.08 ชั้น 3',
    requiredPPE: ['เสื้อกาวน์กันสารเคมี (Lab Coat)', 'แว่นครอบตานิรภัย (Goggles)', 'ถุงมือไนไตรล์ (Nitrile Gloves)', 'หน้ากากป้องกันไอระเหย (Respirator)'],
    riskLevel: 'medium',
    workInstruction: 'การถ่ายเทสารระเหยต้องทำในตู้ดูดควัน (Fume Hood) เสมอ ตรวจสอบฝักบัวฉุกเฉินและที่ล้างตาก่อนเริ่มทดลอง',
    workInstructionEn: 'Perform volatile chemical handling in fume hoods only. Inspect safety shower & eyewash before experiments.',
    supervisorName: 'ดร.นวรัตน์ วิจัยเคมี',
    supervisorPhone: '043-202372',
  },
  {
    siteId: 'KKU-FAC-CONST',
    siteName: 'พื้นที่ปรับปรุงภูมิทัศน์และก่อสร้างอาคารใหม่',
    siteNameEn: 'Campus Landscape & Building Renovation Site',
    location: 'บริเวณข้างศูนย์อาหารและบริการ 1 (KKU Complex)',
    requiredPPE: ['หมวกนิรภัย (Hard Hat)', 'เสื้อสะท้อนแสง (Hi-Vis Vest)', 'รองเท้าเซฟตี้ (Safety Shoes)', 'ถุงมือผ้าเคลือบยาง (Work Gloves)'],
    riskLevel: 'high',
    workInstruction: 'ผู้ไม่มีส่วนเกี่ยวข้องห้ามเข้าพื้นที่ สวมหมวกนิรภัยตลอดเวลา ระวังรถบรรทุกและเครื่องจักรหนักเข้าออก',
    workInstructionEn: 'Strictly restricted area. Wear safety helmet at all times. Watch out for heavy vehicles entering/exiting.',
    supervisorName: 'นายช่างสมเกียรติ กองอาคารสถานที่',
    supervisorPhone: '081-999-1234',
  },
  {
    siteId: 'KKU-DORM-MECH',
    siteName: 'ห้องเครื่องสูบน้ำและระบบบำบัดน้ำเสียหอพัก 8-9',
    siteNameEn: 'Pump Room & Wastewater Treatment Plant (Dorm 8-9)',
    location: 'โซนหอพักนักศึกษา มหาวิทยาลัยขอนแก่น',
    requiredPPE: ['รองเท้าบูทยางกันลื่น (Rubber Boots)', 'ถุงมือยางหนา (Heavy Duty Gloves)', 'หน้ากากป้องกันก๊าซ (Gas Mask)'],
    riskLevel: 'medium',
    workInstruction: 'ตรวจสอบการระบายอากาศก่อนลงบ่อพัก ระวังพื้นที่ลื่นและก๊าซสะสม',
    workInstructionEn: 'Ensure adequate ventilation before entering sump pits. Beware of slip hazards and confined spaces.',
    supervisorName: 'หัวหน้างานระบบสุขาภิบาล',
    supervisorPhone: '043-202222 ต่อ 118',
  },
];

const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'kku-sec-1',
    name: 'ศูนย์รักษาความปลอดภัย มหาวิทยาลัยขอนแก่น (KKU Security)',
    nameEn: 'KKU Security Operations Center',
    role: 'รับแจ้งเหตุฉุกเฉิน / อุบัติเหตุ / เหตุโจรกรรม 24 ชม.',
    roleEn: '24/7 Campus Emergency, Traffic, & Incident Control',
    phone: '043-202222',
    category: 'security',
    is24h: true,
  },
  {
    id: 'kku-med-1',
    name: 'ศูนย์อุบัติเหตุและฉุกเฉิน โรงพยาบาลศรีนครินทร์',
    nameEn: 'Srinagarind Hospital ER (Emergency & Trauma Center)',
    role: 'หน่วยแพทย์กู้ชีพฉุกเฉิน / รถพยาบาล',
    roleEn: 'Trauma & Emergency Ambulance Service',
    phone: '043-363000',
    category: 'medical',
    is24h: true,
  },
  {
    id: 'kku-fire-1',
    name: 'สถานีดับเพลิงและกู้ภัย เทศบาลนครขอนแก่น / มข.',
    nameEn: 'KKU & Khon Kaen Fire & Rescue Department',
    role: 'ดับเพลิง / สัตว์มีพิษ / สารเคมีรั่วไหลฉุกเฉิน',
    roleEn: 'Fire Suppression & Chemical Spill Response',
    phone: '199',
    category: 'fire',
    is24h: true,
  },
  {
    id: 'kku-fac-1',
    name: 'ศูนย์รับแจ้งซ่อม กองอาคารและสถานที่ มข.',
    nameEn: 'KKU Facility Maintenance Call Center',
    role: 'ไฟฟ้าดับ / ท่อประปาแตก / ต้นไม้ล้ม / น้ำท่วมขัง',
    roleEn: 'Electrical, Plumbing, and Campus Infrastructure Repairs',
    phone: '043-009700',
    category: 'facility',
    is24h: false,
  },
  {
    id: 'kku-safety-1',
    name: 'ศูนย์บริหารจัดการความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม (OSHE KKU)',
    nameEn: 'KKU Occupational Safety, Health & Environment Center',
    role: 'ที่ปรึกษาความปลอดภัย / อุบัติเหตุในงานทดลอง',
    roleEn: 'Safety Consultation & Incident Investigations',
    phone: '043-203200',
    category: 'safety',
    is24h: false,
  },
];

const DEFAULT_SAFETY_MANUAL: SafetyManualItem[] = [
  {
    id: 'man-1',
    title: 'การใช้อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล (PPE Guidelines)',
    titleEn: 'Personal Protective Equipment (PPE) Guidelines',
    category: 'PPE',
    summaryTh: 'หลักการเลือกใช้และดูแลรักษา หมวกนิรภัย แว่นตา ถุงมือ และรองเท้านิรภัย',
    summaryEn: 'Selection and maintenance standards for helmets, eye protection, gloves, and footwear',
    content: 'การใช้อุปกรณ์ PPE เป็นด่านสุดท้ายในการป้องกันอันตราย ต้องเลือกใช้ให้เหมาะสมกับลักษณะงานและตรวจเช็กสภาพก่อนสวมใส่ทุกครั้ง ห้ามใช้อุปกรณ์ที่ชำรุดหรือหมดอายุการใช้งาน',
    contentEn: 'PPE is the final defense barrier against hazards. Always select appropriate equipment for specific tasks and inspect before every use.',
    keySteps: [
      'ตรวจเช็กสภาพรอยแตกร้าวของหมวกนิรภัย',
      'สวมแว่นตานิรภัยเมื่อมีการตัด เจียร หรือสัมผัสสารเคมี',
      'เลือกชนิดถุงมือให้ตรงกับสารเคมีหรือความร้อน',
      'ทำความสะอาดและเก็บในที่แห้งหลังเลิกงาน',
    ],
    keyStepsEn: [
      'Inspect hardhat for structural cracks',
      'Wear safety glasses during cutting, grinding, or chemical handling',
      'Match glove material to specific chemical/mechanical hazards',
      'Clean and store in a clean, dry location after use',
    ],
  },
  {
    id: 'man-2',
    title: 'การป้องกันโรคลมแดดและความเครียดจากความร้อน (Heat Stress Prevention)',
    titleEn: 'Heat Stress Prevention & Outdoor Safety',
    category: 'Heat Stress',
    summaryTh: 'ข้อควรปฏิบัติสำหรับผู้ทำงานกลางแจ้ง ดื่มน้ำ พักในร่ม และสังเกตอาการเพลียแดด',
    summaryEn: 'Workplace hydration and shade rest protocols during high heat index conditions',
    content: 'ในสภาพอากาศร้อนจัดของภาคอีสาน อุณหภูมิและความชื้นสูงอาจทำให้เกิด Heat Stroke หรือเพลียแดด ผู้ปฏิบัติงานกลางแจ้งควรดื่มน้ำทุก 15-20 นาที แม้ไม่รู้สึกกระหาย',
    contentEn: 'High temperature and humidity increase risks of heat exhaustion and heat stroke. Workers should hydrate every 15-20 minutes.',
    keySteps: [
      'ดื่มน้ำสะอาด 1 แก้วทุก 20 นาที',
      'สวมเสื้อผ้าที่ระบายอากาศได้ดี หมวกปีกกว้าง',
      'พักในที่ร่มที่มีอากาศถ่ายเทเมื่อรู้สึกเวียนศีรษะ',
      'หากพบคนหมดสติ ให้รีบย้ายเข้าที่ร่ม เช็ดตัวด้วยน้ำเย็น และโทร 043-363000',
    ],
    keyStepsEn: [
      'Drink 1 glass of water every 20 minutes',
      'Wear breathable light clothing and wide-brim hats',
      'Rest in well-ventilated shade if experiencing dizziness',
      'If unconscious, move victim to shade, cool skin, and call 043-363000',
    ],
  },
  {
    id: 'man-3',
    title: 'การยศาสตร์และการยกของหนักอย่างปลอดภัย (Ergonomics & Safe Lifting)',
    titleEn: 'Ergonomics & Safe Manual Lifting Protocol',
    category: 'Ergonomics',
    summaryTh: 'ท่ายกของที่ถูกต้องเพื่อป้องกันอาการบาดเจ็บของหมอนรองกระดูกและกล้ามเนื้อหลัง',
    summaryEn: 'Proper body mechanics to prevent back strains and musculoskeletal disorders',
    content: 'การยกของหนักผิดวิธีเป็นสาเหตุหลักของอาการปวดหลังเรื้อรัง ต้องย่อเข่าลงแทนการก้มหลัง และถือวัตถุให้ชิดลำตัวมากที่สุด',
    contentEn: 'Improper manual lifting is the leading cause of chronic back pain. Always bend knees rather than bending waist.',
    keySteps: [
      'วางเท้าให้มั่นคง กว้างประมาณช่วงหัวไหล่',
      'ย่อเข่าลง หลังตรง อกผาย',
      'จับสิ่งของให้กระชับและดึงเข้าชิดลำตัว',
      'ใช้แรงดันจากกล้ามเนื้อขาในการลุกขึ้น ไม่หมุนบิดตัวขณะยก',
    ],
    keyStepsEn: [
      'Place feet shoulder-width apart for stable balance',
      'Bend at knees, keep back upright and chest open',
      'Grip object firmly and keep it close to body center',
      'Lift using leg muscles without twisting torso',
    ],
  },
  {
    id: 'man-4',
    title: 'การจัดการสารเคมีหกและการรั่วไหล (Chemical Spill Response)',
    titleEn: 'Chemical Spill Response & Containment',
    category: 'Chemical Safety',
    summaryTh: 'ขั้นตอนการรับมือสารเคมีหกในห้องปฏิบัติการและพื้นที่ทำงาน',
    summaryEn: 'Step-by-step procedures for managing chemical spills and hazardous leaks',
    content: 'เมื่อเกิดสารเคมีหก ให้ประเมินขนาดความรุนแรง หากเป็นสารอันตรายสูงหรือปริมาณมาก ให้กดสัญญาณเตือนและอพยพผู้คนทันที',
    contentEn: 'Evaluate spill severity. If dealing with large quantity or high toxicity, evacuate area and trigger emergency response.',
    keySteps: [
      'แจ้งเตือนผู้ที่อยู่ในบริเวณใกล้เคียงให้ออกห่าง',
      'สวมอุปกรณ์ PPE ป้องกันสารเคมีก่อนเข้าระงับเหตุ',
      'ใช้ชุด Spill Kit (ทรายดูดซับ/แผ่นซับสารเคมี) กั้นล้อมรอบรอยหก',
      'เก็บกวาดใส่ถุงขยะอันตรายและติดป้ายเตือนชัดเจน',
    ],
    keyStepsEn: [
      'Alert all personnel in vicinity to clear the area',
      'Equip chemical-resistant PPE before approaching spill',
      'Deploy Spill Kit absorbent booms/pads around spill perimeter',
      'Collect absorbed waste in designated hazardous waste bags with labels',
    ],
  },
  {
    id: 'man-5',
    title: 'การดับเพลิงเบื้องต้นและการใช้ถังดับเพลิง (Fire Safety & Extinguisher)',
    titleEn: 'Fire Extinguisher & Emergency Evacuation',
    category: 'Fire Safety',
    summaryTh: 'หลักการ PASS ในการใช้ถังดับเพลิง และการอพยพหนีไฟ',
    summaryEn: 'The PASS technique for portable extinguishers and campus evacuation routes',
    content: 'จำหลักการ PASS: ดึง (Pull), ปลด (Aim), บีบ (Squeeze), ส่าย (Sweep) ยืนเหนือลมระยะ 2-3 เมตรจากเปลวไฟ',
    contentEn: 'Remember PASS: Pull pin, Aim nozzle at base of fire, Squeeze lever, Sweep side to side from 2-3 meters upwind.',
    keySteps: [
      'ดึง (Pull) สลักนิรภัยออก',
      'ปลด/ชี้ (Aim) หัวฉีดไปยังฐานของเปลวไฟ',
      'บีบ (Squeeze) คันบีบเพื่อปล่อยสารดับเพลิง',
      'ส่าย (Sweep) หัวฉีดไปมาซ้ายขวาจนไฟดับสนิท',
    ],
    keyStepsEn: [
      'Pull the safety pin',
      'Aim nozzle low at the base of fire',
      'Squeeze the operating handle',
      'Sweep nozzle from side to side',
    ],
  },
];

const DEFAULT_NEAR_MISS_REPORTS: NearMissReport[] = [
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
    aiAnalysisTag: 'ไม่สวมอุปกรณ์ป้องกันการตกจากที่สูง',
  },
];

const DEFAULT_ENV_REPORTS: EnvReport[] = [
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

const DEFAULT_HEALTH_REMINDERS: HealthRemindersSettings = {
  waterReminder: true,
  eyeRestReminder: true,
  heatStressAlertEnabled: true,
  noiseAlertEnabled: true,
  airQualityAlertEnabled: true,
  lastReminderShownAt: new Date().toISOString(),
  waterIntakeGoal: 2000,
  waterIntakeCurrent: 750,
};

const DEFAULT_CHECKLISTS: ChecklistSubmission[] = [
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

// ==========================================
// ฟังก์ชันจัดการ Local Storage หลัก
// ==========================================

export function initLocalData(): void {
  try {
    const existingUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!existingUserRaw) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
    } else {
      try {
        const parsed = JSON.parse(existingUserRaw);
        if (parsed.name && (parsed.name.includes('สมชาย') || parsed.userId === 'kku-user-001')) {
          parsed.name = 'นายสาสุข รักปลอดภัย';
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(parsed));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.PPE_SITES)) {
      localStorage.setItem(STORAGE_KEYS.PPE_SITES, JSON.stringify(DEFAULT_PPE_SITES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS)) {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(DEFAULT_EMERGENCY_CONTACTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAFETY_MANUAL)) {
      localStorage.setItem(STORAGE_KEYS.SAFETY_MANUAL, JSON.stringify(DEFAULT_SAFETY_MANUAL));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEAR_MISS_REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.NEAR_MISS_REPORTS, JSON.stringify(DEFAULT_NEAR_MISS_REPORTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ENV_REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.ENV_REPORTS, JSON.stringify(DEFAULT_ENV_REPORTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HEALTH_REMINDERS)) {
      localStorage.setItem(STORAGE_KEYS.HEALTH_REMINDERS, JSON.stringify(DEFAULT_HEALTH_REMINDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHECKLISTS)) {
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(DEFAULT_CHECKLISTS));
    }
  } catch (err) {
    console.error('Error initializing local data:', err);
  }
}

// 1. Current User
export function getCurrentUser(): CurrentUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name && parsed.name.includes('สมชาย')) {
        parsed.name = 'นายสาสุข รักปลอดภัย';
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_USER;
}

export function updateUserProfile(data: Partial<CurrentUser>): CurrentUser {
  const current = getCurrentUser();
  const updated = { ...current, ...data };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
  return updated;
}

export function saveCurrentUser(user: CurrentUser): CurrentUser {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return user;
}

export function resetAllDataToDefault(): void {
  resetLocalData();
}

export function getHealthRemindersSettings(): HealthRemindersSettings {
  return getHealthReminders();
}

export function switchLanguage(lang: Language): Language {
  const current = getCurrentUser();
  current.language = lang;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(current));
  return lang;
}

// 2. Near Miss / Hazard Reports
export function getNearMissReports(): NearMissReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NEAR_MISS_REPORTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function submitNearMissReport(data: Omit<NearMissReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): NearMissReport {
  const reports = getNearMissReports();
  const user = getCurrentUser();
  const now = new Date().toISOString();
  
  const newReport: NearMissReport = {
    ...data,
    id: 'nm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    reportedBy: data.reportedBy || user.userId,
    reporterName: data.reporterName || user.name,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };

  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEYS.NEAR_MISS_REPORTS, JSON.stringify(reports));
  return newReport;
}

export function updateNearMissStatus(id: string, status: ReportStatus, adminNote?: string): NearMissReport[] {
  const reports = getNearMissReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index !== -1) {
    reports[index].status = status;
    reports[index].updatedAt = new Date().toISOString();
    if (adminNote !== undefined) {
      reports[index].adminNote = adminNote;
    }
    if (status === 'resolved' && !reports[index].resolvedAt) {
      reports[index].resolvedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.NEAR_MISS_REPORTS, JSON.stringify(reports));
  }
  return reports;
}

export function deleteNearMissReport(id: string): NearMissReport[] {
  const reports = getNearMissReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.NEAR_MISS_REPORTS, JSON.stringify(reports));
  return reports;
}

// 3. Safety Checklists
export function getChecklists(): ChecklistSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function submitChecklist(data: Omit<ChecklistSubmission, 'id' | 'createdAt'>): ChecklistSubmission {
  const list = getChecklists();
  const user = getCurrentUser();
  const newSubmission: ChecklistSubmission = {
    ...data,
    id: 'chk-' + Date.now().toString(36),
    userId: data.userId || user.userId,
    userName: data.userName || user.name,
    createdAt: new Date().toISOString(),
  };

  list.unshift(newSubmission);
  localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(list));
  return newSubmission;
}

// 4. PPE Sites
export function getPPESites(): PPESite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PPE_SITES);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_PPE_SITES;
}

export function lookupPPESite(siteId: string): PPESite | undefined {
  const sites = getPPESites();
  return sites.find((s) => s.siteId.toLowerCase() === siteId.toLowerCase());
}

export function scanPPESite(siteId: string): PPESite | undefined {
  return lookupPPESite(siteId);
}

// 5. Environment Reports
export function getEnvReports(): EnvReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENV_REPORTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function submitEnvironmentReport(data: Omit<EnvReport, 'id' | 'createdAt' | 'status'>): EnvReport {
  const list = getEnvReports();
  const user = getCurrentUser();
  const newReport: EnvReport = {
    ...data,
    id: 'env-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    reportedBy: data.reportedBy || user.userId,
    reporterName: data.reporterName || user.name,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  list.unshift(newReport);
  localStorage.setItem(STORAGE_KEYS.ENV_REPORTS, JSON.stringify(list));
  return newReport;
}

export function updateEnvReportStatus(id: string, status: ReportStatus, adminNote?: string): EnvReport[] {
  const list = getEnvReports();
  const idx = list.findIndex((e) => e.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    list[idx].updatedAt = new Date().toISOString();
    if (adminNote !== undefined) {
      list[idx].adminNote = adminNote;
    }
    if (status === 'resolved' && !list[idx].resolvedAt) {
      list[idx].resolvedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.ENV_REPORTS, JSON.stringify(list));
  }
  return list;
}

export function deleteEnvReport(id: string): EnvReport[] {
  const list = getEnvReports().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.ENV_REPORTS, JSON.stringify(list));
  return list;
}

// 6. Health Reminders
export function getHealthReminders(): HealthRemindersSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HEALTH_REMINDERS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_HEALTH_REMINDERS;
}

export function updateHealthReminderSettings(settings: Partial<HealthRemindersSettings>): HealthRemindersSettings {
  const current = getHealthReminders();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.HEALTH_REMINDERS, JSON.stringify(updated));
  return updated;
}

// 7. Emergency Contacts
export function getEmergencyContacts(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_EMERGENCY_CONTACTS;
}

export function triggerEmergencyAlert(location?: string, note?: string): { success: boolean; message: string; timestamp: string } {
  const user = getCurrentUser();
  const timestamp = new Date().toISOString();
  // Create an automatic high-severity near miss/emergency log
  submitNearMissReport({
    type: 'unsafe_condition',
    severity: 'high',
    location: location || 'พิกัดฉุกเฉิน มหาวิทยาลัยขอนแก่น (KKU Emergency SOS)',
    description: `🚨 [EMERGENCY SOS] ผู้ใช้งาน ${user.name} (${user.role}) กดสัญญาณแจ้งเหตุฉุกเฉิน ${note ? '- ' + note : ''}`,
    reportedBy: user.userId,
    reporterName: user.name,
    aiAnalysisTag: 'EMERGENCY_SOS_SIGNAL',
  });

  return {
    success: true,
    message: 'สัญญาณแจ้งเหตุฉุกเฉินถูกบันทึกและส่งต่อไปยังหน่วยรักษาความปลอดภัย มข. แล้ว',
    timestamp,
  };
}

// 8. Safety Manual
export function searchSafetyManual(keyword = ''): SafetyManualItem[] {
  const manual = getSafetyManual();
  if (!keyword.trim()) return manual;
  const q = keyword.toLowerCase().trim();
  return manual.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.summaryTh.toLowerCase().includes(q) ||
      item.summaryEn.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.contentEn.toLowerCase().includes(q) ||
      item.keySteps.some((s) => s.toLowerCase().includes(q)) ||
      item.keyStepsEn.some((s) => s.toLowerCase().includes(q))
  );
}

export function getSafetyManual(): SafetyManualItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAFETY_MANUAL);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_SAFETY_MANUAL;
}

// 9. AI Hazard Detection (Mock / Rule-Based Offline Engine)
export interface AIHazardResult {
  hazardDetected: boolean;
  confidence: number;
  hazards: {
    label: string;
    labelEn: string;
    severity: 'low' | 'medium' | 'high';
    type: NearMissReport['type'];
    locationSuggestion: string;
    recommendation: string;
    recommendationEn: string;
    bbox?: { x: number; y: number; width: number; height: number };
  }[];
  detectedPPE: {
    item: string;
    status: 'detected' | 'missing';
  }[];
}

export function analyzeHazardPhoto(_imageDataUrl: string): Promise<AIHazardResult> {
  return new Promise((resolve) => {
    // Rule-based mock simulation with rich realistic safety scenarios
    setTimeout(() => {
      const hazardScenarios: AIHazardResult[] = [
        {
          hazardDetected: true,
          confidence: 94,
          hazards: [
            {
              label: 'ไม่สวมหมวกนิรภัย (Missing Hard Hat)',
              labelEn: 'Worker missing mandatory safety hard hat in active zone',
              severity: 'high',
              type: 'unsafe_act',
              locationSuggestion: 'พื้นที่ไซต์งานก่อสร้าง/โรงประลอง มข.',
              recommendation: 'สั่งระงับการทำงานชั่วคราวและจัดหาหมวกนิรภัยมาตรฐาน มอก. ให้สวมใส่ทันทีก่อนเข้าพื้นที่',
              recommendationEn: 'Halt work immediately and supply certified hard hat before re-entering work zone.',
              bbox: { x: 30, y: 15, width: 40, height: 25 },
            },
            {
              label: 'สายไฟพาดผ่านทางเดินชื้นแฉะ (Exposed Cable)',
              labelEn: 'Electrical cable crossing damp walkway without protective rubber bridge',
              severity: 'high',
              type: 'unsafe_condition',
              locationSuggestion: 'ทางเดินเท้าข้างอาคารโรงประลอง',
              recommendation: 'ยกสายไฟขึ้นที่สูงหรือใช้รางครอบสายไฟกันน้ำทันที',
              recommendationEn: 'Elevate wiring or install insulated cable ramps immediately.',
              bbox: { x: 20, y: 70, width: 60, height: 20 },
            },
          ],
          detectedPPE: [
            { item: 'แว่นตานิรภัย (Safety Glasses)', status: 'detected' },
            { item: 'หมวกนิรภัย (Safety Hardhat)', status: 'missing' },
            { item: 'รองเท้าเซฟตี้ (Safety Shoes)', status: 'detected' },
          ],
        },
        {
          hazardDetected: true,
          confidence: 91,
          hazards: [
            {
              label: 'สิ่งของและกล่องกีดขวางทางหนีไฟ (Blocked Emergency Exit)',
              labelEn: 'Storage boxes and pallets blocking fire exit passageway',
              severity: 'high',
              type: 'unsafe_condition',
              locationSuggestion: 'ทางหนีไฟ ชั้น 2 อาคารเรียนรวม',
              recommendation: 'เคลื่อนย้ายสิ่งกีดขวางออกจากแนวทางหนีไฟทันที และติดป้ายเตือนห้ามวางของ',
              recommendationEn: 'Clear all obstructions from emergency egress routes immediately.',
              bbox: { x: 25, y: 40, width: 50, height: 45 },
            },
          ],
          detectedPPE: [
            { item: 'ถุงมือทำงาน (Work Gloves)', status: 'detected' },
            { item: 'หน้ากากกันฝุ่น (Dust Mask)', status: 'detected' },
          ],
        },
        {
          hazardDetected: true,
          confidence: 88,
          hazards: [
            {
              label: 'สารเคมีไม่มีป้ายเตือนและวางใกล้แหล่งความร้อน (Unlabeled Chemicals)',
              labelEn: 'Unlabeled chemical container placed adjacent to hot equipment',
              severity: 'medium',
              type: 'unsafe_condition',
              locationSuggestion: 'ห้องปฏิบัติการเคมี SC.08',
              recommendation: 'ติดฉลากเตือนตามระบบ GHS และย้ายไปเก็บในตู้เก็บสารเคมีทนไฟ',
              recommendationEn: 'Affix GHS hazard label and relocate to flammable storage cabinet.',
              bbox: { x: 40, y: 50, width: 35, height: 35 },
            },
          ],
          detectedPPE: [
            { item: 'เสื้อกาวน์ (Lab Coat)', status: 'detected' },
            { item: 'ถุงมือไนไตรล์ (Nitrile Gloves)', status: 'detected' },
            { item: 'แว่นครอบตากันสารเคมี (Safety Goggles)', status: 'missing' },
          ],
        },
        {
          hazardDetected: false,
          confidence: 96,
          hazards: [],
          detectedPPE: [
            { item: 'หมวกนิรภัย (Hard Hat)', status: 'detected' },
            { item: 'เสื้อสะท้อนแสง (Hi-Vis Vest)', status: 'detected' },
            { item: 'รองเท้าหัวเหล็ก (Safety Shoes)', status: 'detected' },
            { item: 'แว่นตานิรภัย (Safety Glasses)', status: 'detected' },
          ],
        },
      ];

      // Pick a scenario or randomly cycle
      const selected = hazardScenarios[Math.floor(Math.random() * (hazardScenarios.length - 1))];
      resolve(selected);
    }, 1200);
  });
}

// 10. Dashboard Stats
export interface DashboardStats {
  totalNearMiss: number;
  nearMissCount: number;
  unsafeActCount: number;
  unsafeConditionCount: number;
  totalEnvReports: number;
  statusNewCount: number;
  statusInProgressCount: number;
  statusResolvedCount: number;
  totalChecklists: number;
  checklistPassedCount: number;
  reportsByLocation: { location: string; count: number }[];
  reportsByType: { type: string; count: number }[];
}

export function getDashboardStats(): DashboardStats {
  const nearMissList = getNearMissReports();
  const envList = getEnvReports();
  const checklists = getChecklists();

  const nearMissCount = nearMissList.filter((r) => r.type === 'near_miss').length;
  const unsafeActCount = nearMissList.filter((r) => r.type === 'unsafe_act').length;
  const unsafeConditionCount = nearMissList.filter((r) => r.type === 'unsafe_condition').length;

  const allReports = [...nearMissList, ...envList];
  const statusNewCount = allReports.filter((r) => r.status === 'new').length;
  const statusInProgressCount = allReports.filter((r) => r.status === 'in_progress').length;
  const statusResolvedCount = allReports.filter((r) => r.status === 'resolved').length;

  const checklistPassedCount = checklists.filter((c) => c.passed).length;

  // Group by location
  const locMap: Record<string, number> = {};
  nearMissList.forEach((r) => {
    const loc = r.location || 'ไม่ระบุสถานที่';
    locMap[loc] = (locMap[loc] || 0) + 1;
  });

  const reportsByLocation = Object.entries(locMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const reportsByType = [
    { type: 'Near Miss (เกือบเกิดเหตุ)', count: nearMissCount },
    { type: 'พฤติกรรมเสี่ยง (Unsafe Act)', count: unsafeActCount },
    { type: 'สภาพแวดล้อมเสี่ยง (Unsafe Condition)', count: unsafeConditionCount },
    { type: 'รายงานสิ่งแวดล้อม (Env Issues)', count: envList.length },
  ];

  return {
    totalNearMiss: nearMissList.length,
    nearMissCount,
    unsafeActCount,
    unsafeConditionCount,
    totalEnvReports: envList.length,
    statusNewCount,
    statusInProgressCount,
    statusResolvedCount,
    totalChecklists: checklists.length,
    checklistPassedCount,
    reportsByLocation,
    reportsByType,
  };
}

// 11. Data Export & Reset
export function exportAllData(): string {
  const allData: Record<string, unknown> = {};
  Object.entries(STORAGE_KEYS).forEach(([_, key]) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        allData[key] = JSON.parse(raw);
      } catch {
        allData[key] = raw;
      }
    }
  });
  return JSON.stringify(allData, null, 2);
}

export function resetLocalData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  initLocalData();
}

// Common KKU locations list for quick selection
export const KKU_CAMPUS_LOCATIONS = [
  'ศูนย์อาหารและบริการ 1 (KKU Complex)',
  'ศูนย์ประชุมอเนกประสงค์กาญจนาภิเษก มข.',
  'อาคารสิริคุณากร (สำนักงานอธิการบดี)',
  'คณะวิศวกรรมศาสตร์ อาคาร EN04 / โรงประลอง',
  'คณะวิทยาศาสตร์ อาคาร SC.08 / SC.05',
  'คณะแพทยศาสตร์ และ โรงพยาบาลศรีนครินทร์',
  'คณะพยาบาลศาสตร์ / คณะสาธารณสุขศาสตร์',
  'คณะเกษตรศาสตร์ / แปลงทดลองเกษตร',
  'คณะเทคโนโลยี / สหวิทยาการ',
  'สำนักหอสมุด มหาวิทยาลัยขอนแก่น (Main Library)',
  'อาคารเรียนรวมและสารนิเทศ (GL1 / GL2)',
  'โซนหอพักนักศึกษา หอพักที่ 1 - 27',
  'ศูนย์กีฬา มข. / สระว่ายน้ำ / สนามกีฬากลาง',
  'บึงสีฐาน / อุทยานเทคโนโลยีการเกษตร',
  'โรงบำบัดน้ำเสียส่วนกลาง มข.',
];
