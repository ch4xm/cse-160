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
    // const texture = loader.load("./assets/textures/fleshPrison.png");
    const mainTexture = loader.load("./assets/textures/fleshPrison.png");

    mainTexture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      color: 'rgb(155, 0, 0)',
      map: mainTexture,
    });
    const fleshPrison = new THREE.Mesh(mainGeometry, material);
    fleshPrison.position.set(0, 0, POSITION_Z);
    scene.add(fleshPrison);

    // Pyramid geometry for the base
    const baseGeometry = new THREE.CylinderGeometry(0.075, 0.5, 0.45, 4);
    const baseTexture = loader.load("./assets/textures/fleshMaterial.png");
    baseTexture.wrapS = THREE.RepeatWrapping;
    baseTexture.wrapT = THREE.RepeatWrapping;
    baseTexture.repeat.set(3, 2);
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: 'rgba(177, 0, 0, 0.62)',
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
      color: 'rgb(216, 0, 0)',
      map: spineTexture,
    });
    mainTexture.wrapS = THREE.RepeatWrapping;
    mainTexture.wrapT = THREE.RepeatWrapping;
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
      color: 'rgba(155, 0, 0, 0.62)',
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
}
