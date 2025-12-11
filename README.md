# Hacienda Backend

Backend developed with Node.js, Express, JavaScript (ES6 Modules), Sequelize and PostgreSQL.

## 🚀 Features

- ✅ JavaScript with ES6 Modules
- ✅ JWT Authentication (cookies + Bearer token)
- ✅ Validation with Zod
- ✅ Sequelize ORM with PostgreSQL
- ✅ Soft Delete
- ✅ Pagination
- ✅ CORS configured
- ✅ Password hashing with bcryptjs

## 📋 Prerequisites

- Node.js >= 18
- PostgreSQL >= 13
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/YourUsername/HaciendaBackend.git
cd HaciendaBackend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configurations:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hacienda_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

4. Create the database in PostgreSQL:
```sql
CREATE DATABASE hacienda_db;
```

## 🏃 Run the Project

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📁 Project Structure

```
src/
├── models/
│   └── user.model.js
├── controllers/
│   ├── auth.controller.js
│   └── user.controller.js
├── routes/
│   ├── auth.routes.js
│   └── user.routes.js
├── middlewares/
│   ├── validateToken.middleware.js
│   └── validateSchema.middleware.js
├── schemas/
│   └── user.schema.js
├── db.js
└── app.js
```

## 🔐 Authentication

The system supports two authentication methods:

### 1. Cookies (Recommended)
When logging in, the token is automatically saved in an httpOnly cookie.

### 2. Bearer Token
You can also send the token in the header:
```
Authorization: Bearer <your_token>
```

## 📚 Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "client"
}
```

#### POST `/api/auth/login`
Login.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id_user": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      "status": "active"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/auth/verify`
Verify token.

#### POST `/api/auth/logout`
Logout (requires authentication).

#### GET `/api/auth/profile`
Get authenticated user profile (requires authentication).

#### POST `/api/auth/change-password`
Change password (requires authentication).

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

### Users (Require authentication)

#### POST `/api/users`
Create new user (admin).

#### GET `/api/users?page=1&limit=10`
List all users with pagination.

#### GET `/api/users/:id`
Get user by ID.

#### PUT `/api/users/:id`
Update user.

#### DELETE `/api/users/:id`
Delete user (soft delete).

#### GET `/api/users/role/:role`
Get users by role (employee, admin, client).

#### GET `/api/users/search?q=john`
Search users by name or email.

#### PUT `/api/profile`
Update authenticated user profile.

## 🔒 Roles

- `client`: Regular user
- `employee`: System employee
- `admin`: Administrator with all permissions

## 🛡️ Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with configurable expiration
- HttpOnly cookies to prevent XSS
- CORS configured for frontend
- Data validation with Zod
- Soft delete to maintain data integrity

## 📝 Important Notes

1. The model uses **UUIDs** instead of incremental IDs
2. Passwords are never returned in responses
3. The system uses **soft delete** (`status: "deleted"`)
4. Pagination is available on all lists
5. Timestamps are handled automatically (`created_at`, `updated_at`)

## 🐛 Development

### Available scripts:
- `npm run dev` - Run in development mode with nodemon
- `npm start` - Run in production mode

## 📦 Main Dependencies

- `express` - Web framework
- `sequelize` - ORM for PostgreSQL
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `zod` - Schema validation
- `cookie-parser` - Cookie handling
- `cors` - CORS configuration
- `dotenv` - Environment variables
- `uuid` - UUID generation
- `nodemon` - Hot reload in development

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## ✨ Author

J4Code