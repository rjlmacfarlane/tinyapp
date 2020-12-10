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
  for (let i in users) {
    if (users[i].email === email) {
      return Object.values(users);
    }
  } return false;
};

// Filter URLs in database by user ID:
const urlsForUser = function(id, urlDatabase) {
  let output = {};
  for (let i of Object.keys(urlDatabase)) {
    if (urlDatabase[i].userID === id) {
      output[i] = urlDatabase[i];
    }
  }
  return output;
};

// Add a URL to the urlDatabase object:
const addURL = function(longURL, userID) {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  return shortURL;
};

module.exports = { generateRandomString, generateUid, getUserEmail, urlsForUser, addURL };
