function getLayerConfig(data) {
  if (data.features[0].geometry.type === 'Polygon') {
    return {
      id: 'postgis-preview',
      type: 'fill',
      source: {
        type: 'geojson',
        data,
      },
      paint: {
        'fill-color': 'steelblue',
        'fill-outline-color': 'white',
        'fill-opacity': 0.7,
      },
    };
  }

  if (data.features[0].geometry.type === 'LineString') {
    return {
      id: 'postgis-preview',
      type: 'line',
      source: {
        type: 'geojson',
        data,
      },
      paint: {
        'line-color': 'steelblue',
        'line-width': '5',
        'line-opacity': 0.7,
      },
    };
  }

  if (data.features[0].geometry.type === 'Point') {
    return {
      id: 'postgis-preview',
      type: 'circle',
      source: {
        type: 'geojson',
        data,
      },
      paint: {
        'circle-radius': 5,
        'circle-color': 'steelblue',
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
      },
    };
  }

  return null;
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
    const { tiles: nextTiles } = nextProps;
    const { geoJson: nextgeoJson } = nextProps;

    if (nextTiles) this.addTileLayer(nextTiles);
    if (nextgeoJson) this.addJsonLayer(nextgeoJson);
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: '//raw.githubusercontent.com/NYCPlanning/labs-gl-style/master/data/style.json',
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

  addJsonLayer(data) {
    removeLayers(this.map, this);
    const layerConfig = getLayerConfig(data);
    this.map.addLayer(layerConfig);

    const bounds = turf.bbox(data);

    this.map.fitBounds(bounds, {
      padding: 80,
    });
    this.setState({ zoomedToBounds: true });
  }

  addTileLayer(tiles) {
    removeLayers(this.map, this);
    this.map.addLayer({
      id: 'postgis-preview',
      type: 'fill',
      source: {
        type: 'vector',
        tiles,
      },
      'source-layer': 'layer0',
      paint: {
        'fill-color': 'steelblue',
        'fill-outline-color': 'white',
        'fill-opacity': 0.7,
      },
    });

    if (this.props.bounds) {
      this.map.fitBounds(this.props.bounds, {
        padding: 80,
      });
      this.setState({ zoomedToBounds: true });
    }
  }

  render() {
    return <div id="map" />;
  }
}
