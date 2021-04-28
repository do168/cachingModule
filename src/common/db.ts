import config from 'config';
import { createPool, Pool, PoolOptions } from 'mysql2/promise';

const pool = createPool(config.get('database') as PoolOptions);

export const getPool = (): Pool => pool;
