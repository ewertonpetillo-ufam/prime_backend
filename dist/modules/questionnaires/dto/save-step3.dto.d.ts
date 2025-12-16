export declare class MedicationDto {
    drug?: string;
    doseMg?: number;
    qtDose?: number;
    led?: number;
    customDrugName?: string;
    customConversionFactor?: number;
}
export declare class SaveStep3Dto {
    questionnaireId: string;
    diagnosticDescription?: string;
    onsetAge?: number;
    parkinsonOnset?: string;
    initialSympton?: string;
    parkinsonSide?: string;
    familyCase?: string;
    kinshipDegree?: string;
    mainPhenotype?: string;
    levodopaOn?: boolean;
    medications?: MedicationDto[];
    leddResult?: number;
    comorbidities?: string;
    otherMedications?: string;
    diskinectiaPresence?: boolean;
    fog?: boolean;
    fogClassifcation?: string;
    wearingOff?: boolean;
    durationWearingOff?: string;
    DelayOn?: boolean;
    durationLDopa?: string;
    scaleHY?: string;
    scaleSE?: string;
    vitamins?: string;
    surgery?: string;
    surgerrYear?: string;
    surgeryType?: string;
    surgeryTarget?: string;
    evolution?: string;
    symptom?: string;
}
