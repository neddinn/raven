

module.exports = (sequelize, DataTypes) => {
  const Auth = sequelize.define('Auth', {
    requestID: { type: DataTypes.STRING, primaryKey: true },
    verificationCode: { type: DataTypes.STRING },
  }, {
    underscored: true,
  });

  return Auth;
};
