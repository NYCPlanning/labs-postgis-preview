WITH tilebounds (geom) AS (SELECT ST_MakeEnvelope($1, $2, $3, $4, 3857))
SELECT ST_AsMVT(q, 'layer0', 4096, 'mvtgeom')
FROM (
  SELECT
    *,
    ST_AsMVTGeom(
      ST_Transform(x.geom, 3857),
      tileBounds.geom,
      4096,
      256,
      true
    ) mvtgeom
  FROM (
    $5^
  ) x, tilebounds
  WHERE ST_Transform(x.geom, 3857) && tilebounds.geom
) q
