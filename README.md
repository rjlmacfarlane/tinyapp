# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

This is a learning project created as part of the education curriculum at Lighthouse Labs.

## Features

- Shorten URLs.
- Share this TinyURL and see how many times it was used, when, and by who.
- You made a typo in your URL when creating it? You can edit or delete it!

## Final Product

!["Your own secure account"](https://github.com/rjlmacfarlane/tinyapp/blob/master/docs/user_register.png)
!["Create your Custom URLS"](https://github.com/rjlmacfarlane/tinyapp/blob/master/docs/new_url.png)
!["Manage your URLS"](https://github.com/rjlmacfarlane/tinyapp/blob/master/docs/manage_urls.png)

## Getting Started

- Install all dependencies (see below) using the `npm install` command.
- Run the development web server using the `node express_server.js` command.

## How to Use

- Run your node server (node express_server.js)
- For development, run npm start
- Browse to `http://localhost:8080/`
- Experiment with all its features!

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- nodemon (for development)
- mocha (for developmenet/tests)
- chai (for development/tests)