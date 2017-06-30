'use strict';

const Sequelize = require('sequelize');
const path = require('path');
const config = require('../../config/index');

const env = config.deployMode;
const preset = config.database[env];
if (preset == null) {
  throw new Error('Database preset not found, check deployMode');
}
const fs = require('fs');

const sequelize = new Sequelize(preset.database, preset.username,
  preset.password, preset);

const db = {};

fs.readdirSync(__dirname).filter((file) => {
  return (file.indexOf('.') !== 0) && (file !== 'index.js') &&
    (file !== 'database.json');
}).forEach((file) => {
  const model = sequelize.import(path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
