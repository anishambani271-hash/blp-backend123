const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/stats/overview — public: numbers used to power the homepage impact strip
router.get('/overview', (req, res) => {
  const members = db.prepare('SELECT COUNT(*) AS c FROM members').get().c;
  const deskTotal = db.prepare('SELECT COUNT(*) AS c FROM desk_submissions').get().c;
  const deskThisMonth = db
    .prepare(
      `SELECT COUNT(*) AS c FROM desk_submissions
       WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
    )
    .get().c;
  const newsletter = db.prepare('SELECT COUNT(*) AS c FROM newsletter_subscribers').get().c;
  const statesReached = db
    .prepare(
      `SELECT COUNT(DISTINCT city) AS c FROM members WHERE city IS NOT NULL AND city != ''`
    )
    .get().c;

  res.json({
    members,
    deskTotal,
    deskThisMonth,
    newsletter,
    statesReached,
  });
});

module.exports = router;
