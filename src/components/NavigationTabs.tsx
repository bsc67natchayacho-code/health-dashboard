import React from 'react';
import { ActiveTab } from '../types';
import { PieChart, TrendingUp, Table } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  recordCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  recordCount
}) => {
  const tabs = [
    {
      id: 'tab1_overview' as ActiveTab,
      label: 'ภาพรวมความเสี่ยงและพื้นที่',
      sublabel: 'Health Risk & Area Distribution',
      icon: PieChart
    },
    {
      id: 'tab2_behavior' as ActiveTab,
      label: 'พฤติกรรมและแนวโน้มสุขภาพ',
      sublabel: 'Health Trend & Lifestyle Behaviors',
      icon: TrendingUp
    },
    {
      id: 'tab3_details' as ActiveTab,
      label: 'ตารางข้อมูลเชิงลึกรายบุคคล',
      sublabel: `Individual Detail View (${recordCount} คน)`,
      icon: Table
    }
  ];

  return (
    <nav className="mb-6">
      <div className="flex border-b border-teal-200 overflow-x-auto gap-2 sm:gap-4 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2.5 py-3 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer rounded-t-xl ${
                isActive
                  ? 'border-teal-600 text-teal-950 bg-teal-50/70 shadow-2xs font-semibold'
                  : 'border-transparent text-teal-700/70 hover:text-teal-900 hover:bg-teal-50/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-teal-500'}`} />
              <div className="text-left">
                <div className="leading-tight">{tab.label}</div>
                <div className="text-[10px] text-teal-600/80 font-normal hidden sm:block">
                  {tab.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
