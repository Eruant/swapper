var game = require('../game'),
  Grid = require('../classes/grid');

module.exports = {

  create: function () {

    this.grid = new Grid();
  },

  update: function () {
  },

  restartGame: function () {
    game.state.start('mainMenu');
  }

};
