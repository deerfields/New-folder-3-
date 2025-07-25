import { Request, Response, NextFunction } from 'express';
import { validationResult, Schema } from 'express-validator';

export const validate = (schema: Schema) => {
  return [
    ...Object.entries(schema).map(([field, config]) => {
      return (config as any)(field);
    }),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      res.status(400).json({ errors: errors.array() });
    },
  ];
};
