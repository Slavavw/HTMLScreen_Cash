const React = require("react");

class TTable extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { titleGroup, groupname, ColumnStruct } = this.props;
    let columnName = ColumnStruct("get");
    return (
      <table className='inventory'>
        <colgroup>
          {columnName.map((el, i) => {
            let title = Object.keys(el)[0],
              obj = el[`${title}`];
            return (
              <col
                id={title.replaceAll(/( |\t)/g, "_")}
                key={i}
              />
            );
          })}
        </colgroup>
        <tbody>
          <tr>
            {columnName.map((el, i) => (
              <th
                scope='col'
                key={i}
                style={{ width: !i ? "100%" : "30%" }}>
                {Object.keys(el)[0]}
              </th>
            ))}
          </tr>
          {groupname[`${titleGroup}`].map((k, o) => {
            let dataRow = {};
            return (
              <tr key={o}>
                {columnName.map((el, i) => {
                  let title = Object.keys(el)[0];
                  dataRow[`${title}`] = k[`${title}`][`${title}`];
                  return (
                    <td
                      key={i}
                      style={{ textAlign: i ? "center" : "left" }}>
                      {dataRow[`${title}`]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

module.exports = TTable;
