'use strict';

const passport = require('passport');
const db = require('./db');

/**
 * Simple informational end point, if you want to get information
 * about a particular user.  You would call this with an access token
 * in the body of the message according to OAuth 2.0 standards
 * http://tools.ietf.org/html/rfc6750#section-2.1
 *
 * Example would be using the endpoint of
 * https://localhost:3000/api/userinfo
 *
 * With a GET using an Authorization Bearer token similar to
 * GET /api/userinfo
 * Host: https://localhost:3000
 * Authorization: Bearer someAccessTokenHere
 * @param {Object} req The request
 * @param {Object} res The response
 * @returns {undefined}
 */
exports.info = [
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
    // req.authInfo is set using the `info` argument supplied by
    // `BearerStrategy`.  It is typically used to indicate scope of the token,
    // and used in access control checks.  For illustrative purposes, this
    // example simply returns the scope in the response.
    res.json({ user_id: req.user.id, name: req.user.name, email: req.user.email, scope: req.authInfo.scope });
  },
];

exports.registerUser = (request, response) => {
  db.users.createUser({
    username: request.body.username,
    password: request.body.password,
    name: request.body.name,
    email: request.body.email,
  }, (error, result) => {
    if (error) {
      response.status(500)
      response.json({status: 'failed', reason: 'error creating user'})
      return;
    }
    response.redirect('/login');
  });
};


module.exports.registerForm = (request, response) => {
  response.render('register');
};
