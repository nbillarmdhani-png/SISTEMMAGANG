import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimit.js';

import authRoutes from './modules/auth/auth.routes.js';
import studentRoutes from './modules/students/students.routes.js';
import { studyProgramRouter, competencyRouter } from './modules/master/master.routes.js';
import positionRoutes from './modules/positions/positions.routes.js';
import chatbotRoutes from './modules/chatbot/chatbot.routes.js';
import recommendationRoutes from './modules/recommendations/recommendations.routes.js';
import applicationRoutes from './modules/applications/applications.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Security middlewares
app.set('trust proxy', 1); // Trust first proxy (Render, Nginx, dll) untuk rate limiter
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const rawOrigins = env.CLIENT_URL.includes(',')
  ? env.CLIENT_URL.split(',').map((u) => u.trim())
  : [env.CLIENT_URL.trim()];

// Buang trailing slash agar pencocokan origin CORS selalu akurat
const allowedOrigins = rawOrigins.map((u) => u.replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti curl, mobile app, postman, healthcheck)
    if (!origin) return callback(null, true);
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(generalLimiter);

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
const logFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Uploads dilayani melalui rute terautentikasi, bukan static publik

// API Routes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/study-programs', studyProgramRouter);
apiRouter.use('/competencies', competencyRouter);
apiRouter.use('/positions', positionRoutes);
apiRouter.use('/chat/sessions', chatbotRoutes);
apiRouter.use('/recommendations', recommendationRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
