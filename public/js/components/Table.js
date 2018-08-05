class Table extends React.Component {

  render() {
    const { visible, geoJson } = this.props;

    if (!geoJson) return (<div>No features selected</div>);


    const ReactTable = window.ReactTable.default; // eslint-disable-line

    const data = geoJson.features.map(feature => feature.properties);

    const columns = Object.keys(geoJson.features[0].properties)
      .map(property => ({
        Header: property,
        accessor: property,
      }));

    const display = visible ? '' : 'none';

    return (
      <div id="table" style={{ display }}>
        <ReactTable
          data={data}
          columns={columns}
          defaultPageSize={10}
          className="-striped -highlight"
        />
      </div>
    );
  }
}
