class Cube {
  constructor(startMatrix) {
    this.matrix = new Matrix4(startMatrix) || new Matrix4(); // Use the provided matrix or create a new one
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
  }

  render() {
    var rgba = this.color;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
    drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0,0,  1,1,  1,0]); 
    drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0,0,  0,1,  1,1]);

    drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);
    drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.9,
      rgba[1] * 0.9,
      rgba[2] * 0.9,
      rgba[3] * 0.9
    );

    drawTriangle3D([0, 0, 0, 0, 0, 1, 0, 1, 1]);
    drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 1, 0]);

    drawTriangle3D([1, 0, 0, 1, 0, 1, 1, 1, 1]);
    drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 1, 0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.8,
      rgba[1] * 0.8,
      rgba[2] * 0.8,
      rgba[3] * 0.8
    );

    drawTriangle3D([0, 0, 1, 1, 0, 1, 1, 1, 1]);
    drawTriangle3D([0, 0, 1, 1, 1, 1, 0, 1, 1]);

    drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, 1]);
    drawTriangle3D([0, 0, 0, 1, 0, 1, 0, 0, 1]);

    // Restore the old color
    gl.uniform4f(
      u_FragColor,
      g_selectedColor[0],
      g_selectedColor[1],
      g_selectedColor[2],
      g_selectedColor[3]
    );
  }
}
