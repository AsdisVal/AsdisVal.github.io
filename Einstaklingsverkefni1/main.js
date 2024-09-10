/////////////////////////////////////////////////////////////////
// Ásdís Valtýsdóttir
// Duckhunt    
//
/////////////////////////////////////////////////////////////////
var canvas;
var gl;


var colorloc;


// Movement of the triangle
var mouseX;     // old value of x coordintae 
var movement = false;   // Do we move the paddle?

// Shooting mechanism
var spacebarY; // Old value of y-coordinate
var shoot = false; // Do we press the spacebar?

//Svæðið er frá -maxX til maxX fyrir byssuna
var maxX = 1.0;

var triangleRad = 0.1;


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

        //shot 3 to 5

        vec2( -0.01, -0.99 ),
        vec2( 0.0, -0.85 ),
        vec2( 0.01, -0.99 ),

        // 6 to 8
        vec2(0.8, 0.8),
        vec2(0.9, 0.8),
        vec2(0.8, 0.9),
        vec2(0.9, 0.9),
        vec2(0.9, 0.8),
        vec2(0.8, 0.9),

        
    ];
    
    
    console.log(flatten(vertices))
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //locTriangle = gl.getUniformLocation( program, "trianglePos");

   colorloc = gl.getUniformLocation( program, "fcolor" );


    // Event listeners for mouse usage
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

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );


    gl.drawArrays( gl.TRIANGLES, 0, 12 );

    window.requestAnimFrame(render);
}
