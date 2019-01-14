import { Router } from 'express';
import multer from 'multer';
import Inspector from '../middleware/recordsInspector';
import RecordsController from '../controllers/recordsController';
import AuthHandler from '../middleware/authHandler';
import RecordType from '../middleware/recordType';
// import { runInNewContext } from 'vm';

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
  // console.log('files: ', file);
  if ((file.mimetype === 'image/jpeg')
    || (file.mimetype === 'image/png')
    || (file.mimetype === 'video/mp4')
    || (file.mimetype === 'image/gif')) {
    callback(null, true); // ie. accept the file
    // req.fileUploadError = false;
  } else {
    req.fileFormatError = true;
    req.fieldError = file.fieldname; // videos or images
    req.unsupportedFile = file.originalname;
    [req.unsupportedFileFormat] = [file.mimetype.split('/')[1]];
    // console.log(file);
    callback(null, false); // reject the file. Don't save the file, but don't throw an error
    // callback(new Error('I don\'t have a clue!'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // approx. 10MB
  },
  fileFilter,
  // onError: function (err, next) {
  //   console.log('error', err);
  //   next(err);
  // }
});

const fileUpload = upload.fields([{ name: 'images', maxCount: 3 }, { name: 'videos', maxCount: 3 }]);
const fileHandler = (req, res, next) => {
  fileUpload(req, res, (err) => {
    console.log('recordsRouter, line 53', req.body);
    if (err instanceof multer.MulterError) {
      const errMsg = err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'maximum file upload of 3 exceeded'
        : `${err.message}. Limit: 10MB per file`;
      // A Multer error occurred when uploading.
      return res.status(400).json({
        status: 400,
        error: `${err.field}: ${errMsg}`,
        // 'multer error': err,
      });
    } if (err) {
      // An unknown error occurred when uploading.
      // console.log(err);
      return res.status(400).json({
        status: 400,
        error: 'File upload error: An error occured during uploading files',
      });
    }
    // Everything went fine.
    return next();
  });
};


router.post('/', fileHandler, AuthHandler.authorize, RecordType.getRecordType, Inspector.newRecord, RecordsController.newRecord);
router.get('/', AuthHandler.authorize, RecordType.getRecordType, Inspector.getAll, RecordsController.getAll);
router.patch('/:id/status', upload.none(), AuthHandler.authorize, RecordType.getRecordType, AuthHandler.authorizeAdmin, Inspector.editStatus, RecordsController.editStatus);
router.patch('/:id/location', upload.none(), AuthHandler.authorize, RecordType.getRecordType, Inspector.editLocation, RecordsController.editLocation);
router.patch('/:id/comment', upload.none(), AuthHandler.authorize, RecordType.getRecordType, Inspector.editComment, RecordsController.editComment);
router.patch('/:id/addImage', fileHandler, AuthHandler.authorize, RecordType.getRecordType, Inspector.addMedia, RecordsController.addMedia);
router.patch('/:id/addVideo', fileHandler, AuthHandler.authorize, RecordType.getRecordType, Inspector.addMedia, RecordsController.addMedia);
router.get('/:id', AuthHandler.authorize, RecordType.getRecordType, Inspector.getOne, RecordsController.getOne);
router.delete('/:id', AuthHandler.authorize, RecordType.getRecordType, Inspector.delete, RecordsController.delete);


export default router;
