"use client";

import { useMemo, useState } from "react";
import { SISAKET_DISTRICTS } from "@/data/sisaket-districts";
import type { DistrictSummary, MetricType } from "@/types/lomrak";
import { MapPin } from "lucide-react";

interface SisaketMapProps {
  districtData: DistrictSummary[];
  metric: MetricType;
  selectedDistrict: string | null;
  onSelectDistrict: (district: string) => void;
}

export function SisaketMap({
  districtData,
  metric,
  selectedDistrict,
  onSelectDistrict,
}: SisaketMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const statsMap = useMemo(() => {
    const map = new Map<string, DistrictSummary>();
    for (const d of districtData) {
      map.set(d.district, d);
    }
    return map;
  }, [districtData]);

  const maxVal = useMemo(() => {
    let m = 1;
    for (const d of districtData) {
      const v = metric === "patients" ? d.totalPatients : d.totalCommunities;
      if (v > m) m = v;
    }
    return m;
  }, [districtData, metric]);

  const getColor = (districtName: string) => {
    const stats = statsMap.get(districtName);
    const isSelected = selectedDistrict === districtName;
    if (isSelected) return "#10b981"; // Bright emerald

    if (!stats) return "#1e293b";
    const val = metric === "patients" ? stats.totalPatients : stats.totalCommunities;
    const ratio = Math.min(val / maxVal, 1);

    // Color gradient from dark emerald to vibrant teal
    if (ratio > 0.8) return "#059669";
    if (ratio > 0.6) return "#0d9488";
    if (ratio > 0.4) return "#0f766e";
    if (ratio > 0.2) return "#115e59";
    return "#134e4a";
  };

  const hoveredStats = hoveredDistrict ? statsMap.get(hoveredDistrict) : null;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            แผนที่การกระจายตัว 22 อำเภอ จ.ศรีสะเกษ
          </h3>
          <p className="text-xs text-slate-400">
            แสดงความหนาแน่นตาม{metric === "patients" ? "จำนวนผู้ป่วย" : "จำนวนชุมชน"} (คลิกอำเภอเพื่อกรอง)
          </p>
        </div>
        {/* Heatmap legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span>น้อย</span>
          <div className="flex h-2 w-16 rounded overflow-hidden">
            <span className="w-1/4 bg-[#134e4a]" />
            <span className="w-1/4 bg-[#0f766e]" />
            <span className="w-1/4 bg-[#0d9488]" />
            <span className="w-1/4 bg-[#059669]" />
          </div>
          <span>มาก</span>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="relative w-full aspect-[4/3] max-h-[380px] bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl select-none">
          {/* Sisaket boundary silhouette effect */}
          <path
            d="M 15 35 Q 35 10 50 15 Q 75 20 88 40 Q 90 65 78 85 Q 50 92 20 85 Q 10 65 15 35 Z"
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {SISAKET_DISTRICTS.map((d) => {
            const stats = statsMap.get(d.name);
            const isHovered = hoveredDistrict === d.name;
            const isSelected = selectedDistrict === d.name;

            return (
              <g
                key={d.id}
                onClick={() => onSelectDistrict(d.name)}
                onMouseEnter={() => setHoveredDistrict(d.name)}
                onMouseLeave={() => setHoveredDistrict(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                {/* Node Shape */}
                <circle
                  cx={d.gridX}
                  cy={d.gridY}
                  r={isSelected ? 6.5 : isHovered ? 5.8 : 4.5}
                  fill={getColor(d.name)}
                  stroke={isSelected ? "#ffffff" : isHovered ? "#38bdf8" : "#334155"}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                  className="transition-all duration-200"
                />
                {/* District Label */}
                <text
                  x={d.gridX}
                  y={d.gridY + 6.5}
                  textAnchor="middle"
                  fontSize="2.4"
                  fontWeight={isSelected || isHovered ? "bold" : "normal"}
                  fill={isSelected ? "#34d399" : isHovered ? "#ffffff" : "#cbd5e1"}
                  className="pointer-events-none drop-shadow"
                >
                  {d.name.replace("เมืองศรีสะเกษ", "เมืองฯ")}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredDistrict && (
          <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-xl text-xs shadow-xl backdrop-blur-md pointer-events-none z-10 space-y-0.5">
            <p className="font-bold text-emerald-400">อ.{hoveredDistrict}</p>
            {hoveredStats ? (
              <>
                <p className="text-slate-200">
                  ผู้ป่วยบำบัด: <strong>{hoveredStats.totalPatients} ราย</strong>
                </p>
                <p className="text-slate-300">
                  ชุมชนล้อมรักษ์: <strong>{hoveredStats.totalCommunities} แห่ง</strong>
                </p>
              </>
            ) : (
              <p className="text-slate-400">ไม่มีข้อมูลในปีที่เลือก</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
