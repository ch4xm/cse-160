class Cube {
    constructor() {
        this.type = 'cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
        this.matrix = new Matrix4();
        // this.size = 10.0;
        // this.segments = 10; // Number of segments to approximate the circle
    }

    render() {
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
        drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);


        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1], rgba[2] * 0.9, rgba[3] * 0.9);
        drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
        drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

        drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
        drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);

        drawTriangle3D([1,0,0,  1,0,1,  1,1,1]);
        drawTriangle3D([1,0,0,  1,1,1,  1,1,0]);

        drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
        drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);

        drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);
        drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);

        // Restore the old color
        gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);
    }
}