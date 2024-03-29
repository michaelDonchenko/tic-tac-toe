import {WINNING_COMBINATIONS} from "./utils";

type Board = Cell[];

type Cell = {
  value: "x" | "o" | null;
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
};

export class Game {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  public cellSize = 200;
  public numberOfCells = 3;
  public board: Board = [];

  public playerValue = {
    human: "x",
    computer: "o",
  } as const;

  public Result = {
    HumanWin: -1,
    Draw: 0,
    ComputerWin: 1,
  } as const;

  public currentPlayer: "x" | "o" = "x";
  public winner: null | number = null;
  public gameOver = false;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
    this.addClickEvent();
    this.generateBoard();
  }

  update() {
    this.winner = this.evaluate(this.board);

    if (this.winner === 1 || this.winner === -1) {
      this.gameOver = true;
    }
    if (!this.isMovesLeft(this.board)) {
      this.gameOver = true;
    }

    if (this.currentPlayer === "o") {
      const bestMove = this.findBestMove(this.board);

      if (bestMove !== -1) {
        this.board[bestMove].value = "o";
        this.currentPlayer = "x";
      }
    }
  }

  draw() {
    this.drawBackground();
    this.drawValues();
    this.drawGameOverPhase();
  }

  drawBackground() {
    // background
    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // board lines
    for (let x = 1; x < this.numberOfCells; x++) {
      this.context.beginPath();
      this.context.fillStyle = "black";
      this.context.moveTo(x * this.cellSize, 0);
      this.context.lineTo(x * this.cellSize, this.canvas.height);
      this.context.stroke();
    }

    for (let y = 1; y < this.numberOfCells; y++) {
      this.context.beginPath();
      this.context.fillStyle = "black";
      this.context.moveTo(0, y * this.cellSize);
      this.context.lineTo(this.canvas.width, y * this.cellSize);
      this.context.stroke();
    }
  }

  drawValues() {
    this.context.fillStyle = "black";
    this.context.font = "180px Arial";

    for (let cell of this.board) {
      const value = cell.value;

      if (value !== null) {
        const textWidth = this.context.measureText(value).width;
        this.context.fillText(value, cell.fromX + this.cellSize / 2 - textWidth / 2, cell.toY - 60);
      }
    }
  }

  drawGameOverPhase() {
    if (this.gameOver) {
      let text = "";
      if (this.winner === 0) text = "it's a draw!";
      if (this.winner === -1) text = "You won nice job!";
      if (this.winner === 1) text = "You lost better luck next time!";

      this.context.font = "20px Serif";
      this.context.fillText(
        text,
        this.canvas.width / 2 - this.context.measureText(text).width / 2,
        190
      );
    }
  }

  addClickEvent() {
    window.addEventListener("click", (e) => {
      if (this.currentPlayer !== "x") {
        return;
      }

      const {x, y} = this.getCursorPosition(this.canvas, e);

      const cellIndex = this.board.findIndex(
        (cell) => x < cell.toX && x > cell.fromX && y < cell.toY && y > cell.fromY
      );

      if (cellIndex === -1) {
        return;
      }
      if (this.board[cellIndex].value !== null) {
        return;
      }

      this.board[cellIndex].value = "x";
      this.currentPlayer = "o";
    });
  }

  getCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x, y};
  }

  generateBoard() {
    // insert values and borer x and y
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.board.push({
          value: null,
          fromX: i * this.cellSize,
          toX: i * this.cellSize + this.cellSize,
          fromY: j * this.cellSize,
          toY: j * this.cellSize + this.cellSize,
        });
      }
    }
  }

  isMovesLeft(board: Board): boolean {
    return board.some((cell) => cell.value === null);
  }

  evaluate(board: Board): number {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (
        this.board[a].value &&
        this.board[a].value === this.board[b].value &&
        this.board[a].value === this.board[c].value
      ) {
        if (this.board[a].value === "x") {
          return this.Result.HumanWin;
        } else {
          return this.Result.ComputerWin;
        }
      }
    }
    if (!board.some((cell) => cell.value === null)) {
      return this.Result.Draw;
    }
    return 0;
  }

  minimax(board: Board, depth: number, maximizingPlayer: boolean): number {
    const score = this.evaluate(board);
    if (score !== 0) {
      return score * (10 - depth); // Adjust score based on depth
    }
    if (!this.isMovesLeft(board)) {
      return 0;
    }

    if (maximizingPlayer) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i].value === null) {
          board[i].value = "o";
          bestScore = Math.max(bestScore, this.minimax(board, depth + 1, false));
          board[i].value = null;
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i].value === null) {
          board[i].value = "x";
          bestScore = Math.min(bestScore, this.minimax(board, depth + 1, true));
          board[i].value = null;
        }
      }
      return bestScore;
    }
  }

  findBestMove(board: Board): number {
    let bestMove = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i].value === null) {
        board[i].value = "o";
        const score = this.minimax(board, 0, false);
        board[i].value = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }
}
