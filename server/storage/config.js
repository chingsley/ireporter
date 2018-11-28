import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const usersDotJason = env === 'test' ? 'users__test.json' : 'users.json';
const redflagsDotJason = env === 'test' ? 'redflags__test.json' : 'redflags.json';

export {
    usersDotJason,
    redflagsDotJason,
};