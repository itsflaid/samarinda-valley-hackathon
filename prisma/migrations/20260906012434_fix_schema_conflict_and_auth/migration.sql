-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('RENDAH', 'SEDANG', 'TINGGI');

-- CreateTable
CREATE TABLE "HealthAssessment" (
    "id" TEXT NOT NULL,
    "healthReportId" TEXT,
    "nakesId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "notes" TEXT,
    "actionTaken" TEXT,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityStaff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthAssessment_nakesId_idx" ON "HealthAssessment"("nakesId");

-- CreateIndex
CREATE INDEX "HealthAssessment_regionId_idx" ON "HealthAssessment"("regionId");

-- CreateIndex
CREATE INDEX "HealthAssessment_riskLevel_idx" ON "HealthAssessment"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "HealthAssessment_healthReportId_key" ON "HealthAssessment"("healthReportId");

-- CreateIndex
CREATE INDEX "FacilityStaff_userId_idx" ON "FacilityStaff"("userId");

-- CreateIndex
CREATE INDEX "FacilityStaff_facilityId_idx" ON "FacilityStaff"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityStaff_userId_facilityId_key" ON "FacilityStaff"("userId", "facilityId");

-- AddForeignKey
ALTER TABLE "HealthAssessment" ADD CONSTRAINT "HealthAssessment_healthReportId_fkey" FOREIGN KEY ("healthReportId") REFERENCES "HealthReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthAssessment" ADD CONSTRAINT "HealthAssessment_nakesId_fkey" FOREIGN KEY ("nakesId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthAssessment" ADD CONSTRAINT "HealthAssessment_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityStaff" ADD CONSTRAINT "FacilityStaff_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityStaff" ADD CONSTRAINT "FacilityStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
