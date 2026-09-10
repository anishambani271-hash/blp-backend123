const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
const VALID_TYPES = ['Problem', 'Suggestion', 'Grievance', 'Appreciation'];

// POST /api/desk — public: submitted by the People's Desk form
router.post('/', (req, res) => {
  const { type, message } = req.body || {};

  const cleanType = VALID_TYPES.includes(type) ? type : 'Problem';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (cleanMessage.length < 5) {
    return res.status(400).json({ error: 'Message must be at least 5 characters.' });
  }
  if (cleanMessage.length > 600) {
    return res.status(400).json({ error: 'Message must be 600 characters or fewer.' });
  }

  const insert = db.prepare(
    'INSERT INTO desk_submissions (type, message) VALUES (?, ?)'
  );
  const result = insert.run(cleanType, cleanMessage);

  res.status(201).json({ id: result.lastInsertRowid, type: cleanType });
});

// GET /api/desk/stats — public: aggregate numbers for the homepage
router.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM desk_submissions').get().c;
  const thisMonth = db
    .prepare(
      `SELECT COUNT(*) AS c FROM desk_submissions
       WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
    )
    .get().c;
  const topIssue = db
    .prepare(
      `SELECT type, COUNT(*) AS c FROM desk_submissions
       GROUP BY type ORDER BY c DESC LIMIT 1`
    )
    .get();

  res.json({
    total,
    thisMonth,
    topIssue: topIssue ? topIssue.type : null,
  });
});

// GET /api/desk — admin only: list all submissions
router.get('/', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM desk_submissions ORDER BY created_at DESC').all();
  res.json(rows);
});

// PATCH /api/desk/:id/status — admin only: mark reviewed/resolved etc.
router.patch('/:id/status', adminAuth, (req, res) => {
  const { status } = req.body || {};
  const allowed = ['pending', 'in_review', 'resolved', 'closed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }
  const result = db
    .prepare('UPDATE desk_submissions SET status = ? WHERE id = ?')
    .run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
