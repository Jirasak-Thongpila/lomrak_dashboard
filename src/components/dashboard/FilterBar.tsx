"use client";

import { Search, Calendar, Users, Home } from "lucide-react";
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
}: FilterBarProps) {
  return (
    <div className="bg-white border border-pink-100 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      {/* Year Selector */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <span className="text-xs text-slate-600 flex items-center gap-1 mr-1 font-medium">
          <Calendar className="w-3.5 h-3.5" /> ปี พ.ศ.:
        </span>
        <button
          onClick={() => onSelectYear("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            selectedYear === "all"
              ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
              : "bg-pink-50 text-slate-600 hover:bg-pink-100"
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
                ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                : "bg-pink-50 text-slate-600 hover:bg-pink-100"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Selected District Tag */}
      {selectedDistrict && (
        <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-3 py-1 rounded-lg text-xs text-pink-700">
          <span>เลือกอำเภอ: <strong>{selectedDistrict}</strong></span>
          <button
            onClick={onClearDistrict}
            className="text-pink-600 hover:text-pink-900 ml-1 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Metric Switcher & District Search */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex bg-pink-50 p-1 rounded-xl border border-pink-100">
          <button
            onClick={() => onMetricChange("patients")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              metric === "patients"
                ? "bg-pink-500 text-white shadow"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ผู้ป่วยบำบัด</span>
          </button>
          <button
            onClick={() => onMetricChange("communities")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              metric === "communities"
                ? "bg-pink-500 text-white shadow"
                : "text-slate-500 hover:text-slate-800"
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
            className="w-full bg-white border border-pink-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
