import { Request } from 'express';
import { AuthenticationError } from 'apollo-server-core';
import { verifyAccessToken } from './jwt-utils';

export function getUserId(req: Request) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return;
  const token = authHeader.split(' ')[1];

  if (!token) throw new AuthenticationError('Unauthorized');

  const { userId } = verifyAccessToken(token);
  return userId;
}
