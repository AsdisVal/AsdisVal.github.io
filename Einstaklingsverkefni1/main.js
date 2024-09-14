//////////////////////////////////////////////////////////////////
// Ásdís Valtýsdóttir                           September, 2024 //
//////////////////////////////////////////////////////////////////
var gl;
var renderId;
var vPosition;
var mouseX;         /* Old value of x-coordinate */
var movement = false;       /* Do we move the paddle? */
var speed = Math.random(); 
var point = 0;
var birdCount = 5;
var bufferForGun;
var bufferForBird;
var bufferForBullet;
var bufferForPoint;
var gun = [
    vec2(-0.1, -1.0),
    vec2(0.0, -0.7), 
    vec2(0.1, -1.0)];
var bullets = [];
var birds = [];
var scorePoint = [];

window.onload = function init() {                                                           /* Comments for function init:*/
    const canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)  alert("WebGL isn't available"); 
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 0.5, 1.0 );
    
    const program = initShaders(gl, "vertex-shader", "fragment-shader");                    /* Load shaders and initialize attribute buffers */
    gl.useProgram(program);

    vPosition = gl.getAttribLocation( program, "vPosition" );                               /* Associate out shader variables with our data buffer */
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    bufferForGun = gl.createBuffer();                                                       /*Create a buffer for the gun */
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForGun);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gun), gl.DYNAMIC_DRAW);
    
    var bulletSpace = new Float32Array(8);                                                  /* Create a space for the bullets */
    bufferForBullet = gl.createBuffer();                                                    /* Create a buffer for the bullets */
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForBullet);
    gl.bufferData(gl.ARRAY_BUFFER, bulletSpace, gl.DYNAMIC_DRAW);
    
    var birdSpace = new Float32Array(birdCount*8);                                          /* Create some space for the birds */
    bufferForBird = gl.createBuffer();                                                      /* Create some buffer for the birds */
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForBird);
    gl.bufferData(gl.ARRAY_BUFFER, birdSpace, gl.DYNAMIC_DRAW);
    
    /* Event listeners for mouse incoming */

    canvas.addEventListener("mousedown", e => {
        movement = true;
        mouseX = e.offsetX;
    });

    canvas.addEventListener("mouseup", () => movement = false);

    canvas.addEventListener("mousemove", e => {
        if(movement) {
            const xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;

            let newLeftX = gun[0][0] + xmove;
            let newRightX = gun[2][0] + xmove;

            if(newLeftX >= -1.0 && newRightX <= 1.0) {
                for(let i=0; i<3; i++) gun[i][0] += xmove;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferForGun);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(gun));
        }
    });

    window.addEventListener("keydown", e => {                                               /* Event listener for spacebar */ 
        if(e.code === "Space" && bullets.length < 3) {
            bullets.push({x: gun[1][0], y: -0.7, speed: 0.05});   
        }
    });
    birds = createRandomBirds(birdCount);
    render();
}

function createRandomBirds(count) {                         /* Comments for function createRandomBirds:*/
    var createBirds = [];

    for(let i = 0; i < count; i++) {
        var xPosition = Math.random() * 2 - 1;              /* Random x between -1 and 1 */
        var yPosition = Math.random() * 0.8;                /* Random y between 0 and 0.8*/
        var baseSpeed = Math.random() * 0.02 + 0.005;       /* Random bird speed between 0.005 and 0.025*/
        var direction = Math.random() > 0.5 ? 1 : -1;       /* Randomly choose direction (1 or -1) */ 
        var speed = baseSpeed * direction;

        createBirds.push({ x: xPosition, y: yPosition, speed: speed});
    }
    return createBirds;
}


function drawVertices() {                                                       /* Comments for function drawVertices:*/
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForGun);                               /* First we add the gun */
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    for(var i = 0; i < birds.length; i++) {                                     /* Then draw the birds */
        var bird = birds[i];
        bird.x += bird.speed;
        
        let offset = Float32Array.BYTES_PER_ELEMENT*i*8;                        /* Then specify (in bytes) where the data replacement will start */
        
        if(bird.x > 1.1){ 
            bird.x = -1.1; 
        }                                                                       /* Let's make birds teleport */
        if(bird.x < -1.1) { 
            bird.x = 1.1; 
        }       

        
        var birdVertices = [vec2(bird.x - 0.07, bird.y - 0.01), 
                            vec2(bird.x - 0.07, bird.y + 0.03), 
                            vec2(bird.x + 0.07, bird.y + 0.03), 
                            vec2(bird.x + 0.07, bird.y - 0.01)]; 
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferForBird);
        gl.bufferSubData(gl.ARRAY_BUFFER, offset, flatten(birdVertices));
    }
    
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);                /* We need to bind the buffer to vPosition */
    for(var i = 0; i < birds.length; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
    }

    for(var i = 0; i < bullets.length; i++) {                                   /* finally draw the bullets */
        var bullet = bullets[i];
        bullet.y += bullet.speed;
        var bulletVertices = [
            vec2(bullet.x - 0.005, bullet.y ),
            vec2(bullet.x - 0.005, bullet.y + 0.05),
            vec2(bullet.x + 0.01, bullet.y + 0.05),
            vec2(bullet.x + 0.01, bullet.y)
        ]; 
        
        if(bullet.y > 1.0) {
            bullets.splice(i, 1);
            i--;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferForBullet);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(bulletVertices));
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    detectCollisions();
}

function detectCollisions() {
    bullets.forEach((bullet, i) => {
        birds.forEach((bird, j) => {
            const bulletBounds = {
                left: bullet.x - 0.01,
                right: bullet.x + 0.01,
                top: bullet.y + 0.1,
                bottom: bullet.y
            };

            const birdBounds = {
                left: bird.x -0.07, 
                right: bird.x + 0.07, 
                top: bird.y +0.04, 
                bottom: bird.y - 0.01
            };

            if (bulletBounds.right > birdBounds.left
                 && bulletBounds.left < birdBounds.right 
                 && bulletBounds.top > birdBounds.bottom 
                 && bulletBounds.bottom < birdBounds.top) {
                    
                bullets.splice(i, 1);
                birds.splice(j, 1);
                addPoint();
            }
        });
    });
}

function addPoint() {
    point++;
    if(point < 5) {
        console.log( point+" stig");
    } else {
        console.log( point+" stig");
        console.log("Þú vannst!");
    }

}



function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    drawVertices();
    window.requestAnimFrame(render);
}
