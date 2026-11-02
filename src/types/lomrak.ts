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
