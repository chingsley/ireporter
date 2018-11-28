import fs from 'fs';
import {
  usersDotJason,
  redflagsDotJason,
} from '../storage/config';
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
  }
}// end class RedflagsController

export default RedflagsController;
