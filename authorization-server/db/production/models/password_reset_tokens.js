module.exports = function (sequelize, DataTypes) {
  return sequelize.define('password_reset_tokens', {
    token: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userID: {
      type: DataTypes.INTEGER
    },
    expirationDate: {
      type: DataTypes.DATE
    }
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
  });
}
