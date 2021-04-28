import { buildFederatedSchema } from '@apollo/federation';
import { gql } from 'apollo-server-express';

const baseTypeDef = gql`
  type ReservationContainer {
    _empty: String!
  }

  type Query {
    reservation: ReservationContainer!
  }

  type Mutation {
    _empty: String!
  }
`;

const resolvers = {
  Query: {
    collection: () => ({}),
  },
  Mutation: {
    _empty: () => 'ping',
  },
  ReservationContainer: {
    _empty: () => 'ping',
  },
};

export const schema = buildFederatedSchema([{ typeDefs: baseTypeDef, resolvers }]);
