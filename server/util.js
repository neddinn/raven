const logger = console || require('winston');

module.exports = {
  handleError: (res, statusCode) => ((err) => {
    logger.error(err);
    res.status(statusCode || 500).json(err);
  }),

  responseWithResult: (res, statusCode) => ((entity) => {
    if (entity) {
      return res.status(statusCode || 200).json(entity);
    }
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