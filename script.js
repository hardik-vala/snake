// Initial (x, y) of the snake.
INIT_SNAKE_X = 2;
INIT_SNAKE_Y = 2;
// Initial length of the snake in blocks.
INIT_SNAKE_LENGTH = 5;

// Amount of space in-between snake blocks as a factor of block size.
BLOCK_SPACING_FACTOR = 1.25
// Radius of a snake block in pixels.
BLOCK_RADIUS = 5;

$(document).ready(function() {
	var c = $("#mainCanvas")[0];
	var ctx = c.getContext("2d");

	// Stretch canvas to full screen.
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	var snake = initSnake(
		INIT_SNAKE_X,
		INIT_SNAKE_Y,
		BLOCK_RADIUS,
		INIT_SNAKE_LENGTH,
		BLOCK_SPACING_FACTOR
	);

	draw(snake, ctx);
});

function SnakeBlock(x, y, r) {
	this.x = x;
	this.y = y;
	this.r = r;
}

SnakeBlock.prototype.draw = function(ctx) {
	var diameter = 2 * this.r;	
	ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
	ctx.beginPath();
	ctx.arc(this.x * diameter, this.y * diameter, this.r, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
}

function initSnake(x, y, r, snakeLength, blockSpacingFactor) {
	var snake = [];
	for (var i = snakeLength - 1; i >= 0; i--) 
		snake.push(new SnakeBlock(x + blockSpacingFactor * i, y, r));
	return snake;
}

function draw(snake, ctx) {
	for (var i = 0; i < snake.length; i++) 
		snake[i].draw(ctx);
}

