function setupUICallbacks() {
  canvas.onmousedown = function (event) {
    if (event.shiftKey) {
      if (!shouldAnimate) {
        poke();
      }
      return;
    }

    click(event);
  };
  canvas.onmousemove = function (event) {
    if (event.buttons != 1) {
      return;
    }
    rotateView(event);
  };

  // document.getElementById('enableSpeech').addEventListener('click', function() {
  //     // const audio = document.getElementById('minosSpeech');
  //     // audio.currentTime = 0; // Reset the audio to the beginning
  //     // // audio.volume = 0.2; // Set the volume to 50%
  //     // audio.play(); // Play the sound
  //     shouldAnimate = false;
  //     doSpawnAnimation();
  // });

  // document.getElementById('disableSpeech').addEventListener('click', function() {
  //     stopAnimation = true;
  //     const audio = document.getElementById('minosSpeech');
  //     audio.pause();
  //     audio.currentTime = 0; // Reset the audio to the beginning

  //     shouldAnimate = false;
  //     resetAngles();
  // });

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

    // document.getElementById('minosSpeech').play();
    shouldAnimate = true;
    stopAnimation = true;
  });

  document.getElementById("disableWalk").addEventListener("click", function () {
    // const audio = document.getElementById('minosSpeech');
    // audio.pause();
    // audio.currentTime = 0;

    shouldAnimate = false;
    stopAnimation = true;
  });

  document
    .getElementById("resetCharacter")
    .addEventListener("click", function () {
      resetAngles();
    });

  document.getElementById("overhead").addEventListener("click", function () {
    doOverhead();
  });

  const parentElement = document.getElementById("sliderContainer");

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

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
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

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture"); // Get the storage location of u_whichTexture
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture");
    return false;
  }
}

function initTextures() {

  var image = new Image(); // Create the image object
  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }

  image.onload = function () {
    sendTextureToGLSL(image); // Initialize the texture when the image is loaded
  };

  image.src = './assets/sky.jpg';

  return true;
}

function sendTextureToGLSL(image) {
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

  // gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}