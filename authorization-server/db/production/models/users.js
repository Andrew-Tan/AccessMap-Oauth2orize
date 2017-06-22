module.exports = (sequelize, DataTypes) => {
  return sequelize.define('users', {
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    salt: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });
}