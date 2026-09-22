import { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { HealthRecord, FilterState, KPIData, ActiveTab } from './types';
import { INITIAL_HEALTH_RECORDS, GOOGLE_SHEET_ID } from './data/mockData';
import { fetchGoogleSheetData } from './services/sheetsService';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/firebase';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KPICards } from './components/KPICards';
import { NavigationTabs } from './components/NavigationTabs';
import { TabRiskAndArea } from './components/TabRiskAndArea';
import { TabBehaviorAndTrends } from './components/TabBehaviorAndTrends';
import { TabDetailTable } from './components/TabDetailTable';

export default function App() {
  const [records, setRecords] = useState<HealthRecord[]>(INITIAL_HEALTH_RECORDS);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>('รายงานการคัดกรองสุขภาพ');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('tab1_overview');

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    area: 'all',
    riskLevel: 'all',
    month: 'all',
    gender: 'all',
    searchQuery: ''
  });

  // Load initial data or sync when user changes
  const loadData = async (token?: string | null) => {
    setIsLoading(true);
    setErrorMessage(undefined);
    try {
      const activeToken = token !== undefined ? token : getAccessToken();
      const result = await fetchGoogleSheetData(activeToken);
      setRecords(result.records);
      setIsLive(result.isLive);
      setSheetTitle(result.sheetTitle);
      setLastUpdated(result.lastUpdated);
      if (result.error) {
        setErrorMessage(result.error);
      }
    } catch (err: any) {
      console.error('Failed to load sheet data:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Google Sheet');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth initialization
  useEffect(() => {
    // Initial fetch with default token or fallback
    loadData(getAccessToken());

    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        loadData(token);
      },
      () => {
        setUser(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        await loadData(res.accessToken);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setErrorMessage(error.message || 'การเข้าสู่ระบบไม่สำเร็จ');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      await loadData(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Extract distinct areas and months for filter dropdowns
  const areas = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.area) set.add(r.area);
    });
    return Array.from(set).sort();
  }, [records]);

  const months = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.screeningMonth) set.add(r.screeningMonth);
    });
    return Array.from(set);
  }, [records]);

  // Filtered records based on 4 filters + search
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filters.area !== 'all' && r.area !== filters.area) return false;
      if (filters.riskLevel !== 'all' && r.riskLevel !== filters.riskLevel) return false;
      if (filters.month !== 'all' && r.screeningMonth !== filters.month) return false;
      if (filters.gender !== 'all' && r.gender !== filters.gender) return false;

      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(query);
        const matchesArea = r.area.toLowerCase().includes(query);
        const matchesLevel = r.riskLevel.toLowerCase().includes(query);
        if (!matchesId && !matchesArea && !matchesLevel) return false;
      }

      return true;
    });
  }, [records, filters]);

  // Compute KPIs
  const kpis: KPIData = useMemo(() => {
    const totalCount = filteredRecords.length;
    if (totalCount === 0) {
      return {
        totalCount: 0,
        avgBloodSugar: 0,
        avgRiskScore: 0,
        sbpMin: 0,
        sbpMax: 0,
        highRiskPercentage: 0,
        highRiskCount: 0,
        moderateRiskCount: 0,
        lowRiskCount: 0
      };
    }

    const totalSugar = filteredRecords.reduce((sum, r) => sum + r.bloodSugar, 0);
    const totalScore = filteredRecords.reduce((sum, r) => sum + r.riskScore, 0);

    const sbpValues = filteredRecords.map(r => r.sbp);
    const sbpMin = Math.min(...sbpValues);
    const sbpMax = Math.max(...sbpValues);

    const highRiskCount = filteredRecords.filter(r => r.riskLevel === 'เสี่ยงสูง').length;
    const moderateRiskCount = filteredRecords.filter(r => r.riskLevel === 'เสี่ยงปานกลาง').length;
    const lowRiskCount = filteredRecords.filter(r => r.riskLevel === 'เสี่ยงต่ำ').length;

    const highRiskPercentage = (highRiskCount / totalCount) * 100;

    return {
      totalCount,
      avgBloodSugar: totalSugar / totalCount,
      avgRiskScore: totalScore / totalCount,
      sbpMin,
      sbpMax,
      highRiskPercentage,
      highRiskCount,
      moderateRiskCount,
      lowRiskCount
    };
  }, [filteredRecords]);

  return (
    <div className="min-h-screen bg-[#f7fdfc] text-[#134e4a] flex flex-col font-sans">
      
      {/* 1. Header with Metadata, Title, Description, Timestamp, Author & Google Sign-in */}
      <Header
        lastUpdated={lastUpdated}
        isLive={isLive}
        isLoading={isLoading}
        user={user}
        onRefresh={() => loadData()}
        onLogin={handleLogin}
        onLogout={handleLogout}
        sheetTitle={sheetTitle}
        errorMessage={errorMessage}
        totalRecords={records.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 1. Filter Bar: พื้นที่, ระดับความเสี่ยง, เดือน, เพศ */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          areas={areas}
          months={months}
          totalFiltered={filteredRecords.length}
          totalOriginal={records.length}
        />

        {/* 2. KPI Cards: Health Overview Summary */}
        <KPICards kpi={kpis} />

        {/* 5. Navigation Bar / 3 Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          recordCount={filteredRecords.length}
        />

        {/* Tab 1: ภาพรวมความเสี่ยงและพื้นที่ */}
        {activeTab === 'tab1_overview' && (
          <div className="animate-in fade-in duration-200">
            <TabRiskAndArea records={filteredRecords} />
          </div>
        )}

        {/* Tab 2: พฤติกรรมและแนวโน้มสุขภาพ */}
        {activeTab === 'tab2_behavior' && (
          <div className="animate-in fade-in duration-200">
            <TabBehaviorAndTrends records={filteredRecords} />
          </div>
        )}

        {/* Tab 3: ตารางข้อมูลเชิงลึกรายบุคคล */}
        {activeTab === 'tab3_details' && (
          <div className="animate-in fade-in duration-200">
            <TabDetailTable records={filteredRecords} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-100 py-6 mt-12 text-center text-xs text-teal-700/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            รายงานการคัดกรองสุขภาพ © 2026 | จัดทำโดย นางสาวณัฐชยา ชนชิด
          </p>
          <p className="text-[11px] text-teal-600">
            เชื่อมโยงข้อมูล Google Sheet ID: <span className="font-mono bg-teal-50 px-1 py-0.5 rounded">{GOOGLE_SHEET_ID}</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
