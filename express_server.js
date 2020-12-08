const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = new Object;

// basic server I/O...
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}...`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// res.renders..
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
  res.render('urls_new');
});

// Retrive long URL by short URL..
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"],
  };
  res.render('urls_show', templateVars);
});

// Redirect short URLs to target (long) URL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Register
app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const uid = generateUid();
  const newUser = {
    id: uid,
    email: req.body.email,
    password: req.body.password
  };
  users[uid] = newUser;
  res.cookie('user_id', uid);
  res.redirect('/urls');
});

// Login
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
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
app.post('/urls/:shortURL/edit', (req, res) => {
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


const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

const generateUid = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};



// // example code..
// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

// app.get('/set', (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });
 
// app.get('/fetch', (req, res) => {
//   res.send(`a = ${a}`);
// });