import fs from 'fs';
import { usersDotJason, redflagsDotJason, } from '../storage/config';
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
     
      // req.newRedflag.Image = `http://localhost:${process.env.PORT}/${req.newRedflag.Image}`;
      // return res.status(201).json({
      //   status: 201,
      //   data: req.newRedflag
      // });
      return res.status(201).json({
        status: 201,
        data: [{
          id: req.newRedflag.id,
          message: "Created red-flag record"
        }]
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'internal server error'
      });
    }
  } // END newRedflag


  static async editRedflagLocation(req, res) {
    const ownerEmail = req.redflagOwner.email; // for sending them email
    const ownerPhoneNumber = req.redflagOwner.phoneNumber; // for sending them sms
    
    const newLocation = req.location;
    const redflagToEdit = req.redflagToEdit;

    const allRedflags = req.allRedflags;
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
    } catch(error) {
      console.log('error from redflagsController.js, examine the code in static async editRedflagLocation(req, res)\n', error);
      return res.status(500).json({
        status: 500,
        error: `internal server error`
      });
    }
    return res.status(200).json({
      status: 200,
      data: [{
        id: redflagToEdit.id,
        message: `Updated red-flag record's location`
      }],
    });
  } // END editRedflagLocation


  static async editRedflagComment(req, res) {
    res.send({
      message: 'we are in testing mode'
    });
  }


}// END class RedflagsController



export default RedflagsController;
