class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tiles: null,
      bounds: null,
      geoJson: null,
      useTiles: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSQLUpdate = this.handleSQLUpdate.bind(this);
  }

  handleSubmit() {
    const SQL = this.mirror.getSQL();
    const queryType = this.state.useTiles ? 'tiles/initialize' : 'sql';

    fetch(`/${queryType}?q=${encodeURIComponent(SQL)}`)
      .then(res => res.json())
      .then((json) => {
        if (!json.error) {
          if (this.state.useTiles) {
            const { tiles, bounds } = json;
            this.setState({
              tiles,
              bounds,
            });
          } else {
            const geoJson = json;
            this.setState({
              geoJson,
            });
          }
        } else {
          console.log(json.error);
        }
      });
  }

  handleSQLUpdate(SQL) {
    this.setState({ SQL });
  }

  render() {
    return (
      <div id="container">
        <div id="sidebar">
          <div className="col-md-12">
            <Mirror
              ref={(ref) => {
                this.mirror = ref;
              }}
            />
            <div id="history-previous" className="btn btn-info disabled">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </div>
            <div id="history-next" className="btn btn-info disabled">
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
            <div id="notifications" />
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
        <Map tiles={this.state.tiles} geoJson={this.state.geoJson} />
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