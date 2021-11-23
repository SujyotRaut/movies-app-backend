import { ApolloError, AuthenticationError } from 'apollo-server-core';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
  userId: string;
}

export const refreshTokens = new Map<string, string>();

export const signAccessToken = (payload: TokenPayload) => {
  try {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      issuer: 'movies-app',
      expiresIn: '15m',
    });
  } catch (error) {
    throw new ApolloError('Internal server error');
  }
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError)
      throw new ApolloError('Unauthorized! Token expired', 'TOKEN_EXPIRED');
    else return null;
  }
};

export const signRefreshToken = (payload: TokenPayload) => {
  try {
    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      issuer: 'movies-app',
      expiresIn: '1y',
    });

    // Save refresh token associated with user for blacklisting
    refreshTokens.set(payload.userId, token);

    return token;
  } catch (error) {
    throw new ApolloError('Internal server error');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const payload = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as TokenPayload;

    // Check if refresh token is valid
    if (token === refreshTokens.get(payload.userId)) return payload;

    // Throw error if refresh token is not valid
    throw new AuthenticationError('Unauthorized!');
  } catch (err) {
    throw new AuthenticationError('Unauthorized!');
  }
};
