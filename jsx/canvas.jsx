const React = require("react");
const { findDOMNode: fndDOM } = require("react-dom");

const composite = (...func) => arg => func.reduce((accum, curFunc) => curFunc(accum));
function calckAverage(arr) {
  Array.prototype.reduce.call(arr,
    (prev, cur, index) => length === (index + 1) ? (prev + cur) / length : (prev + cur),
    length = arr.length
  )
}

const getItterableArr = length => Array.from({ length }, (_, index) => index + 1);

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.sizeCanvas = this.sizeCanvas.bind(this);
    this.drawCanvas = this.drawCanvas.bind(this);
    this.InvertBitmap = this.InvertBitmap.bind(this);
    let obj = Object.assign({}, Canvas.defaultProps);
    for (let [key, val] of Object.entries(obj)) {
      this[`${key}`] = (this.props.route && this.props.route[`${key}`]) || this.props[`${key}`] || val;
    }
    this.state = { width: this.width, height: this.height, img: null }
  }

  componentWillUnmount() {
    $(window).off("resize", this.sizeCanvas);
  }

  sizeCanvas() {
    let pageWidth = window.innerWidth, pageHeight = window.innerHeight;
    if (typeof pageWidth !== "number") {
      if (document.compatMode === "CSS1Compact") {
        pageWidth = document.documentElement.clientWidth;
        pageHeight = document.documentElement.clientHeight;
      }
      else {
        pageWidth = document.body.clientWidth;
        pageHeight = document.body.clientHeight;
      }
    }
    this.setState(
      { width: pageWidth, height: pageHeight },
      () => this.drawCanvas()
    )
  }

  componentDidMount() {
    $(window).on("resize", this.sizeCanvas);
    let img = new Image(); img.src = this.src;
    img.addEventListener("load", () => this.setState({ img }))
    this.drawCanvas();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.img !== this.state.img) {
      let context = fndDOM(this.refs.canvas).getContext("2d");
      let { width, height } = this.state;
      context.drawImage(this.state.img, 10, 10, width - 20, height - 20);
      this.InvertBitmap({
        target: { value: fndDOM(this.refs.units).value }
      })
    }
  }

  drawCanvas() {
    let canvas = fndDOM(this.refs.canvas);
    let context = canvas.getContext("2d");
    let { width, height } = this.state;
    let lingred = context.createLinearGradient(0, 0, width, height);
    lingred.addColorStop(.3, "#0f0");
    lingred.addColorStop(1, "#fff");
    context.beginPath();
    context.fillStyle = lingred;
    context.fillRect(0, 0, width, height);
    if (this.state.img) {
      context.drawImage(this.state.img, 10, 10, width - 20, height - 20);
      this.InvertBitmap({
        target: { value: fndDOM(this.refs.units).value }
      })
    }
  }

  InvertBitmap(event) {
    let type = event.target.value;
    let canvas = fndDOM(this.refs.canvas), context = canvas.getContext("2d");
    let { width, height, x = 10, y = 10 } = this.state;    
    if (/^INVERSE/.test(type)) {
      //let worker = new Worker("worker_calckArray.js");
      let worker = new Worker("../js/worker_calckArray.js");
      let imageData = context.getImageData(x, y, width - x, height - y);
      worker.postMessage({ data: imageData.data, type }, [imageData.data.buffer]);
      worker.onmessage = (evt) => {
        let { data } = evt.data;
        let imageData = context.getImageData(x, y, width - x, height - y);
        imageData.data.set(data);
        context.putImageData(imageData, x, y);
      }
    }
    else context.drawImage(this.state.img, x, y, width - 2 * x, height - 2 * y);


  }

  render() {
    return <div>
      <div className="fieldsImg" style={{ "display": "flex" }}>
        <article style={{ "display": "flex", "flexFlow": "column nowrap" }}>
          <label form="units" style={{ "fontSize": "90%", "display": "inline-block" }}>Инвертировать изображение</label>
          <select ref="units" onChange={this.InvertBitmap}>
            <option value="STANDART">стандартное изображение</option>
            <option value="INVERSE_GRAY">инвертировать в оттенок серого цвета</option>
            <option value="INVERSE">инвертировать изображение</option>
          </select>
        </article>
        <canvas ref="canvas" width={this.state.width} height={this.state.height} />
        {this.props.children}
      </div>
    </div>
  }
}

Canvas.defaultProps = {
  width: 200, height: 200,
  src: "/images/nice_place.jpg"
}

//module.exports = Canvas;

function TranslateCanvas({ width = 200, height = 200 }) {
  const rect = { x: 100000, y: 0, width, height };
  const changeZoom = (zoomIn = true) => (zoomIn) ? ++TranslateCanvas.zoom : --TranslateCanvas.zoom;
  console.log(rect);

  const loadCanvas = (event) => {
    event.preventDefault();
    let zoom = changeZoom(!event.button);
    if (zoom > 2 && zoom < 6) {
      $(event.target).attr("width", $(event.target).attr("width") * 2);
      $(event.target).attr("height", $(event.target).attr("height") * 2);
    }
    else { $(event.target).attr("width", width); $(event.target).attr("height", height) }
    let context = $(event.target)[0].getContext("2d");
    context.beginPath();
    context.strokeStyle = "#f00";
    context.scale(zoom, zoom);
    context.save();
    context.translate(20, 20);
    context.moveTo(0, 0);
    context.lineTo(80, 10);
    gradient = context.createLinearGradient(0, 0, 80, 52);
    gradient.addColorStop(.2, "#ff3411"); gradient.addColorStop(.4, "#ff34"); gradient.addColorStop(.8, "#ff00");
    context.stroke();
    context.beginPath();
    context.strokeStyle = "#00f";
    context.save();
    context.rotate(Math.PI / 4);
    context.moveTo(0, 0);
    context.arc(0, 0, 52, Math.PI / 3, Math.PI / 6, true);
    context.closePath();
    context.stroke();
    context.fillStyle = gradient;
    context.fill();
    context.restore();
    context.beginPath();
    context.moveTo(80, 10);
    context.lineTo(14, 50);
    context.stroke();
    context.lineTo(0, 0);
    gradient = context.createLinearGradient(0, 0, 80, 52);
    gradient.addColorStop(.2, "#1ff"); gradient.addColorStop(.8, "#15ff");
    context.fillStyle = gradient;
    context.fill();
    context.restore();
    rect.x = 20; rect.y = 20; rect.width = rect.x + 80; rect.height = rect.y + 52;
    console.log(rect);
  }
  return (
    <div>
      <p>Enter mouse button</p>
      <canvas width={width} height={height} id="translate-canvas"
        onMouseUp={loadCanvas} onMouseDown={(event) => event.preventDefault()}
        onMouseMove={(event) => {
          let rect_canvas = event.target.getBoundingClientRect();
          if ((rect_canvas.left + rect.x) <= event.clientX && (rect_canvas.right - rect.width) >= event.clientX
            && (rect_canvas.top + rect.y) <= event.clientY && (rect_canvas.bottom - rect.height) >= event.clientY)
            $(event.target).css("cursor", "zoom-in");
          else $(event.target).css("cursor", "pointer");
        }}
      />
    </div>
  )
}

TranslateCanvas.zoom = 0;

function ResultCanvas() {
  return (
    <div>
      <Canvas />
      <TranslateCanvas />
    </div>
  )
}


module.exports = { ResultCanvas, Canvas };