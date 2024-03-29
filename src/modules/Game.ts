import {WINNING_COMBINATIONS} from "./utils";

type Board = Cell[];

type Cell = {
  value: "x" | "o" | null;
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
};

type Result = {
  HumanWin: -1;
  Draw: 0;
  ComputerWin: 1;
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

  public currentPlayer: "x" | "o" = "x";

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
    this.addClickEvent();
    this.generateBoard();
  }

  update() {}

  draw() {
    this.drawBackground();
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
}
