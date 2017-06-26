'use strict';

const passport = require('passport');
const db = require('../db/index');
const utils = require('./utils');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const config = require('../config/index')

// transporter to send Email
// TODO: move auth config to config
const transporter = nodemailer.createTransport(mg(config.email));

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
  })
  .then(() => {
    response.redirect('/login');
  })
  .catch(error => {
    response.render('info', { message: ['Cannot create user'] })
  });
};


exports.registerForm = (request, response) => {
  response.render('register');
};

exports.forgot = (request, response) => {
  db.users.findByEmail(request.body.email)
  .then(user => {
    if (!user) {
      request.flash('info', 'User associated with the Email not found');
      response.redirect('/forgot');
      return;
    }
    // Create temporary token for user to reset password, valid for half an hour
    const token = utils.createToken({ sub : user.id, exp : 1800 });
    const mailOptions = {
      from: 'myemail@example.com',
      to: user.email,
      subject: 'Email Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      request.protocol + '://' + request.headers.host + '/reset/' + token + '\n\n' +
      'The token is only valid for half an hour from its issuance, please use it at your earliest convenience\n' +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    transporter.sendMail(mailOptions, (err, info) => {
      console.log(info);
    });
    request.flash('info', 'An Email has been sent to your inbox, please follow the instruction there.');
    response.redirect('/forgot');
  })
  .catch((err) => {
    return response.render('info', { message: ['Internal Error'] });
  });
};

exports.forgotForm = (request, response) => {
  response.render('forgot', { message: request.flash('info') });
};

exports.resetForm = (request, response) => {
  const token = request.params.token;
  try {
    utils.verifyToken(token);
    response.render('reset', { resetToken: token });
  } catch (err) {
    return response.render('info', { message: ['Incorrect Token'] });
  }
};

exports.reset = (request, response) => {
  const token = request.params.token;
  try {
    const decoded = utils.verifyToken(token);
    const userID = decoded.sub;
    const password = request.body.password;
    const confirmed_password = request.body.confirm_password;
    if (password !== confirmed_password) {
      return response.render('info', { message: ['Inconsistent Password'] });
    }
    db.users.updatePassword(userID, password).then(result => {
      response.end('Password updated for userID: ' + userID);
    });
  } catch (err) {
    return response.render('info', { message: ['Incorrect Token'] });
  }
};
