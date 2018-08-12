function getLayerConfig(data, geometryType) {
  // build mapboxGL layer with source, based on data type and geometry type

  let layerConfig = {
    id: 'postgis-preview',
  };

  if (data.features) { // check for geoJson
    layerConfig = {
      ...layerConfig,
      source: {
        type: 'geojson',
        data,
      },
    };
  } else { // else it's an array of MVT templates
    layerConfig = {
      ...layerConfig,
      source: {
        type: 'vector',
        tiles: data,
      },
      'source-layer': 'layer0',
    };
  }

  if (['Polygon', 'MultiPolygon'].includes(geometryType)) {
    layerConfig = {
      ...layerConfig,
      type: 'fill',
      paint: {
        'fill-color': 'steelblue',
        'fill-outline-color': 'white',
        'fill-opacity': 0.7,
      },
    };
  }

  if (['LineString', 'MultiLineString'].includes(geometryType)) {
    layerConfig = {
      ...layerConfig,
      type: 'line',
      paint: {
        'line-color': 'steelblue',
        'line-width': '5',
        'line-opacity': 0.7,
      },
    };
  }

  if (['Point', 'MultiPoint'].includes(geometryType)) {
    layerConfig = {
      ...layerConfig,
      type: 'circle',
      paint: {
        'circle-radius': 5,
        'circle-color': 'steelblue',
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
      },
    };
  }

  return layerConfig;
}

function removeLayers(map, ctx) {
  if (
    map
      .getStyle()
      .layers.map(i => i.id)
      .includes('postgis-preview')
  ) {
    map.removeLayer('postgis-preview');
    map.removeSource('postgis-preview');
  }
  ctx.setState({ zoomedToBounds: false });
}

function getBeforeLayer(geometriesAboveLabels) {
  return geometriesAboveLabels ? null : 'place_other';
}

class Map extends React.Component { // eslint-disable-line
  constructor(props) {
    super(props);

    this.state = { zoomedToBounds: false };
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: 'map',
      // style: '//raw.githubusercontent.com/NYCPlanning/labs-gl-style/master/data/style.json',
      style: 'https://maps.tilehosting.com/styles/positron/style.json?key=2F8nWorAsHivJ6MEwNs6',
      hash: true,
      zoom: 6.73,
      center: [-73.265, 40.847],
    });

    window.map = this.map;
  }

  componentWillReceiveProps(nextProps) {
    const {
      tiles,
      geoJson,
      geometryType,
      geometriesAboveLabels: nextGeometriesAboveLabels,
    } = nextProps;

    const { geometriesAboveLabels } = this.props;
    if ((geometriesAboveLabels !== nextGeometriesAboveLabels) && (!!this.map.getLayer('postgis-preview'))) {
      this.map.moveLayer('postgis-preview', getBeforeLayer(nextGeometriesAboveLabels));
    } else {
      if (tiles) this.addTileLayer(tiles, geometryType, geometriesAboveLabels);
      if (geoJson) this.addJsonLayer(geoJson, geometryType, geometriesAboveLabels);
    }
  }

  componentDidUpdate() {
    const { zoomedToBounds } = this.state;
    const { bounds } = this.props;
    if (!zoomedToBounds && bounds && this.map) {
      this.fitBounds(bounds);
    }
  }

  fitBounds(bounds) {
    this.map.fitBounds(bounds, {
      padding: 80,
    });
    this.setState({ zoomedToBounds: true });
  }

  addJsonLayer(geoJson, geometryType, geometriesAboveLabels) {
    removeLayers(this.map, this);
    const layerConfig = getLayerConfig(geoJson, geometryType);
    this.map.addLayer(layerConfig, getBeforeLayer(geometriesAboveLabels));

    const bounds = turf.bbox(geoJson);

    this.fitBounds(bounds);
  }

  addTileLayer(tiles, geometryType, geometriesAboveLabels) {
    const { bounds } = this.props;
    const layerConfig = getLayerConfig(tiles, geometryType);
    removeLayers(this.map, this);
    this.map.addLayer(layerConfig, getBeforeLayer(geometriesAboveLabels));

    if (bounds) this.fitBounds(bounds);
  }

  render() {
    const { visible } = this.props;
    const display = visible ? '' : 'none';
    return <div id="map" style={{ display }} />;
  }
}
