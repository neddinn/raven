/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const Bank = sequelize.define('Bank', {
    code: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING},
    accountNumber: { type: DataTypes.STRING, unique: true  },
  });

  Bank.associate = (models) => {
    Bank.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Bank;
};
