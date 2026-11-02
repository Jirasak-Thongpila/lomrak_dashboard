"use client";

import { Search, Calendar, Users, Home, RotateCcw } from "lucide-react";
import type { MetricType } from "@/types/lomrak";

interface FilterBarProps {
  years: number[];
  selectedYear: number | "all";
  onSelectYear: (year: number | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  metric: MetricType;
  onMetricChange: (metric: MetricType) => void;
  selectedDistrict: string | null;
  onClearDistrict: () => void;
  onResetAllFilters?: () => void;
}

export function FilterBar({
  years,
  selectedYear,
  onSelectYear,
  searchQuery,
  onSearchChange,
  metric,
  onMetricChange,
  selectedDistrict,
  onClearDistrict,
  onResetAllFilters,
}: FilterBarProps) {
  const isFiltered =
    selectedYear !== "all" ||
    searchQuery.trim().length > 0 ||
    selectedDistrict !== null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Year Selector */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
          <Calendar className="w-3.5 h-3.5" /> ปี พ.ศ.:
        </span>
        <button
          onClick={() => onSelectYear("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            selectedYear === "all"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          ทุกปีสะสม
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => onSelectYear(y)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              selectedYear === y
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Selected District Tag & Reset All */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedDistrict && (
          <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/80 px-3 py-1 rounded-lg text-xs text-emerald-300">
            <span>เลือกอำเภอ: <strong>{selectedDistrict}</strong></span>
            <button
              onClick={onClearDistrict}
              className="text-emerald-400 hover:text-white ml-1 font-bold"
              title="ยกเลิกการเลือกอำเภอ"
            >
              ×
            </button>
          </div>
        )}

        {isFiltered && onResetAllFilters && (
          <button
            onClick={onResetAllFilters}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-medium transition"
            title="ล้างเงื่อนไขการค้นหาและฟิลเตอร์ทั้งหมด"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        )}
      </div>

      {/* Metric Switcher & District Search */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => onMetricChange("patients")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              metric === "patients"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ผู้ป่วยบำบัด</span>
          </button>
          <button
            onClick={() => onMetricChange("communities")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              metric === "communities"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>ชุมชนล้อมรักษ์</span>
          </button>
        </div>

        <div className="relative w-full md:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่ออำเภอ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
