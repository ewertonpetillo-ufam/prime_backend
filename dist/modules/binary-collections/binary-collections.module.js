"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryCollectionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const binary_collections_service_1 = require("./binary-collections.service");
const binary_collections_controller_1 = require("./binary-collections.controller");
const binary_collection_entity_1 = require("../../entities/binary-collection.entity");
const patient_entity_1 = require("../../entities/patient.entity");
const active_task_definition_entity_1 = require("../../entities/active-task-definition.entity");
let BinaryCollectionsModule = class BinaryCollectionsModule {
};
exports.BinaryCollectionsModule = BinaryCollectionsModule;
exports.BinaryCollectionsModule = BinaryCollectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([binary_collection_entity_1.BinaryCollection, patient_entity_1.Patient, active_task_definition_entity_1.ActiveTaskDefinition])],
        controllers: [binary_collections_controller_1.BinaryCollectionsController],
        providers: [binary_collections_service_1.BinaryCollectionsService],
        exports: [binary_collections_service_1.BinaryCollectionsService],
    })
], BinaryCollectionsModule);
//# sourceMappingURL=binary-collections.module.js.map