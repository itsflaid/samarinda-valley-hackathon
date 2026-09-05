"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { DummyRegion } from "@/lib/mock-data";
import { statusColors } from "@/lib/mock-data";
import {
  preventionGuides,
  redFlags,
} from "@/lib/prevention-data";

interface HealthGuideModalProps {
  region: DummyRegion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthGuideModal({
  region,
  open,
  onOpenChange,
}: HealthGuideModalProps) {
  const guide = preventionGuides[region.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto z-10000">
        <DialogHeader>
          <DialogTitle>Lihat Detail Wilayah</DialogTitle>
          <DialogDescription>
            Detail kondisi wilayah dan panduan kesehatan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-4">
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
                <p className="text-muted-foreground">Laporan Gejala</p>
                <p className="font-medium">
                  {region.symptomReports ?? "N/A"}
                </p>
              </div>
            </div>

            {region.ipaCondition && (
              <p className="text-sm text-muted-foreground">
                {region.ipaCondition}
              </p>
            )}

            <div className="text-sm">
              <p className="text-muted-foreground">Pembaruan Terakhir</p>
              <p className="font-medium">
                {region.lastUpdated ?? "N/A"}
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

          <ol className="space-y-4 list-decimal list-inside">
            {guide.items.map((item) => (
              <li key={item.title}>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
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
