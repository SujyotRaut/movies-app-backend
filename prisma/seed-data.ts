import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

interface MovieJSON {
  id: any;
  title: any;
  year: any;
  popularity: any;
  description: any;
  content_rating: any;
  movie_length: any;
  rating: any;
  created_at: any;
  trailer: any;
  image_url: any;
  release: any;
  plot: any;
  banner: any;
  type: any;
  more_like_this: any;
  gen: Array<{ id: number; genre: string }>;
  keywords: Array<{ id: number; keyword: string }>;
}

const movies = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './movies.json'), 'utf-8')
)['movies'] as MovieJSON[];

const prisma = new PrismaClient();

async function main() {
  for (const movie of movies) await createMovie(movie);
  const movie = await prisma.movie.count();
  console.log(`${movie} / ${movies.length} Movies created`);
}

async function createMovie(movieJson: MovieJSON) {
  const genres = movieJson.gen.map((genre) => ({
    where: { id: genre.id },
    create: { id: genre.id, genre: genre.genre },
  }));

  const keys = movieJson.keywords.map((keyword) => ({
    where: { id: keyword.id },
    create: { id: keyword.id, keyword: keyword.keyword },
  }));

  const {
    content_rating: contentRating,
    created_at: createdAt,
    image_url: imageUrl,
    more_like_this,
    movie_length: movieLength,
    gen,
    keywords,
    ...movie
  } = movieJson;

  return await prisma.movie.upsert({
    where: { id: movieJson.id },
    update: {},
    create: {
      ...movie,
      contentRating,
      createdAt,
      imageUrl,
      movieLength,
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
