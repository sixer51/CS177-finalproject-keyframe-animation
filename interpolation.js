var Interpolation = function(canvasId, active = false)
{
	// Set up all the data related to drawing the curve
	this.cId = canvasId;
	this.dCanvas = document.getElementById(this.cId);
	this.ctx = this.dCanvas.getContext('2d');
	this.dCanvas.addEventListener('resize', this.computeCanvasSize());
	this.computeCanvasSize();

	// Setup all the data related to the actual curve.
	this.nodes = new Array();
	this.showControlPolygon = true;
	this.showTangents = true;

	// Assumes a equal parametric split strategy
	this.numSegments = 16;

	// Global tension parameter
	this.tension = 0.5;

	// frame and value
	this.frame = 30.5;
	this.value = 330.5;

	// add origin node
	this.addNode(this.frame, this.value);

	// this curve active in canvas
	this.active = active;

	// interpolation method
	this.method = "linear";

	// Setup event listeners
	this.cvState = CVSTATE.Idle;
	this.activeNode = null;

	// closure
	var that = this;

	// Event listeners
	this.dCanvas.addEventListener('mousedown', function(event) {
        that.mousePress(event);
    });

	this.dCanvas.addEventListener('mousemove', function(event) {
		that.mouseMove(event);
	});

	this.dCanvas.addEventListener('mouseup', function(event) {
		that.mouseRelease(event);
	});

	this.dCanvas.addEventListener('mouseleave', function(event) {
		that.mouseRelease(event);
	});
}

Interpolation.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

Interpolation.prototype.setShowTangents = function(bShow)
{
	this.showTangents = bShow;
}

Interpolation.prototype.setTension = function(val)
{
	this.tension = val;
}

Interpolation.prototype.setNumSegments = function(val)
{
	this.numSegments = val;
}

Interpolation.prototype.setFrame = function(f)
{
	this.frame = f;
}

Interpolation.prototype.setValue = function(value)
{
	this.value = value;
}

Interpolation.prototype.mousePress = function(event)
{
	if (!this.active) return;
	if (event.button == 0) {
		this.activeNode = null;
		var pos = getMousePos(event);

		// Try to find a node below the mouse
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].isInside(pos.x,pos.y)) {
				this.activeNode = this.nodes[i];
				break;
			}
		}
	}

	// No node selected: add a new node
	if (this.activeNode == null) {
		this.addNode(pos.x,pos.y);
		this.activeNode = this.nodes[this.nodes.length-1];
	}

	this.cvState = CVSTATE.SelectPoint;
	event.preventDefault();
}

Interpolation.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
		this.nodes.sort((a, b) => (a.x > b.x) ? 1 : -1);
	} else {
		// No button pressed. Ignore movement.
	}
}

Interpolation.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

Interpolation.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

Interpolation.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					  this.nodes[i+1].x, this.nodes[i+1].y);
}

Interpolation.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

Interpolation.prototype.drawcurve = function()
{
	for (var i=1; i<this.nodes.length; i++){

		var t = this.tension;
		var x_last = this.nodes[i-1].x;
		var y_last = this.nodes[i-1].y;
		var x_this = this.nodes[i].x;
		var y_this = this.nodes[i].y;
		var x0 = x_last;
		var y0 = y_last;
		var x1 = 0;
		var y1 = 0;

		if(this.nodes[i].method == "constant"){
			setColors(this.ctx,'black');
			drawLine(this.ctx, x0, y0, x_this, y0);
			drawLine(this.ctx, x_this, y0, x_this, y_this);
			x0 = x_this;
			y0 = y_this;
			continue;
		}
		else if(this.nodes[i].method == "linear"){
			setColors(this.ctx,'black');
			drawLine(this.ctx, x0, y0, x_this, y_this);
			x0 = x_this;
			y0 = y_this;
			continue;
		}

		for (var u = 1/this.numSegments; u <= 1; u = u+1/this.numSegments){
			x1 = x_last + u*(x_this - x_last);
			y1 = 330.5 - this.getValue(x1);

			setColors(this.ctx,'black');
			drawLine(this.ctx, x0, y0, x1, y1);
			[x0, y0] = [x1, y1];
		}
	}

	// end path
	setColors(this.ctx,'black');
	drawLine(this.ctx, x0, y0, this.dCanvas.width, y0);

}

Interpolation.prototype.drawTask5 = function()
{
	// clear the rect
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

    if (this.showControlPolygon) {
		// Connect nodes with a line
        // setColors(this.ctx,'rgb(10,70,160)');
        // for (var i = 1; i < this.nodes.length; i++) {
        //     drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        // }
		// Draw nodes
		setColors(this.ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(this.ctx);
		}
    }

	// We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 2) return;

	// Draw the curve
	this.drawcurve();

	// if(this.showTangents)
	// 	this.drawTangents();
}


// Add a control point to the curve
Interpolation.prototype.addNode = function(x, y=330.5-this.value)
{	
	for (var i=0; i<this.nodes.length; i++){
		if(x == this.nodes[i].x){
			this.nodes[i].setPos(x, y);
			return;
		}
	}

	this.nodes.push(new Node(x,y, this.method));
	this.nodes.sort((a, b) => (a.x > b.x) ? 1 : -1);
}

Interpolation.prototype.linearInterpolation = function(last, next, t)
{
	var y = (1-t)*last.y + t*next.y;
	return y;
}

Interpolation.prototype.CatmullRom = function(p0, p1, p2, p3, t) {
	var v0 = (p2.y - p0.y) * this.tension;
	var v1 = (p3.y - p1.y) * this.tension;
	var t2 = t * t;
	var t3 = t * t2;
	return (2 * p1.y - 2 * p2.y + v0 + v1) * t3 + (- 3 * p1.y + 3 * p2.y - 2 * v0 - v1) * t2 + v0 * t + p1.y;
}

Interpolation.prototype.choosemethod = function(method, last2, last, next, next2, t)
{
	if (method == "linear")
		return this.linearInterpolation(last, next, t);
	else if (method == "constant")
	{
		if(t==1) return next.y;
		return last.y;
	}
	else if (method == "CatmullRom")
		return this.CatmullRom(last2, last, next, next2, t);
}

// Get y value for x with linear interpolation
Interpolation.prototype.getValue = function(x)
{
	var y = 330.5;

	var end_node = this.nodes[this.nodes.length-1];
	if (x > end_node.x)
		return 330.5 - end_node.y;

	for(var i = 1; i<this.nodes.length; i++){
		if(this.nodes[i-1].x <= x && this.nodes[i].x >= x){
			// x is in this interval
			// interpolate with next node interpolation method
			var last = this.nodes[i-1];
			var next = this.nodes[i];
			if(i>1) var last2 = this.nodes[i-2];
			else var last2 = this.nodes[i-1];
			if(i<this.nodes.length-1) var next2 = this.nodes[i+1];
			else var next2 = this.nodes[i];

			var t = (x - last.x)/(next.x - last.x);
			y = this.choosemethod(next.method, last2, last, next, next2, t);
			//console.log("get value",t, y);
		}
	}

	return 330.5 - y;
}
