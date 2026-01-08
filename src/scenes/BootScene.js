export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // AUDIO
    this.load.audio("bgm", "assets/audio/bgm.mp3");
    this.load.audio("click", "assets/audio/click.wav");
    this.load.audio("collect", "assets/audio/collect.wav");

    // SPRITES
    this.load.spritesheet("pacman", "assets/sprites/pacman.png", {
      frameWidth: 32,
      frameHeight: 32
    });

    this.load.image("ghost", "assets/sprites/ghost.png");
    this.load.image("pellet", "assets/sprites/pellet.png");
    this.load.image("power", "assets/sprites/power.png");
    this.load.image("wall", "assets/sprites/wall.png");
    this.load.image("goal", "assets/sprites/goal.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
