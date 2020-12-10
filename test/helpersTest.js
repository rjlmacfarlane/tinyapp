const { assert } = require('chai');

const { getUserEmail } = require('../helper_functions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user[0].id, expectedOutput);
  });
  it('should return undefined with an invalid email', function() {
    const user = getUserEmail("user3@example.com", testUsers);
    assert.equal(user[0], undefined);
  });
});
