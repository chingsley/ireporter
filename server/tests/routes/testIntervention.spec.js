/**eslint-disabled */
import chai from 'chai';
import 'chai/register-should';
import chaiHttp from 'chai-http';

import app from '../../src/index';
// import pool from '../../server/db/config';
import { users, generateValidToken } from '../seed/seed';

chai.use(chaiHttp);


describe('GET /interventions ', () => {
    const { validUserOne, validUserTwo, admin } = users;

    it('It should let an admin successfully get all intervention record', (done) => {
        chai.request(app)
            .get('/api/v1/interventions')
            .set('x-auth', generateValidToken(admin))
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(200);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(200);
                done();
            });
    });

    it('It should let a registered successfully get their own intervention records', (done) => {
        chai.request(app)
            .get('/api/v1/interventions')
            .set('x-auth', generateValidToken(validUserOne))
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(200);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(200);
                done();
            });
    });
});

describe('GET /interventions ', () => {
    const { validUserOne, validUserTwo, admin } = users;

    it('It should let an admin successfully get any intervention record', (done) => {
        chai.request(app)
            .get('/api/v1/interventions/2')
            .set('x-auth', generateValidToken(admin))
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(200);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(200);
                done();
            });
    });

    it('It should let a valid user successfully get their own intervention records', (done) => {
        chai.request(app)
            .get('/api/v1/interventions/2')
            .set('x-auth', generateValidToken(validUserOne))
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(200);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(200);
                done();
            });
    });

    it(`It should not allow a user get another user's record`, (done) => {
        chai.request(app)
            .get('/api/v1/interventions/2')
            .set('x-auth', generateValidToken(validUserTwo))
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(401);
                res.body.should.be.an('object').which.has.keys(['status', 'error']);
                res.body.status.should.eql(401);
                done();
            });
    });
});

describe('PATCH interventions/:id/status ', () => {
    const { validUserOne, admin } = users;

    it('It should let an admin successfully update the status of a intervention', (done) => {
        chai.request(app)
            .patch('/api/v1/interventions/2/status') // records 1 and 3 are interventions, while 2 and 4 are interventions. So id's 1 and 3 will fail this test, while 2 and 4 will pass the test
            .set('x-auth', generateValidToken(admin))
            .send({ status: 'resolved' })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(200);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(200);
                res.body.data[0].id.should.eql(2);
                done();
            });
    });

    it('It should return 404 if the id does not match the type', (done) => {
        chai.request(app)
            .patch('/api/v1/interventions/1/status') // the record with id 1 is intervention
            .set('x-auth', generateValidToken(admin))
            .send({ status: 'draft' })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(404);
                res.body.should.be.an('object').which.has.keys(['status', 'error']);
                res.body.status.should.eql(404);
                res.body.error.should.eql(`no intervention matches the specified id`);
                done();
            });
    });
});

describe('PATCH interventions/:id/location ', () => {
    const { validUserOne, validUserTwo } = users;

    it('It should let user successfully edit the location of a draft intervention', (done) => {
        chai.request(app)
            .patch('/api/v1/interventions/4/location') 
            .set('x-auth', generateValidToken(validUserTwo))
            .send({ location: '0.3344, -23.4454' })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(200);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(200);
                res.body.data[0].id.should.eql(4);
                done();
            });
    });

    it(`It should not allow change of location if status is not 'draft'`, (done) => {
        chai.request(app)
            .patch('/api/v1/interventions/2/location') // records 1 and 3 are interventions, while 2 and 4 are interventions. So id's 1 and 3 will pass this test, while 2 and 4 will fail the test
            .set('x-auth', generateValidToken(validUserOne))
            .send({ location: '0.3344, -23.4454' })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(403);
                res.body.should.be.an('object').which.has.keys(['status', 'error']);
                res.body.status.should.eql(403);
                res.body.error.should.eql(`The specified intervention cannot be edited because it is resolved`);
                done();
            });
    });
});


describe('PATCH interventions/:id/comment ', () => {
    const { validUserOne, validUserTwo } = users;

    it('It should let user successfully edit the comment of a draft intervention', (done) => {
        chai.request(app)
            .patch('/api/v1/interventions/4/comment') 
            .set('x-auth', generateValidToken(validUserTwo))
            .send({ comment: 'a valid comment provided' })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(200);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(200);
                res.body.data[0].id.should.eql(4);
                done();
            });
    });

    it(`It should not allow change of comment if status is not 'draft'`, (done) => {
        chai.request(app)
            .patch('/api/v1/interventions/2/comment') // records 1 and 3 are interventions, while 2 and 4 are interventions. So id's 1 and 3 will pass this test, while 2 and 4 will fail the test
            .set('x-auth', generateValidToken(validUserOne))
            .send({ comment: 'some comment provided here' })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(403);
                res.body.should.be.an('object').which.has.keys(['status', 'error']);
                res.body.status.should.eql(403);
                res.body.error.should.eql(`The specified intervention cannot be edited because it is resolved`);
                done();
            });
    });
});



describe('DELETE interventions/:id ', () => {
    const { validUserOne, validUserTwo } = users;

    it('It should return a 404 if intervention is not found', (done) => {
        chai.request(app)
            .delete('/api/v1/interventions/10000') // record 1 becomes to validUserOne, so for validUserTwo cannot access/delete record 1
            .set('x-auth', generateValidToken(validUserTwo))
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(404);
                res.body.should.be.an('object').which.has.keys(['status', 'error']);
                res.body.status.should.eql(404);
                res.body.error.should.eql(`No intervention matches the id of 10000`);
                done();
            });
    });

    it(`It should not allow delete operation if status is not 'draft'`, (done) => {
        chai.request(app)
            .delete('/api/v1/interventions/2') // record 1 is in resolved state
            .set('x-auth', generateValidToken(validUserOne))
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(403);
                res.body.should.be.an('object').which.has.keys(['status', 'error']);
                res.body.status.should.eql(403);
                res.body.error.should.eql(`The specified intervention cannot be deleted because it is resolved`);
                done();
            });
    });

    it(`It should prevent users from deleting someone else's records`, (done) => {
        chai.request(app)
            .delete('/api/v1/interventions/4') //record 3 belongs to validUserTwo, so cannot be deleted by validUserOne
            .set('x-auth', generateValidToken(validUserOne))
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(401);
                res.body.should.be.an('object').which.has.keys(['status', 'error']);
                res.body.status.should.eql(401);
                res.body.error.should.eql(`cannot delete`);
                done();
            });
    });
});