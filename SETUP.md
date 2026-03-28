# Music App with Authentication System

## What's Included

- **Backend**: Node.js/Express server with SQLite database
- **Authentication**: Login/Signup with password hashing (bcrypt)
- **Frontend**: Music app with user authentication flow
- **Database**: SQLite stores emails and hashed passwords
- **Security**: JWT tokens for session management

## Features

✓ User registration with email validation
✓ Login with password hashing
✓ JWT token-based sessions (7-day expiry)
✓ Protected routes
✓ Album management (create, edit, delete)
✓ Track upload and playback
✓ Responsive dark theme UI

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
node server.js
```
Then open http://localhost:3000

### 3. Or Use Docker
```bash
docker-compose up --build
```

## API Endpoints

### POST /api/signup
Register new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### POST /api/login
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET /api/profile
Verify token (include Authorization header with token)
```
Authorization: Bearer <token>
```

## File Structure

- `server.js` - Express backend with auth routes
- `auth.js` - Frontend authentication logic
- `script.js` - Album/music player logic
- `index.html` - Main UI
- `package.json` - Dependencies
- `Dockerfile` - Container setup
- `docker-compose.yml` - Multi-container setup
- `users.db` - SQLite database (auto-created)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Development Notes

- Passwords are automatically hashed using bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- Change `SECRET_KEY` in server.js for production
- User albums stored in IndexedDB (client-side)
- Service worker for PWA support

## Testing Credentials

After signup, use your email and password to login.
