//move the paddle vertically

const paddleHeight = 75;
const paddleWidth = 10;
let paddleY = (canvas.height - paddleHeight) / 2;
let upPressed = false;
let downPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) 
{
	if (e.key === 'Up' || e.key === 'ArrowUp')
		upPressed = true;
	else if (e.key === 'Down' || e.key === 'ArrowDown')
		downPressed = true;

}

function keyUpHandler(e) 
{
	if (e.key === 'Up' || e.key === 'ArrowUp') 
		upPressed = false;
	else if (e.key === 'Down' || e.key === 'ArrowDown')
		downPressed = false;
}

function drawPaddle() {
	ctx.beginPath();
	ctx.rect(canvas.width - paddleWidth, paddleY, paddleWidth, paddleHeight);
	ctx.fillStyle = 'green';
	ctx.fill();
	ctx.closePath();
}

function draw() {
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle();
  if (upPressed && paddleY < canvas.width - paddleWidth && paddleY > 0) {
	paddleY -= 5;
  } else if (downPressed && paddleY > 0 && paddleY < canvas.height - paddleHeight) {
	paddleY += 5;
  }
}

setInterval(draw, 10);