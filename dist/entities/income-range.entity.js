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
exports.IncomeRange = void 0;
const typeorm_1 = require("typeorm");
let IncomeRange = class IncomeRange {
};
exports.IncomeRange = IncomeRange;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], IncomeRange.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, unique: true }),
    __metadata("design:type", String)
], IncomeRange.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], IncomeRange.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], IncomeRange.prototype, "min_salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], IncomeRange.prototype, "max_salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], IncomeRange.prototype, "active", void 0);
exports.IncomeRange = IncomeRange = __decorate([
    (0, typeorm_1.Entity)('income_ranges')
], IncomeRange);
//# sourceMappingURL=income-range.entity.js.map