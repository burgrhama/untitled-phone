const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-change-this-in-production';

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initDB();
  }
});

function initDB() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// ===== SIGNUP ROUTE =====
app.post('/api/signup', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Validation
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '7d' });
      res.status(201).json({ message: 'Account created successfully', token, email });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== LOGIN ROUTE =====
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ email: user.email, id: user.id }, SECRET_KEY, { expiresIn: '7d' });
      res.json({ message: 'Login successful', token, email: user.email });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// ===== PROTECTED ROUTE (Example) =====
app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: 'Profile accessed', email: decoded.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
