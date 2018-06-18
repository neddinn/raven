/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const Operation = sequelize.define('Operation', {
    status: { 
      type: DataTypes.ENUM,
      values: ['pending', 'success', 'error']
    },
    message: { type: DataTypes.STRING},
  });

  Operation.associate = (models) => {
    Operation.belongsTo(models.Transaction, { foreignKey: 'transactionId', unique: true});
  };

  return Operation;
};
