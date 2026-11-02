"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DistrictSummary, MetricType } from "@/types/lomrak";

interface DistrictBarChartProps {
  data: DistrictSummary[];
  metric: MetricType;
  selectedDistrict: string | null;
  onSelectDistrict: (district: string) => void;
}

export function DistrictBarChart({
  data,
  metric,
  selectedDistrict,
  onSelectDistrict,
}: DistrictBarChartProps) {
  const chartData = data.slice(0, 12); // Display top 12 districts

  const dataKey = metric === "patients" ? "totalPatients" : "totalCommunities";
  const title = metric === "patients" ? "จัดอันดับอำเภอ (ผู้ป่วยเข้ารับบำบัด)" : "จัดอันดับอำเภอ (จำนวนชุมชนล้อมรักษ์)";

  return (
    <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <p className="text-xs text-slate-500">แสดง 12 อันดับสูงสุด (คลิกแท่งกราฟเพื่อเจาะจงอำเภอ)</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <XAxis
              dataKey="district"
              stroke="#64748b"
              fontSize={10}
              interval={0}
              angle={-35}
              textAnchor="end"
            />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DistrictSummary;
                  return (
                    <div className="bg-white border border-pink-200 p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-semibold text-pink-700">{item.district}</p>
                      <p className="text-slate-700">
                        ผู้ป่วยบำบัด: <strong className="text-slate-900">{item.totalPatients} ราย</strong>
                      </p>
                      <p className="text-slate-600">
                        ชุมชนล้อมรักษ์: <strong>{item.totalCommunities} แห่ง</strong>
                      </p>
                      <p className="text-slate-500">เฉลี่ย: {item.avgRatio} ราย/ชุมชน</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey={dataKey}
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              onClick={(entry: any) => entry && entry.district && onSelectDistrict(entry.district)}
            >
              {chartData.map((entry, index) => {
                const isSelected = selectedDistrict === entry.district;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      isSelected
                        ? "#ec4899"
                        : metric === "patients"
                        ? "#db2777"
                        : "#c026d3"
                    }
                    opacity={selectedDistrict && !isSelected ? 0.4 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
