OAuth2orizeRecipes
==================

AccessMap OAuth2 authorization server based on [OAuth2orizeRecipes](https://github.com/jaredhanson/oauth2orize).

# Features of the Authorization Server
* All 4 grant types exposed out of the box
* Access/Refresh Tokens
* All Tokens are [JWT based tokens](https://jwt.io/)
* Configurable expiration times on tokens
* Single Sign On (SSO) Example
* Example of trusted clients
* REST tokeninfo endPoint for verifying a token is valid.
* REST revoke endPoint for revoking either an access token or a refresh token.
* Authorization tokens are only useable once and are short expiring JWT tokens
* Full tokens are NOT stored in the DB since they are JWT signed tokens.  Only ID's of tokens are stored.
* SSL/HTTPS usage
* Unit and Integration tests of the majority of code and OAuth2 flows
* More complex UI Examples for the Sign In/Login and the Decision Screens

# Installation

Please refer to the inner documentation within authorization-server
```
git clone https://github.com/FrankHassanabad/Oauth2orizeRecipes.git
cd Oauth2orizeRecipes/authorization-server
npm install
npm start
```


Go here for how to use the REST API  
https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/OAuth2orize-Authorization-Server-Tests

Go here for high level views of security scenarios  
https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/Security-Scenarios

See the curl folder for headless operations and ad-hoc testing  
[authorization-server/curl/README.md](authorization-server/curl/README.md)
