const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../lib/database');
const { createToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/register
 * Register a new user.  Expects {name, email, password}.  The password
 * will be hashed before being stored.  On success returns a JWT and
 * basic user info.  If the email already exists the request fails.
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  db.get('SELECT id FROM Users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (row) return res.status(400).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, 'user'],
      function (err) {
        if (err) return res.status(500).json({ message: 'Failed to create user', error: err.message });
        const userId = this.lastID;
        const token = createToken({ id: userId, name, email, role: 'user' });
        return res.status(201).json({ token, user: { id: userId, name, email, role: 'user' } });
      },
    );
  });
});

/**
 * POST /api/login
 * Authenticate a user with email and password.  If the credentials
 * are valid a JWT is returned.  Otherwise a 401 error is thrown.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = createToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

module.exports = router;