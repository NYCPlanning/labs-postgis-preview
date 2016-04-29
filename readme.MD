#PostGIS Preview
A lightweight node api and frontend for quicky previewing PostGIS queries.

![preview](https://cloud.githubusercontent.com/assets/1833820/14897977/7e8088cc-0d52-11e6-9c0e-b56f3b2af954.gif)

###Why
I needed to be able to test out PostGIS queries in a local environment and iterate quickly.  CartoDB provides this functionality, giving users a SQL pane and a map view to quickly see the geometries returned from the database (This UI and SQL preview workflow are inspired by the CartoDB editor)

I asked on twitter if anyone had solutions to this problem, and reponses included:
  - Run queries in pgadmin and use `ST_asGeoJson()`, copy and paste the geojson into [geojson.io](http://www.geojson.io)
  - Use [QGIS](http://www.qgis.org/en/site/) dbmanager.  This works, but requires a few clicks once the data are returned to add them to the map.
  - Use various command line tools that show previews in the terminal or send the results to geojson.io programmatically.

###How it works
The express.js app has a single endpoint:  `/sql` that is passed a SQL query `q` as a url parameter.  That query is passed to PostGIS using the _pg-promise_ module.  The resulting data are transformed into topojson using a modified _dbgeo_ module (modified to include parsing WKB using the _WKX_ module), and the response is sent to the frontend.

The frontend is a simple bootstrap layout with a leaflet map, cartodb basemaps, a table, and a SQL pane.  The topojson from the API is parsed using _omnivore_ by Mapbox, and added to the map as an L.geoJson layer with generic styling.

### How to Use

- Clone this repo
- Have a PostGIS instance running somewhere that the node app can talk to
- Edit `config.sample.js` to include your database connection details, rename it `config.js`
- Install dependencies `npm install`
- Run the express app `node server.js`
- Load the frontend `http://localhost:3000`
- Query like a boss

### Notes

- PostGIS preview expects your geometry column to be called `geom`, and that it contains WGS84 geometries

###Todo

- ERROR HANDLING EVERYWHERE

- Add Tabular View
- Add Simple Infowindow with all attributes
- Add SQL Syntax Highlighting (Codemirror?)
- Add recent queries and forward/backward arrows
- Add url hash to remember data vs. map view 
- Add client-side data export as CSV, geoJSON, etc
