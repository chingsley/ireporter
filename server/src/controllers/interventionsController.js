/** Import the needfuls */
import moment from 'moment';
import pool from '../db/config';


class InterventionsController {
  static async newIntervention(req, res) {
    const {
      createdBy,
      location,
      status,
      images,
      videos,
      comment,
    } = req;
    const type = 'intervention';

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
      const newIntervention = (await pool.query(insertQuery, [
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
          id: newIntervention.id,
          message: 'created intervention record',
          intervention: newIntervention,

        }],
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        error: 'internal server error',
      });
    }
  }// END newIntervention


  static async getAll(req, res, next) {
    res.send('interventionsController.getAll connected ...');
  }// END getAllInterventions


  static async editStatus(req, res, next) {
    res.send('interventionsController.editStatus connected ...');
  }// END editRedflagStatus


  static async editLocation(req, res, next) {
    res.send('interventionsController.editLocation connected ... ');
  }// END editInterventionLocation


  static async editComment(req, res, next) {
    res.send('interventionsController.editComment connected ..');
  }// END editInterventionComment


  static async getOne(req, res, next) {
    res.send('interventionsController.getOne connected ... ');
  }// END getOneIntervention


  static async delete(req, res, next) {
    res.send('interventionsController.delete connected ... ');
  }// END deleteIntervention
}// END class InterventionsController

export default InterventionsController;
