import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    // Check if registration_number already exists (if provided)
    if (createUserDto.registration_number) {
      const existing = await this.usersRepository.findOne({
        where: { registration_number: createUserDto.registration_number },
      });

      if (existing) {
        throw new ConflictException('Registration number already registered');
      }
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      role: createUserDto.role || UserRole.EVALUATOR,
      active: createUserDto.active !== undefined ? createUserDto.active : true,
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

    // Check if registration_number is being changed and if it's already in use
    if (
      updateUserDto.registration_number &&
      updateUserDto.registration_number !== user.registration_number
    ) {
      const existing = await this.usersRepository.findOne({
        where: { registration_number: updateUserDto.registration_number },
      });

      if (existing) {
        throw new ConflictException('Registration number already registered');
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
}

