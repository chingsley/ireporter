/**eslint-disabled */
import chai from 'chai';
import 'chai/register-should';
import chaiHttp from 'chai-http';

import app from '../../src/index';
// import pool from '../../server/db/config';
import { users, generateValidToken } from '../seed/seed';

chai.use(chaiHttp);

describe('POST /red-flags  && POST /interventions', () => {
    const { validUserOne, validUserTwo} = users;

    it('It should let a signed in user (validUserOne) create a new red-flag record successfully', (done) => {
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

    it('It should let a validUserOne create a new intervention record successfully', (done) => {
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

    it('It should let another signed in user (validUserTwo) create a new red-flag record successfully', (done) => {
        chai.request(app)
            .post('/api/v1/red-flags')
            .set('x-auth', generateValidToken(validUserTwo))
            .send({ location: '88.33938949, 5.282092', comment: "valid comment from user" })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(201);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(201);
                res.body.data[0].message.should.eql('created red-flag record');
                res.body.data[0].id.should.eql(3);
                done();
            });
    });


    it('It should also validUserTwo create a new intervention record successfully', (done) => {
        chai.request(app)
            .post('/api/v1/interventions')
            .set('x-auth', generateValidToken(validUserTwo))
            .send({ location: '88.33938949, 5.282092', comment: "valid comment from user" })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(201);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(201);
                res.body.data[0].message.should.eql('created intervention record');
                res.body.data[0].id.should.eql(4);
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
            // res.body.error.should.eql('Please provide location coordinates');
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
            // res.body.error.should.eql('Invalid coordinates. A valid coordinates must be in the format: lat, lng  [lat ranges from -90 to 90, lng ranges from -180 to 180]');
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

describe('GET /red-flags ', () => {
    const { validUserOne, validUserTwo, admin } = users;

    it('It should let an admin successfully get all red-flag record', (done) => {
        chai.request(app)
        .get('/api/v1/red-flags')
        .set('x-auth', generateValidToken(admin))
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(200);
            res.body.should.be.an('object').which.has.keys(['status', 'data']);
            res.body.status.should.eql(200);
            done();
        });
    });

    it('It should let a registered successfully get their own red-flag records', (done) => {
        chai.request(app)
            .get('/api/v1/red-flags')
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

describe('GET /red-flags/:id ', () => {
    const { validUserOne, validUserTwo, admin } = users;

    it('It should let an admin successfully get any red-flag record', (done) => {
        chai.request(app)
        .get('/api/v1/red-flags/1')
        .set('x-auth', generateValidToken(admin))
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(200);
            res.body.should.be.an('object').which.has.keys(['status', 'data']);
            res.body.status.should.eql(200);
            done();
        });
    });

    it('It should let a register successfully get their own red-flag records', (done) => {
        chai.request(app)
        .get('/api/v1/red-flags/1') 
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
        .get('/api/v1/red-flags/1') 
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

describe('PATCH red-flags/:id/status ', () => {
    const { validUserOne, admin } = users;

    it('It should let an admin successfully update the status of a red-flag', (done) => {
        chai.request(app)
            .patch('/api/v1/red-flags/1/status') // records 1 and 3 are red-flags, while 2 and 4 are interventions. So id's 1 and 3 will pass this test, while 2 and 4 will fail the test
            .set('x-auth', generateValidToken(admin))
            .send({ status: 'resolved' })
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(200);
                res.body.should.be.an('object').which.has.keys(['status', 'data']);
                res.body.status.should.eql(200);
                res.body.data[0].id.should.eql(1);
                done();
            });
    });

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


describe('PATCH red-flags/:id/location ', () => {
    const { validUserOne, validUserTwo } = users;

    it('It should let user successfully edit the location of a draft red-flag', (done) => {
        chai.request(app)
        .patch('/api/v1/red-flags/3/location') // records 1 and 3 are red-flags, while 2 and 4 are interventions. So id's 1 and 3 will pass this test, while 2 and 4 will fail the test
        .set('x-auth', generateValidToken(validUserTwo))
        .send({ location: '0.3344, -23.4454' })
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(200);
            res.body.should.be.an('object').which.has.keys(['status', 'data']);
            res.body.status.should.eql(200);
            res.body.data[0].id.should.eql(3);
            done();
        });
    });

    it(`It should not allow change of location if status is not 'draft'`, (done) => {
        chai.request(app)
        .patch('/api/v1/red-flags/1/location') // records 1 and 3 are red-flags, while 2 and 4 are interventions. So id's 1 and 3 will pass this test, while 2 and 4 will fail the test
        .set('x-auth', generateValidToken(validUserOne))
        .send({ location: '0.3344, -23.4454' })
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(403);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(403);
            res.body.error.should.eql(`The specified red-flag cannot be edited because it is resolved`);
            done();
        });
    });
});


describe('PATCH red-flags/:id/comment ', () => {
    const { validUserOne, validUserTwo } = users;

    it('It should let user successfully edit the comment of a draft red-flag', (done) => {
        chai.request(app)
        .patch('/api/v1/red-flags/3/comment') // records 1 and 3 are red-flags, while 2 and 4 are interventions. So id's 1 and 3 will pass this test, while 2 and 4 will fail the test
        .set('x-auth', generateValidToken(validUserTwo))
        .send({ comment: 'valid new comment' })
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(200);
            res.body.should.be.an('object').which.has.keys(['status', 'data']);
            res.body.status.should.eql(200);
            res.body.data[0].id.should.eql(3);
            done();
        });
    });

    it(`It should not allow change of comment if status is not 'draft'`, (done) => {
        chai.request(app)
        .patch('/api/v1/red-flags/1/comment') // records 1 and 3 are red-flags, while 2 and 4 are interventions. So id's 1 and 3 will pass this test, while 2 and 4 will fail the test
        .set('x-auth', generateValidToken(validUserOne))
        .send({ comment: 'some comment provided here' })
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(403);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(403);
            res.body.error.should.eql(`The specified red-flag cannot be edited because it is resolved`);
            done();
        });
    });
});

describe('DELETE red-flags/:id ', () => {
    const { validUserOne, validUserTwo } = users;

    it('It should return a 404 if red-flag is not found', (done) => {
        chai.request(app)
        .delete('/api/v1/red-flags/10000') // record 1 becomes to validUserOne, so for validUserTwo cannot access/delete record 1
        .set('x-auth', generateValidToken(validUserTwo))
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(404);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(404);
            res.body.error.should.eql(`No red-flag matches the id of 10000`);
            done();
        });
    });

    it(`It should not allow delete operation if status is not 'draft'`, (done) => {
        chai.request(app)
        .delete('/api/v1/red-flags/1') // record 1 is in resolved state
        .set('x-auth', generateValidToken(validUserOne))
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(403);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(403);
            res.body.error.should.eql(`The specified red-flag cannot be deleted because it is resolved`);
            done();
        });
    });

    it(`It should prevent users from deleting someone else's records`, (done) => {
        chai.request(app)
        .delete('/api/v1/red-flags/3') //record 3 belongs to validUserTwo, so cannot be deleted by validUserOne
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