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
exports.NmfScore = void 0;
const typeorm_1 = require("typeorm");
const questionnaire_entity_1 = require("./questionnaire.entity");
let NmfScore = class NmfScore {
};
exports.NmfScore = NmfScore;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NmfScore.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], NmfScore.prototype, "questionnaire_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], NmfScore.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => questionnaire_entity_1.Questionnaire, (q) => q.nmf_score, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
    __metadata("design:type", questionnaire_entity_1.Questionnaire)
], NmfScore.prototype, "questionnaire", void 0);
exports.NmfScore = NmfScore = __decorate([
    (0, typeorm_1.Entity)('nmf_scores')
], NmfScore);
//# sourceMappingURL=nmf-score.entity.js.map