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
	GAME_INTERVAL : 60,
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

	// Wrapper for screen context.
	var screenContext = new ScreenContext(ctx);

	// Generates bites for the snake to gobble.	
	var biteGenerator = new BiteGenerator(
		config.BLOCK_RADIUS,
		windowWidth,
		windowHeight,
		config.BITE_FLASH_INTERVAL,
		screenContext
	);

	var board, isPaused, snake, bite, score;

	function generateNextBite() {
		bite = biteGenerator.random();
		while (snake.isCovered(bite.x, bite.y)) {
			bite.clear();
			bite = biteGenerator.random();
		}
	}

	// Initialize the game.
	function initGame() {
		// Initialize the game board.
		board = new SnakeBoard(screenContext, windowWidth, windowHeight);

		// The game's pause switch.
		isPaused = true;

		// Initialize the snake.
		snake = new Snake(
			config.INIT_SNAKE_X,
			config.INIT_SNAKE_Y,
			config.BLOCK_RADIUS,
			config.INIT_SNAKE_LENGTH,
			config.BLOCK_SPACING,
			screenContext
		);
	
		// Initialize the first bite.
		generateNextBite();

		// Initialize the game score.
		score = 0;
	}
	initGame();

	// Display the game score.
	function displayScore() {
		var fontSize = 16;
		screenContext.modify({
			fillStyle: "#888",
			font: fontSize + "px Arial"
		}, function() {
			screenContext.ctx.fillText("Score: " + score, fontSize / 2, windowHeight - fontSize / 2);
		});	
	}

	// Draw the board, snake, bite, and the score.
	function draw() {
		board.draw();
		snake.draw();
		bite.draw();
		displayScore();	
	}
	draw();

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
	});
	
	// Resetting the game is equivalent to re-initializing it, with the additional step of clearing
	// the current bite.
	var resetGame = function() {
		bite.clear();
		initGame();
	}

	// Initiate the game loop.
	gameLoop = setInterval(function() {
		if (!isPaused) {
			var nextBlock = snake.move();
			// Reset the game if the snake self-collides or goes out-of-bounds.
			if (!nextBlock || board.blockIsOutOfBounds(nextBlock)) 
				resetGame();
			// Grow the snake if it happens to "gobble" a bite, and then generate a new random
			// bite.
			else if (nextBlock.x == bite.x && nextBlock.y == bite.y) {
				snake.grow();
				generateNextBite();
				score++;
			}

			draw();
		}
	}, config.GAME_INTERVAL);

});


function ScreenContext(ctx) {
	// Context.
	this.ctx = ctx;
}

ScreenContext.prototype.modify = function(mapOfAttToModVals, action) {
	// Store the current attribute values before changing them.
	var oldAttVals = {};
	for (var att in mapOfAttToModVals) {
		if (mapOfAttToModVals.hasOwnProperty(att)) {
			oldAttVals[att] = this.ctx[att];
			this.ctx[att] = mapOfAttToModVals[att];
		}
	}

	action();

	// Restore the attributes.
	for (var att in mapOfAttToModVals) {
		if (mapOfAttToModVals.hasOwnProperty(att))
			this.ctx[att] = oldAttVals[att];
	}
}

function SnakeBoard(screenContext, width, height) {
	// Screen context.
	this.screenContext = screenContext;
	// Board width;
	this.width = width;
	// Board height;
	this.height = height;
}

SnakeBoard.prototype.draw = function() {
	var self = this;
	this.screenContext.modify({
		fillStyle : "#333"
	}, function() {
		self.screenContext.ctx.fillRect(0, 0, self.width, self.height);
		self.drawMastHead();
		self.drawCopyright();
	});
}

SnakeBoard.prototype.drawMastHead = function() {
	var self = this;
	var fontSize = 48;
	this.screenContext.modify({
		fillStyle : "#555",
		font : "bold " + fontSize + "px Arial Black"
	}, function() {
		var mastHeadText = "H  a  r  d  i  k    V  a  l  a";
		var textWidth = self.screenContext.ctx.measureText(mastHeadText).width;
		self.screenContext.ctx.fillText(
			mastHeadText,
			(self.width - textWidth) / 2,
			self.height / 2 - fontSize / 2
		);
	});
}

SnakeBoard.prototype.drawCopyright = function() {
	var self = this;
	var fontSize = 14;
	this.screenContext.modify({
		fillStyle : "#555",
		font : fontSize + "px Arial"
	}, function() {
		var copyrightText = "\u00A9 Hardik Vala 2016";
		var textWidth = self.screenContext.ctx.measureText(copyrightText).width;
		self.screenContext.ctx.fillText(
			copyrightText,
			(self.width - textWidth) / 2,
			self.height - 3 * fontSize
		);
	});
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

function Snake(x, y, r, snakeLength, blockSpacing, screenContext) {
	this.r = r;
	this.blockSpacing = blockSpacing;
	this.screenContext = screenContext;

	// Direction of the snake (right, left, up, or down), defaulting to right..
	this.direction = "right";
	
	// Initialize the snake blocks, with the rightmost block at the front of the list.
	this.blocks = [];
	for (var i = snakeLength - 1; i >= 0; i--) 
		this.blocks.push(new SnakeBlock(x + blockSpacing * i, y, r, screenContext));

}

Snake.prototype.draw = function() {
	for (var i = this.blocks.length - 1; i >= 0; i--) 
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
	nextBlock = new SnakeBlock(nextXY.x, nextXY.y, this.r, this.screenContext);
	
	// Add the next block to the front.
	this.blocks.unshift(nextBlock);

	return nextBlock;
}

function GameBlock(x, y, r, screenContext) {
	// x-coordinate.
	this.x = x;
	// y-coordinate.
	this.y = y;
	// Radius.
	this.r = r;
	// Screen context.
	this.screenContext = screenContext;
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
	var self = this;
	var diameter = 2 * this.r;	
	this.screenContext.modify({
		fillStyle : "#888",
		shadowBlur : 10,
		shadowColor : "black"
	}, function() {
		self.screenContext.ctx.beginPath();
		self.screenContext.ctx.arc(self.x * diameter, self.y * diameter, self.r, 0, 2 * Math.PI);
		self.screenContext.ctx.closePath();
		self.screenContext.ctx.fill();
	});
}

function SnakeBlock(x, y, r, screenContext) {
	GameBlock.call(this, x, y, r, screenContext);
}

SnakeBlock.prototype = Object.create(GameBlock.prototype);

function BiteBlock(x, y, r, flashInterval, screenContext) {
	GameBlock.call(this, x, y, r, screenContext);
	this.flashInterval = flashInterval;

	this.flashSwitch = true;
	var self = this;
	this.flashingAnimationLoop = setInterval(function () {
		self.flashSwitch = !self.flashSwitch;
	}, this.flashInterval);
}

BiteBlock.prototype = Object.create(GameBlock.prototype);

BiteBlock.prototype.draw = function() {
	var self = this;
	var diameter = 2 * this.r;
	this.screenContext.modify({
		fillStyle : (this.flashSwitch) ? "#BBB" : "#888",
		shadowBlur : 10,
		shadowColor : "black"
	}, function() {
		self.screenContext.ctx.beginPath();
		self.screenContext.ctx.arc(self.x * diameter, self.y * diameter, self.r, 0, 2 * Math.PI);
		self.screenContext.ctx.closePath();
		self.screenContext.ctx.fill();
	
	});
}

BiteBlock.prototype.clear = function() {
	clearInterval(this.flashingAnimationLoop);
}

function BiteGenerator(r, width, height, flashInterval, screenContext) {
	// Bite radius.
	this.r = r;
	// Board width.
	this.width = width;
	// Board height.
	this.height = height;
	// Interval (ms) for the flashing animation.
	this.flashInterval = flashInterval;
	// Screen context.
	this.screenContext = screenContext;
}

BiteGenerator.prototype.random = function() {
	var diameter = 2 * this.r;
	var x = Math.round(Math.random() * (this.width - diameter) / diameter);
	var y = Math.round(Math.random() * (this.height - diameter) / diameter);
	return new BiteBlock(x, y, this.r, this.flashInterval, this.screenContext);
}

