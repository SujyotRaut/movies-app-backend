import { Resolvers } from '../../../generated/graphql-types';
import Movie from './Movie';
import Mutation from './Mutation';
import Query from './Query';
import User from './User';

const resolvers: Resolvers = {
  Query,
  Mutation,
  Movie,
  User,
};

export default resolvers;
