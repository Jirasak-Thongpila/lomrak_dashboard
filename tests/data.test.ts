import { describe, it, expect } from "bun:test";
import { SISAKET_DISTRICTS } from "../src/data/sisaket-districts";
import fallbackData from "../src/data/fallback-lomrak.json";

describe("Sisaket Districts & Fallback Data", () => {
  it("contains all 22 official districts of Sisaket province", () => {
    expect(SISAKET_DISTRICTS.length).toBe(22);
    const names = SISAKET_DISTRICTS.map((d) => d.name);
    expect(names).toContain("เมืองศรีสะเกษ");
    expect(names).toContain("กันทรลักษ์");
    expect(names).toContain("ขุขันธ์");
    expect(names).toContain("อุทุมพรพิสัย");
    expect(names).toContain("ราษีไศล");
  });

  it("has valid records for all 22 districts across years 2565, 2566, and 2567", () => {
    expect(fallbackData.length).toBe(66); // 22 districts * 3 years
    for (const record of fallbackData) {
      expect([2565, 2566, 2567]).toContain(record.year);
      expect(record.district.length).toBeGreaterThan(0);
      expect(record.communityCount).toBeGreaterThanOrEqual(1);
      expect(record.patientCount).toBeGreaterThanOrEqual(1);
    }
  });
});
