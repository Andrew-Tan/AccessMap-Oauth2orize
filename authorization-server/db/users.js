'use strict';
const models = require('./models');
const bcrypt = require('bcrypt');

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

// const users = [
//   { id: '1', username: 'bob', password: 'secret', name: 'Bob Smith', email: 'a@ex.com' },
//   { id: '2', username: 'joe', password: 'password', name: 'Joe Davis' , email: 'b@ex.com'},
// ];

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
// exports.find = id => Promise.resolve(users.find(user => user.id === id));
exports.find = (id) => {
  return models.users.findOne({
    where: {
      id: id
    }
  });
    // .then(user => {
    //   if (user === null) {
    //     return Promise.resolve(undefined);
    //   }
    //   return Promise.resolve({
    //     id: user.id,
    //     username: user.username,
    //     salt: user.salt,
    //     password: user.password,
    //     name: user.name,
    //     email: user.email
    //   });
    // })
    // .catch(error => {
    //   return Promise.resolve(undefined);
    // });
};

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
// exports.findByUsername = username =>
//   Promise.resolve(users.find(user => user.username === username));
exports.findByUsername = username => {
  return models.users.findOne({
    where: {
      username: username
    }
  });
};

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   email - The unique email to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findByEmail = email => {
  return models.users.findOne({
    where: {
      email: email
    }
  });
};

exports.createUser = (usrinfo, done) => {
  const salt = bcrypt.genSaltSync(10);
  models.users.create({
    username: usrinfo.username,
    salt: salt,
    password: bcrypt.hashSync(usrinfo.password, salt),
    name: usrinfo.name,
    email: usrinfo.email,
  })
    .then(() => {
      return done(null, null);
    })
    .catch(error => {
      return done(error, null);
    });
};

exports.updatePassword = (userid, newpassword) => {
  const salt = bcrypt.genSaltSync(10);
  return models.users.update({
    salt: salt,
    password: bcrypt.hashSync(newpassword, salt)
  }, {
    where: { id: userid },
    returning: true
  });
}

// test users
models.sequelize.sync().then(async () => {
  await module.exports.createUser({
    username: 'bob', password: 'secret', name: 'Bob Smith', email: 'a@ex.com'
  }, () => {});
  await module.exports.createUser({
    username: 'joe', password: 'password', name: 'Joe Davis', email: 'b@ex.com'
  }, () => {});
});
