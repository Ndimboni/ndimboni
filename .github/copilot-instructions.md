# GitHub Copilot Instructions for Ndimboni Digital Scam Protection

## Project Overview

Ndimboni is an AI-powered platform designed to combat digital scams in Rwanda. This is a full-stack application with a **NestJS backend (primary focus)** and Next.js frontend, developed as a final year project at the University of Rwanda.

## Backend-Focused Development Guidelines

### 🏗️ Architecture & Technology Stack

**Primary Technologies:**

- **Framework**: NestJS (TypeScript)
- **Database**: TypeORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT + Passport (Local & JWT strategies)
- **Authorization**: ABAC (Attribute-Based Access Control)
- **File Upload**: Multer with validation
- **Email**: Nodemailer with SMTP
- **API Documentation**: Swagger/OpenAPI
- **Telegram Integration**: Telegraf bot framework
- **Testing**: Jest for unit/e2e tests

### 🔐 Security-First Development

#### Global Authentication

- **ALL endpoints require JWT authentication by default**
- Use `@Public()` decorator ONLY for truly public endpoints (login, register, etc.)
- Never use `@UseGuards(JwtAuthGuard)` - it's globally applied
- Example:

```typescript
@Controller("auth")
export class AuthController {
  @Public() // Only public endpoints need this decorator
  @Post("login")
  async login(@Body() loginDto: LoginDto) {}

  @Get("profile") // Protected by default
  async getProfile(@Request() req) {}
}
```

#### Authorization Patterns

- Use ABAC policy-based authorization for fine-grained control
- Implement role-based access: Admin, Moderator, User
- Apply `@PolicyGuard()` with specific policies for sensitive operations

#### Input Validation

- Always use DTOs with `class-validator` decorators
- Implement global validation pipes
- Sanitize all user inputs
- Validate file uploads (MIME type, size, extension)

### 📁 Project Structure Guidelines

When working with the backend, follow this module structure:

```
backend/
  src/
  ├── auth/                   # Authentication & authorization
  ├── users/                  # User management
  ├── scam-reports/          # Scam reporting system
  ├── scam-check/            # AI scam detection
  ├── scammer-reports/       # Scammer database
  ├── telegram-bot/          # Telegram bot integration
  ├── entities/              # TypeORM entities
  ├── dto/                   # Data Transfer Objects
  ├── common/                # Shared utilities
  ├── config/                # Configuration files
  ├── database/              # Database utilities & migrations
  └── migrations/            # TypeORM migrations
```

### 🚀 Development Patterns

#### Controller Development

- Keep controllers thin - business logic goes in services
- Use proper HTTP status codes
- Implement comprehensive error handling
- Document all endpoints with Swagger decorators

#### Service Development

- Implement repository pattern with TypeORM
- Use dependency injection properly
- Handle database transactions for complex operations
- Implement proper error handling and logging

#### Entity Design

- Use TypeORM entities with proper relationships
- Implement soft deletes where appropriate
- Add timestamps (createdAt, updatedAt)
- Use UUIDs for primary keys when needed

### 🔧 Key Features Implementation

#### Scam Detection System

- Implement AI-based text analysis for scam detection
- Provide confidence scores for detections
- Support multiple input types (text, images, URLs)
- Log all detection attempts for analytics

#### File Management

- Secure file upload with comprehensive validation
- Organized file storage with proper access controls
- Support multiple file types with size limits
- Implement file cleanup for deleted records

#### Email System

- Template-based email system with Nodemailer
- Support for bulk email operations
- Email verification workflows
- Proper error handling for email failures

#### Telegram Bot Integration

- Auto-moderation for group chats
- Real-time scam analysis
- Admin notification system
- Webhook-based message processing

### 🗄️ Database Guidelines

#### Migration Management

```bash
# Generate migrations after entity changes
pnpm run migration:generate -- -n DescriptiveName

# Run migrations
pnpm run migration:run

# Revert if needed
pnpm run migration:revert
```

#### Entity Relationships

- Use proper TypeORM decorators (@OneToMany, @ManyToOne, etc.)
- Implement cascade options carefully
- Use eager/lazy loading appropriately
- Add proper indexes for performance

### 🧪 Testing Strategy

#### Unit Tests

- Test all service methods
- Mock external dependencies
- Test both success and error scenarios
- Maintain high test coverage

#### E2E Tests

- Test complete API workflows
- Test authentication flows
- Test file upload scenarios
- Test error responses

### 🔍 Code Quality Standards

#### TypeScript Best Practices

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type usage
- Use enums for constants

#### Error Handling

- Use proper HTTP exceptions
- Implement global exception filters
- Log errors appropriately
- Provide meaningful error messages

#### Performance Optimization

- Implement database query optimization
- Use caching where appropriate
- Implement rate limiting
- Monitor memory usage

### 🚀 Development Commands

#### Common Backend Commands

```bash
# Development
pnpm run start:dev          # Hot reload development
pnpm run start:debug        # Debug mode

# Database
pnpm run migration:generate # Generate migration
pnpm run migration:run      # Apply migrations
pnpm run db:seed           # Seed database

# Testing
pnpm run test              # Unit tests
pnpm run test:e2e          # E2E tests
pnpm run test:cov          # Coverage

# Code Quality
pnpm run lint              # ESLint
pnpm run format            # Prettier
```

### 📚 API Documentation

- Access Swagger UI at `/api` endpoint
- Document all endpoints with proper decorators
- Include request/response examples
- Document authentication requirements

### 🌐 Environment Configuration

#### Required Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_TYPE=sqlite|postgres
DB_NAME=./data/ndimboni.db

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=your_webhook_url

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf
```

### 🐛 Common Issues & Solutions

#### Authentication Issues

- Ensure JWT_SECRET is set and consistent
- Check token expiration settings
- Verify guard configuration in app.module.ts

#### Database Issues

- Run migrations after entity changes
- Check database connection configuration
- Ensure proper TypeORM entity imports

#### File Upload Issues

- Verify MIME type validation
- Check file size limits
- Ensure upload directory permissions

### 🚀 Deployment Considerations

#### Production Checklist

- Set NODE_ENV=production
- Use PostgreSQL for production database
- Configure proper CORS settings
- Set up proper email SMTP
- Configure Telegram webhook URL
- Implement proper logging
- Set up health checks

### 💡 Development Tips

1. **Focus on Backend**: This project prioritizes backend development
2. **Security First**: Always consider security implications
3. **Test-Driven**: Write tests for new features
4. **Document**: Keep Swagger documentation updated
5. **Performance**: Monitor database query performance
6. **Error Handling**: Implement comprehensive error handling
7. **Logging**: Add proper logging for debugging
8. **Code Review**: Follow established patterns and conventions

### 🔗 Related Documentation

- Backend README: `/backend/README.md`
- Authentication Guide: `/backend/AUTHENTICATION.md`
- Telegram Bot Setup: `/backend/TELEGRAM_BOT.md`
- API Documentation: `http://localhost:3000/api` (when running)

---

**Remember**: The backend is the core of this application. Focus on building robust, secure, and scalable API endpoints that can handle the platform's scam detection and reporting requirements effectively.

# Backend Development Guidelines - Ndimboni Digital Scam Protection

## Quick Start for Backend Development

### Setup Commands

```bash
cd backend
pnpm install
cp .env.example .env
# Configure .env file
pnpm run start:dev
```

### Key Development Areas

#### 1. Authentication & Security 🔐

- **Global JWT Protection**: All endpoints protected by default
- **Public Endpoints**: Use `@Public()` decorator sparingly
- **ABAC Authorization**: Implement fine-grained permissions
- **Role System**: Admin, Moderator, User roles

#### 2. Core Modules 🏗️

##### Scam Detection System

```typescript
// Example scam check endpoint
@Post('check')
async checkScam(@Body() checkDto: ScamCheckDto) {
  return this.scamCheckService.analyzeContent(checkDto);
}
```

##### File Management

```typescript
// Secure file upload with validation
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return this.fileService.uploadFile(file);
}
```

##### Email Service

```typescript
// Template-based email system
@Post('send-email')
async sendEmail(@Body() emailDto: EmailDto) {
  return this.emailService.sendTemplateEmail(emailDto);
}
```

##### Telegram Bot Integration

```typescript
// Bot message processing
@Post('webhook')
async handleWebhook(@Body() update: TelegramUpdate) {
  return this.telegramService.processUpdate(update);
}
```

#### 3. Database Patterns 🗄️

##### Entity Structure

```typescript
@Entity("scam_reports")
export class ScamReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column({ type: "enum", enum: ScamType })
  scamType: ScamType;

  @Column({ type: "decimal", precision: 3, scale: 2 })
  confidenceScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  reportedBy: User;
}
```

##### Service Implementation

```typescript
@Injectable()
export class ScamReportsService {
  constructor(
    @InjectRepository(ScamReport)
    private scamReportRepository: Repository<ScamReport>
  ) {}

  async createReport(createReportDto: CreateScamReportDto, userId?: string) {
    const report = this.scamReportRepository.create({
      ...createReportDto,
      reportedBy: userId ? { id: userId } : null,
    });
    return this.scamReportRepository.save(report);
  }

  async getReports(page: number = 1, limit: number = 10) {
    return this.scamReportRepository.findAndCount({
      relations: ["reportedBy"],
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: "DESC" },
    });
  }
}
```

#### 4. API Endpoint Patterns 🚀

##### RESTful Controllers

```typescript
@Controller("scam-reports")
@ApiTags("Scam Reports")
export class ScamReportsController {
  constructor(private readonly scamReportsService: ScamReportsService) {}

  @Get()
  @ApiOperation({ summary: "Get all scam reports" })
  @ApiResponse({ status: 200, description: "List of scam reports" })
  async getReports(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    return this.scamReportsService.getReports(page, limit);
  }

  @Post()
  @ApiOperation({ summary: "Create new scam report" })
  @ApiResponse({ status: 201, description: "Report created successfully" })
  async createReport(
    @Body() createReportDto: CreateScamReportDto,
    @Request() req
  ) {
    return this.scamReportsService.createReport(createReportDto, req.user?.id);
  }

  @Put(":id/status")
  @PolicyGuard("scam-reports:update-status")
  @ApiOperation({ summary: "Update report status (Admin/Moderator only)" })
  async updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.scamReportsService.updateStatus(id, updateStatusDto);
  }
}
```

#### 5. Validation & DTOs 📝

##### Input Validation

```typescript
export class CreateScamReportDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Title of the scam report" })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Detailed description" })
  description: string;

  @IsEnum(ScamType)
  @ApiProperty({ enum: ScamType, description: "Type of scam" })
  scamType: ScamType;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Contact information", required: false })
  contactInfo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: "Evidence URLs", required: false })
  evidenceUrls?: string[];
}
```

#### 6. Error Handling 🚨

##### Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    this.logger.error(`${request.method} ${request.url}`, exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

#### 7. Testing Patterns 🧪

##### Unit Tests

```typescript
describe("ScamReportsService", () => {
  let service: ScamReportsService;
  let repository: Repository<ScamReport>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScamReportsService,
        {
          provide: getRepositoryToken(ScamReport),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ScamReportsService>(ScamReportsService);
    repository = module.get<Repository<ScamReport>>(
      getRepositoryToken(ScamReport)
    );
  });

  it("should create a scam report", async () => {
    const createReportDto = {
      title: "Test Scam",
      description: "Test Description",
      scamType: ScamType.PHISHING,
    };

    jest.spyOn(repository, "create").mockReturnValue(createReportDto as any);
    jest.spyOn(repository, "save").mockResolvedValue(createReportDto as any);

    const result = await service.createReport(createReportDto);
    expect(result).toEqual(createReportDto);
  });
});
```

##### E2E Tests

```typescript
describe("ScamReports (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/scam-reports (GET)", () => {
    return request(app.getHttpServer())
      .get("/scam-reports")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("total");
      });
  });
});
```

### Development Workflow

1. **Feature Development**:

   - Create feature branch
   - Implement entity if needed
   - Generate migration
   - Create/update DTOs
   - Implement service logic
   - Create controller endpoints
   - Add tests
   - Update documentation

2. **Database Changes**:

   ```bash
   # After modifying entities
   pnpm run migration:generate -- -n FeatureName
   pnpm run migration:run
   ```

3. **Testing**:

   ```bash
   pnpm run test           # Unit tests
   pnpm run test:e2e       # Integration tests
   pnpm run test:cov       # Coverage report
   ```

4. **Code Quality**:
   ```bash
   pnpm run lint           # ESLint check
   pnpm run format         # Prettier format
   ```

### Production Considerations

#### Environment Setup

- Configure proper CORS origins
- Set strong JWT secrets
- Enable production logging
- Configure email SMTP properly

#### Security Checklist

- All endpoints use JWT authentication
- Input validation on all DTOs
- File upload restrictions
- Rate limiting configured
- HTTPS in production
- Proper error handling without sensitive data leakage

#### Performance Optimization

- Database query optimization
- Proper indexing
- Connection pooling
- Caching strategies
- File upload size limits

### Useful Commands

```bash
# Development
pnpm run start:dev          # Start with hot reload
pnpm run start:debug        # Start with debugging

# Database
pnpm run migration:generate # Create migration
pnpm run migration:run      # Apply migrations
pnpm run migration:revert   # Rollback migration
pnpm run db:seed           # Seed database

# API Documentation
# Visit http://localhost:3000/api when running

# Testing
pnpm run test              # Run unit tests
pnpm run test:watch        # Watch mode
pnpm run test:e2e          # E2E tests
```

This backend is the core of the Ndimboni Digital Scam Protection platform. Focus on building secure, efficient, and well-tested API endpoints that support the platform's mission of combating digital scams in Rwanda.
