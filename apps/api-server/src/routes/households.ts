import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as service from '../services/household.service';
import { HttpError, ok } from '../types';

const router = Router();

const createSchema = z.object({
  houseNumber: z.string().min(1, 'houseNumber is required'),
  headOfFamily: z.string().min(1, 'headOfFamily is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(['Active', 'Vacant']).default('Active'),
  notes: z.string().optional().nullable(),
});

const updateSchema = createSchema.partial();

const idParam = z.object({ id: z.string().min(1) });

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.listHouseholds();
    res.json(ok(data));
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:id',
  validate(idParam, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await service.getHousehold(req.params.id);
      if (!data) throw new HttpError(404, 'Household not found');
      res.json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  validate(createSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await service.createHousehold(req.body);
      res.status(201).json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  validate(idParam, 'params'),
  validate(updateSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await service.updateHousehold(req.params.id, req.body);
      res.json(ok(data));
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  validate(idParam, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service.deleteHousehold(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
