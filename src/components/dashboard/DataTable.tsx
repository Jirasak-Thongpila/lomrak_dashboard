"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { LomrakRecord, SortConfig } from "@/types/lomrak";

interface DataTableProps {
  records: LomrakRecord[];
  sort: SortConfig;
  onSortChange: (key: keyof LomrakRecord | "ratio") => void;
  onExportCsv: () => void;
}

export function DataTable({
  records,
  sort,
  onSortChange,
  onExportCsv,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 11; // 11 items per page (2 pages for 22 districts)

  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">ตารางข้อมูลสถิติรายอำเภอ</h3>
          <p className="text-xs text-slate-500">
            แสดงทั้งหมด {records.length} รายการ (คลิกที่หัวตารางเพื่อจัดเรียง)
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition border border-slate-200 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>ส่งออกข้อมูลตารางนี้</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">#</th>
              <th
                onClick={() => onSortChange("year")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>ปี พ.ศ.</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => onSortChange("district")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>อำเภอ</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => onSortChange("communityCount")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>ชุมชนล้อมรักษ์ (แห่ง)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => onSortChange("patientCount")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>ผู้ป่วยบำบัด (ราย)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => onSortChange("ratio")}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>เฉลี่ย (คน/ชุมชน)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((r, idx) => {
                const numRatio = r.communityCount > 0 ? r.patientCount / r.communityCount : 0;
                const ratioText = numRatio.toFixed(1);
                const progressPct = Math.min(Math.round((numRatio / 7.5) * 100), 100);

                return (
                  <tr key={`${r.year}-${r.district}`} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 text-slate-400">{startIndex + idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-700">{r.year}</td>
                    <td className="py-2.5 px-4 font-semibold text-emerald-700">{r.district}</td>
                    <td className="py-2.5 px-4 text-right text-slate-700">{r.communityCount}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">{r.patientCount}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-teal-700 font-semibold tabular-nums">{ratioText}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          หน้า {currentPage} จาก {totalPages} (แสดง {paginatedRecords.length} จาก {records.length} แถว)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition border border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition border border-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
