/**
 * SafeMate Bilingual Dictionary (TH / EN)
 * รองรับภาษาไทยและภาษาอังกฤษครอบคลุมทุกจุดในแอปพลิเคชัน
 */

export const translations = {
  th: {
    appName: 'KKU Nearmiss Safety',
    tagline: 'Safe • Simple • Fast',
    greeting: 'วันนี้ปลอดภัยไหม?',
    welcomeBack: 'ยินดีต้อนรับ',
    offlineMode: 'พร้อมใช้งานออฟไลน์',
    synced: 'บันทึกในเครื่องแล้ว',
    
    // Quick Actions
    actionReportHazard: 'แจ้งอันตราย',
    actionReportHazardSub: 'Near Miss / พฤติกรรมเสี่ยง',
    actionChecklist: 'Safety Checklist',
    actionChecklistSub: 'ตรวจความปลอดภัยก่อนเริ่มงาน',
    actionEnvReport: 'แจ้งสิ่งแวดล้อม',
    actionEnvReportSub: 'ขยะ / สารเคมี / น้ำเสีย / ฝุ่น',
    actionEmergency: 'แจ้งเหตุฉุกเฉิน SOS',
    actionEmergencySub: 'โทรด่วน / เบอร์ฉุกเฉิน มข.',
    actionSafetyManual: 'คู่มือความปลอดภัย',
    actionSafetyManualSub: 'PPE / วิธีปฏิบัติ / การปฐมพยาบาล',
    actionAiHazard: 'AI ตรวจจับความเสี่ยง',
    actionAiHazardSub: 'สแกนภาพถ่ายวิเคราะห์อันตราย',
    actionPpeScan: 'สแกน QR ไซต์งาน',
    actionPpeScanSub: 'ตรวจสอบข้อกำหนด PPE ประจำจุด',
    actionDashboard: 'แดชบอร์ดสรุปสถิติ',
    actionDashboardSub: 'สำหรับ จป. / กองอาคารสถานที่',
    actionHealth: 'สุขภาพและสิ่งแวดล้อม',
    actionHealthSub: 'แจ้งเตือนดื่มน้ำ / Heat Stress / AQI',
    actionSettings: 'ตั้งค่า & โปรไฟล์',
    actionSettingsSub: 'ข้อมูลผู้ใช้ / สำรองข้อมูล',

    // Near Miss
    nearMissTitle: 'แจ้งอันตราย / รายงาน Near Miss',
    nearMissDesc: 'รายงานเหตุการณ์เกือบเกิดอุบัติเหตุ หรือสภาพการณ์ที่ไม่ปลอดภัยใน 30 วินาที',
    hazardType: 'ประเภทเหตุการณ์',
    typeNearMiss: 'Near Miss (เกือบเกิดเหตุ)',
    typeUnsafeAct: 'พฤติกรรมไม่ปลอดภัย',
    typeUnsafeCondition: 'สภาพแวดล้อมไม่ปลอดภัย',
    locationLabel: 'สถานที่ / อาคารในมหาวิทยาลัย',
    locationPlaceholder: 'เลือกหรือพิมพ์ระบุสถานที่...',
    severityLabel: 'ระดับความรุนแรง/ความเสี่ยง',
    severityLow: 'ต่ำ (Low)',
    severityMedium: 'ปานกลาง (Medium)',
    severityHigh: 'สูง/เร่งด่วน (High)',
    descLabel: 'รายละเอียดสั้น ๆ (ไม่บังคับ)',
    descPlaceholder: 'เช่น มีสายไฟขาดพาดทางเดิน อาคาร EN04 ชั้น 2...',
    photoLabel: 'ถ่ายรูป / แนบรูปภาพ',
    takePhoto: 'ถ่ายภาพหรือเลือกไฟล์',
    photoAttached: 'แนบรูปภาพแล้ว',
    submitReport: 'ส่งรายงานทันที',
    submitting: 'กำลังบันทึกข้อมูล...',
    reportSuccess: 'บันทึกรายงานสำเร็จ!',
    reportSuccessDesc: 'ข้อมูลถูกจัดเก็บในเครื่องเรียบร้อย และพร้อมให้ทีมความปลอดภัยเข้าแก้ไข',

    // Status
    statusNew: 'รอดำเนินการ',
    statusInProgress: 'กำลังดำเนินการ',
    statusResolved: 'แก้ไขแล้ว / ปลอดภัย',

    // Checklist
    checklistTitle: 'Safety Checklist ก่อนเริ่มงาน',
    checklistDesc: 'ตรวจสอบความพร้อมและความปลอดภัยหน้างานภายใน 1 นาที',
    areaSelect: 'เลือกพื้นที่ / งานที่ปฏิบัติ',
    selectAll: 'เลือกทั้งหมดที่พร้อม',
    resetChecklist: 'เริ่มใหม่',
    submitChecklist: 'ยืนยันและบันทึกผลการตรวจ',
    checklistPassed: 'ผ่านเกณฑ์ความปลอดภัย! เริ่มงานได้',
    checklistFailed: 'ยังไม่ผ่านเกณฑ์! กรุณาแก้ไขรายการที่ยังไม่พร้อมก่อนเริ่มงาน',

    // PPE Scan
    ppeScanTitle: 'สแกน QR จุดตรวจ PPE ประจำพื้นที่',
    ppeScanDesc: 'ตรวจสอบข้อกำหนดอุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคลประจำจุด',
    selectSiteSim: 'เลือกไซต์งาน / ห้องปฏิบัติการ (จำลองสแกน)',
    requiredPpeList: 'อุปกรณ์ PPE ที่ต้องสวมใส่ในพื้นที่นี้:',
    workInstruction: 'คำแนะนำการปฏิบัติงานอย่างปลอดภัย:',
    riskLevel: 'ระดับความเสี่ยงของพื้นที่:',

    // AI Hazard Detection
    aiHazardTitle: 'AI Hazard Detection (จำลองระบบตรวจจับ)',
    aiHazardDesc: 'ถ่ายภาพหน้างานเพื่อให้ AI ช่วยตรวจจับความเสี่ยงและอุปกรณ์ PPE',
    uploadToScan: 'อัปโหลดภาพถ่ายเพื่อวิเคราะห์ความปลอดภัย',
    analyzing: 'ระบบ AI กำลังประมวลผลภาพ...',
    analysisResult: 'ผลการตรวจจับความเสี่ยงโดย AI:',
    convertToReport: 'นำผลตรวจนี้ไปแจ้ง Near Miss ทันที',

    // Health Reminders
    healthTitle: 'สุขภาพและความปลอดภัยในการทำงาน',
    healthDesc: 'ระบบแจ้งเตือนพักสายตา ดื่มน้ำ และตรวจสภาพอากาศ / ดัชนีความร้อน',
    waterTracker: 'การดื่มน้ำประจำวัน',
    drinkGlass: '+ ดื่มน้ำ 1 แก้ว (250 มล.)',
    eyeRest: 'กฎพักสายตา 20-20-20',
    eyeRestDesc: 'ทำงาน 20 นาที พักมองไกล 20 ฟุต นาน 20 วินาที',
    heatStressIndex: 'ดัชนีความร้อน (Heat Stress Index)',
    heatStressWarning: 'ระวังอาการเพลียแดด ดื่มน้ำสม่ำเสมอและพักในที่ร่ม',
    aqiLabel: 'คุณภาพอากาศ KKU (PM2.5)',
    uvLabel: 'ดัชนีรังสียูวี (UV Index)',

    // Environment
    envTitle: 'รายงานปัญหาสิ่งแวดล้อม & ขยะ',
    envDesc: 'ร่วมรักษาภูมิทัศน์และสิ่งแวดล้อมสีเขียวของมหาวิทยาลัยขอนแก่น',
    envCategory: 'ประเภทปัญหา',
    catWaste: 'ขยะล้น / ขยะอันตราย',
    catChemical: 'สารเคมีหก / รั่วไหล',
    catWastewater: 'น้ำเสีย / ท่อตัน / น้ำขัง',
    catOil: 'น้ำมันรั่ว / คราบน้ำมัน',
    catDust: 'ฝุ่นละออง / ควันก่อสร้าง',
    catNoise: 'มลพิษทางเสียง',

    // Emergency
    emergencyTitle: 'แจ้งเหตุฉุกเฉิน (Emergency SOS)',
    emergencyDesc: 'สายด่วนและเบอร์โทรฉุกเฉินภายในมหาวิทยาลัยขอนแก่น 24 ชั่วโมง',
    callNow: 'โทรออกทันที',
    emergencyTriggered: 'ส่งสัญญาณแจ้งเหตุฉุกเฉินแล้ว!',

    // Manual
    manualTitle: 'คู่มือความปลอดภัย & OSHE',
    manualDesc: 'แนวปฏิบัติความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม',
    searchPlaceholder: 'ค้นหาคู่มือ เช่น สารเคมี, สวมหมวก, ไฟไหม้, ปวดหลัง...',

    // Dashboard
    dashboardTitle: 'แดชบอร์ดสถิติความปลอดภัย (OSHE)',
    dashboardDesc: 'ภาพรวมเหตุการณ์และสถานะการแก้ไขปัญหาแบบเรียลไทม์',
    totalReports: 'รายงานทั้งหมด',
    nearMissCount: 'Near Miss',
    unsafeActCount: 'พฤติกรรมเสี่ยง',
    unsafeCondCount: 'สภาพแวดล้อมเสี่ยง',
    envReportsCount: 'สิ่งแวดล้อม',
    recentActivity: 'รายงานและกิจกรรมล่าสุด',
    updateStatus: 'เปลี่ยนสถานะ',

    // Settings
    settingsTitle: 'ตั้งค่าและข้อมูลผู้ใช้งาน',
    profileSection: 'ข้อมูลส่วนตัว',
    nameLabel: 'ชื่อ - นามสกุล',
    roleLabel: 'บทบาท / ตำแหน่ง',
    facultyLabel: 'คณะ / หน่วยงาน',
    languageLabel: 'ภาษาแสดงผล (Language)',
    exportData: 'สำรองและส่งออกข้อมูล (Export JSON)',
    resetData: 'ล้างข้อมูลทั้งหมดในเครื่อง (Reset Local Data)',
    resetConfirm: 'คุณต้องการล้างข้อมูลทั้งหมดในเครื่องและรีเซ็ตเป็นค่าเริ่มต้นหรือไม่?',
    saveProfile: 'บันทึกข้อมูลส่วนตัว',
    
    // General
    back: 'ย้อนกลับ',
    home: 'หน้าหลัก',
    close: 'ปิด',
    saved: 'บันทึกเรียบร้อย',
    kkuLocation: 'มหาวิทยาลัยขอนแก่น (KKU)',
  },
  en: {
    appName: 'KKU Nearmiss Safety',
    tagline: 'Safe • Simple • Fast',
    greeting: 'Are you safe today?',
    welcomeBack: 'Welcome',
    offlineMode: 'Offline Ready',
    synced: 'Saved Locally',

    // Quick Actions
    actionReportHazard: 'Report Hazard',
    actionReportHazardSub: 'Near Miss / Unsafe Act & Condition',
    actionChecklist: 'Safety Checklist',
    actionChecklistSub: 'Pre-work safety verification',
    actionEnvReport: 'Environment Report',
    actionEnvReportSub: 'Waste / Chemicals / Spills / Dust',
    actionEmergency: 'Emergency SOS',
    actionEmergencySub: '24/7 KKU Hotlines & Quick Call',
    actionSafetyManual: 'Safety Manual',
    actionSafetyManualSub: 'PPE / Guidelines / First Aid',
    actionAiHazard: 'AI Hazard Detection',
    actionAiHazardSub: 'Scan photos for potential risks',
    actionPpeScan: 'Scan PPE Site QR',
    actionPpeScanSub: 'Check required PPE for work areas',
    actionDashboard: 'Safety Dashboard',
    actionDashboardSub: 'For Safety Officers & Supervisors',
    actionHealth: 'Health & Environment',
    actionHealthSub: 'Hydration / Heat Stress / AQI alerts',
    actionSettings: 'Settings & Profile',
    actionSettingsSub: 'User Profile & Data Backup',

    // Near Miss
    nearMissTitle: 'Report Near Miss / Hazard',
    nearMissDesc: 'Report incidents, close calls, or hazards in under 30 seconds',
    hazardType: 'Incident Type',
    typeNearMiss: 'Near Miss (Close Call)',
    typeUnsafeAct: 'Unsafe Act (Behavior)',
    typeUnsafeCondition: 'Unsafe Condition (Hazard)',
    locationLabel: 'Location / Campus Building',
    locationPlaceholder: 'Select or type location...',
    severityLabel: 'Risk / Severity Level',
    severityLow: 'Low',
    severityMedium: 'Medium',
    severityHigh: 'High / Critical',
    descLabel: 'Brief Description (Optional)',
    descPlaceholder: 'e.g. Exposed electrical cable on walkway...',
    photoLabel: 'Take Photo / Attach Image',
    takePhoto: 'Take Photo or Choose File',
    photoAttached: 'Photo Attached',
    submitReport: 'Submit Report Now',
    submitting: 'Saving Report...',
    reportSuccess: 'Report Submitted Successfully!',
    reportSuccessDesc: 'Data has been stored locally and queued for safety team response.',

    // Status
    statusNew: 'New / Pending',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved / Safe',

    // Checklist
    checklistTitle: 'Pre-Work Safety Checklist',
    checklistDesc: 'Quick 1-minute safety readiness verification',
    areaSelect: 'Select Work Area / Activity',
    selectAll: 'Check All Ready',
    resetChecklist: 'Reset Form',
    submitChecklist: 'Submit Checklist Results',
    checklistPassed: 'Passed! Safe to proceed with work',
    checklistFailed: 'Incomplete! Resolve missing items before starting',

    // PPE Scan
    ppeScanTitle: 'PPE QR Site Check',
    ppeScanDesc: 'Verify required Personal Protective Equipment for the site',
    selectSiteSim: 'Select Work Site / Lab (QR Simulator)',
    requiredPpeList: 'Required PPE for this area:',
    workInstruction: 'Safety Work Instructions:',
    riskLevel: 'Site Risk Level:',

    // AI Hazard Detection
    aiHazardTitle: 'AI Hazard Detection (Simulator)',
    aiHazardDesc: 'Analyze workplace photos with AI to detect safety risks',
    uploadToScan: 'Upload photo to analyze hazards',
    analyzing: 'AI is analyzing photo for safety hazards...',
    analysisResult: 'AI Hazard Detection Results:',
    convertToReport: 'Convert Directly to Near Miss Report',

    // Health Reminders
    healthTitle: 'Occupational Health & Wellness',
    healthDesc: 'Hydration reminders, eye breaks, heat stress and air quality monitoring',
    waterTracker: 'Daily Hydration Tracker',
    drinkGlass: '+ Drink 1 Glass (250 ml)',
    eyeRest: '20-20-20 Eye Rest Rule',
    eyeRestDesc: 'Every 20 mins, look 20 feet away for 20 seconds',
    heatStressIndex: 'Heat Stress Index',
    heatStressWarning: 'Risk of heat exhaustion. Drink fluids & take shaded rest.',
    aqiLabel: 'KKU Air Quality (PM2.5)',
    uvLabel: 'UV Radiation Index',

    // Environment
    envTitle: 'Environment & Waste Reporting',
    envDesc: 'Help keep Khon Kaen University clean, green, and sustainable',
    envCategory: 'Issue Category',
    catWaste: 'Waste Overflow / Hazardous Waste',
    catChemical: 'Chemical Spill / Leak',
    catWastewater: 'Wastewater / Blocked Drainage',
    catOil: 'Oil Spill / Leakage',
    catDust: 'Dust / Construction Smoke',
    catNoise: 'Excessive Noise Pollution',

    // Emergency
    emergencyTitle: 'Emergency SOS & Hotlines',
    emergencyDesc: '24/7 Khon Kaen University Emergency and Rescue Contacts',
    callNow: 'Call Immediately',
    emergencyTriggered: 'Emergency SOS Signal Triggered!',

    // Manual
    manualTitle: 'Safety Manual & OSHE Guide',
    manualDesc: 'Occupational safety, health, and environmental standards',
    searchPlaceholder: 'Search manual e.g. chemical, PPE, fire, back pain...',

    // Dashboard
    dashboardTitle: 'OSHE Safety Dashboard',
    dashboardDesc: 'Real-time incident tracking and resolution management',
    totalReports: 'Total Reports',
    nearMissCount: 'Near Miss',
    unsafeActCount: 'Unsafe Acts',
    unsafeCondCount: 'Unsafe Conditions',
    envReportsCount: 'Environment Reports',
    recentActivity: 'Recent Reports & Actions',
    updateStatus: 'Update Status',

    // Settings
    settingsTitle: 'Settings & User Profile',
    profileSection: 'Personal Information',
    nameLabel: 'Full Name',
    roleLabel: 'Role / Designation',
    facultyLabel: 'Faculty / Department',
    languageLabel: 'Display Language',
    exportData: 'Backup / Export JSON Data',
    resetData: 'Reset All Local Data',
    resetConfirm: 'Are you sure you want to reset all local data to default?',
    saveProfile: 'Save Profile Information',

    // General
    back: 'Back',
    home: 'Home',
    close: 'Close',
    saved: 'Saved successfully',
    kkuLocation: 'Khon Kaen University (KKU)',
  },
};
