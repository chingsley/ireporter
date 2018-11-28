import { Router } from 'express';
import Validator from '../middleware/validator';
import RedflagsController from '../controllers/redflagsController';
import multer from 'multer';

const router = new Router();

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, './uploads');
    },
    filename(req, file, callback) {
        callback(null, file.originalname);
    }
});
const fileFilter = (req, file, callback) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'video/mp4') {
        callback(null, true); // ie. accept the file
    } else {
        callback(null, false); // reject the file. Don't save the file, but don't throw an error
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 50
    },
    fileFilter
});

const fileUpload = upload.fields([{name: 'images', maxCount: 8}, {name: 'videos', maxCount: 8}]);
// router.post('/', upload.single('Image'), Validator.newRedflag, RedflagsController.newRedflag);
router.post('/', fileUpload, Validator.newRedflag, RedflagsController.newRedflag);



/**
 * add more routes...
 * get, patch, delete, ...
 */

export default router;
