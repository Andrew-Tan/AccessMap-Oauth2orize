"use strict";

const Sequelize = require('sequelize');
const path = require('path');
const config = require('../../../config').database;
const env = config.mode;
const preset = config[env];
const fs = require('fs');

const sequelize = new Sequelize(preset.database, preset.username, preset.password, preset);

var db = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js") && (file !== "database.json");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize.sync();
module.exports = db;
