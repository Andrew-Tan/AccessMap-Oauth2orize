module.exports = function (sequelize, DataTypes) {
  return sequelize.define('clients', {
    name: {
      type: DataTypes.STRING
    },
    clientId: {
      type: DataTypes.STRING
    },
    clientSecret: {
      type: DataTypes.STRING
    },
    trustedClient: {
      type: DataTypes.BOOLEAN
    },
    callbackUri: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
  });
}
