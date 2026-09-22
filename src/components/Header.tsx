import React from 'react';
import { User } from 'firebase/auth';
import { 
  Activity, 
  FileSpreadsheet, 
  RefreshCw, 
  Calendar, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { AUTHOR_NAME, GOOGLE_SHEET_ID } from '../data/mockData';

interface HeaderProps {
  lastUpdated: string;
  isLive: boolean;
  isLoading: boolean;
  user: User | null;
  onRefresh: () => void;
  onLogin: () => void;
  onLogout: () => void;
  sheetTitle: string;
  errorMessage?: string;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  isLive,
  isLoading,
  user,
  onRefresh,
  onLogin,
  onLogout,
  sheetTitle,
  errorMessage,
  totalRecords
}) => {
  return (
    <header className="bg-white border-b border-teal-100 shadow-xs">
      {/* Top Notification Bar if error or status */}
      {errorMessage && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage} (กำลังแสดงข้อมูลการคัดกรองตัวอย่างเพื่อการวิเคราะห์ต่อเนื่อง)</span>
          </div>
          {!user && (
            <button
              onClick={onLogin}
              className="text-xs font-medium text-teal-800 hover:text-teal-900 underline ml-2"
            >
              เข้าสู่ระบบด้วย Google เพื่อซิงค์ Sheet ส่วนตัว
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left: Title, Description, Author */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 shrink-0">
              <Activity className="w-7 h-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-teal-950">
                  รายงานการคัดกรองสุขภาพ
                </h1>
                
                {/* Live / Demo Badge */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isLive 
                    ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-teal-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  {isLive ? 'เชื่อมโยง Google Sheet สด' : 'ข้อมูลพร้อมวิเคราะห์'}
                </span>
              </div>

              <p className="text-sm text-teal-800/80 mb-2">
                ผลรายงานการคัดกรองสุขภาพของบุคคลแต่ละพื้นที่
              </p>

              {/* Author & Timestamp Metadata */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-teal-700">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-teal-600" />
                  <span>ผู้จัดทำ: <strong className="font-semibold text-teal-900">{AUTHOR_NAME}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>อัปเดตล่าสุด: <span className="font-medium text-teal-900">{lastUpdated || 'เพิ่งอัปเดต'}</span></span>
                </div>

                <div className="flex items-center gap-1.5 text-teal-600">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    ข้อมูลในชีต: <span className="font-semibold text-teal-900">{totalRecords} รายการ</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls & Google Sign In */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-teal-800 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-colors disabled:opacity-60 cursor-pointer shadow-2xs"
              title="ดึงข้อมูลล่าสุด"
            >
              <RefreshCw className={`w-4 h-4 text-teal-700 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-teal-200">
                <div className="flex items-center gap-2 bg-teal-50 py-1.5 px-3 rounded-xl border border-teal-200">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Google User'} 
                      className="w-6 h-6 rounded-full border border-teal-300" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-teal-950 truncate max-w-[120px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-teal-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-teal-600" /> ซิงค์แล้ว
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 text-xs text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                  title="ออกจากระบบ"
                >
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                {/* Google "G" icon */}
                <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>เข้าสู่ระบบ Google ซิงค์ Sheet</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
