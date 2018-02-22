const _ = require('lodash'),
  logger = console || require('winston'),
  models = require('../models/'),
  util = require('../util');

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
    models.User.findById(req.params.id)
      .then(util.handleEntityNotFound(res))
      .then((user) => {
        const attrs = _.pick(
          req.body, ['phoneNumber', 'email',
            'profilePictureURL', 'fullName']);

        return user
          .update(attrs);
      })
      .then(util.responseWithResult(res))
      .catch(util.handleError(res));
  },
};
