const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Helper functions..

// Generate a faux-random string (for URL shortening):
const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

// Generate a faux-random UID:
const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

const users = new Object;

// Lookup user by email:
const getUserEmail = function(email, users) {
  for (let i in users) {
    if (users[i].email === email) {
      return Object.values(users);
    }
  } return false;
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// basic server I/O...
app.get('/', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    user: users[userID]
  };
  res.send('urls_index', templateVars);
});

// Get/Renders..
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };
  res.render('urls_index', templateVars);
});

// Create a new shortened URL..
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase, // Probably don't need this - check!
    user: users[userID]
  };
  res.render('urls_new', templateVars);
});

// Retrive long URL by short URL..
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies['user_id'];
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: userID
  };
  res.render('urls_show', templateVars);
});

// Redirect short URLs to target (long) URL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Register (GET => render)
app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    user: userID
  };
  res.render('register', templateVars);
});

// Register (POST => redirect)   Declare templateVars at top, remove lets
app.post('/register', (req, res) => {
  res.clearCookie('user_id');
  const { email, password } = req.body;
  if (!email || !password) {
    let templateVars = {
      status: 401,
      message: 'Email or Password must not be blank.',
      user: 'undefined'
    };
    res.status(401);
    return res.render('reg_error', templateVars);
  }
  const user = getUserEmail(email, users);
  if (user) {
    let templateVars = {
      status: 409,
      message: 'Email already registered.',
      user: 'undefined'
    };
    res.status(409);
    res.render('reg_error', templateVars);
  } else {
    const uid = generateUid();
    const newUser = {
      id: uid,
      email: req.body.email,
      password: req.body.password
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
  } else if (user[0].password !== password) {
    res.status(403).send('Password incorrect');
  } else {
    res.cookie('user_id', user[0].id);
    res.redirect('/urls');
  }
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Post a new URL..
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Edit an existing URL..
app.post('/urls/:shortURL/', (req, res) => {   // app.post should be without /edit
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// Delete a tiny URL entry..
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}...`);
});