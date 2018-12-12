import { Router } from 'express';
import multer from 'multer';
// import Inspector from '../middleware/inspector';
import Inspector from '../middleware/recordsInspector';
import InterventionsController from '../controllers/interventionsController';
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
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'video/mp4') {
    callback(null, true); // ie. accept the file
  } else {
    callback(null, false); // reject the file. Don't save the file, but don't throw an error
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
  fileFilter,
});

const fileUpload = upload.fields([{ name: 'images', maxCount: 8 }, { name: 'videos', maxCount: 8 }]);

router.post('/', fileUpload, AuthHandler.authorize, Inspector.newRecord, InterventionsController.newIntervention);
router.get('/', AuthHandler.authorize, Inspector.getAll, InterventionsController.getAll);
router.patch('/:id/status', upload.none(), AuthHandler.authorize, AuthHandler.authorizeAdmin, Inspector.editStatus, InterventionsController.editStatus);
router.patch('/:id/location', upload.none(), AuthHandler.authorize, Inspector.editLocation, InterventionsController.editLocation);
router.patch('/:id/comment', upload.none(), AuthHandler.authorize, Inspector.editComment, InterventionsController.editComment);
router.get('/:id', AuthHandler.authorize, Inspector.getOne, InterventionsController.getOne);
router.delete('/:id', AuthHandler.authorize, Inspector.delete, InterventionsController.delete);


export default router;
