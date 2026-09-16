import cors from 'cors';
import express from 'express';
import { env } from './env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { authRouter } from './routes/auth.js';
import { publicShareRouter, sharesRouter } from './routes/shares.js';
import { subjectsRouter } from './routes/subjects.js';
import { topicsRouter } from './routes/topics.js';
import { pool } from './db/pool.js';

const app = express();

app.use(cors({ origin: env.clientOrigin.split(',').map((o) => o.trim()) }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: (err as Error).message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/shares', sharesRouter);
app.use('/api/share', publicShareRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`→ API ishga tushdi: http://localhost:${env.port}/api`);
});
