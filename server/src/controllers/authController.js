import bcrypt from 'bcrypt';
import pool from '../db/config';

/**
 * The controller for signup and login
 */
class AuthController {
  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async signup(req, res, next) {
    const {
      firstname,
      lastname,
      othernames,
      username,
      phoneNumber,
      email,
      password,
      picture,
      registered,
      adminSecret,
    } = req;

    // set isAdmin to true if adminSecret is equal to the value of ADMIN_SECRET in .env,
    // otherwise, set it to false.
    const isAdmin = adminSecret === process.env.ADMIN_SECRET;

    try {
      // Hash password and save user to database
      const hashedPassword = await bcrypt.hash(password, 10);
      const dbQuery = `INSERT INTO users(
                firstname,
                lastname,
                othernames,
                username,
                phonenumber,
                email,
                password,
                picture,
                registered,
                is_admin
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

      await pool.query(dbQuery, [
        firstname,
        lastname,
        othernames,
        username,
        phoneNumber,
        email,
        hashedPassword,
        picture,
        registered,
        isAdmin,
      ]);

      req.wantsToSignUp = true;
      return next();
    } catch (error) {
      // return res.status(500).json({ error });
      return res.status(500).json({
        status: 500,
        error: `internal server error`
      });
    }
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} next
   */
  static async signin(req, res, next) {
    const { email, password } = req;
    const response401 = message => res.status(401).json({ status: 401, error: message });

    try {
      const userDetails = (await pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0];
      if (!userDetails) return response401('Invalid email or password');
      const correctPassword = await bcrypt.compare(password, userDetails.password);
      if (!correctPassword) return response401('Invalid email or password');

      req.userDetails = userDetails;
      req.userId = userDetails.id;
      req.userName = userDetails.username;
      req.userEmail = userDetails.email;
      req.userStatus = userDetails.is_admin ? 'admin' : 'customer';
      return next();
    } catch (error) {
      return res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }
}

export default AuthController;
