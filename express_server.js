const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// basic server I/O...
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// res.renders..
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// Create a new shortened URL..
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// Retrive long URL by short URL..
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});

// Post a new URL..
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('OK');
});

// eslint-disable-next-line func-style
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}



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