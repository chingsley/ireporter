import fs from 'fs';
import { usersDotJason, redflagsDotJason } from '../storage/config';
// import moment from 'moment';

class RedflagsController {
  static async newRedflag(req, res) {
    try {
      const { redflags } = await JSON.parse(fs.readFileSync(redflagsDotJason));
      redflags.push(req.newRedflag);
      const obj = {};
      obj.redflags = redflags;
      fs.writeFileSync(redflagsDotJason, JSON.stringify(obj, null, 2), (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            error: 'there was an error while trying to save the redflag',
          });
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }

    // req.newRedflag.Image = `http://localhost:${process.env.PORT}/${req.newRedflag.Image}`;
    // return res.status(201).json({
    //   status: 201,
    //   data: req.newRedflag
    // });

    return res.status(201).json({
      status: 201,
      data: [{
        id: req.newRedflag.id,
        message: 'Created red-flag record',
      }],
    });
  } // END newRedflag


  static async editRedflagLocation(req, res) {
    const {
      allRedflags, redflagToEdit, newLocation, redflagOwner,
    } = req;

    const ownerEmail = redflagOwner.email; // for sending them email
    const ownerPhoneNumber = redflagOwner.phoneNumber; // for sending them sms

    const indexOfRedflagToEdit = allRedflags.indexOf(redflagToEdit);

    redflagToEdit.location = newLocation;
    allRedflags[indexOfRedflagToEdit] = redflagToEdit;

    try {
      const obj = {};
      obj.redflags = allRedflags;
      fs.writeFileSync(redflagsDotJason, JSON.stringify(obj, null, 2), (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            error: 'there was an error while trying to save the redflag',
          });
        }
      });
    } catch (error) {
      // console.log('error from redflagsController.js, examine the code in static async editRedflagLocation(req, res)\n', error);
      return res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
    return res.status(200).json({
      status: 200,
      data: [{
        id: redflagToEdit.id,
        message: 'Updated red-flag record\'s location',
      }],
    });
  } // END editRedflagLocation


  static async editRedflagComment(req, res) {
    const {
      allRedflags, redflagToEdit, newComment, redflagOwner,
    } = req;

    const ownerEmail = redflagOwner.email; // for sending them email
    const ownerPhoneNumber = redflagOwner.phoneNumber; // for sending them sms

    const indexOfRedflagToEdit = allRedflags.indexOf(redflagToEdit);

    redflagToEdit.comment = newComment;
    allRedflags[indexOfRedflagToEdit] = redflagToEdit;

    try {
      const obj = {};
      obj.redflags = allRedflags;
      fs.writeFileSync(redflagsDotJason, JSON.stringify(obj, null, 2), (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            error: 'there was an error while trying to save the redflag',
          });
        }
      });
    } catch (error) {
      // console.log('error from redflagsController.js, examine the code in static async editRedflagLocation(req, res)\n', error);
      return res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
    return res.status(200).json({
      status: 200,
      data: [{
        id: redflagToEdit.id,
        message: 'Updated red-flag record\'s comment',
      }],
    });
  }// END editRedflagComment

  static async getOneRedflag(req, res) {
    const { requestedRedflag } = req;
    res.status(200).json({
      status: 200,
      data: [ requestedRedflag ]
    });
  }// END getOneRedflag

  static async deleteRedflag(req, res) {
    const { allRedflags, redflagToDelete, redflagOwner } = req;

    const ownerEmail = redflagOwner.email; //for sending email notification to owner
    const ownerPhoneNumber = redflagOwner.phoneNumber; // for sending sms notification to owner

    const indexOfRedflagToDelete = allRedflags.indexOf(redflagToDelete);
    allRedflags.splice(indexOfRedflagToDelete, 1);

    try {
      const obj = {};
      obj.redflags = allRedflags;
      fs.writeFileSync(redflagsDotJason, JSON.stringify(obj, null, 2), (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            error: 'there was an error while trying to save the redflag',
          });
        }
      });
    } catch (error) {
      // console.log('error from redflagsController.js, examine the code in static async editRedflagLocation(req, res)\n', error);
      return res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
    return res.status(200).json({
      status: 200,
      data: [{
        id: redflagToDelete.id,
        message: 'red-flag record has been deleted',
      }],
    });



  }// END deleteRedflag

}// END class RedflagsController


export default RedflagsController;
