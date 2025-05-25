class Cube {
  constructor(startMatrix) {
    this.matrix = new Matrix4(startMatrix) || new Matrix4(); // Use the provided matrix or create a new one
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
    this.textureNum = COLOR;
    this.uvs = new Float32Array([
      0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0,
      0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0,
      1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0,
    ]);
    this.vertices = new Float32Array([
      0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1,
      1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1,
      1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1,
      1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0,
      0, 0, 1, 0, 1, 0, 0, 1,
    ]);
  }

  render() {
    var rgba = this.color;

    const oldWhichTexture = u_whichTexture;

    gl.uniform1i(u_whichTexture, this.textureNum); // Set the texture number

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    drawTriangle3DOld([0, 0, 0, 1, 1, 0, 1, 0, 0]);
    drawTriangle3DOld([0, 0, 0, 0, 1, 0, 1, 1, 0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.95,
      rgba[1] * 0.95,
      rgba[2] * 0.95,
      rgba[3] * 0.95
    );

    drawTriangle3DOld([0, 1, 0, 0, 1, 1, 1, 1, 1]);
    drawTriangle3DOld([0, 1, 0, 1, 1, 1, 1, 1, 0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.9,
      rgba[1] * 0.9,
      rgba[2] * 0.9,
      rgba[3] * 0.9
    );

    drawTriangle3DOld([0, 0, 0, 0, 0, 1, 0, 1, 1]);
    drawTriangle3DOld([0, 0, 0, 0, 1, 1, 0, 1, 0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.85,
      rgba[1] * 0.85,
      rgba[2] * 0.85,
      rgba[3] * 0.85
    );

    drawTriangle3DOld([1, 0, 0, 1, 0, 1, 1, 1, 1]);
    drawTriangle3DOld([1, 0, 0, 1, 1, 1, 1, 1, 0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.8,
      rgba[1] * 0.8,
      rgba[2] * 0.8,
      rgba[3] * 0.8
    );

    drawTriangle3DOld([0, 0, 1, 1, 0, 1, 1, 1, 1]);
    drawTriangle3DOld([0, 0, 1, 1, 1, 1, 0, 1, 1]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.75,
      rgba[1] * 0.75,
      rgba[2] * 0.75,
      rgba[3] * 0.75
    );

    drawTriangle3DOld([0, 0, 0, 1, 0, 0, 1, 0, 1]);
    drawTriangle3DOld([0, 0, 0, 1, 0, 1, 0, 0, 1]);

    // Restore the old color
    gl.uniform4f(
      u_FragColor,
      g_selectedColor[0],
      g_selectedColor[1],
      g_selectedColor[2],
      g_selectedColor[3]
    );
    gl.uniform1i(u_whichTexture, oldWhichTexture); // Restore the old texture number
  }

  renderFast() {
    var rgba = this.color;

    const oldWhichTexture = u_whichTexture;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.uniform1i(u_whichTexture, this.textureNum); // Set the texture number

    drawTriangle3DUV(this.vertices, this.uvs);

    // Restore the old color
    gl.uniform4f(
      u_FragColor,
      g_selectedColor[0],
      g_selectedColor[1],
      g_selectedColor[2],
      g_selectedColor[3]
    );

    gl.uniform1i(u_whichTexture, oldWhichTexture); // Restore the old texture number
  }
}
