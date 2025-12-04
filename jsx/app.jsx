const React = require("react");
const ReactDOM = require("react-dom");
import "/css/style.css";
const { Router, Route, Link, IndexRoute, browserHistory } = require("react-router");
const { FcFinePrint } = require("react-icons/fc");
const Menu = require("./Menu.jsx");

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
    }
  };
})();

// главный компонент, потому что он является точкой входа для Webpack
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      PRODUCT: [],
    };
  }

  componentWillMount() {
    fetch(`${location.origin}/menu_titles`)
      .then((response) => response.json())
      .then((data) => this.setState({ PRODUCT: [...data] }));
  }

  componentWillReceiveProps(newProps) {
    if (this.isModal && newProps.location.key !== this.props.location.key) {
      this.previousChildren = this.props.children;
    }
  }
  render() {
    let { PRODUCT } = this.state;
    return (
      <div className='well'>
        <div className='menu_nav_header'>
          {PRODUCT.map((picture, index) => (
            <Link
              className={`intervel_link${picture.id}`}
              key={picture.id}
              to={{
                pathname: `/menu/${picture.id}`,
                state: { returnTo: `/` },
              }}>
              {picture.src === null ? (
                <div className='btn btn-primary'>
                  <p>{picture.title}</p>
                </div>
              ) : (
                <img
                  src={picture.src}
                  height='100'
                  style={{ margin: 10 }}
                />
              )}
            </Link>
          ))}
        </div>
        <div>{this.props.children}</div>
      </div>
    );
  }
}

ReactDOM.render(
  <Router history={browserHistory}>
    <Route
      path='/'
      component={App}>
      <Route
        path='/menu/:id'
        component={Menu}
        product={menu_titles}
        ColumnStruct={ColumnStruct}
      />
    </Route>
  </Router>,
  document.getElementById("content")
);
