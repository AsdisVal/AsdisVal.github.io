////////////////////////////////////////////////////////////////////
//    Ásdís Valtýsdóttir, september 2024
////////////////////////////////////////////////////////////////////
"use strict";

var gl;
var points;

var mouseX, mouseY;         
var movement = false;

var uniformColor;
var currentColor = [0.0, 0.0, 1.0, 1.0];

var NumPoints = 5000;
var zoomFactor = 1.1; 

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    uniformColor = gl.getUniformLocation(program, "uniformColor");

    gl.uniform4fv(uniformColor, currentColor);


    canvas.addEventListener("mousedown", (e) => {
        movement = true;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    canvas.addEventListener("mouseup",() => {
        movement = false;
    });

    canvas.addEventListener("mousemove", (e) => {
        if(movement) {
            // Get mouse coordinates in the canvas
            let newMouseX = e.offsetX;
            let newMouseY = e.offsetY;

            // Convert to WebGL coordinates
            let dx = 2 * (newMouseX - mouseX) / canvas.width;
            let dy = 2 * (canvas.height - newMouseY - (canvas.height - mouseY)) / canvas.height;

            for(let i = 0; i < points.length; i++) {
                points[i][0] += dx;
                points[i][1] += dy;
            }

            mouseX = newMouseX;
            mouseY = newMouseY;

            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
            render();
        }
    });

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();

        // Create a scaling factor
        let zoomDirection = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor; 

        //multiply the points by the scaling factor
        //which brings them closer to or farther from 
        // the origin and therefore simulating zoom in/out 
        //behaviour.
        for(let i = 0; i < points.length; i++) {
            points[i][0] *= zoomDirection; 
            points[i][1] *= zoomDirection;
        }

        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        render();
    });

    window.addEventListener("keydown", (e) => {
        if(e.code === "Space") {
            currentColor = [Math.random(), Math.random(), Math.random(), 1];
            gl.uniform4fv(uniformColor, currentColor);
            render();
        }
    });

    render();
};




function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, points.length );
}
