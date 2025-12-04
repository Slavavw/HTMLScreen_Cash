const React = require("react");
const AnimationCircle = require("./animationCircle.jsx");
const TTable = require("./TTable.jsx");
/*const fD = ReactDOM.findDOMNode;*/

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { menuData: [] };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.id !== nextProps.params.id) {
      let url = location.origin + "/menu/" + nextProps.params.id;
      let { ColumnStruct } = this.props.route;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.length) {
            ColumnStruct("clear");
            let o = Array.from(Object.entries(Array.of(Object.entries(data)).flat()[0][1])).flat()[1][0];
            for (let [k, v] of Object.entries(o)) {
              let obj = {};
              obj[`${k}`] = v;
              ColumnStruct("add", obj);
            }
          }
          this.setState({ menuData: [...data] });
        });
    }
  }

  componentWillMount() {
    let url = location.origin + "/menu/" + this.props.params.id;
    let { ColumnStruct } = this.props.route;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.length) {
          ColumnStruct("clear");
          let o = Array.from(Object.entries(Array.of(Object.entries(data)).flat()[0][1])).flat()[1][0];
          for (let [k, v] of Object.entries(o)) {
            let obj = {};
            obj[`${k}`] = v;
            ColumnStruct("add", obj);
          }
        }
        this.setState({ menuData: [...data] });
      });
  }

  render() {
    let { src, title } = this.props.route.product[this.props.params.id];
    let { menuData } = this.state;
    if (!menuData.length) {
      return (
        <div className='menuImg'>
          <AnimationCircle />
          <p>{title}</p>
        </div>
      );
    }
    let { ColumnStruct } = this.props.route;
    return (
      <div
        className='wrapper_modal'
        style={{
          overflowY: "auto",
        }}>
        {menuData.map((groupname, i) => {
          let titleGroup = Object.getOwnPropertyNames(groupname)[0];
          return (
            <TTable
              key={i}
              titleGroup={titleGroup}
              ColumnStruct={ColumnStruct}
              groupname={groupname}
            />
          );
        })}
      </div>
    );
  }
}

module.exports = Menu;
