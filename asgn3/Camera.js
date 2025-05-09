
class Camera {
    constructor() {
        this.eye = new Vector3(0, 0, 3);
        this.at = new Vector3(0, 0, -100);
        this.up = new Vector3(0, 1, 0);
    }

    forward() {
        let forward = this.at.sub(this.eye).normalize();
        // forward = forward.div(3);
        this.at = this.at.add(forward);
        this.eye = this.eye.add(forward);
    }
}