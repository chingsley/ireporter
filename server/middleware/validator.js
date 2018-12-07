import fs from 'fs';
import moment from 'moment';
import bcrypt from 'bcrypt';
import isValidCoordinates from 'is-valid-coordinates';
import EmailChecker from './emailChecker';
import Helper from './helper';
import { usersDotJason, redflagsDotJason } from '../storage/config';

// const users = (JSON.parse(fs.readFileSync(usersDotJason))).users;

class Validate {
  static async newRedflag(req, res, next) {
    // console.log('validator.js ', req.files);
    // return res.send(req.files);

    const {
      userId, type, location, comment,
    } = req.body;

    const missingFields = [userId, type, location, comment].map((field, index) => {
      const keys = {
        0: 'userId',
        1: 'type',
        2: 'location',
        3: 'comment',
      };
      return (field === undefined || field === '') ? keys[index] : null;
    }).filter(field => field !== null).join(', ');


    const response = message => res.status(400).json({ status: 400, error: message });

    if (!userId || !type || !location || !comment) return response(`values are required for the following fields: ${missingFields}`);

    if (type.toLowerCase() !== 'red-flag' && type.toLowerCase() !== 'intervention') return response('\'type\' must be \'red-flag\' or \'intervention\'');
    if (!Helper.isValidComment(comment.trim())) return response('comment must be a minimum  of 3 words');
    if (!Helper.isValidId((userId.trim()))) return response(`${userId} is not a valid id for any user`);

    // check if there is a user in the system with the specified email
    const { users } = await JSON.parse(fs.readFileSync(usersDotJason));
    const matchingUser = users.filter(user => Number(user.id) === Number((userId.trim())));
    // filter() returns an array, so matchingUser is an array of one user,
    // therefore matchingUser[0].id is how you access the id of that one user
    if (matchingUser.length < 1) return res.status(401).json({ status: 401, error: 'the id provided does not match any user in the system' });

    // validate the location field
    const coords = location.split(',');
    if (coords.length !== 2) return response('Invalid format for location coordinates. Valid format is: Latitude, Longitude; [E.g -8.945406, 38.575078 ]');
    const lat = Number(coords[0]);
    const long = Number(coords[1]);

    if (Number.isNaN(lat) || Number.isNaN(long)) return response('Invalid location coordinates. Example of a valid coordinate is: -8.945406, 38.575078 (representing Latitude and Longitude respectively)');

    const imageArr = [];
    const videoArr = [];
    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach((image) => {
          imageArr.push(image.path);
        });
      }

      if (req.files.videos) {
        req.files.videos.forEach((video) => {
          videoArr.push(video.path);
        });
      }
    }

    // create a newRedflag object, attach it to the req object and set the values
    req.newRedflag = {};
    req.newRedflag.id = Helper.generateRedflagId();
    req.newRedflag.createdOn = moment(new Date());
    req.newRedflag.createdBy = Number((userId.trim()));
    req.newRedflag.type = type.trim();
    req.newRedflag.location = location.trim();
    req.newRedflag.status = 'draft';
    req.newRedflag.comment = comment.trim();
    req.newRedflag.Image = imageArr;
    req.newRedflag.Video = videoArr;
    return next();
  }// END static async newRedflag


  static async editRedflagLocation(req, res, next) {
    const response = message => res.status(400).json({ status: 400, error: message });

    // validate req.params.id
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return response(`'${req.params.id}' is not a valid id for a redflag. Redflags have only integer id's`);

    // ensure required fiels are provided
    const { userId, location } = req.body;
    const missingFields = [userId, location].map((field, index) => {
      const keys = { 0: 'userId', 1: 'location' };
      return (field === undefined || field === '') ? keys[index] : null;
    }).filter(field => field !== null).join(', ');
    if (!userId || !location) return response(`values are required for the following feild(s): ${missingFields}`);
    if (!Helper.isValidId(userId.trim())) return response(`${userId} is not a valid id for any user`);
    // ensure that email is the right format
    // if (EmailChecker.verifyEmail(email).error) return response(`${EmailChecker.verifyEmail(email).message}`);

    // validate the coordinate location
    const coords = location.split(',');
    if (coords.length !== 2) return response('Invalid format for location coordinates. Valid format is: Latitude, Longitude; [E.g -8.945406, 38.575078 ]');
    const lat = Number(coords[0]);
    const long = Number(coords[1]);
    if (Number.isNaN(lat) || Number.isNaN(long)) return response('Invalid location coordinates. Example of a valid coordinate is: -8.945406, 38.575078 (representing Latitude and Longitude respectively)');

    // ensure the user is registered
    // const { users } = await JSON.parse(fs.readFileSync(usersDotJason));
    // const user = users.filter(user => user.email.trim() === email.trim());
    // if(user.length < 1) return res.status(401).json({
    //   status: 401,
    //   error: (`${email} is not registered. You need to signup to access this route`)
    // });

    // const userId = user[0].id; // recall, filter returns an array. In this case, an array of one user, since email is unique

    const { redflags } = await JSON.parse(fs.readFileSync(redflagsDotJason));
    const redflagToEdit = redflags.filter(redflag => Number(redflag.id) === id);

    // return 404 if there's no redflag in the system with the specified id (even though it's a valid integer id, like 10000)
    if (redflagToEdit.length < 1) {
      return res.status(404).json({
        status: 404,
        error: 'no redflag matches the specified id',
      });
    }

    // const ownerId = Number((redflagToEdit[0].createdBy))
    // return 401 if the redflag exists, but does not belong to the user trying to access it
    if (redflagToEdit[0].createdBy !== Number(userId.trim())) {
      return res.status(401).json({
        status: 401,
        error: 'you have no authorization to edit that redfag',
      });
    }

    req.allRedflags = redflags;
    req.redflagToEdit = redflagToEdit[0];
    req.newLocation = location.trim();
    req.redflagOwner = redflagToEdit[0].createdBy;

    return next();
  }// END editRedflagLocation


  static async editRedflagComment(req, res, next) {
    // get req data
    const { userId, comment } = req.body;

    const response = message => res.status(400).json({ status: 400, error: message });

    // validate req.params.id
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return response(`'${req.params.id}' is not a valid id for a redflag. Redflags have only integer id's`);

    // ensure required fiels are provided
    const missingFields = [userId, comment].map((field, index) => {
      const keys = { 0: 'email', 1: 'comment' };
      return (field === undefined || field === '') ? keys[index] : null;
    }).filter(field => field !== null).join(', ');
    if (!userId || !comment) return response(`values are required for the following feild(s): ${missingFields}`);

    // ensure userId is an integer data type
    if (!Helper.isValidId(userId.toString().trim())) return response(`${userId} is not a valid user id`);

    const { redflags } = await JSON.parse(fs.readFileSync(redflagsDotJason));
    const redflagToEdit = redflags.filter(redflag => Number(redflag.id) === Number(req.params.id));

    // return 404 if there's no redflag in the system with the specified id (even though it's a valid integer id, like 10000)
    if (redflagToEdit.length < 1) {
      return res.status(404).json({
        status: 404,
        error: 'no redflag matches the specified id',
      });
    }

    // return 401 if the redflag exists, but does not belong to the user trying to access it
    if (redflagToEdit[0].createdBy !== Number(userId.toString().trim())) {
      return res.status(401).json({
        status: 401,
        error: 'you have no authorization to edit that redfag',
      });
    }

    // validate the comment
    if (!Helper.isValidComment(comment.trim())) return response('comment must be a minimum  of 3 words');

    // attach important payloads to the req object before moving on to the next handler
    req.allRedflags = redflags;
    req.redflagToEdit = redflagToEdit[0];
    req.newComment = comment.toString().trim();
    req.redflagOwner = redflagToEdit[0].createdBy;

    return next();
  } // END editRedflagComment


  static async getAllRedflags(req, res, next) {
    const { redflags } = await JSON.parse(fs.readFileSync(redflagsDotJason));
    req.redflags = redflags;

    return next();
  }// END getAllRedflags


  static async getOneRedflag(req, res, next) {
    const response = message => res.status(400).json({ status: 400, error: message });

    if (!Number.isInteger(Number(req.params.id))) return response(`'${req.params.id}' is not a valid redflag id. Red-flags have only positive integer id's`);
    if (Number(req.params.id) < 0) return response('Red-flags have only positive integer id\'s');

    const { redflags } = await JSON.parse(fs.readFileSync(redflagsDotJason));
    const requestedRedflag = redflags.filter(redflag => Number(redflag.id) === Number(req.params.id));
    // recall: filter returns an array. thererfore, the required redflag = requestedRedflag[0], which is null if the array is empty

    const emptyObj = {};
    req.requestedRedflag = requestedRedflag[0] ? requestedRedflag[0] : emptyObj;

    return next();
  }// END getOneRedflag


  static async deleteRedflag(req, res, next) {
    const { userId } = req.body;
    const response = message => res.status(400).json({ status: 400, error: message });

    if (!userId || userId.toString().trim() === '') return response('you need to provide your userId to access this route');
    if (!Number.isInteger(Number(req.params.id))) return response(`'${req.params.id}' is not a valid redflag id. Red-flags have only positive integer id's`);
    if (Number(req.params.id) < 0) return response('Red-flags have only positive integer id\'s');

    // ensure userId is an integer value
    if (!Helper.isValidId(userId)) return response(`${userId} is not a valid id for a user.`);

    const { redflags } = await JSON.parse(fs.readFileSync(redflagsDotJason));
    const redflagToDelete = redflags.filter(redflag => Number(redflag.id) === Number(req.params.id));

    if (redflagToDelete.length < 1) {
      return res.status(404).json({
        status: 404,
        error: 'no redflag matches the specified id',
      });
    }

    if (Number(redflagToDelete[0].createdBy) !== Number(userId.toString().trim())) {
      return res.status(401).json({
        status: 401,
        error: 'you have no authorization to delete that redfag',
      });
    }


    // attach important payloads to the req object before moving on to the next handler
    req.allRedflags = redflags;
    req.redflagToDelete = redflagToDelete[0];
    req.redflagOwner = Number(redflagToDelete[0].createdBy);

    return next();
  }// END deleteRedflag


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
    for (let i = 0; i < users.length; i += 1) {
      if (users[i].email.trim() === email.trim()) {
        return res.status(403).json({ status: 403, error: `${email}, has been used by another user. Choose a different email` });
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
  } // END static signup
}// END class Validate

export default Validate;
