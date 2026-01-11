# CLAUDE.md - AI Assistant Development Guide

This document provides comprehensive guidance for AI assistants (like Claude) working on the `api_dude_images_generator` codebase. It covers architecture, conventions, workflows, and best practices specific to this project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Stack](#architecture--stack)
3. [Project Structure](#project-structure)
4. [Development Setup](#development-setup)
5. [Key Conventions](#key-conventions)
6. [Database & Prisma](#database--prisma)
7. [API Structure](#api-structure)
8. [Testing](#testing)
9. [Common Development Tasks](#common-development-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**api_dude_images_generator** is a NestJS-based API service for managing generated images. The application provides REST endpoints for creating, retrieving, and deleting images with metadata (prompt, aspect ratio, etc.).

**Key Characteristics:**
- TypeScript-based NestJS v11 application
- PostgreSQL database with Prisma ORM v7
- RESTful API with Swagger documentation
- Structured logging with Pino
- Docker-based local development environment
- URI-based API versioning

---

## Architecture & Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 11.0.1 | Progressive Node.js framework |
| **TypeScript** | 5.7.3 | Type-safe language |
| **Prisma** | 7.2.0 | Modern ORM for PostgreSQL |
| **PostgreSQL** | 16 (Alpine) | Relational database |
| **Pino** | via nestjs-pino 4.5.0 | Structured logging |
| **Swagger** | 11.2.3 | API documentation |
| **Jest** | 30.0.0 | Testing framework |

### Key Dependencies

**Production:**
- `@nestjs/config` - Environment-based configuration
- `@nestjs/swagger` - OpenAPI/Swagger integration
- `class-validator` & `class-transformer` - DTO validation
- `nestjs-pino` & `pino-pretty` - Logging
- `@prisma/client` & `@prisma/adapter-pg` - Database access

**Development:**
- `@nestjs/cli` - CLI tools
- `eslint` & `prettier` - Code quality
- `ts-jest` & `supertest` - Testing

---

## Project Structure

```
api_dude_images_generator/
├── src/                                # Application source code
│   ├── main.ts                        # Application entry point (bootstrap)
│   ├── app.module.ts                  # Root module (imports all feature modules)
│   ├── app.controller.ts              # Root controller (health check)
│   ├── app.service.ts                 # Root service
│   │
│   ├── images/                        # Images feature module
│   │   ├── images.module.ts          # Images module definition
│   │   ├── images.controller.ts      # HTTP endpoints for images
│   │   ├── images.service.ts         # Business logic for images
│   │   └── dto/                      # Data Transfer Objects
│   │       └── create-image.dto.ts   # DTO for creating images
│   │
│   └── prisma/                        # Database service module
│       ├── prisma.module.ts          # Global Prisma module
│       └── prisma.service.ts         # PrismaClient wrapper
│
├── prisma/                            # Database configuration
│   ├── schema.prisma                 # Prisma data model
│   └── migrations/                   # Database migration history
│       ├── 20260104163710_init/
│       └── 20260104170818_update_image_model/
│
├── test/                              # End-to-end tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── dist/                              # Compiled JavaScript output (gitignored)
├── node_modules/                      # Dependencies (gitignored)
│
├── Configuration Files
│   ├── package.json                  # Dependencies, scripts, Jest config
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tsconfig.build.json           # Build-specific TS config
│   ├── nest-cli.json                 # NestJS CLI settings
│   ├── eslint.config.mjs             # ESLint rules
│   ├── .prettierrc                   # Prettier formatting
│   ├── docker-compose.yml            # PostgreSQL development setup
│   └── .env                          # Environment variables (gitignored)
│
└── README.md                          # Project documentation
```

### Key File Locations

| File Pattern | Purpose | Example |
|--------------|---------|---------|
| `src/**/*.module.ts` | NestJS modules | `src/images/images.module.ts` |
| `src/**/*.controller.ts` | HTTP controllers | `src/images/images.controller.ts` |
| `src/**/*.service.ts` | Business logic services | `src/images/images.service.ts` |
| `src/**/dto/*.dto.ts` | Request/response DTOs | `src/images/dto/create-image.dto.ts` |
| `src/**/*.spec.ts` | Unit tests | `src/app.controller.spec.ts` |
| `test/**/*.e2e-spec.ts` | E2E tests | `test/app.e2e-spec.ts` |

---

## Development Setup

### Prerequisites

- Node.js 22+ (as specified in package.json)
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL database
docker-compose up -d

# 3. Set up environment variables
# Create .env file with:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dude_images"
NODE_ENV="development"
PORT=3000

# 4. Run Prisma migrations
npx prisma migrate deploy

# 5. Generate Prisma Client
npx prisma generate

# 6. Start development server
npm run start:dev
```

### Development Commands

```bash
# Development
npm run start:dev          # Watch mode with hot reload
npm run start:debug        # Debug mode with inspector
npm run start:prod         # Production mode

# Build
npm run build              # Compile TypeScript to dist/

# Code Quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting

# Testing
npm test                   # Run unit tests
npm run test:watch         # Watch mode for tests
npm run test:e2e           # Run E2E tests
npm run test:cov           # Generate coverage report

# Database
npx prisma studio          # Open Prisma Studio (DB GUI)
npx prisma migrate dev     # Create new migration
npx prisma generate        # Regenerate Prisma Client
```

### Accessing the Application

- **API Base URL:** `http://localhost:3000/api/v1`
- **Swagger Documentation:** `http://localhost:3000/api`
- **Health Check:** `http://localhost:3000/` (returns "Hello World!")

---

## Key Conventions

### Module Architecture

The application follows **NestJS modular architecture**:

1. **AppModule** (root module at `src/app.module.ts`)
   - Imports `ConfigModule.forRoot()` - Global environment config
   - Imports `LoggerModule.forRoot()` - Pino logging setup
   - Imports `PrismaModule` - Global database access
   - Imports `ImagesModule` - Images feature

2. **Feature Modules** (e.g., `ImagesModule`)
   - Self-contained with controller, service, and DTOs
   - Import dependencies as needed
   - Export services if needed by other modules

3. **Global Modules** (e.g., `PrismaModule`)
   - Decorated with `@Global()`
   - Available to all modules without explicit import

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| **Modules** | `{feature}.module.ts` | `images.module.ts` |
| **Controllers** | `{feature}.controller.ts` | `images.controller.ts` |
| **Services** | `{feature}.service.ts` | `images.service.ts` |
| **DTOs** | `{action}-{entity}.dto.ts` | `create-image.dto.ts` |
| **Unit Tests** | `{file}.spec.ts` | `images.service.spec.ts` |
| **E2E Tests** | `{file}.e2e-spec.ts` | `app.e2e-spec.ts` |

### Code Style

The project uses **ESLint** and **Prettier** with the following configuration:

```javascript
// Key style rules (from .prettierrc)
{
  "singleQuote": true,        // Use single quotes
  "trailingComma": "all",     // Trailing commas in multi-line
  "semi": true,               // Semicolons required
  "printWidth": 80,           // Line width
  "tabWidth": 2               // 2-space indentation
}
```

**Important Style Guidelines:**
- Always use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Use semicolons at end of statements
- Prefer `async/await` over Promises
- Use TypeScript strict mode features
- Avoid `any` types (use proper typing)

### Dependency Injection

NestJS uses constructor-based dependency injection:

```typescript
@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}
  // 'private' automatically creates a class property
}
```

**Important:**
- Always inject services via constructor
- Use `private` or `private readonly` for injected dependencies
- Mark injectable classes with `@Injectable()` decorator

### Error Handling

- Use NestJS built-in HTTP exceptions (from `@nestjs/common`)
- Let Prisma throw errors for database operations (they're auto-converted)
- Example exception types:
  - `NotFoundException` - 404 errors
  - `BadRequestException` - 400 errors
  - `UnauthorizedException` - 401 errors

---

## Database & Prisma

### Database Schema

The application has a single model: **Image**

```prisma
model Image {
  id          String   @id @default(uuid())
  url         String
  prompt      String
  timestamp   DateTime @default(now())
  aspectRatio String

  @@map("images")  // Maps to 'images' table in PostgreSQL
}
```

**Field Details:**
- `id` - UUID primary key (auto-generated)
- `url` - Image URL (required)
- `prompt` - Generation prompt (required)
- `timestamp` - Creation timestamp (auto-set to now)
- `aspectRatio` - Image aspect ratio (required)

### Prisma Service

The `PrismaService` (at `src/prisma/prisma.service.ts`) extends `PrismaClient` and handles:
- Database connection lifecycle
- Connection pooling (via `@prisma/adapter-pg`)
- Graceful shutdown

**Usage in Services:**

```typescript
@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.image.findMany({
      orderBy: { timestamp: 'desc' }
    });
  }
}
```

### Common Prisma Operations

```typescript
// Find all records
await this.prisma.image.findMany();

// Find by ID
await this.prisma.image.findUnique({ where: { id } });

// Create record
await this.prisma.image.create({ data: { ...dto } });

// Update record
await this.prisma.image.update({ where: { id }, data: { ...dto } });

// Delete record
await this.prisma.image.delete({ where: { id } });

// Count records
await this.prisma.image.count();
```

### Database Migrations

```bash
# Create new migration after schema changes
npx prisma migrate dev --name descriptive_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

**Migration Best Practices:**
- Always create migrations for schema changes
- Use descriptive migration names
- Test migrations locally before deploying
- Never edit migration files directly
- Keep migrations in version control

---

## API Structure

### Base Configuration

The API is configured in `src/main.ts`:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable URI versioning (e.g., /api/v1/images)
  app.enableVersioning({ type: VersioningType.URI });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS enabled in non-production
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }

  // Swagger setup at /api
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
```

**Key Points:**
- Base URL: `http://localhost:3000/api/v1`
- Versioning: URI-based (append version to routes)
- CORS: Enabled in development/staging, disabled in production
- Swagger: Available at `/api` endpoint

### Images API Endpoints

**Base Path:** `/api/v1/images`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **GET** | `/images` | Get all images | None | `200 OK` - Array of images |
| **GET** | `/images/:id` | Get image by ID | None | `200 OK` - Image object<br>`404 Not Found` |
| **POST** | `/images` | Create new image | `CreateImageDto` | `201 Created` |
| **DELETE** | `/images/:id` | Delete image | None | `200 OK` |

### DTO Structure

**CreateImageDto** (for POST /images):

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  aspectRatio: string;
}
```

**Response Type (ImageEntity):**

```typescript
// Type returned by service (excludes timestamp)
export type ImageEntity = Omit<Image, 'timestamp'>;

// Full Image type (from Prisma)
interface Image {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  aspectRatio: string;
}
```

### Swagger/OpenAPI

The API includes comprehensive Swagger documentation:

```typescript
// Example Swagger decorators
@ApiTags('images')
@Controller({ path: 'images', version: '1' })
export class ImagesController {

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({ status: 200, description: 'Returns all images' })
  async findAll() { ... }
}
```

**Accessing Swagger:**
1. Start the development server
2. Navigate to `http://localhost:3000/api`
3. Interact with endpoints directly from the UI

---

## Testing

### Unit Tests

**Location:** Co-located with source files (`*.spec.ts`)

**Configuration:** Jest configuration in `package.json`

```json
{
  "jest": {
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "testEnvironment": "node"
  }
}
```

**Running Unit Tests:**

```bash
npm test                  # Run all unit tests
npm run test:watch        # Watch mode
npm run test:cov          # With coverage report
npm run test:debug        # Debug mode
```

**Example Unit Test:**

```typescript
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
```

### E2E Tests

**Location:** `test/` directory (`*.e2e-spec.ts`)

**Configuration:** `test/jest-e2e.json`

```bash
npm run test:e2e          # Run E2E tests
```

**Example E2E Test:**

```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

### Testing Best Practices

1. **Unit Tests:**
   - Test services in isolation
   - Mock external dependencies (database, HTTP calls)
   - Focus on business logic
   - Aim for high coverage (>80%)

2. **E2E Tests:**
   - Test full request/response cycle
   - Use in-memory or test database
   - Test authentication/authorization flows
   - Verify error responses

3. **Test Database:**
   - Use separate test database
   - Reset database between test runs
   - Consider using transactions for isolation

---

## Common Development Tasks

### Adding a New Feature Module

```bash
# Generate module, controller, and service
nest generate module features/my-feature
nest generate controller features/my-feature
nest generate service features/my-feature

# Generate DTO
mkdir src/features/my-feature/dto
touch src/features/my-feature/dto/create-my-feature.dto.ts
```

**Steps:**
1. Define Prisma model in `schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_my_feature`
3. Create DTOs with validation decorators
4. Implement service with business logic
5. Implement controller with HTTP endpoints
6. Add Swagger decorators
7. Write unit tests
8. Import module in `AppModule`

### Adding a New API Endpoint

1. **Add method to controller:**

```typescript
@Get(':id')
@ApiOperation({ summary: 'Get image by ID' })
@ApiResponse({ status: 200, description: 'Image found' })
@ApiResponse({ status: 404, description: 'Image not found' })
async findOne(@Param('id') id: string) {
  const image = await this.imagesService.findOne(id);
  if (!image) throw new NotFoundException();
  return image;
}
```

2. **Implement service method:**

```typescript
async findOne(id: string): Promise<ImageEntity | null> {
  return this.prisma.image.findUnique({ where: { id } });
}
```

3. **Add unit tests**
4. **Test via Swagger UI**

### Modifying Database Schema

1. **Edit `prisma/schema.prisma`:**

```prisma
model Image {
  id          String   @id @default(uuid())
  url         String
  prompt      String
  timestamp   DateTime @default(now())
  aspectRatio String
  metadata    Json?    // New field added

  @@map("images")
}
```

2. **Create migration:**

```bash
npx prisma migrate dev --name add_metadata_field
```

3. **Update DTOs and services to use new field**
4. **Run tests to verify changes**

### Adding Environment Variables

1. **Add to `.env` file:**

```bash
NEW_CONFIG_VALUE=some_value
```

2. **Access in code:**

```typescript
import { ConfigService } from '@nestjs/config';

constructor(private config: ConfigService) {
  const value = this.config.get<string>('NEW_CONFIG_VALUE');
}
```

### Debugging

**Using VS Code:**

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "attach",
  "name": "Debug NestJS",
  "port": 9229
}
```

```bash
# Start in debug mode
npm run start:debug

# Attach debugger from VS Code
```

**Logging:**

```typescript
import { Logger } from '@nestjs/common';

export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  async findAll() {
    this.logger.debug('Fetching all images');
    // ...
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem:** `Can't reach database server at localhost:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps

# Start PostgreSQL
docker-compose up -d

# Verify DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dude_images"
```

#### 2. Prisma Client Out of Sync

**Problem:** `Prisma Client did not initialize yet`

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Restart development server
npm run start:dev
```

#### 3. Migration Issues

**Problem:** `Migration failed to apply`

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Reapply migrations
npx prisma migrate deploy
```

#### 4. Port Already in Use

**Problem:** `Port 3000 is already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

#### 5. TypeScript Compilation Errors

**Problem:** `Cannot find module` or type errors

**Solution:**
```bash
# Clean build artifacts
rm -rf dist/

# Reinstall dependencies
rm -rf node_modules/
npm install

# Rebuild
npm run build
```

### Logs and Debugging

**View Application Logs:**

The application uses Pino for structured logging with pretty-printing in development:

```bash
# Logs appear in console during development
npm run start:dev

# Log levels: debug, info, warn, error
# Configured in src/app.module.ts (LoggerModule)
```

**Database Query Logs:**

```bash
# Enable Prisma query logging
# Add to PrismaService:
const prisma = new PrismaClient({ log: ['query', 'error'] });
```

---

## Best Practices for AI Assistants

### When Reading Code

1. **Always read files before modifying:**
   - Use `Read` tool on target files
   - Understand existing patterns and conventions
   - Check for similar implementations

2. **Understand dependencies:**
   - Check imports at top of files
   - Verify module relationships
   - Review Prisma schema for data models

3. **Check for existing tests:**
   - Look for `*.spec.ts` files
   - Review test patterns
   - Maintain test coverage

### When Writing Code

1. **Follow existing patterns:**
   - Match naming conventions
   - Use same decorators and validators
   - Maintain consistent error handling

2. **Always add validation:**
   - Use `class-validator` decorators on DTOs
   - Add `@IsString()`, `@IsNotEmpty()`, etc.
   - Include `@ApiProperty()` for Swagger

3. **Include proper typing:**
   - Avoid `any` types
   - Use Prisma-generated types
   - Define custom types/interfaces when needed

4. **Add Swagger documentation:**
   - Use `@ApiOperation()` for descriptions
   - Add `@ApiResponse()` for status codes
   - Include `@ApiTags()` on controllers

### When Modifying Database

1. **Never edit migrations directly:**
   - Only modify `schema.prisma`
   - Always create new migrations
   - Test migrations in development first

2. **Consider data migration:**
   - If adding required fields, provide defaults
   - Write data migration scripts if needed
   - Test with existing data

### When Testing

1. **Run tests after changes:**
   - `npm test` for unit tests
   - `npm run test:e2e` for integration tests
   - Fix any failing tests

2. **Add tests for new features:**
   - Unit tests for services
   - E2E tests for new endpoints
   - Test error cases

---

## Git Workflow

### Branch Naming

- Feature branches: `claude/feature-name-{sessionId}`
- All development happens on feature branches
- Never push directly to main/master

### Commit Messages

Follow conventional commits:

```bash
feat: add new endpoint for image filtering
fix: resolve database connection timeout
docs: update API documentation
refactor: simplify image service logic
test: add unit tests for images controller
```

### Before Committing

```bash
# Run linter
npm run lint

# Run formatter
npm run format

# Run tests
npm test

# Build check
npm run build
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port |

**Example `.env`:**

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dude_images"
NODE_ENV="development"
PORT=3000
```

---

## Additional Resources

- **NestJS Documentation:** https://docs.nestjs.com
- **Prisma Documentation:** https://www.prisma.io/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Jest Documentation:** https://jestjs.io/docs/getting-started

---

## Summary for AI Assistants

**Quick Reference:**

✅ **Do:**
- Read files before modifying
- Follow existing patterns and conventions
- Use TypeScript strict typing
- Add validation to DTOs
- Include Swagger decorators
- Write and run tests
- Create migrations for schema changes
- Use Prisma for all database operations
- Follow ESLint and Prettier rules

❌ **Don't:**
- Use `any` types unnecessarily
- Modify migration files directly
- Skip validation on DTOs
- Forget Swagger documentation
- Push to main/master branches
- Commit without running tests
- Use raw SQL queries (use Prisma)
- Hardcode configuration values

**Key Files to Check:**
- `src/app.module.ts` - Root module configuration
- `prisma/schema.prisma` - Database schema
- `package.json` - Dependencies and scripts
- `.env` - Environment configuration (create if missing)

---

*This documentation is maintained to help AI assistants work effectively on the codebase. Update as the project evolves.*

**Last Updated:** 2026-01-11
**Version:** 1.0.0
