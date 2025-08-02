import { verifyToken } from './auth';
import { parse } from 'cookie';

export function getTokenFromReq(req) {
  const cookies = parse(req.headers.cookie || '');
  return cookies.auth_token || null;
}

export function requireAuth(handler) {
  return async (req, res) => {
    const token = getTokenFromReq(req);
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    return handler(req, res);
  };
}

export function requireAdmin(handler) {
  return requireAuth(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return handler(req, res);
  });
}