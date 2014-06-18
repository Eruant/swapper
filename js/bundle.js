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

},{"./game":3,"./locale":4,"./scenes/boot.js":5,"./scenes/level1":6,"./scenes/mainMenu":7,"./scenes/preloader":8}],2:[function(require,module,exports){
var game = require('../game');

var Board = function () {

  this.FIELD_SIZE = 8;
  this.TILE_ARRAY_SIZE = this.FIELD_SIZE * this.FIELD_SIZE;

  this.tileArray = new Array(this.TILE_ARRAY_SIZE);
  this.tileTypes = 8;
  this.tileSize = 32;


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
    }
  }

};

module.exports = Board;

},{"../game":3}],3:[function(require,module,exports){
var Phaser = (window.Phaser);

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', null);

module.exports = game;

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"../game":3}],6:[function(require,module,exports){
/* globals module, require, localStorage*/

var Phaser = (window.Phaser),
  game = require('../game'),
  Board = require('../classes/Board');

module.exports = {

  create: function () {

    this.board = new Board();
  },

  update: function () {
  },

  restartGame: function () {
    game.state.start('mainMenu');
  }

};

},{"../classes/Board":2,"../game":3}],7:[function(require,module,exports){
/*globals module, require, localStorage*/

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

    tween.onComplete.add(this.addPointerEvents, this);
  },

  addPointerEvents: function () {
    this.input.onDown.addOnce(this.startGame, this);
  },

  startGame: function () {
    game.state.start('level1', true, false);
  }

};

},{"../game":3,"../locale":4}],8:[function(require,module,exports){
/*globals module, require*/

var Phaser = (window.Phaser),
  game = require('../game');

module.exports = {

  preload: function () {

    this.loadingBar = this.add.sprite(game.world.centerX, game.world.centerY, 'loadingBar');
    this.loadingBar.anchor.x = 0.5;
    this.loadingBar.anchor.y = 0.5;
    this.load.setPreloadSprite(this.loadingBar);

    game.load.spritesheet('game_sprites', 'assets/game_sprites.png', 32, 32);

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

},{"../game":3}]},{},[1])