// ─── 상수 ───────────────────────────────────────────────
const COLS = 10;
const ROWS = 20;
const DROP_INTERVAL = 800;
const SPAWN_X = 3;
const SPAWN_Y = 0;

// 한 번에 삭제한 줄 수별 점수 (인덱스 = 삭제 줄 수)
const LINE_SCORES = [0, 100, 300, 500, 800];

const PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    shape: [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  T: {
    shape: [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  S: {
    shape: [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  Z: {
    shape: [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  J: {
    shape: [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  L: {
    shape: [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
};

const PIECE_TYPES = Object.keys(PIECES);

// ─── DOM ────────────────────────────────────────────────
const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const gameOverElement = document.getElementById("game-over");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

// ─── 게임 상태 ──────────────────────────────────────────
let score = 0;
let matrix = createEmptyBoard();
let currentPiece = null;
let dropTimer = null;
let isPlaying = false;
let isGameOver = false;

// ─── 보드 유틸 ──────────────────────────────────────────

function createEmptyBoard() {
  return Array.from({ length: ROWS }, function () {
    return Array(COLS).fill(null);
  });
}

function copyMatrix(source) {
  return source.map(function (row) {
    return row.slice();
  });
}

function isRowFull(row) {
  return row.every(function (cell) {
    return cell !== null;
  });
}

// ─── 블록 생성 ──────────────────────────────────────────

function createPiece(type) {
  let pieceType = type || PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];

  if (!PIECES[pieceType]) {
    pieceType = PIECE_TYPES[0];
  }

  const pieceData = PIECES[pieceType];

  return {
    type: pieceType,
    shape: pieceData.shape.map(function (row) {
      return row.slice();
    }),
    x: SPAWN_X,
    y: SPAWN_Y,
  };
}

function rotateShape(shape) {
  const size = shape.length;
  const rotated = [];

  for (let col = 0; col < size; col++) {
    const newRow = [];
    for (let row = size - 1; row >= 0; row--) {
      newRow.push(shape[row][col]);
    }
    rotated.push(newRow);
  }

  return rotated;
}

// ─── 충돌 판정 ──────────────────────────────────────────

function canMove(piece, dx, dy, board) {
  for (let rowIndex = 0; rowIndex < piece.shape.length; rowIndex++) {
    for (let colIndex = 0; colIndex < piece.shape[rowIndex].length; colIndex++) {
      if (!piece.shape[rowIndex][colIndex]) {
        continue;
      }

      const nextX = piece.x + colIndex + dx;
      const nextY = piece.y + rowIndex + dy;

      if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
        return false;
      }

      if (nextY >= 0 && board[nextY][nextX]) {
        return false;
      }
    }
  }

  return true;
}

function isActiveGame() {
  return isPlaying && currentPiece !== null;
}

// ─── 보드 반영 ──────────────────────────────────────────

function drawPiece(board, piece) {
  piece.shape.forEach(function (row, rowIndex) {
    row.forEach(function (cell, colIndex) {
      if (!cell) {
        return;
      }

      const boardY = piece.y + rowIndex;
      const boardX = piece.x + colIndex;

      if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
        board[boardY][boardX] = piece.type;
      }
    });
  });
}

function lockPiece(piece, board) {
  drawPiece(board, piece);
}

function clearLines(board) {
  let linesCleared = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (!isRowFull(board[row])) {
      continue;
    }

    board.splice(row, 1);
    board.unshift(Array(COLS).fill(null));
    linesCleared += 1;
    row += 1;
  }

  return linesCleared;
}

// ─── 점수 ───────────────────────────────────────────────

function addScore(linesCleared) {
  if (linesCleared <= 0) {
    return;
  }

  const scoreIndex = Math.min(linesCleared, LINE_SCORES.length - 1);
  score += LINE_SCORES[scoreIndex];
  updateScore();
}

function updateScore() {
  scoreElement.textContent = score;
}

// ─── 플레이어 조작 ──────────────────────────────────────

function tryRotate(piece) {
  const originalShape = piece.shape.map(function (row) {
    return row.slice();
  });

  piece.shape = rotateShape(piece.shape);

  if (!canMove(piece, 0, 0, matrix)) {
    piece.shape = originalShape;
    return false;
  }

  return true;
}

function tryMovePiece(dx, dy) {
  if (!isActiveGame()) {
    return false;
  }

  if (!canMove(currentPiece, dx, dy, matrix)) {
    return false;
  }

  currentPiece.x += dx;
  currentPiece.y += dy;
  render();
  return true;
}

function tryMoveDown() {
  if (!canMove(currentPiece, 0, 1, matrix)) {
    lockAndSpawn();
    return false;
  }

  currentPiece.y += 1;
  render();
  return true;
}

function softDrop() {
  if (!isActiveGame()) {
    return;
  }

  tryMoveDown();
}

function hardDrop() {
  if (!isActiveGame()) {
    return;
  }

  while (canMove(currentPiece, 0, 1, matrix)) {
    currentPiece.y += 1;
  }

  lockAndSpawn();
}

// ─── 게임 흐름 ──────────────────────────────────────────

function spawnNextPiece() {
  currentPiece = createPiece();

  if (!canMove(currentPiece, 0, 0, matrix)) {
    setGameOver();
  }
}

function lockAndSpawn() {
  if (!currentPiece) {
    return;
  }

  lockPiece(currentPiece, matrix);

  const linesCleared = clearLines(matrix);
  addScore(linesCleared);

  spawnNextPiece();
  render();
}

function setGameOver() {
  isPlaying = false;
  isGameOver = true;
  currentPiece = null;
  stopDropTimer();

  if (gameOverElement) {
    gameOverElement.hidden = false;
  }
}

function hideGameOver() {
  isGameOver = false;

  if (gameOverElement) {
    gameOverElement.hidden = true;
  }
}

function stopDropTimer() {
  if (dropTimer) {
    clearInterval(dropTimer);
    dropTimer = null;
  }
}

function startDropTimer() {
  stopDropTimer();
  dropTimer = setInterval(gameTick, DROP_INTERVAL);
}

function gameTick() {
  if (!isActiveGame()) {
    return;
  }

  tryMoveDown();
}

function initGame() {
  stopDropTimer();
  hideGameOver();

  score = 0;
  updateScore();
  matrix = createEmptyBoard();
  isPlaying = true;
  currentPiece = createPiece();

  render();
  startDropTimer();
}

// ─── 렌더링 ─────────────────────────────────────────────

function renderBoard(board) {
  boardElement.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const pieceType = board[row][col];
      if (pieceType) {
        cell.classList.add("filled", "piece-" + pieceType.toLowerCase());
      }

      boardElement.appendChild(cell);
    }
  }
}

function render() {
  const displayBoard = copyMatrix(matrix);

  if (currentPiece) {
    drawPiece(displayBoard, currentPiece);
  }

  renderBoard(displayBoard);
}

// ─── 입력 ───────────────────────────────────────────────

function handleKeyDown(event) {
  if (!isActiveGame()) {
    return;
  }

  switch (event.code) {
    case "ArrowLeft":
      event.preventDefault();
      tryMovePiece(-1, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      tryMovePiece(1, 0);
      break;
    case "ArrowDown":
      event.preventDefault();
      softDrop();
      break;
    case "ArrowUp":
      event.preventDefault();
      if (tryRotate(currentPiece)) {
        render();
      }
      break;
    case "Space":
      event.preventDefault();
      hardDrop();
      break;
    default:
      break;
  }
}

function handleRestart() {
  initGame();
}

// ─── 초기화 ─────────────────────────────────────────────

startBtn.addEventListener("click", handleRestart);
restartBtn.addEventListener("click", handleRestart);
document.addEventListener("keydown", handleKeyDown);

initGame();
