import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
// import fs from 'fs';

// Import your routers here
import redflagsRouter from './routes/redflagsRouter';
import authRouter from './routes/authRouter';

dotenv.config();
const app = express();

// Enable CORS (Cross Origin ...)
app.use(cors());

// Enable the rendering of ui templates
app.use(express.static('ui'));

// Configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//  Route to get uploaded images
app.use('/uploads', express.static('uploads'));

// Define your routes here
app.use('/api/v1/redflags', redflagsRouter);
app.use('/api/v1/auth', authRouter);

// Handle all unknown routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    error: 'route not found',
  });
});


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT} ...`);
});

export default app;
