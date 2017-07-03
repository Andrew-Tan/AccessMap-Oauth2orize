'use strict';
const models = require('./models');
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/index')

/**
 * This is the configuration of the users that are allowed to connected to your authorization
 * server. These represent users of different client applications that can connect to the
 * authorization server. At a minimum you need the required properties of
 *
 * id       : A unique numeric id of your user
 * username : The user name of the user
 * password : The password of your user
 * name     : The name of your user
 */

const findQuery = async (where) => {
  try {
    const result = await models.users.findOne({
      where: where
    });

    if (result === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve({
      id       : result.id,
      username : result.username,
      salt     : result.salt,
      password : result.password,
      name     : result.name,
      email    : result.email
    })
  } catch (error) {
    return Promise.resolve(undefined);
  }
}

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.find = (id) => {
  return findQuery({ id: id });
};

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findByUsername = username => {
  return findQuery({ username: username });
};

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   email - The unique email to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findByEmail = email => {
  return findQuery({ email: email });
};

/**
 * Create a new user with the info given
 * @param   {Object}   usrinfo - the info of the new user
 * @returns {Promise}
 */
exports.createUser = (usrinfo) => {
  // TODO: define better return value
  const salt = bcrypt.genSaltSync(10);
  return models.users.create({
    username: usrinfo.username,
    salt: salt,
    password: bcrypt.hashSync(usrinfo.password, salt),
    name: usrinfo.name,
    email: usrinfo.email,
  });
};

/**
 * Remove all users in the database, use with caution
 * @returns {Promise}
 */
exports.removeAll = () => {
  return models.users.destroy({
    where: {},
  });
};

/**
 * Update the password of a user
 * @param   {Number}   userid - the if of a existing user
 * @param   {String}   newpassword - the new password
 * @returns {Promise}  resolve true if modified, false otherwise
 */
exports.updatePassword = async (userid, newpassword) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    await models.users.update({
      salt: salt,
      password: bcrypt.hashSync(newpassword, salt)
    }, {
      where: { id: userid },
    });
    return Promise.resolve(true);
  } catch (error) {
    return Promise.resolve(false);
  }
};

/**
 * Update the profile of a user
 * @param   {Number}   userid - the if of a existing user
 * @param   {Object}   newProfile - the new profile
 * @returns {Promise}  resolve true if modified, false otherwise
 */
exports.updateProfile = async (userid, newProfile) => {
  try {
    const result = await models.users.update(newProfile, {
      where: { id: userid },
    });

    if (result[0] > 0) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  } catch (error) {
    return Promise.resolve(false);
  }
};

// test users
models.sequelize.sync().then(async () => {
  if (config.deployMode === 'test') {
    await module.exports.createUser({
      username: 'bob', password: 'secret', name: 'Bob Smith', email: 'a@ex.com'
    }, () => {}).catch(() => {
      // console.error('Unable to create user: bob')
    });
    await module.exports.createUser({
      username: 'joe', password: 'password', name: 'Joe Davis', email: 'b@ex.com'
    }, () => {}).catch(() => {
      // console.error('Unable to create user: joe')
    });
  }
});
