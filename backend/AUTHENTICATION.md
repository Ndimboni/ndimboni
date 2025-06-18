# Global JWT Authentication Setup

## Overview

The Ndimboni Digital Scam Protection backend now uses **global JWT authentication** by default for all endpoints. This means:

- ✅ **All API endpoints require JWT authentication by default**
- ✅ **Public endpoints are explicitly marked with the `@Public()` decorator**
- ✅ **No need to add `@UseGuards(JwtAuthGuard)` to individual controllers/methods**
- ✅ **Cleaner, more secure code with authentication as the default**

## How It Works

### 1. Global Guard Configuration
The `JwtAuthGuard` is registered as a global guard in `app.module.ts`:

```typescript
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

### 2. Public Decorator
Use the `@Public()` decorator to bypass authentication for specific endpoints:

```typescript
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Public()  // ← This endpoint doesn't require authentication
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')  // ← This endpoint requires authentication (default)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
```

### 3. Controller-Level Public Access
You can make an entire controller public:

```typescript
@Public()  // ← All endpoints in this controller are public
@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return { status: 'OK' };
  }
}
```

## Public Endpoints

The following endpoints are currently marked as public (no authentication required):

### Health & Status
- `GET /` - Application welcome message
- `GET /health` - Health check endpoint

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Scam Reports (Public Access)
- `GET /scam-reports` - View all scam reports
- `GET /scam-reports/:id` - View specific scam report
- `POST /scam-reports` - Submit anonymous scam report

## Protected Endpoints

All other endpoints require JWT authentication:

### User Management
- `GET /users` - List users (Admin only)
- `GET /users/profile` - Get current user profile
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Scam Report Management
- `GET /scam-reports/stats` - View statistics (Admin/Moderator)
- `PUT /scam-reports/:id` - Update scam report
- `PUT /scam-reports/:id/status` - Update report status (Admin/Moderator)
- `DELETE /scam-reports/:id` - Delete scam report

### File Upload
- `POST /files/upload` - Upload files
- `GET /files` - List uploaded files
- `DELETE /files/:id` - Delete files

### Email Service
- `POST /email/send` - Send emails
- `POST /email/send-welcome` - Send welcome emails
- `POST /email/send-scam-alert` - Send scam alerts
- `POST /email/send-bulk` - Send bulk emails
- `GET /email/verify-config` - Verify email configuration

## Authentication Flow

### 1. User Registration/Login
```bash
# Register new user (public)
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

# Login (public)
POST /auth/login
{
  "email": "user@example.com", 
  "password": "password123"
}

# Response includes JWT token
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Using JWT Token
Include the JWT token in the Authorization header for protected endpoints:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Frontend Integration
```javascript
// Store token after login
localStorage.setItem('token', response.data.access_token);

// Include in API requests
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## Error Responses

### 401 Unauthorized
When JWT token is missing or invalid:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden  
When user lacks sufficient permissions:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

## Development Notes

### Adding New Endpoints

**For Protected Endpoints (Default):**
```typescript
@Get('protected-endpoint')
async protectedMethod() {
  // Automatically requires JWT authentication
  return 'This is protected';
}
```

**For Public Endpoints:**
```typescript
@Public()
@Get('public-endpoint') 
async publicMethod() {
  // No authentication required
  return 'This is public';
}
```

### Testing
- Use public endpoints for testing without authentication
- For protected endpoints, first login to get a JWT token
- Include the token in the Authorization header

### Policy-Based Authorization
The system also includes role-based access control using the `@RequirePolicy()` decorator:

```typescript
@RequirePolicy(Action.READ, Resource.USER)
@Get('admin-only')
async adminOnlyMethod() {
  // Requires both JWT authentication AND admin permissions
  return 'Admin only content';
}
```

This setup provides a secure-by-default approach where authentication is required unless explicitly disabled, making the API more secure and reducing the chance of accidentally exposing protected endpoints.
