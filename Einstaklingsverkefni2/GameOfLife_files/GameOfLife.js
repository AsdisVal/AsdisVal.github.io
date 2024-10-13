/////////////////////////////////////////////////////////////////
//    Ásdís Valtýsdóttir, október 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices = 36;
var points = [];
var colors = [];

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;
var zDist = 25.0;

var gridSize = 10;
var grid = createGrid(gridSize); // creation of grid
var lastUpdateTime = Date.now();
var centeringGrid = (gridSize - 1) / 2;
var spacing = 1.1;      // prevents cubes from being created in same place.             

var prevGrid = createEmptyGrid(gridSize); 
var animationLength = 1500;
var fullRotation = Math.PI * 2;
var updateInterval = 2500;

var matrixLoc;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

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
    canvas?.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas?.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas?.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY - (origX - e.offsetX) ) % 360;
            spinX = ( spinX - (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } ); 

    canvas?.addEventListener("wheel", function (e) {
        e.preventDefault();
        if(e.wheelDelta > 0.0) {
            zDist -= 0.5;
        } else {
            zDist += 0.5;
        }
    } );


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
        [ 0.0, 0.0, 0.0, 1.0 ],  
        [ 1.0, 1.0, 0.0, 1.0 ],  
        [ 0.0, 1.0, 0.0, 1.0 ],  
        [ 0.0, 0.0, 1.0, 1.0 ],  
        [ 1.0, 0.0, 0.0, 1.0 ],  
        [ 1.0, 0.0, 1.0, 1.0 ],  
        [ 0.0, 1.0, 1.0, 1.0 ],  
        [ 1.0, 1.0, 1.0, 1.0 ]   
    ];
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[indices[i]]);
        
    }
}

//render 
function render() 
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    var aspectRatio = canvas.width / canvas.height;
    var FieldOfView = 45;
    var closest = 0.001;
    var furthest = zDist + 10;

    var projectionMatrix = perspective( FieldOfView, aspectRatio, closest, furthest );
    var globalTransformMatrix = mult( projectionMatrix, mv );

    var currentTime = Date.now();
    var timeStamp = handleAnimationTiming( currentTime, lastUpdateTime, animationLength, updateInterval );
    renderGrid( globalTransformMatrix, timeStamp.progress, timeStamp.rotation, timeStamp.animate );

    requestAnimationFrame(render);
}


// render the grid
function renderGrid(globalTransformMatrix, progress, rotation, animate) {
    for(let x = 0; x < gridSize; x++) {
        for(let y = 0; y < gridSize; y++) {
            for(let z = 0; z < gridSize; z++) {
                if(animate && prevGrid[x][y][z] !== grid[x][y][z]) {
                    var scale = grid[x][y][z] === 1 ? progress : 1 - progress;
                    drawAnimatedCube(x, y, z, globalTransformMatrix, scale, rotation);
                } 
                else if (grid[x][y][z] === 1) {
                    drawCube(x, y, z, globalTransformMatrix);
                }
            }
        }
    }
}



//create the grid
function createGrid(gridSize) 
{
    let grid = [];
    for(let x = 0; x < gridSize; x++) {
        grid[x] = [];
        for(let y = 0; y < gridSize; y++) {
            grid[x][y] = [];
            for(let z = 0; z < gridSize; z++) {
                grid[x][y][z] = Math.random() > 0.7 ? 1 : 0;
            }
        }
    }
    return grid;
}



// create an empty grid
function createEmptyGrid(size) 
{
    let grid = [];
    for(let x = 0; x < size; x++) {
        grid[x] = [];
        for(let y = 0; y < size; y++) {
            grid[x][y] = [];
            for(let z = 0; z < size; z++) {
                grid[x][y][z] = 0;
            }
        }
    }
    return grid;
}


//draw the cubes that stayed the same
function drawCube(x, y, z, globalTransformMatrix) 
{
    let mv = mat4();
    let xCoordinates = (x - centeringGrid) * spacing;
    let yCoordinates = (y - centeringGrid) * spacing;
    let zCoordinates = (z - centeringGrid) * spacing;
    mv = mult(mv, translate(xCoordinates, yCoordinates, zCoordinates));

    let transform = mult(globalTransformMatrix, mv);
    gl.uniformMatrix4fv(matrixLoc, false, flatten(transform));

    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}

// draw the cubes that need to be animated 
function drawAnimatedCube(x, y, z, globalTransformMatrix, scale, rotation) 
{
    let mv = mat4();

    let scaleSlowly = scale * scale * 0.95; // scale slowly for x, y and z coordinates

    let xCoordinates = (x - centeringGrid) * spacing;
    let yCoordinates = (y - centeringGrid) * spacing;
    let zCoordinates = (z - centeringGrid) * spacing;

    mv = mult(mv, translate(xCoordinates, yCoordinates, zCoordinates));
    mv = mult(mv, rotateX(rotation * (360/ Math.PI )))
    mv = mult(mv, rotateY(rotation * (360/ Math.PI )))
    mv = mult(mv, scalem(scaleSlowly, scaleSlowly, scaleSlowly));

    let transformedCubes = mult(globalTransformMatrix, mv);
    
    gl.uniformMatrix4fv(matrixLoc, false, flatten(transformedCubes));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
}



//Handle the animation timing
function handleAnimationTiming(currentTime, lastUpdateTime, animationLength, updateInterval) 
{
    if(currentTime - lastUpdateTime > updateInterval)  {
        updateGrid();
    }

    if( currentTime - lastUpdateTime < animationLength) {
        var elapsed = (currentTime - lastUpdateTime) % animationLength;
        var progress = elapsed / animationLength;
        var rotation = progress * fullRotation;
        return {animate: true, progress, rotation};
    }

    return { animate: false, progress: 1, rotation: 0};
}


//Count the neighbours
function countNeighbours(x, y, z) 
{
    let neighbours = 0;

    const minX = Math.max(0, x - 1);
    const maxX = Math.min(gridSize - 1, x + 1);
    const minY = Math.max(0, y - 1);
    const maxY = Math.min(gridSize - 1, y + 1);
    const minZ = Math.max(0, z - 1);
    const maxZ = Math.min(gridSize - 1, z + 1);

    // Loop through neighbour cubes
    for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
            for (let k = minZ; k <= maxZ; k++) {
                if (i === x && j === y && k === z) continue;
                neighbours += grid[i][j][k];
            }
        }
    }
    return neighbours;
}
    

// Update the Grid
function updateGrid() 
{
    prevGrid = grid;
    let newGrid = createEmptyGrid(gridSize);

    for(let x = 0; x < gridSize; x++) {
        for(let y = 0; y < gridSize; y++) {
            for(let z = 0; z < gridSize; z++) {
                let neighbours = countNeighbours(x, y, z);

                if(grid[x][y][z] === 1) {
                    if(neighbours >= 5 && neighbours <= 7) {
                        newGrid[x][y][z] = 1;
                    } else {
                        newGrid[x][y][z] = 0;
                    }
                }else {
                    if(neighbours === 6) {
                        newGrid[x][y][z] = 1;
                    } else {
                        newGrid[x][y][z] = 0;
                    }
                }
            }
        }
    }
    grid = newGrid;
    lastUpdateTime = Date.now();
}