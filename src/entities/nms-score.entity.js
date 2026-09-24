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
exports.NmsScore = void 0;
var typeorm_1 = require("typeorm");
var questionnaire_entity_1 = require("./questionnaire.entity");
var NmsScore = /** @class */ (function () {
    function NmsScore() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], NmsScore.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
        __metadata("design:type", String)
    ], NmsScore.prototype, "questionnaire_id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
        __metadata("design:type", Object)
    ], NmsScore.prototype, "data", void 0);
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return questionnaire_entity_1.Questionnaire; }, function (q) { return q.nms_score; }, { onDelete: 'CASCADE' }),
        (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
        __metadata("design:type", questionnaire_entity_1.Questionnaire)
    ], NmsScore.prototype, "questionnaire", void 0);
    NmsScore = __decorate([
        (0, typeorm_1.Entity)('nms_scores')
    ], NmsScore);
    return NmsScore;
}());
exports.NmsScore = NmsScore;
