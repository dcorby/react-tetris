import React, { useRef, useEffect } from 'react';
import "./Background.scss";
import Board from './Board.js';
import { BG_WIDTH, BG_HEIGHT, BUFFERS } from './Dimensions.js';


class Background extends React.Component {

  sizeBackground() {
    this.width = 0;
    this.height = 0;
    this.maxWidth = window.screen.availWidth;
    this.maxHeight = window.screen.availHeight;
    while (this.width < this.maxWidth - BUFFERS["x"]
            && this.height < this.maxHeight - BUFFERS["y"]) {

      this.width++;
      this.height = BG_HEIGHT/BG_WIDTH * this.width;
    }
  }

  constructor(props) {
    super(props);
    this.sizeBackground();
  }

  render() {
    return (
      <div id="background" style={{ width: this.width, height: this.height }}>
        <Board bgWidth={this.width} bgHeight={this.height} />
      </div>
    )
  }

  componentDidMount() {
  }

  componentWillUnount() {
  }
}

export default Background;
