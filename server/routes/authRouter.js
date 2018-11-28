import { Router } from 'express';
import multer from 'multer';
import Validator from '../middleware/validator';
import AuthController from '../controllers/authController';
// import AuthHandler from '../middleware/authHandler';

const router = new Router();

// multer makes it possible to send req using form-data
const upload = multer();

// define the routes
router.post('/signup', upload.none(), Validator.signup, AuthController.signup);


export default router;
