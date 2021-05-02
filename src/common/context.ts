import { Request, Response } from 'express';

// reference: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
export interface ApolloContext {
  req: Request;
  res: Response;
}
