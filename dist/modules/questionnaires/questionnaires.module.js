"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionnairesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const questionnaires_service_1 = require("./questionnaires.service");
const questionnaires_controller_1 = require("./questionnaires.controller");
const questionnaire_entity_1 = require("../../entities/questionnaire.entity");
const anthropometric_data_entity_1 = require("../../entities/anthropometric-data.entity");
const clinical_assessment_entity_1 = require("../../entities/clinical-assessment.entity");
const gender_type_entity_1 = require("../../entities/gender-type.entity");
const ethnicity_type_entity_1 = require("../../entities/ethnicity-type.entity");
const education_level_entity_1 = require("../../entities/education-level.entity");
const marital_status_type_entity_1 = require("../../entities/marital-status-type.entity");
const income_range_entity_1 = require("../../entities/income-range.entity");
const patient_medication_entity_1 = require("../../entities/patient-medication.entity");
const medication_reference_entity_1 = require("../../entities/medication-reference.entity");
const parkinson_phenotype_entity_1 = require("../../entities/parkinson-phenotype.entity");
const dyskinesia_type_entity_1 = require("../../entities/dyskinesia-type.entity");
const hoehn_yahr_scale_entity_1 = require("../../entities/hoehn-yahr-scale.entity");
const surgery_type_entity_1 = require("../../entities/surgery-type.entity");
const updrs3_score_entity_1 = require("../../entities/updrs3-score.entity");
const meem_score_entity_1 = require("../../entities/meem-score.entity");
const udysrs_score_entity_1 = require("../../entities/udysrs-score.entity");
const stopbang_score_entity_1 = require("../../entities/stopbang-score.entity");
const epworth_score_entity_1 = require("../../entities/epworth-score.entity");
const pdss2_score_entity_1 = require("../../entities/pdss2-score.entity");
const rbdsq_score_entity_1 = require("../../entities/rbdsq-score.entity");
const fogq_score_entity_1 = require("../../entities/fogq-score.entity");
const binary_collection_entity_1 = require("../../entities/binary-collection.entity");
const pdf_report_entity_1 = require("../../entities/pdf-report.entity");
const patients_module_1 = require("../patients/patients.module");
let QuestionnairesModule = class QuestionnairesModule {
};
exports.QuestionnairesModule = QuestionnairesModule;
exports.QuestionnairesModule = QuestionnairesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                questionnaire_entity_1.Questionnaire,
                anthropometric_data_entity_1.AnthropometricData,
                clinical_assessment_entity_1.ClinicalAssessment,
                gender_type_entity_1.GenderType,
                ethnicity_type_entity_1.EthnicityType,
                education_level_entity_1.EducationLevel,
                marital_status_type_entity_1.MaritalStatusType,
                income_range_entity_1.IncomeRange,
                patient_medication_entity_1.PatientMedication,
                medication_reference_entity_1.MedicationReference,
                parkinson_phenotype_entity_1.ParkinsonPhenotype,
                dyskinesia_type_entity_1.DyskinesiaType,
                hoehn_yahr_scale_entity_1.HoehnYahrScale,
                surgery_type_entity_1.SurgeryType,
                updrs3_score_entity_1.Updrs3Score,
                meem_score_entity_1.MeemScore,
                udysrs_score_entity_1.UdysrsScore,
                stopbang_score_entity_1.StopbangScore,
                epworth_score_entity_1.EpworthScore,
                pdss2_score_entity_1.Pdss2Score,
                rbdsq_score_entity_1.RbdsqScore,
                fogq_score_entity_1.FogqScore,
                binary_collection_entity_1.BinaryCollection,
                pdf_report_entity_1.PdfReport,
            ]),
            patients_module_1.PatientsModule,
        ],
        controllers: [questionnaires_controller_1.QuestionnairesController],
        providers: [questionnaires_service_1.QuestionnairesService],
        exports: [questionnaires_service_1.QuestionnairesService],
    })
], QuestionnairesModule);
//# sourceMappingURL=questionnaires.module.js.map