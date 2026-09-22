import React, { useState, useMemo } from 'react';
import { HealthRecord } from '../types';
import { 
  ArrowUpDown, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  Eye
} from 'lucide-react';

interface TabDetailTableProps {
  records: HealthRecord[];
}

type SortField = 'id' | 'area' | 'gender' | 'age' | 'bmi' | 'sbp' | 'bloodSugar' | 'exercise' | 'riskScore' | 'riskLevel';
type SortOrder = 'asc' | 'desc';

export const TabDetailTable: React.FC<TabDetailTableProps> = ({ records }) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  // Sorting
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        const res = (aVal as string).localeCompare(bVal as string, 'th');
        return sortOrder === 'asc' ? res : -res;
      } else {
        const numA = Number(aVal) || 0;
        const numB = Number(bVal) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
    });
  }, [records, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'รหัสบุคคล',
      'พื้นที่',
      'เพศ',
      'อายุ',
      'BMI',
      'SBP (mmHg)',
      'น้ำตาล (mg/dL)',
      'การออกกำลังกาย',
      'คะแนนความเสี่ยง',
      'ระดับความเสี่ยง',
      'ผลคัดกรองเบาหวาน',
      'ผลคัดกรองความดัน',
      'สูบบุหรี่',
      'ดื่มแอลกอฮอล์',
      'วันที่คัดกรอง'
    ];

    const rows = sortedRecords.map(r => [
      r.id,
      r.area,
      r.gender,
      r.age,
      r.bmi,
      r.sbp,
      r.bloodSugar,
      r.exercise,
      r.riskScore,
      r.riskLevel,
      r.diabetesScreening,
      r.hypertensionScreening,
      r.smoking,
      r.alcohol,
      r.screeningDate
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `รายงานการคัดกรองสุขภาพ_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Conditional Formatting Helper Functions
  const getRiskLevelBadge = (level: string) => {
    if (level === 'เสี่ยงสูง') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
          <AlertOctagon className="w-3 h-3 text-rose-600" />
          เสี่ยงสูง
        </span>
      );
    }
    if (level === 'เสี่ยงปานกลาง') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          เสี่ยงปานกลาง
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        เสี่ยงต่ำ
      </span>
    );
  };

  const getSugarBadge = (sugar: number) => {
    if (sugar >= 126) {
      return <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{sugar} mg/dL</span>;
    }
    if (sugar >= 100) {
      return <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{sugar} mg/dL</span>;
    }
    return <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{sugar} mg/dL</span>;
  };

  const getSbpBadge = (sbp: number) => {
    if (sbp >= 140) {
      return <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{sbp} mmHg</span>;
    }
    if (sbp >= 120) {
      return <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{sbp} mmHg</span>;
    }
    return <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{sbp} mmHg</span>;
  };

  const getBmiBadge = (bmi: number) => {
    if (bmi >= 30) return <span className="text-rose-700 font-bold">{bmi}</span>;
    if (bmi >= 25) return <span className="text-amber-700 font-medium">{bmi}</span>;
    if (bmi < 18.5) return <span className="text-sky-700">{bmi}</span>;
    return <span className="text-teal-900">{bmi}</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
      
      {/* Header Controls */}
      <div className="p-4 sm:p-5 border-b border-teal-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-teal-950 flex items-center gap-2">
            <span>ตารางแสดงรายละเอียดรายบุคคล (Individual Detail View)</span>
            <span className="text-xs font-normal text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
              {sortedRecords.length} คน
            </span>
          </h3>
          <p className="text-xs text-teal-700/80 mt-1">
            พร้อมระบบ Conditional Formatting เน้นสีแดง (กลุ่มเสี่ยงสูง/น้ำตาล-ความดันเกินเกณฑ์), สีเหลือง (เสี่ยงปานกลาง), สีเขียว (เสี่ยงต่ำ)
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Page size select */}
          <div className="flex items-center gap-1.5 text-xs text-teal-800">
            <span>แสดง:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs font-medium bg-teal-50 border border-teal-200 rounded-lg px-2 py-1 text-teal-950 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value={10}>10 รายการ</option>
              <option value={25}>25 รายการ</option>
              <option value={50}>50 รายการ</option>
              <option value={100}>100 รายการ</option>
            </select>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-colors cursor-pointer"
            title="ส่งออกตารางเป็นไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-teal-50/60 border-b border-teal-100 text-teal-900 font-semibold">
              <th onClick={() => handleSort('id')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>รหัสบุคคล</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('area')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>พื้นที่</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('gender')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>เพศ</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('age')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>อายุ</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('bmi')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>BMI</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('sbp')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>SBP (ความดัน)</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('bloodSugar')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>น้ำตาล (mg/dL)</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('exercise')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>การออกกำลังกาย</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('riskScore')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>คะแนนเสี่ยง</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th onClick={() => handleSort('riskLevel')} className="py-3 px-3.5 cursor-pointer hover:bg-teal-100/50 transition-colors whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>ระดับความเสี่ยง</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>
              <th className="py-3 px-3.5 text-center whitespace-nowrap">
                การทำงาน
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-teal-700">
                  ไม่พบข้อมูลคัดกรองที่ตรงกับตัวกรองที่เลือก
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => {
                const isHighRisk = r.riskLevel === 'เสี่ยงสูง';
                const isModRisk = r.riskLevel === 'เสี่ยงปานกลาง';

                return (
                  <tr 
                    key={r.id} 
                    className={`hover:bg-teal-50/40 transition-colors ${
                      isHighRisk 
                        ? 'bg-rose-50/20' 
                        : isModRisk 
                        ? 'bg-amber-50/15' 
                        : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-3.5 font-bold text-teal-950 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="py-3 px-3.5 text-teal-900 whitespace-nowrap">
                      {r.area}
                    </td>
                    <td className="py-3 px-3.5 text-teal-800 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        r.gender === 'ชาย' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {r.gender}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-teal-900 whitespace-nowrap">
                      {r.age} ปี
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getBmiBadge(r.bmi)}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getSbpBadge(r.sbp)}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getSugarBadge(r.bloodSugar)}
                    </td>
                    <td className="py-3 px-3.5 text-teal-800 whitespace-nowrap">
                      <span className={`text-[11px] ${r.exercise.includes('สม่ำเสมอ') ? 'text-teal-700 font-medium' : 'text-gray-600'}`}>
                        {r.exercise}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-teal-950 whitespace-nowrap">
                      {r.riskScore}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getRiskLevelBadge(r.riskLevel)}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                        title="ดูข้อมูลสุขภาพรายบุคคลฉบับเต็ม"
                      >
                        <Eye className="w-3 h-3 text-teal-600" />
                        <span>ดูรายละเอียด</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-teal-50/40 border-t border-teal-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-teal-800">
        <div>
          แสดงหน้า {currentPage} จากทั้งหมด {totalPages} หน้า (รวม {sortedRecords.length} รายการ)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-teal-200 bg-white hover:bg-teal-50 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="หน้าก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4 text-teal-700" />
          </button>

          {/* Quick page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              pageNum = currentPage - 3 + i + 1;
              if (pageNum > totalPages) pageNum = totalPages - 4 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-teal-600 text-white font-bold shadow-2xs'
                    : 'bg-white border border-teal-200 text-teal-800 hover:bg-teal-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-teal-200 bg-white hover:bg-teal-50 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="หน้าถัดไป"
          >
            <ChevronRight className="w-4 h-4 text-teal-700" />
          </button>
        </div>
      </div>

      {/* Detail Modal for Selected Individual Record */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-teal-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-teal-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-teal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-teal-950">
                    ข้อมูลผลการคัดกรอง: {selectedRecord.id}
                  </h4>
                  <p className="text-xs text-teal-700">
                    พื้นที่: {selectedRecord.area} | วันที่: {selectedRecord.screeningDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-teal-50 hover:bg-teal-100 flex items-center justify-center text-teal-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Risk Level Highlight */}
              <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-teal-700 block text-[11px]">สถานะความเสี่ยงรวม</span>
                  <span className="font-bold text-sm text-teal-950">คะแนนความเสี่ยง: {selectedRecord.riskScore} คะแนน</span>
                </div>
                <div>
                  {getRiskLevelBadge(selectedRecord.riskLevel)}
                </div>
              </div>

              {/* Physical measurements */}
              <div>
                <span className="font-bold text-teal-900 block mb-2">1. ข้อมูลทางกายภาพ & ผลตรวจ</span>
                <div className="grid grid-cols-2 gap-2 text-teal-800">
                  <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                    <span className="text-[11px] text-teal-600 block">เพศ / อายุ</span>
                    <span className="font-semibold text-teal-950">{selectedRecord.gender} / {selectedRecord.age} ปี</span>
                  </div>
                  <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                    <span className="text-[11px] text-teal-600 block">BMI (ดัชนีมวลกาย)</span>
                    <span className="font-semibold text-teal-950">{selectedRecord.bmi} kg/m²</span>
                  </div>
                  <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                    <span className="text-[11px] text-teal-600 block">ความดันโลหิต (SBP)</span>
                    <span className="font-semibold">{getSbpBadge(selectedRecord.sbp)}</span>
                  </div>
                  <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                    <span className="text-[11px] text-teal-600 block">ระดับน้ำตาลในเลือด</span>
                    <span className="font-semibold">{getSugarBadge(selectedRecord.bloodSugar)}</span>
                  </div>
                </div>
              </div>

              {/* Screening Results & Behaviors */}
              <div>
                <span className="font-bold text-teal-900 block mb-2">2. พฤติกรรม & ผลคัดกรองโรคเรื้อรัง</span>
                <div className="grid grid-cols-2 gap-2 text-teal-800">
                  <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                    <span className="text-[11px] text-teal-600 block">คัดกรองเบาหวาน</span>
                    <span className="font-semibold text-teal-950">{selectedRecord.diabetesScreening}</span>
                  </div>
                  <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                    <span className="text-[11px] text-teal-600 block">คัดกรองความดันโลหิต</span>
                    <span className="font-semibold text-teal-950">{selectedRecord.hypertensionScreening}</span>
                  </div>
                  <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                    <span className="text-[11px] text-teal-600 block">การสูบบุหรี่</span>
                    <span className="font-semibold text-teal-950">{selectedRecord.smoking}</span>
                  </div>
                  <div className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                    <span className="text-[11px] text-teal-600 block">การดื่มแอลกอฮอล์</span>
                    <span className="font-semibold text-teal-950">{selectedRecord.alcohol}</span>
                  </div>
                </div>
                <div className="mt-2 bg-teal-50/40 p-2.5 rounded-xl border border-teal-50">
                  <span className="text-[11px] text-teal-600 block">การออกกำลังกาย</span>
                  <span className="font-semibold text-teal-950">{selectedRecord.exercise}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-teal-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
