const express = require('express');
const SphericalMercator = require('sphericalmercator');
const path = require('path');
const pgp = require('pg-promise');
const shortid = require('shortid');

const router = express.Router();
const mercator = new SphericalMercator({
  size: 256,
});

const getQueryFile = (file) => {
  const fullPath = path.join(__dirname, '../queries', file);
  return new pgp.QueryFile(fullPath, { minify: true });
};

const generateVectorTile = getQueryFile('generate-vector-tile.sql');

const boundingBoxQuery = getQueryFile('bounding-box-query.sql');
const featureCountQuery = getQueryFile('feature-count-query.sql');


router.get('/initialize', async (req, res) => {
  const { app, query } = req;
  const { q } = query;
  const tileId = shortid.generate();
  await app.tileCache.set(tileId, q);

  const bbox = await app.db.one(boundingBoxQuery, { q })
    .catch((e) => {
      res.send({
        error: e.message,
      });
    });

  let rows = await app.db.any(q)
    .catch((e) => {
      console.error(e.message);
    });

  // remove geom
  rows = rows.map((row) => {
    delete row.geom;
    return row;
  });

  res.send({
    tiles: [`http://localhost:${process.env.PORT}/tiles/${tileId}/{z}/{x}/{y}.mvt`],
    bounds: bbox.bbox,
    rows,
  });
});


/* GET /projects/tiles/:tileId/:z/:x/:y.mvt */
/* Retreive a vector tile by tileid */
router.get('/:tileId/:z/:x/:y.mvt', async (req, res) => {
  const { app, params } = req;

  const {
    tileId,
    z,
    x,
    y,
  } = params;

  // retreive the projectids from the cache
  const tileQuery = await app.tileCache.get(tileId);
  // calculate the bounding box for this tile
  const bbox = mercator.bbox(x, y, z, false, '900913');

  try {
    const tile = await app.db.one(generateVectorTile, [...bbox, tileQuery]);

    res.setHeader('Content-Type', 'application/x-protobuf');

    if (tile.st_asmvt.length === 0) {
      res.status(204);
    }
    res.send(tile.st_asmvt);
  } catch (e) {
    res.status(404).send({
      error: e.toString(),
    });
  }
});

module.exports = router;
