import { Router } from 'express';
import multer from 'multer';
// import Inspect from '../middleware/inspector';
import Inspect from '../middleware/authInspector';
import AuthController from '../controllers/authController';
import AuthHandler from '../middleware/authHandler';

const router = new Router();

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './uploads');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    callback(null, true); // accept the file
  } else {
    callback(null, false); // reject the file: don't save the file, but do not throw an error
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter,
});

router.post('/signup', upload.single('picture'), Inspect.signup, AuthController.signup, AuthController.signin, AuthHandler.generateAuthToken);
router.post('/login', upload.none(), Inspect.signin, AuthController.signin, AuthHandler.generateAuthToken);

export default router;
