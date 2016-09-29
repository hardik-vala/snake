var config = {
	// Initial (x, y) of the snake.
	INIT_SNAKE_X : 2,
	INIT_SNAKE_Y : 2,
	// Initial length of the snake in blocks.
	INIT_SNAKE_LENGTH : 5,
	// Amount of space in-between snake blocks.
	BLOCK_SPACING : 1,
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

	var board, isPaused, snake;
	// Initialize the game.
	function initGame() {
		// Initialize the game board.
		board = new SnakeBoard(ctx, window.innerWidth, window.innerHeight);

		// The game's pause switch.
		isPaused = true;

		// Initialize the snake.
		snake = new Snake(
			config.INIT_SNAKE_X,
			config.INIT_SNAKE_Y,
			config.BLOCK_RADIUS,
			config.INIT_SNAKE_LENGTH,
			config.BLOCK_SPACING
		);
	}
	initGame();

	// Draw the snake.
	snake.draw(ctx);
	
	// Allow arrow key presses to change the direction of the snake and consequently unpause the game
	// if its paused. Pressing the "p" key toggles the game pause.
	$(this).keydown(function(key) {
		switch(parseInt(key.which, 10)) {
			// Left arrow.
			case 37:
				if (snake.goLeft() && isPaused) isPaused = false;
				break;
			// Up arrow.
			case 38:
				if (snake.goUp() && isPaused) isPaused = false;
				break;
			// Right arrow.
			case 39:
				if (snake.goRight() && isPaused) isPaused = false;
				break;
			// Down arrow.
			case 40:
				if (snake.goDown() && isPaused) isPaused = false;
				break;
			// "p".
			case 80:
				isPaused = !isPaused;	
				break;
		}
	})
	
	// Resetting the game is equivalent to re-initializing it.
	var resetGame = initGame;

	// Initiate the game loop.
	gameLoop = setInterval(function () {
		if (!isPaused) {
			board.draw();
			var nextBlock = snake.move();
			// Reset the game if the snake goes out-of-bounds.
			if (board.snakeBlockIsOutOfBounds(nextBlock)) 
				resetGame();
			snake.draw(ctx);
		}
	}, config.GAME_INTERVAL);

});

function SnakeBoard(ctx, width, height) {
	// Context.
	this.ctx = ctx;
	// Board width;
	this.width = width;
	// Board height;
	this.height = height;
}

SnakeBoard.prototype.draw = function() {
	this.ctx.fillStyle = "#333"; 
	this.ctx.fillRect(0, 0, this.width, this.height);
}

SnakeBoard.prototype.isOutOfBounds = function(x, y) {
	return (x < 0 || y < 0 || x > this.width || y > this.height);
}

SnakeBoard.prototype.snakeBlockIsOutOfBounds = function(block) {
	return (this.isOutOfBounds(block.getPixelX() - block.r, block.getPixelY())
			|| this.isOutOfBounds(block.getPixelX(), block.getPixelY() - block.r)
			|| this.isOutOfBounds(block.getPixelX() + block.r, block.getPixelY())
			|| this.isOutOfBounds(block.getPixelX(), block.getPixelY() + block.r)
	);
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

	return this.direction == "right";
}

Snake.prototype.goLeft = function() {
	if (this.direction != "right")
		this.direction = "left";

	return this.direction == "left";
}

Snake.prototype.goUp = function() {
	if (this.direction != "down")
		this.direction = "up";

	return this.direction == "up";
}

Snake.prototype.goDown = function() {
	if (this.direction != "up")
		this.direction = "down";

	return this.direction == "down";
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

	return tail;
}

function SnakeBlock(x, y, r) {
	// x-coordinate.
	this.x = x;
	// y-coordinate.
	this.y = y;
	// Radius.
	this.r = r;
}

SnakeBlock.prototype.getPixelX = function() {
	// THe x-coordinate multipled by the block diameter.
	return this.x * 2 * this.r;
}

SnakeBlock.prototype.getPixelY = function() {
	// THe y-coordinate multipled by the block diameter.
	return this.y * 2 * this.r;
}

SnakeBlock.prototype.draw = function(ctx) {
	var diameter = 2 * this.r;	
	ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
	ctx.beginPath();
	ctx.arc(this.x * diameter, this.y * diameter, this.r, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
}

