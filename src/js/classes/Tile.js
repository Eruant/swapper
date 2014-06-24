var Phaser = require('phaser'),
  game = require('../game');

var Tile = function (x, y, texture, frame, inputCallBack) {
  Phaser.Sprite.call(this, game, x, y, texture);
  this.anchor.setTo(0.5, 0.5);
  this.frame = frame;
  this.inputEnabled = true;
  this.events.onInputDown.add(inputCallBack, this);
};

Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

module.exports = Tile;
