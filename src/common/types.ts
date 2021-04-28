import { RowDataPacket } from 'mysql2/promise';

export type SQLRow<T> = T & RowDataPacket;
