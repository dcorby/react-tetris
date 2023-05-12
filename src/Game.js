import TETROMINOES from "./Tetrominoes.js";

class Tetromino {
  constructor() {
    const id = Object.keys(TETROMINOES)[Math.floor(Math.random() * Object.keys(TETROMINOES).length)];
    this.id = id;
    this.state = 0;
    Object.assign(this, TETROMINOES[id]);
  }
}

class Game {

  constructor(board) {
    this.board = board;
    this.ctx = board.boardRef.current.getContext("2d");
    this.ctx.translate(0.5, 0.5);
    this.onKeydown = ((event) => {
      if (this.lock) { return false; }
      this.lock = true;
      if (event.key === "o") {
        this.shift("left");
      } else if (event.key === "p") {
        this.shift("right");
      } else if (event.key === "q") {
        this.shift("down");
      } else if (event.key === "w") {
        this.rotate();
      }
      this.lock = false;
    });
    addEventListener("keydown", this.onKeydown);
    this.score = 0;
    this.level = 1;
    this.lines = 0;
  }

  spawn() {
    // Get a random tetromino ID
    this.tetromino = new Tetromino();
    this.tetromino.coords = this.board.add(1, 5, this.tetromino);
    if (!this.tetromino.coords) {
      this.end();
      return;
    }
    this.draw(this.tetromino.coords);

    if (!this.timer) {
      this.timer = setInterval(() => this.shift("down"), 1000);
    }
  }

  shift(dir) {
    if (dir === "down" && !this.check("down")) {
      this.clear();
      this.spawn();
      return;
    }
    if ((dir === "left" && !this.check("left")) || (dir === "right" && !this.check("right"))) {
      return;
    }

    // Clear old cells
    this.tetromino.coords.forEach((coord) => {
      this.board.grid[coord[0]][coord[1]] = "";
    });
    this.draw();

    // Draw new cells
    this.tetromino.coords.forEach((coord) => {
      if (dir === "left") {
        coord[1] += -1;
      } else if (dir === "right") {
        coord[1] += 1;
      } else if (dir === "down") {
        coord[0] += 1;
      }
    });
    this.tetromino.coords.forEach((coord) => {
      this.board.grid[coord[0]][coord[1]] = this.tetromino.id;
    });
    this.draw();
  }

  check(dir) {
    let allowed = true;
    // down
    if (dir === "down") {
      this.tetromino.coords.forEach((coord) => {
        const row_to = coord[0]+1;
        const col_to = coord[1];
        const own = this.tetromino.coords.some(a => [row_to, col_to].every((v, i) => v === a[i]));
        if (coord[0] === 20 || (this.board.grid[row_to][col_to] && !own)) {
          allowed = false;
        }
      });
    // left
    } else if (dir === "left") {
      this.tetromino.coords.forEach((coord) => {
        const row_to = coord[0];
        const col_to = coord[1]-1;
        const own = this.tetromino.coords.some(a => [row_to, col_to].every((v, i) => v === a[i]));
        if (coord[1] === 0 || (this.board.grid[row_to][col_to] && !own)) {
          allowed = false;
        }
      });
    // right
    } else if (dir === "right") {
      this.tetromino.coords.forEach((coord) => {
        const row_to = coord[0];
        const col_to = coord[1]+1;
        const own = this.tetromino.coords.some(a => [row_to, col_to].every((v, i) => v === a[i]));
        if (coord[1] === 9 || (this.board.grid[row_to][col_to] && !own)) {
          allowed = false;
        }
      });
    }
    return allowed;
  }

  clear() {
    let count = 0;
    for (let i = 20; i >= 1; i--) {
      if (!this.board.grid[i].includes("")) {
        this.board.grid.splice(i, 1);
        this.score += 10;
        this.lines += 1;
        this.level += Math.floor(this.lines / 10);
        this.board.scoreRef.current.innerText = this.score;
        this.board.linesRef.current.innerText = this.lines;
        this.board.levelRef.current.innerText = this.level;
        count++;
      }
    }
    for (let i = 0; i < count; i++) {
      const row = Array(10).fill("");
      this.board.grid.unshift(row);
    }
    if (count) {
      this.draw(Array.from({length: 21*10}, (_, i) => [i%21,i%10]).sort((a,b) => { return a[0]-b[0] || a[1]-b[1] }));
    }
  }

  rotate() {
    let allowed = true;
    const state = TETROMINOES[this.tetromino.id].states[this.tetromino.state];
    const coords = [];
    this.tetromino.coords.forEach((coord, i) => {
      if (!allowed) { return; }
      const row_to = coord[0]+state[i][1];
      const col_to = coord[1]+state[i][0];
      const own = this.tetromino.coords.some(a => [row_to, col_to].every((v, i) => v === a[i]));
      if (row_to < 0 || row_to >= 20 || col_to < 0 || col_to > 9) {
        allowed = false;
        return;
      }
      if (this.board.grid[row_to][col_to] && !own) {
        allowed = false;
        return;
      }
      coords.push([row_to, col_to]);
    });

    if (allowed) {
      // Clear current
      this.tetromino.coords.forEach((coord) => {
        this.board.grid[coord[0]][coord[1]] = "";
      });
      this.draw();
      // Add new
      this.tetromino.coords = coords;
      this.tetromino.coords.forEach((coord) => {
        this.board.grid[coord[0]][coord[1]] = this.tetromino.id;
      });
      this.draw();

      this.tetromino.state = (this.tetromino.state += 1) % TETROMINOES[this.tetromino.id].states.length;
    }
  }

  draw(coords) {
    coords = coords || this.tetromino.coords;
    coords.forEach((coord) => {
      const id = this.board.grid[coord[0]][coord[1]];
      const color = (id) ? TETROMINOES[id].color : "#000000";
      const stroke = (id) ? "#444444" : "#000000";
      const len = this.board.cell;
      this.ctx.fillStyle = color;
       // Need for +2 offset a mystery; why canvas not drawing at exact x/y who knows...
      this.ctx.fillRect(coord[1]*len+2, coord[0]*len+2, len, len);
      this.ctx.strokeStyle = stroke;
      this.ctx.strokeRect(coord[1]*len+2, coord[0]*len+2, len, len);
    });
  }

  end() {
    clearInterval(this.timer);
    removeEventListener("keydown", this.onKeydown);
    alert("Game over!");
  }
}

export default Game;
