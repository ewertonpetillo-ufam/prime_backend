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
exports.RbdsqBrScore = void 0;
var typeorm_1 = require("typeorm");
var questionnaire_entity_1 = require("./questionnaire.entity");
var RbdsqBrScore = /** @class */ (function () {
    function RbdsqBrScore() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], RbdsqBrScore.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
        __metadata("design:type", String)
    ], RbdsqBrScore.prototype, "questionnaire_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q1_realistic_dreams", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q2_aggressive_dreams", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q3_dream_enactment", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q4_limb_movements", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q5_injury_potential", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q6_1_vocalizations", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q6_2_fighting_movements", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q6_3_complex_movements_or_falls", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q6_4_objects_falling", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q7_movements_cause_awakenings", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q8_dream_recall", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q9_disturbed_sleep", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], RbdsqBrScore.prototype, "q10_neurological_disease", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
        __metadata("design:type", String)
    ], RbdsqBrScore.prototype, "neuro_disease_description", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], RbdsqBrScore.prototype, "total_score", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return questionnaire_entity_1.Questionnaire; }, function (q) { return q.rbdsq_br_score; }, { onDelete: 'CASCADE' }),
        (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
        __metadata("design:type", questionnaire_entity_1.Questionnaire)
    ], RbdsqBrScore.prototype, "questionnaire", void 0);
    RbdsqBrScore = __decorate([
        (0, typeorm_1.Entity)('rbdsq_br_scores')
    ], RbdsqBrScore);
    return RbdsqBrScore;
}());
exports.RbdsqBrScore = RbdsqBrScore;
