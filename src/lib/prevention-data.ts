import type { RegionStatus } from "@/types/region";

export interface PreventionItem {
  title: string;
  description: string;
}

export interface PreventionGuide {
  title: string;
  description: string;
  items: PreventionItem[];
}

export interface SymptomSolution {
  title: string;
  solution: string;
}

export const singleSymptomSolutions: Record<string, SymptomSolution> = {
  diarrhea: {
    title: "Diare Akut / Mencret Cair",
    solution:
      "Segera minum cairan Oralit Rumahan: Larutkan 1 sendok teh gula pasir + ¼ sendok teh garam dapur ke dalam 200 ml air minum yang telah direbus matang sempurna. Minum setiap kali selesai buang air besar untuk mengganti cairan yang hilang.",
  },
  vomiting: {
    title: "Mual & Muntah Hebat",
    solution:
      "Istirahatkan lambung, hindari makan/minum terburu-buru. Berikan air hangat atau air jahe dalam sesapan kecil (1-2 sendok) setiap 15 menit. Jangan langsung meminum air dalam volume besar untuk mencegah refleks muntah susulan.",
  },
  fever: {
    title: "Demam Tinggi / Tubuh Menggigil",
    solution:
      "Kompres hangat di area lipatan ketiak atau selangkangan (bukan kompres es pada dahi). Pastikan pasien tetap minum air putih matang secara berkala untuk mencegah dehidrasi akibat penguapan suhu tubuh yang tinggi.",
  },
  dehydration: {
    title: "Dehidrasi Lemas (Mata cowong/cekung)",
    solution:
      "Tubuh Anda sedang kekurangan cairan kritis. Segera konsumsi cairan rehidrasi (oralit atau air kelapa muda jika tersedia). Hindari minuman berkafein, teh pekat, atau soda yang dapat memperburuk kondisi cairan tubuh.",
  },
};

export const singleSymptomClosing =
  "Tetap pantau kondisi tubuh Anda dalam 12 jam ke depan. Jika gejala menetap atau memburuk, segera kunjungi fasilitas kesehatan terdekat.";

export const emergencyWarning = {
  title: "INDIKASI DEHIDRASI & INFEKSI AKUT",
  message:
    "Anda mengalami kombinasi gejala klinis awal penyakit bawaan air yang berisiko fatal jika terlambat ditangani. Dilarang melakukan penanganan mandiri lebih lama di rumah. Anda diwajibkan segera pergi ke fasilitas kesehatan terdekat saat ini juga.",
};

export const preventionGuides: Record<RegionStatus, PreventionGuide> = {
  AMAN: {
    title: "Kondisi Wilayah Aman",
    description:
      "Kondisi wilayah saat ini relatif aman. Tetap lakukan kebiasaan higienis dan pantau perubahan kondisi di sekitar Anda.",
    items: [
      {
        title: "Penyimpanan Air Bersih",
        description:
          "Simpan air dalam wadah yang bersih dan tertutup untuk menjaga kualitas air dan mencegah kontaminasi.",
      },
      {
        title: "Kebersihan Tandon",
        description:
          "Bersihkan dan kuras tempat penyimpanan air secara berkala agar tidak menjadi sumber kontaminasi.",
      },
      {
        title: "Kebersihan Tangan",
        description:
          "Cuci tangan menggunakan sabun dan air mengalir sebelum makan, menyiapkan makanan, dan setelah menggunakan toilet.",
      },
      {
        title: "Pisahkan Bahan Mentah dan Matang",
        description:
          "Gunakan peralatan yang bersih dan hindari kontak silang antara makanan mentah dan makanan yang sudah matang.",
      },
      {
        title: "Pantau Kondisi Tubuh",
        description:
          "Kenali gejala seperti diare, muntah, atau tanda dehidrasi dan lakukan tindakan lebih lanjut bila kondisi memburuk.",
      },
    ],
  },
  WASPADA: {
    title: "Kondisi Wilayah Waspada",
    description:
      "Terdapat indikator yang perlu diperhatikan pada wilayah ini. Tingkatkan kewaspadaan terhadap kualitas air dan kondisi kesehatan lingkungan.",
    items: [
      {
        title: "Perhatikan Kondisi Air",
        description:
          "Jika air terlihat keruh, berubah warna, berbau, atau memiliki kondisi yang tidak biasa, hindari penggunaan untuk konsumsi sebelum mendapatkan penanganan yang sesuai.",
      },
      {
        title: "Gunakan Air yang Aman",
        description:
          "Untuk minum, memasak, dan keperluan yang berhubungan dengan makanan, gunakan sumber air yang telah dipastikan aman.",
      },
      {
        title: "Jaga Kebersihan Wadah",
        description:
          "Pastikan wadah penyimpanan air dan peralatan makanan tetap bersih serta tertutup.",
      },
      {
        title: "Tingkatkan Higienitas",
        description:
          "Lebih sering mencuci tangan menggunakan sabun, terutama sebelum makan dan setelah dari toilet.",
      },
      {
        title: "Pantau Gejala",
        description:
          "Perhatikan munculnya diare, muntah, nyeri perut, atau tanda dehidrasi pada anggota keluarga.",
      },
    ],
  },
  SIAGA: {
    title: "Kondisi Wilayah Siaga",
    description:
      "Wilayah berada pada tingkat kewaspadaan tinggi. Prioritaskan penggunaan sumber air yang aman dan segera mencari bantuan kesehatan jika muncul gejala berat.",
    items: [
      {
        title: "Gunakan Sumber Air Aman",
        description:
          "Hindari menggunakan air yang kualitasnya diragukan untuk minum, memasak, atau keperluan yang memungkinkan air masuk ke tubuh.",
      },
      {
        title: "Prioritaskan Air yang Telah Diolah",
        description:
          "Gunakan air yang telah mendapatkan pengolahan sesuai panduan resmi dari otoritas kesehatan atau penyedia layanan air.",
      },
      {
        title: "Jaga Kebersihan Makanan",
        description:
          "Pastikan makanan, peralatan memasak, dan tangan tetap bersih untuk mengurangi risiko kontaminasi.",
      },
      {
        title: "Pantau Gejala Kesehatan",
        description:
          "Perhatikan diare, muntah, nyeri perut, lemas, atau tanda dehidrasi.",
      },
      {
        title: "Cari Bantuan Medis Bila Memburuk",
        description:
          "Jika gejala berat atau kondisi tubuh memburuk, segera hubungi fasilitas pelayanan kesehatan.",
      },
    ],
  },
};

export const redFlags = [
  "Diare berulang atau sangat cair",
  "Muntah terus-menerus sehingga sulit mempertahankan cairan",
  "Tanda dehidrasi seperti sangat haus, lemas, mata cekung, atau jumlah urine berkurang",
  "Demam tinggi atau kondisi tubuh semakin memburuk",
];
