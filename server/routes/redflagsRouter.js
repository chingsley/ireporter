import { Router } from 'express';
import Validate from '../middleware/validator';
import RedflagsController from '../controllers/redflagsController';

const router = new Router();

router.post('/', Validate.newRedflag, RedflagsController.newRedflag);

/**
 * add more routes
 */

export default router;
