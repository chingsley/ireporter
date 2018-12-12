import moment from 'moment';
import Validator from '../validators/validator';
import pool from '../db/config';

class Inspect {
  static async signup(req, res, next) {
    const response400 = message => res.status(400).json({ status: 400, error: message });
    const {
      firstname,
      lastname,
      othernames,
      username,
      phoneNumber,
      email,
      password,
      confirmPassword,
      adminSecret,
    } = req.body;

    const requiredFields = [
      firstname, lastname, username, phoneNumber, email, password, confirmPassword,
    ];
    const missingFields = requiredFields.map((field, index) => {
      const keys = {
        0: 'firstname',
        1: 'lastname',
        2: 'username',
        3: 'phoneNumber',
        4: 'email',
        5: 'password',
        6: 'confirmPassword',
      };
      return (field === undefined || field === '') ? keys[index] : null;
    }).filter(field => field !== null).join(', ');

    if (
      !firstname
      || !lastname
      || !phoneNumber
      || !email
      || !password
      || !confirmPassword
      || !username
    ) {
      return response400(`values are required for the following fields: ${missingFields}`);
    }

    if (!Validator.isValidName(firstname)) return response400('invalid first name. First name must be a minimum of 2 characters');
    if (!Validator.isValidName(lastname)) return response400('invalid last name. Last name must be a minimum of 2 characters');
    if (Validator.customValidateEmail(email).error) {
      return response400(Validator.customValidateEmail(email).message);
    }
    if (!Validator.isMatchingPasswords(password, confirmPassword)) return response400('the two passwords do not match');
    if (!Validator.isValidPhoneNumber(phoneNumber)) return response400('Invalid phone number. Phone number cannot contain characters, and must be less than 16 digits long');
    if (Validator.isPasswordTooShort(password)) return response400('Invalid password. Password should have a minimum of 6 characters');

    try {
      const userExists = (await pool.query('SELECT * FROM users WHERE email=$1', [email.toString().trim()])).rowCount;
      if (userExists) return response400(`${email.toString().trim()} has been taken. Please choose another email`);
    } catch (error) {
      return response400(`${error}`); // keep an eye on this line
    }
    req.firstname = firstname.toString().trim();
    req.lastname = lastname.toString().trim();
    req.othernames = othernames || null;
    req.username = username || 'unspecified';
    req.phoneNumber = phoneNumber.toString().trim();
    req.email = email.toString().trim();
    req.password = password.toString().trim();
    req.picture = req.file ? req.file.path : 'uploads/default_profile_pic.png';
    req.registered = moment(new Date());
    req.adminSecret = adminSecret ? adminSecret.toString().trim() : null;

    return next();
  } // END signup


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
  }// END signin
} // END class Inspect

export default Inspect;
