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
exports.ActiveTaskDefinition = exports.TaskCategory = void 0;
var typeorm_1 = require("typeorm");
var swagger_1 = require("@nestjs/swagger");
var patient_task_collection_entity_1 = require("./patient-task-collection.entity");
var task_checklist_item_entity_1 = require("./task-checklist-item.entity");
var TaskCategory;
(function (TaskCategory) {
    TaskCategory["MOTOR"] = "MOTOR";
    TaskCategory["SPEECH"] = "SPEECH";
    TaskCategory["GAIT"] = "GAIT";
    TaskCategory["OTHER"] = "OTHER";
})(TaskCategory || (exports.TaskCategory = TaskCategory = {}));
var ActiveTaskDefinition = /** @class */ (function () {
    function ActiveTaskDefinition() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Task ID', example: 1, type: Number }),
        (0, typeorm_1.PrimaryGeneratedColumn)(),
        __metadata("design:type", Number)
    ], ActiveTaskDefinition.prototype, "id", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Unique task code identifier', example: 'TA1', maxLength: 20 }),
        (0, typeorm_1.Column)({ type: 'varchar', length: 20, unique: true }),
        __metadata("design:type", String)
    ], ActiveTaskDefinition.prototype, "task_code", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Task name', example: 'Mãos em repouso', maxLength: 255 }),
        (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
        __metadata("design:type", String)
    ], ActiveTaskDefinition.prototype, "task_name", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Task category', enum: TaskCategory, example: TaskCategory.MOTOR }),
        (0, typeorm_1.Column)({
            type: 'varchar',
            length: 50,
            nullable: true,
        }),
        __metadata("design:type", String)
    ], ActiveTaskDefinition.prototype, "task_category", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Collection form type ID', example: 1, type: Number }),
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], ActiveTaskDefinition.prototype, "collection_form_type_id", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({
            description: 'Group number (1-5)',
            example: 1,
            type: Number,
            minimum: 1,
            maximum: 5,
        }),
        (0, typeorm_1.Column)({ name: 'group', type: 'int', nullable: true }),
        __metadata("design:type", Number)
    ], ActiveTaskDefinition.prototype, "group", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Task description', example: 'Avaliação de tremor de repouso nas mãos...' }),
        (0, typeorm_1.Column)({ type: 'text', nullable: true }),
        __metadata("design:type", String)
    ], ActiveTaskDefinition.prototype, "description", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Task instructions for the patient', example: 'Posicione-se sentado confortavelmente...' }),
        (0, typeorm_1.Column)({ type: 'text', nullable: true }),
        __metadata("design:type", String)
    ], ActiveTaskDefinition.prototype, "instructions", void 0);
    __decorate([
        (0, swagger_1.ApiPropertyOptional)({ description: 'Active status', example: true, default: true, type: Boolean }),
        (0, typeorm_1.Column)({ type: 'boolean', default: true }),
        __metadata("design:type", Boolean)
    ], ActiveTaskDefinition.prototype, "active", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return patient_task_collection_entity_1.PatientTaskCollection; }, function (task) { return task.active_task; }),
        __metadata("design:type", Array)
    ], ActiveTaskDefinition.prototype, "patient_tasks", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return task_checklist_item_entity_1.TaskChecklistItem; }, function (item) { return item.task; }, { cascade: true }),
        __metadata("design:type", Array)
    ], ActiveTaskDefinition.prototype, "checklist_items", void 0);
    ActiveTaskDefinition = __decorate([
        (0, typeorm_1.Entity)('active_task_definitions')
    ], ActiveTaskDefinition);
    return ActiveTaskDefinition;
}());
exports.ActiveTaskDefinition = ActiveTaskDefinition;
