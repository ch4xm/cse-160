import * as THREE from "three";
import { FleshPrison } from "./FleshPrison.js";

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

const FOV = 75;
const ASPECT = 2; // the canvas default
const NEAR = 0.1;
const FAR = 5;

const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
const scene = new THREE.Scene();

const fleshPrison = new FleshPrison(scene);

function main() {
  camera.position.z = 2;

  const color = 0xffffff;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // greenish blue
  const cube = new THREE.Mesh(geometry, material);
  
  const skybox = new THREE.BoxGeometry(100, 100, 100);
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000, // black color for the skybox
    side: THREE.BackSide // render the inside of the box
  });
  const skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
  scene.add(skyboxMesh);
  scene.add(cube);

  renderer.render(scene, camera);

  // function makeInstance(geometry, color, x) {
  //   const material = new THREE.MeshPhongMaterial({ color });

  //   const cube = new THREE.Mesh(geometry, material);
  //   scene.add(cube);

  //   cube.position.x = x;

  //   return cube;
  // }

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

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  fleshPrison.render(time);

  // cube.rotation.x = time;
  // cube.rotation.y = time;

  // renderFleshPrison(time);
  renderer.render(scene, camera);

  requestAnimationFrame(renderScene);
}
// function renderScene() {}
