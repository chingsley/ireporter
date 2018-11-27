import { Router } from 'express';
import Validator from '../middleware/validator';
import RedflagsController from '../controllers/redflagsController';
import multer from 'multer'

const router = new Router();

router.post('/', Validator.newRedflag, RedflagsController.newRedflag);

/**
 * add more routes...
 * get, patch, delete, ...
 */

export default router;
