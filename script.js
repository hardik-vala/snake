$(document).ready(function () {
	c = document.getElementById("mainCanvas");
	var ctx = c.getContext("2d");
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;

	ctx.beginPath();
	ctx.arc(95, 50, 40, 0, 2*Math.PI);
	ctx.stroke();
});
