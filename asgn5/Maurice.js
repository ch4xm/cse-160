import * as THREE from "three";
import { Projectile } from "./Projectile.js";
import { fpsControls } from "./main.js";

export class Maurice {
  constructor(scene, position) {
    this.position = position || new THREE.Vector3(0, 1, 0);
    this.object = this.create(scene);
    this.scene = scene;

    this.projectiles = [];
    this.firstPos = new THREE.Vector3(
      this.position.x,
      this.position.y,
      this.position.z
    );

    const direction = Math.random() < 0.5 ? 1 : -1;
    this.secondPos = new THREE.Vector3(
      this.position.x + direction * Math.random() * 2,
      this.position.y + direction * Math.random() * 2,
      this.position.z + direction * Math.random() * 2
    );
    // const offset = new THREE.Vector3(Math.random, 1);
    this.secondPos = new THREE.Vector3(
      this.position.x + 1,
      this.position.y + 1,
      this.position.z + 1
    );

    const rand = Math.random();
    this.duration = rand * 3 + 4; // Random duration between 2 and 6 seconds
    this.moveDuration = rand * 2 + 1; // Random duration between 1 and 3 seconds
    this.waitDuration = this.duration - this.moveDuration * 2; // Random wait duration between 1 and 3 seconds

    this.projectileSpawnRate = Math.random() * 2 + 1; // Random spawn rate between 1 and 3 seconds
  }

  create(scene) {
    const geometry = new THREE.SphereGeometry(0.2, 6, 6);
    const material = new THREE.MeshBasicMaterial({
      color: "rgb(177, 154, 130)",
      side: THREE.DoubleSide,
    });
    const maurice = new THREE.Mesh(geometry, material);
    maurice.position.copy(this.position);
    scene.add(maurice);
    return maurice;
  }

  render(time) {
    if (time % this.projectileSpawnRate < 0.003) {
      if (!fpsControls.object || !fpsControls.object.position) {
        console.error("fpsControls or its position is not defined.");
        return;
      }
      const projectile = new Projectile(
        this.scene,
        this.object.position.clone(),
        fpsControls.object.position.clone()
      );
    //   projectile.object.position.copy(this.object.position);
    //   projectile.object.lookAt(this.secondPos);
    //   projectile.object.position.y += 0.5;

      this.projectiles.push(projectile);
      // projectile.object.position.copy(this.object.position);
      // projectile.object.lookAt(this.secondPos);
      // projectile.object.position.y += 0.5;
      // projectile.object.position.x += 0.5;
      // projectile.object.position.z += 0.5;
    }

    this.projectiles.forEach((projectile) => {
      projectile.render(time);
    });

    const phase = time % this.duration;

    if (phase < this.moveDuration) {
      // Moving from firstPos to secondPos
      const t = this.easeInOutCubic(phase / this.moveDuration);
      const currentPosition = this.firstPos.clone().lerp(this.secondPos, t);
      this.object.position.copy(currentPosition);
      this.object.lookAt(this.secondPos);
    } else if (phase < this.moveDuration + this.waitDuration) {
      // Waiting at secondPos
      this.object.position.copy(this.secondPos);
      this.object.lookAt(this.firstPos);
    } else if (
      phase <
      this.moveDuration + this.waitDuration + this.moveDuration
    ) {
      // Moving back from secondPos to firstPos
      const t = this.easeInOutCubic(
        (phase - this.moveDuration - this.waitDuration) / this.moveDuration
      );
      const currentPosition = this.secondPos.clone().lerp(this.firstPos, t);
      this.object.position.copy(currentPosition);
      this.object.lookAt(this.firstPos);
    } else {
      // Waiting at firstPos
      this.object.position.copy(this.firstPos);
      this.object.lookAt(this.secondPos);
    }
    // console.log(time % 5);
    // if (time % 5 < 1) {
    //   // Only render every 5000 milliseconds
    //   // return; // Skip rendering if time is not a multiple of 5000
    //   const speed = 3; //Math.min(2.5, 0.5 + 0.5 * (100 / this.health));
    //   const distance = this.firstPos.distanceTo(this.secondPos);
    //   const direction = this.secondPos.clone().sub(this.firstPos).normalize();
    //   const travelTime = distance / speed;
    //   const elapsedTime = (time % travelTime) / travelTime;
    //   const currentPosition = this.firstPos
    //     .clone()
    //     .lerp(this.secondPos, elapsedTime);
    //   this.object.position.copy(currentPosition);
    //   this.object.lookAt(this.secondPos);
    // } else if (time % 5 < 2) {
    //   // If time is not a multiple of 5000, reset to the first position
    //   const speed = 3; //Math.min(2.5, 0.5 + 0.5 * (100 / this.health));
    //   const distance = this.secondPos.distanceTo(this.firstPos);
    //   const direction = this.firstPos.clone().sub(this.secondPos).normalize();
    //   const travelTime = distance / speed;
    //   const elapsedTime = (time % travelTime) / travelTime;
    //   const currentPosition = this.secondPos
    //     .clone()
    //     .lerp(this.firstPos, elapsedTime);
    //   this.object.position.copy(currentPosition);
    //   this.object.lookAt(this.firstPos);
    // }
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  //   addTexture() {
  //     const material = new THREE.MeshBasicMaterial({
  //       color: "rgba(0, 255, 225, 0.62)",
  //       map: this.texture,
  //     });
  //   }
}
