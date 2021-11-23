import { UserResolvers } from '../../../generated/graphql-types';

export default {
  watchlist: (user, _, ctx) => {
    return ctx.prisma.user
      .findUnique({ where: { id: user.id }, select: { watchlist: true } })
      .watchlist();
  },
} as UserResolvers;
