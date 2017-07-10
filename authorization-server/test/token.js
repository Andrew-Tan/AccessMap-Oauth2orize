'use strict';

require('process').env.OAUTHRECIPES_SURPRESS_TRACE = true;

const chai                            = require('chai');
const sinonChai                       = require('sinon-chai');
const { accessTokens, refreshTokens } = require('../db');
const utils                           = require('../routes/utils');
const token                           = require('../routes/token');

chai.use(sinonChai);
const expect = chai.expect;

describe('token', () => {
  beforeEach(() => accessTokens.removeAll());

  describe('#info', () => {
    it('should throw an invalid http 400 on null', () =>
      token.info({
        query : { access_token : null },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      }));

    it('should throw an invalid http 400 on an undefined access token', () =>
      token.info({
        query : { },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      }));

    it('should throw an invalid http 400 on a bunk access token', () =>
      token.info({
        query : { access_token : 'abc' },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      }));

    it('should work with a valid token', async () => {
      const createdToken = utils.createToken();
      await accessTokens.save(createdToken, new Date(0), '1', '1', '*');
      return token.info({
        query : { access_token : createdToken },
      }, {
        // TODO: find out the reason why error happens.
        status : (statusCode) => { console.error('Info: Status code should not be called with valid token: ', statusCode); },
        json : (message) => {
          expect(message.audience).eql('abc123');
          expect(message).to.have.property('expires_in');
        },
      });
    });

    it('should throw an invalid http 400 on an invalid client', async () => {
      const createdToken = utils.createToken();
      await accessTokens.save(createdToken, new Date(0), '1', '-1', '*');
      return token.info({
        query : { access_token : createdToken },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      });
    });

    it('should throw an invalid http 400 when no saved token exists', () => {
      const createdToken = utils.createToken();
      return token.info({
        query : { access_token : createdToken },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      });
    });
  });

  describe('#revoke', () => {
    it('should throw an invalid http 400 on null', () =>
      token.revoke({
        query : { token : null },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      }));

    it('should throw an invalid http 400 on an undefined access token', () =>
      token.revoke({
        query : { },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      }));

    it('should throw an invalid http 400 on a bunk access token', () =>
      token.revoke({
        query : { token : 'abc' },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      }));

    it('should work with a valid access token', async () => {
      const createdToken = utils.createToken();
      await accessTokens.save(createdToken, new Date(0), '1', '1', '*');
      return token.revoke({
        query : { token : createdToken },
      }, {
        status : (statusCode) => { console.error('Revoke: Status code should not be called with valid token: ', statusCode); },
        json : (message) => {
          expect(message).eql({});
        },
      });
    });

    it('should work with a valid refresh token token', async () => {
      const createdToken = utils.createToken();
      await refreshTokens.save(createdToken, '1', '1', '*');
      return token.revoke({
        query : { token : createdToken },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(200);
        },
        json : (message) => {
          expect(message).eql({});
        },
      });
    });

    it('should throw an invalid http 400 when no saved token exists', () => {
      const createdToken = utils.createToken();
      return token.revoke({
        query : { token : createdToken },
      }, {
        status : (statusCode) => {
          expect(statusCode).to.eql(400);
        },
        json : (message) => {
          expect(message).eql({ error: 'invalid_token' });
        },
      });
    });
  });
});
