'use strict';

const models = require('../../server/models/');
const chai = require('chai');
const should = chai.should();

describe('Card', () => {
  let mockCard;
  beforeEach((done) => {
    mockCard = {
      'id': '3',
      'number': '0699890809051201',
      'last4': '1234',
      'brand': 'STANBIC IBTC',
      'expiryMonth': '02',
      'expiryYear': '2020',
      'cvc': '126'
    };
    models.Card.destroy({ where: {} }).then(() => {
      done();
    });
  });

  afterEach((done) => {
    models.Card.destroy({ where: {} }).then(() => {
      done();
    });
  });

  it('should create a card', (done) => {
    models.Card.create(mockCard).then((card) => {
      should.exist(card);
      card.number.should.equal(mockCard.number);
      card.last4.should.equal(mockCard.last4);
      card.brand.should.equal(mockCard.brand);
      done();
    });
  });

  it('should not create two cards with same uid', (done) => {
    models.Card.create(mockCard).then((card) => {
      models.Card.create(mockCard).catch((err) => {
        should.exist(err);
        err.message.should.equal('Validation error');
        err.errors[0].message.should.equal('id must be unique');
        done();
      });
    });
  });

  it('should be able to find a card', (done) => {
    models.Card.create(mockCard).then((createdCard) => {
      models.Card.findOne({
        where: {
          id: createdCard.id
        }
      }).then((card) => {
        should.exist(card);
        card.number.should.equal(mockCard.number);
        done();
      });
    });
  });

  it('should be able to delete a card', (done) => {
    models.Card.create(mockCard).then((createdCard) => {
      createdCard.destroy().then(() => {
        models.Card.findOne({
          where: {
            id: createdCard.id
          }
        }).then((card) => {
          should.not.exist(card);
          done();
        });
      });
    });
  });
});
