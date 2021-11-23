import { MovieResolvers } from '../../../generated/graphql-types';

const movieResolvers: MovieResolvers = {
  genres: (movie, _, ctx) => {
    return ctx.prisma.movie
      .findUnique({
        where: { id: movie.id },
        select: { genres: true },
      })
      .genres();
  },
  keywords: (movie, _, ctx) => {
    return ctx.prisma.movie
      .findUnique({
        where: { id: movie.id },
        select: { keywords: true },
      })
      .keywords();
  },
};

export default movieResolvers;
