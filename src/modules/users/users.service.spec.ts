import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const repositoryToken = getRepositoryToken(User);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: repositoryToken,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(repositoryToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      full_name: 'João Silva',
      email: 'joao@example.com',
      role: UserRole.EVALUATOR,
    };

    it('deve criar usuário com sucesso', async () => {
      const hashedPassword = await bcrypt.hash('Prime2025', 10);
      const savedUser: User = {
        id: 'user-id',
        full_name: createUserDto.full_name,
        email: createUserDto.email,
        role: createUserDto.role || UserRole.EVALUATOR,
        password_hash: hashedPassword,
        active: true,
        first_login: true,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(savedUser);
      expect(result.first_login).toBe(true);
      expect(result.active).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('deve lançar ConflictException para email duplicado', async () => {
      const existingUser = {
        id: 'existing-id',
        email: createUserDto.email,
      };

      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('deve usar senha padrão se não fornecida', async () => {
      const hashedPassword = await bcrypt.hash('Prime2025', 10);
      const savedUser: User = {
        id: 'user-id',
        full_name: createUserDto.full_name,
        email: createUserDto.email,
        role: createUserDto.role || UserRole.EVALUATOR,
        password_hash: hashedPassword,
        active: true,
        first_login: true,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(result.password_hash).toBeDefined();
      expect(result.password_hash).not.toBe('Prime2025'); // Deve estar hasheado
    });

    it('deve usar senha fornecida se disponível', async () => {
      const customPassword = await bcrypt.hash('CustomPass123', 10);
      const dtoWithPassword = {
        ...createUserDto,
        password_hash: customPassword,
      };

      const savedUser: User = {
        id: 'user-id',
        full_name: createUserDto.full_name,
        email: createUserDto.email,
        role: createUserDto.role || UserRole.EVALUATOR,
        password_hash: customPassword,
        active: true,
        first_login: true,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(dtoWithPassword);

      expect(result.password_hash).toBe(customPassword);
    });

    it('deve usar role padrão se não fornecida', async () => {
      const dtoWithoutRole = {
        full_name: 'João Silva',
        email: 'joao2@example.com',
      };

      const hashedPassword = await bcrypt.hash('Prime2025', 10);
      const savedUser: User = {
        id: 'user-id',
        ...dtoWithoutRole,
        password_hash: hashedPassword,
        role: UserRole.EVALUATOR,
        active: true,
        first_login: true,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(dtoWithoutRole);

      expect(result.role).toBe(UserRole.EVALUATOR);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      const users = [
        { id: '1', full_name: 'João Silva', email: 'joao@example.com' },
        { id: '2', full_name: 'Maria Santos', email: 'maria@example.com' },
      ];

      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { full_name: 'ASC' },
      });
    });

    it('deve filtrar por role quando fornecido', async () => {
      const evaluators = [
        { id: '1', full_name: 'João Silva', role: UserRole.EVALUATOR },
      ];

      mockRepository.find.mockResolvedValue(evaluators);

      const result = await service.findAll(UserRole.EVALUATOR);

      expect(result).toEqual(evaluators);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.EVALUATOR },
        order: { full_name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar usuário por ID', async () => {
      const user: User = {
        id: 'user-id',
        full_name: 'João Silva',
        email: 'joao@example.com',
        password_hash: 'hash',
        role: UserRole.EVALUATOR,
        active: true,
        first_login: false,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('user-id');

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
    });

    it('deve lançar NotFoundException para usuário não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'User with ID invalid-id not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário por email', async () => {
      const user: User = {
        id: 'user-id',
        full_name: 'João Silva',
        email: 'joao@example.com',
        password_hash: 'hash',
        role: UserRole.EVALUATOR,
        active: true,
        first_login: false,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('joao@example.com');

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'joao@example.com' },
      });
    });

    it('deve retornar null se email não encontrado', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    let existingUser: User;
    
    beforeEach(() => {
      existingUser = {
        id: 'user-id',
        full_name: 'João Silva',
        email: 'joao@example.com',
        password_hash: 'hash',
        role: UserRole.EVALUATOR,
        active: true,
        first_login: false,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };
    });

    it('deve atualizar usuário com sucesso', async () => {
      const updateDto: UpdateUserDto = {
        full_name: 'João Silva Santos',
      };

      const updatedUser = { ...existingUser, ...updateDto };

      // service.update chama:
      // 1. this.findOne(id) -> que chama this.usersRepository.findOne({ where: { id } })
      // 2. this.usersRepository.findOne({ where: { email } }) para verificar email (se email mudou)
      // Como não há email no updateDto, a segunda chamada não acontece
      mockRepository.findOne.mockResolvedValueOnce(existingUser); // Para findOne(id)
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('user-id', updateDto);

      expect(result).toEqual(updatedUser);
      expect(result.full_name).toBe('João Silva Santos');
    });

    it('deve lançar ConflictException para email duplicado', async () => {
      const updateDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      const existingUserWithNewEmail = {
        id: 'other-id',
        email: 'newemail@example.com',
      };

      // service.update chama:
      // 1. this.findOne(id) -> que chama this.usersRepository.findOne({ where: { id } })
      // 2. this.usersRepository.findOne({ where: { email } }) para verificar email duplicado
      mockRepository.findOne
        .mockResolvedValueOnce(existingUser) // Para findOne(id) no método update
        .mockResolvedValueOnce(existingUserWithNewEmail); // Para verificação de email

      await expect(service.update('user-id', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve permitir atualizar para o mesmo email', async () => {
      const updateDto: UpdateUserDto = {
        email: 'joao@example.com', // Mesmo email
        full_name: 'João Silva Santos',
      };

      const updatedUser = { ...existingUser, ...updateDto };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('user-id', updateDto);

      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('deve remover usuário com sucesso', async () => {
      const user: User = {
        id: 'user-id',
        full_name: 'João Silva',
        email: 'joao@example.com',
        password_hash: 'hash',
        role: UserRole.EVALUATOR,
        active: true,
        first_login: false,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      mockRepository.findOne.mockResolvedValueOnce(user);
      mockRepository.remove.mockResolvedValueOnce(user);

      await service.remove('user-id');

      // service.remove chama this.findOne(id) que chama this.usersRepository.findOne
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      // service.remove então chama this.usersRepository.remove(user)
      expect(mockRepository.remove).toHaveBeenCalledWith(user);
    });
  });

  describe('findByRole', () => {
    it('deve retornar usuários por role', async () => {
      const evaluators = [
        {
          id: '1',
          full_name: 'João Silva',
          role: UserRole.EVALUATOR,
        },
      ];

      mockRepository.find.mockResolvedValue(evaluators);

      const result = await service.findByRole(UserRole.EVALUATOR);

      expect(result).toEqual(evaluators);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.EVALUATOR },
        order: { full_name: 'ASC' },
      });
    });
  });

  describe('updatePassword', () => {
    it('deve atualizar senha com sucesso', async () => {
      const user: User = {
        id: 'user-id',
        full_name: 'João Silva',
        email: 'joao@example.com',
        password_hash: 'old-hash',
        role: UserRole.EVALUATOR,
        active: true,
        first_login: true,
        registration_number: null,
        specialty: null,
        phone: null,
        created_at: new Date(),
        updated_at: new Date(),
        questionnaires: [],
      };

      const newPasswordHash = await bcrypt.hash('new-password', 10);
      const updatedUser = {
        ...user,
        password_hash: newPasswordHash,
        first_login: false,
      };

      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updatePassword(
        'user-id',
        newPasswordHash,
        false,
      );

      expect(result.password_hash).toBe(newPasswordHash);
      expect(result.first_login).toBe(false);
    });
  });
});

