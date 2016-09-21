$(document).ready(function () {
	var c = $("#mainCanvas")[0];
	var ctx = c.getContext("2d");
	// Stretch canvas to full screen.
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	// Draw random circle.
	ctx.beginPath();
	ctx.arc(95, 50, 40, 0, 2*Math.PI);
	ctx.stroke();
});
