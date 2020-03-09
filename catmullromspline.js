var CatmullRomSpline = function(canvasId, active = false)
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
	this.addNode(this.frame, this.value);

	//this curve active
	this.active = active;

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

CatmullRomSpline.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

CatmullRomSpline.prototype.setShowTangents = function(bShow)
{
	this.showTangents = bShow;
}

CatmullRomSpline.prototype.setTension = function(val)
{
	this.tension = val;
}

CatmullRomSpline.prototype.setNumSegments = function(val)
{
	this.numSegments = val;
}

CatmullRomSpline.prototype.setFrame = function(f)
{
	this.frame = f;
}

CatmullRomSpline.prototype.setValue = function(value)
{
	this.value = value;
}

CatmullRomSpline.prototype.addnode = function()
{
	this.addNode(this.frame, this.value);
}

CatmullRomSpline.prototype.mousePress = function(event)
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

CatmullRomSpline.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
	} else {
		// No button pressed. Ignore movement.
	}
}

CatmullRomSpline.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

CatmullRomSpline.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

CatmullRomSpline.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					  this.nodes[i+1].x, this.nodes[i+1].y);
}

CatmullRomSpline.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

CatmullRomSpline.prototype.drawTangents = function()
{

// ################ Edit your code below
	// TODO: Task 4
    // Compute tangents at the nodes and draw them using drawLine(this.ctx, x0, y0, x1, y1);
	// Note: Tangents are available only for 2,..,n-1 nodes. The tangent is not defined for 1st and nth node.
    // The tangent of the i-th node can be computed from the (i-1)th and (i+1)th node
    // Normalize the tangent and compute a line with a length of 50 pixels from the current control point.
// ################

	for (var i = 1; i < this.nodes.length - 1; i++){
		var x0 = this.nodes[i].x;
		var y0 = this.nodes[i].y;

		var dx = this.nodes[i+1].x - this.nodes[i-1].x;
		var dy = this.nodes[i+1].y - this.nodes[i-1].y;
		var len = Math.sqrt(dx*dx + dy*dy);
		var tangent = [dx/len, dy/len];

		var x1 = x0 + 50 * tangent[0];
		var y1 = y0 + 50 * tangent[1];
		setColors(this.ctx, 'red');
		drawLine(this.ctx, x0, y0, x1, y1);
	}

}

CatmullRomSpline.prototype.draw = function()
{

// ################ Edit your code below
	// TODO: Task 5: Draw the Catmull-Rom curve (see the assignment for more details)
    // Hint: You should use drawLine to draw lines, i.e.
	// setColors(this.ctx,'black');
	// .....
	// drawLine(this.ctx, x0, y0, x1, y1);
	// ....

	for (var i=2; i<this.nodes.length-1; i++){
		var x1 = 0;
		var y1 = 0;
		var t = this.tension;
		var x0 = this.nodes[i-1].x;
		var y0 = this.nodes[i-1].y;

		for (var u = 1/this.numSegments; u <= 1; u = u+1/this.numSegments){

			k1 = -t*u + 2*t*u*u - t*Math.pow(u, 3);
			k2 = 1 + (t-3)*u*u + (2-t)*Math.pow(u, 3);
			k3 = t*u + (3-2*t)*u*u +(t-2)*Math.pow(u, 3);
			k4 = -t*u*u + t*Math.pow(u, 3);
			var x1 = k1*this.nodes[i-2].x + k2*this.nodes[i-1].x + k3*this.nodes[i].x + k4*this.nodes[i+1].x;
			var y1 = k1*this.nodes[i-2].y + k2*this.nodes[i-1].y + k3*this.nodes[i].y + k4*this.nodes[i+1].y;

			setColors(this.ctx,'black');
			drawLine(this.ctx, x0, y0, x1, y1);
			[x0, y0] = [x1, y1];
		}
	}

// ################

}

// NOTE: Task 4 code.
CatmullRomSpline.prototype.drawTask4 = function()
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

	// draw all tangents
	if(this.showTangents)
		this.drawTangents();
}

// NOTE: Task 5 code.
CatmullRomSpline.prototype.drawTask5 = function()
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

	if(this.showTangents)
		this.drawTangents();
}


// Add a control point to the curve
CatmullRomSpline.prototype.addNode = function(x,y)
{
	this.nodes.push(new Node(x,y));
}

// Get y value for x with linear interpolation
CatmullRomSpline.prototype.getValue = function(x)
{
	var y = 330.5;
	var last = this.nodes[0];
	var next = this.nodes[1];
	var t = 0.;

	for(var i = 1; i<this.nodes.length; i++){
		//console.log(this.nodes[i-1].x, this.nodes[i-1].y, x, this.nodes[i].x, this.nodes[i].y);
		if(this.nodes[i-1].x <= x && this.nodes[i].x >= x){
			last = this.nodes[i-1];
			next = this.nodes[i];
			t = (x - last.x)/(next.x - last.x);
			y = (1-t)*last.y + t*next.y;
			//console.log("get value",t, y);
		}
	}
	return 330.5 - y;
}
