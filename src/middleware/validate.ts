import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestError } from '../utils/AppError';

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError(
        result.error.issues.map(issue => issue.message).join(', ')
      );
    }

    req.body = result.data;
    next();
  };