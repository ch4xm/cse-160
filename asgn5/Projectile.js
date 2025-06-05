import * as THREE from "three";
import { fpsControls, pressedKeys, fleshPrison } from "./main.js";

var playerLeftClicking = false;
var lastParryAttemptTime = 0; // Time when the player last parried
var lastSuccessfulParryTime = -Infinity; // Time when the player last attempted to parry

const PARRY_WINDOW = 50; // Time in milliseconds for the parry window
const PARRY_COOLDOWN = 1000; // Cooldown time in milliseconds after a successful parry

document.addEventListener("mousedown", function (event) {
  if (event.button !== 0) return; // Only handle left mouse button
  lastParryAttemptTime = performance.now(); // Update parry time on left click
});

document.addEventListener("keydown", function (event) {
  if (event.key === "f" || event.key === "F") {
    lastParryAttemptTime = performance.now(); // Update parry time on 'F' key press
  }
});
// function setPrimaryButtonState(e) {
//   var flags = e.buttons !== undefined ? e.buttons : e.which;
//   playerLeftClicking = (flags & 1) === 1;
//   parryTime = playerLeftClicking ? performance.now() : 0;
//   // console.log("Player left clicking:", playerLeftClicking);
//   console.log("Parry time:", parryTime);
// }

// document.addEventListener("mousedown", setPrimaryButtonState);
// document.addEventListener("mousemove", setPrimaryButtonState);
// document.addEventListener("mouseup", setPrimaryButtonState);

let activeCollision = false; // Track if a collision is currently active

export class Projectile {
  constructor(scene, position, target) {
    this.position = position || new THREE.Vector3(0, 0, 0);

    this.target = target || new THREE.Vector3(0, 0, 0);
    this.direction = this.target.clone().sub(this.position).normalize();
    this.source = "Maurice"; // Source of the projectile, e.g., "Maurice"
    this.object = this.create(scene);
    this.despawnTime = 6000; // Time in milliseconds before the projectile despawns
    this.spawnTime = Date.now();

    this.damage = 20;
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

    const light = new THREE.PointLight(0x00b5fd, 1, 2);
    light.position.copy(this.position);
    outerProjectile.add(light);
    return outerProjectile;
  }

  render(time) {
    const speed = 3; //Math.min(2.5, 0.5 + 0.5 * (100 / this.health));

    const elapsed = Date.now() - this.spawnTime;
    if (elapsed > this.despawnTime && this.object.parent) {
      // Remove the projectile after 5 seconds
      this.object.parent.remove(this.object);
      return;
    }

    this.object.position.add(
      this.direction.clone().multiplyScalar(speed * 0.01)
    );

    if (this.collisionCheck(fpsControls.object, 0.2) && !activeCollision) {
      activeCollision = true; // Set collision active to prevent multiple hits
      const now = performance.now();
      const inParryWindow = now - lastParryAttemptTime < PARRY_WINDOW;
      const cooldownActive = now - lastSuccessfulParryTime < PARRY_COOLDOWN;
      console.log(
        "Projectile collision detected with player:",
        inParryWindow,
        cooldownActive
      );

      if (inParryWindow && cooldownActive) {
        console.log("Parry cooldown active, cannot parry now.");
        activeCollision = false; // Reset collision active after parry
        return; // Exit if in parry window but cooldown is active
      }

      if (inParryWindow && !cooldownActive && this.source !== "Player") {
        lastSuccessfulParryTime = now; // Update last parry attempt time

        const audio = document.getElementById("parry");
        if (audio) {
          audio.currentTime = 0; // Reset audio to start
          audio.play().catch((error) => {
            console.error("Error playing parry sound:", error);
          });
        }
        // if (performance.now() - parryTime < PARRY_WINDOW) {
        // F to parry
        // console.log("Projectile parried!");
        // this.object.position.copy(fpsControls.object.position);

        // Set new direction: camera forward
        this.source = "Player"; // Update source to Player
        this.object.material.color.set("rgb(150, 0, 0)"); // Change color to red on parry
        this.object.children[0].material.color.set("rgb(230, 0, 0)"); // Change inner projectile color to red
        const forward = new THREE.Vector3(1, 0, 1);
        fpsControls.getDirection(forward); // gets forward vector from controls
        this.direction = forward.clone().normalize();
        // console.log("New direction after parry:", this.direction);

        // Reorient the projectile
        this.object.lookAt(this.object.position.clone().add(this.direction));

        this.spawnTime = Date.now(); // reset lifespan
        activeCollision = false; // Reset collision active after parry
        return;
      }
      // console.log("Projectile hit the target!");
      if (this.object.parent) {
        this.object.parent.remove(this.object);
      }
      activeCollision = false; // Reset collision active after parry

      return;
    }

    if (
      this.collisionCheck(fleshPrison.object, 2.75) &&
      this.source === "Player"
    ) {
      // console.log("Projectile hit the flesh prison!");
      if (this.object.parent) {
        this.object.parent.remove(this.object);
      }
      // Handle damage to flesh prison here
      fleshPrison.health -= this.damage;
      if (fleshPrison.health <= 0) {
        console.log("Flesh prison destroyed!");
        // // Handle destruction logic here
      }
      return;
    }
  }

  collisionCheck(otherObject, size) {
    // console.log("Projectile position:", this.object.position);
    // console.log("Other object position:", otherObject.position);
    // console.log("Distance to other object:", this.object.position.distanceTo(otherObject.position));
    const distance = this.object.position.distanceTo(otherObject.position);
    return distance < size; // Adjust the threshold as needed
  }
}
