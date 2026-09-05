# SANITAIR

> Platform health-tech preventif berbasis kesadaran dini untuk memitigasi risiko penyakit bawaan air (waterborne diseases) di Kalimantan Timur.

## Tech Stack

### Framework & Library

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 16.3 | React framework (App Router) |
| React | 19.2 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | 4 (base-nova) | Komponen UI (Dialog, Button, Input, dll) |

### Backend & Database

| Teknologi | Fungsi |
|-----------|--------|
| Next.js API Routes | REST API (`/api/*`) |
| Prisma ORM | Database ORM & migrations |
| PostgreSQL | Database relational |
| NextAuth.js v4 | Autentikasi (login, session, role) |
| bcryptjs | Hashing password |

### Peta & Geolokasi

| Teknologi | Fungsi |
|-----------|--------|
| Leaflet | Peta interaktif |
| react-leaflet | React wrapper untuk Leaflet |
| OpenStreetMap Nominatim | Reverse geocoding (koordinat → nama wilayah) |
| GeoJSON | Batas kecamatan Kaltim |

### UI & Ikon

| Teknologi | Fungsi |
|-----------|--------|
| Lucide React | Ikon |
| React Icons | Ikon tambahan |
| class-variance-authority | Variasi komponen |
| sonner | Toast notifications |
| tw-animate-css | Animasi Tailwind |

## Fitur Utama

### 1. Deteksi Risiko Wilayah

- Peta interaktif dengan 3 status: AMAN, WASPADA, SIAGA
- Geolokasi otomatis untuk menentukan wilayah pengguna
- Batas kecamatan dari GeoJSON

### 2. Laporan Masyarakat

- Form pelaporan publik (tanpa login)
- Laporan kesehatan: diare, muntah, demam, dehidrasi
- Laporan air: pasokan terganggu, keruh/bau, asin/payau, sumur kering
- Deteksi lokasi otomatis via browser Geolocation API

### 3. Solusi Preventif

- **1 gejala**: Solusi mandiri rumah spesifik per gejala
- **≥2 gejala**: Peringatan darurat + pencarian faskes terdekat + panggilan 112

### 4. Manajemen Fasilitas Kesehatan

- Daftar Puskesmas, RS, dan Klinik
- Pencarian dan filter berdasarkan tipe
- Rute Google Maps

### 5. Dashboard Berbasis Peran

- **Admin**: Kelola user, petugas, nakes
- **Petugas**: Status wilayah binaan
- **NAKES**: Data kesehatan masyarakat

## Database Schema

```
User ─────< UserRegion >───── Region ─────< HealthReport
                         │              └────< WaterReport
                         └───────────────────< Facility
```

**Models:** User, Region, UserRegion, HealthReport, WaterReport, Facility

## API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/auth/login` | Login |
| GET | `/api/regions` | Daftar semua wilayah |
| GET | `/api/regions/[id]` | Detail wilayah + breakdown laporan |
| PUT | `/api/regions/[id]` | Update status wilayah |
| GET | `/api/facilities` | Daftar faskes |
| POST | `/api/reports/health` | Kirim laporan kesehatan |
| POST | `/api/reports/water` | Kirim laporan air |

## Instalasi

```bash
# Clone
git clone https://github.com/itsflaid/samarinda-valley-hackathon.git
cd health-tech

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Isi DATABASE_URL, NEXTAUTH_SECRET, dll

# Database migration
npx prisma migrate dev

# Seed admin user
npx prisma db seed

# Jalankan
npm run dev
```
