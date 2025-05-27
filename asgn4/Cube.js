class Cube {
  constructor(startMatrix) {
    this.matrix = new Matrix4(startMatrix) || new Matrix4(); // Use the provided matrix or create a new one
    this.normalMatrix = new Matrix4(); // Initialize the normal matrix
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
    this.textureNum = COLOR;
    this.uvs = new Float32Array([
      0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0,
      0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
    ]);
    this.vertices = new Float32Array([
      0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1,
      0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1,
      1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1,
      0, 0, 1, 1, 1, 1, 0, 1,
    ]);
    // this.normals = new Float32Array([
    //     0, 0, -1, 0, 0, -1, 0, 0, -1,
    //     0, 0, -1, 0, 0, -1, 0, 0, -1,
    //     0, 0, -1, 0, 0, -1, 0, 0, -1,
    //     0, 0, -1, 0, 0, -1, 0, 0, -1,
    //     0, 1,  0, 0, 1,  0, 0, 1,  0,
    //     0, 1,  0, 0, 1,  0, 0, 1,  0,
    //     0, 1,  0, 0, 1,  0, 0, 1,  0,
    //     0, 1,  0, 0, 1,  0, 0, 1,  0,
    //     1, 0,  0, 1, 0,  0, 1, 0,  0,
    //     1, 0,  0, 1, 0,  0, 1, 0,  0,
    //     1, 0,  0, 1, 0,  0, 1, 0,  0,
    //     1, 0,  0, 1, 0,  0, 1, 0,  0,
    //   ]);

    this.normals = new Float32Array([
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0,
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    ]);
  }

  render() {
    var rgba = this.color;
    var textureNum = g_normalsOn ? NORMALS : this.textureNum;
    const oldWhichTexture = u_whichTexture;

    this.normalMatrix.setInverseOf(this.matrix);
    this.normalMatrix.transpose();

    gl.uniform1i(u_whichTexture, textureNum); // Set the texture number

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    //   let vertices = [];
    // let uvs = [];

    // uvs = uvs.concat([0,0,  1,1,  1,0]);
    // uvs = uvs.concat([0,0,  0,1,  1,1]);
    // uvs = uvs.concat([0,0,  0,1,  1,1]);
    // uvs = uvs.concat([0,0,  1,1,  1,0]);
    // uvs = uvs.concat([0,0,  0,1,  1,1]);
    // uvs = uvs.concat([0,0,  1,1,  1,0]);
    // uvs = uvs.concat([0,0,  0,1,  1,1]);
    // uvs = uvs.concat([0,0,  1,1,  1,0]);
    // uvs = uvs.concat([0,0,  1,0,  1,1]);
    // uvs = uvs.concat([0,0,  1,1,  1,0]);
    // uvs = uvs.concat([0,0,  1,0,  1,1]);
    // uvs = uvs.concat([0,0,  1,1,  1,0]);

    // vertices = vertices.concat([0, 0, 0, 1, 1, 0, 1, 0, 0])
    // vertices = vertices.concat([0, 0, 0, 0, 1, 0, 1, 1, 0])

    // vertices = vertices.concat([0, 1, 0, 0, 1, 1, 1, 1, 1])
    // vertices = vertices.concat([0, 1, 0, 1, 1, 1, 1, 1, 0])

    // // gl.uniform4f(
    // //   u_FragColor,
    // //   rgba[0] * 0.9,
    // //   rgba[1] * 0.9,
    // //   rgba[2] * 0.9,
    // //   rgba[3] * 0.9
    // // );

    // vertices = vertices.concat([0, 0, 0, 0, 0, 1, 0, 1, 1])
    // vertices = vertices.concat([0, 0, 0, 0, 1, 1, 0, 1, 0])

    // vertices = vertices.concat([1, 0, 0, 1, 0, 1, 1, 1, 1])
    // vertices = vertices.concat([1, 0, 0, 1, 1, 1, 1, 1, 0])

    // // gl.uniform4f(
    // //   u_FragColor,
    // //   rgba[0] * 0.8,
    // //   rgba[1] * 0.8,
    // //   rgba[2] * 0.8,
    // //   rgba[3] * 0.8
    // // );

    // vertices = vertices.concat([0, 0, 1, 1, 0, 1, 1, 1, 1])
    // vertices = vertices.concat([0, 0, 1, 1, 1, 1, 0, 1, 1])

    // vertices = vertices.concat([0, 0, 0, 1, 0, 0, 1, 0, 1])
    // vertices = vertices.concat([0, 0, 0, 1, 0, 1, 0, 0, 1])

    // drawTriangle3DUV(vertices, uvs);

    // Front
    drawTriangle3DUVNormal(
      [0, 0, 0, 1, 1, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 0, -1, 0, 0, -1, 0, 0, -1],
      this.color
    );
    drawTriangle3DUVNormal(
      [0, 0, 0, 0, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 1],
      [0, 0, -1, 0, 0, -1, 0, 0, -1],
      this.color
    );

    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.95,
    //   rgba[1] * 0.95,
    //   rgba[2] * 0.95,
    //   rgba[3] //* 0.95
    // );

    // Top
    drawTriangle3DUVNormal(
      [0, 1, 0, 0, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1],
      [0, 0, 1, 0, 0, 1, 0, 0, 1],
      this.color
    );
    drawTriangle3DUVNormal(
      [0, 1, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0, 1, 0, 0, 1],
      this.color
    );

    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.9,
    //   rgba[1] * 0.9,
    //   rgba[2] * 0.9,
    //   rgba[3] //* 0.9
    // );

    drawTriangle3DUVNormal(
      [0, 0, 0, 0, 0, 1, 0, 1, 1],
      [0, 0, 0, 1, 1, 1],
      [0, 1, 0, 0, 1, 0, 0, 1, 0],
      this.color
    );
    drawTriangle3DUVNormal(
      [0, 0, 0, 0, 1, 1, 0, 1, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 0],
      this.color
    );

    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.85,
    //   rgba[1] * 0.85,
    //   rgba[2] * 0.85,
    //   rgba[3] //* 0.85
    // );

    drawTriangle3DUVNormal(
      [1, 0, 0, 1, 0, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1],
      [0, -1, 0, 0, -1, 0, 0, -1, 0],
      this.color
    );
    drawTriangle3DUVNormal(
      [1, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0],
      [0, -1, 0, 0, -1, 0, 0, -1, 0],
      this.color
    );

    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.8,
    //   rgba[1] * 0.8,
    //   rgba[2] * 0.8,
    //   rgba[3] // * 0.8
    // );

    drawTriangle3DUVNormal(
      [0, 0, 1, 1, 0, 1, 1, 1, 1],
      [0, 0, 1, 0, 1, 1],
      [-1, 0, 0, -1, 0, 0, -1, 0, 0],
      this.color
    );
    drawTriangle3DUVNormal(
      [0, 0, 1, 1, 1, 1, 0, 1, 1],
      [0, 0, 1, 1, 1, 0],
      [-1, 0, 0, -1, 0, 0, -1, 0, 0],
      this.color
    );

    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.75,
    //   rgba[1] * 0.75,
    //   rgba[2] * 0.75,
    //   rgba[3] // * 0.75
    // );

    drawTriangle3DUVNormal(
      [0, 0, 0, 1, 0, 0, 1, 0, 1],
      [0, 0, 1, 0, 1, 1],
      [1, 0, 0, 1, 0, 0, 1, 0, 0],
      this.color
    );
    drawTriangle3DUVNormal(
      [0, 0, 0, 1, 0, 1, 0, 0, 1],
      [0, 0, 1, 1, 1, 0],
      [1, 0, 0, 1, 0, 0, 1, 0, 0],
      this.color
    );

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

    this.normalMatrix.setInverseOf(this.matrix);
    this.normalMatrix.transpose();

    var textureNum = g_normalsOn ? NORMALS : this.textureNum;
    const oldWhichTexture = u_whichTexture;

    gl.uniform1i(u_whichTexture, textureNum); // Set the texture number
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    drawTriangle3DUVNormal(this.vertices, this.uvs, this.normals);
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
