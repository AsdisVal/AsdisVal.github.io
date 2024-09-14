//////////////////////////////////////////////////////////////////
// Ásdís Valtýsdóttir                           September, 2024 //
//////////////////////////////////////////////////////////////////
var gl;
var vPosition;
var mouseX;         /* Old value of x-coordinate */
var movement = false;       /* Do we move the paddle? */ 
var score = 0;
var birdCount = 5;
var bufferForGun;
var bufferForBird;
var bufferForBullet;
var bufferForPoint;
var gun = 
[
    vec2(-0.1, -1.0),
    vec2(0.0, -0.8), 
    vec2(0.1, -1.0)
];
var pointVertices = [];
var bullets = [];
var birds = [];
var scorePoint = [];
var maxPoints = 5;

window.onload = function init() {                                                           
    const canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)  alert("WebGL isn't available"); 
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 0.5, 1.0 );
    
    const program = initShaders(gl, "vertex-shader", "fragment-shader");   /* Load shaders and initialize attribute buffers */
    gl.useProgram(program);

    vPosition = gl.getAttribLocation( program, "vPosition" );     /* Associate out shader variables with our data buffer */
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    bufferForGun = gl.createBuffer();                                                       
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForGun);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gun), gl.DYNAMIC_DRAW);
    
    var bulletSpace = new Float32Array(8);                                                  
    bufferForBullet = gl.createBuffer();                                                    
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForBullet);
    gl.bufferData(gl.ARRAY_BUFFER, bulletSpace, gl.DYNAMIC_DRAW);
    
    var birdSpace = new Float32Array(birdCount*8);                                          
    bufferForBird = gl.createBuffer();                                                      
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForBird);
    gl.bufferData(gl.ARRAY_BUFFER, birdSpace, gl.DYNAMIC_DRAW);


    var pointSpace = new Float32Array(8*maxPoints);
    bufferForPoint = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForPoint);
    gl.bufferData(gl.ARRAY_BUFFER, pointSpace, gl.DYNAMIC_DRAW);
    
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

            if(newLeftX >= -1.0 && newRightX <= 1.0) {     // Þetta skorðar byssuna inn fyrir rammann.
                for(let i=0; i<3; i++) gun[i][0] += xmove;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferForGun);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(gun));
        }
    });

    // Event listener fyrir spacebar  
    window.addEventListener("keydown", e => {                                             
        if(e.code === "Space" && bullets.length < 3) {
            bullets.push({x: gun[1][0], y: -0.8, speed: 0.05});   
        }
    });
    birds = createRandomBirds(birdCount);
    render();
}

function createRandomBirds(count) {                         
    var createBirds = [];

    for(let i = 0; i < count; i++) {
        var xPosition = Math.random() * 2 - 1;              // Slembin x staðsetning á milli -1 og 1 
        var yPosition = Math.random() * 0.8;                // Slembin y staðsetning á milli 0 og 0.8
        var baseSpeed = Math.random() * 0.02 + 0.005;       // Slembinn fuglahraði á milli 0.005 og 0.025
        var direction = Math.random() > 0.5 ? 1 : -1;       // Slembin átt valin (1 eða -1) 
        var IAmSpeed = baseSpeed * direction;   

        createBirds.push({ x: xPosition, y: yPosition, speed: IAmSpeed});
    }
    return createBirds;
}

function drawVertices() {                                                       
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferForGun);    // teiknum byssuna 
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    for(var i = 0; i < birds.length; i++) {       // teiknum fuglana 
        var bird = birds[i];
        bird.x += bird.speed;
        
        if(bird.x > 1.1){ 
            bird.x = -1.1; 
        }                         // þetta lætur fuglana birtast hinum megin þegar þeir fara út úr rammanum 
        if(bird.x < -1.1) { 
            bird.x = 1.1; 
        }    

        let offsetBirds = Float32Array.BYTES_PER_ELEMENT*i*8;               

        var birdVertices = 
        [
            vec2(bird.x - 0.07, bird.y - 0.01), vec2(bird.x - 0.07, bird.y + 0.03), 
            vec2(bird.x + 0.07, bird.y + 0.03), vec2(bird.x + 0.07, bird.y - 0.01)
        ]; 

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferForBird);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetBirds, flatten(birdVertices));
    }
    
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);                
    for(var i = 0; i < birds.length; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
    }

    for(var i = 0; i < bullets.length; i++) {     // teiknum skotin 
        var bullet = bullets[i];
        bullet.y = bullet.y + bullet.speed;
        var bulletVertices = 
        [
            vec2(bullet.x - 0.005, bullet.y ),
            vec2(bullet.x - 0.005, bullet.y + 0.05),
            vec2(bullet.x + 0.01, bullet.y + 0.05),
            vec2(bullet.x + 0.01, bullet.y)
        ]; 
        
        if(bullet.y > 1.0) {
            bullets.splice(i, 1); //þetta eyðir skotinu(þ.e.a.s það eyðist þegar það fer út úr rammanum)
            i--; 
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferForBullet);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(bulletVertices));
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    detectCollisions();

    for(var i = 0; i < score; i++) {   // teiknum stig 
        var xPos = 0.95 - i*0.1;       // -i*0.1 hliðrar x staðsetningunni um 0.1
        var yPos = 0.92;               // við viljum hafa y hnitin eins fyrir stigin
        
        pointVertices = 
        [
            vec2(xPos -0.02, yPos +0.05), // A
            vec2(xPos -0.02, yPos -0.03), // B
            vec2(xPos +0.02, yPos -0.03), // C
            vec2(xPos +0.02, yPos -0.03), // C
            vec2(xPos +0.02, yPos + 0.05),// D
            vec2(xPos -0.02, yPos +0.05)  // A
        ];

        scorePoint.push(pointVertices);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferForPoint);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointVertices));
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

function detectCollisions() {
    bullets.forEach((bullet, i) => {
        birds.forEach((bird, j) => {
            const bulletBounds = 
            {
                left: bullet.x - 0.01,
                right: bullet.x + 0.01,
                top: bullet.y + 0.1,
                bottom: bullet.y
            };

            const birdBounds = 
            {
                left: bird.x -0.07, 
                right: bird.x + 0.07, 
                top: bird.y +0.04, 
                bottom: bird.y - 0.01
            };

            if (bulletBounds.bottom < birdBounds.top
                && bulletBounds.right > birdBounds.left
                && bulletBounds.left < birdBounds.right 
                && bulletBounds.top > birdBounds.bottom ) 
                {
                bullets.splice(i, 1); //þetta eyðir einu byssuskoti
                birds.splice(j, 1); //þetta eyðir einum fugli
                score++; //þetta leyfir okkur að nota for-lykkjuna til þess að teikna stig.
            }
        });
    });
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    drawVertices();
    window.requestAnimFrame(render);
}
