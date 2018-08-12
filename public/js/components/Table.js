const Table = (props) => { // eslint-disable-line
  const { visible, rows } = props;

  if (!rows) {
    return (
      <div>
        No features selected
      </div>
    );
  }

  const ReactTable = window.ReactTable.default; // eslint-disable-line

  const columns = Object.keys(rows[0])
    .map(property => ({
      Header: property,
      accessor: property,
    }));

  const display = visible ? '' : 'none';

  return (
    <div id="table" style={{ display }}>
      <ReactTable
        data={rows}
        columns={columns}
        defaultPageSize={10}
        className="-striped -highlight"
      />
    </div>
  );
};
