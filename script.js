var config = {
	// Initial (x, y) of the snake.
	INIT_SNAKE_X : 2,
	INIT_SNAKE_Y : 2,
	// Initial length of the snake in blocks.
	INIT_SNAKE_LENGTH : 5,
	// Amount of space in-between snake blocks.
	BLOCK_SPACING : 1.25,
	// Radius of a snake block in pixels.
	BLOCK_RADIUS : 5,
	// Animation interval for the game (ms).
	GAME_INTERVAL : 100
}

$(document).ready(function() {
	var c = $("#mainCanvas")[0];
	var ctx = c.getContext("2d");

	// Stretch the canvas across the fullscreen. (For some odd reason, it must be done outside the
	// snake board.)
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	// Initialize the game board.
	var board = new SnakeBoard(ctx, window.innerWidth, window.innerHeight);

	// Initialize snake.
	var snake = new Snake(
		config.INIT_SNAKE_X,
		config.INIT_SNAKE_Y,
		config.BLOCK_RADIUS,
		config.INIT_SNAKE_LENGTH,
		config.BLOCK_SPACING
	);

	// Draw the snake.
	snake.draw(ctx);

	// Allow arrow key presses to change the direction of the snake.
	$(this).keydown(function(key) {
		switch(parseInt(key.which, 10)) {
			case 37:
				snake.goLeft();
				break;
			case 38:
				snake.goUp();
				break;
			case 39:
				snake.goRight();
				break;
			case 40:
				snake.goDown();
				break;
		}
	})
	
	// Initiate the game loop.
	gameLoop = setInterval(function () {
		board.draw();
		snake.move();
		snake.draw(ctx);
	}, config.GAME_INTERVAL);

});

function SnakeBoard(ctx, width, height) {
	this.ctx = ctx;
	this.width = width;
	this.height = height;
}

SnakeBoard.prototype.draw = function() {
	this.ctx.fillStyle = "#333"; 
	this.ctx.fillRect(0, 0, this.width, this.height);
}

function Snake(x, y, r, snakeLength, blockSpacing) {
	this.blockSpacing = blockSpacing;

	// Direction of the snake (right, left, up, or down), defaulting to right..
	this.direction = "right";
	
	// Initialize the snake blocks, with the rightmost block at the front of the list.
	this.blocks = [];
	for (var i = snakeLength - 1; i >= 0; i--) 
		this.blocks.push(new SnakeBlock(x + blockSpacing * i, y, r));

}

Snake.prototype.draw = function(ctx) {
	for (var i = 0; i < this.blocks.length; i++) 
		this.blocks[i].draw(ctx);
}

Snake.prototype.goRight = function() {
	if (this.direction != "left")
		this.direction = "right";
}

Snake.prototype.goLeft = function() {
	if (this.direction != "right")
		this.direction = "left";
}

Snake.prototype.goUp = function() {
	if (this.direction != "down")
		this.direction = "up";
}

Snake.prototype.goDown = function() {
	if (this.direction != "up")
		this.direction = "down";
}

Snake.prototype.move = function() {
	// (x, y)-coordinates of the next block.
	var nextX = this.blocks[0].x, nextY = this.blocks[0].y;

	// Update the coordinates according to the current direction.
	if (this.direction == "right")
		nextX += this.blockSpacing;
	else if (this.direction == "left")
		nextX -= this.blockSpacing;
	else if (this.direction == "up")
		nextY -= this.blockSpacing;
	else if (this.direction == "down")
		nextY += this.blockSpacing;

	// Pop the last block and set its (x, y)-coordinates to the next ones. 
	var tail = this.blocks.pop();
	tail.x = nextX;
	tail.y = nextY;

	// Add the updated last block as the next one.
	this.blocks.unshift(tail);
}

function SnakeBlock(x, y, r) {
	// x-coordinate.
	this.x = x;
	// y-coordinate.
	this.y = y;
	// Radius.
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

