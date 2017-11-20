process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHTTP = require('chai-http');
var should = chai.should();
const server = require('../../index.js');
const models = require('../../server/models/');

chai.use(chaiHTTP);


describe('Users',  () => {
  beforeEach((done) => {
    models.User.destroy({where: {}}).then(() => done()).catch((err) => console.log('ree', err))
  });


  describe('/GET User', () => {
    it('Should get all users', (done) => {
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

  describe('/POST User', () => {
    const userDetails = {phoneNumber: '+2347066566012'};
    it('Should not create a new user without phone numner', (done) => {
        chai.request(server)
          .post('/api/v1/users')
          .send({})
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(500);
            res.body.should.be.a('object');
            res.body.should.have.property('message');
            res.body.message.should.be.eql('Phone number is required');
            done();
          })
    });

    it('Should create a new user with phone numner', (done) => {
        chai.request(server)
          .post('/api/v1/users')
          .send(userDetails)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have.property('phoneNumber');
            res.body.phoneNumber.should.eql(userDetails.phoneNumber);
            done();
          })
    });
  });

  describe('/PUT User', () => {
    let userDetails = {phoneNumber: '+2347066566012'};

    beforeEach((done) => {
      models.User.create(userDetails).then((data) => {
        userDetails.id = data.id;
        done()
      })
    });

    it('Should update a user', (done) => {
        chai.request(server)
          .put('/api/v1/users/' + userDetails.id)
          .send({email: 'test@email.com'})
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('phoneNumber');
            res.body.should.have.property('email');
            res.body.phoneNumber.should.eql(userDetails.phoneNumber);
            res.body.email.should.eql('test@email.com');
            done();
          })
    });
  });
})
