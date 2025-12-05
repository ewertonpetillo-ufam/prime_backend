import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../src/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await app.init();
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testUser) {
      await userRepository.remove(testUser).catch(() => {
        // Ignorar erros de limpeza
      });
    }
    await app.close();
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('deve retornar token JWT para credenciais válidas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          client_id: 'web_frontend',
          client_secret: process.env.CLIENT_2_SECRET || 'web_frontend_secret_dev_2024',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('token_type', 'Bearer');
          expect(res.body).toHaveProperty('expires_in');
          expect(res.body).toHaveProperty('client_id', 'web_frontend');
        });
    });

    it('deve retornar 401 para credenciais inválidas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          client_id: 'web_frontend',
          client_secret: 'wrong-secret',
        })
        .expect(401);
    });

    it('deve retornar 400 para payload inválido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          client_id: 'invalid_client',
          client_secret: 'secret',
        })
        .expect(400);
    });

    it('deve funcionar com collection_app', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          client_id: 'collection_app',
          client_secret: process.env.CLIENT_1_SECRET || 'collection_app_secret_dev_2024',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.client_id).toBe('collection_app');
        });
    });
  });

  describe('/api/v1/auth/user-login (POST)', () => {
    beforeAll(async () => {
      // Criar usuário de teste
      const passwordHash = await bcrypt.hash('test-password-123', 10);
      testUser = userRepository.create({
        full_name: 'Test User E2E',
        email: 'test-e2e@example.com',
        password_hash: passwordHash,
        role: UserRole.EVALUATOR,
        active: true,
        first_login: false,
      });
      testUser = await userRepository.save(testUser);
    });

    it('deve retornar token JWT para credenciais de usuário válidas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/user-login')
        .send({
          email: 'test-e2e@example.com',
          password: 'test-password-123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test-e2e@example.com');
          authToken = res.body.access_token;
        });
    });

    it('deve retornar 401 para email inválido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/user-login')
        .send({
          email: 'notfound@example.com',
          password: 'test-password-123',
        })
        .expect(401);
    });

    it('deve retornar 401 para senha inválida', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/user-login')
        .send({
          email: 'test-e2e@example.com',
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('deve retornar 401 para usuário inativo', async () => {
      // Desativar usuário
      testUser.active = false;
      await userRepository.save(testUser);

      await request(app.getHttpServer())
        .post('/api/v1/auth/user-login')
        .send({
          email: 'test-e2e@example.com',
          password: 'test-password-123',
        })
        .expect(401);

      // Reativar para outros testes
      testUser.active = true;
      await userRepository.save(testUser);
    });

    it('deve retornar 400 para email inválido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/user-login')
        .send({
          email: 'invalid-email',
          password: 'password',
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/change-password (POST)', () => {
    let userAuthToken: string;

    beforeAll(async () => {
      // Fazer login para obter token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/user-login')
        .send({
          email: 'test-e2e@example.com',
          password: 'test-password-123',
        });

      userAuthToken = loginResponse.body.access_token;
    });

    it('deve alterar senha com sucesso', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${userAuthToken}`)
        .send({
          currentPassword: 'test-password-123',
          newPassword: 'new-password-456',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message', 'Password changed successfully');
        });
    });

    it('deve retornar 401 para senha atual incorreta', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${userAuthToken}`)
        .send({
          currentPassword: 'wrong-password',
          newPassword: 'new-password-789',
        })
        .expect(401);
    });

    it('deve retornar 401 sem token de autenticação', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .send({
          currentPassword: 'test-password-123',
          newPassword: 'new-password-789',
        })
        .expect(401);
    });

    afterAll(async () => {
      // Restaurar senha original para outros testes
      const passwordHash = await bcrypt.hash('test-password-123', 10);
      testUser.password_hash = passwordHash;
      await userRepository.save(testUser);
    });
  });
});

