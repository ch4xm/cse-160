// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
const CANVAS_ID = "canvas";

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;

let g_startTime = performance.now() / 1000;
let g_seconds = performance.now() / 1000 - g_startTime;

let shouldAnimate = false;
let stopAnimation = false;

let g_camera = new Camera();

var pressedKeys = {};

document.onkeydown = function (event) {
  event.preventDefault();
  console.log(event.keyCode);
  pressedKeys[event.keyCode] = true;
};

document.onmousedown = function (event) {
  event.preventDefault();
  console.log(event.button);
  // console.log("Left mouse button clicked", g_camera.at.add(g_camera.eye));
  const newVector = new Vector3();
  newVector.set(g_camera.at); //.normalize();
  // newVector.mul(3)
  newVector.sub(g_camera.eye).normalize();

  const target = new Vector3();
  target.set(g_camera.eye);
  target.add(newVector.mul(3));

  let [x, z, y] = target.elements;
  x = Math.round(x) - 1;
  y = Math.round(y);
  z = Math.round(z);
  if (event.button == 2) {
    placeBlock(x, y, -0.445 + z, EYE_TEXTURE);
  } else if (event.button == 0) {
    removeBlock(x, y, -0.445 + z);
  }
};

document.onkeyup = function (event) {
  event.preventDefault();
  pressedKeys[event.keyCode] = false;
};

let u_whichTexture;

const COLOR = 0;
const UV = 1;
const EYE_TEXTURE = 2;
const GROUND_TEXTURE = 3;
const BONE_TEXTURE = 4;

var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;                      // Vertex position
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;                   // Set the vertex coordinates of the point
        v_UV = a_UV;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture; // The texture type

    void main() {
      if (u_whichTexture == ${COLOR}) {
        gl_FragColor = u_FragColor;                 // Set the point color
      } else if (u_whichTexture == ${UV}) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0); // Set the point color
      } else if (u_whichTexture == ${EYE_TEXTURE}) {
        gl_FragColor = texture2D(u_Sampler0, v_UV); // Set the point color
      } else if (u_whichTexture == ${GROUND_TEXTURE}) {
        gl_FragColor = texture2D(u_Sampler1, v_UV); // Set the point color
      } else if (u_whichTexture == ${BONE_TEXTURE}) {
        gl_FragColor = texture2D(u_Sampler2, v_UV); // Set the point color
      } else {
        gl_FragColor = vec4(1, 0, 1, 1); // Set the point color to magenta
      }
    }`;

function main() {
  // Setup WebGL with canvas
  setupWebGL();

  connectVariablesToGLSL();

  setupUICallbacks();

  //   setupKeybinds();

  initTextures();

  clearCanvas();
  requestAnimationFrame(tick);
}

function clearCanvas() {
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.clearColor(0.0, 0.0, 0.0, 0.0);

  g_shapes = [];
  renderAllShapes();
}

let g_shapes = []; // The array for shapes, including color, size, and position

function click(event) {
  [x, y] = convertCoordinatesEventToGL(event);

  // g_camera.mousePanHorizontal(g_mousePosX - x)
  // g_camera.mouse_pan_horizontal((g_mousePosX - x) * 50);\
  g_camera.horizontalAngle += (g_mousePosX - x) * 20;
  // g_camera.horizontalAngle = Math.max(Math.min((g_mousePosX - x) * 20, 90), -90);

  // g_camera.verticalAngle += (g_mousePosY - y) * 20;
  g_camera.verticalAngle = Math.max(
    Math.min(g_camera.verticalAngle + (g_mousePosY - y) * 20, 60),
    -60
  );
  // g_camera.updateViewMatrix();
  // g_camera.mousePan()
  // g_camera.mouse_pan_vertical((g_mousePosY - y) * 50);

  g_mousePosX = x;
  g_mousePosY = y;

  renderAllShapes();
}

let POSITION_OFFSET_X = 0;

const MINOS_HITBOX = 1;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // The current color of the selected point
let g_selectedSize = 10.0; // The current size of the selected point
let g_selectedSegments = 10; // The current number of segments for the selected circle

let verticalOffset = 0.0;

let g_mousePosX = 0;
let g_mousePosY = 0;

let g_bodyPos = [0,0,0];

let g_globalAngleHorizontal = 180;
let g_globalAngleVertical = 0;
let g_neckAngleVertical = 0;
let g_neckAngleHorizontal = 0;

let g_rightShoulderAngleForward = 0;
let g_rightShoulderAngleLateral = 70;
let g_rightShoulderAngleInOut = 0;

let g_rightElbowAngle = 0;
let g_rightWristAngle = 0;

let g_leftShoulderAngleForward = 0;
let g_leftShoulderAngleLateral = 250;
let g_leftShoulderAngleInOut = 0;

let g_pelvisAngle = 0;

let g_leftElbowAngle = 0;
let g_leftWristAngle = 0;
let g_wristPosition = 0.0; // The current position of the wrist
let g_wristSize = 1; // The current size of the wrist

let g_rightHipAngle = 180;
let g_rightKneeAngle = 180;
let g_rightAnkleAngle = 0;

let g_leftHipAngle = 180;
let g_leftKneeAngle = 0;
let g_leftAnkleAngle = 0;

let g_bodyAngle = 0.0; // The current angle of the body

// const sliders = [
//     {
//         sectionTitle: "Global Rotation",
//         sliders: [
//             {
//                 id: "globalRotateHorizontal",
//                 label: "Global Rotate Horizontal",
//                 min: 0,
//                 max: 360,
//                 value: 200,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_globalAngleHorizontal = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "globalRotateVertical",
//                 label: "Global Rotate Vertical",
//                 min: -90,
//                 max: 90,
//                 value: -10,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_globalAngleVertical = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//         ],
//     },
//     {
//         sectionTitle: "Head Rotation",
//         sliders: [
//             {
//                 id: "neckAngleVertical",
//                 label: "Neck Angle (Up/Down)",
//                 min: -30,
//                 max: 30,
//                 value: 0,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_neckAngleVertical = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "neckAngleHorizontal",
//                 label: "Neck Angle (Left/Right)",
//                 min: -30,
//                 max: 30,
//                 value: 0,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_neckAngleHorizontal = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//         ],
//     },
//     {
//         sectionTitle: "Right Arm",
//         sliders: [
//             {
//                 id: "rightShoulderAngleLateral",
//                 label: "Shoulder Angle (Lateral)",
//                 min: -60,
//                 max: 80,
//                 value: 70,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_rightShoulderAngleLateral = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "rightShoulderAngleForward",
//                 label: "Shoulder Angle (Forward)",
//                 min: -60,
//                 max: 60,
//                 value: 0,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_rightShoulderAngleForward = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "rightElbowAngle",
//                 label: "Elbow Angle",
//                 min: 0,
//                 max: 90,
//                 value: 0,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_rightElbowAngle = -Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "rightWristAngle",
//                 label: "Wrist Angle",
//                 min: -75,
//                 max: 20,
//                 value: 0,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_rightWristAngle = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//         ],
//     },
//     {
//         sectionTitle: "Left Arm",
//         sliders: [
//             {
//                 id: "leftShoulderAngleLateral",
//                 label: "Shoulder Angle (Lateral)",
//                 min: 120,
//                 max: 260,
//                 value: 250,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_leftShoulderAngleLateral = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "leftShoulderAngleForward",
//                 label: "Shoulder Angle (Forward)",
//                 min: -60,
//                 max: 60,
//                 value: 0,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_leftShoulderAngleForward = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "leftElbowAngle",
//                 label: "Elbow Angle",
//                 min: 0,
//                 max: 90,
//                 value: 0,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_leftElbowAngle = -Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "leftWristAngle",
//                 label: "Wrist Angle",
//                 min: -25,
//                 max: 20,
//                 value: 0,
//                 step: 1,
//                 onChange: function (event, slider) {
//                     if (event.buttons != 1) {
//                         return;
//                     }
//                     const value = event.target.value;
//                     g_leftWristAngle = Number(value);
//                     document.getElementById(slider.id + "Label").innerText =
//                     slider.label + ":\xa0" + value;
//                     renderAllShapes();
//                 },
//             },
//         ],
//     },
//     {
//         sectionTitle: "Right Leg",
//         sliders: [
//             {
//                 id: "rightHipAngle",
//                 label: "Hip Angle",
//                 min: 60,
//                 max: 270,
//                 value: 180,
//                 step: -1,
//                 onChange(e, s) {
//                     if (e.buttons != 1) return;
//                     g_rightHipAngle = Number(e.target.value);
//                     document.getElementById(s.id + "Label").innerText =
//                     s.label + ":\xa0" + e.target.value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "rightKneeAngle",
//                 label: "Knee Angle",
//                 min: 180,
//                 max: 270,
//                 value: 180,
//                 step: -1,
//                 onChange(e, s) {
//                     if (e.buttons != 1) return;
//                     g_rightKneeAngle = Number(e.target.value);
//                     document.getElementById(s.id + "Label").innerText =
//                     s.label + ":\xa0" + e.target.value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "rightAnkleAngle",
//                 label: "Ankle Angle",
//                 min: -45,
//                 max: 45,
//                 value: 0,
//                 step: 1,
//                 onChange(e, s) {
//                     if (e.buttons != 1) return;
//                     g_rightAnkleAngle = Number(e.target.value);
//                     document.getElementById(s.id + "Label").innerText =
//                     s.label + ":\xa0" + e.target.value;
//                     renderAllShapes();
//                 },
//             },
//         ],
//     },
//     {
//         sectionTitle: "Left Leg",
//         sliders: [
//             {
//                 id: "leftHipAngle",
//                 label: "Hip Angle",
//                 min: 60,
//                 max: 270,
//                 value: 180,
//                 step: 1,
//                 onChange(e, s) {
//                     if (e.buttons != 1) return;
//                     g_leftHipAngle = Number(e.target.value);
//                     document.getElementById(s.id + "Label").innerText =
//                     s.label + ":\xa0" + e.target.value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "leftKneeAngle",
//                 label: "Knee Angle",
//                 min: 0,
//                 max: 90,
//                 value: 0,
//                 step: 1,
//                 onChange(e, s) {
//                     if (e.buttons != 1) return;
//                     g_leftKneeAngle = Number(e.target.value);
//                     document.getElementById(s.id + "Label").innerText =
//                     s.label + ":\xa0" + e.target.value;
//                     renderAllShapes();
//                 },
//             },
//             {
//                 id: "leftAnkleAngle",
//                 label: "Ankle Angle",
//                 min: -45,
//                 max: 45,
//                 value: 0,
//                 step: 1,
//                 onChange(e, s) {
//                     if (e.buttons != 1) return;
//                     g_leftAnkleAngle = Number(e.target.value);
//                     document.getElementById(s.id + "Label").innerText =
//                     s.label + ":\xa0" + e.target.value;
//                     renderAllShapes();
//                 },
//             },
//         ],
//     },
//     {
//         sectionTitle: "Body",
//         sliders: [
//             {
//                 // id: 'pelvisAngle',
//                 // label: 'Pelvis Angle',
//                 // min: -30, max: 30, value: 0, step: 1,
//                 // onChange(e, s) {
//                 //     if (e.buttons!=1) return;
//                 //     g_pelvisAngle = Number(e.target.value);
//                 //     document.getElementById(s.id+'Label').innerText = s.label+':\xa0'+e.target.value;
//                 //     renderAllShapes();
//                 // }
//                 id: "bodyAngle",
//                 label: "Body Angle",
//                 min: -20,
//                 max: 20,
//                 value: 0.0,
//                 step: 0.01,
//                 onChange(e, s) {
//                     if (e.buttons != 1) return;
//                     g_bodyAngle = Number(e.target.value);
//                     document.getElementById(s.id + "Label").innerText =
//                     s.label + ":\xa0" + e.target.value;
//                     renderAllShapes();
//                 },
//             },
//         ],
//     },
// ];

function easeOut(x) {
  return 1 - (1 - x) * (1 - x);
}

// function doSpawnAnimation() {
//     const audio = document.getElementById('minosSpeech');
//     audio.currentTime = 0; // Reset the audio to the beginning
//     // audio.play();

//     duration = 50 * 1000; // Duration of the animation in milliseconds

//     let lastTimestamp = performance.now();
//     g_globalAngleVertical = -90;
//     g_globalAngleHorizontal = 160;

//     function spawnAnimation(timestamp) {

//         const elapsed = timestamp - lastTimestamp;
//         const progress = easeOut(Math.min(elapsed / duration, 1));

//         g_leftHipAngle = 90;
//         g_rightHipAngle = 90;
//         g_leftKneeAngle = 90;
//         g_rightKneeAngle = -90;
//         g_leftShoulderAngleForward = -60;
//         g_pelvisAngle = 0;
//         g_leftElbowAngle = -50;
//         g_rightShoulderAngleForward = 60;
//         g_rightElbowAngle = -50;
//         // g_leftShoulderAngleLateral = 250;

//         // a_Position = Vector4(1, 1, 1, 1);

//         g_neckAngleVertical = 5;

//         console.log('elapsed: ' + elapsed, progress);
//         if (progress < 0.8) {
//         }

//         if (progress >= 1 || shouldAnimate || stopAnimation) {
//             stopAnimation = false;
//             console.log('progress: ' + progress);
//             document.getElementById('minosSpeech').pause();
//             resetAngles();
//             return;
//         }
//         requestAnimationFrame(spawnAnimation);
//     }
//     requestAnimationFrame(spawnAnimation);
// }

let overheadRunning = false;
function doOverhead() {
  if (poseRunning || pokeRunning || overheadRunning || shouldAnimate) {
    return;
  }
  overheadRunning = true;
  const audio = document.getElementById("crushSound");
  audio.currentTime = 0; // Reset the audio to the beginning
  audio.volume = 0.3; // Set the volume to 50%
  audio.play(); // Play the sound

  duration = 1000; // Duration of the animation in milliseconds

  let lastTimestamp = performance.now();

  function animation(timestamp) {
    let elapsed = timestamp - lastTimestamp;
    let progress = Math.min(elapsed / duration, 1); // Limit progress to 1 second
    progress = easeOut(progress); // Apply easing function

    const speed = 2.5;
    if (progress < 0.25) {
      g_leftHipAngle = 180 + Math.sin(progress * Math.PI * speed) * 30;
      g_leftKneeAngle = 0 + Math.sin(progress * Math.PI * speed) * 100;

      console.log(g_leftHipAngle, g_leftKneeAngle);
      g_rightShoulderAngleLateral =
        70 - Math.sin(progress * Math.PI * speed) * 100;
      g_rightShoulderAngleForward = -Math.sin(progress * Math.PI * speed) * 100;

      g_leftShoulderAngleForward = Math.sin(progress * Math.PI * speed) * 100;
      g_leftShoulderAngleLateral =
        250 - Math.sin(progress * Math.PI * speed) * 100;

      g_pelvisAngle = Math.sin(progress * Math.PI * speed) * 5;
      console.log("pelvisAngle: " + g_pelvisAngle);
      g_rightHipAngle = 180 + Math.sin(progress * Math.PI * speed) * 20;
      g_rightKneeAngle = 180 + Math.sin(progress * Math.PI * speed) * 100;
      g_neckAngleVertical = Math.sin(progress * Math.PI * speed) * 50;
    } else if (progress < 0.5) {
      // g_leftKneeAngle = lastAngle + Math.sin(progress * Math.PI) * 160;
      // g_pelvisAngle = 1 - Math.sin(progress * Math.PI) * 5;
    } else if (progress < 0.7) {
      g_neckAngleVertical = 0 + Math.sin(progress * Math.PI * speed) * 5;
      g_leftHipAngle = 210 - Math.sin((progress * Math.PI * speed) / 5) * 100;
      // g_leftKneeAngle = 0 + progress * 30;

      g_rightHipAngle = 210 - Math.sin(progress * Math.PI * 1) * 100;
      // g_rightKneeAngle = 180 - Math.sin(progress * Math.PI * 1) * 30;

      g_rightKneeAngle = 180 - Math.sin(progress * Math.PI * speed) * 10;

      g_leftKneeAngle = 0 - Math.sin(progress * Math.PI * speed) * 10;

      g_leftShoulderAngleForward =
        0 + Math.sin(progress * Math.PI * speed) * 100;
      // g_rightShoulderAngleLateral = 70 - Math.sin(progress * Math.PI * 1) * 100;
      g_rightShoulderAngleForward = -Math.sin(progress * Math.PI * speed) * 100;
      g_pelvisAngle = 5 - Math.sin(progress * Math.PI) * 20;
    } else if (progress < 0.85) {
    } else if (progress < 0.9) {
      g_leftHipAngle = 180 - Math.sin(progress * Math.PI * 5) * 20;
      g_rightHipAngle = 180 + Math.sin(progress * Math.PI * 5) * 20;
    }

    if (progress < 1) {
      requestAnimationFrame(animation);
    } else {
      resetAngles();
      overheadRunning = false;
      return;
    }
  }
  requestAnimationFrame(animation);
}

let poseRunning = false;
function doPose() {
  if (poseRunning || pokeRunning || overheadRunning || shouldAnimate) {
    return;
  }
  poseRunning = true;

  g_globalAngleHorizontal = 200;
  g_globalAngleVertical = -5;

  const hor = Number(g_globalAngleHorizontal);
  const ver = Number(g_globalAngleVertical);
  const audio = document.getElementById("minosSpeech");
  audio.currentTime = 0; // Reset the audio to the beginning
  // audio.volume = 0.3; // Set the volume to 50%
  audio.play(); // Play the sound
  duration = 50000; // Duration of the animation in milliseconds
  let lastTimestamp = performance.now();
  function animation(timestamp) {
    let elapsed = timestamp - lastTimestamp;
    let progress = Math.min(elapsed / duration, 1); // Limit progress to 1 second
    progress = easeOut(progress); // Apply easing function
    const speed = 0.5;
    g_neckAngleVertical = 0 + Math.sin(progress * Math.PI * 0.5) * 70;
    if (progress < 0.3) {
      g_globalAngleHorizontal =
        220 - Math.sin(progress * Math.PI * speed * 3) * 20;
      g_globalAngleVertical =
        -10 - Math.sin(progress * Math.PI * speed * 3) * 10;

      g_leftShoulderAngleLateral =
        250 - Math.sin(progress * Math.PI * speed) * 45;
      g_leftShoulderAngleForward =
        0 - Math.sin(progress * Math.PI * speed) * 50;

      g_rightShoulderAngleLateral =
        70 - Math.sin(progress * Math.PI * speed) * 45;
      g_rightShoulderAngleForward = Math.sin(progress * Math.PI * speed) * 50;
    } else if (progress < 0.5) {
      // g_neckAngleVertical = 0 + Math.sin(progress * Math.PI * 0.5) * 70;
      g_leftShoulderAngleLateral =
        250 - Math.sin(progress * Math.PI * speed) * 45;
      g_leftShoulderAngleForward =
        0 - Math.sin(progress * Math.PI * speed) * 50;

      g_rightShoulderAngleLateral =
        70 - Math.sin(progress * Math.PI * speed) * 45;
      g_rightShoulderAngleForward = Math.sin(progress * Math.PI * speed) * 50;

      g_neckAngleVertical = 0 + Math.sin(progress * Math.PI * speed) * 50;
    }

    if (progress < 1 && poseRunning) {
      requestAnimationFrame(animation);
    } else {
      resetAngles();
      poseRunning = false;
      stopAnimation = false;
      return;
    }
  }
  requestAnimationFrame(animation);
}

let pokeRunning = false;

function poke() {
  console.log("poke", pokeRunning, poseRunning, overheadRunning, shouldAnimate);
  if (poseRunning || pokeRunning || overheadRunning || shouldAnimate) {
    return;
  }
  pokeRunning = true;
  const audio = document.getElementById("pokeSound");
  audio.currentTime = 0; // Reset the audio to the beginning
  audio.volume = 0.2; // Set the volume to 50%
  audio.play(); // Play the sound

  resetAngles();
  duration = 2000; // Duration of the animation in milliseconds

  POSITION_OFFSET_X = -0.25;
  let lastTimestamp = performance.now();
  function animation(timestamp) {
    let elapsed = timestamp - lastTimestamp;
    let progress = Math.min(elapsed / duration, 1); // Limit progress to 1 second
    progress = easeOut(progress); // Apply easing function
    // console.log('elapsed: ' + elapsed, progress);
    g_leftHipAngle = 180;
    g_rightHipAngle = 180;
    g_rightShoulderAngleLateral = 70;

    g_leftHipAngle = 180 + Math.sin(progress * Math.PI) * 20;
    g_rightHipAngle = 180 - Math.sin(progress * Math.PI) * 20;
    g_rightKneeAngle = 180 + Math.sin(progress * Math.PI) * 20;
    g_rightShoulderAngleForward = 0;
    g_rightShoulderAngleLateral = 20;

    const keyframe1 = 0.8;
    // g_rightShoulderAngleLateral = 70 - Math.sin(progress * Math.PI) * 60;
    if (progress < keyframe1) {
      g_neckAngleVertical = Math.sin((progress * Math.PI) / keyframe1) * 30;
      g_rightShoulderAngleForward =
        -Math.sin((progress * Math.PI) / keyframe1) * 100;
      g_rightElbowAngle = -Math.sin((progress * Math.PI) / 10) * 200;
      // g_wristSize = Math.sin(progress * Math.PI) * 5;
      g_leftShoulderAngleForward = -Math.sin(progress * Math.PI) * 50;
      g_leftElbowAngle = -Math.sin(progress * Math.PI) * 100;

      // g_rightHipAngle = Math.sin(progress * Math.PI) * 90;
    } else {
      // g_rightShoulderAngleLateral = 35 + Math.sin(progress * Math.PI + 10) * 60;
      // g_rightElbowAngle = -Math.sin(progress * Math.PI) * 100;
      g_rightShoulderAngleForward =
        -50 - Math.sin(progress * Math.PI * 1.5) * 125;

      g_leftShoulderAngleForward = 0 + Math.sin(progress * Math.PI) * 50;
      g_leftElbowAngle = -Math.sin(progress * Math.PI) * 100;
      // g_leftHipAngle = Math.sin(progress * Math.PI) * 90;
      // g_rightHipAngle = Math.sin(progress * Math.PI) * 90;
      g_wristPosition = progress - keyframe1;
      // g_rightShoulderAngleForward = progress * 10;
      // g_rightShoulderAngleForward = Math.sin(progress * Math.PI) * 50;
      // g_leftShoulderAngleForward = -Math.sin(progress * Math.PI) * 10;
      // g_rightElbowAngle = -Math.sin(progress * Math.PI) * 100;
    }
    console.log("progress: " + progress);

    if (progress < 1) {
      requestAnimationFrame(animation);
    } else {
      resetAngles();
      pokeRunning = false;
      return;
    }
  }
  requestAnimationFrame(animation);
}

function resetAngles(resetView = false) {
  if (resetView) {
    g_globalAngleHorizontal = 180;
    g_globalAngleVertical = 0;
  }
  g_neckAngleVertical = 0;
  g_neckAngleHorizontal = 0;

  POSITION_OFFSET_X = 0;

  g_rightShoulderAngleForward = 0;
  g_rightShoulderAngleLateral = 70;
  g_rightShoulderAngleInOut = 0;

  g_rightElbowAngle = 0;
  g_rightWristAngle = 0;

  g_leftShoulderAngleForward = 0;
  g_leftShoulderAngleLateral = 250;
  g_leftShoulderAngleInOut = 0;

  g_leftElbowAngle = 0;
  g_leftWristAngle = 0;
  g_wristPosition = 0.0; // The current position of the wrist
  g_wristSize = 1; // The current size of the wrist

  g_rightHipAngle = 180;
  g_rightKneeAngle = 180;
  g_rightAnkleAngle = 0;

  g_leftHipAngle = 180;
  g_leftKneeAngle = 0;
  g_leftAnkleAngle = 0;

  g_pelvisAngle = 0;
}

function rotateView(event) {
  const x = event.clientX;
  const y = event.clientY;
  const rect = canvas.getBoundingClientRect();

  const gl_x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  const gl_y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  g_globalAngleHorizontal = gl_x * 90 + 180;
  g_globalAngleVertical = gl_y * 90;

  // document.getElementById("globalRotateHorizontalLabel").innerText =
  // "\xa0\xa0Global Rotate Horizontal: " + g_globalAngleHorizontal.toFixed(0);
  // document.getElementById("globalRotateVerticalLabel").innerText =
  // "\xa0\xa0Global Rotate Vertical: " + g_globalAngleVertical.toFixed(0);

  renderAllShapes();
}

function drawImageOntoCanvas(selectedShape, resizeWidth, scaleFactor) {
  const img = document.getElementById("imagePreview");
  const imgCanvas = document.getElementById("imageCanvas");
  const imgCtx = imgCanvas.getContext("2d");

  imgCanvas.width = resizeWidth;
  imgCanvas.height = (img.height / img.width) * resizeWidth;

  imgCtx.drawImage(img, 0, 0, resizeWidth, imgCanvas.height);

  const pixels = imgCtx.getImageData(
    0,
    0,
    imgCanvas.width,
    imgCanvas.width
  ).data;

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
        case "Triangles":
          shape = new Triangle();
          break;
        case "Circles":
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

// function drawAlbumArt() {
//   clearCanvas();

//   // g_selectedColor = []; // White
//   // drawTriangle([-1, -1, -0.5, 1, 1, 1], [1,1,1,1])

//   // gl.uniform4f(u_FragColor, 0, 0.2, 0, 1.0);
//   drawTriangle2D(
//     [0.18, 0.12, 1, -0.03, 1, 0.02],
//     [235 / 255, 29 / 255, 49 / 255, 1]
//   ); // Red rainbow stripe
//   drawTriangle2D([0.18, 0.12, 0.2, 0.09, 1, -0.03]);

//   // drawTriangle([0.18, 0.12, 1, -0.03, 1, 0.02], [247/255, 109/255, 34/255, 1]) // Red rainbow stripe
//   drawTriangle2D(
//     [-0.11, 0.11, 0.2, 0.09, 1, -0.03],
//     [247 / 255, 109 / 255, 34 / 255, 1]
//   ); // Orange stripe
//   drawTriangle2D(
//     [-0.11, 0.12, 1, -0.09, 1, -0.03],
//     [247 / 255, 109 / 255, 34 / 255, 1]
//   );

//   drawTriangle2D(
//     [-0.14, 0.08, 0.2, 0.061, 1, -0.08],
//     [255 / 255, 221 / 255, 0 / 255, 1]
//   ); // Yellow stripe
//   drawTriangle2D(
//     [-0.14, 0.1, 1, -0.12, 1, -0.07],
//     [255 / 255, 221 / 255, 0 / 255, 1]
//   );

//   // green stripe
//   drawTriangle2D(
//     [-0.17, 0.07, 0.2, 0.035, 1, -0.12],
//     [0 / 255, 158 / 255, 96 / 255, 1]
//   );
//   drawTriangle2D(
//     [-0.17, 0.09, 1, -0.16, 1, -0.12],
//     [0 / 255, 158 / 255, 96 / 255, 1]
//   );

//   // blue stripe
//   drawTriangle2D(
//     [-0.2, 0.05, 0.2, 0.011, 1, -0.16],
//     [0 / 255, 102 / 255, 204 / 255, 1]
//   );
//   drawTriangle2D(
//     [-0.2, 0.08, 1, -0.2, 1, -0.16],
//     [0 / 255, 102 / 255, 204 / 255, 1]
//   );

//   // purple stripe
//   drawTriangle2D(
//     [-0.23, 0.06, 0.2, -0.01, 1, -0.2],
//     [106 / 255, 76 / 255, 147 / 255, 1]
//   );
//   drawTriangle2D(
//     [-0.23, 0.072, 1, -0.24, 1, -0.2],
//     [106 / 255, 76 / 255, 147 / 255, 1]
//   );

//   drawTriangle2D([0.0, 0.5, -0.5, -0.5, 0.5, -0.5], [0.5, 0.5, 0.5, 0.8]); // Outer white triangle
//   drawTriangle2D(
//     [0.0, 0.475, -0.48, -0.49, 0.48, -0.49],
//     [80 / 255, 96 / 255, 102 / 255, 1]
//   ); // inner gray triangle
//   drawTriangle2D([0.0, 0.425, -0.425, -0.45, 0.425, -0.45], [0, 0, 0, 1]); // Black triangle to cover the white triangle

//   // diffusion triangle inside prism
//   drawTriangle2D([-0.275, 0.02, 0, -0.06, 0, 0.115], [0.44, 0.55, 0.58, 0.85]);

//   drawTriangle2D([-0.063, 0.093, 0, -0.06, 0, 0.12], [0.44, 0.55, 0.58, 1]);
//   drawTriangle2D([-0.06, 0.09, 0, -0.06, -0.06, -0.043], [0.44, 0.55, 0.58, 1]);

//   drawTriangle2D([-1, -0.14, -0.2, 0.04, -1, -0.12], [1, 1, 1, 1]); // 1st triangle to make line
//   drawTriangle2D([-1, -0.14, -0.21, 0.02, -0.2, 0.04], [1, 1, 1, 1]); // 2nd triangle to make line

//   // Patch where diffusion triangle overlaps with outer 2 triangle
//   drawTriangle2D(
//     [0.0, 0.475, -0.48, -0.49, -0.44, -0.49],
//     [80 / 255, 96 / 255, 102 / 255, 1]
//   );
//   drawTriangle2D(
//     [0.0, 0.475, 0, 0.45, -0.44, -0.49],
//     [80 / 255, 96 / 255, 102 / 255, 1]
//   ); // inner gray triangle
// }

function resizeImageFromDataURL(dataURL, newWidth) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataURL;

    let resizedDataURL = "";
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
      console.log("resizedDataURL: " + resizedDataURL);
    };
    // img.src = dataURL;
  });
}

function resizeImage(imgToResize, newWidth) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const originalWidth = imgToResize.width;
  const originalHeight = imgToResize.height;
  console.log("original width: " + originalWidth);
  console.log("original height: " + originalHeight);
  // const canvasWidth = originalWidth * resizingFactor;
  // const canvasHeight = originalHeight * resizingFactor;

  canvas.width = newWidth;
  const newHeight = (originalHeight / originalWidth) * newWidth;
  canvas.height = newHeight;
  console.log("canvas width: " + canvas.width);
  console.log("canvas height: " + canvas.height);

  context.drawImage(imgToResize, 0, 0, newWidth, newHeight);
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

// let g_map = []  // 3d array of x, y, z, can be sparse

let mapBase = [
  [
    [1, 2, 3, 4, 5],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0, 1, 2, 3],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0, 1, 2, 3],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [0],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [0, 1, 2, 3, 4, 5],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [0],
    [],
    [0],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0],
    [1],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0, 1, 2, 3],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0],
    [0, 1, 2],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0],
    [0, 1],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0, 1, 2, 3, 4, 5, 6],
    [0, 6],
    [0, 6],
    [0, 6],
    [0, 6],
    [0, 1, 2, 3, 4, 5, 6],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0],
    [],
    [0, 1, 2],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0, 1, 2, 3, 4, 5],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0, 1, 2, 3],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [0, 1],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [1],
    [0, 1, 2],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [3, 4, 5],
    [],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [2],
    [3],
    [],
  ],
  [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ],
];
blocksMap = new Set();

function createMap(map, wallHeight = 1) {
  for (x = 0; x < map.length; x++) {
    for (y = 0; y < map[x].length; y++) {
      if (x == 0 || x == map.length - 1 || y == 0 || y == map[x].length - 1) {
        for (z = 0; z < wallHeight; z++) {
          // const coords = [x - map.length / 2, -0.445 + z, y - map.length / 2, GROUND_TEXTURE]
          // const coordsString = coords.join(',')
          placeBlock(
            x - mapBase.length / 2,
            y - mapBase.length / 2,
            -0.445 + z,
            GROUND_TEXTURE
          );
          // blocksMap.add(coordsString)
        }
      }
      for (i = 0; i < map[x][y].length; i++) {
        placeBlock(
          x - mapBase.length / 2,
          y - mapBase.length / 2,
          -0.445 + i,
          EYE_TEXTURE
        );
        // const coords = [x - map.length / 2, -0.445 + map[x][y][i], y - map.length / 2, EYE_TEXTURE]
        // const coordsString = coords.join(',')
        // blocksMap.add(coordsString)
      }
    }
  }
}

function placeBlock(x, y, z, textureNum) {
  const coords = [x, z, y, textureNum];
  const coordsString = coords.join(",");

  blocksMap.add(coordsString);
}

function removeBlock(x, y, z) {
  const coords = [x, z, y, GROUND_TEXTURE].join(",");
  const coords2 = [x, z, y, EYE_TEXTURE].join(",");
  const coords3 = [x, z, y, BONE_TEXTURE].join(",");

  blocksMap.delete(coords);
  blocksMap.delete(coords2);
  blocksMap.delete(coords3);
  // blocksMap.delete(coordsString)
  // blocksMap.delete(coordsString)
  // blocksMap.delete(coordsString)
}

const BLOCKS_SCALE = 1;
createMap(mapBase, 3);

function renderBlocks() {
  const cube = new Cube();
  for (const block of blocksMap) {
    const coords = block.split(",");
    const x = parseFloat(coords[0]);
    const y = parseFloat(coords[1]);
    const z = parseFloat(coords[2]);
    const textureNum = parseInt(coords[3]);
    cube.textureNum = textureNum;
    cube.color = [0.5, 0.5, 0.5, 1];
    cube.matrix.setTranslate(0, 0, 0);
    cube.matrix.scale(BLOCKS_SCALE, BLOCKS_SCALE, BLOCKS_SCALE);
    cube.matrix.translate(x, y, z);
    cube.renderFast();
  }
}
// renderBlocks()

function renderAllShapes() {
  var startTime = performance.now();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var projectionMatrix = new Matrix4();
  projectionMatrix.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements);

  // var viewMatrix = new Matrix4();
  g_camera.updateViewMatrix();
  // g_camera.viewMatrix.lookAt(
  //   g_camera.eye.elements[0],
  //   g_camera.eye.elements[1],
  //   g_camera.eye.elements[2],
  //   g_camera.at.elements[0],
  //   g_camera.at.elements[1],
  //   g_camera.at.elements[2],
  //   g_camera.up.elements[0],
  //   g_camera.up.elements[1],
  //   g_camera.up.elements[2]
  // );
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  var globalRotMat = new Matrix4();
  // globalRotMat.rotate(-g_globalAngleHorizontal, 0, 1, 0);
  // globalRotMat.rotate(-g_globalAngleVertical, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  var solidColor = [1, 1, 1, 0.9];

  //   drawMap(mapBase);
  renderBlocks();
  // drawMap(randomMap);
  var groundPlane = new Cube();
  groundPlane.color = [0.5, 0.5, 0.5, 1];
  groundPlane.textureNum = BONE_TEXTURE;
  groundPlane.matrix.translate(0, -0.45, 0);
  groundPlane.matrix.scale(32 * BLOCKS_SCALE, 0, 32 * BLOCKS_SCALE);
  groundPlane.matrix.translate(-0.5, 0, -0.5);
  groundPlane.renderFast();

  // var fleshPrison = new Octahedron();
  // fleshPrison.color = [1, 0.8, 0.8, 1];
  // fleshPrison.textureNum = COLOR;
  // fleshPrison.renderFast();

  var sky = new Cube();
  sky.color = [0.4, 0, 0, 1];
  sky.textureNum = COLOR;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderFast();

  var upperBody = new Cube();
  upperBody.color = solidColor;
  upperBody.matrix.translate(-0.1, 0.4, POSITION_OFFSET_X);
  upperBody.matrix.translate(g_bodyPos[0], g_bodyPos[2], g_bodyPos[1]);
  if (shouldAnimate) {
    upperBody.matrix.rotate(5 * Math.sin(g_seconds * 5), 1, 0, 0);
    upperBody.matrix.translate(0, 0.025 * Math.sin(g_seconds * 10), 0);
  } else {
  }
  upperBody.matrix.scale(0.75, 0.75, 0.75);
  const upperBodyPos = new Matrix4(upperBody.matrix);
  upperBody.matrix.scale(0.5, 0.235, 0.3);
  var upperBodyPosScaled = new Matrix4(upperBody.matrix);
  upperBody.matrix.scale(1, 1, 1.1);
  upperBody.matrix.translate(0, 0, -0.05);

  var heart = new Cylinder(upperBodyPosScaled);
  heart.height = 1;
  heart.size = 0.75;
  // var heart = new Cube(upperBodyPosScaled);
  heart.color = [1, 0, 0, 1];
  heart.matrix.translate(0.3, 0.275, 0.5);
  heart.matrix.scale(0.15, 0.2, 0.25);
  heart.render();
  upperBody.renderFast();

  var lowerBody = new Cube(upperBodyPosScaled);
  lowerBody.color = solidColor;
  lowerBody.matrix.translate(0.07, -1, 0.06);

  var lowerBodyPosNonScaled = new Matrix4(lowerBody.matrix);
  lowerBody.matrix.scale(0.85, 1, 0.9);
  var lowerBodyPos = new Matrix4(lowerBody.matrix);
  lowerBody.matrix.scale(1, 1, 1.05);
  lowerBody.renderFast();

  var upperleftBody = new Cube(upperBodyPosScaled);
  upperleftBody.color = solidColor;
  upperleftBody.matrix.translate(0.075, -0.4, 0.05);
  upperleftBody.matrix.rotate(10, 0, 0, 1);
  upperleftBody.matrix.scale(0.25, 0.65, 0.9);
  upperleftBody.renderFast();

  var upperRightBody = new Cube(upperBodyPosScaled);
  upperRightBody.color = solidColor;
  upperRightBody.matrix.translate(0.675, -0.35, 0.05);
  upperRightBody.matrix.rotate(-10, 0, 0, 1);
  upperRightBody.matrix.scale(0.25, 0.65, 0.9);
  upperRightBody.renderFast();

  var leftBottomArmConnector = new Cube(upperBodyPosScaled);
  leftBottomArmConnector.color = solidColor;
  leftBottomArmConnector.matrix.translate(0, 0, 0);
  leftBottomArmConnector.matrix.rotate(20, 0, 0, 1);
  leftBottomArmConnector.matrix.scale(0.25, 0.25, 0.9);
  leftBottomArmConnector.renderFast();

  var leftMiddleArmConnector = new Cube(upperBodyPosScaled);
  leftMiddleArmConnector.color = solidColor;
  leftMiddleArmConnector.matrix.translate(-0.075, 0.22, 0);
  var leftMiddleArmConnectorPos = new Matrix4(leftMiddleArmConnector.matrix);
  leftMiddleArmConnector.matrix.rotate(15, 0, 0, 1);
  leftMiddleArmConnector.matrix.scale(0.4, 0.69, 0.9);
  leftMiddleArmConnector.renderFast();

  var leftTopArmConnector = new Cube(upperBodyPosScaled);
  leftTopArmConnector.color = solidColor;
  leftTopArmConnector.matrix.rotate(25, 0, 0, 1);
  leftTopArmConnector.matrix.scale(0.15, 0.15, 0.9);
  leftTopArmConnector.matrix.translate(1.8, 5, 0);
  leftTopArmConnector.renderFast();

  var rightBottomArmConnector = new Cube(upperBodyPosScaled);
  rightBottomArmConnector.color = solidColor;
  rightBottomArmConnector.matrix.translate(0.985, 0, 0);
  rightBottomArmConnector.matrix.rotate(40, 0, 0, 1);
  rightBottomArmConnector.matrix.scale(-0.25, 0.25, 0.9);
  rightBottomArmConnector.renderFast();

  var rightMiddleArmConnector = new Cube(upperBodyPosScaled);
  rightMiddleArmConnector.color = solidColor;
  rightMiddleArmConnector.matrix.translate(0.65, 0.35, 0);
  var rightMiddleArmConnectorPos = new Matrix4(leftMiddleArmConnector.matrix);
  rightMiddleArmConnector.matrix.rotate(-20, 0, 0, 1);
  rightMiddleArmConnector.matrix.scale(0.4, 0.7, 0.9);
  rightMiddleArmConnector.renderFast();

  var rightArmJoint = new Cube(leftMiddleArmConnectorPos);
  rightArmJoint.color = solidColor;
  rightArmJoint.matrix.translate(1.1, 0.575, 0);
  if (shouldAnimate) {
    // rightArmJoint.matrix.rotate(240, 0, 0, 1);
    rightArmJoint.matrix.rotate(
      -230 - 5 * Math.sin(g_seconds * 5) + 180,
      0,
      0,
      1
    );
  } else {
    rightArmJoint.matrix.rotate(-g_rightShoulderAngleLateral, 0, 0, 1);
  }
  const rightArmJointPos = new Matrix4(rightArmJoint.matrix);
  rightArmJoint.matrix.scale(0.05, 0.05, 0.05);
  rightArmJoint.renderFast();

  var rightShoulder = new Cube(rightArmJointPos); //Cylinder(leftArmJointPos);
  rightShoulder.color = solidColor;
  rightShoulder.matrix.translate(0.05, -0.235, 0.1);
  if (shouldAnimate) {
    rightShoulder.matrix.rotate(
      45 * Math.sin(g_seconds * 5 - 10) + 45,
      0,
      1,
      0
    );
  } else {
    rightShoulder.matrix.rotate(-g_rightShoulderAngleForward, 0, 1, 0);
  }
  // rightShoulder.matrix.rotate(g_rightShoulderAngleForward, 0, 1, 0);
  const rightShoulderPos = new Matrix4(rightShoulder.matrix);
  rightShoulder.matrix.scale(0.9, 0.5, 0.7);
  rightShoulder.renderFast();

  var rightElbowJoint = new Cube(rightShoulderPos);
  rightElbowJoint.matrix.translate(0.75, 0.3, 0.5);
  if (shouldAnimate) {
    rightElbowJoint.matrix.rotate(240, 0, 1, 0);
  } else {
    rightElbowJoint.matrix.rotate(g_rightElbowAngle, 0, 1, 0);
  }
  rightElbowJoint.matrix.rotate(180, 1, 0, 0);
  const rightElbowJointPos = new Matrix4(rightElbowJoint.matrix);
  rightElbowJoint.matrix.scale(0.25, 0.1, 0.1);
  rightElbowJoint.renderFast();

  const rightElbow = new Cube(rightElbowJointPos);
  rightElbow.color = solidColor;
  rightElbow.matrix.translate(-0.35, -0.25, -0.15);
  rightElbow.matrix.scale(0.5, 0.6, 0.6);
  rightElbow.renderFast();

  var rightForearm = new Cube(rightElbowJointPos);
  rightForearm.color = solidColor;
  const rightForearmPos = new Matrix4(rightForearm.matrix);
  rightForearm.matrix.scale(1.2, 0.35, 0.45);
  rightForearm.matrix.rotate(5, 0, 0, 1);
  rightForearm.matrix.translate(0.1, -0.35, 0);
  rightForearm.renderFast();

  const rightWristJoint = new Cube(rightForearmPos);
  rightWristJoint.matrix.translate(1.3, 0.15, 0.25);
  rightWristJoint.matrix.rotate(g_rightWristAngle, 0, 1, 0);
  rightWristJoint.matrix.rotate(180, 1, 0, 0);
  const rightWristJointPos = new Matrix4(rightWristJoint.matrix);
  rightWristJoint.matrix.scale(0.25, 0.1, 0.1);

  // leftWristJoint.renderFast();

  let rightWrist = null;
  if (g_wristPosition > 0) {
    rightWrist = new Cube();
    rightWrist.matrix.translate(
      0.2,
      0.5,
      g_wristPosition * 15 + POSITION_OFFSET_X
    );
    rightWrist.matrix.scale(0.325, 0.225, 0.175);
  } else {
    rightWrist = new Cube(rightWristJointPos);
  }
  rightWrist.color = [1, 1, 0, 0.8];
  rightWrist.matrix.translate(-0.1, -0.175, -0.175);
  rightWrist.matrix.scale(0.55, 0.5, 0.75);
  rightWrist.matrix.scale(g_wristSize, g_wristSize, g_wristSize);
  rightWrist.renderFast();

  var leftArmJoint = new Cube(leftMiddleArmConnectorPos);
  leftArmJoint.color = solidColor;
  leftArmJoint.matrix.translate(0.1, 0.575, 0);
  // leftArmJoint.matrix.rotate(-10, 0,1, 0);
  // leftArmJoint.matrix.translate(0,0,1)
  if (shouldAnimate) {
    // leftArmJoint.matrix.rotate(240, 0, 0, 1);
    leftArmJoint.matrix.rotate(230 + 5 * Math.sin(g_seconds * 5), 0, 0, 1);
  } else {
    leftArmJoint.matrix.rotate(g_leftShoulderAngleLateral, 0, 0, 1);
  }
  const leftArmJointPos = new Matrix4(leftArmJoint.matrix);
  leftArmJoint.matrix.scale(0.05, 0.05, 0.05);
  leftArmJoint.renderFast();

  var leftShoulder = new Cube(leftArmJointPos);
  leftShoulder.color = solidColor;
  leftShoulder.matrix.translate(0, -0.25, 0);
  if (shouldAnimate) {
    leftShoulder.matrix.rotate(
      -45 * Math.sin(g_seconds * 5 - 10) + 45,
      0,
      1,
      0
    );
  } else {
    leftShoulder.matrix.rotate(g_leftShoulderAngleForward, 0, 1, 0);
  }
  const leftShoulderPos = new Matrix4(leftShoulder.matrix);
  leftShoulder.matrix.scale(0.95, 0.5, 0.7);
  leftShoulder.renderFast();

  var leftElbowJoint = new Cube(leftShoulderPos);
  leftElbowJoint.color = solidColor;
  leftElbowJoint.matrix.translate(0.9, 0.3, 0.5);
  if (shouldAnimate) {
    leftElbowJoint.matrix.rotate(240, 0, 1, 0);
  } else {
    leftElbowJoint.matrix.rotate(g_leftElbowAngle, 0, 1, 0);
  }
  leftElbowJoint.matrix.rotate(180, 1, 0, 0);
  const leftElbowJointPos = new Matrix4(leftElbowJoint.matrix);
  leftElbowJoint.matrix.scale(0.25, 0.1, 0.1);
  leftElbowJoint.renderFast();

  var leftElbow = new Cube(leftElbowJointPos);
  leftElbow.color = solidColor;
  leftElbow.matrix.translate(-0.35, -0.25, -0.15);
  leftElbow.matrix.scale(0.5, 0.6, 0.6);
  leftElbow.renderFast();

  var leftForearm = new Cube(leftElbowJointPos);
  leftForearm.color = solidColor;
  const leftForearmPos = new Matrix4(leftForearm.matrix);
  leftForearm.matrix.scale(1.5, 0.35, 0.45);
  leftForearm.matrix.rotate(-5, 0, 0, 1);
  leftForearm.matrix.translate(-0.1, -0.35, 0);
  leftForearm.renderFast();

  var leftWristJoint = new Cube(leftForearmPos);
  leftWristJoint.matrix.translate(0.9, 0.15, 0.25);
  leftWristJoint.matrix.rotate(g_leftWristAngle, 0, 1, 0);
  leftWristJoint.matrix.rotate(180, 1, 0, 0);
  const leftWristJointPos = new Matrix4(leftWristJoint.matrix);
  leftWristJoint.matrix.scale(0.25, 0.1, 0.1);
  // leftWristJoint.renderFast();

  var leftWrist = new Cube(leftWristJointPos);
  leftWrist.color = solidColor;
  leftWrist.matrix.translate(0.35, -0.175, -0.175);
  leftWrist.matrix.scale(0.4, 0.5, 0.45);
  leftWrist.renderFast();

  //  var leftArmJoint = new Cube(upperBodyPos);
  //  leftArmJoint.color = solidColor;
  //  leftArmJoint.matrix.translate(  0, 1, 0);
  //  leftArmJoint.matrix.rotate(g_leftShoulderAngleLateral, 0, 0, 1);
  //  const leftArmJointPos = new Matrix4(leftArmJoint.matrix);
  //  leftArmJoint.matrix.scale(.25, .25, .25);
  //  leftArmJoint.renderFast();
  // var leftArmJoint = new Cube(rightMiddleArmConnectorPos);
  // leftArmJoint.color = solidColor;
  // leftArmJoint.matrix.translate(.025,  0.55, 0);
  // leftArmJoint.matrix.rotate(g_leftShoulderAngleLateral, 0, 0, 1);
  // const leftArmJointPos = new Matrix4(leftArmJoint.matrix);
  // leftArmJoint.matrix.scale(.1, .1, .1);
  // leftArmJoint.renderFast();

  //  var leftShoulder = new Cube(leftArmJointPos);
  //  leftShoulder.color = solidColor;
  //  leftShoulder.matrix.translate(-0.05, -0.235, 0.1);
  //  leftShoulder.matrix.rotate(-g_leftShoulderAngleForward, 0, 1, 0);
  //  const leftShoulderPos = new Matrix4(leftShoulder.matrix);
  //  leftShoulder.matrix.scale(.9, .5, .7);
  //  leftShoulder.renderFast();

  //  var leftElbowJoint = new Cube(leftShoulderPos);
  //  leftElbowJoint.color = solidColor;
  //  leftElbowJoint.matrix.translate(-0.75, 0.3, .5);
  //  leftElbowJoint.matrix.rotate(  g_leftElbowAngle, 0, 1, 0);
  //  leftElbowJoint.matrix.rotate(180, 1, 0, 0);
  //  const leftElbowJointPos = new Matrix4(leftElbowJoint.matrix);
  //  leftElbowJoint.matrix.scale(.25, .1, .1);
  //  leftElbowJoint.renderFast();

  //  var leftElbow = new Cube(leftElbowJointPos);
  //  leftElbow.color = solidColor;
  //  leftElbow.matrix.translate( 0.35, -0.25, -0.15);
  //  leftElbow.matrix.scale( .5, .6, .6);
  //  leftElbow.renderFast();

  //  var leftForearm = new Cube(leftElbowJointPos);
  //  leftForearm.color = solidColor;
  //  const leftForearmPos = new Matrix4(leftForearm.matrix);
  //  leftForearm.matrix.scale(  1.2, .35, .45);
  //  leftForearm.matrix.rotate(-5, 0, 0, 1);
  //  leftForearm.matrix.translate(-.1, -.35, 0);
  //  leftForearm.renderFast();

  //  var leftWristJoint = new Cube(leftForearmPos);
  //  leftWristJoint.color = solidColor;
  //  leftWristJoint.matrix.translate(-1.3,  0.15, .25);
  //  leftWristJoint.matrix.rotate(  g_leftWristAngle, 0, 1, 0);
  //  leftWristJoint.matrix.rotate(180, 1, 0, 0);
  //  const leftWristJointPos = new Matrix4(leftWristJoint.matrix);
  //  leftWristJoint.matrix.scale(.25, .1, .1);
  //  leftWristJoint.renderFast();

  //  var leftWrist = new Cube(leftWristJointPos);
  //  leftWrist.color = solidColor;
  //  leftWrist.matrix.translate( 0.1, -0.175, -0.175);
  //  leftWrist.matrix.scale( .55, .5, .45);
  //  leftWrist.renderFast();

  var rightTopArmConnector = new Cube(upperBodyPosScaled);
  rightTopArmConnector.color = solidColor;
  rightTopArmConnector.matrix.rotate(-25, 0, 0, 1);
  rightTopArmConnector.matrix.scale(-0.2, 0.15, 0.9);
  rightTopArmConnector.matrix.translate(-3.1, 7.82, 0);
  rightTopArmConnector.renderFast();

  var pelvis = new Cube();
  // pelvis.matrix.setTranslate(0, 0, 0);
  // var pelvis = new Cube(lowerBodyPos);
  pelvis.color = solidColor;
  pelvis.matrix.translate(-0.135, 0.13, POSITION_OFFSET_X);
  pelvis.matrix.translate(g_bodyPos[0], g_bodyPos[2], g_bodyPos[1]);

  if (shouldAnimate) {
    pelvis.matrix.rotate(5 * Math.sin(g_seconds * 5), 1, 0, 0);
    pelvis.matrix.translate(0, 0.025 * Math.sin(g_seconds * 10), 0);
  } else {
    pelvis.matrix.rotate(g_pelvisAngle, 1, 0, 0);
  }
  // pelvis.matrix.translate(0, g_wristPosition, 0)
  pelvis.matrix.scale(0.32, 0.32, 0.32);
  const pelvisPos = new Matrix4(pelvis.matrix);
  pelvis.matrix.scale(1.375, 0.3, 0.75);
  pelvis.renderFast();

  const rightLegJoint = new Cube(pelvisPos);
  rightLegJoint.color = solidColor;
  rightLegJoint.matrix.translate(0.825, 0.05, 0.5);
  rightLegJoint.matrix.scale(0.25, 0.1, 0.2);
  if (shouldAnimate) {
    rightLegJoint.matrix.rotate(60 * Math.sin(g_seconds * 5) - 180, 1, 0, 0);
  } else {
    rightLegJoint.matrix.rotate(g_rightHipAngle, 1, 0, 0);
  }
  const rightLegJointPos = new Matrix4(rightLegJoint.matrix);
  rightLegJoint.matrix.scale(1.3, 1.5, 0.5);
  rightLegJoint.renderFast();

  const rightThigh = new Cube(rightLegJointPos);
  rightThigh.color = solidColor;
  rightThigh.matrix.translate(-0.3, -0.5, -1.1);
  // rightThigh.matrix.rotate(180, 1,0,0);
  // rightThigh.matrix.rotate(-g_rightKneeAngle, 1,0,0);
  const rightThighPos = new Matrix4(rightThigh.matrix);
  rightThigh.matrix.scale(2.2, 8, 3.35);
  rightThigh.renderFast();

  const rightKneeJoint = new Cube(rightThighPos);
  rightKneeJoint.color = solidColor;
  rightKneeJoint.matrix.translate(0.85, 8, 0.6);
  if (shouldAnimate) {
    rightKneeJoint.matrix.rotate(
      60 + 5 * Math.sin(g_seconds * 5) - 200,
      1,
      0,
      0
    );
  } else {
    rightKneeJoint.matrix.rotate(g_rightKneeAngle, 1, 0, 0);
  }
  rightKneeJoint.matrix.rotate(180, 1, 0, 0);
  // rightKneeJoint.matrix.scale(.25,.1,.25);
  const rightKneeJointPos = new Matrix4(rightKneeJoint.matrix);
  rightKneeJoint.matrix.scale(0.5, 2, 0.5);
  rightKneeJoint.renderFast();

  const rightCalf = new Cube(rightKneeJointPos);
  rightCalf.color = solidColor;
  rightCalf.matrix.translate(-0.75, -0.5, -0.5);
  // rightCalf.matrix.rotate(180, 1,0,0);
  // rightCalf.matrix.rotate(-g_rightAnkleAngle, 1,0,0);
  const rightCalfPos = new Matrix4(rightCalf.matrix);
  rightCalf.matrix.scale(2, 10, 3);
  rightCalf.renderFast();

  const rightAnkleJoint = new Cube(rightCalfPos);
  rightAnkleJoint.color = solidColor;
  rightAnkleJoint.matrix.translate(1, 8.5, 2);
  rightAnkleJoint.matrix.rotate(g_rightAnkleAngle, 1, 0, 0);
  rightAnkleJoint.matrix.rotate(180, 1, 0, 0);
  const rightAnkleJointPos = new Matrix4(rightAnkleJoint.matrix);
  // rightAnkleJoint.renderFast();

  const rightFoot = new Cube(rightAnkleJointPos);
  rightFoot.color = solidColor;
  rightFoot.matrix.translate(-1.2, -2, -1);
  const rightFootPos = new Matrix4(rightFoot.matrix);
  rightFoot.matrix.scale(2.5, 2, 5);
  rightFoot.renderFast();

  const leftLegJoint = new Cube(pelvisPos);
  leftLegJoint.color = solidColor;
  leftLegJoint.matrix.translate(0.25, 0, 0.5);
  leftLegJoint.matrix.scale(0.25, 0.1, 0.2);
  if (shouldAnimate) {
    leftLegJoint.matrix.rotate(
      60 * Math.sin(g_seconds * 5 - 10) - 200,
      1,
      0,
      0
    );
  } else {
    leftLegJoint.matrix.rotate(g_leftHipAngle, 1, 0, 0);
  }
  const leftLegJointPos = new Matrix4(leftLegJoint.matrix);
  leftLegJoint.matrix.scale(0.5, 1, 0.5);
  leftLegJoint.renderFast();

  const leftThigh = new Cube(leftLegJointPos);
  leftThigh.color = solidColor;
  leftThigh.matrix.translate(-0.9, -0, -1);
  // leftThigh.matrix.rotate(180, 1,0,0);
  // leftThigh.matrix.rotate(-g_leftKneeAngle, 1,0,0);
  const leftThighPos = new Matrix4(leftThigh.matrix);
  leftThigh.matrix.scale(2.3, 7, 3.1);
  leftThigh.renderFast();

  const leftKneeJoint = new Cube(leftThighPos);
  leftKneeJoint.color = solidColor;
  leftKneeJoint.matrix.translate(0.85, 7, 0.9);
  if (shouldAnimate) {
    leftKneeJoint.matrix.rotate(45 + 5 * Math.sin(g_seconds * 5), 1, 0, 0);
  } else {
    leftKneeJoint.matrix.rotate(g_leftKneeAngle, 1, 0, 0);
  }
  // leftKneeJoint.matrix.rotate(180, 1,0,0);
  // leftKneeJoint.matrix.scale(.25,.1,.25);
  const leftKneeJointPos = new Matrix4(leftKneeJoint.matrix);
  leftKneeJoint.matrix.scale(0.5, 2, 0.5);
  leftKneeJoint.renderFast();

  const leftCalf = new Cube(leftKneeJointPos);
  leftCalf.color = solidColor;
  leftCalf.matrix.translate(-0.75, -0.5, -1);
  // leftCalf.matrix.rotate(180, 1,0,0);
  // leftCalf.matrix.rotate(-g_leftAnkleAngle, 1,0,0);
  const leftCalfPos = new Matrix4(leftCalf.matrix);
  leftCalf.matrix.scale(2, 10, 3);
  leftCalf.renderFast();

  const leftAnkleJoint = new Cube(leftCalfPos);
  leftAnkleJoint.color = solidColor;
  leftAnkleJoint.matrix.translate(1, 8.5, 2);
  leftAnkleJoint.matrix.rotate(g_leftAnkleAngle, 1, 0, 0);
  leftAnkleJoint.matrix.rotate(180, 1, 0, 0);
  const leftAnkleJointPos = new Matrix4(leftAnkleJoint.matrix);
  leftAnkleJoint.matrix.scale(0.25, 0.1, 0.25);
  leftAnkleJoint.renderFast();

  const leftFoot = new Cube(leftAnkleJointPos);
  leftFoot.color = solidColor;
  leftFoot.matrix.translate(-1.4, -2, -1);
  const leftFootPos = new Matrix4(leftFoot.matrix);
  leftFoot.matrix.scale(2.5, 2, 5);
  leftFoot.renderFast();

  var leftLowerBody = new Cube(upperBodyPosScaled);
  leftLowerBody.color = solidColor;
  leftLowerBody.matrix.translate(-0.1, -1, 0.05);
  leftLowerBody.matrix.rotate(-15, 0, 0, 1);
  leftLowerBody.matrix.scale(0.25, 0.75, 0.9);
  leftLowerBody.renderFast();

  var rightLowerBody = new Cube(upperBodyPosScaled);
  rightLowerBody.color = solidColor;
  rightLowerBody.matrix.translate(0.85, -1.075, 0.05);
  rightLowerBody.matrix.rotate(15, 0, 0, 1);
  rightLowerBody.matrix.scale(0.25, 0.75, 0.9);
  rightLowerBody.renderFast();

  var neckMiddle = new Cube(upperBodyPosScaled);
  neckMiddle.color = solidColor;
  neckMiddle.matrix.translate(0.33, 0.95, 0);
  const neckMiddlePos = new Matrix4(neckMiddle.matrix);
  neckMiddle.matrix.translate(0.05, 0, 0);
  neckMiddle.matrix.scale(0.25, 0.25, 1);
  neckMiddle.renderFast();

  var neckJoint = new Cube(neckMiddlePos);
  neckJoint.color = [0, 0, 0, 0];
  // neckJoint.matrix.scale(.1,.1,.1);
  neckJoint.matrix.translate(0.2, 0, 0.5);
  neckJoint.matrix.rotate(180, 0, 1, 0);
  neckJoint.matrix.rotate(-90, 1, 0, 0);
  if (shouldAnimate) {
    neckJoint.matrix.rotate(10 * Math.sin(g_seconds * 5), 1, 0, 0);
  } else {
    neckJoint.matrix.rotate(g_neckAngleVertical, 1, 0, 0);
    neckJoint.matrix.rotate(g_neckAngleHorizontal, 0, 0, 1);
  }
  neckJoint.matrix.scale(0.4, 0.75, 0.4);

  neckJoint.matrix.scale(1, 0.9, 1);
  const neckJointPos = new Matrix4(neckJoint.matrix);
  neckJoint.matrix.scale(0.1, 0.05, 1);

  const upperNeck = new Cube(neckJointPos);
  upperNeck.color = solidColor;
  upperNeck.matrix.translate(0, -0.05, 0.7);
  const upperNeckPos = new Matrix4(upperNeck.matrix);
  upperNeck.matrix.translate(-0.45, -0.45, -0.35);
  // upperNeck.matrix.translate(0, 0, .5);
  upperNeck.matrix.scale(1, 0.95, 0.9);
  upperNeck.renderFast();

  const headTop = new Cube(upperNeckPos);
  headTop.color = solidColor;
  headTop.matrix.translate(-0.6, -0.6, 0.75);
  headTop.matrix.scale(1.3, 1.4, 1.15);
  let headPos = new Matrix4(headTop.matrix);
  headTop.matrix.translate(-0.125, -0.05, 0.95);
  headTop.matrix.scale(1.2, 1.1, 0.2);
  headTop.renderFast();

  const headTopLeft = new Cube(headPos);
  headTopLeft.color = solidColor;
  headTopLeft.matrix.translate(0.8, 0, 0.6);
  headTopLeft.matrix.rotate(-30, 0, 1, 0);
  headTopLeft.matrix.scale(0.2, 1, 0.5);
  headTopLeft.renderFast();

  const headTopRight = new Cube(headPos);
  headTopRight.color = solidColor;
  headTopRight.matrix.translate(0, 0, 0.7);
  headTopRight.matrix.rotate(30, 0, 1, 0);
  headTopRight.matrix.scale(0.2, 1, 0.5);
  headTopRight.renderFast();

  const crownBase = new Cube(headPos);
  crownBase.color = [0.95, 0.95, 0.95, 1];
  crownBase.matrix.translate(0, 0, 1.15);
  crownBase.matrix.scale(1, 0.75, 0.85);
  crownBase.renderFast();

  const crownFlip = new Cube(headPos);
  crownFlip.color = solidColor;
  crownFlip.matrix.scale(-1, 1, 1);
  crownFlip.matrix.translate(-1, 0, 0);
  const crownPos = new Matrix4(crownFlip.matrix);

  const crownSpike1 = new Cube(crownPos);
  crownSpike1.color = [0.9, 0.9, 0.9, 0.9];
  crownSpike1.matrix.translate(1, 0.75, 1.1);
  crownSpike1.matrix.scale(0.2, 0.2, 1);
  crownSpike1.renderFast();

  const crownSpike2 = new Cube(crownPos);
  crownSpike2.color = [0.95, 0.95, 0.95, 0.9];
  crownSpike2.matrix.translate(0.8, 0.85, 1.1);
  crownSpike2.matrix.scale(0.2, 0.2, 2.25);
  crownSpike2.renderFast();

  const crownSpike3 = new Cube(crownPos);
  crownSpike3.color = [0.85, 0.85, 0.85, 0.9];
  crownSpike3.matrix.translate(0.6, 0.85, 1.1);
  crownSpike3.matrix.scale(0.2, 0.2, 2);
  crownSpike3.renderFast();

  const crownSpike4 = new Cube(crownPos);
  crownSpike4.color = [1, 1, 1, 0.9];
  crownSpike4.matrix.translate(0.4, 0.85, 1.1);
  crownSpike4.matrix.scale(0.2, 0.2, 2.3);
  crownSpike4.renderFast();

  const crownSpike5 = new Cube(crownPos);
  crownSpike5.color = [1, 1, 1, 0.9];
  crownSpike5.matrix.translate(0.4, 1, 2);
  crownSpike5.matrix.scale(0.2, 0.2, 1);
  crownSpike5.renderFast();

  const crownSpike6 = new Cube(crownPos);
  crownSpike6.color = [0.95, 0.95, 0.95, 0.9];
  crownSpike6.matrix.translate(0.2, 0.85, 1.1);
  crownSpike6.matrix.scale(0.2, 0.2, 1.9);
  crownSpike6.renderFast();

  const crownSpike7 = new Cube(crownPos);
  crownSpike7.color = [0.95, 0.95, 0.95, 0.9];
  crownSpike7.matrix.translate(-0.1, 0.8, 1.1);
  crownSpike7.matrix.rotate(-5, 0, 1, 0);
  crownSpike7.matrix.scale(0.3, 0.2, 1.4);
  crownSpike7.renderFast();

  const crownBack = new Cube(crownPos);
  crownBack.color = [1, 1, 1, 1];
  crownBack.matrix.translate(-0.1, 0, 1.1);
  crownBack.matrix.scale(1, 0.5, 1);

  const headRight = new Cube(headPos);
  headRight.color = [1, 1, 1, 1];
  headRight.matrix.translate(0, 0, 0);
  headRight.matrix.rotate(-2.5, 0, 1, 0);
  headRight.matrix.scale(0.2, 1, 1);
  headRight.renderFast();

  const headLeft = new Cube(headPos);
  headLeft.color = [1, 1, 1, 1];
  headLeft.matrix.translate(0.775, 0, 0);
  headLeft.matrix.rotate(2.5, 0, 1, 0);
  headLeft.matrix.scale(0.2, 1, 1);
  headLeft.renderFast();

  const faceHole = new Cube(headPos);
  faceHole.color = [0, 0, 0, 1];
  faceHole.matrix.translate(0.2, 0.45, -0.25);
  faceHole.matrix.scale(0.6, 0.5, 1.2);
  faceHole.renderFast();

  const headBack = new Cube(headPos);
  headBack.color = [1, 1, 1, 1];
  headBack.matrix.translate(0.175, -0.0001, -0.25);
  headBack.matrix.scale(0.625, 0.5, 1.2);
  headBack.renderFast();

  const chinRight = new Cube(headPos);
  chinRight.color = [1, 1, 1, 1];
  chinRight.matrix.translate(0.3, 0, -0.5);
  chinRight.matrix.rotate(30, 0, -1, 0);
  chinRight.matrix.scale(0.25, 1, 0.6);
  chinRight.renderFast();

  const chinLeft = new Cube(headPos);
  chinLeft.color = [1, 1, 1, 1];
  chinLeft.matrix.translate(0.475, 0, -0.375);
  chinLeft.matrix.rotate(-30, 0, -1, 0);
  chinLeft.matrix.scale(0.25, 1, 0.6);
  chinLeft.renderFast();

  const chinBottom = new Cube(headPos);
  chinBottom.color = [1, 1, 1, 1];
  chinBottom.matrix.translate(0.275, 0, -0.5);
  chinBottom.matrix.scale(0.45, 1, 0.25);
  chinBottom.renderFast();

  var neckLeft1 = new Cube(upperBodyPosScaled);
  neckLeft1.color = solidColor;
  neckLeft1.matrix.translate(0, 1, 0);
  neckLeft1.matrix.scale(0.16, 0.5, 1);
  neckLeft1.matrix.rotate(-85, 0, 0, 1);
  neckLeft1.renderFast();

  var neckLeft2 = new Cube(upperBodyPosScaled);
  neckLeft2.color = solidColor;
  neckLeft2.matrix.translate(0.25, 0.8, 0);
  neckLeft2.matrix.rotate(40, 0, 0, 1);
  neckLeft2.matrix.scale(0.4, 0.25, 1);
  neckLeft2.renderFast();

  var neckRight1 = new Cube(upperBodyPosScaled);
  neckRight1.color = solidColor;
  neckRight1.matrix.translate(1, 1, 0);
  neckRight1.matrix.scale(-0.16, 0.5, 1);
  neckRight1.matrix.rotate(-85, 0, 0, 1);
  neckRight1.renderFast();

  var neckRight2 = new Cube(upperBodyPosScaled);
  neckRight2.color = solidColor;
  neckRight2.matrix.translate(0.75, 0.8, 0);
  neckRight2.matrix.rotate(-40, 0, 0, 1);
  neckRight2.matrix.scale(-0.4, 0.25, 1);
  neckRight2.renderFast();

  var duration = performance.now() - startTime;
  document.getElementById("performanceLabel").innerText =
    "ms: " +
    Math.floor(duration) +
    " fps: " +
    Math.floor(1000.0 / duration) / 10;
}

function keyboardPressed() {
  if (pressedKeys[37] || pressedKeys[65]) {
    g_camera.left();
  }
  if (pressedKeys[39] || pressedKeys[68]) {
    g_camera.right();
  }
  if (pressedKeys[38] || pressedKeys[87]) {
    g_camera.forward();
  }
  if (pressedKeys[40] || pressedKeys[83]) {
    g_camera.backward();
  }
  if (pressedKeys[32]) {
    g_camera.moveUp();
  }
  if (pressedKeys[17]) {
    g_camera.moveDown();
  }
  if (pressedKeys[81]) {
    // 'Q' key
    g_camera.panLeft();
  }
  if (pressedKeys[69]) {
    // 'E' key
    g_camera.panRight();
  }
}

let score = 0;
const TIMEOUT = 20;
let timeLeft = TIMEOUT;

function tick() {
  g_seconds = performance.now() / 1000 - g_startTime;

  keyboardPressed();

  touchMinos();

  renderAllShapes(); // Render all shapes

  requestAnimationFrame(tick); // Request the next frame
}

function touchMinos() {
  timeLeft = TIMEOUT - (performance.now() / 1000 - g_startTime)
  if (timeLeft < 0) {
    timeLeft = 0;
  }
  // console.log(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  // console.log('body', g_bodyPos[0], g_bodyPos[1], g_bodyPos[2]);
  const touching =
    g_camera.eye.elements[0] > g_bodyPos[0] - MINOS_HITBOX &&
    g_camera.eye.elements[0] < g_bodyPos[0] + MINOS_HITBOX &&
    g_camera.eye.elements[1] > g_bodyPos[2] - MINOS_HITBOX &&
    g_camera.eye.elements[1] < g_bodyPos[2] + MINOS_HITBOX &&
    g_camera.eye.elements[2] > g_bodyPos[1] - MINOS_HITBOX &&
    g_camera.eye.elements[2] < g_bodyPos[1] + MINOS_HITBOX;

  if (touching) {
    score += Math.max(Math.round((timeLeft / TIMEOUT) * 50) * 10, 50);
    // console.log("Score: " + score, (1 / timeLeft) * 10);
    timeLeft = TIMEOUT;
    document.getElementById("scoreLabel").innerText = "Score: " + score;

    g_bodyPos = [Math.random() * 30 - 15, Math.random() * 30 - 16, 0];
  }
}

function convertCoordinatesEventToGL(event) {
  var x = event.clientX; // x coordinate of a mouse pointer
  var y = event.clientY; // y coordinate of a mouse pointer
  var rect = event.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}
