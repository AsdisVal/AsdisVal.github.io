/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Teikna nálgun á hring sem TRIANGLE_FAN
//
//    Hjálmtýr Hafsteinsson, ágúst 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// numCirclePoints er fjöldi punkta á hringnum í upphafi
var numCirclePoints = 3;       

var radius = 0.5;
var center = vec2(0, 0);

var points = [];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
	// Create the circle
    createCirclePoints( center, radius, numCirclePoints );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("slider")?.addEventListener("input", function(event) {
        numCirclePoints = event.target.value;
        console.log(numCirclePoints);
        createCirclePoints( center, radius, numCirclePoints );

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        render();
    });
    
    render();
}


// Create the points of the circle
function createCirclePoints( cent, rad, k )
{
    points = [];
    points.push( center );
    
    var dAngle = 2*Math.PI/k; // horn í radíönum /k skiptingar
    for(var i=k; i>=0; i-- ) {
    	var a = i*dAngle;
    	var p = vec2( rad*Math.sin(a) + cent[0], rad*Math.cos(a) + cent[1] );
    	points.push(p);
    }
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // Draw circle using Triangle Fan
    gl.drawArrays( gl.TRIANGLE_FAN, 0, numCirclePoints+2 );

    window.requestAnimFrame(render);
}
