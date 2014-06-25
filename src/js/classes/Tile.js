var Phaser = require('phaser'),
  game = require('../game');

var Tile = function (x, y, texture, type, inputCallBack, delegate) {
  Phaser.Sprite.call(this, game, x, y, texture);
  this.anchor.setTo(0.5, 0.5);
  this.type = type;
  this.inputEnabled = true;
  this.events.onInputDown.add(inputCallBack, delegate);

  // add animations
  var animation = this.animations.add('glint');
  animation.onComplete.add(this.animationComplete, this);
  this.animationComplete(); // force the animation to restart
};

Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.startAnimationGlint = function () {
  this.animations.play('glint', 5, false);
};

Tile.prototype.animationComplete = function () {
  this.frame = 0;
  game.time.events.add(Phaser.Timer.SECOND * Math.random() * 1000, this.startAnimationGlint, this);
};

module.exports = Tile;
