import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    if (createUserDto.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    // Generate default password hash if not provided
    let passwordHash = createUserDto.password_hash;
    if (!passwordHash) {
      const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD');
      if (!defaultPassword) {
        throw new Error('DEFAULT_USER_PASSWORD não configurada. Configure a variável de ambiente.');
      }
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      password_hash: passwordHash,
      role: createUserDto.role || UserRole.EVALUATOR,
      active: createUserDto.active !== undefined ? createUserDto.active : true,
      first_login: true, // New users must change password on first login
    });
    return this.usersRepository.save(user);
  }

  async findAll(role?: UserRole): Promise<User[]> {
    const where = role ? { role } : {};
    return this.usersRepository.find({
      where,
      order: { full_name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it's already in use
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role },
      order: { full_name: 'ASC' },
    });
  }

  async updatePassword(id: string, passwordHash: string, firstLogin: boolean = false): Promise<User> {
    const user = await this.findOne(id);
    user.password_hash = passwordHash;
    user.first_login = firstLogin;
    return this.usersRepository.save(user);
  }

  async resetPassword(id: string): Promise<User> {
    const user = await this.findOne(id);
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD');
    if (!defaultPassword) {
      throw new Error('DEFAULT_USER_PASSWORD não configurada. Configure a variável de ambiente.');
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
    user.password_hash = passwordHash;
    user.first_login = true; // Force password change on next login
    return this.usersRepository.save(user);
  }
}

