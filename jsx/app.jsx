const React = require("react");
const ReactDOM = require("react-dom");
import "/css/style.css";
const { Router, Route, browserHistory } = require("react-router");
const { Checkout } = require("./checkout.jsx");
const ErrorBundle = require("./errorBundle.jsx");
const AnimationCircle = require("./animationCircle.jsx");

let cartItems = {};

// Описание структуры колонок даннных (имя, видимость)
// Описание структуры колонок даннных (имя, видимость)
const ColumnStruct = (function () {
  let columnToResult,
    ColumnsStruct = [];
  return function (type) {
    switch (type) {
      case "clear":
        ColumnsStruct = [];
        return ColumnsStruct;
      case "add":
        let element = arguments[1];
        if (!ColumnsStruct.filter((obj) => obj.hasOwnProperty(Object.keys(element)[0])).length) {
          ColumnsStruct = [...ColumnsStruct, element];
        }
        return ColumnsStruct;
      case "getVisible":
        columnToResult =
          arguments[1] === undefined
            ? [...ColumnStruct]
            : arguments[1] instanceof Array
            ? [...arguments[1]]
            : [...ColumnStruct];
        return columnToResult.filter((obj) => !obj[`${Object.keys(obj)[0]}`].disabled).map((el) => Object.keys(el)[0]);
      case "get":
        return ColumnsStruct;
      case "exclude column":
        columnToResult =
          arguments[1] === undefined
            ? [...ColumnStruct]
            : arguments[1] instanceof Array
            ? [...arguments[1]]
            : [...ColumnsStruct];
        let clmnName = arguments[1].split(",");
        return columnToResult.filter((obj) => {
          for (let [k, v] of Object.entries(obj)) {
            if (clmnName.findIndex((x) => x === k) >= 0) return false;
          }
          return true;
        });
      case "get_structure": {
        return async function () {
          let url;
          url = location.origin + "/get_structure";
          try {
            let data = await fetch(url);
            data = await data.json();
            if (data.length) {
              ColumnStruct("clear");
              let o = Array.from(Object.entries(Array.of(Object.entries(data)).flat()[0][1])).flat()[1][0];
              for (let [k, v] of Object.entries(o)) {
                let obj = {};
                obj[`${k}`] = v;
                ColumnStruct("add", obj);
              }
            }
            return ColumnStruct("get");
          } catch (e) {
            return ColumnStruct("clear");
          }
        };
      }
    }
  };
})();

async function getPreOrder() {
  let url = new URL(`${location.origin}/pre_order`);
  try {
    let response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log(response.ok);
    if (!response.ok) {
      cartItems = Object.assign({});
      return cartItems;
    } else {
      let data = await response.json();
      console.log("data", typeof data, data);
      if (Object.keys(data).length) {
        cartItems = Object.assign(data);
      } else cartItems = Object.assign({});
      return cartItems;
    }
  } catch (e) {
    return {};
  }
}

// главный компонент, потому что он является точкой входа для Webpack
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { columnName: null };
    this.initStructureColumn = this.initStructureColumn.bind(this);
  }

  async initStructureColumn() {
    let columnName = await ColumnStruct("get_structure");
    columnName = await columnName();
    columnName = ColumnStruct("getVisible", ColumnStruct("exclude column", "Описание"));
    this.setState({ columnName });
  }

  componentDidMount() {
    this.initStructureColumn();
  }

  render() {
    let { columnName } = this.state;
    return columnName ? (
      <div className='well'>
        <Checkout
          cartItems={getPreOrder}
          columnName={columnName}
          interval={interval}
        />
      </div>
    ) : (
      <ErrorBundle
        width={200}
        height={100}
        message={this.state.error}>
        <AnimationCircle
          width={500}
          height={100}
          style={{ position: "absolute", left: 50, zIndex: "-10000" }}
          speed={1000 / 24}
        />
      </ErrorBundle>
    );
  }
}

ReactDOM.render(
  <Router history={browserHistory}>
    <Route
      path='/'
      component={App}></Route>
  </Router>,
  document.getElementById("content")
);
