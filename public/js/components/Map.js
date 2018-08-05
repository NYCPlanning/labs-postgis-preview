function propertiesTable(properties) {
  if (!properties) {
    properties = {};
  }

  const table = $('<table><tr><th>Column</th><th>Value</th></tr></table>');
  const keys = Object.keys(properties);
  const banProperties = ['geom'];
  for (let k = 0; k < keys.length; k += 1) {
    if (banProperties.indexOf(keys[k]) === -1) {
      const row = $('<tr></tr>');
      row.append($('<td></td>').text(keys[k]));
      row.append($('<td></td>').text(properties[keys[k]]));
      table.append(row);
    }
  }
  return `<table border="1">${table.html()}</table>`;
}

function removeLayers(map) {
  if (
    map
      .getStyle()
      .layers.map(i => i.id)
      .includes('postgis-preview')
  ) {
    map.removeLayer('postgis-preview');
    map.removeSource('postgis-preview');
  }
}

class Map extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { tiles, geoJson } = this.props;
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
  }

  addJsonLayer(data) {
    removeLayers(this.map);
    this.map.addLayer({
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
    });
  }

  addTileLayer(tiles) {
    removeLayers(this.map);
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
  }

  render() {
    return <div id="map" />;
  }
}
