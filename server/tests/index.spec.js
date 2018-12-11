/**eslint-disabled */
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'chai/register-should';
import app from '../src';

chai.use(chaiHttp);

describe('GET /nonexisting-routes', () => {
    it('should respond with status 404, and an error message for a non existing GET route', (done) => {
        chai.request(app)
            .get('/nonexistentroute')
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(404);
                res.body.should.be.an('object');
                res.body.should.have.keys(['status', 'error']);
                res.body.status.should.eql(404);
                res.body.error.should.eql('the specified route cannot be found on this server');
                done();
            });
    });

    it('should respond with status 404 and an error message for a non existing POST route', (done) => {
        chai.request(app)
            .post('/nonexistent-route')
            .end((err, res) => {
                if (err) done(err);

                res.status.should.eql(404);
                res.body.should.be.an('object').which.has.keys(['status', 'error']);
                res.body.status.should.eql(404);
                res.body.error.should.eql('the specified route cannot be found on this server');
                done();
            });
    });
});
