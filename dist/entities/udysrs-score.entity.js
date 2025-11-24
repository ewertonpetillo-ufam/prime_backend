"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UdysrsScore = void 0;
const typeorm_1 = require("typeorm");
const questionnaire_entity_1 = require("./questionnaire.entity");
let UdysrsScore = class UdysrsScore {
};
exports.UdysrsScore = UdysrsScore;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UdysrsScore.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], UdysrsScore.prototype, "questionnaire_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "on_dyskinesia_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_speech", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_chewing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_eating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_dressing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_hygiene", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_writing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_hobbies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_walking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_social", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "impact_emotional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "off_dystonia_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "dystonia_activities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "dystonia_pain_impact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "dystonia_pain_severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "severity_face", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "severity_neck", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "severity_right_arm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "severity_left_arm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "severity_trunk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "severity_right_leg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "severity_left_leg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "disability_communication", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "disability_drinking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "disability_dressing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "disability_walking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "historical_subscore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "objective_subscore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], UdysrsScore.prototype, "total_score", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => questionnaire_entity_1.Questionnaire, (q) => q.udysrs_score, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
    __metadata("design:type", questionnaire_entity_1.Questionnaire)
], UdysrsScore.prototype, "questionnaire", void 0);
exports.UdysrsScore = UdysrsScore = __decorate([
    (0, typeorm_1.Entity)('udysrs_scores')
], UdysrsScore);
//# sourceMappingURL=udysrs-score.entity.js.map