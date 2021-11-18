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
    // check if user with the given email exist
    const isUserExist = await ctx.prisma.user.findUnique({
      where: { email: args.email },
    });

    // throw error if the user already exist
    if (isUserExist)
      throw new UserInputError(`User with email: ${args.email} already exist`);

    // hash password and save user to database
    const password = await bcrypt.hash(args.password, 10);
    const currentUser = await ctx.prisma.user.create({
      data: { ...args, password },
    });

    // sign access token and refresh token
    const accessToken = signAccessToken({ userId: currentUser.id });
    const refreshToken = signRefreshToken({ userId: currentUser.id });

    return {
      accessToken,
      refreshToken,
      currentUser,
    };
  },
  login: async (_, args, ctx) => {
    // check if the user with given email exist
    const currentUser = await ctx.prisma.user.findUnique({
      where: { email: args.email },
    });

    // throw error if user does not exits
    if (!currentUser) throw new ValidationError(`Invalid email or password`);

    // validate user credentials
    const valid = await bcrypt.compare(args.password, currentUser.password);
    if (!valid) throw new ValidationError(`Invalid email or password`);

    // sign access token and refresh token
    const accessToken = signAccessToken({ userId: currentUser.id });
    const refreshToken = signRefreshToken({ userId: currentUser.id });

    return {
      accessToken,
      refreshToken,
      currentUser,
    };
  },
  logout: (_, args, ctx) => {
    const { userId } = verifyRefreshToken(args.refresh_token);
    refreshTokens.delete(userId);
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
