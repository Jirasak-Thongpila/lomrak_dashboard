# Lomrak Community Village Dashboard (โครงการหมู่บ้านชุมชนล้อมรักษ์ จ.ศรีสะเกษ)
**Design Specification**
Date: 2026-11-02  
Status: Approved  

---

## 1. Executive Summary & Objective

**Lomrak Dashboard** เป็นระบบสารสนเทศแสดงผลสถิติและติดตามผลการดำเนินงานโครงการ **"หมู่บ้านชุมชนล้อมรักษ์"** ในพื้นที่ 22 อำเภอ ของจังหวัดศรีสะเกษ ซึ่งเป็นโครงการบำบัดฟื้นฟูผู้ใช้ยาเสพติดโดยใช้ชุมชนเป็นศูนย์กลาง (CBTx - Community Based Treatment and Rehabilitation)

ระบบจะดึงข้อมูลจริงจากไฟล์สเปรดชีตใน Google Drive โฟลเดอร์ `1OeanyMcY50AsULZCTpU_b-M9fbG7uGxS` ผ่าน **Google Apps Script (GAS) Web App JSON API** และประมวลผลผ่าน **Next.js 16 (App Router)** พร้อม Tailwind CSS v4, Recharts, Custom Interactive Sisaket Map, และระบบ Offline Fallback ที่เสถียร 100%

---

## 2. Data Architecture & Integration

### 2.1 Google Drive & Google Apps Script (`Code.gs`)
- **Data Source:** ไฟล์ Excel/Google Sheet `หมู่บ้านชุมชนล้อมรักษ์` 
- **คอลัมน์ในข้อมูลดิบ:**
  1. `ปี` (เช่น 2565, 2566, 2567)
  2. `อำเภอ` (22 อำเภอในจังหวัดศรีสะเกษ)
  3. `หมู่บ้าน/ชุมชน` (จำนวนชุมชนล้อมรักษ์ที่เข้าร่วม)
  4. `ผู้ป่วยเข้ารับบำบัด` (จำนวนผู้รับการบำบัด)
- **Deployment Script (`Code.gs`):**
  สคริปต์ Google Apps Script ทำหน้าที่อ่านแถวข้อมูลในชีต แปลงเป็น JSON โครงสร้างมาตรฐาน และส่งกลับผ่าน `ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON)`

### 2.2 Standard JSON Schema
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
}
```

### 2.3 Next.js Route Handler (`/api/lomrak`)
- ไฟล์: `src/app/api/lomrak/route.ts`
- **Logic:**
  1. ตรวจสอบ Environment Variable `GAS_API_URL`
  2. หากมี URL ให้ทำ `fetch(GAS_API_URL, { next: { revalidate: 300 } })` (แคชไว้ 5 นาที)
  3. ตรวจสอบ Query Parameter `?refresh=true` หากมี ให้ bypass cache เพื่ออัปเดตข้อมูลสด
  4. หากไม่มี URL หรือการเชื่อมต่อไปยัง Google Apps Script ล้มเหลว (Timeout / Error 500) ให้สลับไปโหลด `src/data/fallback-lomrak.json` ทันทีโดยไม่มีข้อผิดพลาดหลุดออกไปหน้าเว็บ

---

## 3. UI/UX Design & Components Architecture

### 3.1 Design Aesthetic & Color Palette
- **โทนสีหลัก (Theme):**
  - Primary / Brand: **Emerald & Teal** (`emerald-600`, `teal-700`) สื่อถึงการฟื้นฟู สุขภาพ ชุมชน และความปลอดภัย
  - Accent / Metric: **Indigo & Sky Blue** (`indigo-600`, `sky-500`) สำหรับกราฟแนวโน้มและการเปรียบเทียบ
  - Warning / Alert: **Amber & Rose** (`amber-500`, `rose-500`) แสดงระดับความหนาแน่นสูง
  - Surface: Dark mode / Light mode support (Slate 50 / Slate 900 background)
- **Typography:** ฟอนต์สไตล์โมเดิร์น อ่านง่าย (Prompt / Inter)

### 3.2 Component Hierarchy
```
src/
├── app/
│   ├── api/lomrak/route.ts        # Next.js Route Handler (Caching & Proxy)
│   ├── layout.tsx                 # Root layout with metadata & fonts
│   ├── page.tsx                   # Main Dashboard page
│   └── globals.css                # Tailwind CSS v4 styling
├── components/
│   ├── dashboard/
│   │   ├── Header.tsx             # Title, status badge, sync button, export
│   │   ├── FilterBar.tsx          # Year selector, district search, metric toggle
│   │   ├── KpiCards.tsx           # 4 Metric Summary Cards with micro-animations
│   │   ├── DistrictBarChart.tsx   # Ranked bar chart comparing districts
│   │   ├── YearlyTrendChart.tsx   # Multi-year trend line/area chart
│   │   ├── SisaketMap.tsx         # Interactive SVG Choropleth Map of Sisaket
│   │   ├── DataTable.tsx          # Sortable, searchable, paginated table
│   │   └── GasSetupModal.tsx      # Modal showing Code.gs and deploy steps
├── data/
│   ├── fallback-lomrak.json       # Pre-built Sisaket 22 districts dataset (2565-2567)
│   └── sisaket-districts.ts       # District coordinates, metadata, Thai/Eng names
├── lib/
│   ├── types.ts                   # TypeScript interfaces & types
│   ├── data-utils.ts              # Data aggregation, math, sorting, export helpers
│   └── gas-script-template.ts     # Complete ready-to-copy Code.gs script
```

---

## 4. Feature Specifications

### 4.1 Header & Status Indicator
- แสดงชื่อโครงการ: **"หมู่บ้านชุมชนล้อมรักษ์ จังหวัดศรีสะเกษ"**
- Badge สถานะ: 
  - `🟢 Google Sheets Connected` เมื่อดึงข้อมูลสดสำเร็จ
  - `🟡 Demo / Offline Data` เมื่อทำงานด้วย Fallback Data พร้อมปุ่มเปิดคู่มือตั้งค่า Google Apps Script
- Action Buttons:
  - `ปุ่มรีเฟรชข้อมูล`: ยิง `/api/lomrak?refresh=true` เพื่อดึงข้อมูลใหม่ทันที
  - `ปุ่มตั้งค่า Google Apps Script`: เปิด Modal แสดงโค้ด `Code.gs` และขั้นตอน Deploy อย่างละเอียด
  - `ปุ่ม Export CSV`: ดาวน์โหลดชุดข้อมูลที่กำลังกรองอยู่เป็นไฟล์ `.csv` รองรับภาษาไทย (BOM UTF-8)

### 4.2 Interactive Filter Bar
- **Year Filter:** ปุ่มกดเลือก `ทุกปีสะสม (All Years)`, `2565`, `2566`, `2567`
- **District Search:** Input สำหรับค้นหาอำเภอ กรองทั้งตาราง กราฟ และแผนที่แบบ Realtime
- **Metric Toggle:** สลับเกณฑ์วิเคราะห์ระหว่าง:
  - `ผู้ป่วยเข้ารับการบำบัด (คน)`
  - `จำนวนหมู่บ้าน/ชุมชนล้อมรักษ์ (แห่ง)`

### 4.3 KPI Summary Cards
1. **ผู้ป่วยเข้ารับการบำบัดรวม (Total Patients):** แสดงยอดคนทั้งหมด และ % การเปลี่ยนแปลง
2. **ชุมชนล้อมรักษ์รวม (Total Communities):** จำนวนหมู่บ้าน/ชุมชนที่เข้าร่วมโครงการ
3. **อำเภอที่มีสถิติสูงสุด (Top District):** ชื่ออำเภอที่มียอดสูงสุด + สัดส่วนเปอร์เซ็นต์
4. **ความหนาแน่นเฉลี่ย (Avg. Patients/Community):** จำนวนผู้ป่วยเฉลี่ยต่อหนึ่งชุมชนล้อมรักษ์

### 4.4 Analytics Charts (Recharts)
1. **District Comparison Bar Chart:**
   - แสดงอันดับอำเภอเรียงจากมากไปน้อย
   - ไฮไลต์อำเภอที่ถูกเลือกจากการคลิกบนแผนที่หรือการค้นหา
   - Tooltip แสดงทั้งจำนวนผู้ป่วยและจำนวนชุมชน
2. **Yearly Trend Area Chart:**
   - เส้นกราฟเปรียบเทียบการเปลี่ยนแปลงในแต่ละปี พ.ศ.

### 4.5 Interactive Sisaket Map (Choropleth Visualizer)
- แผนที่จำลอง 22 อำเภอในจังหวัดศรีสะเกษ:
  1. เมืองศรีสะเกษ 2. ยางชุมน้อย 3. กันทรารมย์ 4. กันทรลักษ์ 5. ขุขันธ์ 6. ไพรบึง 7. ปรางค์กู่ 8. ขุนหาญ 9. ราษีไศล 10. อุทุมพรพิสัย 11. บึงบูรพ์ 12. ห้วยทับทัน 13. โนนคูณ 14. ศรีรัตนะ 15. น้ำเกลี้ยง 16. วังหิน 17. ภูสิงห์ 18. เมืองจันทร์ 19. เบญจลักษ์ 20. พยุห์ 21. โพธิ์ศรีสุวรรณ 22. ศิลาลาด
- แสดงความเข้มของสีตามค่าตัวเลข (Scale Color Gradient)
- Interactive Hover: แสดง Tooltip รายละเอียดอำเภอ
- Interactive Click: เลือกอำเภอเพื่อคัดกรองข้อมูลทันที

### 4.6 Interactive Data Table
- ตารางแสดงผลพร้อมคอลัมน์: `ลำดับ`, `ปี พ.ศ.`, `อำเภอ`, `ชุมชนล้อมรักษ์ (แห่ง)`, `ผู้ป่วยบำบัด (คน)`, `เฉลี่ยต่อชุมชน`
- เรียงลำดับ (Sort) ได้ทุกคอลัมน์ (Asc / Desc)
- ค้นหาคำในตาราง (Search filter)
- Pagination (10 / 25 / 50 แถวต่อหน้า)
- ปุ่ม Export CSV ทันที

---

## 5. Google Apps Script Template (`Code.gs`)
เตรียมสคริปต์แบบ Complete Plug-and-Play ที่รองรับ:
- การอ่านจาก Active Sheet หรือระบุ Sheet ID
- การแปลงหัวคอลัมน์ภาษาไทย (`ปี`, `อำเภอ`, `หมู่บ้าน/ชุมชน`, `ผู้ป่วยเข้ารับบำบัด`) ให้เป็น Clean JSON Schema
- การจัดการ CORS Header อัตโนมัติ

---

## 6. Verification & Acceptance Criteria
1. **Build & Type Checking:** `bun run build` หรือ `next build` ผ่าน 100% ไม่มี TypeScript หรือ Lint error
2. **Responsive Design:** แสดงผลสวยงามบนทั้ง Desktop, Tablet และ Mobile
3. **Graceful Fallback:** หน้าเว็บทำงานได้สมบูรณ์แม้อยู่ในสถานะออฟไลน์หรือยังไม่ได้ Deploy Google Apps Script
4. **Data Synchronization:** เมื่อระบุ `GAS_API_URL` หน้าเว็บสามารถดึงข้อมูลจริงจาก Google Apps Script และอัปเดตแบบเรียลไทม์ได้
5. **Interactive Fidelity:** การฟิลเตอร์ปี, การคลิกเลือกอำเภอในแผนที่, และการค้นหาในตารางทำงานสอดประสานกันอย่างราบรื่น
