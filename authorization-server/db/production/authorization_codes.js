'use strict';

const jwt = require('jsonwebtoken');

// The authorization codes.
// You will use these to get the access codes to get to the data in your endpoints as outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Authorization codes sequelize data structure which stores all of the authorization codes
 */
// let codes = Object.create(null);
const models = require('./models');

/**
 * Returns an authorization code if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the authorization token to find.
 * @returns {Promise} resolved with the authorization code if found, otherwise undefined
 */
exports.find = (token) => {
  try {
    const id = jwt.decode(token).jti;
    return models.authorization_codes.findOne({
      where: {
        code: id
      }
    });
    // .then(code => {
    //   if (code === null) {
    //     return Promise.resolve(undefined);
    //   }
    //   return Promise.resolve({
    //     clientID: code.clientID,
    //     redirectURI: code.redirectURI,
    //     userID: code.userID,
    //     scope: code.scope
    //   });
    // });
    // return Promise.resolve(codes[id]);
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Saves a authorization code, client id, redirect uri, user id, and scope. Note: The actual full
 * authorization token is never saved.  Instead just the ID of the token is saved.  In case of a
 * database breach this prevents anyone from stealing the live tokens.
 * @param   {String}  code        - The authorization code (required)
 * @param   {String}  clientID    - The client ID (required)
 * @param   {String}  redirectURI - The redirect URI of where to send access tokens once exchanged
 * @param   {String}  userID      - The user ID (required)
 * @param   {String}  scope       - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = async (code, clientID, redirectURI, userID, scope) => {
  const id = jwt.decode(code).jti;
  // codes[id] = { clientID, redirectURI, userID, scope };
  // return Promise.resolve(codes[id]);
  const newEntry = {
    code: id,
    clientID: clientID,
    redirectURI: redirectURI,
    userID: userID,
    scope: scope
  };

  // TODO: fix logic
  await models.authorization_codes.create(newEntry);
  return Promise.resolve(newEntry);
  // .then(() => {
  //   return Promise.resolve(newEntry);
  // })
  // .catch(error => {
  //   return Promise.resolve(undefined);
  // });
};

/**
 * Deletes an authorization code
 * @param   {String}  token - The authorization code to delete
 * @returns {Promise} resolved with the deleted value
 */
exports.delete = async (token) => {
  try {
    const id = jwt.decode(token).jti;
    var deletedEntry;
    await models.sequelize.transaction(t => {
      return models.authorization_codes.findOne({
        where: {
          code: id
        }
      }, {transaction: t}).then(code => {
        if (code ===  null) {
          throw new Error();
        }
        deletedEntry = code;
        return models.authorization_codes.destroy({
          where: {
            code: id
          },
          truncate: true
        }, {transaction: t});
      });
    });
    return Promise.resolve(deletedEntry);
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Removes all authorization codes.
 * @returns {Promise} resolved with all removed authorization codes returned
 */
exports.removeAll = () => {
  // const deletedTokens = codes;
  // codes               = Object.create(null);
  // return Promise.resolve(deletedTokens);
  // TODO: might not return the correct value in promise
  return models.authorization_codes.destroy({
    where: {
      code: '*'
    },
    returning: true,
    truncate: true
  });
};
