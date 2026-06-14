import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '../types';
import { env } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      ok: false,
      error: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ ok: false, error: 'Unique constraint violation' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ ok: false, error: 'Record not found' });
      return;
    }
  }

  console.error('[unhandled]', err);
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : String(err);
  res.status(500).json({ ok: false, error: message });
}
