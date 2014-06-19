var Phaser = require('phaser'),
  game = require('../game');

var Board = function () {

  this.allowInput = true;
  this.selectedItem = {
    item: null,
    start: {
      x: 0,
      y: 0
    }
  };

  this.FIELD_SIZE = 8;
  this.TILE_ARRAY_SIZE = this.FIELD_SIZE * this.FIELD_SIZE;

  this.tileArray = new Array(this.TILE_ARRAY_SIZE);
  this.tileTypes = 8;
  this.tileSize = 32;

  this.offsetX = -((this.FIELD_SIZE / 2) * this.tileSize);
  this.offsetY = -((this.FIELD_SIZE / 2) * this.tileSize);

  this.tilePool = game.add.group();
  this.tilePool.position.setTo(game.width / 2, game.height / 2);

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

    var i, il, tile, item, x, y;

    il = this.TILE_ARRAY_SIZE;
    for (i = 0; i < il; i += 1) {
      tile = this.tileArray[i];
      x = (i % this.FIELD_SIZE * this.tileSize) + this.offsetX;
      y = (Math.floor(i / this.FIELD_SIZE) * this.tileSize) + this.offsetY;
      item = this.tilePool.create(x, y, "game_sprites");
      item.frame = tile - 1;
      item.inputEnabled = true;
      item.events.onInputDown.add(this.selectItem, this);
    }
  },

  selectItem: function (item) {

    if (this.allowInput) {
      this.selectedItem.item = item;
      this.selectedItem.key = this.getItemArrayKeyFromPosition(item.position.x - this.offsetX, item.position.y - this.offsetY);
      this.selectedItem.start.x = game.input.mousePointer.x;
      this.selectedItem.start.y = game.input.mousePointer.y;
    }
  },

  getItemArrayKeyFromPosition: function (x, y) {

    var row = this.getItemRowFromPosition(x),
      column = this.getItemColumnFromPosition(y);

    return (column * this.FIELD_SIZE) + row;
  },

  getItemRowFromPosition: function (x) {
    return Phaser.Math.floor(x / this.tileSize);
  },

  getItemColumnFromPosition: function (y) {
    return Phaser.Math.floor(y / this.tileSize);
  },

  getTileOffset: function (x, y) {
    if (Math.abs(x) < Math.abs(y)) {
      if (y > this.tileSize) {
        return [0, 1];
      } else if (y < -this.tileSize) {
        return [0, -1];
      }
    } else {
      if (x > this.tileSize) {
        return [1, 0];
      } else if (x < -this.tileSize) {
        return [-1, 0];
      }
    }

    return null;
  },

  isTilePositionValid: function (oldKey, transformMatrix) {
    var row = this.rowNumber(oldKey),
      column = this.columnNumber(oldKey),
      newXPos = column + transformMatrix[0],
      newYPos = row + transformMatrix[1];

    return (newXPos >= 0 && newXPos < this.FIELD_SIZE) && (newYPos >= 0 && newYPos < this.FIELD_SIZE);
  },

  checkForMatches: function () {
  },

  update: function () {

    var currentCursorOffset, tempTile;

    //if (game.input.mousePointer.justReleased()) {
      //if (this.selectedItem.item !== null) {
        //this.checkForMatches();
      //}
    //}

    if (this.selectedItem.item !== null) {
      currentCursorOffset = {
        x: game.input.mousePointer.x - this.selectedItem.start.x,
        y: game.input.mousePointer.y - this.selectedItem.start.y
      };

      tempTile = this.getTileOffset(currentCursorOffset.x, currentCursorOffset.y);
      if (tempTile !== null && this.isTilePositionValid(this.selectedItem.key, tempTile)) {
        // swap the tile
      }

    }

  }

};

module.exports = Board;
