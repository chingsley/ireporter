import moment from 'moment';
// import nodemailer from 'nodemailer';
import pool from '../db/config';
import outputFormatter from '../middleware/outputFormatter';

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
      // 'rows' will return an array so we can format it using the outputFormatter
      const newRecord = (await pool.query(insertQuery, [
        moment(new Date()),
        createdBy,
        type,
        location,
        status,
        images,
        videos,
        comment,
      ])).rows;
      const formattedRecord = outputFormatter(newRecord);
      res.status(201).json({
        status: 201,
        data: [{
          id: newRecord[0].id,
          message: `created ${req.recordType} record`,
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

      const formattedRecord = outputFormatter(records);
      return res.status(200).json({
        status: 200,
        data: formattedRecord,
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
        [req.status, req.params.id, req.recordType])).rows;
      if (!record[0]) {
        return res.status(404).json({
          status: 404,
          error: `no ${req.recordType} matches the specified id`,
        });
      }
      const formattedRecord = outputFormatter(record);
      res.status(200).json({
        status: 200,
        data: [{
          id: record[0].id,
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
        [req.location, req.params.id])).rows;

      const formattedRecord = outputFormatter(updatedRecord);
      return res.status(200).json({
        status: 200,
        data: [{
          id: updatedRecord[0].id,
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
        [req.comment, req.params.id])).rows;

      const formattedRecord = outputFormatter(updatedRecord);
      return res.status(200).json({
        status: 200,
        data: [{
          id: updatedRecord[0].id,
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
      // NOTE: record is an array of one record. 'rows' is an array. 'rows[0] is an object
      const record = (await pool.query(queryStr, [req.params.id, req.recordType])).rows;
      if (!record[0]) {
        return res.status(404).json({
          status: 404,
          error: `No ${req.recordType} matches the id of ${req.params.id}`,
        });
      }

      if (record[0].created_by !== req.userId && req.userStatus !== 'admin') {
        return res.status(401).json({
          status: 401,
          error: `cannot get ${req.recordType}. Not your record`,
        });
      }

      const formattedRecord = outputFormatter(record);
      return res.status(200).json({
        status: 200,
        data: formattedRecord,
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
          error: 'cannot delete. A record can only be deleted by its owner',
        });
      }
      if (record.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified ${req.recordType} cannot be deleted because it is ${record.status}`,
        });
      }

      const deletedRecord = (await pool.query(queryStrDelete, [req.params.id])).rows;
      const formattedRecord = outputFormatter(deletedRecord);
      return res.status(200).json({
        status: 200,
        data: [{
          id: deletedRecord[0].id,
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
