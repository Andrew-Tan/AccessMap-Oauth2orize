'use strict';

const fs             = require('fs');
// Check for config file
if (!fs.existsSync('config/index.js')) {
  console.error('Cannot find configuration file! Please check config folder.');
  process.exit(1);
}
const config         = require('./config');
const db             = require('./db');
const oauth2         = require('./routes/oauth2');
const client         = require('./routes/client');
const site           = require('./routes/site');
const token          = require('./routes/token');
const user           = require('./routes/user');
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const express        = require('express');
const expressSession = require('express-session');
const https          = require('https');
const passport       = require('passport');
const path           = require('path');
const flash          = require('connect-flash');

// console.log('Using MemoryStore for the data store');
// console.log('Using MemoryStore for the Session');
// const MemoryStore = expressSession.MemoryStore;

// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(expressSession.Store);
const models = require('./db').models;

// Express configuration
const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(flash());

// Session Configuration
app.use(expressSession({
  saveUninitialized: true,
  resave: true,
  secret: config.session.secret,
  store: new SequelizeStore({
    db: models.sequelize,
  }),
  key: 'authorization.sid',
  cookie: config.session.cookie,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./routes/auth');

app.get('/',              site.index);
app.get('/oauth/illust',  site.illust);
app.get('/login',         site.loginForm);
app.post('/login',        site.login);
app.get('/logout',        site.logout);

app.get('/account',         site.account);
app.get('/account/modify',  user.modifyForm);
app.post('/account/modify', user.modify);

app.get('/dialog/authorize',           oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token',               oauth2.token);

app.get('/api/userinfo',   user.info);
app.get('/api/clientinfo', client.info);

app.get('/register', user.registerForm);
app.post('/register', user.registerUser);

app.get('/forgot', user.forgotForm);
app.post('/forgot', user.forgot);
app.get('/reset/:token', user.resetForm);
app.post('/reset/:token', user.reset);

// Mimicking google's token info endpoint from
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
app.get('/api/tokeninfo', token.info);

// Mimicking google's token revoke endpoint from
// https://developers.google.com/identity/protocols/OAuth2WebServer
app.get('/api/revoke', token.revoke);

// static resources for stylesheets, images, javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Catch all for error messages.  Instead of a stack
// trace, this will log the json of the error message
// to the browser and pass along the status with it
app.use((err, req, res, next) => {
  if (err) {
    if (err.status == null) {
      console.error('Internal unexpected error from:', err.stack);
      res.status(500);
      res.json(err);
    } else {
      res.status(err.status);
      res.json(err);
    }
  } else {
    next();
  }
});

// From time to time we need to clean up any expired tokens
// in the database
setInterval(() => {
  // remove expired access token
  db.accessTokens.removeExpired()
  .catch(err => console.error('Error trying to remove expired access tokens:', err.stack));
}, config.db.timeToCheckExpiredTokens * 1000);

if (config.useHTTPSScheme) {
  console.log('Scheme: HTTPS');
  // TODO: Change these for your own certificates. refer to cert folder for more detail
  const options = {
    key  : fs.readFileSync(path.join(__dirname, 'certs/privatekey.pem')),
    cert : fs.readFileSync(path.join(__dirname, 'certs/certificate.pem')),
  };

  // Create our HTTPS server listening on port 3000.
  https.createServer(options, app).listen(3000);
} else {
  console.log('Scheme: HTTP');
  app.listen(3000);
}
console.log('OAuth 2.0 Authorization Server started on port 3000');

