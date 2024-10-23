
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 600;

function vec2(x, y)
{
	return { x: x, y: y };
}

function ballSpeedIncrease(ball)
{
	if(ball.speed.x < 0)
		ball.speed.x -= 1;
	else
		ball.speed.x += 1;
	if(ball.speed.y < 0)
		ball.speed.y -= 1;
	else
		ball.speed.y += 1;
	// increase paddle speed
	if(ball.speed.x % 2 != 0)
	{
		paddle1.speed.y += 1;
		paddle2.speed.y += 1;
	}
}

function newBall(pos, speed, radius)
{
    this.pos = pos;
    this.speed = speed;
    this.radius = radius;

    // Variables to store the ball's previous position
    let oldPosX = this.pos.x;
    let oldPosY = this.pos.y;

    this.update = function()
    {
        // Store the current position before updating
        oldPosX = this.pos.x;
        oldPosY = this.pos.y;

        // Update ball position
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;

        // Bounce off the top and bottom
        if (this.pos.y + this.radius > canvas.height || this.pos.y - this.radius < 0) {
            this.speed.y *= -1;
        }

        // Check for bouncing off the right side
        if (this.pos.x + this.radius > canvas.width) {
            this.pos = vec2(450, (Math.random() * 590) + 1); // reset in the middle
            this.speed = vec2(-5, -5); // move left after reset
            paddle1.speed = vec2(5, 5); // reset paddle speeds
            paddle2.speed = vec2(5, 5);
        }

        // Check for bouncing off the left side
        else if (this.pos.x - this.radius < 0) {
            // Ensure ball is fully out of bounds before reset
            if (this.pos.x - this.radius < paddle1.pos.x - paddle1.width) {
                this.pos = vec2(450, (Math.random() * 590) + 1); // reset in the middle
                this.speed = vec2(5, 5); // move right after reset
                paddle1.speed = vec2(5, 5); // reset paddle speeds
                paddle2.speed = vec2(5, 5);
            }
        }

        // Continuous collision detection for right paddle
        if (this.pos.x + this.radius > paddle1.pos.x && oldPosX + this.radius <= paddle1.pos.x) {
            // Check if the ball is within the paddle's vertical bounds
            if (this.pos.y + this.radius > paddle1.pos.y && this.pos.y - this.radius < paddle1.pos.y + paddle1.height) {
                this.speed.x *= -1; // bounce back
                ballSpeedIncrease(this); // increase the speed of the ball
                console.log(this.speed);
            }
        }

        // Continuous collision detection for left paddle
        if (this.pos.x - this.radius < paddle2.pos.x + paddle2.width && oldPosX - this.radius >= paddle2.pos.x + paddle2.width) {
            // Check if the ball is within the paddle's vertical bounds
            if (this.pos.y + this.radius > paddle2.pos.y && this.pos.y - this.radius < paddle2.pos.y + paddle2.height) {
                this.speed.x *= -1; // bounce back
                ballSpeedIncrease(this); // increase the speed of the ball
                console.log(this.speed);
            }
        }
    }

	this.draw = function()
	{
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = 'brown';
		ctx.fill();
		ctx.closePath();
	}
}

function newPaddle(pos, speed, width, height, up, down)
{
	this.pos = pos;
	this.speed = speed;
	this.width = width;
	this.height = height;
	this.score = 0;

	this.update = function()
	{
		// move using W and S keys
		if(keys[up] && this.pos.y > 0)
			this.pos.y -= this.speed.y;
		if(keys[down] && this.pos.y + this.height < canvas.height)
			this.pos.y += this.speed.y;
	}

	this.draw = function()
	{
		ctx.beginPath();
		ctx.rect(this.pos.x, this.pos.y, this.width, this.height);
		ctx.fillStyle = 'green';
		ctx.fill();
		ctx.closePath();
	}
}

function player2AI(ball, paddle)
{
	if(ball.speed.x > 0 && ball.pos.x > (canvas.width / 2) - canvas.width / 4)
	{
		if(ball.pos.y > paddle.pos.y + paddle.height / 2 && paddle.pos.y + paddle.height < canvas.height)
		{
			paddle.pos.y += paddle.speed.y;
		}
		else if(ball.pos.y < paddle.pos.y + paddle.height / 2 && paddle.pos.y > 0)
		{
			paddle.pos.y -= paddle.speed.y;
		}

	}
}

function player1AI(ball, paddle)
{
	if(ball.speed.x < 0 && ball.pos.x < (canvas.width / 2) + canvas.width / 4)
	{
		if(ball.pos.y > paddle.pos.y + paddle.height / 2 && paddle.pos.y + paddle.height < canvas.height)
		{
			paddle.pos.y += paddle.speed.y;
		}
		else if(ball.pos.y < paddle.pos.y + paddle.height / 2 && paddle.pos.y > 0)
		{
			paddle.pos.y -= paddle.speed.y;
		}
	}
}

function increaseScore(ball, paddle1, paddle2)
{
	if (ball.pos.x + ball.radius > canvas.width)
	{
		paddle1.score++;
		//print the score

		document.getElementById("player1score").innerHTML = paddle1.score;
	
	}
	else if (ball.pos.x - ball.radius < 0)
	{
		paddle2.score++;
		//print the score

		document.getElementById("player2score").innerHTML = paddle2.score;
	}
}

//create the ball and paddles
const ball = new newBall(vec2(450, 300), vec2(-9, 1), 10);
const paddle1 = new newPaddle(vec2(890, 300 - 37.5), vec2(5, 5), 10, 1000, 'w', 's');
const paddle2 = new newPaddle(vec2(0, 300 - 37.5), vec2(5, 5), 10, 1000, 'ArrowUp', 'ArrowDown');
const keys = [];

document.addEventListener('keydown', function(e)
{
	keys[e.key] = true;
});

document.addEventListener('keyup', function(e)
{
	keys[e.key] = false;
});

function gameUpdate() 
{
	ball.update();
	paddle1.update();
	paddle2.update();
	increaseScore(ball, paddle1, paddle2);
}

function drawCanvas()
{
	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.closePath();
}

function gameDraw() 
{
	drawCanvas();
	ball.draw();
	paddle1.draw();
	paddle2.draw();
	player2AI(ball, paddle1);
	player1AI(ball, paddle2);
}

function gameLoop() 
{
	//clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	window.requestAnimationFrame(gameLoop);

	gameUpdate();
	gameDraw();
}

gameLoop();
