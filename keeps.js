/** test.js */

const messanger = require('../api/routes/messangerFunctions/orderMessanger');

const orders = messanger.getOrders();

const chai = require('chai');
const expect = require('chai').expect;

chai.use(require('chai-http'));

const app = require('../app.js'); // Our app; Recall that server.js imports app.js

describe('API endpoint /api/v1/orders', function () {
    this.timeout(5000);

    before(() => { });
    after(() => { });

    // GET - List all orders
    it('should return all orders', () => {
        return chai.request(app)
            .get('/api/v1/orders')
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.result).to.be.an('array');
            });// end then()
    });// end it()


    // POST - an  order
    it('should add a new order', () => {
        return chai.request(app)
            .post('/api/v1/orders')
            .then(function (res) {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
            });// end then()
    });// end it()

    let id = orders[orders.length - 1].orderID; // the orderID of the new order add by the post method within this test.
    console.log(id);
    console.log(orders);

    // GET - a specific order
    it('should return a specific order', () => {
        return chai.request(app)
            .get(`/api/v1/orders/${id}`)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.result).to.be.an('object');
            });// end then()
    });// end it()


    // PUT - edit the status of a specific order
    it('should update an order and return 200', () => {
        return chai.request(app)
            .put(`/api/v1/orders/${id}`)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                // expect(res.body.result).to.be.an('object');
            });// end then()
    });// end it()

    console.log(orders);


    // DELETE - delete a specific order
    it('should delete an order and return 204', () => {
        return chai.request(app)
            .delete(`/api/v1/orders/${id}`)
            .then(function (res) {
                expect(res).to.have.status(204);
                expect(res.body).to.be.an('object');
                // expect(res.body.result).to.be.an('object');
            });// end then()
    });// end it()


});// ENDS THE MAIN describe()