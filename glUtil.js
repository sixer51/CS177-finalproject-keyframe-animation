function setupTask(canvasId, taskFunction, animation = true) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.log("Could not find canvas with id", canvasId);
        return;
    }
    
    try {
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {}
    if (!gl) {
        console.log("Could not initialise WebGL");
        return;
    }
    
    var renderWidth, renderHeight;
    function computeCanvasSize() {
        renderWidth = Math.min(canvas.parentNode.clientWidth - 20, 820);
        renderHeight = Math.floor(renderWidth*9.0/16.0);
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        gl.viewport(0, 0, renderWidth, renderHeight);
    }
    
    window.addEventListener('resize', computeCanvasSize);
    computeCanvasSize();
    
    var task = new taskFunction(gl);
    
    var mouseDown = false;
    var lastMouseX, lastMouseY;
    var mouseMoveListener = function(event) {
        task.dragCamera(event.screenX - lastMouseX, event.screenY - lastMouseY);
        lastMouseX = event.screenX;
        lastMouseY = event.screenY;
    };
    canvas.addEventListener('mousedown', function(event) {
        if (!mouseDown && event.button == 0) {
            mouseDown = true;
            lastMouseX = event.screenX;
            lastMouseY = event.screenY;
            document.addEventListener('mousemove', mouseMoveListener);
        }
        event.preventDefault();
    });
    document.addEventListener('mouseup', function(event) {
        if (mouseDown && event.button == 0) {
            mouseDown = false;
            document.removeEventListener('mousemove', mouseMoveListener);
        }
    });
    
    var uiContainer = div();
    var weightSelector = ["Hide Weights"];
    for (var i = 0; i < task.skeleton.getNumJoints(); ++i) {
        var jointId = i;
        var jointName = task.skeleton.getJointName(i);
        
        if(animation){
            var sliderTarget = div();
            uiContainer.appendChild(div('slider-container', sliderTarget));
            
            new Slider(sliderTarget, 0, 120, 0, true, function(jointId, jointName, angle) {
                this.setLabel(jointName + ': ' + angle + ' deg');
                task.setJointAngle(jointId, angle);
            }, [jointId, jointName]);
        }
        
        weightSelector.push(jointName + ' Weights');
    }

    // var groupTarget = div();
    // uiContainer.appendChild(div('button-group-container', groupTarget));
    // new ButtonGroup(groupTarget, weightSelector, function(idx) {
    //     task.showJointWeights(idx - 1);
    // });
    canvas.parentNode.appendChild(uiContainer);
    
    var renderLoop = function() {
        task.render(gl, renderWidth, renderHeight);
        window.requestAnimationFrame(renderLoop);
    }
    window.requestAnimationFrame(renderLoop);
    
    return task;
}
