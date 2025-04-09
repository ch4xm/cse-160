// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
const CANVAS_ID = 'canvas';

let canvas;
let ctx;
let gl;
let a_Position;
let u_FragColor;

var VSHADER_SOURCE = `
    attribute vec4 a_Position;                      // Vertex position
    void main() {
        gl_Position = a_Position;                   // Set the vertex coordinates of the point
        gl_PointSize = 10.0;                        // Set the point size
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
    
    // gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    canvas.onmousedown = click;
    
    clearCanvas();
    
    // Draw a point
    gl.drawArrays(gl.POINTS, 0, 1);
}

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById(CANVAS_ID);
    if (!canvas) { 
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    
    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
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
}

function getRenderingContext(id) {
    ctx = canvas.getContext('2d');
    return ctx;
}

function clearCanvas() {
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    g_points = [];
    g_colors = [];
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
    // ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
}

let g_points = [];  // The array for the position of a mouse press
let g_colors = [];  // The array to store the color of a point
function click(event) {
    
    [x, y] = convertCoordinatesEventToGL(event);
    
    // Store the coordinates to g_points array
    g_points.push([x, y]);
    // Store the coordinates to g_points array
    if (x >= 0.0 && y >= 0.0) {      // First quadrant
        g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    } else if (x < 0.0 && y < 0.0) { // Third quadrant
        g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    } else {                         // Others
        g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    }
    
    renderAllShapes();
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for(var i = 0; i < len; i++) {
        var xy = g_points[i];
        var rgba = g_colors[i];
        
        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Draw
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

function convertCoordinatesEventToGL(event) {
    var x = event.clientX; // x coordinate of a mouse pointer
    var y = event.clientY; // y coordinate of a mouse pointer
    var rect = event.target.getBoundingClientRect();
    
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    
    return [x, y];
}