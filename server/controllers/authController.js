import fs from 'fs';

class AuthController {
  static async signup(req, res) {
    try {
      const users = await (JSON.parse(fs.readFileSync('users.json'))).users;
      users.push(req.newUser);
      const obj = {};
      obj.users = users;
      fs.writeFileSync('users.json', JSON.stringify(obj, null, 2), (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            error: 'internal server error: there was an error while trying to save the new user',
          });
        }
      });

      return res.status(201).json({
        status: 201,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  } // end static async signup
} // end class AuthController

export default AuthController;
