//postgis-preview
//A super simple node app + leaflet frontend for quickly viewing PostGIS query results

//dependencies
var express = require('express'),
  Mustache = require('mustache'),
  pgp = require('pg-promise')(),
  dbgeo = require("./dbgeo-modified.js");

//create express app and prepare db connection
var app = express(),
  port = process.env.PORT || 3000,
  config = require('./config.js'),
  db = pgp(config);

//use express static to serve up the frontend
app.use(express.static(__dirname + '/public'));

//expose sql endpoint, grab query as URL parameter and send it to the database
app.get('/sql', function(req, res){
  var sql = req.query.q;
  console.log('Executing SQL: ' + sql);

  //query using pg-promise
  db.query(sql)
    .then(function(data) { //use dbgeo to convert WKB from PostGIS into topojson
      console.log('then')
      dbgeo.parse({
        data: data,
        outputFormat: 'topojson',
        geometryColumn: 'geom',
        geometryType: 'wkb'
      }, function(err, result) {
        console.log(result);
        if(!err) {
          res.send(result)
        } else {
          console.log(err);
        }
      });
    })
    .catch(function(err) { //send the error message if the query didn't work
      console.log("myerr", err.message || error)
      res.send({
        error: err.message || error
      });
    });
});

//start the server
app.listen(port);
console.log('Listening on port ' + port + '...');
