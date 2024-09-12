/////////////////////////////////////////////////////////////////
// ásdís valtýsdóttir
/////////////////////////////////////////////////////////////////
var canvas;
var gl;



var mouseX;             // Old value of x-coordinate  
var movement = false;   // Do we move the paddle?
var bulletY = -0.9;
const gunVertices = [
    //gun
    vec2(-0.1, -0.9 ),
    vec2(0.0, -0.8),
    vec2(0.1, -0.9)
];

const bullets = [];
const bulletVertices = [
    //bullet
    vec2(-0.05, -0.9 ),
    vec2(0.0, -0.8),
    vec2(0.05, -0.9),
];

const birds = [];
const birdVertices = [
    //bird
    vec2(-0.99, 0.4),
    vec2(-0.99, 0.45),
    vec2(-0.79, 0.45),
    vec2(-0.79, 0.45),
    vec2(-0.79, 0.4),
    vec2(-0.99, 0.4)

]


const scorePoint = [
    vec2(0, 0),
    vec2(0, -0.08),
    vec2(0.01, 0),
    vec2(0, -0.08),
    vec2(0.01, 0),
    vec2(0.01, -0.08)
];


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    const program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    const bullets = [].concat(bulletVertices);
    const birds = [].concat(birdVertices);

    const vertices = [].concat(gunVertices, bullets, birds, scorePoint);
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

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
            for(var i=0; i<3; i++) {
                gunVertices[i][0] += xmove;
                bulletVertices[i][0] += xmove;
            }

            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(gunVertices));
            gl.bufferSubData(gl.ARRAY_BUFFER, flatten(gunVertices).byteLength, flatten(bullets));
        }
    } );

    window.addEventListener("keydown", function(e){
        console.log("Shoot");
        shootBullet();
        
    });

    render();
}

function shootBullet() {
    addBullet();
    bullets.push( vec2(bulletVertices[2][0], bulletVertices[2][1]) );
    for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i][1] += 0.01;

        if (bullets[i][1] >= 1.1) {
            bullets.splice(i, 1);
        }
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(bullets));
}

function addBullet() {
    console.log("add a bullet");

}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 18);
    window.requestAnimFrame(render);
}
