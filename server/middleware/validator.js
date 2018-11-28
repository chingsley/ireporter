import fs from 'fs';
import moment from 'moment';
import bcrypt from 'bcrypt';
import isValidCoordinates from 'is-valid-coordinates';
import EmailChecker from './emailChecker';
import Helper from './helper';
import {
  usersDotJason,
  redflagsDotJason,
} from '../storage/config';

// const users = (JSON.parse(fs.readFileSync(usersDotJason))).users;

class Validate {
  static async newRedflag(req, res, next) {
    // console.log('validator.js ', req.files);
    // return res.send(req.files);

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
      return (field === undefined || field === '')? keys[index] : null;
    }).filter(field => field !== null).join(', ');


    const response = message => res.status(400).json({ status: 400, error: message });

    if (!email || !type || !location || !comment) return response(`values are required for the following fields: ${missingFields}`);

    if (type.toLowerCase() !== 'red-flag' && type !== 'intervention') return response(`'type' must be \'red-flag\' or \'intervention\'`);

    if (EmailChecker.verifyEmail(email).error) return response(`${EmailChecker.verifyEmail(email).message}`);

    // check if there is a user in the system with the specified email
    const { users } = await JSON.parse(fs.readFileSync(usersDotJason))
    const matchingUser = users.filter(user => user.email === email);
    // filter() returns an array, so matchingUser is an array of one user,
    // therefore matchingUser[0].id is how you access the id of that one user
    // console.log(matchingUser);
    if (matchingUser.length < 1) return res.status(401).json({ status: 401, error: `the email provided does not match any user in the system`});
    
    // validate the location field
    const coords = location.split(',');
    if (coords.length !== 2) return response(`Invalid format for location coordinates. Valid format is: Latitude, Longitude; [E.g -8.945406, 38.575078 ]`);
    const lat = Number(coords[0]);
    const long = Number(coords[1]);
    if (!isValidCoordinates(lat, long)) return response(`Invalid location coordinates. Example of a valid coordinate is: -8.945406, 38.575078 (representing Latitude and Longitude respectively)`);
    // console.log('lat: ', lat, ' isNaN ?: ', Number.isNaN(Number(lat)));

    let imageArr = [];
    let videoArr = [];
    if(req.files) {
      if(req.files.images) {
        req.files.images.forEach((image) => {
          imageArr.push(image.path);
        })
      }

      if(req.files.videos) {
        req.files.videos.forEach((video) => {
          videoArr.push(video.path);
        })
      }
    }
    
    // create a newRedflag object, attach it to the req object and set the values
    req.newRedflag = {};
    req.newRedflag.id = Helper.generateRedflagId();
    req.newRedflag.createdOn = moment(new Date());
    req.newRedflag.createdBy = matchingUser[0].id;
    req.newRedflag.type = type.trim();
    req.newRedflag.location = location.trim();
    req.newRedflag.status = 'draft';
    req.newRedflag.comment = comment.trim();
    // req.newRedflag.Image = req.file ?  req.file.path : null;
    req.newRedflag.Image = imageArr;
    req.newRedflag.Video = videoArr;
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

    const { users } = await JSON.parse(fs.readFileSync(usersDotJason));
    for(let i = 0; i < users.length; i += 1) {
      if (users[i].email.trim() === email.trim()) {
        return res.status(403).json({ status: 403, error: `${email}, has been used by another user. Choose a different email`});
      }
    }
    if (!Helper.isValidName(firstname)) return response('firstname must be 2 or more characters long');
    if (!Helper.isValidPassword(password)) return response('password must have a minimum of 5 characters');

    // attach payload to the req object
    req.newUser = {};
    req.newUser.id = Helper.generateUserId(usersDotJason);
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
