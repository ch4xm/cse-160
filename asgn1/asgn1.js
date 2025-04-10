// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
const CANVAS_ID = 'canvas';

let canvas;
let ctx;
let gl;
let a_Position;
let u_FragColor;
let u_PointSize = 10.0;

var VSHADER_SOURCE = `
    attribute vec4 a_Position;                      // Vertex position
    uniform float u_PointSize;                      // Point size
    void main() {
        gl_Position = a_Position;                   // Set the vertex coordinates of the point
        gl_PointSize = u_PointSize;                        // Set the point size
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;                 // Set the point color
    }`;

function main() {
    // Setup WebGL with canvas 
    setupWebGL()
    // ctx = getRenderingContext(CANVAS_ID);
    // if (!ctx) {
    //     return;
    // }
    // clearCanvas();
    
    connectVariablesToGLSL();
    
    setupUICallbacks();
    
    clearCanvas();
    updateSelectedValues();
    // Draw a point
    // gl.drawArrays(gl.POINTS, 0, 1);

    // drawTriangle([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
}

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById(CANVAS_ID);
    if (!canvas) { 
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    
    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    
    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    
    // Get the storage location of u_PointSize
    u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
    if (!u_PointSize) {
        console.log('Failed to get the storage location of u_PointSize');
        return; 
    }
}

function getRenderingContext(id) {
    ctx = canvas.getContext('2d');
    return ctx;
}

function clearCanvas() {
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    g_shapes = [];
    renderAllShapes()
}

let g_shapes = [];  // The array for shapes, including color, size, and position

function click(event) {
    console.log('current shape: ' + selectedShape);
    [x, y] = convertCoordinatesEventToGL(event);
    // Store the coordinates to points array
    let shape = null;
    switch(selectedShape) {
        case 'point':
            shape = new Point();
            break;
        case 'triangle':
            shape = new Triangle();
            break;
        case 'circle':
            shape = new Circle();
            shape.segments = g_selectedSegments;
            break;
        default:
            console.log('Unknown shape type');
            return;
    }
    // shape = new Point();

    shape.position = [x, y, 0.0];
    shape.color = g_selectedColor.slice();
    shape.size = Number(g_selectedSize);
    g_shapes.push(shape);
    
    renderAllShapes();
}

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // The current color of the selected point
let g_selectedSize = 10.0; // The current size of the selected point
let g_selectedSegments = 10; // The current number of segments for the selected circle

let selectedShape = 'point'; // The current selected shape  
function setupUICallbacks() {
    canvas.onmousedown = click;
    canvas.onmousemove = function(event) {
        if (event.buttons == 1) {
            click(event);
        }
    }
    document.getElementById('clear').addEventListener('click', function() {
        clearCanvas();
    });
    
    document.getElementById('redSlider').addEventListener('mousemove', function() {
        g_selectedColor[0] = Number(this.value) / 255.0;
    });
    document.getElementById('greenSlider').addEventListener('mousemove', function() {
        g_selectedColor[1] = Number(this.value) / 255.0;
    });
    document.getElementById('blueSlider').addEventListener('mousemove', function() {
        g_selectedColor[2] = Number(this.value) / 255.0;
    });
    
    document.getElementById('sizeSlider').addEventListener('mousemove', function() {
        g_selectedSize = Number(this.value);
        document.getElementById('sizeLabel').innerText = this.value;
    });

    document.getElementById('segmentsSlider').addEventListener('mousemove', function() {
        g_selectedSegments = Number(this.value);
        document.getElementById('segmentsLabel').innerText = this.value;
    });

    document.getElementById('squareButton').addEventListener('click', function() {
        g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // White
        g_selectedSize = 10.0;
        selectedShape = 'point';
        updateSelectedValues();
    });

    document.getElementById('triangleButton').addEventListener('click', function() {
        g_selectedColor = [1.0, 0.0, 0.0, 1.0]; // Red
        g_selectedSize = 10.0;
        selectedShape = 'triangle';
        updateSelectedValues();
    });

    document.getElementById('circleButton').addEventListener('click', function() {
        g_selectedColor = [0.0, 1.0, 0.0, 1.0]; // Green
        g_selectedSize = 10.0;
        selectedShape = 'circle';
        updateSelectedValues();
    });
}

function updateSelectedValues() {
    const red = document.getElementById('redSlider').value;
    const green = document.getElementById('greenSlider').value;
    const blue = document.getElementById('blueSlider').value;
    g_selectedColor = [red / 255.0, green / 255.0, blue / 255.0, 1.0];

    const size = document.getElementById('sizeSlider').value;
    g_selectedSize = size;
    document.getElementById('sizeLabel').innerText = size;

    const segments = document.getElementById('segmentsSlider').value;
    g_selectedSegments = segments;
    document.getElementById('segmentsLabel').innerText = segments;
}

function renderAllShapes() {
    var startTime = performance.now();
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var len = g_shapes.length;
    for(var i = 0; i < len; i++) {
        g_shapes[i].render();
    }
    
    var duration = performance.now() - startTime;
    document.getElementById('performanceLabel').innerText = 'numdot: ' +
    len + ' ms: ' + Math.floor(duration) + ' fps: ' +
    Math.floor(10000.0 /duration);
    // console.log('numdot: ' + len + ' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(10000.0 /duration));
}

function convertCoordinatesEventToGL(event) {
    var x = event.clientX; // x coordinate of a mouse pointer
    var y = event.clientY; // y coordinate of a mouse pointer
    var rect = event.target.getBoundingClientRect();
    
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    
    return [x, y];
}
