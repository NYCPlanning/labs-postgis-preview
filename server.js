// postgis-preview
// A super simple node app + leaflet frontend for quickly viewing PostGIS query results

// dependencies
const express = require('express');
const pgp = require('pg-promise')();
const dbgeo = require('dbgeo');
const jsonexport = require('jsonexport');
require('dotenv').config();

// create express app and prepare db connection
const app = express();
const port = process.env.PORT || 4000;
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const db = pgp(connectionString);

// use express static to serve up the frontend
app.use(express.static(`${__dirname}/public`));

function jsonExport(data) {
  // remove geom
  data.forEach((row) => {
    delete row.geom;
  });

  return new Promise(((resolve, reject) => {
    jsonexport(data, (err, csv) => {
      if (err) {
        reject(err);
      } else {
        resolve(csv);
      }
    });
  }));
}

function dbGeoParse(data, format) {
  return new Promise(((resolve, reject) => {
    dbgeo.parse(data, {
      outputFormat: format,
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }));
}

// expose sql endpoint, grab query as URL parameter and send it to the database
app.get('/sql', (req, res) => {
  const sql = req.query.q;
  const format = req.query.format || 'topojson';
  console.log(`Executing SQL: ${sql}`, format); // eslint-disable-line

  // query using pg-promise
  db.any(sql)
    .then((data) => { // use dbgeo to convert WKB from PostGIS into topojson
      switch (format) {
        case 'csv':
          return jsonExport(data).then((csv) => {
            res.setHeader('Content-disposition', 'attachment; filename=query.csv');
            res.setHeader('Content-Type', 'text/csv');
            return csv;
          });
        case 'geojson':
          return dbGeoParse(data, format).then((geojson) => {
            res.setHeader('Content-disposition', 'attachment; filename=query.geojson');
            res.setHeader('Content-Type', 'application/json');
            return geojson;
          });
        default:
          return dbGeoParse(data, format);
      }
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => { // send the error message if the query didn't work
      const msg = err.message || err;
      console.log('ERROR:', msg); // eslint-disable-line
      res.send({
        error: msg,
      });
    });
});

// start the server
app.listen(port);
console.log(`Postgis Preview is listening on port ${port}...`); // eslint-disable-line
