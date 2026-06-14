import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HttpError } from '../types';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const flat = result.error.flatten();
      return next(new HttpError(400, 'Validation failed', flat.fieldErrors));
    }
    // Replace with parsed (and possibly coerced) data
    (req as unknown as Record<Source, unknown>)[source] = result.data;
    next();
  };
}
