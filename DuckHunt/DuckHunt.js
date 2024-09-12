/////////////////////////////////////////////////////////////////
// Ásdís Valtýsdóttir
// Duckhunt    
//
/////////////////////////////////////////////////////////////////
var canvas;
var gl;
var mouseX;
var movement = false;


window.onload = function.init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) {alert("WebGL is næt available");}
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders( gl,"vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vertices = [
        vec2( -0.1, -0.99 ),
        vec2( 0.0, -0.85 ),
        vec2( 0.1, -0.99 )
    ];
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
            for(i=0; i<4; i++) {
                vertices[i][0] += xmove;
            }

            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
        }
    } );

    render();

}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    window.requestAnimFrame(render);
}
