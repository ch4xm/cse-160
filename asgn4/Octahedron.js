// class Octahedron {
//   constructor(startMatrix) {
//     this.matrix = new Matrix4(startMatrix) || new Matrix4(); // Use the provided matrix or create a new one
//     this.type = "octahedron";
//     this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
//     this.textureNum = COLOR;
//   }

//   render() {
//     var rgba = this.color;
    
//     const oldWhichTexture = u_whichTexture;

//     console.log(this.textureNum);
//     gl.uniform1i(u_whichTexture, this.textureNum); // Set the texture number

//     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

//     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

//     // drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
//     drawTriangle3D([-.5,-.5,-.5,   0,0.5,0.5,   0.5,-.5,-.5]);
//     drawTriangle3D([-.5,-.5,-.5,   0,0.5,0.5,   1.5,0.5,-.5]);


//     // drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0,0,  1,1,  1,0]); 
//     // drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0,0,  0,1,  1,1]);

//     // drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0,0,  0,1,  1,1]);
//     // drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0,0,  1,1,  1,0]);

//     // gl.uniform4f(
//     //   u_FragColor,
//     //   rgba[0] * 0.9,
//     //   rgba[1] * 0.9,
//     //   rgba[2] * 0.9,
//     //   rgba[3] * 0.9
//     // );

//     // drawTriangle3DUV([0, 0, 0, 0, 0, 1, 0, 1, 1], [0,0,  0,1,  1,1]);
//     // drawTriangle3DUV([0, 0, 0, 0, 1, 1, 0, 1, 0], [0,0,  1,1,  1,0]);

//     // drawTriangle3DUV([1, 0, 0, 1, 0, 1, 1, 1, 1], [0,0,  0,1,  1,1]);
//     // drawTriangle3DUV([1, 0, 0, 1, 1, 1, 1, 1, 0], [0,0,  1,1,  1,0]);

//     // gl.uniform4f(
//     //   u_FragColor,
//     //   rgba[0] * 0.8,
//     //   rgba[1] * 0.8,
//     //   rgba[2] * 0.8,
//     //   rgba[3] * 0.8
//     // );

//     // drawTriangle3DUV([0, 0, 1, 1, 0, 1, 1, 1, 1], [0,0,  1,0,  1,1]);
//     // drawTriangle3DUV([0, 0, 1, 1, 1, 1, 0, 1, 1], [0,0,  1,1,  1,0]);

//     // drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], [0,0,  1,0,  1,1]);
//     // drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], [0,0,  1,1,  1,0]);

//     // // Restore the old color
//     // gl.uniform4f(
//     //   u_FragColor,
//     //   g_selectedColor[0],
//     //   g_selectedColor[1],
//     //   g_selectedColor[2],
//     //   g_selectedColor[3]
//     // );
//     // gl.uniform1i(u_whichTexture, oldWhichTexture); // Restore the old texture number
//   }
// }
