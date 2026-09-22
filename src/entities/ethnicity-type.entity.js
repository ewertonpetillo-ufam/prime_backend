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
exports.EthnicityType = void 0;
var typeorm_1 = require("typeorm");
var EthnicityType = /** @class */ (function () {
    function EthnicityType() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)(),
        __metadata("design:type", Number)
    ], EthnicityType.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 20, unique: true }),
        __metadata("design:type", String)
    ], EthnicityType.prototype, "code", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
        __metadata("design:type", String)
    ], EthnicityType.prototype, "description", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: true }),
        __metadata("design:type", Boolean)
    ], EthnicityType.prototype, "active", void 0);
    EthnicityType = __decorate([
        (0, typeorm_1.Entity)('ethnicity_types')
    ], EthnicityType);
    return EthnicityType;
}());
exports.EthnicityType = EthnicityType;
