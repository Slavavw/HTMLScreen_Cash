const React = require("react");
const CchooseNumberPosition = require("./CchooseNumberPosition.jsx");
const { Link } = require("react-router");
const { TBasketSale_itogo } = require("./checkout.jsx");
const { getBYN, convertToNumeric } = require("../js/formatFunction.js");
const findDOMNode = require("react-dom").findDOMNode;

class CBasketSale extends React.Component {
  constructor(props) {
    super(props);
    this.style = {
      float: "right",
      backgroundColor: "rgb(250,235,199)",
      padding: "8px 8px",
      border: "3px outset rgb(252,101,18)",
      borderTop: "20px solid rgb(252,101,18)",
      borderRadius: "10px",
      boxShadow: "5px 5px 10px rgba(0,0,0,.5)",
      color: "#5d3030",
      fontSize: "0.8em",
    };
    this.createTotalColumn = this.createTotalColumn.bind(this);
    this.TotalColumn = {};
  }
  createTotalColumn(key, value) {
    this.TotalColumn[key] = value + (this.TotalColumn[key] === undefined ? 0 : this.TotalColumn[key]);
    //   this.TotalColumn[key] = value;
  }
  render() {
    let { addToCart, handleForceUpdate, ColumnStruct } = this.props;
    let cartItems = Array.from(Object.entries(this.props.cartItems))
      .flat()
      .filter((el, index) => index % 2 !== 0);
    let columnName = ColumnStruct("getVisible", ColumnStruct("exclude column", "Описание"));
    this.TotalColumn = {};
    return (
      <div
        className='BasketSale_main'
        style={{ marginTop: "10px", ...this.style }}>
        <div
          className='BasketSale'
          style={{
            display: "flex",
            flexFlow: "column nowrap",
            justifyContent: "space-around",
          }}>
          {cartItems.map(({ dataRow, count }, index) => (
            <BasketSale
              key={index}
              dataRow={dataRow}
              count={count}
              addToCart={addToCart}
              handleForceUpdate={handleForceUpdate}
              columnName={columnName}
              createTotalColumn={this.createTotalColumn.bind(this)}
            />
          ))}
          <TBasketSale_itogo TotalColumn={this.TotalColumn} />
          <div
            className='BasketSale_PrepareCart'
            style={{ marginTop: "30px" }}>
            <Link
              to='/getcheck'
              className='btn btn-danger'>
              Оформить заказ
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

class BasketSale extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyInput = this.handleKeyInput.bind(this);
    this.state = { value: props.count, resize: false };
    this.statusShowKeyBoard = false;
    this.canvas = { width: 100, height: 100 };
  }

  shouldComponentUpdate(newProps, newState) {
    let BasketSale_element = findDOMNode(this.refs["'BasketSale_element'"]);
    if (BasketSale_element) {
      let { width, height } = Object.assign(findDOMNode(this.refs["'BasketSale_element'"]).getBoundingClientRect());
      this.canvas = Object.assign({
        width: width < 50 ? 50 : width > 200 ? 70 : width / 2,
        height: height < 50 ? 50 : height > 200 ? 70 : height / 2,
      });
    }
    return true;
  }

  handleKeyInput(target) {
    this.statusShowKeyBoard = /mousedown/i.test(target.type) ? false : true;
    let { dataRow, addToCart, handleForceUpdate } = this.props,
      { RUID_ML } = dataRow;
    addToCart(Object.assign({ RUID_ML: RUID_ML, ...dataRow }), target.value);
    handleForceUpdate();
  }

  render() {
    let { columnName, createTotalColumn, dataRow, count } = this.props;
    let { width, height } = this.canvas;
    return (
      <div
        className='BasketSale_element'
        ref='BasketSale_element'
        key={Math.floor(Math.random() * 1000)}
        style={{
          display: "flex",
          flexFlow: "column nowrap",
          borderRadius: "10px",
          boxShadow: "10px 10px 10px rgba(0,0,0,.5)",
          backgroundColor: "#E1EDEB",
          marginBottom: "5px",
        }}>
        <div
          className='BasketSale_element_hearder'
          style={{ display: "flex", flexFlow: "column", justifyContent: "space-between" }}>
          {columnName.map((title, i) => {
            if (Object.hasOwn(dataRow, title)) {
              if (/\.?цена|стоимость|сумма\.?/is.exec(title) !== null) {
                createTotalColumn(`Итого ${title}`, convertToNumeric(dataRow[`${title}`]) * count);
                let sum = getBYN("*", dataRow[`${title}`], count);
                if (/цена/i.test(title) && count !== 1) title = "стоимость";
                return <div key={i}>{`${title} ${sum.RUB} руб. ${sum.KOP} коп.`}</div>;
              } else if (/\.?изделие|продукт\.?/is.exec(title) !== null) {
                return (
                  <div key={i}>
                    <p>{dataRow[`${title}`]}</p>
                  </div>
                );
              } else return null;
            } else return null;
          })}
        </div>
        <CchooseNumberPosition
          value={count}
          handleKeyInput={this.handleKeyInput}
          statusShowKeyBoard={this.statusShowKeyBoard}
        />
        {dataRow.src !== undefined ? (
          <div>
            <img
              src={dataRow.src}
              width={width}
              height={height}
              style={{ margin: "5px", borderRadius: "10px" }}></img>
          </div>
        ) : null}
      </div>
    );
  }
}

module.exports = CBasketSale;
