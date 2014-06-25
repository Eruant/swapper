(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @class base
 * This is the root file for the Phaser Boilerplate. All other files are included from this one.
 *
 * @author Matt Gale <matt@littleball.co.uk>
 **/

/*globals require*/


var game = require('./game'),
    boot = require('./scenes/boot.js'),
    preloader = require('./scenes/preloader'),
    mainMenu = require('./scenes/mainMenu'),
    level1 = require('./scenes/level1'),
    localisation = require('./locale');

// set the default language
game.language = "en";

game.state.add('boot', boot, false);
game.state.add('preloader', preloader, false);
game.state.add('mainMenu', mainMenu, false);
game.state.add('level1', level1, false);

game.state.start('boot');

},{"./game":4,"./locale":5,"./scenes/boot.js":6,"./scenes/level1":7,"./scenes/mainMenu":8,"./scenes/preloader":9}],2:[function(require,module,exports){
var Phaser = (window.Phaser),
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
    this.getRowNumber(key) === this.getRowNumber(key - 2) &&
    this.gridArray[key].alive &&
    this.gridArray[key - 1].alive &&
    this.gridArray[key - 2].alive;
};

Grid.prototype.isVerticleMatch = function (key) {

  if (!this.gridArray[key]) {
    return false;
  }

  return this.getRowNumber(key) >= 2 &&
    this.gridArray[key].type === this.gridArray[key - this.GRID_WIDTH].type &&
    this.gridArray[key].type === this.gridArray[key - (2 * this.GRID_WIDTH)].type &&
    this.gridArray[key].alive &&
    this.gridArray[key - this.GRID_WIDTH].alive &&
    this.gridArray[key - (2 * this.GRID_WIDTH)].alive;
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

  var i, il, match, matches;

  il = this.GRID_ARRAY_SIZE;
  matches = [];

  for (i = 0; i < il; i++) {
    if (this.gridArray[i].alive) {
      match = this.isHorizontalMatch(i);
      if (match) {
        this.addMatchIfNotInArray(i - 2, matches);
        this.addMatchIfNotInArray(i - 1, matches);
        this.addMatchIfNotInArray(i, matches);
      }
      match = this.isVerticleMatch(i);
      if (match) {
        this.addMatchIfNotInArray(i - this.GRID_WIDTH, matches);
        this.addMatchIfNotInArray(i - (this.GRID_WIDTH * 2), matches);
        this.addMatchIfNotInArray(i, matches);
      }
    }
  }

  this.removeMatches(matches);

  return (matches.length === 0) ? false : true;
};

Grid.prototype.addMatchIfNotInArray = function (key, array) {

  var i = array.length;
  while (i--) {
    if (array[i] === key && array[i] !== null) {
      return;
    }
  }

  array.push(key);
};

Grid.prototype.removeMatches = function (matchedArray) {

  var i, il, key;

  il = matchedArray.length;
  if (il > 0) {
    for (i = 0; i < il; i++) {
      key = matchedArray[i];
      console.log(this.gridArray[key].alive);
      this.gridArray[key].kill();
    }
  }

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

},{"../game":4,"./tile":3}],3:[function(require,module,exports){
var Phaser = (window.Phaser),
  game = require('../game');

var Tile = function (x, y, texture, type, inputCallBack, delegate) {
  Phaser.Sprite.call(this, game, x, y, texture);
  this.anchor.setTo(0.5, 0.5);
  this.type = type;
  this.inputEnabled = true;
  this.events.onInputDown.add(inputCallBack, delegate);
  this.revive();

  // add animations
  var animation = this.animations.add('glint');
  animation.onComplete.add(this.animationComplete, this);
  this.animationComplete(); // force the animation to restart
};

Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.moveTo = function (x, y) {
  var tween = game.add.tween(this);
  tween.to({ x: x, y: y }, 300, Phaser.Easing.Bounce.Out, true);
  return tween;
};

Tile.prototype.startAnimationGlint = function () {
  this.animations.play('glint', 5, false);
};

Tile.prototype.animationComplete = function () {
  this.frame = 0;
  game.time.events.add(Phaser.Timer.SECOND * Math.random() * 1000, this.startAnimationGlint, this);
};

module.exports = Tile;

},{"../game":4}],4:[function(require,module,exports){
var Phaser = (window.Phaser);

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', null);

module.exports = game;

},{}],5:[function(require,module,exports){
/**
 * @class locale
 */
module.exports = {
  "en": {
    "mainMenu": {
      "labelTitle": "Tap to start",
      "highScore": "High Score",
      "lastScore": "Last Score"
    }
  }
};

},{}],6:[function(require,module,exports){
/*globals module*/

var game = require('../game');

module.exports = {

  preload: function () {

    // the preloader images
    this.load.image('loadingBar', 'assets/preloader_loading.png');

  },

  create: function () {

    // max number of fingers to detect
    this.input.maxPointers = 1;

    // auto pause if window looses focus
    this.stage.disableVisibilityChange = true;

    if (game.device.desktop) {
      this.stage.scale.pageAlignHorizontally = true;
    }

    game.state.start('preloader', true, false);
  }

};

},{"../game":4}],7:[function(require,module,exports){
var game = require('../game'),
  Grid = require('../classes/grid');

module.exports = {

  create: function () {

    this.grid = new Grid();
  },

  update: function () {
    this.grid.update();
  },

  restartGame: function () {
    game.state.start('mainMenu');
  }

};

},{"../classes/grid":2,"../game":4}],8:[function(require,module,exports){
var Phaser = (window.Phaser),
  game = require('../game'),
  localisation = require('../locale');

module.exports = {

  create: function () {

    var tween,
      style = {
        font: '30px Arial',
        fill: '#fff'
      };

    this.labelTitle = game.add.text(20, 20, localisation[game.language].mainMenu.labelTitle, style);
    this.labelTitle.alpha = 0;

    tween = this.add.tween(this.labelTitle)
      .to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);

    tween.onComplete.add(this.startGame, this);
  },

  addPointerEvents: function () {
    this.input.onDown.addOnce(this.startGame, this);
  },

  startGame: function () {
    game.state.start('level1', true, false);
  }

};

},{"../game":4,"../locale":5}],9:[function(require,module,exports){
/*globals module, require*/

var Phaser = (window.Phaser),
  game = require('../game');

module.exports = {

  preload: function () {

    this.loadingBar = this.add.sprite(game.world.centerX, game.world.centerY, 'loadingBar');
    this.loadingBar.anchor.x = 0.5;
    this.loadingBar.anchor.y = 0.5;
    this.load.setPreloadSprite(this.loadingBar);

    game.load.spritesheet('tile_1', 'assets/tile_1.png', 32, 32);
    game.load.spritesheet('tile_2', 'assets/tile_2.png', 32, 32);
    game.load.spritesheet('tile_3', 'assets/tile_3.png', 32, 32);
    game.load.spritesheet('tile_4', 'assets/tile_4.png', 32, 32);

  },

  create: function () {
    var tween = this.add.tween(this.loadingBar)
      .to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(this.startMainMenu, this);

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();
  },

  startMainMenu: function () {
    game.state.start('mainMenu', true, false);
  }

};

},{"../game":4}]},{},[1])