import { describe, it, expect } from "bun:test";
import {
  aggregateByDistrict,
  aggregateByYear,
  calculateKpiStats,
  filterAndSortRecords,
  generateCsvContent,
} from "../src/lib/data-utils";
import type { LomrakRecord } from "../src/types/lomrak";

const mockRecords: LomrakRecord[] = [
  { year: 2565, district: "เมืองศรีสะเกษ", communityCount: 10, patientCount: 50 },
  { year: 2566, district: "เมืองศรีสะเกษ", communityCount: 12, patientCount: 60 },
  { year: 2565, district: "ขุขันธ์", communityCount: 8, patientCount: 40 },
  { year: 2566, district: "ขุขันธ์", communityCount: 10, patientCount: 50 },
];

describe("Data Utilities", () => {
  it("aggregates data by district correctly for all years", () => {
    const result = aggregateByDistrict(mockRecords, "all");
    expect(result.length).toBe(2);
    const mueang = result.find((r) => r.district === "เมืองศรีสะเกษ");
    expect(mueang?.totalPatients).toBe(110);
    expect(mueang?.totalCommunities).toBe(22);
  });

  it("calculates accurate KPI metrics", () => {
    const kpis = calculateKpiStats(mockRecords, 2566);
    expect(kpis.totalPatients).toBe(110);
    expect(kpis.totalCommunities).toBe(22);
    expect(kpis.topDistrict.name).toBe("เมืองศรีสะเกษ");
    expect(kpis.topDistrict.patients).toBe(60);
    expect(kpis.yearOverYearGrowth).not.toBeNull();
  });

  it("filters by search query and sorts correctly", () => {
    const filtered = filterAndSortRecords(mockRecords, "ขุขันธ์", "all", {
      key: "patientCount",
      direction: "desc",
    });
    expect(filtered.length).toBe(2);
    expect(filtered[0].patientCount).toBe(50);
  });

  it("generates CSV string with UTF-8 BOM", () => {
    const csv = generateCsvContent(mockRecords);
    expect(csv.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM
    expect(csv).toContain("ปี,อำเภอ,หมู่บ้าน/ชุมชน,ผู้ป่วยเข้ารับบำบัด");
    expect(csv).toContain("เมืองศรีสะเกษ");
  });
});
