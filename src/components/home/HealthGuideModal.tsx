"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { RegionData, RegionDetail } from "@/types/region";
import { statusColors } from "@/types/region";
import { formatRelativeTime } from "@/lib/utils";
import {
  preventionGuides,
  redFlags,
} from "@/lib/prevention-data";

interface HealthGuideModalProps {
  region: RegionData | RegionDetail;
  detail: RegionDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthGuideModal({
  region,
  detail,
  open,
  onOpenChange,
}: HealthGuideModalProps) {
  const guide = preventionGuides[region.status];
  const data = detail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent sendiri TIDAK scroll — cuma jadi frame diam.
          Tombol X (dirender otomatis oleh DialogContent) posisinya
          absolute relatif ke frame ini, jadi ikut diam juga. */}
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden p-0 flex flex-col gap-0 z-10000">
        {/* Semua isi (header + body) dibungkus di sini, dan HANYA
            div ini yang overflow-y-auto — jadi yang scroll cuma konten. */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <DialogHeader>
            <DialogTitle>Lihat Detail Wilayah</DialogTitle>
            <DialogDescription>
              Detail kondisi wilayah dan panduan kesehatan.
            </DialogDescription>
          </DialogHeader>

          <div>
            <p className="text-xs text-muted-foreground">Wilayah</p>
            <p className="text-base font-semibold">
              {region.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {region.city}, {region.province}
            </p>
          </div>

          <div
            className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              color: statusColors[region.status],
              backgroundColor: `${statusColors[region.status]}15`,
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor: statusColors[region.status],
              }}
            />
            {region.status}
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium">Ringkasan Kondisi</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Status IPA</p>
                <p className="font-medium">
                  {region.ipaStatus ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Laporan Kesehatan</p>
                <p className="font-medium">
                  {data?.healthReports?.total ?? "N/A"}
                </p>
              </div>
            </div>

            {data?.healthReports && (
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Diare: {data.healthReports.diarrhea}</span>
                <span>Muntah: {data.healthReports.vomiting}</span>
                <span>Demam: {data.healthReports.fever}</span>
                <span>Dehidrasi: {data.healthReports.dehydration}</span>
              </div>
            )}

            {data?.waterReports && (
              <>
                <div className="border-t border-border pt-2">
                  <p className="text-sm font-medium">Laporan Air</p>
                  <p className="text-sm">{data.waterReports.total} laporan</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Pasokan terganggu: {data.waterReports.supplyDisruption}</span>
                  <span>Keruh/bau: {data.waterReports.dirtyOrSmelly}</span>
                  <span>Asin/payau: {data.waterReports.saltyOrBrackish}</span>
                  <span>Sumur kering: {data.waterReports.dryWell}</span>
                </div>
              </>
            )}

            {region.ipaCondition && (
              <p className="text-sm text-muted-foreground">
                {region.ipaCondition}
              </p>
            )}

            <div className="text-sm">
              <p className="text-muted-foreground">Pembaruan Terakhir</p>
              <p className="font-medium">
                {data?.lastUpdated ? formatRelativeTime(data.lastUpdated) : "N/A"}
              </p>
            </div>
          </div>

          <div className="border-t border-border" />

          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Panduan Kesehatan
            </p>
            <p className="text-base font-semibold">{guide.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {guide.description}
            </p>
          </div>

          <ol className="space-y-4">
            {guide.items.map((item, index) => (
              <li key={item.title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="border-t border-border" />

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-destructive" />
              <p className="text-sm font-semibold text-destructive">
                Tanda Bahaya
              </p>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {redFlags.map((flag) => (
                <li key={flag} className="flex gap-2">
                  <span className="mt-1.5 size-1 rounded-full bg-destructive shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}