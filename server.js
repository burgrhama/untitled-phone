const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-production';

// Middleware - CORS first
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Then JSON parser
app.use(express.json({ limit: '50mb' }));

// Error handler for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

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

  db.run(`
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      cover LONGTEXT,
      tracks LONGTEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

// ===== AUTH MIDDLEWARE =====
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ===== SIGNUP ROUTE =====
app.post('/api/signup', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already registered' });
        }
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '7d' });
      res.status(201).json({ message: 'Account created successfully', token, email });
    });
  } catch (error) {
    console.error('Signup error:', error);
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
      console.error('Database error:', err);
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
      res.json({ message: 'Login successful', token, email: user.email, id: user.id });
    } catch (error) {
      console.error('Password compare error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// ===== GET ALL ALBUMS FOR USER =====
app.get('/api/albums', verifyToken, (req, res) => {
  db.all(
    'SELECT id, name, cover, tracks FROM albums WHERE user_id = (SELECT id FROM users WHERE email = ?)',
    [req.user.email],
    (err, albums) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Parse tracks JSON
      const parsedAlbums = albums.map(album => ({
        id: album.id,
        name: album.name,
        cover: album.cover,
        tracks: album.tracks ? JSON.parse(album.tracks) : []
      }));

      res.json(parsedAlbums);
    }
  );
});

// ===== CREATE ALBUM =====
app.post('/api/albums', verifyToken, (req, res) => {
  const { name } = req.body;

  db.get('SELECT id FROM users WHERE email = ?', [req.user.email], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: 'User not found' });
    }

    db.run(
      'INSERT INTO albums (user_id, name, tracks) VALUES (?, ?, ?)',
      [user.id, name || 'untitled project', JSON.stringify([])],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: this.lastID, name: name || 'untitled project', cover: null, tracks: [] });
      }
    );
  });
});

// ===== UPLOAD TRACK FILE =====
app.post('/api/upload-track', verifyToken, upload.single('track'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const origin = `${req.protocol}://${req.get('host')}`;
  const url = `${origin}/uploads/${encodeURIComponent(req.file.filename)}`;
  res.json({ name: req.file.originalname, url });
});

// ===== UPDATE ALBUM =====
app.put('/api/albums/:id', verifyToken, (req, res) => {
  const { name, cover, tracks } = req.body;
  const albumId = req.params.id;

  db.run(
    'UPDATE albums SET name = ?, cover = ?, tracks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = (SELECT id FROM users WHERE email = ?)',
    [name, cover, JSON.stringify(tracks), albumId, req.user.email],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Album not found' });
      }

      res.json({ message: 'Album updated' });
    }
  );
});

// ===== DELETE ALBUM =====
app.delete('/api/albums/:id', verifyToken, (req, res) => {
  const albumId = req.params.id;

  db.run(
    'DELETE FROM albums WHERE id = ? AND user_id = (SELECT id FROM users WHERE email = ?)',
    [albumId, req.user.email],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Album not found' });
      }

      res.json({ message: 'Album deleted' });
    }
  );
});

// ===== STATIC FILES & FRONTEND (LAST) =====

// Static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== START SERVER =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
