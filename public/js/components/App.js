class App extends React.Component {
  constructor(props) {
    super(props);

    const history = localStorage.history ? JSON.parse(localStorage.history) : [];
    const historyIndex = 0; // get the first item as the default query

    this.state = {
      tiles: null,
      bounds: null,
      featureCount: null,
      errorMessage: null,
      geoJson: null,
      useTiles: false,
      history,
      historyIndex,
      rows: null,
      view: 'map',
      geometryType: null,
      geometriesAboveLabels: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSQLUpdate = this.handleSQLUpdate.bind(this);
    this.handleViewToggle = this.handleViewToggle.bind(this);
  }

  componentDidMount() {
    const { history, historyIndex } = this.state;
    const historyQuery = history[historyIndex];

    this.mirror.setValue(historyQuery);
  }

  handleSubmit() {
    const SQL = this.mirror.getValue();

    const queryType = this.state.useTiles ? 'tiles/initialize' : 'sql';

    fetch(`/${queryType}?q=${encodeURIComponent(SQL)}`)
      .then(res => res.json())
      .then((json) => {
        if (!json.error) {
          if (this.state.useTiles) {
            const {
              tiles,
              bounds,
              rows,
              geometryType,
            } = json;

            const featureCount = rows.length;

            this.setState({
              tiles,
              bounds,
              rows,
              featureCount,
              geometryType,
            });
          } else {
            const geoJson = json;
            const featureCount = geoJson.features.length;

            // Get the geometry type. Make sure we only look at features with a geometry
            const geometryType = geoJson.features.filter(feature => {
              if (feature.geometry && feature.geometry.type) {
                return feature
              }
            }).map(feature => {
              return feature.geometry.type
            })[0];

            // map features to rows array for use in Table component
            const rows = geoJson.features.map(feature => feature.properties);

            this.setState({
              geoJson,
              rows,
              featureCount,
              geometryType,
            });
          }
        } else {
          this.setState({
            tiles: null,
            bounds: null,
            featureCount: null,
            errorMessage: json.error,
          });
        }
      });

    // add query to history

    const { history } = this.state;

    history.unshift(SQL);

    if (history.length > 25) {
      history.pop();
    }

    localStorage.history = JSON.stringify(history);

    this.setState({ history });
  }

  handleSQLUpdate(SQL) {
    this.setState({ SQL });
  }

  toggleMvt(e) {
    if (e.target.checked) {
      this.setState({ useTiles: true, geoJson: null });
    } else {
      this.setState({ useTiles: false, tiles: null, bounds: null });
    }
  }

  toggleAboveLabels(e) {
    if (e.target.checked) {
      this.setState({ geometriesAboveLabels: true });
    } else {
      this.setState({ geometriesAboveLabels: false });
    }
  }

  handleViewToggle(view) {
    this.setState({ view });
  }

  getHistory(type) {
    const { history } = this.state;
    let { historyIndex } = this.state;

    if (type === 'backward') {
      historyIndex += 1;
    } else {
      historyIndex -= 1;
    }

    const historyQuery = history[historyIndex];

    this.setState({
      historyIndex,
    });

    this.mirror.setValue(historyQuery);
  }

  render() {
    const {
      featureCount, errorMessage, history, historyIndex,
    } = this.state;

    const noHistoryBack = historyIndex > history.length - 2;
    const noHistoryForward = historyIndex === 0;

    let notification = null;

    if (featureCount || errorMessage) {
      let status;
      let messageText;

      if (featureCount) {
        status = 'success';
        messageText = `${featureCount} feature${featureCount > 0 ? 's' : ''} returned`;
      } else {
        status = 'danger';
        messageText = errorMessage;
      }

      notification = (
        <div id="notification" className={`alert alert-${status}`}>
          {messageText}
        </div>
      );
    }

    return (
      <div className="react-root">
        <div className="navbar navbar-inverse navbar-fixed-top" role="navigation">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="#">PostGIS Preview</a>
            </div>
            <div className="btn-group navbar-right" role="group" aria-label="...">
              <button
                type="button"
                onClick={() => { this.handleViewToggle('map'); }}
                className="btn btn-info navbar-btn active"
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => { this.handleViewToggle('table'); }}
                className="btn btn-info navbar-btn"
              >
                Table
              </button>
            </div>
          </div>
        </div>
        <div id="container">
          <div id="sidebar">
            <div className="col-md-12">
              <Mirror
                ref={(ref) => {
                  this.mirror = ref;
                }}
              />
              <div
                id="history-previous"
                className="btn btn-info"
                disabled={noHistoryBack}
                onClick={() => {
                  this.getHistory('backward');
                }}
              >
                <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
              </div>
              <div
                id="history-next"
                className="btn btn-info"
                disabled={noHistoryForward}
                onClick={() => {
                  this.getHistory('forward');
                }}
              >
                <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
              </div>
              <button
                id="run"
                type="submit"
                className="btn btn-info pull-right has-spinner"
                href="#"
                onClick={this.handleSubmit}
              >
                <span className="spinner">
                  <i className="fa fa-refresh fa-spin" />
                </span>
                Submit
              </button>

              <div className="form-check" style={{ marginTop: '5px' }}>
                <input
                  id="experimentalCheck"
                  className="form-check-input"
                  type="checkbox"
                  onChange={this.toggleMvt.bind(this)}
                />
                <label
                  className="form-check-label"
                  htmlFor="experimentalCheck"
                  style={{ marginLeft: '10px', userSelect: 'none', fontWeight: 200 }}
                >
                  Use MVT Tile Layers (For PostGIS 2.4+)
                </label>
              </div>

              <div className="form-check" style={{ marginTop: '5px' }}>
                <input
                  id="above-labels-toggle"
                  className="form-check-input"
                  type="checkbox"
                  onChange={this.toggleAboveLabels.bind(this)}
                />
                <label
                  className="form-check-label"
                  htmlFor="above-labels-toggle"
                  style={{ marginLeft: '10px', userSelect: 'none', fontWeight: 200 }}
                >
                  Show results above map labels
                </label>
              </div>

              {notification}
              <div id="download">
                <h4>Download</h4>
                <button id="geojson" className="btn btn-info pull-left">
                  Geojson
                </button>
                <button id="csv" className="btn btn-info pull-left">
                  CSV
                </button>
              </div>
            </div>
          </div>
          <Map
            tiles={this.state.tiles}
            geoJson={this.state.geoJson}
            bounds={this.state.bounds}
            visible={this.state.view === 'map'}
            geometryType={this.state.geometryType}
            geometriesAboveLabels={this.state.geometriesAboveLabels}
          />
          <Table rows={this.state.rows} featureCount={this.state.featureCount} visible={this.state.view === 'table'} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
