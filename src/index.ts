import config from 'config';
import { App } from './App';

const app: App = new App();
const port = parseInt(process.env.PORT || config.get('server.port'));

app
  .run(port)
  .then(() => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
  })
  .catch((e) => {
    console.error(`Server error: ${e}`);
    process.exit(9);
  });

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');

  app
    .close()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
});
