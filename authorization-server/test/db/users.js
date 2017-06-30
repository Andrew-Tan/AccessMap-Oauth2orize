'use strict';

const chai      = require('chai');
const { users } = require('../../db');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

// TODO: use await to wait for the result of expect
describe('users', () => {
  it('should not find an invalid user', () =>
    users.find('')
    .then(token => expect(token).to.be.undefined));

  it('should find a user by id 1', () =>
    users.find(1)
    .then((user) => {
      expect(user).to.contain({
        id       : 1,
        username : 'bob',
        name     : 'Bob Smith',
        email    : 'a@ex.com',
      });
    }));

  it('should find a user by username bob', () =>
    users.findByUsername('bob')
    .then((user) => {
      expect(user).to.contain({
        id       : 1,
        username : 'bob',
        name     : 'Bob Smith',
        email    : 'a@ex.com',
      });
    }));

  it('should successfully update profile for a valid user', () => {
    // Change to something else
    users.updateProfile(1, { name: 'Bobby', email: 'bobby@example.com' })
      .then((result) => {
        expect(result).to.be.true;
        users.findByUsername('bob')
          .then((user) => {
            expect(user).to.contain({
              id       : 1,
              username : 'bob',
              name     : 'Bobby',
              email    : 'bobby@example.com',
            });
          });
      });

    // Change back
    users.updateProfile(1, { name: 'Bob Smith', email: 'a@ex.com' })
      .then((result) => {
        expect(result).to.be.true;
        users.findByUsername('bob')
          .then((user) => {
            expect(user).to.contain({
              id       : 1,
              username : 'bob',
              name     : 'Bob Smith',
              email    : 'a@ex.com',
            });
          });
      });
  });
});
