import moment from 'moment';
import Validator from '../validators/validator';
import pool from '../db/config';
import CloudinaryUploader from './cloudinary';

/**
   *
   * Inspects signup and login data
   */
class Inspect {
  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async signup(req, res, next) {
    const cloudinaryError = (fileType = 'file') => res.status(599).json({
      status: 599, // 599 is 'network connection timeout'
      error: `${fileType} upload error. Please check your internet connection and try again`,
    });

    const errObj = {};

    const {
      firstname,
      lastname,
      username,
      othernames,
      phoneNumber,
      email,
      password,
      adminSecret,
    } = req.body;

    const requiredFields = [
      firstname, lastname, phoneNumber, email, password,
    ];
    const missingFields = requiredFields.map((field, index) => {
      const keys = {
        0: 'firstname',
        1: 'lastname',
        2: 'phoneNumber',
        3: 'email',
        4: 'password',
      };
      return (field === undefined || field === '') ? keys[index] : null;
    }).filter(field => field !== null).join(', ');

    if (
      !firstname
      || !lastname
      || !phoneNumber
      || !email
      || !password
    ) {
      errObj.missingFields = `Values are required for the field(s): ${missingFields}`;
    }

    if (!Validator.isValidName(firstname)) {
      errObj.firstname = 'First Name must be a minimum of 2 characters, (no numbers)';
    }
    if (!Validator.isValidName(lastname)) {
      errObj.lastname = 'Last Name must be a minimum of 2 characters, (no numbers)';
    }
    if (username && (!Validator.isValidName(username))) {
      errObj.username = 'Must be a minimum of 2 characters, (no numbers)';
    }
    if (email) {
      if (Validator.customValidateEmail(email).error) {
        errObj.email = `${Validator.customValidateEmail(email).message}`;
      }
    }
    if (!Validator.isValidPhoneNumber(phoneNumber)) {
      errObj.phoneNumber = 'Phone number cannot contain alphabets, must be less than 16 digits long, cannot be preceded by \'-\', cannot be all 0 digits';
    }
    if (Validator.isPasswordTooShort(password)) {
      errObj.password = 'Password should have a minimum of 6 characters';
    }
    if ((Object.keys(errObj)).length > 0) {
      return res.status(400).json({
        status: 400,
        error: errObj,
      });
    }
    const response401 = message => res.status(401).json({ status: 401, error: message });
    // try {
    //   const userExists = (await pool.query('SELECT * FROM users WHERE email=$1', [email.toString().trim()])).rowCount;
    //   if (userExists) return response401(`${email.toString().trim()} has been taken. Please choose another email`);
    // } catch (error) {
    //   return res.status(500).json({ error });
    // }
    req.firstname = firstname.toString().trim();
    req.lastname = lastname.toString().trim();
    req.othernames = othernames || null;
    req.username = username || 'unspecified';
    req.phoneNumber = phoneNumber.toString().trim();
    req.email = email.toString().trim();
    req.password = password.toString().trim();
    req.registered = moment(new Date());
    req.adminSecret = adminSecret ? adminSecret.toString().trim() : null;
    // req.picture = req.file ? req.file.path : 'uploads/default_profile_pic.png';
    if (req.file) {
      const result = await CloudinaryUploader.uploadSingle(req.file, 'image');
      console.log(result);
      if (!result) return cloudinaryError();
      req.picture = result;
    } else {
      req.picture = 'uploads/default_profile_pic.png';
    }

    return res.json({
      picture: req.picture,
    });
    // return next();
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static signin(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        error: 'valid email and password are required',
      });
    }

    if (Validator.customValidateEmail(email).error || Validator.isPasswordTooShort(password)) {
      return res.status(400).json({
        status: 400,
        error: 'email or password not properly formatted',
      });
    }

    req.email = email.toString().trim();
    req.password = password.toString().trim();
    return next();
  }
}

export default Inspect;
