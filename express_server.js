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
                           ~ First evaluated project ~
                    Submitted to Lighthouse Labs on 2020-12-10
               Credit is due to the entire November 23 cohort, with
               special appreciation to the mentors, instructors, and
               Mahsa Arabameri for their contributions and encouragement.
               Developed by Ryan MacFarlane (Halifax, Nova Scotia)
               * Contact the developer at: rjl.macfarlane@gmail.com
               * Github: https://github.com/rjlmacfarlane
               
                         Built with Node and Express
               
*/

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { generateRandomString, generateUid, getUserEmail, urlsForUser } = require('./helper_functions.js');

const app = express();
const PORT = 8080;
const users = {}; // Database Object for all users (email, password, userid)

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

// URL Database and its companion function:
const addURL = function(longURL, userID) {
  console.log('hit');
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  console.log(urlDatabase);
  return shortURL;
};
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.lighthouselabs.ca/", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.ubuntu.com/", userID: "aJ48lW" }
};

/* Routes BEGIN */

/*******************************************
 *  Site Navigation & URL Handling Routes: *
********************************************/

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
  
  if (urlDatabase[shortURL] && userID === urlDatabase[shortURL].userID) {
  
    const templateVars = {
      user: users[userID],
      shortURL: shortURL,
      urls: urlDatabase
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(403).send('You must be logged in to view this URL.');
  }
});

// Redirect short URLs to target (long) URL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
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

// Delete a URL from user's database:
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


/*******************************************
 *  Account creation/action routes:        *
********************************************/

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
    const templateVars = {};
    
    if (!email || !password) {
      
      templateVars.status = 401;
      templateVars.message = 'Email or Password must not be blank.';
      templateVars.user = 'undefined';
    
      res.status(401);
      return res.render('reg_error', templateVars);
    }
    
    const user = getUserEmail(email, users);
    
    if (user) {
    
      templateVars.status = 409;
      templateVars.message = 'Email already registered.';
      templateVars.user = 'undefined';
    
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
    
    res.status(403).send('Email not found. Are you registered?');
  
  } else if (!bcrypt.compareSync(password, user[0].password)) {
    
    res.status(403).send('Password incorrect.');
  
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

/* Routes END */

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}...`);
});