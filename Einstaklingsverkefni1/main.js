/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun á "mousedown" og "mousemove" atburðum
//
//    Hjálmtýr Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;


var colorloc;




var mouseX;             // Old value of x-coordinate  
var spacebarY; // Old value of y-coordinate
var movement = false;   // Do we move the paddle?
var shoot = false; // Do we press the spacebar?

//var maxX = 1.0;
//var triangleRad = 0.1;

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
    
    var vertices = [

        //0 til 2
        vec2( -0.1, -0.99 ),
        vec2( 0.0, -0.85 ),
        vec2( 0.1, -0.99 ),

        //shot
        vec2( -0.01, -0.99 ),
        vec2( 0.0, -0.85 ),
        vec2( 0.01, -0.99 ),

        
        

        //9 til 15
        /*
        vec2( 0.015, 0.015 ),
        vec2( 0.015, 0.08 ),
        vec2( 0.01, 0.015 ),
        vec2(0.015, 0.08),
        vec2(0.01, 0.08),
        vec2(0.01, 0.015),
        */
        
    ];
    
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorloc = gl.getUniformLocation( program, "fcolor" );


    // Event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        mouseX = e.offsetX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            var xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;
            for(i=0; i<3; i++) {
                vertices[i][0] += xmove;
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
        }
    } );

    canvas.addEventListener("keydown", function(e){
        shoot = true;
        spacebarY = e.offsetY;
    });

    canvas.addEventListener("keyup", function(e){
        shoot = false;
    });



    //Event listeners for shooting
    canvas.addEventListener("keydown", function(e) {
        if(shoot) {
            var ymove = 2 * (e.offsetY - spacebarY) /canvas.height;
            spacebarY = e.offsetY;            
            for(j=9; j<15; j++) {
                vertices[0][j] += ymove;
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

        }

    });

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );


    gl.drawArrays( gl.TRIANGLES, 0, 5 );

    window.requestAnimFrame(render);
}
