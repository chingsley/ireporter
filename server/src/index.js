import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import authRouter from './routes/authRouter';
import redflagsRouter from './routes/redflagsRouter';
import interventionsRouter from './routes/interventionsRouter';

dotenv.config();
const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.static('ui'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/red-flags', redflagsRouter);
app.use('/api/v1/interventions', interventionsRouter);


/** handle unknown routes in my server */
app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    error: 'the specified route cannot be found on this server',
  });
});

app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT} ...`);
});

export default app;
