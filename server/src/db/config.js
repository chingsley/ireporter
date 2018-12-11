import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

// I don't need this for test, it is done in package.json.
// This is used only when I want to access the test database directly from postman
// const env = 'test';

// const pool = env === 'test' ? new Pool({ connectionString: process.env.TEST_DATABASE_URL }) : new Pool({ connectionString: process.env.DATABASE_URL });

const pool = new Pool({
  // connectionString: env === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL
  connectionString: env === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL,
});

// const pool = new Pool({
//     connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
// });


export default pool;
