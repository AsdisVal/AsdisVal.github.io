/////////////////////////////////////////////////////////////////
//    Heimadæmi 2 í Tölvugrafík - Dæmi 4
//     Teiknar misstórann hring á strigann þar sem notandinn smellir
//     með músinni.
//
//    Ásdís Valtýsdóttir, ágúst 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Þarf hámarksfjölda punkta til að taka frá pláss í grafíkminni
var maxNumPoints = 200;  
var numCirclePoints = 30; // þetta eru þeir punktar sem myndast utanum músapunktinn
var circles = []; // þetta mun halda utanum alla hringina sem músin mun búa til 

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumPoints *numCirclePoints, gl.DYNAMIC_DRAW); //* numCirclePoints er nýtt
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    canvas.addEventListener("mousedown", function(e){

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);

        //Reiknum miðjuna á punktinum
        var center = vec2(2 * e.offsetX / canvas.width -1, 2 * (canvas.height - e.offsetY) / canvas.height - 1);

        //Búum síðan til punkta sem myndast utanum miðjupunktinn
    
        var radius = Math.random() * 0.1 + 0.05; // slembinn radius á milli 0.05 og 0.15
        
        var circleVertices = []; // punktarnir sem mynda hringinn eru hér

        // Fyrst kemur miðjan af því í TRIANGLE_FAN er fyrsti punkturinn sá sem er gerður blævængur utanum
        circleVertices.push(center);

        //Búum til punkta utanum miðjuna(center) á hringnum
        for (var i = 0; i <= numCirclePoints; i++) { // i er frá 0 til 30 að fylgja eftirfarandi ferli:
            var angle = (i / numCirclePoints) * 2 * Math.PI; 
            // i/numCirclePoints er brot sem sýnir staðsetninguna á hringnum. 2Pí umbreytir brotinu í radíana sem þekur allan hringinn
            var x = center[0] + radius * Math.cos(angle);
            //notum kósínus til að reikna lágrétt hvar brotið/angle, og með angle fáum við gildi á bilinu -1 til 1.
            //Með því að margfalda með radíusnum skölum við gildin í réttu stærðina af hringnum.
            // með því að bæta center[0] við færist hnitið í miðju hringsins.
            var y = center[1] + radius * Math.sin(angle);
            circleVertices.push(vec2(x, y)); // hvert x, y par er umbreytt í vigur vec2(x,y) og geymd í circleVertices fylkinu. 
        }

        // Setjið hnútana í hring fylkið. 
        circles.push(circleVertices);

        //Fletjum og geymum alla hringhnútana í buffernum.
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(circles.flat()));
       
    } );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    var offset = 0;
    circles.forEach(circle => {
        gl.drawArrays(gl.TRIANGLE_FAN, offset, circle.length);
        offset += circle.length;
    });

    window.requestAnimFrame(render);
}
