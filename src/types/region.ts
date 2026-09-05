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

    symptomReports: number | null;
    lastUpdated: string | null;

    latitude: number;
    longitude: number;
}

export const statusColors: Record<RegionStatus, string> = {
    AMAN: "#22c55e",
    WASPADA: "#eab308",
    SIAGA: "#ef4444",
};