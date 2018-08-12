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

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = { zoomedToBounds: false };
  }

  componentWillReceiveProps(nextProps) {
    const {
      tiles: nextTiles,
      geoJson: nextgeoJson,
      geometryType: nextGeometryType,
    } = nextProps;

    if (nextTiles) this.addTileLayer(nextTiles, nextGeometryType);
    if (nextgeoJson) this.addJsonLayer(nextgeoJson, nextGeometryType);
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

  componentDidUpdate() {
    if (!this.state.zoomedToBounds && this.props.bounds && this.map) {
      this.map.fitBounds(this.props.bounds, {
        padding: 80,
      });
      this.setState({ zoomedToBounds: true });
    }
  }

  addJsonLayer(geoJson, geometryType) {
    removeLayers(this.map, this);
    const layerConfig = getLayerConfig(geoJson, geometryType);
    this.map.addLayer(layerConfig, 'highway_name_other');

    const bounds = turf.bbox(geoJson);

    this.map.fitBounds(bounds, {
      padding: 80,
    });
    this.setState({ zoomedToBounds: true });
  }

  addTileLayer(tiles, geometryType) {
    const layerConfig = getLayerConfig(tiles, geometryType);
    removeLayers(this.map, this);
    this.map.addLayer(layerConfig, 'highway_name_other');

    if (this.props.bounds) {
      this.map.fitBounds(this.props.bounds, {
        padding: 80,
      });
      this.setState({ zoomedToBounds: true });
    }
  }

  render() {
    const { visible } = this.props;
    const display = visible ? '' : 'none';
    return <div id="map" style={{ display }}/>;
  }
}
