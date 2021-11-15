import { UserInputError, ValidationError } from 'apollo-server-core';
import bcrypt from 'bcrypt';
import { MutationResolvers } from '../../../generated/graphql-types';
import {
  refreshTokens,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt-utils';

export default {
  register: async (_, args, ctx) => {
    // Check if user with the given email exist
    const isUserExist = await ctx.prisma.user.findUnique({
      where: { email: args.email },
    });

    // Throw error if the user already exist
    if (isUserExist)
      throw new UserInputError(`User with email: ${args.email} already exist`);

    // Hash password and save user to database
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.prisma.user.create({
      data: { ...args, password },
    });

    // Sign access token and refresh token
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
    };
  },
  login: async (_, args, ctx) => {
    // Check if the user with given email exist
    const user = await ctx.prisma.user.findUnique({
      where: { email: args.email },
    });

    // Throw error if user does not exits
    if (!user) throw new ValidationError(`Invalid email or password`);

    // Validate user credentials
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) throw new ValidationError(`Invalid email or password`);

    // Sign access token and refresh token
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
    };
  },
  logout: (_, args, ctx) => {
    const { userId } = verifyRefreshToken(args.refresh_token);
    refreshTokens.delete(userId);
    return true;
  },
  refresh_token: (_, args, ctx) => {
    const { userId } = verifyRefreshToken(args.refresh_token);

    const accessToken = signAccessToken({ userId });
    const refreshToken = signRefreshToken({ userId });

    return {
      accessToken,
      refreshToken,
    };
  },
} as MutationResolvers;
