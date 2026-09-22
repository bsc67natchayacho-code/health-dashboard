import React from 'react';
import { FilterState } from '../types';
import { MapPin, ShieldAlert, Calendar, Users, RotateCcw, Search } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  areas: string[];
  months: string[];
  totalFiltered: number;
  totalOriginal: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  areas,
  months,
  totalFiltered,
  totalOriginal
}) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleReset = () => {
    onFilterChange({
      area: 'all',
      riskLevel: 'all',
      month: 'all',
      gender: 'all',
      searchQuery: ''
    });
  };

  const isFiltered = filters.area !== 'all' || 
    filters.riskLevel !== 'all' || 
    filters.month !== 'all' || 
    filters.gender !== 'all' || 
    filters.searchQuery !== '';

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs p-4 sm:p-5 mb-6">
      <div className="flex flex-col gap-4">
        
        {/* Top row: Section Label + Results count + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-50 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span className="text-sm font-semibold text-teal-950">ตัวกรองข้อมูลคัดกรอง (4 Filters)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
              พบ {totalFiltered.toLocaleString()} จากทั้งหมด {totalOriginal.toLocaleString()} คน
            </span>

            {isFiltered && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Filters Grid: 4 required filters + search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* 1. Filter: พื้นที่ (Area) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-teal-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              1. พื้นที่
            </label>
            <select
              value={filters.area}
              onChange={(e) => handleChange('area', e.target.value)}
              className="w-full text-xs font-medium bg-teal-50/50 border border-teal-200 rounded-xl px-3 py-2 text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            >
              <option value="all">ทุกพื้นที่ ({areas.length})</option>
              {areas.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* 2. Filter: ระดับความเสี่ยง (Risk Level) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-teal-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
              2. ระดับความเสี่ยง
            </label>
            <select
              value={filters.riskLevel}
              onChange={(e) => handleChange('riskLevel', e.target.value)}
              className="w-full text-xs font-medium bg-teal-50/50 border border-teal-200 rounded-xl px-3 py-2 text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            >
              <option value="all">ทุกระดับความเสี่ยง</option>
              <option value="เสี่ยงสูง">🔴 เสี่ยงสูง</option>
              <option value="เสี่ยงปานกลาง">🟡 เสี่ยงปานกลาง</option>
              <option value="เสี่ยงต่ำ">🟢 เสี่ยงต่ำ</option>
            </select>
          </div>

          {/* 3. Filter: เดือน (Month) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-teal-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              3. เดือน
            </label>
            <select
              value={filters.month}
              onChange={(e) => handleChange('month', e.target.value)}
              className="w-full text-xs font-medium bg-teal-50/50 border border-teal-200 rounded-xl px-3 py-2 text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            >
              <option value="all">ทุกช่วงเดือน ({months.length})</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* 4. Filter: เพศ (Gender) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-teal-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              4. เพศ
            </label>
            <select
              value={filters.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full text-xs font-medium bg-teal-50/50 border border-teal-200 rounded-xl px-3 py-2 text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            >
              <option value="all">ทุกเพศ (ชาย / หญิง)</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>

          {/* Quick Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-teal-900 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-teal-600" />
              ค้นหารหัสบุคคล/พื้นที่
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => handleChange('searchQuery', e.target.value)}
                placeholder="เช่น P001, หนองหอย..."
                className="w-full text-xs font-medium bg-teal-50/50 border border-teal-200 rounded-xl pl-8 pr-3 py-2 text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-teal-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
