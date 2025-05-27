const sliders = [
  {
    sectionTitle: "Lighting",
    sliders: [
      {
        id: "lightPositionX",
        label: "Light Position X",
        min: -100,
        max: 100,
        value: 0,
        step: 1,
        onChange: function (event, slider) {
          if (event.buttons != 1) {
            return;
          }
          console.log("Light Position X: " + event.target.value);
          const value = event.target.value;
          var x = Number(value) / 5;

          g_lightPosition[0] = x;
          document.getElementById(slider.id + "Label").innerText =
            slider.label + ":\xa0" + value;
          renderAllShapes();
        },
      },
      {
        id: "lightPositionY",
        label: "Light Position Y",
        min: -100,
        max: 100,
        value: 0,
        step: 1,
        onChange: function (event, slider) {
          if (event.buttons != 1) {
            return;
          }
          console.log("Light Position Y: " + event.target.value);
          const value = event.target.value;
          var y = Number(value) / 5;

          g_lightPosition[1] = y;
          document.getElementById(slider.id + "Label").innerText =
            slider.label + ":\xa0" + value;
          renderAllShapes();
        },
      },
      {
        id: "lightPositionZ",
        label: "Light Position Z",
        min: -100,
        max: 100,
        value: 0,
        step: 1,
        onChange: function (event, slider) {
          if (event.buttons != 1) {
            return;
          }
          console.log("Light Position Z: " + event.target.value);
          const value = event.target.value;
          var z = Number(value) / 5;

          g_lightPosition[2] = z;
          document.getElementById(slider.id + "Label").innerText =
            slider.label + ":\xa0" + value;
          renderAllShapes();
        },
      },
    ],
  },
];

function setupUICallbacks() {
  canvas.onmousedown = function (event) {
    if (event.shiftKey) {
      if (!shouldAnimate) {
        poke();
      }
      return;
    }
    [g_mousePosX, g_mousePosY] = convertCoordinatesEventToGL(event);
    // g_camera.mousePan((g_mousePosX - x), g_mousePosY - y);
    // click(event);
  };
  canvas.onmousemove = function (event) {
    if (event.buttons != 1) {
      return;
    }
    click(event);
  };

  document.getElementById("normalsOn").addEventListener("click", function () {
    g_normalsOn = true;
    renderAllShapes();
  });

  document.getElementById("normalsOff").addEventListener("click", function () {
    g_normalsOn = false;
    renderAllShapes();
  });

  document
    .getElementById("startMadeInHeaven")
    .addEventListener("click", function () {
      g_accelerateTime = true;
      g_rotateLight = false;
      g_lightSpeed = 1;
      g_lightOn = true;
      g_accelerateStart = performance.now() / 1000;
    });

  document
    .getElementById("stopMadeInHeaven")
    .addEventListener("click", function () {
      g_lightPosition = [0, 1.5, 1];
      g_accelerateTime = false;
      g_rotateLight = false;
      g_lightSpeed = 1;
    });

  document
    .getElementById("startAnimation")
    .addEventListener("click", function () {
      g_accelerateTime = false;
      g_rotateLight = true;
      g_lightSpeed = 1;
      g_lightOn = true;
      g_accelerateTime = false;
      g_accelerateStart = performance.now() / 1000;
    });

  document
    .getElementById("stopAnimation")
    .addEventListener("click", function () {
      g_lightPosition = [0, 1.5, 1];
      g_accelerateTime = false;
      g_rotateLight = false;
      g_lightSpeed = 1;
    });

  document.getElementById("enablePose").addEventListener("click", function () {
    resetAngles();
    shouldAnimate = false;
    stopAnimation = true;
    doPose();
  });

  document.getElementById("disablePose").addEventListener("click", function () {
    stopAnimation = true;
    shouldAnimate = false;
    poseRunning = false;
    g_globalAngleHorizontal = 190;
    g_globalAngleVertical = -5;
    const audio = document.getElementById("minosSpeech");
    audio.pause();
    audio.currentTime = 0; // Reset the audio to the beginning
  });

  document.getElementById("enableWalk").addEventListener("click", function () {
    resetAngles();

    shouldAnimate = true;
    stopAnimation = true;
  });

  document.getElementById("enableLight").addEventListener("click", function () {
    g_lightOn = true;
    renderAllShapes();
  });

  document
    .getElementById("disableLight")
    .addEventListener("click", function () {
      g_lightOn = false;
      renderAllShapes();
    });

  document.getElementById("disableWalk").addEventListener("click", function () {
    shouldAnimate = false;
    stopAnimation = true;
  });

  document.getElementById("overhead").addEventListener("click", function () {
    doOverhead();
  });

  const parentElement = document.getElementById("sliderContainer");

  document.oncontextmenu = function (event) {
    event.preventDefault();
  };

  sliders.forEach((sliderCategory) => {
    const sectionTitle = document.createElement("h3");
    sectionTitle.innerText = sliderCategory.sectionTitle;
    parentElement.appendChild(sectionTitle);

    const sectionContainer = document.createElement("div");
    sectionContainer.appendChild(sectionTitle);
    sliderCategory.sliders.forEach((slider) => {
      const sliderContainer = document.createElement("div");

      const labelElement = document.createElement("label");
      const sliderElement = document.createElement("input");
      sliderElement.type = "range";
      sliderElement.id = slider.id + "Slider";
      sliderElement.min = slider.min;
      sliderElement.max = slider.max;
      sliderElement.value = slider.value;
      sliderElement.step = slider.step;
      sliderContainer.appendChild(sliderElement);
      labelElement.innerText = "\xa0\xa0" + slider.label + ": " + slider.value;
      labelElement.id = slider.id + "Label";
      labelElement.setAttribute("for", slider.id);
      sliderContainer.appendChild(labelElement);
      parentElement.appendChild(sliderContainer);
      parentElement.appendChild(document.createElement("br"));
      slider.label = "\xa0\xa0" + slider.label;
      sliderElement.addEventListener("mousemove", function (event) {
        slider.onChange(event, slider);
      });

      sectionContainer.appendChild(sliderContainer);
    });

    parentElement.appendChild(sectionContainer);
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

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById(CANVAS_ID);
  if (!canvas) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, alpha: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
  if (!u_lightPos) {
    console.log("Failed to get the storage location of u_lightPos");
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
  if (!u_cameraPos) {
    console.log("Failed to get the storage location of u_cameraPos");
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
  if (!u_lightOn) {
    console.log("Failed to get the storage location of u_lightsOn");
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  if (a_Normal < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  if (!u_NormalMatrix) {
    console.log("Failed to get the storage location of u_NormalMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0"); // Get the storage location of u_Sampler0
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1"); // Get the storage location of u_Sampler1
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sampler1");
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2"); // Get the storage location of u_Sampler2
  if (!u_Sampler2) {
    console.log("Failed to get the storage location of u_Sampler2");
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture"); // Get the storage location of u_whichTexture
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture");
    return false;
  }
}

function initTextures() {
  var image0 = new Image(); // Create the image object
  if (!image0) {
    console.log("Failed to create the image object");
    return false;
  }
  var image1 = new Image(); // Create the image object
  if (!image1) {
    console.log("Failed to create the image object");
    return false;
  }
  var image2 = new Image(); // Create the image object
  if (!image2) {
    console.log("Failed to create the image object");
    return false;
  }

  image0.onload = function () {
    console.log("Sending texture 0 to GLSL");
    sendTexture0ToGLSL(image0); // Initialize the texture when the image is loaded
  };
  image1.onload = function () {
    console.log("Sending texture 1 to GLSL");
    sendTexture1ToGLSL(image1); // Initialize the texture when the image is loaded
  };
  image2.onload = function () {
    console.log("Sending texture 2 to GLSL");
    sendTexture2ToGLSL(image2); // Initialize the texture when the image is loaded
  };
  image0.src = "./assets/eye.png";
  image1.src = "./assets/flesh.png"; // Set the image source
  image2.src = "./assets/lava.png"; // Set the image source
  return true;
}

function sendTexture0ToGLSL(image) {
  console.log("Sending texture 0 to GLSL");
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis

  gl.activeTexture(gl.TEXTURE0); // Activate texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Assign the image object to the texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texture
  gl.uniform1i(u_Sampler0, 0); // Set the texture unit 0 to the sampler
}

function sendTexture1ToGLSL(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis

  gl.activeTexture(gl.TEXTURE1); // Activate texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Assign the image object to the texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texture
  gl.uniform1i(u_Sampler1, 1); // Set the texture unit 0 to the sampler
}

function sendTexture2ToGLSL(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis

  gl.activeTexture(gl.TEXTURE2); // Activate texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Assign the image object to the texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texture
  gl.uniform1i(u_Sampler2, 2); // Set the texture unit 0 to the sampler
}

// function keydown(event) {
//     switch (event.keyCode) {
//         case 37: // Left arrow key
//         case 65: // 'A' key
//             // g_eye[0] -= 0.05;
//             break;
//         case 39: // Right arrow key
//         case 68: // 'D' key
//             // g_eye[0] += 0.05;
//             break;
//         case 38: // Up arrow key
//         case 87: // 'W' key
//             // g_eye[2] -= 0.05;
//             break;
//         case 40: // Down arrow key
//         case 83: // 'S' key
//             // g_eye[2] += 0.05;
//             break;
//         case 16: // Shift key
//             break;
//         case 17: // Ctrl key
//             break;
//         default:
//             break;
//     }
// }
