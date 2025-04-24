// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
const CANVAS_ID = 'canvas';

let canvas;
let ctx;
let gl;
let a_Position;
let u_FragColor;
let u_PointSize = 10.0;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

var VSHADER_SOURCE = `
    attribute vec4 a_Position;                      // Vertex position
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;                   // Set the vertex coordinates of the point
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
    
    
    clearCanvas();
    setupUICallbacks();
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
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, alpha: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
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

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
    // Get the storage location of u_PointSize
    // u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
    // if (!u_PointSize) {
    //     console.log('Failed to get the storage location of u_PointSize');
    //     return; 
    // }
}

function getRenderingContext(id) {
    ctx = canvas.getContext('2d');
    return ctx;
}

function clearCanvas() {
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
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

let g_globalAngleHorizontal = 0;
let g_globalAngleVertical = 0;
let g_drawImageSelectedShape = 'Points'

let selectedShape = 'point'; // The current selected shape

const sliders = [
    {
        id: 'globalRotateHorizontal',
        label: 'Global Rotate Horizontal',
        min: -90,
        max: 90,
        value: 0,
        step: 1,
        onChange: function(event) {
            if (event.buttons != 1) {
                return;
            }
            const value = event.target.value;
            g_globalAngleHorizontal = Number(value);
            console.log('g_globalAngleHorizontal: ' + g_globalAngleHorizontal);
            document.getElementById('globalRotateHorizontalLabel').innerText = 'Global Rotate Horizontal: ' + value;
            renderAllShapes();
        }
    },
    {
        id: 'globalRotateVertical',
        label: 'Global Rotate Vertical',
        min: -90,
        max: 90,
        value: 0,
        step: 1,
        onChange: function(event) {
            if (event.buttons != 1) {
                return;
            }
            const value = event.target.value;
            g_globalAngleVertical = Number(value);
            console.log('g_globalAngleVertical: ' + g_globalAngleVertical);
            document.getElementById('globalRotateVerticalLabel').innerText = 'Global Rotate Vertical: ' + value;
            renderAllShapes();
        }
    },
    {
        id: 'shoulderAngle',
        label: 'Shoulder Angle',
        min: 0,
        max: 90,
        value: 0,
        step: 1,
        onChange: function(event) {
            if (event.buttons != 1) {
                return;
            }
            const value = event.target.value;
            g_shoulderAngle = Number(value);
            console.log('g_shoulderAngle: ' + g_shoulderAngle);
            document.getElementById('shoulderAngleLabel').innerText = 'Shoulder Angle: ' + value;
            renderAllShapes();
        }
    },
    {
        id: 'elbowAngle',
        label: 'Elbow Angle',
        min: 0,
        max: 90,
        value: 0,
        step: 1,
        onChange: function(event) {
            if (event.buttons != 1) {
                return;
            }
            const value = event.target.value;
            g_elbowAngle = Number(value);
            console.log('g_elbowAngle: ' + g_elbowAngle);
            document.getElementById('elbowAngleLabel').innerText = 'Elbow Angle: ' + value;
            renderAllShapes();
        }
    },
    {
        id: 'wristAngle',
        label: 'Wrist Angle',
        min: 0,
        max: 90,
        value: 0,
        step: 1,
        onChange: function(event) {
            if (event.buttons != 1) {
                return;
            }
            const value = event.target.value;
            g_wristAngle = Number(value);
            console.log('g_wristAngle: ' + g_wristAngle);
            document.getElementById('wristAngleLabel').innerText = 'Wrist Angle: ' + value;
            renderAllShapes();
        }
    },
];

function setupUICallbacks() {
    canvas.onmousedown = click;
    canvas.onmousemove = function(event) {
        if (event.buttons != 1) {
            return;
        }
        rotateView(event);
    }

    registerArmCallbacks();

    const parentElement = document.getElementById('sliderContainer');

    sliders.forEach(slider => {
        const sliderContainer = document.createElement('span');
    
        const labelElement = document.createElement('label');
        const sliderElement = document.createElement('input');
        sliderElement.type = 'range';
        sliderElement.id = slider.id + 'Slider';
        sliderElement.min = slider.min;
        sliderElement.max = slider.max;
        sliderElement.value = slider.value;
        sliderElement.step = slider.step;
        sliderContainer.appendChild(sliderElement);
        labelElement.innerText = slider.label + ': ' + slider.value;
        labelElement.id = slider.id + 'Label';
        labelElement.setAttribute('for', slider.id);
        sliderContainer.appendChild(labelElement);
        parentElement.appendChild(sliderContainer);
        parentElement.appendChild(document.createElement('br'));
        sliderElement.addEventListener('mousemove', function(event) {
            slider.onChange(event);
        });
    });
    
    // document.getElementById('clear').addEventListener('click', function() {
    //     clearCanvas();
    // });



    // document.getElementById('globalRotateHorizontalSlider').addEventListener('mousemove', function(e) {
    //     if (e.buttons != 1) {
    //         return;
    //     }

    //     g_globalAngleHorizontal = Number(this.value);
    //     document.getElementById('globalRotateHorizontalLabel').innerText = 'Horizontal Rotate: ' + g_globalAngleHorizontal;
    //     renderAllShapes();
    // });

    // document.getElementById('globalRotateVerticalSlider').addEventListener('mousemove', function(e) {
    //     if (e.buttons != 1) {
    //         return;
    //     }
    //     g_globalAngleVertical = Number(this.value);
    //     console.log('g_globalAngleVertical: ' + g_globalAngleVertical);
    //     document.getElementById('globalRotateVerticalLabel').innerText = 'Vertical Rotate: ' + g_globalAngleVertical;
    //     renderAllShapes();
    // });

    updateSelectedValues();

}

// let g_oldHorizontalAngle = 0;
// let g_oldVerticalAngle = 0;
function rotateView(event) {
    const x = event.clientX;
    const y = event.clientY;
    const rect = canvas.getBoundingClientRect();
    
    const gl_x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    const gl_y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    // console.log('gl_x: ' + gl_x);
    // console.log('gl_y: ' + gl_y);

    // g_globalAngleHorizontal = gl_x * 180;
    // g_globalAngleVertical = gl_y * 180;

    g_globalAngleHorizontal = gl_x * 90;
    g_globalAngleVertical = gl_y * 90;

    document.getElementById('globalRotateHorizontalLabel').innerText = 'Horizontal Rotate: ' + g_globalAngleHorizontal;
    document.getElementById('globalRotateVerticalLabel').innerText = 'Vertical Rotate: ' + g_globalAngleVertical;

    renderAllShapes();
}

function drawImageOntoCanvas(selectedShape, resizeWidth, scaleFactor) {
    const img = document.getElementById('imagePreview');
    const imgCanvas = document.getElementById('imageCanvas');
    const imgCtx = imgCanvas.getContext('2d');

    imgCanvas.width = resizeWidth;
    imgCanvas.height = (img.height / img.width) * resizeWidth;

    imgCtx.drawImage(img, 0, 0, resizeWidth, imgCanvas.height);

    const pixels = imgCtx.getImageData(0, 0, imgCanvas.width, imgCanvas.width).data;

    clearCanvas();
    for (let y = 0; y < imgCanvas.height; y += scaleFactor) {
        for (let x = 0; x < imgCanvas.width; x += scaleFactor) {
            const index = (y * imgCanvas.width + x) * 4;
    
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3] / 255.0;
    
            let shape = null;
            switch (selectedShape) {
                case 'Triangles':
                    shape = new Triangle();
                    break;
                case 'Circles':
                    shape = new Circle();
                    shape.segments = 10;
                    break;
                default:
                    shape = new Point();
            }

    
            shape.color = [r / 255.0, g / 255.0, b / 255.0, a];
            const average = (r + g + b) / 3;
            shape.size = Math.min(6, ((150 + average) / 255.0) * scaleFactor);
            // shape.size = scaleFactor / 2;
    
            // Convert canvas x/y to WebGL coordinates [-1, 1]
            const gl_x = (x / imgCanvas.width) * 2 - 1;
            const gl_y = ((imgCanvas.height - y) / imgCanvas.height) * 2 - 1;
            shape.position = [gl_x, gl_y, 0.0];
    
            g_shapes.push(shape);
        }
    }
    renderAllShapes();
}

function drawAlbumArt() {
    clearCanvas();
    
    // g_selectedColor = []; // White
    // drawTriangle([-1, -1, -0.5, 1, 1, 1], [1,1,1,1]) 

    // gl.uniform4f(u_FragColor, 0, 0.2, 0, 1.0);
    drawTriangle([0.18, 0.12, 1, -0.03, 1, 0.02], [235/255, 29/255, 49/255, 1]) // Red rainbow stripe
    drawTriangle([0.18, 0.12, 0.20, 0.09, 1, -.03])

    // drawTriangle([0.18, 0.12, 1, -0.03, 1, 0.02], [247/255, 109/255, 34/255, 1]) // Red rainbow stripe
    drawTriangle([-0.11, 0.11, 0.2, 0.09, 1, -.03], [247/255, 109/255, 34/255, 1]) // Orange stripe
    drawTriangle([-0.11, 0.12, 1, -0.09, 1, -.03], [247/255, 109/255, 34/255, 1])

    drawTriangle([-0.14, 0.08, 0.2, 0.061, 1, -0.08], [255/255, 221/255, 0/255, 1]); // Yellow stripe 
    drawTriangle([-0.14, 0.1, 1, -0.12, 1, -0.07], [255/255, 221/255, 0/255, 1]);

    // green stripe
    drawTriangle([-0.17, 0.07, 0.2, 0.035, 1, -0.12], [0/255, 158/255, 96/255, 1]); 
    drawTriangle([-0.17, 0.09, 1, -0.16, 1, -0.12], [0/255, 158/255, 96/255, 1]);
    
    // blue stripe
    drawTriangle([-0.20, 0.05, 0.2, 0.011, 1, -0.16], [0/255, 102/255, 204/255, 1]); 
    drawTriangle([-0.20, 0.08, 1, -0.20, 1, -0.16], [0/255, 102/255, 204/255, 1]);

    // purple stripe
    drawTriangle([-0.23, 0.06, 0.2, -0.01, 1, -0.20], [106/255, 76/255, 147/255, 1]); 
    drawTriangle([-0.23, 0.072, 1, -0.24, 1, -0.20], [106/255, 76/255, 147/255, 1]);

    drawTriangle([0.0, 0.5, -0.5, -0.5, 0.5, -0.5], [0.5, 0.5, 0.5, 0.8]);  // Outer white triangle
    drawTriangle([0.0, 0.475, -0.48, -0.49, 0.48, -0.49], [80/255, 96/255, 102/255, 1]);  // inner gray triangle
    drawTriangle([0.0, 0.425, -0.425, -0.45, 0.425, -0.45], [0, 0, 0, 1]);   // Black triangle to cover the white triangle
    
    // diffusion triangle inside prism
    drawTriangle([-0.275, 0.02, 0, -0.06, 0, 0.115], [0.44,0.55,0.58,0.85]);

    drawTriangle([-0.063, 0.093, 0, -0.06, 0, 0.12], [0.44,0.55,0.58,1]);
    drawTriangle([-0.06, 0.09, 0, -0.06, -0.06, -0.043], [0.44,0.55,0.58,1]);


    drawTriangle([-1, -0.14, -0.2, 0.04, -1, -0.12], [1,1,1,1]) // 1st triangle to make line
    drawTriangle([-1, -0.14, -0.21, 0.02, -0.2, 0.04], [1,1,1,1])   // 2nd triangle to make line
    
    // Patch where diffusion triangle overlaps with outer 2 triangle
    drawTriangle([0.0, 0.475, -0.48, -0.49, -0.44, -0.49], [80/255, 96/255, 102/255, 1])
    drawTriangle([0.0, 0.475, 0, 0.45, -0.44, -0.49], [80/255, 96/255, 102/255, 1]);  // inner gray triangle

    
    
}

function resizeImageFromDataURL(dataURL, newWidth) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = dataURL;

        let resizedDataURL = '';
        img.onload = function () {
            const originalWidth = img.width;
            const originalHeight = img.height;

            const newHeight = (originalHeight / originalWidth) * newWidth;

            const canvas = document.createElement("canvas");
            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            resizedDataURL = canvas.toDataURL(); // default is PNG
            resolve(resizedDataURL);
            console.log('resizedDataURL: ' + resizedDataURL);
        };
        // img.src = dataURL;

    });

}

function resizeImage(imgToResize, newWidth) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    const originalWidth = imgToResize.width;
    const originalHeight = imgToResize.height;
    console.log('original width: ' + originalWidth);
    console.log('original height: ' + originalHeight);
    // const canvasWidth = originalWidth * resizingFactor;
    // const canvasHeight = originalHeight * resizingFactor;
  
    canvas.width = newWidth;
    const newHeight = (originalHeight / originalWidth) * newWidth;
    canvas.height = newHeight;
    console.log('canvas width: ' + canvas.width);   
    console.log('canvas height: ' + canvas.height);
  
    context.drawImage(
      imgToResize,
      0,
      0,
      newWidth,
      newHeight,
    );
    return canvas.toDataURL();
  }

function updateSelectedValues() {
    // const red = document.getElementById('redSlider').value;
    // const green = document.getElementById('greenSlider').value;
    // const blue = document.getElementById('blueSlider').value;
    // g_selectedColor = [red / 255.0, green / 255.0, blue / 255.0, 1.0];

    // const size = document.getElementById('sizeSlider').value;
    // g_selectedSize = size;
    // document.getElementById('sizeLabel').innerText = size;

    // const segments = document.getElementById('segmentsSlider').value;
    // g_selectedSegments = segments;
    // document.getElementById('segmentsLabel').innerText = segments;

    // const resizeWidth = document.getElementById('resizeSlider').value;
    // document.getElementById('resizeLabel').innerText = 'Image Size: ' + resizeWidth;

    // const scaleFactor = document.getElementById('scaleFactorSlider').value;
    // document.getElementById('scaleFactorLabel').innerText = 'Pixel Scale Factor: ' + scaleFactor;
    
    // const globalRotateHorizontal = document.getElementById('globalRotateHorizontalSlider').value;
    // g_globalAngleHorizontal = globalRotateHorizontal;
    // document.getElementById('globalRotateHorizontalLabel').innerText = 'Horizontal Rotate: ' + globalRotateHorizontal;

    // const globalRotateVertical = document.getElementById('globalRotateVerticalSlider').value;
    // g_globalAngleVertical = globalRotateVertical;
    // document.getElementById('globalRotateVerticalLabel').innerText = 'Vertical Rotate: ' + globalRotateVertical;

    // document.getElementById('drawImageLabel').innerText = 'Current Shape: ' + g_drawImageSelectedShape;
    renderAllShapes();
}

function renderAllShapes() {
    console.log('renderAllShapes');
    var startTime = performance.now();
    // Clear <canvas>
    var globalRotMat = new Matrix4().rotate(g_globalAngleHorizontal, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleVertical, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    

    // var body = new Cube();
    // body.color = [0.2,0.6,0,1];
    // body.matrix.setTranslate(0, 0, 0);
    // body.matrix.rotate(0, 0, 0, 1);
    // body.matrix.scale(0.5, 0.5, 0.5);
    // body.render();
    var upperBody = new Cube();
    upperBody.color = [0, 1, 0];
    upperBody.matrix.translate(-.1, 0.27, 0);
    upperBody.matrix.scale(0.5,.235,.25);
    var upperBodyPos = new Matrix4(upperBody.matrix);
    upperBody.render();

    var neckLeft1 = new Cube(upperBodyPos);
    neckLeft1.color = [0, 1, 0];
    neckLeft1.matrix.translate(0, 1, 0);
    neckLeft1.matrix.scale(.16,.5,1);
    neckLeft1.matrix.rotate(-85, 0, 0, 1);
    neckLeft1.render();
    
    var neckLeft2 = new Cube(upperBodyPos);
    neckLeft2.color = [1, 0, 0];
    neckLeft2.matrix.translate(0.2, 1, 0);
    neckLeft2.matrix.scale(.25,2,1);
    neckLeft2.matrix.rotate(55, 0, 0, 1);
    neckLeft2.render();

    // var leftArm = new Arm(body.matrix);
    // leftArm.draw();
    
    // var leftArm = new Cube();
    // leftArm.color = [0.2,0.6,0,1];
    // leftArm.matrix.setTranslate(.7, 0, 0)
    // leftArm.matrix.rotate(45, 0, 0, 1)
    // leftArm.matrix.scale(0.25, 0.7, 0.5)
    // leftArm.render();
    // var len = g_shapes.length;
    // for(var i = 0; i < len; i++) {
    //     g_shapes[i].render();
    // }

    
    // var duration = performance.now() - startTime;
    // document.getElementById('performanceLabel').innerText = 'numdot: ' +
    // len + ' ms: ' + Math.floor(duration) + ' fps: ' +
    // Math.floor(10000.0 /duration);
    // // console.log('numdot: ' + len + ' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(10000.0 /duration));
}

let g_shoulderAngle = 0;
let g_elbowAngle = 0;
let g_wristAngle = 0;
class Arm {
    constructor(startMatrix) {
        if (!startMatrix) {
            this.matrix = new Matrix4();
        } else {
            this.matrix = new Matrix4(startMatrix); // Matrix to start at
        }
        // this.shoulderAngle = 5;
        // this.elbowAngle = 0;
        // this.wristAngle = 0;
    }

    draw() {
        // var bo
        var arm = new Cube();
        arm.color = [0.25, 0.25, 0.25];
        arm.matrix.setTranslate(0, -0.5, 0);
        arm.matrix.rotate(-5, 1, 0, 0);
        arm.matrix.rotate(g_shoulderAngle, 0, 0, 1);
        arm.matrix.scale(.2501, .7, .2501)
        arm.matrix.translate(-1, 0, 0);
        arm.render();

        var forearm = new Cube();
        forearm.color = [0.25, 1, 0.25];
        forearm.matrix = new Matrix4(arm.matrix);
        forearm.matrix.setTranslate(0, .5, 0);
        forearm.render();
        forearm.matrix.scale(0.25, 0.7, 0.25);
        // forearm.matrix.rotate(-5, 1, 0, 0);
        // forearm.matrix.rotate(g_elbowAngle, 0, 0, 1);
        // arm.color = [0,0,0];
        // arm.matrix.setTranslate(0, -0.5, 0);
        // arm.matrix.rotate(-5,1,0,0);
        // arm.matrix.rotate(this.shoulderAngle, 0, 0, 1);
        // const forearmStart = new Matrix4(this.matrix);
        // arm.matrix.scale(0.25, 0.7, 0.25)
        // arm.matrix.rotate(this.shoulderAngle, 0, 0, 1);
        // // arm.matrix.translate(0, 0.5, 0);
        // arm.render();

        // var forearm = new Cube();
        // forearm.color = [0,0,0];
        // forearm.matrix = forearmStart;
        // forearm.matrix.scale(0.15, 0.7, 0.15);
        // forearm.matrix.translate(0, 0, 0);
        // forearm.render();

        // var forearm = new Cube();
        
        // var elbow = new Cube(); // to fill in the elbow
    }
}


function registerArmCallbacks() {
    // document.getElementById('shoulderAngleSlider').addEventListener('mousemove', function(e) {

    // });
    // document.getElementById('elbowAngleSlider').addEventListener('mousemove', function(e) {
    //     if (e.buttons != 1) {
    //         return;
    //     }
    //     g_elbowAngle = Number(this.value);
    //     document.getElementById('elbowAngleLabel').innerText = 'Elbow Angle: ' + this.value;
    //     renderAllShapes();
    // });
    // document.getElementById('wristAngleSlider').addEventListener('mousemove', function(e) {
    //     if (e.buttons != 1) {
    //         return;
    //     }
    //     g_wristAngle = Number(this.value);
    //     document.getElementById('wristAngleLabel').innerText = 'Wrist Angle: ' + this.value;
    //     renderAllShapes();
    // });
    document.getElementById('resetAngles').addEventListener('click', function() {
        g_shoulderAngle = 0;
        g_elbowAngle = 0;
        g_wristAngle = 0;
        document.getElementById('shoulderAngleLabel').innerText = 'Shoulder Angle: 0';
        document.getElementById('elbowAngleLabel').innerText = 'Elbow Angle: 0';
        document.getElementById('wristAngleLabel').innerText = 'Wrist Angle: 0';
        
        renderAllShapes();
    });
}
function convertCoordinatesEventToGL(event) {
    var x = event.clientX; // x coordinate of a mouse pointer
    var y = event.clientY; // y coordinate of a mouse pointer
    var rect = event.target.getBoundingClientRect();
    
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    
    return [x, y];
}
