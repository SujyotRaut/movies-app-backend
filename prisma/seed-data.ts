import fs from 'fs';
import path from 'path';
import { PrismaClient, Movie, Genre, Keyword } from '@prisma/client';

interface M extends Movie {
  more_like_this: any;
  gen: Array<{ id: number; genre: string }>;
  keywords: Array<{ id: number; keyword: string }>;
}

const movies = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './movies.json'), 'utf-8')
)['movies'] as M[];

const prisma = new PrismaClient();

async function main() {
  for (const movie of movies) await createMovie(movie);
  const m = await prisma.movie.count();
  console.log(`${m} / ${movies.length} Movies created`);
}

async function createMovie(m: M) {
  const genres = m.gen.map((genre) => ({
    where: { id: genre.id },
    create: { id: genre.id, genre: genre.genre },
  }));

  const keys = m.keywords.map((keyword) => ({
    where: { id: keyword.id },
    create: { id: keyword.id, keyword: keyword.keyword },
  }));

  const { gen, keywords, more_like_this, ...movie } = m;

  return await prisma.movie.upsert({
    where: { id: movie.id },
    update: {},
    create: {
      ...movie,
      genres: {
        connectOrCreate: [...genres],
      },
      keywords: {
        connectOrCreate: [...keys],
      },
    },
  });
}

try {
  main();
} catch (err) {
  console.log(err);
}
