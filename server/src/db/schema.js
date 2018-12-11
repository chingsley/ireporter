const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  // console.log('connected to the db...');
});

/**
 * Create users table
 */
const createTableUsers = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
        users(
            id serial PRIMARY KEY,
            firstname VARCHAR(50) NOT NULL,
            lastname VARCHAR(50) NOT NULL,
            othernames VARCHAR(50) DEFAULT NULL,
            username VARCHAR(50) NOT NULL,
            phonenumber VARCHAR(50) NOT NULL,
            email VARCHAR(128) UNIQUE NOT NULL,
            password VARCHAR(128) NOT NULL,
            picture TEXT DEFAULT NULL,
            registered TIMESTAMP,
            is_admin BOOLEAN NOT NULL

        )`;

  pool.query(queryText)
    .then((res) => {
      // console.log(res);
      pool.end();
    })
    .catch((err) => {
      // console.log(err);
      pool.end();
    });
};

/**
 * Create incidents Table
 */
const createTableIncidents = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
        incidents(
            id serial PRIMARY KEY,
            created_on TIMESTAMP,
            created_by serial NOT NULL,
            type TEXT NOT NULL,
            location TEXT NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'draft',
            images TEXT DEFAULT NULL,
            videos TEXT DEFAULT NULL,
            comment TEXT NOT NULL,
            FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
        )`;

  pool.query(queryText)
    .then((res) => {
      // console.log(res);
    })
    .catch((err) => {
      // console.log(err);
      pool.end();
    });
};


/**
 * Drop users Table
 */
const dropTableUsers = () => {
  const queryText = 'DROP TABLE IF EXISTS users';
  pool.query(queryText)
    .then((res) => {
      // console.log(res);
      pool.end();
    })
    .catch((err) => {
      // console.log(err);
      pool.end();
    });
};

/**
 * Drop incidents Table
 */
const dropTableIncidents = () => {
  const queryText = 'DROP TABLE IF EXISTS incidents';
  pool.query(queryText)
    .then((res) => {
      // console.log(res);
      pool.end();
    })
    .catch((err) => {
      // console.log(err);
      pool.end();
    });
};


/**
 * Create All Tables
 */
const createAllTables = () => {
  createTableUsers();
  createTableIncidents();
};

/**
 * Drop All Tables
 */
const dropAllTables = () => {
  dropTableUsers();
  dropTableIncidents();
};

pool.on('remove', () => {
  // console.log('table removed');
  process.exit(0);
});

module.exports = {
  createTableUsers,
  createTableIncidents,
  createAllTables,
  dropTableUsers,
  dropTableIncidents,
  dropAllTables,
};

require('make-runnable');
