class Triangle {
  constructor() {
    this.type = "triangle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
    this.size = 10.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_PointSize, size);
    // Draw
    const offset = this.size / 200.0;
    drawTriangle2D([
      xy[0] - offset / 2,
      xy[1] - offset / 2,
      xy[0] + offset / 2,
      xy[1] - offset / 2,
      xy[0],
      xy[1] + offset / 2,
    ]);

    gl.uniform4f(
      u_FragColor,
      g_selectedColor[0],
      g_selectedColor[1],
      g_selectedColor[2],
      g_selectedColor[3]
    );
  }

  drawUpsideDownTriangle() {
    const offset = this.size / 200.0;
    drawTriangle2D([
      this.position[0] - offset / 2,
      this.position[1] + offset / 2,
      this.position[0] + offset / 2,
      this.position[1] + offset / 2,
      this.position[0],
      this.position[1] - offset / 2,
    ]);
    gl.uniform4f(
      u_FragColor,
      g_selectedColor[0],
      g_selectedColor[1],
      g_selectedColor[2],
      g_selectedColor[3]
    );
  }
}

function drawTriangle(vertices, n, color, dimensions = 2, uv = null) {

  console.log(n)

  if (!g_vertexBuffer){
    initTriangle3D(dimensions)
  }
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

  if (uv) {
    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_TexCoord variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_TexCoord variable
    gl.enableVertexAttribArray(a_UV);
  }

  if (color) {
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  }
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle2D(vertices, color) {
  drawTriangle(vertices, 3, color)
}

function drawTriangle3D(vertices, color) {
  drawTriangle(vertices, vertices.length / 3, color, 3);
}

function drawTriangle3DUV(vertices, uv, color) {
  drawTriangle(vertices, vertices.length / 3, color, 3, uv);
}

var g_vertexBuffer = null;
function initTriangle3D(dimensions) {  
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.vertexAttribPointer(a_Position, dimensions, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
}