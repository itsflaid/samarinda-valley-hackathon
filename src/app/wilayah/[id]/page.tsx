import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RegionDetailClient } from "./RegionDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WilayahPage({ params }: PageProps) {
  const { id } = await params;

  const region = await prisma.region.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          healthReports: true,
          waterReports: true,
        },
      },
      healthReports: {
        orderBy: { reportedAt: "desc" },
        take: 20,
        select: {
          id: true,
          diarrhea: true,
          vomiting: true,
          fever: true,
          dehydration: true,
          reportedAt: true,
        },
      },
      waterReports: {
        orderBy: { reportedAt: "desc" },
        take: 20,
        select: {
          id: true,
          supplyDisruption: true,
          dirtyOrSmelly: true,
          saltyOrBrackish: true,
          dryWell: true,
          reportedAt: true,
        },
      },
    },
  });

  if (!region) notFound();

  const latestHealthReport = region.healthReports[0];
  const latestWaterReport = region.waterReports[0];

  const lastUpdated =
    latestHealthReport && latestWaterReport
      ? latestHealthReport.reportedAt > latestWaterReport.reportedAt
        ? latestHealthReport.reportedAt
        : latestWaterReport.reportedAt
      : latestHealthReport?.reportedAt ??
        latestWaterReport?.reportedAt ??
        null;

  const healthBreakdown = {
    diarrhea: region.healthReports.filter((r) => r.diarrhea).length,
    vomiting: region.healthReports.filter((r) => r.vomiting).length,
    fever: region.healthReports.filter((r) => r.fever).length,
    dehydration: region.healthReports.filter((r) => r.dehydration).length,
  };

  const waterBreakdown = {
    supplyDisruption: region.waterReports.filter((r) => r.supplyDisruption).length,
    dirtyOrSmelly: region.waterReports.filter((r) => r.dirtyOrSmelly).length,
    saltyOrBrackish: region.waterReports.filter((r) => r.saltyOrBrackish).length,
    dryWell: region.waterReports.filter((r) => r.dryWell).length,
  };

  const regionDetail = {
    id: region.id,
    name: region.name,
    city: region.city,
    province: region.province,
    status: region.status,
    ipaStatus: region.ipaStatus,
    ipaCondition: region.ipaCondition,
    latitude: Number(region.latitude),
    longitude: Number(region.longitude),
    healthReports: {
      total: region._count.healthReports,
      ...healthBreakdown,
    },
    waterReports: {
      total: region._count.waterReports,
      ...waterBreakdown,
    },
    lastUpdated: lastUpdated?.toISOString() ?? null,
  };

  return <RegionDetailClient regionDetail={regionDetail} />;
}
