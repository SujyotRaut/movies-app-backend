import { PrismaClient } from '@prisma/client';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { Resolvers } from '../generated/graphql-types';
import { resolvers, typeDefs } from './graphql';
import { getUserId } from './utils/auth-utils';

export type Context = {
  req: express.Request;
  prisma: PrismaClient;
  userId?: string;
};

const prisma = new PrismaClient();

async function startApolloServer(typeDefs: string, resolvers: Resolvers) {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return {
        req,
        prisma,
        userId: getUserId(req),
      } as Context;
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers);
