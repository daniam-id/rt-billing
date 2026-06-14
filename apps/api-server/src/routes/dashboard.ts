import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as service from '../services/dashboard.service';
import { ok } from '../types';

const router = Router();

const querySchema = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'period must be YYYY-MM'),
});

router.get(
  '/',
  validate(querySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await service.getDashboard(req.query.period as string);
      res.json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

router.get('/periods', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.listAvailablePeriods();
    res.json(ok(data));
  } catch (err) {
    next(err);
  }
});

export default router;
