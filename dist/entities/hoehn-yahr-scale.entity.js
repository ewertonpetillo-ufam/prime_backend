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
exports.HoehnYahrScale = void 0;
const typeorm_1 = require("typeorm");
let HoehnYahrScale = class HoehnYahrScale {
};
exports.HoehnYahrScale = HoehnYahrScale;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HoehnYahrScale.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 2, scale: 1, unique: true }),
    __metadata("design:type", Number)
], HoehnYahrScale.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], HoehnYahrScale.prototype, "description", void 0);
exports.HoehnYahrScale = HoehnYahrScale = __decorate([
    (0, typeorm_1.Entity)('hoehn_yahr_scale')
], HoehnYahrScale);
//# sourceMappingURL=hoehn-yahr-scale.entity.js.map