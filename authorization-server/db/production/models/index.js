"use strict";

const Sequelize = require("sequelize");
const path = require("path");
const config_file = require(path.join(__dirname, 'database.json'));
const env = config_file["mode"];
const config = require(path.join(__dirname, 'database.json'))[env];
const fs = require("fs");

let sequelize = new Sequelize(config.database, config.username, config.password, config);

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