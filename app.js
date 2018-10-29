const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');

const app = express();

var routes = require('./routes/index');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'index', layoutsDir: __dirname + '/views/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes which should handle requests
app.use('/', routes);

module.exports = app;

