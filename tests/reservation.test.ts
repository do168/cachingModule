import { App } from '../src/App';
import { createTestClient } from 'apollo-server-testing';
import { getPool } from '../src/common/db';
import { gql } from 'apollo-server-express';
import { initDB } from '../src/common/createSchema';

const app = new App();
const server = app.buildServer();
const { query, mutate } = createTestClient(server);

const GET_RESERVATION = gql`
  query($id: ID!) {
    reservation {
      reservation(id: $id) {
        name
      }
    }
  }
`;

beforeAll(async () => {
  await initDB();
  const pool = getPool();

  // 0: THEME, 1: PRODUCT
  await pool.query(`INSERT INTO ReservationTest (name) VALUES ("test")`);

  console.log('test');
});

// afterAll(async () => {
//   const pool = getPool();
//   // cleanup
//   await pool.query(`DELETE FROM ReservationTest`);
//   await pool.query(`ALTER TABLE ReservationTest AUTO_INCREMENT = 1`);
//   await pool.end();
// })

describe('Reservation Queries', () => {
  test('find reservation', async () => {
    const res = await query({
      query: GET_RESERVATION,
      variables: {
        id: 1,
      },
    });
    expect(res?.data?.reservation?.reservation?.name).toBe('test');
  });
});
