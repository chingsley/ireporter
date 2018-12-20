// import moment from 'moment';
import Validator from '../validators/validator';
// import pool from '../db/config';


/**
 * class for inspecting user inputs
 */
class InspectRedflag {
/**
   * Inspect data for new record
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async newRecord(req, res, next) {
    const errObj = {};
    const { location, comment } = req.body;

    if (!Validator.isValidCoordinates(location)) errObj['invalid coordinates'] = 'Please provide valid location coordinates. Valid coordinates must be in the format: lat, lng  [lat ranges from -90 to 90, lng ranges from -180 to 180]';
    if (!Validator.isValidComment(comment)) errObj['invalid comment'] = 'Please provide a valid comment. Comment must be a minium of 3 words';

    const imageArr = [];
    const videoArr = [];
    let imageStr = '';
    let videoStr = '';

    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach((image) => {
          if (image.size > 50000) {
            errObj['image too large'] = `${image.filename} is too large, Max allowed size: 50kg per image`;
          }
          imageArr.push(image.path);
        });
        imageStr = imageArr.join(', ');
      }

      if (req.files.videos) {
        req.files.videos.forEach((video) => {
          if (video.size > 10000000) {
            errObj['video too large: '] = `${video.filename} is too large, Max allowed size: 10MB per video`;
          }
          videoArr.push(video.path);
        });
        videoStr = videoArr.join(', ');
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

export default InspectRedflag;
