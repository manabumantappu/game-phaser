export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // AUDIO
    this.load.audio("bgm", "assets/audio/bgm.mp3");
    this.load.audio("click", "assets/audio/click.wav");
    this.load.audio("collect", "assets/audio/collect.wav");

    // IMAGE (SATU PACMAN)
    this.load.image("pacman", "assets/sprites/pacman.png");
    this.load.image("ghost", "assets/sprites/ghost.png");
    this.load.image("pellet", "assets/sprites/pellet.png");
    this.load.image("power", "assets/sprites/power.png");
    this.load.image("wall", "assets/sprites/wall.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
