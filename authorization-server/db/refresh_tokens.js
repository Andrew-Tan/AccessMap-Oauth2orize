'use strict';

const jwt = require('jsonwebtoken');

// The refresh tokens.
// You will use these to get access tokens to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Tokens sequelize data structure which stores all of the refresh tokens
 */
const models = require('./models');

/**
 * Returns a refresh token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the refresh token to find.
 * @returns {Promise} resolved with the token
 */
exports.find = async (token) => {
  try {
    const id = jwt.decode(token).jti;
    const result = await models.refresh_tokens.findOne({
      where: {
        token: id
      }
    });

    if (result === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve({
      clientID       : result.clientID,
      userID         : result.userID,
      scope          : result.scope,
    })
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Saves a refresh token, user id, client id, and scope. Note: The actual full refresh token is
 * never saved.  Instead just the ID of the token is saved.  In case of a database breach this
 * prevents anyone from stealing the live tokens.
 * @param   {Object}  token    - The refresh token (required)
 * @param   {String}  userID   - The user ID (required)
 * @param   {String}  clientID - The client ID (required)
 * @param   {String}  scope    - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = async (token, userID, clientID, scope) => {
  const id = jwt.decode(token).jti;

  try {
    await models.refresh_tokens.create({
      token: id,
      userID: userID,
      clientID: clientID,
      scope: scope
    });
  } catch (error) {
    return Promise.resolve(undefined);
  }

  return Promise.resolve({
    userID: userID,
    clientID: clientID,
    scope: scope
  });
};

/**
 * Deletes a refresh token
 * @param   {String}  token - The token to decode to get the id of the refresh token to delete.
 * @returns {Promise} resolved with the deleted token
 */
exports.delete = async (token) => {
  try {
    const id = jwt.decode(token).jti;
    let deletedEntry = undefined;
    await models.sequelize.transaction(t => {
      return models.refresh_tokens.findOne({
        where: {
          token: id
        }
      }, {transaction: t}).then(code => {
        if (code ===  null) {
          throw new Error();
        }
        deletedEntry = code;
        return models.refresh_tokens.destroy({
          where: {
            token: id
          },
          truncate: true
        }, {transaction: t});
      });
    });
    return Promise.resolve({
      clientID: deletedEntry.clientID,
      scope: deletedEntry.scope,
      userID: deletedEntry.userID
    });
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Removes all refresh tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */
exports.removeAll = () => {
  // TODO: is not returning the correct thing.
  return models.refresh_tokens.destroy({
    where: {},
    truncate: true
  });
};
