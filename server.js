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
  var sqlstr = req.query.q;
  var sqltoUpper = sqlstr.replace("from", "FROM");
  var sql = sqltoUpper.replace("FROM", ", st_transform(geom, 4326) as geom FROM");
  console.log('Executing SQL: ' + sql);

  //query using pg-promise
  db.any(sql)
    .then(function (data) { //use dbgeo to convert WKB from PostGIS into topojson
        return dbGeoParse(data);
    })
    .then(function (data) {
        console.log("DATA:", data);
        res.send(data);
    })
    .catch(function (err) { //send the error message if the query didn't work
        var msg = err.message || err;
        console.log("ERROR:", msg);
        res.send({
            error: msg
        });
    });

});

function dbGeoParse(data) {
    return new Promise(function (resolve, reject) {
        dbgeo.parse({
            data: data,
            outputFormat: 'topojson',
            geometryColumn: 'geom',
            geometryType: 'wkb'
        }, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

//start the server
app.listen(port);
console.log('Listening on port ' + port + '...');
