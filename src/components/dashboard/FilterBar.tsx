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
    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
      {/* Year Selector */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" /> ปี พ.ศ.:
        </span>
        <button
          onClick={() => onSelectYear("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            selectedYear === "all"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Selected District Tag & Reset All */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedDistrict && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-xs text-emerald-800 font-medium">
            <span>เลือกอำเภอ: <strong>{selectedDistrict}</strong></span>
            <button
              onClick={onClearDistrict}
              className="text-emerald-600 hover:text-emerald-900 ml-1 font-bold"
              title="ยกเลิกการเลือกอำเภอ"
            >
              ×
            </button>
          </div>
        )}

        {isFiltered && onResetAllFilters && (
          <button
            onClick={onResetAllFilters}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition"
            title="ล้างเงื่อนไขการค้นหาและฟิลเตอร์ทั้งหมด"
          >
            <RotateCcw className="w-3 h-3 text-rose-600" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        )}
      </div>

      {/* Metric Switcher & District Search */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onMetricChange("patients")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              metric === "patients"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ผู้ป่วยบำบัด</span>
          </button>
          <button
            onClick={() => onMetricChange("communities")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              metric === "communities"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>
    </div>
  );
}
