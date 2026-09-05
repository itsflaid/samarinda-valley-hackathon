export type FacilityType =
  | "PUSKESMAS"
  | "RUMAH_SAKIT"
  | "KLINIK";

export interface FacilityData {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  regionId: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  openingHours: string | null;
  isActive: boolean;

  region: {
    id: string;
    name: string;
    city: string;
    province: string;
  };
}
