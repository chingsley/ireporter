/**eslint-disabled */
import chai from 'chai';
import 'chai/register-should';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import app from '../../src/index';
import { users, dropAndRecreateTables } from '../seed/seed';

dotenv.config();
chai.use(chaiHttp);

// RESET: drop all tables, recreate and repopulate with default values 'before' the test begins
before(dropAndRecreateTables, (done) => {
    done();
}); 

describe('POST /auth/signup', () => {
    it('should signup an admin user successfully', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
        .send(users.admin)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(201);
            res.body.should.be.an('object').that.has.keys(['status', 'data']);
            res.body.status.should.eql(201);
            res.body.data[0].should.be.an('object').that.has.keys(['token', 'user']);
            res.body.data[0].user.should.be.an('object').that.has.keys(['id', 'firstname', 'lastname', 'othernames', 'email', 'phoneNumber', 'username', 'registered', 'isAdmin', 'picture']);
            res.body.data[0].user.id.should.eql(users.admin.id);
            res.body.data[0].user.isAdmin.should.eql(true);
            done();
        });
    });

    it('should signup a customer user successfully', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
            .send(users.validUserOne)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(201);
            res.body.should.be.an('object').that.has.keys(['status', 'data']);
            res.body.status.should.eql(201);
            res.body.data[0].should.be.an('object').that.has.keys(['token', 'user']);
            res.body.data[0].user.should.be.an('object').that.has.keys(['id', 'firstname', 'lastname', 'othernames', 'email', 'phoneNumber', 'username', 'registered', 'isAdmin', 'picture']);
            res.body.data[0].user.id.should.eql(users.validUserOne.id);
            res.body.data[0].user.isAdmin.should.eql(false);
            done();
        });
    });
    
    it('should signup another customer user successfully', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
        .send(users.validUserTwo)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(201);
            res.body.should.be.an('object').that.has.keys(['status', 'data']);
            res.body.status.should.eql(201);
            res.body.data[0].should.be.an('object').that.has.keys(['token', 'user']);
            res.body.data[0].user.should.be.an('object').that.has.keys(['id', 'firstname', 'lastname', 'othernames', 'email', 'phoneNumber', 'username', 'registered', 'isAdmin', 'picture']);
            res.body.data[0].user.id.should.eql(users.validUserTwo.id);
            res.body.data[0].user.isAdmin.should.eql(false);
            done();
        });
    });

    it('should not signup a user if email already exists', (done) => {
        chai.request(app)
            .post('/api/v1/auth/signup')
            .send(users.validUserOne)
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(400);
                res.body.should.be.an('object').with.all.keys(['status', 'error']);
                res.body.status.should.eql(400);
                res.body.error.should.eql(`${users.validUserOne.email.toString().trim()} has been taken. Please choose another email`);
                done();
            });
    });

    it('it should respond with a 400 error message for missing fields', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
        .send(users.invalidUserNoData)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').that.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('values are required for the following fields: firstname, lastname, username, phoneNumber, email, password, confirmPassword');
            done();
        });
    });

    it('it should respond with a 400 error message if firstname is less than 2 characters', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
        .send(users.incorrectFirstname)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').that.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('invalid first name. First name must be a minimum of 2 characters');
            done();
        });
    });

    it('it should respond with a 400 error message if lastname is less than 2 characters', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
        .send(users.incorrectLastname)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').that.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('invalid last name. Last name must be a minimum of 2 characters');
            done();
        });
    });

    it('it should respond with a 400 error message for a wrongly formatted email', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
        .send(users.incorrectEmail)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').that.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('email: leading dash in front of domain is not allowed');
            done();
        });
    });

    it('it should respond with a 400 error message if the two passwords do not match', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
            .send(users.invalidUserMissmatchedPassword)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').that.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('the two passwords do not match');
            done();
        });
    });

    it('it should respond with a 400 error message if password is less than 6 characters', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
            .send(users.passwordTooShort)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').that.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Invalid password. Password should have a minimum of 6 characters');
            done();
        });
    });

    it('it should respond with a 400 error message if phone number is invalid', (done) => {
        chai.request(app)
        .post('/api/v1/auth/signup')
            .send(users.invalidPhoneNumber)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.be.an('object').that.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Invalid phone number. Phone number cannot contain characters, and must be less than 16 digits long');
            done();
        });
    });
});


/********************** POST /auth/login *************** */
describe('POST /auth/login', () => {
    it('should sign in a valid and registered user', (done) => {
        chai.request(app)
        .post('/api/v1/auth/login')
        .send(users.validUserOne)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(200);
            res.body.should.be.an('object').which.has.keys(['status', 'data']);
            res.body.data[0].should.be.an('object').which.has.keys(['token', 'user']);
            res.body.status.should.eql(200);
            res.body.data[0].user.should.be.an('object').that.has.keys(['id', 'firstname', 'lastname', 'othernames', 'email', 'phoneNumber', 'username', 'registered', 'isAdmin', 'picture']);
            res.body.data[0].user.id.should.eql(users.validUserOne.id);
            done();
        });
    });

    it('should a 400 error message if required fields are missing', (done) => {
        chai.request(app)
        .post('/api/v1/auth/login')
        .send(users.invalidUserNoData)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            done();
        });
    });

    it('should not sign user in if non-existing email is provided', (done) => {
        chai.request(app)
        .post('/api/v1/auth/login')
        .send(users.unregisteredUser)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.not.have.keys(['data']);
            res.body.should.have.all.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Invalid email or password');
            done();
        });
    });

    it('should not sign user in if password does not match the specified email', (done) => {
        chai.request(app)
        .post('/api/v1/auth/login')
        .send(users.validUserInvalidPassword)
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.not.have.keys(['data']);
            res.body.should.be.an('object').which.has.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('Invalid email or password');
            done();
        });
    });

    it('should not sign in user if email and/or password is/are not properly formatted', (done) => {
        chai.request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'bad@email', password: '< 6' })
        .end((err, res) => {
            if (err) done(err);

            res.status.should.eql(400);
            res.body.should.not.have.keys(['data']);
            res.body.should.be.an('object').which.has.all.keys(['status', 'error']);
            res.body.status.should.eql(400);
            res.body.error.should.eql('email or password not properly formatted');
            done();
        });
    });
});
/******************* END POST /auth/login ****************/