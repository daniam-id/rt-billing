import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as service from '../services/billing.service';
import { ok } from '../types';

const router = Router();

const periodSchema = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'period must be YYYY-MM'),
});

const meterSchema = z.object({
  initialMeter: z.number().int().nonnegative(),
  finalMeter: z.number().int().nonnegative(),
  notes: z.string().optional().nullable(),
});

const idParam = z.object({ id: z.string().min(1) });

// Initialize a new period
router.post(
  '/initialize',
  validate(periodSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await service.initializePeriod(req.body.period);
      res.status(201).json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

// Reset (delete) a period's records if no paid ones
router.delete(
  '/reset/:period',
  validate(periodSchema.pick({ period: true }), 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await service.resetPeriod(req.params.period);
      res.json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

// Update PDAM meter
router.put(
  '/meter/:id',
  validate(idParam, 'params'),
  validate(meterSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await service.updateMeter(req.params.id, req.body);
      res.json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

// Mark paid
router.put(
  '/pay/:id',
  validate(idParam, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await service.markPaid(req.params.id);
      res.json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

// List records (optional ?period=YYYY-MM)
router.get(
  '/records',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = typeof req.query.period === 'string' ? req.query.period : undefined;
      const data = await service.listRecords(period);
      res.json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
