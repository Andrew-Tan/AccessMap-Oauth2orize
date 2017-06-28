'use strict';

const login    = require('connect-ensure-login');
const passport = require('passport');

exports.index = (req, res) => {
  res.render('index', { user: req.user });
};

/**
 * Render the index.ejs or index-with-code.js depending on if query param has code or not
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.illust = (req, res) => {
  if (!req.query.code) {
    res.render('illust', { user: req.user });
  } else {
    res.render('illust-with-code');
  }
};

/**
 * Render the login.ejs
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.loginForm = (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('login');
  }
};

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.login = [
  passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }),
];

/**
 * Logout of the system and redirect to root
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Render account.ejs but ensure the user is logged in before rendering
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.account = [
  login.ensureLoggedIn(),
  (req, res) => {
    res.render('account', { user: req.user });
  },
];
