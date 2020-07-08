require('dotenv').config();
const express = require('express');
const session = require('express-session');
const massive = require('massive');
const ctrl = require('./controller');

const app = express();

app.use(express.json());

let { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24}
  })
);

massive({
    connectionString: CONNECTION_STRING,
    ssl: {

      rejectUnauthorized: false
    },
  }).then(db => {
  app.set('db', db);
  console.log('db connected');
});

app.post("/auth/signup", ctrl.signup);
app.post('/auth/login', ctrl.login);
app.get('/auth/logout', ctrl.logout);
app.get("/auth/user", ctrl.user);

app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`);
});
