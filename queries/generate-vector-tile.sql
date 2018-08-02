WITH tilebounds (geom) AS (SELECT ST_MakeEnvelope($1, $2, $3, $4, 4326))
SELECT ST_AsMVT(q, 'layer0', 4096, 'mvtgeom')
FROM (
  SELECT
    *,
    ST_AsMVTGeom(
      x.geom,
      tileBounds.geom,
      4096,
      256,
      false
    ) mvtgeom
  FROM (
    $5^
  ) x, tilebounds
  WHERE ST_Intersects(x.geom, tilebounds.geom)
) q
