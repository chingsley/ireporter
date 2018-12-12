/** Import the needfuls */
import moment from 'moment';
import pool from '../db/config';


class InterventionsController {
   /**
   * 
   * @param {object} req request object
   * @param {object} res response objecet
   * @returns {object} response
   */
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
      let interventions;
      if (req.userStatus === 'admin') {
        interventions = (await pool.query(adminQueryStr, ['intervention'])).rows;
      } else {
        interventions = (await pool.query(customerQueryStr, ['intervention', req.userId])).rows;
      }


      for (let k = 0; k < interventions.length; k += 1) {
        if (interventions[k].images.length > 0) {
          const imageArr = interventions[k].images.split(',');
          let formattedImgArr = [];
          for (let i = 0; i < imageArr.length; i += 1) {
            formattedImgArr.push(`http://localhost:${process.env.PORT}/${imageArr[i].trim()}`);
          }
          interventions[k].images = formattedImgArr;
        } else {
          interventions[k].images = [];
        }

        if (interventions[k].videos.length > 0) {
          let videoArr = interventions[k].videos.split(',');
          let formattedVidArr = [];
          for (let i = 0; i < videoArr.length; i += 1) {
            formattedVidArr.push(`http://localhost:${process.env.PORT}/${videoArr[i].trim()}`);
          }
          interventions[k].videos = formattedVidArr;
        } else {
          interventions[k].videos = [];
        }
      }

      return res.status(200).json({
        status: 200,
        data: [{ interventions }]
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
      const intervention = (await pool.query(queryStr, [req.status, req.params.id, 'intervention'])).rows[0];
      if (!intervention) {
        return res.status(404).json({
          status: 404,
          error: 'no intervention matches the specified id',
        });
      }

      res.status(200).json({
        status: 200,
        data: [{
          id: intervention.id,
          message: `Updated intervention's status`,
          'intervention': intervention,
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
      const intervention = (await pool.query(queryStr, [req.params.id, 'intervention'])).rows[0];
      if (!intervention) {
        return res.status(404).json({
          status: 404,
          error: `No intervention matches the id of ${req.params.id}`,
        });
      }
      if (intervention.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: `You do not have the authorization to edit that intervention`
        });
      }
      if (intervention.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified intervention cannot be edited because it is ${intervention.status}`
        });
      }

      const updatedIntervention = (await pool.query(queryStrUpdate, [req.location, req.params.id])).rows[0];
      return res.status(200).json({
        status: 200,
        data: [{
          id: updatedIntervention.id,
          message: `Updated intervention's location`,
          "intervention": updatedIntervention
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
    * @returns {object} 
    */
  static async editComment(req, res) {
    const queryStr = 'SELECT * FROM incidents WHERE id=$1 AND type=$2';
    const queryStrUpdate = 'UPDATE incidents SET comment=$1 WHERE id=$2 RETURNING *';
    try {
      const intervention = (await pool.query(queryStr, [req.params.id, 'intervention'])).rows[0];
      if (!intervention) {
        return res.status(404).json({
          status: 404,
          error: `No intervention matches the id of ${req.params.id}`,
        });
      }
      if (intervention.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: `You do not have the authorization to edit that intervention`
        });
      }
      if (intervention.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified intervention cannot be edited because it is ${intervention.status}`
        });
      }

      const updatedIntervention = (await pool.query(queryStrUpdate, [req.comment, req.params.id])).rows[0];
      return res.status(200).json({
        status: 200,
        data: [{
          id: updatedIntervention.id,
          message: `Updated intervention's comment`,
          "intervention": updatedIntervention
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
      const intervention = (await pool.query(queryStr, [req.params.id, 'intervention'])).rows[0];
      if (!intervention) {
        return res.status(404).json({
          status: 404,
          error: `No intervention matches the id of ${req.params.id}`,
        });
      }

      if (intervention.created_by !== req.userId && req.userStatus !== 'admin') {
        return res.status(401).json({
          status: 401,
          error: `cannot get`
        });
      }

      if (intervention.images.length > 0) {
        const imageArr = intervention.images.split(',');
        let formattedImgArr = [];
        for (let i = 0; i < imageArr.length; i += 1) {
          formattedImgArr.push(`http://localhost:${process.env.PORT}/${imageArr[i].trim()}`);
        }
        intervention.images = formattedImgArr;
      }

      if (intervention.videos.length > 0) {
        let videoArr = intervention.videos.split(',');
        let formattedVidArr = [];
        for (let i = 0; i < videoArr.length; i += 1) {
          formattedVidArr.push(`http://localhost:${process.env.PORT}/${videoArr[i].trim()}`);
        }
        intervention.videos = formattedVidArr;
      }

      return res.status(200).json({
        status: 200,
        data: [{ intervention }]
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
      const intervention = (await pool.query(queryStr, [req.params.id, 'intervention'])).rows[0];
      if (!intervention) {
        return res.status(404).json({
          status: 404,
          error: `No intervention matches the id of ${req.params.id}`,
        });
      }
      if (intervention.created_by !== req.userId) {
        return res.status(401).json({
          status: 401,
          error: `cannot delete`
        });
      }
      if (intervention.status !== 'draft') {
        return res.status(403).json({
          status: 403,
          error: `The specified intervention cannot be deleted because it is ${intervention.status}`
        });
      }

      const deletedIntervention = (await pool.query(queryStrDelete, [req.params.id])).rows[0];
      return res.status(200).json({
        status: 200,
        data: [{
          id: deletedIntervention.id,
          message: `intervention record has been deleted`,
          "intervention": deletedIntervention
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

export default InterventionsController;
