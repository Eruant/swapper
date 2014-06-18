var game = require('../game');

var Board = function () {

  this.FIELD_SIZE = 8;
  this.TILE_ARRAY_SIZE = this.FIELD_SIZE * this.FIELD_SIZE;

  this.tileArray = new Array(this.TILE_ARRAY_SIZE);
  this.tileTypes = 8;
  this.tileSize = 32;

  this.tilePool = game.add.group();
  this.tilePool.position.setTo(game.width / 2, game.height / 2);

  this.inputStartPoisition = {
    x: 0,
    y: 0
  };
  this.inputAllowed = true;

  this.createBoard();
  this.createSprites();

};

Board.prototype = {

  rowNumber: function (i) {
    if (i === 0 || this.FIELD_SIZE === 0) {
      return 0;
    }

    return Math.floor(i / this.FIELD_SIZE);
  },

  columnNumber: function (i) {
    return i % this.FIELD_SIZE;
  },

  isHorizontalMatch: function (i) {
    return this.columnNumber(i) >= 2 &&
      this.tileArray[i] === this.tileArray[i - 1] &&
      this.tileArray[i] === this.tileArray[i - 2] &&
      this.rowNumber(i) === this.rowNumber(i - 2);
  },

  isVerticleMatch: function (i) {
    return this.rowNumber(i) >= 2 &&
      this.tileArray[i] === this.tileArray[i - this.FIELD_SIZE] &&
      this.tileArray[i] === this.tileArray[i - (this.FIELD_SIZE * 2)];
  },

  createBoard: function () {

    var i, il;

    il = this.TILE_ARRAY_SIZE;
    
    for (i = 0; i < il; i += 1) {
      do {
        this.tileArray[i] = Math.ceil(Math.random() * this.tileTypes);
      } while (this.isHorizontalMatch(i) || this.isVerticleMatch(i));
    }

  },

  createSprites: function () {

    var i, il, tile, item, x, y, offsetX, offsetY;

    offsetX = -((this.FIELD_SIZE / 2) * this.tileSize);
    offsetY = -((this.FIELD_SIZE / 2) * this.tileSize);

    il = this.TILE_ARRAY_SIZE;
    for (i = 0; i < il; i += 1) {
      tile = this.tileArray[i];
      x = (i % this.FIELD_SIZE * this.tileSize) + offsetX;
      y = (Math.floor(i / this.FIELD_SIZE) * this.tileSize) + offsetY;
      item = this.tilePool.create(x, y, "game_sprites");
      item.frame = tile - 1;
      /*
      item.inputEnabled = true;
      item.input.enableDrag(false, true);
      item.input.enableSnap(32, 32, false, true);
      */
    }
  }

};

module.exports = Board;
