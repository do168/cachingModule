import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { schema } from './graphql/schemas';
import { errorHandler } from './graphql/errorHandlers';

export class App {
  private express: express.Application;
  private server: ApolloServer | null = null;
  private httpServer: http.Server | null = null;

  constructor() {
    this.express = express();
  }

  buildServer(): ApolloServer {
    return new ApolloServer({
      schema,
      formatError: errorHandler,
    });
  }

  async run(port: number): Promise<void> {
    this.server = this.buildServer();
    this.server.applyMiddleware({ app: this.express });
    this.httpServer = this.express.listen(port);
  }

  async close(): Promise<Error | undefined> {
    return new Promise((resolve, reject) => {
      this.httpServer?.close((err) => (err ? reject(err) : resolve(err)));
    });
  }
}
