/* jshint esversion: 6 */

const _ = require('lodash'),
  logger = console || require('winston'),
  models = require('../models/'),
  util = require('../util');

const publicAttributes = ['id', 'email', 'phoneNumber', 'profilePictureURL', 
  'fullName', 'pin', 'pinRecoveryEmail', 'serverKey', 'clientKey'];

module.exports = {
  index: (req, res) => {
    models.User.findAll({})
      .then((users) => {
        res.status(200).json(users);
      })
      .catch(util.handleError(res));
  },

  new: (req, res) => {
    const attrs = _.pick(req.body, 'phoneNumber');

    if (!attrs.phoneNumber) {
      return res.status(500).json({
        message: 'Phone number is required',
      });
    }

    models.User.create(attrs)
      .then(util.responseWithResult(res, 201))
      .catch(util.handleError(res));
  },

  update: (req, res) => {
    if (parseInt(req.params.id, 10) !== req.user.id) {
      return res.status(500).json({
        message: 'Invalid user'
      });
    }
    models.User.findById(req.user.id)
      .then(util.handleEntityNotFound(res))
      .then((user) => {
        if(!user) return;
        const attrs = _.pick(
          req.body, ['email', 'fullName', 'pin', 'pinRecoveryEmail', 'profilePictureURL', 'clientKey']);

        return user
          .update(attrs);
      })
      .then(user => _.pick(user, publicAttributes))
      .then(util.responseWithResult(res))
      .catch(util.handleError(res));
  },
};
