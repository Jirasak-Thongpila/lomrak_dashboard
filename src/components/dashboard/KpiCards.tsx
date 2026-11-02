"use client";

import { useEffect, useState } from "react";
import { Users, Home, Award, TrendingUp, TrendingDown } from "lucide-react";
import type { KpiMetrics } from "@/types/lomrak";

function useAnimatedCounter(target: number, duration = 500, decimals = 0): string {
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    let startTime: number | null = null;
    const startVal = current;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = startVal + (target - startVal) * easeProgress;
      setCurrent(val);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  if (decimals > 0) {
    return current.toFixed(decimals);
  }
  return Math.round(current).toLocaleString();
}

interface KpiCardsProps {
  metrics: KpiMetrics;
  selectedYear: number | "all";
}

export function KpiCards({ metrics, selectedYear }: KpiCardsProps) {
  const animatedPatients = useAnimatedCounter(metrics.totalPatients);
  const animatedCommunities = useAnimatedCounter(metrics.totalCommunities);
  const animatedTopPatients = useAnimatedCounter(metrics.topDistrict.patients);
  const animatedAvgRatio = useAnimatedCounter(metrics.avgPatientsPerCommunity, 500, 1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Patients */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">ผู้ป่วยเข้ารับบำบัดรวม</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {animatedPatients}
          </span>
          <span className="text-xs text-slate-400">ราย</span>
        </div>
        {metrics.yearOverYearGrowth !== null && (
          <div className="mt-2 flex items-center gap-1 text-xs font-medium">
            {metrics.yearOverYearGrowth >= 0 ? (
              <span className="flex items-center text-emerald-400">
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
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-teal-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">หมู่บ้าน/ชุมชนล้อมรักษ์</span>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <Home className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {animatedCommunities}
          </span>
          <span className="text-xs text-slate-400">แห่ง</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">ครอบคลุม 22 อำเภอทั่วจังหวัด</p>
      </div>

      {/* Card 3: Top District */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">อำเภอที่มีผู้บำบัดสูงสุด</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-white truncate max-w-[170px]" title={metrics.topDistrict.name}>
            {metrics.topDistrict.name}
          </span>
        </div>
        <p className="mt-2 text-xs text-indigo-300">
          <span className="tabular-nums font-semibold">{animatedTopPatients}</span> ราย ({metrics.topDistrict.percentage}% ของทั้งจังหวัด)
        </p>
      </div>

      {/* Card 4: Patients per community */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-sky-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">อัตราเฉลี่ยผู้ป่วยต่อชุมชน</span>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {animatedAvgRatio}
          </span>
          <span className="text-xs text-slate-400">ราย / ชุมชน</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {selectedYear === "all" ? "สถิติสะสมทุกปี" : `สถิติประจำปี พ.ศ. ${selectedYear}`}
        </p>
      </div>
    </div>
  );
}
