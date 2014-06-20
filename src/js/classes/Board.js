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
  this.tempSwap = null;

  this.FIELD_SIZE = 12;
  this.TILE_ARRAY_SIZE = this.FIELD_SIZE * this.FIELD_SIZE;

  this.tileArray = new Array(this.TILE_ARRAY_SIZE);
  this.tileTypes = 4;
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

  getItemPositionFromKey: function (key) {
    return {
      x: (this.columnNumber(key) * this.tileSize) + this.offsetX,
      y: (this.rowNumber(key) * this.tileSize) + this.offsetY
    };
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

  getTileSpriteFromKey: function (key) {

    var positionOnBoard = this.getItemPositionFromKey(key);

    var sprite = null;
    this.tilePool.forEach(function (item) {
      if (item.position.x === positionOnBoard.x && item.position.y === positionOnBoard.y) {
        sprite = item;
        // TODO figure out why Phaser does not support break or continue
      }
    });

    return sprite;
  },

  calculateTile: function (oldKey, transformMatrix) {
    var row = this.rowNumber(oldKey),
      column = this.columnNumber(oldKey),
      newXPos = column + transformMatrix[0],
      newYPos = row + transformMatrix[1];

    return newXPos + (newYPos * this.FIELD_SIZE);
  },

  isTilePositionValid: function (oldKey, transformMatrix) {
    var row = this.rowNumber(oldKey),
      column = this.columnNumber(oldKey),
      newXPos = column + transformMatrix[0],
      newYPos = row + transformMatrix[1];

    return (newXPos >= 0 && newXPos < this.FIELD_SIZE) && (newYPos >= 0 && newYPos < this.FIELD_SIZE);
  },

  swapTiles: function (key0, key1) {
    var tween;
    
    this.moveTile(this.getTileSpriteFromKey(key0), key1);
    tween = this.moveTile(this.getTileSpriteFromKey(key1), key0);

    this.swapArrayKeys(key0, key1);

    tween.onComplete.add(this.swapTilesComplete, this);
  },

  swapArrayKeys: function (key0, key1) {
    var temp = this.tileArray[key0];

    this.tileArray[key0] = this.tileArray[key1];
    this.tileArray[key1] = temp;
  },

  swapTilesComplete: function () {
    
    if (this.selectedItem.item !== null && this.tempSwap !== null) {
      if (this.checkForMatches()) {
        // found a match
      } else {
        this.swapTiles(this.tempSwap.src, this.tempSwap.dest);
      }
      this.selectedItem.item = null;
      this.tempSwap = null;
    }
  },

  moveTile: function (sprite, key) {
    var tween = game.add.tween(sprite).to(this.getItemPositionFromKey(key), 300, Phaser.Easing.Bounce.Out, true);
    return tween;
  },

  checkForMatches: function () {

    var i, il, match, matches;

    il = this.TILE_ARRAY_SIZE;
    matches = [];

    for (i = 0; i < il; i += 1) {
      if (this.tileArray[i] !== null) {
        match = this.isHorizontalMatch(i);
        if (match) {
          this.addMatchIfNotInArray(i - 2, matches);
          this.addMatchIfNotInArray(i - 1, matches);
          this.addMatchIfNotInArray(i, matches);
        }
        match = this.isVerticleMatch(i);
        if (match) {
          this.addMatchIfNotInArray(i - this.FIELD_SIZE, matches);
          this.addMatchIfNotInArray(i - (this.FIELD_SIZE * 2), matches);
          this.addMatchIfNotInArray(i, matches);
        }
      }
    }

    this.removeMatches(matches);

    return (matches.length === 0) ? false : true;
  },

  addMatchIfNotInArray: function (key, array) {

    var i = array.length;
    while (i--) {
      if (array[i] === key && array[i] !== null) {
        return;
      }
    }

    array.push(key);
  },

  removeMatches: function (matchedArray) {
    var i, il, sprite, key;

    il = matchedArray.length;
    if (il > 0) {
      for (i = 0; i < il; i += 1) {
        key = matchedArray[i];
        sprite = this.getTileSpriteFromKey(key);
        sprite.kill();
        this.tileArray[key] = null;
      }

      this.refillGrid();
    }
  },

  refillGrid: function () {
    // refill the grid
  },

  update: function () {

    var currentCursorOffset, transformMatrix;

    if (this.selectedItem.item !== null) {
      currentCursorOffset = {
        x: game.input.mousePointer.x - this.selectedItem.start.x,
        y: game.input.mousePointer.y - this.selectedItem.start.y
      };

      transformMatrix = this.getTileOffset(currentCursorOffset.x, currentCursorOffset.y);
      if (transformMatrix !== null && this.isTilePositionValid(this.selectedItem.key, transformMatrix) && this.tempSwap === null) {
        this.tempSwap = {
          src: this.selectedItem.key,
          dest: this.calculateTile(this.selectedItem.key, transformMatrix)
        };
        this.swapTiles(this.tempSwap.src, this.tempSwap.dest);
      }

    }

  }

};

module.exports = Board;
