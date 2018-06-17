/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define(
    'Transaction',
    {
      amount: { type: DataTypes.STRING },
      currency: { type: DataTypes.STRING },
      messageFromSender: { type: DataTypes.STRING },
      messageFromRecipient: { type: DataTypes.STRING },
      status: {
        type: DataTypes.ENUM,
        values: ['pending', 'accepted', 'declined', 'cancelled']
      },
      createdAt: { type: DataTypes.DATE }
    });


  Transaction.associate = models => {
    Transaction.belongsTo(models.Bank, { as: 'recipientBank', foreignKey: 'recipientBankId' });
    Transaction.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
    Transaction.belongsTo(models.User, { as: 'recipient', foreignKey: 'recipientId' });
    Transaction.belongsTo(models.Card, { as: 'senderCard', foreignKey: 'senderCardId' });
    Transaction.hasOne(models.Operation, { foreignKey: 'transactionId' });
  };

  return Transaction;
};