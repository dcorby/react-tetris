import React, { useRef, useEffect } from 'react';
import "./Board.scss";
import Game from "./Game.js";
import { BG_WIDTH, BG_HEIGHT, BOARD_WIDTH, BOARD_HEIGHT } from './Dimensions.js';

let GAME_STARTED = false;

class Board extends React.Component {

  constructor(props) {
    super(props);
    // Size the board
    this.sizeBoard(props.bgWidth, props.bgHeight);
    // Get the grid
    this.grid = Array(20 + 1).fill("").map(x => Array(10).fill(""));
    // Get some references
    this.boardRef = React.createRef();
    this.scoreRef = React.createRef();
    this.levelRef = React.createRef();
    this.linesRef = React.createRef();
  }

  // Add a tetromino to the board
  add(row, col, tetromino) {
    let gameOver = false;
    const coords = [];
    tetromino.cells.forEach((cell) => {
      coords.push([row+cell[1], col+cell[0]]);
    });
    coords.forEach((coord) => {
      if (this.grid[coord[0]][coord[1]]) {
        gameOver = true;
        return;
      }
      this.grid[coord[0]][coord[1]] = tetromino.id;
    });
    return (gameOver) ? null : coords;
  }

  sizeBoard(bgWidth, bgHeight) {
    // Size the board
    this.width = 0;
    this.height = 0;
    while (this.width < bgWidth && this.height < bgHeight) {
      this.width += 1;
      this.height += 2;
    }
    // Punch out width and height to next clean dividends
    this.width = Math.floor(this.width / 10) * 10;
    this.height = Math.floor(this.height / 20) * 20;

    // Size cells too
    this.cell = this.width / 10;
  }

  render() {
    return (
      <div id="frame">
      <div id="board" style={{ width: this.width, height: this.height }}>
        <canvas width={this.width} height={this.height+this.cell} style={{marginTop: this.cell*-1}} ref={this.boardRef}></canvas>
      </div>
      <div id="info">
        <div>
          <div>
            <p>SCORE</p>
            <p id="score" ref={this.scoreRef}>0</p>
          </div>
        </div>
        <div>
          <div>
            <p>LEVEL</p>
            <p id="level" ref={this.levelRef}>1</p>
          </div>
          <div style={{ marginTop: "10px" }}>
            <p>LINES</p>
            <p id="lines" ref={this.linesRef}>0</p>
          </div>
        </div>
      </div>
      </div>
    )
  }

  componentDidMount() {
    // Start the game
    if (!GAME_STARTED) {
      const game = new Game(this);
      game.spawn();
      GAME_STARTED = true;
    }
  }
}

export default Board;
