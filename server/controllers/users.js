

const _ = require('lodash'),
  logger = console || require('winston'),
  models = require('../models/');

module.exports = {
  index: (req, res) => {
    models.User.findAll({})
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        logger.error(err);
        res.status(500).json(err);
      });
  },

  new: (req, res) => {
    const attrs = _.pick(req.body, 'phoneNumber');

    if (!attrs.phoneNumber) {
      return res.status(500).json({
        message: 'Phone number is required',
      });
    }

    models.User.create(attrs)
      .then((user) => res.status(201).json(user))
      .catch((err) => {
        logger.error(err);
        res.status(500).json(err);
      });
  },

  update: (req, res) => {
    models.User.findById(req.params.id).then((user) => {
      if (user) {
        const attrs = _.pick(
          req.body, ['phoneNumber', 'email',
            'profilePictureURL', 'fullName']);

        user.update(attrs).then((user) => {
          res.status(200).json(user);
        }).catch((err) => {
          logger.error(err);
          res.status(500).json(err.original.detail);
        });
      } else {
        res.status(404).json({
          message: 'User does not exist.',
        });
      }
    }).catch((err) => {
      logger.error(err);
      res.status(500).json(err);
    });
  },
};
