import React from 'react';
import { KPIData } from '../types';
import { Users, Droplets, Gauge, ShieldAlert, HeartPulse } from 'lucide-react';

interface KPICardsProps {
  kpi: KPIData;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpi }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse className="w-5 h-5 text-teal-600" />
        <h2 className="text-base font-bold text-teal-950">
          Health Overview (สรุปตัวชี้วัดสุขภาพสำคัญ)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: จำนวนผู้เข้ารับการคัดกรองทั้งหมด */}
        <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs hover:border-teal-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              จำนวนทั้งหมด
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-950 tracking-tight">
              {kpi.totalCount.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-teal-600">คน</span>
          </div>
          <div className="mt-2 text-xs text-teal-700/80 flex items-center gap-1.5">
            <span>ผู้เข้ารับการคัดกรองในพื้นที่ที่เลือก</span>
          </div>
        </div>

        {/* KPI 2: ค่าเฉลี่ย (ระดับน้ำตาลในเลือดเฉลี่ย และ คะแนนความเสี่ยงเฉลี่ย) */}
        <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs hover:border-teal-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              ค่าเฉลี่ยสุขภาพ
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-teal-800">น้ำตาลเฉลี่ย:</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${kpi.avgBloodSugar >= 126 ? 'text-rose-600' : kpi.avgBloodSugar >= 100 ? 'text-amber-600' : 'text-teal-900'}`}>
                  {kpi.avgBloodSugar.toFixed(1)}
                </span>
                <span className="text-[11px] text-teal-600">mg/dL</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-teal-800">คะแนนเสี่ยงเฉลี่ย:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-teal-900">
                  {kpi.avgRiskScore.toFixed(1)}
                </span>
                <span className="text-[11px] text-teal-600">คะแนน</span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-teal-50 text-[11px] text-teal-600">
            {kpi.avgBloodSugar >= 100 ? '⚠️ ระดับน้ำตาลเฉลี่ยอยู่ในเกณฑ์เฝ้าระวัง' : '✅ ระดับน้ำตาลเฉลี่ยอยู่ในเกณฑ์ปกติ'}
          </div>
        </div>

        {/* KPI 3: ค่าต่ำสุด-ค่าสูงสุด ช่วงความดันโลหิต SBP (Min - Max) */}
        <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs hover:border-teal-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              ช่วงความดันโลหิต SBP
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-950 tracking-tight">
              {kpi.sbpMin} – {kpi.sbpMax}
            </span>
            <span className="text-xs font-medium text-teal-600">mmHg</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-teal-700">
            <span>ต่ำสุด: <strong className="text-teal-900">{kpi.sbpMin}</strong></span>
            <span>สูงสุด: <strong className={kpi.sbpMax >= 140 ? 'text-rose-600' : 'text-teal-900'}>{kpi.sbpMax}</strong></span>
          </div>
          <div className="w-full bg-teal-100/60 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${kpi.sbpMax >= 140 ? 'bg-rose-500' : 'bg-teal-500'}`}
              style={{ width: `${Math.min(100, Math.max(10, ((kpi.sbpMax - 90) / 100) * 100))}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 4: สัดส่วน/ร้อยละ ของผู้ที่มีความเสี่ยงสูง */}
        <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-xs hover:border-rose-200 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              สัดส่วนกลุ่มเสี่ยงสูง
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {kpi.highRiskPercentage.toFixed(1)}%
            </span>
            <span className="text-xs font-medium text-teal-600">
              ({kpi.highRiskCount.toLocaleString()} คน)
            </span>
          </div>
          <div className="mt-2 text-xs text-teal-700/80">
            ปานกลาง {kpi.moderateRiskCount} คน | เสี่ยงต่ำ {kpi.lowRiskCount} คน
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 flex overflow-hidden">
            <div 
              className="bg-rose-500 h-full"
              style={{ width: `${kpi.highRiskPercentage}%` }}
              title={`เสี่ยงสูง ${kpi.highRiskPercentage.toFixed(1)}%`}
            ></div>
            <div 
              className="bg-amber-400 h-full"
              style={{ width: `${kpi.totalCount ? (kpi.moderateRiskCount / kpi.totalCount) * 100 : 0}%` }}
              title="เสี่ยงปานกลาง"
            ></div>
            <div 
              className="bg-teal-500 h-full"
              style={{ width: `${kpi.totalCount ? (kpi.lowRiskCount / kpi.totalCount) * 100 : 0}%` }}
              title="เสี่ยงต่ำ"
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
};
