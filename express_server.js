/*
_________  ___  ________       ___    ___      ________  ________  ________
|\___   ___\\  \|\   ___  \    |\  \  /  /|    |\   __  \|\   __  \|\   __  \
\|___ \  \_\ \  \ \  \\ \  \   \ \  \/  / /    \ \  \|\  \ \  \|\  \ \  \|\  \
     \ \  \ \ \  \ \  \\ \  \   \ \    / /      \ \   __  \ \   ____\ \   ____\
      \ \  \ \ \  \ \  \\ \  \   \/  /  /        \ \  \ \  \ \  \___|\ \  \___|
       \ \__\ \ \__\ \__\\ \__\__/  / /           \ \__\ \__\ \__\    \ \__\
        \|__|  \|__|\|__| \|__|\___/ /             \|__|\|__|\|__|     \|__|
                              \|___|/    v. 1.0.0

               A URL shortener webapp with userbase functionality.
    
               Submitted to Lighthouse Labs on 2020-12-10.

               Credit is due to the entire November 23 cohort, with
               special appreciation to the mentors, instructors, and
               Mahsa Arabameri for their contributions and encouragement.
*/

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { generateRandomString, generateUid, getUserEmail, urlsForUser } = require('./helper_functions.js');

const app = express();
const PORT = 8080;
const users = new Object; // Database Object for all users (email, password, userid)

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

// URL Database and its companion function:
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
  delete req.session.user_id;
  res.redirect('/login');
});

// Display URLS (Filtered by User ID):
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID, urlDatabase);
  
  const templateVars = {
    urls: userURLs,
    user: users[userID]
  };
  
  res.render('urls_index', templateVars);
});

// Create a new shortened URL:
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    const userID = req.session.user_id;
    
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
  const userID = req.session.user_id;
  
  const templateVars = {
    user: users[userID],
    shortURL: shortURL,
    urls: urlDatabase
  };
  console.log(templateVars);
  res.render('urls_show', templateVars);
});

// Redirect short URLs to target (long) URL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Register a new account (GET => render):
app.get('/register', (req, res) => {

  const userID = req.session.user_id;
  
  const templateVars = {
    user: userID
  };
  
  res.render('register', templateVars);
});

// Register a new account (POST => redirect):
app.post('/register', (req, res) => {
  if (!req.session.user_id) {

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
      // eslint-disable-next-line camelcase
      req.session.user_id = uid;
      res.redirect('/urls');
    }
  } else {
    res.redirect('/urls');
  }
});

// Login (GET => render)
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
 
  const templateVars = {
    user: userID
  };
 
  res.render('login', templateVars);
});

// Login (POST => redirect)
app.post('/login', (req, res) => {
  
  const { email, password } = req.body;
  const user = getUserEmail(email, users);
  
  if (!user) {
    
    res.status(403).send('Email not found');
  
  } else if (!bcrypt.compareSync(password, user[0].password)) {
    
    res.status(403).send('Password incorrect');
  
  } else {
    
    // eslint-disable-next-line camelcase
    req.session.user_id = user[0].id;
    res.redirect('/urls');
  }
});

// Logout:
app.post('/logout', (req, res) => {
  delete req.session.user_id;
  res.redirect('/login');
});

// Post a new URL:
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = addURL(longURL, userID);
  res.redirect(`/urls/${shortURL}`);
});

// Edit an existing URL:
app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  
  if (urlDatabase[shortURL] && userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
  
  } else {
  
    res.status(403).send('You must be logged in to edit URLs');
  }
});

// Delete a tiny URL entry:
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  
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

module.exports = { urlDatabase };