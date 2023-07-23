export default class GameState {
  static from(object) {
    // TODO: create object
    this.activeGame = { ...object };
    return null;
  }

  static getGame() {
    // TODO: create object
    return this.activeGame;
  }
}
