// TODO: Task 3 - Skinning a custom mesh.
//
// In this task you will be skinning a given 'arm' mesh with multiple bones.
// We have already provided the initial locations of the two bones for your convenience
// You will have to add multiple bones to do a convincing job.
var Task3 = function(gl)
{
	this.pitch = 0;
    this.yaw = 0;
	
	// Create a skin mesh
	this.skin = new SkinMesh(gl);
	this.skin.createArmSkin();
	
	// Create an empty skeleton for now.
	this.skeleton = new Skeleton();
	
	// TODO: Task-3
	// Create additional joints as required.
	this.mJoint1 = new Joint ( 	      null, new Vector( -15, 0, 0), new Vector(0, 0,  1), 6.5, "Upper Arm", gl);
	this.mJoint2 = new Joint (this.mJoint1, new Vector(   7, 0, 0), new Vector(0, 0, -1), 5.5, "Forearm", gl);
	this.mJoint3 = new Joint (this.mJoint2, new Vector(   6, 0, 0), new Vector(0, 0, -1), 1.5, "Hand", gl);
	this.mJoint4 = new Joint (this.mJoint3, new Vector(   0.8, -0.5, -1.5), new Vector(-1, -0.5, -1), 0.9, "Thumb", gl);
	this.mJoint5 = new Joint (this.mJoint3, new Vector(   1.7, -0.5, -0.7), new Vector(-0.3, -0.1, -1), 1.4, "Indexfinger", gl);
	this.mJoint6 = new Joint (this.mJoint3, new Vector(   2, -0.4, 0), new Vector(0, 0, -1), 1.7, "Middlefinger", gl);
	this.mJoint7 = new Joint (this.mJoint3, new Vector(   2, -0.4, 0.5), new Vector(0.5, 0, -1), 1.3, "Ringfinger", gl);
	this.mJoint8 = new Joint (this.mJoint3, new Vector(   2, -0.5, 1.1), new Vector(1, 0, -1), 0.8, "Littlefinger", gl);

	// Add your joints to the skeleton here
	this.skeleton.addJoint(this.mJoint1);
	this.skeleton.addJoint(this.mJoint2);
	this.skeleton.addJoint(this.mJoint3);
	this.skeleton.addJoint(this.mJoint4);
	this.skeleton.addJoint(this.mJoint5);
	this.skeleton.addJoint(this.mJoint6);
	this.skeleton.addJoint(this.mJoint7);
	this.skeleton.addJoint(this.mJoint8);
	
	// set the skeleton
	this.mShowWeights = false;

	this.skin.setSkeleton(this.skeleton, "linear");
	
	gl.enable(gl.DEPTH_TEST);
}

Task3.prototype.render = function(gl, w, h) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(60, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -10).multiply(
        Matrix.rotate(this.pitch, 1, 0, 0)).multiply(
        Matrix.rotate(this.yaw, 0, 1, 0)).multiply(
        Matrix.translate(8, 0, 0)).multiply(
        Matrix.rotate(30, 1, 0, 0));
    
	if(this.skin)
		this.skin.render(gl, view, projection, false);
	
	if(this.skeleton)
	{
		gl.clear(gl.DEPTH_BUFFER_BIT);
		this.skeleton.render(gl, view, projection);
	}
}

Task3.prototype.setJointAngle = function(id, value)
{
	if(this.skeleton && id < this.skeleton.getNumJoints())
	{
		this.skeleton.getJoint(id).setJointAngle(value);
		//this.skeleton.getJoint(id).setJointAngle(20*sinTime);
		this.skin.updateSkin();
	}
}

Task3.prototype.dragCamera = function(dx, dy) {
    this.pitch = Math.min(Math.max(this.pitch + dy*0.5, -90), 90);
    this.yaw = this.yaw + dx*0.5;
}

Task3.prototype.showJointWeights = function(idx)
{
	this.skin.showJointWeights(idx);
    this.skin.updateSkin();
}
