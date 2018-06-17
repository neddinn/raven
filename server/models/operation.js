/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const Operation = sequelize.define('Operation', {
    status: { 
      type: DataTypes.ENUM,
      values: ['pending', 'successful', 'failled']
    },
    message: { type: DataTypes.STRING},
  });

  Operation.associate = (models) => {
    Operation.belongsTo(models.Transaction, { foreignKey: 'transactionId' });
  };

  return Operation;
};
