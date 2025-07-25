import { body } from 'express-validator';

export const workPermitSchema = {
  tenantId: body('tenantId').isUUID(),
  mallId: body('mallId').isUUID(),
  type: body('type').isString(),
  status: body('status').isString(),
  riskLevel: body('riskLevel').isString(),
  category: body('category').isString(),
  workDescription: body('workDescription').isString(),
  startDate: body('startDate').isISO8601(),
  endDate: body('endDate').isISO8601(),
};

export const updateWorkPermitSchema = {
  tenantId: body('tenantId').optional().isUUID(),
  mallId: body('mallId').optional().isUUID(),
  type: body('type').optional().isString(),
  status: body('status').optional().isString(),
  riskLevel: body('riskLevel').optional().isString(),
  category: body('category').optional().isString(),
  workDescription: body('workDescription').optional().isString(),
  startDate: body('startDate').optional().isISO8601(),
  endDate: body('endDate').optional().isISO8601(),
};

export const approveWorkPermitSchema = {
  comments: body('comments').optional().isString(),
};
