module.exports = function (sequelize, DataTypes) {
  return sequelize.define('authorization_codes', {
    code: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    clientID: {
      type: DataTypes.INTEGER
    },
    redirectURI: {
      type: DataTypes.STRING
    },
    userID: {
      type: DataTypes.INTEGER
    },
    scope: {
      type: DataTypes.JSONB
    }
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });
}
