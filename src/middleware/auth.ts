/**
 * MallOS Enterprise - Auth Middleware
 * Route protection, RBAC, session, and MFA enforcement
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/AuthService';
import { User, UserRole } from '@/models/User';
import { database } from '@/config/database';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing authentication token' });
  }
  try {
    const payload = AuthService.verifyToken(token);
    database.getRepository(User).findOne({ where: { id: payload.sub } }).then(user => {
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }
      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function tokenRefreshEndpoint(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Missing refresh token' });
  }
  try {
    const payload = AuthService.verifyToken(refreshToken);
    if (payload.type !== 'refresh') {
      return res.status(400).json({ success: false, error: 'Invalid refresh token type' });
    }
    database.getRepository(User).findOne({ where: { id: payload.sub } }).then(user => {
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      const accessToken = AuthService.generateAccessToken(user);
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'lax' });
      res.json({ success: true, accessToken });
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
  }
}

export function authorize(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ message: 'Missing session' });
  }
  const session = await AuthService.getSession(sessionId);
  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
  req.session = session;
  next();
}

export async function requireMfa(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.mfaEnabled) {
    return res.status(401).json({ message: 'MFA required' });
  }
  next();
}

// Alias for backwards compatibility
export const authMiddleware = authenticate;
