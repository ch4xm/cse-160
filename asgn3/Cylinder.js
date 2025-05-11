class Cylinder {
    constructor(startMatrix) {
        this.type = 'cylinder';
        this.matrix = new Matrix4(startMatrix) || new Matrix4(); // Use the provided matrix or create a new one
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
        this.size = .25;
        this.height = 1.0;
        this.segments = 10; // Number of segments to approximate the circle
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        var height = this.height;
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // gl.uniform1f(u_PointSize, size);
        // gl.uniform1f(u_Height, height);
        // gl.uniform1f(u_Segments, this.segments);
        const d = size;
        
        let baseZ = this.position[2];
        let topZ = baseZ + height;

        let angleStep = 360 / this.segments;

        for (let angle = 0; angle < 360; angle += angleStep) {
            let center = [xy[0], xy[1]];

            let angle1 = angle;
            let angle2 = angle + angleStep;

            let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
            let pt1 = [center[0] + vec1[0], center[1] + vec1[1]];
            let pt2 = [center[0] + vec2[0], center[1] + vec2[1]];

            // drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
            drawTriangle2D([xy[0], xy[1], 0, pt1[0], pt1[1], baseZ, pt2[0], pt2[1], baseZ]);
            drawTriangle2D([pt1[0], pt1[1], 0, pt2[0], pt2[1], baseZ, pt1[0], pt1[1], topZ]);
            drawTriangle2D([pt2[0], pt2[1], 0, pt2[0], pt2[1], topZ, pt1[0], pt1[1], topZ]);
            drawTriangle2D([xy[0], xy[1], topZ, pt2[0], pt2[1], topZ, pt1[0], pt1[1], topZ]);
        }
    }
}