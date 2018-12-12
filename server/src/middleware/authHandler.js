import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

class AuthHandler {
  static async generateAuthToken(req, res) {
    const {
      userDetails, userId, userName, userEmail, userStatus,
    } = req;
    const token = jwt.sign({
      userId,
      userName,
      userEmail,
      userStatus,
    }, process.env.JWT_SECRET);

    const statusCode = req.wantsToSignUp ? 201 : 200;
    res.status(statusCode).json({
      status: statusCode,
      data: [{
        token,
        user: {
          id: userDetails.id,
          firstname: userDetails.firstname,
          lastname: userDetails.lastname,
          othernames: userDetails.othernames || 'not specified',
          email: userDetails.email,
          phoneNumber: userDetails.phonenumber,
          username: userDetails.username,
          registered: userDetails.registered,
          isAdmin: userDetails.is_admin,
          picture: `http://localhost:${process.env.PORT}/${userDetails.picture}`,
        },
      }],
    });
  }// END generateAuthToken

  static authorize(req, res, next) {
    const token = req.header('x-auth');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userName = decoded.userName;
      req.userEmail = decoded.userEmail;
      req.userStatus = decoded.userStatus;
      return next();
    } catch (error) {
      return res.status(401).json({
        status: 401,
        error: 'Authorization failed. You must be logged in to use this route',
      });
    }
  }// END authorize

  static authorizeAdmin(req, res, next) {
    if (req.userStatus !== 'admin') {
      return res.status(403).json({
        status: 403,
        error: 'Auth error. Only admin can access this route',
      });
    }
    return next();
  }// END static authorizeAdmin
}// END class AuthHandler

export default AuthHandler;
