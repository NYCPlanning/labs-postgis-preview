(function() {
  var async = require("async"),
    wellknown = require("wellknown"),
    topojson = require("topojson"),
    wkx = require("wkx")

  var dbgeo = {};

  dbgeo.defaults = {
    "outputFormat": "geojson",
    "geometryColumn": "geometry",
    "geometryType": "geojson"
  };

  dbgeo.parse = function(params, callback) {
    if (!(params.callback || callback)) {
      throw new Error("You must provide a callback function", null);
    }

    // Backwards compatibility with the original version
    var cb = params.callback || callback;

    if (!params.data) {
      return cb("You must provide a value for both 'data'", null);
    }

    if (!params.outputFormat) {
      params.outputFormat = this.defaults.outputFormat;
    } else {
      if (["geojson", "topojson"].indexOf(params.outputFormat) < 0) {
        return params.callback("Invalid outputFormat value. Please use either 'geojson' or 'topojson'", null);
      }
    }
    if (!params.geometryColumn) {
      params.geometryColumn = this.defaults.geometryColumn;
    }
    // Accepts "wkt", "geojson", or "ll"
    if (!params.geometryType) {
      params.geometryType = this.defaults.geometryType;
    } else {
      if (["wkt", "geojson", "ll", "wkb"].indexOf(params.geometryType) < 0) {
        return params.callback("Invalid geometry type. Please use 'wkt', 'geojson', or 'll'", null);
      }
    }
    if (params.geometryType === "ll") {
      if (!Array.isArray(params.geometryColumn) || params.geometryColumn.length !== 2) {
        return params.callback("When the input data type is lat/lng, please specify the 'geometryColumn' as an array with two parameters, the latitude followed by the longitude", null);
      }
    }

    async.waterfall([
      function(callback) {
        var output = { "type": "FeatureCollection", "features": [] };

        async.each(params.data, function(row, geomCallback) {

          var parsedRow = { "type": "Feature" };
          if (params.geometryType === "wkt") {
            parsedRow.geometry = wellknown(row[params.geometryColumn]);
          } else if (params.geometryType === "wkb") {
            var wkbBuffer = new Buffer(row[params.geometryColumn], 'hex');
            parsedRow.geometry = wkx.Geometry.parse(wkbBuffer).toGeoJSON();
          } else if (params.geometryType === "geojson") {
            parsedRow.geometry = JSON.parse(row[params.geometryColumn]);
          } else {
            var point = "POINT(" + row[params.geometryColumn[1]] + " " + row[params.geometryColumn[0]] + ")";
            parsedRow.geometry = wellknown(point);
          }

          if (Object.keys(row).length > 1) {
            parsedRow.properties = {};
            async.each(Object.keys(row), function(property, propCallback) {
              if (property !== params.geometryColumn) {
                parsedRow.properties[property] = row[property];
              }
              propCallback();
            }, function(error) {
              output.features.push(parsedRow)
              geomCallback();
            });
          } else {
            output.features.push(parsedRow)
            geomCallback();
          }
        },

        function(err) {
          if (params.outputFormat === "topojson") {
            callback(null, 
              topojson.topology({ 
                output: output 
              }, {
                "property-transform": function(feature) {
                  return feature.properties;
                }
              })
            );
          } else {
            callback(null, output);
          }
        });
      }
    ],function(error, data) {
      if (error) {
        cb(error, null);
      } else {
        cb(null, data);
      }
    });

  }

  module.exports = dbgeo;
}());