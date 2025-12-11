const React = require("react");
const { getBYN, convertToNumeric } = require("../js/formatFunction.js");
const ErrorBundle = require("./errorBundle.jsx");
const AnimationCircle = require("./animationCircle.jsx");

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.createTotalColumn = this.createTotalColumn.bind(this);
    this.senderRequest = this.senderRequest.bind(this);
    this.TotalColumn = {};
    this.numberInterval = null;
    this.checkForUpdate = this.checkForUpdate.bind(this);
    this.state = { error: "", cartItems: {}, focus: false };
  }

  componentWillMount() {
    let { cartItems } = this.props.route || this.props;
    Promise.all([cartItems()]).then((result) => {
      this.setState({ cartItems: result[0] });
    });
  }

  checkForUpdate(newCartItems, cartItems) {
    for (let [key, val] of Object.entries(newCartItems)) {
      if (cartItems[key] === undefined) {
        newCartItems[`${key}`]["dataRow"]["Active"] = true;
        return true;
      }
      if (cartItems[key].count !== val.count) {
        cartItems[`${key}`]["dataRow"]["Active"] = true;
        return true;
      }
      cartItems[`${key}`]["dataRow"]["Active"] = false;
    }
    return false;
  }

  async senderRequest() {
    let { cartItems, handleUpdate } = this.props.route || this.props;
    let newCartItems = await cartItems();
    if (Object.keys(newCartItems).length) {
      if (Object(newCartItems).hasOwnProperty("empty")) {
        this.setState({ cartItems: {} }, () => handleUpdate());
      } else {
        if (
          this.checkForUpdate(newCartItems, this.state.cartItems) ||
          this.checkForUpdate(this.state.cartItems, newCartItems)
        ) {
          this.setState({ cartItems: newCartItems }, () => handleUpdate());
        }
      }
    }
  }

  componentWillReceiveProps(newProps) {
    let currentId = Array.from(Object.entries(this.state.cartItems))
      .flat()
      .filter((el, index) => index % 2 !== 0)
      .filter((el) => el["dataRow"]["Active"]);
    if (currentId.length) {
      let _that = this;
      new Promise((resolve) => {
        _that.setState({ focus: true }, () => {
          setTimeout(resolve, 1000);
        });
      }).then(() => {
        _that.setState({ focus: false });
      });
    } else return true;
  }

  componentDidMount() {
    let { interval } = this.props.route || this.props;
    this.numberInterval = window.setInterval(this.senderRequest, interval);
  }

  createTotalColumn(key, value) {
    this.TotalColumn[key] = value * 1 + (this.TotalColumn[key] === undefined ? 0 : this.TotalColumn[key]) * 1;
  }

  componentWillUnmount() {
    if (this.numberInterval) {
      window.clearInterval(this.numberInterval);
    }
  }

  render() {
    let cartItems = Array.from(Object.entries(this.state.cartItems))
      .flat()
      .filter((el, index) => index % 2 !== 0);
    let { columnName } = this.props.route || this.props;
    let { focus, error } = this.state;
    if (error === "") {
      this.TotalColumn = Object.assign({});
      if (cartItems.length) {
        return (
          <div>
            <table
              className='table table-bordered'
              ref={"table table-bordered"}
              style={{ background: "rgba(125,125,125,.8)" }}>
              <colgroup>
                {columnName.map((title, i) => {
                  if (/\.?изделие|продукт\.?|\.?цена|стоимость|сумма\.?/is.exec(title) !== null)
                    return (
                      <col
                        id={title}
                        key={i}
                      />
                    );
                  else if (/PHOTO|src/i.exec(title))
                    return (
                      <col
                        id={title}
                        key={i}
                      />
                    );
                  else return null;
                })}
                <col
                  id='количество'
                  key={columnName.length + 100}
                />
              </colgroup>
              <tbody>
                <tr>
                  {columnName.map((title, i) => {
                    title = /PHOTO|src/i.exec(title) ? "" : title;
                    if (/изделие/i.test(title)) {
                      return (
                        <th
                          scope='col'
                          key={i}
                          style={{ verticalAlign: "middle" }}>
                          {title}
                        </th>
                      );
                    } else
                      return (
                        <th
                          scope='col'
                          key={i}
                          style={{ textAlign: "center", verticalAlign: "middle" }}>
                          {title}
                        </th>
                      );
                  })}
                  <th
                    scope='col'
                    key={columnName.length + 100}
                    style={{ textAlign: "center", verticalAlign: "middle" }}>
                    количество
                  </th>
                </tr>
                {cartItems.map((item, index) => {
                  let { dataRow, count } = item;
                  let style =
                    dataRow["Active"] && focus
                      ? {
                          color: "#ffffff",
                          background: "linear-gradient(rgb(39 161 41 / 77%) 40%, rgb(90 203 62 / 50%))",
                          boxShadow: "inset 4px 4px rgba(10,10,10,.1)",
                          boxShadow: "rgba(10, 10, 10, 0.1) 4px 4px inset",
                          transform: "scale(1.01)",
                          fontSize: "1.2em",
                          fontWeight: "bold",
                        }
                      : {
                          transitionProperty: "background, boxShadow, fontSize",
                          transitionDuration: ".5s",
                          background: "rgb(0,102,153)",
                          boxShadow: "0 0 2px white",
                        };
                  return (
                    <tr
                      key={index}
                      style={{
                        padding: "2px",
                        color: "black",
                        background: "rgb(0, 102, 153)",
                        border: "none",
                        borderRadius: "5px",
                        boxShadow: "0 0 2px white",
                        ...style,
                      }}>
                      {columnName.map((title, i) => (
                        <TTD
                          key={i}
                          title={title}
                          dataRow={dataRow}
                          count={count}
                          createTotalColumn={this.createTotalColumn}></TTD>
                      ))}
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <TBasketSale_itogo TotalColumn={this.TotalColumn}></TBasketSale_itogo>
          </div>
        );
      } else return null;
    } else {
      return (
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
}

class TTD extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { dataRow, count, title, createTotalColumn } = this.props;
    let data = dataRow[title];
    if (Object.hasOwn(dataRow, title)) {
      if (/сумма со скидкой/is.exec(title) !== null) {
        createTotalColumn(`Итого по чеку `, convertToNumeric(dataRow[`${title}`]));
      }
      if (/PHOTO|src/i.test(title))
        return (
          <td
            ref='parent'
            style={{
              backgroundImage: `url(${data})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundOrigin: "border-box",
              backgroundPosition: "center center",
              width: "70px",
              height: "70px",
              margin: "0px 0px",
              padding: "0px 0px",
            }}></td>
        );
      else if (/изделие/i.test(title)) {
        return (
          <td
            ref='parent'
            style={{ verticalAlign: "middle" }}>
            {dataRow[`${title}`]}
          </td>
        );
      } else {
        return (
          <td
            ref='parent'
            style={{ textAlign: "center", verticalAlign: "middle" }}>
            {dataRow[`${title}`]}
          </td>
        );
      }
    } else return null;
  }
}

class TBasketSale_itogo extends React.Component {
  constructor(props) {
    super(props);
    this.message = "";
  }

  shouldComponentUpdate(newProps, newState) {
    let result = false;
    if (Object.entries(newProps.TotalColumn).length) {
      let [key, value] = Object.entries(newProps.TotalColumn)[0];
      let messaage = `${key} ${getBYN("*", value, 1).RUB} руб. ${getBYN("*", value, 1).KOP} коп.`;
      if (this.message !== messaage) {
        result = this.message = messaage;
      }
    }
    return result;
  }

  render() {
    return (
      <div
        className='BasketSale_itogo'
        ref='BasketSale_itogo'
        style={{ marginTop: "30px" }}>
        <span>{this.message}</span>
      </div>
    );
  }
}

module.exports = { Checkout, TBasketSale_itogo };
