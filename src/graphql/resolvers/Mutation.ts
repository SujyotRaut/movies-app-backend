import { AuthenticationError, UserInputError } from 'apollo-server-core';
import bcrypt from 'bcrypt';
import { MutationResolvers } from '../../../generated/graphql-types';
import {
  refreshTokens,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt-utils';

const mutationResolvers: MutationResolvers = {
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

    // // Sign access token and refresh token
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
  logout: (_0, _1, ctx) => {
    if (!ctx.userId) throw new AuthenticationError('Unauthorized!');
    refreshTokens.delete(ctx.userId);
    return true;
  },
  refresh: async (_, args, ctx) => {
    const { userId } = verifyRefreshToken(args.refreshToken);

    const currentUser = await ctx.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser)
      throw new AuthenticationError('Unauthorized! User does not exits');

    const accessToken = signAccessToken({ userId });
    const refreshToken = signRefreshToken({ userId });

    return {
      accessToken,
      refreshToken,
      currentUser,
    };
  },
  addToWatchlist: async (_, args, ctx) => {
    if (!ctx.userId) throw new AuthenticationError('Unauthorized!');

    await ctx.prisma.user.update({
      where: { id: ctx.userId },
      data: { watchlist: { connect: { id: args.id } } },
    });

    return args.id;
  },
  removeFromWatchlist: async (_, args, ctx) => {
    if (!ctx.userId) throw new AuthenticationError('Unauthorized!');

    await ctx.prisma.user.update({
      where: { id: ctx.userId },
      data: { watchlist: { disconnect: { id: args.id } } },
    });

    return args.id;
  },
};

export default mutationResolvers;
