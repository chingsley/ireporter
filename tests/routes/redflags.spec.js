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
      })
      .end((err, res) => {
        if (err) done(err);

        res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
        res.status.should.eql(400);
        done();
      });
  });

  it('should return an error message if the type field is not red-flag or intervention', (done) => {
    chai.request(app)
      .post('/api/v1/redflags')
      .send({
        email: 'eneja.kc@gmail.com',
        latitude: '(.2898282, 2.228982)',
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
});
