import Validator from '../validators/validator';
import CloudinaryUploader from './cloudinary';


const stringifyMedia = (files) => {
  try {
    const fileArr = [];
    let fileStr = '';
    files.forEach((file) => {
      // fileArr.push(file.path);
      fileArr.push(file);
    });
    fileStr += fileArr.join(',');
    return fileStr;
  } catch (err) {
    return err;
  }
};


/**
 * class for inspecting user inputs
 */
class InspectRecord {
  /**
   * Inspect data for new record
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async newRecord(req, res, next) {
    // this function takes the file type (image or video) as argument, but
    // if a value for fileType is not provided when the function is called, then
    // 'file' will be used as the value of fileType
    const cloudinaryError = (fileType = 'file') => res.status(599).json({
      status: 599, // 599 is 'network connection timeout'
      error: `${fileType} upload error. Please check your internet connection and try again`,
    });


    const errObj = {};
    const { location, comment } = req.body;

    if (!Validator.isValidCoordinates(location)) errObj['invalid coordinates'] = 'Please provide valid location coordinates. Valid coordinates must be in the format: lat, lng  [lat ranges from -90 to 90, lng ranges from -180 to 180]';
    if (!Validator.isValidComment(comment)) errObj['invalid comment'] = 'Please provide a valid comment. Comment must be a minium of 3 words';

    let imageStr = '';
    let videoStr = '';
    if (req.files) {
      if (req.fileFormatError) {
        return res.status(415).json({
          status: 415,
          error: `${req.fieldError}: unsupported file format (${req.unsupportedFileFormat})`,
        });
      }

      if (req.files.images) {
        const arrOfImgUrlFromCloud = await CloudinaryUploader.upload(req.files.images, 'image');
        if (!arrOfImgUrlFromCloud) return cloudinaryError('image');
        imageStr = stringifyMedia(arrOfImgUrlFromCloud);
      }

      if (req.files.videos) {
        const arrOfVidUrlFromCloud = await CloudinaryUploader.upload(req.files.videos, 'video');
        if (!arrOfVidUrlFromCloud) return cloudinaryError('video');
        videoStr = stringifyMedia(arrOfVidUrlFromCloud);
      }
    }

    if (Object.keys(errObj).length > 0) {
      return res.status(400).json({
        status: 400,
        error: errObj,
      });
    }
    req.createdBy = req.userId;
    req.location = location.toString().trim();
    req.status = 'draft';
    req.images = imageStr;
    req.videos = videoStr;
    req.comment = comment.toString().trim();

    // res.send('testing');
    return next();
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async getAll(req, res, next) {
    return next();
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async editStatus(req, res, next) {
    const { status } = req.body;
    const response400 = message => res.status(400).json({ status: 400, error: message });
    if (!Validator.isValidRecordId(req.params.id)) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    if (!Validator.isValidStatus(status)) return response400('Please provide a valid value for status. Allowed values are draft, under investigation, rejected, or resolved');
    req.status = status.toString().trim();
    return next();
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async editLocation(req, res, next) {
    const { location } = req.body;
    const response400 = message => res.status(400).json({ status: 400, error: message });
    if (!Validator.isValidRecordId(req.params.id)) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    if (!Validator.isValidCoordinates(location)) return response400('Please provide valid location coordinates. Valid coordinates must be in the format: lat, lng  [lat ranges from -90 to 90, lng ranges from -180 to 180]');
    req.location = location.toString().trim();
    return next();
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async editComment(req, res, next) {
    const { comment } = req.body;
    const response400 = message => res.status(400).json({ status: 400, error: message });
    if (!Validator.isValidRecordId(req.params.id)) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    if (!Validator.isValidComment(comment)) return response400('Please provide a valid comment. Comment must be a minium of 3 words');
    req.comment = comment.toString().trim();
    return next();
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async addMedia(req, res, next) {
    const cloudinaryError = (fileType = 'file') => res.status(599).json({
      status: 599, // 599 is 'network connection timeout'
      error: `${fileType} upload error. Please check your internet connection and try again`,
    });

    // req.baseUrl = /api/v1/interventions
    // req.originalUrl = /api/v1/interventions/:id/images
    const n = req.originalUrl.indexOf('addImage');
    const mediaType = (n > -1) ? 'image' : 'video';
    let mediaStr = '';
    let mediaArr = [];
    if (req.files) {
      if (req.fileFormatError) {
        return res.status(400).json({
          status: 400,
          error: `${req.fieldError}: unsupported file format (${req.unsupportedFileFormat})`,
        });
      }
      if ((mediaType === 'image' && !req.files.images)
          || (mediaType === 'video' && !req.files.videos)) {
        return res.status(400).json({
          status: 400,
          error: `You have not provided any ${mediaType} for upload.`,
        });
      }

      if (mediaType === 'image') {
        mediaArr = await CloudinaryUploader.upload(req.files.images, 'image');
      } else if (mediaType === 'video') {
        mediaArr = await CloudinaryUploader.upload(req.files.videos, 'video');
      }

      if (!mediaArr) return cloudinaryError();
      mediaStr = stringifyMedia(mediaArr);
    }

    req.mediaArr = mediaArr;
    req.mediaStr = mediaStr;
    req.mediaType = mediaType;
    return next();
  }

  /**
   *
   * @param {object} req request object
   * @param {object} res response object
   * @param {function} next transfers controll
   * @returns {function} next
   */
  static async getOne(req, res, next) {
    const response400 = message => res.status(400).json({ status: 400, error: message });
    if (!Validator.isValidRecordId(req.params.id)) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    return next();
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {method} next
   * @returns {method} returns next
   */
  static async delete(req, res, next) {
    const response400 = message => res.status(400).json({ status: 400, error: message });
    if (!Validator.isValidRecordId(req.params.id)) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    return next();
  }
}

export default InspectRecord;
