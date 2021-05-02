import config from 'config';
import fs from 'fs';
import path from 'path';
import { createConnection } from 'mysql2/promise';

export async function initDB(): Promise<void> {
  const sql = (await fs.promises.readFile(path.resolve(__dirname, '../internals/schema.sql')))
    .toString()
    .replace(/(?<!\.)`Reservation`/g, '`ReservationTest`');

  const { host, user, password } = config.get('database');

  const connection = await createConnection({
    host,
    user,
    password,
    multipleStatements: true,
  });

  await connection.query('DROP DATABASE IF EXISTS ReservationTest');
  await connection.query(sql);
  await connection.end();
}
