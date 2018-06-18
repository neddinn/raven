/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    number: { type: DataTypes.TEXT },
    last4: { type: DataTypes.STRING, unique: true },
    brand: { type: DataTypes.STRING },
    expiryMonth: { type: DataTypes.TEXT },
    expiryYear: { type: DataTypes.TEXT },
    cvv: { type: DataTypes.TEXT },
  });

  Card.associate = (models) => {
    Card.belongsTo(models.User, { foreignKey: 'userId' });
  };

  Card.sensitiveFields = ['cvv', 'number', 'expiryMonth', 'expiryYear'];

  return Card;
};
