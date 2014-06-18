/* globals module, require, localStorage*/

var Phaser = require('phaser'),
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
