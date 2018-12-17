import moment from 'moment';
import nodemailer from 'nodemailer';
import pool from '../db/config';
import outputFormatter from '../middleware/formatOutput';

const smtpTransport = require('nodemailer-smtp-transport');


/**
 * Class RedlfagsController
 */
class RedflagsController {

  /**
   * 
   * @param {object} req request object
   * @param {object} res response objecet
   * @returns {object} 
   */
  static async newRedflag(req, res) {
    // const recordType = ((req.baseUrl).split('/')[3]).slice(1, -1);
    // console.log(recordType);
    // console.log(recordType === 'red-flags')
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

      let formattedResult = {};
      formattedResult.id = newRedflag.id;
      formattedResult.createdOn = newRedflag.created_on;
      formattedResult.createdBy = newRedflag.created_by;
      formattedResult.type = newRedflag.type;
      formattedResult.location = newRedflag.location;
      formattedResult.status = newRedflag.status;
      formattedResult.Images = newRedflag.images;
      formattedResult.Videos = newRedflag.videos;
      formattedResult.comment= newRedflag.comment
      res.status(201).json({
        status: 201,
        data: [{
          id: newRedflag.id,
          message: 'created red-flag record',
          'red-flag': formattedResult,

        }],
      });
    } catch (error) {
      // console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }


  /**
   * 
   * @param {object} req request object
   * @param {object} res response objecet
   * @returns {object} response
   */
  static async getAll(req, res) {
    const customerQueryStr = 'SELECT * FROM incidents WHERE type=$1 AND created_by=$2';
    const adminQueryStr = `SELECT * FROM incidents WHERE type=$1`;
    try {
      let redflags;
      if(req.userStatus === 'admin') {
        redflags = (await pool.query(adminQueryStr, ['red-flag'])).rows;
      } else {
        redflags = (await pool.query(customerQueryStr, ['red-flag', req.userId])).rows;
      }


    for (let k = 0; k < redflags.length ; k+=1) {
      if (redflags[k].images.length > 0) {
        const imageArr = redflags[k].images.split(',');
        let formattedImgArr = [];
        for (let i = 0; i < imageArr.length; i += 1) {
          formattedImgArr.push(`http://localhost:${process.env.PORT}/${imageArr[i].trim()}`);
        }
        redflags[k].images = formattedImgArr;
      } else {
        redflags[k].images = [];
      }

      if (redflags[k].videos.length > 0) {
        let videoArr = redflags[k].videos.split(',');
        let formattedVidArr = [];
        for (let i = 0; i < videoArr.length; i += 1) {
          formattedVidArr.push(`http://localhost:${process.env.PORT}/${videoArr[i].trim()}`);
        }
        redflags[k].videos = formattedVidArr;
      } else {
        redflags[k].videos = [];
      }
    }

      const formattedRecord = outputFormatter(redflags);
      return res.status(200).json({
        status: 200,
        data: [ formattedRecord ]
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }

  /**
     * 
     * @param {object} req request object
     * @param {object} res response objecet
     * @returns {object} response
     */
  static async editStatus(req, res) {
    const queryStr = 'UPDATE incidents SET status=$1 WHERE id=$2 AND type=$3 returning *';
    try {
      const redflag = (await pool.query(queryStr, [req.status, req.params.id, 'red-flag'])).rows[0];
      if (!redflag) {
        return res.status(404).json({
          status: 404,
          error: 'no red-flag matches the specified id',
        });
      }
      const formattedRedflag = {
        id: redflag.id,
        createdOn: redflag.created_on,
        createdBy: redflag.created_by,
        type: redflag.type,
        location: redflag.location,
        status: redflag.status,
        Images: redflag.images,
        Videos: redflag.videos,
        comment: redflag.comment
      }
      res.status(200).json({
        status: 200,
        data: [{
         id: redflag.id,
          message: 'Updated red-flag\'s status',
          'red-flag': formattedRedflag,
        }],
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }

/**
   * 
   * @param {object} req request object
   * @param {object} res response objecet
   * @returns {object} response
   */
  static async editLocation(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    const queryStrUpdate = 'UPDATE incidents SET location=$1 WHERE id=$2 RETURNING *';
    try {
      const redflag = (await pool.query(queryStr, [req.params.id, 'red-flag'])).rows[0];
      if (!redflag) {
        return res.status(404).json({
          status: 404,
          error: `No red-flag matches the id of ${req.params.id}`,
        });
      }
      if(redflag.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: `You do not have the authorization to edit that red-flag`
        });
      }
      if(redflag.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified red-flag cannot be edited because it is ${redflag.status}`
        });
      }

      const updatedRedflag = (await pool.query(queryStrUpdate, [req.location, req.params.id])).rows[0];
      const formattedRedflag = {
        id: updatedRedflag.id,
        createdOn: updatedRedflag.created_on,
        createdBy: updatedRedflag.created_by,
        type: updatedRedflag.type,
        location: updatedRedflag.location,
        status: updatedRedflag.status,
        Images: updatedRedflag.images,
        Videos: updatedRedflag.videos,
        comment: updatedRedflag.comment
      }
      return res.status(200).json({
        status: 200,
        data: [{
          id: updatedRedflag.id,
          message: `Updated red-flag's location`,
          "red-flag": formattedRedflag
        }]
      });
     
    }catch(error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }

/**
   * 
   * @param {object} req request object
   * @param {object} res response objecet
   * @returns {object} 
   */
  static async editComment(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    const queryStrUpdate = 'UPDATE incidents SET comment=$1 WHERE id=$2 RETURNING *';
    try {
      const redflag = (await pool.query(queryStr, [req.params.id, 'red-flag'])).rows[0];
      if (!redflag) {
        return res.status(404).json({
          status: 404,
          error: `No red-flag matches the id of ${req.params.id}`,
        });
      }
      if (redflag.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: `You do not have the authorization to edit that red-flag`
        });
      }
      if (redflag.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified red-flag cannot be edited because it is ${redflag.status}`
        });
      }

      const updatedRedflag = (await pool.query(queryStrUpdate, [req.comment, req.params.id])).rows[0];
      const formattedRedflag = {
        id: updatedRedflag.id,
        createdOn: updatedRedflag.created_on,
        createdBy: updatedRedflag.created_by,
        type: updatedRedflag.type,
        location: updatedRedflag.location,
        status: updatedRedflag.status,
        Images: updatedRedflag.images,
        Videos: updatedRedflag.videos,
        comment: updatedRedflag.comment
      }
      return res.status(200).json({
        status: 200,
        data: [{
          id: updatedRedflag.id,
          message: `Updated red-flag's comment`,
          "red-flag": formattedRedflag
        }]
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }

/**
   * 
   * @param {object} req request object
   * @param {object} res response objecet
   * @returns {object} as response
   */
  static async getOne(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    try {
      const redflag = (await pool.query(queryStr, [req.params.id, 'red-flag'])).rows[0];
      if (!redflag) {
        return res.status(404).json({
          status: 404,
          error: `No red-flag matches the id of ${req.params.id}`,
        });
      }

      if (redflag.created_by !== req.userId && req.userStatus !== 'admin') {
        return res.status(401).json({
          status: 401,
          error: `cannot get`
        });
      }

      if(redflag.images.length > 0) {
        const imageArr = redflag.images.split(',');
        let formattedImgArr = [];
        for(let i = 0; i < imageArr.length; i+=1) {
          formattedImgArr.push(`http://localhost:${process.env.PORT}/${imageArr[i].trim()}`);
        }
        redflag.images = formattedImgArr;
      }

      if(redflag.videos.length > 0) {
        let videoArr = redflag.videos.split(',');
        let formattedVidArr = [];
        for(let i = 0; i < videoArr.length; i+=1) {
          formattedVidArr.push(`http://localhost:${process.env.PORT}/${videoArr[i].trim()}`);
        }
        redflag.videos = formattedVidArr;
      }

      const formattedRedflag = {
        id: redflag.id,
        createdOn: redflag.created_on,
        createdBy: redflag.created_by,
        type: redflag.type,
        location: redflag.location,
        status: redflag.status,
        Images: redflag.images,
        Videos: redflag.videos,
        comment: redflag.comment
      }

      return res.status(200).json({
        status: 200,
        data: [ formattedRedflag ]
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }

/**
   * 
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} response object 
   */
  static async delete(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    const queryStrDelete = 'DELETE FROM incidents WHERE id=$1 RETURNING *';
    try {
      const redflag = (await pool.query(queryStr, [req.params.id, 'red-flag'])).rows[0];
      if (!redflag) {
        return res.status(404).json({
          status: 404,
          error: `No red-flag matches the id of ${req.params.id}`,
        });
      }
      if (redflag.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: `cannot delete`
        });
      }
      if (redflag.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified red-flag cannot be deleted because it is ${redflag.status}`
        });
      }

      const deletedRedflag = (await pool.query(queryStrDelete, [req.params.id])).rows[0];
      const formattedRedflag = {
        id: deletedRedflag.id,
        createdOn: deletedRedflag.created_on,
        createdBy: deletedRedflag.created_by,
        type: deletedRedflag.type,
        location: deletedRedflag.location,
        status: deletedRedflag.status,
        Images: deletedRedflag.images,
        Videos: deletedRedflag.videos,
        comment: deletedRedflag.comment
      }
      return res.status(200).json({
        status: 200,
        data: [{
          id: deletedRedflag.id,
          message: `red-flag record has been deleted`,
          "red-flag": formattedRedflag
        }]
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }
}

export default RedflagsController;
