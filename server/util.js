const logger = console || require('winston');

module.exports = {
  handleError: (res, statusCode) => ((err) => {
    logger.error(err);
    res.status(statusCode || 500).json(err);
  }),

  responseWithResult: (res, statusCode) => ((entity) => {
    res.status(statusCode || 200).json(entity);
  }),

  handleEntityNotFound: res => ((entity) => {
    if (!entity) {
      return res.status(404).end();
    }
    return entity;
  })
};