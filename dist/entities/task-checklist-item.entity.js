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
exports.TaskChecklistItem = void 0;
const typeorm_1 = require("typeorm");
const active_task_definition_entity_1 = require("./active-task-definition.entity");
let TaskChecklistItem = class TaskChecklistItem {
};
exports.TaskChecklistItem = TaskChecklistItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TaskChecklistItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TaskChecklistItem.prototype, "task_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TaskChecklistItem.prototype, "item_order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], TaskChecklistItem.prototype, "item_description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => active_task_definition_entity_1.ActiveTaskDefinition, (task) => task.checklist_items, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", active_task_definition_entity_1.ActiveTaskDefinition)
], TaskChecklistItem.prototype, "task", void 0);
exports.TaskChecklistItem = TaskChecklistItem = __decorate([
    (0, typeorm_1.Entity)('task_checklist_items'),
    (0, typeorm_1.Index)(['task_id', 'item_order'], { unique: true })
], TaskChecklistItem);
//# sourceMappingURL=task-checklist-item.entity.js.map