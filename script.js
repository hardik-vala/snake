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
	GAME_INTERVAL : 65,
	// Interval for the flashing animation of bites (ms).
	BITE_FLASH_INTERVAL : 500
}

$(document).ready(function() {
	var c = $("#mainCanvas")[0];
	var ctx = c.getContext("2d");

	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;

	// Stretch the canvas across the fullscreen. (For some odd reason, it must be done outside the
	// snake board.)
	ctx.canvas.width = windowWidth;
	ctx.canvas.height = windowHeight;

	// Generates bites for the snake to gobble.	
	var biteGenerator = new BiteGenerator(
		config.BLOCK_RADIUS,
		windowWidth,
		windowHeight,
		config.BITE_FLASH_INTERVAL,
		ctx
	);

	var board, isPaused, snake, bite, score;
	// Initialize the game.
	function initGame() {
		// Initialize the game board.
		board = new SnakeBoard(ctx, windowWidth, windowHeight);

		// The game's pause switch.
		isPaused = true;

		// Initialize the snake.
		snake = new Snake(
			config.INIT_SNAKE_X,
			config.INIT_SNAKE_Y,
			config.BLOCK_RADIUS,
			config.INIT_SNAKE_LENGTH,
			config.BLOCK_SPACING,
			ctx
		);
	
		// Initialize the first bite.
		bite = biteGenerator.random();

		// Initialize the game score.
		score = 0;
	}
	initGame();

	// Draw the board, snake, and the first bite.
	board.draw();
	snake.draw();
	bite.draw();
	
	// Display the game score.
	function displayScore() {
		ctx.fillStyle = "#888";

		var oldFont = ctx.font;
		var fontSize = 16;
		ctx.font = fontSize + "px Arial";
		ctx.shadowBlur = 0;
		ctx.fillText("Score: " + score, fontSize / 2, windowHeight - fontSize / 2);

		ctx.font = oldFont;
	}
	displayScore();	

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
	
	// Resetting the game is equivalent to re-initializing it, with the additional step of clearing
	// the current bite.
	var resetGame = function() {
		bite.clear();
		initGame();
	}

	// Initiate the game loop.
	gameLoop = setInterval(function () {
		if (!isPaused) {
			board.draw();
			displayScore();

			var nextBlock = snake.move();
			// Reset the game if the snake self-collides or goes out-of-bounds.
			if (!nextBlock || board.blockIsOutOfBounds(nextBlock)) 
				resetGame();
			// Grow the snake if it happens to "gobble" a bite, and then generate a new random
			// bite.
			else if (nextBlock.x == bite.x && nextBlock.y == bite.y) {
				snake.grow();
				bite.clear();
				bite = biteGenerator.random();
				score++;
			}

			snake.draw();
			bite.draw();
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

	this.drawMastHead();
}

SnakeBoard.prototype.drawMastHead = function() {	
	this.ctx.fillStyle = "#555";

	var oldFont = this.ctx.font;
	var fontSize = 48;
	this.ctx.font = "bold " + fontSize + "px Arial Black";
	
	var mastHeadText = "H  a  r  d  i  k    V  a  l  a";
	var textWidth = this.ctx.measureText(mastHeadText).width;
	this.ctx.fillText(mastHeadText, (this.width - textWidth) / 2, this.height / 2 - fontSize / 2);

	// Restore font.
	this.ctx.font = oldFont;
}

SnakeBoard.prototype.isOutOfBounds = function(x, y) {
	return (x < 0 || y < 0 || x > this.width || y > this.height);
}

SnakeBoard.prototype.blockIsOutOfBounds = function(block) {
	return (this.isOutOfBounds(block.getPixelX() - block.r, block.getPixelY())
			|| this.isOutOfBounds(block.getPixelX(), block.getPixelY() - block.r)
			|| this.isOutOfBounds(block.getPixelX() + block.r, block.getPixelY())
			|| this.isOutOfBounds(block.getPixelX(), block.getPixelY() + block.r)
	);
}

function Snake(x, y, r, snakeLength, blockSpacing, ctx) {
	this.r = r;
	this.blockSpacing = blockSpacing;
	this.ctx = ctx;

	// Direction of the snake (right, left, up, or down), defaulting to right..
	this.direction = "right";
	
	// Initialize the snake blocks, with the rightmost block at the front of the list.
	this.blocks = [];
	for (var i = snakeLength - 1; i >= 0; i--) 
		this.blocks.push(new SnakeBlock(x + blockSpacing * i, y, r, ctx));

}

Snake.prototype.draw = function() {
	for (var i = 0; i < this.blocks.length; i++) 
		this.blocks[i].draw();
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

Snake.prototype.getNextXY = function() {
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

	return {x: nextX, y: nextY};
}

Snake.prototype.isCovered = function(x, y) {
	for (var i = 0; i < this.blocks.length; i++) {
		if (this.blocks[i].x == x && this.blocks[i].y == y)
			return true;
	}

	return false;
}

Snake.prototype.move = function() {
	nextXY = this.getNextXY();

	// Self-collision.
	if (this.isCovered(nextXY.x, nextXY.y))
		return null;

	// Pop the last block and set its (x, y)-coordinates to the next ones. 
	var tail = this.blocks.pop();
	tail.x = nextXY.x;
	tail.y = nextXY.y;

	// Add the updated last block as the next one.
	this.blocks.unshift(tail);

	return tail;
}

Snake.prototype.grow = function() {
	nextXY = this.getNextXY();
	nextBlock = new SnakeBlock(nextXY.x, nextXY.y, this.r, this.ctx);
	
	// Add the next block to the front.
	this.blocks.unshift(nextBlock);

	return nextBlock;
}

function GameBlock(x, y, r, ctx) {
	// x-coordinate.
	this.x = x;
	// y-coordinate.
	this.y = y;
	// Radius.
	this.r = r;
	// Context.
	this.ctx = ctx;
}

GameBlock.prototype.getPixelX = function() {
	// THe x-coordinate multipled by the block diameter.
	return this.x * 2 * this.r;
}

GameBlock.prototype.getPixelY = function() {
	// THe y-coordinate multipled by the block diameter.
	return this.y * 2 * this.r;
}

GameBlock.prototype.draw = function() {
	var diameter = 2 * this.r;	
	this.ctx.fillStyle = "#888";
	this.ctx.shadowBlur = 10;
	this.ctx.shadowColor = "black";
	this.ctx.beginPath();
	this.ctx.arc(this.x * diameter, this.y * diameter, this.r, 0, 2 * Math.PI);
	this.ctx.closePath();
	this.ctx.fill();
}

function SnakeBlock(x, y, r, ctx) {
	GameBlock.call(this, x, y, r, ctx);
}

SnakeBlock.prototype = Object.create(GameBlock.prototype);

function BiteBlock(x, y, r, flashInterval, ctx) {
	GameBlock.call(this, x, y, r, ctx);
	this.flashInterval = flashInterval;

	this.flashSwitch = true;
	var self = this;
	this.flashingAnimationLoop = setInterval(function () {
		self.flashSwitch = !self.flashSwitch;
	}, this.flashInterval);
}

BiteBlock.prototype = Object.create(GameBlock.prototype);

BiteBlock.prototype.draw = function() {
	var diameter = 2 * this.r;

	if (this.flashSwitch)	
		this.ctx.fillStyle = "#BBB";
	else
		this.ctx.fillStyle = "#888";

	this.ctx.shadowBlur = 10;
	this.ctx.shadowColor = "black";
	this.ctx.beginPath();
	this.ctx.arc(this.x * diameter, this.y * diameter, this.r, 0, 2 * Math.PI);
	this.ctx.closePath();
	this.ctx.fill();
}

BiteBlock.prototype.clear = function() {
	clearInterval(this.flashingAnimationLoop);
}

function BiteGenerator(r, width, height, flashInterval, ctx) {
	// Bite radius.
	this.r = r;
	// Board width.
	this.width = width;
	// Board height.
	this.height = height;
	// Interval (ms) for the flashing animation.
	this.flashInterval = flashInterval;
	// Context.
	this.ctx = ctx;
}

BiteGenerator.prototype.random = function () {
	var diameter = 2 * this.r;
	var x = Math.round(Math.random() * (this.width - diameter) / diameter);
	var y = Math.round(Math.random() * (this.height - diameter) / diameter);
	return new BiteBlock(x, y, this.r, this.flashInterval, this.ctx);
}

