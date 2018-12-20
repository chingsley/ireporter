import { Router } from 'express';
import multer from 'multer';
import Inspector from '../middleware/recordsInspector';
import RecordsController from '../controllers/recordsController';
import AuthHandler from '../middleware/authHandler';
import RecordType from '../middleware/recordType';

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
  if (file.mimetype === 'image/jpeg' 
  || file.mimetype === 'image/png' 
    || file.mimetype === 'video/mp4'
    || file.mimetype === 'image/gif') {
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

router.post('/', fileUpload, AuthHandler.authorize, RecordType.getRecordType, Inspector.newRecord, RecordsController.newRecord);
router.get('/', AuthHandler.authorize, RecordType.getRecordType, Inspector.getAll, RecordsController.getAll);
router.patch('/:id/status', upload.none(), AuthHandler.authorize, RecordType.getRecordType, AuthHandler.authorizeAdmin, Inspector.editStatus, RecordsController.editStatus);
router.patch('/:id/location', upload.none(), AuthHandler.authorize, RecordType.getRecordType, Inspector.editLocation, RecordsController.editLocation);
router.patch('/:id/comment', upload.none(), AuthHandler.authorize, RecordType.getRecordType, Inspector.editComment, RecordsController.editComment);
router.get('/:id', AuthHandler.authorize, RecordType.getRecordType, Inspector.getOne, RecordsController.getOne);
router.delete('/:id', AuthHandler.authorize, RecordType.getRecordType, Inspector.delete, RecordsController.delete);


export default router;
