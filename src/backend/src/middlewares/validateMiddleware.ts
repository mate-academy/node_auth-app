import express, { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validateMiddleware =
  (schema: ZodObject, source: 'body' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = source === 'body' ? req.body : req.query;
      schema.parse(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation Error',
          errors: error.issues.map((err) => ({
            field: err.path[0],
            message: err.message,
          })),
        });
      }
    }
  };
