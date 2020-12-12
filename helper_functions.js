// Helper functions:

// Generate a faux-random string (for URL shortening):
const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

// Generate a faux-random user ID:
const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

// Lookup user by email address:
const getUserEmail = function(email, users) {
  for (let address in users) {
    if (users[address].email === email) {
      return Object.values(users);
    }
  } return false;
};

// Filter URLs in database by user ID:
const urlsForUser = function(id, urlDatabase) {
  let output = {};
  for (let uid of Object.keys(urlDatabase)) {
    if (urlDatabase[uid].userID === id) {
      output[uid] = urlDatabase[uid];
    }
  }
  return output;
};

module.exports = { generateRandomString, generateUid, getUserEmail, urlsForUser };
