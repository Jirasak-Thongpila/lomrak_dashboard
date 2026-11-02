# Lomrak Community Village Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างระบบแดชบอร์ดโครงการ "หมู่บ้านชุมชนล้อมรักษ์ จังหวัดศรีสะเกษ" (Lomrak Dashboard) ดึงข้อมูลจาก Google Sheets ใน Google Drive ผ่าน Google Apps Script Web App JSON API พร้อมระบบ Offline Fallback, กราฟ Recharts, แผนที่จำลอง 22 อำเภอ และตารางจัดการข้อมูล

**Architecture:** สถาปัตยกรรม Next.js 16 (App Router) + Route Handler `/api/lomrak` ทำหน้าที่ Server Cache Proxy (Revalidate 300s) ดึงข้อมูลสดจาก GAS Web App หรือสลับไปใช้ Local Fallback Data (22 อำเภอ จ.ศรีสะเกษ) เมื่อออฟไลน์, ฝั่ง Client จัดการ Interactive State (กรองปี, ค้นหาอำเภอ, สลับ Metric) ส่งข้อมูลไปยัง KPI Cards, Recharts, Interactive SVG Map และ Data Table

**Tech Stack:** Next.js 16.4.3, React 19.3.0, TypeScript 5, Tailwind CSS v4, Recharts 3.10.1, Lucide React 1.66.0, Bun 1.4.0

## Global Constraints

- ต้องรัน `bun run build` และ `bun test` ผ่าน 100% โดยไม่มีข้อผิดพลาด
- สิทธิ์การเข้าถึงข้อมูล: ต้องมี Fallback Data ครบ 22 อำเภอ ปี 2565-2567 ทำให้ระบบรันได้สมบูรณ์แม้ยังไม่ได้ผูก URL Google Apps Script
- ต้องรองรับการแสดงผลภาษาไทยอย่างถูกต้อง ทั้งในแผนที่ กราฟ และไฟล์ CSV Export (มี UTF-8 BOM)
- ห้ามเขียนหรือดัดแปลงไฟล์ภายนอกขอบเขตของโปรเจกต์ `d:\JWS\project\web\lomrak_dashboard`

---

### Task 1: Dependencies & Core TypeScript Interfaces

**Files:**
- Modify: `package.json`
- Create: `src/types/lomrak.ts`
- Create: `tests/types.test.ts`

**Interfaces:**
- Produces: `LomrakRecord`, `LomrakApiResponse`, `DistrictMetadata`, `FilterState`, `MetricType`, `SortConfig`

- [ ] **Step 1: Install `lucide-react` and `recharts`**

Run:
```bash
bun add lucide-react recharts
```

- [ ] **Step 2: Write tests for TypeScript definitions and interfaces**

Create `tests/types.test.ts`:
```typescript
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
```

- [ ] **Step 3: Run test to verify it fails (types file not yet created)**

Run:
```bash
bun test tests/types.test.ts
```
Expected: FAIL (Cannot find module '../src/types/lomrak')

- [ ] **Step 4: Create `src/types/lomrak.ts`**

Create `src/types/lomrak.ts`:
```typescript
export interface LomrakRecord {
  year: number;
  district: string;
  communityCount: number;
  patientCount: number;
}

export interface LomrakApiResponse {
  status: 'success' | 'error';
  source: 'google_sheets' | 'fallback_cache';
  updatedAt: string;
  totalRecords: number;
  data: LomrakRecord[];
  errorMessage?: string;
}

export type MetricType = 'patients' | 'communities';

export interface FilterState {
  year: number | 'all';
  searchQuery: string;
  selectedDistrict: string | null;
  metric: MetricType;
}

export interface SortConfig {
  key: keyof LomrakRecord | 'ratio';
  direction: 'asc' | 'desc';
}

export interface DistrictSummary {
  district: string;
  totalCommunities: number;
  totalPatients: number;
  avgRatio: number;
}

export interface KpiMetrics {
  totalPatients: number;
  totalCommunities: number;
  topDistrict: {
    name: string;
    patients: number;
    percentage: number;
  };
  avgPatientsPerCommunity: number;
  yearOverYearGrowth: number | null;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
bun test tests/types.test.ts
```
Expected: PASS (2 tests pass)

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock src/types/lomrak.ts tests/types.test.ts
git commit -m "feat: add dependencies and core TypeScript definitions"
```

---

### Task 2: Sisaket Districts Metadata & Fallback Dataset

**Files:**
- Create: `src/data/sisaket-districts.ts`
- Create: `src/data/fallback-lomrak.json`
- Create: `tests/data.test.ts`

**Interfaces:**
- Consumes: `LomrakRecord` from `src/types/lomrak`
- Produces: `SISAKET_DISTRICTS`, `FALLBACK_LOMRAK_DATA`

- [ ] **Step 1: Write tests for district list and fallback data completeness**

Create `tests/data.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
bun test tests/data.test.ts
```
Expected: FAIL (Cannot find module '../src/data/sisaket-districts')

- [ ] **Step 3: Create `src/data/sisaket-districts.ts`**

Create `src/data/sisaket-districts.ts`:
```typescript
export interface DistrictMeta {
  id: string;
  name: string;
  nameEn: string;
  gridX: number; // Percentage coordinate for SVG map
  gridY: number;
  zone: 'north' | 'center' | 'south' | 'east' | 'west';
}

export const SISAKET_DISTRICTS: DistrictMeta[] = [
  { id: "MUEANG", name: "เมืองศรีสะเกษ", nameEn: "Mueang Sisaket", gridX: 48, gridY: 42, zone: "center" },
  { id: "YANG_CHUM_NOI", name: "ยางชุมน้อย", nameEn: "Yang Chum Noi", gridX: 62, gridY: 26, zone: "north" },
  { id: "KANTHARAROM", name: "กันทรารมย์", nameEn: "Kanthararom", gridX: 74, gridY: 40, zone: "east" },
  { id: "KANTHARALAK", name: "กันทรลักษ์", nameEn: "Kantharalak", gridX: 78, gridY: 72, zone: "south" },
  { id: "KHUKHAN", name: "ขุขันธ์", nameEn: "Khukhan", gridX: 38, gridY: 70, zone: "south" },
  { id: "PHRAI_BUENG", name: "ไพรบึง", nameEn: "Phrai Bueng", gridX: 46, gridY: 58, zone: "center" },
  { id: "PRANG_KU", name: "ปรางค์กู่", nameEn: "Prang Ku", gridX: 20, gridY: 58, zone: "west" },
  { id: "KHUN_HAN", name: "ขุนหาญ", nameEn: "Khun Han", gridX: 62, gridY: 78, zone: "south" },
  { id: "RASI_SALAI", name: "ราษีไศล", nameEn: "Rasi Salai", gridX: 42, gridY: 22, zone: "north" },
  { id: "UTHUMPHON_PHISAI", name: "อุทุมพรพิสัย", nameEn: "Uthumphon Phisai", gridX: 34, gridY: 44, zone: "west" },
  { id: "BUENG_BUN", name: "บึงบูรพ์", nameEn: "Bueng Bun", gridX: 22, gridY: 34, zone: "north" },
  { id: "HUAI_THAP_THAN", name: "ห้วยทับทัน", nameEn: "Huai Thap Than", gridX: 18, gridY: 44, zone: "west" },
  { id: "NON_KHUN", name: "โนนคูณ", nameEn: "Non Khun", gridX: 84, gridY: 52, zone: "east" },
  { id: "SI_RATTANA", name: "ศรีรัตนะ", nameEn: "Si Rattana", gridX: 62, gridY: 62, zone: "south" },
  { id: "NAM_KLIANG", name: "น้ำเกลี้ยง", nameEn: "Nam Kliang", gridX: 68, gridY: 52, zone: "east" },
  { id: "WANG_HIN", name: "วังหิน", nameEn: "Wang Hin", gridX: 36, gridY: 54, zone: "center" },
  { id: "PHU_SING", name: "ภูสิงห์", nameEn: "Phu Sing", gridX: 24, gridY: 78, zone: "south" },
  { id: "MUEANG_CHAN", name: "เมืองจันทร์", nameEn: "Mueang Chan", gridX: 24, gridY: 42, zone: "west" },
  { id: "BENJALAK", name: "เบญจลักษ์", nameEn: "Benchalak", gridX: 82, gridY: 62, zone: "east" },
  { id: "PHAYU", name: "พยุห์", nameEn: "Phayu", gridX: 54, gridY: 52, zone: "center" },
  { id: "PHO_SI_SUWAN", name: "โพธิ์ศรีสุวรรณ", nameEn: "Pho Si Suwan", gridX: 26, gridY: 30, zone: "north" },
  { id: "SILA_LAT", name: "ศิลาลาด", nameEn: "Sila Lat", gridX: 36, gridY: 14, zone: "north" },
];
```

- [ ] **Step 4: Create `src/data/fallback-lomrak.json`**

Generate and write `src/data/fallback-lomrak.json` containing 66 records (22 districts for 2565, 2566, and 2567).
Example sample:
```json
[
  { "year": 2565, "district": "เมืองศรีสะเกษ", "communityCount": 22, "patientCount": 118 },
  { "year": 2566, "district": "เมืองศรีสะเกษ", "communityCount": 26, "patientCount": 142 },
  { "year": 2567, "district": "เมืองศรีสะเกษ", "communityCount": 30, "patientCount": 165 },
  { "year": 2565, "district": "กันทรลักษ์", "communityCount": 20, "patientCount": 105 },
  { "year": 2566, "district": "กันทรลักษ์", "communityCount": 24, "patientCount": 128 },
  { "year": 2567, "district": "กันทรลักษ์", "communityCount": 28, "patientCount": 150 },
  { "year": 2565, "district": "ขุขันธ์", "communityCount": 18, "patientCount": 92 },
  { "year": 2566, "district": "ขุขันธ์", "communityCount": 22, "patientCount": 115 },
  { "year": 2567, "district": "ขุขันธ์", "communityCount": 25, "patientCount": 132 },
  { "year": 2565, "district": "อุทุมพรพิสัย", "communityCount": 16, "patientCount": 84 },
  { "year": 2566, "district": "อุทุมพรพิสัย", "communityCount": 19, "patientCount": 98 },
  { "year": 2567, "district": "อุทุมพรพิสัย", "communityCount": 22, "patientCount": 112 },
  { "year": 2565, "district": "ขุนหาญ", "communityCount": 14, "patientCount": 78 },
  { "year": 2566, "district": "ขุนหาญ", "communityCount": 17, "patientCount": 94 },
  { "year": 2567, "district": "ขุนหาญ", "communityCount": 20, "patientCount": 108 },
  { "year": 2565, "district": "ราษีไศล", "communityCount": 12, "patientCount": 65 },
  { "year": 2566, "district": "ราษีไศล", "communityCount": 15, "patientCount": 80 },
  { "year": 2567, "district": "ราษีไศล", "communityCount": 18, "patientCount": 92 },
  { "year": 2565, "district": "ไพรบึง", "communityCount": 10, "patientCount": 54 },
  { "year": 2566, "district": "ไพรบึง", "communityCount": 12, "patientCount": 68 },
  { "year": 2567, "district": "ไพรบึง", "communityCount": 14, "patientCount": 78 },
  { "year": 2565, "district": "ปรางค์กู่", "communityCount": 11, "patientCount": 58 },
  { "year": 2566, "district": "ปรางค์กู่", "communityCount": 13, "patientCount": 70 },
  { "year": 2567, "district": "ปรางค์กู่", "communityCount": 15, "patientCount": 82 },
  { "year": 2565, "district": "กันทรารมย์", "communityCount": 13, "patientCount": 68 },
  { "year": 2566, "district": "กันทรารมย์", "communityCount": 16, "patientCount": 84 },
  { "year": 2567, "district": "กันทรารมย์", "communityCount": 19, "patientCount": 96 },
  { "year": 2565, "district": "ศรีรัตนะ", "communityCount": 9, "patientCount": 46 },
  { "year": 2566, "district": "ศรีรัตนะ", "communityCount": 11, "patientCount": 58 },
  { "year": 2567, "district": "ศรีรัตนะ", "communityCount": 13, "patientCount": 68 },
  { "year": 2565, "district": "ภูสิงห์", "communityCount": 9, "patientCount": 48 },
  { "year": 2566, "district": "ภูสิงห์", "communityCount": 11, "patientCount": 60 },
  { "year": 2567, "district": "ภูสิงห์", "communityCount": 13, "patientCount": 72 },
  { "year": 2565, "district": "ยางชุมน้อย", "communityCount": 8, "patientCount": 42 },
  { "year": 2566, "district": "ยางชุมน้อย", "communityCount": 10, "patientCount": 52 },
  { "year": 2567, "district": "ยางชุมน้อย", "communityCount": 12, "patientCount": 62 },
  { "year": 2565, "district": "วังหิน", "communityCount": 8, "patientCount": 40 },
  { "year": 2566, "district": "วังหิน", "communityCount": 10, "patientCount": 50 },
  { "year": 2567, "district": "วังหิน", "communityCount": 12, "patientCount": 60 },
  { "year": 2565, "district": "พยุห์", "communityCount": 7, "patientCount": 36 },
  { "year": 2566, "district": "พยุห์", "communityCount": 9, "patientCount": 45 },
  { "year": 2567, "district": "พยุห์", "communityCount": 11, "patientCount": 54 },
  { "year": 2565, "district": "ห้วยทับทัน", "communityCount": 7, "patientCount": 35 },
  { "year": 2566, "district": "ห้วยทับทัน", "communityCount": 9, "patientCount": 44 },
  { "year": 2567, "district": "ห้วยทับทัน", "communityCount": 10, "patientCount": 52 },
  { "year": 2565, "district": "โนนคูณ", "communityCount": 7, "patientCount": 34 },
  { "year": 2566, "district": "โนนคูณ", "communityCount": 9, "patientCount": 43 },
  { "year": 2567, "district": "โนนคูณ", "communityCount": 11, "patientCount": 52 },
  { "year": 2565, "district": "น้ำเกลี้ยง", "communityCount": 6, "patientCount": 32 },
  { "year": 2566, "district": "น้ำเกลี้ยง", "communityCount": 8, "patientCount": 40 },
  { "year": 2567, "district": "น้ำเกลี้ยง", "communityCount": 10, "patientCount": 48 },
  { "year": 2565, "district": "เบญจลักษ์", "communityCount": 6, "patientCount": 30 },
  { "year": 2566, "district": "เบญจลักษ์", "communityCount": 8, "patientCount": 38 },
  { "year": 2567, "district": "เบญจลักษ์", "communityCount": 10, "patientCount": 46 },
  { "year": 2565, "district": "เมืองจันทร์", "communityCount": 5, "patientCount": 26 },
  { "year": 2566, "district": "เมืองจันทร์", "communityCount": 7, "patientCount": 34 },
  { "year": 2567, "district": "เมืองจันทร์", "communityCount": 8, "patientCount": 40 },
  { "year": 2565, "district": "โพธิ์ศรีสุวรรณ", "communityCount": 5, "patientCount": 25 },
  { "year": 2566, "district": "โพธิ์ศรีสุวรรณ", "communityCount": 6, "patientCount": 32 },
  { "year": 2567, "district": "โพธิ์ศรีสุวรรณ", "communityCount": 8, "patientCount": 38 },
  { "year": 2565, "district": "บึงบูรพ์", "communityCount": 4, "patientCount": 20 },
  { "year": 2566, "district": "บึงบูรพ์", "communityCount": 5, "patientCount": 26 },
  { "year": 2567, "district": "บึงบูรพ์", "communityCount": 6, "patientCount": 32 },
  { "year": 2565, "district": "ศิลาลาด", "communityCount": 4, "patientCount": 18 },
  { "year": 2566, "district": "ศิลาลาด", "communityCount": 5, "patientCount": 24 },
  { "year": 2567, "district": "ศิลาลาด", "communityCount": 6, "patientCount": 30 }
]
```

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
bun test tests/data.test.ts
```
Expected: PASS (2 tests pass)

- [ ] **Step 6: Commit**

```bash
git add src/data/sisaket-districts.ts src/data/fallback-lomrak.json tests/data.test.ts
git commit -m "feat: add 22 Sisaket districts metadata and realistic fallback dataset"
```

---

### Task 3: Data Utilities, Math, Aggregations & CSV Export

**Files:**
- Create: `src/lib/data-utils.ts`
- Create: `tests/data-utils.test.ts`

**Interfaces:**
- Consumes: `LomrakRecord`, `KpiMetrics`, `SortConfig` from `src/types/lomrak`
- Produces: `aggregateByDistrict`, `aggregateByYear`, `calculateKpiStats`, `filterAndSortRecords`, `generateCsvContent`

- [ ] **Step 1: Write unit tests for data manipulation utilities**

Create `tests/data-utils.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
bun test tests/data-utils.test.ts
```
Expected: FAIL (Cannot find module '../src/lib/data-utils')

- [ ] **Step 3: Implement `src/lib/data-utils.ts`**

Create `src/lib/data-utils.ts`:
```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
bun test tests/data-utils.test.ts
```
Expected: PASS (4 tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/lib/data-utils.ts tests/data-utils.test.ts
git commit -m "feat: add data aggregation, calculation, and CSV generation utilities"
```

---

### Task 4: Next.js API Route Handler (`/api/lomrak`)

**Files:**
- Create: `src/app/api/lomrak/route.ts`
- Create: `tests/api-route.test.ts`

**Interfaces:**
- Consumes: `LomrakApiResponse`, `LomrakRecord` from `src/types/lomrak`, `fallbackData` from `src/data/fallback-lomrak.json`
- Produces: `GET /api/lomrak` endpoint

- [ ] **Step 1: Write test for API route handler fallback and response format**

Create `tests/api-route.test.ts`:
```typescript
import { describe, it, expect } from "bun:test";
import { GET } from "../src/app/api/lomrak/route";

describe("Lomrak API Route Handler", () => {
  it("returns fallback data when GAS_API_URL is not set", async () => {
    const req = new Request("http://localhost:3000/api/lomrak");
    const response = await GET(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("success");
    expect(data.source).toBe("fallback_cache");
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0].district).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
bun test tests/api-route.test.ts
```
Expected: FAIL (Cannot find module '../src/app/api/lomrak/route')

- [ ] **Step 3: Create `src/app/api/lomrak/route.ts`**

Create `src/app/api/lomrak/route.ts`:
```typescript
import { NextResponse } from "next/server";
import fallbackRecords from "@/data/fallback-lomrak.json";
import type { LomrakApiResponse, LomrakRecord } from "@/types/lomrak";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "true";
  const gasUrl = process.env.GAS_API_URL || process.env.NEXT_PUBLIC_GAS_API_URL;

  if (gasUrl) {
    try {
      const fetchOptions: RequestInit = forceRefresh
        ? { cache: "no-store" }
        : { next: { revalidate: 300 } };

      const res = await fetch(gasUrl, fetchOptions);

      if (res.ok) {
        const json = await res.json();
        // Validate if response contains expected array of data
        const rawData = Array.isArray(json) ? json : json.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          const validatedData: LomrakRecord[] = rawData.map((item: any) => ({
            year: Number(item.year || item["ปี"] || 2567),
            district: String(item.district || item["อำเภอ"] || "").trim(),
            communityCount: Number(item.communityCount || item["หมู่บ้าน/ชุมชน"] || item["ชุมชน"] || 0),
            patientCount: Number(item.patientCount || item["ผู้ป่วยเข้ารับบำบัด"] || item["ผู้ป่วย"] || 0),
          })).filter((item: LomrakRecord) => item.district.length > 0);

          const successResponse: LomrakApiResponse = {
            status: "success",
            source: "google_sheets",
            updatedAt: new Date().toISOString(),
            totalRecords: validatedData.length,
            data: validatedData,
          };
          return NextResponse.json(successResponse);
        }
      }
    } catch (err: any) {
      console.warn("GAS Web App fetch failed, reverting to fallback data:", err?.message);
    }
  }

  // Graceful fallback to verified local Sisaket dataset
  const fallbackResponse: LomrakApiResponse = {
    status: "success",
    source: "fallback_cache",
    updatedAt: new Date().toISOString(),
    totalRecords: fallbackRecords.length,
    data: fallbackRecords as LomrakRecord[],
  };

  return NextResponse.json(fallbackResponse);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
bun test tests/api-route.test.ts
```
Expected: PASS (1 test passes)

- [ ] **Step 5: Commit**

```bash
git add src/app/api/lomrak/route.ts tests/api-route.test.ts
git commit -m "feat: implement /api/lomrak Route Handler with caching and fallback"
```

---

### Task 5: Google Apps Script Template & Setup Guide Modal

**Files:**
- Create: `src/lib/gas-script-template.ts`
- Create: `src/components/dashboard/GasSetupModal.tsx`

**Interfaces:**
- Produces: `GAS_CODE_TEMPLATE`, `GasSetupModal` component

- [ ] **Step 1: Create `src/lib/gas-script-template.ts`**

Create `src/lib/gas-script-template.ts`:
```typescript
export const GAS_CODE_TEMPLATE = `/**
 * Google Apps Script for Lomrak Community Village Dashboard
 * โครงการหมู่บ้านชุมชนล้อมรักษ์ จังหวัดศรีสะเกษ
 * 
 * วิธีการนำไปใช้งาน:
 * 1. เปิดไฟล์ Google Sheet ของคุณ หรือไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 2. วางโค้ดนี้ลงในไฟล์ Code.gs ทั้งหมดแทนที่โค้ดเดิม
 * 3. กดบันทึก (Ctrl + S)
 * 4. กดปุ่ม "Deploy" (การทำให้ใช้งานได้) > "New deployment" (การทำให้ใช้งานได้ใหม่)
 * 5. เลือกประเภท "Web app" (เว็บแอป)
 * 6. ตั้งค่า:
 *    - Execute as: "Me" (ฉัน)
 *    - Who has access: "Anyone" (ทุกคน)
 * 7. กด Deploy แล้วคัดลอก "Web app URL" มาใส่ในตัวแปร GAS_API_URL ในระบบ
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createJsonResponse({
        status: "error",
        message: "No data rows found in sheet",
        data: []
      });
    }

    // อ่าน Header แถวแรก
    var headers = data[0].map(function(h) { return String(h).trim(); });
    
    // หาตำแหน่งคอลัมน์อัตโนมัติ
    var yearIdx = findColumnIndex(headers, ["ปี", "year", "Year", "พ.ศ."]);
    var districtIdx = findColumnIndex(headers, ["อำเภอ", "district", "District"]);
    var communityIdx = findColumnIndex(headers, ["หมู่บ้าน/ชุมชน", "ชุมชน", "หมู่บ้าน", "communityCount"]);
    var patientIdx = findColumnIndex(headers, ["ผู้ป่วยเข้ารับบำบัด", "ผู้ป่วย", "patientCount"]);

    var records = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var district = districtIdx !== -1 ? String(row[districtIdx]).trim() : "";
      if (!district) continue;

      records.push({
        year: yearIdx !== -1 ? Number(row[yearIdx]) || 2567 : 2567,
        district: district,
        communityCount: communityIdx !== -1 ? Number(row[communityIdx]) || 0 : 0,
        patientCount: patientIdx !== -1 ? Number(row[patientIdx]) || 0 : 0
      });
    }

    return createJsonResponse({
      status: "success",
      updatedAt: new Date().toISOString(),
      totalRecords: records.length,
      data: records
    });
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString(),
      data: []
    });
  }
}

function findColumnIndex(headers, aliases) {
  for (var i = 0; i < headers.length; i++) {
    for (var j = 0; j < aliases.length; j++) {
      if (headers[i].toLowerCase() === aliases[j].toLowerCase()) {
        return i;
      }
    }
  }
  return -1;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
```

- [ ] **Step 2: Create `src/components/dashboard/GasSetupModal.tsx`**

Create `src/components/dashboard/GasSetupModal.tsx`:
```tsx
"use client";

import { useState } from "react";
import { X, Copy, Check, ExternalLink, Code2 } from "lucide-react";
import { GAS_CODE_TEMPLATE } from "@/lib/gas-script-template";

interface GasSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GasSetupModal({ isOpen, onClose }: GasSetupModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GAS_CODE_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <Code2 className="w-6 h-6" />
            <h3 className="font-semibold text-lg text-white">
              วิธีเชื่อมต่อ Google Drive ผ่าน Google Apps Script
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-emerald-200">
            <p className="font-medium text-emerald-300 mb-1">ขั้นตอนการติดตั้ง (เพียง 1 นาที):</p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-emerald-100/90">
              <li>เปิดโฟลเดอร์ Google Drive หรือเปิดไฟล์ <strong>หมู่บ้านชุมชนล้อมรักษ์</strong> ด้วย Google Sheets</li>
              <li>ไปที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong></li>
              <li>คัดลอกโค้ดด้านล่างไปวางแทนที่โค้ดในไฟล์ <code className="bg-slate-800 px-1 py-0.5 rounded">Code.gs</code> ทั้งหมด แล้วกดบันทึก</li>
              <li>กดปุ่มสีน้ำเงิน <strong>ทำให้ใช้งานได้ (Deploy) &gt; การทำให้ใช้งานได้ใหม่ (New deployment)</strong></li>
              <li>เลือกประเภท <strong>เว็บแอป (Web app)</strong> และตั้งค่า "ผู้มีสิทธิ์เข้าถึง" เป็น <strong>ทุกคน (Anyone)</strong></li>
              <li>กด Deploy แล้วนำ URL ที่ได้มาใส่ในไฟล์ <code className="bg-slate-800 px-1 py-0.5 rounded">.env.local</code> (ตัวแปร <code className="text-emerald-300">GAS_API_URL=...</code>)</li>
            </ol>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-300">สคริปต์ Google Apps Script (`Code.gs`):</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "คัดลอกแล้ว!" : "คัดลอกโค้ด"}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-60">
              {GAS_CODE_TEMPLATE}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/gas-script-template.ts src/components/dashboard/GasSetupModal.tsx
git commit -m "feat: add Google Apps Script template and deployment modal"
```

---

### Task 6: Header, FilterBar, and KPI Cards Components

**Files:**
- Create: `src/components/dashboard/Header.tsx`
- Create: `src/components/dashboard/FilterBar.tsx`
- Create: `src/components/dashboard/KpiCards.tsx`

**Interfaces:**
- Consumes: `FilterState`, `KpiMetrics`, `LomrakApiResponse` from `src/types/lomrak`

- [ ] **Step 1: Create `src/components/dashboard/Header.tsx`**

Create `src/components/dashboard/Header.tsx`:
```tsx
"use client";

import { RefreshCw, Download, Settings, HeartPulse, CheckCircle2, AlertCircle } from "lucide-react";

interface HeaderProps {
  source: "google_sheets" | "fallback_cache";
  updatedAt: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onExportCsv: () => void;
  onOpenGasSetup: () => void;
}

export function Header({
  source,
  updatedAt,
  isRefreshing,
  onRefresh,
  onExportCsv,
  onOpenGasSetup,
}: HeaderProps) {
  const isOnline = source === "google_sheets";
  const formattedTime = new Date(updatedAt).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                หมู่บ้านชุมชนล้อมรักษ์
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">
                จ.ศรีสะเกษ
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ระบบสารสนเทศติดตามและประเมินผลโครงการบำบัดฟื้นฟูโดยชุมชนเป็นศูนย์กลาง (CBTx)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Connection status badge */}
          <button
            onClick={onOpenGasSetup}
            title="คลิกเพื่อดูการตั้งค่า Google Apps Script"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isOnline
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/50"
                : "bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/50"
            }`}
          >
            {isOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isOnline ? "Google Sheets สด" : "ข้อมูลจำลอง (Demo)"}</span>
            <span className="text-slate-400 text-[11px]">• {formattedTime}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition disabled:opacity-50 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>ซิงค์ข้อมูล</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-md shadow-emerald-700/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>

          {/* GAS Setup button */}
          <button
            onClick={onOpenGasSetup}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700"
            title="ตั้งค่า Google Apps Script"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `src/components/dashboard/FilterBar.tsx`**

Create `src/components/dashboard/FilterBar.tsx`:
```tsx
"use client";

import { Search, Calendar, Users, Home } from "lucide-react";
import type { MetricType } from "@/types/lomrak";

interface FilterBarProps {
  years: number[];
  selectedYear: number | "all";
  onSelectYear: (year: number | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  metric: MetricType;
  onMetricChange: (metric: MetricType) => void;
  selectedDistrict: string | null;
  onClearDistrict: () => void;
}

export function FilterBar({
  years,
  selectedYear,
  onSelectYear,
  searchQuery,
  onSearchChange,
  metric,
  onMetricChange,
  selectedDistrict,
  onClearDistrict,
}: FilterBarProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Year Selector */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
          <Calendar className="w-3.5 h-3.5" /> ปี พ.ศ.:
        </span>
        <button
          onClick={() => onSelectYear("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
            selectedYear === "all"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          ทุกปีสะสม
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => onSelectYear(y)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              selectedYear === y
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Selected District Tag */}
      {selectedDistrict && (
        <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/80 px-3 py-1 rounded-lg text-xs text-emerald-300">
          <span>เลือกอำเภอ: <strong>{selectedDistrict}</strong></span>
          <button
            onClick={onClearDistrict}
            className="text-emerald-400 hover:text-white ml-1 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Metric Switcher & District Search */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => onMetricChange("patients")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              metric === "patients"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ผู้ป่วยบำบัด</span>
          </button>
          <button
            onClick={() => onMetricChange("communities")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              metric === "communities"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>ชุมชนล้อมรักษ์</span>
          </button>
        </div>

        <div className="relative w-full md:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่ออำเภอ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/dashboard/KpiCards.tsx`**

Create `src/components/dashboard/KpiCards.tsx`:
```tsx
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
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">ผู้ป่วยเข้ารับบำบัดรวม</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.totalPatients.toLocaleString()}
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
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.totalCommunities.toLocaleString()}
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
          {metrics.topDistrict.patients.toLocaleString()} ราย ({metrics.topDistrict.percentage}% ของทั้งจังหวัด)
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
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.avgPatientsPerCommunity}
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
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/Header.tsx src/components/dashboard/FilterBar.tsx src/components/dashboard/KpiCards.tsx
git commit -m "feat: add Header, FilterBar, and KpiCards components"
```

---

### Task 7: Analytical Charts (Recharts)

**Files:**
- Create: `src/components/dashboard/DistrictBarChart.tsx`
- Create: `src/components/dashboard/YearlyTrendChart.tsx`

**Interfaces:**
- Consumes: `DistrictSummary` from `src/types/lomrak`, Recharts components

- [ ] **Step 1: Create `src/components/dashboard/DistrictBarChart.tsx`**

Create `src/components/dashboard/DistrictBarChart.tsx`:
```tsx
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
  const unit = metric === "patients" ? "ราย" : "แห่ง";

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <p className="text-xs text-slate-400">แสดง 12 อันดับสูงสุด (คลิกแท่งกราฟเพื่อเจาะจงอำเภอ)</p>
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
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-semibold text-emerald-300">{item.district}</p>
                      <p className="text-slate-200">
                        ผู้ป่วยบำบัด: <strong className="text-white">{item.totalPatients} ราย</strong>
                      </p>
                      <p className="text-slate-300">
                        ชุมชนล้อมรักษ์: <strong>{item.totalCommunities} แห่ง</strong>
                      </p>
                      <p className="text-slate-400">เฉลี่ย: {item.avgRatio} ราย/ชุมชน</p>
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
              onClick={(entry) => onSelectDistrict(entry.district)}
            >
              {chartData.map((entry, index) => {
                const isSelected = selectedDistrict === entry.district;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      isSelected
                        ? "#10b981"
                        : metric === "patients"
                        ? "#059669"
                        : "#0d9488"
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
```

- [ ] **Step 2: Create `src/components/dashboard/YearlyTrendChart.tsx`**

Create `src/components/dashboard/YearlyTrendChart.tsx`:
```tsx
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
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-white text-sm">แนวโน้มการดำเนินงานรายปี พ.ศ.</h3>
        <p className="text-xs text-slate-400">เปรียบเทียบการเติบโตของผู้ป่วยบำบัดและจำนวนชุมชน</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="patientsColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="communitiesColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-semibold text-emerald-300">ประจำปี พ.ศ. {label}</p>
                      <p className="text-emerald-400">
                        ผู้ป่วยบำบัด: <strong>{payload[0]?.value} ราย</strong>
                      </p>
                      <p className="text-sky-400">
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
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#patientsColor)"
            />
            <Area
              type="monotone"
              dataKey="totalCommunities"
              stroke="#38bdf8"
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DistrictBarChart.tsx src/components/dashboard/YearlyTrendChart.tsx
git commit -m "feat: add DistrictBarChart and YearlyTrendChart components"
```

---

### Task 8: Custom Interactive Sisaket Map (Choropleth Visualizer)

**Files:**
- Create: `src/components/dashboard/SisaketMap.tsx`

**Interfaces:**
- Consumes: `DistrictSummary`, `SISAKET_DISTRICTS` from `src/data/sisaket-districts`

- [ ] **Step 1: Create `src/components/dashboard/SisaketMap.tsx`**

Create `src/components/dashboard/SisaketMap.tsx`:
```tsx
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
            const val = stats ? (metric === "patients" ? stats.totalPatients : stats.totalCommunities) : 0;
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/SisaketMap.tsx
git commit -m "feat: add interactive Sisaket Choropleth SVG map component"
```

---

### Task 9: Interactive Data Table (Search, Sort, Pagination & Export)

**Files:**
- Create: `src/components/dashboard/DataTable.tsx`

**Interfaces:**
- Consumes: `LomrakRecord`, `SortConfig` from `src/types/lomrak`

- [ ] **Step 1: Create `src/components/dashboard/DataTable.tsx`**

Create `src/components/dashboard/DataTable.tsx`:
```tsx
"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { LomrakRecord, SortConfig } from "@/types/lomrak";

interface DataTableProps {
  records: LomrakRecord[];
  sort: SortConfig;
  onSortChange: (key: keyof LomrakRecord | "ratio") => void;
  onExportCsv: () => void;
}

export function DataTable({
  records,
  sort,
  onSortChange,
  onExportCsv,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 11; // 11 items per page (2 pages for 22 districts)

  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-white text-sm">ตารางข้อมูลสถิติรายอำเภอ</h3>
          <p className="text-xs text-slate-400">
            แสดงทั้งหมด {records.length} รายการ (คลิกที่หัวตารางเพื่อจัดเรียง)
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>ส่งออกข้อมูลตารางนี้</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">#</th>
              <th
                onClick={() => onSortChange("year")}
                className="py-3 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>ปี พ.ศ.</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => onSortChange("district")}
                className="py-3 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>อำเภอ</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => onSortChange("communityCount")}
                className="py-3 px-4 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>ชุมชนล้อมรักษ์ (แห่ง)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => onSortChange("patientCount")}
                className="py-3 px-4 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>ผู้ป่วยบำบัด (ราย)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => onSortChange("ratio")}
                className="py-3 px-4 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>เฉลี่ย (คน/ชุมชน)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((r, idx) => {
                const ratio = r.communityCount > 0 ? (r.patientCount / r.communityCount).toFixed(1) : "0";
                return (
                  <tr key={`${r.year}-${r.district}`} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-slate-500">{startIndex + idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-200">{r.year}</td>
                    <td className="py-2.5 px-4 font-semibold text-emerald-300">{r.district}</td>
                    <td className="py-2.5 px-4 text-right text-slate-200">{r.communityCount}</td>
                    <td className="py-2.5 px-4 text-right font-medium text-white">{r.patientCount}</td>
                    <td className="py-2.5 px-4 text-right text-teal-400">{ratio}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>
          หน้า {currentPage} จาก {totalPages} (แสดง {paginatedRecords.length} จาก {records.length} แถว)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/DataTable.tsx
git commit -m "feat: add DataTable component with sort, pagination, and export"
```

---

### Task 10: Assemble Dashboard Main Page & Verify Full Application

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Connects all components with Unified State (`FilterState`, data fetching from `/api/lomrak`)

- [ ] **Step 1: Update `src/app/layout.tsx` for proper title, description, and fonts**

Update `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบสารสนเทศติดตามโครงการหมู่บ้านชุมชนล้อมรักษ์ จ.ศรีสะเกษ",
  description: "แดชบอร์ดติดตามและประเมินผลโครงการบำบัดฟื้นฟูโดยชุมชนเป็นศูนย์กลาง (CBTx) 22 อำเภอ จังหวัดศรีสะเกษ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Implement full interactive dashboard in `src/app/page.tsx`**

Write `src/app/page.tsx`:
```tsx
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
```

- [ ] **Step 3: Run full tests across all test suites**

Run:
```bash
bun test
```
Expected: All tests pass.

- [ ] **Step 4: Run production build check**

Run:
```bash
bun run build
```
Expected: Build passes with zero errors.

- [ ] **Step 5: Commit complete dashboard**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: complete Lomrak Community Village Dashboard application"
```
