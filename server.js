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
  db = pgp(config['database']);

//use express static to serve up the frontend
app.use(express.static(__dirname + '/public'));

//expose sql endpoint, grab query as URL parameter and send it to the database
app.get('/sql', function(req, res){
  var sql = req.query.q;

  // Check for custom fields or ST_Transform in SELECT [...] FROM
  sqlSplit=sql.split('FROM');
  sql=sqlSplit[0]

  // Apply ST_Transform and replace custom geom field names as necessary
  if(config['dataCoordinateSystem'] != 4326){
    if(config['geomFieldNames'].length > 0){
      config['geomFieldNames'].forEach(function(v){
          sql=sql.replace(v, 'ST_Transform('+v+', 4326) as $geom'); //Custom geom name and coordinate system
      });
    }
    else{
      sql=sql.replace('geom', 'ST_Transform(geom, 4326)'); //Custom coordinate system only
    }
  }
  else{
    // Custom geom field name only
    if(config['geomFieldNames'].length > 0){
      config['geomFieldNames'].forEach(function(v){
          sql=sql.replace(v, v+' as $geom');
      });
    }
  }

  // Merge sql into one string
  sqlSplit.shift(); //Remove first part of query
  sql=sql+' FROM '+sqlSplit.join(); //Append remaining from original sql
  sql=sql.replace('$geom', 'geom'); //Replace $geom - needed due to potential SELECT (ST_Transform(geom, 4326) as geom) issues

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
