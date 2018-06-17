/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
    const Request = sequelize.define(
    'Request',
    {
      amount: { type: DataTypes.STRING },
      currency: { type: DataTypes.STRING },
      messageFromSender: { type: DataTypes.STRING},
      messageFromRecipient: { type: DataTypes.STRING},
      status: {
        type: DataTypes.ENUM,
        values: ['pending', 'accepted', 'declined', 'cancelled']
      },
      declinedReason: { type: DataTypes.STRING},
      createdAt: { type: DataTypes.DATE }
    });


  Request.associate = models => {
    Request.belongsTo(models.User, { foreignKey: 'senderId' });
    Request.belongsTo(models.User, { foreignKey: 'recipientId' });
  };

  return Request;
};
