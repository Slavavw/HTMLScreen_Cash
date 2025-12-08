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
    this.state = { check: "", error: "", cartItems: {} };
    this.numberInterval = null;
  }

  componentWillMount() {
    let { cartItems } = this.props.route || this.props;
    Promise.all([cartItems()]).then((result) => {
      this.setState({ cartItems: result[0] });
    });
  }

  async senderRequest() {
    let { cartItems, handleUpdate } = this.props.route || this.props;
    let newCartItems = await cartItems();
    this.setState({ cartItems: newCartItems }, () => handleUpdate());
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
    if (this.state.error === "") {
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
                    return (
                      <th
                        scope='col'
                        key={i}>
                        {title}
                      </th>
                    );
                  })}
                  <th
                    scope='col'
                    key={columnName.length + 100}>
                    количество
                  </th>
                </tr>
                {cartItems.map((item, index) => {
                  let { dataRow, count } = item;
                  return (
                    <tr key={index}>
                      {columnName.map((title, i) => (
                        <TTD
                          key={i}
                          title={title}
                          dataRow={dataRow}
                          count={count}
                          createTotalColumn={this.createTotalColumn}></TTD>
                      ))}
                      <td>{count}</td>
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
          <td ref='parent'>
            <div
              style={{
                backgroundImage: `url(${data})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                width: "50px",
                height: "50px",
              }}></div>
          </td>
        );
      else return <td ref='parent'>{dataRow[`${title}`]}</td>;
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
