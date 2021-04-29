import { gql } from 'apollo-server-express';
import { GraphQLScalarType, Kind } from 'graphql';
import { checkCorrectDateFormat } from '../../common/util';

export const commonTypeDef = gql`
  scalar Instant
`;

export const commonResolvers = {
  Instant: new GraphQLScalarType({
    name: 'Instant',
    description: 'Instant custom scalar type',
    parseValue(value) {
      if (typeof value === 'string' && checkCorrectDateFormat(value)) {
        return new Date(value);
      }
      return new Date(value);
    },
    serialize(value) {
      if (typeof value === 'string') {
        return new Date(value).toISOString();
      }
      return value.toISOString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING && ast.value !== undefined) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};
