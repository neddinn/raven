/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const PhoneNumberVerification = sequelize.define('PhoneNumberVerification', {
    requestID: { type: DataTypes.STRING, primaryKey: true },
    verificationCode: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING, unique: true },
  }, {
      underscored: true,
    });

  return PhoneNumberVerification;
};
