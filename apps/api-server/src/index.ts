import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { HttpError, ok } from './types';

const app = express();

// Security & parsing
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check (public)
app.get('/health', (_req: Request, res: Response) => {
  res.json(ok({ status: 'ok', timestamp: new Date().toISOString() }));
});

// Public auth route
app.use('/api/v1/auth', authRoutes);

// All other routes require JWT
app.use('/api/v1', requireAuth);

// Mount protected route modules here (Task 4)
import householdRoutes from './routes/households';
import billingRoutes from './routes/billing';
import dashboardRoutes from './routes/dashboard';
app.use('/api/v1/households', householdRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 for unknown routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.path}`));
});

// Global error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 API server listening on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   CORS origin: ${env.CORS_ORIGIN}`);
});

export default app;
