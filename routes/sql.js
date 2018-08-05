const express = require('express');
const jsonexport = require('jsonexport');
const dbgeo = require('dbgeo');

const router = express.Router();

function jsonExport(data) {
  // remove geom
  data.forEach((row) => {
    delete row.geom;
  });

  return new Promise((resolve, reject) => {
    jsonexport(data, (err, csv) => {
      if (err) {
        reject(err);
      } else {
        resolve(csv);
      }
    });
  });
}

function dbGeoParse(data) {
  return new Promise((resolve, reject) => {
    dbgeo.parse(
      data,
      {
        outputFormat: 'geojson',
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
}

// expose sql endpoint, grab query as URL parameter and send it to the database
router.get('/', (req, res) => {
  const { app } = req;
  const sql = req.query.q;
  const format = req.query.format || 'topojson';
  console.log(`Executing SQL: ${sql}`, format); // eslint-disable-line

  // query using pg-promise
  app.db
    .any(sql)
    .then((data) => {
      // use dbgeo to convert WKB from PostGIS into topojson
      switch (format) {
        case 'csv':
          return jsonExport(data).then((csv) => {
            res.setHeader('Content-disposition', 'attachment; filename=query.csv');
            res.setHeader('Content-Type', 'text/csv');
            return csv;
          });
        case 'geojson':
          return dbGeoParse(data).then((geojson) => {
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
    .catch((err) => {
      // send the error message if the query didn't work
      const msg = err.message || err;
      console.log('ERROR:', msg); // eslint-disable-line
      res.send({
        error: msg,
      });
    });
});

module.exports = router;
