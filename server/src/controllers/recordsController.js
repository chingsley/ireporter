import moment from 'moment';
// import nodemailer from 'nodemailer';
import pool from '../db/config';
import outputFormatter from '../middleware/formatOutput';

// const smtpTransport = require('nodemailer-smtp-transport');


/**
 * Class RedlfagsController
 */
class RecordsController {
  /**
     *
     * @param {object} req request object
     * @param {object} res response object
     * @returns {object} object
     */
  static async newRecord(req, res) {
    const {
      createdBy,
      location,
      status,
      images,
      videos,
      comment,
    } = req;
    const type = req.recordType;

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
      const newRecord = (await pool.query(insertQuery, [
        moment(new Date()),
        createdBy,
        type,
        location,
        status,
        images,
        videos,
        comment,
      ])).rows[0];

      const formattedResult = {};
      formattedResult.id = newRecord.id;
      formattedResult.createdOn = newRecord.created_on;
      formattedResult.createdBy = newRecord.created_by;
      formattedResult.type = newRecord.type;
      formattedResult.location = newRecord.location;
      formattedResult.status = newRecord.status;
      formattedResult.Images = newRecord.images;
      formattedResult.Videos = newRecord.videos;
      formattedResult.comment = newRecord.comment;
      res.status(201).json({
        status: 201,
        data: [{
          id: newRecord.id,
          message: `created ${req.recordType} record`,
          record: formattedResult,

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
    const adminQueryStr = 'SELECT * FROM incidents WHERE type=$1';
    try {
      let records;
      if (req.userStatus === 'admin') {
        records = (await pool.query(adminQueryStr, [req.recordType])).rows;
      } else {
        records = (await pool.query(customerQueryStr, [req.recordType, req.userId])).rows;
      }


      for (let k = 0; k < records.length; k += 1) {
        if (records[k].images.length > 0) {
          const imageArr = records[k].images.split(',');
          const formattedImgArr = [];
          for (let i = 0; i < imageArr.length; i += 1) {
            formattedImgArr.push(`http://localhost:${process.env.PORT}/${imageArr[i].trim()}`);
          }
          records[k].images = formattedImgArr;
        } else {
          records[k].images = [];
        }

        if (records[k].videos.length > 0) {
          const videoArr = records[k].videos.split(',');
          const formattedVidArr = [];
          for (let i = 0; i < videoArr.length; i += 1) {
            formattedVidArr.push(`http://localhost:${process.env.PORT}/${videoArr[i].trim()}`);
          }
          records[k].videos = formattedVidArr;
        } else {
          records[k].videos = [];
        }
      }

      const formattedRecord = outputFormatter(records);
      return res.status(200).json({
        status: 200,
        data: [formattedRecord],
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
  static async editStatus(req, res) {
    const queryStr = 'UPDATE incidents SET status=$1 WHERE id=$2 AND type=$3 returning *';
    try {
      const record = (await pool.query(queryStr,
        [req.status, req.params.id, req.recordType])).rows[0];
      if (!record) {
        return res.status(404).json({
          status: 404,
          error: `no ${req.recordType} matches the specified id`,
        });
      }
      const formattedRecord = {
        id: record.id,
        createdOn: record.created_on,
        createdBy: record.created_by,
        type: record.type,
        location: record.location,
        status: record.status,
        Images: record.images,
        Videos: record.videos,
        comment: record.comment,
      };

      res.status(200).json({
        status: 200,
        data: [{
          id: record.id,
          message: `Updated ${req.recordType}'s status`,
          record: formattedRecord,
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
  static async editLocation(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    const queryStrUpdate = 'UPDATE incidents SET location=$1 WHERE id=$2 RETURNING *';
    try {
      const record = (await pool.query(queryStr, [req.params.id, req.recordType])).rows[0];
      if (!record) {
        return res.status(404).json({
          status: 404,
          error: `No ${req.recordType} matches the id of ${req.params.id}`,
        });
      }
      if (record.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: `You do not have the authorization to edit that ${req.recordType}`,
        });
      }
      if (record.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified ${req.recordType} cannot be edited because it is ${record.status}`,
        });
      }

      const updatedRecord = (await pool.query(queryStrUpdate,
        [req.location, req.params.id])).rows[0];
      const formattedRecord = {
        id: updatedRecord.id,
        createdOn: updatedRecord.created_on,
        createdBy: updatedRecord.created_by,
        type: updatedRecord.type,
        location: updatedRecord.location,
        status: updatedRecord.status,
        Images: updatedRecord.images,
        Videos: updatedRecord.videos,
        comment: updatedRecord.comment,
      };
      return res.status(200).json({
        status: 200,
        data: [{
          id: updatedRecord.id,
          message: `Updated ${req.recordType}'s location`,
          record: formattedRecord,
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
       * @returns {object} object
       */
  static async editComment(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    const queryStrUpdate = 'UPDATE incidents SET comment=$1 WHERE id=$2 RETURNING *';
    try {
      const record = (await pool.query(queryStr, [req.params.id, req.recordType])).rows[0];
      if (!record) {
        return res.status(404).json({
          status: 404,
          error: `No ${req.recordType} matches the id of ${req.params.id}`,
        });
      }
      if (record.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: `You do not have the authorization to edit that ${req.recordType}`,
        });
      }
      if (record.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified ${req.recordType} cannot be edited because it is ${record.status}`,
        });
      }

      const updatedRecord = (await pool.query(queryStrUpdate,
        [req.comment, req.params.id])).rows[0];
      const formattedRecord = {
        id: updatedRecord.id,
        createdOn: updatedRecord.created_on,
        createdBy: updatedRecord.created_by,
        type: updatedRecord.type,
        location: updatedRecord.location,
        status: updatedRecord.status,
        Images: updatedRecord.images,
        Videos: updatedRecord.videos,
        comment: updatedRecord.comment,
      };
      return res.status(200).json({
        status: 200,
        data: [{
          id: updatedRecord.id,
          message: `Updated ${req.recordType}'s comment`,
          'red-flag': formattedRecord,
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
       * @returns {object} as response
       */
  static async getOne(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    try {
      const record = (await pool.query(queryStr, [req.params.id, req.recordType])).rows[0];
      if (!record) {
        return res.status(404).json({
          status: 404,
          error: `No ${req.recordType} matches the id of ${req.params.id}`,
        });
      }

      if (record.created_by !== req.userId && req.userStatus !== 'admin') {
        return res.status(401).json({
          status: 401,
          error: 'cannot get',
        });
      }

      if (record.images.length > 0) {
        const imageArr = record.images.split(',');
        const formattedImgArr = [];
        for (let i = 0; i < imageArr.length; i += 1) {
          formattedImgArr.push(`http://localhost:${process.env.PORT}/${imageArr[i].trim()}`);
        }
        record.images = formattedImgArr;
      }

      if (record.videos.length > 0) {
        const videoArr = record.videos.split(',');
        const formattedVidArr = [];
        for (let i = 0; i < videoArr.length; i += 1) {
          formattedVidArr.push(`http://localhost:${process.env.PORT}/${videoArr[i].trim()}`);
        }
        record.videos = formattedVidArr;
      }

      const formattedRecord = {
        id: record.id,
        createdOn: record.created_on,
        createdBy: record.created_by,
        type: record.type,
        location: record.location,
        status: record.status,
        Images: record.images,
        Videos: record.videos,
        comment: record.comment,
      };

      return res.status(200).json({
        status: 200,
        data: [formattedRecord],
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
       * @param {object} res response object
       * @returns {object} response object
       */
  static async delete(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    const queryStrDelete = 'DELETE FROM incidents WHERE id=$1 RETURNING *';
    try {
      const record = (await pool.query(queryStr, [req.params.id, req.recordType])).rows[0];
      if (!record) {
        return res.status(404).json({
          status: 404,
          error: `No ${req.recordType} matches the id of ${req.params.id}`,
        });
      }
      if (record.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: 'cannot delete',
        });
      }
      if (record.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified ${req.recordType} cannot be deleted because it is ${record.status}`,
        });
      }

      const deletedRecord = (await pool.query(queryStrDelete, [req.params.id])).rows[0];
      const formattedRecord = {
        id: deletedRecord.id,
        createdOn: deletedRecord.created_on,
        createdBy: deletedRecord.created_by,
        type: deletedRecord.type,
        location: deletedRecord.location,
        status: deletedRecord.status,
        Images: deletedRecord.images,
        Videos: deletedRecord.videos,
        comment: deletedRecord.comment,
      };
      return res.status(200).json({
        status: 200,
        data: [{
          id: deletedRecord.id,
          message: `${req.recordType} record has been deleted`,
          record: formattedRecord,
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
}

export default RecordsController;
