/* jshint esversion: 6 */

const logger = console || require('winston');

module.exports = {
  isInvalidRequest: (body, requiredFields) => {
    return !requiredFields.every((field) => body.hasOwnProperty(field) && 
      (body[field] || body[field] === false || body[field] === 0));
  },

  handleError: (res, statusCode) => ((err) => {
    logger.error(err);
    res.status(statusCode || 500).json({ message: 'An error occured' });
  }),

  responseWithResult: (res, statusCode) => ((entity) => {
    if (entity) {
      return res.status(statusCode || 200).json(entity);
    }
    res.status(404).end();
    return null;
  }),

  handleEntityNotFound: res => ((entity) => {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  })
};