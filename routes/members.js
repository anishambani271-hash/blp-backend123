const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

function generateMemberId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `BLP-${year}-${rand}`;
}

// POST /api/members  — public: submitted by the "Join Us" form
router.post('/', (req, res) => {
  const { name, city, role } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ error: 'Name is too long.' });
  }

  const cleanName = name.trim();
  const cleanCity = (city || '').trim().slice(0, 100) || 'India';
  const cleanRole = ['Supporter', 'Volunteer', 'Youth Wing', 'Booth Worker'].includes(role)
    ? role
    : 'Supporter';

  let memberId = generateMemberId();
  const insert = db.prepare(
    'INSERT INTO members (member_id, name, city, role) VALUES (?, ?, ?, ?)'
  );

  // Extremely unlikely collision on the 6-digit random suffix — retry once if it happens
  try {
    insert.run(memberId, cleanName, cleanCity, cleanRole);
  } catch (err) {
    memberId = generateMemberId();
    insert.run(memberId, cleanName, cleanCity, cleanRole);
  }

  res.status(201).json({ memberId, name: cleanName, city: cleanCity, role: cleanRole });
});

// GET /api/members/count — public: total member count for stats/counters
router.get('/count', (req, res) => {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM members').get();
  res.json({ count });
});

// GET /api/members — admin only: list all members
router.get('/', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM members ORDER BY created_at DESC').all();
  res.json(rows);
});

module.exports = router;
