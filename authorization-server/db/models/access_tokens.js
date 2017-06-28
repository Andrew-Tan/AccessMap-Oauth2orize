module.exports = (sequelize, DataTypes) => {
  return sequelize.define('access_tokens', {
    token: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userID: {
      type: DataTypes.INTEGER,
    },
    expirationDate: {
      type: DataTypes.DATE,
    },
    clientID: {
      type: DataTypes.INTEGER,
    },
    scope: {
      type: DataTypes.JSONB,
    },
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
  });
};
