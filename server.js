// postgis-preview
// A super simple node app + leaflet frontend for quickly viewing PostGIS query results

// dependencies
const express = require('express');
const NodeCache = require('node-cache');
const opn = require('opn');

require('dotenv').config();

// create express app and prepare db connection
const app = express();
const port = process.env.PORT || 4000;
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

// require pg-promise
const pgp = require('pg-promise')({
  query(e) {
    console.log(e.query); // eslint-disable-line
  },
});

// initialize database connection
app.db = pgp(connectionString);

// use node-cache to store SQL queries
app.tileCache = new NodeCache({ stdTTL: 3600 });

// allows CORS
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// use express static to serve up the frontend
app.use(express.static(`${__dirname}/public`));

// import routes
app.use('/sql', require('./routes/sql'));
app.use('/tiles', require('./routes/tiles'));

// start the server
app.listen(port);
console.log(`Postgis Preview is listening on port ${port}...`); // eslint-disable-line

// opens the url in the default browser
opn(`http://localhost:${port}`);
