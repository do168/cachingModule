import { ResultSetHeader } from 'mysql';
import { Pool } from 'mysql2/promise';
import { getPool } from '../common/db';
import { SQLRow } from '../common/types';
import { Reservation } from '../model/reservation';

export class ReservationRepository {
  pool: Pool;

  constructor() {
    this.pool = getPool();
  }
  async findById(id: number): Promise<Reservation> {
    const [rows] = await this.pool.query<SQLRow<Reservation>[]>(
      `SELECT
                *
            FROM
                Reservation
            WHERE
                id = ?;
            `,
      [id],
    );
    return rows[0];
  }

  async findAll(): Promise<Reservation[]> {
    const [reservations] = await this.pool.query<SQLRow<Reservation>[]>(
      `SELECT
                *
            FROM
                Reservation;
            `,
    );
    return reservations;
  }

  async create(name: string): Promise<number> {
    const fields: Record<string, unknown> = {
      name,
    };
    const columns = Object.keys(fields);
    const values = columns.map((column) => fields[column]);
    const sql = `INSERT INTO Reservation(
            ??
          )
          VALUES(
            ?
          );
          `;
    const [reservationResult] = await this.pool.query<ResultSetHeader>(sql, [columns, values]);
    const { insertId } = reservationResult;
    return insertId;
  }
}
