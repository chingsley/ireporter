import moment from 'moment';
import nodemailer from 'nodemailer';
import pool from '../db/config';

const smtpTransport = require('nodemailer-smtp-transport');

/** Import the needfuls */

class RedflagsController {
  static async newRedflag(req, res) {
    const {
      createdBy,
      location,
      status,
      images,
      videos,
      comment,
    } = req;
    const type = 'red-flag';

    try {
      const insertQuery = `INSERT INTO incidents(
        created_on,
        created_by,
         type,
         location,
         status,
         images,
         videos,
         comment
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      const newRedflag = (await pool.query(insertQuery, [
        moment(new Date()),
        createdBy,
        type,
        location,
        status,
        images,
        videos,
        comment,
      ])).rows[0];

      res.status(201).json({
        status: 201,
        data: [{
          id: newRedflag.id,
          message: 'created red-flag record',
          'red-flag': newRedflag,

        }],
      });
    } catch (error) {
      // console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }// END newRedflag


  static async getAll(req, res, next) {
    res.send('redflagsController.getAll connected ...');
  }// END getAllRedflags


  static async editStatus(req, res, next) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    try {
      const redflag = (await pool.query(queryStr, [req.params.id, 'red-flag'])).rows[0];
      if (!redflag) {
        return res.status(404).json({
          status: 404,
          error: 'no red-flag matches the specified id',
        });
      }
      redflag.status = req.status;

      // const mailTransport = nodemailer.createTransport(smtpTransport, {
      //   service: 'Gmail',
      //   auth: {
      //     xoauth2: xoauth2.createXOAuth2Generator ({
      //       user: 'eneja.kc@gmail.com',
      //       password: 'chinonxo'
      //     })
      //   }
      // });
      // var smtpTransport = nodemailer.createTransport("smtps://youruser%40gmail.com:" + encodeURIComponent('yourpass#123') + "@smtp.gmail.com:465");
      const smtpTransport = nodemailer.createTransport(`smtps://eneja.kc%40gmail.com:${encodeURIComponent('chinonxo')}@smtp.gmail.com:465`);
      smtpTransport.sendMail({
        from: '"ireporterAfrica" <info@ireporterAfrica.com>',
        to: 'chingsleychinonso@gmail.com',
        subject: 'change of status notification:',
        text: `The status of your red-flag record with id ${redflag.id} has been changed to ${req.status}`,
      }, (err) => {
        if (err) console.error(`Unable to send email: ${err}`);
      });

      res.status(200).json({
        status: 200,
        data: [{
          id: redflag.id,
          message: 'Updated red-flag\'s status',
          'red-flag': redflag,
        }],
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }// END editRedflagStatus


  static async editLocation(req, res, next) {
    res.send('redflagsContler.editLocation connected ...');
  }// END editRedflagLocation


  static async editComment(req, res, next) {
    res.send('redflagsController.editComment connected ..');
  }// END editRedflagComment


  static async getOne(req, res, next) {
    res.send('redflagsController.getOne connected ... ');
  }// END getOneRedflag


  static async delete(req, res, next) {
    res.send('redflagsController.delete connected ... ');
  }// END deleteRedflag
}// END class RedflagsController

export default RedflagsController;
