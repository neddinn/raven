/* jshint esversion: 6 */

module.exports = (sequelize, DataTypes) => {
  const Key = sequelize.define('Key', {
    privateKey: { type: DataTypes.TEXT },
    publicKey: { type: DataTypes.TEXT }
  });

  Key.pop = function() {
    return Key.findOne({ 
      where: {
        id: {
          $ne: null
        }
      } 
    })
    .then((key) => {
      if(key) {
        return key.destroy()
          .then(() => key);
      } else {
        return key;
      }
    }); 
  };

  return Key;
};

