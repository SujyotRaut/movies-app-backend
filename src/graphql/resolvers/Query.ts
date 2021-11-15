import { QueryResolvers } from '../../../generated/graphql-types';

export default {
  me: (_, args, ctx) => {
    if (!ctx.userId) return null;
    return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
  },
  movie: (_, args, ctx) => {
    return ctx.prisma.movie.findUnique({
      where: { id: args.id },
      include: { genres: true, keywords: true },
    });
  },
  movies: (_, args, ctx) => {
    return ctx.prisma.movie.findMany({
      orderBy: { [args.sort]: args.order },
      skip: (Math.abs(args.page) - 1) * Math.abs(args.limit),
      take: args.limit,
      include: { genres: true, keywords: true },
    });
  },
} as QueryResolvers;
