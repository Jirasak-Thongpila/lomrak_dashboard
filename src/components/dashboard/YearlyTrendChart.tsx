"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface YearlyTrendChartProps {
  data: { year: number; totalPatients: number; totalCommunities: number }[];
}

export function YearlyTrendChart({ data }: YearlyTrendChartProps) {
  return (
    <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-base">แนวโน้มการดำเนินงานรายปี พ.ศ.</h3>
        <p className="text-xs text-slate-500">เปรียบเทียบการเติบโตของผู้ป่วยบำบัดและจำนวนชุมชน</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="patientsColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="communitiesColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-pink-200 p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-semibold text-pink-700">ประจำปี พ.ศ. {label}</p>
                      <p className="text-pink-600">
                        ผู้ป่วยบำบัด: <strong>{payload[0]?.value} ราย</strong>
                      </p>
                      <p className="text-fuchsia-500">
                        ชุมชนล้อมรักษ์: <strong>{payload[1]?.value} แห่ง</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value) => (value === "totalPatients" ? "ผู้ป่วยบำบัด (ราย)" : "ชุมชนล้อมรักษ์ (แห่ง)")}
            />
            <Area
              type="monotone"
              dataKey="totalPatients"
              stroke="#ec4899"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#patientsColor)"
            />
            <Area
              type="monotone"
              dataKey="totalCommunities"
              stroke="#d946ef"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#communitiesColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
