/**eslint-disabled */
import jwt from 'jsonwebtoken';
import pool from '../../src/db/config';

const users = {
    admin: {
        id: 1,
        firstname: 'kingsley',
        lastname: 'eneja',
        phoneNumber: '09063550695',
        email: 'eneja.kc@gmail.com',
        password: 'kingsley',
        confirmPassword: 'kingsley',
        adminSecret: 'nimdamai',
        username: 'enejakc'
    },
    validUserOne: {
        id: 2,
        firstname: 'john',
        lastname: 'snow',
        username: 'crow',
        phoneNumber: '08023875011',
        email: 'johnsnow@gmail.com',
        password: 'johnsnow',
        confirmPassword: 'johnsnow',
        adminSecret: '',
    },
    validUserTwo: {
        id: 3,
        firstname: 'theon',
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '0808822928',
        email: 'theongreyjoy@gmail.com',
        password: 'theongreyjoy',
        confirmPassword: 'theongreyjoy',
        adminSecret: '',
    },
    validUserInvalidPassword: {
        email: 'johnsnow@gmail.com',
        password: 'this-is-not-his-password',
    },
    unregisteredUser: {
        email: 'unregistered@gmail.com',
        password: 'he-is-not-registered',
    },
    invalidUserNoData: {},
    invalidUserNoFirstname: {
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '0808822928',
        email: 'theongreyjoy@gmail.com',
        password: 'theon',
        confirmPassword: 'theon',
    },
    invalidUserNoEmail: {
        firstname: 'theon',
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '0808822928',
        password: 'theon',
        confirmPassword: 'theon',
        adminSecret: '',
    },
    invalidUserNoPass: {
        firstname: 'theon',
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '0808822928',
        email: 'theongreyjoy@gmail.com',
        adminSecret: '',
    },
    invalidUserMissmatchedPassword: {
        firstname: 'theon',
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '0808822928',
        email: 'theongreyjoy@gmail.com',
        password: 'theon',
        confirmPassword: 'nottheon',
        adminSecret: '',
    },
    incorrectFirstname: {
        firstname: 't', // firstname less than 2 characters
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '0808822928',
        email: 'theongreyjoy@gmail.com',
        password: 'theon',
        confirmPassword: 'theon',
        adminSecret: ''
    },
    incorrectLastname: {
        firstname: 'theon', 
        lastname: 'g', // lastname less than 2 characters
        username: 'ironborne',
        phoneNumber: '0808822928',
        email: 'theongreyjoy@gmail.com',
        password: 'theon',
        confirmPassword: 'theon',
        adminSecret: ''
    },
    incorrectEmail: {
        firstname: 'theon', 
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '0808822928',
        email: 'kc@-gmail.com ', // email: leading dash in front of domain is not allowed
        password: 'theon',
        confirmPassword: 'theon',
        adminSecret: ''
    },
    passwordTooShort: {
        firstname: 'theon', 
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '0808822928',
        email: 'eneja.kc@gmail.com ',
        password: 'theo',
        confirmPassword: 'theo',
        adminSecret: ''
    },

    invalidPhoneNumber: {
        firstname: 'theon', 
        lastname: 'greyjoy',
        username: 'ironborne',
        phoneNumber: '08088a22928', // phone number cannot contain characters
        email: 'eneja.kc@gmail.com ',
        password: 'theo',
        confirmPassword: 'theo',
        adminSecret: ''
    },
};

/**
 * @function generateValidToken - generates a valid JWT based on the user details object passed in
 * @param {Object} userObject - the details of the user
 * @returns {String} - a valid, signed, JSON Web Token
 *
 */
function generateValidToken(userObject) {
    return jwt.sign({
        userId: userObject.id,
        userName: userObject.firstname,
        userEmail: userObject.email,
        userStatus: userObject.adminSecret === process.env.ADMIN_SECRET ? 'admin' : 'customer',
    }, process.env.JWT_SECRET).toString();
}

/**
 * @async
 * @function dropAndRecreateTables - purges the database data
 */
const dropAndRecreateTables = async () => {
    const dropUsersTableQuery = 'DROP TABLE IF EXISTS users CASCADE';
    const dropIncidentsTableQuery = 'DROP TABLE IF EXISTS incidents CASCADE';

    const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS
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

    const createIncidentsTableQuery = `CREATE TABLE IF NOT EXISTS
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

    await pool.query(dropUsersTableQuery);
    await pool.query(dropIncidentsTableQuery);
    await pool.query(createUsersTableQuery);
    await pool.query(createIncidentsTableQuery);
};

/**
 * @async
 * @function populateMenu - adds two food items to the database
 */
const populateIncidents = async () => {
    const dbQuery = `INSERT INTO incidents(created_by, type, location, status, comment)
    VALUES
    (1, 'red-flag', '2.989887, 9.7979799', 'draft', 'just testing the system'),
    (2, 'intervention', '2.55566, 6.55654', 'draft', 'another testing performed');`; 
    await pool.query(dbQuery);
};

export {
    users,
    dropAndRecreateTables,
    populateIncidents,
    generateValidToken,
};
