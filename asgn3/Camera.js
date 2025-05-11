
class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.speed = 0.05
        this.horizontalAngle = 0;
        this.verticalAngle = 0;
        this.viewMatrix = new Matrix4();
    }

    forward() {
        let forward = new Vector3(this.at.elements)
        forward = forward.sub(this.eye).normalize();
        forward = forward.mul(this.speed);
        this.at = this.at.add(forward);
        this.eye = this.eye.add(forward);
    }

    backward() {
        let backward = new Vector3(this.eye.elements);
        backward = backward.sub(this.at).normalize();
        backward = backward.mul(this.speed);
        this.at = this.at.add(backward);
        this.eye = this.eye.add(backward);
    }

    left() {
        let left = new Vector3(this.eye.elements);
        left = left.sub(this.at);
        left = left.normalize();
        left = Vector3.cross(left, this.up).normalize();
        left = left.mul(this.speed);
        this.at = this.at.add(left);
        this.eye = this.eye.add(left);
    }

    right() {
        let right = new Vector3(this.eye.elements);
        right = right.sub(this.at);
        right = right.normalize();
        right = Vector3.cross(this.up, right).normalize();
        right = right.mul(this.speed);
        this.at = this.at.add(right);
        this.eye = this.eye.add(right);
    }

    moveUp() {
        let up = this.up.normalize();
        up = up.mul(this.speed);
        this.at = this.at.add(up);
        this.eye = this.eye.add(up);
    }
    moveDown() {
        let down = this.up.normalize();
        down = down.mul(this.speed);
        this.at = this.at.sub(down);
        this.eye = this.eye.sub(down);
    }

    panLeft() {
        this.horizontalAngle -= 1;
        // console.log("pan left");
        // let left = new Vector3(this.eye.elements);
        // left = left.sub(this.at);
        // left = left.normalize();
        // left = left.mul(5);
        // left = Vector3.cross(left, this.up).normalize();
        // this.at = this.at.add(left);
    }

    panRight() {
        this.horizontalAngle += 1;
        // let right = new Vector3(this.eye.elements);
        // right = right.sub(this.at);
        // right = right.normalize();
        // right = Vector3.cross(this.up, right).normalize();
        // this.at = this.at.add(right);
        
    }

    updateViewMatrix() {
        const horizontal = this.horizontalAngle * Math.PI / 90;
        const vertical = this.verticalAngle * Math.PI / 90;
    
        const newDirection = new Vector3([
            Math.cos(vertical) * Math.sin(horizontal),
            Math.sin(vertical),
            -Math.cos(vertical) * Math.cos(horizontal)
        ]);
    
        const at = new Vector3(this.eye.elements);
        at.add(newDirection);
        this.at = at;
    
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }
    
}