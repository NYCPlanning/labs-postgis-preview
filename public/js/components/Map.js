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
    const { FeatureCollection } = this.props;
    const { FeatureCollection: nextFeatureCollection } = nextProps;

    if (nextFeatureCollection) this.addLayer(nextFeatureCollection);
  }

  componentDidMount() {
    this.map = L.map('map')
      .setView([40.708816, -74.008799], 11);

    // add CartoDB 'dark matter' basemap
    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    }).addTo(this.map);
  }

  addLayer(FeatureCollection) {
    if (this.map.hasLayer(this.layer)) {
      this.map.removeLayer(this.layer);
    }

    // create an L.geoJson layer, add it to the map
    this.layer = L.geoJson(FeatureCollection, {
      style: {
        color: '#fff', // border color
        fillColor: 'steelblue',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      },

      onEachFeature(feature, leafletLayer) {
        if (feature.geometry.type !== 'Point') {
          leafletLayer.bindPopup(propertiesTable(feature.properties));
        }
      },

      pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 4,
          fillColor: '#ff7800',
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        }).bindPopup(propertiesTable(feature.properties));
      },
    }).addTo(this.map);

    this.map.fitBounds(this.layer.getBounds());
  }

  render() {
    return (
      <div id="map"></div>
    );
  }
}
