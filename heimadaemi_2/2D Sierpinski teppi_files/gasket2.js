
"use strict";

var canvas;
var gl;

var punktarnir = [];

var FjoldiSkiptinganna = 4;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Upphafsstillum með fjórum punktum á bilinu [-1 til 1].

    var hnutarnir = [
        vec2( -1, -1 ),
        vec2(-1, 1),
        vec2(1, -1),
        vec2(1, 1),
    ];

    butumFerninginn(hnutarnir[0], hnutarnir[1], hnutarnir[2], hnutarnir[1], hnutarnir[2], hnutarnir[3], FjoldiSkiptinganna);



    //butumFerning(hnutar[0], hnutar[1], hnutar[2], hnutar[3], FjoldiSkiptinga);

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(punktarnir), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


function ferningurinn (a, b, c, b2, c2, d) {
    punktarnir.push(a, b, c, b, c, d);

}



function butumFerninginn(a, b, c, b1, c1, d, skiptingin) {
    if(skiptingin === 0){
        ferningurinn(a, b, c, b, c, d);
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

        --skiptingin;

         //bútum ferninginn niður í átta ferninga!

         butumFerninginn(a, ab, ac, ab, ac, ad, skiptingin);
         butumFerninginn(ab, ab2, ad, ab2, ad, bc, skiptingin);
         butumFerninginn(ab2, b, bc, b, bc, bd, skiptingin);
         butumFerninginn(bc, bd, ad2, bd, ad2, bd2, skiptingin);
         butumFerninginn(ad2, bd2, cd2, bd2, cd2, d, skiptingin);
         butumFerninginn(bc2, ad2, cd, ad2, cd, cd2, skiptingin);
         butumFerninginn(ac2, bc2, c, bc2, c, cd, skiptingin);
         butumFerninginn(ac, ad, ac2, ad, ac2, bc2, skiptingin);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, punktarnir.length );
}
