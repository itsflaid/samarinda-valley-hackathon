-- CreateEnum
CREATE TYPE "IPAStatus" AS ENUM ('AKTIF', 'MATI');

-- CreateEnum
CREATE TYPE "RegionStatus" AS ENUM ('AMAN', 'WASPADA', 'SIAGA');

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "status" "RegionStatus" NOT NULL DEFAULT 'AMAN',
    "ipaStatus" "IPAStatus" NOT NULL,
    "ipaCondition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthReport" (
    "id" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "diarrhea" BOOLEAN NOT NULL DEFAULT false,
    "vomiting" BOOLEAN NOT NULL DEFAULT false,
    "fever" BOOLEAN NOT NULL DEFAULT false,
    "dehydration" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterReport" (
    "id" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "supplyDisruption" BOOLEAN NOT NULL DEFAULT false,
    "dirtyOrSmelly" BOOLEAN NOT NULL DEFAULT false,
    "saltyOrBrackish" BOOLEAN NOT NULL DEFAULT false,
    "dryWell" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Region_city_idx" ON "Region"("city");

-- CreateIndex
CREATE INDEX "Region_province_idx" ON "Region"("province");

-- AddForeignKey
ALTER TABLE "HealthReport" ADD CONSTRAINT "HealthReport_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterReport" ADD CONSTRAINT "WaterReport_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
