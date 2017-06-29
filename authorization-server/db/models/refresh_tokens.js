module.exports = (sequelize, DataTypes) => {
  return sequelize.define('refresh_tokens', {
    token: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    clientID: {
      type: DataTypes.INTEGER,
    },
    userID: {
      type: DataTypes.INTEGER,
    },
    scope: {
      type: DataTypes.JSONB,
    },
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
  });
};
