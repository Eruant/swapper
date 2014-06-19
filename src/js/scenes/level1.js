var game = require('../game'),
  Board = require('../classes/Board');

module.exports = {

  create: function () {

    this.board = new Board();
  },

  update: function () {
    this.board.update();
  },

  restartGame: function () {
    game.state.start('mainMenu');
  }

};
