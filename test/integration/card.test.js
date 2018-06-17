process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHTTP = require('chai-http');
const should = chai.should();
const server = require('../../index.js');
const models = require('../../server/models/');

chai.use(chaiHTTP);


describe('Users', () => {
  beforeEach((done) => {
    models.User.destroy({ where: {} }).then(() => done());
  });


  describe('/GET /v1/users/{userId}', () => {
    xit('Should get all users', (done) => {
      chai.request(server)
        .get('/api/v1/users')
        .end((err, res) => {
          should.not.exist(err);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        })
    });
  });


  describe('/POST /v1/users/{userId}/cards', () => {
    let cardDetails = { 
      number: '+2347066566012', 
      last4: '1234', 
      brand: 'MasterCard', 
      expiryMonth: '02', expiryYear: '2020', 
      cvc: '126' 
    };

    xit('Should update a user', (done) => {
      chai.request(server)
        .post('/api/v1/users/' + userDetails.id + '/cards')
        .send(cardDetails)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('number').and.eql(cardDetails.number);
          res.body.should.have.property('last4').and.eql(cardDetails.last4);
          res.body.should.have.property('brand').and.eql(cardDetails.brand);
          res.body.should.have.property('brand').and.eql(cardDetails.brand);
          res.body.should.have.property('cvc').and.eql(cardDetails.cvc);
          done();
        })
    });
  });
})
