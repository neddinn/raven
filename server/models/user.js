

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true },
    email: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING, unique: true },
    profilePictureURL: { type: DataTypes.STRING },
    fullName: { type: DataTypes.STRING },
    lastSeen: { type: DataTypes.DATE },
    // lastSeenLocation:   { type: DataTypes.GEOMETRY },
  }, {
    underscored: true,
  });

  return User;
};
