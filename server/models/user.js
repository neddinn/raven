/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING, unique: true },
    profilePictureURL: { type: DataTypes.STRING },
    fullName: { type: DataTypes.STRING },
    pin: { type: DataTypes.STRING },
    pinRecoveryEmail: { type: DataTypes.STRING },
    privateKey: { type: DataTypes.TEXT },
    serverKey: { type: DataTypes.TEXT },
    clientKey: { type: DataTypes.TEXT },
  });

  User.associate = models => {
    User.hasMany(models.Bank, { foreignKey: 'userId' });
    User.hasMany(models.Card, { foreignKey: 'userId' });
    User.hasMany(models.Transaction, { foreignKey: 'senderId' });
    User.hasMany(models.Transaction, { foreignKey: 'recipientId' });
    User.hasMany(models.Request, { foreignKey: 'senderId' });
    User.hasMany(models.Request, { foreignKey: 'recipientId' });
  };


  return User;
};
