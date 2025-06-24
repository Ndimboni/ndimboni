# Ndimboni Digital Scam Protection - Backend API

A robust NestJS backend application for the Ndimboni Digital Scam Protection platform, providing comprehensive scam detection, reporting, and user management capabilities.
The rise of digital communication in Rwanda has led to an increase in online scams, affecting citizens unfamiliar with digital threats. This research proposes the development of "Ndimboni," a platform combining educational simulations, AI-based scam detection tools, and a centralized reporting system. The methodology includes interactive simulations, AI analysis of messages, and secure reporting mechanisms. The expected outcome is a user-friendly platform that enhances scam awareness and detection among Rwandans, reducing the incidence of online scams.

## 🚀 Features

### Authentication & Authorization

- **JWT Authentication** - Secure token-based authentication
- **ABAC (Attribute-Based Access Control)** - Fine-grained permission system
- **Local & JWT Strategies** - Multiple authentication methods
- **Role-based Access** - Admin, Moderator, and User roles

### File Management

- **Secure File Upload** - Protected file upload with validation
- **MIME Type Validation** - Ensures only allowed file types
- **File Size Limits** - Configurable upload limits
- **Organized Storage** - Structured file organization

### Email Service

- **SMTP Integration** - Full email sending capabilities using Nodemailer
- **Template System** - Pre-built HTML email templates
- **Bulk Email** - Send emails to multiple recipients
- **Email Templates** - Welcome, password reset, and scam alert emails

### API Documentation

- **Swagger Integration** - Complete API documentation
- **Interactive UI** - Test endpoints directly from browser
- **Bearer Authentication** - Secured endpoint testing

### Validation & Security

- **Input Validation** - Global validation pipes with class-validator
- **Request Sanitization** - Automatic data sanitization
- **CORS Configuration** - Cross-origin request handling
- **Security Headers** - Enhanced security configuration

## 🛠️ Technology Stack

### Core Framework

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Express** - HTTP server foundation

### Database & ORM

- **TypeORM** - Object-Relational Mapping
- **SQLite** - Default lightweight database (development)
- **PostgreSQL** - Production-ready database option
- **Database Migrations** - Automated schema management

### Authentication & Security

- **Passport** - Authentication middleware
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **class-validator** - Input validation
- **ABAC** - Attribute-Based Access Control

### File & Email Services

- **Multer** - File upload handling
- **Nodemailer** - Email service
- **UUID** - Unique identifier generation

### Documentation & Development

- **Swagger/OpenAPI** - API documentation
- **ESLint & Prettier** - Code quality tools

## 📁 Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── jwt.strategy.ts     # JWT authentication strategy
│   ├── local.strategy.ts   # Local authentication strategy
│   └── policy.service.ts   # ABAC policy management
├── users/                  # User management
│   ├── users.controller.ts # User endpoints
│   ├── users.service.ts    # User business logic (TypeORM)
│   └── users.module.ts     # User module configuration
├── scam-reports/           # Scam reporting system
│   ├── scam-reports.controller.ts # Report endpoints
│   ├── scam-reports.service.ts    # Report business logic (TypeORM)
│   └── scam-reports.module.ts     # Report module configuration
├── file-upload/            # File management
│   ├── file-upload.controller.ts  # File endpoints
│   ├── file-upload.service.ts     # File business logic (TypeORM)
│   └── file-upload.module.ts      # File module configuration
├── sms-service/            # Email service (legacy naming)
│   ├── sms.controller.ts
│   └── sms.service.ts
├── database/               # Database configuration
│   ├── database.module.ts  # TypeORM configuration
│   └── seed.service.ts     # Database seeding
├── entities/               # TypeORM entities
│   ├── user.entity.ts      # User entity
│   ├── scam-report.entity.ts # Scam report entity
│   ├── uploaded-file.entity.ts # File entity
│   └── index.ts            # Entity exports
├── guards/                 # Security guards
│   ├── jwt-auth.guard.ts   # JWT authentication guard
│   ├── local-auth.guard.ts # Local authentication guard
│   └── policy.guard.ts     # ABAC authorization guard
├── dto/                    # Data Transfer Objects
│   ├── auth.dto.ts         # Authentication DTOs
│   └── email.dto.ts        # Email DTOs
├── common/                 # Shared interfaces
│   └── interfaces/         # TypeScript interfaces
├── decorators/             # Custom decorators
│   └── policy.decorator.ts # ABAC policy decorator
├── middleware/             # Custom middleware
│   └── logger.middleware.ts
├── config/                 # Configuration
│   └── configuration.ts    # Environment configuration
├── app.module.ts           # Main application module
├── app.controller.ts       # Root controller
├── app.service.ts          # Root service
└── main.ts                 # Application bootstrap
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
# Use 'sqlite' for SQLite or 'postgres' for PostgreSQL
DB_TYPE=sqlite
DB_NAME=./data/ndimboni.db

# For PostgreSQL (uncomment and configure when using PostgreSQL)
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=password
# DB_NAME=ndimboni
# DB_SSL=false

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Admin User Configuration (for automatic seeding)
ADMIN_EMAIL=admin@ndimboni.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User

# WhatsApp Bot Configuration
WHATSAPP_BOT_TOKEN=your-whatsapp-bot-token
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/whatsapp/webhook
```

### Database Setup

#### SQLite (Default - Development)

SQLite is used by default for development. The database file will be created automatically at `./data/ndimboni.db`.

```bash
# No additional setup required
pnpm run start:dev
```

#### PostgreSQL (Production)

1. **Install PostgreSQL**:

   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # Create database and user
   sudo -u postgres createdb ndimboni
   sudo -u postgres createuser --superuser your_username
   ```

2. **Configure Environment**:

   **Option 1: Using DATABASE_URL (Recommended for production/cloud deployments)**

   ```env
   DB_TYPE=postgres
   DATABASE_URL=postgresql://username:password@localhost:5432/ndimboni

   # For cloud providers (e.g., Heroku, Railway, Supabase):
   # DATABASE_URL=postgres://user:pass@host:port/dbname?sslmode=require
   ```

   **Option 2: Using individual components (Local development)**

   ```env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=ndimboni
   DB_SSL=false
   ```

   **Note**: When `DATABASE_URL` is provided, it takes precedence over individual database configuration variables.

3. **Run Migrations** (if needed):

   ```bash
   # Generate migration
   pnpm run migration:generate -- -n InitialSchema

   # Run migrations
   pnpm run migration:run
   ```

### Required Environment Setup

1. **Email Service**: Configure SMTP settings for email functionality
2. **JWT Secret**: Use a strong secret key for JWT token signing
3. **File Storage**: Ensure proper permissions for upload directory
4. **Database**: Choose between SQLite (development) or PostgreSQL (production)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   pnpm run start:dev
   ```

### Available Scripts

```bash
# Development
pnpm run start:dev      # Start with hot reload
pnpm run start          # Start in development mode
pnpm run start:prod     # Start in production mode

# Building
pnpm run build          # Build the application

# Database Operations
pnpm run migration:generate -- -n MigrationName  # Generate migration
pnpm run migration:run       # Run pending migrations
pnpm run migration:revert    # Revert last migration
pnpm run schema:sync         # Sync schema (dev only)

# Testing
pnpm run test           # Run unit tests
pnpm run test:e2e       # Run end-to-end tests
pnpm run test:cov       # Run tests with coverage

# Code Quality
pnpm run lint           # Run ESLint
pnpm run format         # Format code with Prettier
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api
- **JSON Schema**: http://localhost:3000/api-json

### Authentication

Most endpoints require authentication. Include the JWT token in requests:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/protected-endpoint
```

### Key Endpoints

#### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile

#### File Management

- `POST /files/upload` - Upload single file
- `POST /files/upload-multiple` - Upload multiple files
- `GET /files/my-files` - Get current user's files
- `GET /files/:id` - Get file information
- `GET /files/:id/download` - Download file
- `DELETE /files/:id` - Delete file

#### Email Service

- `POST /sms/send-email` - Send custom email
- `POST /sms/welcome` - Send welcome email
- `POST /sms/password-reset` - Send password reset email
- `POST /sms/bulk-email` - Send bulk emails

#### Scam Reports

- `GET /scam-reports` - List all scam reports
- `GET /scam-reports/stats` - Get statistics (Admin/Moderator)
- `GET /scam-reports/:id` - Get specific report
- `POST /scam-reports` - Create new report (anonymous or authenticated)
- `PUT /scam-reports/:id` - Update report
- `PUT /scam-reports/:id/status` - Update report status (Admin/Moderator)
- `DELETE /scam-reports/:id` - Delete report

#### User Management

- `GET /users` - List users (Admin only)
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

## 🔒 Security Features

### Authentication Flow

1. User provides credentials
2. Server validates and returns JWT token
3. Client includes token in subsequent requests
4. Server validates token and grants access

### Authorization Levels

- **Admin**: Full system access
- **Moderator**: Manage scam reports and send emails
- **User**: Manage own resources and create reports

### File Upload Security

- File type validation (MIME type checking)
- File size limits
- Secure file storage
- Access control for file downloads

## 🧪 Testing

### Unit Tests

```bash
pnpm run test
```

### Integration Tests

```bash
pnpm run test:e2e
```

### Test Coverage

```bash
pnpm run test:cov
```

## 🔧 Development Tools

### Code Quality

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

### API Development

- **Swagger**: Interactive API documentation
- **Class Validator**: Input validation
- **Class Transformer**: Data transformation

## 🚀 Deployment

### Production Build

```bash
pnpm run build
pnpm run start:prod
```

### Environment Considerations

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up proper email SMTP settings
- Ensure file upload directory permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For questions and support:

- Create an issue in the repository
- Contact the development team
- Check the API documentation for endpoint details

---

**Note**: This backend is designed to work with the Ndimboni frontend application and provides a comprehensive API for digital scam protection services.

# e2e tests

$ pnpm run test:e2e

# test coverage

$ pnpm run test:cov

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
