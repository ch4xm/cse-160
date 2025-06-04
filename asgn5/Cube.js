class Cube {
  constructor(color) {
    this.color = color;
  }

  render() {
    const material = new THREE.MeshPhongMaterial({ color: this.color });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }
}
