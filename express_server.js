const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;
const users = new Object;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Helper functions:

// Generate a faux-random string (for URL shortening):
const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

// Generate a faux-random UID:
const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

// Lookup user by email:
const getUserEmail = function(email, users) {
  for (let i in users) {
    if (users[i].email === email) {
      return Object.values(users);
    }
  } return false;
};

// Filter URLs in database by user ID:
const urlsForUser = function(id) {
  let output = {};
  for (let i of Object.keys(urlDatabase)) {
    if (urlDatabase[i].userID === id) {
      output[i] = urlDatabase[i];
    }
  }
  return output;
};

// Add a URL to the urlDatabase object
const addURL = function(longURL, userID) {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  return shortURL;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// Redirect '/' to login page:
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Display URLS (Filtered by User ID):
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const userURLs = urlsForUser(userID);
  const templateVars = {
    urls: userURLs,
    user: users[userID]
  };
  res.render('urls_index', templateVars);
});

// Create a new shortened URL:
app.get('/urls/new', (req, res) => {
  if (req.cookies['user_id']) {
    const userID = req.cookies['user_id'];
    const templateVars = {
      user: users[userID]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Retrive long URL by short URL:
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies['user_id'];
  const templateVars = {
    user: userID,
    shortURL: shortURL,
    urls: urlDatabase
  };
  res.render('urls_show', templateVars);
});

// Redirect short URLs to target (long) URL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Register a new account (GET => render):
app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    user: userID
  };
  res.render('register', templateVars);
});

// Register a new account (POST => redirect):
// An error page was created for this, but not for other error conditions in other routes.
// Dev will remedy this if time permits.
app.post('/register', (req, res) => {
  res.clearCookie('user_id');
  const { email, password } = req.body;
  let templateVars;
  if (!email || !password) {
    templateVars = {
      status: 401,
      message: 'Email or Password must not be blank.',
      user: 'undefined'
    };
    res.status(401);
    return res.render('reg_error', templateVars);
  }
  const user = getUserEmail(email, users);
  if (user) {
    templateVars = {
      status: 409,
      message: 'Email already registered.',
      user: 'undefined'
    };
    res.status(409);
    res.render('reg_error', templateVars);
  } else {
    const uid = generateUid();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      id: uid,
      email: req.body.email,
      password: hashedPassword
    };
    users[uid] = newUser;
    res.cookie('user_id', uid);
    res.redirect('/urls');
  }
});

// Login (GET => render)
app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    user: userID
  };
  res.render('login', templateVars);
});

// Login (POST => redirect)
app.post('/login', (req, res) => {
  res.clearCookie('user_id');
  const { email, password } = req.body;
  const user = getUserEmail(email, users);
  if (!user) {
    res.status(403).send('Email not found');
  } else if (!bcrypt.compareSync(password, user[0].password)) {
    res.status(403).send('Password incorrect');
  } else {
    res.cookie('user_id', user[0].id);
    res.redirect('/urls');
  }
});

// Logout:
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Post a new URL:
app.post('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const longURL = req.body.longURL;
  const shortURL = addURL(longURL, userID);
  res.redirect(`/urls/${shortURL}`);
});

// Edit an existing URL:
app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const templateVars = {
    user: userID,
    shortURL: shortURL,
    longURL: longURL
  };
  if (urlDatabase[shortURL] && userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls', templateVars);
  } else {
    res.status(403).send('You must be logged in to edit URLs');
  }
});

// Delete a tiny URL entry:
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies['user_id'];
  if (urlDatabase[shortURL] && userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send('You must be logged in to delete URLs');
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}...`);
});