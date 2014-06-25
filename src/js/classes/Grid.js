var game = require('../game'),
  Tile = require('./tile');

var Grid = function () {

  this.TILE_WIDTH = 32;
  this.TILE_HEIGHT = 32;
  this.GRID_WIDTH = 20;
  this.GRID_HEIGHT = 15;
  this.GRID_ARRAY_SIZE = this.GRID_WIDTH * this.GRID_HEIGHT;

  this.tileTypes = 4;
  this.tilePool = game.add.group();

  this.tilePool.x = (game.width * 0.5) - (this.TILE_WIDTH * this.GRID_WIDTH * 0.5);
  this.tilePool.y = (game.height * 0.5) - (this.TILE_HEIGHT * this.GRID_HEIGHT * 0.5);

  this.gridArray = new Array(this.GRID_ARRAY_SIZE);
  this.createArray();

  this.tileSelected = null;
  this.allowInput = true;
};

Grid.prototype.createArray = function () {

  var i, il, key, tile, x, y;

  il = this.GRID_ARRAY_SIZE;
  for (i = 0; i < il; i++) {
    do {
      key = Math.ceil(Math.random() * this.tileTypes);
      x = (i % this.GRID_WIDTH * this.TILE_WIDTH);
      y = (Math.floor(i / this.GRID_WIDTH) * this.TILE_HEIGHT);
      tile = new Tile(x, y, 'tile_' + key, key, this.selectTile, this);
      this.gridArray[i] = tile;
      this.tilePool.add(tile);
    } while (this.isHorizontalMatch(i) || this.isVerticleMatch(i));
  }

};

Grid.prototype.getRowNumber = function (key) {
  if (key === 0 || this.GRID_WIDTH === 0) {
    return 0;
  }

  return Math.floor(key / this.GRID_WIDTH);
};

Grid.prototype.getColumnNumber = function (key) {
  return key % this.GRID_WIDTH;
};

Grid.prototype.isHorizontalMatch = function (key) {

  if (!this.gridArray[key]) {
    return false;
  }

  return this.getColumnNumber(key) >= 2 &&
    this.gridArray[key].type === this.gridArray[key - 1].type &&
    this.gridArray[key].type === this.gridArray[key - 2].type &&
    this.getRowNumber(key) === this.getRowNumber(key - 2);
};

Grid.prototype.isVerticleMatch = function (key) {

  if (!this.gridArray[key]) {
    return false;
  }

  return this.getRowNumber(key) >= 2 &&
    this.gridArray[key].type === this.gridArray[key - this.GRID_WIDTH].type &&
    this.gridArray[key].type === this.gridArray[key - (2 * this.GRID_WIDTH)].type;
};

Grid.prototype.selectTile = function (tile) {

  if (this.allowInput) {
    this.tileSelected = {
      tile: tile,
      start: {
        x: game.input.activePointer.x,
        y: game.input.activePointer.y
      }
    };
  }
};

Grid.prototype.update = function () {

  var currentCursorOffset;

  if (this.tileSelected !== null) {
    this.allowInput = false;
    currentCursorOffset = {
      x: game.input.activePointer.x - this.tileSelected.start.x,
      y: game.input.activePointer.y - this.tileSelected.start.y
    };
  }

};

module.exports = Grid;
