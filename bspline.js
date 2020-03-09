var BSpline = function(canvasId)
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

BSpline.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

BSpline.prototype.setNumSegments = function(val)
{
	this.numSegments = val;
}

BSpline.prototype.mousePress = function(event)
{
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

BSpline.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
	} else {
		// No button pressed. Ignore movement.
	}
}

BSpline.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

BSpline.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

BSpline.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					  this.nodes[i+1].x, this.nodes[i+1].y);
}

BSpline.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

BSpline.prototype.draw = function()
{

// ################ Edit your code below
	// TODO: Task 6: Draw the B-Spline curve (see the assignment for more details)
	// Hint: You can base this off of your Catmull-Rom code
	
	for (var i=2; i<this.nodes.length-1; i++){
		var x1 = 0;
		var y1 = 0;

		var u = 0;
		var k1 = 1/6 * Math.pow(1-u, 3);
		var k2 = 1/6 *(4 - 6*u*u + 3*Math.pow(u, 3));
		var k3 = 1/6 * (1 + 3*u + 3*u*u - 3*Math.pow(u, 3));
		var k4 = 1/6 * Math.pow(u, 3);
		var x0 = k1*this.nodes[i-2].x + k2*this.nodes[i-1].x + k3*this.nodes[i].x + k4*this.nodes[i+1].x;
		var y0 = k1*this.nodes[i-2].y + k2*this.nodes[i-1].y + k3*this.nodes[i].y + k4*this.nodes[i+1].y;

		for (var u = 1/this.numSegments; u <= 1; u = u+1/this.numSegments){

			k1 = 1/6 * Math.pow(1-u, 3);
			k2 = 1/6 *(4 - 6*u*u + 3*Math.pow(u, 3));
			k3 = 1/6 * (1 + 3*u + 3*u*u - 3*Math.pow(u, 3));
			k4 = 1/6 * Math.pow(u, 3);
			var x1 = k1*this.nodes[i-2].x + k2*this.nodes[i-1].x + k3*this.nodes[i].x + k4*this.nodes[i+1].x;
			var y1 = k1*this.nodes[i-2].y + k2*this.nodes[i-1].y + k3*this.nodes[i].y + k4*this.nodes[i+1].y;

			setColors(this.ctx,'black');
			drawLine(this.ctx, x0, y0, x1, y1);
			[x0, y0] = [x1, y1];
		}
	}
// ################

}

// NOTE: Task 6 code.
BSpline.prototype.drawTask6 = function()
{
	// clear the rect
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

    if (this.showControlPolygon) {
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
		// Draw nodes
		setColors(this.ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(this.ctx);
		}
    }

	// We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;

	// Draw the curve
	this.draw();

}


// Add a control point to the curve
BSpline.prototype.addNode = function(x,y)
{
	this.nodes.push(new Node(x,y));
}
