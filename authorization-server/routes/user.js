'use strict';

const passport = require('passport');
const db = require('../db/index');
const utils = require('./utils');
const sendmail = require('sendmail')();
// const nodemailer = require('nodemailer');

// transporter to send Email
// const transporter = nodemailer.createTransport({
//   sendmail: true,
//   newline: 'unix',
//   path: '/usr/sbin/sendmail'
// });

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


exports.registerForm = (request, response) => {
  response.render('register');
};

exports.forgot = (request, response) => {
  db.users.findByEmail(request.body.email)
  .then(user => {
    if (!user) {
      return response.json({ 'err' : 'user associated with the email not found' });
    }
    // Create temporary token for user to reset password, valid for half an hour
    const token = utils.createToken({ sub : user.id, exp : 1800 });
    const mailOptions = {
      from: 'passwordreset@demo.com',
      to: user.email,
      subject: 'Email Reset',
      html: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      request.protocol + '://' + request.headers.host + '/reset/' + token + '\n\n' +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    // sendmail(mailOptions, (err, reply) => {
    //   console.log('error:', err && err.stack);
    //   console.dir('reply', reply);
    // });
    response.end(mailOptions.html);
    // transporter.sendMail(mailOptions, (err, info) => {
    //   console.log(info.envelope);
    //   console.log(info.messageId);
    //   if (err) {
    //     return response.end('Message could not be sent');
    //   }
    //   response.end('An email has been sent');
    // });
  })
  .catch((err) => {
    return response.end(err.toString());
  });
};

exports.forgotForm = (request, response) => {
  response.render('forgot');
};

exports.resetForm = (request, response) => {
  const token = request.params.token;
  try {
    utils.verifyToken(token);
    response.render('reset', { resetToken: token });
  } catch (err) {
    response.end('Incorrect Token');
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
      return response.end('Inconsistent Password');
    }
    db.users.updatePassword(userID, password).then(result => {
      response.end('Password updated for userID: ' + userID);
    });
  } catch (err) {
    return response.end('Incorrect Token');
  }
};
