class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
        this.size = 10.0;
    }
    
    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        
        // gl.disableVert
        // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        gl.uniform1f(u_PointSize, size);
        // Draw
        // gl.drawArrays(gl.POINTS, 0, 1);
        const offset = this.size / 200.0;
        drawTriangle([xy[0] - offset / 2, xy[1] - offset / 2, xy[0] + offset / 2, xy[1] - offset / 2, xy[0], xy[1] + offset / 2]);

        gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);

    }

    drawUpsideDownTriangle() {
        const offset = this.size / 200.0;
        drawTriangle([this.position[0] - offset / 2, this.position[1] + offset / 2, this.position[0] + offset / 2, this.position[1] + offset / 2, this.position[0], this.position[1] - offset / 2]);
        gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);
    }
    
    
}


function drawTriangle(vertices, color) {
    var n = 3; // The number of vertices
    
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
    
    if (color) {
        gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    }
    gl.drawArrays(gl.TRIANGLES, 0, n);
    
}

function drawTriangle3D(vertices, color) {
    var n = 3; // The number of vertices
    
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
    
    if (color) {
        gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    }
    gl.drawArrays(gl.TRIANGLES, 0, n);
    // gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);

}