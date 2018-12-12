import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const pool = new Pool({
  connectionString: env === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL,
});

export default pool;
