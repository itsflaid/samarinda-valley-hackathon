export type RegionStatus = "AMAN" | "WASPADA" | "SIAGA";

export type IPAStatus = "AKTIF" | "MATI" | null;

export interface RegionData {
  id: string;
  name: string;
  city: string;
  province: string;

  status: RegionStatus;

  ipaStatus: IPAStatus;
  ipaCondition: string | null;

  latitude: number;
  longitude: number;

  symptomReports: number;
  waterReports: number;
}

export interface RegionDetail extends Omit<RegionData, "symptomReports" | "waterReports"> {
  healthReports: {
    total: number;
    diarrhea: number;
    vomiting: number;
    fever: number;
    dehydration: number;
  };
  waterReports: {
    total: number;
    supplyDisruption: number;
    dirtyOrSmelly: number;
    saltyOrBrackish: number;
    dryWell: number;
  };
  lastUpdated: string | null;
}

export const statusColors: Record<RegionStatus, string> = {
  AMAN: "#22c55e",
  WASPADA: "#eab308",
  SIAGA: "#ef4444",
};