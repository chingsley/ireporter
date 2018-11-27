import fs from 'fs';
import moment from 'moment';
import bcrypt from 'bcrypt';
import EmailChecker from './emailChecker';
import Helper from './helper';

const users = (JSON.parse(fs.readFileSync('users.json'))).users;

class Validate {
  static newRedflag(req, res, next) {
    const {
      email, type, location, comment,
    } = req.body;

    const missingFields = [email, type, location, comment].map((field, index) => {
      const keys = {
        0: 'email',
        1: 'type',
        2: 'location',
        3: 'comment',
      };
      return field === undefined ? keys[index] : null;
    }).filter(field => field !== null).join(', ');

    const response = message => res.status(400).json({ status: 400, error: message });

    if (!email || !type || !location || !comment) return response(`the following field(s) is/are required: ${missingFields}`);

    if (type.toLowerCase() !== 'red-flag' && type !== 'intervention') return response('type field must be \'red-flag\' or \'intervention\'');

    if (EmailChecker.verifyEmail(email).error) return response(`${EmailChecker.verifyEmail(email).message}`);


    // check if there is a user in the system with the specified email
    // ...

    // create a newRedflag object, attach it to the req object and set the values
    req.newRedflag = {};
    req.newRedflag.id = 1;
    req.newRedflag.createdOn = moment(new Date());
    req.newRedflag.createdBy = email.trim();
    req.newRedflag.type = type.trim();
    req.newRedflag.location = location.trim();
    req.newRedflag.status = 'draft';
    req.newRedflag.comment = comment.trim();
    return next();
  }// end static async newRedflag

  
  static async signup(req, res, next) {
    const response = message => res.status(400).json({ status: 400, error: message });
    const {
      firstname, lastname, othernames, email, password, phoneNumber, username, adminSecret,
    } = req.body;
    const requiredFields = [firstname, email, password, phoneNumber];
    const missingFields = requiredFields.map((field, index) => {
      const keys = {
        0: 'firstname',
        1: 'email',
        2: 'password',
        3: 'phoneNumber',
      };
      return (field === undefined || field === '') ? keys[index] : null;
    }).filter(field => field !== null).join(', ');

    if (!firstname || !email || !password || !phoneNumber) {
      return response(`values are required the following fields: ${missingFields}`);
    }
    if (EmailChecker.verifyEmail(email).error) {
      return response(EmailChecker.verifyEmail(email).message);
    }

    const users = await (JSON.parse(fs.readFileSync('users.json'))).users;
    for(let i = 0; i < users.length; i += 1) {
      if (users[i].email.trim() === email.trim()) {
        return response(`${email}, has been used by another user. Choose a different email`);
      }
    }
    if (!Helper.isValidName(firstname)) return response('firstname must be 2 or more characters long');
    if (!Helper.isValidPassword(password)) return response('password must have a minimum of 5 characters');

    // attach payload to the req object
    req.newUser = {};
    req.newUser.id = Helper.generateId();
    req.newUser.firstname = firstname.trim();
    req.newUser.lastname = lastname || null;
    req.newUser.othernames = othernames || null;
    req.newUser.email = email.trim();
    req.newUser.password = await bcrypt.hash(password.trim(), 10);
    req.newUser.phoneNumber = phoneNumber.trim();
    req.newUser.username = username || null;
    req.newUser.registered = moment(new Date());
    req.newUser.isAdmin = adminSecret === process.env.ADMIN_SECRET;
    return next();
  } // end static signup
}// end class Validate

export default Validate;
