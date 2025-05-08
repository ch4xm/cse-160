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

  // Get the storage location of u_PointSize
  // u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  // if (!u_PointSize) {
  //     console.log('Failed to get the storage location of u_PointSize');
  //     return;
  // }
}
