# Visual Guide: How Your App Works

## The Flow

### When User Opens App

```
User opens: https://burgrhama.github.io/untitled-phone/
                        ↓
                 Page loads
                        ↓
             Check localStorage
                        ↓
          Do they have a token?
               ↙            ↘
            YES             NO
             ↓               ↓
         Load app      Show login form
        (unlocked)      (locked)
```

### When User Signs Up

```
User fills form:
  Email: demo@gmail.com
  Password: secret123
  Confirm: secret123
                ↓
         Click "Sign Up"
                ↓
     Frontend sends to backend:
     POST /api/signup
     {
       email: "demo@gmail.com",
       password: "secret123",
       confirmPassword: "secret123"
     }
                ↓
        Backend receives
                ↓
      Validate inputs
                ↓
    Hash password with bcrypt
                ↓
   Save to SQLite database:
   emails:     demo@gmail.com
   passwords:  $2b$10$... (hashed!)
                ↓
      Return JWT token
                ↓
    Frontend saves token
    to localStorage
                ↓
      Show app (unlocked!)
```

### When User Logs In on Different Device

```
User fills form:
  Email: demo@gmail.com
  Password: secret123
                ↓
         Click "Sign In"
                ↓
     Frontend sends to backend:
     POST /api/login
     {
       email: "demo@gmail.com",
       password: "secret123"
     }
                ↓
        Backend receives
                ↓
   Look up email in SQLite
                ↓
   Compare password:
   bcrypt(input) vs hashed_in_db
                ↓
         Match? YES
                ↓
      Return JWT token
                ↓
    Frontend saves token
    to localStorage
                ↓
    Show app (same account!)
```

### Why It Works Across Devices

```
Device 1 (Phone)          Device 2 (Desktop)
     ↓                           ↓
   Signup                     Login
     ↓                           ↓
     └──→ Backend SQLite ←──┘
            (same database)
     ↓                           ↓
 Token saved              Token saved
     ↓                           ↓
 Both have              Same email loaded
 same account
```

---

## Where Data Goes

### Frontend (GitHub Pages)

```
indexedDB (local)
├── Albums (client-side only)
└── Tracks (client-side only)

localStorage (local)
├── token (JWT)
└── email
```

### Backend (Render)

```
SQLite database (persistent)
├── emails
├── passwords (hashed!)
├── tokens (don't store, generate on login)
└── created_at
```

### What Syncs Across Devices

✓ **Email & Password** - Stored in backend, same for all devices  
✓ **Authentication Status** - Token proves who you are  
✓ **User Account** - Identified by email  

✗ **Albums** - Stored locally on each device  
✗ **Music Tracks** - Stored locally on each device  
✗ **Settings** - Stored locally on each device  

---

## How Login Works Technically

### Step 1: Frontend Detects Current Device

```javascript
// In auth.js
if (window.location.hostname === 'localhost') {
  // Local testing
  API_BASE_URL = 'http://localhost:3000'
} else {
  // Deployed on GitHub Pages
  API_BASE_URL = 'https://your-backend.onrender.com'
}
```

### Step 2: Frontend Sends Request

```javascript
fetch(API_BASE_URL + '/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: {
    email: 'user@example.com',
    password: 'password123'
  }
})
```

### Step 3: Backend Receives & Validates

```javascript
// In server.js
app.post('/api/login', (req, res) => {
  // 1. Get email from request
  // 2. Query SQLite: SELECT * WHERE email = ?
  // 3. Compare password using bcrypt
  // 4. If match: create JWT token
  // 5. Return token to frontend
})
```

### Step 4: Frontend Saves Token

```javascript
localStorage.setItem('token', response.token);
localStorage.setItem('email', response.email);
// Now user is "logged in" on this device
```

---

## Security Flow

```
User enters password: "password123"
              ↓
Frontend sends to backend: password123 (HTTPS encrypted)
              ↓
Backend never stores plain password
              ↓
Backend hashes with bcrypt:
  "password123" → "$2b$10$abc123..."
              ↓
Stored in SQLite: "$2b$10$abc123..."
              ↓
On next login:
  bcrypt.compare("password123", "$2b$10$abc123...")
              ↓
Returns TRUE/FALSE (never stores plain password)
              ↓
Frontend gets JWT token (not password)
              ↓
Token used for all future requests
```

---

## Database Schema

### SQLite (Backend)

```sql
CREATE TABLE users (
  id              INT PRIMARY KEY
  email           TEXT UNIQUE
  password        TEXT (hashed)
  created_at      DATETIME
)

Example row:
id: 1
email: demo@gmail.com
password: $2b$10$N9qo8uLO...
created_at: 2024-01-15 10:30:00
```

### IndexedDB (Frontend, Local)

```javascript
{
  albums: [
    {
      id: 1,
      name: "My Album",
      cover: "base64data...",
      tracks: [
        {
          name: "Song 1.mp3",
          url: "blob:..."
        }
      ]
    }
  ]
}
```

---

## What Happens on Each Device Visit

```
FIRST VISIT
├─ localStorage empty
├─ Check: token exists? NO
├─ Show login form
└─ User signs up / logs in

SECOND VISIT (Same device)
├─ localStorage has token
├─ Check: token exists? YES
├─ Verify token valid
├─ Load app (unlocked)
└─ User sees their albums

THIRD VISIT (Different device)
├─ localStorage empty
├─ Check: token exists? NO
├─ Show login form
├─ User logs in (same email/password)
├─ Backend finds account
├─ Returns new token
├─ Different device, same account ✓
└─ User can create new albums
```

---

## Example: Two Users

```
User A (Alice)                User B (Bob)
├─ Email: alice@example.com   ├─ Email: bob@example.com
├─ Password: alicepass        ├─ Password: bobpass
└─ Albums: [Album1, Album2]   └─ Albums: [Album3]

                SQLite Database
                ├─ alice@example.com | $hashed_password1
                └─ bob@example.com   | $hashed_password2

Alice's Phone:                Bob's Phone:
├─ Token: alice_token         ├─ Token: bob_token
├─ IndexedDB: [Album1, Album2]├─ IndexedDB: [Album3]
└─ Shows Alice's albums       └─ Shows Bob's albums

Alice's Desktop:              Bob's Desktop:
├─ Token: alice_token         ├─ Token: bob_token
├─ IndexedDB: (empty)         ├─ IndexedDB: (empty)
└─ Same account different devices
```

---

## That's How It Works!

- **Backend stores**: User credentials (emails + hashed passwords)
- **Frontend stores**: User tokens + local albums
- **Connection**: HTTPS API calls between GitHub Pages and Render
- **Result**: Same account works on any device ✓
