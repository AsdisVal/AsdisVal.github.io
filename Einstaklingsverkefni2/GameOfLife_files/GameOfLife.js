/////////////////////////////////////////////////////////////////
//    Ásdís Valtýsdóttir, október 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];
var grid = [];
var gridSize = 10;

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var sScale = 1.0;

var camera;


var matrixLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer(); //color buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer(); //vertex buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    let locScale = gl.getUniformLocation(program, "Scale");
    gl.uniform1f(locScale, sScale);

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

    createGrid(gridSize);
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
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
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
        
    }
}

function createGrid(gridSize) {
    for(let x = 0; x < gridSize; x++) {
        grid[x] = [];
        for(let y = 0; y < gridSize; y++) {
            grid[x][y] = [];
            for(let z = 0; z < gridSize; z++) {
                grid[x][y][z] = 1;
                /*
                let aliveOrdead = Math.random();
                if(aliveOrdead > 0.7) {
                    grid[x][y][z] = 1;
                    renderGrid(grid);
                } 
                else {grid[x][y][z] = 0;}*/

            }
        }
    }
    return grid;
}

// Rendering alive cells

function renderGrid(grid) {
    for(let x = 0; x < gridSize; x++) {
        for(let y = 0; y < gridSize; y++) {
            for(let z = 0; z < gridSize; z++) {
                if(grid[x][y][z] == 1) {
                    drawCubeAtPosition(x, y, z);
                }
            }
        }
    }
}


function drawCubeAtPosition(x, y, z) {
    let mv = mat4();
    mv = mult(mv, translate(x - gridSize/2, y - gridSize/2, z - gridSize/2));
    mv = mult(mv, scale(sScale, sScale, sScale));

    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

/*
function extraGrid(grid) {
    let extraGrid = [];
    for(let x = 0; x < gridSize; x++) {
        extraGrid[x] = [];
        for( let y = 0; y < gridSize; y++) {
            extraGrid[x][y] = [];
            for(let z = 0; z < gridSize; z++) {
                extraGrid[x][y][z] = grid[x][y][z]
            }
        }
    }
    return extraGrid;
}
*/

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));

    renderGrid(grid);
    requestAnimFrame( render );

}

