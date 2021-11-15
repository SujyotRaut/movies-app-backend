import fs from 'fs';
import path from 'path';

export let typeDefs = '';
export { default as resolvers } from './resolvers';
export const schemaPath = path.resolve(__dirname, 'schema.graphql');

const typeDefsPath = path.resolve(__dirname, 'typedefs');
const files = fs.readdirSync(typeDefsPath);

files.forEach((file) => {
  const p = path.resolve(typeDefsPath, file);
  if (p.endsWith('.gql') || p.endsWith('.graphql')) {
    typeDefs += fs.readFileSync(p, 'utf-8') + '\n';
  }
});

fs.writeFileSync(schemaPath, typeDefs);
