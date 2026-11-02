import type { LomrakRecord, KpiMetrics, SortConfig, DistrictSummary } from "../types/lomrak";

export function filterRecordsByYear(
  records: LomrakRecord[],
  year: number | "all"
): LomrakRecord[] {
  if (year === "all") return records;
  return records.filter((r) => r.year === year);
}

export function aggregateByDistrict(
  records: LomrakRecord[],
  year: number | "all" = "all"
): DistrictSummary[] {
  const filtered = filterRecordsByYear(records, year);
  const districtMap = new Map<string, { totalCommunities: number; totalPatients: number }>();

  for (const record of filtered) {
    const current = districtMap.get(record.district) || { totalCommunities: 0, totalPatients: 0 };
    districtMap.set(record.district, {
      totalCommunities: current.totalCommunities + record.communityCount,
      totalPatients: current.totalPatients + record.patientCount,
    });
  }

  const result: DistrictSummary[] = [];
  for (const [district, stats] of districtMap.entries()) {
    result.push({
      district,
      totalCommunities: stats.totalCommunities,
      totalPatients: stats.totalPatients,
      avgRatio: stats.totalCommunities > 0 ? Number((stats.totalPatients / stats.totalCommunities).toFixed(1)) : 0,
    });
  }

  return result.sort((a, b) => b.totalPatients - a.totalPatients);
}

export function aggregateByYear(
  records: LomrakRecord[]
): { year: number; totalPatients: number; totalCommunities: number }[] {
  const yearMap = new Map<number, { totalPatients: number; totalCommunities: number }>();

  for (const r of records) {
    const current = yearMap.get(r.year) || { totalPatients: 0, totalCommunities: 0 };
    yearMap.set(r.year, {
      totalPatients: current.totalPatients + r.patientCount,
      totalCommunities: current.totalCommunities + r.communityCount,
    });
  }

  return Array.from(yearMap.entries())
    .map(([year, stats]) => ({
      year,
      totalPatients: stats.totalPatients,
      totalCommunities: stats.totalCommunities,
    }))
    .sort((a, b) => a.year - b.year);
}

export function calculateKpiStats(
  records: LomrakRecord[],
  selectedYear: number | "all"
): KpiMetrics {
  const currentRecords = filterRecordsByYear(records, selectedYear);
  const totalPatients = currentRecords.reduce((sum, r) => sum + r.patientCount, 0);
  const totalCommunities = currentRecords.reduce((sum, r) => sum + r.communityCount, 0);

  const districtSummaries = aggregateByDistrict(records, selectedYear);
  const topDistrictSummary = districtSummaries[0] || { district: "ไม่มีข้อมูล", totalPatients: 0 };

  const topDistrictPercentage =
    totalPatients > 0
      ? Number(((topDistrictSummary.totalPatients / totalPatients) * 100).toFixed(1))
      : 0;

  const avgPatientsPerCommunity =
    totalCommunities > 0
      ? Number((totalPatients / totalCommunities).toFixed(1))
      : 0;

  let yearOverYearGrowth: number | null = null;
  if (typeof selectedYear === "number") {
    const prevYear = selectedYear - 1;
    const prevYearRecords = records.filter((r) => r.year === prevYear);
    const prevPatients = prevYearRecords.reduce((sum, r) => sum + r.patientCount, 0);
    if (prevPatients > 0) {
      yearOverYearGrowth = Number((((totalPatients - prevPatients) / prevPatients) * 100).toFixed(1));
    }
  }

  return {
    totalPatients,
    totalCommunities,
    topDistrict: {
      name: topDistrictSummary.district,
      patients: topDistrictSummary.totalPatients,
      percentage: topDistrictPercentage,
    },
    avgPatientsPerCommunity,
    yearOverYearGrowth,
  };
}

export function filterAndSortRecords(
  records: LomrakRecord[],
  searchQuery: string,
  selectedYear: number | "all",
  sort: SortConfig
): LomrakRecord[] {
  let result = filterRecordsByYear(records, selectedYear);

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter((r) => r.district.toLowerCase().includes(q));
  }

  return [...result].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    if (sort.key === "ratio") {
      aVal = a.communityCount > 0 ? a.patientCount / a.communityCount : 0;
      bVal = b.communityCount > 0 ? b.patientCount / b.communityCount : 0;
    } else {
      aVal = a[sort.key];
      bVal = b[sort.key];
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sort.direction === "asc"
        ? aVal.localeCompare(bVal, "th")
        : bVal.localeCompare(aVal, "th");
    }

    return sort.direction === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });
}

export function generateCsvContent(records: LomrakRecord[]): string {
  const header = "ปี,อำเภอ,หมู่บ้าน/ชุมชน,ผู้ป่วยเข้ารับบำบัด,อัตราส่วนเฉลี่ย(คน/ชุมชน)\n";
  const rows = records.map((r) => {
    const ratio = r.communityCount > 0 ? (r.patientCount / r.communityCount).toFixed(1) : "0";
    return `${r.year},"${r.district}",${r.communityCount},${r.patientCount},${ratio}`;
  });

  // Prepend UTF-8 Byte Order Mark (BOM) so Excel opens Thai characters without garbled text
  return "\uFEFF" + header + rows.join("\n");
}
