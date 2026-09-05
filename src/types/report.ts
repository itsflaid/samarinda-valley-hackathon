export interface CreateHealthReportInput {
    reporterName: string;
    reporterPhone: string;
    regionId: string;

    diarrhea: boolean;
    vomiting: boolean;
    fever: boolean;
    dehydration: boolean;

    latitude: number;
    longitude: number;
}

export interface CreateWaterReportInput {
    reporterName: string;
    reporterPhone: string;
    regionId: string;

    supplyDisruption: boolean;
    dirtyOrSmelly: boolean;
    saltyOrBrackish: boolean;
    dryWell: boolean;

    latitude: number;
    longitude: number;
}