"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { SisaketMap } from "@/components/dashboard/SisaketMap";
import { DistrictBarChart } from "@/components/dashboard/DistrictBarChart";
import { YearlyTrendChart } from "@/components/dashboard/YearlyTrendChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { GasSetupModal } from "@/components/dashboard/GasSetupModal";
import {
  aggregateByDistrict,
  aggregateByYear,
  calculateKpiStats,
  filterAndSortRecords,
  generateCsvContent,
} from "@/lib/data-utils";
import type {
  LomrakApiResponse,
  LomrakRecord,
  MetricType,
  SortConfig,
} from "@/types/lomrak";

export default function DashboardPage() {
  const [dataResponse, setDataResponse] = useState<LomrakApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);

  // Filters & State
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [metric, setMetric] = useState<MetricType>("patients");
  const [sort, setSort] = useState<SortConfig>({
    key: "patientCount",
    direction: "desc",
  });

  const fetchData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      const url = forceRefresh ? "/api/lomrak?refresh=true" : "/api/lomrak";
      const res = await fetch(url);
      const json: LomrakApiResponse = await res.json();
      setDataResponse(json);
    } catch (err) {
      console.error("Failed to load Lomrak data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rawRecords = useMemo(() => dataResponse?.data || [], [dataResponse]);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(rawRecords.map((r) => r.year)));
    return years.sort((a, b) => a - b);
  }, [rawRecords]);

  // Aggregations
  const districtSummaries = useMemo(() => {
    return aggregateByDistrict(rawRecords, selectedYear);
  }, [rawRecords, selectedYear]);

  const yearlyTrends = useMemo(() => {
    return aggregateByYear(rawRecords);
  }, [rawRecords]);

  const kpis = useMemo(() => {
    return calculateKpiStats(rawRecords, selectedYear);
  }, [rawRecords, selectedYear]);

  // Filtered & Sorted for Table
  const filteredRecords = useMemo(() => {
    let list = filterAndSortRecords(rawRecords, searchQuery, selectedYear, sort);
    if (selectedDistrict) {
      list = list.filter((r) => r.district === selectedDistrict);
    }
    return list;
  }, [rawRecords, searchQuery, selectedYear, sort, selectedDistrict]);

  const handleSortChange = (key: keyof LomrakRecord | "ratio") => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleExportCsv = () => {
    const csv = generateCsvContent(filteredRecords);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lomrak-sisaket-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict((prev) => (prev === district ? null : district));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 animate-pulse font-medium">
          กำลังโหลดข้อมูลโครงการหมู่บ้านชุมชนล้อมรักษ์...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        source={dataResponse?.source || "fallback_cache"}
        updatedAt={dataResponse?.updatedAt || new Date().toISOString()}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchData(true)}
        onExportCsv={handleExportCsv}
        onOpenGasSetup={() => setIsGasModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        <FilterBar
          years={availableYears}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          metric={metric}
          onMetricChange={setMetric}
          selectedDistrict={selectedDistrict}
          onClearDistrict={() => setSelectedDistrict(null)}
        />

        <KpiCards metrics={kpis} selectedYear={selectedYear} />

        {/* Map & District Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SisaketMap
            districtData={districtSummaries}
            metric={metric}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={handleDistrictSelect}
          />
          <DistrictBarChart
            data={districtSummaries}
            metric={metric}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={handleDistrictSelect}
          />
        </div>

        {/* Yearly Trend Chart */}
        <YearlyTrendChart data={yearlyTrends} />

        {/* Data Table */}
        <DataTable
          records={filteredRecords}
          sort={sort}
          onSortChange={handleSortChange}
          onExportCsv={handleExportCsv}
        />
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <p>
          ระบบสารสนเทศโครงการหมู่บ้านชุมชนล้อมรักษ์ จังหวัดศรีสะเกษ • พัฒนาด้วย Next.js 16, React 19 & Tailwind CSS v4
        </p>
      </footer>

      <GasSetupModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
      />
    </div>
  );
}
