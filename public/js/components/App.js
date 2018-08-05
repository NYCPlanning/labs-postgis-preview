class App extends React.Component {
  constructor(props) {
    super(props);

    const history = (localStorage.history) ? JSON.parse(localStorage.history) : [];
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
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSQLUpdate = this.handleSQLUpdate.bind(this);
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
            const { tiles, bounds, featureCount } = json;
            this.setState({
              tiles,
              bounds,
              featureCount,
            });
          } else {
            const geoJson = json;
            const featureCount = geoJson.features.length;

            this.setState({
              geoJson,
              featureCount,
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
      featureCount,
      errorMessage,
      history,
      historyIndex,
    } = this.state;

    const noHistoryBack = historyIndex > (history.length - 2);
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

      notification = (<div id="notification" className={`alert alert-${status}`}>{messageText}</div>);
    }

    return (
      <div id="container">
        <div id="sidebar">
          <div className="col-md-12">
            <Mirror
              ref={(ref) => {
                this.mirror = ref;
              }}
            />
            <div id="history-previous" className="btn btn-info" disabled={noHistoryBack} onClick={() => { this.getHistory('backward'); }}>
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </div>
            <div id="history-next" className="btn btn-info" disabled={noHistoryForward} onClick={() => { this.getHistory('forward'); }}>
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
        <Map tiles={this.state.tiles} geoJson={this.state.geoJson} bounds={this.state.bounds} />
        <div id="table">
          <table id="example" className="table table-striped table-bordered" cellSpacing="0">
            <thead />
            <tfoot />
            <tbody />
          </table>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
