# PRIME Backend API

Backend REST API para o sistema PRIME (Parkinson's Disease Clinical Assessment System).

## 🚀 Tecnologias

- **Framework**: NestJS 10
- **Linguagem**: TypeScript
- **ORM**: TypeORM
- **Banco de Dados**: PostgreSQL 16
- **Autenticação**: JWT com credenciais de cliente
- **Documentação**: Swagger/OpenAPI
- **Validação**: class-validator
- **Containerização**: Docker

## 📋 Funcionalidades Principais

### Autenticação JWT
- Dois clientes pré-configurados:
  - `collection_app`: Para aplicativo mobile de coleta de dados
  - `web_frontend`: Para interface web do formulário

### Módulos Implementados

#### 1. **Evaluators** (`/api/v1/evaluators`)
- CRUD completo para profissionais avaliadores
- Gestão de especialidades e registros profissionais

#### 2. **Patients** (`/api/v1/patients`)
- CRUD de pacientes
- **Anonimização de CPF com HMAC-SHA256**
- Busca por CPF hasheado
- Dados demográficos completos

#### 3. **Binary Collections** (`/api/v1/binary-collections`)
- **Upload de arquivos CSV do app de coleta**
- Recebe: CPF (texto plano), ID da tarefa, arquivo CSV
- Processa: Hash do CPF, busca paciente, armazena binário
- Endpoint: `POST /api/v1/binary-collections/upload`

## 🛠️ Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Application
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1

# Database
DB_HOST=prime-postgres
DB_PORT=5432
DB_USERNAME=prime_admin
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_DATABASE=prime_db

# JWT Authentication
JWT_SECRET=YOUR_JWT_SECRET_KEY_32_CHARS_MIN
JWT_EXPIRATION=24h

# Client Credentials
CLIENT_1_ID=collection_app
CLIENT_1_SECRET=YOUR_CLIENT_1_SECRET

CLIENT_2_ID=web_frontend
CLIENT_2_SECRET=YOUR_CLIENT_2_SECRET

# HMAC for CPF Anonymization
HMAC_SECRET=YOUR_HMAC_SECRET_KEY

# Swagger
SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=admin123

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🐳 Instalação e Execução

### Opção 1: Docker (Recomendado)

1. Navegue até a pasta database e execute:

```bash
cd database
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Backend NestJS na porta 4000

### Opção 2: Desenvolvimento Local

1. Instale as dependências:

```bash
npm install --legacy-peer-deps
```

2. Inicie o PostgreSQL:

```bash
cd ../database
docker-compose up -d postgres
```

3. Execute em modo desenvolvimento:

```bash
npm run start:dev
```

4. Build para produção:

```bash
npm run build
npm run start:prod
```

## 📚 Documentação da API

Acesse a documentação Swagger em:

```
http://localhost:4000/api/docs
```

**Credenciais padrão do Swagger**:
- Username: `admin`
- Password: `admin123`

## 🔐 Autenticação

### 1. Obter Token JWT

**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "client_id": "web_frontend",
  "client_secret": "web_frontend_secret_dev_2024"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "client_id": "web_frontend"
}
```

### 2. Usar o Token

Adicione o token no header de todas as requisições:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Exemplos de Uso

### Criar Paciente

```bash
curl -X POST http://localhost:4000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678900",
    "full_name": "Maria Santos",
    "date_of_birth": "1950-05-15",
    "gender_id": 1,
    "city": "São Paulo",
    "state": "SP"
  }'
```

### Upload de CSV (App de Coleta)

```bash
curl -X POST http://localhost:4000/api/v1/binary-collections/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "patient_cpf=12345678900" \
  -F "active_task_id=1" \
  -F "file=@sensor_data.csv"
```

### Buscar Paciente por CPF

```bash
curl -X GET "http://localhost:4000/api/v1/patients/by-cpf?cpf=12345678900" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 Segurança

### Anonimização de CPF

O sistema implementa anonimização do CPF usando HMAC-SHA256:

1. **Criação de Paciente**: CPF é recebido em texto plano, hasheado e armazenado
2. **Busca por CPF**: CPF é hasheado antes da busca no banco
3. **Upload de CSV**: CPF do app móvel é hasheado para encontrar o paciente

Função de hash: `encode(hmac(cpf, secret, 'sha256'), 'hex')`

### Proteção de Rotas

- Todas as rotas são protegidas por JWT Guard global
- Exceção: `/api/v1/auth/login` (marcada como pública)
- Client IDs validados: `collection_app` e `web_frontend`

## 🗄️ Estrutura do Banco de Dados

O backend conecta-se a um banco PostgreSQL existente com 44 tabelas:

- **Core**: evaluators, patients, questionnaires
- **Clinical**: anthropometric_data, clinical_assessments, patient_medications
- **Scales**: updrs_part3_scores, meem_scores, udysrs_scores, etc.
- **Tasks**: active_task_definitions, patient_task_collections
- **Binary**: binary_collections (armazena CSVs como BYTEA)
- **Reference**: 10+ tabelas de referência (gender_types, ethnicity_types, etc.)

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload
npm run start:dev

# Build para produção
npm run build

# Executar em produção
npm run start:prod

# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Lint
npm run lint

# Format
npm run format
```

## 📦 Estrutura do Projeto

```
backend/
├── src/
│   ├── common/                 # Shared resources
│   │   ├── decorators/        # Custom decorators
│   │   ├── filters/           # Exception filters
│   │   └── guards/            # Auth guards
│   ├── config/                # Configuration files
│   ├── entities/              # TypeORM entities
│   ├── modules/
│   │   ├── auth/              # JWT authentication
│   │   ├── evaluators/        # Evaluators CRUD
│   │   ├── patients/          # Patients with HMAC
│   │   └── binary-collections/ # CSV upload
│   ├── utils/                 # Utility functions
│   ├── app.module.ts
│   └── main.ts
├── .env                       # Environment variables
├── .env.example              # Environment template
├── Dockerfile                # Docker build config
└── package.json
```

## 🚧 Próximos Passos

Módulos a serem implementados:

- Questionnaires (relacionamento central)
- Clinical Assessments
- Neurological Scales (UPDRS-III, MEEM, UDysRS, etc.)
- PDF Reports
- Search & Summary endpoints
- Reference data endpoints

## 📞 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/login` | Autenticação |
| GET/POST/PATCH/DELETE | `/api/v1/evaluators` | CRUD Avaliadores |
| GET/POST/PATCH/DELETE | `/api/v1/patients` | CRUD Pacientes |
| GET | `/api/v1/patients/by-cpf?cpf=...` | Buscar por CPF |
| POST | `/api/v1/binary-collections/upload` | Upload CSV |
| GET/DELETE | `/api/v1/binary-collections` | Gerenciar binários |

## 📄 Licença

Este projeto é parte do sistema PRIME para avaliação clínica de pacientes com Doença de Parkinson.

## 🤝 Contribuindo

1. Siga os padrões de código do NestJS
2. Use class-validator para todos os DTOs
3. Documente endpoints com decoradores Swagger
4. Mantenha os tests atualizados

---

**Desenvolvido com NestJS 🐱**
