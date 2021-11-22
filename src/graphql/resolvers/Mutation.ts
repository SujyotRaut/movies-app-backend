import { AuthenticationError, UserInputError } from 'apollo-server-core';
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
    const currentUser = await ctx.prisma.user.create({
      data: { ...args, password },
    });

    // Sign access token and refresh token
    const accessToken = signAccessToken({ userId: currentUser.id });
    const refreshToken = signRefreshToken({ userId: currentUser.id });

    return {
      accessToken,
      refreshToken,
      currentUser,
    };
  },
  login: async (_, args, ctx) => {
    // Check if the user with given email exist
    const currentUser = await ctx.prisma.user.findUnique({
      where: { email: args.email },
    });

    // Throw error if user does not exits
    if (!currentUser) throw new UserInputError(`Invalid email or password`);

    // Validate user credentials
    const valid = await bcrypt.compare(args.password, currentUser.password);
    if (!valid) throw new UserInputError(`Invalid email or password`);

    // Sign access token and refresh token
    const accessToken = signAccessToken({ userId: currentUser.id });
    const refreshToken = signRefreshToken({ userId: currentUser.id });

    return {
      accessToken,
      refreshToken,
      currentUser,
    };
  },
  logout: (_, args, ctx) => {
    if (!ctx.userId) throw new AuthenticationError('Unauthorized!');
    refreshTokens.delete(ctx.userId);
    return true;
  },
  refresh_token: async (_, args, ctx) => {
    const { userId } = verifyRefreshToken(args.refresh_token);
    const currentUser = await ctx.prisma.user.findUnique({
      where: { id: userId },
    });

    const accessToken = signAccessToken({ userId });
    const refreshToken = signRefreshToken({ userId });

    return {
      accessToken,
      refreshToken,
      currentUser,
    };
  },
} as MutationResolvers;
