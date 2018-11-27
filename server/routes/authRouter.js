import { Router } from 'express';
import Validator from '../middleware/validator';
import AuthController from '../controllers/authController';
// import AuthHandler from '../middleware/authHandler';

const router = new Router();

// define the routes
router.post('/signup', Validator.signup, AuthController.signup);


export default router;
