export interface HealthRecord {
  id: string; // รหัสบุคคล
  area: string; // พื้นที่
  gender: 'ชาย' | 'หญิง' | string; // เพศ
  age: number; // อายุ
  height?: number; // ส่วนสูง (cm)
  weight?: number; // น้ำหนัก (kg)
  bmi: number; // BMI
  sbp: number; // ความดันโลหิตตัวบน SBP (mmHg)
  dbp?: number; // ความดันโลหิตตัวล่าง DBP (mmHg)
  bloodSugar: number; // น้ำตาลในเลือด (mg/dL)
  diabetesScreening: 'ปกติ' | 'กลุ่มเสี่ยง' | 'สงสัยป่วย' | string; // เบาหวาน_คัดกรอง
  hypertensionScreening: 'ปกติ' | 'กลุ่มเสี่ยง' | 'สงสัยป่วย' | string; // ความดันโลหิตสูง_คัดกรอง
  smoking: 'ไม่สูบ' | 'เคยสูบ' | 'สูบเป็นประจำ' | string; // สูบบุหรี่
  alcohol: 'ไม่ดื่ม' | 'ดื่มนานๆ ครั้ง' | 'ดื่มประจำ' | string; // ดื่มแอลกอฮอล์
  exercise: 'ไม่ออกกำลังกาย' | 'ออกกำลังกายน้อย' | 'สม่ำเสมอ (>=3วัน/สัปดาห์)' | string; // การออกกำลังกาย
  riskScore: number; // คะแนนความเสี่ยง
  riskLevel: 'เสี่ยงต่ำ' | 'เสี่ยงปานกลาง' | 'เสี่ยงสูง' | string; // ระดับความเสี่ยง
  screeningDate: string; // วันที่คัดกรอง
  screeningMonth: string; // เดือน
}

export interface FilterState {
  area: string;
  riskLevel: string;
  month: string;
  gender: string;
  searchQuery: string;
}

export interface KPIData {
  totalCount: number;
  avgBloodSugar: number;
  avgRiskScore: number;
  sbpMin: number;
  sbpMax: number;
  highRiskPercentage: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
}

export type ActiveTab = 'tab1_overview' | 'tab2_behavior' | 'tab3_details';
