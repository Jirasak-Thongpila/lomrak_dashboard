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
