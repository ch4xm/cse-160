class Sphere {
  constructor(startMatrix) {
    this.matrix = new Matrix4(startMatrix) || new Matrix4(); // Use the provided matrix or create a new one
    this.type = "sphere";
    this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
    this.textureNum = COLOR;
  }

  render() {
    var rgba = this.color;
    var textureNum = g_normalsOn ? NORMALS : this.textureNum;
    // const oldWhichTexture = u_whichTexture;

    gl.uniform1i(u_whichTexture, textureNum); // Set the texture number

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Step size
    var d = Math.PI / 10;

    // Delta
    var dd = Math.PI / 10;

    for (var t = 0; t < Math.PI; t += d) {
        for (var r = 0; r < (2 * Math.PI); r += d) {
            let p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
            let p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
            let p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
            let p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

            var v = [];
            var uv = [];
            v = v.concat(p1);
            uv = uv.concat([0,0]);
            v = v.concat(p2);
            uv = uv.concat([0,0]);
            v = v.concat(p4);
            uv = uv.concat([0,0]);

            gl.uniform4f(u_FragColor, 1, 1, 0, 1);
            drawTriangle3DUVNormal(v, uv, v);

            var v = [];
            var uv = [];
            v = v.concat(p1);
            uv = uv.concat([0,0]);
            v = v.concat(p4);
            uv = uv.concat([0,0]);
            v = v.concat(p3);
            uv = uv.concat([0,0]);
            gl.uniform4f(u_FragColor, 0, 1, 1, 1);

            drawTriangle3DUVNormal(v, uv, v);
        }
    }
  }
}
