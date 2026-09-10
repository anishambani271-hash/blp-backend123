require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const membersRouter = require('./routes/members');
const deskRouter = require('./routes/desk');
const newsletterRouter = require('./routes/newsletter');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 4000;

// ---- Security & parsing ----
app.use(helmet());
app.use(express.json({ limit: '20kb' }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow same-origin / server-to-server calls (no Origin header) and configured origins
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);

// ---- Rate limiting for the public write endpoints (anti-spam) ----
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/members', writeLimiter);
app.use('/api/desk', writeLimiter);
app.use('/api/newsletter', writeLimiter);

// ---- Routes ----
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/members', membersRouter);
app.use('/api/desk', deskRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/stats', statsRouter);

// ---- 404 & error handling ----
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`BLP backend running on http://localhost:${PORT}`);
});
