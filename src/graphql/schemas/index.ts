import { buildFederatedSchema } from '@apollo/federation';
import { gql } from 'apollo-server-express';
import { commonResolvers, commonTypeDef } from './commonSchema';
import { reservationResolvers, reservationTypeDef } from './reservationSchema';

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
    reservation: () => ({}),
  },
  Mutation: {
    _empty: () => 'ping',
  },
  ReservationContainer: {
    _empty: () => 'ping',
  },
};

export const schema = buildFederatedSchema([
  { typeDefs: baseTypeDef, resolvers },
  { typeDefs: commonTypeDef, resolvers: commonResolvers },
  { typeDefs: reservationTypeDef, resolvers: reservationResolvers as any },
]);
