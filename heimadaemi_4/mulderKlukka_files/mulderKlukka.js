/////////////////////////////////////////////////////////////////
//    Ásdís Valtýsdóttir, september 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var clockRotation = -1;
var numbersInClock = 12;


// speed for each arm
var hourSpeed = (30/3600) * clockRotation;
var minuteSpeed = (6/60) * clockRotation;
var secondSpeed = 6 * clockRotation;

// angle for each arm
var hourAngle;
var minuteAngle;
var secondAngle;

var matrixLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "transform" );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    var time = new Date();
    var currentHour = time.getHours() % numbersInClock; 
    var currentMinute = time.getMinutes();
    var currentSecond = time.getSeconds();

    var circleInDegrees = 360;

    hourAngle = circleInDegrees - 30 * (currentHour + (currentMinute / 60));
    minuteAngle = circleInDegrees - currentMinute * 6;
    secondAngle = circleInDegrees  - currentSecond * 6;

    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 ); // forms a face of the cube(using two triangles)
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
        
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var modelView = mat4();
    modelView = mult( modelView, rotateX(spinX) );
    modelView = mult( modelView, rotateY(spinY) );

    hourAngle += hourSpeed / 60;
    minuteAngle += minuteSpeed / 60;
    secondAngle += secondSpeed / 60;

    var armLength = 0.35;
    var startingPosInAClock = 90; // 90 degrees up is always the starting point.

    //back for the clock
    modelView = mult(modelView, translate( 0, 0, 0 ) );
    var mvBack = mult(modelView, translate( 0, 0, 0.3 ) ); 
    mvBack = mult(mvBack, scalem(0.8, 0.8, 0.03 ) );
    mvBack = mult(mvBack, rotateY(90));
    gl.uniformMatrix4fv(matrixLoc, false, flatten( mvBack ) );
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    //Arm for hours
    modelView = mult( modelView, rotateZ(hourAngle + startingPosInAClock)); 
    var mv1 = mult( modelView, translate(armLength/2, 0, 0));
    mv1 = mult( mv1, scalem( armLength, 0.04, 0.02 ) );
    gl.uniformMatrix4fv( matrixLoc, false, flatten( mv1 ) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    //Arm for minutes
    modelView = mult( modelView, translate( armLength, 0, -0.02 ) );
    modelView = mult( modelView, rotateZ( minuteAngle - hourAngle ) );
    var mv2 = mult( modelView, translate(armLength / 2 , 0, 0) );
    mv2 = mult( mv2, scalem( armLength, 0.03, 0.02 ) );
    mv2 = mult( mv2, rotateY( 180 ) );
    gl.uniformMatrix4fv( matrixLoc, false, flatten(mv2));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    //Arm for seconds
    modelView = mult( modelView, translate( armLength, 0, -0.02 ) );
    modelView = mult( modelView, rotateZ( secondAngle - minuteAngle ) );
    var mv3 = mult( modelView, translate( armLength / 2, 0, 0 ) );
    mv3 = mult( mv3, scalem( armLength, 0.02, 0.01 ) );
    mv3 = mult( mv3, rotateX( 90 ) );
    gl.uniformMatrix4fv( matrixLoc, false, flatten( mv3 ) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    requestAnimFrame( render );
}
