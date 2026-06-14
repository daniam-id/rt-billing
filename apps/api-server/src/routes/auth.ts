import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as authService from '../services/auth.service';
import { HttpError, ok } from '../types';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
});

router.post(
  '/login',
  validate(loginSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(ok(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      next(new HttpError(401, message));
    }
  }
);

export default router;
