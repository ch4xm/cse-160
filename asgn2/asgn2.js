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
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
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
    [x, y] = convertCoordinatesEventToGL(event);
    // Store the coordinates to points array
    // let shape = null;
    // switch(selectedShape) {
    //     case 'point':
    //         shape = new Point();
    //         break;
    //     case 'triangle':
    //         shape = new Triangle();
    //         break;
    //     case 'circle':
    //         shape = new Circle();
    //         shape.segments = g_selectedSegments;
    //         break;
    //     default:
    //         console.log('Unknown shape type');
    //         return;
    // }
    // shape = new Point();

    // shape.position = [x, y, 0.0];
    // shape.color = g_selectedColor.slice();
    // shape.size = Number(g_selectedSize);
    // g_shapes.push(shape);
    
    renderAllShapes();
}

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // The current color of the selected point
let g_selectedSize = 10.0; // The current size of the selected point
let g_selectedSegments = 10; // The current number of segments for the selected circle

let g_globalAngleHorizontal = 180;
let g_globalAngleVertical = 0;
let g_neckAngleVertical = 0;
let g_neckAngleHorizontal = 0;

let g_rightShoulderAngleForward = 0;
let g_rightShoulderAngleLateral = 50;
let g_rightShoulderAngleInOut = 0;

let g_rightElbowAngle = 0;
let g_rightWristAngle = 0;

let g_leftShoulderAngleForward = 0;
let g_leftShoulderAngleLateral = 225;
let g_leftShoulderAngleInOut = 0;

let g_leftElbowAngle = 0;
let g_leftWristAngle = 0;

let g_rightHipAngle   = 180;
let g_rightKneeAngle  = 180;

let g_leftHipAngle    = 0;
let g_leftKneeAngle   = 0;

const sliders = [
    {sectionTitle: 'Global Rotation', 
    sliders: [
        {
            id: 'globalRotateHorizontal',
            label: 'Global Rotate Horizontal',
            min: 0,
            max: 360,
            value: 180,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_globalAngleHorizontal = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
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
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_globalAngleVertical = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
    ]},
    {
        sectionTitle: 'Head Rotation',
        sliders: [
        {
            id: 'neckAngleVertical',
            label: 'Neck Angle (Up/Down)',
            min: -30,
            max: 30,
            value: 0,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_neckAngleVertical = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
        {
            id: 'neckAngleHorizontal',
            label: 'Neck Angle (Left/Right)',
            min: -30,
            max: 30,
            value: 0,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_neckAngleHorizontal = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
    ]},
    {
        sectionTitle: 'Right Arm',
        sliders: [
        {
            id: 'rightShoulderAngleLateral',
            label: 'Shoulder Angle (Lateral)',
            min: -60,
            max: 70,
            value: 50,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_rightShoulderAngleLateral = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
        {
            id: 'rightShoulderAngleForward',
            label: 'Shoulder Angle (Forward)',
            min: -60,
            max: 60,
            value: 0,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_rightShoulderAngleForward = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
        {
            id: 'rightElbowAngle',
            label: 'Elbow Angle',
            min: 0,
            max: 90,
            value: 0,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_rightElbowAngle = -Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
        {
            id: 'rightWristAngle',
            label: 'Wrist Angle',
            min: -75,
            max: 20,
            value: 0,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_rightWristAngle = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
    ]},
    {
        sectionTitle: 'Left Arm',
        sliders: [
        {
            id: 'leftShoulderAngleLateral',
            label: 'Shoulder Angle (Lateral)',
            min: 120,
            max: 240,
            value: 225,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_leftShoulderAngleLateral = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
        {
            id: 'leftShoulderAngleForward',
            label: 'Shoulder Angle (Forward)',
            min: -60,
            max: 60,
            value: 0,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_leftShoulderAngleForward = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
        {
            id: 'leftElbowAngle',
            label: 'Elbow Angle',
            min: 0,
            max: 90,
            value: 0,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_leftElbowAngle = -Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
        {
            id: 'leftWristAngle',
            label: 'Wrist Angle',
            min: -25,
            max: 20,
            value: 0,
            step: 1,
            onChange: function(event, slider) {
                if (event.buttons != 1) {
                    return;
                }
                const value = event.target.value;
                g_leftWristAngle = Number(value);
                document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + value;
                renderAllShapes();
            }
        },
    ]},
    {
        sectionTitle: 'Right Leg',
        sliders: [
          {
            id: 'rightHipAngle',
            label: 'Hip Angle',
            min: 60, max: 270, value: 180, step: -1,
            onChange(e, s) {
              if (e.buttons!=1) return;
              g_rightHipAngle  = Number(e.target.value);
              document.getElementById(s.id+'Label').innerText = s.label+':\xa0'+e.target.value;
              renderAllShapes();
            }
          },
          {
            id: 'rightKneeAngle',
            label: 'Knee Angle',
            min: 0, max: 60, value: 0, step: -1,
            onChange(e, s) {
              if (e.buttons!=1) return;
              g_rightKneeAngle = Number(e.target.value);
              document.getElementById(s.id+'Label').innerText = s.label+':\xa0'+e.target.value;
              renderAllShapes();
            }
          }
        ]
      },
      {
        sectionTitle: 'Left Leg',
        sliders: [
          {
            id: 'leftHipAngle',
            label: 'Hip Angle',
            min: -90, max: 90, value: 0, step: 1,
            onChange(e, s) {
              if (e.buttons!=1) return;
              g_leftHipAngle   = Number(e.target.value);
              document.getElementById(s.id+'Label').innerText = s.label+':\xa0'+e.target.value;
              renderAllShapes();
            }
          },
          {
            id: 'leftKneeAngle',
            label: 'Knee Angle',
            min: 0, max: 120, value: 0, step: 1,
            onChange(e, s) {
              if (e.buttons!=1) return;
              g_leftKneeAngle  = Number(e.target.value);
              document.getElementById(s.id+'Label').innerText = s.label+':\xa0'+e.target.value;
              renderAllShapes();
            }
          }
        ]
      }
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

    sliders.forEach(sliderCategory => {
        const sectionTitle = document.createElement('h3');
        sectionTitle.innerText = sliderCategory.sectionTitle;
        parentElement.appendChild(sectionTitle);

        sliderCategory.sliders.forEach(slider => {
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
            labelElement.innerText = '\xa0\xa0' + slider.label + ': ' + slider.value;
            labelElement.id = slider.id + 'Label';
            labelElement.setAttribute('for', slider.id);
            sliderContainer.appendChild(labelElement);
            parentElement.appendChild(sliderContainer);
            parentElement.appendChild(document.createElement('br'));
            slider.label = '\xa0\xa0' + slider.label;
            sliderElement.addEventListener('mousemove', function(event) {
                slider.onChange(event, slider);
            });
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

    g_globalAngleHorizontal = gl_x * 90 + 180;
    g_globalAngleVertical = gl_y * 90;

    document.getElementById('globalRotateHorizontalLabel').innerText = '\xa0\xa0Global Rotate Horizontal: ' + g_globalAngleHorizontal.toFixed(2);
    document.getElementById('globalRotateVerticalLabel').innerText = '\xa0\xa0Global Rotate Vertical: ' + g_globalAngleVertical.toFixed(2);

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
    // console.log('renderAllShapes');
    var startTime = performance.now();
    // Clear <canvas>
    var globalRotMat = new Matrix4().rotate(-g_globalAngleHorizontal, 0, 1, 0);
    globalRotMat.rotate(-g_globalAngleVertical, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    

    // var body = new Cube();
    // body.color = [0.2,0.6,0,1];
    // body.matrix.setTranslate(0, 0, 0);
    // body.matrix.rotate(0, 0, 0, 1);
    // body.matrix.scale(0.5, 0.5, 0.5);
    // body.render();
    // var solidColor = [1,1,1,.4] // [0.2,0.6,0,.5];
    var solidColor = [1,1,1,0.5];
    
    var upperBody = new Cube();
    upperBody.color = solidColor;
    upperBody.matrix.translate(-.1, 0.27, 0);
    const upperBodyPos = new Matrix4(upperBody.matrix);
    upperBody.matrix.scale(0.5,.235,.2);
    var upperBodyPosScaled = new Matrix4(upperBody.matrix);
    upperBody.matrix.scale(1,1,1.1)
    
    var heart = new Cube(upperBodyPosScaled);
    heart.color = [1,0,0,1];
    heart.matrix.translate(.3, .275, .5);
    heart.matrix.scale(0.15, 0.2, .25);
    heart.render();
    upperBody.render();

    var lowerBody = new Cube(upperBodyPosScaled);
    lowerBody.color = solidColor;
    lowerBody.matrix.translate(0.07, -1, .05);
    var lowerBodyPosNonScaled = new Matrix4(lowerBody.matrix);
    lowerBody.matrix.scale(.85,1,.9);
    var lowerBodyPos = new Matrix4(lowerBody.matrix);
    lowerBody.render();

    var upperleftBody = new Cube(upperBodyPosScaled);
    upperleftBody.color = solidColor;
    upperleftBody.matrix.translate(.075, -.4, 0.05);
    upperleftBody.matrix.rotate(10, 0, 0, 1);
    upperleftBody.matrix.scale(.25,.65,.9);
    upperleftBody.render();

    var upperRightBody = new Cube(upperBodyPosScaled);
    upperRightBody.color = solidColor;
    upperRightBody.matrix.translate(.675, -.35, 0.05);
    upperRightBody.matrix.rotate(-10, 0, 0, 1);
    upperRightBody.matrix.scale(.25,.65,.9);
    upperRightBody.render();

    var leftBottomArmConnector = new Cube(upperBodyPosScaled);
    leftBottomArmConnector.color = solidColor;
    leftBottomArmConnector.matrix.translate(0, 0, 0);
    leftBottomArmConnector.matrix.rotate(20, 0, 0, 1);
    leftBottomArmConnector.matrix.scale(.25,.25,.9);
    leftBottomArmConnector.render();

    var leftMiddleArmConnector = new Cube(upperBodyPosScaled);
    leftMiddleArmConnector.color = solidColor;
    leftMiddleArmConnector.matrix.translate(-.075, .22, 0);
    var leftMiddleArmConnectorPos = new Matrix4(leftMiddleArmConnector.matrix);
    leftMiddleArmConnector.matrix.rotate(15, 0, 0, 1);
    leftMiddleArmConnector.matrix.scale(.4,.69,.9);
    leftMiddleArmConnector.render();

    var leftTopArmConnector = new Cube(upperBodyPosScaled);
    leftTopArmConnector.color = solidColor;
    leftTopArmConnector.matrix.rotate(25, 0, 0, 1);
    leftTopArmConnector.matrix.scale(.15,.15,.9);
    leftTopArmConnector.matrix.translate(1.8, 5, 0);
    leftTopArmConnector.render();

    var rightBottomArmConnector = new Cube(upperBodyPosScaled);
    rightBottomArmConnector.color = solidColor;
    rightBottomArmConnector.matrix.translate(.985, 0, 0);
    rightBottomArmConnector.matrix.rotate(40, 0, 0, 1);
    rightBottomArmConnector.matrix.scale(-.25,.25,.9);
    rightBottomArmConnector.render();

    var rightMiddleArmConnector = new Cube(upperBodyPosScaled);
    rightMiddleArmConnector.color = solidColor;
    rightMiddleArmConnector.matrix.translate(.65, .35, 0);
    var rightMiddleArmConnectorPos = new Matrix4(leftMiddleArmConnector.matrix);
    rightMiddleArmConnector.matrix.rotate(-20, 0, 0, 1);
    rightMiddleArmConnector.matrix.scale(.4,.7,.9);
    rightMiddleArmConnector.render();

    var rightArmJoint = new Cube(leftMiddleArmConnectorPos);
    rightArmJoint.color = solidColor;
    rightArmJoint.matrix.translate(1.1, .575, 0);
    rightArmJoint.matrix.rotate(-g_rightShoulderAngleLateral, 0, 0, 1);
    const rightArmJointPos = new Matrix4(rightArmJoint.matrix);
    rightArmJoint.matrix.scale(.05,.05,.05);
    rightArmJoint.render();

    var rightShoulder = new Cube(rightArmJointPos) //Cylinder(leftArmJointPos);
    rightShoulder.color = solidColor;
    rightShoulder.matrix.translate(0.05, -.235, 0.1);
    rightShoulder.matrix.rotate(g_rightShoulderAngleForward, 0, 1, 0);
    const rightShoulderPos = new Matrix4(rightShoulder.matrix);
    rightShoulder.matrix.scale(.9,.5,.7);
    rightShoulder.render();

    var rightElbowJoint = new Cube(rightShoulderPos);
    rightElbowJoint.matrix.translate(.75, 0.3, .5);
    rightElbowJoint.matrix.rotate(g_rightElbowAngle, 0, 1, 0);
    rightElbowJoint.matrix.rotate(180, 1, 0, 0);
    const rightElbowJointPos = new Matrix4(rightElbowJoint.matrix);
    rightElbowJoint.matrix.scale(.25,.1,.1);
    rightElbowJoint.render();
    
    const rightElbow = new Cube(rightElbowJointPos);
    rightElbow.color = solidColor;
    rightElbow.matrix.translate(-0.35, -.25, -.15);
    rightElbow.matrix.scale(.5,.6,.6);
    rightElbow.render();

    var rightForearm = new Cube(rightElbowJointPos);
    rightForearm.color = solidColor;
    const rightForearmPos = new Matrix4(rightForearm.matrix);
    rightForearm.matrix.scale(1.2,.35,.45);
    rightForearm.matrix.rotate(5, 0, 0,1);
    rightForearm.matrix.translate(.1, -.35, 0);
    rightForearm.render();
    
    const rightWristJoint = new Cube(rightForearmPos);
    rightWristJoint.matrix.translate(1.3, 0.15, .25);
    rightWristJoint.matrix.rotate(g_rightWristAngle, 0, 1, 0);
    rightWristJoint.matrix.rotate(180, 1, 0, 0);
    const rightWristJointPos = new Matrix4(rightWristJoint.matrix);
    rightWristJoint.matrix.scale(.25,.1,.1);
    // leftWristJoint.render();

    const rightWrist = new Cube(rightWristJointPos);
    rightWrist.color = solidColor;
    rightWrist.matrix.translate(-0.1, -.175, -.175);
    rightWrist.matrix.scale(.55,.5,.45);
    rightWrist.render();


    var leftArmJoint = new Cube(leftMiddleArmConnectorPos);
    leftArmJoint.color = solidColor;
    leftArmJoint.matrix.translate(0.1,  0.575, 0);
    leftArmJoint.matrix.rotate(  g_leftShoulderAngleLateral, 0, 0, 1);
    const leftArmJointPos = new Matrix4(leftArmJoint.matrix);
    leftArmJoint.matrix.scale(.05, .05, .05);
    leftArmJoint.render();

    var leftShoulder = new Cube(leftArmJointPos);
    leftShoulder.color = solidColor;
    leftShoulder.matrix.translate(0, -0.25, 0);
    leftShoulder.matrix.rotate(g_leftShoulderAngleForward, 0, 1, 0);
    const leftShoulderPos = new Matrix4(leftShoulder.matrix);
    leftShoulder.matrix.scale(.95, .5, .7);
    leftShoulder.render();

    var leftElbowJoint = new Cube(leftShoulderPos);
    leftElbowJoint.color = solidColor;
    leftElbowJoint.matrix.translate(.9, 0.3, .5);
    leftElbowJoint.matrix.rotate(g_leftElbowAngle, 0, 1, 0);
    leftElbowJoint.matrix.rotate(180, 1, 0, 0);
    const leftElbowJointPos = new Matrix4(leftElbowJoint.matrix);
    leftElbowJoint.matrix.scale(.25, .1, .1);
    leftElbowJoint.render();

    var leftElbow = new Cube(leftElbowJointPos);
    leftElbow.color = solidColor;
    leftElbow.matrix.translate( -0.35, -0.25, -0.15);
    leftElbow.matrix.scale( .5, .6, .6);
    leftElbow.render();

    var leftForearm = new Cube(leftElbowJointPos);
    leftForearm.color = solidColor;
    const leftForearmPos = new Matrix4(leftForearm.matrix);
    leftForearm.matrix.scale(  1.5, .35, .45);
    leftForearm.matrix.rotate(-5, 0, 0, 1);
    leftForearm.matrix.translate(-.1, -.35, 0);
    leftForearm.render();

    var leftWristJoint = new Cube(leftForearmPos);
    leftWristJoint.matrix.translate(.9,  0.15, .25);
    leftWristJoint.matrix.rotate(g_leftWristAngle, 0, 1, 0);
    leftWristJoint.matrix.rotate(180, 1, 0, 0);
    const leftWristJointPos = new Matrix4(leftWristJoint.matrix);
    leftWristJoint.matrix.scale(.25, .1, .1);
    // leftWristJoint.render();

    var leftWrist = new Cube(leftWristJointPos);
    leftWrist.color = solidColor;
    leftWrist.matrix.translate( 0.35, -0.175, -0.175);
    leftWrist.matrix.scale( .4, .5, .45);
    leftWrist.render();

    //  var leftArmJoint = new Cube(upperBodyPos);
    //  leftArmJoint.color = solidColor;
    //  leftArmJoint.matrix.translate(  0, 1, 0);
    //  leftArmJoint.matrix.rotate(g_leftShoulderAngleLateral, 0, 0, 1);
    //  const leftArmJointPos = new Matrix4(leftArmJoint.matrix);
    //  leftArmJoint.matrix.scale(.25, .25, .25);
    //  leftArmJoint.render();
    // var leftArmJoint = new Cube(rightMiddleArmConnectorPos);
    // leftArmJoint.color = solidColor;
    // leftArmJoint.matrix.translate(.025,  0.55, 0);
    // leftArmJoint.matrix.rotate(g_leftShoulderAngleLateral, 0, 0, 1);
    // const leftArmJointPos = new Matrix4(leftArmJoint.matrix);
    // leftArmJoint.matrix.scale(.1, .1, .1);
    // leftArmJoint.render();
 
    //  var leftShoulder = new Cube(leftArmJointPos);
    //  leftShoulder.color = solidColor;
    //  leftShoulder.matrix.translate(-0.05, -0.235, 0.1);
    //  leftShoulder.matrix.rotate(-g_leftShoulderAngleForward, 0, 1, 0);
    //  const leftShoulderPos = new Matrix4(leftShoulder.matrix);
    //  leftShoulder.matrix.scale(.9, .5, .7);
    //  leftShoulder.render();
 
    //  var leftElbowJoint = new Cube(leftShoulderPos);
    //  leftElbowJoint.color = solidColor;
    //  leftElbowJoint.matrix.translate(-0.75, 0.3, .5);
    //  leftElbowJoint.matrix.rotate(  g_leftElbowAngle, 0, 1, 0);
    //  leftElbowJoint.matrix.rotate(180, 1, 0, 0);
    //  const leftElbowJointPos = new Matrix4(leftElbowJoint.matrix);
    //  leftElbowJoint.matrix.scale(.25, .1, .1);
    //  leftElbowJoint.render();
 
    //  var leftElbow = new Cube(leftElbowJointPos);
    //  leftElbow.color = solidColor;
    //  leftElbow.matrix.translate( 0.35, -0.25, -0.15);
    //  leftElbow.matrix.scale( .5, .6, .6);
    //  leftElbow.render();
 
    //  var leftForearm = new Cube(leftElbowJointPos);
    //  leftForearm.color = solidColor;
    //  const leftForearmPos = new Matrix4(leftForearm.matrix);
    //  leftForearm.matrix.scale(  1.2, .35, .45);
    //  leftForearm.matrix.rotate(-5, 0, 0, 1);
    //  leftForearm.matrix.translate(-.1, -.35, 0);
    //  leftForearm.render();
 
    //  var leftWristJoint = new Cube(leftForearmPos);
    //  leftWristJoint.color = solidColor;
    //  leftWristJoint.matrix.translate(-1.3,  0.15, .25);
    //  leftWristJoint.matrix.rotate(  g_leftWristAngle, 0, 1, 0);
    //  leftWristJoint.matrix.rotate(180, 1, 0, 0);
    //  const leftWristJointPos = new Matrix4(leftWristJoint.matrix);
    //  leftWristJoint.matrix.scale(.25, .1, .1);
    //  leftWristJoint.render();
 
    //  var leftWrist = new Cube(leftWristJointPos);
    //  leftWrist.color = solidColor;
    //  leftWrist.matrix.translate( 0.1, -0.175, -0.175);
    //  leftWrist.matrix.scale( .55, .5, .45);
    //  leftWrist.render();

    var rightTopArmConnector = new Cube(upperBodyPosScaled);
    rightTopArmConnector.color = solidColor;
    rightTopArmConnector.matrix.rotate(-25, 0, 0, 1);
    rightTopArmConnector.matrix.scale(-.2,.15,.9);
    rightTopArmConnector.matrix.translate(-3.1, 7.82, 0);
    rightTopArmConnector.render();

    var pelvis = new Cube(lowerBodyPos);
    pelvis.color = solidColor;
    pelvis.matrix.translate(-.2, -.5, -0.05);
    const pelvisPos = new Matrix4(pelvis.matrix);
    pelvis.matrix.scale(1.4,.5,1.2);
    pelvis.render();

    // const rightLegJoint = new Cube(pelvisPos);
    // rightLegJoint.color = solidColor;
    // rightLegJoint.matrix.translate(.5, -.5, .5);
    // rightLegJoint.matrix.rotate(g_rightHipAngle, 1,0,0);
    // // rightLegJoint.matrix.rotate(180, 1, 0, 0);
    // const rightLegJointPos = new Matrix4(rightLegJoint.matrix);
    // rightLegJoint.matrix.scale(.1,.25,.1);
    // rightLegJoint.render();


    var leftLowerBody = new Cube(upperBodyPosScaled);
    leftLowerBody.color = solidColor;
    leftLowerBody.matrix.translate(-.1, -1, .05);
    leftLowerBody.matrix.rotate(-15, 0, 0, 1);
    leftLowerBody.matrix.scale(.25,.75,.9);
    leftLowerBody.render();

    var rightLowerBody = new Cube(upperBodyPosScaled);
    rightLowerBody.color = solidColor;
    rightLowerBody.matrix.translate(.85, -1.075, .05);
    rightLowerBody.matrix.rotate(15, 0, 0, 1);
    rightLowerBody.matrix.scale(.25,.75,.9);
    rightLowerBody.render();

    var neckMiddle = new Cube(upperBodyPosScaled);
    neckMiddle.color = solidColor;
    neckMiddle.matrix.translate(.33, .95, 0);
    neckMiddle.matrix.scale(.33,.35,.95);
    const neckMiddlePos = new Matrix4(neckMiddle.matrix);
    neckMiddle.matrix.translate(.05, 0, 0);
    neckMiddle.matrix.scale(.9,1,1);
    // neckMiddle.render();

    var neckJoint = new Cube(neckMiddlePos);
    neckJoint.color = [0,0,0,0];
    neckJoint.matrix.translate(.55, .5, .45);
    neckJoint.matrix.rotate(180, 0, 1,0);
    neckJoint.matrix.rotate(-90, 1, 0, 0);
    neckJoint.matrix.rotate(g_neckAngleVertical, 1, 0, 0);
    neckJoint.matrix.rotate(g_neckAngleHorizontal, 0, 0, 1);
    neckJoint.matrix.scale(1,.9,1);
    const neckJointPos = new Matrix4(neckJoint.matrix);
    neckJoint.matrix.scale(.1,.05,1);
    
    const upperNeck = new Cube(neckJointPos);
    upperNeck.color = solidColor;
    upperNeck.matrix.translate(-.45, -.45, -.2);
    upperNeck.matrix.scale(1,.95,.75);
    upperNeck.render();

    const headTop = new Cube(neckJointPos);
    headTop.color = solidColor;
    headTop.matrix.translate(-.6, -.6, .75);
    headTop.matrix.scale(1.3,1.4,1.15);
    let headPos = new Matrix4(headTop.matrix);
    headTop.matrix.translate(-0.125, -.05, .95);
    headTop.matrix.scale(1.2,1.1,.2);
    headTop.render();

    const headTopLeft = new Cube(headPos);
    headTopLeft.color = solidColor;
    headTopLeft.matrix.translate(.8,0,.6);
    headTopLeft.matrix.rotate(-30, 0, 1, 0);
    headTopLeft.matrix.scale(.2,1,.5);
    headTopLeft.render();

    const headTopRight = new Cube(headPos);
    headTopRight.color = solidColor;
    headTopRight.matrix.translate(0,0,.7);
    headTopRight.matrix.rotate(30, 0, 1, 0);
    headTopRight.matrix.scale(.2,1,.5);
    headTopRight.render();
    
    const crownBase = new Cube(headPos);
    crownBase.color = [.95,.95,.95,1];
    crownBase.matrix.translate(0, 0, 1.15);
    crownBase.matrix.scale(1,.75,.85);
    crownBase.render();

    const crownFlip = new Cube(headPos);
    crownFlip.color = solidColor;
    crownFlip.matrix.scale(-1,1,1);
    crownFlip.matrix.translate(-1, 0, 0);
    const crownPos = new Matrix4(crownFlip.matrix);

    const crownSpike1 = new Cube(crownPos);
    crownSpike1.color = [.9,.9,.9,.9];
    crownSpike1.matrix.translate(1, .75, 1.1);
    crownSpike1.matrix.scale(.2,.2,1);
    crownSpike1.render();

    const crownSpike2 = new Cube(crownPos);
    crownSpike2.color = [.95,.95,.95,.9];
    crownSpike2.matrix.translate(.8, .85, 1.1);
    crownSpike2.matrix.scale(.2,.2,2.25);
    crownSpike2.render();

    const crownSpike3 = new Cube(crownPos);
    crownSpike3.color = [.85,.85,.85,.9];
    crownSpike3.matrix.translate(.6, .85, 1.1);
    crownSpike3.matrix.scale(.2,.2,2);
    crownSpike3.render();

    const crownSpike4 = new Cube(crownPos);
    crownSpike4.color = [1,1,1,.9];
    crownSpike4.matrix.translate(.4, .85, 1.1);
    crownSpike4.matrix.scale(.2,.2,2.3);
    crownSpike4.render();

    const crownSpike5 = new Cube(crownPos);
    crownSpike5.color = [1,1,1,.9];
    crownSpike5.matrix.translate(.4, 1, 2);
    crownSpike5.matrix.scale(.2,.2,1);
    crownSpike5.render();

    const crownSpike6 = new Cube(crownPos);
    crownSpike6.color = [.95,.95,.95,.9];
    crownSpike6.matrix.translate(.2, .85, 1.1);
    crownSpike6.matrix.scale(.2,.2,1.9);
    crownSpike6.render();

    const crownSpike7 = new Cube(crownPos);
    crownSpike7.color = [.95,.95,.95,.9];
    crownSpike7.matrix.translate(-.1, .8, 1.1);
    crownSpike7.matrix.rotate(-5, 0, 1, 0);
    crownSpike7.matrix.scale(.3,.2,1.4);
    crownSpike7.render();
    
    const crownBack = new Cube(crownPos);
    crownBack.color = [1,1,1,1];
    crownBack.matrix.translate(-.1, 0, 1.1);
    crownBack.matrix.scale(1,.5,1);

    const headRight = new Cube(headPos);
    headRight.color = [1,1,1,1];
    headRight.matrix.translate(0, 0, 0);
    headRight.matrix.rotate(-2.5, 0, 1, 0);
    headRight.matrix.scale(.2,1,1);
    headRight.render();

    const headLeft = new Cube(headPos);
    headLeft.color = [1,1,1,1];
    headLeft.matrix.translate(.775, 0, 0);
    headLeft.matrix.rotate(2.5, 0, 1, 0);
    headLeft.matrix.scale(.2,1,1);
    headLeft.render();
    
    const faceHole = new Cube(headPos);
    faceHole.color = [0,0,0,1];
    faceHole.matrix.translate(0.2, .45, -.25);
    faceHole.matrix.scale(.6,.5,1.2);
    faceHole.render();

    const headBack = new Cube(headPos);
    headBack.color = [1,1,1,1];
    headBack.matrix.translate(0.175, -.0001, -.25);
    headBack.matrix.scale(.625,.5,1.2);
    headBack.render();

    const chinRight = new Cube(headPos);
    chinRight.color = [1,1,1,1];
    chinRight.matrix.translate(.3,0,-0.5);
    chinRight.matrix.rotate(30, 0, -1, 0);
    chinRight.matrix.scale(.25,1,.6);
    chinRight.render();

    const chinLeft = new Cube(headPos);
    chinLeft.color = [1,1,1,1];
    chinLeft.matrix.translate(.475,0,-0.375);
    chinLeft.matrix.rotate(-30, 0, -1, 0);
    chinLeft.matrix.scale(.25,1,.6);
    chinLeft.render();

    const chinBottom = new Cube(headPos);
    chinBottom.color = [1,1,1,1];
    chinBottom.matrix.translate(.275,0,-.5);
    chinBottom.matrix.scale(.45,1,.25);
    chinBottom.render();

    var neckLeft1 = new Cube(upperBodyPosScaled);
    neckLeft1.color = solidColor;
    neckLeft1.matrix.translate(0, 1, 0);
    neckLeft1.matrix.scale(.16,.5,1);
    neckLeft1.matrix.rotate(-85, 0, 0, 1);
    neckLeft1.render();
    
    var neckLeft2 = new Cube(upperBodyPosScaled);
    neckLeft2.color = solidColor;
    neckLeft2.matrix.translate(0.25, .8, 0);
    neckLeft2.matrix.rotate(40, 0, 0, 1);
    neckLeft2.matrix.scale(.4,.25,1);
    neckLeft2.render();

    var neckRight1 = new Cube(upperBodyPosScaled);
    neckRight1.color = solidColor;
    neckRight1.matrix.translate(1, 1, 0);
    neckRight1.matrix.scale(-.16,.5,1);
    neckRight1.matrix.rotate(-85, 0, 0, 1);
    neckRight1.render();

    var neckRight2 = new Cube(upperBodyPosScaled);
    neckRight2.color = solidColor;
    neckRight2.matrix.translate(.75, .8, 0);
    neckRight2.matrix.rotate(-40, 0, 0, 1);
    neckRight2.matrix.scale(-.4,.25,1);
    neckRight2.render();
    
    // var duration = performance.now() - startTime;
    // document.getElementById('performanceLabel').innerText = 'numdot: ' + ' ms: ' + Math.floor(duration) + ' fps: ' +
    // Math.floor(10000.0 /duration);
    // console.log('numdot: ' + ' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(10000.0 /duration));
}

class Arm {
    constructor(startMatrix) {
        this.matrix = new Matrix4(startMatrix) || new Matrix4();
        // if (!startMatrix) {
        //     this.matrix = new Matrix4();
        // } else {
        //     this.matrix = new Matrix4(startMatrix); // Matrix to start at
        // }
        // this.shoulderAngle = 5;
        // this.elbowAngle = 0;
        // this.wristAngle = 0;
    }

    render() {
        // var bo
        var arm = new Cube();
        arm.color = [0.25, 0.25, 0.25];
        arm.matrix.setTranslate(0, -0.5, 0);
        arm.matrix.rotate(-5, 1, 0, 0);
        arm.matrix.rotate(g_leftShoulderAngle, 0, 0, 1);
        arm.matrix.scale(.2501, .7, .2501)
        arm.matrix.translate(-1, 0, 0);
        arm.render();

        var forearm = new Cube();
        forearm.color = [0.25, 1, 0.25];
        forearm.matrix = new Matrix4(arm.matrix);
        forearm.matrix.setTranslate(0, .5, 0);
        forearm.render();
        // forearm.matrix.scale(0.25, 0.7, 0.25);
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
    document.getElementById('resetAllSliders').addEventListener('click', function() {
        g_leftShoulderAngle = 0;
        g_rightElbowAngle = 0;
        g_rightWristAngle = 0;
        g_globalAngleHorizontal = 180;
        g_globalAngleVertical = 0;

        sliders.forEach(slider => {
            console.log(slider.id + 'Label', slider.value);
            document.getElementById(slider.id + 'Label').innerText = slider.label + ':\xa0' + slider.value;
            document.getElementById(slider.id + 'Slider').value = slider.value;
        })
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
