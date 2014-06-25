/*globals module, require*/

var Phaser = require('phaser'),
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
