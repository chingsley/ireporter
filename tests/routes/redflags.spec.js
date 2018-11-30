import chai from 'chai';
import 'chai/register-should';
import chaiHttp from 'chai-http';
// import dotenv from 'dotenv';
// import fs from 'fs';
import app from '../../server/index';
import { clearRecords } from '../setup/setup';

before(clearRecords);

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

  it('should not allow unregistered users to create a redflag record', (done) => {
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

  it('should return a 400 error if the comment is less than 3 words', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'eneja.kc@gmail.com',
        type: 'red-flag',
        location: '2.3332, -3.32222',
        comment: 'reporting corruption', // comment less than 3 words
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
        comment: 'reporting corruption in my area',
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
        email: 'eneja.kc@gmail.com',
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

  it('should return a 400 error if a required field is missing or is without value', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/location') // 'a' is not a valid redflag id
      .send({
        email: 'eneja.kc@gmail.com',
        // no value for 'location'
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

  it('should return a 400 error if the provided email wrongly formatted', (done) => {
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

  it(`should return a 404 error if no redflag in the system has the specifed id`, (done) => {
    chai.request(app)
      // no red-flag with id = -1
      .patch('/api/v1/redflags/-1/location')
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
 



/**-------------- PATCH /redflags/:id/comment -------------------*/
describe('PATCH /redflags/:id/comment', () => {

  it('should successfully update the comment of a redflag record', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/comment') // 'a' is not a valid redflag id
      .send({
        email: 'eneja.kc@gmail.com',
        comment: 'This is eneja.kc fighting corruption',
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
      .patch('/api/v1/redflags/a/comment') // 'a' is not a valid redflag id
      .send({
        email: 'eneja.kc@gmail.com',
        comment: 'This is eneja.kc reporting corruption',
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

  it('should return a 400 error if a required field is missing or is without value', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/comment') // 'a' is not a valid redflag id
      .send({
        email: 'eneja.kc@gmail.com',
        // no value for 'comment'
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

  it('should return a 400 error if the provided email wrongly formatted', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/comment')
      .send({
        email: 'eneja*(*( kc@-gm ail.com',
        comment: 'This is eneja.kc reporting corrupiton',
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

  it('should return a 400 error if the comment is less than 3 words', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/comment')
      .send({
        email: 'eneja.kc@gmail.com',
        comment: 'reporting corruption', // comment less than 3 words
      })
      .end((err, res) => {
        if (err) done(err);

        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(400);
        done();
      });
  });

  it('should return a 401 error if an unregisterd user attempts to edit the comment of a redflag', (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/comment')
      .send({
        email: 'unregisteredUser@gmail.com',
        comment: "urnregistered user is trying to report corruption"
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
      .patch('/api/v1/redflags/-1/comment')
      // The red-flag with id = -1 does not exist
      .send({
        email: 'eneja.kc@gmail.com',
        comment: "some valid comment"
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

  it(`should return a 401 error if a user tries to edit a redflag that does not match their id`, (done) => {
    chai.request(app)
      .patch('/api/v1/redflags/1/comment')
      // The red flag with id = 1 belongs to eneja.kc@gmail.com, therefore, cannot be edited by user with email john@gmail.com
      .send({
        email: 'john@gmail.com',
        comment: "some valid comment"
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
});
/**-------------------- END PATCH /redflags/:id/comment -------------------------- */





/**--------------------- GET /redflags/:id -------------- */
describe('GET /redflags/:id', () => {

    it(`should return a 400 error if an invalid red-flag id is provided as parameter`, (done) => {
      chai.request(app)
      .get('/api/v1/redflags/a') // 'a' is an invalid red-flag id
      .end((err, res) => {
        if(err) {
          done(err);
        }
        res.status.should.eql(400);
        res.body.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
    });

    it(`should return a 400 error if negative id is provided`, (done) => {
      chai.request(app)
      .get('/api/v1/redflags/-1')
      .end((err, res) => {
        if(err) {
          done(err);
        }
        res.status.should.eql(400);
        res.body.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
    });

    it(`should return an empty object if the requested red-flag does not exist`, (done) => {
      chai.request(app)
      .get('/api/v1/redflags/10000') // no red-flag with id 10000
      .end((err, res) => {
        if(err) {
          done(err);
        }
        res.status.should.eql(200);
        res.body.status.should.eql(200);
        res.body.should.be.an('object').which.has.all.keys(['status', 'data']);
        res.body.data.should.be.an('array');
        res.body.data[0].should.be.an('object'); // how can I test for an empty obj in mocha ?
        done();
      });
    });

    it(`should successfully return the requested red-flag`, (done) => {
      chai.request(app)
      .get('/api/v1/redflags/1') // no red-flag with id 10000
      .end((err, res) => {
        if(err) {
          done(err);
        }
        res.status.should.eql(200);
        res.body.status.should.eql(200);
        res.body.should.be.an('object').which.has.all.keys(['status', 'data']);
        res.body.data.should.be.an('array');
        res.body.data[0].should.be.an('object');
        done();
      });
    });

});
/**----------------------- (END) GET/redflags/:id -----------*/



/**--------------------- DELETE /redflags/:id -------------- */
describe('DELETE /redflags/:id', () => {

  it(`should return a 400 error if email is not provided`, (done) => {
    chai.request(app)
      .delete('/api/v1/redflags/1') 
      .send({}) // email not provided
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.status.should.eql(400);
        res.body.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it(`should return a 400 error if provided email is wrongley formatted`, (done) => {
    chai.request(app)
      .delete('/api/v1/redflags/1') 
      .send({email: "wrong-email-format-at-yohoo-***dotcom"})
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.status.should.eql(400);
        res.body.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it(`should return a 401 error if the provided email is not registered`, (done) => {
    chai.request(app)
      .delete('/api/v1/redflags/1') 
      .send({ email: "unregisteredMail@gmail.com" })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.status.should.eql(401);
        res.body.status.should.eql(401);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it(`should return a 401 error if the redflag exists, but does not belong to the user trying to delete it`, (done) => {
    chai.request(app)
      .delete('/api/v1/redflags/1') 
      .send({ email: "john@gmail.com" }) // john trying to delete a red-flag belonging to eneja.kc
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.status.should.eql(401);
        res.body.status.should.eql(401);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it(`should return a 400 error if an invalid red-flag id is provided as parameter`, (done) => {
    chai.request(app)
      .delete('/api/v1/redflags/a') // 'a' is an invalid red-flag id
      .send({ email: "eneja.kc@gmail.com" })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.status.should.eql(400);
        res.body.status.should.eql(400);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });

  it(`should return 404 if there's no redflag in the system with the specified id`, (done) => {
    chai.request(app)
      .delete('/api/v1/redflags/1000') 
      .send({ email: "eneja.kc@gmail.com" })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.status.should.eql(404);
        res.body.status.should.eql(404);
        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        done();
      });
  });


});

/**---------------------(END) DELETE /redflags/:id -------------- */