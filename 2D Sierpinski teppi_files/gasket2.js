"use strict";

var canvas;
var gl;

var punktar = [];

var FjoldiSkiptinga = 4; 

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var hnutar = [
        vec2( -1, -1 ),
        vec2(-1, 1),
        vec2(1, -1),
        vec2(1, 1),
    ];

    butumFerning(hnutar[0], hnutar[1], hnutar[2], hnutar[3], FjoldiSkiptinga);

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(punktar), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

// Fallið @ferningur mun hlaða ferningnum inn í punktafylkið. Punktafylkið hefur tengingu við litina.
function ferningur (a, b, c, d) {
punktar.push(a, b, c, d);

}

function butumFerning(a, b, c, d, skipting){
    if (skipting === 0) {
        ferningur(a, b, c, d);
    } else {
        //Finnum punkta fyrir 8 ferninga!

        //Ytri punktar
        var ab = mix(a, b, 1/3);
        var ab2 = mix(a, b, 2/3);
        var bd = mix(b, d, 1/3);
        var bd2 = mix(b, d, 2/3);
        var cd = mix(c, d, 1/3);
        var cd2 = mix(c, d, 2/3);
        var ac = mix(a, c, 1/3);
        var ac2 = mix(a, c, 2/3);

        //Innri punktar
        var ad = mix(a, d, 1/3);
        var ad2 = mix(a, d, 2/3);
        var bc = mix(b, c, 1/3);
        var bc2 = mix(b, c, 2/3);

        //fækkum skiptingu um einn
        --skipting;

        //bútum ferninginn niður í átta ferninga!
        butumFerning(a, ab, ac, ad, skipting);
        butumFerning(ab, ab2, ad, bc, skipting);
        butumFerning(ab2, b, bc, bd, skipting);
        butumFerning(bc, bd, ad2, bd2, skipting);
        butumFerning(ad2, bd2, cd2, d, skipting);
        butumFerning(bc2, ad2, cd, cd2, skipting);
        butumFerning(ac2, bc2, c, cd, skipting);
        butumFerning(ac, ad, ac2, bc2, skipting);
        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, punktar.length );
}
