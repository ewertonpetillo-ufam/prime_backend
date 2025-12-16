"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmModule = void 0;
exports.InjectRepository = InjectRepository;
exports.getRepositoryToken = getRepositoryToken;
require("reflect-metadata");
const common_1 = require("@nestjs/common");
function getRepositoryToken(entity) {
    if (typeof entity === 'string') {
        return entity;
    }
    return `${entity.name}Repository`;
}
function InjectRepository(entity) {
    const token = getRepositoryToken(entity);
    return (0, common_1.Inject)(token);
}
exports.TypeOrmModule = {
    forRoot: jest.fn(),
    forRootAsync: jest.fn(),
    forFeature: jest.fn(),
};
//# sourceMappingURL=typeorm.js.map