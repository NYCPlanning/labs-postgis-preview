[![CircleCI](https://circleci.com/gh/NYCPlanning/labs-postgis-preview/tree/develop.svg?style=svg)](https://circleci.com/gh/NYCPlanning/labs-postgis-preview/tree/develop)
[![pullreminders](https://pullreminders.com/badge.svg)](https://pullreminders.com?ref=badge)

# PostGIS Preview

A lightweight node api and frontend for quickly previewing PostGIS queries. _Pull Requests Welcomed!_ Take a look at the [open issues](https://github.com/chriswhong/postgis-preview/issues)

![preview](https://cloud.githubusercontent.com/assets/1833820/14897977/7e8088cc-0d52-11e6-9c0e-b56f3b2af954.gif)

### Gitter Chat

[Join the conversation on Gitter](https://gitter.im/postgis-preview/Lobby#)

### Contributing

Take a look a the open issues. Come [chat on Gitter](<(https://gitter.im/postgis-preview/Lobby#)>) if you have questions. Create a Pull Request on the `develop` branch.


### Why

Our team at the NYC Department of City Planning needed to be able to test out PostGIS queries in a local environment and iterate quickly. CartoDB provides this functionality, giving users a SQL pane and a map view to quickly see the geometries returned from the database (This UI and SQL preview workflow are inspired by the CartoDB editor)

When asking on Twitter if anyone had solutions to this problem, responses included:

- Run queries in pgadmin and use `ST_asGeoJson()`, copy and paste the geojson into [geojson.io](http://www.geojson.io)
- Use [QGIS](http://www.qgis.org/en/site/) dbmanager. This works, but requires a few clicks once the data are returned to add them to the map.
- Use various command line tools that show previews in the terminal or send the results to geojson.io programmatically.

### How it works

The express.js app has a single endpoint: `/sql` that is passed a SQL query `q` as a url parameter. That query is passed to PostGIS using the _pg-promise_ module. The resulting data are transformed into topojson using a modified _dbgeo_ module (modified to include parsing WKB using the _WKX_ module), and the response is sent to the frontend.

The frontend is a simple Bootstrap layout with a Leaflet map, CartoDB basemaps, a table, and a SQL pane. The TopoJSON from the API is parsed using _omnivore_ by Mapbox, and added to the map as an L.geoJson layer with generic styling.

### How to Use

- Clone this repo
- Have a PostGIS instance running somewhere that the node app can talk to
- Create a `.env` file in the root of the repo based on `.env-sample`, setting `DATABASE_URL` with a connection string for your database (`DATABASE_URL=postgres://user:password@host:port/database`)
- Install dependencies `yarn install`
- Run the express app `yarn start`, or `yarn devstart` if you are developing and want the server to restart on file changes.
- Load the frontend `http://localhost:4000`
- Query like a boss, see your geoms on the map!

### Contributing
_Pull Requests Welcomed!_  Take a look at the [open issues](https://github.com/chriswhong/postgis-preview/issues)
[Join the conversation on Gitter](https://gitter.im/postgis-preview/Lobby#)

### Notes

- PostGIS preview expects your geometry column to be called `geom`, and that it contains WGS84 geometries.

### Tests

`yarn test`

#### Optional Feature Requirements

At some time in the near future, this app will allow the option to serve mvt locally, instead of geojson. However, for that to work, you will need the following:

- PostGIS 2.4 (and PostGres 10); and,
- `lib-protobuf-c`.
