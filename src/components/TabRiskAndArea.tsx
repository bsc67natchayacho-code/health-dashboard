import React from 'react';
import { HealthRecord } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { ShieldAlert, Activity, MapPin, Users, HeartPulse } from 'lucide-react';

interface TabRiskAndAreaProps {
  records: HealthRecord[];
}

export const TabRiskAndArea: React.FC<TabRiskAndAreaProps> = ({ records }) => {
  // 1. Donut Chart Data: ระดับความเสี่ยง
  const riskCounts = records.reduce(
    (acc, r) => {
      if (r.riskLevel === 'เสี่ยงสูง') acc.high++;
      else if (r.riskLevel === 'เสี่ยงปานกลาง') acc.moderate++;
      else acc.low++;
      return acc;
    },
    { high: 0, moderate: 0, low: 0 }
  );

  const total = records.length || 1;
  const avgScore = records.length 
    ? (records.reduce((s, r) => s + r.riskScore, 0) / records.length).toFixed(1)
    : '0';

  const riskDonutData = [
    { name: 'เสี่ยงสูง', value: riskCounts.high, color: '#ef4444' },
    { name: 'เสี่ยงปานกลาง', value: riskCounts.moderate, color: '#f59e0b' },
    { name: 'เสี่ยงต่ำ', value: riskCounts.low, color: '#10b981' }
  ];

  // 2. Stacked Bar Chart Data: เบาหวาน_คัดกรอง & ความดันโลหิตสูง_คัดกรอง ตามระดับความเสี่ยง
  // Group by riskLevel and see breakdown of DM and HT
  const riskLevels = ['เสี่ยงต่ำ', 'เสี่ยงปานกลาง', 'เสี่ยงสูง'];
  const stackedRiskData = riskLevels.map((lvl) => {
    const subset = records.filter((r) => r.riskLevel === lvl);
    const count = subset.length;
    
    // Screening DM breakdown
    const dmNormal = subset.filter((r) => r.diabetesScreening === 'ปกติ').length;
    const dmRisk = subset.filter((r) => r.diabetesScreening === 'กลุ่มเสี่ยง').length;
    const dmSick = subset.filter((r) => r.diabetesScreening === 'สงสัยป่วย').length;

    // HT breakdown
    const htNormal = subset.filter((r) => r.hypertensionScreening === 'ปกติ').length;
    const htRisk = subset.filter((r) => r.hypertensionScreening === 'กลุ่มเสี่ยง').length;
    const htSick = subset.filter((r) => r.hypertensionScreening === 'สงสัยป่วย').length;

    // Average risk score for this level
    const avgLevelScore = count ? (subset.reduce((acc, r) => acc + r.riskScore, 0) / count).toFixed(1) : 0;

    return {
      riskLevel: lvl,
      totalCount: count,
      avgScore: avgLevelScore,
      'เบาหวาน: ปกติ': dmNormal,
      'เบาหวาน: กลุ่มเสี่ยง': dmRisk,
      'เบาหวาน: สงสัยป่วย': dmSick,
      'ความดัน: ปกติ': htNormal,
      'ความดัน: กลุ่มเสี่ยง': htRisk,
      'ความดัน: สงสัยป่วย': htSick
    };
  });

  // 3. พื้นที่ที่มีผู้เสี่ยงสูง (Area with High Risk Breakdown)
  const areaMap: Record<string, { area: string; total: number; highRisk: number; modRisk: number; lowRisk: number }> = {};
  records.forEach((r) => {
    if (!areaMap[r.area]) {
      areaMap[r.area] = { area: r.area, total: 0, highRisk: 0, modRisk: 0, lowRisk: 0 };
    }
    areaMap[r.area].total++;
    if (r.riskLevel === 'เสี่ยงสูง') areaMap[r.area].highRisk++;
    else if (r.riskLevel === 'เสี่ยงปานกลาง') areaMap[r.area].modRisk++;
    else areaMap[r.area].lowRisk++;
  });

  const areaRiskData = Object.values(areaMap)
    .sort((a, b) => b.highRisk - a.highRisk)
    .slice(0, 8);

  // 4. กลุ่มอายุที่มีความเสี่ยงสูง (Age Groups Breakdown)
  const ageGroups = [
    { label: '< 35 ปี', min: 0, max: 34 },
    { label: '35 - 49 ปี', min: 35, max: 49 },
    { label: '50 - 59 ปี', min: 50, max: 59 },
    { label: '60 ปีขึ้นไป', min: 60, max: 120 }
  ];

  const ageGroupData = ageGroups.map((g) => {
    const subset = records.filter((r) => r.age >= g.min && r.age <= g.max);
    const high = subset.filter((r) => r.riskLevel === 'เสี่ยงสูง').length;
    const mod = subset.filter((r) => r.riskLevel === 'เสี่ยงปานกลาง').length;
    const low = subset.filter((r) => r.riskLevel === 'เสี่ยงต่ำ').length;
    const pctHigh = subset.length ? ((high / subset.length) * 100).toFixed(1) : '0';

    return {
      group: g.label,
      total: subset.length,
      'เสี่ยงสูง': high,
      'เสี่ยงปานกลาง': mod,
      'เสี่ยงต่ำ': low,
      percentHigh: parseFloat(pctHigh)
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Row 1: Health Risk Analysis (Donut Chart & Stacked Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart: สัดส่วนระดับความเสี่ยง & คะแนนความเสี่ยงเฉลี่ย */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-teal-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-teal-950">
                Health Risk: สัดส่วนระดับความเสี่ยง (Donut Chart)
              </h3>
            </div>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              รวม {records.length} คน
            </span>
          </div>
          <p className="text-xs text-teal-700/80 mb-4">
            สัดส่วนผู้เข้ารับการคัดกรองตามระดับความเสี่ยง และคะแนนความเสี่ยงเฉลี่ย
          </p>

          <div className="relative h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} คน (${((Number(value) / total) * 100).toFixed(1)}%)`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f766e',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Summary Text in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-teal-700">คะแนนเฉลี่ย</span>
              <span className="text-2xl font-extrabold text-teal-950">{avgScore}</span>
              <span className="text-[10px] text-teal-600">เต็ม 20 คะแนน</span>
            </div>
          </div>

          {/* Custom Legend with count and percentage */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-teal-50 text-center">
            {riskDonutData.map((d) => (
              <div key={d.name} className="p-2 rounded-xl bg-teal-50/40">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-xs font-semibold text-teal-950">{d.name}</span>
                </div>
                <div className="text-sm font-bold text-teal-900">
                  {d.value} <span className="text-[10px] font-normal text-teal-600">คน</span>
                </div>
                <div className="text-[11px] text-teal-600">
                  {((d.value / total) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Bar Chart: เบาหวาน_คัดกรอง & ความดันโลหิตสูง_คัดกรอง ตามระดับความเสี่ยง */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-teal-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-teal-950">
                Health Risk: คัดกรองเบาหวาน & ความดัน (Stacked Bar Chart)
              </h3>
            </div>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              4 Fields วิเคราะห์
            </span>
          </div>
          <p className="text-xs text-teal-700/80 mb-4">
            การกระจายตัวของผลคัดกรองเบาหวานและภาวะความดันโลหิตสูง ตามระดับความเสี่ยง
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedRiskData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" vertical={false} />
                <XAxis dataKey="riskLevel" tick={{ fill: '#115e59', fontSize: 12 }} />
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
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="เบาหวาน: สงสัยป่วย" stackId="dm" fill="#dc2626" radius={[0, 0, 0, 0]} />
                <Bar dataKey="เบาหวาน: กลุ่มเสี่ยง" stackId="dm" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="เบาหวาน: ปกติ" stackId="dm" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ความดัน: สงสัยป่วย" stackId="ht" fill="#991b1b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ความดัน: กลุ่มเสี่ยง" stackId="ht" fill="#d97706" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ความดัน: ปกติ" stackId="ht" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-[11px] text-teal-700 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100 flex items-center justify-between">
            <span>แท่งซ้าย = ผลคัดกรองเบาหวาน | แท่งขวา = ผลคัดกรองความดันโลหิตสูง</span>
            <span className="font-medium text-teal-900">เกณฑ์: สงสัยป่วย (แดง) / เสี่ยง (ส้ม) / ปกติ (เขียวเทอร์ควอยซ์)</span>
          </div>
        </div>

      </div>

      {/* Row 2: Additional required topics - พื้นที่ที่มีผู้เสี่ยงสูง & กลุ่มอายุที่มีความเสี่ยงสูง */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic: พื้นที่ที่มีผู้เสี่ยงสูง */}
        <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-teal-950">
                พื้นที่ที่มีผู้เสี่ยงสูง (Area High Risk Ranking)
              </h3>
            </div>
            <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              พื้นที่เฝ้าระวังพิเศษ
            </span>
          </div>
          <p className="text-xs text-teal-700/80 mb-4">
            เปรียบเทียบจำนวนผู้มีความเสี่ยงสูง ปานกลาง และต่ำ ในแต่ละพื้นที่
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={areaRiskData}
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#115e59', fontSize: 11 }} />
                <YAxis dataKey="area" type="category" tick={{ fill: '#115e59', fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f766e',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="highRisk" name="เสี่ยงสูง" fill="#ef4444" stackId="areaStack" radius={[0, 0, 0, 0]} />
                <Bar dataKey="modRisk" name="เสี่ยงปานกลาง" fill="#f59e0b" stackId="areaStack" radius={[0, 0, 0, 0]} />
                <Bar dataKey="lowRisk" name="เสี่ยงต่ำ" fill="#14b8a6" stackId="areaStack" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic: กลุ่มอายุที่มีความเสี่ยงสูง */}
        <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-teal-950">
                กลุ่มอายุที่มีความเสี่ยงสูง (Age Group Analysis)
              </h3>
            </div>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              ช่วงวัย & ความเสี่ยง
            </span>
          </div>
          <p className="text-xs text-teal-700/80 mb-4">
            สัดส่วนและจำนวนผู้มีความเสี่ยงสูงจำแนกตามช่วงอายุ
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroupData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" vertical={false} />
                <XAxis dataKey="group" tick={{ fill: '#115e59', fontSize: 11 }} />
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="เสี่ยงสูง" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="เสี่ยงปานกลาง" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="เสี่ยงต่ำ" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
