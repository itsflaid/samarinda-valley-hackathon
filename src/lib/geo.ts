import { dummyRegions, type DummyRegion } from "./mock-data";

const NEAREST_REGION_THRESHOLD_DEG = 0.05;

export function findNearestRegion(
    lat: number,
    lng: number,
    regions: DummyRegion[] = dummyRegions
): DummyRegion | undefined {
    let closest: DummyRegion | undefined;
    let minDistance = Infinity;

    for (const region of regions) {
        const distance = Math.hypot(lat - region.latitude, lng - region.longitude);
        if (distance < minDistance) {
            minDistance = distance;
            closest = region;
        }
    }

    return minDistance < NEAREST_REGION_THRESHOLD_DEG ? closest : undefined;
}