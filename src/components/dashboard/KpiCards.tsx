"use client";

import { Users, Home, Award, TrendingUp, TrendingDown } from "lucide-react";
import type { KpiMetrics } from "@/types/lomrak";

interface KpiCardsProps {
  metrics: KpiMetrics;
  selectedYear: number | "all";
}

export function KpiCards({ metrics, selectedYear }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Patients */}
      <div className="bg-white border border-pink-100 rounded-2xl p-5 relative overflow-hidden group hover:border-pink-300 transition shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">ผู้ป่วยเข้ารับบำบัดรวม</span>
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.totalPatients.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">ราย</span>
        </div>
        {metrics.yearOverYearGrowth !== null && (
          <div className="mt-2 flex items-center gap-1 text-xs font-medium">
            {metrics.yearOverYearGrowth >= 0 ? (
              <span className="flex items-center text-pink-500">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{metrics.yearOverYearGrowth}%
              </span>
            ) : (
              <span className="flex items-center text-rose-400">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{metrics.yearOverYearGrowth}%
              </span>
            )}
            <span className="text-slate-500">เทียบกับปีก่อน</span>
          </div>
        )}
      </div>

      {/* Card 2: Total Communities */}
      <div className="bg-white border border-fuchsia-100 rounded-2xl p-5 relative overflow-hidden group hover:border-fuchsia-300 transition shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">หมู่บ้าน/ชุมชนล้อมรักษ์</span>
          <div className="w-9 h-9 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center border border-fuchsia-100">
            <Home className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.totalCommunities.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">แห่ง</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">ครอบคลุม 22 อำเภอทั่วจังหวัด</p>
      </div>

      {/* Card 3: Top District */}
      <div className="bg-white border border-rose-100 rounded-2xl p-5 relative overflow-hidden group hover:border-rose-300 transition shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">อำเภอที่มีผู้บำบัดสูงสุด</span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-slate-900 truncate max-w-[170px]" title={metrics.topDistrict.name}>
            {metrics.topDistrict.name}
          </span>
        </div>
        <p className="mt-2 text-xs text-rose-600">
          {metrics.topDistrict.patients.toLocaleString()} ราย ({metrics.topDistrict.percentage}% ของทั้งจังหวัด)
        </p>
      </div>

      {/* Card 4: Patients per community */}
      <div className="bg-white border border-pink-100 rounded-2xl p-5 relative overflow-hidden group hover:border-pink-300 transition shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">อัตราเฉลี่ยผู้ป่วยต่อชุมชน</span>
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.avgPatientsPerCommunity}
          </span>
          <span className="text-xs text-slate-500">ราย / ชุมชน</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {selectedYear === "all" ? "สถิติสะสมทุกปี" : `สถิติประจำปี พ.ศ. ${selectedYear}`}
        </p>
      </div>
    </div>
  );
}
