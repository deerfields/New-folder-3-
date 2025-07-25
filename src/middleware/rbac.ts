import { Request, Response, NextFunction } from 'express';
import { database } from '@/config/database';
import { IntegrationConfig } from '../models/IntegrationConfig';
import { UserRole } from '@/models/User';

const permissions: { [key: string]: UserRole[] } = {
  'GET_/api/integrations': [UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER],
  'POST_/api/integrations': [UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN],
  'PUT_/api/integrations/:id': [UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN],
  'DELETE_/api/integrations/:id': [UserRole.SUPER_ADMIN],
  'POST_/api/integrations/:id/sync': [UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN],
  'POST_/api/integrations/:id/test-connection': [UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN],
  'PUT_/api/integrations/:id/credentials': [UserRole.SUPER_ADMIN],
  'GET_/api/integrations/:id/logs': [UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER],
  'GET_/api/integrations/:id/errors': [UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN],
  'GET_/api/integrations/:id/status': [UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER],
};

export function authorizeIntegration(endpoint: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.role) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const allowedRoles = permissions[endpoint];
    if (!allowedRoles || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

export async function tenantAccess(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const integrationId = req.params.id;
  if (user.role === UserRole.SUPER_ADMIN) return next();
  const repo = database.getRepository(IntegrationConfig);
  const integration = await repo.findOne({ where: { id: integrationId }, relations: ['mall', 'tenant'] });
  if (!integration) {
    return res.status(404).json({ success: false, error: 'Integration not found' });
  }
  if (user.role === UserRole.MALL_ADMIN || user.role === UserRole.TENANT_ADMIN || user.role === UserRole.TENANT_USER) {
    if (integration.mall && integration.mall.id !== user.mall?.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: cross-mall access denied' });
    }
    if (integration.tenant && integration.tenant.id !== user.tenant?.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: cross-tenant access denied' });
    }
  }
  req.integration = integration;
  next();
} 