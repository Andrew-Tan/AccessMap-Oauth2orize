Authorization Server
==================

This is the authorization server.

# Configuration
Before spinning up the authorization server, a few configuration MUST BE MADE to make it run correctly.
Make a copy from config/example-index.js and rename it to index.js, then tweak configuration according
to your preference.

### Certificate
The certificate that this authorization server will use is placed in cert/. They are used for signing JWT
and setting up SSL connection. Test certificates are generated for testing purpose, but please regenerate 
a new one before putting the instance into production.
```
openssl genrsa -out privatekey.pem 2048
openssl req -new -key privatekey.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```

### Configuration File
The main configuration file is in config/index.js. Documentations are attached as inline comments.

# Installation
```
npm install
npm start
```

Go here for how to use the REST API
https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/OAuth2orize-Authorization-Server-Tests

Go here for high level views of security scenarios
https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/Security-Scenarios

See the curl folder for headless operations and ad-hoc testing  
[curl/README.md](curl/README.md)
