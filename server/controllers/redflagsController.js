import fs from 'fs';
// import moment from 'moment';

class RedflagsController {
  static async newRedflag(req, res) {
    try {
      console.log(req.newRedflag.comment);
      const { redflags } = await JSON.parse(fs.readFileSync('redflags.json'));
      console.log(redflags);
      redflags.push(req.newRedflag);
      const obj = {};
      obj.redflags = redflags;
      console.log(obj);
      fs.writeFileSync('redflags.json', JSON.stringify(obj, null, 2), (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            error: 'there was an error while trying to save the redflag',
          });
        }
      });
      return res.status(201).json({
        status: 201,
        data: redflags,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }
}// end class RedflagsController

export default RedflagsController;
