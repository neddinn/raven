/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    number: { type: DataTypes.STRING },
    last4: { type: DataTypes.STRING, unique: true },
    brand: { type: DataTypes.STRING },
    expiryMonth: { type: DataTypes.STRING },
    expiryYear: { type: DataTypes.STRING },
    cvc: { type: DataTypes.STRING },
  });

  Card.associate = (models) => {
    Card.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Card;
};
