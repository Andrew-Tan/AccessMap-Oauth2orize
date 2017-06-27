'use strict';

const jwt = require('jsonwebtoken');
const moment = require('moment');

// The access tokens.
// You will use these to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Tokens sequelize data structure which stores all of the access tokens
 */
const models = require('./models');

/**
 * Returns an access token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the access token to find.
 * @returns {Promise} resolved with the token if found, otherwise resolved with undefined
 */
exports.find = async (token) => {
  try {
    const id = jwt.decode(token).jti;
    const result = await models.access_tokens.findOne({
      where: {
        token: id
      }
    });

    if (result === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve({
      clientID       : result.clientID,
      expirationDate : new Date(result.expirationDate),
      userID         : result.userID,
      scope          : result.scope,
    })
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Saves a access token, expiration date, user id, client id, and scope. Note: The actual full
 * access token is never saved.  Instead just the ID of the token is saved.  In case of a database
 * breach this prevents anyone from stealing the live tokens.
 * @param   {Object}  token          - The access token (required)
 * @param   {Date}    expirationDate - The expiration of the access token (required)
 * @param   {String}  userID         - The user ID (required)
 * @param   {String}  clientID       - The client ID (required)
 * @param   {String}  scope          - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = async (token, expirationDate, userID, clientID, scope) => {
  const id = jwt.decode(token).jti;

  try {
    await models.access_tokens.create({
      token: id,
      expirationDate: expirationDate,
      userID: userID,
      clientID: clientID,
      scope: scope
    });
  } catch (error) {
    return Promise.resolve(undefined);
  }

  return Promise.resolve({
    expirationDate: expirationDate,
    userID: userID,
    clientID: clientID,
    scope: scope
  });
};

/**
 * Deletes/Revokes an access token by getting the ID and removing it from the storage.
 * @param   {String}  token - The token to decode to get the id of the access token to delete.
 * @returns {Promise} resolved with the deleted token or undefined if nothing is deleted
 */
exports.delete = async (token) => {
  try {
    const id = jwt.decode(token).jti;
    let deletedEntry = undefined;
    await models.sequelize.transaction(t => {
      return models.access_tokens.findOne({
        where: {
          token: id
        }
      }, {transaction: t}).then(code => {
        if (code ===  null) {
          throw new Error();
        }
        deletedEntry = code;
        return models.access_tokens.destroy({
          where: {
            token: id
          },
          truncate: true
        }, {transaction: t});
      });
    });
    return Promise.resolve({
      clientID: deletedEntry.clientID,
      expirationDate: new Date(deletedEntry.expirationDate),
      scope: deletedEntry.scope,
      userID: deletedEntry.userID
    });
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Removes expired access tokens. It does this by looping through them all and then removing the
 * expired ones it finds.
 * @returns {Promise} resolved with an associative of tokens that were expired
 */
exports.removeExpired = () => {
  // TODO: is not returning the correct thing.
  return models.access_tokens.destroy({
    where: {
      expirationDate: { $lt: moment() }
    },
  });
};

/**
 * Removes all access tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */
exports.removeAll = () => {
  // TODO: is not returning the correct thing.
  return models.access_tokens.destroy({
    where: {},
  });
};
