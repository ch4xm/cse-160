import * as THREE from "three";

export class Projectile {
  constructor(scene, position) {
    this.position = position || new THREE.Vector3(0, 0, 0);
    this.object = this.create(scene);
  }

  create(scene) {
    const geometry = new THREE.SphereGeometry(0.075, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: "rgb(0, 251, 255)",
      transparent: true,
      opacity: 0.7,
    });
    const innerProjectile = new THREE.Mesh(geometry, material);

    const outerGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: "rgb(0, 181, 253)",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const outerProjectile = new THREE.Mesh(outerGeometry, outerMaterial);
    outerProjectile.position.copy(this.position);
    outerProjectile.add(innerProjectile);
    scene.add(outerProjectile);
    return outerProjectile;
  }

  render(time) {
    const speed = 5; //Math.min(2.5, 0.5 + 0.5 * (100 / this.health));
    // Spin faster as health decreases
    // Max out at 3x speed
    // const rot = time * speed;
    // this.object.position.y += speed * Math.sin(time / 1000);
    // this.object.position.x += speed * Math.cos(time / 1000);
    // this.object.position.z = POSITION_Z;
    // this.object.lookAt(this.target);
    // this.object.position.add(
    //     this.object.getWorldDirection(new THREE.Vector3()).multiplyScalar(speed * 0.01)
    // );
  }

  //   addTexture() {
  //     const material = new THREE.MeshBasicMaterial({
  //       color: "rgba(0, 255, 225, 0.62)",
  //       map: this.texture,
  //     });
  //   }
}
