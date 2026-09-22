import { HealthRecord } from '../types';
import { INITIAL_HEALTH_RECORDS, GOOGLE_SHEET_ID } from '../data/mockData';

// Helper to sanitize and normalize numbers
function parseNum(val: any, defaultVal = 0): number {
  if (val === null || val === undefined) return defaultVal;
  const cleaned = String(val).replace(/,/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? defaultVal : n;
}

// Convert month string or date to readable Thai month
export function formatToThaiMonth(dateStr: string): string {
  if (!dateStr) return 'ไม่ระบุ';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const thaiYear = d.getFullYear() + (d.getFullYear() < 2500 ? 543 : 0);
      return `${thaiMonths[d.getMonth()]} ${thaiYear}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

// Parse raw 2D array from Google Sheets
export function parseSheetRows(rows: any[][]): HealthRecord[] {
  if (!rows || rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  
  // Find column indexes with flexible header matching
  const findCol = (keywords: string[]) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k.toLowerCase())));
  };

  const idxId = findCol(['รหัสบุคคล', 'id', 'รหัส', 'cid', 'person']);
  const idxArea = findCol(['พื้นที่', 'ตำบล', 'หมู่บ้าน', 'area', 'zone', 'ชุมชน']);
  const idxGender = findCol(['เพศ', 'gender', 'sex']);
  const idxAge = findCol(['อายุ', 'age']);
  const idxHeight = findCol(['ส่วนสูง', 'height', 'สูง']);
  const idxWeight = findCol(['น้ำหนัก', 'weight']);
  const idxBmi = findCol(['bmi', 'ดัชนีมวลกาย']);
  const idxSbp = findCol(['sbp', 'ความดันตัวบน', 'ความดัน_sbp', 'ความดันโลหิต']);
  const idxDbp = findCol(['dbp', 'ความดันตัวล่าง', 'ความดัน_dbp']);
  const idxBloodSugar = findCol(['น้ำตาล', 'fbs', 'sugar', 'glucose', 'mg_dl']);
  const idxDiabetes = findCol(['เบาหวาน_คัดกรอง', 'เบาหวาน', 'dm', 'diabetes']);
  const idxHt = findCol(['ความดันโลหิตสูง_คัดกรอง', 'ความดันโลหิตสูง', 'ht', 'hypertension']);
  const idxSmoking = findCol(['สูบบุหรี่', 'บุหรี่', 'smoking', 'smoke']);
  const idxAlcohol = findCol(['ดื่มแอลกอฮอล์', 'แอลกอฮอล์', 'alcohol', 'สุรา']);
  const idxExercise = findCol(['การออกกำลังกาย', 'ออกกำลังกาย', 'exercise']);
  const idxScore = findCol(['คะแนนความเสี่ยง', 'คะแนน', 'risk_score', 'score']);
  const idxRisk = findCol(['ระดับความเสี่ยง', 'ความเสี่ยง', 'risk_level', 'risk']);
  const idxDate = findCol(['วันที่คัดกรอง', 'วันที่', 'date']);
  const idxMonth = findCol(['เดือน', 'month']);

  const records: HealthRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || row.every(c => c === '' || c === null)) continue;

    const id = idxId >= 0 && row[idxId] ? String(row[idxId]).trim() : `P${String(i).padStart(3, '0')}`;
    const area = idxArea >= 0 && row[idxArea] ? String(row[idxArea]).trim() : 'ไม่ระบุพื้นที่';
    
    let gender = 'ไม่ระบุ';
    if (idxGender >= 0 && row[idxGender]) {
      const gStr = String(row[idxGender]).trim().toLowerCase();
      if (gStr.includes('ชาย') || gStr === 'm' || gStr === 'male') gender = 'ชาย';
      else if (gStr.includes('หญิง') || gStr === 'f' || gStr === 'female') gender = 'หญิง';
      else gender = String(row[idxGender]).trim();
    }

    const age = idxAge >= 0 ? parseNum(row[idxAge], 45) : 45;
    const height = idxHeight >= 0 ? parseNum(row[idxHeight], 160) : 160;
    const weight = idxWeight >= 0 ? parseNum(row[idxWeight], 60) : 60;
    
    let bmi = idxBmi >= 0 ? parseNum(row[idxBmi], 0) : 0;
    if (bmi === 0 && height > 0) {
      bmi = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
    }

    const sbp = idxSbp >= 0 ? parseNum(row[idxSbp], 120) : 120;
    const dbp = idxDbp >= 0 ? parseNum(row[idxDbp], 80) : 80;
    const bloodSugar = idxBloodSugar >= 0 ? parseNum(row[idxBloodSugar], 100) : 100;

    const diabetesScreening = idxDiabetes >= 0 && row[idxDiabetes] 
      ? String(row[idxDiabetes]).trim() 
      : (bloodSugar >= 126 ? 'สงสัยป่วย' : bloodSugar >= 100 ? 'กลุ่มเสี่ยง' : 'ปกติ');

    const hypertensionScreening = idxHt >= 0 && row[idxHt] 
      ? String(row[idxHt]).trim() 
      : (sbp >= 140 ? 'สงสัยป่วย' : sbp >= 120 ? 'กลุ่มเสี่ยง' : 'ปกติ');

    const smoking = idxSmoking >= 0 && row[idxSmoking] ? String(row[idxSmoking]).trim() : 'ไม่สูบ';
    const alcohol = idxAlcohol >= 0 && row[idxAlcohol] ? String(row[idxAlcohol]).trim() : 'ไม่ดื่ม';
    const exercise = idxExercise >= 0 && row[idxExercise] ? String(row[idxExercise]).trim() : 'ออกกำลังกายน้อย';

    let riskScore = idxScore >= 0 ? parseNum(row[idxScore], -1) : -1;
    let riskLevel = idxRisk >= 0 && row[idxRisk] ? String(row[idxRisk]).trim() : '';

    // Calculate risk level if not present
    if (!riskLevel) {
      if (sbp >= 140 || bloodSugar >= 126 || riskScore >= 12) {
        riskLevel = 'เสี่ยงสูง';
      } else if (sbp >= 120 || bloodSugar >= 100 || riskScore >= 6) {
        riskLevel = 'เสี่ยงปานกลาง';
      } else {
        riskLevel = 'เสี่ยงต่ำ';
      }
    }

    if (riskScore < 0) {
      let score = 0;
      if (age >= 60) score += 4; else if (age >= 45) score += 2;
      if (bmi >= 25) score += 3;
      if (sbp >= 140) score += 4; else if (sbp >= 120) score += 2;
      if (bloodSugar >= 126) score += 4; else if (bloodSugar >= 100) score += 2;
      if (smoking.includes('ประจำ')) score += 3;
      if (alcohol.includes('ประจำ')) score += 2;
      if (exercise.includes('ไม่')) score += 2;
      riskScore = score;
    }

    const screeningDate = idxDate >= 0 && row[idxDate] ? String(row[idxDate]).trim() : '2024-01-15';
    let screeningMonth = idxMonth >= 0 && row[idxMonth] ? String(row[idxMonth]).trim() : '';
    if (!screeningMonth) {
      screeningMonth = formatToThaiMonth(screeningDate);
    }

    records.push({
      id,
      area,
      gender,
      age,
      height,
      weight,
      bmi,
      sbp,
      dbp,
      bloodSugar,
      diabetesScreening,
      hypertensionScreening,
      smoking,
      alcohol,
      exercise,
      riskScore,
      riskLevel,
      screeningDate,
      screeningMonth
    });
  }

  return records;
}

export interface SheetFetchResult {
  records: HealthRecord[];
  isLive: boolean;
  sheetTitle: string;
  error?: string;
  lastUpdated: string;
}

// Fetch spreadsheet using Google Sheets API v4 with user OAuth Access Token
export async function fetchGoogleSheetData(accessToken?: string | null): Promise<SheetFetchResult> {
  const now = new Date();
  const timeFormatted = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  if (!accessToken) {
    return {
      records: INITIAL_HEALTH_RECORDS,
      isLive: false,
      sheetTitle: 'ชุดข้อมูลจำลอง (รอเข้าสู่ระบบ Google เพื่อเชื่อมโยง Sheet)',
      lastUpdated: timeFormatted
    };
  }

  try {
    // 1. Get spreadsheet metadata to find first sheet title
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}?fields=properties.title,sheets.properties.title`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    if (!metaRes.ok) {
      const errJson = await metaRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Google Sheets API Error (${metaRes.status})`);
    }

    const metaData = await metaRes.json();
    const sheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';
    const spreadsheetTitle = metaData.properties?.title || 'รายงานการคัดกรองสุขภาพ';

    // 2. Fetch all values from the first sheet
    const valuesRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(sheetTitle)}!A1:ZZ`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    if (!valuesRes.ok) {
      const valErr = await valuesRes.json().catch(() => ({}));
      throw new Error(valErr.error?.message || 'ไม่สามารถดึงข้อมูลแถวจาก Sheet ได้');
    }

    const valuesData = await valuesRes.json();
    const parsedRecords = parseSheetRows(valuesData.values || []);

    if (parsedRecords.length === 0) {
      return {
        records: INITIAL_HEALTH_RECORDS,
        isLive: true,
        sheetTitle: `${spreadsheetTitle} (ตารางว่างเปล่า กำลังใช้ข้อมูลตั้งต้น)`,
        lastUpdated: timeFormatted,
        error: 'ตารางใน Google Sheet ยังไม่มีข้อมูลระบบจึงใช้ข้อมูลตัวอย่าง'
      };
    }

    return {
      records: parsedRecords,
      isLive: true,
      sheetTitle: `${spreadsheetTitle} (${sheetTitle})`,
      lastUpdated: timeFormatted
    };
  } catch (error: any) {
    console.warn('Sheets API fetch notice:', error);
    return {
      records: INITIAL_HEALTH_RECORDS,
      isLive: false,
      sheetTitle: 'รายงานการคัดกรองสุขภาพ',
      error: error.message || 'ไม่สามารถเชื่อมต่อ Google Sheets กรุณาตรวจสอบสิทธิ์',
      lastUpdated: timeFormatted
    };
  }
}
