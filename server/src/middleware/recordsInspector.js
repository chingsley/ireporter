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
    const response400 = message => res.status(400).json({ status: 400, error: message });

    if (!location) return response400('Please provide location coordinates');
    if (location && location.toString().trim() === '') return response400('please provide location coordinates');
    if (!Validator.isValidCoordinates(location)) return response400('Invalid coordinates. A valid coordinates must be in the format: lat, lng  [lat ranges from -90 to 90, lng ranges from -180 to 180]');

    if (!comment) return response400('Please provide comment.');
    if (comment.toString().trim() === '') return response400('Please provide comment');
    if (!Validator.isValidComment(comment)) return response400('Please provide valid comment');

    const imageArr = [];
    const videoArr = [];
    let imageStr = '';
    let videoStr = '';

    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach((image) => {
          if (image.size > 5000000) {
            errObj.images = `${image.filename} is too large, Max size: 5M`;
          }
          imageArr.push(image.path);
        });
        imageStr = imageArr.join(', ');
      }

      if (req.files.videos) {
        req.files.videos.forEach((video) => {
          if (video.size > 10000000) {
            errObj.videos = `${video.filename} is too large, Max size: 10MB`;
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
    // 'type' will be set in the individual controllers
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
    const response400 = message => res.status(400).json({ status: 400, error: message });
    let { status } = req.body;

    if (!status) return response400('status field is missing');
    if (status && status.toString().trim() === '') return response400('missing value for status.');
    status = status.toLowerCase().trim();
    if (status !== 'draft' && status !== 'under investigation' && status !== 'rejected' && status !== 'resolved') {
      return response400('invalid status. Allowed values are draft, under investigation, rejected, or resolved');
    }

    if (!Number.isInteger(Number(req.params.id))) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    if (Number(req.params.id) < 0) return response400('Records have only positive integer id\'s');

    req.status = status;
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
    // console.log('type-of-record: ', (req.baseUrl).split('/')[3])
    const { location } = req.body;
    const response400 = message => res.status(400).json({ status: 400, error: message });
    if (!location) return response400('Please provide location coordinates');
    if (location && location.toString().trim() === '') return response400('please provide location coordinates');
    if (!Validator.isValidCoordinates(location)) return response400('Invalid coordinates. A valid coordinates must be in the format: lat, lng  [lat ranges from -90 to 90, lng ranges from -180 to 180]');

    if (!Number.isInteger(Number(req.params.id))) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    if (Number(req.params.id) < 0) return response400('Records have only positive integer id\'s');

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

    if (!comment) return response400('Please provide comment.');
    if (comment.toString().trim() === '') return response400('Please provide comment');
    if (!Validator.isValidComment(comment)) return response400('Comment must be a minium of 3 words');

    if (!Number.isInteger(Number(req.params.id))) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    if (Number(req.params.id) < 0) return response400('Records have only positive integer id\'s');

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

    if (!Number.isInteger(Number(req.params.id))) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    if (Number(req.params.id) < 0) return response400('Records have only positive integer id\'s');

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

    if (!Number.isInteger(Number(req.params.id))) return response400(`'${req.params.id}' is not a valid id. Records have only positive integer id's`);
    if (Number(req.params.id) < 0) return response400('Records have only positive integer id\'s');

    return next();
  }
}

export default InspectRedflag;
