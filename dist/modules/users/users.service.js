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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto) {
        if (createUserDto.email) {
            const existing = await this.usersRepository.findOne({
                where: { email: createUserDto.email },
            });
            if (existing) {
                throw new common_1.ConflictException('Email already registered');
            }
        }
        let passwordHash = createUserDto.password_hash;
        if (!passwordHash) {
            const defaultPassword = 'Prime2025';
            const saltRounds = 10;
            passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
        }
        const user = this.usersRepository.create({
            ...createUserDto,
            password_hash: passwordHash,
            role: createUserDto.role || user_entity_1.UserRole.EVALUATOR,
            active: createUserDto.active !== undefined ? createUserDto.active : true,
            first_login: true,
        });
        return this.usersRepository.save(user);
    }
    async findAll(role) {
        const where = role ? { role } : {};
        return this.usersRepository.find({
            where,
            order: { full_name: 'ASC' },
        });
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email },
        });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existing = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existing) {
                throw new common_1.ConflictException('Email already registered');
            }
        }
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }
    async findByRole(role) {
        return this.usersRepository.find({
            where: { role },
            order: { full_name: 'ASC' },
        });
    }
    async updatePassword(id, passwordHash, firstLogin = false) {
        const user = await this.findOne(id);
        user.password_hash = passwordHash;
        user.first_login = firstLogin;
        return this.usersRepository.save(user);
    }
    async resetPassword(id) {
        const user = await this.findOne(id);
        const defaultPassword = 'Prime2025';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
        user.password_hash = passwordHash;
        user.first_login = true;
        return this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map