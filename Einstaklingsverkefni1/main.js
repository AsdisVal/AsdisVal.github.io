/////////////////////////////////////////////////////////////////
// Ásdís Valtýsdóttir
// Duckhunt    
//
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var gunOffset, bulletOffset, birdOffset;
var maxBullets = 3;
var maxBirds = 6;
var totalVerticesCount = gun.length + maxBullets*bullet.length + maxBirds*bird.length;

var vertices = [];
var program;

var lastShotTime = Date.now();

// Movement of the triangle
var mouseX;     // old value of x coordintae 
var gunMovement = false;   // Do we move the paddle?
//Svæðið er frá -maxX til maxX fyrir byssuna
var maxXForGun = 1.0;

var triangleRad = 0.1;

let playerScore = 0;

// vigrar f. byssuna

var gun = [

    vec2( -0.1, -0.99 ),
    vec2( 0.0, -0.85 ),
    vec2( 0.1, -0.99 ),

]; 

// öll skot
var bullets = [];
// vigrar f. skot
var bullet = [
    
    vec2( -0.01, -0.99 ),
    vec2( 0.0, -0.85 ),
    vec2( 0.01, -0.99 ),

];

var birds = [];
// vigrar f. fugl
var bird = [

    vec2(0.8, 0.8),
    vec2(0.9, 0.8),
    vec2(0.8, 0.9),
    vec2(0.9, 0.9),
    vec2(0.9, 0.8),
    vec2(0.8, 0.9),

];

// vigrar f. stigatöfluna
var scoreDisplay = [
    
    vec2(0.5, 0.5),
    vec2(0.6, 0.5),
    vec2(0.5, 0.6),
    vec2(0.6, 0.6),
    vec2(0.6, 0.5),
    vec2(0.5, 0.6),

];

var gunPoint = [
    vec2(0.0, 0.0),
    vec2(0.1, 0.0),
    vec2(0.0, 0.1),
    vec2(0.1, 0.1),
    vec2(0.1, 0.0),
    vec2(0.0, 0.1),
]

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    vertices = [];

    for (var i = 0; i < gun.length; i++) {
        vertices.push(gun[i]);
    }
    

    for(var i = 0; i < birds.length; i++) {
        for(var j = 0; j < bird.length; j++) {
            
            if (birds[i][2] < 0) {
                vertices.push(vec2(birds[i][0] - bird[j][0], birds[i][1] + bird[j][1]));
            } else {
                vertices.push(vec2(birds[i][0] + bird[j][0], birds[i][1] + bird[j][1]));
            }
        }            
    }

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    
    // Event listeners for mouse usage
    canvas.addEventListener("mousedown", function(e){
        gunMovement = true;
        mouseX = e.offsetX;
    } );

    canvas.addEventListener("mouseup", function(e){
        gunMovement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(gunMovement) {
            var xmove = 2*(e.offsetX - mouseX) / canvas.width;
            mouseX = e.offsetX;
            for(i=0; i<3; i++) {
                gun[i][0] += xmove;
            }
            //gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(gun ));
        }
    } );

    canvas.addEventListener("keydown", function(e){
        if(e.code === "space") {
            if(bullets.length < 3) {
                bullets.push(vec2(gun[2][0], gun[2][1]));
            }
        }
    });    

    render();
}


function updateBirds() {

    if (birds.length < 6 && Math.random() < 0.01) {
        var birdY = -0.5 + Math.random() * (0.6);
        var birdSpeed = (Math.random() * 0.005) + 0.01;
        let birdX = 1.14;
        if (Math.random() > 0.4) birdSpeed = -birdSpeed;
        if (birdSpeed > 0) {
            birdX = -1.14;
        }
        birds.push(vec3(birdX, birdY, birdSpeed));
    }

    for (var i = birds.length - 1; i >= 0; i--) {
        birds[i][0] += birds[i][2];
    }
        
        
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    getAllVertices();
    updateBirds()
    gl.drawArrays( gl.TRIANGLES, 0, vertices.length);
    window.requestAnimFrame(render);
}


function getAllVertices() {
    vertices = [];

    for (var i = 0; i < gun.length; i++) {
        vertices.push(gun[i]);
    }
    

    for(var i = 0; i < birds.length; i++) {
        for(var j = 0; j < bird.length; j++) {
            
            if (birds[i][2] < 0) {
                vertices.push(vec2(birds[i][0] - bird[j][0], birds[i][1] + bird[j][1]));
            } else {
                vertices.push(vec2(birds[i][0] + bird[j][0], birds[i][1] + bird[j][1]));
            }
        }            
    }

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}