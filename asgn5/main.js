import * as THREE from "three";
import { FleshPrison } from "./FleshPrison.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  lastSuccessfulParryTime,
  PARRY_FREEZE,
  Projectile,
  playerHealth,
  playerMax,
} from "./Projectile.js";
import { Maurice } from "./Maurice.js";

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true,
});
renderer.setClearColor(0x000000, 0);

const FOV = 80;
const ASPECT = 2; // the canvas default
const NEAR = 0.1;
const FAR = 1000;

const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
camera.position.set(0, -2, 0); // Set initial camera position
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Set background to null for transparency

// Add spotlight on flesh prison
const spotlight = new THREE.SpotLight(0xffffff, 5, 35);
scene.add(spotlight);
scene.add(spotlight.target);

// const helper = new THREE.SpotLightHelper(spotlight);
// scene.add(helper);

export let fpsControls = new PointerLockControls(camera, document.body);
fpsControls.pointerSpeed = 0.5;

document.body.addEventListener(
  "click",
  function () {
    fpsControls.lock();
  },
  false
);

export const fleshPrison = new FleshPrison(scene);

const projectile = new Projectile(scene, new THREE.Vector3(2, 0, 2));

const MAURICE_POSITIONS = [
  new THREE.Vector3(2, -1, -2),
  new THREE.Vector3(-2, -1, -2),
  new THREE.Vector3(2, -1, 2),
  new THREE.Vector3(-2, -1, 2),
  new THREE.Vector3(0, -1, 2),
  new THREE.Vector3(0, -1, -2),
  new THREE.Vector3(2, -1, 0),
  new THREE.Vector3(-2, -1, 0),
  new THREE.Vector3(1, -2, -1),
  new THREE.Vector3(-1, -2, -1),
  new THREE.Vector3(1, -2, 1),
  new THREE.Vector3(-1, -2, 1),
  new THREE.Vector3(0, -2, -1),
  new THREE.Vector3(0, -2, 1),
];

let maurices = [];

MAURICE_POSITIONS.forEach((position) => {
  const maurice = new Maurice(scene, position);
  maurices.push(maurice);
});

const SKYBOX_WIDTH = 15;
const SKYBOX_HEIGHT = 4.5;

function main() {
  camera.position.z = 2;

  const color = 0xffffff;
  const intensity = 3;
  // const light = new THREE.DirectionalLight(color, intensity);
  // light.position.set(0, 3, 0);
  // scene.add(light);

  const skyboxGeometry = new THREE.BoxGeometry(
    SKYBOX_WIDTH,
    SKYBOX_HEIGHT,
    SKYBOX_WIDTH
  );
  const skyboxTexture = new THREE.TextureLoader().load(
    "./assets/textures/skybox.png"
  );
  skyboxTexture.colorSpace = THREE.SRGBColorSpace; // Ensure the texture is in sRGB color space
  skyboxTexture.wrapS = THREE.RepeatWrapping;
  skyboxTexture.wrapT = THREE.RepeatWrapping;
  skyboxTexture.repeat.set(SKYBOX_WIDTH, SKYBOX_HEIGHT); // Adjust the repeat values as needed
  skyboxTexture.minFilter = THREE.LinearFilter; // Use linear filtering for better quality
  skyboxTexture.magFilter = THREE.LinearFilter; // Use linear filtering for better quality
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: skyboxTexture,
    side: THREE.DoubleSide, // render the inside of the box
  });

  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);
  skybox.position.set(0, -0.4, 0);
  skybox.rotateY(Math.PI / 4); // Rotate the skybox for better view

  renderer.render(scene, camera);

  const audio = document.getElementById("chaos");
  audio.volume = 0.1; // Set volume to a lower level
  audio.play().catch((error) => {
    console.error("Error playing audio:", error);
  });

  requestAnimationFrame(renderScene);
}

main();

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function renderScene(time) {
  time *= 0.001; // convert time to seconds

  console.log(performance.now() - lastSuccessfulParryTime, PARRY_FREEZE);
  if (performance.now() - lastSuccessfulParryTime < PARRY_FREEZE) {
    // If within parry freeze time, do not update projectile position
    requestAnimationFrame(renderScene);
    return;
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  fleshPrison.render(time);

  projectile.render(time);

  maurices.forEach((maurice) => {
    maurice.render(time);
  });
  // const target = v1.position.clone();
  // const offset = new THREE.Vector3(1, 2, 1)
  //   .clone()
  //   .applyQuaternion(camera.quaternion); // Adjust the offset as needed

  // const targetPosition = camera.position.clone().add(offset);
  // projectile.projectile.position.copy(targetPosition);
  // projectile.projectile.quaternion.copy(camera.quaternion);

  // camera.lookAt(fpsControls.getObject().position);

  keyboardPressed();

  updateHealthBars(
    playerHealth,
    playerMax,
    fleshPrison.health,
    fleshPrison.maxHealth
  );

  if (fleshPrison.health <= 0) {
    // Handle victory logic here, e.g., display a message or transition to another scene
    document.getElementById("victory-message").style.visibility = "visible";
    return;
  }

  if (playerHealth <= 0) {
    // Handle game over logic here, e.g., display a message or restart the game
    document.getElementById("game-over-message").style.visibility = "visible";
    return;
  }
  renderer.render(scene, camera);

  requestAnimationFrame(renderScene);
}

function updateHealthBars(playerHealth, playerMax, bossHealth, bossMax) {
  const playerBar = document.getElementById("player-health");
  const bossBar = document.getElementById("boss-health");

  const playerPercent = Math.max(0, (playerHealth / playerMax) * 100);
  const bossPercent = Math.max(0, (bossHealth / bossMax) * 100);

  playerBar.style.width = `${playerPercent}%`;
  bossBar.style.width = `${bossPercent}%`;
}

export var pressedKeys = {};

document.onkeydown = function (event) {
  event.preventDefault();
  console.log(event.keyCode);
  pressedKeys[event.keyCode] = true;
};

document.onkeyup = function (event) {
  event.preventDefault();
  pressedKeys[event.keyCode] = false;
};

const MOVEMENT_SPEED = 0.01;

function keyboardPressed() {
  if (pressedKeys[37] || pressedKeys[65]) {
    fpsControls.moveRight(-MOVEMENT_SPEED);
  }
  if (pressedKeys[39] || pressedKeys[68]) {
    fpsControls.moveRight(MOVEMENT_SPEED);
  }
  if (pressedKeys[38] || pressedKeys[87]) {
    fpsControls.moveForward(MOVEMENT_SPEED);
  }
  if (pressedKeys[40] || pressedKeys[83]) {
    fpsControls.moveForward(-MOVEMENT_SPEED);
  }
}

function loadV1Model() {
  const loader = new GLTFLoader();
  let v1;
  loader.load(
    "./assets/models/v1_ultrakill.glb",
    function (gltf) {
      const model = gltf.scene;
      model.position.set(0, -3, 0);

      // model.scale.set(0.5, 0.5, 0.5);
      v1 = model;
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error("An error occurred while loading the model:", error);
    }
  );
  return v1;
}
