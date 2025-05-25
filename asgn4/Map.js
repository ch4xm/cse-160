class Map {
  constructor(mapBase, wallHeight = 0) {
    this.map = null;
    this.mapBase = mapBase;
    this.blocksMap = new Set();
    this.wallHeight = wallHeight;
  }

  render() {
    if (!this.map) {
      this.map = this.createMap(this.mapBase, this.wallHeight);
    }
    const cube = new Cube();
    for (const block of this.blocksMap) {
      const coords = block.split(",");
      const x = parseFloat(coords[0]);
      const y = parseFloat(coords[1]);
      const z = parseFloat(coords[2]);
      const textureNum = parseInt(coords[3]);
      cube.textureNum = textureNum;
      cube.color = [0.5, 0.5, 0.5, 1];
      cube.matrix.setTranslate(0, 0, 0);
      cube.matrix.scale(BLOCKS_SCALE, BLOCKS_SCALE, BLOCKS_SCALE);
      cube.matrix.translate(x, y, z);
      cube.renderFast();
    }
  }

  createMap(map, wallHeight = 0) {
    for (var x = 0; x < map.length; x++) {
      for (var y = 0; y < map[x].length; y++) {
        if (x == 0 || x == map.length - 1 || y == 0 || y == map[x].length - 1) {
          for (var z = 0; z < wallHeight; z++) {
            this.placeBlock(
              x - mapBase.length / 2,
              y - mapBase.length / 2,
              -0.445 + z,
              GROUND_TEXTURE
            );
          }
        }
        for (var i = 0; i < map[x][y].length; i++) {
          this.placeBlock(
            x - mapBase.length / 2,
            y - mapBase.length / 2,
            -0.445 + i,
            EYE_TEXTURE
          );
        }
      }
    }
  }

  placeBlock(x, y, z, textureNum) {
    const coords = [x, z, y, textureNum];
    const coordsString = coords.join(",");

    this.blocksMap.add(coordsString);
  }

  removeBlock(x, y, z) {
    const coords = [x, z, y, GROUND_TEXTURE].join(",");
    const coords2 = [x, z, y, EYE_TEXTURE].join(",");
    const coords3 = [x, z, y, BONE_TEXTURE].join(",");

    this.blocksMap.delete(coords);
    this.blocksMap.delete(coords2);
    this.blocksMap.delete(coords3);
  }
}
