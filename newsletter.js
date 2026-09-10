const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter — public: subscribe an email address
router.post('/', (req, res) => {
  const { email } = req.body || {};
  const clean = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!EMAIL_RE.test(clean)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(clean);
  } catch (err) {
    // UNIQUE constraint — already subscribed, treat as success (idempotent)
    if (!String(err.message).includes('UNIQUE')) throw err;
  }

  res.status(201).json({ ok: true, email: clean });
});

// GET /api/newsletter — admin only: list all subscribers
router.get('/', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC').all();
  res.json(rows);
});

module.exports = router;
