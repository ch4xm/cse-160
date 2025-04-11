class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color is white
        this.size = 10.0;
        this.segments = 10; // Number of segments to approximate the circle
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        const d = this.size / 200.0;

        let angleStep = 360 / this.segments;

        for (let angle = 0; angle < 360; angle += angleStep) {
            let center = [xy[0], xy[1]];

            let angle1 = angle;
            let angle2 = angle + angleStep;

            let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
            let pt1 = [center[0] + vec1[0], center[1] + vec1[1]];
            let pt2 = [center[0] + vec2[0], center[1] + vec2[1]];

            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        }
    }
}