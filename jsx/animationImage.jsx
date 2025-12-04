const React = require("react");
const { findDOMNode: fndDOM } = require("react-dom");
const { Canvas } = require("./canvas.jsx");
const AnimationCircle = require("./animationCircle.jsx");

class AnimationOnImage extends React.Component {
  constructor(props) {
    super(props);
    this.calckSize = this.calckSize.bind(this);
    this.state = {
      width: (props.route && props.route.width) || props.width || 100,
      height: (props.route && props.route.height) || props.height || 100,
    };
    this.src = (props.route && props.route.src) || props.src;
  }
  calckSize() {
    let wrapperImage = fndDOM(this.refs["base_picter"]);
    let actualTop = wrapperImage.offsetTop,
      actualLeft = wrapperImage.offsetLeft;
    this.setState(
      {
        width: $(wrapperImage).find("canvas").width(),
        height: $(wrapperImage).find("canvas").height(),
      },
      () =>
        $(fndDOM(this.refs["animation_circle"])).css({
          position: "absolute",
          ...$(fndDOM(this.refs["base_picter"])).find("canvas").offset(),
        })
    );
  }
  componentDidMount() {
    window.addEventListener("resize", this.calckSize);
    this.calckSize();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.calckSize);
  }
  render() {
    let { height, width } = this.state;
    let { onDragingElement, className } = this.props;
    return (
      <div
        draggable
        onDragStart={onDragingElement}
        className={className}
        onDragEnd={onDragingElement}>
        <Canvas
          ref={"base_picter"}
          src={this.src}
          width={width}
          height={height}>
          <AnimationCircle
            ref={"animation_circle"}
            width={width}
            height={height}
            speed={1000 / 25}
          />
        </Canvas>
      </div>
    );
  }
}

module.exports = AnimationOnImage;
//module.exports = AnimationCircle;
