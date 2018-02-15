/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true },
    email: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING, unique: true },
    profilePictureURL: { type: DataTypes.STRING },
    fullName: { type: DataTypes.STRING },
    pin: { type: DataTypes.STRING },
    pinRecoveryEmail: { type: DataTypes.STRING },
    serverKey: { type: DataTypes.STRING },
    clientKey: { type: DataTypes.STRING },
  }, {
      underscored: true,
    });

  return User;
};
