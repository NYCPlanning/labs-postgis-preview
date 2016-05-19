 (function(){
    'use strict'
      
      //initialize a leaflet map
      var map = L.map('map')
        .setView([40.708816,-74.008799], 11);
      
      //layer will be where we store the L.geoJSON we'll be drawing on the map
      var layer;

      //add CartoDB 'dark matter' basemap
      L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
      }).addTo(map);

      //listen for submit of new query
      $('form').submit(function(e) {
        e.preventDefault();

        clearTable();

        var sql = $('#sqlPane').val();
        
        //clear the map
        if( map.hasLayer(layer)) {
          layer.clearLayers();
        }
      
        //pass the query to the sql api endpoint
        $.getJSON('/sql?q=' + sql, function(data) {
          console.log(data)
          if(!data.error) {
            //convert topojson coming over the wire to geojson using mapbox omnivore
            var features = omnivore.topojson.parse(data); //should this return a featureCollection?  Right now it's just an array of features.
            addLayer( features ); //draw the map layer
            buildTable( features ); //build the table
            
          } else {
            //write the error in the sidebar
            $('#notifications').text(data.error)
          }
        })
      })

      //toggle map and data view
      $('.btn-group button').click(function(e) {
        $(this).addClass('active').siblings().removeClass('active');

        var view = $(this)[0].innerText;

        if(view == "Data View") {
          $('#map').hide();
          $('#table').show();
        } else {
          $('#map').show();
          $('#table').hide();
        }

      })

      function propertiesTable( properties ) {
        if (!properties) {
          properties = {};
        }

        var table = $("<table><tr><th>Column</th><th>Value</th></tr></table>");
        var keys = Object.keys(properties);
        var banProperties = ['geom'];
        for (var k = 0; k < keys.length; k++) {
          if (banProperties.indexOf(keys[k]) === -1) {
            var row = $("<tr></tr>");
            row.append($("<td></td>").text(keys[k]));
            row.append($("<td></td>").text(properties[keys[k]]));
            table.append(row);
          }
        }
        return '<table border="1">' + table.html() + '</table>';
      }


      function addLayer( features ) {
        //create an L.geoJson layer, add it to the map
          layer = L.geoJson(features, {
            style: {
                color: '#fff', // border color
                fillColor: 'steelblue',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            },

            onEachFeature: function ( feature, layer ) {
              if (feature.geometry.type !== 'Point') {
                layer.bindPopup(propertiesTable(feature.properties));
              }
            },

            pointToLayer: function ( feature, latlng ) {
              return L.circleMarker(latlng, {
                radius: 4,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              }).bindPopup(propertiesTable(feature.properties));
            }
          }).addTo(map)

          map.fitBounds(layer.getBounds());
          $('#notifications').empty();
      }

      function buildTable( features ) {
        //assemble a table from the geojson properties

        //first build the header row
        var fields = Object.keys( features[0].properties );

        $('#table').find('thead').append('<tr/>');
        $('#table').find('tfoot').append('<tr/>');

        fields.forEach( function( field ) {
          $('#table').find('thead').find('tr').append('<th>' + field + '</th>');
          $('#table').find('tfoot').find('tr').append('<th>' + field + '</th>')
        });

        features.forEach( function( feature ) {
          console.log(feature);
          //create tr with tds in memory
          var $tr = $('<tr/>');

          fields.forEach( function( field ) {
            $tr.append('<td>' + feature.properties[field] + '</td>')
            console.log($tr);
          })



          $('#table').find('tbody').append($tr);
        });

           $('#table>table').DataTable();
      }

      function clearTable() {
        $('#table').find('thead').empty();
        $('#table').find('tfoot').empty();
        $('#table').find('tbody').empty();
      };



    }());