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
