import { Request } from 'express';
import { verifyAccessToken } from './jwt-utils';

export function getUserId(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);
  if (!payload) return null;

  return payload.userId;
}
