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

class Map extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { tiles } = this.props;
    const { tiles: nextTiles, bounds } = nextProps;

    if (nextTiles) this.setLayer(nextTiles, bounds);
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

  setLayer(tiles, bounds) {
    // remove the existing layer and source if they exist
    if (this.map.getLayer('postgis-preview-features')) {
      this.map.removeLayer('postgis-preview-features');
      this.map.removeSource('postgis-preview-features');
    }

    this.map.addLayer({
      id: 'postgis-preview-features',
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

    this.map.fitBounds(bounds, {
      padding: 80,
    });
  }

  render() {
    return (
      <div id="map"></div>
    );
  }
}
