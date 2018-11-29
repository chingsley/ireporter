import chai from 'chai';
import 'chai/register-should';
import chaiHttp from 'chai-http';
// import dotenv from 'dotenv';
// import fs from 'fs';
import app from '../../server/index';

chai.use(chaiHttp);

describe('POST /redflags', () => {
  it('should let a registered user successfuly create a red-flag record', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'eneja.kc@gmail.com',
        type: 'red-flag',
        location: '9.388939, 0.848494',
        comment: 'I am reporting corruption',
        image: null
      })
      .end((err, res) => {
        if (err) {
        //   console.log(err);
          done(err);
        }
        res.status.should.eql(201);
        res.body.should.be.an('object').which.has.all.keys(['status', 'data']);
        res.body.data.should.be.an('array');
        res.body.data[0].should.be.an('object').which.has.all.keys(['id', 'message']);
        done();
      });
  });

  it('should not allow unregistered users to create a redflag recore', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'unregisteredUser@gmail.com',
        type: 'red-flag',
        location: '9.388939, 0.848494',
        comment: 'I am reporting corruption',
      })
      .end((err, res) => {
        if (err) {
        //   console.log(err);
          done(err);
        }
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(401);
        done();
      });
  });

  it('should return an error if there is no value for a required field', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'eneja.kc@gmail.com',
        type: 'red-flag',
        location: '8.2282, 2.8928',
        comment: '',
      })
      .end((err, res) => {
        if (err) done(err);

        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(400);
        done();
      });
  });

  it('should return an error if a required field is not provided in the req body', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        // missing the location field
        email: 'eneja.kc@gmail.com',
        type: 'red-flag',
        comment: 'reporting corruption',
      })
      .end((err, res) => {
        if (err) done(err);

        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(400);
        done();
      });
  });

  it('should return an error if a wrong email format is provided', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'ene&^ja.kc@gmail.com',
        type: 'red-flag',
        comment: 'reporting corruption',
        location: '.22532, 34.2224'
      })
      .end((err, res) => {
        if (err) done(err);

        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(400);
        done();
      });
  });

  it('should return a error message if the type field is not red-flag or intervention', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'eneja.kc@gmail.com',
        location: '.2898282, 2.228982',
        type: 'neither red-flag nor intervention',
        comment: 'reporting corruption',
      })
      .end((err, res) => {
        if (err) done(err);

        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(400);
        done();
      });
  });

  it('should return an error message if location coordinates is of the wrong format', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'eneja.kc@gmail.com',
        location: '.2898282, 2.228982, 28.89282',
        type: 'neither red-flag nor intervention',
        comment: 'reporting corruption',
      })
      .end((err, res) => {
        if (err) done(err);

        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(400);
        done();
      });
  });

  it('should return an error message if the values provided for the location coordinates are invalid', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'eneja.kc@gmail.com',
        location: '.2898282, 2.228add982', // the longitude value is invalid (it contains letters)
        type: 'neither red-flag nor intervention',
        comment: 'reporting corruption',
      })
      .end((err, res) => {
        if (err) done(err);

        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(400);
        done();
      });
  });
}); // END POST/redflags






/**------- PATCH /redflags/:id/location   ---- */
describe('PATCH /redflags/:id/location', () => {
  it('should successfully update the location of a redflag record', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location') // 'a' is not a valid redflag id
      .send({
        email: 'eneja.kc@gmail.com',
        location: '-8.88888, 0.88888',
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(200);
        res.body.should.be.an('object').which.has.all.keys(['status', 'data']);
        res.body.status.should.eql(200);
        res.body.data.should.be.an('array');
        res.body.data[0].should.be.an('object').which.has.all.keys(['id', 'message']);
        res.body.data[0].id.should.eql(1);
        done();
      });
  });

  it('should return a 400 error if an invalid id is provided', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/a/location') // 'a' is not a valid redflag id
      .send({
        email: 'eneja.kcgmail.com',
        location: '9.388939, 0.848494',
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it('should return a 400 error if email is not provided', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location')
      .send({
        email: '',
        location: '9.388939, 0.848494',
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it('should return a 400 eror is the provided email wrongly formatted', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location')
      .send({
        email: 'eneja*(*( kc@-gm ail.com',
        location: '9.388939, 0.848494',
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it('should return a 400 error if location is not provided', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location')
      .send({
        email: 'eneja.kc@gmail.com',
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it('should return a 400 error for invalid coordinate locations', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location')
      .send({
        email: 'eneja.kc@gmail.com',
        location: ".224q1, -2.4451"   // you shouldn't have a letter in a coord. The lat here includes 'q'
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it('should return a 401 error if an unregisterd user attempts to edit the location of a redflag', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location')
      .send({
        email: 'unregisteredUser@gmail.com',
        location: ".22411, -2.4451"
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(401);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it(`should return a 401 error if a user tries to edit a redflag that does not match their id`, (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location')
      // The red flag with id = 1 belongs to eneja.kc@gmail.com, therefore, cannot be edited by user with email john@gmail.com
      .send({
        email: 'john@gmail.com', 
        location: ".22411, -2.4451"
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(401);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it(`should return a 401 error if a user tries to edit a redflag that does not match their id`, (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location')
      // The red flag with id = 1 belongs to eneja.kc@gmail.com, therefore, cannot be edited by user with email john@gmail.com
      .send({
        email: 'john@gmail.com', 
        location: ".22411, -2.4451"
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(401);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it(`should return a 404 error if no redflag in the system has the specifed id`, (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/-1/location')
      // The red flag with id = 1 belongs to eneja.kc@gmail.com, therefore, cannot be edited by user with email john@gmail.com
      .send({
        email: 'john@gmail.com', 
        location: ".22411, -2.4451"
      })
      .end((err, res) => {
        if (err) {
          //   console.log(err);
          done(err);
        }
        res.status.should.eql(404);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });
}); // END PATCH/redflags/:id/location
