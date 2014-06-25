var Phaser = require('phaser'),
  game = require('../game'),
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
  this.tempSwap = null;
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
      key: this.getGridKeyFromPosition(tile.position.x, tile.position.y),
      start: {
        x: game.input.activePointer.x,
        y: game.input.activePointer.y
      }
    };
  }
};

Grid.prototype.getGridKeyFromPosition = function (x, y) {

  var column = this.getColumnFromPosition(x),
    row = this.getRowFromPosition(y);

  return (row * this.GRID_WIDTH) + column;
};

Grid.prototype.getRowFromPosition = function (x) {
  return Phaser.Math.floor(x / this.TILE_WIDTH);
};

Grid.prototype.getColumnFromPosition = function (y) {
  return Phaser.Math.floor(y / this.TILE_HEIGHT);
};

Grid.prototype.calculateTileOffset = function (x, y) {

  if (Math.abs(x) < Math.abs(y)) {
    if (y > this.TILE_HEIGHT) {
      return [0, 1];
    } else if (y < -this.TILE_HEIGHT) {
      return [0, -1];
    }
  } else {
    if (x > this.TILE_WIDTH) {
      return [1, 0];
    } else if (x < -this.TILE_WIDTH) {
      return [-1, 0];
    }
  }

  return null;
};

Grid.prototype.isTilePositionValid = function (key, matrix) {

  var column = this.getColumnNumber(key),
    row = this.getRowNumber(key),
    newXPos = column + matrix[0],
    newYPos = row + matrix[1];

  return (newXPos >= 0 && newXPos < this.GRID_WIDTH) && (newYPos >= 0 && newYPos < this.GRID_HEIGHT);
};

Grid.prototype.calculateTile = function (key, matrix) {

  var column = this.getColumnNumber(key),
    row = this.getRowNumber(key),
    newXPos = column + matrix[0],
    newYPos = row + matrix[1];

  return newXPos + (newYPos * this.GRID_WIDTH);
};

Grid.prototype.swapTiles = function (key0, key1) {

  var srcTile, destTile, sx, sy, dx, dy, tween;

  srcTile = this.gridArray[key0];
  destTile = this.gridArray[key1];
  sx = srcTile.x;
  sy = srcTile.y;
  dx = destTile.x;
  dy = destTile.y;

  // animate tiles
  srcTile.moveTo(dx, dy);
  tween = destTile.moveTo(sx, sy);

  // swap tiles
  this.gridArray[key0] = destTile;
  this.gridArray[key1] = srcTile;

  tween.onComplete.add(this.swapTilesComplete, this);
};

Grid.prototype.swapTilesComplete = function () {
  if (this.tileSelected !== null || this.tempSwap !== null) {
    if (this.checkForMatches()) {
      // found a match
    } else {
      this.swapTiles(this.tempSwap.src, this.tempSwap.dest);
    }
    this.tileSelected = null;
    this.tempSwap = null;
    this.allowInput = true;
  }
};

Grid.prototype.checkForMatches = function () {
  return false;
};

Grid.prototype.update = function () {

  var currentCursorOffset, transformMatrix;

  if (this.tileSelected !== null) {
    this.allowInput = false;
    currentCursorOffset = {
      x: game.input.activePointer.x - this.tileSelected.start.x,
      y: game.input.activePointer.y - this.tileSelected.start.y
    };

    transformMatrix = this.calculateTileOffset(currentCursorOffset.x, currentCursorOffset.y);
    if (transformMatrix !== null && this.isTilePositionValid(this.tileSelected.key, transformMatrix) && this.tempSwap === null) {
      this.tempSwap = {
        src: this.tileSelected.key,
        dest: this.calculateTile(this.tileSelected.key, transformMatrix)
      };
      this.swapTiles(this.tempSwap.src, this.tempSwap.dest);
    }
  }


};

module.exports = Grid;
