import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

const PORT = process.env.PORT || 4000;

// Start server after DB connects
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to DB error:', error);
    process.exit(1);
  });


