import { ApolloError } from 'apollo-server-core';
import { QueryResolvers } from '../../../generated/graphql-types';

const queryResolvers: QueryResolvers = {
  me: (_0, _1, ctx) => {
    if (!ctx.userId) return null;
    return ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
    });
  },
  movie: async (_, args, ctx) => {
    const movie = await ctx.prisma.movie.findUnique({
      where: { id: args.id },
    });

    if (!movie) throw new ApolloError('Movie not found!', 'NOT_FOUND');

    return movie;
  },
  movies: (_, args, ctx) => {
    return ctx.prisma.movie.findMany({
      orderBy: { [args.sort]: args.order },
      skip: (Math.abs(args.page) - 1) * Math.abs(args.limit),
      take: args.limit,
    });
  },
};

export default queryResolvers;
