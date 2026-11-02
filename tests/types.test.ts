import { describe, it, expect } from "bun:test";
import type { LomrakRecord, LomrakApiResponse, MetricType } from "../src/types/lomrak";

describe("Lomrak Types", () => {
  it("validates a correctly shaped LomrakRecord", () => {
    const sample: LomrakRecord = {
      year: 2566,
      district: "เมืองศรีสะเกษ",
      communityCount: 25,
      patientCount: 140,
    };
    expect(sample.year).toBe(2566);
    expect(sample.district).toBe("เมืองศรีสะเกษ");
    expect(sample.communityCount).toBe(25);
    expect(sample.patientCount).toBe(140);
  });

  it("validates LomrakApiResponse format", () => {
    const response: LomrakApiResponse = {
      status: "success",
      source: "fallback_cache",
      updatedAt: "2026-11-02T09:00:00Z",
      totalRecords: 1,
      data: [
        {
          year: 2566,
          district: "ขุขันธ์",
          communityCount: 18,
          patientCount: 95,
        },
      ],
    };
    expect(response.status).toBe("success");
    expect(response.data.length).toBe(1);
  });
});
