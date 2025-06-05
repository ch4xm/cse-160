import * as THREE from "three";

const POSITION_Z = -2;
export class FleshPrison {
  constructor(renderer, scene) {
    this.fleshPrison = this.create(renderer, scene);
    this.health = 100;
  }

  create(scene) {
    const loader = new THREE.TextureLoader();

    const mainGeometry = new THREE.OctahedronGeometry(1.1, 0);

    const uvs = [];

    const positions = mainGeometry.attributes.position.array;
    const faceCount = positions.length / 9;

    // uvs.push(
    // for (let i = 0; i < faceCount; i++) {
    //   // For simplicity, assign a fixed triangle UV per face
    //   uvs.push(0.5, 1.0); // Top vertex
    //   uvs.push(0.0, 0.0); // Bottom left
    //   uvs.push(1.0, 0.0); // Bottom right
    // }

    const triUVs = [
      // Face 1 (back eye open)
      [
        [0.18571428571, 1 - 0.29894736842],
        [0.50571428571, 1 - 0.29894736842],
        [0.34571428571, 1 - 0.50315789473],
      ],
      // Face 2 (back eye closed)
      [
        [0.34571428571, 1 - 0.50315789473],
        [0.51142857142, 1 - 0.70736842105],
        [0.18, 1 - 0.70736842105],
      ],
      // Face 3 (back eye stitched)
      [
        [0.18571428571, 1 - 0.29894736842],
        [0.50571428571, 1 - 0.29894736842],
        [0.34571428571, 1 - 0.50315789473],
      ],
      // Face 4 (bottom left eye)
      [
        [0.66567164179, 1 - 0.5010940919],
        [0.34626865671, 1 - 0.5010940919],
        [0.50447761194, 1 - 0.29978118161],
      ],
      // Face 5 (Tooth top left)
      [
        [0.50571428571, 1 - 0.29894736842],
        [0.66571428571, 1 - 0.50526315789],
        [0.82571428571, 1 - 0.29894736842],
      ],
      // Face 6 (Tooth bottom left)
      [
        [0.66571428571, 1 - 0.50526315789],
        [0.51142857142, 1 - 0.70736842105],
        [0.82571428571, 1 - 0.69736842105],
      ],
      // Face 7 (Tooth bottom right)
      [
        [0.51142857142, 1 - 0.70526315789],
        [0.18, 1 - 0.70736842105],
        [0.34571428571, 1 - 0.89157894736],
      ],
      // Face 8 (Tooth top right)
      [
        [0.66571428571, 1 - 0.09684210526],
        [0.52571428571, 1 - 0.29894736842],
        [0.82, 1 - 0.29894736842],
      ],
    ];

    for (let face of triUVs) {
      for (let [u, v] of face) {
        uvs.push(u, v);
      }
    }

    mainGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

    const mainTexture = loader.load("./assets/textures/fleshPrison.png");

    mainTexture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      // color: "rgb(155, 0, 0)",
      map: mainTexture,
    });

    const fleshPrison = new THREE.Mesh(mainGeometry, material);
    fleshPrison.position.set(0, 0, POSITION_Z);

    // const uvs = new Float32Array([

    scene.add(fleshPrison);

    // Pyramid geometry for the base
    const baseGeometry = new THREE.CylinderGeometry(0.075, 0.5, 0.45, 4);
    const baseTexture = loader.load("./assets/textures/fleshMaterial.png");
    baseTexture.wrapS = THREE.RepeatWrapping;
    baseTexture.wrapT = THREE.RepeatWrapping;
    baseTexture.repeat.set(3, 2);
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: "rgba(177, 0, 0, 0.62)",
      map: baseTexture,
    });
    const fleshPrisonBase = new THREE.Mesh(baseGeometry, baseMaterial);
    fleshPrisonBase.position.set(0, -1.7, POSITION_Z);
    scene.add(fleshPrisonBase);

    // Cylinder geometry for the spine
    const spineGeometry = new THREE.CylinderGeometry(0.025, 0.075, 4, 4);
    const spineTexture = loader.load("./assets/textures/fleshMaterial.png");
    spineTexture.wrapS = THREE.RepeatWrapping;
    spineTexture.wrapT = THREE.RepeatWrapping;
    spineTexture.repeat.set(5, 1);
    spineTexture.colorSpace = THREE.SRGBColorSpace;
    const spineMaterial = new THREE.MeshBasicMaterial({
      color: "rgb(216, 0, 0)",
      map: spineTexture,
    });
    spineTexture.wrapS = THREE.RepeatWrapping;
    spineTexture.wrapT = THREE.RepeatWrapping;
    const fleshPrisonSpine = new THREE.Mesh(spineGeometry, spineMaterial);
    fleshPrisonSpine.position.set(0, -0.1, POSITION_Z);
    scene.add(fleshPrisonSpine);

    const topGeometry = new THREE.CylinderGeometry(0.35, 0.05, 0.35, 5);
    const topTexture = loader.load("./assets/textures/fleshMaterial.png");
    topTexture.wrapS = THREE.RepeatWrapping;
    topTexture.wrapT = THREE.RepeatWrapping;
    topTexture.repeat.set(3, 2);
    topTexture.colorSpace = THREE.SRGBColorSpace;
    const topMaterial = new THREE.MeshBasicMaterial({
      color: "rgba(155, 0, 0, 0.62)",
      map: topTexture,
    });
    const fleshPrisonTop = new THREE.Mesh(topGeometry, topMaterial);
    fleshPrisonTop.position.set(0, 2, POSITION_Z);
    scene.add(fleshPrisonTop);

    return fleshPrison;
  }

  render(time) {
    const speed = Math.min(2.5, 0.5 + 0.5 * (100 / this.health));
    // Spin faster as health decreases
    // Max out at 3x speed
    const rot = time * speed;
    this.fleshPrison.rotation.y = rot;
  }

  addTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./assets/textures/fleshPrison.png");
    texture.colorSpace = THREE.SRGBColorSpace;
    this.fleshPrison.material.map = texture;
    this.fleshPrison.material.needsUpdate = true;
  }
}
