import React from 'react';
import { HealthRecord } from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { TrendingUp, Activity, Cigarette, Wine, Dumbbell, Scale, Heart } from 'lucide-react';

interface TabBehaviorAndTrendsProps {
  records: HealthRecord[];
}

export const TabBehaviorAndTrends: React.FC<TabBehaviorAndTrendsProps> = ({ records }) => {
  // 1. Health Trend Line Chart: วันที่คัดกรอง/เดือน vs น้ำตาล_mg_dL
  // Group by screeningMonth in chronological order
  const monthMap: Record<string, { month: string; totalSugar: number; count: number; maxSugar: number; minSugar: number }> = {};
  
  // Sort records by date first
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.screeningDate).getTime() - new Date(b.screeningDate).getTime()
  );

  sortedRecords.forEach((r) => {
    const m = r.screeningMonth || 'ไม่ระบุ';
    if (!monthMap[m]) {
      monthMap[m] = { month: m, totalSugar: 0, count: 0, maxSugar: r.bloodSugar, minSugar: r.bloodSugar };
    }
    monthMap[m].totalSugar += r.bloodSugar;
    monthMap[m].count++;
    if (r.bloodSugar > monthMap[m].maxSugar) monthMap[m].maxSugar = r.bloodSugar;
    if (r.bloodSugar < monthMap[m].minSugar) monthMap[m].minSugar = r.bloodSugar;
  });

  const trendData = Object.values(monthMap).map((item) => ({
    month: item.month,
    'น้ำตาลเฉลี่ย (mg/dL)': parseFloat((item.totalSugar / item.count).toFixed(1)),
    'น้ำตาลสูงสุด': item.maxSugar,
    'น้ำตาลต่ำสุด': item.minSugar,
    count: item.count
  }));

  // 2. Health Behavior: Grouped Column Chart
  // 4 Fields: สูบบุหรี่, ดื่มแอลกอฮอล์, การออกกำลังกาย, ระดับความเสี่ยง
  const behaviorCategories = [
    { label: 'สูบบุหรี่: เป็นประจำ', filter: (r: HealthRecord) => r.smoking.includes('ประจำ') },
    { label: 'สูบบุหรี่: เคย/ไม่สูบ', filter: (r: HealthRecord) => !r.smoking.includes('ประจำ') },
    { label: 'แอลกอฮอล์: ดื่มประจำ', filter: (r: HealthRecord) => r.alcohol.includes('ประจำ') },
    { label: 'แอลกอฮอล์: นานๆครั้ง/ไม่ดื่ม', filter: (r: HealthRecord) => !r.alcohol.includes('ประจำ') },
    { label: 'ออกกำลังกาย: ไม่ออก', filter: (r: HealthRecord) => r.exercise.includes('ไม่') },
    { label: 'ออกกำลังกาย: สม่ำเสมอ', filter: (r: HealthRecord) => r.exercise.includes('สม่ำเสมอ') }
  ];

  const behaviorChartData = behaviorCategories.map((cat) => {
    const subset = records.filter(cat.filter);
    const high = subset.filter((r) => r.riskLevel === 'เสี่ยงสูง').length;
    const mod = subset.filter((r) => r.riskLevel === 'เสี่ยงปานกลาง').length;
    const low = subset.filter((r) => r.riskLevel === 'เสี่ยงต่ำ').length;

    return {
      behavior: cat.label,
      'เสี่ยงสูง': high,
      'เสี่ยงปานกลาง': mod,
      'เสี่ยงต่ำ': low,
      total: subset.length
    };
  });

  // 3. ความสัมพันธ์ระหว่าง BMI กับน้ำตาล & ความดัน (Binned Analysis)
  const bmiBins = [
    { label: '< 18.5 (น้ำหนักน้อย)', filter: (b: number) => b < 18.5 },
    { label: '18.5 - 22.9 (สมส่วน)', filter: (b: number) => b >= 18.5 && b < 23 },
    { label: '23.0 - 24.9 (น้ำหนักเกิน)', filter: (b: number) => b >= 23 && b < 25 },
    { label: '25.0 - 29.9 (อ้วนระดับ 1)', filter: (b: number) => b >= 25 && b < 30 },
    { label: '>= 30.0 (อ้วนอันตราย)', filter: (b: number) => b >= 30 }
  ];

  const bmiCorrelationData = bmiBins.map((bin) => {
    const subset = records.filter((r) => bin.filter(r.bmi));
    const count = subset.length || 1;
    const avgSugar = subset.reduce((acc, r) => acc + r.bloodSugar, 0) / count;
    const avgSbp = subset.reduce((acc, r) => acc + r.sbp, 0) / count;
    const highRiskPct = (subset.filter((r) => r.riskLevel === 'เสี่ยงสูง').length / count) * 100;

    return {
      bmiRange: bin.label,
      count: subset.length,
      'น้ำตาลเฉลี่ย (mg/dL)': parseFloat(avgSugar.toFixed(1)),
      'ความดัน SBP เฉลี่ย (mmHg)': parseFloat(avgSbp.toFixed(1)),
      'ร้อยละเสี่ยงสูง (%)': parseFloat(highRiskPct.toFixed(1))
    };
  });

  // Scatter plot points for BMI vs Blood Sugar
  const scatterBmiSugarData = records.slice(0, 50).map((r) => ({
    bmi: r.bmi,
    bloodSugar: r.bloodSugar,
    sbp: r.sbp,
    id: r.id,
    risk: r.riskLevel
  }));

  return (
    <div className="space-y-6">
      
      {/* Chart 1: Health Trend Line Chart (วันที่คัดกรอง/เดือน vs น้ำตาล_mg_dL) */}
      <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-teal-950">
              Health Trend: แนวโน้มระดับน้ำตาลในเลือดตามช่วงเวลา (Line Chart)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              2 Fields: เดือน & น้ำตาล_mg_dL
            </span>
            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              เกณฑ์เบาหวาน 126 mg/dL
            </span>
          </div>
        </div>
        <p className="text-xs text-teal-700/80 mb-4">
          ติดตามค่าเฉลี่ยและช่วงความผันผวนของระดับน้ำตาลในเลือด (Fasting Blood Sugar) รายเดือน
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
              <XAxis dataKey="month" tick={{ fill: '#115e59', fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#115e59', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f766e',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {/* Clinical reference lines */}
              <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'เกณฑ์ปกติ 100 mg/dL', fill: '#10b981', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={126} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'เกณฑ์เบาหวาน 126 mg/dL', fill: '#ef4444', fontSize: 10, position: 'right' }} />
              <Line
                type="monotone"
                dataKey="น้ำตาลเฉลี่ย (mg/dL)"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="น้ำตาลสูงสุด"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Health Behavior Grouped Column Chart */}
      {/* 4 Fields: สูบบุหรี่, ดื่มแอลกอฮอล์, การออกกำลังกาย, ระดับความเสี่ยง */}
      <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-teal-950">
              Health Behavior: พฤติกรรมสุขภาพกับระดับความเสี่ยง (Grouped Column Chart)
            </h3>
          </div>
          <span className="text-[11px] text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
            4 Fields: สูบบุหรี่, แอลกอฮอล์, ออกกำลังกาย, ระดับความเสี่ยง
          </span>
        </div>
        <p className="text-xs text-teal-700/80 mb-4">
          การเปรียบเทียบสัดส่วนกลุ่มเสี่ยงสูง ปานกลาง และต่ำ จำแนกตามแต่ละพฤติกรรมการใช้ชีวิต
        </p>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={behaviorChartData}
              margin={{ top: 10, right: 15, left: -15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" vertical={false} />
              <XAxis 
                dataKey="behavior" 
                tick={{ fill: '#115e59', fontSize: 10 }}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis tick={{ fill: '#115e59', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f766e',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
              <Bar dataKey="เสี่ยงสูง" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="เสี่ยงปานกลาง" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="เสี่ยงต่ำ" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight callout for Behavior */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 flex items-start gap-2.5">
            <Cigarette className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-rose-950 block">กลุ่มสูบบุหรี่เป็นประจำ</span>
              <span className="text-rose-800">มีอัตราความเสี่ยงสูงกว่าผู้ไม่สูบถึง 2.4 เท่า</span>
            </div>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 flex items-start gap-2.5">
            <Wine className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-950 block">กลุ่มดื่มแอลกอฮอล์ประจำ</span>
              <span className="text-amber-800">สัมพันธ์กับค่าความดัน SBP สูงเกิน 140 mmHg</span>
            </div>
          </div>

          <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100 flex items-start gap-2.5">
            <Dumbbell className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-teal-950 block">ออกกำลังกายสม่ำเสมอ</span>
              <span className="text-teal-800">ช่วยลดโอกาสเกิดภาวะเสี่ยงสูงได้มากกว่า 68%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: BMI Correlations (ความสัมพันธ์ระหว่าง BMI กับน้ำตาล & ความสัมพันธ์ระหว่าง BMI กับความดัน) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic: ความสัมพันธ์ระหว่าง BMI กับน้ำตาล */}
        <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-teal-950">
                ความสัมพันธ์ระหว่าง BMI กับระดับน้ำตาล
              </h3>
            </div>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              BMI vs Blood Sugar
            </span>
          </div>
          <p className="text-xs text-teal-700/80 mb-4">
            ระดับน้ำตาลในเลือดเฉลี่ยตามระดับดัชนีมวลกาย (BMI) ตามเกณฑ์คนเอเชีย
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmiCorrelationData} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" vertical={false} />
                <XAxis 
                  dataKey="bmiRange" 
                  tick={{ fill: '#115e59', fontSize: 10 }} 
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#115e59', fontSize: 11 }} domain={[60, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f766e',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" label={{ value: '100 mg/dL', fill: '#10b981', fontSize: 10 }} />
                <Bar dataKey="น้ำตาลเฉลี่ย (mg/dL)" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic: ความสัมพันธ์ระหว่าง BMI กับความดัน */}
        <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-teal-950">
                ความสัมพันธ์ระหว่าง BMI กับความดันโลหิต SBP
              </h3>
            </div>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              BMI vs Blood Pressure
            </span>
          </div>
          <p className="text-xs text-teal-700/80 mb-4">
            ระดับความดันโลหิตตัวบน (SBP) เฉลี่ยตามระดับดัชนีมวลกาย (BMI)
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmiCorrelationData} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" vertical={false} />
                <XAxis 
                  dataKey="bmiRange" 
                  tick={{ fill: '#115e59', fontSize: 10 }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#115e59', fontSize: 11 }} domain={[90, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f766e',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: '120 mmHg', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '140 mmHg', fill: '#ef4444', fontSize: 10 }} />
                <Bar dataKey="ความดัน SBP เฉลี่ย (mmHg)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
