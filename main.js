// Canvas variables
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

// Ball variables
let x = canvas.width / 2;
let y = canvas.height - 30;
const ballRadius = 10;
let dx = 3;
let dy = -3;

// Paddle variables
const height = 10;
const width = 75;
let paddleX = (canvas.width - width) / 2;
const paddleDx = 7;

// Brick variables
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Keyboard variables
let rightPressed = false;
let leftPressed = false;

let gameOver = false;
let score = 0;
const scores = [];
let highestScore = 0;

const brickHit = [0, 0];

const button = document.getElementById("runButton");
button.focus();

// Event listeners
button.addEventListener("click", function () {
  if (gameOver === false) {
    loop();
    this.disabled = true;
    resetGame();
  } else {
    resetGame();
    loop();
    this.disabled = true;
  }
});

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);

// Keyboard functions
function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.width / 2;
  }
}

function touchMoveHandler(e) {
  const relativeX = e.touches[0].clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.width / 2;
  }
}

// helper functions

// function to generate random number
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to generate random color
function randomHWB() {
  return `hwb(${random(0, 360)} ${random(0, 50)}% ${random(0, 10)}%)`;
}

function RectCircleColliding(circle, rect) {
  let distX = Math.abs(circle.x - rect.x - rect.width / 2);
  let distY = Math.abs(circle.y - rect.y - rect.height / 2);

  if (distX > rect.width / 2 + circle.ballRadius) {
    return false;
  }
  if (distY > rect.height / 2 + circle.ballRadius) {
    return false;
  }

  if (distX <= rect.width / 2) {
    return true;
  }
  if (distY <= rect.height / 2) {
    return true;
  }

  let dx = distX - rect.width / 2;
  let dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= circle.ballRadius * circle.ballRadius;
}

// Classes

class Ball {
  constructor(x, y, dx, dy, ballRadius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.ballRadius = ballRadius;
    this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  update() {
    if (
      this.x + this.dx >= canvas.width - this.ballRadius ||
      this.x + this.dx <= this.ballRadius
    ) {
      this.dx = -this.dx;
    }

    if (this.y + this.dy <= this.ballRadius) {
      this.dy = -this.dy;
    } else if (RectCircleColliding(this, paddle)) {
      this.dy = -this.dy;
    } else if (this.y + this.dy >= canvas.height - this.ballRadius) {
      setGameOver();
    }

    this.x += this.dx;
    this.y += this.dy;
  }
  collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const brick = bricks[c][r];
        if (brick.status === 1) {
          let ballRelX = this.x + this.dx - brick.x;
          let ballRelY = this.y + this.dy - brick.y;
          if (
            ballRelX > -this.ballRadius &&
            ballRelX < brickWidth + this.ballRadius &&
            ballRelY > -this.ballRadius &&
            ballRelY < brickHeight + this.ballRadius
          ) {
            if (
              ballRelX < this.ballRadius ||
              ballRelX > brickWidth - this.ballRadius
            ) {
              this.dx = -this.dx; // hit the brick on the x-axis
            }
            if (
              ballRelY < this.ballRadius ||
              ballRelY > brickHeight - this.ballRadius
            ) {
              this.dy = -this.dy; // hit the brick on the y-axis
            }
            brick.status = 0;
            score += 100;
            if (score === brickRowCount * brickColumnCount * 100) {
              setGameOver();
            }
          }
        }
      }
    }
  }
}

class Paddle {
  constructor(height, width, x, y, dx, color) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update() {
    if (rightPressed) {
      this.x = Math.min(this.x + this.dx, canvas.width - this.width);
    } else if (leftPressed) {
      this.x = Math.max(this.x - this.dx, 0);
    }
  }
}

class Brick {
  constructor(x, y, status, color) {
    this.x = x;
    this.y = y;
    this.status = status;
    this.color = color;
  }
  draw() {
    if (this.status === 1) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, brickWidth, brickHeight);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    }
  }
}

// Create ball
const ball = new Ball(x, y, dx, dy, ballRadius, randomHWB());

// Create paddle
const paddle = new Paddle(
  height,
  width,
  paddleX,
  canvas.height - height,
  paddleDx,
  randomHWB()
);

// Create bricks
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
    if (c === 3 && (r === 0 || r === 1)) {
      bricks[c][r] = new Brick(brickX, brickY, 1, randomHWB);
    } else {
      bricks[c][r] = new Brick(brickX, brickY, 1, randomHWB);
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(`Score: ${score}`, canvas.width - 50, 20);
}

function drawHighestScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText(`Highest Score: ${highestScore}`, 10, 20);
}

function drawGameOver() {
  ctx.font = "900 60px Arial";
  ctx.fillStyle = "rgb(255, 40, 64)";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
}

function drawWin() {
  ctx.font = "900 60px Arial";
  ctx.fillStyle = "rgb(71, 255, 105)";
  ctx.textAlign = "center";
  ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
}

function setGameOver() {
  gameOver = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].draw();
    }
  }
  score === brickRowCount * brickColumnCount * 100 ? drawWin() : drawGameOver();
  scores.push(score);
  highestScore = Math.max(...scores);
  button.disabled = false;
  button.textContent = "Play Again";
  ball.draw();
  paddle.draw();

  drawScore();
  drawHighestScore();
  button.focus();

  score = 0;
}

function resetGame() {
  gameOver = false;
  score = 0;
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 30;
  ball.dx = 3;
  ball.dy = -3;
  paddle.x = (canvas.width - paddle.width) / 2;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }
}

function loop() {
  if (!gameOver) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgb(15 15 15 / 40%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ball.draw();
    paddle.draw();

    drawScore();
    drawHighestScore();

    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r].draw();
      }
    }

    ball.collisionDetection();
    ball.update();
    paddle.update();

    requestAnimationFrame(loop);
  }
}

ball.draw();
paddle.draw();
drawScore();
drawHighestScore();
for (let c = 0; c < brickColumnCount; c++) {
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r].draw();
  }
}
