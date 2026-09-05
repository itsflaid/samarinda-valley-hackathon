export type RegionStatus = "AMAN" | "WASPADA" | "SIAGA" | "N/A";

export type IPAStatus = "AKTIF" | "MATI" | null;

export interface DummyRegion {
  id: string;
  name: string; // Kecamatan
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

export const dummyRegions: DummyRegion[] = [
  // =========================
  // SAMARINDA
  // =========================
  {
    id: "samarinda-sungai-kunjang",
    name: "Sungai Kunjang",
    city: "Samarinda",
    province: "Kalimantan Timur",
    status: "AMAN",
    ipaStatus: "AKTIF",
    ipaCondition: "Operasional normal",
    symptomReports: 3,
    lastUpdated: "5 menit lalu",
    latitude: -0.5107,
    longitude: 117.1175,
  },
  {
    id: "samarinda-samarinda-ulu",
    name: "Samarinda Ulu",
    city: "Samarinda",
    province: "Kalimantan Timur",
    status: "WASPADA",
    ipaStatus: "AKTIF",
    ipaCondition: "Operasional normal",
    symptomReports: 8,
    lastUpdated: "6 menit lalu",
    latitude: -0.4755,
    longitude: 117.1436,
  },
  {
    id: "samarinda-samarinda-ilir",
    name: "Samarinda Ilir",
    city: "Samarinda",
    province: "Kalimantan Timur",
    status: "AMAN",
    ipaStatus: "AKTIF",
    ipaCondition: "Operasional normal",
    symptomReports: 2,
    lastUpdated: "10 menit lalu",
    latitude: -0.493,
    longitude: 117.161,
  },
  {
    id: "samarinda-samarinda-kota",
    name: "Samarinda Kota",
    city: "Samarinda",
    province: "Kalimantan Timur",
    status: "AMAN",
    ipaStatus: "AKTIF",
    ipaCondition: "Operasional normal",
    symptomReports: 1,
    lastUpdated: "12 menit lalu",
    latitude: -0.5022,
    longitude: 117.1536,
  },
  {
    id: "samarinda-palaran",
    name: "Palaran",
    city: "Samarinda",
    province: "Kalimantan Timur",
    status: "SIAGA",
    ipaStatus: "MATI",
    ipaCondition: "Gangguan operasional",
    symptomReports: 14,
    lastUpdated: "3 menit lalu",
    latitude: -0.637,
    longitude: 117.241,
  },
  {
    id: "samarinda-samarinda-seberang",
    name: "Samarinda Seberang",
    city: "Samarinda",
    province: "Kalimantan Timur",
    status: "WASPADA",
    ipaStatus: "AKTIF",
    ipaCondition: "Kapasitas distribusi terbatas",
    symptomReports: 9,
    lastUpdated: "7 menit lalu",
    latitude: -0.516,
    longitude: 117.132,
  },
  {
    id: "samarinda-sambutan",
    name: "Sambutan",
    city: "Samarinda",
    province: "Kalimantan Timur",
    status: "AMAN",
    ipaStatus: "AKTIF",
    ipaCondition: "Operasional normal",
    symptomReports: 2,
    lastUpdated: "15 menit lalu",
    latitude: -0.469,
    longitude: 117.182,
  },

  // =========================
  // BALIKPAPAN
  // =========================
  {
    id: "balikpapan-balikpapan-kota",
    name: "Balikpapan Kota",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    status: "AMAN",
    ipaStatus: "AKTIF",
    ipaCondition: "Operasional normal",
    symptomReports: 3,
    lastUpdated: "5 menit lalu",
    latitude: -1.2675,
    longitude: 116.8289,
  },
  {
    id: "balikpapan-balikpapan-selatan",
    name: "Balikpapan Selatan",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    status: "WASPADA",
    ipaStatus: "AKTIF",
    ipaCondition: "Distribusi air perlu dipantau",
    symptomReports: 7,
    lastUpdated: "8 menit lalu",
    latitude: -1.245,
    longitude: 116.857,
  },
  {
    id: "balikpapan-balikpapan-utara",
    name: "Balikpapan Utara",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    status: "AMAN",
    ipaStatus: "AKTIF",
    ipaCondition: "Operasional normal",
    symptomReports: 2,
    lastUpdated: "11 menit lalu",
    latitude: -1.205,
    longitude: 116.853,
  },
  {
    id: "balikpapan-balikpapan-tengah",
    name: "Balikpapan Tengah",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    status: "AMAN",
    ipaStatus: "AKTIF",
    ipaCondition: "Operasional normal",
    symptomReports: 1,
    lastUpdated: "14 menit lalu",
    latitude: -1.257,
    longitude: 116.839,
  },
  {
    id: "balikpapan-balikpapan-timur",
    name: "Balikpapan Timur",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    status: "SIAGA",
    ipaStatus: "MATI",
    ipaCondition: "Gangguan distribusi air",
    symptomReports: 16,
    lastUpdated: "4 menit lalu",
    latitude: -1.206,
    longitude: 116.94,
  },
  {
    id: "balikpapan-balikpapan-barat",
    name: "Balikpapan Barat",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    status: "WASPADA",
    ipaStatus: "AKTIF",
    ipaCondition: "Tekanan distribusi menurun",
    symptomReports: 10,
    lastUpdated: "9 menit lalu",
    latitude: -1.233,
    longitude: 116.81,
  },
];

export const statusColors: Record<RegionStatus, string> = {
  AMAN: "#22c55e",
  WASPADA: "#eab308",
  SIAGA: "#ef4444",
  "N/A": "#9ca3af",
};