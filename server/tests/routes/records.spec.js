/**eslint-disabled */
import chai from 'chai';
import 'chai/register-should';
import chaiHttp from 'chai-http';

import app from '../../src/index';
// import pool from '../../server/db/config';
import { users, generateValidToken } from '../seed/seed';

chai.use(chaiHttp);

describe('POST /red-flags  && POST /interventions', () => {
    const { validUserOne} = users;

    it('It should let a signed in user create a new red-flag record successfully', (done) => {
        chai.request(app)
        .post('/api/v1/red-flags')
        .set('x-auth', generateValidToken(validUserOne))
        .send({ location: '88.33938949, 5.282092', comment: "valid comment from user" })
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(201);
            res.body.should.be.an('object').which.has.keys(['status', 'data']);
            res.body.status.should.eql(201);
            res.body.data[0].message.should.eql('created red-flag record');
            res.body.data[0].id.should.eql(1);
            done();
        });
    });

    it('It should let a signed in user create a new intervention record successfully', (done) => {
        chai.request(app)
        .post('/api/v1/interventions')
        .set('x-auth', generateValidToken(validUserOne))
        .send({ location: '88.33938949, 5.282092', comment: "valid comment from user" })
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(201);
            res.body.should.be.an('object').which.has.keys(['status', 'data']);
            res.body.status.should.eql(201);
            res.body.data[0].message.should.eql('created intervention record');
            res.body.data[0].id.should.eql(2);
            done();
        });
    });

    it('It should return a 400 error if there is no value for location', (done) => {
        chai.request(app)
        .post('/api/v1/red-flags')
        .set('x-auth', generateValidToken(validUserOne))
        .send({comment: "I am reporting corruption"})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Please provide location coordinates');
            done();
        });
    });

    it('It should return a 400 error if there is no value for comment', (done) => {
        chai.request(app)
        .post('/api/v1/red-flags')
        .set('x-auth', generateValidToken(validUserOne))
        .send({location: '.33938949, 28.282092'})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Please provide comment.');
            done();
        });
    });

    it('It should return a 400 error for invalid coordinate location', (done) => {
        chai.request(app)
        .post('/api/v1/red-flags')
        .set('x-auth', generateValidToken(validUserOne))
        .send({location: '888.33938949, 233445.282092', comment: "valid comment, but location is not"})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Invalid coordinates. A valid coordinates must be in the format: lat, lng  [lat ranges from -90 to 90, lng ranges from -180 to 180]');
            done();
        });
    });

    it('It should return a 400 error if comment is less than 3 words in length', (done) => {
        chai.request(app)
        .post('/api/v1/red-flags')
        .set('x-auth', generateValidToken(validUserOne))
        .send({location: '88.33938949, 5.282092', comment: "not enough"})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Comment must be a minium of 3 words');
            done();
        });
    });
});


describe('PATCH /:id/red-flags  && PATCH /:id/interventions', () => {
    const { validUserOne, admin } = users;

    it('It should prohibit a non-admin user from changing the status of a red-flag', (done) => {
        chai.request(app)
        .patch('/api/v1/red-flags/1/status')
        .set('x-auth', generateValidToken(validUserOne))
        .send({ status: 'draft'})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(403);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(403);
            res.body.error.should.eql('Auth error. Only admin can access this route');
            done();
        });
    });

    it('It should prohibit a non-admin user from changing the status of a intervention', (done) => {
        chai.request(app)
        .patch('/api/v1/interventions/2/status')
        .set('x-auth', generateValidToken(validUserOne))
        .send({ status: 'draft'})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(403);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(403);
            res.body.error.should.eql('Auth error. Only admin can access this route');
            done();
        });
    });

    it('It should return a 400 error if the status field is missing', (done) => {
        chai.request(app)
        .patch('/api/v1/interventions/2/status')
        .set('x-auth', generateValidToken(admin))
        .send({})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('status field is missing');
            done();
        });
    });

    it('It should return a 400 error if there is no value for the status field', (done) => {
        chai.request(app)
        .patch('/api/v1/interventions/2/status')
        .set('x-auth', generateValidToken(admin))
        .send({status: ' '})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('missing value for status.');
            done();
        });
    });

    it('It should return a 400 error for an invalid status value', (done) => {
        chai.request(app)
        .patch('/api/v1/interventions/2/status')
        .set('x-auth', generateValidToken(admin))
        .send({status: 'not-a-valid-value-for-status'})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('invalid status. Allowed values are draft, under investigation, rejected, or resolved');
            done();
        });
    });

    it('It should return a 400 error for negative id', (done) => {
        chai.request(app)
        .patch('/api/v1/interventions/-2/status')
        .set('x-auth', generateValidToken(admin))
        .send({status: 'draft'})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Records have only positive integer id\'s');
            done();
        });
    });

    it('It should return a 400 error for invalid id', (done) => {
        chai.request(app)
        .patch('/api/v1/interventions/A/status') // A is not a valid id for a red-flag or intervention
        .set('x-auth', generateValidToken(admin))
        .send({status: 'draft'})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql(`\'A\' is not a valid id. Records have only positive integer id's`);
            done();
        }); 
    });

    it('It should return 404 if the id does not match the type', (done) => {
        chai.request(app)
        .patch('/api/v1/red-flags/2/status') // the record with id 2 is an intervention
        .set('x-auth', generateValidToken(admin))
        .send({status: 'draft'})
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(404);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(404);
            res.body.error.should.eql(`no red-flag matches the specified id`);
            done();
        }); 
    });
});